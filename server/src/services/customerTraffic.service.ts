/**
 * Customer Traffic Service
 *
 * Phase 12: Business Ownership System
 *
 * Simulates NPC customer visits to businesses:
 * - Generates NPC traffic based on business reputation and tier
 * - Creates service records for NPC transactions
 * - Updates business statistics and revenue
 */

import mongoose from 'mongoose';
import { Business, IBusiness } from '../models/Business.model';
import { BusinessServiceRecord } from '../models/BusinessServiceRecord.model';
import { BusinessRevenueService } from './businessRevenue.service';
import logger from '../utils/logger';
import {
  PlayerBusinessStatus,
  BusinessTier,
  BUSINESS_TIER_INFO,
  IBusinessService,
} from '@desperados/shared';
import {
  TRAFFIC_MODIFIERS,
  NPC_CUSTOMER_CONSTANTS,
  BUSINESS_ECONOMY_CONSTANTS,
  BusinessTypeCategory,
  PlayerBusinessType,
} from '@desperados/shared';
import { CompetitionService } from './competition.service';

/**
 * Map PlayerBusinessType to BusinessTypeCategory for competition calculations
 */
function mapPlayerBusinessToCategory(businessType: string): BusinessTypeCategory {
  const mapping: Record<string, BusinessTypeCategory> = {
    [PlayerBusinessType.SALOON]: BusinessTypeCategory.SALOON,
    [PlayerBusinessType.GENERAL_STORE]: BusinessTypeCategory.GENERAL_STORE,
    [PlayerBusinessType.BLACKSMITH]: BusinessTypeCategory.BLACKSMITH,
    [PlayerBusinessType.STABLE]: BusinessTypeCategory.STABLE,
    [PlayerBusinessType.DOCTOR_OFFICE]: BusinessTypeCategory.DOCTOR,
    [PlayerBusinessType.BANK_BRANCH]: BusinessTypeCategory.BANK,
    [PlayerBusinessType.BREWERY]: BusinessTypeCategory.SALOON, // Brewery maps to Saloon category
    [PlayerBusinessType.RANCH]: BusinessTypeCategory.RANCH,
    [PlayerBusinessType.TANNERY]: BusinessTypeCategory.TEXTILE, // Tannery maps to Textile category
    [PlayerBusinessType.GUNSMITH]: BusinessTypeCategory.BLACKSMITH, // Gunsmith maps to Blacksmith category
    [PlayerBusinessType.MINING_OPERATION]: BusinessTypeCategory.MINE,
  };
  return mapping[businessType] || BusinessTypeCategory.GENERAL_STORE;
}

/**
 * NPC customer names for variety
 */
const NPC_NAMES = [
  'Old Pete', 'Dusty Jake', 'Martha Belle', 'Big Tom', 'Slim Jim',
  'Wild Bill', 'Copper Kate', 'Rusty Joe', 'Prairie Rose', 'Tall Paul',
  'Lucky Lou', 'Quick Draw McGraw', 'Whiskey Jack', 'Annie Oakley', 'Doc Brown',
  'Sheriff Brady', 'Cattle Kate', 'Buffalo Bill', 'Calamity Jane', 'Jesse James',
  'Butch Cassidy', 'Sundance Kid', 'Belle Starr', 'Wyatt Earp', 'Billy the Kid',
];

/**
 * Result of processing traffic for a single business
 */
export interface TrafficProcessResult {
  businessId: string;
  businessName: string;
  visitorsGenerated: number;
  revenueGenerated: number;
  servicesRendered: number;
  averageSatisfaction: number;
}

/**
 * Result of processing all businesses
 */
export interface TrafficCycleResult {
  processedBusinesses: number;
  totalVisitors: number;
  totalRevenue: number;
  results: TrafficProcessResult[];
}

