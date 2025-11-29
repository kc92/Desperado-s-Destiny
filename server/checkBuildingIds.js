const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados');

  const Location = mongoose.model('Location', new mongoose.Schema({}, { strict: false }));

  // Get Red Gulch parent
  const parent = await Location.findOne({ name: 'Red Gulch' });
  console.log('Red Gulch parent ID:', parent?._id?.toString());

  // Get all buildings
  const buildings = await Location.find({ parentId: { $exists: true } });
  console.log('\nBuildings in database:');
  buildings.forEach(b => {
    console.log(`  ${b._id.toString()} - ${b.name}`);
  });

  await mongoose.disconnect();
}
check();
