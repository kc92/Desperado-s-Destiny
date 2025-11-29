/**
 * Animal Companion Model - Phase 9, Wave 9.2
 *
 * Mongoose schema for animal companions in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  CompanionSpecies,
  TrustLevel,
  CompanionCondition,
  CombatRole,
  CompanionAbilityId,
  AcquisitionMethod,
  COMPANION_CONSTANTS
} from '@desperados/shared';

/**
 * Animal Companion document interface
 */
export interface IAnimalCompanion extends Document {
  // Ownership
  ownerId: mongoose.Types.ObjectId;

  // Identity
  name: string;
  species: CompanionSpecies;
  breed?: string;
  age: number; // in months
  gender: 'male' | 'female';

  // Core Stats
  loyalty: number;
  intelligence: number;
  aggression: number;
  health: number;

  // Abilities
  abilities: CompanionAbilityId[];
  maxAbilities: number;
  abilityCooldowns: Map<CompanionAbilityId, Date>;

  // Bond
  bondLevel: number;
  trustLevel: TrustLevel;

  // Combat
  attackPower: number;
  defensePower: number;
  combatRole: CombatRole;

  // Utility
  trackingBonus: number;
  huntingBonus: number;
  guardBonus: number;
  socialBonus: number;

  // Condition
  currentHealth: number;
  maxHealth: number;
  hunger: number;
  happiness: number;
  condition: CompanionCondition;

  // State
  isActive: boolean;
  location: string;

  // History
  acquiredDate: Date;
  acquiredMethod: AcquisitionMethod;
  kills: number;
  itemsFound: number;
  encountersHelped: number;

  // Training
  trainingProgress?: {
    abilityId: CompanionAbilityId;
    progress: number;
    startedAt: Date;
    completesAt: Date;
  };

  // Care tracking
  lastFed?: Date;
  lastActive?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  getTrustLevel(): TrustLevel;
  getCondition(): CompanionCondition;
  canUseAbility(abilityId: CompanionAbilityId): boolean;
  useAbility(abilityId: CompanionAbilityId): void;
  feed(foodCost: number): { hungerGain: number; happinessGain: number; bondGain: number };
  updateHungerAndHappiness(): void;
  gainBond(amount: number): void;
  loseBond(amount: number): void;
  takeDamage(amount: number): boolean;
  heal(amount: number): void;
  isNeglected(): boolean;
  mayLeave(): boolean;
  canLearnAbility(abilityId: CompanionAbilityId): boolean;
  startTraining(abilityId: CompanionAbilityId): void;
  completeTraining(): CompanionAbilityId | null;
  toSafeObject(): any;
}

/**
 * Animal Companion static methods interface
 */
export interface IAnimalCompanionModel extends Model<IAnimalCompanion> {
  findByOwner(ownerId: string): Promise<IAnimalCompanion[]>;
  findActiveByOwner(ownerId: string): Promise<IAnimalCompanion | null>;
  getOwnerStats(ownerId: string): Promise<any>;
}

/**
 * Animal Companion schema definition
 */
const AnimalCompanionSchema = new Schema<IAnimalCompanion>(
  {
    // Ownership
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    // Identity
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 20
    },
    species: {
      type: String,
      required: true,
      enum: Object.values(CompanionSpecies)
    },
    breed: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      default: 12, // 1 year old
      min: 1
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female']
    },

    // Core Stats (1-100)
    loyalty: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    intelligence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    aggression: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    health: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Abilities
    abilities: [{
      type: String,
      enum: Object.values(CompanionAbilityId)
    }],
    maxAbilities: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 8
    },
    abilityCooldowns: {
      type: Map,
      of: Date,
      default: new Map()
    },

    // Bond
    bondLevel: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
      max: 100
    },
    trustLevel: {
      type: String,
      required: true,
      enum: Object.values(TrustLevel),
      default: TrustLevel.WARY
    },

    // Combat
    attackPower: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    defensePower: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    combatRole: {
      type: String,
      required: true,
      enum: Object.values(CombatRole),
      default: CombatRole.SUPPORT
    },

    // Utility
    trackingBonus: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    huntingBonus: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    guardBonus: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    socialBonus: {
      type: Number,
      required: true,
      default: 0
    },

    // Condition
    currentHealth: {
      type: Number,
      required: true,
      min: 0
    },
    maxHealth: {
      type: Number,
      required: true,
      min: 1,
      default: 100
    },
    hunger: {
      type: Number,
      required: true,
      default: 80,
      min: 0,
      max: 100
    },
    happiness: {
      type: Number,
      required: true,
      default: 70,
      min: 0,
      max: 100
    },
    condition: {
      type: String,
      required: true,
      enum: Object.values(CompanionCondition),
      default: CompanionCondition.GOOD
    },

    // State
    isActive: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      required: true,
      default: 'kennel'
    },

    // History
    acquiredDate: {
      type: Date,
      default: Date.now
    },
    acquiredMethod: {
      type: String,
      required: true,
      enum: Object.values(AcquisitionMethod)
    },
    kills: {
      type: Number,
      default: 0,
      min: 0
    },
    itemsFound: {
      type: Number,
      default: 0,
      min: 0
    },
    encountersHelped: {
      type: Number,
      default: 0,
      min: 0
    },

    // Training
    trainingProgress: {
      abilityId: {
        type: String,
        enum: Object.values(CompanionAbilityId)
      },
      progress: {
        type: Number,
        min: 0,
        max: 100
      },
      startedAt: Date,
      completesAt: Date
    },

    // Care tracking
    lastFed: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
