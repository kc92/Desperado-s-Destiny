/**
 * Worker Task Service
 *
 * Phase 11: Full Worker Tasks - Task Execution Engine
 * Handles task creation, assignment, execution, and completion
 */

import mongoose from 'mongoose';
import {
  WorkerTask,
  IWorkerTask,
  TaskType,
  TaskStatus,
  TaskResult,
  TASK_STAMINA_COSTS,
} from '../models/WorkerTask.model';
import {
  PropertyWorker,
  IPropertyWorker,
  WorkerQuality,
} from '../models/PropertyWorker.model';
import { Property } from '../models/Property.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { WorkerManagementService } from './workerManagement.service';
import { TerritoryBonusService } from './territoryBonus.service';
import { DollarService } from './dollar.service';
import { SecureRNG } from './base/SecureRNG';
import { broadcastToUser } from '../config/socket';
import logger from '../utils/logger';

/**
 * Task creation parameters
 */
export interface CreateTaskParams {
  workerId: string;
  propertyId: string;
  characterId: string;
  taskType: TaskType;
  targetResource?: string;
  targetAmount?: number;
}

/**
 * Task completion result
 */
export interface TaskCompletionResult {
  success: boolean;
  task: IWorkerTask;
  result: TaskResult;
  workerXpGained: number;
  message: string;
}

/**
 * Task processing batch result
 */
export interface TaskProcessingResult {
  tasksStarted: number;
  tasksCompleted: number;
  tasksFailed: number;
  totalGoldEarned: number;
  totalResourcesGathered: number;
}

/**
 * Base task durations in minutes by task type
 */
const BASE_TASK_DURATIONS_MINUTES = {
  [TaskType.GATHER]: 30,      // 30 minutes base
  [TaskType.CRAFT]: 45,       // 45 minutes base
  [TaskType.TRANSPORT]: 60,   // 60 minutes base
  [TaskType.GUARD]: 120,      // 2 hours base
  [TaskType.SELL]: 20,        // 20 minutes base
};

/**
 * Base rewards by task type
 */
const BASE_TASK_REWARDS = {
  [TaskType.GATHER]: { resources: 10, gold: 0, xp: 15 },
  [TaskType.CRAFT]: { resources: 0, gold: 50, xp: 25 },
  [TaskType.TRANSPORT]: { resources: 0, gold: 30, xp: 20 },
  [TaskType.GUARD]: { resources: 0, gold: 20, xp: 10 },
  [TaskType.SELL]: { resources: 0, gold: 75, xp: 30 },
};

/**
 * Failure chances by task type (base, modified by worker stats)
 */
const BASE_FAILURE_CHANCES = {
  [TaskType.GATHER]: 0.05,    // 5% base failure
  [TaskType.CRAFT]: 0.10,     // 10% base failure
  [TaskType.TRANSPORT]: 0.08, // 8% base failure
  [TaskType.GUARD]: 0.03,     // 3% base failure
  [TaskType.SELL]: 0.02,      // 2% base failure
};

/**
 * Worker Task Service
 */
export class WorkerTaskService {
  /**
   * Create a new task and add to worker's queue
   */
  static async createTask(params: CreateTaskParams): Promise<IWorkerTask> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { workerId, propertyId, characterId, taskType, targetResource, targetAmount } = params;

      // Validate worker exists and belongs to character
      const worker = await PropertyWorker.findOne({ workerId }).session(session);
      if (!worker) {
        throw new Error('Worker not found');
      }

      if (worker.characterId.toString() !== characterId) {
        throw new Error('Worker does not belong to this character');
      }

      if (worker.propertyId.toString() !== propertyId) {
        throw new Error('Worker is not assigned to this property');
      }

      // Check if worker can perform this task (stamina, morale, etc.)
      const staminaCost = TASK_STAMINA_COSTS[taskType];
      if (worker.stamina < staminaCost) {
        throw new Error(`Insufficient stamina (need ${staminaCost}, have ${worker.stamina})`);
      }

      if (!worker.canWork()) {
        throw new Error('Worker cannot work (sick, on strike, or low morale)');
      }

      // Get next queue position for this worker
      const activeTasks = await WorkerTask.findActiveTasksForWorker(workerId);
      const queuePosition = activeTasks.length;

      // Calculate stamina cost based on task type
      const task = new WorkerTask({
        workerId: worker._id,
        propertyId: new mongoose.Types.ObjectId(propertyId),
        characterId: new mongoose.Types.ObjectId(characterId),
        taskType,
        status: TaskStatus.QUEUED,
        targetResource,
        targetAmount: targetAmount || 1,
        currentProgress: 0,
        staminaCost,
        queuePosition,
      });

