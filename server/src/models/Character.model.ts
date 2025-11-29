/**
 * Character Model
 *
 * Mongoose schema for player characters in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Faction, ENERGY, PROGRESSION, FACTIONS } from '@desperados/shared';
import { TransactionSource } from './GoldTransaction.model';

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
 * Equipment slots
 */
export interface CharacterEquipment {
  weapon: string | null;
  head: string | null;
  body: string | null;
  feet: string | null;
  mount: string | null;
  accessory: string | null;
}

/**
 * Combat statistics
 */
export interface CombatStats {
  wins: number;
  losses: number;
  totalDamage: number;
  kills: number;
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
  gold: number;

  // Bank Vault
  bankVaultBalance: number;
  bankVaultTier: 'none' | 'bronze' | 'silver' | 'gold';

  // Location
  currentLocation: string;

  // Gang
  gangId: mongoose.Types.ObjectId | null;

  // Stats
  stats: CharacterStats;

  // Skills
  skills: CharacterSkill[];

  // Inventory
  inventory: InventoryItem[];

  // Equipment
  equipment: CharacterEquipment;

  // Combat Stats
  combatStats: CombatStats;

  // Crime and Jail System
  isJailed: boolean;
  jailedUntil: Date | null;
  wantedLevel: number;
  lastWantedDecay: Date;
  bountyAmount: number;
  lastArrestTime: Date | null;
  arrestCooldowns: Map<string, Date>;
  lastBailCost: number;

  // Reputation System
  factionReputation: {
    settlerAlliance: number;
    nahiCoalition: number;
    frontera: number;
  };
  criminalReputation: number;

  // Legacy compatibility - reputation alias
  reputation?: {
    outlaws?: number;
    coalition?: number;
    settlers?: number;
  };

  // Disguise System
  currentDisguise: string | null;
  disguiseExpiresAt: Date | null;
  disguiseFaction: string | null;

  // Mentor System
  currentMentorId: string | null;

  // Crafting Specializations (Phase 7.1)
  specializations?: Array<{
    pathId: string;
    professionId: string;
    unlockedAt: Date;
    masteryProgress: number;
    uniqueRecipesUnlocked: string[];
  }>;

  // Crafting professions (for workshop access)
  professions?: string[];

  // Completed quests (for quest-gated content)
  completedQuests?: string[];

  // Progression System (Phase 6)
  talents?: Array<{
    talentId: string;
    ranks: number;
    unlockedAt: Date;
  }>;
  prestige?: {
    currentRank: number;
    totalPrestiges: number;
    permanentBonuses: Array<{
      type: string;
      value: number;
      description: string;
    }>;
    prestigeHistory: Array<{
      rank: number;
      achievedAt: Date;
      levelAtPrestige: number;
    }>;
  };

  // Timestamps
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;

  // Instance methods
  calculateEnergyRegen(): number;
  regenerateEnergy(): void;
  canAffordAction(cost: number): boolean;
  spendEnergy(cost: number): void;
  addExperience(amount: number): Promise<void>;
  toSafeObject(): any;

  // Gold methods
  hasGold(amount: number): boolean;
  addGold(amount: number, source: TransactionSource, metadata?: any): Promise<number>;
  deductGold(amount: number, source: TransactionSource, metadata?: any): Promise<number>;

  // Skill methods
  getSkill(skillId: string): CharacterSkill | undefined;
  getSkillLevel(skillId: string): number;
  getSkillBonusForSuit(suit: string): number;
  getCurrentTraining(): CharacterSkill | null;
  canStartTraining(): boolean;
  isTrainingComplete(): boolean;

  // Crime and Jail methods
  isCurrentlyJailed(): boolean;
  getRemainingJailTime(): number;
  releaseFromJail(): void;
  increaseWantedLevel(amount: number): void;
  decreaseWantedLevel(amount: number): void;
  calculateBounty(): number;
  canBeArrested(): boolean;
  decayWantedLevel(): boolean;
  sendToJail(minutes: number, bailCost?: number): void;
  canArrestTarget(targetId: string): boolean;
  recordArrest(targetId: string): void;

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
    gold: {
      type: Number,
      default: 100,
      min: 0
    },

