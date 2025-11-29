/**
 * Boss Encounter Model - Phase 14, Wave 14.2
 *
 * Mongoose schema for tracking active and completed boss encounters
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  BossCategory,
  BossTier,
  StatusEffect,
  BossCombatRound,
  BossEncounterResult,
} from '@desperados/shared';

/**
 * Player state within boss encounter
 */
export interface IPlayerState {
  characterId: mongoose.Types.ObjectId;
  health: number;
  maxHealth: number;
  statusEffects: Array<{
    type: StatusEffect;
    duration: number;
    power: number;
    appliedAt: Date;
  }>;
  damageDealt: number;
  damageTaken: number;
  isAlive: boolean;
}

/**
 * Minion in boss fight
 */
export interface IMinion {
  id: string;
  type: string;
  health: number;
  maxHealth: number;
}

/**
 * Boss Encounter document interface
 */
export interface IBossEncounter extends Document {
  // Basic info
  bossId: string;
  sessionId: string;

  // Participants
  characterIds: mongoose.Types.ObjectId[];
  playerStates: Map<string, IPlayerState>;

  // Boss state
  currentPhase: number;
  bossHealth: number;
  bossMaxHealth: number;

  // Combat tracking
  turnCount: number;
  roundHistory: BossCombatRound[];

  // Ability tracking
  abilityCooldowns: Map<string, number>;

  // Minions
  minions: IMinion[];

  // Environment
  location: string;

  // Status
  status: 'active' | 'victory' | 'defeat' | 'fled' | 'timeout';
  outcome?: string; // Stores BossEncounterResult as JSON

  // Timing
  startedAt: Date;
  enrageAt?: Date;
  endedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Boss Encounter static methods interface
 */
export interface IBossEncounterModel extends Model<IBossEncounter> {
  findActiveByCharacter(characterId: string): Promise<IBossEncounter | null>;
  findActiveByBoss(bossId: string): Promise<IBossEncounter[]>;
  findCompletedByCharacter(
    characterId: string,
    limit?: number
  ): Promise<IBossEncounter[]>;
  findHistoryForBoss(
    bossId: string,
    limit?: number
  ): Promise<IBossEncounter[]>;
}

/**
 * Player state subdocument schema
 */
const PlayerStateSchema = new Schema({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
  },
  health: { type: Number, required: true, min: 0 },
  maxHealth: { type: Number, required: true, min: 1 },
  statusEffects: [{
    type: { type: String, enum: Object.values(StatusEffect), required: true },
    duration: { type: Number, required: true },
    power: { type: Number, required: true },
    appliedAt: { type: Date, default: Date.now },
  }],
  damageDealt: { type: Number, default: 0 },
  damageTaken: { type: Number, default: 0 },
  isAlive: { type: Boolean, default: true },
}, { _id: false });

/**
 * Minion subdocument schema
 */
const MinionSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  health: { type: Number, required: true, min: 0 },
  maxHealth: { type: Number, required: true, min: 1 },
}, { _id: false });

/**
 * Boss Encounter schema definition
 */
