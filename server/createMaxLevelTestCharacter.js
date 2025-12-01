/**
 * Create a max-level test character for E2E testing
 * This character will have everything needed to execute all actions
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function createMaxLevelTestCharacter() {
  console.log('Creating max-level test character...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny');
    console.log('✅ Connected to database\n');

    const { User } = require('./dist/models/User.model');
    const { Character } = require('./dist/models/Character.model');
    const { Location } = require('./dist/models/Location.model');

    // Create or find test user
    const testEmail = 'e2e-max-tester@test.com';
    const testPassword = 'TestPassword123!';

    let user = await User.findOne({ email: testEmail });

    if (!user) {
      console.log('Creating test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(testPassword, 10);

      user = await User.create({
        email: testEmail,
        passwordHash: hashedPassword,
        emailVerified: true,
        username: 'E2EMaxTester',
      });
      console.log(`✅ User created: ${testEmail}`);
    } else {
      console.log(`✅ User found: ${testEmail}`);
    }

    // Delete existing test character if exists
    await Character.deleteMany({ userId: user._id });

    // Get Red Gulch location
    const redGulch = await Location.findOne({ name: 'Red Gulch' });
    if (!redGulch) {
      throw new Error('Red Gulch location not found');
    }

    // Create max-level character
    console.log('\nCreating max-level character...');

    const maxCharacter = await Character.create({
      userId: user._id,
      name: 'Max Tester',
      faction: 'SETTLER_ALLIANCE',

      // Max stats
      level: 100,
      experience: 999999,

      // Max attributes
      strength: 100,
      dexterity: 100,
      constitution: 100,
      intelligence: 100,
      wisdom: 100,
      charisma: 100,

      // Max resources
      health: 1000,
      maxHealth: 1000,
      energy: 100,
      maxEnergy: 100,
      gold: 1000000,

      // Location
      currentLocation: redGulch._id,

      // Max skills
      skills: {
        gunslinging: { level: 100, experience: 999999 },
        brawling: { level: 100, experience: 999999 },
        stealth: { level: 100, experience: 999999 },
        lockpicking: { level: 100, experience: 999999 },
        persuasion: { level: 100, experience: 999999 },
        intimidation: { level: 100, experience: 999999 },
        survival: { level: 100, experience: 999999 },
        riding: { level: 100, experience: 999999 },
        medicine: { level: 100, experience: 999999 },
        crafting: { level: 100, experience: 999999 },
      },

      // Inventory with useful items
      inventory: [
        {
          itemId: 'lockpick',
          name: 'Lockpick',
          quantity: 100,
          type: 'tool',
        },
        {
          itemId: 'rope',
          name: 'Rope',
          quantity: 50,
          type: 'tool',
        },
        {
          itemId: 'bandage',
          name: 'Bandage',
          quantity: 100,
          type: 'consumable',
        },
        {
          itemId: 'bullets',
          name: 'Bullets',
          quantity: 1000,
          type: 'ammo',
        },
        {
          itemId: 'dynamite',
          name: 'Dynamite',
          quantity: 50,
          type: 'tool',
        },
      ],

      // Equipment
      equipment: {
        weapon: {
          itemId: 'revolver',
          name: 'Legendary Revolver',
          type: 'weapon',
          damage: 100,
          accuracy: 100,
        },
        armor: {
          itemId: 'duster',
          name: 'Legendary Duster',
          type: 'armor',
          defense: 100,
        },
      },

      // Max reputation
      reputation: {
        law: 100,
        outlaw: 100,
        nativeAmerican: 100,
        settler: 100,
        chinese: 100,
      },

      // Active status
      isActive: true,
      status: 'active',
    });

    console.log('✅ Max-level character created!\n');
    console.log('Character Details:');
    console.log('─────────────────────────────────────────');
    console.log(`Name: ${maxCharacter.name}`);
    console.log(`Level: ${maxCharacter.level}`);
    console.log(`Health: ${maxCharacter.health}/${maxCharacter.maxHealth}`);
    console.log(`Energy: ${maxCharacter.energy}/${maxCharacter.maxEnergy}`);
    console.log(`Gold: ${maxCharacter.gold.toLocaleString()}`);
    console.log(`Location: ${redGulch.name}`);
    console.log('\nSkills:');
    Object.entries(maxCharacter.skills).forEach(([skill, data]) => {
      console.log(`  ${skill}: Level ${data.level}`);
    });
    console.log('\nInventory:');
    maxCharacter.inventory.forEach(item => {
      console.log(`  ${item.name} x${item.quantity}`);
    });
    console.log('\n─────────────────────────────────────────');
    console.log('\n✅ Test character ready for E2E testing!\n');
    console.log('Login credentials:');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}`);
    console.log(`  Character: ${maxCharacter.name}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createMaxLevelTestCharacter();
