/**
 * Business Revenue Service
 *
 * Phase 12: Business Ownership System
 *
 * Handles revenue calculation, accumulation, and collection:
 * - Calculates hourly revenue based on traffic
 * - Applies reputation and territory bonuses
 * - Manages visit-to-collect pattern with caps
 */

import mongoose from 'mongoose';
import { Business, IBusiness } from '../models/Business.model';
import { BusinessServiceRecord } from '../models/BusinessServiceRecord.model';
import { Character } from '../models/Character.model';
import { TerritoryBonusService } from './territoryBonus.service';
import logger from '../utils/logger';
import {
  PlayerBusinessStatus,
  BusinessTier,
  BUSINESS_TIER_INFO,
  BUSINESS_REVENUE_TARGETS,
} from '@desperados/shared';
import {
  BUSINESS_ECONOMY_CONSTANTS,
  TRAFFIC_MODIFIERS,
  NPC_CUSTOMER_CONSTANTS,
} from '@desperados/shared';

/**
 * Revenue calculation result
 */
export interface RevenueCalculation {
  baseRevenue: number;
  trafficModifier: number;
  reputationModifier: number;
  territoryBonus: number;
  finalRevenue: number;
  visitorsServed: number;
}

export class BusinessRevenueService {
  /**
   * Calculate expected hourly revenue for a business
   */
  static async calculateHourlyRevenue(businessId: string): Promise<RevenueCalculation> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    if (business.status !== PlayerBusinessStatus.ACTIVE) {
      return {
        baseRevenue: 0,
        trafficModifier: 0,
        reputationModifier: 0,
        territoryBonus: 0,
        finalRevenue: 0,
        visitorsServed: 0,
      };
    }

    // Get tier info
    const tierInfo = BUSINESS_TIER_INFO[business.tier as BusinessTier];
    const revenueTargets = BUSINESS_REVENUE_TARGETS[business.tier as BusinessTier];

    // Calculate base revenue from average service price and traffic
    const activeServices = business.services.filter(s => s.isActive);
    const avgServicePrice = activeServices.length > 0
      ? activeServices.reduce((sum, s) => sum + s.currentPrice, 0) / activeServices.length
      : 50; // Default if no services

    // Base visitors per hour
    const baseTraffic = business.baseTrafficRate * tierInfo.trafficMultiplier;

    // Apply reputation modifier (0.25 at 0 rep, 1.5 at 100 rep)
    const reputationModifier =
      BUSINESS_ECONOMY_CONSTANTS.REPUTATION_TRAFFIC_MIN +
      (business.reputation.overall / 100) *
      (BUSINESS_ECONOMY_CONSTANTS.REPUTATION_TRAFFIC_MAX - BUSINESS_ECONOMY_CONSTANTS.REPUTATION_TRAFFIC_MIN);

    // Get time-based modifier
    const currentHour = new Date().getHours();
    let timeModifier = 1.0;
    if (currentHour >= 5 && currentHour < 7) {
      timeModifier = TRAFFIC_MODIFIERS.TIME_MODIFIERS.dawn;
    } else if (currentHour >= 7 && currentHour < 11) {
      timeModifier = TRAFFIC_MODIFIERS.TIME_MODIFIERS.morning;
    } else if (currentHour >= 11 && currentHour < 14) {
      timeModifier = TRAFFIC_MODIFIERS.TIME_MODIFIERS.midday;
    } else if (currentHour >= 14 && currentHour < 18) {
      timeModifier = TRAFFIC_MODIFIERS.TIME_MODIFIERS.afternoon;
    } else if (currentHour >= 18 && currentHour < 22) {
      timeModifier = TRAFFIC_MODIFIERS.TIME_MODIFIERS.evening;
    } else if (currentHour >= 22 || currentHour < 1) {
      timeModifier = TRAFFIC_MODIFIERS.TIME_MODIFIERS.night;
    } else {
      timeModifier = TRAFFIC_MODIFIERS.TIME_MODIFIERS.late_night;
    }

    // Get territory bonus
    let territoryBonus = 0;
    try {
      // Need to get the owner's gang to check territory bonuses
      const character = await Character.findById(business.characterId);
      if (character?.gangId) {
        const bonusResult = await TerritoryBonusService.getPropertyBonuses(
          business.locationId,
          new mongoose.Types.ObjectId(character.gangId.toString())
        );
        // Income bonus is a multiplier (1.0 = no bonus, 1.25 = +25%)
        territoryBonus = (bonusResult.bonuses.income - 1.0);
      }
    } catch (error) {
      // Territory bonus service may not be available
      logger.debug('Could not get territory bonuses for business revenue:', error);
    }

    // Calculate final values
    const trafficModifier = reputationModifier * timeModifier;
    const visitorsServed = Math.floor(baseTraffic * trafficModifier);
    const baseRevenue = visitorsServed * avgServicePrice;
    const finalRevenue = Math.floor(baseRevenue * (1 + territoryBonus));

