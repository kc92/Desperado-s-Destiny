/**
 * Decay Service
 *
 * Phase 14: Risk Simulation - Decay System
 *
 * Centralized service for managing asset decay and maintenance:
 * - Property condition decay and repair
 * - Mining claim condition and rehabilitation
 * - Equipment deterioration
 * - Maintenance operations
 */

import mongoose from 'mongoose';
import { Property, IProperty } from '../models/Property.model';
import { MiningClaim, IMiningClaim } from '../models/MiningClaim.model';
import { DollarService } from './dollar.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  ConditionTier,
  CONDITION_TIERS,
  PROPERTY_DECAY,
  MINING_CLAIM_DECAY,
  getConditionTier,
  calculatePropertyRepairCost,
  calculateClaimRehabilitationCost,
  MaintenanceActionType,
  MAINTENANCE_ACTIONS,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Property condition report for UI display
 */
export interface PropertyConditionReport {
  propertyId: string;
  propertyName: string;
  condition: number;
  tier: ConditionTier;
  tierInfo: typeof CONDITION_TIERS[ConditionTier];
  daysSinceLastMaintenance: number;
  isNeglected: boolean;
  incomeMultiplier: number;
  upkeepMultiplier: number;
  repairCostToFull: number;
  repairCostToGood: number;
  needsWarning: boolean;
  isCritical: boolean;
  nextDecayRate: number;
}

/**
 * Mining claim condition report for UI display
 */
export interface ClaimConditionReport {
  claimId: string;
  locationId: string;
  condition: number;
  tier: ConditionTier;
  yieldMultiplier: number;
  collectionsToday: number;
  isOverworked: boolean;
  rehabilitationCostToFull: number;
  rehabilitationCostToGood: number;
  isExhausted: boolean;
}

/**
 * Decay processing result
 */
export interface DecayProcessingResult {
  processed: number;
  decayed: number;
  statusChanges: number;
  errors: number;
}

/**
 * Decay Service
 */
export class DecayService {
  // ============================================================================
  // PROPERTY DECAY OPERATIONS
  // ============================================================================

  /**
   * Process daily decay for a single property
   */
  static async processPropertyDecay(propertyId: string): Promise<{
    previousCondition: number;
    newCondition: number;
    statusChanged: boolean;
  }> {
    const property = await Property.findById(propertyId);
    if (!property || property.status === 'foreclosed') {
      throw new Error('Property not found or already foreclosed');
    }

    const previousCondition = property.condition;
    const previousStatus = property.status;

    // Apply decay using the enhanced model method
    property.applyConditionDecay();

    await property.save();

    return {
      previousCondition,
      newCondition: property.condition,
      statusChanged: property.status !== previousStatus,
    };
  }

  /**
   * Process daily decay for all active properties
   * Called by the daily decay processor job
   */
  static async processAllPropertyDecay(): Promise<DecayProcessingResult> {
    const result: DecayProcessingResult = {
      processed: 0,
      decayed: 0,
      statusChanges: 0,
      errors: 0,
    };

    try {
      // Find all active properties with owners
      const properties = await Property.find({
        status: { $in: ['active', 'under_construction'] },
        ownerId: { $exists: true },
      }).select('_id condition status');

      for (const property of properties) {
        try {
          const previousCondition = property.condition;
          const previousStatus = property.status;

          property.applyConditionDecay();
          await property.save();

          result.processed++;

          if (property.condition < previousCondition) {
            result.decayed++;
          }

          if (property.status !== previousStatus) {
            result.statusChanges++;
            logger.info(`[DecayService] Property ${property._id} status changed: ${previousStatus} -> ${property.status}`);
          }
        } catch (error) {
          result.errors++;
          logger.error(`[DecayService] Error processing property ${property._id}:`, error);
        }
      }

      logger.info(`[DecayService] Property decay processed: ${result.processed} properties, ${result.decayed} decayed, ${result.statusChanges} status changes`);
    } catch (error) {
      logger.error('[DecayService] Error in processAllPropertyDecay:', error);
      throw error;
    }

    return result;
  }

