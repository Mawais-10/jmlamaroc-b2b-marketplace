const mongoose = require('mongoose');

const mongoUri = 'mongodb://awais:awais321@ac-l349zcr-shard-00-00.sedsiy1.mongodb.net:27017,ac-l349zcr-shard-00-01.sedsiy1.mongodb.net:27017,ac-l349zcr-shard-00-02.sedsiy1.mongodb.net:27017/?ssl=true&replicaSet=atlas-r80d9r-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(mongoUri).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').updateOne(
    { email: 'admin@choufliya.com' },
    { $set: { status: 'approved', role: 'admin' } }
  );
  console.log('✅ Admin unblocked!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
