/**
 * CharacterKarma Model
 *
 * Tracks 10-dimensional karma for each character.
 * Instead of simple good/evil, we track independent moral dimensions:
 * - A character can be merciful AND greedy
 * - Honorable AND chaotic
 *
 * This creates nuanced deity responses based on complex moral profiles.
 */

import { Schema, model, Document, Types, Model, Query } from 'mongoose';

// 10 Karma Dimensions
export type KarmaDimension =
  | 'MERCY'      // Sparing enemies, healing, forgiveness
  | 'CRUELTY'    // Torture, excessive violence, sadism
  | 'GREED'      // Hoarding, theft for profit, exploitation
  | 'CHARITY'    // Giving to poor, helping without reward
  | 'JUSTICE'    // Following law, punishing criminals
  | 'CHAOS'      // Breaking rules, unpredictability, anarchy
  | 'HONOR'      // Keeping promises, fair fights, honesty
  | 'DECEPTION'  // Lies, betrayal, manipulation
  | 'SURVIVAL'   // Self-preservation, pragmatism
  | 'LOYALTY';   // Protecting allies, gang devotion

export interface IKarmaAction {
  actionType: string;              // e.g., 'CRIME_COMPLETED', 'NPC_HELPED'
  dimension: KarmaDimension;
  delta: number;                   // -10 to +10 change
  timestamp: Date;
  context: string;                 // Brief description
  witnessedByDeity: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH' | 'NONE';
}

export interface IKarmaThreshold {
  dimension: KarmaDimension;
  value: number;
  tier: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME';
  lastTriggered: Date | null;
}

export interface IBlessing {
  source: 'GAMBLER' | 'OUTLAW_KING';
  type: string;
  power: number;
  expiresAt: Date | null;
  description: string;
  grantedAt: Date;
}

export interface ICurse {
  source: 'GAMBLER' | 'OUTLAW_KING';
  type: string;
  severity: number;
  expiresAt: Date | null;
  description: string;
  removalCondition: string;
  inflictedAt: Date;
}

export interface IKarmaValues {
  mercy: number;
  cruelty: number;
  greed: number;
  charity: number;
  justice: number;
  chaos: number;
  honor: number;
  deception: number;
  survival: number;
  loyalty: number;
}

export interface ICharacterKarma extends Document {
  characterId: Types.ObjectId;

  // Current karma values (-100 to +100 per dimension)
  karma: IKarmaValues;

  // Tracking
  totalActions: number;
  recentActions: IKarmaAction[];   // Last 100 actions

  // Deity relationships
  gamblerAffinity: number;         // -100 to +100
  outlawKingAffinity: number;      // -100 to +100

  // Thresholds for divine intervention
  thresholds: IKarmaThreshold[];

  // Divine marks
  blessings: IBlessing[];
  curses: ICurse[];

  // Dream/vision tracking
  lastDreamFrom: 'GAMBLER' | 'OUTLAW_KING' | null;
  lastDreamAt: Date | null;
  dreamsReceived: number;

  // Encounter tracking
  strangerEncounters: number;
  lastStrangerEncounterAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  getDominantTrait(): { trait: string; value: number; isPositive: boolean };
  getActiveBlessings(): IBlessing[];
  getActiveCurses(): ICurse[];
  hasBlessing(type: string): boolean;
  hasCurse(type: string): boolean;
  getDeityRelationship(deity: 'GAMBLER' | 'OUTLAW_KING'): string;
  detectMoralConflict(): string | null;
}

// Static methods interface
export interface ICharacterKarmaModel extends Model<ICharacterKarma> {
  findByCharacterId(
    characterId: string | Types.ObjectId
  ): Query<ICharacterKarma | null, ICharacterKarma>;

  findWatchedByDeity(
    deity: 'GAMBLER' | 'OUTLAW_KING',
    limit?: number
  ): Query<ICharacterKarma[], ICharacterKarma>;
}

const KarmaActionSchema = new Schema({
  actionType: { type: String, required: true },
  dimension: {
    type: String,
    enum: ['MERCY', 'CRUELTY', 'GREED', 'CHARITY', 'JUSTICE', 'CHAOS', 'HONOR', 'DECEPTION', 'SURVIVAL', 'LOYALTY'],
    required: true
  },
  delta: { type: Number, required: true, min: -10, max: 10 },
  timestamp: { type: Date, default: Date.now },
  context: { type: String, default: '' },
  witnessedByDeity: {
    type: String,
    enum: ['GAMBLER', 'OUTLAW_KING', 'BOTH', 'NONE'],
    default: 'NONE'
  }
}, { _id: false });

