/**
 * Gang War Model
 *
 * Mongoose schema for comprehensive gang warfare system
 * Supports war phases, missions, battles, prisoners, and scoring
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  GangWarType,
  GangWarStatus,
  WarMissionType,
  WarMissionStatus,
  WarBattleOutcome,
  WarOutcome,
  WarMission,
  WarBattle,
  WarCasualty,
  WarPrisoner,
  WarAlliance,
  WarChest,
  WAR_REQUIREMENTS,
  WarStatus,
} from '@desperados/shared';

/**
 * War mission subdocument
 */
const WarMissionSchema = new Schema<WarMission>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(WarMissionType),
      required: true,
    },
    assignedTo: {
      type: String,
      required: true,
    },
    targetType: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(WarMissionStatus),
      required: true,
      default: WarMissionStatus.AVAILABLE,
    },
    reward: {
      points: { type: Number, required: true },
      gold: { type: Number },
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    assignedCharacters: [{ type: String }],
    startedAt: { type: Date },
    completedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

/**
 * War battle subdocument
 */
const WarBattleSchema = new Schema<WarBattle>(
  {
    id: { type: String, required: true },
    zoneId: { type: String, required: true },
    attackers: [{ type: String }],
    defenders: [{ type: String }],
    outcome: {
      type: String,
      enum: Object.values(WarBattleOutcome),
      required: true,
    },
    pointsAwarded: {
      attacker: { type: Number, required: true },
      defender: { type: Number, required: true },
    },
    casualties: [{ type: String }],
    damageDealt: {
      attacker: { type: Number, default: 0 },
      defender: { type: Number, default: 0 },
    },
    occurredAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

/**
 * War casualty subdocument
 */
const WarCasualtySchema = new Schema<WarCasualty>(
  {
    characterId: { type: String, required: true },
    characterName: { type: String, required: true },
    gangId: { type: String, required: true },
    killedBy: { type: String },
    occurredAt: { type: Date, required: true, default: Date.now },
    pointsLost: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * War prisoner subdocument
 */
const WarPrisonerSchema = new Schema<WarPrisoner>(
  {
    characterId: { type: String, required: true },
    characterName: { type: String, required: true },
    capturedBy: { type: String, required: true },
    capturedAt: { type: Date, required: true, default: Date.now },
    ransomAmount: { type: Number, required: true, min: 0 },
    released: { type: Boolean, default: false },
    releasedAt: { type: Date },
  },
  { _id: false }
);

/**
 * Gang War document interface
 */
export interface IGangWar extends Document {
  attackerGangId: mongoose.Types.ObjectId;
  attackerGangName: string;
  attackerGangTag: string;
  defenderGangId: mongoose.Types.ObjectId;
  defenderGangName: string;
  defenderGangTag: string;

  warType: GangWarType;
  status: GangWarStatus;

  declaredAt: Date;
  startsAt: Date;
  endsAt?: Date;
  maxDuration: number;

  targetScore: number;
  attackerScore: number;
  defenderScore: number;

  contestedZones: string[];

  warChest: WarChest;

  missions: WarMission[];
  battles: WarBattle[];
  casualties: WarCasualty[];
  prisoners: WarPrisoner[];

  allies: WarAlliance;

  outcome?: WarOutcome;

  // Territory-specific fields (for old territory war system)
  territoryId?: string;
  capturePoints?: number;
  attackerContributions?: Array<{ characterId: mongoose.Types.ObjectId; characterName: string; amount: number }>;
  defenderContributions?: Array<{ characterId: mongoose.Types.ObjectId; characterName: string; amount: number }>;
  attackerFunding?: number;
  defenderFunding?: number;
  resolveAt?: Date;
  resolvedAt?: Date | null;
  warLog?: Array<{ timestamp: Date; event: string; data: any }>;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isInPreparation(): boolean;
  isActive(): boolean;
  isResolved(): boolean;
  canStartWar(): boolean;
  startWar(): void;
  endWar(outcome: WarOutcome): void;
  addMission(mission: WarMission): void;
  updateMissionStatus(missionId: string, status: WarMissionStatus): void;
  recordBattle(battle: WarBattle): void;
  recordCasualty(casualty: WarCasualty): void;
  capturePrisoner(prisoner: WarPrisoner): void;
  releasePrisoner(characterId: string): void;
  updateScore(gangId: string, points: number): void;
  getWinner(): 'attacker' | 'defender' | 'draw';
  hasReachedTargetScore(): boolean;
  hasExpired(): boolean;
  contribute(characterId: mongoose.Types.ObjectId, characterName: string, side: 'attacker' | 'defender', amount: number): void;
  resolve(): Promise<{ winner: 'attacker' | 'defender'; capturePoints: number }>;
}

/**
 * Gang War model interface
 */
export interface IGangWarModel extends Model<IGangWar> {
  findActiveByGang(gangId: mongoose.Types.ObjectId): Promise<IGangWar[]>;
  findActiveWars(): Promise<IGangWar[]>;
  findByGang(gangId: mongoose.Types.ObjectId): Promise<IGangWar[]>;
  findPreparationWars(): Promise<IGangWar[]>;
  findExpiredWars(): Promise<IGangWar[]>;
}

/**
 * Gang War schema definition
 */
const GangWarSchema = new Schema<IGangWar>(
  {
    attackerGangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      index: true,
    },
    attackerGangName: { type: String, required: true },
    attackerGangTag: { type: String, required: true },

    defenderGangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      index: true,
    },
    defenderGangName: { type: String, required: true },
    defenderGangTag: { type: String, required: true },

    warType: {
      type: String,
      enum: Object.values(GangWarType),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(GangWarStatus),
      required: true,
      default: GangWarStatus.DECLARED,
      index: true,
    },

    declaredAt: { type: Date, required: true, default: Date.now },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    maxDuration: {
      type: Number,
      required: true,
      min: WAR_REQUIREMENTS.MIN_DURATION_DAYS,
      max: WAR_REQUIREMENTS.MAX_DURATION_DAYS,
      default: WAR_REQUIREMENTS.DEFAULT_DURATION_DAYS,
    },

    targetScore: { type: Number, required: true, default: 1000 },
    attackerScore: { type: Number, required: true, default: 0 },
    defenderScore: { type: Number, required: true, default: 0 },

    contestedZones: [{ type: String }],

    warChest: {
      attacker: { type: Number, required: true, default: 0, min: 0 },
      defender: { type: Number, required: true, default: 0, min: 0 },
    },

    missions: [WarMissionSchema],
    battles: [WarBattleSchema],
    casualties: [WarCasualtySchema],
    prisoners: [WarPrisonerSchema],

    allies: {
      attackerAllies: [{ type: Schema.Types.ObjectId, ref: 'Gang' }],
      defenderAllies: [{ type: Schema.Types.ObjectId, ref: 'Gang' }],
    },

    outcome: {
      type: String,
      enum: Object.values(WarOutcome),
    },

    // Territory-specific fields (for old territory war system)
    territoryId: { type: String },
    capturePoints: { type: Number },
    attackerContributions: [{
      characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
      characterName: { type: String },
      amount: { type: Number }
    }],
    defenderContributions: [{
      characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
      characterName: { type: String },
      amount: { type: Number }
    }],
    attackerFunding: { type: Number },
    defenderFunding: { type: Number },
    resolveAt: { type: Date },
    resolvedAt: { type: Date },
    warLog: [{
      timestamp: { type: Date },
      event: { type: String },
      data: { type: Schema.Types.Mixed }
    }],
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
GangWarSchema.index({ attackerGangId: 1, status: 1 });
GangWarSchema.index({ defenderGangId: 1, status: 1 });
GangWarSchema.index({ status: 1, startsAt: 1 });
GangWarSchema.index({ status: 1, endsAt: 1 });

/**
 * Instance method: Check if war is in preparation phase
 */
GangWarSchema.methods.isInPreparation = function (this: IGangWar): boolean {
  return this.status === GangWarStatus.PREPARATION;
};

/**
 * Instance method: Check if war is active
 */
GangWarSchema.methods.isActive = function (this: IGangWar): boolean {
  return this.status === GangWarStatus.ACTIVE;
};

/**
 * Instance method: Check if war is resolved
 */
GangWarSchema.methods.isResolved = function (this: IGangWar): boolean {
  return this.status === GangWarStatus.RESOLVED;
};

/**
 * Instance method: Check if war can start (preparation period ended)
 */
GangWarSchema.methods.canStartWar = function (this: IGangWar): boolean {
  return (
    this.status === GangWarStatus.PREPARATION &&
    new Date() >= this.startsAt
  );
};

/**
 * Instance method: Start the war
 */
GangWarSchema.methods.startWar = function (this: IGangWar): void {
  if (!this.canStartWar()) {
    throw new Error('War cannot start yet');
  }
  this.status = GangWarStatus.ACTIVE;
};

/**
 * Instance method: End the war with outcome
 */
GangWarSchema.methods.endWar = function (this: IGangWar, outcome: WarOutcome): void {
  this.status = GangWarStatus.RESOLVED;
  this.outcome = outcome;
  this.endsAt = new Date();
};

/**
 * Instance method: Add a mission
 */
GangWarSchema.methods.addMission = function (this: IGangWar, mission: WarMission): void {
  this.missions.push(mission);
};

/**
 * Instance method: Update mission status
 */
GangWarSchema.methods.updateMissionStatus = function (
  this: IGangWar,
  missionId: string,
  status: WarMissionStatus
): void {
  const mission = this.missions.find((m) => m.id === missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }
  mission.status = status;
  if (status === WarMissionStatus.COMPLETED) {
    mission.completedAt = new Date();
  }
};

/**
 * Instance method: Record a battle
 */
GangWarSchema.methods.recordBattle = function (this: IGangWar, battle: WarBattle): void {
  this.battles.push(battle);

  // Update scores based on battle outcome
  this.attackerScore += battle.pointsAwarded.attacker;
  this.defenderScore += battle.pointsAwarded.defender;
};

/**
 * Instance method: Record a casualty
 */
GangWarSchema.methods.recordCasualty = function (this: IGangWar, casualty: WarCasualty): void {
  this.casualties.push(casualty);
};

/**
 * Instance method: Capture a prisoner
 */
GangWarSchema.methods.capturePrisoner = function (this: IGangWar, prisoner: WarPrisoner): void {
  this.prisoners.push(prisoner);
};

/**
 * Instance method: Release a prisoner
 */
GangWarSchema.methods.releasePrisoner = function (this: IGangWar, characterId: string): void {
  const prisoner = this.prisoners.find(
    (p) => p.characterId.toString() === characterId && !p.released
  );
  if (!prisoner) {
    throw new Error('Prisoner not found or already released');
  }
  prisoner.released = true;
  prisoner.releasedAt = new Date();
};

/**
 * Instance method: Update score for a gang
 */
GangWarSchema.methods.updateScore = function (
  this: IGangWar,
  gangId: string,
  points: number
): void {
  if (this.attackerGangId.toString() === gangId) {
    this.attackerScore = Math.max(0, this.attackerScore + points);
  } else if (this.defenderGangId.toString() === gangId) {
    this.defenderScore = Math.max(0, this.defenderScore + points);
  } else {
    throw new Error('Gang not involved in this war');
  }
};

/**
 * Instance method: Get the winner
 */
GangWarSchema.methods.getWinner = function (this: IGangWar): 'attacker' | 'defender' | 'draw' {
  if (this.attackerScore > this.defenderScore) {
    return 'attacker';
  } else if (this.defenderScore > this.attackerScore) {
    return 'defender';
  }
  return 'draw';
};

/**
 * Instance method: Check if any gang has reached target score
 */
GangWarSchema.methods.hasReachedTargetScore = function (this: IGangWar): boolean {
  return this.attackerScore >= this.targetScore || this.defenderScore >= this.targetScore;
};

/**
 * Instance method: Check if war has expired (max duration reached)
 */
GangWarSchema.methods.hasExpired = function (this: IGangWar): boolean {
  if (this.status !== GangWarStatus.ACTIVE) {
    return false;
  }
  const maxEndTime = new Date(this.startsAt.getTime() + this.maxDuration * 24 * 60 * 60 * 1000);
  return new Date() >= maxEndTime;
};

/**
 * Static method: Find active wars for a gang
 */
GangWarSchema.statics.findActiveByGang = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IGangWar[]> {
  return this.find({
    $or: [{ attackerGangId: gangId }, { defenderGangId: gangId }],
    status: { $in: [GangWarStatus.PREPARATION, GangWarStatus.ACTIVE] },
  });
};

/**
 * Static method: Find all active wars
 */
GangWarSchema.statics.findActiveWars = async function (): Promise<IGangWar[]> {
  return this.find({
    status: GangWarStatus.ACTIVE,
  }).sort({ startsAt: 1 });
};

/**
 * Static method: Find all wars for a gang
 */
GangWarSchema.statics.findByGang = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IGangWar[]> {
  return this.find({
    $or: [{ attackerGangId: gangId }, { defenderGangId: gangId }],
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Find wars in preparation phase
 */
GangWarSchema.statics.findPreparationWars = async function (): Promise<IGangWar[]> {
  return this.find({
    status: GangWarStatus.PREPARATION,
    startsAt: { $lte: new Date() },
  });
};

/**
 * Static method: Find expired wars
 */
GangWarSchema.statics.findExpiredWars = async function (): Promise<IGangWar[]> {
  const now = new Date();
  return this.find({
    status: GangWarStatus.ACTIVE,
  }).then((wars) => wars.filter((war) => war.hasExpired()));
};

/**
 * Instance method: Contribute gold to war (for old territory war system)
 */
GangWarSchema.methods.contribute = function (
  this: IGangWar,
  characterId: mongoose.Types.ObjectId,
  characterName: string,
  side: 'attacker' | 'defender',
  amount: number
): void {
  const contribution = {
    characterId,
    characterName,
    amount,
  };

  if (side === 'attacker') {
    if (!this.attackerContributions) {
      this.attackerContributions = [];
    }
    this.attackerContributions.push(contribution);
    if (this.attackerFunding !== undefined) {
      this.attackerFunding += amount;
    }
  } else {
    if (!this.defenderContributions) {
      this.defenderContributions = [];
    }
    this.defenderContributions.push(contribution);
    if (this.defenderFunding !== undefined) {
      this.defenderFunding += amount;
    }
  }

  // Update capture points based on funding difference
  if (this.capturePoints !== undefined && this.attackerFunding !== undefined && this.defenderFunding !== undefined) {
    const fundingRatio = this.attackerFunding / (this.attackerFunding + this.defenderFunding);
    this.capturePoints = Math.round(fundingRatio * 100);
  }
};

/**
 * Instance method: Resolve war and determine winner (for old territory war system)
 */
GangWarSchema.methods.resolve = async function (
  this: IGangWar
): Promise<{ winner: 'attacker' | 'defender'; capturePoints: number }> {
  const capturePoints = this.capturePoints || 50;
  const winner = capturePoints >= 50 ? 'attacker' : 'defender';

  this.status = winner === 'attacker' ? GangWarStatus.RESOLVED : GangWarStatus.RESOLVED;
  this.resolvedAt = new Date();

  if (this.warLog) {
    this.warLog.push({
      timestamp: new Date(),
      event: 'WAR_RESOLVED',
      data: {
        winner,
        capturePoints,
        attackerFunding: this.attackerFunding,
        defenderFunding: this.defenderFunding,
      },
    });
  }

  return { winner, capturePoints };
};

/**
 * Gang War model
 */
export const GangWar = mongoose.model<IGangWar, IGangWarModel>(
  'GangWar',
  GangWarSchema
);

/**
 * Re-export types for convenience
 */
export { WarStatus };
