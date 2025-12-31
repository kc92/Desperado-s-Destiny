/**
 * Character Sin Model - Divine Struggle System - PRIMARY SOURCE
 *
 * Tracks sin levels, spiritual torment, sacred knowledge, and divine struggle effects for characters.
 * This is the canonical source for all sin/torment tracking.
 *
 * For backwards compatibility with old code, see CharacterCorruption.model.ts
 * The MongoDB collection remains 'charactercorruptions' for database preservation.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  SinLevel,
  TormentType,
  SacredKnowledgeType,
  TormentEffect,
  SinEvent,
  getSinLevel,
  DIVINE_STRUGGLE_CONSTANTS
} from '@desperados/shared';

/**
 * Character Sin document interface
 */
export interface ICharacterSin extends Document {
  // Reference
  characterId: mongoose.Types.ObjectId;

  // Sin level
  currentSin: number;
  sinLevel: SinLevel;
  totalSinGained: number;
  totalSinAbsolved: number;

  // Backwards compatibility getters (old cosmic horror names)
  /** @deprecated Use sinLevel */
  readonly corruptionLevel: SinLevel;
  /** @deprecated Use currentSin */
  readonly currentCorruption: number;
  /** @deprecated Use sacredKnowledge */
  readonly forbiddenKnowledge: SacredKnowledgeType[];

  // Rift exposure tracking
  timeInRift: number;
  lastRiftEntry?: Date;
  consecutiveDaysInRift: number;

  // Sacred Knowledge
  sacredKnowledge: SacredKnowledgeType[];
  scripturesRead: string[];
  ritualsLearned: string[];
  entitiesEncountered: string[];

  // Torment
  activeTorments: TormentEffect[];
  permanentTorments: TormentType[];
  tormentResistance: number;

  // Divine Relics
  divineRelics: string[];
  cursedItems: string[];

  // Physical manifestations
  physicalManifestations: string[];
  voiceChanges: boolean;
  eyeChanges: boolean;
  skinChanges: boolean;

  // Social effects
  npcReactionLevel: number;
  divineAwareness: number;

  // History
  sinEvents: SinEvent[];
  deathsToSin: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  gainSin(amount: number, source: string, location?: string): Promise<void>;
  absolveSin(amount: number, method: string): Promise<void>;
  addKnowledge(knowledge: SacredKnowledgeType): void;
  learnRitual(ritualId: string): void;
  encounterEntity(entityId: string): void;
  addTorment(torment: TormentEffect): void;
  removeTorment(tormentId: string): void;
  addPermanentTorment(type: TormentType): void;
  removeExpiredTorments(): void;
  calculateDamnationRisk(): number;
  canUseRelic(sinRequired: number): boolean;
  addPhysicalManifestation(manifestation: string): void;
  updateSinLevel(): void;
  addSinEvent(source: string, change: number, location?: string): void;
  toSafeObject(): any;
}

/**
 * Character Sin static methods interface
 */
export interface ICharacterSinModel extends Model<ICharacterSin> {
  findByCharacterId(characterId: string): Promise<ICharacterSin | null>;
  createForCharacter(characterId: string): Promise<ICharacterSin>;
}

/**
 * Character Sin schema definition
 */
