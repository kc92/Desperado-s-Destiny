/**
 * Quick seed script to add combat NPCs to the database
 * Run with: node seedCombatNPCs.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/desperados-destiny';

// NPC Schema (simplified for seed script)
const NPCSchema = new mongoose.Schema({
  name: String,
  type: String,
  level: Number,
  maxHP: Number,
  difficulty: Number,
  lootTable: {
    goldMin: Number,
    goldMax: Number,
    xpReward: Number,
    itemChance: Number,
    itemRarities: {
      common: Number,
      uncommon: Number,
      rare: Number,
      epic: Number,
      legendary: Number
    }
  },
  location: String,
  respawnTime: Number,
  description: String,
  isActive: Boolean,
  isBoss: Boolean
}, { timestamps: true });

const NPC = mongoose.model('NPC', NPCSchema);

// Sample combat NPCs
const combatNPCs = [
  // OUTLAW type NPCs
  {
    name: 'Dusty Pete',
    type: 'OUTLAW',
    level: 1,
    maxHP: 50,
    difficulty: 1,
    lootTable: {
      goldMin: 5,
      goldMax: 15,
      xpReward: 25,
      itemChance: 10,
      itemRarities: {
        common: 90,
        uncommon: 10,
        rare: 0,
        epic: 0,
        legendary: 0
      }
    },
    location: 'Red Gulch',
    respawnTime: 5,
    description: 'A petty thief who preys on travelers.',
    isActive: true,
    isBoss: false
  },
  {
    name: 'Jake "Six-Gun" Morgan',
    type: 'OUTLAW',
    level: 3,
    maxHP: 80,
    difficulty: 3,
    lootTable: {
      goldMin: 15,
      goldMax: 35,
      xpReward: 50,
      itemChance: 20,
      itemRarities: {
        common: 70,
        uncommon: 25,
        rare: 5,
        epic: 0,
        legendary: 0
      }
    },
    location: 'Red Gulch',
    respawnTime: 10,
    description: 'A seasoned gunslinger with a bounty on his head.',
    isActive: true,
    isBoss: false
  },
  {
    name: 'The Red Gulch Gang',
    type: 'OUTLAW',
    level: 5,
    maxHP: 150,
    difficulty: 5,
    lootTable: {
      goldMin: 40,
      goldMax: 80,
      xpReward: 100,
      itemChance: 40,
      itemRarities: {
        common: 50,
        uncommon: 35,
        rare: 12,
        epic: 3,
        legendary: 0
      }
    },
    location: 'Red Gulch',
    respawnTime: 30,
    description: 'A notorious gang of outlaws terrorizing the area.',
    isActive: true,
    isBoss: true
  },

  // WILDLIFE type NPCs
  {
    name: 'Rattlesnake',
    type: 'WILDLIFE',
    level: 1,
    maxHP: 30,
    difficulty: 1,
    lootTable: {
      goldMin: 2,
      goldMax: 8,
      xpReward: 15,
      itemChance: 15,
      itemRarities: {
        common: 95,
        uncommon: 5,
        rare: 0,
        epic: 0,
        legendary: 0
      }
    },
    location: 'Desert',
    respawnTime: 3,
    description: 'A venomous desert snake.',
    isActive: true,
    isBoss: false
  },
  {
    name: 'Wild Coyote',
    type: 'WILDLIFE',
    level: 2,
    maxHP: 60,
    difficulty: 2,
    lootTable: {
      goldMin: 8,
      goldMax: 20,
      xpReward: 35,
      itemChance: 25,
      itemRarities: {
        common: 80,
        uncommon: 18,
        rare: 2,
        epic: 0,
        legendary: 0
      }
    },
    location: 'Desert',
    respawnTime: 8,
    description: 'A hungry coyote hunting for food.',
    isActive: true,
    isBoss: false
  },
  {
    name: 'Desert Bear',
    type: 'WILDLIFE',
    level: 4,
    maxHP: 120,
    difficulty: 4,
    lootTable: {
      goldMin: 25,
      goldMax: 60,
      xpReward: 75,
      itemChance: 35,
      itemRarities: {
        common: 60,
        uncommon: 30,
        rare: 9,
        epic: 1,
        legendary: 0
      }
    },
    location: 'Desert',
    respawnTime: 20,
    description: 'A massive bear protecting its territory.',
    isActive: true,
    isBoss: false
  },

  // LAWMAN type NPCs
  {
    name: 'Deputy Barnes',
    type: 'LAWMAN',
    level: 2,
    maxHP: 70,
    difficulty: 2,
    lootTable: {
      goldMin: 10,
      goldMax: 25,
      xpReward: 40,
      itemChance: 20,
      itemRarities: {
        common: 75,
        uncommon: 20,
        rare: 5,
        epic: 0,
        legendary: 0
      }
    },
    location: 'Red Gulch',
    respawnTime: 15,
    description: 'A young deputy trying to make a name for himself.',
    isActive: true,
    isBoss: false
  },
  {
    name: 'Marshal Williams',
    type: 'LAWMAN',
    level: 4,
    maxHP: 110,
    difficulty: 4,
    lootTable: {
      goldMin: 30,
      goldMax: 70,
      xpReward: 80,
      itemChance: 35,
      itemRarities: {
        common: 55,
        uncommon: 30,
        rare: 12,
        epic: 3,
        legendary: 0
      }
    },
    location: 'Red Gulch',
    respawnTime: 25,
    description: 'An experienced U.S. Marshal with a reputation for getting his man.',
    isActive: true,
    isBoss: false
  },
  {
    name: 'Sheriff Clayton',
    type: 'LAWMAN',
    level: 6,
    maxHP: 180,
    difficulty: 6,
    lootTable: {
      goldMin: 60,
      goldMax: 120,
      xpReward: 150,
      itemChance: 50,
      itemRarities: {
        common: 40,
        uncommon: 35,
        rare: 18,
        epic: 6,
        legendary: 1
      }
    },
    location: 'Red Gulch',
    respawnTime: 45,
    description: 'The tough-as-nails sheriff of Red Gulch. Cross him at your peril.',
    isActive: true,
    isBoss: true
  }
];

async function seedNPCs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing NPCs
    console.log('Clearing existing combat NPCs...');
    await NPC.deleteMany({});
    console.log('Cleared existing NPCs');

    // Insert new NPCs
    console.log('Inserting new combat NPCs...');
    const result = await NPC.insertMany(combatNPCs);
    console.log(`Successfully inserted ${result.length} combat NPCs`);

    // Display NPCs by type
    const outlaws = result.filter(npc => npc.type === 'OUTLAW');
    const wildlife = result.filter(npc => npc.type === 'WILDLIFE');
    const lawmen = result.filter(npc => npc.type === 'LAWMAN');

    console.log('\n=== SEEDED NPCs ===');
    console.log(`Outlaws: ${outlaws.length}`);
    outlaws.forEach(npc => console.log(`  - ${npc.name} (Level ${npc.level})`));

    console.log(`\nWildlife: ${wildlife.length}`);
    wildlife.forEach(npc => console.log(`  - ${npc.name} (Level ${npc.level})`));

    console.log(`\nLawmen: ${lawmen.length}`);
    lawmen.forEach(npc => console.log(`  - ${npc.name} (Level ${npc.level})`));

    console.log('\n✅ Combat NPC seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding NPCs:', error);
    process.exit(1);
  }
}

seedNPCs();
