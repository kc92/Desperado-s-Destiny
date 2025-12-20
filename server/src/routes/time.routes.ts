/**
 * Time Routes
 *
 * Routes for time-of-day system endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  getCurrentTime,
  getTimeEffects,
  getBuildingStatus,
  checkCrimeAvailability,
  getLocationDescription,
} from '../controllers/time.controller';

const router = Router();

/**
 * @route   GET /api/time
 * @desc    Get current game time state
 * @access  Public
 */
router.get('/', asyncHandler(getCurrentTime));

/**
 * @route   GET /api/time/effects/:period
 * @desc    Get time effects for a specific period
 * @access  Public
 */
router.get('/effects/:period', asyncHandler(getTimeEffects));

/**
 * @route   GET /api/time/building/:buildingType/status
 * @desc    Check if a building type is currently open
 * @access  Public
 */
router.get('/building/:buildingType/status', asyncHandler(getBuildingStatus));

/**
 * @route   POST /api/time/crime/check
 * @desc    Check crime availability at current time
 * @access  Public
 */
router.post('/crime/check', requireCsrfToken, asyncHandler(checkCrimeAvailability));

/**
 * @route   POST /api/time/location/description
 * @desc    Get time-based location description
 * @access  Public
 */
router.post('/location/description', requireCsrfToken, asyncHandler(getLocationDescription));

export default router;
