/**
 * NPC Model
 *
 * Mongoose schema for Non-Player Characters in turn-based combat
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { NPCType, PersonalityType, MoodType } from '@desperados/shared';

/**
 * NPC document interface
 */
export interface INPC extends Document {
  name: string;
  type: NPCType;
  level: number;
  maxHP: number;
  difficulty: number;
  lootTable: {
    goldMin: number;
    goldMax: number;
    xpReward: number;
    items: Array<{
      name: string;
      chance: number;
      rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    }>;
  };
  location: string;
  respawnTime: number;
  description: string;
  isActive: boolean;
  lastDefeated?: Date;
  // Mood system fields
  personalityId?: string;
  role?: string;
  personality?: PersonalityType;
  baseMood?: MoodType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * NPC static methods interface
 */
export interface INPCModel extends Model<INPC> {
  findActiveNPCs(): Promise<INPC[]>;
  findByType(type: NPCType): Promise<INPC[]>;
  findByLocation(location: string): Promise<INPC[]>;
}

/**
 * NPC schema definition
 */
const NPCSchema = new Schema<INPC>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(NPCType)
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },
    maxHP: {
      type: Number,
      required: true,
      min: 1
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    lootTable: {
      goldMin: { type: Number, required: true, min: 0 },
      goldMax: { type: Number, required: true, min: 0 },
      xpReward: { type: Number, required: true, min: 0 },
      items: [{
        name: { type: String, required: true },
        chance: { type: Number, required: true, min: 0, max: 1 },
        rarity: {
          type: String,
          required: true,
          enum: ['common', 'uncommon', 'rare', 'epic', 'legendary']
        }
      }]
    },
    location: {
      type: String,
      required: true
    },
    respawnTime: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastDefeated: {
      type: Date
    },
    personalityId: {
      type: String,
      required: false
    },
    role: {
      type: String,
      required: false
    },
    personality: {
      type: String,
      required: false,
      enum: Object.values(PersonalityType)
    },
    baseMood: {
      type: String,
      required: false,
      enum: Object.values(MoodType)
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
NPCSchema.index({ type: 1, isActive: 1 });
NPCSchema.index({ location: 1, isActive: 1 });
NPCSchema.index({ level: 1 });

/**
 * Static method: Find all active NPCs
 * Automatically reactivates NPCs that have passed their respawn time
 */
NPCSchema.statics['findActiveNPCs'] = async function(): Promise<INPC[]> {
  const now = new Date();

  // Reactivate NPCs that should respawn
  // If lastDefeated + (respawnTime in minutes * 60000) <= now, reactivate
  await this.updateMany(
    {
      isActive: false,
      lastDefeated: { $exists: true }
    },
    [
      {
        $set: {
          isActive: {
            $cond: {
              if: {
                $lte: [
                  { $add: ['$lastDefeated', { $multiply: ['$respawnTime', 60000] }] },
                  now
                ]
              },
              then: true,
              else: false
            }
          }
        }
      }
    ]
  );

  return this.find({ isActive: true }).sort({ level: 1, type: 1 });
};

/**
 * Static method: Find NPCs by type
 */
NPCSchema.statics['findByType'] = async function(type: NPCType): Promise<INPC[]> {
  return this.find({ type, isActive: true }).sort({ level: 1 });
};

/**
 * Static method: Find NPCs by location
 */
NPCSchema.statics['findByLocation'] = async function(location: string): Promise<INPC[]> {
  return this.find({ location, isActive: true }).sort({ level: 1 });
};

/**
 * NPC model
 */
export const NPC = mongoose.model<INPC, INPCModel>('NPC', NPCSchema);

/**
 * Starter NPCs - 15 NPCs across different types and difficulties
 */
export const STARTER_NPCS: Partial<INPC>[] = [
  // OUTLAWS (5)
  {
    name: 'Barroom Brawler',
    type: NPCType.OUTLAW,
    level: 1,
    maxHP: 60, // 50 + 1 * 10
    difficulty: 2,
    lootTable: {
      goldMin: 5,
      goldMax: 15,
      xpReward: 50,
      items: [
        { name: 'Rusty Knuckles', chance: 0.3, rarity: 'common' },
        { name: 'Whiskey Bottle', chance: 0.5, rarity: 'common' }
      ]
    },
    location: 'Dusty Saloon',
    respawnTime: 5,
    description: 'A rowdy drunk spoiling for a fight. Easy pickings for a newcomer.',
    isActive: true
  },
  {
    name: 'Outlaw Gunslinger',
    type: NPCType.OUTLAW,
    level: 3,
    maxHP: 80, // 50 + 3 * 10
    difficulty: 4,
    lootTable: {
      goldMin: 15,
      goldMax: 30,
      xpReward: 120,
      items: [
        { name: 'Worn Revolver', chance: 0.2, rarity: 'uncommon' },
        { name: 'Outlaw Bandana', chance: 0.4, rarity: 'common' },
        { name: 'Bullet Cartridge', chance: 0.6, rarity: 'common' }
      ]
    },
    location: 'Canyon Trail',
    respawnTime: 10,
    description: 'A quick-drawing desperado with a price on his head.',
    isActive: true
  },
  {
    name: 'Bandit Leader',
    type: NPCType.OUTLAW,
    level: 5,
    maxHP: 100, // 50 + 5 * 10
    difficulty: 6,
    lootTable: {
      goldMin: 30,
      goldMax: 60,
      xpReward: 250,
      items: [
        { name: 'Steel Revolver', chance: 0.15, rarity: 'rare' },
        { name: 'Bandit Mask', chance: 0.3, rarity: 'uncommon' },
        { name: 'Gold Watch', chance: 0.25, rarity: 'uncommon' }
      ]
    },
    location: 'Hideout Camp',
    respawnTime: 15,
    description: 'The ruthless leader of a gang of thieves. Dangerous and cunning.',
    isActive: true
  },
  {
    name: 'Notorious Outlaw',
    type: NPCType.OUTLAW,
    level: 10,
    maxHP: 150, // 50 + 10 * 10
    difficulty: 8,
    lootTable: {
      goldMin: 75,
      goldMax: 150,
      xpReward: 600,
      items: [
        { name: 'Legendary Six-Shooter', chance: 0.1, rarity: 'epic' },
        { name: 'Outlaw Coat', chance: 0.2, rarity: 'rare' },
        { name: 'Bounty Poster', chance: 0.5, rarity: 'uncommon' }
      ]
    },
    location: 'Badlands',
    respawnTime: 30,
    description: 'A feared gunfighter with dozens of kills to his name. Extremely dangerous.',
    isActive: true
  },
  {
    name: 'Legendary Desperado',
    type: NPCType.OUTLAW,
    level: 15,
    maxHP: 200, // 50 + 15 * 10
    difficulty: 10,
    lootTable: {
      goldMin: 150,
      goldMax: 300,
      xpReward: 1200,
      items: [
        { name: 'Desperado\'s Revolver', chance: 0.3, rarity: 'legendary' },
        { name: 'Wanted Poster Collection', chance: 0.4, rarity: 'epic' },
        { name: 'Silver Spurs', chance: 0.3, rarity: 'rare' }
      ]
    },
    location: 'Devil\'s Peak',
    respawnTime: 60,
    description: 'The most wanted man in the territory. Only the bravest dare challenge him.',
    isActive: true
  },

  // WILDLIFE (5)
  {
    name: 'Coyote',
    type: NPCType.WILDLIFE,
    level: 1,
    maxHP: 50, // 50 + 1 * 10 - 10 for small animal
    difficulty: 1,
    lootTable: {
      goldMin: 2,
      goldMax: 8,
      xpReward: 30,
      items: [
        { name: 'Coyote Pelt', chance: 0.7, rarity: 'common' },
        { name: 'Animal Teeth', chance: 0.5, rarity: 'common' }
      ]
    },
    location: 'Desert Plains',
    respawnTime: 5,
    description: 'A scrawny desert scavenger. More annoying than dangerous.',
    isActive: true
  },
  {
    name: 'Gray Wolf',
    type: NPCType.WILDLIFE,
    level: 3,
    maxHP: 70, // 50 + 3 * 10 - 10
    difficulty: 3,
    lootTable: {
      goldMin: 10,
      goldMax: 20,
      xpReward: 100,
      items: [
        { name: 'Wolf Pelt', chance: 0.6, rarity: 'uncommon' },
        { name: 'Wolf Fang', chance: 0.4, rarity: 'uncommon' },
        { name: 'Raw Meat', chance: 0.8, rarity: 'common' }
      ]
    },
    location: 'Pine Forest',
    respawnTime: 10,
    description: 'A cunning predator that hunts in packs. Fast and aggressive.',
    isActive: true
  },
  {
    name: 'Black Bear',
    type: NPCType.WILDLIFE,
    level: 5,
    maxHP: 100,
    difficulty: 5,
    lootTable: {
      goldMin: 20,
      goldMax: 40,
      xpReward: 200,
      items: [
        { name: 'Bear Pelt', chance: 0.5, rarity: 'rare' },
        { name: 'Bear Claws', chance: 0.4, rarity: 'uncommon' },
        { name: 'Bear Meat', chance: 0.6, rarity: 'uncommon' }
      ]
    },
    location: 'Mountain Trail',
    respawnTime: 15,
    description: 'A massive black bear defending its territory. Strong and resilient.',
    isActive: true
  },
  {
    name: 'Mountain Lion',
    type: NPCType.WILDLIFE,
    level: 8,
    maxHP: 130,
    difficulty: 7,
    lootTable: {
      goldMin: 40,
      goldMax: 80,
      xpReward: 450,
      items: [
        { name: 'Mountain Lion Pelt', chance: 0.4, rarity: 'epic' },
        { name: 'Lion Fangs', chance: 0.5, rarity: 'rare' },
        { name: 'Predator Claws', chance: 0.4, rarity: 'rare' }
      ]
    },
    location: 'Rocky Cliffs',
    respawnTime: 20,
    description: 'An apex predator of the mountains. Silent, deadly, and relentless.',
    isActive: true
  },
  {
    name: 'Grizzly Bear',
    type: NPCType.WILDLIFE,
    level: 12,
    maxHP: 180,
    difficulty: 9,
    lootTable: {
      goldMin: 80,
      goldMax: 160,
      xpReward: 900,
      items: [
        { name: 'Grizzly Pelt', chance: 0.5, rarity: 'legendary' },
        { name: 'Grizzly Claws', chance: 0.4, rarity: 'epic' },
        { name: 'Prime Bear Meat', chance: 0.5, rarity: 'rare' }
      ]
    },
    location: 'Deep Wilderness',
    respawnTime: 45,
    description: 'The king of the wilderness. Massive, powerful, and absolutely terrifying.',
    isActive: true
  },

  // LAWMEN (5)
  {
    name: 'Town Deputy',
    type: NPCType.LAWMAN,
    level: 2,
    maxHP: 70,
    difficulty: 3,
    lootTable: {
      goldMin: 8,
      goldMax: 20,
      xpReward: 80,
      items: [
        { name: 'Deputy Badge', chance: 0.3, rarity: 'uncommon' },
        { name: 'Standard Pistol', chance: 0.2, rarity: 'common' },
        { name: 'Handcuffs', chance: 0.5, rarity: 'common' }
      ]
    },
    location: 'Small Town',
    respawnTime: 10,
    description: 'A green deputy eager to prove himself. Armed and authorized.',
    isActive: true
  },
  {
    name: 'Sheriff',
    type: NPCType.LAWMAN,
    level: 5,
    maxHP: 100,
    difficulty: 6,
    lootTable: {
      goldMin: 25,
      goldMax: 50,
      xpReward: 250,
      items: [
        { name: 'Sheriff Badge', chance: 0.4, rarity: 'rare' },
        { name: 'Sheriff\'s Revolver', chance: 0.2, rarity: 'uncommon' },
        { name: 'Lawman\'s Hat', chance: 0.3, rarity: 'uncommon' }
      ]
    },
    location: 'County Seat',
    respawnTime: 20,
    description: 'An experienced lawman who knows every trick in the book.',
    isActive: true
  },
  {
    name: 'Bounty Hunter',
    type: NPCType.LAWMAN,
    level: 8,
    maxHP: 120,
    difficulty: 7,
    lootTable: {
      goldMin: 50,
      goldMax: 100,
      xpReward: 500,
      items: [
        { name: 'Tracking Gear', chance: 0.3, rarity: 'rare' },
        { name: 'Hunter\'s Rifle', chance: 0.2, rarity: 'rare' },
        { name: 'Bounty Contracts', chance: 0.4, rarity: 'uncommon' }
      ]
    },
    location: 'Frontier Outpost',
    respawnTime: 25,
    description: 'A ruthless tracker who never lets his quarry escape. Well-armed and determined.',
    isActive: true
  },
  {
    name: 'US Marshal',
    type: NPCType.LAWMAN,
    level: 10,
    maxHP: 150,
    difficulty: 8,
    lootTable: {
      goldMin: 75,
      goldMax: 150,
      xpReward: 650,
      items: [
        { name: 'Marshal Badge', chance: 0.5, rarity: 'epic' },
        { name: 'Federal Revolver', chance: 0.3, rarity: 'epic' },
        { name: 'Marshal\'s Coat', chance: 0.3, rarity: 'rare' }
      ]
    },
    location: 'Federal Territory',
    respawnTime: 30,
    description: 'A federal lawman with authority across the entire territory. Highly skilled.',
    isActive: true
  },
  {
    name: 'Elite Lawman',
    type: NPCType.LAWMAN,
    level: 15,
    maxHP: 200,
    difficulty: 10,
    lootTable: {
      goldMin: 150,
      goldMax: 300,
      xpReward: 1200,
      items: [
        { name: 'Elite Marshal Badge', chance: 0.4, rarity: 'legendary' },
        { name: 'Lawbringer Revolver', chance: 0.3, rarity: 'legendary' },
        { name: 'Federal Commission', chance: 0.3, rarity: 'epic' }
      ]
    },
    location: 'Capitol District',
    respawnTime: 60,
    description: 'The best of the best. A legendary lawman who has brought countless outlaws to justice.',
    isActive: true
  }
];

/**
 * Initialize NPCs in database
 */
export async function initializeNPCs(): Promise<void> {
  const count = await NPC.countDocuments();

  if (count === 0) {
    await NPC.insertMany(STARTER_NPCS);
    console.log(`Initialized ${STARTER_NPCS.length} starter NPCs`);
  }
}
