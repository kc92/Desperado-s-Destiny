import { Schema, model, Document } from 'mongoose';
import {
  Horse as IHorse,
  HorseBreed,
  HorseGender,
  HorseColor,
  HorseCondition,
  HorseSkill
} from '@desperados/shared';

// ============================================================================
// MONGOOSE DOCUMENT INTERFACE
// ============================================================================

export interface HorseDocument extends Document {
  _id: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  name: string;
  breed: HorseBreed;
  gender: HorseGender;
  age: number;
  color: HorseColor;

  stats: {
    speed: number;
    stamina: number;
    health: number;
    bravery: number;
    temperament: number;
  };

  derivedStats: {
    carryCapacity: number;
    travelSpeedBonus: number;
    combatBonus: number;
  };

  bond: {
    level: number;
    trust: number;
    loyalty: boolean;
    lastInteraction: Date;
  };

  training: {
    trainedSkills: HorseSkill[];
    maxSkills: number;
    trainingProgress: Map<HorseSkill, number>;
  };

  equipment: {
    saddle?: Schema.Types.ObjectId;
    saddlebags?: Schema.Types.ObjectId;
    horseshoes?: Schema.Types.ObjectId;
    barding?: Schema.Types.ObjectId;
  };

  condition: {
    currentHealth: number;
    currentStamina: number;
    hunger: number;
    cleanliness: number;
    mood: HorseCondition;
  };

  breeding?: {
    birthDate?: Date;
    sire?: Schema.Types.ObjectId;
    dam?: Schema.Types.ObjectId;
    foals: Schema.Types.ObjectId[];
    isPregnant?: boolean;
    pregnantBy?: Schema.Types.ObjectId;
    dueDate?: Date;
    breedingCooldown?: Date;
  };

  history: {
    purchasePrice: number;
    purchaseDate: Date;
    acquisitionMethod: 'purchase' | 'tame' | 'breed' | 'gift' | 'steal';
    racesWon: number;
    racesEntered: number;
    combatVictories: number;
    combatsEntered: number;
    distanceTraveled: number;
  };

  currentLocation: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateCondition(): void;
  feed(hungerRestored: number, bondBonus: number): void;
  groom(): void;
  train(skill: HorseSkill, progress: number): void;
  rest(hours: number): void;
  incrementAge(): void;

  // Virtuals
  bondLevelName: string;
  needsCare: string[];
  canBreed: boolean;
}

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

