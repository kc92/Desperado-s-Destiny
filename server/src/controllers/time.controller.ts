/**
 * Time Controller
 *
 * Handles time-related API endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { TimeService } from '../services/time.service';

/**
 * Get current game time state
 * GET /api/time
 */
export const getCurrentTime = asyncHandler(
  async (req: Request, res: Response) => {
    const timeState = TimeService.getCurrentTimeState();
    const config = TimeService.getGameTimeConfig();

    res.status(200).json({
      success: true,
      data: {
        timeState,
        gameTimeRatio: config.ratio,
        currentGameTime: config.currentGameTime,
      },
    });
  }
);

/**
 * Get time effects for a specific period
 * GET /api/time/effects/:period
 */
export const getTimeEffects = asyncHandler(
  async (req: Request, res: Response) => {
    const { period } = req.params;

    // Validate period
    const validPeriods = [
      'dawn',
      'morning',
      'noon',
      'afternoon',
      'evening',
      'night',
      'midnight',
    ];

    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: `Invalid time period. Must be one of: ${validPeriods.join(', ')}`,
      });
    }

    const effects = TimeService.getTimeEffects(period as any);

    res.status(200).json({
      success: true,
      data: {
        period,
        effects,
      },
    });
  }
);

/**
 * Check if a building is currently open
 * GET /api/time/building/:buildingType/status
 */
export const getBuildingStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { buildingType } = req.params;

    const accessResult = TimeService.isBuildingOpen(buildingType as any);

    res.status(200).json({
      success: true,
      data: {
        buildingType,
        ...accessResult,
      },
    });
  }
);

/**
 * Check crime availability at current time
 * POST /api/time/crime/check
 */
export const checkCrimeAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const { crimeName, baseWitnessChance } = req.body;

    if (!crimeName || typeof baseWitnessChance !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'crimeName and baseWitnessChance are required',
      });
    }

    const availability = TimeService.checkCrimeAvailability(
      crimeName,
      baseWitnessChance
    );

    res.status(200).json({
      success: true,
      data: {
        crimeName,
        baseWitnessChance,
        ...availability,
      },
    });
  }
);

/**
 * Get time-based location description
 * POST /api/time/location/description
 */
export const getLocationDescription = asyncHandler(
  async (req: Request, res: Response) => {
    const { baseDescription, locationType } = req.body;

    if (!baseDescription || !locationType) {
      return res.status(400).json({
        success: false,
        message: 'baseDescription and locationType are required',
      });
    }

    const description = TimeService.getLocationDescription(
      baseDescription,
      locationType
    );

    const timeState = TimeService.getCurrentTimeState();

    res.status(200).json({
      success: true,
      data: {
        description,
        currentPeriod: timeState.currentPeriod,
        isDaylight: timeState.isDaylight,
      },
    });
  }
);

export default {
  getCurrentTime,
  getTimeEffects,
  getBuildingStatus,
  checkCrimeAvailability,
  getLocationDescription,
};
