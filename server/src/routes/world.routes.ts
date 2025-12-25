/**
 * World Routes
 * Routes for world state, time, weather, and global events
 */

import { Router } from 'express';
import {
  getWorldState,
  getGameTime,
  getWeather,
  getActiveEvents,
  getEventDetails,
  joinEvent,
} from '../controllers/world.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * @route   GET /api/world/state
 * @desc    Get current world state (time, weather, factions, news)
 * @access  Public
 */
router.get('/state', asyncHandler(getWorldState));

/**
 * @route   GET /api/world/time
 * @desc    Get current game time
 * @access  Public
 */
router.get('/time', asyncHandler(getGameTime));

/**
 * @route   GET /api/world/weather
 * @desc    Get current weather conditions
 * @access  Public
 */
router.get('/weather', asyncHandler(getWeather));

/**
 * @route   GET /api/world/events
 * @desc    Get active and upcoming world events
 * @access  Public
 */
router.get('/events', asyncHandler(getActiveEvents));

/**
 * @route   GET /api/world/events/:eventId
 * @desc    Get details of a specific event
 * @access  Public
 */
router.get('/events/:eventId', asyncHandler(getEventDetails));

/**
 * @route   POST /api/world/events/:eventId/join
 * @desc    Join an active world event
 * @access  Protected - Requires authentication and CSRF token
 */
router.post(
  '/events/:eventId/join',
  asyncHandler(requireAuth),
  requireCsrfToken,
  asyncHandler(joinEvent)
);

export default router;
