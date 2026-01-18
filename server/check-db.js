const mongoose = require('mongoose');

async function check() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  const db = mongoose.connection.db;

  // List databases
  const admin = db.admin();
  const dbs = await admin.listDatabases();
  console.log('\n=== Databases ===');
  dbs.databases.forEach(d => console.log(' -', d.name));

  // List collections in current db
  const collections = await db.listCollections().toArray();
  console.log('\n=== Collections in', db.databaseName, '===');
  collections.forEach(c => console.log(' -', c.name));

  // Check actions collection
  const actionCount = await db.collection('actions').countDocuments();
  console.log('\n=== Actions count:', actionCount);

  // Sample crimes
  const crimes = await db.collection('actions').find({ type: 'crime' }).limit(5).toArray();
  console.log('\n=== Sample crimes ===');
  crimes.forEach(c => console.log(' -', c.name, '| difficulty:', c.difficulty));

  if (crimes.length === 0) {
    // Maybe the field is different
    console.log('\n=== All action types ===');
    const types = await db.collection('actions').distinct('type');
    console.log(types);

    // Sample all actions
    console.log('\n=== Sample actions (any type) ===');
    const all = await db.collection('actions').find({}).limit(5).toArray();
    all.forEach(a => console.log(' -', a.name, '| type:', a.type));
  }

  await mongoose.disconnect();
}

check().catch(e => console.error(e));