const HorseSchema = new Schema<HorseDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30
    },

    breed: {
      type: String,
      enum: Object.values(HorseBreed),
      required: true
    },

    gender: {
      type: String,
      enum: Object.values(HorseGender),
      required: true
    },

    age: {
      type: Number,
      required: true,
      min: 2,
      max: 25,
      default: 5
    },

    color: {
      type: String,
      enum: Object.values(HorseColor),
      required: true
    },

    // Core Stats
    stats: {
      speed: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      },
      stamina: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      },
      health: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      },
      bravery: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      },
      temperament: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      }
    },

    // Derived Stats
    derivedStats: {
      carryCapacity: {
        type: Number,
        required: true,
        default: 50
      },
      travelSpeedBonus: {
        type: Number,
        required: true,
        default: 0
      },
      combatBonus: {
        type: Number,
        required: true,
        default: 0
      }
    },

    // Bond System
    bond: {
      level: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
      },
      trust: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 50
      },
      loyalty: {
        type: Boolean,
        default: false
      },
      lastInteraction: {
        type: Date,
        default: Date.now
      }
    },

    // Training
    training: {
      trainedSkills: {
        type: [String],
        enum: Object.values(HorseSkill),
        default: []
      },
      maxSkills: {
        type: Number,
        required: true,
        min: 3,
        max: 8,
        default: 4
      },
      trainingProgress: {
        type: Map,
        of: Number,
        default: new Map()
      }
    },

    // Equipment
    equipment: {
      saddle: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        default: undefined
      },
      saddlebags: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        default: undefined
      },
      horseshoes: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        default: undefined
      },
      barding: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        default: undefined
      }
    },

    // Condition
    condition: {
      currentHealth: {
        type: Number,
        required: true,
        min: 0
      },
      currentStamina: {
        type: Number,
        required: true,
        min: 0
      },
      hunger: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 100
      },
      cleanliness: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 100
      },
      mood: {
        type: String,
        enum: Object.values(HorseCondition),
        default: HorseCondition.GOOD
      }
    },

    // Breeding
    breeding: {
      birthDate: {
        type: Date,
        default: undefined
      },
      sire: {
        type: Schema.Types.ObjectId,
        ref: 'Horse',
        default: undefined
      },
      dam: {
        type: Schema.Types.ObjectId,
        ref: 'Horse',
        default: undefined
      },
      foals: {
        type: [Schema.Types.ObjectId],
        ref: 'Horse',
        default: []
      },
      isPregnant: {
        type: Boolean,
        default: false
      },
      pregnantBy: {
        type: Schema.Types.ObjectId,
        ref: 'Horse',
        default: undefined
      },
      dueDate: {
        type: Date,
        default: undefined
      },
      breedingCooldown: {
        type: Date,
        default: undefined
      }
    },

    // History
    history: {
      purchasePrice: {
        type: Number,
        required: true,
        min: 0
      },
      purchaseDate: {
        type: Date,
        required: true,
        default: Date.now
      },
      acquisitionMethod: {
        type: String,
        enum: ['purchase', 'tame', 'breed', 'gift', 'steal'],
        required: true,
        default: 'purchase'
      },
      racesWon: {
        type: Number,
        default: 0,
        min: 0
      },
      racesEntered: {
        type: Number,
        default: 0,
        min: 0
      },
      combatVictories: {
        type: Number,
        default: 0,
        min: 0
      },
      combatsEntered: {
        type: Number,
        default: 0,
        min: 0
      },
      distanceTraveled: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    // Location
    currentLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },

    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// ============================================================================
// INDEXES
// ============================================================================

HorseSchema.index({ ownerId: 1, isActive: 1 });
HorseSchema.index({ breed: 1, gender: 1 });
HorseSchema.index({ 'bond.level': 1 });
HorseSchema.index({ 'breeding.isPregnant': 1, 'breeding.dueDate': 1 });

// ============================================================================
// VIRTUALS
// ============================================================================

HorseSchema.virtual('effectiveStats').get(function (this: HorseDocument) {
  // Calculate final stats including equipment bonuses
  const base = this.stats;
  const equipment = this.equipment;

  // This is a simplified calculation - full implementation would
  // look up equipment items and apply their bonuses
  return {
    speed: base.speed + this.derivedStats.travelSpeedBonus,
    stamina: base.stamina,
    health: base.health,
    bravery: base.bravery,
    temperament: base.temperament
  };
});

HorseSchema.virtual('bondLevelName').get(function (this: HorseDocument) {
  const level = this.bond.level;
  if (level <= 20) return 'STRANGER';
  if (level <= 40) return 'ACQUAINTANCE';
  if (level <= 60) return 'PARTNER';
  if (level <= 80) return 'COMPANION';
  return 'BONDED';
});

HorseSchema.virtual('needsCare').get(function (this: HorseDocument) {
  const needs: string[] = [];

  if (this.condition.hunger < 30) {
    needs.push('Needs feeding');
  }
  if (this.condition.cleanliness < 40) {
    needs.push('Needs grooming');
  }
  if (this.condition.currentHealth < this.stats.health * 0.5) {
    needs.push('Needs veterinary care');
  }
  if (this.condition.currentStamina < this.stats.stamina * 0.3) {
    needs.push('Needs rest');
  }

  return needs;
});

HorseSchema.virtual('canBreed').get(function (this: HorseDocument) {
  if (this.gender === HorseGender.GELDING) return false;
  if (this.age < 3 || this.age > 20) return false;
  if (this.breeding?.isPregnant) return false;
  if (this.breeding?.breedingCooldown && this.breeding.breedingCooldown > new Date()) {
    return false;
  }
  return true;
});

// ============================================================================
// METHODS
// ============================================================================

