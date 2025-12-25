/**
 * Deep Mining Controller
 * Handles API requests for Phase 13 Deep Mining System
 *
 * Features:
 * - Illegal claims management
 * - Deep mining shafts
 * - Fence operations
 * - Inspector encounters
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { IllegalMiningService } from '../services/illegalMining.service';
import { DeepMiningShaftService } from '../services/deepMiningShaft.service';
import { FenceOperationService } from '../services/fenceOperation.service';
import { MiningInspectorService } from '../services/miningInspector.service';
import { FenceLocationId, InspectorType } from '@desperados/shared';
import logger from '../utils/logger';

// ============================================
// ILLEGAL CLAIMS
// ============================================

/**
 * POST /api/deep-mining/illegal/stake
 * Stake a new illegal (unregistered) claim
 */
export async function stakeIllegalClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, locationId, claimName } = req.body;
    if (!characterId || !locationId) {
      res.status(400).json({ success: false, error: 'Character ID and location ID required' });
      return;
    }

    const result = await IllegalMiningService.stakeIllegalClaim(
      characterId,
      locationId,
      claimName || 'Unnamed Claim'
    );

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        claimId: result.claim?._id,
        locationId: result.claim?.locationId,
        name: result.claim?.zoneName,
        message: 'You have staked an illegal claim. Keep a low profile!'
      }
    });
  } catch (error) {
    logger.error('Error staking illegal claim:', error);
    res.status(500).json({ success: false, error: 'Failed to stake illegal claim' });
  }
}

/**
 * GET /api/deep-mining/illegal/:characterId
 * Get all illegal claims for a character
 */
export async function getIllegalClaims(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const claims = await IllegalMiningService.getActiveClaimsForCharacter(characterId);

    res.status(200).json({
      success: true,
      data: {
        claims: claims.map(c => ({
          id: c._id,
          locationId: c.locationId,
          name: c.zoneName,
          legalStatus: c.legalStatus,
          suspicionLevel: c.suspicionLevel,
          currentAlertLevel: c.currentAlertLevel,
          hasGangProtection: c.hasGangProtection(),
          gangId: c.gangId,
          totalOreCollected: c.totalOreCollected,
          totalValueCollected: c.totalValueCollected,
          lastCollectionAt: c.lastCollectionAt,
          isActive: c.isActive
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting illegal claims:', error);
    res.status(500).json({ success: false, error: 'Failed to get illegal claims' });
  }
}

/**
 * GET /api/deep-mining/illegal/status/:claimId
 * Get detailed status of a specific illegal claim
 */
export async function getIllegalClaimStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { claimId } = req.params;
    if (!claimId) {
      res.status(400).json({ success: false, error: 'Claim ID required' });
      return;
    }

    const status = await IllegalMiningService.getClaimStatus(claimId);

    if (!status) {
      res.status(404).json({ success: false, error: 'Claim not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting illegal claim status:', error);
    res.status(500).json({ success: false, error: 'Failed to get claim status' });
  }
}

/**
 * POST /api/deep-mining/illegal/collect
 * Collect ore from an illegal claim
 */
export async function collectIllegalOre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimId } = req.body;
    if (!characterId || !claimId) {
      res.status(400).json({ success: false, error: 'Character ID and claim ID required' });
      return;
    }

    const result = await IllegalMiningService.recordOreCollection(claimId, 1, 50);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        oreCollected: 1,
        valueCollected: 50,
        newSuspicionLevel: result.newSuspicionLevel,
        suspicionGained: result.suspicionGained,
        message: 'Ore collected! Be careful - your activity may attract attention.'
      }
    });
  } catch (error) {
    logger.error('Error collecting illegal ore:', error);
    res.status(500).json({ success: false, error: 'Failed to collect ore' });
  }
}

/**
 * POST /api/deep-mining/illegal/protection
 * Request gang protection for an illegal claim
 */
