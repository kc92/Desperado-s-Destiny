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
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

/**
 * @route   GET /api/weather
 * @desc    Get current weather for all regions
 * @access  Public
 */
router.get('/', getAllWeather);

/**
 * @route   GET /api/weather/types
 * @desc    Get all available weather types and effects
 * @access  Public
 */
router.get('/types', getWeatherTypes);

/**
 * @route   GET /api/weather/region/:region
 * @desc    Get current weather for a specific region
 * @access  Public
 */
router.get('/region/:region', getRegionWeather);

/**
 * @route   GET /api/weather/location/:locationId
 * @desc    Get current weather at a specific location
 * @access  Public
 */
router.get('/location/:locationId', getLocationWeather);

/**
 * @route   POST /api/weather/update
 * @desc    Manually trigger weather update
 * @access  Private (can be used by cron jobs)
 */
router.post('/update', updateWeather);

/**
 * @route   POST /api/weather/set
 * @desc    Admin endpoint to set weather for testing
 * @access  Private (Admin only - TODO: add admin middleware)
 */
router.post('/set', requireAuth, setWeather);

export default router;