HorseSchema.methods.updateCondition = function (this: HorseDocument) {
  // Natural degradation over time
  const hoursSinceLastInteraction =
    (Date.now() - this.bond.lastInteraction.getTime()) / (1000 * 60 * 60);

  // Hunger decreases over time
  this.condition.hunger = Math.max(0, this.condition.hunger - hoursSinceLastInteraction * 2);

  // Cleanliness decreases over time
  this.condition.cleanliness = Math.max(0, this.condition.cleanliness - hoursSinceLastInteraction);

  // Stamina recovers when resting
  if (!this.isActive) {
    this.condition.currentStamina = Math.min(
      this.stats.stamina,
      this.condition.currentStamina + hoursSinceLastInteraction * 5
    );
  }

  // Update mood based on overall condition
  const avgCondition = (
    this.condition.hunger +
    this.condition.cleanliness +
    (this.condition.currentHealth / this.stats.health * 100)
  ) / 3;

  if (avgCondition >= 80) this.condition.mood = HorseCondition.EXCELLENT;
  else if (avgCondition >= 60) this.condition.mood = HorseCondition.GOOD;
  else if (avgCondition >= 40) this.condition.mood = HorseCondition.FAIR;
  else if (avgCondition >= 20) this.condition.mood = HorseCondition.POOR;
  else this.condition.mood = HorseCondition.INJURED;
};

HorseSchema.methods.feed = function (
  this: HorseDocument,
  hungerRestored: number,
  bondBonus: number
) {
  this.condition.hunger = Math.min(100, this.condition.hunger + hungerRestored);
  this.bond.level = Math.min(100, this.bond.level + bondBonus);
  this.bond.lastInteraction = new Date();
};

HorseSchema.methods.groom = function (this: HorseDocument) {
  this.condition.cleanliness = 100;
  this.bond.level = Math.min(100, this.bond.level + 5);
  this.bond.trust = Math.min(100, this.bond.trust + 2);
  this.bond.lastInteraction = new Date();
};

HorseSchema.methods.train = function (this: HorseDocument, skill: HorseSkill, progress: number) {
  const currentProgress = this.training.trainingProgress.get(skill) || 0;
  const newProgress = Math.min(100, currentProgress + progress);

  this.training.trainingProgress.set(skill, newProgress);

  if (newProgress >= 100 && !this.training.trainedSkills.includes(skill)) {
    if (this.training.trainedSkills.length < this.training.maxSkills) {
      this.training.trainedSkills.push(skill);
      this.training.trainingProgress.delete(skill);
    }
  }

  this.bond.level = Math.min(100, this.bond.level + 3);
  this.bond.lastInteraction = new Date();
};

HorseSchema.methods.rest = function (this: HorseDocument, hours: number) {
  this.condition.currentStamina = Math.min(
    this.stats.stamina,
    this.condition.currentStamina + hours * 5
  );
};

HorseSchema.methods.incrementAge = function (this: HorseDocument) {
  this.age += 1;

  // Stats decline after age 15
  if (this.age > 15) {
    const decline = (this.age - 15) * 2;
    this.stats.speed = Math.max(20, this.stats.speed - decline);
    this.stats.stamina = Math.max(20, this.stats.stamina - decline);
  }
};

// ============================================================================
// STATICS
// ============================================================================

HorseSchema.statics.findByOwner = function (ownerId: Schema.Types.ObjectId) {
  return this.find({ ownerId }).sort({ isActive: -1, 'bond.level': -1 });
};

HorseSchema.statics.findActiveHorse = function (ownerId: Schema.Types.ObjectId) {
  return this.findOne({ ownerId, isActive: true });
};

HorseSchema.statics.findBreedingCandidates = function (
  ownerId: Schema.Types.ObjectId,
  gender: HorseGender
) {
  return this.find({
    ownerId,
    gender,
    age: { $gte: 3, $lte: 20 },
    'breeding.isPregnant': { $ne: true },
    $or: [
      { 'breeding.breedingCooldown': { $exists: false } },
      { 'breeding.breedingCooldown': { $lte: new Date() } }
    ]
  });
};

// ============================================================================
// EXPORT
// ============================================================================

export const Horse = model<HorseDocument>('Horse', HorseSchema);
