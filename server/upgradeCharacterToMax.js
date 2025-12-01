/**
 * Upgrade existing character to max level for E2E testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function upgradeToMax() {
  console.log('Upgrading character to max level...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny');
    console.log('✅ Connected to database\n');

    const { Character } = require('./dist/models/Character.model');

    // Get all characters and show them
    const characters = await Character.find({}).select('name faction level gold energy');

    console.log('Available characters:');
    characters.forEach((char, i) => {
      console.log(`${i + 1}. ${char.name} - Level ${char.level}, ${char.gold} gold, ${char.energy}/${char.maxEnergy || 100} energy`);
    });

    if (characters.length === 0) {
      console.log('\n❌ No characters found. Please create a character first.');
      process.exit(1);
    }

    // Upgrade the first character
    const character = characters[0];
    console.log(`\nUpgrading: ${character.name}\n`);

    // Update character with max everything (respecting schema limits)
    await Character.findByIdAndUpdate(character._id, {
      $set: {
        // Max level (50 is the limit)
        level: 50,
        experience: 999999,

        // Max energy and gold
        energy: 100,
        maxEnergy: 100,
        gold: 1000000,

        // Max stats
        stats: {
          cunning: 50,
          spirit: 50,
          combat: 50,
          craft: 50,
        },

        // Remove jailed status
        isJailed: false,
        jailedUntil: null,
        wantedLevel: 0,

        // Max reputation
        factionReputation: {
          settlerAlliance: 100,
          nahiCoalition: 100,
          frontera: 100,
        },
        criminalReputation: 100,

        // Reset cooldowns
        lastEnergyUpdate: new Date(),
      },
    }, { runValidators: false });

    // Update skills to max level using direct MongoDB update
    await mongoose.connection.collection('characters').updateOne(
      { _id: character._id },
      {
        $set: {
          skills: [
            { skillId: 'gunslinging', level: 50, experience: 999999 },
            { skillId: 'brawling', level: 50, experience: 999999 },
            { skillId: 'stealth', level: 50, experience: 999999 },
            { skillId: 'lockpicking', level: 50, experience: 999999 },
            { skillId: 'persuasion', level: 50, experience: 999999 },
            { skillId: 'intimidation', level: 50, experience: 999999 },
            { skillId: 'survival', level: 50, experience: 999999 },
            { skillId: 'riding', level: 50, experience: 999999 },
          ]
        }
      }
    );

    const finalChar = await Character.findById(character._id);

    console.log('✅ Character upgraded to max level!\n');
    console.log('Character Details:');
    console.log('─────────────────────────────────────────');
    console.log(`Name: ${finalChar.name}`);
    console.log(`Level: ${finalChar.level}`);
    console.log(`Experience: ${finalChar.experience.toLocaleString()}`);
    console.log(`Energy: ${finalChar.energy}/${finalChar.maxEnergy}`);
    console.log(`Gold: ${finalChar.gold.toLocaleString()}`);
    console.log('\nStats:');
    console.log(`  Cunning: ${finalChar.stats.cunning}`);
    console.log(`  Spirit: ${finalChar.stats.spirit}`);
    console.log(`  Combat: ${finalChar.stats.combat}`);
    console.log(`  Craft: ${finalChar.stats.craft}`);
    console.log('\nReputation:');
    console.log(`  Settler Alliance: ${finalChar.factionReputation.settlerAlliance}`);
    console.log(`  Nahi Coalition: ${finalChar.factionReputation.nahiCoalition}`);
    console.log(`  Frontera: ${finalChar.factionReputation.frontera}`);
    console.log(`  Criminal: ${finalChar.criminalReputation}`);
    console.log('\nSkills:');
    if (finalChar.skills && finalChar.skills.length > 0) {
      finalChar.skills.forEach(skill => {
        console.log(`  ${skill.skillId}: Level ${skill.level}`);
      });
    } else {
      console.log('  No skills');
    }
    console.log('\n─────────────────────────────────────────');
    console.log('\n✅ Character ready for E2E testing!');
    console.log(`   Use this character: ${finalChar.name}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

upgradeToMax();