AnimalCompanionSchema.index({ ownerId: 1, isActive: 1 });
AnimalCompanionSchema.index({ species: 1 });
AnimalCompanionSchema.index({ ownerId: 1, createdAt: -1 });

/**
 * Instance method: Get trust level based on bond
 */
AnimalCompanionSchema.methods.getTrustLevel = function(this: IAnimalCompanion): TrustLevel {
  if (this.bondLevel <= 20) return TrustLevel.WILD;
  if (this.bondLevel <= 40) return TrustLevel.WARY;
  if (this.bondLevel <= 60) return TrustLevel.FAMILIAR;
  if (this.bondLevel <= 80) return TrustLevel.TRUSTED;
  return TrustLevel.DEVOTED;
};

/**
 * Instance method: Get condition based on health percentage
 */
AnimalCompanionSchema.methods.getCondition = function(this: IAnimalCompanion): CompanionCondition {
  const healthPercent = (this.currentHealth / this.maxHealth) * 100;

  if (healthPercent >= 90) return CompanionCondition.EXCELLENT;
  if (healthPercent >= 70) return CompanionCondition.GOOD;
  if (healthPercent >= 50) return CompanionCondition.FAIR;
  if (healthPercent >= 30) return CompanionCondition.POOR;
  return CompanionCondition.CRITICAL;
};

/**
 * Instance method: Check if ability can be used
 */
AnimalCompanionSchema.methods.canUseAbility = function(
  this: IAnimalCompanion,
  abilityId: CompanionAbilityId
): boolean {
  // Check if companion has the ability
  if (!this.abilities.includes(abilityId)) {
    return false;
  }

  // Check cooldown
  const cooldowns = this.abilityCooldowns as Map<CompanionAbilityId, Date>;
  const cooldownEnd = cooldowns.get(abilityId);

  if (cooldownEnd && new Date() < cooldownEnd) {
    return false;
  }

  return true;
};

/**
 * Instance method: Use an ability (apply cooldown)
 */
AnimalCompanionSchema.methods.useAbility = function(
  this: IAnimalCompanion,
  abilityId: CompanionAbilityId
): void {
  // Import ability data
  const { getAbilityById } = require('../data/companionAbilities');
  const ability = getAbilityById(abilityId);

  if (!ability || !ability.cooldown) {
    return;
  }

  // Set cooldown
  const cooldowns = this.abilityCooldowns as Map<CompanionAbilityId, Date>;
  const cooldownEnd = new Date(Date.now() + ability.cooldown * 60 * 1000);
  cooldowns.set(abilityId, cooldownEnd);
  this.abilityCooldowns = cooldowns;
};

/**
 * Instance method: Feed the companion
 */
AnimalCompanionSchema.methods.feed = function(
  this: IAnimalCompanion,
  foodCost: number
): { hungerGain: number; happinessGain: number; bondGain: number } {
  // Calculate hunger gain (more gain if hungrier)
  const hungerDeficit = 100 - this.hunger;
  const hungerGain = Math.min(hungerDeficit, 30 + Math.floor(hungerDeficit * 0.2));

  // Calculate happiness gain
  const happinessGain = Math.min(20, Math.floor(hungerGain * 0.5));

  // Calculate bond gain (feeding consistently builds trust)
  const bondGain = this.hunger < 30 ? 3 : 2; // More bond if was very hungry

  // Apply changes
  this.hunger = Math.min(100, this.hunger + hungerGain);
  this.happiness = Math.min(100, this.happiness + happinessGain);
  this.gainBond(bondGain);
  this.lastFed = new Date();

  return { hungerGain, happinessGain, bondGain };
};

