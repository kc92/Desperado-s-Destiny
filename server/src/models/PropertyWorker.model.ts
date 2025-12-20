/**
 * Property Worker Model
 *
 * Tracks hired workers for properties
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { WorkerSpecialization, WorkerTrait } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Property Worker document interface
 */
export interface IPropertyWorker extends Document {
  // Ownership
  workerId: string;
  propertyId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;

  // Identity
  name: string;
  specialization: WorkerSpecialization;

  // Stats
  skillLevel: number; // 1-100
  loyalty: number; // 0-100
  efficiency: number; // 0.5 - 2.0 multiplier
  morale: number; // 0-100

  // Employment
  weeklyWage: number;
  hiredDate: Date;
  lastPaidDate: Date;

  // Assignment
  isAssigned: boolean;
  assignedSlotId?: string;
  currentOrderId?: string;

  // Experience
  experience: number;
  productionsCompleted: number;

  // Traits
  traits: WorkerTrait[];

  // Status
  isSick: boolean;
  sickUntil?: Date;
  isOnStrike: boolean;
  strikeReason?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  isAvailable(): boolean;
  canWork(): boolean;
  addExperience(amount: number): void;
  levelUp(): void;
  calculateEfficiency(): number;
  calculateProductionBonus(bonusType: 'speed' | 'yield' | 'quality'): number;
  updateMorale(change: number): void;
  payWage(): number;
  isWageDue(): boolean;
  getTraitBonus(effectType: string): number;
}

/**
 * Property Worker static methods interface
 */
export interface IPropertyWorkerModel extends Model<IPropertyWorker> {
  findByProperty(propertyId: string): Promise<IPropertyWorker[]>;
  findByCharacter(characterId: string): Promise<IPropertyWorker[]>;
  findAvailableWorkers(propertyId: string): Promise<IPropertyWorker[]>;
  findBySpecialization(
    propertyId: string,
    specialization: WorkerSpecialization
  ): Promise<IPropertyWorker[]>;
}

/**
 * Worker Trait sub-schema
 */
const WorkerTraitSchema = new Schema({
  traitId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  effects: [
    {
      type: {
        type: String,
        enum: ['speed', 'quality', 'yield', 'loyalty', 'morale', 'wage'],
        required: true,
      },
      value: { type: Number, required: true },
    },
  ],
});

/**
 * Property Worker schema definition
 */
const PropertyWorkerSchema = new Schema<IPropertyWorker>(
  {
    // Ownership
    workerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },

    // Identity
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    specialization: {
      type: String,
      required: true,
      enum: Object.values(WorkerSpecialization),
    },

    // Stats
    skillLevel: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 100,
    },
    loyalty: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
      max: 100,
    },
    efficiency: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    morale: {
      type: Number,
      required: true,
      default: 75,
      min: 0,
      max: 100,
    },

    // Employment
    weeklyWage: {
      type: Number,
      required: true,
      min: 1,
    },
    hiredDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastPaidDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Assignment
    isAssigned: {
      type: Boolean,
      default: false,
    },
    assignedSlotId: {
      type: String,
    },
    currentOrderId: {
      type: String,
    },

    // Experience
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    productionsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Traits
    traits: {
      type: [WorkerTraitSchema],
      default: [],
    },

    // Status
    isSick: {
      type: Boolean,
      default: false,
    },
    sickUntil: {
      type: Date,
    },
    isOnStrike: {
      type: Boolean,
      default: false,
    },
    strikeReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
PropertyWorkerSchema.index({ propertyId: 1, isAssigned: 1 });
PropertyWorkerSchema.index({ characterId: 1, specialization: 1 });
PropertyWorkerSchema.index({ lastPaidDate: 1 });

/**
 * Instance method: Check if worker is available for assignment
 */
PropertyWorkerSchema.methods.isAvailable = function (this: IPropertyWorker): boolean {
  return !this.isAssigned && this.canWork();
};

/**
 * Instance method: Check if worker can work
 */
PropertyWorkerSchema.methods.canWork = function (this: IPropertyWorker): boolean {
  // Check if sick
  if (this.isSick && this.sickUntil && new Date() < this.sickUntil) {
    return false;
  }

  // Check if on strike
  if (this.isOnStrike) {
    return false;
  }

  // Check morale (workers won't work if morale is too low)
  if (this.morale < 20) {
    return false;
  }

  return true;
};

/**
 * Instance method: Add experience and handle level ups
 */
PropertyWorkerSchema.methods.addExperience = function (
  this: IPropertyWorker,
  amount: number
): void {
  this.experience += amount;
  this.productionsCompleted++;

  // Check for level up (every 100 XP)
  const levelsGained = Math.floor(this.experience / 100);
  if (levelsGained > 0 && this.skillLevel < 100) {
    const newLevel = Math.min(100, this.skillLevel + levelsGained);
    if (newLevel > this.skillLevel) {
      this.levelUp();
      this.skillLevel = newLevel;
      this.experience = this.experience % 100;
    }
  }
};

/**
 * Instance method: Level up worker
 */