    return {
      baseRevenue,
      trafficModifier,
      reputationModifier,
      territoryBonus,
      finalRevenue,
      visitorsServed,
    };
  }

  /**
   * Process revenue accumulation for a business (called by traffic job)
   */
  static async accumulateRevenue(
    businessId: string,
    revenue: number,
    visitors: number
  ): Promise<{ newPending: number; capped: boolean }> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const previousPending = business.pendingRevenue;
    business.addRevenue(revenue);

    // Record visitor stats
    business.totalCustomersServed += visitors;
    business.trafficStats.todayVisitors += visitors;
    business.trafficStats.todayRevenue += revenue;
    business.trafficStats.weeklyVisitors += visitors;
    business.trafficStats.weeklyRevenue += revenue;
    business.trafficStats.monthlyVisitors += visitors;
    business.trafficStats.monthlyRevenue += revenue;

    await business.save();

    const capped = business.pendingRevenue >= business.maxPendingRevenue;

    logger.debug(
      `Business ${businessId} accumulated $${revenue} revenue (${visitors} visitors). ` +
      `Pending: $${business.pendingRevenue} ${capped ? '(CAPPED)' : ''}`
    );

    return {
      newPending: business.pendingRevenue,
      capped,
    };
  }

  /**
   * Get pending revenue for all businesses owned by a character
   */
  static async getPendingRevenueByOwner(characterId: string): Promise<{
    businesses: Array<{
      businessId: string;
      businessName: string;
      pendingRevenue: number;
      maxPendingRevenue: number;
      percentFull: number;
    }>;
    totalPending: number;
  }> {
    const businesses = await Business.findByOwner(characterId);

    const result = businesses.map(b => ({
      businessId: b._id.toString(),
      businessName: b.businessName,
      pendingRevenue: b.pendingRevenue,
      maxPendingRevenue: b.maxPendingRevenue,
      percentFull: Math.round((b.pendingRevenue / b.maxPendingRevenue) * 100),
    }));

    const totalPending = result.reduce((sum, b) => sum + b.pendingRevenue, 0);

    return { businesses: result, totalPending };
  }

  /**
   * Apply daily reputation decay to inactive businesses
   */
  static async applyReputationDecay(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const inactiveBusinesses = await Business.find({
      status: PlayerBusinessStatus.ACTIVE,
      lastActiveAt: { $lt: oneDayAgo },
    });

    let decayedCount = 0;
    for (const business of inactiveBusinesses) {
      business.applyReputationDecay();
      await business.save();
      decayedCount++;
    }

    if (decayedCount > 0) {
      logger.info(`Applied reputation decay to ${decayedCount} inactive businesses`);
    }

    return decayedCount;
  }

  /**
   * Reset daily traffic stats (called at midnight)
   */
  static async resetDailyStats(): Promise<number> {
    const result = await Business.updateMany(
      { status: PlayerBusinessStatus.ACTIVE },
      {
        $set: {
          'trafficStats.todayVisitors': 0,
          'trafficStats.todayRevenue': 0,
        },
      }
    );

    logger.info(`Reset daily stats for ${result.modifiedCount} businesses`);
    return result.modifiedCount;
  }

  /**
   * Reset weekly traffic stats (called on Monday midnight)
   */
  static async resetWeeklyStats(): Promise<number> {
    const result = await Business.updateMany(
      { status: PlayerBusinessStatus.ACTIVE },
      {
        $set: {
          'trafficStats.weeklyVisitors': 0,
          'trafficStats.weeklyRevenue': 0,
        },
      }
    );

    logger.info(`Reset weekly stats for ${result.modifiedCount} businesses`);
    return result.modifiedCount;
  }

  /**
   * Reset monthly traffic stats (called on 1st of month)
   */
  static async resetMonthlyStats(): Promise<number> {
    const result = await Business.updateMany(
      { status: PlayerBusinessStatus.ACTIVE },
      {
        $set: {
          'trafficStats.monthlyVisitors': 0,
          'trafficStats.monthlyRevenue': 0,
        },
      }
    );

    logger.info(`Reset monthly stats for ${result.modifiedCount} businesses`);
    return result.modifiedCount;
  }

  /**
   * Check if a business is at revenue cap
   */
  static async isAtRevenueCap(businessId: string): Promise<boolean> {
    const business = await Business.findById(businessId);
    if (!business) return false;

    return business.pendingRevenue >= business.maxPendingRevenue;
  }

  /**
   * Get revenue statistics for a business over a period
   */
  static async getRevenueStats(
    businessId: string,
    days: number = 7
  ): Promise<{
    totalRevenue: number;
    averageDaily: number;
    peakDay: { date: Date; revenue: number } | null;
    trend: 'up' | 'down' | 'stable';
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const records = await BusinessServiceRecord.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          dailyRevenue: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalRevenue = records.reduce((sum, r) => sum + r.dailyRevenue, 0);
    const averageDaily = records.length > 0 ? totalRevenue / records.length : 0;

    let peakDay: { date: Date; revenue: number } | null = null;
    if (records.length > 0) {
      const peak = records.reduce((max, r) =>
        r.dailyRevenue > max.dailyRevenue ? r : max
      );
      peakDay = {
        date: new Date(peak._id),
        revenue: peak.dailyRevenue,
      };
    }

    // Calculate trend (compare last 3 days to previous 3 days)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (records.length >= 6) {
      const recentSum = records.slice(-3).reduce((sum, r) => sum + r.dailyRevenue, 0);
      const previousSum = records.slice(-6, -3).reduce((sum, r) => sum + r.dailyRevenue, 0);
      if (recentSum > previousSum * 1.1) {
        trend = 'up';
      } else if (recentSum < previousSum * 0.9) {
        trend = 'down';
      }
    }

    return {
      totalRevenue,
      averageDaily,
      peakDay,
      trend,
    };
  }
}