const KarmaThresholdSchema = new Schema({
  dimension: {
    type: String,
    enum: ['MERCY', 'CRUELTY', 'GREED', 'CHARITY', 'JUSTICE', 'CHAOS', 'HONOR', 'DECEPTION', 'SURVIVAL', 'LOYALTY'],
    required: true
  },
  value: { type: Number, required: true },
  tier: {
    type: String,
    enum: ['MINOR', 'MODERATE', 'MAJOR', 'EXTREME'],
    required: true
  },
  lastTriggered: { type: Date, default: null }
}, { _id: false });

const BlessingSchema = new Schema({
  source: {
    type: String,
    enum: ['GAMBLER', 'OUTLAW_KING'],
    required: true
  },
  type: { type: String, required: true },
  power: { type: Number, default: 1, min: 1, max: 3 },
  expiresAt: { type: Date, default: null },
  description: { type: String, required: true },
  grantedAt: { type: Date, default: Date.now }
}, { _id: true });

const CurseSchema = new Schema({
  source: {
    type: String,
    enum: ['GAMBLER', 'OUTLAW_KING'],
    required: true
  },
  type: { type: String, required: true },
  severity: { type: Number, default: 1, min: 1, max: 3 },
  expiresAt: { type: Date, default: null },
  description: { type: String, required: true },
  removalCondition: { type: String, required: true },
  inflictedAt: { type: Date, default: Date.now }
}, { _id: true });

const CharacterKarmaSchema = new Schema<ICharacterKarma>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    unique: true
  },

  // Karma values
  karma: {
    mercy: { type: Number, default: 0, min: -100, max: 100 },
    cruelty: { type: Number, default: 0, min: -100, max: 100 },
    greed: { type: Number, default: 0, min: -100, max: 100 },
    charity: { type: Number, default: 0, min: -100, max: 100 },
    justice: { type: Number, default: 0, min: -100, max: 100 },
    chaos: { type: Number, default: 0, min: -100, max: 100 },
    honor: { type: Number, default: 0, min: -100, max: 100 },
    deception: { type: Number, default: 0, min: -100, max: 100 },
    survival: { type: Number, default: 0, min: -100, max: 100 },
    loyalty: { type: Number, default: 0, min: -100, max: 100 }
  },

  // Tracking
  totalActions: { type: Number, default: 0 },
  recentActions: {
    type: [KarmaActionSchema],
    default: [],
    validate: {
      validator: function(v: IKarmaAction[]) {
        return v.length <= 100;
      },
      message: 'Recent actions cannot exceed 100 entries'
    }
  },

  // Deity relationships
  gamblerAffinity: { type: Number, default: 0, min: -100, max: 100 },
  outlawKingAffinity: { type: Number, default: 0, min: -100, max: 100 },

  // Thresholds
  thresholds: { type: [KarmaThresholdSchema], default: [] },

  // Divine marks
  blessings: { type: [BlessingSchema], default: [] },
  curses: { type: [CurseSchema], default: [] },

  // Dream tracking
  lastDreamFrom: {
    type: String,
    enum: ['GAMBLER', 'OUTLAW_KING', null],
    default: null
  },
  lastDreamAt: { type: Date, default: null },
  dreamsReceived: { type: Number, default: 0 },

  // Encounter tracking
  strangerEncounters: { type: Number, default: 0 },
  lastStrangerEncounterAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'characterkarma'
});

// Indexes for efficient queries
// Note: characterId already indexed via unique: true constraint on the field
CharacterKarmaSchema.index({ gamblerAffinity: -1 });
CharacterKarmaSchema.index({ outlawKingAffinity: -1 });
CharacterKarmaSchema.index({ 'karma.mercy': -1 });
CharacterKarmaSchema.index({ 'karma.cruelty': -1 });
CharacterKarmaSchema.index({ 'karma.honor': -1 });
CharacterKarmaSchema.index({ 'karma.chaos': -1 });
CharacterKarmaSchema.index({ 'karma.justice': -1 });
CharacterKarmaSchema.index({ totalActions: -1 });