/**
 * Instance method: Update hunger and happiness based on time passed
 */
AnimalCompanionSchema.methods.updateHungerAndHappiness = function(this: IAnimalCompanion): void {
  const now = Date.now();

  // Calculate time since last fed (in hours)
  const lastFedTime = this.lastFed ? this.lastFed.getTime() : now;
  const hoursSinceLastFed = (now - lastFedTime) / (1000 * 60 * 60);

  // Decay hunger
  const hungerDecay = Math.floor(hoursSinceLastFed * COMPANION_CONSTANTS.HUNGER_DECAY_PER_HOUR);
  this.hunger = Math.max(0, this.hunger - hungerDecay);

  // Decay happiness if not active
  if (!this.isActive) {
    const hoursSinceActive = this.lastActive
      ? (now - this.lastActive.getTime()) / (1000 * 60 * 60)
      : 0;
    const happinessDecay = Math.floor(hoursSinceActive * COMPANION_CONSTANTS.HAPPINESS_DECAY_PER_HOUR);
    this.happiness = Math.max(0, this.happiness - happinessDecay);
  }

  // Update condition
  this.condition = this.getCondition();
  this.trustLevel = this.getTrustLevel();
};

/**
 * Instance method: Gain bond points
 */
AnimalCompanionSchema.methods.gainBond = function(this: IAnimalCompanion, amount: number): void {
  this.bondLevel = Math.min(100, this.bondLevel + amount);
  this.trustLevel = this.getTrustLevel();
};

/**
 * Instance method: Lose bond points
 */
AnimalCompanionSchema.methods.loseBond = function(this: IAnimalCompanion, amount: number): void {
  this.bondLevel = Math.max(0, this.bondLevel - amount);
  this.trustLevel = this.getTrustLevel();
};

/**
 * Instance method: Take damage
 * Returns true if companion is still alive
 */
AnimalCompanionSchema.methods.takeDamage = function(this: IAnimalCompanion, amount: number): boolean {
  this.currentHealth = Math.max(0, this.currentHealth - amount);
  this.condition = this.getCondition();
  return this.currentHealth > 0;
};

/**
 * Instance method: Heal the companion
 */
AnimalCompanionSchema.methods.heal = function(this: IAnimalCompanion, amount: number): void {
  this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  this.condition = this.getCondition();
};

/**
 * Instance method: Check if companion is neglected
 */
AnimalCompanionSchema.methods.isNeglected = function(this: IAnimalCompanion): boolean {
  return this.hunger < 20 || this.happiness < 20 || this.currentHealth < this.maxHealth * 0.3;
};

/**
 * Instance method: Check if companion may leave due to neglect
 */