export class CustomerTrafficService {
  /**
   * Process traffic for all active businesses
   * Called every 5 minutes by the traffic job
   */
  static async processAllBusinessTraffic(): Promise<TrafficCycleResult> {
    const startTime = Date.now();
    const results: TrafficProcessResult[] = [];
    let totalVisitors = 0;
    let totalRevenue = 0;

    // Get all active businesses
    const businesses = await Business.find({
      status: PlayerBusinessStatus.ACTIVE,
    });

    logger.info(`[CustomerTraffic] Processing traffic for ${businesses.length} active businesses`);

    for (const business of businesses) {
      try {
        // Skip if business is at revenue cap
        if (business.pendingRevenue >= business.maxPendingRevenue) {
          logger.debug(
            `[CustomerTraffic] Skipping ${business.businessName} - at revenue cap`
          );
          continue;
        }

        // Skip if business is not open
        if (!business.isOpen()) {
          logger.debug(
            `[CustomerTraffic] Skipping ${business.businessName} - currently closed`
          );
          continue;
        }

        const result = await this.processBusinessTraffic(business);
        results.push(result);
        totalVisitors += result.visitorsGenerated;
        totalRevenue += result.revenueGenerated;
      } catch (error) {
        logger.error(
          `[CustomerTraffic] Error processing ${business.businessName}:`,
          error
        );
      }
    }

    const elapsed = Date.now() - startTime;
    logger.info(
      `[CustomerTraffic] Completed: ${businesses.length} businesses, ` +
      `${totalVisitors} visitors, $${totalRevenue} revenue in ${elapsed}ms`
    );

    return {
      processedBusinesses: results.length,
      totalVisitors,
      totalRevenue,
      results,
    };
  }

  /**
   * Process traffic for a single business
   */
  static async processBusinessTraffic(business: IBusiness): Promise<TrafficProcessResult> {
    // Calculate visitors for this 5-minute interval
    // currentTrafficRate is per hour, so divide by 12
    const baseVisitors = business.currentTrafficRate / 12;

    // Phase 14.3: Get market saturation modifier
    let saturationModifier = 1.0;
    try {
      // Map player business type to competition category
      const businessCategory = mapPlayerBusinessToCategory(business.businessType);
      const saturation = await CompetitionService.getMarketSaturation(
        business.locationId,
        businessCategory
      );
      saturationModifier = saturation.trafficModifier;
      if (saturationModifier !== 1.0) {
        logger.debug(
          `[CustomerTraffic] Market saturation for ${business.businessName}: ` +
          `${saturation.level} (${saturationModifier.toFixed(2)}x modifier)`
        );
      }
    } catch (saturationError) {
      logger.warn('[CustomerTraffic] Failed to get market saturation:', saturationError);
    }

    // Apply variance and saturation modifier
    const variance = 1 + (Math.random() - 0.5) * 2 * BUSINESS_ECONOMY_CONSTANTS.NPC_SPAWN_VARIANCE;
    const visitors = Math.max(0, Math.round(baseVisitors * variance * saturationModifier));

    if (visitors === 0) {
      return {
        businessId: business._id.toString(),
        businessName: business.businessName,
        visitorsGenerated: 0,
        revenueGenerated: 0,
        servicesRendered: 0,
        averageSatisfaction: 0,
      };
    }

    let totalRevenue = 0;
    let totalSatisfaction = 0;
    let servicesRendered = 0;

    // Get active services
    const activeServices = business.services.filter(s => s.isActive);
    if (activeServices.length === 0) {
      logger.debug(
        `[CustomerTraffic] ${business.businessName} has no active services`
      );
      return {
        businessId: business._id.toString(),
        businessName: business.businessName,
        visitorsGenerated: visitors,
        revenueGenerated: 0,
        servicesRendered: 0,
        averageSatisfaction: 0,
      };
    }

    // Process each visitor
    for (let i = 0; i < visitors; i++) {
      // Select a random service
      const service = this.selectService(activeServices, business.reputation.priceValue);
      if (!service) continue;

      // Calculate satisfaction
      const satisfaction = this.calculateSatisfaction(service, business);

      // Calculate price with modifiers
      const finalPrice = service.currentPrice;

      // Calculate tip
      let tipAmount = 0;
      if (satisfaction >= NPC_CUSTOMER_CONSTANTS.TIPPING.TIP_SATISFACTION_THRESHOLD) {
        if (Math.random() < NPC_CUSTOMER_CONSTANTS.TIPPING.BASE_TIP_CHANCE) {
          const tipPercent =
            NPC_CUSTOMER_CONSTANTS.TIPPING.TIP_MIN_PERCENTAGE +
            Math.random() *
            (NPC_CUSTOMER_CONSTANTS.TIPPING.TIP_MAX_PERCENTAGE -
              NPC_CUSTOMER_CONSTANTS.TIPPING.TIP_MIN_PERCENTAGE);
          tipAmount = Math.round(finalPrice * tipPercent);
        }
      }

      const totalPrice = finalPrice + tipAmount;

      // Create service record
      await BusinessServiceRecord.create({
        businessId: business._id,
        serviceId: service.serviceId,
        transactionType: 'service',
        customerName: this.getRandomNPCName(),
        isNPC: true,
        serviceName: service.name,
        quantity: 1,
        unitPrice: finalPrice,
        totalPrice: finalPrice,
        workerIds: service.assignedWorkerId ? [service.assignedWorkerId] : [],
        satisfaction,
        tipAmount,
        startedAt: new Date(),
        completedAt: new Date(),
        duration: service.duration,
      });

      // Update service stats
      service.totalServiced++;
      service.lastServicedAt = new Date();

      totalRevenue += totalPrice;
      totalSatisfaction += satisfaction;
      servicesRendered++;
    }

    // Accumulate revenue
    await BusinessRevenueService.accumulateRevenue(
      business._id.toString(),
      totalRevenue,
      visitors
    );

    // Update reputation based on satisfaction
    if (servicesRendered > 0) {
      const avgSatisfaction = totalSatisfaction / servicesRendered;
      business.updateReputation(
        avgSatisfaction, // serviceQuality
        business.reputation.priceValue, // Keep existing price value
        90 // availability - high since they got served
      );
    }

    await business.save();

    return {
      businessId: business._id.toString(),
      businessName: business.businessName,
      visitorsGenerated: visitors,
      revenueGenerated: totalRevenue,
      servicesRendered,
      averageSatisfaction: servicesRendered > 0 ? totalSatisfaction / servicesRendered : 0,
    };
  }

