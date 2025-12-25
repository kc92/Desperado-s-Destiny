/**
 * Gang Business Controller
 *
 * Phase 15: Gang Businesses
 *
 * Handles HTTP requests for gang business and protection racket operations
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GangBusinessService } from '../services/gangBusiness.service';
import { ProtectionRacketService } from '../services/protectionRacket.service';
import { BusinessService } from '../services/business.service';
import { Business } from '../models/Business.model';
import { Gang } from '../models/Gang.model';
import { ProtectionContract } from '../models/ProtectionContract.model';
import { Character, ICharacter } from '../models/Character.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { PlayerBusinessType, ProtectionTier, ProtectionStatus } from '@desperados/shared';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

/**
 * Helper to verify character ownership
 */
async function verifyCharacterOwnership(
  userId: string,
  characterId: string,
  res: Response
): Promise<ICharacter | null> {
  const character = await Character.findById(characterId);

  if (!character) {
    res.status(404).json({ success: false, error: 'Character not found' });
    return null;
  }

  if (character.userId.toString() !== userId.toString()) {
    logger.warn(`[SECURITY] IDOR attempt: user ${userId} tried to use character ${characterId}`);
    res.status(403).json({ success: false, error: 'You do not own this character' });
    return null;
  }

  return character;
}

export class GangBusinessController {
  // =============================================================================
  // Gang Business Management
  // =============================================================================

  /**
   * GET /api/gang-businesses/gang/:gangId
   * Get all businesses owned by a gang
   */
  static async getGangBusinesses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const characterId = (req as any).character?._id;

      if (!characterId) {
        res.status(401).json({ success: false, error: 'Character not found' });
        return;
      }

      // Verify character is a member of the gang
      const gang = await Gang.findById(gangId);
      if (!gang) {
        res.status(404).json({ success: false, error: 'Gang not found' });
        return;
      }

      const isMember = gang.members.some(m =>
        m.characterId.toString() === characterId.toString()
      );
      if (!isMember) {
        res.status(403).json({ success: false, error: 'You are not a member of this gang' });
        return;
      }

      const summary = await GangBusinessService.getGangBusinesses(
        new mongoose.Types.ObjectId(gangId)
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error getting gang businesses:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gang-businesses/gang/:gangId/purchase
   * Purchase a new business for the gang (Leader only)
   */
  static async purchaseBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { gangId } = req.params;
      const { characterId, propertyId, businessType, businessName, description } = req.body;

      if (!characterId || !propertyId || !businessType || !businessName) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, propertyId, businessType, businessName',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const business = await GangBusinessService.purchaseBusinessForGang(
        new mongoose.Types.ObjectId(gangId),
        new mongoose.Types.ObjectId(characterId),
        {
          propertyId,
          businessType: businessType as PlayerBusinessType,
          customName: businessName, // customName in interface, businessName from request
        }
      );