const CharacterSinSchema = new Schema<ICharacterSin>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },

    // Sin level
    currentSin: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    sinLevel: {
      type: String,
      enum: Object.values(SinLevel),
      default: SinLevel.PURE
    },
    totalSinGained: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSinAbsolved: {
      type: Number,
      default: 0,
      min: 0
    },

    // Rift exposure tracking
    timeInRift: {
      type: Number,
      default: 0,
      min: 0
    },
    lastRiftEntry: {
      type: Date
    },
    consecutiveDaysInRift: {
      type: Number,
      default: 0,
      min: 0
    },

    // Sacred Knowledge
    sacredKnowledge: [{
      type: String,
      enum: Object.values(SacredKnowledgeType)
    }],
    scripturesRead: [{ type: String }],
    ritualsLearned: [{ type: String }],
    entitiesEncountered: [{ type: String }],

    // Torment
    activeTorments: [{
      id: { type: String, required: true },
      type: {
        type: String,
        enum: Object.values(TormentType),
        required: true
      },
      name: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      startedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date },
      severity: { type: Number, min: 1, max: 10 },
      gameplayEffects: {
        visionImpairment: { type: Number, min: 0, max: 1 },
        statPenalty: { type: Number },
        actionRestrictions: [{ type: String }],
        forcedActions: [{ type: String }],
        npcHostility: { type: Number }
      },
      triggerConditions: [{ type: String }],
      symptoms: [{ type: String }],
      curedBy: [{ type: String }]
    }],
    permanentTorments: [{
      type: String,
      enum: Object.values(TormentType)
    }],
    tormentResistance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Divine Relics
    divineRelics: [{ type: String }],
    cursedItems: [{ type: String }],

    // Physical manifestations
    physicalManifestations: [{ type: String }],
    voiceChanges: {
      type: Boolean,
      default: false
    },
    eyeChanges: {
      type: Boolean,
      default: false
    },
    skinChanges: {
      type: Boolean,
      default: false
    },

    // Social effects
    npcReactionLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    divineAwareness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // History
    sinEvents: [{
      timestamp: { type: Date, default: Date.now },
      source: { type: String, required: true },
      sinChange: { type: Number, required: true },
      description: { type: String, required: true },
      location: { type: String }
    }],
    deathsToSin: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'charactercorruptions' // Keep same MongoDB collection for backwards compatibility
  }
);

/**
 * Indexes
 */
CharacterSinSchema.index({ characterId: 1 });
CharacterSinSchema.index({ sinLevel: 1 });
CharacterSinSchema.index({ currentSin: -1 });

/**
 * Instance method: Gain sin
 */
CharacterSinSchema.methods.gainSin = async function(
  this: ICharacterSin,
  amount: number,
  source: string,
  location?: string
): Promise<void> {
  const oldSin = this.currentSin;
  this.currentSin = Math.min(100, this.currentSin + amount);
  this.totalSinGained += amount;

  // Update sin level
  this.updateSinLevel();

  // Record event
  this.addSinEvent(source, amount, location);

  // Check for physical manifestations at thresholds
  const oldLevel = getSinLevel(oldSin);
  const newLevel = this.sinLevel;

  if (oldLevel !== newLevel) {
    // Trigger level change effects
    if (newLevel === SinLevel.TEMPTED && !this.eyeChanges) {
      this.eyeChanges = true;
      this.addPhysicalManifestation('Eyes reflect an inner fire, glowing faintly in darkness');
    } else if (newLevel === SinLevel.STAINED && !this.skinChanges) {
      this.skinChanges = true;
      this.addPhysicalManifestation('Faint marks appear on skin, like unholy sigils');
    } else if (newLevel === SinLevel.FALLEN && !this.voiceChanges) {
      this.voiceChanges = true;
      this.addPhysicalManifestation('Voice carries echoes of something otherworldly');
    }
  }

  await this.save();
};

/**
 * Instance method: Absolve sin
 */
CharacterSinSchema.methods.absolveSin = async function(
  this: ICharacterSin,
  amount: number,
  method: string
): Promise<void> {
  this.currentSin = Math.max(0, this.currentSin - amount);
  this.totalSinAbsolved += amount;

  // Update sin level
  this.updateSinLevel();

  // Record event
  this.addSinEvent(method, -amount);

  await this.save();
};

/**
 * Instance method: Add sacred knowledge
 */
CharacterSinSchema.methods.addKnowledge = function(
  this: ICharacterSin,
  knowledge: SacredKnowledgeType
): void {
  if (!this.sacredKnowledge.includes(knowledge)) {
    if (this.sacredKnowledge.length >= DIVINE_STRUGGLE_CONSTANTS.KNOWLEDGE_MAX_PER_CHARACTER) {
      throw new Error('Maximum sacred knowledge reached');
    }
    this.sacredKnowledge.push(knowledge);
    this.divineAwareness = Math.min(100, this.divineAwareness + 10);
  }
};

/**
 * Instance method: Learn ritual
 */
CharacterSinSchema.methods.learnRitual = function(
  this: ICharacterSin,
  ritualId: string
): void {
  if (!this.ritualsLearned.includes(ritualId)) {
    this.ritualsLearned.push(ritualId);
  }
};

