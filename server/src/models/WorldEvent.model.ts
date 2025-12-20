/**
 * World Event Model
 *
 * Tracks dynamic world events that affect gameplay
 */

import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Event types in the game world
 */
export enum WorldEventType {
  // Combat/Danger Events
  BANDIT_RAID = 'BANDIT_RAID',
  MANHUNT = 'MANHUNT',
  GANG_WAR = 'GANG_WAR',
  OUTLAW_SIGHTING = 'OUTLAW_SIGHTING',

  // Economic Events
  GOLD_RUSH = 'GOLD_RUSH',
  TRADE_CARAVAN = 'TRADE_CARAVAN',
  MARKET_CRASH = 'MARKET_CRASH',
  SUPPLY_SHORTAGE = 'SUPPLY_SHORTAGE',

  // Weather Events
  DUST_STORM = 'DUST_STORM',
  HEAT_WAVE = 'HEAT_WAVE',
  FLASH_FLOOD = 'FLASH_FLOOD',
  WILDFIRE = 'WILDFIRE',

  // Social Events
  TOWN_FESTIVAL = 'TOWN_FESTIVAL',
  ELECTION = 'ELECTION',
  FUNERAL = 'FUNERAL',
  WEDDING = 'WEDDING',

  // Faction Events
  FACTION_RALLY = 'FACTION_RALLY',
  TERRITORY_DISPUTE = 'TERRITORY_DISPUTE',
  PEACE_TALKS = 'PEACE_TALKS',

  // Special Events
  METEOR_SHOWER = 'METEOR_SHOWER',
  ECLIPSE = 'ECLIPSE',
  LEGENDARY_BOUNTY = 'LEGENDARY_BOUNTY',
}

/**
 * Event status
 */
export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Event effect on the world
 */
export interface WorldEffect {
  type: 'price_modifier' | 'danger_modifier' | 'reputation_modifier' | 'spawn_rate' | 'travel_time' | 'energy_cost';
  target: string; // Item ID, location ID, faction, etc.
  value: number; // Multiplier or flat bonus
  description: string;
}

/**
 * Event reward for participation
 */
export interface EventReward {
  type: 'dollars' | 'xp' | 'item' | 'reputation' | 'achievement';
  amount: number;
  itemId?: string;
  faction?: string;
  achievementId?: string;
}

/**
 * Participant tracking
 */
export interface EventParticipant {
  characterId: mongoose.Types.ObjectId;
  joinedAt: Date;
  contribution: number;
  rewarded: boolean;
}

/**
 * World Event document interface
 */
export interface IWorldEvent extends Document {
  // Identity
  name: string;
  description: string;
  type: WorldEventType;
  status: EventStatus;

  // Location
  locationId?: mongoose.Types.ObjectId;
  region?: string;
  isGlobal: boolean;

  // Timing
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;

  // Requirements
  minLevel?: number;
  maxParticipants?: number;
  factionRestriction?: string;

  // Effects
  worldEffects: WorldEffect[];

  // Rewards
  participationRewards: EventReward[];
  completionRewards: EventReward[];

  // Participation
  participants: EventParticipant[];
  participantCount: number;

  // Progress (for events with objectives)
  objectives?: {
    id: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
  }[];

  // Metadata
  isRecurring: boolean;
  recurringPattern?: string; // cron-like pattern
  priority: number; // Higher = more important

  // News/Gossip
  newsHeadline?: string;
  gossipRumors?: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Static methods
 */
export interface IWorldEventModel extends Model<IWorldEvent> {
  getActiveEvents(): Promise<IWorldEvent[]>;
  getEventsInLocation(locationId: string): Promise<IWorldEvent[]>;
  getUpcomingEvents(hours: number): Promise<IWorldEvent[]>;
}

const WorldEffectSchema = new Schema<WorldEffect>(
  {
    type: {
      type: String,
      required: true,
      enum: ['price_modifier', 'danger_modifier', 'reputation_modifier', 'spawn_rate', 'travel_time', 'energy_cost'],
    },
    target: { type: String, required: true },
    value: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const EventRewardSchema = new Schema<EventReward>(
  {
    type: {
      type: String,
      required: true,
      enum: ['gold', 'xp', 'item', 'reputation', 'achievement'],
    },
    amount: { type: Number, required: true },
    itemId: { type: String },
    faction: { type: String },
    achievementId: { type: String },
  },
  { _id: false }
);

const EventParticipantSchema = new Schema<EventParticipant>(
  {
    characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    joinedAt: { type: Date, default: Date.now },
    contribution: { type: Number, default: 0 },
    rewarded: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorldEventSchema = new Schema<IWorldEvent>(
  {
    // Identity
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: Object.values(WorldEventType),
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(EventStatus),
      default: EventStatus.SCHEDULED,
    },

    // Location
    locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
    region: { type: String },
    isGlobal: { type: Boolean, default: false },

    // Timing
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    actualStart: { type: Date },
    actualEnd: { type: Date },

    // Requirements
    minLevel: { type: Number },
    maxParticipants: { type: Number },
    factionRestriction: { type: String },

    // Effects
    worldEffects: [WorldEffectSchema],

    // Rewards
    participationRewards: [EventRewardSchema],
    completionRewards: [EventRewardSchema],

    // Participation
    participants: [EventParticipantSchema],
    participantCount: { type: Number, default: 0 },

    // Progress
    objectives: [{
      id: { type: String, required: true },
      description: { type: String, required: true },
      target: { type: Number, required: true },
      current: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
    }],

    // Metadata
    isRecurring: { type: Boolean, default: false },
    recurringPattern: { type: String },
    priority: { type: Number, default: 1 },

    // News/Gossip
    newsHeadline: { type: String },
    gossipRumors: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Indexes
WorldEventSchema.index({ status: 1 });
WorldEventSchema.index({ scheduledStart: 1 });
WorldEventSchema.index({ locationId: 1 });
WorldEventSchema.index({ type: 1 });
WorldEventSchema.index({ 'participants.characterId': 1 });

// Virtual for id
WorldEventSchema.virtual('id').get(function () {
  return this._id?.toString();
});

// Static methods
WorldEventSchema.statics.getActiveEvents = async function (): Promise<IWorldEvent[]> {
  return this.find({ status: EventStatus.ACTIVE }).sort({ priority: -1 });
};

WorldEventSchema.statics.getEventsInLocation = async function (locationId: string): Promise<IWorldEvent[]> {
  return this.find({
    $or: [
      { locationId },
      { isGlobal: true },
    ],
    status: { $in: [EventStatus.SCHEDULED, EventStatus.ACTIVE] },
  }).sort({ scheduledStart: 1 });
};

WorldEventSchema.statics.getUpcomingEvents = async function (hours: number): Promise<IWorldEvent[]> {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

  return this.find({
    status: EventStatus.SCHEDULED,
    scheduledStart: { $gte: now, $lte: future },
  }).sort({ scheduledStart: 1 });
};

// Ensure virtuals are included
WorldEventSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const WorldEvent = mongoose.model<IWorldEvent, IWorldEventModel>('WorldEvent', WorldEventSchema);
export default WorldEvent;
