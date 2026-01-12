import { model, Schema, Document } from 'mongoose';
import { GossipItem, GossipTopic, GossipSource, GossipVariation } from '@desperados/shared';

/**
 * GOSSIP ITEM MODEL
 * Tracks individual pieces of gossip as they spread through the NPC network
 */

const GossipVariationSchema = new Schema<GossipVariation>(
  {
    versionNumber: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    truthfulness: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    addedDetails: [{
      type: String
    }],
    spreadBy: {
      type: Schema.Types.ObjectId,
      ref: 'NPC',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const GossipItemSchema = new Schema<GossipItem>(
  {
    // Origin
    originalEventId: {
      type: Schema.Types.ObjectId,
      index: true
      // Can be null for pure rumors
    },
    originNPC: {
      type: Schema.Types.ObjectId,
      ref: 'NPC',
      index: true
    },
    source: {
      type: String,
      enum: ['witness', 'newspaper', 'gossip', 'rumor'],
      required: true,
      index: true
    },

    // Subject
    subjectType: {
      type: String,
      enum: ['player', 'npc', 'gang', 'faction', 'location', 'general'],
      required: true,
      index: true
    },
    subjectId: {
      type: String, // Can be ObjectId or string (for factions, locations)
      index: true
    },
    topic: {
      type: String,
      enum: [
        'combat',
        'crime',
        'heroism',
        'romance',
        'business',
        'supernatural',
        'faction',
        'territory',
        'scandal',
        'death',
        'treasure',
        'law',
        'gang',
        'duel',
        'general'
      ],
      required: true,
      index: true
    },

    // Content
    headline: {
      type: String,
      required: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    baseContent: {
      type: String,
      required: true,
      maxlength: 1000
    },
    currentVersion: {
      type: Number,
      default: 0,
      min: 0
    },
    truthfulness: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100
    },

    // Impact
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'shocking'],
      required: true,
      index: true
    },
    notorietyImpact: {
      type: Number,
      default: 0,
      min: -100,
      max: 100
    },

    // Spread tracking
    knownBy: [{
      type: Schema.Types.ObjectId,
      ref: 'NPC'
    }],
    spreadPattern: {
      type: String,
      enum: ['local', 'regional', 'territory', 'global'],
      default: 'local'
    },
    currentReach: {
      type: Number,
      default: 0
    },

    // Temporal
    originDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastSpread: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
      // Note: TTL index defined below
    },
    peakInterest: {
      type: Date
    },

    // Variations
    variations: [GossipVariationSchema],

    // Tags
    tags: [{
      type: String,
      index: true
    }]
  },
  {
    timestamps: true,
    collection: 'gossip_items'
  }
);

// ============================================================================
// INDEXES
// ============================================================================

// Compound indexes for common queries
GossipItemSchema.index({ subjectType: 1, subjectId: 1, expiresAt: 1 });
GossipItemSchema.index({ topic: 1, sentiment: 1, expiresAt: 1 });
GossipItemSchema.index({ originDate: -1, expiresAt: 1 });
GossipItemSchema.index({ spreadPattern: 1, currentReach: 1 });
GossipItemSchema.index({ knownBy: 1 }); // For NPC knowledge lookups

// TTL index for automatic cleanup
GossipItemSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================================================
// METHODS
// ============================================================================

GossipItemSchema.methods.addVariation = function(
  this: Document & GossipItem,
  newContent: string,
  spreadByNPC: string,
  addedDetails: string[]
): void {
  const newVersion = this.currentVersion + 1;

  // Calculate truth degradation
  const degradationRate = 15; // Base degradation percentage
  const newTruthfulness = Math.max(
    0,
    this.truthfulness - degradationRate
  );

  const variation: GossipVariation = {
    versionNumber: newVersion,
    content: newContent,
    truthfulness: newTruthfulness,
    addedDetails,
    spreadBy: spreadByNPC as any,
    createdAt: new Date()
  };

  this.variations.push(variation);
  this.currentVersion = newVersion;
  this.content = newContent;
  this.truthfulness = newTruthfulness;
  this.lastSpread = new Date();
};

