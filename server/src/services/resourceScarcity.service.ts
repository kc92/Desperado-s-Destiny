/**
 * Resource Scarcity Service
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Handles resource vein depletion, competition between claims,
 * and yield calculations based on scarcity.
 */

import mongoose from 'mongoose';
import { ResourceVein, IResourceVeinDocument } from '../models/ResourceVein.model';
import { MiningClaim } from '../models/MiningClaim.model';
import logger from '../utils/logger';
import {
  ResourceVeinStatus,
  ScarcityResourceType,
  IResourceScarcityResult,
  ICreateResourceVeinDTO,
} from '@desperados/shared';
import {
  getVeinStatus,
  getCompetitionYieldPenalty,
  VEIN_STATUS_MULTIPLIERS,
  REGENERATION_RATES,
  COMPETITION_YIELD_PENALTY,
} from '@desperados/shared';

/**
 * Resource Scarcity Service
 */
export class ResourceScarcityService {
  /**
   * Calculate yield modifier for a mining claim based on vein status and competition
   */
  static async calculateYieldModifier(
    veinId: string,
    claimId: string
  ): Promise<IResourceScarcityResult> {
    const vein = await ResourceVein.findById(veinId);

    if (!vein) {
      // No vein tracking - return default (full yield)
      return {
        veinId,
        resourceType: ScarcityResourceType.IRON_ORE, // Default
        status: ResourceVeinStatus.ABUNDANT,
        statusModifier: 1.0,
        competitionModifier: 1.0,
        finalYieldMultiplier: 1.0,
        remainingPercent: 100,
        claimCount: 1,
        isOvercrowded: false,
      };
    }

    // Calculate status modifier
    const statusModifier = VEIN_STATUS_MULTIPLIERS[vein.status] ?? 1.0;

    // Calculate competition modifier
    const competitionModifier = getCompetitionYieldPenalty(vein.claimCount);

    // Combined yield multiplier
    const finalYieldMultiplier = statusModifier * competitionModifier;

    // Estimate exhaustion date
    let estimatedExhaustionDate: Date | undefined;
    if (vein.claimCount > 0 && vein.remainingPercent > 0) {
      // Rough estimate based on current extraction rate
      const averageExtractionPerDay = (vein.extractedAmount / 7) || vein.baseYield;
      const remaining = (vein.totalCapacity * vein.remainingPercent) / 100;
      const daysRemaining = remaining / (averageExtractionPerDay * vein.claimCount);

      if (daysRemaining > 0 && daysRemaining < 365) {
        estimatedExhaustionDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
      }
    }

    return {
      veinId,
      resourceType: vein.resourceType,
      status: vein.status,
      statusModifier,
      competitionModifier,
      finalYieldMultiplier,
      remainingPercent: vein.remainingPercent,
      estimatedExhaustionDate,
      claimCount: vein.claimCount,
      isOvercrowded: vein.claimCount >= 5,
    };
  }

  /**
   * Record an extraction from a vein
   */
  static async recordExtraction(
    claimId: string,
    resourceType: ScarcityResourceType,
    amount: number
  ): Promise<void> {
    // Find the vein this claim is on
    const vein = await ResourceVein.findForClaim(claimId);

    if (!vein) {
      // No vein tracking for this claim - that's okay
      logger.debug(`[ResourceScarcity] No vein tracking for claim ${claimId}`);
      return;
    }

    // Record the extraction
    vein.recordExtraction(amount);
    await vein.save();

    logger.debug(`[ResourceScarcity] Recorded extraction of ${amount} from vein ${vein._id}`, {
      veinId: vein._id.toString(),
      claimId,
      newRemainingPercent: vein.remainingPercent,
      status: vein.status,
    });
  }

