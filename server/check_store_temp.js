const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const StoreSchema = new mongoose.Schema({}, { strict: false });
const Store = mongoose.model('Store', StoreSchema, 'stores');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log("Connected to MongoDB!");
  
  // Find stores matching webawais_store or having telegramSyncStatus
  const stores = await Store.find({
    $or: [
      { handle: /webawais/i },
      { telegramHandle: /webawais/i },
      { telegramSyncStatus: { $exists: true } }
    ]
  });
  
  for (const s of stores) {
    console.log(`\nStore found: ${s.get('name')} (${s.get('handle')})`);
    console.log(`  telegramHandle: ${s.get('telegramHandle')}`);
    console.log(`  telegramSyncStatus: ${s.get('telegramSyncStatus')}`);
    console.log(`  telegramSyncProgress: ${s.get('telegramSyncProgress')}`);
    console.log(`  telegramSyncError: ${s.get('telegramSyncError')}`);
    console.log(`  lastTelegramSync: ${s.get('lastTelegramSync')}`);
    
    // If stuck syncing, let's reset it to idle/failed
    if (s.get('telegramSyncStatus') === 'syncing') {
      console.log("  -> Detected STUCK syncing status. Resetting to 'failed'...");
      s.set('telegramSyncStatus', 'failed');
      s.set('telegramSyncError', 'Reset stuck sync.');
      await s.save();
      console.log("  -> Reset complete.");
    }
  }
  
  await mongoose.disconnect();
}

main().catch(console.error);
