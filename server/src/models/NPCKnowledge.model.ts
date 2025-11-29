/**
 * NPCKnowledge Model
 *
 * Stores what each NPC knows about player characters
 * Part of Phase 3, Wave 3.2 - Reputation Spreading System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { KnowledgeSource, ReputationEventType } from '@desperados/shared';

/**
 * Known event subdocument
 */
export interface IKnownEvent {
  eventId: string;
  eventType: ReputationEventType;
  perceivedMagnitude: number;
  perceivedSentiment: number;
  source: KnowledgeSource;
  heardFrom?: string;
  hopDistance: number;
  learnedAt: Date;
  credibility: number;
}

/**
 * NPCKnowledge document interface
 */
export interface INPCKnowledge extends Document {
  npcId: string;
  characterId: mongoose.Types.ObjectId;
  events: IKnownEvent[];
  overallOpinion: number;
  lastUpdated: Date;
  positiveEvents: number;
  negativeEvents: number;
  neutralEvents: number;
  trustLevel: number;
  fearLevel: number;
  respectLevel: number;
  firstKnowledgeDate?: Date;
  lastInteractionDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addEvent(event: IKnownEvent): void;
  removeEvent(eventId: string): void;
  recalculateOpinion(): void;
  getEventsByType(eventType: ReputationEventType): IKnownEvent[];
  getMostRecentEvent(): IKnownEvent | null;
}

/**
 * NPCKnowledge static methods interface
 */
export interface INPCKnowledgeModel extends Model<INPCKnowledge> {
  findByNPC(npcId: string): Promise<INPCKnowledge[]>;
  findByCharacter(characterId: string): Promise<INPCKnowledge[]>;
  findKnowledge(npcId: string, characterId: string): Promise<INPCKnowledge | null>;
  createOrUpdate(npcId: string, characterId: string, event: IKnownEvent): Promise<INPCKnowledge>;
}

/**
 * Known event schema
 */
const KnownEventSchema = new Schema<IKnownEvent>(
  {
    eventId: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true,
      enum: Object.values(ReputationEventType)
    },
    perceivedMagnitude: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    perceivedSentiment: {
      type: Number,
      required: true,
      min: -100,
      max: 100
    },
    source: {
      type: String,
      required: true,
      enum: Object.values(KnowledgeSource)
    },
    heardFrom: {
      type: String,
      required: false
    },
    hopDistance: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    learnedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    credibility: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100
    }
  },
  { _id: false }
);

/**
 * NPCKnowledge schema
 */
const NPCKnowledgeSchema = new Schema<INPCKnowledge>(
  {
    npcId: {
      type: String,
      required: true,
      index: true
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    events: {
      type: [KnownEventSchema],
      default: []
    },
    overallOpinion: {
      type: Number,
      required: true,
      min: -100,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now
    },
    positiveEvents: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    negativeEvents: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    neutralEvents: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    trustLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50
    },
    fearLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0
    },
    respectLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50
    },
    firstKnowledgeDate: {
      type: Date,
      required: false
    },
    lastInteractionDate: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
NPCKnowledgeSchema.index({ npcId: 1, characterId: 1 }, { unique: true });
NPCKnowledgeSchema.index({ characterId: 1, overallOpinion: -1 });
NPCKnowledgeSchema.index({ lastUpdated: -1 });

/**
 * Instance method: Add event to knowledge
 */
NPCKnowledgeSchema.methods.addEvent = function(event: IKnownEvent): void {
  // Check if event already exists
  const existingIndex = this.events.findIndex(e => e.eventId === event.eventId);

  if (existingIndex >= 0) {
    // Update existing event if new one has higher credibility
    if (event.credibility > this.events[existingIndex].credibility) {
      this.events[existingIndex] = event;
    }
  } else {
    // Add new event
    this.events.push(event);

    // Set first knowledge date if not set
    if (!this.firstKnowledgeDate) {
      this.firstKnowledgeDate = event.learnedAt;
    }
  }

  // Update counters
  if (event.perceivedSentiment > 20) {
    this.positiveEvents++;
  } else if (event.perceivedSentiment < -20) {
    this.negativeEvents++;
  } else {
    this.neutralEvents++;
  }

  this.lastUpdated = new Date();
  this.recalculateOpinion();
};

/**
 * Instance method: Remove event from knowledge
 */
NPCKnowledgeSchema.methods.removeEvent = function(eventId: string): void {
  const index = this.events.findIndex(e => e.eventId === eventId);

  if (index >= 0) {
    const event = this.events[index];

    // Update counters
    if (event.perceivedSentiment > 20) {
      this.positiveEvents = Math.max(0, this.positiveEvents - 1);
    } else if (event.perceivedSentiment < -20) {
      this.negativeEvents = Math.max(0, this.negativeEvents - 1);
    } else {
      this.neutralEvents = Math.max(0, this.neutralEvents - 1);
    }

    this.events.splice(index, 1);
    this.lastUpdated = new Date();
    this.recalculateOpinion();
  }
};