      res.status(201).json({
        success: true,
        message: 'Business purchased for gang',
        data: business,
      });
    } catch (error) {
      logger.error('Error purchasing gang business:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gang-businesses/:businessId/transfer-to-gang
   * Transfer a player's business to their gang
   */
  static async transferToGang(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { businessId } = req.params;
      const { characterId, gangId, revenueSharePercent } = req.body;

      if (!characterId || !gangId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, gangId',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const business = await GangBusinessService.transferBusinessToGang(
        {
          businessId,
          gangId,
          revenueSharePercent,
        },
        new mongoose.Types.ObjectId(characterId)
      );

      res.status(200).json({
        success: true,
        message: 'Business transferred to gang',
        data: business,
      });
    } catch (error) {
      logger.error('Error transferring business to gang:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gang-businesses/gang/:gangId/businesses/:businessId/collect
   * Collect revenue from gang business (Officer+ only)
   */
  static async collectRevenue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { gangId, businessId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      // Use BusinessService.collectRevenue which already handles gang businesses
      const result = await BusinessService.collectRevenue(characterId, businessId);

      res.status(200).json({
        success: true,
        message: 'Revenue collected',
        data: result,
      });
    } catch (error) {
      logger.error('Error collecting gang business revenue:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * PUT /api/gang-businesses/gang/:gangId/businesses/:businessId/manager
   * Set manager for gang business (Leader only)
   */
  static async setManager(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { gangId, businessId } = req.params;
      const { characterId, managerId } = req.body;

      if (!characterId || !managerId) {
        res.status(400).json({
          success: false,
          error: 'characterId and managerId are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const business = await GangBusinessService.setBusinessManager(
        new mongoose.Types.ObjectId(gangId),
        new mongoose.Types.ObjectId(businessId),
        new mongoose.Types.ObjectId(managerId),
        new mongoose.Types.ObjectId(characterId)
      );

      res.status(200).json({
        success: true,
        message: 'Manager assigned',
        data: business,
      });
    } catch (error) {
      logger.error('Error setting gang business manager:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * PUT /api/gang-businesses/gang/:gangId/businesses/:businessId/revenue-share
   * Update revenue share percentage (Leader only)
   */
  static async setRevenueShare(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { gangId, businessId } = req.params;
      const { characterId, revenueSharePercent } = req.body;

      if (!characterId || revenueSharePercent === undefined) {
        res.status(400).json({
          success: false,
          error: 'characterId and revenueSharePercent are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const business = await GangBusinessService.updateRevenueShare(
        new mongoose.Types.ObjectId(gangId),
        new mongoose.Types.ObjectId(businessId),
        revenueSharePercent,
        new mongoose.Types.ObjectId(characterId)
      );

      res.status(200).json({
        success: true,
        message: 'Revenue share updated',
        data: business,
      });
    } catch (error) {
      logger.error('Error setting revenue share:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gang-businesses/gang/:gangId/businesses/:businessId/sell
   * Sell a gang business (Leader only)
   */
  static async sellBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { gangId, businessId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const result = await GangBusinessService.sellGangBusiness(
        new mongoose.Types.ObjectId(gangId),
        new mongoose.Types.ObjectId(businessId),
        new mongoose.Types.ObjectId(characterId)
      );

      res.status(200).json({
        success: true,
        message: 'Business sold',
        data: result,
      });
    } catch (error) {
      logger.error('Error selling gang business:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  // =============================================================================
  // Protection Racket
  // =============================================================================

  /**
   * POST /api/gang-businesses/gang/:gangId/protection/offer
   * Offer protection to a business (Officer+ only)
   */
  static async offerProtection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { gangId } = req.params;
      const { characterId, businessId, tier } = req.body;

      if (!characterId || !businessId || !tier) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, businessId, tier',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      // Validate tier
      if (!Object.values(ProtectionTier).includes(tier)) {
        res.status(400).json({
          success: false,
          error: 'Invalid protection tier',
        });
        return;
      }

      const contract = await ProtectionRacketService.offerProtection(
        new mongoose.Types.ObjectId(gangId),
        new mongoose.Types.ObjectId(businessId),
        tier as ProtectionTier,
        new mongoose.Types.ObjectId(characterId)
      );

      res.status(201).json({
        success: true,
        message: 'Protection offer sent',
        data: contract,
      });
    } catch (error) {
      logger.error('Error offering protection:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/gang-businesses/gang/:gangId/protection
   * Get all protection contracts for a gang
   */
  static async getGangProtectionContracts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;
      const characterId = (req as any).character?._id;

      if (!characterId) {
        res.status(401).json({ success: false, error: 'Character not found' });
        return;
      }

      // Verify membership
      const gang = await Gang.findById(gangId);
      if (!gang) {
        res.status(404).json({ success: false, error: 'Gang not found' });
        return;
      }

      const isMember = gang.members.some(m =>
        m.characterId.toString() === characterId.toString()
      );
      if (!isMember) {
        res.status(403).json({ success: false, error: 'You are not a member of this gang' });
        return;
      }

      const contracts = await ProtectionRacketService.getGangProtectionContracts(
        new mongoose.Types.ObjectId(gangId)
      );

      res.status(200).json({
        success: true,
        data: contracts,
      });
    } catch (error) {
      logger.error('Error getting gang protection contracts:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/gang-businesses/businesses/:businessId/protection
   * Get protection status for a business
   */
  static async getBusinessProtectionStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;

      const contract = await ProtectionRacketService.getBusinessProtectionStatus(
        new mongoose.Types.ObjectId(businessId)
      );

      res.status(200).json({
        success: true,
        data: {
          isProtected: !!contract && contract.status === ProtectionStatus.ACTIVE,
          contract,
        },
      });
    } catch (error) {
      logger.error('Error getting business protection status:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gang-businesses/protection/:contractId/respond
   * Business owner responds to protection offer
   */
  static async respondToProtectionOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { contractId } = req.params;
      const { characterId, accept } = req.body;

      if (!characterId || accept === undefined) {
        res.status(400).json({
          success: false,
          error: 'characterId and accept are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const contract = await ProtectionRacketService.respondToOffer(
        new mongoose.Types.ObjectId(contractId),
        new mongoose.Types.ObjectId(characterId),
        accept
      );

      res.status(200).json({
        success: true,
        message: accept ? 'Protection accepted' : 'Protection declined',
        data: contract,
      });
    } catch (error) {
      logger.error('Error responding to protection offer:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gang-businesses/protection/:contractId/terminate
   * Terminate a protection contract
   */
  static async terminateProtection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { contractId } = req.params;
      const { characterId, terminatedBy } = req.body;

      if (!characterId || !terminatedBy) {
        res.status(400).json({
          success: false,
          error: 'characterId and terminatedBy are required',
        });
        return;
      }

      if (!['business', 'gang'].includes(terminatedBy)) {
        res.status(400).json({
          success: false,
          error: 'terminatedBy must be "business" or "gang"',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const contract = await ProtectionRacketService.terminateContract(
        new mongoose.Types.ObjectId(contractId),
        terminatedBy as 'business' | 'gang',
        new mongoose.Types.ObjectId(characterId)
      );

      res.status(200).json({
        success: true,
        message: 'Protection contract terminated',
        data: contract,
      });
    } catch (error) {
      logger.error('Error terminating protection:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/gang-businesses/my-protection-offers
   * Get pending protection offers for the authenticated character's businesses
   */
  static async getMyProtectionOffers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const characterId = (req as any).character?._id;

      if (!characterId) {
        res.status(401).json({ success: false, error: 'Character not found' });
        return;
      }

      const offers = await ProtectionContract.findPendingOffers(
        new mongoose.Types.ObjectId(characterId)
      );

      res.status(200).json({
        success: true,
        data: offers,
      });
    } catch (error) {
      logger.error('Error getting protection offers:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }
}
