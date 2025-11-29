/**
 * Faction War Event Model
 *
 * Mongoose schema for large-scale faction conflict events
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  TerritoryFactionId,
  WarEventType,
  WarPhase,
  WarEventStatus,
  ObjectivePriority,
  WarObjectiveType,
  WarRewardType,
} from '@desperados/shared';

/**
 * War objective subdocument
 */
export interface IWarObjective {
  id: string;
  type: WarObjectiveType;
  priority: ObjectivePriority;
  name: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  completedBy?: TerritoryFactionId;
  completedAt?: Date;
  pointsPerProgress: number;
  completionBonus: number;
  timeLimit?: number;
  locationRequired?: string;
  minLevel?: number;
  requiredSkills?: string[];
  startedAt?: Date;
  expiresAt?: Date;
}

/**
 * War reward subdocument
 */
export interface IWarReward {
  type: WarRewardType;
  amount?: number;
  itemId?: string;
  itemName?: string;
  title?: string;
  cosmeticId?: string;
  description: string;
}

/**
 * Faction War Event document interface
 */
export interface IFactionWarEvent extends Document {
  eventType: WarEventType;
  name: string;
  description: string;
  lore: string;

  // Factions
  attackingFaction: TerritoryFactionId;
  defendingFaction: TerritoryFactionId;
  alliedFactions: Map<TerritoryFactionId, 'attacker' | 'defender'>;

  // Territory
  targetTerritory: string;
  adjacentTerritories: string[];

  // Timing
  announcedAt: Date;
  startsAt: Date;
  endsAt: Date;
  currentPhase: WarPhase;

  // Objectives
  primaryObjectives: IWarObjective[];
  secondaryObjectives: IWarObjective[];
  bonusObjectives: IWarObjective[];

  // Scores
  attackerScore: number;
  defenderScore: number;
  objectivesCompleted: Map<string, TerritoryFactionId>;

  // Participants (references stored separately)
  totalParticipants: number;
  attackerCount: number;
  defenderCount: number;

  // Rewards
  victoryRewards: IWarReward[];
  participationRewards: IWarReward[];
  mvpRewards: IWarReward[];

  // Results
  status: WarEventStatus;
  winner?: TerritoryFactionId;
  influenceChange?: number;
  casualties: {
    attacker: number;
    defender: number;
  };

  // Metadata
  templateId: string;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isActive(): boolean;
  isInPhase(phase: WarPhase): boolean;
  canJoin(characterLevel: number): boolean;
  updatePhase(): boolean;
  addScore(faction: TerritoryFactionId, points: number): void;
  completeObjective(objectiveId: string, faction: TerritoryFactionId): boolean;
  getObjective(objectiveId: string): IWarObjective | undefined;
  getAllObjectives(): IWarObjective[];
  calculateWinner(): TerritoryFactionId | undefined;
  toSummary(): any;
}

/**
 * Faction War Event model interface
 */
export interface IFactionWarEventModel extends Model<IFactionWarEvent> {
  findActiveEvents(): Promise<IFactionWarEvent[]>;
  findUpcomingEvents(): Promise<IFactionWarEvent[]>;
  findByTerritory(territory: string): Promise<IFactionWarEvent[]>;
  findByFaction(faction: TerritoryFactionId): Promise<IFactionWarEvent[]>;
}

/**
 * War objective schema
 */
const WarObjectiveSchema = new Schema<IWarObjective>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, enum: Object.values(WarObjectiveType) },
    priority: { type: String, required: true, enum: Object.values(ObjectivePriority) },
    name: { type: String, required: true },
    description: { type: String, required: true },
    target: { type: Number, required: true, min: 1 },
    current: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false },
    completedBy: { type: String, enum: Object.values(TerritoryFactionId) },
    completedAt: { type: Date },
    pointsPerProgress: { type: Number, required: true, min: 0 },
    completionBonus: { type: Number, required: true, min: 0 },
    timeLimit: { type: Number, min: 0 },
    locationRequired: { type: String },
    minLevel: { type: Number, min: 1 },
    requiredSkills: [{ type: String }],
    startedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { _id: false }
);

/**
 * War reward schema
 */