/**
 * Instance method: Recalculate overall opinion based on events
 */
NPCKnowledgeSchema.methods.recalculateOpinion = function(): void {
  if (this.events.length === 0) {
    this.overallOpinion = 0;
    this.trustLevel = 50;
    this.fearLevel = 0;
    this.respectLevel = 50;
    return;
  }

  let totalWeightedSentiment = 0;
  let totalWeight = 0;
  let totalFear = 0;
  let totalRespect = 0;

  for (const event of this.events) {
    // Weight by magnitude and credibility
    const weight = (event.perceivedMagnitude / 100) * (event.credibility / 100);

    // Recent events matter more (decay over time)
    const ageInDays = (Date.now() - event.learnedAt.getTime()) / (1000 * 60 * 60 * 24);
    const timeFactor = Math.max(0.3, 1 - (ageInDays / 30)); // Min 30% weight for old events

    const effectiveWeight = weight * timeFactor;

    totalWeightedSentiment += event.perceivedSentiment * effectiveWeight;
    totalWeight += effectiveWeight;

    // Fear increases with negative high-magnitude events
    if (event.perceivedSentiment < -30 && event.perceivedMagnitude > 50) {
      totalFear += event.perceivedMagnitude * 0.5;
    }

    // Respect increases with any high-magnitude events (good or bad)
    if (event.perceivedMagnitude > 60) {
      totalRespect += event.perceivedMagnitude * 0.4;
    }
  }

  // Calculate overall opinion
  this.overallOpinion = totalWeight > 0
    ? Math.round(totalWeightedSentiment / totalWeight)
    : 0;

  // Calculate trust (positive events increase trust, negative decrease it)
  const posRatio = this.events.length > 0
    ? this.positiveEvents / this.events.length
    : 0.5;
  const negRatio = this.events.length > 0
    ? this.negativeEvents / this.events.length
    : 0;

  this.trustLevel = Math.round(Math.max(0, Math.min(100, 50 + (posRatio * 50) - (negRatio * 50))));

  // Calculate fear and respect (capped at 100)
  this.fearLevel = Math.round(Math.min(100, totalFear / this.events.length));
  this.respectLevel = Math.round(Math.min(100, 50 + (totalRespect / this.events.length)));
};

/**
 * Instance method: Get events by type
 */
NPCKnowledgeSchema.methods.getEventsByType = function(
  eventType: ReputationEventType
): IKnownEvent[] {
  return this.events.filter(e => e.eventType === eventType);
};

/**
 * Instance method: Get most recent event
 */
NPCKnowledgeSchema.methods.getMostRecentEvent = function(): IKnownEvent | null {
  if (this.events.length === 0) return null;

  return this.events.reduce((most, current) => {
    return current.learnedAt > most.learnedAt ? current : most;
  });
};

/**
 * Static method: Find all knowledge for an NPC
 */
NPCKnowledgeSchema.statics.findByNPC = async function(
  npcId: string
): Promise<INPCKnowledge[]> {
  return this.find({ npcId }).sort({ overallOpinion: -1 });
};

/**
 * Static method: Find all NPCs who know about a character
 */
NPCKnowledgeSchema.statics.findByCharacter = async function(
  characterId: string
): Promise<INPCKnowledge[]> {
  return this.find({ characterId }).sort({ overallOpinion: -1 });
};

/**
 * Static method: Find knowledge between specific NPC and character
 */
NPCKnowledgeSchema.statics.findKnowledge = async function(
  npcId: string,
  characterId: string
): Promise<INPCKnowledge | null> {
  return this.findOne({ npcId, characterId });
};

/**
 * Static method: Create or update NPC knowledge
 */
NPCKnowledgeSchema.statics.createOrUpdate = async function(
  npcId: string,
  characterId: string,
  event: IKnownEvent
): Promise<INPCKnowledge> {
  let knowledge = await this.findOne({ npcId, characterId });

  if (!knowledge) {
    knowledge = new this({
      npcId,
      characterId,
      events: [],
      overallOpinion: 0,
      lastUpdated: new Date(),
      positiveEvents: 0,
      negativeEvents: 0,
      neutralEvents: 0,
      trustLevel: 50,
      fearLevel: 0,
      respectLevel: 50
    });
  }

  knowledge.addEvent(event);
  await knowledge.save();

  return knowledge;
};

/**
 * NPCKnowledge model
 */
export const NPCKnowledge = mongoose.model<INPCKnowledge, INPCKnowledgeModel>(
  'NPCKnowledge',
  NPCKnowledgeSchema
);
