/**
 * Sanity Tracker Model - Phase 10, Wave 10.2
 *
 * Mongoose schema for character sanity tracking in the Weird West system
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  SanityState,
  HallucinationType,
  HORROR_CONSTANTS
} from '@desperados/shared';

/**
 * Hallucination subdocument interface
 */
export interface IHallucination {
  type: HallucinationType;
  description: string;
  severity: number;
  startedAt: Date;
  duration: number;
  expiresAt: Date;
  effects?: {
    statsDebuff?: number;
    visionImpairment?: boolean;
    controlLoss?: boolean;
  };
}

/**
 * Trauma subdocument interface
 */
export interface ITrauma {
  id: string;
  name: string;
  description: string;
  effect: string;
  maxSanityReduction: number;
  acquiredAt: Date;
  triggeredBy: string;
}

/**
 * Sanity Tracker document interface
 */
export interface ISanityTracker extends Document {
  characterId: mongoose.Types.ObjectId;

  // Current state
  currentSanity: number;
  maxSanity: number;
  sanityState: SanityState;

  // History
  totalSanityLost: number;
  totalSanityRestored: number;
  encountersWithHorror: number;

  // Effects
  activeHallucinations: IHallucination[];
  permanentTraumas: ITrauma[];

  // Resistance
  horrorResistance: number;

  // Timestamps
  lastSanityDrain: Date;
  lastRestoration: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  loseSanity(amount: number, source: string): Promise<{ newSanity: number; traumaGained: boolean }>;
  restoreSanity(amount: number): Promise<number>;
  getSanityState(): SanityState;
  rollForHallucination(): IHallucination | null;
  addTrauma(trauma: ITrauma): Promise<void>;
  removeExpiredHallucinations(): void;
  getSanityCombatPenalty(): number;
  buildResistance(amount: number): void;
  canEncounterHorror(): boolean;
}

/**
 * Sanity Tracker static methods interface
 */
export interface ISanityTrackerModel extends Model<ISanityTracker> {
  findByCharacterId(characterId: string): Promise<ISanityTracker | null>;
  createForCharacter(characterId: string): Promise<ISanityTracker>;
}

/**
 * Hallucination schema
 */
const HallucinationSchema = new Schema<IHallucination>({
  type: {
    type: String,
    required: true,
    enum: Object.values(HallucinationType)
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  effects: {
    statsDebuff: { type: Number },
    visionImpairment: { type: Boolean },
    controlLoss: { type: Boolean }
  }
}, { _id: false });

/**
 * Trauma schema
 */
const TraumaSchema = new Schema<ITrauma>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  effect: {
    type: String,
    required: true
  },
  maxSanityReduction: {
    type: Number,
    required: true
  },
  acquiredAt: {
    type: Date,
    default: Date.now
  },
  triggeredBy: {
    type: String,
    required: true
  }
}, { _id: false });

/**
 * Sanity Tracker schema definition
 */