GossipItemSchema.methods.addKnower = function(
  this: Document & GossipItem,
  npcId: string
): boolean {
  const npcIdStr = npcId.toString();

  if (!this.knownBy.some(id => id.toString() === npcIdStr)) {
    this.knownBy.push(npcId as any);
    this.currentReach = this.knownBy.length;
    return true;
  }

  return false;
};

GossipItemSchema.methods.isKnownBy = function(
  this: Document & GossipItem,
  npcId: string
): boolean {
  const npcIdStr = npcId.toString();
  return this.knownBy.some(id => id.toString() === npcIdStr);
};

GossipItemSchema.methods.isExpired = function(
  this: Document & GossipItem
): boolean {
  return new Date() > this.expiresAt;
};

GossipItemSchema.methods.getLatestVersion = function(
  this: Document & GossipItem
): GossipVariation | null {
  if (this.variations.length === 0) return null;
  return this.variations[this.variations.length - 1];
};

GossipItemSchema.methods.updateSpreadPattern = function(
  this: Document & GossipItem
): void {
  const reach = this.currentReach;

  if (reach < 10) {
    this.spreadPattern = 'local';
  } else if (reach < 50) {
    this.spreadPattern = 'regional';
  } else if (reach < 200) {
    this.spreadPattern = 'territory';
  } else {
    this.spreadPattern = 'global';
  }
};

// ============================================================================
// STATICS
// ============================================================================

GossipItemSchema.statics.findActiveGossip = function(
  topic?: GossipTopic,
  subjectId?: string
) {
  const query: any = {
    expiresAt: { $gt: new Date() }
  };

  if (topic) {
    query.topic = topic;
  }

  if (subjectId) {
    query.subjectId = subjectId;
  }

  return this.find(query).sort({ originDate: -1 });
};

GossipItemSchema.statics.findGossipKnownByNPC = function(npcId: string) {
  return this.find({
    knownBy: npcId,
    expiresAt: { $gt: new Date() }
  }).sort({ lastSpread: -1 });
};

GossipItemSchema.statics.findSpreadableGossip = function(npcId: string) {
  return this.find({
    knownBy: npcId,
    expiresAt: { $gt: new Date() },
    currentVersion: { $lt: 5 } // Don't spread if too distorted
  }).sort({ lastSpread: 1 }); // Oldest spread first
};

GossipItemSchema.statics.findTrendingGossip = function(limit: number = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.find({
    expiresAt: { $gt: new Date() },
    lastSpread: { $gt: oneDayAgo }
  })
    .sort({ currentReach: -1 })
    .limit(limit);
};

GossipItemSchema.statics.findGossipAboutCharacter = function(characterId: string) {
  return this.find({
    subjectType: 'player',
    subjectId: characterId,
    expiresAt: { $gt: new Date() }
  }).sort({ notorietyImpact: -1 });
};

// ============================================================================
// VIRTUALS
// ============================================================================

GossipItemSchema.virtual('age').get(function(this: Document & GossipItem) {
  const ageMs = Date.now() - this.originDate.getTime();
  return Math.floor(ageMs / (1000 * 60 * 60 * 24)); // Days
});

GossipItemSchema.virtual('daysUntilExpiry').get(function(this: Document & GossipItem) {
  const timeMs = this.expiresAt.getTime() - Date.now();
  return Math.max(0, Math.floor(timeMs / (1000 * 60 * 60 * 24)));
});

GossipItemSchema.virtual('distortionLevel').get(function(this: Document & GossipItem) {
  return 100 - this.truthfulness;
});

// ============================================================================
// EXPORT
// ============================================================================

export const GossipItemModel = model<GossipItem>('GossipItem', GossipItemSchema);