  /**
   * Perform property repair
   */
  static async repairProperty(
    characterId: string,
    propertyId: string,
    targetCondition: number = 100
  ): Promise<{
    success: boolean;
    previousCondition: number;
    newCondition: number;
    cost: number;
    error?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const property = await Property.findById(propertyId).session(session);
      if (!property) {
        await session.abortTransaction();
        return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Property not found' };
      }

      if (property.ownerId?.toString() !== characterId) {
        await session.abortTransaction();
        return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Not property owner' };
      }

      const previousCondition = property.condition;
      const cost = property.calculateRepairCost(targetCondition);

      if (cost <= 0) {
        await session.abortTransaction();
        return { success: false, previousCondition, newCondition: previousCondition, cost: 0, error: 'No repair needed' };
      }

      // Check if character can afford
      const canAfford = await DollarService.canAfford(characterId, cost);
      if (!canAfford) {
        await session.abortTransaction();
        return { success: false, previousCondition, newCondition: previousCondition, cost, error: 'Insufficient funds' };
      }

      // Deduct cost
      await DollarService.deductDollars(characterId, cost, TransactionSource.PROPERTY_INCOME, { reason: `Property repair: ${property.name}` }, session);

      // Apply repair
      property.repair(targetCondition);
      await property.save({ session });

      await session.commitTransaction();

      logger.info(`[DecayService] Property ${propertyId} repaired: ${previousCondition} -> ${property.condition}, cost: $${cost}`);

      return {
        success: true,
        previousCondition,
        newCondition: property.condition,
        cost,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('[DecayService] repairProperty error:', error);
      return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Repair failed' };
    } finally {
      session.endSession();
    }
  }

  /**
   * Perform property maintenance (low cost, resets neglect timer)
   */
  static async performPropertyMaintenance(
    characterId: string,
    propertyId: string,
    actionType: MaintenanceActionType = MaintenanceActionType.BASIC_MAINTENANCE
  ): Promise<{
    success: boolean;
    previousCondition: number;
    newCondition: number;
    cost: number;
    error?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const property = await Property.findById(propertyId).session(session);
      if (!property) {
        await session.abortTransaction();
        return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Property not found' };
      }

      if (property.ownerId?.toString() !== characterId) {
        await session.abortTransaction();
        return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Not property owner' };
      }

      const action = MAINTENANCE_ACTIONS[actionType];
      if (!action) {
        await session.abortTransaction();
        return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Invalid maintenance action' };
      }

      // Check minimum condition requirement
      if (property.condition < action.minCondition) {
        await session.abortTransaction();
        return {
          success: false,
          previousCondition: property.condition,
          newCondition: property.condition,
          cost: 0,
          error: `Property condition too low. Minimum required: ${action.minCondition}%`,
        };
      }

      // Calculate maintenance cost
      const cost = action.baseCost + (action.costPerTier * property.tier);

      // Check if character can afford
      const canAfford = await DollarService.canAfford(characterId, cost);
      if (!canAfford) {
        await session.abortTransaction();
        return {
          success: false,
          previousCondition: property.condition,
          newCondition: property.condition,
          cost,
          error: 'Insufficient funds',
        };
      }

      const previousCondition = property.condition;

      // Deduct cost
      await DollarService.deductDollars(characterId, cost, TransactionSource.PROPERTY_INCOME, { reason: `Property maintenance: ${property.name}` }, session);

      // Apply maintenance
      property.performMaintenance();

      // Apply additional condition gain for non-basic actions
      if (action.conditionGain > PROPERTY_DECAY.MAINTENANCE_CONDITION_GAIN) {
        const additionalGain = action.conditionGain - PROPERTY_DECAY.MAINTENANCE_CONDITION_GAIN;
        const maxResult = action.maxConditionResult;
        property.condition = Math.min(maxResult, property.condition + additionalGain);
      }

      await property.save({ session });

      await session.commitTransaction();

      logger.info(`[DecayService] Property ${propertyId} maintained (${actionType}): ${previousCondition} -> ${property.condition}, cost: $${cost}`);

      return {
        success: true,
        previousCondition,
        newCondition: property.condition,
        cost,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('[DecayService] performPropertyMaintenance error:', error);
      return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Maintenance failed' };
    } finally {
      session.endSession();
    }
  }

