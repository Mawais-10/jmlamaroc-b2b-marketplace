/**
 * ChouFliya Database Seeder
 * Run: node seed.js
 * Creates: 1 admin user, categories reference data
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@choufliya.com';
    const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@ChouFliya2026';

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(` Admin user already exists: ${adminEmail}`);
    } else {
      await User.create({ name: 'ChouFliya Admin', email: adminEmail, password: adminPass, role: 'admin' });
      console.log(`Admin user created: ${adminEmail} / ${adminPass}`);
    }

    console.log('\n Seed completed successfully!');
    console.log('\nAdmin credentials:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPass}`);
    console.log('\nRun the server with: npm start or npm run dev\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
