/**
 * Scar Progress Model
 *
 * Tracks player progress through The Scar end-game content
 */

import mongoose, { Document, Schema } from 'mongoose';
import {
  ScarProgress,
  ScarZone,
  ScarReputationTier,
  CorruptionAbilityType,
  getScarReputationTier,
  getNextTierRequirement,
} from '@desperados/shared';

/**
 * Scar Progress Model interface
 */
interface ScarProgressModel extends mongoose.Model<ScarProgressDocument> {
  findOrCreate(characterId: string): Promise<ScarProgressDocument>;
  getTopByReputation(limit?: number): Promise<ScarProgressDocument[]>;
  getTopByCorruptionMastery(limit?: number): Promise<ScarProgressDocument[]>;
}

/**
 * Scar Progress Document interface
 */
export interface ScarProgressDocument extends Omit<ScarProgress, '_id'>, Document {
  _id: mongoose.Types.ObjectId;

  /**
   * Add reputation points
   */
  addReputation(amount: number): Promise<void>;

  /**
   * Add corruption mastery
   */
  addCorruptionMastery(amount: number): Promise<void>;

  /**
   * Record elite defeat
   */
  recordEliteDefeat(eliteId: string): Promise<void>;

  /**
   * Record world boss defeat
   */
  recordWorldBossDefeat(bossId: string, damage: number): Promise<void>;

  /**
   * Unlock corruption ability
   */
  unlockCorruptionAbility(abilityId: CorruptionAbilityType): Promise<void>;

  /**
   * Add artifact fragment
   */
  addArtifactFragment(artifactId: string, amount: number): Promise<void>;

  /**
   * Complete artifact
   */
  completeArtifact(artifactId: string): Promise<void>;
}

/**
 * Scar Progress Schema
 */
