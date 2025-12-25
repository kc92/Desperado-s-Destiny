/**
 * Weather Routes
 *
 * Routes for weather system API endpoints
 */

import express from 'express';
import {
  getAllWeather,
  getRegionWeather,
  getLocationWeather,
  updateWeather,
  setWeather,
  getWeatherTypes,
} from '../controllers/weather.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = express.Router();

/**
 * @route   GET /api/weather
 * @desc    Get current weather for all regions
 * @access  Public
 */
router.get('/', asyncHandler(getAllWeather));

/**
 * @route   GET /api/weather/types
 * @desc    Get all available weather types and effects
 * @access  Public
 */
router.get('/types', asyncHandler(getWeatherTypes));

/**
 * @route   GET /api/weather/region/:region
 * @desc    Get current weather for a specific region
 * @access  Public
 */
router.get('/region/:region', asyncHandler(getRegionWeather));

/**
 * @route   GET /api/weather/location/:locationId
 * @desc    Get current weather at a specific location
 * @access  Public
 */
router.get('/location/:locationId', asyncHandler(getLocationWeather));

/**
 * @route   POST /api/weather/update
 * @desc    Manually trigger weather update
 * @access  Admin only
 */
router.post('/update', requireAuth, requireAdmin, requireCsrfToken, asyncHandler(updateWeather));

/**
 * @route   POST /api/weather/set
 * @desc    Admin endpoint to set weather for testing
 * @access  Private (Admin only)
 */
router.post('/set', requireAuth, requireAdmin, requireCsrfToken, asyncHandler(setWeather));

export default router;
