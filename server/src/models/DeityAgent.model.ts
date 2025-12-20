/**
 * DeityAgent Model
 *
 * Hybrid NPC/Character entity representing hidden divine forces.
 * Two deities exist: "The Gambler" (Order) and "The Outlaw King" (Chaos)
 *
 * They observe player actions, track karma relationships, and intervene
 * through dreams, omens, whispers, and disguised encounters.
 */

import { Schema, model, Document, Types } from 'mongoose';

export interface IDeityDomain {
  name: string;                    // e.g., "fate", "chaos", "mercy"
  power: number;                   // 0-100, deity's strength in this domain
  playerAffinity: Map<string, number>;  // characterId -> affinity (-100 to +100)
}

export interface IDeityManifestation {
  form: 'dream' | 'omen' | 'whisper' | 'stranger' | 'animal' | 'phenomenon';
  description: string;
  lastUsed: Date | null;
  cooldownHours: number;
}

export interface IDeityAgent extends Document {
  // Identity
  name: string;                    // "The Gambler" or "The Outlaw King"
  trueName: string;                // Hidden name revealed only at max affinity
  archetype: 'ORDER' | 'CHAOS';

  // NPC-like properties
  currentDisguise: string | null;  // NPC they're currently manifesting as
  mood: 'PLEASED' | 'NEUTRAL' | 'DISPLEASED' | 'WRATHFUL' | 'AMUSED';
  dialogueStyle: string;           // Template key for their voice

  // Character-like properties
  level: number;                   // Grows with player engagement
  experience: number;
  stats: {
    influence: number;             // World manipulation power
    patience: number;              // How long they wait before acting
    wrath: number;                 // How severely they punish
    benevolence: number;           // How generously they reward
  };

  // Domains of power
  domains: IDeityDomain[];

  // Manifestation tracking
  manifestations: IDeityManifestation[];
  lastGlobalIntervention: Date | null;
  interventionCooldownHours: number;

  // Player relationships
  favoredCharacters: Types.ObjectId[];    // Top affinity characters
  cursedCharacters: Types.ObjectId[];     // Negative affinity characters

  // World state
  currentPhase: 'DORMANT' | 'WATCHING' | 'ACTIVE' | 'INTERVENING';
  powerLevel: number;              // 0-100, affects intervention strength

  // Statistics
  totalManifestations: number;
  totalBlessingsGiven: number;
  totalCursesGiven: number;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  canIntervene(): boolean;
  recordManifestation(form: string): void;
  getManifestationCooldown(form: string): number;
}

const DeityDomainSchema = new Schema({
  name: { type: String, required: true },
  power: { type: Number, default: 50, min: 0, max: 100 },
  playerAffinity: { type: Map, of: Number, default: () => new Map() }
}, { _id: false });

const DeityManifestationSchema = new Schema({
  form: {
    type: String,
    enum: ['dream', 'omen', 'whisper', 'stranger', 'animal', 'phenomenon'],
    required: true
  },
  description: { type: String, required: true },
  lastUsed: { type: Date, default: null },
  cooldownHours: { type: Number, default: 24 }
}, { _id: false });

const DeityAgentSchema = new Schema<IDeityAgent>({
  // Identity
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['The Gambler', 'The Outlaw King']
  },
  trueName: { type: String, required: true },
  archetype: {
    type: String,
    enum: ['ORDER', 'CHAOS'],
    required: true
  },

  // NPC-like properties
  currentDisguise: { type: String, default: null },
  mood: {
    type: String,
    enum: ['PLEASED', 'NEUTRAL', 'DISPLEASED', 'WRATHFUL', 'AMUSED'],
    default: 'NEUTRAL'
  },
  dialogueStyle: { type: String, required: true },

  // Character-like properties
  level: { type: Number, default: 1, min: 1, max: 100 },
  experience: { type: Number, default: 0, min: 0 },
  stats: {
    influence: { type: Number, default: 50, min: 0, max: 100 },
    patience: { type: Number, default: 50, min: 0, max: 100 },
    wrath: { type: Number, default: 50, min: 0, max: 100 },
    benevolence: { type: Number, default: 50, min: 0, max: 100 }
  },

  // Domains of power
  domains: [DeityDomainSchema],

  // Manifestation tracking
  manifestations: [DeityManifestationSchema],
  lastGlobalIntervention: { type: Date, default: null },
  interventionCooldownHours: { type: Number, default: 168 }, // 1 week default

  // Player relationships
  favoredCharacters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  cursedCharacters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],

  // World state
  currentPhase: {
    type: String,
    enum: ['DORMANT', 'WATCHING', 'ACTIVE', 'INTERVENING'],
    default: 'WATCHING'
  },
  powerLevel: { type: Number, default: 50, min: 0, max: 100 },

  // Statistics
  totalManifestations: { type: Number, default: 0 },
  totalBlessingsGiven: { type: Number, default: 0 },
  totalCursesGiven: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'deityagents'
});

// Indexes
DeityAgentSchema.index({ archetype: 1 });
DeityAgentSchema.index({ currentPhase: 1 });
DeityAgentSchema.index({ 'favoredCharacters': 1 });
DeityAgentSchema.index({ 'cursedCharacters': 1 });

// Methods
DeityAgentSchema.methods.canIntervene = function(): boolean {
  if (!this.lastGlobalIntervention) return true;
  const hoursSince = (Date.now() - this.lastGlobalIntervention.getTime()) / (1000 * 60 * 60);
  return hoursSince >= this.interventionCooldownHours;
};

DeityAgentSchema.methods.getManifestationCooldown = function(form: string): number {
  const manifestation = this.manifestations.find((m: IDeityManifestation) => m.form === form);
  if (!manifestation || !manifestation.lastUsed) return 0;

  const hoursSince = (Date.now() - manifestation.lastUsed.getTime()) / (1000 * 60 * 60);
  return Math.max(0, manifestation.cooldownHours - hoursSince);
};

DeityAgentSchema.methods.recordManifestation = function(form: string): void {
  const manifestation = this.manifestations.find((m: IDeityManifestation) => m.form === form);
  if (manifestation) {
    manifestation.lastUsed = new Date();
  }
  this.totalManifestations++;
  this.lastGlobalIntervention = new Date();
};

export const DeityAgent = model<IDeityAgent>('DeityAgent', DeityAgentSchema);
