/**
 * Character Model
 *
 * Mongoose schema for player characters in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Faction, ENERGY, PROGRESSION, FACTIONS } from '@desperados/shared';

/**
 * Character appearance customization
 */
export interface CharacterAppearance {
  bodyType: 'male' | 'female' | 'non-binary';
  skinTone: number; // 0-10
  facePreset: number; // 0-9
  hairStyle: number; // 0-14
  hairColor: number; // 0-7
}

/**
 * Character stat block
 */
export interface CharacterStats {
  cunning: number;
  spirit: number;
  combat: number;
  craft: number;
}

/**
 * Skill training record
 */
export interface CharacterSkill {
  skillId: string;
  level: number;
  experience: number;
  trainingStarted?: Date;
  trainingCompletes?: Date;
}

/**
 * Inventory item
 */
export interface InventoryItem {
  itemId: string;
  quantity: number;
  acquiredAt: Date;
}

/**
 * Character document interface
 */
export interface ICharacter extends Document {
  // Ownership
  userId: mongoose.Types.ObjectId;

  // Identity
  name: string;
  faction: Faction;

  // Appearance
  appearance: CharacterAppearance;

  // Progression
  level: number;
  experience: number;

  // Resources
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: Date;

  // Location
  currentLocation: string;

  // Stats
  stats: CharacterStats;

  // Skills
  skills: CharacterSkill[];

  // Inventory
  inventory: InventoryItem[];

  // Timestamps
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;

  // Instance methods
  calculateEnergyRegen(): number;
  regenerateEnergy(): void;
  canAffordAction(cost: number): boolean;
  spendEnergy(cost: number): void;
  addExperience(amount: number): void;
  toSafeObject(): any;

  // Virtuals
  energyRegenRate: number;
  nextLevelXP: number;
}

/**
 * Character static methods interface
 */
export interface ICharacterModel extends Model<ICharacter> {
  findByUserId(userId: string): Promise<ICharacter[]>;
  findActiveByName(name: string): Promise<ICharacter | null>;
  getCharacterCount(userId: string): Promise<number>;
}

/**
 * Character schema definition
 */