export async function requestGangProtection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimId } = req.body;
    if (!characterId || !claimId) {
      res.status(400).json({ success: false, error: 'Character ID and claim ID required' });
      return;
    }

    const result = await IllegalMiningService.requestGangProtection(claimId, characterId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        weeklyFee: result.weeklyFee,
        message: 'Gang protection granted! Inspectors will be less likely to investigate.'
      }
    });
  } catch (error) {
    logger.error('Error requesting gang protection:', error);
    res.status(500).json({ success: false, error: 'Failed to request protection' });
  }
}

/**
 * POST /api/deep-mining/illegal/bribe
 * Attempt to bribe an inspector
 */
export async function attemptBribe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimId, inspectorType, bribeAmount } = req.body;
    if (!characterId || !claimId || !inspectorType || !bribeAmount) {
      res.status(400).json({ success: false, error: 'All fields required' });
      return;
    }

    const result = await MiningInspectorService.attemptBribe(
      characterId,
      claimId,
      inspectorType as InspectorType,
      bribeAmount
    );

    res.status(200).json({
      success: result.success,
      data: {
        result: result.result,
        message: result.message
      }
    });
  } catch (error) {
    logger.error('Error attempting bribe:', error);
    res.status(500).json({ success: false, error: 'Failed to process bribe' });
  }
}

// ============================================
// DEEP MINING SHAFTS
// ============================================

/**
 * POST /api/deep-mining/shaft/create
 * Create a new mining shaft for an illegal claim
 */
export async function createShaft(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimId } = req.body;
    if (!characterId || !claimId) {
      res.status(400).json({ success: false, error: 'Character ID and claim ID required' });
      return;
    }

    const shaft = await DeepMiningShaftService.createShaft(claimId, characterId);

    if (!shaft) {
      res.status(400).json({ success: false, error: 'Failed to create shaft' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        shaftId: shaft._id,
        currentLevel: shaft.currentLevel,
        maxLevelReached: shaft.maxLevelReached,
        message: 'Mining shaft established! Begin your descent into the depths.'
      }
    });
  } catch (error) {
    logger.error('Error creating shaft:', error);
    res.status(500).json({ success: false, error: 'Failed to create shaft' });
  }
}

/**
 * GET /api/deep-mining/shaft/:characterId
 * Get all shafts for a character
 */
export async function getShafts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const shafts = await DeepMiningShaftService.getShaftsForCharacter(characterId);

    res.status(200).json({
      success: true,
      data: {
        shafts: shafts.map(s => ({
          id: s._id,
          claimId: s.claimId,
          currentLevel: s.currentLevel,
          maxLevelReached: s.maxLevelReached,
          levelProgress: s.levelProgress,
          activeHazards: s.activeHazards.length,
          installedEquipment: s.installedEquipment.map(e => e.type)
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting shafts:', error);
    res.status(500).json({ success: false, error: 'Failed to get shafts' });
  }
}

/**
 * GET /api/deep-mining/shaft/status/:shaftId
 * Get detailed status of a mining shaft
 */
export async function getShaftStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { shaftId } = req.params;
    if (!shaftId) {
      res.status(400).json({ success: false, error: 'Shaft ID required' });
      return;
    }

    const status = await DeepMiningShaftService.getShaftStatus(shaftId);

    if (!status) {
      res.status(404).json({ success: false, error: 'Shaft not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting shaft status:', error);
    res.status(500).json({ success: false, error: 'Failed to get shaft status' });
  }
}

/**
 * POST /api/deep-mining/shaft/descend
 * Descend to the next level of a shaft
 */
export async function descendShaft(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, shaftId } = req.body;
    if (!characterId || !shaftId) {
      res.status(400).json({ success: false, error: 'Character ID and shaft ID required' });
      return;
    }

    const result = await DeepMiningShaftService.descendToNextLevel(shaftId, characterId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        newLevel: result.newLevel,
        hazardsEncountered: result.hazardsEncountered,
        message: `Descended to level ${result.newLevel}!`
      }
    });
  } catch (error) {
    logger.error('Error descending shaft:', error);
    res.status(500).json({ success: false, error: 'Failed to descend' });
  }
}

/**
 * POST /api/deep-mining/shaft/mine
 * Mine at the current level of a shaft
 */
