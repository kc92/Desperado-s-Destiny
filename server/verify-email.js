const mongoose = require('mongoose');

async function verifyEmail() {
  const email = process.argv[2] || 'claude-test@desperados.dev';

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  const db = mongoose.connection.db;

  // Find and update the user
  const result = await db.collection('users').updateOne(
    { email: email },
    { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
  );

  console.log('Email:', email);
  console.log('Matched:', result.matchedCount);
  console.log('Modified:', result.modifiedCount);

  if (result.matchedCount === 0) {
    console.log('User not found! Listing users...');
    const users = await db.collection('users').find({}, { projection: { email: 1, username: 1 } }).limit(10).toArray();
    users.forEach(u => console.log(' -', u.email, '|', u.username));
  }

  await mongoose.disconnect();
  console.log('Done!');
}

verifyEmail().catch(e => console.error(e));
