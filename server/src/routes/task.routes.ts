/**
 * Task Routes
 *
 * Phase 11: Full Worker Tasks - API Endpoints
 * Handles worker task creation, management, and execution
 */

import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/tasks/types
 * Get available task types
 */
router.get('/types', asyncHandler(TaskController.getTaskTypes));

/**
 * POST /api/tasks
 * Create a new worker task
 * Body: { workerId, propertyId, characterId, taskType, targetResource?, targetAmount? }
 */
router.post('/', requireCsrfToken, asyncHandler(TaskController.createTask));

/**
 * GET /api/tasks/character/:characterId
 * Get all tasks for a character
 * Protected: User must own this character
 */
router.get('/character/:characterId', requireCharacterOwnership, asyncHandler(TaskController.getCharacterTasks));

/**
 * GET /api/tasks/character/:characterId/statistics
 * Get task statistics for a character
 * Protected: User must own this character
 */
router.get('/character/:characterId/statistics', requireCharacterOwnership, asyncHandler(TaskController.getTaskStatistics));

/**
 * GET /api/tasks/worker/:workerId
 * Get all tasks for a worker
 * Query: { activeOnly?: boolean }
 */
router.get('/worker/:workerId', asyncHandler(TaskController.getWorkerTasks));

/**
 * GET /api/tasks/worker/:workerId/stamina
 * Get worker stamina information
 */
router.get('/worker/:workerId/stamina', asyncHandler(TaskController.getWorkerStamina));

/**
 * POST /api/tasks/worker/:workerId/feed
 * Feed a worker to restore stamina
 * Body: { characterId }
 */
router.post('/worker/:workerId/feed', requireCsrfToken, asyncHandler(TaskController.feedWorker));

/**
 * GET /api/tasks/property/:propertyId/queue
 * Get task queue for a property
 */
router.get('/property/:propertyId/queue', asyncHandler(TaskController.getPropertyTaskQueue));

/**
 * GET /api/tasks/:taskId
 * Get task details
 */
router.get('/:taskId', asyncHandler(TaskController.getTaskDetails));

/**
 * POST /api/tasks/:taskId/cancel
 * Cancel a task
 * Body: { characterId }
 */
router.post('/:taskId/cancel', requireCsrfToken, asyncHandler(TaskController.cancelTask));

export default router;
