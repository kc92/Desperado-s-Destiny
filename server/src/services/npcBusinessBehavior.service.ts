/**
 * NPC Business Behavior Service
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Handles NPC business AI decisions including price changes,
 * quality adjustments, expansion, contraction, and closure.
 */

import { NPCBusiness, INPCBusinessDocument } from '../models/NPCBusiness.model';
import { CompetitionService } from './competition.service';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import {
  NPCBusinessPersonality,
  NPCBusinessStatus,
  BusinessTypeCategory,
  INPCBehaviorDecision,
} from '@desperados/shared';
import {
  NPC_BEHAVIOR,
  COMPETITION_TIMING,
} from '@desperados/shared';

/**
 * Personality config type
 */
interface IPersonalityConfig {
  aggressiveness: number;
  resilience: number;
  expansionTendency: number;
  priceChangeThreshold: number;
  qualityFocus: number;
}

/**
 * Get personality defaults
 */
function getPersonalityDefaults(personality: NPCBusinessPersonality): IPersonalityConfig {
  const defaults: Record<NPCBusinessPersonality, IPersonalityConfig> = {
    [NPCBusinessPersonality.PASSIVE]: {
      aggressiveness: 15,
      resilience: 70,
      expansionTendency: 10,
      priceChangeThreshold: 0.4,
      qualityFocus: 0.8,
    },
    [NPCBusinessPersonality.BALANCED]: {
      aggressiveness: 50,
      resilience: 50,
      expansionTendency: 30,
      priceChangeThreshold: 0.25,
      qualityFocus: 0.5,
    },
    [NPCBusinessPersonality.AGGRESSIVE]: {
      aggressiveness: 85,
      resilience: 40,
      expansionTendency: 60,
      priceChangeThreshold: 0.10,
      qualityFocus: 0.3,
    },
    [NPCBusinessPersonality.QUALITY_FOCUSED]: {
      aggressiveness: 25,
      resilience: 60,
      expansionTendency: 20,
      priceChangeThreshold: 0.35,
      qualityFocus: 0.9,
    },
  };

  return defaults[personality] ?? defaults[NPCBusinessPersonality.BALANCED];
}

/**
 * NPC Business Behavior Service
 */
export class NPCBusinessBehaviorService {
  /**
   * Process all NPC businesses and make decisions
   */
  static async processAllBusinesses(): Promise<{
    processed: number;
    priceChanges: number;
    qualityChanges: number;
    closures: number;
    errors: number;
  }> {
    const results = {
      processed: 0,
      priceChanges: 0,
      qualityChanges: 0,
      closures: 0,
      errors: 0,
    };

    const npcBusinesses = await NPCBusiness.find({
      status: { $nin: [NPCBusinessStatus.CLOSED] },
    });

    for (const business of npcBusinesses) {
      try {
        const decision = await this.makeDecision(business);

        if (decision.action !== 'none') {
          await this.executeDecision(business, decision);

          switch (decision.action) {
            case 'price_change':
              results.priceChanges++;
              break;
            case 'quality_change':
              results.qualityChanges++;
              break;
            case 'close':
              results.closures++;
              break;
          }
        }

        results.processed++;
      } catch (error) {
        logger.error(`[NPCBehavior] Error processing business ${business._id}:`, error);
        results.errors++;
      }
    }

    return results;
  }

  /**
   * Make a behavior decision for an NPC business
   */
  static async makeDecision(
    business: INPCBusinessDocument
  ): Promise<INPCBehaviorDecision> {
    const personality = getPersonalityDefaults(business.personality);

    // Check if should close
    if (this.shouldClose(business)) {
      return {
        businessId: business._id.toString(),
        businessName: business.name,
        action: 'close',
        trigger: `${business.consecutiveLossWeeks} consecutive loss weeks with low revenue`,
        confidence: 90,
      };
    }

    // Check for revenue-based adjustments
    const revenueDecision = await this.checkRevenueAdjustment(business, personality);
    if (revenueDecision) {
      return revenueDecision;
    }

    // No action needed
    return {
      businessId: business._id.toString(),
      businessName: business.name,
      action: 'none',
      trigger: 'Business operating normally',
      confidence: 100,
    };
  }

