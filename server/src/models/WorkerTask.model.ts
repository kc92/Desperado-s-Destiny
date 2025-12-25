/**
 * Worker Task Model
 *
 * Phase 8: Worker System Foundation - Task Queue Architecture
 * Tracks individual tasks assigned to workers with queue management
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Task Types
 */
export enum TaskType {
  GATHER = 'gather',
  CRAFT = 'craft',
  TRANSPORT = 'transport',
  GUARD = 'guard',
  SELL = 'sell',
}

/**
 * Task Status
 */
export enum TaskStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Stamina costs by task type
 */
export const TASK_STAMINA_COSTS = {
  [TaskType.GATHER]: 10,
  [TaskType.CRAFT]: 15,
  [TaskType.TRANSPORT]: 20,
  [TaskType.GUARD]: 5, // per hour
  [TaskType.SELL]: 8,
};

/**
 * Task result interface
 */
export interface TaskResult {
  resourcesGathered?: number;
  itemsCrafted?: number;
  goldEarned?: number;
  experienceGained?: number;
}

/**
 * Worker Task document interface
 */
export interface IWorkerTask extends Document {
  workerId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  taskType: TaskType;
  status: TaskStatus;

  // Task details
  targetResource?: string;
  targetAmount?: number;
  currentProgress?: number;

  // Timing
  startedAt?: Date;
  estimatedCompletion?: Date;
  completedAt?: Date;

  // Costs & Results
  staminaCost: number;
  result?: TaskResult;

  // Queue position
  queuePosition: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Worker Task static methods interface
 */
export interface IWorkerTaskModel extends Model<IWorkerTask> {
  findByWorker(workerId: string): Promise<IWorkerTask[]>;
  findByCharacter(characterId: string): Promise<IWorkerTask[]>;
  findActiveTasksForWorker(workerId: string): Promise<IWorkerTask[]>;
  findQueuedTasksForProperty(propertyId: string): Promise<IWorkerTask[]>;
}

/**
 * Worker Task schema definition
 */
const WorkerTaskSchema = new Schema<IWorkerTask>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'PropertyWorker',
      required: true,
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    taskType: {
      type: String,
      enum: Object.values(TaskType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.QUEUED,
      index: true,
    },

    // Task details
    targetResource: String,
    targetAmount: Number,
    currentProgress: {
      type: Number,
      default: 0,
    },

    // Timing
    startedAt: Date,
    estimatedCompletion: Date,
    completedAt: Date,

    // Costs & Results
    staminaCost: {
      type: Number,
      required: true,
    },
    result: {
      resourcesGathered: Number,
      itemsCrafted: Number,
      goldEarned: Number,
      experienceGained: Number,
    },

    // Queue position
    queuePosition: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
WorkerTaskSchema.index({ workerId: 1, status: 1 });
WorkerTaskSchema.index({ characterId: 1, status: 1 });
WorkerTaskSchema.index({ propertyId: 1, queuePosition: 1 });
WorkerTaskSchema.index({ status: 1, estimatedCompletion: 1 });

/**
 * Static method: Find all tasks for a worker
 */
WorkerTaskSchema.statics.findByWorker = async function (
  workerId: string
): Promise<IWorkerTask[]> {
  return this.find({
    workerId: new mongoose.Types.ObjectId(workerId),
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Find all tasks for a character
 */
WorkerTaskSchema.statics.findByCharacter = async function (
  characterId: string
): Promise<IWorkerTask[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Find active tasks for a worker
 */
WorkerTaskSchema.statics.findActiveTasksForWorker = async function (
  workerId: string
): Promise<IWorkerTask[]> {
  return this.find({
    workerId: new mongoose.Types.ObjectId(workerId),
    status: { $in: [TaskStatus.QUEUED, TaskStatus.IN_PROGRESS] },
  }).sort({ queuePosition: 1 });
};

/**
 * Static method: Find queued tasks for a property
 */
WorkerTaskSchema.statics.findQueuedTasksForProperty = async function (
  propertyId: string
): Promise<IWorkerTask[]> {
  return this.find({
    propertyId: new mongoose.Types.ObjectId(propertyId),
    status: TaskStatus.QUEUED,
  }).sort({ queuePosition: 1 });
};

/**
 * Worker Task model
 */
export const WorkerTask = mongoose.model<IWorkerTask, IWorkerTaskModel>(
  'WorkerTask',
  WorkerTaskSchema
);