const BossEncounterSchema = new Schema<IBossEncounter>(
  {
    bossId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    characterIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    }],

    playerStates: {
      type: Map,
      of: PlayerStateSchema,
      default: new Map(),
    },

    currentPhase: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    bossHealth: {
      type: Number,
      required: true,
      min: 0,
    },

    bossMaxHealth: {
      type: Number,
      required: true,
      min: 1,
    },

    turnCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    roundHistory: {
      type: Schema.Types.Mixed,
      default: [],
    },

    abilityCooldowns: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    minions: {
      type: [MinionSchema],
      default: [],
    },

    location: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ['active', 'victory', 'defeat', 'fled', 'timeout'],
      default: 'active',
      index: true,
    },

    outcome: {
      type: String, // JSON string of BossEncounterResult
      required: false,
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    enrageAt: {
      type: Date,
      required: false,
    },

    endedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
BossEncounterSchema.index({ characterIds: 1, status: 1 });
BossEncounterSchema.index({ bossId: 1, status: 1 });
BossEncounterSchema.index({ status: 1, endedAt: -1 });
BossEncounterSchema.index({ startedAt: -1 });

/**
 * Static method: Find active encounter for a character
 */
BossEncounterSchema.statics.findActiveByCharacter = async function(
  characterId: string
): Promise<IBossEncounter | null> {
  return this.findOne({
    characterIds: new mongoose.Types.ObjectId(characterId),
    status: 'active',
  }).sort({ startedAt: -1 });
};

/**
 * Static method: Find all active encounters for a boss
 */
BossEncounterSchema.statics.findActiveByBoss = async function(
  bossId: string
): Promise<IBossEncounter[]> {
  return this.find({
    bossId,
    status: 'active',
  }).sort({ startedAt: -1 });
};

/**
 * Static method: Find completed encounters for a character
 */
BossEncounterSchema.statics.findCompletedByCharacter = async function(
  characterId: string,
  limit: number = 50
): Promise<IBossEncounter[]> {
  return this.find({
    characterIds: new mongoose.Types.ObjectId(characterId),
    status: { $ne: 'active' },
  })
    .sort({ endedAt: -1 })
    .limit(limit);
};

/**
 * Static method: Find encounter history for a specific boss
 */
BossEncounterSchema.statics.findHistoryForBoss = async function(
  bossId: string,
  limit: number = 100
): Promise<IBossEncounter[]> {
  return this.find({
    bossId,
    status: { $ne: 'active' },
  })
    .sort({ endedAt: -1 })
    .limit(limit);
};

/**
 * Boss Encounter model
 */
export const BossEncounter = mongoose.model<IBossEncounter, IBossEncounterModel>(
  'BossEncounter',
  BossEncounterSchema
);

/**
 * Boss Discovery document interface
 * Tracks which bosses a character has discovered and their progress
 */
export interface IBossDiscovery extends Document {
  characterId: mongoose.Types.ObjectId;
  bossId: string;

  discovered: boolean;
  discoveredAt?: Date;
  discoveryMethod?: 'rumor' | 'encounter' | 'quest' | 'exploration';

  encounterCount: number;
  victoryCount: number;
  defeatCount: number;

  bestAttempt?: {
    damageDealt: number;
    healthRemaining: number;
    duration: number;
    date: Date;
  };

  lastEncounteredAt?: Date;
  lastVictoryAt?: Date;

  firstKillRewardClaimed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Boss Discovery static methods interface
 */
export interface IBossDiscoveryModel extends Model<IBossDiscovery> {
  findOrCreate(
    characterId: string,
    bossId: string
  ): Promise<IBossDiscovery>;
  getDiscoveredBosses(characterId: string): Promise<IBossDiscovery[]>;
}

/**
 * Boss Discovery schema definition
 */
const BossDiscoverySchema = new Schema<IBossDiscovery>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    bossId: {
      type: String,
      required: true,
      index: true,
    },

    discovered: {
      type: Boolean,
      default: false,
    },
    discoveredAt: {
      type: Date,
    },
    discoveryMethod: {
      type: String,
      enum: ['rumor', 'encounter', 'quest', 'exploration'],
    },

    encounterCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    victoryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    defeatCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    bestAttempt: {
      damageDealt: Number,
      healthRemaining: Number,
      duration: Number,
      date: Date,
    },

    lastEncounteredAt: Date,
    lastVictoryAt: Date,

    firstKillRewardClaimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
BossDiscoverySchema.index({ characterId: 1, bossId: 1 }, { unique: true });
BossDiscoverySchema.index({ characterId: 1, discovered: 1 });

/**
 * Static method: Find or create discovery record
 */
BossDiscoverySchema.statics.findOrCreate = async function(
  characterId: string,
  bossId: string
): Promise<IBossDiscovery> {
  let discovery = await this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    bossId,
  });

  if (!discovery) {
    discovery = new this({
      characterId,
      bossId,
      discovered: false,
      encounterCount: 0,
      victoryCount: 0,
      defeatCount: 0,
      firstKillRewardClaimed: false,
    });
    await discovery.save();
  }

  return discovery;
};

/**
 * Static method: Get all discovered bosses for a character
 */
BossDiscoverySchema.statics.getDiscoveredBosses = async function(
  characterId: string
): Promise<IBossDiscovery[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    discovered: true,
  }).sort({ discoveredAt: -1 });
};

/**
 * Boss Discovery model
 */
export const BossDiscovery = mongoose.model<IBossDiscovery, IBossDiscoveryModel>(
  'BossDiscovery',
  BossDiscoverySchema
);
