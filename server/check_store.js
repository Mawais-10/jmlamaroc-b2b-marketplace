const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const StoreSchema = new mongoose.Schema({}, { strict: false });
const Store = mongoose.model('Store', StoreSchema, 'stores');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log("Connected to MongoDB!");
  
  const stores = await Store.find({});
  for (const s of stores) {
    console.log(`Store: ${s.get('name')} (${s.get('handle')})`);
    console.log(`  telegramSyncStatus: ${s.get('telegramSyncStatus')}`);
    console.log(`  telegramSyncProgress: ${s.get('telegramSyncProgress')}`);
    console.log(`  telegramSyncError: ${s.get('telegramSyncError')}`);
    console.log(`  lastTelegramSync: ${s.get('lastTelegramSync')}`);
  }
  
  await mongoose.disconnect();
}

main().catch(console.error);
