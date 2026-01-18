const mongoose = require('mongoose');

async function migrate() {
  console.log('Starting crime difficulty migration...');

  // Get URI from command line argument or environment variable
  const mongoUri = process.argv[2] || process.env.MONGODB_URI;
  console.log('MongoDB URI:', mongoUri ? 'SET' : 'NOT SET');

  if (!mongoUri) {
    console.error('Usage: node migrate-crimes.js <mongodb-uri>');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    const updates = [
      { name: 'Pickpocket Drunk', difficulty: 5 },
      { name: 'Steal from Market', difficulty: 6 },
      { name: 'Pick Lock', difficulty: 6 },
      { name: 'Forge Documents', difficulty: 7 },
      { name: 'Bootlegging', difficulty: 7 },
      { name: 'Cattle Rustling', difficulty: 8 },
      { name: 'Smuggling Run', difficulty: 8 },
      { name: 'Rob Saloon', difficulty: 9 },
      { name: 'Stage Coach Robbery', difficulty: 9 },
      { name: 'Burglarize Store', difficulty: 10 },
      { name: "The Preacher's Ledger", difficulty: 10 },
      { name: 'Territorial Extortion', difficulty: 11 },
      { name: 'Steal Horse', difficulty: 12 },
      { name: 'The Counterfeit Ring', difficulty: 12 },
      { name: 'Ghost Town Heist', difficulty: 13 },
      { name: "The Judge's Pocket", difficulty: 14 },
      { name: 'The Iron Horse', difficulty: 14 },
      { name: 'Arson', difficulty: 14 },
      { name: 'Bank Heist', difficulty: 15 },
      { name: 'Train Robbery', difficulty: 15 },
      { name: 'Murder for Hire', difficulty: 16 },
    ];

    let updated = 0;
    let notFound = 0;

    for (const { name, difficulty } of updates) {
      const result = await db.collection('actions').updateOne(
        { name, type: 'CRIME' },
        { $set: { difficulty } }
      );
      if (result.matchedCount > 0) {
        console.log('Updated:', name, '->', difficulty);
        updated++;
      } else {
        console.log('Not found:', name);
        notFound++;
      }
    }

    console.log('\n=== Summary ===');
    console.log('Updated:', updated);
    console.log('Not found:', notFound);

    // Check for remaining high-difficulty crimes
    const remaining = await db.collection('actions')
      .find({ type: 'CRIME', difficulty: { $gt: 16 } })
      .toArray();

    if (remaining.length > 0) {
      console.log('\nWarning: Still high difficulty crimes:');
      remaining.forEach(c => console.log('  -', c.name, ':', c.difficulty));
    } else {
      console.log('\nAll crimes have achievable difficulty values!');
    }

    await mongoose.disconnect();
    console.log('\nMigration complete!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
