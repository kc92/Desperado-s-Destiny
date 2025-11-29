const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados');

  const Location = mongoose.model('Location', new mongoose.Schema({}, { strict: false }));

  // Get all parent locations (no parentId = top-level location)
  const parents = await Location.find({ parentId: { $exists: false } }).lean();

  console.log('=== ALL TOP-LEVEL LOCATIONS ===\n');

  for (const loc of parents) {
    // Count buildings for this location
    const buildingCount = await Location.countDocuments({ parentId: loc._id });

    console.log(`${loc.name} (${loc.type}) - Region: ${loc.region}`);
    console.log(`  ID: ${loc._id}`);
    console.log(`  Buildings: ${buildingCount}`);
    console.log(`  Direct content: ${loc.jobs?.length || 0} jobs, ${loc.shops?.length || 0} shops, ${loc.npcs?.length || 0} NPCs`);
    console.log(`  Status: ${buildingCount > 0 ? '✅ HAS BUILDING SYSTEM' : '❌ NO BUILDINGS'}`);
    console.log('');
  }

  console.log(`Total top-level locations: ${parents.length}`);

  await mongoose.disconnect();
}
check();