/**
 * Instance method: Record entity encounter
 */
CharacterSinSchema.methods.encounterEntity = function(
  this: ICharacterSin,
  entityId: string
): void {
  if (!this.entitiesEncountered.includes(entityId)) {
    this.entitiesEncountered.push(entityId);
    this.divineAwareness = Math.min(100, this.divineAwareness + 5);
  }
};

/**
 * Instance method: Add torment
 */
CharacterSinSchema.methods.addTorment = function(
  this: ICharacterSin,
  torment: TormentEffect
): void {
  // Check max active torments
  if (this.activeTorments.length >= DIVINE_STRUGGLE_CONSTANTS.MAX_ACTIVE_TORMENTS) {
    // Remove oldest torment
    this.activeTorments.shift();
  }

  // Calculate expiry if duration is not permanent
  if (torment.duration !== -1) {
    torment.expiresAt = new Date(Date.now() + torment.duration * 60 * 1000);
  }

  this.activeTorments.push(torment);
};

/**
 * Instance method: Remove torment by ID
 */
CharacterSinSchema.methods.removeTorment = function(
  this: ICharacterSin,
  tormentId: string
): void {
  this.activeTorments = this.activeTorments.filter(t => t.id !== tormentId);
};

/**
 * Instance method: Add permanent torment
 */
CharacterSinSchema.methods.addPermanentTorment = function(
  this: ICharacterSin,
  type: TormentType
): void {
  if (!this.permanentTorments.includes(type)) {
    this.permanentTorments.push(type);
  }
};

/**
 * Instance method: Remove expired torments
 */
CharacterSinSchema.methods.removeExpiredTorments = function(
  this: ICharacterSin
): void {
  const now = Date.now();
  this.activeTorments = this.activeTorments.filter(t => {
    if (!t.expiresAt) return true; // Permanent
    return t.expiresAt.getTime() > now;
  });
};

/**
 * Instance method: Calculate damnation risk
 */
CharacterSinSchema.methods.calculateDamnationRisk = function(
  this: ICharacterSin
): number {
  if (this.sinLevel !== SinLevel.DAMNED) {
    return 0;
  }

  return DIVINE_STRUGGLE_CONSTANTS.DAMNATION_BASE_CHANCE_DAMNED +
    (this.consecutiveDaysInRift * 0.01);
};

/**
 * Instance method: Check if can use relic
 */
CharacterSinSchema.methods.canUseRelic = function(
  this: ICharacterSin,
  sinRequired: number
): boolean {
  return this.currentSin >= sinRequired;
};

/**
 * Instance method: Add physical manifestation
 */
CharacterSinSchema.methods.addPhysicalManifestation = function(
  this: ICharacterSin,
  manifestation: string
): void {
  if (!this.physicalManifestations.includes(manifestation)) {
    this.physicalManifestations.push(manifestation);
  }
};

/**
 * Instance method: Update sin level
 */
CharacterSinSchema.methods.updateSinLevel = function(
  this: ICharacterSin
): void {
  this.sinLevel = getSinLevel(this.currentSin);

  // Update NPC reaction level based on sin
  if (this.sinLevel === SinLevel.PURE) {
    this.npcReactionLevel = 0;
  } else if (this.sinLevel === SinLevel.TEMPTED) {
    this.npcReactionLevel = 10;
  } else if (this.sinLevel === SinLevel.STAINED) {
    this.npcReactionLevel = 30;
  } else if (this.sinLevel === SinLevel.FALLEN) {
    this.npcReactionLevel = 60;
  } else if (this.sinLevel === SinLevel.DAMNED) {
    this.npcReactionLevel = 90;
  }
};

/**
 * Instance method: Add sin event
 */
CharacterSinSchema.methods.addSinEvent = function(
  this: ICharacterSin,
  source: string,
  change: number,
  location?: string
): void {
  const description = change > 0
    ? `Gained ${change} sin from ${source}`
    : `Absolved ${Math.abs(change)} sin via ${source}`;

  this.sinEvents.push({
    timestamp: new Date(),
    source,
    sinChange: change,
    description,
    location
  });

  // Keep only last 100 events
  if (this.sinEvents.length > 100) {
    this.sinEvents = this.sinEvents.slice(-100);
  }
};