  /**
   * Check if business should close
   */
  private static shouldClose(business: INPCBusinessDocument): boolean {
    if (business.consecutiveLossWeeks < NPC_BEHAVIOR.WEEKS_BEFORE_CLOSING) {
      return false;
    }

    const revenueFactor = business.averageRevenue > 0
      ? business.weeklyRevenue / business.averageRevenue
      : 1;

    if (revenueFactor >= NPC_BEHAVIOR.CLOSING_REVENUE_THRESHOLD) {
      return false;
    }

    // Check resilience
    const closeChance = (100 - business.resilience) / 100;
    return SecureRNG.chance(closeChance);
  }

  /**
   * Check for revenue-based adjustments
   */
  private static async checkRevenueAdjustment(
    business: INPCBusinessDocument,
    personality: IPersonalityConfig
  ): Promise<INPCBehaviorDecision | null> {
    const revenueFactor = business.averageRevenue > 0
      ? business.weeklyRevenue / business.averageRevenue
      : 1;

    // Struggling - consider price reduction
    if (revenueFactor < (1 - NPC_BEHAVIOR.REVENUE_DECLINE_THRESHOLD)) {
      // On cooldown?
      if (business.lastPriceChangeAt) {
        const hoursSinceChange =
          (Date.now() - business.lastPriceChangeAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceChange < COMPETITION_TIMING.NPC_PRICE_CHANGE_COOLDOWN_HOURS) {
          return null;
        }
      }

      const newPrice = Math.max(
        NPC_BEHAVIOR.MIN_PRICE_MODIFIER,
        business.priceModifier - NPC_BEHAVIOR.PRICE_CHANGE_STEP
      );

      if (newPrice < business.priceModifier) {
        return {
          businessId: business._id.toString(),
          businessName: business.name,
          action: 'price_change',
          priceChange: newPrice,
          trigger: `Revenue down ${Math.round((1 - revenueFactor) * 100)}% - reducing prices`,
          confidence: 60 + business.aggressiveness * 0.3,
        };
      }
    }

    // Thriving - consider price increase
    if (revenueFactor > NPC_BEHAVIOR.EXPANSION_REVENUE_THRESHOLD &&
        business.consecutiveGainWeeks >= 2) {
      // On cooldown?
      if (business.lastPriceChangeAt) {
        const hoursSinceChange =
          (Date.now() - business.lastPriceChangeAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceChange < COMPETITION_TIMING.NPC_PRICE_CHANGE_COOLDOWN_HOURS) {
          return null;
        }
      }

      // Quality-focused businesses prefer quality improvements
      if (personality.qualityFocus > 0.7 && business.currentQuality < NPC_BEHAVIOR.MAX_QUALITY) {
        return {
          businessId: business._id.toString(),
          businessName: business.name,
          action: 'quality_change',
          qualityChange: Math.min(NPC_BEHAVIOR.MAX_QUALITY, business.currentQuality + 1),
          trigger: `Thriving - investing in quality improvement`,
          confidence: 70 + personality.qualityFocus * 20,
        };
      }

      // Others may increase prices
      const newPrice = Math.min(
        NPC_BEHAVIOR.MAX_PRICE_MODIFIER,
        business.priceModifier + NPC_BEHAVIOR.PRICE_CHANGE_STEP
      );

      if (newPrice > business.priceModifier) {
        return {
          businessId: business._id.toString(),
          businessName: business.name,
          action: 'price_change',
          priceChange: newPrice,
          trigger: `Strong revenue for ${business.consecutiveGainWeeks} weeks - increasing prices`,
          confidence: 50 + business.aggressiveness * 0.2,
        };
      }
    }

    return null;
  }

