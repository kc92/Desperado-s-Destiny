/**
 * Admin Routes
 *
 * Routes for administrative operations - user management, economy monitoring, system analytics
 * All routes protected by requireAuth + requireAdmin middleware + rate limiting
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { adminRateLimiter } from '../middleware/rateLimiter';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { performanceMonitor } from '../utils/performanceMonitor';
import { AccountSecurityService } from '../services/accountSecurity.service';
import { getJobStatistics, getAllQueues, QueueName, QUEUE_NAMES } from '../jobs/queues';

// Allowed queue names for validation
const ALLOWED_QUEUE_NAMES = new Set(Object.values(QUEUE_NAMES));

/**
 * Validate queue name against allowed list
 * Prevents arbitrary string injection into queue operations
 */
function isValidQueueName(name: string): name is QueueName {
  return ALLOWED_QUEUE_NAMES.has(name as QueueName);
}
import {
  getUsers,
  getUserDetails,
  banUser,
  unbanUser,
  getCharacters,
  updateCharacter,
  deleteCharacter,
  adjustGold,
  getAnalytics,
  getGangs,
  disbandGang,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getServerHealth,
  resetTerritories
} from '../controllers/admin.controller';
import { validate } from '../validation/middleware';
import { AdminSchemas } from '../validation/schemas';

const router = Router();

// Apply requireAuth, requireAdmin, rate limiting, and CSRF protection to all routes in this router
// Rate limiting protects against compromised admin accounts and prevents accidental mass operations
// CSRF protection ensures admin actions can only come from legitimate admin UI sessions
router.use(requireAuth, requireAdmin, requireCsrfToken, adminRateLimiter);

/**
 * User Management
 */

// GET /api/admin/users
// Get list of all users with filtering and pagination
router.get('/users', asyncHandler(getUsers));

// GET /api/admin/users/:userId
// Get detailed information about a specific user
router.get('/users/:userId', asyncHandler(getUserDetails));

// POST /api/admin/users/:userId/ban
// Ban a user
router.post('/users/:userId/ban', asyncHandler(banUser));

// POST /api/admin/users/:userId/unban
// Unban a user
router.post('/users/:userId/unban', asyncHandler(unbanUser));

// POST /api/admin/users/:userId/unlock
// Unlock a user's account (clear failed login attempts and lockout)
router.post('/users/:userId/unlock', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await AccountSecurityService.unlockAccount(userId);
  res.json({ success: true, message: 'Account unlocked successfully' });
}));

/**
 * Character Management
 */

// GET /api/admin/characters
// Get list of all characters with filtering and pagination
router.get('/characters', asyncHandler(getCharacters));

// PUT /api/admin/characters/:characterId
// Modify a character's properties
router.put('/characters/:characterId', asyncHandler(updateCharacter));

// DELETE /api/admin/characters/:characterId
// Delete a character
router.delete('/characters/:characterId', asyncHandler(deleteCharacter));

/**
 * Economy Management
 */

// POST /api/admin/gold/adjust
// Adjust a character's gold
router.post('/gold/adjust', asyncHandler(adjustGold));

// GET /api/admin/analytics
// Get system analytics and statistics
router.get('/analytics', asyncHandler(getAnalytics));

/**
 * Gang Management
 */

// GET /api/admin/gangs
// Get list of all gangs
router.get('/gangs', asyncHandler(getGangs));

// DELETE /api/admin/gangs/:gangId
// Disband a gang
router.delete('/gangs/:gangId', asyncHandler(disbandGang));

/**
 * System Management
 */

// GET /api/admin/system/settings
// Get system settings
router.get('/system/settings', asyncHandler(getSystemSettings));

// PUT /api/admin/system/settings
// Update system settings
router.put('/system/settings', validate(AdminSchemas.updateSettings), asyncHandler(updateSystemSettings));

// GET /api/admin/audit-logs
// Get audit logs (admin actions)
router.get('/audit-logs', asyncHandler(getAuditLogs));

// GET /api/admin/server/health
// Get server health metrics
router.get('/server/health', asyncHandler(getServerHealth));