// Compound index for deity watching queries
CharacterKarmaSchema.index({
  gamblerAffinity: 1,
  outlawKingAffinity: 1,
  totalActions: 1
});

// Methods
CharacterKarmaSchema.methods.getDominantTrait = function(): { trait: string; value: number; isPositive: boolean } {
  let maxTrait = 'NEUTRAL';
  let maxValue = 0;

  const karmaObj = this.karma as IKarmaValues;
  for (const [trait, value] of Object.entries(karmaObj)) {
    const absValue = Math.abs(value as number);
    if (absValue > maxValue) {
      maxValue = absValue;
      maxTrait = trait.toUpperCase();
    }
  }

  // Handle NEUTRAL case (all values are zero)
  if (maxTrait === 'NEUTRAL' || maxValue === 0) {
    return {
      trait: 'NEUTRAL',
      value: 0,
      isPositive: true // Neutral is considered positive (absence of negative karma)
    };
  }

  return {
    trait: maxTrait,
    value: maxValue,
    isPositive: karmaObj[maxTrait.toLowerCase() as keyof IKarmaValues] > 0
  };
};

CharacterKarmaSchema.methods.getActiveBlessings = function(): IBlessing[] {
  const now = new Date();
  return this.blessings.filter((b: IBlessing) => !b.expiresAt || b.expiresAt > now);
};

CharacterKarmaSchema.methods.getActiveCurses = function(): ICurse[] {
  const now = new Date();
  return this.curses.filter((c: ICurse) => !c.expiresAt || c.expiresAt > now);
};

CharacterKarmaSchema.methods.hasBlessing = function(type: string): boolean {
  const now = new Date();
  return this.blessings.some((b: IBlessing) =>
    b.type === type && (!b.expiresAt || b.expiresAt > now)
  );
};

CharacterKarmaSchema.methods.hasCurse = function(type: string): boolean {
  const now = new Date();
  return this.curses.some((c: ICurse) =>
    c.type === type && (!c.expiresAt || c.expiresAt > now)
  );
};

CharacterKarmaSchema.methods.getDeityRelationship = function(deity: 'GAMBLER' | 'OUTLAW_KING'): string {
  const affinity = deity === 'GAMBLER' ? this.gamblerAffinity : this.outlawKingAffinity;

  if (affinity >= 75) return 'FAVORED';
  if (affinity >= 50) return 'BLESSED';
  if (affinity >= 25) return 'NOTICED';
  if (affinity >= -25) return 'UNKNOWN';
  if (affinity >= -50) return 'DISFAVORED';
  if (affinity >= -75) return 'CURSED';
  return 'FORSAKEN';
};

CharacterKarmaSchema.methods.detectMoralConflict = function(): string | null {
  const conflicts: [keyof IKarmaValues, keyof IKarmaValues][] = [
    ['mercy', 'cruelty'],
    ['greed', 'charity'],
    ['justice', 'chaos'],
    ['honor', 'deception'],
    ['survival', 'loyalty']
  ];

  const karmaObj = this.karma as IKarmaValues;
  for (const [dim1, dim2] of conflicts) {
    const v1 = Math.abs(karmaObj[dim1]);
    const v2 = Math.abs(karmaObj[dim2]);

    // Both values are significant and in tension
    if (v1 >= 30 && v2 >= 30) {
      return `${dim1.toUpperCase()} vs ${dim2.toUpperCase()}`;
    }
  }
  return null;
};

// Static methods
CharacterKarmaSchema.statics.findByCharacterId = function(characterId: string | Types.ObjectId) {
  return this.findOne({ characterId });
};

CharacterKarmaSchema.statics.findWatchedByDeity = function(
  deity: 'GAMBLER' | 'OUTLAW_KING',
  limit: number = 100
) {
  const affinityField = deity === 'GAMBLER' ? 'gamblerAffinity' : 'outlawKingAffinity';

  return this.find({
    $or: [
      { [affinityField]: { $gte: 25 } },   // Favored
      { [affinityField]: { $lte: -25 } },  // Disfavored
      { totalActions: { $gte: 50 } }        // Active players
    ]
  })
    .sort({ [affinityField]: -1 })
    .limit(limit);
};

export const CharacterKarma = model<ICharacterKarma, ICharacterKarmaModel>('CharacterKarma', CharacterKarmaSchema);
