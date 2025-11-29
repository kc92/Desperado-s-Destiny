/**
 * Schedule Routes
 *
 * API endpoints for NPC schedule and location tracking
 */

import { Router } from 'express';
import {
  getNPCsAtLocation,
  getNPCSchedule,
  getCurrentActivity,
  checkNPCAvailability,
  getAllNPCLocations,
  getNPCsByActivity,
  getActivityStatistics,
  getNPCInteractionContext,
  getAllSchedules,
} from '../controllers/schedule.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * @route   GET /api/schedule/location/:locationId
 * @desc    Get all NPCs currently at a specific location
 * @access  Public
 * @query   hour - Optional specific hour to check (0-23)
 */
router.get('/location/:locationId', asyncHandler(getNPCsAtLocation));

/**
 * @route   GET /api/schedule/npc/:npcId
 * @desc    Get complete schedule for a specific NPC
 * @access  Public
 * @query   includeNext - Include upcoming activities (true/false)
 */
router.get('/npc/:npcId', asyncHandler(getNPCSchedule));

/**
 * @route   GET /api/schedule/npc/:npcId/current
 * @desc    Get current activity for a specific NPC
 * @access  Public
 * @query   hour - Optional specific hour to check (0-23)
 */
router.get('/npc/:npcId/current', asyncHandler(getCurrentActivity));

/**
 * @route   GET /api/schedule/npc/:npcId/available
 * @desc    Check if NPC is available for interaction
 * @access  Public
 * @query   hour - Optional specific hour to check (0-23)
 */
router.get('/npc/:npcId/available', asyncHandler(checkNPCAvailability));

/**
 * @route   GET /api/schedule/npc/:npcId/interaction
 * @desc    Get interaction context for an NPC (dialogue suggestions)
 * @access  Public
 * @query   reputation - Player's reputation with NPC (0-100, default 50)
 */
router.get('/npc/:npcId/interaction', asyncHandler(getNPCInteractionContext));

/**
 * @route   GET /api/schedule/locations
 * @desc    Get all NPC locations at current time
 * @access  Public
 * @query   hour - Optional specific hour to check (0-23)
 * @query   location - Optional location filter
 * @query   activity - Optional activity filter
 */
router.get('/locations', asyncHandler(getAllNPCLocations));

/**
 * @route   GET /api/schedule/activity/:activityType
 * @desc    Get all NPCs performing a specific activity
 * @access  Public
 * @query   hour - Optional specific hour to check (0-23)
 */
router.get('/activity/:activityType', asyncHandler(getNPCsByActivity));

/**
 * @route   GET /api/schedule/statistics
 * @desc    Get activity statistics for current hour
 * @access  Public
 * @query   hour - Optional specific hour to check (0-23)
 */
router.get('/statistics', asyncHandler(getActivityStatistics));

/**
 * @route   GET /api/schedule/all
 * @desc    Get all NPC schedules (admin/debug)
 * @access  Public (should be protected in production)
 */
router.get('/all', asyncHandler(getAllSchedules));

export default router;
