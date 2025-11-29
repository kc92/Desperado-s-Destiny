/**
 * Gang Heist Model
 *
 * Mongoose schema for gang heist planning and execution
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  HeistTarget,
  HeistRole,
  HeistStatus,
  HeistOutcome,
  HeistRoleAssignment,
} from '@desperados/shared';

/**
 * Gang Heist document interface
 */
export interface IGangHeist extends Document {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  target: HeistTarget;
  targetName: string;
  targetLocation: string;
  potentialPayout: {
    min: number;
    max: number;
  };
  requiredMembers: number;
  roles: HeistRoleAssignment[];
  planningProgress: number;
  equipmentCost: number;
  riskLevel: number;
  heatLevel: number;
  status: HeistStatus;
  outcome?: HeistOutcome;
  actualPayout?: number;
  arrested?: mongoose.Types.ObjectId[];
  casualties?: mongoose.Types.ObjectId[];
  scheduledDate?: Date;
  completedDate?: Date;
  createdAt: Date;

  // Methods
  isFullyStaffed(): boolean;
  canExecute(): boolean;
  addRoleAssignment(role: HeistRole, characterId: string, characterName: string, skillLevel: number): void;
  removeRoleAssignment(characterId: string): void;
  increasePlanningProgress(amount: number): void;
  calculateSuccessChance(): number;
  executeHeist(): Promise<{
    outcome: HeistOutcome;
    payout: number;
    arrested: string[];
    casualties: string[];
  }>;
}

/**
 * Heist Role Assignment Schema
 */
const HeistRoleAssignmentSchema = new Schema<HeistRoleAssignment>(
  {
    role: {
      type: String,
      enum: Object.values(HeistRole),
      required: true,
    },
    characterId: {
      type: String,
      required: true,
    },
    characterName: {
      type: String,
      required: true,
    },
    skillLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
  },
  { _id: false }
);

/**
 * Gang Heist schema definition
 */
const GangHeistSchema = new Schema<IGangHeist>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      index: true,
    },
    gangName: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      enum: Object.values(HeistTarget),
      required: true,
    },
    targetName: {
      type: String,
      required: true,
    },
    targetLocation: {
      type: String,
      required: true,
    },
    potentialPayout: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    requiredMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    roles: {
      type: [HeistRoleAssignmentSchema],
      default: [],
    },
    planningProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    equipmentCost: {
      type: Number,
      required: true,
      min: 0,
    },
    riskLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    heatLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: Object.values(HeistStatus),
      default: HeistStatus.PLANNING,
      index: true,
    },
    outcome: {
      type: String,
      enum: Object.values(HeistOutcome),
    },
    actualPayout: {
      type: Number,
      min: 0,
    },
    arrested: {
      type: [Schema.Types.ObjectId],
      ref: 'Character',
      default: [],
    },
    casualties: {
      type: [Schema.Types.ObjectId],
      ref: 'Character',
      default: [],
    },
    scheduledDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
GangHeistSchema.index({ gangId: 1, status: 1 });
GangHeistSchema.index({ target: 1, status: 1 });
GangHeistSchema.index({ scheduledDate: 1 });
GangHeistSchema.index({ createdAt: -1 });

/**
 * Instance method: Check if heist is fully staffed
 */
GangHeistSchema.methods.isFullyStaffed = function (this: IGangHeist): boolean {
  return this.roles.length >= this.requiredMembers;
};

/**
 * Instance method: Check if heist can be executed
 */
GangHeistSchema.methods.canExecute = function (this: IGangHeist): boolean {
  return (
    this.status === HeistStatus.READY &&
    this.isFullyStaffed() &&
    this.planningProgress >= 100
  );
};

/**
 * Instance method: Add role assignment
 */
GangHeistSchema.methods.addRoleAssignment = function (
  this: IGangHeist,
  role: HeistRole,
  characterId: string,
  characterName: string,
  skillLevel: number
): void {
  if (this.status !== HeistStatus.PLANNING) {
    throw new Error('Can only assign roles during planning phase');
  }

  // Check if character is already assigned
  const existing = this.roles.find((r) => r.characterId === characterId);
  if (existing) {
    throw new Error('Character is already assigned to this heist');
  }

  // Check if we're at capacity
  if (this.roles.length >= this.requiredMembers) {
    throw new Error('Heist is already fully staffed');
  }

  this.roles.push({
    role,
    characterId,
    characterName,
    skillLevel,
  });

  // Update status if fully staffed and planning complete
  if (this.isFullyStaffed() && this.planningProgress >= 100) {
    this.status = HeistStatus.READY;
  }
};

/**
 * Instance method: Remove role assignment
 */
GangHeistSchema.methods.removeRoleAssignment = function (this: IGangHeist, characterId: string): void {
  if (this.status !== HeistStatus.PLANNING) {
    throw new Error('Can only modify roles during planning phase');
  }

  const index = this.roles.findIndex((r) => r.characterId === characterId);
  if (index === -1) {
    throw new Error('Character is not assigned to this heist');
  }

  this.roles.splice(index, 1);

  // Update status back to planning if no longer ready
  if ((this.status as any) === HeistStatus.READY || !this.isFullyStaffed()) {
    this.status = HeistStatus.PLANNING;
  }
};

/**
 * Instance method: Increase planning progress
 */