  /**
   * Select a service for an NPC customer
   * Weighted by price value preference
   */
  private static selectService(
    services: IBusinessService[],
    priceValueReputation: number
  ): IBusinessService | null {
    if (services.length === 0) return null;

    // NPCs prefer cheaper services when price value reputation is low
    // and more expensive services when price value reputation is high
    const weights = services.map(s => {
      let weight = 1;

      // Base weight on service availability (staffed services get bonus)
      if (s.assignedWorkerId) {
        weight *= 1.5;
      }

      // Adjust based on price vs base price
      const priceRatio = s.currentPrice / s.basePrice;
      if (priceRatio < 0.8) {
        // Cheap - more attractive
        weight *= 1.3;
      } else if (priceRatio > 1.3) {
        // Expensive - less attractive
        weight *= 0.6;
      }

      return weight;
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < services.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return services[i];
      }
    }

    return services[0];
  }

  /**
   * Calculate customer satisfaction
   */
  private static calculateSatisfaction(
    service: IBusinessService,
    business: IBusiness
  ): number {
    let satisfaction = 50; // Base satisfaction

    // Worker skill bonus (if assigned)
    if (service.assignedWorkerId) {
      const worker = business.staffAssignments.find(
        s => s.workerId === service.assignedWorkerId
      );
      if (worker) {
        // Workers add 0-30% satisfaction based on efficiency
        satisfaction += worker.efficiency * NPC_CUSTOMER_CONSTANTS.SATISFACTION_MODIFIERS.WORKER_SKILL_BONUS * 100;
      }
    } else {
      // No worker penalty
      satisfaction -= 10;
    }

    // Price fairness
    const priceRatio = service.currentPrice / service.basePrice;
    if (priceRatio <= 1.0) {
      satisfaction += NPC_CUSTOMER_CONSTANTS.SATISFACTION_MODIFIERS.PRICE_FAIR_BONUS * 100;
    } else if (priceRatio > 1.3) {
      satisfaction += NPC_CUSTOMER_CONSTANTS.SATISFACTION_MODIFIERS.PRICE_EXPENSIVE_PENALTY * 100;
    }

    // Business reputation influence
    satisfaction += (business.reputation.overall - 50) * 0.2;

    // Cleanliness influence
    satisfaction += (business.reputation.cleanliness - 50) * 0.1;

    // Add some random variance
    satisfaction += (Math.random() - 0.5) * 20;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, Math.round(satisfaction)));
  }

  /**
   * Get a random NPC name
   */
  private static getRandomNPCName(): string {
    return NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
  }

  /**
   * Get traffic statistics for a location
   */
  static async getLocationTrafficStats(locationId: string): Promise<{
    businessCount: number;
    totalDailyVisitors: number;
    totalDailyRevenue: number;
    averageReputation: number;
  }> {
    const businesses = await Business.find({
      locationId,
      status: PlayerBusinessStatus.ACTIVE,
    });

    const totalDailyVisitors = businesses.reduce(
      (sum, b) => sum + b.trafficStats.todayVisitors,
      0
    );
    const totalDailyRevenue = businesses.reduce(
      (sum, b) => sum + b.trafficStats.todayRevenue,
      0
    );
    const averageReputation =
      businesses.length > 0
        ? businesses.reduce((sum, b) => sum + b.reputation.overall, 0) / businesses.length
        : 0;

    return {
      businessCount: businesses.length,
      totalDailyVisitors,
      totalDailyRevenue,
      averageReputation,
    };
  }
}
