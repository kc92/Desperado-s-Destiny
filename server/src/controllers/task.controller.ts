/**
 * Task Controller
 *
 * Phase 11: Full Worker Tasks - API Request Handlers
 * Handles HTTP requests for worker task operations
 */

import { Response } from 'express';
import { WorkerTaskService } from '../services/workerTask.service';
import { WorkerManagementService } from '../services/workerManagement.service';
import { TaskType } from '../models/WorkerTask.model';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

export class TaskController {
  /**
   * POST /api/tasks
   * Create a new worker task
   */
  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId, propertyId, characterId, taskType, targetResource, targetAmount } = req.body;

      if (!workerId || !propertyId || !characterId || !taskType) {
        res.status(400).json({
          success: false,
          error: 'workerId, propertyId, characterId, and taskType are required',
        });
        return;
      }

      // Validate task type
      if (!Object.values(TaskType).includes(taskType)) {
        res.status(400).json({
          success: false,
          error: `Invalid taskType. Must be one of: ${Object.values(TaskType).join(', ')}`,
        });
        return;
      }

      const task = await WorkerTaskService.createTask({
        workerId,
        propertyId,
        characterId,
        taskType,
        targetResource,
        targetAmount: targetAmount ? parseInt(targetAmount, 10) : 1,
      });

      res.status(201).json({
        success: true,
        data: task,
        message: `Created ${taskType} task`,
      });
    } catch (error) {
      logger.error('Error creating task:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      });
    }
  }

  /**
   * POST /api/tasks/:taskId/cancel
   * Cancel a task
   */
  static async cancelTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const result = await WorkerTaskService.cancelTask(taskId, characterId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error cancelling task:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel task',
      });
    }
  }

  /**
   * GET /api/tasks/:taskId
   * Get task details
   */
  static async getTaskDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await WorkerTaskService.getTaskDetails(taskId);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Error getting task details:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get task details',
      });
    }
  }

  /**
   * GET /api/tasks/worker/:workerId
   * Get all tasks for a worker
   */
  static async getWorkerTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const { activeOnly } = req.query;

      let tasks;
      if (activeOnly === 'true') {
        tasks = await WorkerTaskService.getActiveWorkerTasks(workerId);
      } else {
        tasks = await WorkerTaskService.getWorkerTasks(workerId);
      }

      res.status(200).json({
        success: true,
        data: {
          tasks,
          total: tasks.length,
        },
      });
    } catch (error) {
      logger.error('Error getting worker tasks:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get worker tasks',
      });
    }
  }

  /**
   * GET /api/tasks/character/:characterId
   * Get all tasks for a character
   */
  static async getCharacterTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;

      const tasks = await WorkerTaskService.getCharacterTasks(characterId);

      res.status(200).json({
        success: true,
        data: {
          tasks,
          total: tasks.length,
        },
      });
    } catch (error) {
      logger.error('Error getting character tasks:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get character tasks',
      });
    }
  }

  /**
   * GET /api/tasks/property/:propertyId/queue
   * Get task queue for a property
   */
  static async getPropertyTaskQueue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      const tasks = await WorkerTaskService.getPropertyTaskQueue(propertyId);

      res.status(200).json({
        success: true,
        data: {
          tasks,
          total: tasks.length,
        },
      });
    } catch (error) {
      logger.error('Error getting property task queue:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get task queue',
      });
    }
  }

  /**
   * GET /api/tasks/character/:characterId/statistics
   * Get task statistics for a character
   */
  static async getTaskStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;

      const statistics = await WorkerTaskService.getTaskStatistics(characterId);

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('Error getting task statistics:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get task statistics',
      });
    }
  }

  /**
   * POST /api/tasks/worker/:workerId/feed
   * Feed a worker to restore stamina
   */
  static async feedWorker(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const result = await WorkerManagementService.feedWorker(characterId, workerId);

      res.status(200).json({
        success: true,
        data: result,
        message: `Fed worker, restored ${result.staminaRestored} stamina (cost: ${result.cost} dollars)`,
      });
    } catch (error) {
      logger.error('Error feeding worker:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to feed worker',
      });
    }
  }

  /**
   * GET /api/tasks/worker/:workerId/stamina
   * Get worker stamina info
   */
  static async getWorkerStamina(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;

      const staminaInfo = await WorkerManagementService.getWorkerStaminaInfo(workerId);

      res.status(200).json({
        success: true,
        data: staminaInfo,
      });
    } catch (error) {
      logger.error('Error getting worker stamina:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get worker stamina',
      });
    }
  }

  /**
   * GET /api/tasks/types
   * Get available task types
   */
  static async getTaskTypes(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const taskTypes = Object.values(TaskType).map(type => ({
        type,
        description: getTaskTypeDescription(type),
      }));

      res.status(200).json({
        success: true,
        data: taskTypes,
      });
    } catch (error) {
      logger.error('Error getting task types:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get task types',
      });
    }
  }
}

/**
 * Get description for task type
 */
function getTaskTypeDescription(type: TaskType): string {
  const descriptions: Record<TaskType, string> = {
    [TaskType.GATHER]: 'Gather resources from the property',
    [TaskType.CRAFT]: 'Craft items using gathered resources',
    [TaskType.TRANSPORT]: 'Transport goods between locations',
    [TaskType.GUARD]: 'Guard the property against threats',
    [TaskType.SELL]: 'Sell goods at market for profit',
  };
  return descriptions[type] || 'Unknown task type';
}

export default TaskController;
