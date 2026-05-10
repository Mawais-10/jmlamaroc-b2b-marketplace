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
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i+1}/${products.length}] Processing: ${product.title || product._id}`);
    
    try {
      const vector = await generateEmbedding(product.imageUrl);
      if (vector) {
        product.vector = vector;
        await product.save();
        console.log(`✅ Success`);
      } else {
        console.log(`❌ Failed to generate vector`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${product._id}:`, err.message);
    }
  }
  
  console.log('--- Seeding complete ---');
  process.exit(0);
}

seedVectors();