      await task.save({ session });

      // If this is the first task in queue, start it immediately
      if (queuePosition === 0) {
        await this.startTaskExecution(task, worker, session);
      }

      await session.commitTransaction();

      logger.info(`Created ${taskType} task for worker ${worker.name} (queue position: ${queuePosition})`);

      // Notify player
      try {
        await broadcastToUser(characterId, 'worker:task_created', {
          taskId: task._id.toString(),
          workerId,
          workerName: worker.name,
          taskType,
          queuePosition,
          status: task.status,
        });
      } catch {
        logger.debug('Socket broadcast failed for task creation');
      }

      return task;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Start task execution (transition from QUEUED to IN_PROGRESS)
   */
  private static async startTaskExecution(
    task: IWorkerTask,
    worker: IPropertyWorker,
    session: mongoose.ClientSession
  ): Promise<void> {
    // Mark worker as assigned
    worker.isAssigned = true;
    worker.currentOrderId = task._id.toString();

    // Calculate task duration
    const duration = await this.calculateTaskDuration(task.taskType, worker);
    const now = new Date();

    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = now;
    task.estimatedCompletion = new Date(now.getTime() + duration);

    await task.save({ session });
    await worker.save({ session });

    logger.debug(
      `Started task ${task._id} for worker ${worker.name}, ` +
      `estimated completion: ${task.estimatedCompletion.toISOString()}`
    );
  }

  /**
   * Calculate task duration based on worker stats and task type
   */
  static async calculateTaskDuration(
    taskType: TaskType,
    worker: IPropertyWorker
  ): Promise<number> {
    const baseDuration = BASE_TASK_DURATIONS_MINUTES[taskType] * 60 * 1000; // Convert to ms

    // Get worker efficiency (includes morale, skill, traits)
    const efficiency = worker.calculateEfficiency();

    // Get speed bonus from traits
    const speedBonus = worker.calculateProductionBonus('speed');

    // Higher efficiency = faster completion
    // speedBonus is additive (0.3 = 30% faster)
    const speedMultiplier = 1 / (efficiency * (1 + speedBonus));

    // Apply territory bonuses if available
    let territorySpeedBonus = 1.0;
    try {
      const effectiveEfficiency = await WorkerManagementService.getEffectiveEfficiency(worker.workerId);
      territorySpeedBonus = effectiveEfficiency / efficiency; // Get just the territory component
    } catch {
      // Territory bonus not available, use base
    }

    const finalDuration = baseDuration * speedMultiplier / territorySpeedBonus;

    // Minimum duration is 5 minutes, maximum is 4 hours
    return Math.max(5 * 60 * 1000, Math.min(4 * 60 * 60 * 1000, finalDuration));
  }