PropertyWorkerSchema.methods.levelUp = function (this: IPropertyWorker): void {
  // Increase efficiency slightly
  this.efficiency = Math.min(2.0, this.efficiency + 0.05);

  // Increase loyalty
  this.loyalty = Math.min(100, this.loyalty + 2);

  // Boost morale
  this.morale = Math.min(100, this.morale + 5);
};

/**
 * Instance method: Calculate overall efficiency
 */
PropertyWorkerSchema.methods.calculateEfficiency = function (
  this: IPropertyWorker
): number {
  let totalEfficiency = this.efficiency;

  // Morale affects efficiency
  const moraleFactor = this.morale / 100;
  totalEfficiency *= moraleFactor;

  // Skill level affects efficiency
  const skillFactor = 0.5 + (this.skillLevel / 100) * 0.5; // 0.5 to 1.0
  totalEfficiency *= skillFactor;

  // Apply trait bonuses
  totalEfficiency += this.getTraitBonus('efficiency');

  return Math.max(0.1, Math.min(2.5, totalEfficiency));
};

/**
 * Instance method: Calculate production bonus
 */
PropertyWorkerSchema.methods.calculateProductionBonus = function (
  this: IPropertyWorker,
  bonusType: 'speed' | 'yield' | 'quality'
): number {
  let bonus = 0;

  // Base bonus from skill level
  switch (bonusType) {
    case 'speed':
      bonus = (this.skillLevel / 100) * 0.3; // Up to 30% speed bonus
      bonus += this.getTraitBonus('speed');
      break;
    case 'yield':
      bonus = (this.skillLevel / 100) * 0.25; // Up to 25% yield bonus
      bonus += this.getTraitBonus('yield');
      break;
    case 'quality':
      bonus = (this.skillLevel / 100) * 0.2; // Up to 20% quality bonus
      bonus += this.getTraitBonus('quality');
      break;
  }

  // Efficiency affects bonuses
  const efficiency = this.calculateEfficiency();
  bonus *= efficiency;

  return Math.max(0, bonus);
};

/**
 * Instance method: Update worker morale
 */
PropertyWorkerSchema.methods.updateMorale = function (
  this: IPropertyWorker,
  change: number
): void {
  this.morale = Math.max(0, Math.min(100, this.morale + change));

  // Very low morale may trigger strike
  if (this.morale < 10 && !this.isOnStrike) {
    if (SecureRNG.chance(0.5)) {
      this.isOnStrike = true;
      this.strikeReason = 'Low morale - worker demands better conditions';
    }
  }

  // High morale clears strike
  if (this.morale > 60 && this.isOnStrike) {
    this.isOnStrike = false;
    this.strikeReason = undefined;
  }
};

/**
 * Instance method: Pay worker wage
 */
PropertyWorkerSchema.methods.payWage = function (this: IPropertyWorker): number {
  this.lastPaidDate = new Date();

  // Paying wage boosts morale
  this.updateMorale(5);

  // Increase loyalty slightly
  this.loyalty = Math.min(100, this.loyalty + 1);

  return this.weeklyWage;
};

/**
 * Instance method: Check if wage payment is due
 */
PropertyWorkerSchema.methods.isWageDue = function (this: IPropertyWorker): boolean {
  const now = new Date();
  const daysSincePayment =
    (now.getTime() - this.lastPaidDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSincePayment >= 7;
};

/**
 * Instance method: Get total bonus from traits for a specific effect type
 */
PropertyWorkerSchema.methods.getTraitBonus = function (
  this: IPropertyWorker,
  effectType: string
): number {
  let totalBonus = 0;

  for (const trait of this.traits) {
    for (const effect of trait.effects) {
      if (effect.type === effectType) {
        totalBonus += effect.value;
      }
    }
  }

  return totalBonus;
};

/**
 * Static method: Find all workers for a property
 */
PropertyWorkerSchema.statics.findByProperty = async function (
  propertyId: string
): Promise<IPropertyWorker[]> {
  return this.find({
    propertyId: new mongoose.Types.ObjectId(propertyId),
  }).sort({ skillLevel: -1 });
};

/**
 * Static method: Find all workers for a character
 */
PropertyWorkerSchema.statics.findByCharacter = async function (
  characterId: string
): Promise<IPropertyWorker[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
  }).sort({ propertyId: 1, skillLevel: -1 });
};

/**
 * Static method: Find available workers for a property
 */
PropertyWorkerSchema.statics.findAvailableWorkers = async function (
  propertyId: string
): Promise<IPropertyWorker[]> {
  const workers = await this.find({
    propertyId: new mongoose.Types.ObjectId(propertyId),
    isAssigned: false,
  });

  // Filter for workers that can actually work
  return workers.filter((worker) => worker.canWork());
};

/**
 * Static method: Find workers by specialization
 */
PropertyWorkerSchema.statics.findBySpecialization = async function (
  propertyId: string,
  specialization: WorkerSpecialization
): Promise<IPropertyWorker[]> {
  return this.find({
    propertyId: new mongoose.Types.ObjectId(propertyId),
    specialization,
  }).sort({ skillLevel: -1 });
};

/**
 * Property Worker model
 */
export const PropertyWorker = mongoose.model<IPropertyWorker, IPropertyWorkerModel>(
  'PropertyWorker',
  PropertyWorkerSchema
);
