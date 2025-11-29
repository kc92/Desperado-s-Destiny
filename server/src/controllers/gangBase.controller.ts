/**
 * Gang Base Controller
 *
 * Handles HTTP requests for gang base operations
 */

import { Request, Response } from 'express';
import { GangBaseService } from '../services/gangBase.service';
import {
  BaseTier,
  BaseLocationType,
  FacilityType,
  BaseUpgradeType,
} from '@desperados/shared';
import { AuthRequest } from '../middleware/requireAuth';
import logger from '../utils/logger';

export class GangBaseController {
  /**
   * POST /api/gangs/:gangId/base/establish
   * Establish a new gang base
   */
  static async establish(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId, tier, locationType, region, coordinates } = req.body;

      if (!characterId || !locationType || !region) {
        res.status(400).json({
          success: false,
          error: 'characterId, locationType, and region are required',
        });
        return;
      }

      // Validate locationType
      if (!Object.values(BaseLocationType).includes(locationType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid location type',
        });
        return;
      }

      // Validate tier if provided
      const baseTier = tier || BaseTier.HIDEOUT;
      if (!Object.values(BaseTier).includes(baseTier)) {
        res.status(400).json({
          success: false,
          error: 'Invalid base tier',
        });
        return;
      }

      const base = await GangBaseService.establishBase(
        gangId,
        characterId,
        baseTier,
        locationType,
        region,
        coordinates
      );

      res.status(201).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error establishing base:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to establish base',
      });
    }
  }

  /**
   * GET /api/gangs/:gangId/base
   * Get gang base details
   */
  static async getBase(req: Request, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;

      const base = await GangBaseService.getBase(gangId);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error getting base:', error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get base',
      });
    }
  }

  /**
   * POST /api/gangs/:gangId/base/upgrade
   * Upgrade base tier
   */
  static async upgradeTier(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const base = await GangBaseService.upgradeTier(gangId, characterId);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error upgrading tier:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upgrade tier',
      });
    }
  }

  /**
   * POST /api/gangs/:gangId/base/facility
   * Add facility to base
   */
  static async addFacility(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId, facilityType } = req.body;

      if (!characterId || !facilityType) {
        res.status(400).json({
          success: false,
          error: 'characterId and facilityType are required',
        });
        return;
      }

      // Validate facility type
      if (!Object.values(FacilityType).includes(facilityType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid facility type',
        });
        return;
      }

      const base = await GangBaseService.addFacility(gangId, characterId, facilityType);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error adding facility:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add facility',
      });
    }
  }

  /**
   * POST /api/gangs/:gangId/base/upgrade-feature
   * Add upgrade to base
   */
  static async addUpgrade(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId, upgradeType } = req.body;

      if (!characterId || !upgradeType) {
        res.status(400).json({
          success: false,
          error: 'characterId and upgradeType are required',
        });
        return;
      }

      // Validate upgrade type
      if (!Object.values(BaseUpgradeType).includes(upgradeType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid upgrade type',
        });
        return;
      }

      const base = await GangBaseService.addUpgrade(gangId, characterId, upgradeType);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error adding upgrade:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add upgrade',
      });
    }
  }

  /**
   * POST /api/gangs/:gangId/base/defense/guard
   * Hire a guard
   */
  static async hireGuard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId, guardName, level, combatSkill } = req.body;

      if (!characterId || !guardName || !level || !combatSkill) {
        res.status(400).json({
          success: false,
          error: 'characterId, guardName, level, and combatSkill are required',
        });
        return;
      }

      if (level < 1 || level > 50) {
        res.status(400).json({
          success: false,
          error: 'Guard level must be between 1 and 50',
        });
        return;
      }

      if (combatSkill < 1 || combatSkill > 100) {
        res.status(400).json({
          success: false,
          error: 'Combat skill must be between 1 and 100',
        });
        return;
      }

      const base = await GangBaseService.hireGuard(
        gangId,
        characterId,
        guardName,
        level,
        combatSkill
      );

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error hiring guard:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to hire guard',
      });
    }
  }

  /**
   * DELETE /api/gangs/:gangId/base/defense/guard/:guardId
   * Fire a guard
   */
  static async fireGuard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId, guardId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const base = await GangBaseService.fireGuard(gangId, characterId, guardId);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error firing guard:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fire guard',
      });
    }
  }

  /**
   * POST /api/gangs/:gangId/base/defense/trap
   * Install a trap
   */
  static async installTrap(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId, trapType, effectiveness } = req.body;

      if (!characterId || !trapType || !effectiveness) {
        res.status(400).json({
          success: false,
          error: 'characterId, trapType, and effectiveness are required',
        });
        return;
      }

      const validTrapTypes = ['alarm', 'damage', 'slow', 'capture'];
      if (!validTrapTypes.includes(trapType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid trap type',
        });
        return;
      }

      if (effectiveness < 1 || effectiveness > 100) {
        res.status(400).json({
          success: false,
          error: 'Effectiveness must be between 1 and 100',
        });
        return;
      }

      const base = await GangBaseService.installTrap(
        gangId,
        characterId,
        trapType as 'alarm' | 'damage' | 'slow' | 'capture',
        effectiveness
      );

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error installing trap:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to install trap',
      });
    }
  }

  /**
   * DELETE /api/gangs/:gangId/base/defense/trap/:trapId
   * Remove a trap
   */
  static async removeTrap(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId, trapId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const base = await GangBaseService.removeTrap(gangId, characterId, trapId);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error removing trap:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove trap',
      });
    }
  }

  /**
   * GET /api/gangs/:gangId/base/storage
   * Get base storage details
   */
  static async getStorage(req: Request, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;

      const storage = await GangBaseService.getStorage(gangId);

      res.status(200).json({
        success: true,
        data: storage,
      });
    } catch (error) {
      logger.error('Error getting storage:', error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get storage',
      });
    }
  }

  /**
   * POST /api/gangs/:gangId/base/storage/deposit
   * Deposit item to storage
   */
  static async depositItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId, itemId, quantity } = req.body;

      if (!characterId || !itemId || !quantity) {
        res.status(400).json({
          success: false,
          error: 'characterId, itemId, and quantity are required',
        });
        return;
      }

      if (quantity < 1) {
        res.status(400).json({
          success: false,
          error: 'Quantity must be at least 1',
        });
        return;
      }

      const base = await GangBaseService.depositItem(gangId, characterId, itemId, quantity);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error depositing item:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deposit item',
      });
    }
  }

  /**
   * POST /api/gangs/:gangId/base/storage/withdraw
   * Withdraw item from storage
   */
  static async withdrawItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const { characterId, itemId, quantity } = req.body;

      if (!characterId || !itemId || !quantity) {
        res.status(400).json({
          success: false,
          error: 'characterId, itemId, and quantity are required',
        });
        return;
      }

      if (quantity < 1) {
        res.status(400).json({
          success: false,
          error: 'Quantity must be at least 1',
        });
        return;
      }

      const base = await GangBaseService.withdrawItem(gangId, characterId, itemId, quantity);

      res.status(200).json({
        success: true,
        data: base.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error withdrawing item:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to withdraw item',
      });
    }
  }

  /**
   * GET /api/bases/all
   * Get all active bases (admin/leaderboard)
   */
  static async getAllBases(req: Request, res: Response): Promise<void> {
    try {
      const bases = await GangBaseService.getAllActiveBases();

      res.status(200).json({
        success: true,
        data: bases.map((b) => b.toSafeObject()),
      });
    } catch (error) {
      logger.error('Error getting all bases:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get bases',
      });
    }
  }
}