  /**
   * Associate a claim with a vein
   */
  static async associateClaimWithVein(
    claimId: string,
    veinId: string
  ): Promise<void> {
    const vein = await ResourceVein.findById(veinId);

    if (!vein) {
      logger.warn(`[ResourceScarcity] Vein ${veinId} not found for claim association`);
      return;
    }

    vein.addClaim(claimId);
    await vein.save();

    logger.info(`[ResourceScarcity] Associated claim ${claimId} with vein ${veinId}`, {
      newClaimCount: vein.claimCount,
    });
  }

  /**
   * Remove a claim from a vein
   */
  static async removeClaimFromVein(claimId: string): Promise<void> {
    const vein = await ResourceVein.findForClaim(claimId);

    if (!vein) {
      return;
    }

    vein.removeClaim(claimId);
    await vein.save();

    logger.info(`[ResourceScarcity] Removed claim ${claimId} from vein ${vein._id}`, {
      newClaimCount: vein.claimCount,
    });
  }

  /**
   * Create a new resource vein
   */
  static async createVein(dto: ICreateResourceVeinDTO): Promise<IResourceVeinDocument> {
    const vein = new ResourceVein({
      ...dto,
      status: ResourceVeinStatus.ABUNDANT,
      currentYieldMultiplier: 1.0,
      extractedAmount: 0,
      remainingPercent: 100,
      claimCount: 0,
      claimIds: [],
      competitionPenalty: 0,
      isRenewable: dto.isRenewable ?? REGENERATION_RATES[dto.resourceType] !== undefined,
      regenerationRate: dto.regenerationRate ?? REGENERATION_RATES[dto.resourceType] ?? 0,
      discoveredAt: new Date(),
    });

    await vein.save();

    logger.info(`[ResourceScarcity] Created new resource vein`, {
      veinId: vein._id.toString(),
      name: vein.name,
      resourceType: vein.resourceType,
      zoneId: vein.zoneId,
      totalCapacity: vein.totalCapacity,
    });

    return vein;
  }

  /**
   * Find or create a vein for a zone and resource type
   */
  static async findOrCreateVein(
    zoneId: string,
    resourceType: ScarcityResourceType,
    name?: string
  ): Promise<IResourceVeinDocument> {
    // Check for existing vein
    const existing = await ResourceVein.findOne({ zoneId, resourceType });

    if (existing) {
      return existing;
    }

    // Create default vein
    const defaultCapacity = this.getDefaultCapacity(resourceType);
    const defaultYield = this.getDefaultYield(resourceType);

    return this.createVein({
      name: name || `${resourceType} Deposit - ${zoneId}`,
      resourceType,
      zoneId,
      totalCapacity: defaultCapacity,
      baseYield: defaultYield,
    });
  }

  /**
   * Process regeneration for all renewable veins
   */
  static async processRegeneration(): Promise<{
    veinsProcessed: number;
    totalRegenerated: number;
  }> {
    const renewableVeins = await ResourceVein.findRenewable();

    let veinsProcessed = 0;
    let totalRegenerated = 0;

    for (const vein of renewableVeins) {
      try {
        const regenerated = vein.regenerate();
        if (regenerated > 0) {
          await vein.save();
          totalRegenerated += regenerated;
        }
        veinsProcessed++;
      } catch (error) {
        logger.error(`[ResourceScarcity] Error regenerating vein ${vein._id}:`, error);
      }
    }

    if (totalRegenerated > 0) {
      logger.info(`[ResourceScarcity] Regeneration complete`, {
        veinsProcessed,
        totalRegenerated,
      });
    }

    return { veinsProcessed, totalRegenerated };
  }

  /**
   * Get all veins in a zone
   */
  static async getVeinsInZone(zoneId: string): Promise<IResourceScarcityResult[]> {
    const veins = await ResourceVein.findByZone(zoneId);

    return veins.map((vein) => ({
      veinId: vein._id.toString(),
      resourceType: vein.resourceType,
      status: vein.status,
      statusModifier: VEIN_STATUS_MULTIPLIERS[vein.status] ?? 1.0,
      competitionModifier: getCompetitionYieldPenalty(vein.claimCount),
      finalYieldMultiplier: vein.currentYieldMultiplier,
      remainingPercent: vein.remainingPercent,
      claimCount: vein.claimCount,
      isOvercrowded: vein.claimCount >= 5,
    }));
  }

