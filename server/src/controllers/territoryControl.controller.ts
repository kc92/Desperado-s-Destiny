/**
 * Territory Control Controller
 *
 * Handles HTTP requests for gang territory control system
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TerritoryControlService } from '../services/territoryControl.service';
import { InfluenceActivityType } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Get all zones
 */
export const getZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const zones = await TerritoryControlService.getZones();

    res.json({
      success: true,
      data: zones,
      meta: {
        total: zones.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching zones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch zones',
    });
  }
};

/**
 * Get single zone details
 */
export const getZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zoneId } = req.params;

    const zone = await TerritoryControlService.getZone(zoneId);

    res.json({
      success: true,
      data: zone,
    });
  } catch (error) {
    logger.error('Error fetching zone:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch zone',
      });
    }
  }
};

/**
 * Get gang's territory overview
 */
export const getGangTerritoryControl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gangId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gangId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid gang ID',
      });
      return;
    }

    const territoryControl = await TerritoryControlService.getGangTerritoryControl(
      new mongoose.Types.ObjectId(gangId)
    );

    res.json({
      success: true,
      data: territoryControl,
    });
  } catch (error) {
    logger.error('Error fetching gang territory control:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch territory control',
      });
    }
  }
};

/**
 * Record influence gain
 */
export const recordInfluenceGain = async (req: Request, res: Response): Promise<void> => {
  try {
    const characterId = req.user?.characterId;

    if (!characterId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const { zoneId, activityType } = req.body;

    if (!zoneId || !activityType) {
      res.status(400).json({
        success: false,
        error: 'Missing zoneId or activityType',
      });
      return;
    }

    if (!Object.values(InfluenceActivityType).includes(activityType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid activity type',
      });
      return;
    }

    const result = await TerritoryControlService.recordInfluenceGain(
      zoneId,
      new mongoose.Types.ObjectId(characterId),
      activityType
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error recording influence gain:', error);
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes('not in a gang')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to record influence gain',
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to record influence gain',
      });
    }
  }
};

/**
 * Contest a zone
 */
export const contestZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const characterId = req.user?.characterId;

    if (!characterId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const { zoneId } = req.params;

    // Get character's gang
    const Gang = mongoose.model('Gang');
    const gang = await Gang.findOne({
      'members.characterId': new mongoose.Types.ObjectId(characterId),
      isActive: true,
    });

    if (!gang) {
      res.status(400).json({
        success: false,
        error: 'Character is not in a gang',
      });
      return;
    }

    // Check if character has permission
    const member = gang.members.find((m: { characterId: mongoose.Types.ObjectId }) =>
      m.characterId.equals(characterId)
    );

    if (!member || (member.role !== 'leader' && member.role !== 'officer')) {
      res.status(403).json({
        success: false,
        error: 'Only gang leaders and officers can contest zones',
      });
      return;
    }

    const result = await TerritoryControlService.contestZone(
      zoneId,
      gang._id as mongoose.Types.ObjectId
    );

    res.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    logger.error('Error contesting zone:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to contest zone',
      });
    }
  }
};

/**
 * Get territory map
 */
export const getTerritoryMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapData = await TerritoryControlService.getTerritoryMap();

    res.json({
      success: true,
      data: mapData,
    });
  } catch (error) {
    logger.error('Error fetching territory map:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch territory map',
    });
  }
};

/**
 * Get zone statistics
 */
export const getZoneStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await TerritoryControlService.getZoneStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching zone statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch zone statistics',
    });
  }
};
