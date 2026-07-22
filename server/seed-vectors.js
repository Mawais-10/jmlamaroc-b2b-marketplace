require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const { generateEmbedding } = require('./utils/vision');
const connectDB = require('./config/db');

async function seedVectors() {
  await connectDB();
  
  console.log('--- Fetching products without vectors ---');
  const products = await Product.find({ 
    $or: [
      { vector: { $exists: false } },
      { vector: { $size: 0 } }
    ]
  });
  
  console.log(`Found ${products.length} products to process.`);
  
  const BATCH_SIZE = 5;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (product, batchIdx) => {
      const idx = i + batchIdx + 1;
      try {
        const vector = await generateEmbedding(product.imageUrl);
        if (vector) {
          product.vector = vector;
          await product.save();
          console.log(`[${idx}/${products.length}] ✅ Vector saved for: "${product.title?.substring(0, 40) || product._id}"`);
        } else {
          console.log(`[${idx}/${products.length}] ❌ Failed vector for: ${product._id}`);
        }
      } catch (err) {
        console.error(`[${idx}/${products.length}] ❌ Error:`, err.message);
      }
    }));
  }
  
  console.log('--- Vector Seeding Completed Successfully! ---');
  process.exit(0);
}

seedVectors();