    // Bank Vault System
    bankVaultBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    bankVaultTier: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold'],
      default: 'none'
    },

    // Location
    currentLocation: {
      type: String,
      required: true
    },

    // Gang
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      default: null,
      index: true
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

    // Equipment
    equipment: {
      weapon: { type: String, default: null },
      head: { type: String, default: null },
      body: { type: String, default: null },
      feet: { type: String, default: null },
      mount: { type: String, default: null },
      accessory: { type: String, default: null }
    },

    // Combat Stats
    combatStats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      totalDamage: { type: Number, default: 0 },
      kills: { type: Number, default: 0 }
    },

    // Crime and Jail System
    isJailed: {
      type: Boolean,
      default: false
    },
    jailedUntil: {
      type: Date,
      default: null
    },
    wantedLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    lastWantedDecay: {
      type: Date,
      default: Date.now
    },
    bountyAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastArrestTime: {
      type: Date,
      default: null
    },
    arrestCooldowns: {
      type: Map,
      of: Date,
      default: new Map()
    },
    lastBailCost: {
      type: Number,
      default: 0,
      min: 0
    },

    // Reputation System
    factionReputation: {
      settlerAlliance: { type: Number, default: 0, min: -100, max: 100 },
      nahiCoalition: { type: Number, default: 0, min: -100, max: 100 },
      frontera: { type: Number, default: 0, min: -100, max: 100 },
    },
    criminalReputation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Disguise System
    currentDisguise: {
      type: String,
      default: null
    },
    disguiseExpiresAt: {
      type: Date,
      default: null
    },
    disguiseFaction: {
      type: String,
      enum: ['settler', 'nahi', 'frontera', null],
      default: null
    },

    // Mentor System
    currentMentorId: {
      type: String,
      default: null
    },

    // Crafting Specializations (Phase 7.1)
    specializations: {
      type: [{
        pathId: { type: String, required: true },
        professionId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        masteryProgress: { type: Number, default: 0, min: 0, max: 100 },
        uniqueRecipesUnlocked: [{ type: String }]
      }],
      default: []
    },

    // Progression System (Phase 6)
    talents: {
      type: [{
        talentId: { type: String, required: true },
        ranks: { type: Number, required: true, min: 1, max: 3 },
        unlockedAt: { type: Date, default: Date.now }
      }],
      default: []
    },
    prestige: {
      type: {
        currentRank: { type: Number, default: 0, min: 0 },
        totalPrestiges: { type: Number, default: 0, min: 0 },
        permanentBonuses: [{
          type: { type: String, required: true },
          value: { type: Number, required: true },
          description: { type: String, required: true }
        }],
        prestigeHistory: [{
          rank: { type: Number, required: true },
          achievedAt: { type: Date, default: Date.now },
          levelAtPrestige: { type: Number, required: true }
        }]
      },
      default: undefined
    },

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
// Performance optimization indexes
CharacterSchema.index({ wantedLevel: 1, isActive: 1 }); // For wanted player queries
CharacterSchema.index({ level: -1, experience: -1 }); // For leaderboards
CharacterSchema.index({ faction: 1, level: -1 }); // For faction leaderboards
CharacterSchema.index({ jailedUntil: 1 }); // For jail release jobs
CharacterSchema.index({ lastActive: -1 }); // For active player queries
CharacterSchema.index({ gangId: 1, level: -1 }); // For gang member rankings

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
CharacterSchema.methods.calculateEnergyRegen = function(this: ICharacter): number {
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
CharacterSchema.methods.regenerateEnergy = function(this: ICharacter): void {
  const regenAmount = this.calculateEnergyRegen();
  this.energy = Math.min(this.energy + regenAmount, this.maxEnergy);
  this.lastEnergyUpdate = new Date();
};

/**
 * Instance method: Check if character can afford an action
 */
CharacterSchema.methods.canAffordAction = function(this: ICharacter, cost: number): boolean {
  this.regenerateEnergy();
  return this.energy >= cost;
};

/**
 * Instance method: Spend energy on an action
 */
CharacterSchema.methods.spendEnergy = function(this: ICharacter, cost: number): void {
  this.regenerateEnergy();
  if (!this.canAffordAction(cost)) {
    throw new Error('Insufficient energy');
  }
  this.energy -= cost;
  this.lastEnergyUpdate = new Date();
};

/**
 * Instance method: Add experience and handle level ups
 */
CharacterSchema.methods.addExperience = async function(this: ICharacter, amount: number): Promise<void> {
  this.experience += amount;

  // Check for level ups
  let leveledUp = false;
  const oldLevel = this.level;

  while (this.level < PROGRESSION.MAX_LEVEL) {
    const xpNeeded = Math.floor(
      PROGRESSION.BASE_EXPERIENCE * Math.pow(PROGRESSION.EXPERIENCE_MULTIPLIER, this.level - 1)
    );

    if (this.experience >= xpNeeded) {
      this.experience -= xpNeeded;
      this.level += 1;
      leveledUp = true;
      // On level up, could grant stat points, etc.
    } else {
      break;
    }
  }

  // Trigger quest progress if level increased
  if (leveledUp) {
    try {
      // Use dynamic import to avoid circular dependency
      const { QuestService } = await import('../services/quest.service');
      await QuestService.onLevelUp(this._id.toString(), this.level);
    } catch (questError) {
      // Don't fail level up if quest update fails
      console.error('Failed to update quest progress for level up:', questError);
    }
  }
};

/**
 * Instance method: Return safe character object (no sensitive data)
 */
CharacterSchema.methods.toSafeObject = function(this: ICharacter) {
  const id = this._id.toString();
  return {
    id,
    _id: id,
    name: this.name,
    faction: this.faction,
    appearance: this.appearance,
    level: this.level,
    experience: this.experience,
    experienceToNextLevel: this.nextLevelXP,
    energy: Math.floor(this.energy),
    maxEnergy: this.maxEnergy,
    gold: this.gold,
    currentLocation: this.currentLocation,
    gangId: this.gangId ? this.gangId.toString() : null,
    stats: this.stats,
    skills: this.skills,
    inventory: this.inventory,
    combatStats: this.combatStats,
    isJailed: this.isJailed,
    jailedUntil: this.jailedUntil,
    wantedLevel: this.wantedLevel,
    bountyAmount: this.bountyAmount,
    createdAt: this.createdAt,
    lastActive: this.lastActive
  };
};

/**
 * Instance method: Check if character has sufficient gold
 */
CharacterSchema.methods.hasGold = function(this: ICharacter, amount: number): boolean {
  return this.gold >= amount;
};

/**
 * Instance method: Add gold to character with transaction tracking
 */
CharacterSchema.methods.addGold = async function(
  this: ICharacter,
  amount: number,
  source: TransactionSource,
  metadata?: any
): Promise<number> {
  // Import GoldService dynamically to avoid circular dependencies
  const { GoldService } = await import('../services/gold.service');
  const { newBalance } = await GoldService.addGold(this._id as any, amount, source, metadata);
  this.gold = newBalance; // Update local instance
  return newBalance;
};

/**
 * Instance method: Deduct gold from character with transaction tracking
 */
CharacterSchema.methods.deductGold = async function(
  this: ICharacter,
  amount: number,
  source: TransactionSource,
  metadata?: any
): Promise<number> {
  // Import GoldService dynamically to avoid circular dependencies
  const { GoldService } = await import('../services/gold.service');
  const { newBalance } = await GoldService.deductGold(this._id as any, amount, source, metadata);
  this.gold = newBalance; // Update local instance
  return newBalance;
};

/**
 * Instance method: Get a specific skill by ID
 */
CharacterSchema.methods.getSkill = function(this: ICharacter, skillId: string): CharacterSkill | undefined {
  return this.skills.find(skill => skill.skillId === skillId);
};

/**
 * Instance method: Get skill level (returns 0 if skill not found)
 */
CharacterSchema.methods.getSkillLevel = function(this: ICharacter, skillId: string): number {
  const skill = this.getSkill(skillId);
  return skill ? skill.level : 0;
};

/**
 * Instance method: Calculate total skill bonus for a specific Destiny Deck suit
 * Each skill level = +1 to its suit
 */
CharacterSchema.methods.getSkillBonusForSuit = function(this: ICharacter, suit: string): number {
  // Import skills constants to map skills to suits
  const { SKILLS } = require('@desperados/shared');

  let totalBonus = 0;

  for (const characterSkill of this.skills) {
    const skillDef = SKILLS[characterSkill.skillId.toUpperCase()];
    if (skillDef && skillDef.suit === suit) {
      totalBonus += characterSkill.level;
    }
  }

  return totalBonus;
};

/**
 * Instance method: Get current training session (if any)
 */
CharacterSchema.methods.getCurrentTraining = function(this: ICharacter): CharacterSkill | null {
  const trainingSkill = this.skills.find(
    skill => skill.trainingStarted && skill.trainingCompletes
  );
  return trainingSkill || null;
};

/**
 * Instance method: Check if character can start training a new skill
 */
CharacterSchema.methods.canStartTraining = function(this: ICharacter): boolean {
  return this.getCurrentTraining() === null;
};

/**
 * Instance method: Check if current training is complete
 */
CharacterSchema.methods.isTrainingComplete = function(this: ICharacter): boolean {
  const training = this.getCurrentTraining();
  if (!training || !training.trainingCompletes) {
    return false;
  }
  return new Date() >= training.trainingCompletes;
};

/**
 * Instance method: Check if character is currently jailed
 */
CharacterSchema.methods.isCurrentlyJailed = function(this: ICharacter): boolean {
  if (!this.isJailed || !this.jailedUntil) {
    return false;
  }
  return new Date() < this.jailedUntil;
};

/**
 * Instance method: Get remaining jail time in minutes
 */
CharacterSchema.methods.getRemainingJailTime = function(this: ICharacter): number {
  if (!this.isCurrentlyJailed()) {
    return 0;
  }
  const remaining = this.jailedUntil!.getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
};

/**
 * Instance method: Release character from jail
 */
CharacterSchema.methods.releaseFromJail = function(this: ICharacter): void {
  this.isJailed = false;
  this.jailedUntil = null;
};

/**
 * Instance method: Send character to jail
 */
CharacterSchema.methods.sendToJail = function(this: ICharacter, minutes: number, bailCost?: number): void {
  this.isJailed = true;
  this.jailedUntil = new Date(Date.now() + minutes * 60 * 1000);
  // Store bail cost from action if provided, otherwise calculate based on wanted level
  this.lastBailCost = bailCost ?? (this.wantedLevel * 50);
};

/**
 * Instance method: Increase wanted level
 */
CharacterSchema.methods.increaseWantedLevel = function(this: ICharacter, amount: number): void {
  this.wantedLevel = Math.min(5, this.wantedLevel + amount);
  this.bountyAmount = this.calculateBounty();
};

/**
 * Instance method: Decrease wanted level
 */
CharacterSchema.methods.decreaseWantedLevel = function(this: ICharacter, amount: number): void {
  this.wantedLevel = Math.max(0, this.wantedLevel - amount);
  this.bountyAmount = this.calculateBounty();
};

/**
 * Instance method: Calculate bounty based on wanted level
 */
CharacterSchema.methods.calculateBounty = function(this: ICharacter): number {
  return this.wantedLevel * 100;
};

/**
 * Instance method: Check if character can be arrested
 */
CharacterSchema.methods.canBeArrested = function(this: ICharacter): boolean {
  return this.wantedLevel >= 3 && !this.isCurrentlyJailed();
};

/**
 * Instance method: Decay wanted level (called every 24h)
 */
CharacterSchema.methods.decayWantedLevel = function(this: ICharacter): boolean {
  if (this.wantedLevel === 0) {
    return false;
  }

  const now = new Date();
  const hoursSinceDecay = (now.getTime() - this.lastWantedDecay.getTime()) / (1000 * 60 * 60);

  if (hoursSinceDecay >= 24) {
    this.decreaseWantedLevel(1);
    this.lastWantedDecay = now;
    return true;
  }

  return false;
};

/**
 * Instance method: Check if character can arrest a target
 */
CharacterSchema.methods.canArrestTarget = function(this: ICharacter, targetId: string): boolean {
  // Can't arrest if you're jailed or a criminal yourself
  if (this.isCurrentlyJailed()) {
    return false;
  }

  // Check cooldown
  const cooldowns = this.arrestCooldowns as Map<string, Date>;
  const lastArrest = cooldowns.get(targetId);
  if (lastArrest) {
    const hoursSinceArrest = (Date.now() - lastArrest.getTime()) / (1000 * 60 * 60);
    if (hoursSinceArrest < 1) {
      return false;
    }
  }

  return true;
};

/**
 * Instance method: Record an arrest to prevent spam
 */
CharacterSchema.methods.recordArrest = function(this: ICharacter, targetId: string): void {
  const cooldowns = this.arrestCooldowns as Map<string, Date>;
  cooldowns.set(targetId, new Date());
  this.arrestCooldowns = cooldowns;
};

/**
 * Static method: Find all active characters for a user
 */
CharacterSchema.statics.findByUserId = async function(
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
CharacterSchema.statics.findActiveByName = async function(
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
CharacterSchema.statics.getCharacterCount = async function(
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
