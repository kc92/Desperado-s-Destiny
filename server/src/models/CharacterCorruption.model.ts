/**
 * Character Corruption Model - Phase 14, Wave 14.1
 *
 * Tracks corruption, madness, forbidden knowledge, and cosmic horror effects for characters
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  CorruptionLevel,
  MadnessType,
  ForbiddenKnowledgeType,
  MadnessEffect,
  CorruptionEvent,
  getCorruptionLevel,
  COSMIC_HORROR_CONSTANTS
} from '@desperados/shared';

/**
 * Character Corruption document interface
 */
export interface ICharacterCorruption extends Document {
  // Reference
  characterId: mongoose.Types.ObjectId;

  // Corruption level
  currentCorruption: number;
  corruptionLevel: CorruptionLevel;
  totalCorruptionGained: number;
  totalCorruptionPurged: number;

  // Exposure tracking
  timeInScar: number;
  lastScarEntry?: Date;
  consecutiveDaysInScar: number;

  // Knowledge
  forbiddenKnowledge: ForbiddenKnowledgeType[];
  tomesRead: string[];
  ritualsLearned: string[];
  entitiesEncountered: string[];

  // Madness
  activeMadness: MadnessEffect[];
  permanentMadness: MadnessType[];
  madnessResistance: number;

  // Artifacts
  eldritchArtifacts: string[];
  cursedItems: string[];

  // Physical changes
  physicalMutations: string[];
  voiceChanges: boolean;
  eyeChanges: boolean;
  skinChanges: boolean;

  // Social effects
  npcFearLevel: number;
  cosmicAwareness: number;

  // History
  corruptionEvents: CorruptionEvent[];
  deathsToCorruption: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  gainCorruption(amount: number, source: string, location?: string): Promise<void>;
  loseCorruption(amount: number, method: string): Promise<void>;
  addKnowledge(knowledge: ForbiddenKnowledgeType): void;
  learnRitual(ritualId: string): void;
  encounterEntity(entityId: string): void;
  addMadness(madness: MadnessEffect): void;
  removeMadness(madnessId: string): void;
  addPermanentMadness(type: MadnessType): void;
  removeExpiredMadness(): void;
  calculateTransformationRisk(): number;
  canUseArtifact(corruptionRequired: number): boolean;
  addPhysicalMutation(mutation: string): void;
  updateCorruptionLevel(): void;
  addCorruptionEvent(source: string, change: number, location?: string): void;
  toSafeObject(): any;
}

/**
 * Character Corruption static methods interface
 */
export interface ICharacterCorruptionModel extends Model<ICharacterCorruption> {
  findByCharacterId(characterId: string): Promise<ICharacterCorruption | null>;
  createForCharacter(characterId: string): Promise<ICharacterCorruption>;
}

/**
 * Character Corruption schema definition
 */