  /**
   * Check if a zone has depleted resources
   */
  static async isZoneDepleted(zoneId: string): Promise<boolean> {
    const veins = await ResourceVein.findByZone(zoneId);

    if (veins.length === 0) {
      return false;
    }

    const exhaustedCount = veins.filter(v => v.status === ResourceVeinStatus.EXHAUSTED).length;
    return exhaustedCount === veins.length;
  }

  /**
   * Get competition info for a claim
   */
  static async getClaimCompetitionInfo(
    claimId: string
  ): Promise<{
    veinId?: string;
    competitors: number;
    yieldPenalty: number;
    isOvercrowded: boolean;
  }> {
    const vein = await ResourceVein.findForClaim(claimId);

    if (!vein) {
      return {
        competitors: 0,
        yieldPenalty: 0,
        isOvercrowded: false,
      };
    }

    const competitors = Math.max(0, vein.claimCount - 1);
    const yieldPenalty = 1 - getCompetitionYieldPenalty(vein.claimCount);

    return {
      veinId: vein._id.toString(),
      competitors,
      yieldPenalty,
      isOvercrowded: vein.claimCount >= 5,
    };
  }

  /**
   * Get default capacity for a resource type
   */
  private static getDefaultCapacity(resourceType: ScarcityResourceType): number {
    const capacities: Partial<Record<ScarcityResourceType, number>> = {
      [ScarcityResourceType.GOLD_ORE]: 5000,
      [ScarcityResourceType.SILVER_ORE]: 8000,
      [ScarcityResourceType.COPPER_ORE]: 15000,
      [ScarcityResourceType.IRON_ORE]: 20000,
      [ScarcityResourceType.COAL]: 25000,
      [ScarcityResourceType.QUICKSILVER]: 3000,
      [ScarcityResourceType.DEEP_IRON]: 2000,
      [ScarcityResourceType.MITHRIL]: 1000,
      [ScarcityResourceType.STAR_METAL]: 500,
      [ScarcityResourceType.VOID_CRYSTAL]: 250,
      [ScarcityResourceType.ELDRITCH_ORE]: 100,
      [ScarcityResourceType.TIMBER]: 50000,
      [ScarcityResourceType.WATER]: 100000,
      [ScarcityResourceType.CATTLE]: 1000,
      [ScarcityResourceType.GRAIN]: 10000,
    };

    return capacities[resourceType] ?? 10000;
  }

  /**
   * Get default yield for a resource type
   */
  private static getDefaultYield(resourceType: ScarcityResourceType): number {
    const yields: Partial<Record<ScarcityResourceType, number>> = {
      [ScarcityResourceType.GOLD_ORE]: 5,
      [ScarcityResourceType.SILVER_ORE]: 10,
      [ScarcityResourceType.COPPER_ORE]: 20,
      [ScarcityResourceType.IRON_ORE]: 25,
      [ScarcityResourceType.COAL]: 30,
      [ScarcityResourceType.QUICKSILVER]: 3,
      [ScarcityResourceType.DEEP_IRON]: 2,
      [ScarcityResourceType.MITHRIL]: 1,
      [ScarcityResourceType.STAR_METAL]: 1,
      [ScarcityResourceType.VOID_CRYSTAL]: 1,
      [ScarcityResourceType.ELDRITCH_ORE]: 1,
      [ScarcityResourceType.TIMBER]: 50,
      [ScarcityResourceType.WATER]: 100,
      [ScarcityResourceType.CATTLE]: 2,
      [ScarcityResourceType.GRAIN]: 20,
    };

    return yields[resourceType] ?? 10;
  }
}
