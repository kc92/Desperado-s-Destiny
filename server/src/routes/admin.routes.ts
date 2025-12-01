/**
 * Admin Routes
 *
 * Routes for administrative operations - user management, economy monitoring, system analytics
 * All routes protected by requireAuth + requireAdmin middleware
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
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

const router = Router();

// Apply requireAuth and requireAdmin to all routes in this router
router.use(requireAuth, requireAdmin);

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
router.put('/system/settings', asyncHandler(updateSystemSettings));

// GET /api/admin/audit-logs
// Get audit logs (admin actions)
router.get('/audit-logs', asyncHandler(getAuditLogs));

// GET /api/admin/server/health
// Get server health metrics
router.get('/server/health', asyncHandler(getServerHealth));

/**
 * Territory Management
 */

// POST /api/admin/territories/reset
// Reset all territories (dangerous operation)
router.post('/territories/reset', asyncHandler(resetTerritories));

export default router;