const CharacterCorruptionSchema = new Schema<ICharacterCorruption>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },

    // Corruption level
    currentCorruption: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    corruptionLevel: {
      type: String,
      enum: Object.values(CorruptionLevel),
      default: CorruptionLevel.CLEAN
    },
    totalCorruptionGained: {
      type: Number,
      default: 0,
      min: 0
    },
    totalCorruptionPurged: {
      type: Number,
      default: 0,
      min: 0
    },

    // Exposure tracking
    timeInScar: {
      type: Number,
      default: 0,
      min: 0
    },
    lastScarEntry: {
      type: Date
    },
    consecutiveDaysInScar: {
      type: Number,
      default: 0,
      min: 0
    },

    // Knowledge
    forbiddenKnowledge: [{
      type: String,
      enum: Object.values(ForbiddenKnowledgeType)
    }],
    tomesRead: [{ type: String }],
    ritualsLearned: [{ type: String }],
    entitiesEncountered: [{ type: String }],

    // Madness
    activeMadness: [{
      id: { type: String, required: true },
      type: {
        type: String,
        enum: Object.values(MadnessType),
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
    permanentMadness: [{
      type: String,
      enum: Object.values(MadnessType)
    }],
    madnessResistance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Artifacts
    eldritchArtifacts: [{ type: String }],
    cursedItems: [{ type: String }],

    // Physical changes
    physicalMutations: [{ type: String }],
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
    npcFearLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    cosmicAwareness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // History
    corruptionEvents: [{
      timestamp: { type: Date, default: Date.now },
      source: { type: String, required: true },
      corruptionChange: { type: Number, required: true },
      description: { type: String, required: true },
      location: { type: String }
    }],
    deathsToCorruption: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes
 */
CharacterCorruptionSchema.index({ characterId: 1 });
CharacterCorruptionSchema.index({ corruptionLevel: 1 });
CharacterCorruptionSchema.index({ currentCorruption: -1 });

/**
 * Instance method: Gain corruption
 */
CharacterCorruptionSchema.methods.gainCorruption = async function(
  this: ICharacterCorruption,
  amount: number,
  source: string,
  location?: string
): Promise<void> {
  const oldCorruption = this.currentCorruption;
  this.currentCorruption = Math.min(100, this.currentCorruption + amount);
  this.totalCorruptionGained += amount;

  // Update corruption level
  this.updateCorruptionLevel();

  // Record event
  this.addCorruptionEvent(source, amount, location);

  // Check for physical changes at thresholds
  const oldLevel = getCorruptionLevel(oldCorruption);
  const newLevel = this.corruptionLevel;

  if (oldLevel !== newLevel) {
    // Trigger level change effects
    if (newLevel === CorruptionLevel.TOUCHED && !this.eyeChanges) {
      this.eyeChanges = true;
      this.addPhysicalMutation('Eyes reflect light strangely, like oil on water');
    } else if (newLevel === CorruptionLevel.TAINTED && !this.skinChanges) {
      this.skinChanges = true;
      this.addPhysicalMutation('Veins occasionally pulse with darkness beneath skin');
    } else if (newLevel === CorruptionLevel.CORRUPTED && !this.voiceChanges) {
      this.voiceChanges = true;
      this.addPhysicalMutation('Voice carries harmonic overtones');
    }
  }

  await this.save();
};

/**
 * Instance method: Lose corruption (purge)
 */
CharacterCorruptionSchema.methods.loseCorruption = async function(
  this: ICharacterCorruption,
  amount: number,
  method: string
): Promise<void> {
  this.currentCorruption = Math.max(0, this.currentCorruption - amount);
  this.totalCorruptionPurged += amount;

  // Update corruption level
  this.updateCorruptionLevel();

  // Record event
  this.addCorruptionEvent(method, -amount);

  await this.save();
};

/**
 * Instance method: Add forbidden knowledge
 */
CharacterCorruptionSchema.methods.addKnowledge = function(
  this: ICharacterCorruption,
  knowledge: ForbiddenKnowledgeType
): void {
  if (!this.forbiddenKnowledge.includes(knowledge)) {
    if (this.forbiddenKnowledge.length >= COSMIC_HORROR_CONSTANTS.KNOWLEDGE_MAX_PER_CHARACTER) {
      throw new Error('Maximum forbidden knowledge reached');
    }
    this.forbiddenKnowledge.push(knowledge);
    this.cosmicAwareness = Math.min(100, this.cosmicAwareness + 10);
  }
};

/**
 * Instance method: Learn ritual
 */
CharacterCorruptionSchema.methods.learnRitual = function(
  this: ICharacterCorruption,
  ritualId: string
): void {
  if (!this.ritualsLearned.includes(ritualId)) {
    this.ritualsLearned.push(ritualId);
  }
};

/**
 * Instance method: Record entity encounter
 */
CharacterCorruptionSchema.methods.encounterEntity = function(
  this: ICharacterCorruption,
  entityId: string
): void {
  if (!this.entitiesEncountered.includes(entityId)) {
    this.entitiesEncountered.push(entityId);
    this.cosmicAwareness = Math.min(100, this.cosmicAwareness + 5);
  }
};

/**
 * Instance method: Add madness
 */
CharacterCorruptionSchema.methods.addMadness = function(
  this: ICharacterCorruption,
  madness: MadnessEffect
): void {
  // Check max active madness
  if (this.activeMadness.length >= COSMIC_HORROR_CONSTANTS.MAX_ACTIVE_MADNESS) {
    // Remove oldest madness
    this.activeMadness.shift();
  }

  // Calculate expiry if duration is not permanent
  if (madness.duration !== -1) {
    madness.expiresAt = new Date(Date.now() + madness.duration * 60 * 1000);
  }

  this.activeMadness.push(madness);
};

/**
 * Instance method: Remove madness by ID
 */
CharacterCorruptionSchema.methods.removeMadness = function(
  this: ICharacterCorruption,
  madnessId: string
): void {
  this.activeMadness = this.activeMadness.filter(m => m.id !== madnessId);
};

/**
 * Instance method: Add permanent madness
 */
CharacterCorruptionSchema.methods.addPermanentMadness = function(
  this: ICharacterCorruption,
  type: MadnessType
): void {
  if (!this.permanentMadness.includes(type)) {
    this.permanentMadness.push(type);
  }
};

/**
 * Instance method: Remove expired madness
 */
CharacterCorruptionSchema.methods.removeExpiredMadness = function(
  this: ICharacterCorruption
): void {
  const now = Date.now();
  this.activeMadness = this.activeMadness.filter(m => {
    if (!m.expiresAt) return true; // Permanent
    return m.expiresAt.getTime() > now;
  });
};

/**
 * Instance method: Calculate transformation risk
 */
CharacterCorruptionSchema.methods.calculateTransformationRisk = function(
  this: ICharacterCorruption
): number {
  if (this.corruptionLevel !== CorruptionLevel.LOST) {
    return 0;
  }

  return COSMIC_HORROR_CONSTANTS.TRANSFORMATION_BASE_CHANCE_LOST +
    (this.consecutiveDaysInScar * 0.01);
};

/**
 * Instance method: Check if can use artifact
 */
CharacterCorruptionSchema.methods.canUseArtifact = function(
  this: ICharacterCorruption,
  corruptionRequired: number
): boolean {
  return this.currentCorruption >= corruptionRequired;
};

/**
 * Instance method: Add physical mutation
 */
CharacterCorruptionSchema.methods.addPhysicalMutation = function(
  this: ICharacterCorruption,
  mutation: string
): void {
  if (!this.physicalMutations.includes(mutation)) {
    this.physicalMutations.push(mutation);
  }
};

/**
 * Instance method: Update corruption level
 */
CharacterCorruptionSchema.methods.updateCorruptionLevel = function(
  this: ICharacterCorruption
): void {
  this.corruptionLevel = getCorruptionLevel(this.currentCorruption);

  // Update NPC fear level based on corruption
  if (this.corruptionLevel === CorruptionLevel.CLEAN) {
    this.npcFearLevel = 0;
  } else if (this.corruptionLevel === CorruptionLevel.TOUCHED) {
    this.npcFearLevel = 10;
  } else if (this.corruptionLevel === CorruptionLevel.TAINTED) {
    this.npcFearLevel = 30;
  } else if (this.corruptionLevel === CorruptionLevel.CORRUPTED) {
    this.npcFearLevel = 60;
  } else if (this.corruptionLevel === CorruptionLevel.LOST) {
    this.npcFearLevel = 90;
  }
};

/**
 * Instance method: Add corruption event
 */
CharacterCorruptionSchema.methods.addCorruptionEvent = function(
  this: ICharacterCorruption,
  source: string,
  change: number,
  location?: string
): void {
  const description = change > 0
    ? `Gained ${change} corruption from ${source}`
    : `Purged ${Math.abs(change)} corruption via ${source}`;

  this.corruptionEvents.push({
    timestamp: new Date(),
    source,
    corruptionChange: change,
    description,
    location
  });

  // Keep only last 100 events
  if (this.corruptionEvents.length > 100) {
    this.corruptionEvents = this.corruptionEvents.slice(-100);
  }
};

/**
 * Instance method: Return safe object
 */
CharacterCorruptionSchema.methods.toSafeObject = function(this: ICharacterCorruption) {
  return {
    characterId: this.characterId.toString(),
    currentCorruption: this.currentCorruption,
    corruptionLevel: this.corruptionLevel,
    totalCorruptionGained: this.totalCorruptionGained,
    totalCorruptionPurged: this.totalCorruptionPurged,
    timeInScar: this.timeInScar,
    consecutiveDaysInScar: this.consecutiveDaysInScar,
    forbiddenKnowledge: this.forbiddenKnowledge,
    tomesRead: this.tomesRead,
    ritualsLearned: this.ritualsLearned,
    entitiesEncountered: this.entitiesEncountered,
    activeMadness: this.activeMadness,
    permanentMadness: this.permanentMadness,
    madnessResistance: this.madnessResistance,
    eldritchArtifacts: this.eldritchArtifacts,
    cursedItems: this.cursedItems,
    physicalMutations: this.physicalMutations,
    voiceChanges: this.voiceChanges,
    eyeChanges: this.eyeChanges,
    skinChanges: this.skinChanges,
    npcFearLevel: this.npcFearLevel,
    cosmicAwareness: this.cosmicAwareness,
    deathsToCorruption: this.deathsToCorruption,
    recentEvents: this.corruptionEvents.slice(-10),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Static method: Find by character ID
 */
CharacterCorruptionSchema.statics.findByCharacterId = async function(
  characterId: string
): Promise<ICharacterCorruption | null> {
  return this.findOne({ characterId: new mongoose.Types.ObjectId(characterId) });
};

/**
 * Static method: Create for character
 */
CharacterCorruptionSchema.statics.createForCharacter = async function(
  characterId: string
): Promise<ICharacterCorruption> {
  return this.create({
    characterId: new mongoose.Types.ObjectId(characterId),
    currentCorruption: 0,
    corruptionLevel: CorruptionLevel.CLEAN
  });
};

/**
 * Character Corruption model
 */
export const CharacterCorruption = mongoose.model<ICharacterCorruption, ICharacterCorruptionModel>(
  'CharacterCorruption',
  CharacterCorruptionSchema
);
