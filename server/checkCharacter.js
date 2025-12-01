/**
 * Quick script to check if you have characters in the database
 * Run with: node checkCharacter.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny';

async function checkCharacters() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all users
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
    const users = await User.find({});

    console.log(`=== USERS (${users.length}) ===`);
    users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user._id})`);
    });

    // Get all characters
    const Character = mongoose.model('Character', new mongoose.Schema({}, { strict: false, collection: 'characters' }));
    const characters = await Character.find({});

    console.log(`\n=== CHARACTERS (${characters.length}) ===`);
    if (characters.length === 0) {
      console.log('No characters found in database!');
      console.log('\nYou need to:');
      console.log('1. Log into the app');
      console.log('2. Visit /game/character-select');
      console.log('3. Create a character');
    } else {
      characters.forEach(char => {
        console.log(`\nCharacter: ${char.name}`);
        console.log(`  ID: ${char._id}`);
        console.log(`  User ID: ${char.userId}`);
        console.log(`  Level: ${char.level || 1}`);
        console.log(`  Active: ${char.isActive !== false ? 'Yes' : 'No'}`);
        console.log(`  HP: ${char.currentHP || char.maxHP || '?'} / ${char.maxHP || '?'}`);
        console.log(`  Gold: ${char.gold || 0}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCharacters();
