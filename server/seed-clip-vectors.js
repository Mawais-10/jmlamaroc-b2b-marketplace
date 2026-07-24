/**
 * seed-clip-vectors.js
 * 
 * Memory-efficient backfill script — generates 512-dim CLIP embeddings for all products
 * that don't yet have a clip_embedding. Fetches 50 at a time in a pagination loop to prevent
 * Node.js out-of-memory crashes.
 * 
 * Usage:
 *   cd server
 *   node seed-clip-vectors.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const FLASK_SERVICE_URL = process.env.TELEGRAM_SERVICE_URL || 'http://127.0.0.1:5002';
const CONCURRENCY = 5;
const BATCH_SIZE = 50;

async function getClipEmbedding(imageUrl) {
  const resp = await axios.post(
    `${FLASK_SERVICE_URL}/embed-image`,
    { imageUrl },
    { timeout: 30000 }
  );
  if (resp.data?.success && Array.isArray(resp.data.embedding)) {
    return resp.data.embedding;
  }
  throw new Error(resp.data?.error || 'Empty embedding returned');
}

async function seedClipVectors() {
  await connectDB();

  // Verify Flask service is reachable
  try {
    await axios.get(`${FLASK_SERVICE_URL}/health`, { timeout: 5000 });
    console.log(`✅ Flask service reachable at ${FLASK_SERVICE_URL}`);
  } catch {
    console.error(`❌ Flask service not reachable at ${FLASK_SERVICE_URL}`);
    console.error('   Please start the telegram-service (Flask) first and try again.');
    process.exit(1);
  }

  const initialRemaining = await Product.countDocuments({
    $or: [
      { clip_embedding: { $exists: false } },
      { clip_embedding: { $size: 0 } },
    ],
  });

  console.log(`\n📦 Found ${initialRemaining} products needing CLIP embeddings.\n`);

  if (initialRemaining === 0) {
    console.log('✅ All products already have CLIP embeddings!');
    process.exit(0);
  }

  let totalProcessed = 0;
  let successCount = 0;
  let failCount = 0;

  // Pagination loop — fetch BATCH_SIZE items per iteration (low memory profile)
  while (true) {
    const products = await Product.find({
      $or: [
        { clip_embedding: { $exists: false } },
        { clip_embedding: { $size: 0 } },
      ],
    }).select('_id imageUrl title').limit(BATCH_SIZE).lean();

    if (products.length === 0) break;

    for (let i = 0; i < products.length; i += CONCURRENCY) {
      const chunk = products.slice(i, i + CONCURRENCY);

      await Promise.all(chunk.map(async (product) => {
        totalProcessed++;
        const label = `[#${totalProcessed}]`;

        try {
          const embedding = await getClipEmbedding(product.imageUrl);
          await Product.findByIdAndUpdate(product._id, { clip_embedding: embedding });
          console.log(`${label} ✅  "${(product.title || product._id).toString().substring(0, 40)}"`);
          successCount++;
        } catch (err) {
          console.warn(`${label} ❌  ${product._id} — ${err.message}`);
          failCount++;
          // Set a dummy empty array marker so it doesn't get stuck infinitely on un-embeddable broken URLs
          await Product.findByIdAndUpdate(product._id, { clip_embedding: [0] }).catch(() => {});
        }
      }));
    }

    // Explicit garbage collection hint if available
    if (global.gc) global.gc();
  }

  console.log(`\n🎉 Done! Processed: ${totalProcessed} | Success: ${successCount} | Failed: ${failCount}`);
  process.exit(0);
}

seedClipVectors().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
