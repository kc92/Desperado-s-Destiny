/**
 * World Routes
 * Routes for world state, time, weather, and global events
 */

import { Router } from 'express';
import { getWorldState, getGameTime, getWeather } from '../controllers/world.controller';

const router = Router();

/**
 * @route   GET /api/world/state
 * @desc    Get current world state (time, weather, factions, news)
 * @access  Public
 */
router.get('/state', getWorldState);

/**
 * @route   GET /api/world/time
 * @desc    Get current game time
 * @access  Public
 */
router.get('/time', getGameTime);

/**
 * @route   GET /api/world/weather
 * @desc    Get current weather conditions
 * @access  Public
 */
router.get('/weather', getWeather);

export default router;