/**
 * Instance method: Return safe object
 */
CharacterSinSchema.methods.toSafeObject = function(this: ICharacterSin) {
  return {
    characterId: this.characterId.toString(),
    currentSin: this.currentSin,
    sinLevel: this.sinLevel,
    totalSinGained: this.totalSinGained,
    totalSinAbsolved: this.totalSinAbsolved,
    timeInRift: this.timeInRift,
    consecutiveDaysInRift: this.consecutiveDaysInRift,
    sacredKnowledge: this.sacredKnowledge,
    scripturesRead: this.scripturesRead,
    ritualsLearned: this.ritualsLearned,
    entitiesEncountered: this.entitiesEncountered,
    activeTorments: this.activeTorments,
    permanentTorments: this.permanentTorments,
    tormentResistance: this.tormentResistance,
    divineRelics: this.divineRelics,
    cursedItems: this.cursedItems,
    physicalManifestations: this.physicalManifestations,
    voiceChanges: this.voiceChanges,
    eyeChanges: this.eyeChanges,
    skinChanges: this.skinChanges,
    npcReactionLevel: this.npcReactionLevel,
    divineAwareness: this.divineAwareness,
    deathsToSin: this.deathsToSin,
    recentEvents: this.sinEvents.slice(-10),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Static method: Find by character ID
 */
CharacterSinSchema.statics.findByCharacterId = async function(
  characterId: string
): Promise<ICharacterSin | null> {
  return this.findOne({ characterId: new mongoose.Types.ObjectId(characterId) });
};

/**
 * Static method: Create for character
 */
CharacterSinSchema.statics.createForCharacter = async function(
  characterId: string
): Promise<ICharacterSin> {
  return this.create({
    characterId: new mongoose.Types.ObjectId(characterId),
    currentSin: 0,
    sinLevel: SinLevel.PURE
  });
};

/**
 * Virtual getters for backwards compatibility
 */
CharacterSinSchema.virtual('corruptionLevel').get(function(this: ICharacterSin) {
  return this.sinLevel;
});

CharacterSinSchema.virtual('currentCorruption').get(function(this: ICharacterSin) {
  return this.currentSin;
});

CharacterSinSchema.virtual('forbiddenKnowledge').get(function(this: ICharacterSin) {
  return this.sacredKnowledge;
});

/**
 * Character Sin model - PRIMARY
 * Uses 'charactercorruptions' collection for backwards compatibility
 */
export const CharacterSin = mongoose.model<ICharacterSin, ICharacterSinModel>(
  'CharacterSin',
  CharacterSinSchema,
  'charactercorruptions' // Explicit collection name for backwards compatibility
);

// =============================================================================
// BACKWARDS COMPATIBILITY ALIASES
// =============================================================================

/** @deprecated Use ICharacterSin */
export type ICharacterCorruption = ICharacterSin;

/** @deprecated Use ICharacterSinModel */
export type ICharacterCorruptionModel = ICharacterSinModel;

/** @deprecated Use CharacterSin */
export const CharacterCorruption = CharacterSin;

/**
 * Field mapping reference (for database queries using old field names):
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * currentCorruption           →  currentSin
 * corruptionLevel             →  sinLevel
 * totalCorruptionGained       →  totalSinGained
 * totalCorruptionPurged       →  totalSinAbsolved
 * timeInScar                  →  timeInRift
 * lastScarEntry               →  lastRiftEntry
 * consecutiveDaysInScar       →  consecutiveDaysInRift
 * forbiddenKnowledge          →  sacredKnowledge
 * tomesRead                   →  scripturesRead
 * activeMadness               →  activeTorments
 * permanentMadness            →  permanentTorments
 * madnessResistance           →  tormentResistance
 * eldritchArtifacts           →  divineRelics
 * physicalMutations           →  physicalManifestations
 * npcFearLevel                →  npcReactionLevel
 * cosmicAwareness             →  divineAwareness
 * corruptionEvents            →  sinEvents
 * deathsToCorruption          →  deathsToSin
 */
