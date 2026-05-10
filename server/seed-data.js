// require('dotenv').config();
// const mongoose = require('mongoose');
// const User = require('./models/User');
// const Store = require('./models/Store');
// const Product = require('./models/Product');
// const connectDB = require('./config/db');

// async function seedData() {
//   await connectDB();
  
//   // Clear existing data (optional, but good for clean seed)
//   // await Store.deleteMany({});
//   // await Product.deleteMany({});
  
//   console.log('--- Seeding Stores ---');
  
//   const suppliers = await User.find({ role: 'supplier' });
//   if (suppliers.length === 0) {
//     console.log('No suppliers found. Create a supplier first.');
//     // Create a dummy supplier
//     const supplier = await User.create({
//       name: 'Test Supplier',
//       email: 'supplier@test.com',
//       password: 'password123',
//       role: 'supplier'
//     });
//     suppliers.push(supplier);
//   }
  
//   const supplier = suppliers[0];
  
//   // Create a store
//   let store = await Store.findOne({ owner: supplier._id });
//   if (!store) {
//     store = await Store.create({
//       owner: supplier._id,
//       name: 'Fashion Hub',
//       handle: 'fashionhub',
//       description: 'The best wholesale fashion store.',
//       avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
//       categories: ['Fashion', 'Accessories'],
//       city: 'Casablanca',
//       whatsappNumber: '+212600000000',
//       isApproved: true
//     });
//   }
  
//   console.log('--- Seeding Products ---');
  
//   const products = [
//     {
//       title: 'Red Summer Dress',
//       description: 'Elegant red dress for summer',
//       imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
//       category: 'Fashion',
//       price: 250
//     },
//     {
//       title: 'Blue Denim Jacket',
//       description: 'Classic blue denim jacket',
//       imageUrl: 'https://images.unsplash.com/photo-1521223344201-d169129f7b7d?w=600',
//       category: 'Fashion',
//       price: 450
//     },
//     {
//       title: 'White Sneakers',
//       description: 'Comfortable white sneakers',
//       imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
//       category: 'Shoes',
//       price: 300
//     },
//     {
//       title: 'Leather Handbag',
//       description: 'Premium leather handbag',
//       imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
//       category: 'Accessories',
//       price: 800
//     },
//     {
//       title: 'Smart Watch',
//       description: 'Modern smart watch with health tracking',
//       imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
//       category: 'Electronics',
//       price: 1200
//     }
//   ];
  
//   for (const p of products) {
//     const existing = await Product.findOne({ title: p.title, store: store._id });
//     if (!existing) {
//       await Product.create({
//         ...p,
//         store: store._id,
//         storeName: store.name,
//         storeHandle: store.handle
//       });
//       console.log(` Created product: ${p.title}`);
//     }
//   }
  
//   console.log('--- Data Seeding Complete ---');
//   process.exit(0);
// }

// seedData();
// // 