const CharacterSchema = new Schema<ICharacter>(
  {
    // Ownership
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Identity
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    faction: {
      type: String,
      required: true,
      enum: Object.values(Faction)
    },

    // Appearance
    appearance: {
      bodyType: {
        type: String,
        required: true,
        enum: ['male', 'female', 'non-binary']
      },
      skinTone: {
        type: Number,
        required: true,
        min: 0,
        max: 10
      },
      facePreset: {
        type: Number,
        required: true,
        min: 0,
        max: 9
      },
      hairStyle: {
        type: Number,
        required: true,
        min: 0,
        max: 14
      },
      hairColor: {
        type: Number,
        required: true,
        min: 0,
        max: 7
      }
    },

    // Progression
    level: {
      type: Number,
      default: 1,
      min: PROGRESSION.MIN_LEVEL,
      max: PROGRESSION.MAX_LEVEL
    },
    experience: {
      type: Number,
      default: 0,
      min: 0
    },

    // Resources
    energy: {
      type: Number,
      default: ENERGY.FREE_MAX
    },
    maxEnergy: {
      type: Number,
      default: ENERGY.FREE_MAX
    },
    lastEnergyUpdate: {
      type: Date,
      default: Date.now
    },

    // Location
    currentLocation: {
      type: String,
      required: true
    },

    // Stats
    stats: {
      cunning: { type: Number, default: 0 },
      spirit: { type: Number, default: 0 },
      combat: { type: Number, default: 0 },
      craft: { type: Number, default: 0 }
    },

    // Skills
    skills: [{
      skillId: { type: String, required: true },
      level: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      trainingStarted: { type: Date },
      trainingCompletes: { type: Date }
    }],

    // Inventory
    inventory: [{
      itemId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      acquiredAt: { type: Date, default: Date.now }
    }],

    // Activity tracking
    lastActive: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
CharacterSchema.index({ userId: 1, isActive: 1 });
CharacterSchema.index({ name: 1 }, { unique: true });

/**
 * Virtual: Energy regeneration rate (per hour)
 * Note: For now, assumes free player. Will be enhanced when premium system is added.
 */
CharacterSchema.virtual('energyRegenRate').get(function(this: ICharacter) {
  // TODO: Check user's subscription status when user model has premium field
  return ENERGY.FREE_REGEN_PER_HOUR;
});

/**
 * Virtual: Experience needed for next level
 */
CharacterSchema.virtual('nextLevelXP').get(function(this: ICharacter) {
  if (this.level >= PROGRESSION.MAX_LEVEL) {
    return 0;
  }
  return Math.floor(
    PROGRESSION.BASE_EXPERIENCE * Math.pow(PROGRESSION.EXPERIENCE_MULTIPLIER, this.level - 1)
  );
});

/**
 * Instance method: Calculate energy regeneration amount
 */
CharacterSchema.methods['calculateEnergyRegen'] = function(this: ICharacter): number {
  const now = Date.now();
  const lastUpdate = this.lastEnergyUpdate.getTime();
  const elapsedMs = now - lastUpdate;

  // Energy regenerates at a constant rate per hour
  const regenPerMs = this.energyRegenRate / (60 * 60 * 1000);
  const regenAmount = elapsedMs * regenPerMs;

  // Cap at max energy
  return Math.min(regenAmount, this.maxEnergy - this.energy);
};

/**
 * Instance method: Regenerate energy based on elapsed time
 */
CharacterSchema.methods['regenerateEnergy'] = function(this: ICharacter): void {
  const regenAmount = (this as any).calculateEnergyRegen();
  this.energy = Math.min(this.energy + regenAmount, this.maxEnergy);
  this.lastEnergyUpdate = new Date();
};

/**
 * Instance method: Check if character can afford an action
 */
CharacterSchema.methods['canAffordAction'] = function(this: ICharacter, cost: number): boolean {
  return this.energy >= cost;
};

/**
 * Instance method: Spend energy on an action
 */
CharacterSchema.methods['spendEnergy'] = function(this: ICharacter, cost: number): void {
  if (!(this as any).canAffordAction(cost)) {
    throw new Error('Insufficient energy');
  }
  this.energy -= cost;
  this.lastEnergyUpdate = new Date();
};

/**
 * Instance method: Add experience and handle level ups
 */
CharacterSchema.methods['addExperience'] = function(this: ICharacter, amount: number): void {
  this.experience += amount;

  // Check for level ups
  while (this.level < PROGRESSION.MAX_LEVEL) {
    const xpNeeded = Math.floor(
      PROGRESSION.BASE_EXPERIENCE * Math.pow(PROGRESSION.EXPERIENCE_MULTIPLIER, this.level - 1)
    );

    if (this.experience >= xpNeeded) {
      this.experience -= xpNeeded;
      this.level += 1;
      // On level up, could grant stat points, etc.
    } else {
      break;
    }
  }
};

/**
 * Instance method: Return safe character object (no sensitive data)
 */
CharacterSchema.methods['toSafeObject'] = function(this: ICharacter) {
  return {
    _id: (this as any)._id.toString(),
    name: this.name,
    faction: this.faction,
    appearance: this.appearance,
    level: this.level,
    experience: this.experience,
    experienceToNextLevel: this.nextLevelXP,
    energy: Math.floor(this.energy),
    maxEnergy: this.maxEnergy,
    currentLocation: this.currentLocation,
    stats: this.stats,
    skills: this.skills,
    inventory: this.inventory,
    createdAt: this.createdAt,
    lastActive: this.lastActive
  };
};

/**
 * Static method: Find all active characters for a user
 */
CharacterSchema.statics['findByUserId'] = async function(
  userId: string
): Promise<ICharacter[]> {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  }).sort({ lastActive: -1 });
};

/**
 * Static method: Find active character by name (case-insensitive)
 */
CharacterSchema.statics['findActiveByName'] = async function(
  name: string
): Promise<ICharacter | null> {
  return this.findOne({
    name: new RegExp(`^${name}$`, 'i'),
    isActive: true
  });
};

/**
 * Static method: Get count of characters for a user
 */
CharacterSchema.statics['getCharacterCount'] = async function(
  userId: string
): Promise<number> {
  return this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  });
};

/**
 * Helper function to get starting location for a faction
 */
export function getStartingLocation(faction: Faction): string {
  return FACTIONS[faction].startingLocationId;
}

/**
 * Character model
 */
export const Character = mongoose.model<ICharacter, ICharacterModel>('Character', CharacterSchema);