const SanityTrackerSchema = new Schema<ISanityTracker>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },

    // Current state
    currentSanity: {
      type: Number,
      required: true,
      min: 0,
      max: HORROR_CONSTANTS.SANITY_MAX,
      default: HORROR_CONSTANTS.SANITY_MAX
    },
    maxSanity: {
      type: Number,
      required: true,
      min: 0,
      max: HORROR_CONSTANTS.SANITY_MAX,
      default: HORROR_CONSTANTS.SANITY_MAX
    },
    sanityState: {
      type: String,
      required: true,
      enum: Object.values(SanityState),
      default: SanityState.STABLE
    },

    // History
    totalSanityLost: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSanityRestored: {
      type: Number,
      default: 0,
      min: 0
    },
    encountersWithHorror: {
      type: Number,
      default: 0,
      min: 0
    },

    // Effects
    activeHallucinations: {
      type: [HallucinationSchema],
      default: []
    },
    permanentTraumas: {
      type: [TraumaSchema],
      default: []
    },

    // Resistance
    horrorResistance: {
      type: Number,
      default: 0,
      min: 0,
      max: HORROR_CONSTANTS.MAX_HORROR_RESISTANCE
    },

    // Timestamps
    lastSanityDrain: {
      type: Date,
      default: Date.now
    },
    lastRestoration: {
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
SanityTrackerSchema.index({ characterId: 1 });
SanityTrackerSchema.index({ sanityState: 1 });
SanityTrackerSchema.index({ currentSanity: 1 });

/**
 * Instance method: Lose sanity
 */
SanityTrackerSchema.methods.loseSanity = async function(
  this: ISanityTracker,
  amount: number,
  source: string
): Promise<{ newSanity: number; traumaGained: boolean }> {
  // Apply horror resistance
  const resistanceMultiplier = 1 - (this.horrorResistance / 100);
  const actualLoss = Math.floor(amount * resistanceMultiplier);

  // Deduct sanity
  this.currentSanity = Math.max(0, this.currentSanity - actualLoss);
  this.totalSanityLost += actualLoss;
  this.lastSanityDrain = new Date();

  // Update sanity state
  this.sanityState = this.getSanityState();

  // Check for trauma
  let traumaGained = false;
  if (this.currentSanity <= HORROR_CONSTANTS.TRAUMA_SANITY_THRESHOLD) {
    if (this.permanentTraumas.length < HORROR_CONSTANTS.MAX_TRAUMAS) {
      // Random chance of gaining trauma when very low sanity
      if (Math.random() < 0.3) {
        traumaGained = true;
        // Trauma would be added separately by the calling service
      }
    }
  }

  await this.save();

  return {
    newSanity: this.currentSanity,
    traumaGained
  };
};

/**
 * Instance method: Restore sanity
 */
SanityTrackerSchema.methods.restoreSanity = async function(
  this: ISanityTracker,
  amount: number
): Promise<number> {
  const previousSanity = this.currentSanity;
  this.currentSanity = Math.min(this.maxSanity, this.currentSanity + amount);
  const actualRestore = this.currentSanity - previousSanity;

  this.totalSanityRestored += actualRestore;
  this.lastRestoration = new Date();

  // Update sanity state
  this.sanityState = this.getSanityState();

  // Remove some hallucinations if sanity is restored significantly
  if (actualRestore >= 20) {
    this.activeHallucinations = this.activeHallucinations.filter(h => h.severity > 5);
  }

  await this.save();

  return this.currentSanity;
};

/**
 * Instance method: Get current sanity state
 */
SanityTrackerSchema.methods.getSanityState = function(this: ISanityTracker): SanityState {
  if (this.currentSanity >= HORROR_CONSTANTS.SANITY_STABLE_MIN) {
    return SanityState.STABLE;
  } else if (this.currentSanity >= HORROR_CONSTANTS.SANITY_RATTLED_MIN) {
    return SanityState.RATTLED;
  } else if (this.currentSanity >= HORROR_CONSTANTS.SANITY_SHAKEN_MIN) {
    return SanityState.SHAKEN;
  } else if (this.currentSanity >= HORROR_CONSTANTS.SANITY_BREAKING_MIN) {
    return SanityState.BREAKING;
  } else {
    return SanityState.SHATTERED;
  }
};

/**
 * Instance method: Roll for hallucination
 */
SanityTrackerSchema.methods.rollForHallucination = function(this: ISanityTracker): IHallucination | null {
  const chance = HORROR_CONSTANTS.HALLUCINATION_CHANCE[this.sanityState];
  if (Math.random() > chance) {
    return null;
  }

  // Generate random hallucination
  const types = Object.values(HallucinationType);
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = Math.max(1, Math.ceil((100 - this.currentSanity) / 10));
  const duration = 5 + severity * 2; // Minutes

  const descriptions: Record<HallucinationType, string[]> = {
    [HallucinationType.VISUAL]: [
      'Shadows move in the corners of your vision',
      'You see faces in the darkness that vanish when you look directly',
      'The walls seem to breathe and pulse',
      'Dark figures follow you just out of sight'
    ],
    [HallucinationType.AUDITORY]: [
      'Whispers in a language you don\'t understand',
      'Screaming from far away, getting closer',
      'Your name being called by someone who isn\'t there',
      'Scratching sounds inside the walls'
    ],
    [HallucinationType.PARANOIA]: [
      'Everyone is watching you, plotting against you',
      'Something is following you, getting closer',
      'They all know what you did',
      'The walls are closing in, there\'s no escape'
    ],
    [HallucinationType.DREAD]: [
      'Overwhelming sense that something terrible is about to happen',
      'Certainty that you\'re going to die here',
      'Crushing weight of cosmic insignificance',
      'Everything is wrong, reality is breaking'
    ],
    [HallucinationType.CONFUSION]: [
      'You can\'t remember where you are or why',
      'Time skips forward and backward randomly',
      'Left and right keep switching',
      'You forget how to speak for minutes at a time'
    ]
  };

  const possibleDescriptions = descriptions[type];
  const description = possibleDescriptions[Math.floor(Math.random() * possibleDescriptions.length)];

  const expiresAt = new Date(Date.now() + duration * 60 * 1000);

  const hallucination: IHallucination = {
    type,
    description,
    severity,
    startedAt: new Date(),
    duration,
    expiresAt,
    effects: {
      statsDebuff: severity * 2,
      visionImpairment: type === HallucinationType.VISUAL && severity >= 5,
      controlLoss: type === HallucinationType.CONFUSION && severity >= 7
    }
  };

  return hallucination;
};

/**
 * Instance method: Add permanent trauma
 */
SanityTrackerSchema.methods.addTrauma = async function(
  this: ISanityTracker,
  trauma: ITrauma
): Promise<void> {
  if (this.permanentTraumas.length >= HORROR_CONSTANTS.MAX_TRAUMAS) {
    throw new Error('Cannot have more than 5 permanent traumas');
  }

  this.permanentTraumas.push(trauma);
  this.maxSanity = Math.max(50, this.maxSanity - trauma.maxSanityReduction);

  // Current sanity can't exceed new max
  if (this.currentSanity > this.maxSanity) {
    this.currentSanity = this.maxSanity;
  }

  await this.save();
};

/**
 * Instance method: Remove expired hallucinations
 */
SanityTrackerSchema.methods.removeExpiredHallucinations = function(this: ISanityTracker): void {
  const now = new Date();
  this.activeHallucinations = this.activeHallucinations.filter(h => h.expiresAt > now);
};

/**
 * Instance method: Get combat penalty from sanity
 */
SanityTrackerSchema.methods.getSanityCombatPenalty = function(this: ISanityTracker): number {
  return HORROR_CONSTANTS.SANITY_COMBAT_PENALTY[this.sanityState];
};

/**
 * Instance method: Build horror resistance
 */
SanityTrackerSchema.methods.buildResistance = function(this: ISanityTracker, amount: number): void {
  this.horrorResistance = Math.min(
    HORROR_CONSTANTS.MAX_HORROR_RESISTANCE,
    this.horrorResistance + amount
  );
};

/**
 * Instance method: Check if can encounter horror
 */
SanityTrackerSchema.methods.canEncounterHorror = function(this: ISanityTracker): boolean {
  // Cannot encounter horror if sanity is too low
  return this.currentSanity >= 10;
};

/**
 * Static method: Find sanity tracker by character ID
 */
SanityTrackerSchema.statics.findByCharacterId = async function(
  characterId: string
): Promise<ISanityTracker | null> {
  return this.findOne({ characterId: new mongoose.Types.ObjectId(characterId) });
};

/**
 * Static method: Create sanity tracker for character
 */
SanityTrackerSchema.statics.createForCharacter = async function(
  characterId: string
): Promise<ISanityTracker> {
  // Check if already exists
  const existing = await (this as any).findByCharacterId(characterId);
  if (existing) {
    return existing;
  }

  const tracker = new this({
    characterId: new mongoose.Types.ObjectId(characterId),
    currentSanity: HORROR_CONSTANTS.SANITY_MAX,
    maxSanity: HORROR_CONSTANTS.SANITY_MAX,
    sanityState: SanityState.STABLE,
    totalSanityLost: 0,
    totalSanityRestored: 0,
    encountersWithHorror: 0,
    activeHallucinations: [],
    permanentTraumas: [],
    horrorResistance: 0
  });

  await tracker.save();
  return tracker;
};

/**
 * Sanity Tracker model
 */
export const SanityTracker = mongoose.model<ISanityTracker, ISanityTrackerModel>(
  'SanityTracker',
  SanityTrackerSchema
);

/**
 * Predefined traumas that can be acquired
 */
export const TRAUMA_DEFINITIONS: ITrauma[] = [
  {
    id: 'cosmic_horror',
    name: 'Glimpse Beyond the Veil',
    description: 'You have seen things that should not exist. Reality will never feel solid again.',
    effect: 'Reduced max sanity, occasional hallucinations',
    maxSanityReduction: 10,
    acquiredAt: new Date(),
    triggeredBy: 'lovecraftian'
  },
  {
    id: 'spectral_terror',
    name: 'Haunted',
    description: 'The dead do not rest. They watch you. Always watching.',
    effect: 'Increased sanity drain from undead, cold sensitivity',
    maxSanityReduction: 8,
    acquiredAt: new Date(),
    triggeredBy: 'undead'
  },
  {
    id: 'predator_fear',
    name: 'Marked Prey',
    description: 'You know what it\'s like to be hunted by something superior. The fear never leaves.',
    effect: 'Reduced combat effectiveness, enhanced flight response',
    maxSanityReduction: 7,
    acquiredAt: new Date(),
    triggeredBy: 'cryptid'
  },
  {
    id: 'divine_terror',
    name: 'Witnessed the Divine',
    description: 'You stood before a god and survived. But you are forever changed.',
    effect: 'Sanity no longer regens naturally, must use rituals',
    maxSanityReduction: 12,
    acquiredAt: new Date(),
    triggeredBy: 'spirit'
  },
  {
    id: 'shattered_mind',
    name: 'Broken',
    description: 'Your mind cracked under the weight of cosmic truth. Pieces are missing.',
    effect: 'Severe max sanity reduction, frequent confusion',
    maxSanityReduction: 15,
    acquiredAt: new Date(),
    triggeredBy: 'boss'
  }
];
