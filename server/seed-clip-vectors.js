/**
 * seed-clip-vectors.js
 * 
 * Backfill script — generates 512-dim CLIP embeddings for all products
 * that don't yet have a clip_embedding. Runs batches of 5 in parallel.
 * 
 * Usage:
 *   cd server
 *   node seed-clip-vectors.js
 * 
 * Make sure the Flask telegram-service is running on port 5002 first!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const FLASK_SERVICE_URL = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:5002';
const BATCH_SIZE = 5;

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

  // Find all products missing clip_embedding
  const products = await Product.find({
    $or: [
      { clip_embedding: { $exists: false } },
      { clip_embedding: { $size: 0 } },
    ],
  }).select('_id imageUrl title').lean();

  const total = products.length;
  console.log(`\n📦 Found ${total} products without CLIP embeddings.\n`);

  if (total === 0) {
    console.log('✅ All products already have CLIP embeddings!');
    process.exit(0);
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (product, batchIdx) => {
      const idx = i + batchIdx + 1;
      const label = `[${idx}/${total}]`;

      try {
        const embedding = await getClipEmbedding(product.imageUrl);
        await Product.findByIdAndUpdate(product._id, { clip_embedding: embedding });
        console.log(`${label} ✅  "${(product.title || product._id).toString().substring(0, 45)}"`);
        successCount++;
      } catch (err) {
        console.warn(`${label} ❌  ${product._id} — ${err.message}`);
        failCount++;
      }
    }));
  }

  console.log(`\n🎉 Done! Success: ${successCount}  Failed: ${failCount}  Total: ${total}`);
  process.exit(0);
}

seedClipVectors().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