  /**
   * Get property condition report
   */
  static async getPropertyConditionReport(propertyId: string): Promise<PropertyConditionReport | null> {
    const property = await Property.findById(propertyId);
    if (!property) return null;

    const tier = property.getConditionTier();
    const daysSinceLastMaintenance = property.getDaysSinceLastMaintenance();

    // Calculate next decay rate
    let nextDecayRate = PROPERTY_DECAY.BASE_DAILY_DECAY_RATE;
    if (daysSinceLastMaintenance > PROPERTY_DECAY.NEGLECT_THRESHOLD_DAYS) {
      const neglectDays = daysSinceLastMaintenance - PROPERTY_DECAY.NEGLECT_THRESHOLD_DAYS;
      nextDecayRate *= Math.pow(PROPERTY_DECAY.NEGLECT_DECAY_MULTIPLIER, neglectDays);
    }
    const reductions = property.getDecayReductions();
    const totalReduction = reductions.reduce((sum, r) => sum + r, 0);
    nextDecayRate *= Math.max(0.1, 1 - totalReduction);

    return {
      propertyId: property._id.toString(),
      propertyName: property.name,
      condition: property.condition,
      tier,
      tierInfo: CONDITION_TIERS[tier],
      daysSinceLastMaintenance,
      isNeglected: daysSinceLastMaintenance > PROPERTY_DECAY.NEGLECT_THRESHOLD_DAYS,
      incomeMultiplier: property.getIncomeMultiplier(),
      upkeepMultiplier: property.getUpkeepMultiplier(),
      repairCostToFull: property.calculateRepairCost(100),
      repairCostToGood: property.calculateRepairCost(70),
      needsWarning: property.shouldWarnAboutCondition(),
      isCritical: property.isConditionCritical(),
      nextDecayRate,
    };
  }

  // ============================================================================
  // MINING CLAIM DECAY OPERATIONS
  // ============================================================================

  /**
   * Process daily decay for a single mining claim
   */
  static async processMiningClaimDecay(claimId: string): Promise<{
    previousCondition: number;
    newCondition: number;
    statusChanged: boolean;
  }> {
    const claim = await MiningClaim.findById(claimId);
    if (!claim || claim.status === 'exhausted' || claim.status === 'abandoned') {
      throw new Error('Claim not found or already inactive');
    }

    const previousCondition = claim.condition;
    const previousStatus = claim.status;

    // Apply passive decay
    claim.applyDecay(MINING_CLAIM_DECAY.BASE_DAILY_DECAY_RATE);

    await claim.save();

    return {
      previousCondition,
      newCondition: claim.condition,
      statusChanged: claim.status !== previousStatus,
    };
  }

  /**
   * Process daily decay for all active mining claims
   */
  static async processAllMiningClaimDecay(): Promise<DecayProcessingResult> {
    const result: DecayProcessingResult = {
      processed: 0,
      decayed: 0,
      statusChanges: 0,
      errors: 0,
    };

    try {
      const claims = await MiningClaim.find({
        status: { $in: ['active', 'contested'] },
      }).select('_id condition status');

      for (const claim of claims) {
        try {
          const previousCondition = claim.condition;
          const previousStatus = claim.status;

          claim.applyDecay(MINING_CLAIM_DECAY.BASE_DAILY_DECAY_RATE);
          await claim.save();

          result.processed++;

          if (claim.condition < previousCondition) {
            result.decayed++;
          }

          if (claim.status !== previousStatus) {
            result.statusChanges++;
            logger.info(`[DecayService] Claim ${claim._id} status changed: ${previousStatus} -> ${claim.status}`);
          }
        } catch (error) {
          result.errors++;
          logger.error(`[DecayService] Error processing claim ${claim._id}:`, error);
        }
      }

      logger.info(`[DecayService] Claim decay processed: ${result.processed} claims, ${result.decayed} decayed, ${result.statusChanges} status changes`);
    } catch (error) {
      logger.error('[DecayService] Error in processAllMiningClaimDecay:', error);
      throw error;
    }

    return result;
  }

  /**
   * Rehabilitate a mining claim (restore condition)
   */
  static async rehabilitateClaim(
    characterId: string,
    claimId: string,
    targetCondition: number = 100
  ): Promise<{
    success: boolean;
    previousCondition: number;
    newCondition: number;
    cost: number;
    error?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const claim = await MiningClaim.findById(claimId).session(session);
      if (!claim) {
        await session.abortTransaction();
        return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Claim not found' };
      }

      if (claim.characterId.toString() !== characterId) {
        await session.abortTransaction();
        return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Not claim owner' };
      }

      const previousCondition = claim.condition;
      const cost = calculateClaimRehabilitationCost(claim.condition, targetCondition, claim.tier);

      if (cost <= 0) {
        await session.abortTransaction();
        return { success: false, previousCondition, newCondition: previousCondition, cost: 0, error: 'No rehabilitation needed' };
      }

      // Check if character can afford
      const canAfford = await DollarService.canAfford(characterId, cost);
      if (!canAfford) {
        await session.abortTransaction();
        return { success: false, previousCondition, newCondition: previousCondition, cost, error: 'Insufficient funds' };
      }

      // Deduct cost
      await DollarService.deductDollars(characterId, cost, TransactionSource.PROPERTY_INCOME, { reason: 'Mining claim rehabilitation' }, session);

      // Apply rehabilitation
      const amountToRestore = targetCondition - claim.condition;
      claim.rehabilitate(amountToRestore);
      await claim.save({ session });

      await session.commitTransaction();

      logger.info(`[DecayService] Claim ${claimId} rehabilitated: ${previousCondition} -> ${claim.condition}, cost: $${cost}`);

      return {
        success: true,
        previousCondition,
        newCondition: claim.condition,
        cost,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('[DecayService] rehabilitateClaim error:', error);
      return { success: false, previousCondition: 0, newCondition: 0, cost: 0, error: 'Rehabilitation failed' };
    } finally {
      session.endSession();
    }
  }

