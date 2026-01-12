/**
 * Illegal Mining Service
 *
 * Phase 13: Deep Mining System
 *
 * Handles illegal/unregistered mining claims, suspicion mechanics,
 * gang protection, and law enforcement interactions.
 */

import mongoose from 'mongoose';
import { SecureRNG } from './base/SecureRNG';
import { IllegalClaim, IIllegalClaimDoc } from '../models/IllegalClaim.model';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import { Territory } from '../models/Territory.model';
import { Location } from '../models/Location.model';
import { WorldZone } from '../models/WorldZone.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import {
  ClaimLegalStatus,
  SuspicionLevel,
  SuspicionEventType,
  IIllegalClaimStatusResponse,
} from '@desperados/shared';
import {
  SUSPICION_THRESHOLDS,
  SUSPICION_CHANGES,
  GANG_PROTECTION,
  getSuspicionLevel,
} from '@desperados/shared';
import { handleServiceError, logServiceWarning } from '../utils/errorHandling';

/**
 * Result of staking an illegal claim
 */
interface StakeIllegalClaimResult {
  success: boolean;
  claim?: IIllegalClaimDoc;
  error?: string;
}

/**
 * Result of gang protection request
 */
interface GangProtectionResult {
  success: boolean;
  weeklyFee?: number;
  error?: string;
}

/**
 * Result of ore collection
 */
interface CollectOreResult {
  success: boolean;
  suspicionGained: number;
  newSuspicionLevel: number;
  newAlertLevel: SuspicionLevel;
  error?: string;
}