GangHeistSchema.methods.increasePlanningProgress = function (this: IGangHeist, amount: number): void {
  if (this.status !== HeistStatus.PLANNING) {
    throw new Error('Can only increase planning progress during planning phase');
  }

  this.planningProgress = Math.min(100, this.planningProgress + amount);

  // Update status if conditions met
  if (this.planningProgress >= 100 && this.isFullyStaffed()) {
    this.status = HeistStatus.READY;
  }
};

/**
 * Instance method: Calculate success chance based on crew skills and planning
 */
GangHeistSchema.methods.calculateSuccessChance = function (this: IGangHeist): number {
  if (!this.isFullyStaffed()) {
    return 0;
  }

  // Base success chance starts at 20%
  let successChance = 20;

  // Add planning bonus (max +30%)
  const planningBonus = (this.planningProgress / 100) * 30;
  successChance += planningBonus;

  // Add crew skill bonus (average skill level, max +40%)
  const avgSkill = this.roles.reduce((sum, r) => sum + r.skillLevel, 0) / this.roles.length;
  const skillBonus = (avgSkill / 100) * 40;
  successChance += skillBonus;

  // Subtract risk level penalty
  const riskPenalty = (this.riskLevel / 100) * 50;
  successChance -= riskPenalty;

  // Subtract heat level penalty
  const heatPenalty = (this.heatLevel / 100) * 20;
  successChance -= heatPenalty;

  // Clamp between 5% and 95%
  return Math.max(5, Math.min(95, successChance));
};

/**
 * Instance method: Execute the heist
 */
GangHeistSchema.methods.executeHeist = async function (
  this: IGangHeist
): Promise<{
  outcome: HeistOutcome;
  payout: number;
  arrested: string[];
  casualties: string[];
}> {
  if (!this.canExecute()) {
    throw new Error('Heist is not ready to execute');
  }

  this.status = HeistStatus.IN_PROGRESS;
  await this.save();

  const successChance = this.calculateSuccessChance();
  const roll = Math.random() * 100;

  let outcome: HeistOutcome;
  let payout = 0;
  const arrested: string[] = [];
  const casualties: string[] = [];

  if (roll <= successChance) {
    // Success
    outcome = HeistOutcome.SUCCESS;
    payout = Math.floor(
      Math.random() * (this.potentialPayout.max - this.potentialPayout.min + 1) +
        this.potentialPayout.min
    );
  } else if (roll <= successChance + 30) {
    // Partial success
    outcome = HeistOutcome.PARTIAL_SUCCESS;
    payout = Math.floor(this.potentialPayout.min * 0.5);

    // Some crew members get arrested
    const arrestCount = Math.floor(Math.random() * Math.ceil(this.roles.length / 2)) + 1;
    for (let i = 0; i < arrestCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.roles.length);
      const arrestedMember = this.roles[randomIndex];
      if (!arrested.includes(arrestedMember.characterId)) {
        arrested.push(arrestedMember.characterId);
      }
    }
  } else {
    // Failure
    outcome = HeistOutcome.FAILURE;
    payout = 0;

    // Most crew members get arrested
    const arrestCount = Math.floor(this.roles.length * 0.6);
    for (let i = 0; i < arrestCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.roles.length);
      const arrestedMember = this.roles[randomIndex];
      if (!arrested.includes(arrestedMember.characterId)) {
        arrested.push(arrestedMember.characterId);
      }
    }

    // Possible casualties in major failures
    if (this.riskLevel >= 70 && Math.random() < 0.2) {
      const casualtyCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < casualtyCount; i++) {
        const randomIndex = Math.floor(Math.random() * this.roles.length);
        const casualty = this.roles[randomIndex];
        if (!casualties.includes(casualty.characterId)) {
          casualties.push(casualty.characterId);
        }
      }
    }
  }

  // Update heist record
  this.status = HeistStatus.COMPLETED;
  this.outcome = outcome;
  this.actualPayout = payout;
  this.arrested = arrested.map((id) => new mongoose.Types.ObjectId(id));
  this.casualties = casualties.map((id) => new mongoose.Types.ObjectId(id));
  this.completedDate = new Date();

  await this.save();

  return {
    outcome,
    payout,
    arrested,
    casualties,
  };
};

/**
 * Static method: Find active heists for a gang
 */
GangHeistSchema.statics.findActiveHeists = async function (
  gangId: string
): Promise<IGangHeist[]> {
  return this.find({
    gangId: new mongoose.Types.ObjectId(gangId),
    status: { $in: [HeistStatus.PLANNING, HeistStatus.READY, HeistStatus.IN_PROGRESS] },
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Check if target is on cooldown for gang
 */
GangHeistSchema.statics.isTargetOnCooldown = async function (
  gangId: string,
  target: HeistTarget,
  cooldownDays: number
): Promise<boolean> {
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - cooldownDays);

  const recentHeist = await this.findOne({
    gangId: new mongoose.Types.ObjectId(gangId),
    target,
    status: HeistStatus.COMPLETED,
    completedDate: { $gte: cooldownDate },
  });

  return !!recentHeist;
};

/**
 * Gang Heist model
 */
export const GangHeist: Model<IGangHeist> & {
  findActiveHeists: (gangId: string) => Promise<IGangHeist[]>;
  isTargetOnCooldown: (gangId: string, target: HeistTarget, cooldownDays: number) => Promise<boolean>;
} = mongoose.model<IGangHeist>('GangHeist', GangHeistSchema) as any;