  /**
   * Get mining claim condition report
   */
  static async getClaimConditionReport(claimId: string): Promise<ClaimConditionReport | null> {
    const claim = await MiningClaim.findById(claimId);
    if (!claim) return null;

    return {
      claimId: claim._id.toString(),
      locationId: claim.locationId,
      condition: claim.condition,
      tier: getConditionTier(claim.condition),
      yieldMultiplier: claim.getYieldMultiplier(),
      collectionsToday: claim.collectionsToday,
      isOverworked: claim.isOverworked(),
      rehabilitationCostToFull: calculateClaimRehabilitationCost(claim.condition, 100, claim.tier),
      rehabilitationCostToGood: calculateClaimRehabilitationCost(claim.condition, 70, claim.tier),
      isExhausted: claim.status === 'exhausted',
    };
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  /**
   * Find properties that need maintenance attention
   */
  static async findPropertiesNeedingMaintenance(
    ownerId?: string,
    maxCondition: number = PROPERTY_DECAY.CONDITION_STATUS_THRESHOLDS.WARNING
  ): Promise<IProperty[]> {
    const query: Record<string, unknown> = {
      status: 'active',
      condition: { $lte: maxCondition },
    };

    if (ownerId) {
      query.ownerId = new mongoose.Types.ObjectId(ownerId);
    }

    return Property.find(query).sort({ condition: 1 });
  }

  /**
   * Find mining claims that need rehabilitation
   */
  static async findClaimsNeedingRehabilitation(
    characterId?: string,
    maxCondition: number = MINING_CLAIM_DECAY.CONDITION_STATUS_THRESHOLDS.WARNING
  ): Promise<IMiningClaim[]> {
    const query: Record<string, unknown> = {
      status: { $in: ['active', 'contested'] },
      condition: { $lte: maxCondition },
    };

    if (characterId) {
      query.characterId = new mongoose.Types.ObjectId(characterId);
    }

    return MiningClaim.find(query).sort({ condition: 1 });
  }

  /**
   * Get summary of assets needing attention for a character
   */
  static async getAssetHealthSummary(characterId: string): Promise<{
    propertiesNeedingAttention: number;
    claimsNeedingAttention: number;
    totalRepairCost: number;
    criticalAssets: number;
  }> {
    const propertiesWarning = await Property.countDocuments({
      ownerId: new mongoose.Types.ObjectId(characterId),
      status: 'active',
      condition: { $lte: PROPERTY_DECAY.CONDITION_STATUS_THRESHOLDS.WARNING },
    });

    const propertiesCritical = await Property.countDocuments({
      ownerId: new mongoose.Types.ObjectId(characterId),
      status: 'active',
      condition: { $lte: PROPERTY_DECAY.CONDITION_STATUS_THRESHOLDS.CRITICAL },
    });

    const claimsWarning = await MiningClaim.countDocuments({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $in: ['active', 'contested'] },
      condition: { $lte: MINING_CLAIM_DECAY.CONDITION_STATUS_THRESHOLDS.WARNING },
    });

    const claimsCritical = await MiningClaim.countDocuments({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $in: ['active', 'contested'] },
      condition: { $lte: MINING_CLAIM_DECAY.CONDITION_STATUS_THRESHOLDS.CRITICAL },
    });

    // Calculate total repair cost
    const properties = await this.findPropertiesNeedingMaintenance(characterId);
    const claims = await this.findClaimsNeedingRehabilitation(characterId);

    let totalRepairCost = 0;
    for (const property of properties) {
      totalRepairCost += property.calculateRepairCost(70); // Cost to get to GOOD condition
    }
    for (const claim of claims) {
      totalRepairCost += calculateClaimRehabilitationCost(claim.condition, 70, claim.tier);
    }

    return {
      propertiesNeedingAttention: propertiesWarning,
      claimsNeedingAttention: claimsWarning,
      totalRepairCost,
      criticalAssets: propertiesCritical + claimsCritical,
    };
  }
}