export async function mineAtLevel(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, shaftId } = req.body;
    if (!characterId || !shaftId) {
      res.status(400).json({ success: false, error: 'Character ID and shaft ID required' });
      return;
    }

    const result = await DeepMiningShaftService.mineAtCurrentLevel(shaftId, characterId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        resourcesFound: result.resourcesFound,
        progressGained: result.progressGained,
        hazardTriggered: result.hazardTriggered
      }
    });
  } catch (error) {
    logger.error('Error mining at level:', error);
    res.status(500).json({ success: false, error: 'Failed to mine' });
  }
}

/**
 * POST /api/deep-mining/shaft/equipment
 * Install equipment in a shaft
 */
export async function installEquipment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, shaftId, equipmentType } = req.body;
    if (!characterId || !shaftId || !equipmentType) {
      res.status(400).json({ success: false, error: 'Character ID, shaft ID, and equipment type required' });
      return;
    }

    const result = await DeepMiningShaftService.installEquipment(
      shaftId,
      characterId,
      equipmentType
    );

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        equipmentType,
        newMitigation: result.newMitigation,
        message: 'Equipment installed successfully!'
      }
    });
  } catch (error) {
    logger.error('Error installing equipment:', error);
    res.status(500).json({ success: false, error: 'Failed to install equipment' });
  }
}

// ============================================
// FENCE OPERATIONS
// ============================================

/**
 * GET /api/deep-mining/fence/:characterId
 * Get all fence locations with character's trust levels
 */
export async function getFenceListings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const listings = await FenceOperationService.getFenceListings(characterId);

    res.status(200).json({
      success: true,
      data: listings
    });
  } catch (error) {
    logger.error('Error getting fence listings:', error);
    res.status(500).json({ success: false, error: 'Failed to get fence listings' });
  }
}

/**
 * POST /api/deep-mining/fence/quote
 * Get a price quote from a fence
 */
export async function getFenceQuote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, fenceLocationId, items } = req.body;
    if (!characterId || !fenceLocationId || !items?.length) {
      res.status(400).json({ success: false, error: 'Character ID, fence location, and items required' });
      return;
    }

    const quote = await FenceOperationService.getFenceQuote(
      characterId,
      fenceLocationId as FenceLocationId,
      items
    );

    res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    logger.error('Error getting fence quote:', error);
    res.status(500).json({ success: false, error: 'Failed to get quote' });
  }
}

/**
 * POST /api/deep-mining/fence/sell
 * Sell items to a fence
 */
export async function sellToFence(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, fenceLocationId, items } = req.body;
    if (!characterId || !fenceLocationId || !items?.length) {
      res.status(400).json({ success: false, error: 'Character ID, fence location, and items required' });
      return;
    }

    const result = await FenceOperationService.sellToFence(
      characterId,
      fenceLocationId as FenceLocationId,
      items
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
        wasStingOperation: result.wasStingOperation
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        goldReceived: result.goldReceived,
        fenceRate: result.fenceRate,
        trustGained: result.trustGained,
        newTrustLevel: result.newTrustLevel,
        message: 'Sale complete! The goods have changed hands.'
      }
    });
  } catch (error) {
    logger.error('Error selling to fence:', error);
    res.status(500).json({ success: false, error: 'Failed to complete sale' });
  }
}

// ============================================
// INSPECTION INFO
// ============================================

/**
 * GET /api/deep-mining/inspection/:claimId
 * Get inspection likelihood for a claim
 */
export async function getInspectionInfo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { claimId } = req.params;
    if (!claimId) {
      res.status(400).json({ success: false, error: 'Claim ID required' });
      return;
    }

    const { IllegalClaim } = await import('../models/IllegalClaim.model');
    const claim = await IllegalClaim.findById(claimId);

    if (!claim) {
      res.status(404).json({ success: false, error: 'Claim not found' });
      return;
    }

    const inspectionInfo = MiningInspectorService.getInspectionLikelihood(claim);

    res.status(200).json({
      success: true,
      data: inspectionInfo
    });
  } catch (error) {
    logger.error('Error getting inspection info:', error);
    res.status(500).json({ success: false, error: 'Failed to get inspection info' });
  }
}