  /**
   * Execute a behavior decision
   */
  static async executeDecision(
    business: INPCBusinessDocument,
    decision: INPCBehaviorDecision
  ): Promise<void> {
    switch (decision.action) {
      case 'price_change':
        if (decision.priceChange !== undefined) {
          business.adjustPrice(decision.priceChange);
          await business.save();
          logger.info(`[NPCBehavior] ${business.name} changed price to ${decision.priceChange}`, {
            businessId: decision.businessId,
            trigger: decision.trigger,
          });
        }
        break;

      case 'quality_change':
        if (decision.qualityChange !== undefined) {
          business.adjustQuality(decision.qualityChange);
          await business.save();
          logger.info(`[NPCBehavior] ${business.name} changed quality to ${decision.qualityChange}`, {
            businessId: decision.businessId,
            trigger: decision.trigger,
          });
        }
        break;

      case 'close':
        // Check if this is the last NPC of its type in the zone
        const npcCount = await NPCBusiness.countByZoneAndType(
          business.zoneId,
          business.businessType
        );

        if (npcCount <= NPC_BEHAVIOR.MIN_NPC_BUSINESSES_PER_ZONE) {
          logger.info(`[NPCBehavior] ${business.name} prevented from closing - last NPC of type`, {
            businessId: decision.businessId,
          });
          return;
        }

        business.close();
        await business.save();
        logger.info(`[NPCBehavior] ${business.name} closed`, {
          businessId: decision.businessId,
          trigger: decision.trigger,
        });
        break;

      default:
        // No action
        break;
    }
  }

  /**
   * Record weekly revenue for an NPC business
   */
  static async recordWeeklyRevenue(
    businessId: string,
    revenue: number
  ): Promise<void> {
    const business = await NPCBusiness.findById(businessId);

    if (!business) {
      logger.warn(`[NPCBehavior] Business ${businessId} not found for revenue recording`);
      return;
    }

    business.recordWeeklyRevenue(revenue);
    await business.save();
  }

  /**
   * Simulate weekly revenue for all NPC businesses
   * (Called by competition update job)
   */
  static async simulateWeeklyRevenue(): Promise<{
    processed: number;
    totalRevenue: number;
  }> {
    const businesses = await NPCBusiness.find({
      status: { $nin: [NPCBusinessStatus.CLOSED] },
    });

    let totalRevenue = 0;

    for (const business of businesses) {
      // Get traffic share
      const shares = await CompetitionService.calculateNPCTrafficShares(
        business.zoneId,
        business.businessType
      );

      const ourShare = shares.find(s => s.businessId === business._id.toString());

      if (!ourShare) {
        continue;
      }

      // Calculate simulated revenue
      // Base weekly revenue for business type
      const baseRevenue = this.getBaseWeeklyRevenue(business.businessType);

      // Apply modifiers
      const revenue = Math.floor(
        baseRevenue *
        ourShare.finalShare *
        ourShare.saturationModifier *
        business.currentQuality / 5 *
        (1 + ourShare.territoryBonus)
      );

      business.recordWeeklyRevenue(revenue);
      await business.save();

      totalRevenue += revenue;
    }

    return {
      processed: businesses.length,
      totalRevenue,
    };
  }

  /**
   * Get base weekly revenue for a business type
   */
  private static getBaseWeeklyRevenue(businessType: BusinessTypeCategory): number {
    const revenues: Partial<Record<BusinessTypeCategory, number>> = {
      [BusinessTypeCategory.SALOON]: 500,
      [BusinessTypeCategory.GENERAL_STORE]: 400,
      [BusinessTypeCategory.BLACKSMITH]: 350,
      [BusinessTypeCategory.STABLE]: 300,
      [BusinessTypeCategory.HOTEL]: 450,
      [BusinessTypeCategory.BANK]: 600,
      [BusinessTypeCategory.DOCTOR]: 400,
      [BusinessTypeCategory.LAWYER]: 350,
      [BusinessTypeCategory.BARBER]: 200,
      [BusinessTypeCategory.RESTAURANT]: 350,
      [BusinessTypeCategory.RANCH]: 600,
      [BusinessTypeCategory.FARM]: 400,
      [BusinessTypeCategory.MINE]: 500,
      [BusinessTypeCategory.LUMBER_MILL]: 400,
      [BusinessTypeCategory.TEXTILE]: 350,
    };

    return revenues[businessType] ?? 300;
  }
}
