/**
 * DeityAttention Model
 *
 * Tracks how much attention each deity is paying to each character.
 * Higher attention = more frequent divine interventions.
 *
 * Attention is calculated from:
 * - Deity affinity magnitude (absolute value)
 * - Extreme karma values in deity-aligned dimensions
 * - Recent activity level
 * - Moral conflicts (deities love drama)
 * - Rivalry (favored by opposing deity)
 */

import { Schema, model, Document, Types, Model, Query } from 'mongoose';

export type DeityName = 'GAMBLER' | 'OUTLAW_KING';

export interface IAttentionTriggers {
  highKarma: boolean;           // Has extreme karma values (>50 in any dimension)
  recentDrama: boolean;         // Did something dramatic in last 24h
  rivalFavored: boolean;        // Favored by the opposing deity
  frequentGambler: boolean;     // The Gambler watches gamblers closely
  lawBreaker: boolean;          // Outlaw King watches outlaws closely
  moralConflict: boolean;       // Character has conflicting high karma values
  activeQuester: boolean;       // Completing many quests
  gangLeader: boolean;          // Leading a gang (more responsibility = more interest)
}

export interface IDeityAttention extends Document {
  characterId: Types.ObjectId;
  deityName: DeityName;

  // Attention metrics (0-100)
  attention: number;            // How much the deity is watching
  interest: number;             // How "interesting" the player is to this deity

  // Tracking
  lastEvaluatedAt: Date;
  lastInterventionAt: Date | null;
  interventionCount: number;

  // Attention triggers
  triggers: IAttentionTriggers;

  // Cooldowns for different manifestation types
  dreamCooldownUntil: Date | null;
  strangerCooldownUntil: Date | null;
  omenCooldownUntil: Date | null;
  whisperCooldownUntil: Date | null;

  // Historical tracking
  totalDreams: number;
  totalStrangerEncounters: number;
  totalOmens: number;
  totalWhispers: number;

  // Karma trajectory (calculated from recent actions)
  karmaTrajectory: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'VOLATILE';

  createdAt: Date;
  updatedAt: Date;

  // Methods
  canReceiveDream(): boolean;
  canReceiveStranger(): boolean;
  canReceiveOmen(): boolean;
  canReceiveWhisper(): boolean;
  recordIntervention(type: 'DREAM' | 'STRANGER' | 'OMEN' | 'WHISPER'): void;
  calculateInterventionChance(baseChance: number): number;
  updateKarmaTrajectory(delta: number): void;
}

// Static methods interface
export interface IDeityAttentionModel extends Model<IDeityAttention> {
  findByCharacterAndDeity(
    characterId: string | Types.ObjectId,
    deityName: DeityName
  ): Query<IDeityAttention | null, IDeityAttention>;

  findTopWatched(
    deityName: DeityName,
    limit?: number
  ): Query<IDeityAttention[], IDeityAttention>;

  findHighAttentionCharacters(
    deityName: DeityName,
    threshold: number,
    limit?: number
  ): Query<IDeityAttention[], IDeityAttention>;

  getOrCreate(
    characterId: string | Types.ObjectId,
    deityName: DeityName
  ): Promise<IDeityAttention>;
}

const AttentionTriggersSchema = new Schema({
  highKarma: { type: Boolean, default: false },
  recentDrama: { type: Boolean, default: false },
  rivalFavored: { type: Boolean, default: false },
  frequentGambler: { type: Boolean, default: false },
  lawBreaker: { type: Boolean, default: false },
  moralConflict: { type: Boolean, default: false },
  activeQuester: { type: Boolean, default: false },
  gangLeader: { type: Boolean, default: false }
}, { _id: false });

const DeityAttentionSchema = new Schema<IDeityAttention>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  deityName: {
    type: String,
    enum: ['GAMBLER', 'OUTLAW_KING'],
    required: true
  },

  // Attention metrics
  attention: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  interest: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Tracking
  lastEvaluatedAt: { type: Date, default: Date.now },
  lastInterventionAt: { type: Date, default: null },
  interventionCount: { type: Number, default: 0 },

  // Triggers
  triggers: {
    type: AttentionTriggersSchema,
    default: () => ({
      highKarma: false,
      recentDrama: false,
      rivalFavored: false,
      frequentGambler: false,
      lawBreaker: false,
      moralConflict: false,
      activeQuester: false,
      gangLeader: false
    })
  },

  // Cooldowns (null = no cooldown active)
  dreamCooldownUntil: { type: Date, default: null },
  strangerCooldownUntil: { type: Date, default: null },
  omenCooldownUntil: { type: Date, default: null },
  whisperCooldownUntil: { type: Date, default: null },

  // Historical tracking
  totalDreams: { type: Number, default: 0 },
  totalStrangerEncounters: { type: Number, default: 0 },
  totalOmens: { type: Number, default: 0 },
  totalWhispers: { type: Number, default: 0 },

  // Karma trajectory
  karmaTrajectory: {
    type: String,
    enum: ['IMPROVING', 'DECLINING', 'STABLE', 'VOLATILE'],
    default: 'STABLE'
  }
}, {
  timestamps: true,
  collection: 'deityattention'
});

// Indexes for efficient queries
// Unique compound index - one record per character per deity
DeityAttentionSchema.index({ characterId: 1, deityName: 1 }, { unique: true });