export class IllegalMiningService {
  /**
   * Stake a new illegal (unregistered) claim
   */
  static async stakeIllegalClaim(
    characterId: string,
    locationId: string,
    zoneName: string
  ): Promise<StakeIllegalClaimResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Check if character already has a claim at this location
      const existingClaim = await IllegalClaim.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        locationId,
        isActive: true,
      });

      if (existingClaim) {
        return { success: false, error: 'You already have an active claim at this location' };
      }

      // Check max illegal claims (limit to 3)
      const activeClaims = await IllegalClaim.getActiveClaimsForCharacter(characterId);
      if (activeClaims.length >= 3) {
        return { success: false, error: 'Maximum of 3 illegal claims allowed' };
      }

      // Create the illegal claim
      const claim = new IllegalClaim({
        characterId: new mongoose.Types.ObjectId(characterId),
        locationId,
        zoneName,
        legalStatus: ClaimLegalStatus.UNREGISTERED,
        suspicionLevel: 0,
        currentAlertLevel: SuspicionLevel.UNKNOWN,
      });

      await claim.save();

      return { success: true, claim };
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'stakeIllegalClaim', characterId, locationId });
      return { success: false, error: 'Failed to stake illegal claim' };
    }
  }

  /**
   * Get illegal claim status with recommendations
   */
  static async getClaimStatus(claimId: string): Promise<IIllegalClaimStatusResponse | null> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim) return null;

      const recommendations: string[] = [];

      // Generate recommendations based on suspicion level
      if (claim.suspicionLevel > 75) {
        recommendations.push('DANGER: Warrant issued! Consider laying low or seeking gang protection.');
        recommendations.push('Avoid collecting ore to prevent arrest.');
      } else if (claim.suspicionLevel > 50) {
        recommendations.push('WARNING: Marshals are actively patrolling. Be cautious.');
        recommendations.push('Consider selling ore through fences instead of legal channels.');
      } else if (claim.suspicionLevel > 25) {
        recommendations.push('CAUTION: Suspicion is rising. Random inspections possible.');
        if (!claim.gangId) {
          recommendations.push('Consider seeking gang protection to reduce suspicion.');
        }
      }

      // Gang protection recommendations
      if (!claim.gangId && claim.suspicionLevel > 15) {
        recommendations.push('Gang protection provides 50% suspicion reduction.');
      }

      // Calculate inspection risk
      const baseRisk = claim.suspicionLevel * 0.5; // 0-50% base risk
      const inspectionRisk = Math.min(100, baseRisk);

      return {
        claim: claim.toObject() as any,
        currentAlertLevel: claim.currentAlertLevel,
        nextInspectionRisk: inspectionRisk,
        gangProtectionActive: claim.hasGangProtection(),
        recommendedActions: recommendations,
      };
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'getClaimStatus', claimId });
      return null;
    }
  }

  /**
   * Record ore collection and add suspicion
   */
  static async recordOreCollection(
    claimId: string,
    oreValue: number,
    oreQuantity: number
  ): Promise<CollectOreResult> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive) {
        throw new Error('Claim not found or inactive');
      }

      // Calculate suspicion gain based on ore value
      const baseSuspicion = SUSPICION_CHANGES[SuspicionEventType.ORE_COLLECTED];
      // Add extra suspicion for high-value ore (1 per $100)
      const additionalSuspicion = Math.floor(oreValue / 100);
      const totalSuspicion = Math.min(20, baseSuspicion + additionalSuspicion); // Cap at 20

      // Add suspicion (gang protection reduces by 50%)
      claim.addSuspicion(SuspicionEventType.ORE_COLLECTED, totalSuspicion, {
        oreValue,
        oreQuantity,
      });

      // Update yield tracking
      claim.totalOreCollected += oreQuantity;
      claim.totalValueCollected += oreValue;
      claim.lastCollectionAt = new Date();

      await claim.save();

      return {
        success: true,
        suspicionGained: totalSuspicion,
        newSuspicionLevel: claim.suspicionLevel,
        newAlertLevel: claim.currentAlertLevel,
      };
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'recordOreCollection', claimId, oreValue, oreQuantity });
      return {
        success: false,
        suspicionGained: 0,
        newSuspicionLevel: 0,
        newAlertLevel: SuspicionLevel.UNKNOWN,
      };
    }
  }

  /**
   * Record legal sale of illegal ore (increases suspicion)
   */
  static async recordLegalSale(claimId: string, saleValue: number): Promise<void> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive) return;

      const suspicionGain = SUSPICION_CHANGES[SuspicionEventType.LEGAL_SALE];
      claim.addSuspicion(SuspicionEventType.LEGAL_SALE, suspicionGain, { saleValue });

      await claim.save();
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'recordLegalSale', claimId, saleValue });
    }
  }

  /**
   * Request gang protection for a claim
   */
  static async requestGangProtection(
    claimId: string,
    characterId: string
  ): Promise<GangProtectionResult> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive) {
        return { success: false, error: 'Claim not found or inactive' };
      }

      if (claim.characterId.toString() !== characterId) {
        return { success: false, error: 'This is not your claim' };
      }

      const character = await Character.findById(characterId);
      if (!character || !character.gangId) {
        return { success: false, error: 'You must be in a gang to request protection' };
      }

      const gang = await Gang.findById(character.gangId);
      if (!gang) {
        return { success: false, error: 'Gang not found' };
      }

      // Check if gang offers protection in this zone
      // Gang must control at least one territory to offer protection,
      // or the claim must be in a zone aligned with the gang's controlled territories
      const gangTerritories = await Territory.find({
        controllingGangId: gang._id,
      }).lean();

      if (gangTerritories.length === 0) {
        return { success: false, error: 'Your gang must control at least one territory to offer protection' };
      }

      // Get the claim's location and zone to check regional influence
      const claimLocation = await Location.findOne({ slug: claim.locationId }).lean();
      if (claimLocation?.zoneId) {
        const zone = await WorldZone.findById(claimLocation.zoneId).lean();
        if (zone) {
          // Map zone primaryFaction to territory faction
          const zoneFactionMap: Record<string, string> = {
            'settler': 'SETTLER',
            'nahi': 'NAHI',
            'frontera': 'FRONTERA',
          };
          const zoneTerritoryFaction = zoneFactionMap[zone.primaryFaction] || 'NEUTRAL';

          // Check if gang controls territory in this zone's faction area
          const hasInfluenceInZone = gangTerritories.some(
            t => t.faction === zoneTerritoryFaction
          );

          if (!hasInfluenceInZone) {
            // Gang has territories but not in this zone - apply a fee multiplier
            // (Optionally could block entirely, but allowing with higher fee is more gameplay-friendly)
          }
        }
      }

      // Calculate weekly fee
      const weeklyFee = GANG_PROTECTION.WEEKLY_FEE_BASE +
        (claim.suspicionLevel * GANG_PROTECTION.WEEKLY_FEE_PER_SUSPICION);

      // Update claim with gang protection
      claim.gangId = gang._id as mongoose.Types.ObjectId;
      claim.legalStatus = ClaimLegalStatus.GANG_PROTECTED;
      claim.protectionStartedAt = new Date();

      // Apply immediate suspicion reduction
      claim.reduceSuspicion(
        SuspicionEventType.GANG_PROTECTION,
        GANG_PROTECTION.DAILY_SUSPICION_REDUCTION,
        { gangId: gang._id.toString() }
      );

      await claim.save();

      return { success: true, weeklyFee };
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'requestGangProtection', claimId, characterId });
      return { success: false, error: 'Failed to request gang protection' };
    }
  }

  /**
   * Remove gang protection from a claim
   */
  static async removeGangProtection(claimId: string, characterId: string): Promise<boolean> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive) return false;

      if (claim.characterId.toString() !== characterId) return false;

      claim.gangId = undefined;
      claim.legalStatus = claim.suspicionLevel > 75
        ? ClaimLegalStatus.ILLEGAL
        : ClaimLegalStatus.UNREGISTERED;
      claim.protectionStartedAt = undefined;

      await claim.save();
      return true;
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'removeGangProtection', claimId, characterId });
      return false;
    }
  }

  /**
   * Process daily gang protection (suspicion reduction + fee)
   */
  static async processDailyGangProtection(claimId: string): Promise<void> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive || !claim.gangId) return;

      // PHASE 4 FIX: Calculate and deduct daily protection fee BEFORE granting benefit
      const weeklyFee = GANG_PROTECTION.WEEKLY_FEE_BASE +
        (claim.suspicionLevel * GANG_PROTECTION.WEEKLY_FEE_PER_SUSPICION);
      const dailyFee = Math.ceil(weeklyFee / 7);

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Deduct fee from claim owner
        await DollarService.deductDollars(
          claim.characterId.toString(),
          dailyFee,
          TransactionSource.GANG_PROTECTION_FEE,
          {
            claimId: claim._id.toString(),
            gangId: claim.gangId.toString(),
            weeklyFee,
            dailyFee
          },
          session
        );

        // Apply daily suspicion reduction only after successful payment
        claim.reduceSuspicion(
          SuspicionEventType.GANG_PROTECTION,
          GANG_PROTECTION.DAILY_SUSPICION_REDUCTION,
          { daily: true }
        );

        await claim.save({ session });
        await session.commitTransaction();
      } catch (feeError) {
        await session.abortTransaction();
        // If player can't afford fee, remove gang protection
        logServiceWarning(
          { service: 'IllegalMiningService', method: 'processDailyGangProtection' },
          `Character ${claim.characterId} cannot afford gang protection fee of $${dailyFee}, removing protection`,
          { characterId: claim.characterId.toString(), dailyFee, claimId: claim._id.toString() }
        );
        claim.gangId = undefined;
        claim.legalStatus = claim.suspicionLevel > 75
          ? ClaimLegalStatus.ILLEGAL
          : ClaimLegalStatus.UNREGISTERED;
        claim.protectionStartedAt = undefined;
        await claim.save();
      } finally {
        session.endSession();
      }
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'processDailyGangProtection', claimId });
    }
  }

  /**
   * Process bribe attempt
   */
  static async processBribeAttempt(
    claimId: string,
    characterId: string,
    bribeAmount: number,
    inspectorType: 'inspector' | 'marshal'
  ): Promise<{ success: boolean; suspicionChange: number }> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive) {
        return { success: false, suspicionChange: 0 };
      }

      const { INSPECTOR_BRIBERY } = require('@desperados/shared');
      const bribeConfig = INSPECTOR_BRIBERY[inspectorType.toUpperCase()];

      // Check if bribe amount meets minimum
      if (bribeAmount < bribeConfig.minBribe) {
        // Bribe too low - automatic failure
        const bribeFailedAmount = SUSPICION_CHANGES[SuspicionEventType.BRIBE_FAILED];
        claim.addSuspicion(SuspicionEventType.BRIBE_FAILED, bribeFailedAmount, {
          bribeAmount,
          inspectorType,
          reason: 'insufficient_amount',
        });

        claim.inspectionHistory.push({
          inspectorType,
          result: 'caught',
          timestamp: new Date(),
          bribeAmount,
        });

        await claim.save();
        return { success: false, suspicionChange: bribeFailedAmount };
      }

      // Calculate success chance based on bribe amount
      const amountFactor = Math.min(1, bribeAmount / bribeConfig.maxBribe);
      const successChance = bribeConfig.baseSuccessRate + (amountFactor * bribeConfig.amountBonus);

      const roll = SecureRNG.float(0, 100, 2);
      const success = roll < successChance;

      if (success) {
        // Bribe succeeded
        const bribeSuccessAmount = SUSPICION_CHANGES[SuspicionEventType.BRIBE_SUCCESS];
        claim.reduceSuspicion(SuspicionEventType.BRIBE_SUCCESS, bribeSuccessAmount, {
          bribeAmount,
          inspectorType,
        });

        claim.inspectionHistory.push({
          inspectorType,
          result: 'bribed',
          timestamp: new Date(),
          bribeAmount,
        });

        await claim.save();
        return { success: true, suspicionChange: -bribeSuccessAmount };
      } else {
        // Bribe failed
        const bribeFailedAmount = SUSPICION_CHANGES[SuspicionEventType.BRIBE_FAILED];
        claim.addSuspicion(SuspicionEventType.BRIBE_FAILED, bribeFailedAmount, {
          bribeAmount,
          inspectorType,
        });

        claim.inspectionHistory.push({
          inspectorType,
          result: 'caught',
          timestamp: new Date(),
          bribeAmount,
        });

        await claim.save();
        return { success: false, suspicionChange: bribeFailedAmount };
      }
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'processBribeAttempt', claimId, characterId, bribeAmount, inspectorType });
      return { success: false, suspicionChange: 0 };
    }
  }

  /**
   * Condemn a claim (seize by authorities)
   */
  static async condemnClaim(
    claimId: string,
    reason: string
  ): Promise<{ condemned: boolean; seizuredValue: number }> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive) {
        return { condemned: false, seizuredValue: 0 };
      }

      const seizuredValue = claim.totalValueCollected * 0.5; // Seize 50% of collected value

      claim.condemn(reason);
      await claim.save();

      return { condemned: true, seizuredValue };
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'condemnClaim', claimId, reason });
      return { condemned: false, seizuredValue: 0 };
    }
  }

  /**
   * Get all active illegal claims for a character
   */
  static async getActiveClaimsForCharacter(characterId: string): Promise<IIllegalClaimDoc[]> {
    return IllegalClaim.getActiveClaimsForCharacter(characterId);
  }

  /**
   * Get claims with high suspicion (for inspector patrol targeting)
   */
  static async getHighSuspicionClaims(minSuspicion: number = 26): Promise<IIllegalClaimDoc[]> {
    return IllegalClaim.getHighSuspicionClaims(minSuspicion);
  }

  /**
   * Process daily suspicion decay for all claims
   */
  static async processDailySuspicionDecay(): Promise<number> {
    return IllegalClaim.decayAllSuspicion(SUSPICION_CHANGES[SuspicionEventType.TIME_DECAY]);
  }

  /**
   * Record NPC patrol spotting
   */
  static async recordPatrolSpotted(claimId: string): Promise<void> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || !claim.isActive) return;

      claim.addSuspicion(
        SuspicionEventType.NPC_PATROL_SPOTTED,
        SUSPICION_CHANGES[SuspicionEventType.NPC_PATROL_SPOTTED],
        { patrol: true }
      );

      await claim.save();
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'recordPatrolSpotted', claimId });
    }
  }

  /**
   * Record inspection result
   */
  static async recordInspectionResult(
    claimId: string,
    inspectorType: 'inspector' | 'marshal',
    result: 'passed' | 'bribed' | 'caught',
    fineAmount?: number
  ): Promise<void> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim) return;

      claim.inspectionHistory.push({
        inspectorType,
        result,
        timestamp: new Date(),
        fineAmount,
      });

      // Keep only last 20 inspections
      if (claim.inspectionHistory.length > 20) {
        claim.inspectionHistory = claim.inspectionHistory.slice(-20);
      }

      // Update suspicion based on result
      if (result === 'passed') {
        claim.reduceSuspicion(SuspicionEventType.INSPECTION_PASSED, 10, { inspectorType });
      } else if (result === 'caught') {
        claim.addSuspicion(SuspicionEventType.INSPECTION_FAILED, 25, { inspectorType, fineAmount });
      }

      await claim.save();
    } catch (error) {
      handleServiceError(error, { service: 'IllegalMiningService', method: 'recordInspectionResult', claimId, inspectorType, result });
    }
  }
}
