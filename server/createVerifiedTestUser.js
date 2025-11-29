/**
 * Create Verified Test User with Character
 * Sets up a complete test user for frontend testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny?directConnection=true';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Character Schema (simplified)
const characterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  faction: { type: String, required: true },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  energy: { type: Number, default: 100 },
  maxEnergy: { type: Number, default: 100 },
  lastEnergyUpdate: { type: Date, default: Date.now },
  gold: { type: Number, default: 500 },
  currentLocation: { type: String, default: 'Red Gulch' },
  gangId: { type: mongoose.Schema.Types.ObjectId, default: null },
  stats: {
    cunning: { type: Number, default: 10 },
    spirit: { type: Number, default: 10 },
    combat: { type: Number, default: 10 },
    craft: { type: Number, default: 10 },
  },
  skills: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  appearance: {
    bodyType: { type: String, default: 'male' },
    skinTone: { type: Number, default: 3 },
    facePreset: { type: Number, default: 0 },
    hairStyle: { type: Number, default: 0 },
    hairColor: { type: Number, default: 0 },
  },
  combatStats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalDamage: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
  },
  wantedLevel: { type: Number, default: 0 },
  bountyAmount: { type: Number, default: 0 },
  isJailed: { type: Boolean, default: false },
  jailedUntil: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

async function createVerifiedTestUser() {
  try {
    console.log('🎮 Creating Verified Test User...\n');
    console.log(`Connecting to MongoDB: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', userSchema);
    const Character = mongoose.model('Character', characterSchema);

    // Check if test user already exists
    let user = await User.findOne({ email: 'test@test.com' });

    if (user) {
      console.log('📧 Test user already exists, updating...');
      await User.updateOne(
        { _id: user._id },
        {
          $set: { isVerified: true },
          $unset: { verificationToken: '' }
        }
      );
      user = await User.findById(user._id);
      console.log('✅ Test user verified');
    } else {
      console.log('📧 Creating new test user...');
      const hashedPassword = await bcrypt.hash('Test123!', 12);

      user = await User.create({
        email: 'test@test.com',
        password: hashedPassword,
        username: 'TestUser',
        isVerified: true,
        verificationToken: undefined,
      });

      console.log('✅ Test user created and verified');
    }

    // Check if test character exists
    let character = await Character.findOne({ userId: user._id });

    if (character) {
      console.log('🤠 Test character already exists');
    } else {
      console.log('🤠 Creating test character...');

      character = await Character.create({
        userId: user._id,
        name: 'Quick Draw McGraw',
        faction: 'Settler Alliance',
        level: 5,
        experience: 1250,
        energy: 100,
        maxEnergy: 100,
        gold: 1000,
        currentLocation: 'Red Gulch',
        stats: {
          cunning: 12,
          spirit: 15,
          combat: 14,
          craft: 11,
        },
        appearance: {
          bodyType: 'male',
          skinTone: 4,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 3,
        },
        combatStats: {
          wins: 3,
          losses: 1,
          totalDamage: 450,
          kills: 2,
        },
      });

      console.log('✅ Test character created');
    }

    console.log('\n✅ Test Setup Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎮 TEST CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    test@test.com`);
    console.log(`🔑 Password: Test123!`);
    console.log(`👤 Username: ${user.username}`);
    console.log(`✅ Verified:  ${user.isVerified}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤠 CHARACTER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name:      ${character.name}`);
    console.log(`🏛️  Faction:   ${character.faction}`);
    console.log(`⭐ Level:     ${character.level}`);
    console.log(`💰 Gold:      $${character.gold}`);
    console.log(`⚡ Energy:    ${character.energy}/${character.maxEnergy}`);
    console.log(`📍 Location:  ${character.currentLocation}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 Ready to test!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connection closed');
  }
}

createVerifiedTestUser();