// For finding top watched characters
DeityAttentionSchema.index({ attention: -1, deityName: 1 });

// For finding characters due for evaluation
DeityAttentionSchema.index({ lastEvaluatedAt: 1 });

// For finding characters eligible for intervention
DeityAttentionSchema.index({ lastInterventionAt: 1, attention: -1 });

// Cooldown constants (in hours)
const COOLDOWN_HOURS = {
  DREAM: 8,           // 8 hours between dreams
  STRANGER: 4,        // 4 hours between stranger encounters
  OMEN: 2,            // 2 hours between omens
  WHISPER: 1          // 1 hour between whispers
};

// Methods
DeityAttentionSchema.methods.canReceiveDream = function(): boolean {
  if (!this.dreamCooldownUntil) return true;
  return new Date() > this.dreamCooldownUntil;
};

DeityAttentionSchema.methods.canReceiveStranger = function(): boolean {
  if (!this.strangerCooldownUntil) return true;
  return new Date() > this.strangerCooldownUntil;
};

DeityAttentionSchema.methods.canReceiveOmen = function(): boolean {
  if (!this.omenCooldownUntil) return true;
  return new Date() > this.omenCooldownUntil;
};

DeityAttentionSchema.methods.canReceiveWhisper = function(): boolean {
  if (!this.whisperCooldownUntil) return true;
  return new Date() > this.whisperCooldownUntil;
};

DeityAttentionSchema.methods.recordIntervention = function(
  type: 'DREAM' | 'STRANGER' | 'OMEN' | 'WHISPER'
): void {
  const now = new Date();
  this.lastInterventionAt = now;
  this.interventionCount++;

  // Set cooldown based on type
  const cooldownMs = COOLDOWN_HOURS[type] * 60 * 60 * 1000;
  const cooldownUntil = new Date(now.getTime() + cooldownMs);

  switch (type) {
    case 'DREAM':
      this.dreamCooldownUntil = cooldownUntil;
      this.totalDreams++;
      break;
    case 'STRANGER':
      this.strangerCooldownUntil = cooldownUntil;
      this.totalStrangerEncounters++;
      break;
    case 'OMEN':
      this.omenCooldownUntil = cooldownUntil;
      this.totalOmens++;
      break;
    case 'WHISPER':
      this.whisperCooldownUntil = cooldownUntil;
      this.totalWhispers++;
      break;
  }
};

DeityAttentionSchema.methods.calculateInterventionChance = function(baseChance: number): number {
  // LOGIC-4 FIX: Add minimum attention floor so deities can always intervene
  // Even at 0 attention, there's a 10% minimum modifier (representing ambient divine awareness)
  // At 50 attention: base chance
  // At 100 attention: 2x base chance
  const attentionModifier = Math.max(0.1, this.attention / 50);

  // Interest adds a bonus
  // At 100 interest: +50% chance
  const interestBonus = (this.interest / 100) * 0.5;

  // Calculate final chance
  let finalChance = baseChance * attentionModifier * (1 + interestBonus);

  // Cap at 50% to prevent spam
  return Math.min(0.5, Math.max(0, finalChance));
};

DeityAttentionSchema.methods.updateKarmaTrajectory = function(delta: number): void {
  // Determine trajectory based on delta magnitude and direction
  // delta > 3: IMPROVING (significant positive karma change)
  // delta < -3: DECLINING (significant negative karma change)
  // Otherwise: STABLE (minimal change)
  const threshold = 3;

  if (delta > threshold) {
    this.karmaTrajectory = 'IMPROVING';
  } else if (delta < -threshold) {
    this.karmaTrajectory = 'DECLINING';
  } else {
    this.karmaTrajectory = 'STABLE';
  }
};

// Static methods
DeityAttentionSchema.statics.findByCharacterAndDeity = function(
  characterId: string | Types.ObjectId,
  deityName: DeityName
) {
  return this.findOne({ characterId, deityName });
};

DeityAttentionSchema.statics.findTopWatched = function(
  deityName: DeityName,
  limit: number = 100
) {
  return this.find({
    deityName,
    attention: { $gt: 10 } // Only characters with meaningful attention
  })
    .sort({ attention: -1 })
    .limit(limit);
};

DeityAttentionSchema.statics.findHighAttentionCharacters = function(
  deityName: DeityName,
  threshold: number,
  limit: number = 100
) {
  return this.find({
    deityName,
    attention: { $gte: threshold }
  })
    .sort({ attention: -1 })
    .limit(limit);
};

DeityAttentionSchema.statics.getOrCreate = async function(
  characterId: string | Types.ObjectId,
  deityName: DeityName
): Promise<IDeityAttention> {
  // Use atomic findOneAndUpdate with upsert to prevent race conditions
  const attention = await this.findOneAndUpdate(
    { characterId, deityName },
    {
      $setOnInsert: {
        characterId,
        deityName,
        attention: 0,
        interest: 0,
        interventionCount: 0,
        totalDreams: 0,
        totalStrangerEncounters: 0,
        totalOmens: 0,
        totalWhispers: 0,
        karmaTrajectory: 'STABLE'
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return attention;
};

export const DeityAttention = model<IDeityAttention, IDeityAttentionModel>(
  'DeityAttention',
  DeityAttentionSchema
);