AnimalCompanionSchema.methods.mayLeave = function(this: IAnimalCompanion): boolean {
  if (this.bondLevel >= 80) {
    return false; // Devoted companions never leave
  }

  if (!this.isNeglected()) {
    return false;
  }

  // Check how long neglected
  const now = Date.now();
  const daysSinceLastFed = this.lastFed
    ? (now - this.lastFed.getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  return daysSinceLastFed >= COMPANION_CONSTANTS.NEGLECT_LEAVE_DAYS;
};

/**
 * Instance method: Check if companion can learn an ability
 */
AnimalCompanionSchema.methods.canLearnAbility = function(
  this: IAnimalCompanion,
  abilityId: CompanionAbilityId
): boolean {
  // Check if already has ability
  if (this.abilities.includes(abilityId)) {
    return false;
  }

  // Check if at max abilities
  if (this.abilities.length >= this.maxAbilities) {
    return false;
  }

  // Check if ability is available for this species
  const { getSpeciesDefinition } = require('../data/companionSpecies');
  const speciesDef = getSpeciesDefinition(this.species);

  if (!speciesDef || !speciesDef.availableAbilities.includes(abilityId)) {
    return false;
  }

  // Check requirements
  const { getAbilityById, canLearnAbility } = require('../data/companionAbilities');
  const ability = getAbilityById(abilityId);

  if (!ability) {
    return false;
  }

  return canLearnAbility(ability, this.loyalty, this.bondLevel);
};

/**
 * Instance method: Start training an ability
 */
AnimalCompanionSchema.methods.startTraining = function(
  this: IAnimalCompanion,
  abilityId: CompanionAbilityId
): void {
  const completesAt = new Date(Date.now() + COMPANION_CONSTANTS.TRAINING_TIME_HOURS * 60 * 60 * 1000);

  this.trainingProgress = {
    abilityId,
    progress: 0,
    startedAt: new Date(),
    completesAt
  };
};

/**
 * Instance method: Complete training and learn ability
 * Returns the learned ability ID or null if training not complete
 */
AnimalCompanionSchema.methods.completeTraining = function(this: IAnimalCompanion): CompanionAbilityId | null {
  if (!this.trainingProgress) {
    return null;
  }

  const now = new Date();
  if (now < this.trainingProgress.completesAt) {
    return null;
  }

  const learnedAbility = this.trainingProgress.abilityId;
  this.abilities.push(learnedAbility);
  this.trainingProgress = undefined;

  return learnedAbility;
};

/**
 * Instance method: Return safe companion object (no sensitive data)
 */
AnimalCompanionSchema.methods.toSafeObject = function(this: IAnimalCompanion) {
  const id = this._id.toString();

  // Convert ability cooldowns Map to plain object
  const cooldownsObj: Record<string, Date> = {};
  this.abilityCooldowns.forEach((value, key) => {
    cooldownsObj[key] = value;
  });

  return {
    id,
    _id: id,
    ownerId: this.ownerId.toString(),
    name: this.name,
    species: this.species,
    breed: this.breed,
    age: this.age,
    gender: this.gender,
    loyalty: this.loyalty,
    intelligence: this.intelligence,
    aggression: this.aggression,
    health: this.health,
    abilities: this.abilities,
    maxAbilities: this.maxAbilities,
    abilityCooldowns: cooldownsObj,
    bondLevel: this.bondLevel,
    trustLevel: this.trustLevel,
    attackPower: this.attackPower,
    defensePower: this.defensePower,
    combatRole: this.combatRole,
    trackingBonus: this.trackingBonus,
    huntingBonus: this.huntingBonus,
    guardBonus: this.guardBonus,
    socialBonus: this.socialBonus,
    currentHealth: this.currentHealth,
    maxHealth: this.maxHealth,
    hunger: this.hunger,
    happiness: this.happiness,
    condition: this.condition,
    isActive: this.isActive,
    location: this.location,
    acquiredDate: this.acquiredDate,
    acquiredMethod: this.acquiredMethod,
    kills: this.kills,
    itemsFound: this.itemsFound,
    encountersHelped: this.encountersHelped,
    trainingProgress: this.trainingProgress,
    lastFed: this.lastFed,
    lastActive: this.lastActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Static method: Find all companions for an owner
 */
AnimalCompanionSchema.statics.findByOwner = async function(
  ownerId: string
): Promise<IAnimalCompanion[]> {
  return this.find({
    ownerId: new mongoose.Types.ObjectId(ownerId)
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Find active companion for an owner
 */
AnimalCompanionSchema.statics.findActiveByOwner = async function(
  ownerId: string
): Promise<IAnimalCompanion | null> {
  return this.findOne({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    isActive: true
  });
};

/**
 * Static method: Get companion statistics for an owner
 */
AnimalCompanionSchema.statics.getOwnerStats = async function(
  ownerId: string
): Promise<any> {
  const companions = await this.find({
    ownerId: new mongoose.Types.ObjectId(ownerId)
  });

  const totalKills = companions.reduce((sum, c) => sum + c.kills, 0);
  const totalItemsFound = companions.reduce((sum, c) => sum + c.itemsFound, 0);
  const totalEncounters = companions.reduce((sum, c) => sum + c.encountersHelped, 0);

  // Find favorite species (most owned)
  const speciesCounts: Record<string, number> = {};
  companions.forEach(c => {
    speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1;
  });

  const favoriteSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const highestBond = Math.max(...companions.map(c => c.bondLevel), 0);

  return {
    totalOwnedAllTime: companions.length,
    currentCompanions: companions.length,
    totalKills,
    totalItemsFound,
    totalEncountersHelped: totalEncounters,
    favoriteSpecies,
    highestBond
  };
};

/**
 * Pre-save middleware: Update trust level and condition
 */
AnimalCompanionSchema.pre('save', function(next) {
  this.trustLevel = this.getTrustLevel();
  this.condition = this.getCondition();
  next();
});

/**
 * Animal Companion model
 */
export const AnimalCompanion = mongoose.model<IAnimalCompanion, IAnimalCompanionModel>(
  'AnimalCompanion',
  AnimalCompanionSchema
);