// GET /api/admin/performance
// Get request performance statistics (timing, percentiles, slow operations)
router.get('/performance', (_req, res) => {
  res.json({
    stats: performanceMonitor.getAllStats(),
    slowOperations: performanceMonitor.getSlowOperations(1000, 100) // Operations > 1s, last 100
  });
});

/**
 * Queue Management
 */

// GET /api/admin/queues
// Get all queue statistics
router.get('/queues', asyncHandler(async (_req, res) => {
  const stats = await getJobStatistics();
  res.json({ success: true, queues: stats });
}));

// GET /api/admin/queues/:queueName/failed
// Get failed jobs for a specific queue
router.get('/queues/:queueName/failed', asyncHandler(async (req, res) => {
  const { queueName } = req.params;

  // Validate queue name against allowed list
  if (!isValidQueueName(queueName)) {
    return res.status(400).json({ success: false, error: 'Invalid queue name' });
  }

  const queues = getAllQueues();
  const queue = queues.get(queueName);

  if (!queue) {
    return res.status(404).json({ success: false, error: 'Queue not found' });
  }

  const failedJobs = await queue.getFailed(0, 100);
  res.json({
    success: true,
    queue: queueName,
    failedCount: failedJobs.length,
    jobs: failedJobs.map(job => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      timestamp: job.timestamp
    }))
  });
}));

// POST /api/admin/queues/:queueName/retry
// Retry all failed jobs in a queue
router.post('/queues/:queueName/retry', asyncHandler(async (req, res) => {
  const { queueName } = req.params;

  // Validate queue name against allowed list
  if (!isValidQueueName(queueName)) {
    return res.status(400).json({ success: false, error: 'Invalid queue name' });
  }

  const queues = getAllQueues();
  const queue = queues.get(queueName);

  if (!queue) {
    return res.status(404).json({ success: false, error: 'Queue not found' });
  }

  const failedJobs = await queue.getFailed();
  await Promise.all(failedJobs.map(job => job.retry()));

  res.json({
    success: true,
    message: `Retried ${failedJobs.length} failed jobs in ${queueName}`
  });
}));

// POST /api/admin/queues/:queueName/clean
// Clean completed/failed jobs from a queue
router.post('/queues/:queueName/clean', asyncHandler(async (req, res) => {
  const { queueName } = req.params;
  const { grace = 3600000, status = 'completed' } = req.body; // default: 1 hour grace period

  // Validate queue name against allowed list
  if (!isValidQueueName(queueName)) {
    return res.status(400).json({ success: false, error: 'Invalid queue name' });
  }

  const queues = getAllQueues();
  const queue = queues.get(queueName);

  if (!queue) {
    return res.status(404).json({ success: false, error: 'Queue not found' });
  }

  const cleaned = await queue.clean(grace, status);

  res.json({
    success: true,
    message: `Cleaned ${cleaned.length} ${status} jobs from ${queueName}`,
    cleanedCount: cleaned.length
  });
}));

/**
 * Territory Management
 */

// POST /api/admin/territories/reset
// Reset all territories (dangerous operation)
router.post('/territories/reset', asyncHandler(resetTerritories));

/**
 * Security Management
 */

// GET /api/admin/security/jwt-keys
// Get JWT key rotation info
router.get('/security/jwt-keys', asyncHandler(async (_req, res) => {
  const { KeyRotationService } = await import('../services/keyRotation.service');
  const info = await KeyRotationService.getKeyInfo();
  res.json({
    success: true,
    data: info
  });
}));

// POST /api/admin/security/rotate-jwt-key
// Rotate JWT signing key (creates new key, old keys remain valid for grace period)
router.post('/security/rotate-jwt-key', asyncHandler(async (_req, res) => {
  const { KeyRotationService } = await import('../services/keyRotation.service');
  const result = await KeyRotationService.rotateKey();
  res.json({
    success: true,
    message: `JWT key rotated successfully`,
    data: {
      newVersion: result.version,
      previousVersion: result.previousVersion
    }
  });
}));

export default router;