const ScarProgressSchema = new Schema<ScarProgressDocument>(
  {
    characterId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Reputation
    reputation: {
      type: Number,
      default: 0,
      min: 0,
    },
    reputationTier: {
      type: String,
      enum: Object.values(ScarReputationTier),
      default: ScarReputationTier.NOVICE,
    },
    nextTierAt: {
      type: Number,
      default: 1000,
    },

    // Zone access
    unlockedZones: {
      type: [String],
      default: [ScarZone.OUTER_WASTE],
      enum: Object.values(ScarZone),
    },
    currentZone: {
      type: String,
      enum: Object.values(ScarZone),
    },

    // Corruption mastery
    corruptionMastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    unlockedCorruptionAbilities: {
      type: [String],
      default: [],
      enum: Object.values(CorruptionAbilityType),
    },
    currentCorruption: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Enemy tracking
    elitesDefeated: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    worldBossesDefeated: {
      type: Map,
      of: {
        count: { type: Number, default: 0 },
        firstDefeatAt: { type: Date },
        lastDefeatAt: { type: Date },
        bestDamage: { type: Number },
      },
      default: new Map(),
    },

    // Challenges
    dailyChallengesCompleted: {
      type: Number,
      default: 0,
    },
    weeklyChallengesCompleted: {
      type: Number,
      default: 0,
    },
    activeDailyChallenge: {
      type: String,
    },
    activeWeeklyChallenge: {
      type: String,
    },

    // Collectibles
    artifactFragments: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    completedArtifacts: {
      type: [String],
      default: [],
    },

    // Statistics
    timeInScar: {
      type: Number,
      default: 0,
    },
    totalEnemiesKilled: {
      type: Number,
      default: 0,
    },
    totalSanityLost: {
      type: Number,
      default: 0,
    },
    totalCorruptionGained: {
      type: Number,
      default: 0,
    },
    deathsInScar: {
      type: Number,
      default: 0,
    },

    // Achievements
    titles: {
      type: [String],
      default: [],
    },
    cosmetics: {
      type: [String],
      default: [],
    },

    // Timestamps
    lastDailyChallengeReset: {
      type: Date,
      default: Date.now,
    },
    lastWeeklyChallengeReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ScarProgressSchema.index({ characterId: 1 });
ScarProgressSchema.index({ reputation: -1 });
ScarProgressSchema.index({ reputationTier: 1 });
ScarProgressSchema.index({ corruptionMastery: -1 });

/**
 * Methods
 */

/**
 * Add reputation and update tier
 */
ScarProgressSchema.methods.addReputation = async function(amount: number): Promise<void> {
  this.reputation += amount;

  // Update tier
  const newTier = getScarReputationTier(this.reputation);
  if (newTier !== this.reputationTier) {
    this.reputationTier = newTier;
  }

  // Update next tier requirement
  this.nextTierAt = getNextTierRequirement(newTier);

  await this.save();
};

/**
 * Add corruption mastery
 */
ScarProgressSchema.methods.addCorruptionMastery = async function(amount: number): Promise<void> {
  this.corruptionMastery = Math.min(100, this.corruptionMastery + amount);
  await this.save();
};

/**
 * Record elite defeat
 */
ScarProgressSchema.methods.recordEliteDefeat = async function(eliteId: string): Promise<void> {
  const currentCount = this.elitesDefeated.get(eliteId) || 0;
  this.elitesDefeated.set(eliteId, currentCount + 1);
  this.totalEnemiesKilled += 1;

  await this.save();
};

/**
 * Record world boss defeat
 */
ScarProgressSchema.methods.recordWorldBossDefeat = async function(
  bossId: string,
  damage: number
): Promise<void> {
  const bossData = this.worldBossesDefeated.get(bossId) || {
    count: 0,
    firstDefeatAt: undefined,
    lastDefeatAt: undefined,
    bestDamage: 0,
  };

  bossData.count += 1;
  bossData.lastDefeatAt = new Date();

  if (!bossData.firstDefeatAt) {
    bossData.firstDefeatAt = new Date();
  }

  if (!bossData.bestDamage || damage > bossData.bestDamage) {
    bossData.bestDamage = damage;
  }

  this.worldBossesDefeated.set(bossId, bossData);

  await this.save();
};

/**
 * Unlock corruption ability
 */
ScarProgressSchema.methods.unlockCorruptionAbility = async function(
  abilityId: CorruptionAbilityType
): Promise<void> {
  if (!this.unlockedCorruptionAbilities.includes(abilityId)) {
    this.unlockedCorruptionAbilities.push(abilityId);
    await this.save();
  }
};

/**
 * Add artifact fragment
 */
ScarProgressSchema.methods.addArtifactFragment = async function(
  artifactId: string,
  amount: number
): Promise<void> {
  const currentAmount = this.artifactFragments.get(artifactId) || 0;
  this.artifactFragments.set(artifactId, currentAmount + amount);

  await this.save();
};

/**
 * Complete artifact
 */
ScarProgressSchema.methods.completeArtifact = async function(artifactId: string): Promise<void> {
  if (!this.completedArtifacts.includes(artifactId)) {
    this.completedArtifacts.push(artifactId);
    await this.save();
  }
};

/**
 * Static methods
 */

/**
 * Find or create progress for character
 */
ScarProgressSchema.statics.findOrCreate = async function(
  characterId: string
): Promise<ScarProgressDocument> {
  let progress = await this.findOne({ characterId });

  if (!progress) {
    progress = await this.create({
      characterId,
      reputation: 0,
      reputationTier: ScarReputationTier.NOVICE,
      nextTierAt: 1000,
      unlockedZones: [ScarZone.OUTER_WASTE],
      corruptionMastery: 0,
      currentCorruption: 0,
      elitesDefeated: new Map(),
      worldBossesDefeated: new Map(),
      dailyChallengesCompleted: 0,
      weeklyChallengesCompleted: 0,
      artifactFragments: new Map(),
      completedArtifacts: [],
      timeInScar: 0,
      totalEnemiesKilled: 0,
      totalSanityLost: 0,
      totalCorruptionGained: 0,
      deathsInScar: 0,
      titles: [],
      cosmetics: [],
      lastDailyChallengeReset: new Date(),
      lastWeeklyChallengeReset: new Date(),
    });
  }

  return progress;
};

/**
 * Get top players by reputation
 */
ScarProgressSchema.statics.getTopByReputation = async function(limit: number = 100) {
  return this.find()
    .sort({ reputation: -1 })
    .limit(limit)
    .select('characterId reputation reputationTier');
};

/**
 * Get top players by corruption mastery
 */
ScarProgressSchema.statics.getTopByCorruptionMastery = async function(limit: number = 100) {
  return this.find()
    .sort({ corruptionMastery: -1 })
    .limit(limit)
    .select('characterId corruptionMastery unlockedCorruptionAbilities');
};

/**
 * Export model
 */
export const ScarProgressModel = mongoose.model<ScarProgressDocument, ScarProgressModel>('ScarProgress', ScarProgressSchema);