  /**
   * Process all in-progress tasks that have completed
   */
  static async processCompletedTasks(): Promise<TaskProcessingResult> {
    const result: TaskProcessingResult = {
      tasksStarted: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      totalGoldEarned: 0,
      totalResourcesGathered: 0,
    };

    const now = new Date();

    // Find all tasks that should be completed
    const completedTasks = await WorkerTask.find({
      status: TaskStatus.IN_PROGRESS,
      estimatedCompletion: { $lte: now },
    });

    logger.info(`[WorkerTaskProcessor] Processing ${completedTasks.length} completed tasks`);

    for (const task of completedTasks) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const completionResult = await this.completeTask(task._id.toString(), session);

        if (completionResult.success) {
          result.tasksCompleted++;
          result.totalGoldEarned += completionResult.result.goldEarned || 0;
          result.totalResourcesGathered += completionResult.result.resourcesGathered || 0;
        } else {
          result.tasksFailed++;
        }

        // Start next task in queue for this worker
        const nextTask = await WorkerTask.findOne({
          workerId: task.workerId,
          status: TaskStatus.QUEUED,
        }).sort({ queuePosition: 1 }).session(session);

        if (nextTask) {
          const worker = await PropertyWorker.findById(task.workerId).session(session);
          if (worker && worker.canWork()) {
            await this.startTaskExecution(nextTask, worker, session);
            result.tasksStarted++;
          }
        }

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        logger.error(`Error processing task ${task._id}:`, error);
        result.tasksFailed++;
      } finally {
        session.endSession();
      }
    }

    return result;
  }

  /**
   * Complete a task and calculate results
   */
  static async completeTask(
    taskId: string,
    session?: mongoose.ClientSession
  ): Promise<TaskCompletionResult> {
    const useSession = session || await mongoose.startSession();
    const isOwnSession = !session;

    if (isOwnSession) {
      useSession.startTransaction();
    }

    try {
      const task = await WorkerTask.findById(taskId).session(useSession);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status !== TaskStatus.IN_PROGRESS) {
        throw new Error(`Task is not in progress (status: ${task.status})`);
      }

      const worker = await PropertyWorker.findById(task.workerId).session(useSession);
      if (!worker) {
        throw new Error('Worker not found');
      }

      // Calculate success/failure
      const failed = await this.rollTaskFailure(task.taskType, worker);

      if (failed) {
        return await this.handleTaskFailure(task, worker, useSession, isOwnSession);
      }

      // Calculate results
      const taskResult = await this.calculateTaskResult(task, worker);

      // Update task
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      task.result = taskResult;
      task.currentProgress = task.targetAmount || 1;

      // Deplete worker stamina
      worker.stamina = Math.max(0, worker.stamina - task.staminaCost);

      // Add experience to worker
      const workerXpGained = taskResult.experienceGained || 0;
      worker.addExperience(workerXpGained);

      // Unassign worker
      worker.isAssigned = false;
      worker.currentOrderId = undefined;

      // Small morale decrease from work
      worker.updateMorale(-2);

      await task.save({ session: useSession });
      await worker.save({ session: useSession });

      // Award gold to character if any
      if (taskResult.goldEarned && taskResult.goldEarned > 0) {
        await DollarService.addDollars(
          task.characterId,
          taskResult.goldEarned,
          TransactionSource.WORKER_TASK,
          `Worker task: ${task.taskType} by ${worker.name}`,
          useSession
        );
      }

      // Update queue positions for remaining tasks
      await this.reorderQueue(worker.workerId, useSession);

      if (isOwnSession) {
        await useSession.commitTransaction();
      }

      logger.info(
        `Task ${taskId} completed by ${worker.name}: ` +
        `${taskResult.goldEarned || 0}g, ${taskResult.resourcesGathered || 0} resources, ` +
        `${workerXpGained} worker XP`
      );

      // Notify player
      try {
        await broadcastToUser(task.characterId.toString(), 'worker:task_completed', {
          taskId: task._id.toString(),
          workerId: worker.workerId,
          workerName: worker.name,
          taskType: task.taskType,
          result: taskResult,
          workerLevel: worker.skillLevel,
        });
      } catch {
        logger.debug('Socket broadcast failed for task completion');
      }

      return {
        success: true,
        task,
        result: taskResult,
        workerXpGained,
        message: `${worker.name} completed ${task.taskType} task`,
      };
    } catch (error) {
      if (isOwnSession) {
        await useSession.abortTransaction();
      }
      throw error;
    } finally {
      if (isOwnSession) {
        useSession.endSession();
      }
    }
  }

  /**
   * Handle task failure
   */
  private static async handleTaskFailure(
    task: IWorkerTask,
    worker: IPropertyWorker,
    session: mongoose.ClientSession,
    commitSession: boolean
  ): Promise<TaskCompletionResult> {
    task.status = TaskStatus.FAILED;
    task.completedAt = new Date();
    task.result = {
      goldEarned: 0,
      resourcesGathered: 0,
      experienceGained: 5, // Small XP for effort
    };

    // Still deplete stamina on failure (reduced)
    worker.stamina = Math.max(0, worker.stamina - Math.floor(task.staminaCost / 2));

    // Small XP for trying
    worker.addExperience(5);

    // Unassign worker
    worker.isAssigned = false;
    worker.currentOrderId = undefined;

    // Morale drops more on failure
    worker.updateMorale(-5);

    await task.save({ session });
    await worker.save({ session });

    // Update queue positions
    await this.reorderQueue(worker.workerId, session);

    if (commitSession) {
      await session.commitTransaction();
    }

    logger.info(`Task ${task._id} failed for worker ${worker.name}`);

    // Notify player
    try {
      await broadcastToUser(task.characterId.toString(), 'worker:task_failed', {
        taskId: task._id.toString(),
        workerId: worker.workerId,
        workerName: worker.name,
        taskType: task.taskType,
      });
    } catch {
      logger.debug('Socket broadcast failed for task failure');
    }

    return {
      success: false,
      task,
      result: task.result!,
      workerXpGained: 5,
      message: `${worker.name} failed ${task.taskType} task`,
    };
  }

  /**
   * Roll for task failure
   */
  private static async rollTaskFailure(
    taskType: TaskType,
    worker: IPropertyWorker
  ): Promise<boolean> {
    const baseChance = BASE_FAILURE_CHANCES[taskType];

    // Skill level reduces failure chance (up to 50% reduction at level 100)
    const skillReduction = (worker.skillLevel / 100) * 0.5;

    // Morale affects failure chance
    const moraleModifier = 1 - (worker.morale / 100) * 0.3; // Low morale increases failure

    // Quality tier reduces failure
    const qualityModifiers = {
      [WorkerQuality.GREENHORN]: 1.5,    // 50% more likely to fail
      [WorkerQuality.REGULAR]: 1.0,       // Base rate
      [WorkerQuality.EXPERIENCED]: 0.7,   // 30% less likely
      [WorkerQuality.VETERAN]: 0.4,       // 60% less likely
      [WorkerQuality.LEGENDARY]: 0.2,     // 80% less likely
    };
    const qualityModifier = qualityModifiers[worker.quality] || 1.0;

    const finalChance = baseChance * (1 - skillReduction) * moraleModifier * qualityModifier;

    return SecureRNG.chance(finalChance);
  }

  /**
   * Calculate task results based on worker stats
   */
  private static async calculateTaskResult(
    task: IWorkerTask,
    worker: IPropertyWorker
  ): Promise<TaskResult> {
    const baseRewards = BASE_TASK_REWARDS[task.taskType];

    // Get worker bonuses
    const yieldBonus = worker.calculateProductionBonus('yield');
    const qualityBonus = worker.calculateProductionBonus('quality');
    const efficiency = worker.calculateEfficiency();

    // Quality tier multipliers
    const qualityMultipliers = {
      [WorkerQuality.GREENHORN]: 0.7,
      [WorkerQuality.REGULAR]: 1.0,
      [WorkerQuality.EXPERIENCED]: 1.2,
      [WorkerQuality.VETERAN]: 1.5,
      [WorkerQuality.LEGENDARY]: 2.0,
    };
    const qualityMult = qualityMultipliers[worker.quality] || 1.0;

    // Get territory bonuses
    let territoryBonus = 1.0;
    try {
      const property = await Property.findById(task.propertyId);
      if (property) {
        const character = await Character.findById(task.characterId).select('gangId');
        if (character?.gangId) {
          const bonuses = await TerritoryBonusService.getPropertyBonuses(
            property.locationId,
            character.gangId
          );
          if (bonuses.hasBonuses) {
            territoryBonus = bonuses.bonuses.income || 1.0;
          }
        }
      }
    } catch {
      // Territory bonus not available
    }

    // Calculate final values
    const targetMultiplier = task.targetAmount || 1;

    const resourcesGathered = task.taskType === TaskType.GATHER
      ? Math.floor(baseRewards.resources * targetMultiplier * (1 + yieldBonus) * efficiency * qualityMult * territoryBonus)
      : 0;

    const goldEarned = Math.floor(
      baseRewards.gold * targetMultiplier * (1 + qualityBonus) * efficiency * qualityMult * territoryBonus
    );

    // XP scales with worker skill (higher skill = less XP per task, but more efficient)
    const xpScale = 1 + (1 - worker.skillLevel / 100) * 0.5; // 50% more XP at level 1, normal at 100
    const experienceGained = Math.floor(baseRewards.xp * targetMultiplier * xpScale);

    return {
      resourcesGathered,
      goldEarned,
      experienceGained,
      itemsCrafted: task.taskType === TaskType.CRAFT ? targetMultiplier : 0,
    };
  }

  /**
   * Cancel a task
   */
  static async cancelTask(
    taskId: string,
    characterId: string
  ): Promise<{ success: boolean; message: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await WorkerTask.findById(taskId).session(session);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.characterId.toString() !== characterId) {
        throw new Error('Task does not belong to this character');
      }

      if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
        throw new Error('Cannot cancel completed or failed task');
      }

      const worker = await PropertyWorker.findById(task.workerId).session(session);

      // If task was in progress, unassign worker
      if (task.status === TaskStatus.IN_PROGRESS && worker) {
        worker.isAssigned = false;
        worker.currentOrderId = undefined;

        // Partial stamina cost for cancellation
        worker.stamina = Math.max(0, worker.stamina - Math.floor(task.staminaCost / 4));

        await worker.save({ session });
      }

      task.status = TaskStatus.CANCELLED;
      task.completedAt = new Date();
      await task.save({ session });

      // Reorder queue
      if (worker) {
        await this.reorderQueue(worker.workerId, session);

        // Start next task if available
        const nextTask = await WorkerTask.findOne({
          workerId: task.workerId,
          status: TaskStatus.QUEUED,
        }).sort({ queuePosition: 1 }).session(session);

        if (nextTask && worker.canWork()) {
          await this.startTaskExecution(nextTask, worker, session);
        }
      }

      await session.commitTransaction();

      logger.info(`Task ${taskId} cancelled`);

      return {
        success: true,
        message: 'Task cancelled successfully',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Reorder queue positions after task completion/cancellation
   */
  private static async reorderQueue(
    workerId: string,
    session: mongoose.ClientSession
  ): Promise<void> {
    const queuedTasks = await WorkerTask.find({
      workerId: new mongoose.Types.ObjectId(workerId),
      status: TaskStatus.QUEUED,
    }).sort({ queuePosition: 1 }).session(session);

    for (let i = 0; i < queuedTasks.length; i++) {
      if (queuedTasks[i].queuePosition !== i) {
        queuedTasks[i].queuePosition = i;
        await queuedTasks[i].save({ session });
      }
    }
  }

  /**
   * Get all tasks for a worker
   */
  static async getWorkerTasks(workerId: string): Promise<IWorkerTask[]> {
    return WorkerTask.findByWorker(workerId);
  }

  /**
   * Get active tasks for a worker (queued and in_progress)
   */
  static async getActiveWorkerTasks(workerId: string): Promise<IWorkerTask[]> {
    return WorkerTask.findActiveTasksForWorker(workerId);
  }

  /**
   * Get all tasks for a character
   */
  static async getCharacterTasks(characterId: string): Promise<IWorkerTask[]> {
    return WorkerTask.findByCharacter(characterId);
  }

  /**
   * Get task queue for a property
   */
  static async getPropertyTaskQueue(propertyId: string): Promise<IWorkerTask[]> {
    return WorkerTask.findQueuedTasksForProperty(propertyId);
  }

  /**
   * Get task details
   */
  static async getTaskDetails(taskId: string): Promise<IWorkerTask | null> {
    return WorkerTask.findById(taskId).populate('workerId');
  }

  /**
   * Get task statistics for a character
   */
  static async getTaskStatistics(characterId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    cancelledTasks: number;
    inProgressTasks: number;
    queuedTasks: number;
    totalGoldEarned: number;
    totalResourcesGathered: number;
  }> {
    const tasks = await WorkerTask.find({
      characterId: new mongoose.Types.ObjectId(characterId),
    });

    const stats = {
      totalTasks: tasks.length,
      completedTasks: 0,
      failedTasks: 0,
      cancelledTasks: 0,
      inProgressTasks: 0,
      queuedTasks: 0,
      totalGoldEarned: 0,
      totalResourcesGathered: 0,
    };

    for (const task of tasks) {
      switch (task.status) {
        case TaskStatus.COMPLETED:
          stats.completedTasks++;
          stats.totalGoldEarned += task.result?.goldEarned || 0;
          stats.totalResourcesGathered += task.result?.resourcesGathered || 0;
          break;
        case TaskStatus.FAILED:
          stats.failedTasks++;
          break;
        case TaskStatus.CANCELLED:
          stats.cancelledTasks++;
          break;
        case TaskStatus.IN_PROGRESS:
          stats.inProgressTasks++;
          break;
        case TaskStatus.QUEUED:
          stats.queuedTasks++;
          break;
      }
    }

    return stats;
  }

  /**
   * Regenerate stamina for all idle workers (called by scheduler)
   */
  static async regenerateAllIdleWorkerStamina(): Promise<number> {
    const idleWorkers = await PropertyWorker.find({
      isAssigned: false,
      stamina: { $lt: mongoose.connection.useDb ? 200 : 200 }, // Less than max possible stamina
    });

    let regeneratedCount = 0;

    for (const worker of idleWorkers) {
      try {
        const hoursSinceUpdate = (Date.now() - worker.lastFed.getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate >= 1 && worker.stamina < worker.maxStamina) {
          const staminaToRegenerate = Math.min(
            Math.floor(hoursSinceUpdate),
            worker.maxStamina - worker.stamina
          );

          if (staminaToRegenerate > 0) {
            worker.stamina += staminaToRegenerate;
            worker.lastFed = new Date();
            await worker.save();
            regeneratedCount++;
          }
        }
      } catch (error) {
        logger.error(`Error regenerating stamina for worker ${worker.workerId}:`, error);
      }
    }

    return regeneratedCount;
  }
}

export default WorkerTaskService;