const WarRewardSchema = new Schema<IWarReward>(
  {
    type: { type: String, required: true, enum: Object.values(WarRewardType) },
    amount: { type: Number, min: 0 },
    itemId: { type: String },
    itemName: { type: String },
    title: { type: String },
    cosmeticId: { type: String },
    description: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Faction War Event schema
 */
const FactionWarEventSchema = new Schema<IFactionWarEvent>(
  {
    eventType: {
      type: String,
      required: true,
      enum: Object.values(WarEventType),
      index: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    lore: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    // Factions
    attackingFaction: {
      type: String,
      required: true,
      enum: Object.values(TerritoryFactionId),
      index: true,
    },
    defendingFaction: {
      type: String,
      required: true,
      enum: Object.values(TerritoryFactionId),
      index: true,
    },
    alliedFactions: {
      type: Map,
      of: { type: String, enum: ['attacker', 'defender'] },
      default: new Map(),
    },

    // Territory
    targetTerritory: {
      type: String,
      required: true,
      index: true,
    },
    adjacentTerritories: [{ type: String }],

    // Timing
    announcedAt: {
      type: Date,
      required: true,
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
    currentPhase: {
      type: String,
      required: true,
      enum: Object.values(WarPhase),
      default: WarPhase.ANNOUNCEMENT,
    },

    // Objectives
    primaryObjectives: [WarObjectiveSchema],
    secondaryObjectives: [WarObjectiveSchema],
    bonusObjectives: [WarObjectiveSchema],

    // Scores
    attackerScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    defenderScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    objectivesCompleted: {
      type: Map,
      of: { type: String, enum: Object.values(TerritoryFactionId) },
      default: new Map(),
    },

    // Participants
    totalParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    attackerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    defenderCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Rewards
    victoryRewards: [WarRewardSchema],
    participationRewards: [WarRewardSchema],
    mvpRewards: [WarRewardSchema],

    // Results
    status: {
      type: String,
      required: true,
      enum: Object.values(WarEventStatus),
      default: WarEventStatus.SCHEDULED,
      index: true,
    },
    winner: {
      type: String,
      enum: Object.values(TerritoryFactionId),
    },
    influenceChange: {
      type: Number,
      min: 0,
    },
    casualties: {
      attacker: { type: Number, default: 0, min: 0 },
      defender: { type: Number, default: 0, min: 0 },
    },

    // Metadata
    templateId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
FactionWarEventSchema.index({ status: 1, startsAt: 1 });
FactionWarEventSchema.index({ status: 1, endsAt: 1 });
FactionWarEventSchema.index({ targetTerritory: 1, status: 1 });
FactionWarEventSchema.index({ attackingFaction: 1, status: 1 });
FactionWarEventSchema.index({ defendingFaction: 1, status: 1 });

/**
 * Instance method: Check if event is currently active
 */
FactionWarEventSchema.methods.isActive = function(this: IFactionWarEvent): boolean {
  return this.status === WarEventStatus.ACTIVE;
};

/**
 * Instance method: Check if event is in specific phase
 */
FactionWarEventSchema.methods.isInPhase = function(
  this: IFactionWarEvent,
  phase: WarPhase
): boolean {
  return this.currentPhase === phase;
};

/**
 * Instance method: Check if character can join event
 */
FactionWarEventSchema.methods.canJoin = function(
  this: IFactionWarEvent,
  characterLevel: number
): boolean {
  if (this.status !== WarEventStatus.SCHEDULED && this.status !== WarEventStatus.ACTIVE) {
    return false;
  }

  if (this.currentPhase === WarPhase.RESOLUTION) {
    return false;
  }

  // Check level requirements from objectives
  const allObjectives = this.getAllObjectives();
  const maxMinLevel = Math.max(
    0,
    ...allObjectives.filter(obj => obj.minLevel).map(obj => obj.minLevel!)
  );

  return characterLevel >= maxMinLevel;
};

/**
 * Instance method: Update current phase based on time
 */
FactionWarEventSchema.methods.updatePhase = function(this: IFactionWarEvent): boolean {
  const now = new Date();
  const oldPhase = this.currentPhase;

  if (now >= this.endsAt) {
    this.currentPhase = WarPhase.RESOLUTION;
    this.status = WarEventStatus.COMPLETED;
  } else if (now >= this.startsAt) {
    this.currentPhase = WarPhase.ACTIVE_COMBAT;
    this.status = WarEventStatus.ACTIVE;
  } else if (now >= new Date(this.startsAt.getTime() - 2 * 60 * 60 * 1000)) {
    // 2 hours before start
    this.currentPhase = WarPhase.MOBILIZATION;
  } else {
    this.currentPhase = WarPhase.ANNOUNCEMENT;
  }

  return oldPhase !== this.currentPhase;
};

/**
 * Instance method: Add score to a faction
 */
FactionWarEventSchema.methods.addScore = function(
  this: IFactionWarEvent,
  faction: TerritoryFactionId,
  points: number
): void {
  if (faction === this.attackingFaction || this.alliedFactions.get(faction) === 'attacker') {
    this.attackerScore += points;
  } else if (faction === this.defendingFaction || this.alliedFactions.get(faction) === 'defender') {
    this.defenderScore += points;
  }
};

/**
 * Instance method: Complete an objective
 */
FactionWarEventSchema.methods.completeObjective = function(
  this: IFactionWarEvent,
  objectiveId: string,
  faction: TerritoryFactionId
): boolean {
  const objective = this.getObjective(objectiveId);
  if (!objective || objective.completed) {
    return false;
  }

  objective.completed = true;
  objective.completedBy = faction;
  objective.completedAt = new Date();

  // Add completion bonus to score
  this.addScore(faction, objective.completionBonus);

  // Track completion
  this.objectivesCompleted.set(objectiveId, faction);

  return true;
};

/**
 * Instance method: Get specific objective by ID
 */
FactionWarEventSchema.methods.getObjective = function(
  this: IFactionWarEvent,
  objectiveId: string
): IWarObjective | undefined {
  const allObjectives = this.getAllObjectives();
  return allObjectives.find(obj => obj.id === objectiveId);
};

/**
 * Instance method: Get all objectives
 */
FactionWarEventSchema.methods.getAllObjectives = function(this: IFactionWarEvent): IWarObjective[] {
  return [
    ...this.primaryObjectives,
    ...this.secondaryObjectives,
    ...this.bonusObjectives,
  ];
};

/**
 * Instance method: Calculate winner based on scores
 */
FactionWarEventSchema.methods.calculateWinner = function(
  this: IFactionWarEvent
): TerritoryFactionId | undefined {
  if (this.attackerScore > this.defenderScore) {
    return this.attackingFaction;
  } else if (this.defenderScore > this.attackerScore) {
    return this.defendingFaction;
  }
  return undefined; // Tie
};

/**
 * Instance method: Get event summary
 */
FactionWarEventSchema.methods.toSummary = function(this: IFactionWarEvent) {
  return {
    id: this._id.toString(),
    eventType: this.eventType,
    name: this.name,
    description: this.description,
    attackingFaction: this.attackingFaction,
    defendingFaction: this.defendingFaction,
    targetTerritory: this.targetTerritory,
    status: this.status,
    currentPhase: this.currentPhase,
    startsAt: this.startsAt,
    endsAt: this.endsAt,
    attackerScore: this.attackerScore,
    defenderScore: this.defenderScore,
    totalParticipants: this.totalParticipants,
    winner: this.winner,
  };
};

/**
 * Static method: Find active events
 */
FactionWarEventSchema.statics.findActiveEvents = async function(): Promise<IFactionWarEvent[]> {
  return this.find({ status: WarEventStatus.ACTIVE })
    .sort({ startsAt: 1 })
    .lean() as unknown as IFactionWarEvent[];
};

/**
 * Static method: Find upcoming events
 */
FactionWarEventSchema.statics.findUpcomingEvents = async function(): Promise<IFactionWarEvent[]> {
  const now = new Date();
  return this.find({
    status: WarEventStatus.SCHEDULED,
    startsAt: { $gt: now },
  })
    .sort({ startsAt: 1 })
    .lean() as unknown as IFactionWarEvent[];
};

/**
 * Static method: Find events by territory
 */
FactionWarEventSchema.statics.findByTerritory = async function(
  territory: string
): Promise<IFactionWarEvent[]> {
  return this.find({ targetTerritory: territory })
    .sort({ startsAt: -1 })
    .lean() as unknown as IFactionWarEvent[];
};

/**
 * Static method: Find events involving a faction
 */
FactionWarEventSchema.statics.findByFaction = async function(
  faction: TerritoryFactionId
): Promise<IFactionWarEvent[]> {
  return this.find({
    $or: [
      { attackingFaction: faction },
      { defendingFaction: faction },
    ],
  })
    .sort({ startsAt: -1 })
    .lean() as unknown as IFactionWarEvent[];
};

/**
 * Faction War Event model
 */
export const FactionWarEvent = mongoose.model<IFactionWarEvent, IFactionWarEventModel>(
  'FactionWarEvent',
  FactionWarEventSchema
);
