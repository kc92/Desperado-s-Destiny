/**
 * Balance Validation Service
 *
 * Provides tools to validate and monitor economic balance.
 * Detects inflation, exploits, and broken economics.
 *
 * PRODUCTION FIX: Added Redis caching and sampling to prevent performance bombs
 * - Gini coefficient cached for 5 minutes
 * - Samples max 10k characters for large datasets
 * - Aggregation pipelines optimized
 */

import { Character } from '../models/Character.model';
import { GoldTransaction, TransactionSource, TransactionType } from '../models/GoldTransaction.model';
import { Item, ItemRarity } from '../models/Item.model';
import { BALANCE_TARGETS, EXPLOIT_THRESHOLDS, getLevelTier } from '../config/economy.config';
import logger from '../utils/logger';
import { getRedisClient } from '../config/redis';

/**
 * Cache configuration for expensive calculations
 * PRODUCTION FIX: Prevents performance bombs from repeated calculations
 */
const CACHE_CONFIG = {
  GINI_COEFFICIENT: {
    KEY: 'balance:gini_coefficient',
    TTL: 300, // 5 minutes in seconds
  },
  WEALTH_BY_TIER: {
    KEY: 'balance:wealth_by_tier',
    TTL: 300, // 5 minutes
  },
  GOLD_FLOW_RATIO: {
    KEY: 'balance:gold_flow_ratio',
    TTL: 60, // 1 minute (more volatile)
  },
  MAX_SAMPLE_SIZE: 10000, // Maximum characters to sample for large datasets
} as const;

/**
 * Expected price ranges by rarity for validation
 */
const RARITY_PRICE_RANGES: Record<ItemRarity, { min: number; max: number }> = {
  common: { min: 1, max: 500 },
  uncommon: { min: 50, max: 2000 },
  rare: { min: 200, max: 10000 },
  epic: { min: 1000, max: 50000 },
  legendary: { min: 5000, max: 500000 }
};

/**
 * Expected sell price ratio (sellPrice should be this fraction of price)
 */
const EXPECTED_SELL_RATIO = 0.5;
const SELL_RATIO_TOLERANCE = 0.1; // Allow 10% deviation

/**
 * Balance issue severity
 */
export enum BalanceIssueSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

/**
 * Balance issue definition
 */
export interface BalanceIssue {
  severity: BalanceIssueSeverity;
  category: string;
  description: string;
  affectedCharacters?: string[];
  metrics?: Record<string, number>;
  recommendation?: string;
}

/**
 * Economic health metrics
 */
export interface EconomicHealth {
  goldFlowRatio: number;
  averageWealthByTier: Record<string, number>;
  giniCoefficient: number;
  goldVelocity: number;
  inflationRate: number;
  issues: BalanceIssue[];
}

export class BalanceValidationService {
  /**
   * Validate overall economic health
   */
  static async validateEconomicHealth(): Promise<EconomicHealth> {
    const issues: BalanceIssue[] = [];

    // Calculate gold flow ratio
    const goldFlowRatio = await this.calculateGoldFlowRatio();
    if (goldFlowRatio < BALANCE_TARGETS.goldFlowRatio.minimum) {
      issues.push({
        severity: BalanceIssueSeverity.WARNING,
        category: 'gold_flow',
        description: `Gold flow ratio too low: ${goldFlowRatio.toFixed(2)}. Players are earning less than they spend.`,
        metrics: { goldFlowRatio, target: BALANCE_TARGETS.goldFlowRatio.target },
        recommendation: 'Increase gold rewards or reduce costs'
      });
    } else if (goldFlowRatio > BALANCE_TARGETS.goldFlowRatio.maximum) {
      issues.push({
        severity: BalanceIssueSeverity.WARNING,
        category: 'gold_flow',
        description: `Gold flow ratio too high: ${goldFlowRatio.toFixed(2)}. Players are earning more than they spend.`,
        metrics: { goldFlowRatio, target: BALANCE_TARGETS.goldFlowRatio.target },
        recommendation: 'Reduce gold rewards or increase costs/sinks'
      });
    }

    // Calculate average wealth by tier
    const averageWealthByTier = await this.calculateAverageWealthByTier();

    // Calculate wealth inequality (Gini coefficient)
    const giniCoefficient = await this.calculateGiniCoefficient();
    if (giniCoefficient < BALANCE_TARGETS.wealthInequality.minimum) {
      issues.push({
        severity: BalanceIssueSeverity.INFO,
        category: 'wealth_inequality',
        description: `Wealth too evenly distributed (Gini: ${giniCoefficient.toFixed(2)}). May lack progression feel.`,
        metrics: { giniCoefficient, target: BALANCE_TARGETS.wealthInequality.target },
        recommendation: 'Review reward scaling between tiers'
      });
    } else if (giniCoefficient > BALANCE_TARGETS.wealthInequality.maximum) {
      issues.push({
        severity: BalanceIssueSeverity.WARNING,
        category: 'wealth_inequality',
        description: `Wealth inequality too high (Gini: ${giniCoefficient.toFixed(2)}). Economy may be broken.`,
        metrics: { giniCoefficient, target: BALANCE_TARGETS.wealthInequality.target },
        recommendation: 'Check for exploits or balance issues favoring high-level players'
      });
    }

    // Calculate gold velocity
    const goldVelocity = await this.calculateGoldVelocity();
    if (goldVelocity < BALANCE_TARGETS.goldVelocity.minimum) {
      issues.push({
        severity: BalanceIssueSeverity.WARNING,
        category: 'gold_velocity',
        description: `Gold velocity too low: ${goldVelocity.toFixed(1)} transactions/day. Economy is stagnant.`,
        metrics: { goldVelocity, target: BALANCE_TARGETS.goldVelocity.target },
        recommendation: 'Encourage player trading and economic activity'
      });
    } else if (goldVelocity > BALANCE_TARGETS.goldVelocity.maximum) {
      issues.push({
        severity: BalanceIssueSeverity.CRITICAL,
        category: 'gold_velocity',
        description: `Gold velocity suspiciously high: ${goldVelocity.toFixed(1)} transactions/day. Possible exploits.`,
        metrics: { goldVelocity, target: BALANCE_TARGETS.goldVelocity.target },
        recommendation: 'Investigate for gold duplication or trading exploits'
      });
    }

    // Calculate inflation rate
    const inflationRate = await this.calculateInflationRate();

    // Check for exploit patterns
    const exploitIssues = await this.detectExploitPatterns();
    issues.push(...exploitIssues);

    return {
      goldFlowRatio,
      averageWealthByTier,
      giniCoefficient,
      goldVelocity,
      inflationRate,
      issues
    };
  }

  /**
   * Calculate gold flow ratio (earned / spent)
   * PRODUCTION FIX: Added Redis caching (1 min TTL)
   */
  private static async calculateGoldFlowRatio(): Promise<number> {
    const redis = getRedisClient();

    try {
      // Check cache first
      if (redis?.isOpen) {
        const cached = await redis.get(CACHE_CONFIG.GOLD_FLOW_RATIO.KEY);
        if (cached) {
          logger.debug('[BalanceValidation] Gold flow ratio retrieved from cache');
          return parseFloat(cached);
        }
      }

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Use aggregation for better performance
      const result = await GoldTransaction.aggregate([
        { $match: { timestamp: { $gte: oneDayAgo } } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]);

      const earned = result.find(r => r._id === TransactionType.EARNED)?.total || 0;
      const spent = Math.abs(result.find(r => r._id === TransactionType.SPENT)?.total || 0);
      const ratio = spent > 0 ? earned / spent : 1.0;

      // Cache the result
      if (redis?.isOpen) {
        await redis.setEx(
          CACHE_CONFIG.GOLD_FLOW_RATIO.KEY,
          CACHE_CONFIG.GOLD_FLOW_RATIO.TTL,
          ratio.toString()
        );
      }

      return ratio;
    } catch (error) {
      logger.error('[BalanceValidation] Error calculating gold flow ratio:', error);
      return 1.0;
    }
  }

  /**
   * Calculate average wealth by level tier
   * PRODUCTION FIX: Added Redis caching (5 min TTL) and aggregation pipeline
   */
  private static async calculateAverageWealthByTier(): Promise<Record<string, number>> {
    const redis = getRedisClient();

    try {
      // Check cache first
      if (redis?.isOpen) {
        const cached = await redis.get(CACHE_CONFIG.WEALTH_BY_TIER.KEY);
        if (cached) {
          logger.debug('[BalanceValidation] Wealth by tier retrieved from cache');
          return JSON.parse(cached);
        }
      }

      // Use aggregation pipeline for better performance - prevents OOM with large player bases
      // Tier boundaries based on totalLevel: NOVICE(<100), JOURNEYMAN(100-249), VETERAN(250-499), EXPERT(500-999), MASTER(1000+)
      const wealthByTierAgg = await Character.aggregate([
        { $match: { isActive: true } },
        {
          $addFields: {
            tier: {
              $switch: {
                branches: [
                  { case: { $lt: ['$level', 100] }, then: 'NOVICE' },
                  { case: { $lt: ['$level', 250] }, then: 'JOURNEYMAN' },
                  { case: { $lt: ['$level', 500] }, then: 'VETERAN' },
                  { case: { $lt: ['$level', 1000] }, then: 'EXPERT' }
                ],
                default: 'MASTER'
              }
            }
          }
        },
        {
          $group: {
            _id: '$tier',
            total: { $sum: '$gold' },
            count: { $sum: 1 }
          }
        }
      ]);

      const averages: Record<string, number> = {};
      for (const item of wealthByTierAgg) {
        averages[item._id] = item.count > 0 ? item.total / item.count : 0;
      }

      // Cache the result
      if (redis?.isOpen) {
        await redis.setEx(
          CACHE_CONFIG.WEALTH_BY_TIER.KEY,
          CACHE_CONFIG.WEALTH_BY_TIER.TTL,
          JSON.stringify(averages)
        );
      }

      return averages;
    } catch (error) {
      logger.error('[BalanceValidation] Error calculating wealth by tier:', error);
      return {};
    }
  }

  /**
   * Calculate Gini coefficient (wealth inequality measure)
   * 0 = perfect equality, 1 = perfect inequality
   *
   * PRODUCTION FIX: Added Redis caching and sampling to prevent O(n²) performance bomb
   * - Checks cache first (5 min TTL)
   * - Samples max 10k characters for large datasets
   * - Uses optimized aggregation pipeline
   */
  private static async calculateGiniCoefficient(): Promise<number> {
    const redis = getRedisClient();

    try {
      // Check cache first
      if (redis?.isOpen) {
        const cached = await redis.get(CACHE_CONFIG.GINI_COEFFICIENT.KEY);
        if (cached) {
          logger.debug('[BalanceValidation] Gini coefficient retrieved from cache');
          return parseFloat(cached);
        }
      }

      // Get total count to determine if sampling is needed
      const totalCount = await Character.countDocuments({ isActive: true });

      if (totalCount < 2) {
        return 0;
      }

      let characters: { gold: number }[];

      // Use sampling for large datasets to prevent memory issues
      if (totalCount > CACHE_CONFIG.MAX_SAMPLE_SIZE) {
        logger.info(`[BalanceValidation] Sampling ${CACHE_CONFIG.MAX_SAMPLE_SIZE} of ${totalCount} characters for Gini calculation`);

        // Use aggregation pipeline with random sampling
        characters = await Character.aggregate([
          { $match: { isActive: true } },
          { $sample: { size: CACHE_CONFIG.MAX_SAMPLE_SIZE } },
          { $project: { gold: 1, _id: 0 } },
          { $sort: { gold: 1 } },
        ]);
      } else {
        // Load all characters for small datasets
        characters = await Character.find({ isActive: true })
          .select('gold')
          .sort({ gold: 1 })
          .lean();
      }

      // Calculate Gini using optimized formula
      const n = characters.length;
      let sumOfWealth = 0;
      let sumOfWeightedWealth = 0;

      for (let i = 0; i < n; i++) {
        const wealth = characters[i].gold || 0;
        sumOfWealth += wealth;
        // Weighted sum: (2 * rank - n - 1) * wealth
        sumOfWeightedWealth += (2 * (i + 1) - n - 1) * wealth;
      }

      const meanWealth = sumOfWealth / n;
      const gini = meanWealth > 0 ? sumOfWeightedWealth / (n * sumOfWealth) : 0;

      // Cache the result
      if (redis?.isOpen) {
        await redis.setEx(
          CACHE_CONFIG.GINI_COEFFICIENT.KEY,
          CACHE_CONFIG.GINI_COEFFICIENT.TTL,
          gini.toString()
        );
        logger.debug('[BalanceValidation] Gini coefficient cached');
      }

      return gini;
    } catch (error) {
      logger.error('[BalanceValidation] Error calculating Gini coefficient:', error);
      // Return conservative estimate on error
      return 0.5;
    }
  }

  /**
   * Calculate gold velocity (average transactions per player per day)
   */
  private static async calculateGoldVelocity(): Promise<number> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const transactionCount = await GoldTransaction.countDocuments({
      timestamp: { $gte: oneDayAgo }
    });

    const activePlayerCount = await Character.countDocuments({
      isActive: true,
      lastActive: { $gte: oneDayAgo }
    });

    return activePlayerCount > 0 ? transactionCount / activePlayerCount : 0;
  }

  /**
   * Calculate inflation rate (change in average gold holdings)
   */
  private static async calculateInflationRate(): Promise<number> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get current average gold using aggregation - prevents OOM with large player bases
    const currentAvgAgg = await Character.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgGold: { $avg: '$gold' }, count: { $sum: 1 } } }
    ]);
    const currentAverage = currentAvgAgg[0]?.avgGold || 0;
    const charCount = currentAvgAgg[0]?.count || 0;
    if (charCount === 0) return 0;

    // Estimate past average from transactions
    const pastTransactions = await GoldTransaction.find({
      timestamp: { $lte: sevenDaysAgo }
    }).sort({ timestamp: -1 }).limit(1000).lean();

    if (pastTransactions.length === 0) return 0;

    const pastAverage = pastTransactions.reduce((sum, t) => sum + t.balanceAfter, 0) / pastTransactions.length;

    return pastAverage > 0 ? ((currentAverage - pastAverage) / pastAverage) * 100 : 0;
  }

  /**
   * Detect exploit patterns
   */
  private static async detectExploitPatterns(): Promise<BalanceIssue[]> {
    const issues: BalanceIssue[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check for excessive gold per transaction
    const largeTransactions = await GoldTransaction.find({
      amount: { $gt: EXPLOIT_THRESHOLDS.maxGoldPerTransaction },
      timestamp: { $gte: oneDayAgo }
    }).populate('characterId', 'name').lean();

    if (largeTransactions.length > 0) {
      issues.push({
        severity: BalanceIssueSeverity.CRITICAL,
        category: 'exploit_detection',
        description: `${largeTransactions.length} transactions exceed maximum gold threshold`,
        affectedCharacters: largeTransactions.map(t => (t.characterId as any)?.name || 'Unknown'),
        recommendation: 'Investigate for gold duplication exploits'
      });
    }

    // Check for excessive gold per hour
    const recentTransactions = await GoldTransaction.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo }, type: TransactionType.EARNED } },
      { $group: { _id: '$characterId', totalGold: { $sum: '$amount' } } },
      { $match: { totalGold: { $gt: EXPLOIT_THRESHOLDS.maxGoldPerHour } } }
    ]);

    if (recentTransactions.length > 0) {
      const characterIds = recentTransactions.map(t => t._id);
      const chars = await Character.find({ _id: { $in: characterIds } }).select('name').lean();

      issues.push({
        severity: BalanceIssueSeverity.WARNING,
        category: 'exploit_detection',
        description: `${recentTransactions.length} characters earning excessive gold per hour`,
        affectedCharacters: chars.map(c => c.name),
        recommendation: 'Review for farming exploits or bots'
      });
    }

    // Check for excessive trading
    const excessiveTraders = await GoldTransaction.aggregate([
      {
        $match: {
          timestamp: { $gte: oneHourAgo },
          source: { $in: [TransactionSource.PLAYER_TRADE, TransactionSource.MAIL_SENT] }
        }
      },
      { $group: { _id: '$characterId', tradeCount: { $sum: 1 } } },
      { $match: { tradeCount: { $gt: EXPLOIT_THRESHOLDS.maxTradesPerHour } } }
    ]);

    if (excessiveTraders.length > 0) {
      const characterIds = excessiveTraders.map(t => t._id);
      const chars = await Character.find({ _id: { $in: characterIds } }).select('name').lean();

      issues.push({
        severity: BalanceIssueSeverity.WARNING,
        category: 'exploit_detection',
        description: `${excessiveTraders.length} characters trading excessively`,
        affectedCharacters: chars.map(c => c.name),
        recommendation: 'Check for gold transfer exploits or RMT (real money trading)'
      });
    }

    return issues;
  }

  /**
   * Validate item pricing
   * Check if any items have broken economics (sell price > buy price, etc.)
   */
  static async validateItemPricing(): Promise<BalanceIssue[]> {
    const issues: BalanceIssue[] = [];

    const items = await Item.find({}).lean();

    if (items.length === 0) {
      issues.push({
        severity: BalanceIssueSeverity.INFO,
        category: 'item_pricing',
        description: 'No items found in database. Item seeding may be incomplete.',
        recommendation: 'Run item seeding script to populate items'
      });
      return issues;
    }

    const criticalItems: string[] = [];
    const warningItems: string[] = [];

    for (const item of items) {
      // CRITICAL: Sell price exceeds buy price (exploit prevention)
      if (item.sellPrice > item.price) {
        criticalItems.push(item.itemId);
        issues.push({
          severity: BalanceIssueSeverity.CRITICAL,
          category: 'item_pricing',
          description: `Item '${item.itemId}' has sellPrice (${item.sellPrice}) > price (${item.price}). Potential gold exploit!`,
          metrics: { sellPrice: item.sellPrice, buyPrice: item.price, profit: item.sellPrice - item.price },
          recommendation: 'Set sellPrice to 50% of price or less'
        });
      }

      // WARNING: Missing or zero price
      if (!item.price || item.price <= 0) {
        warningItems.push(item.itemId);
        issues.push({
          severity: BalanceIssueSeverity.WARNING,
          category: 'item_pricing',
          description: `Item '${item.itemId}' has missing or zero price: ${item.price}`,
          recommendation: 'Set a valid price based on rarity and level requirements'
        });
      }

      // WARNING: Shop items with invalid prices
      if (item.inShop && item.price < 1) {
        warningItems.push(item.itemId);
        issues.push({
          severity: BalanceIssueSeverity.WARNING,
          category: 'item_pricing',
          description: `Shop item '${item.itemId}' has invalid price: ${item.price}`,
          recommendation: 'Shop items should have positive prices'
        });
      }

      // WARNING: Price outside expected range for rarity
      const rarityRange = RARITY_PRICE_RANGES[item.rarity];
      if (rarityRange && item.price > 0) {
        if (item.price < rarityRange.min || item.price > rarityRange.max) {
          issues.push({
            severity: BalanceIssueSeverity.INFO,
            category: 'item_pricing',
            description: `Item '${item.itemId}' (${item.rarity}) price ${item.price} outside expected range [${rarityRange.min}-${rarityRange.max}]`,
            metrics: { price: item.price, expectedMin: rarityRange.min, expectedMax: rarityRange.max },
            recommendation: 'Review pricing relative to rarity tier'
          });
        }
      }

      // INFO: Sell ratio significantly off from expected 50%
      if (item.price > 0) {
        const actualRatio = item.sellPrice / item.price;
        if (Math.abs(actualRatio - EXPECTED_SELL_RATIO) > SELL_RATIO_TOLERANCE && item.sellPrice <= item.price) {
          issues.push({
            severity: BalanceIssueSeverity.INFO,
            category: 'item_pricing',
            description: `Item '${item.itemId}' has unusual sell ratio: ${(actualRatio * 100).toFixed(0)}% (expected ~50%)`,
            metrics: { sellPrice: item.sellPrice, buyPrice: item.price, ratio: actualRatio },
            recommendation: 'Consider standardizing sell price to 50% of buy price'
          });
        }
      }
    }

    // Summary issue if multiple problems found
    if (criticalItems.length > 0) {
      issues.unshift({
        severity: BalanceIssueSeverity.CRITICAL,
        category: 'item_pricing_summary',
        description: `${criticalItems.length} items have sellPrice > price exploits`,
        affectedCharacters: criticalItems.slice(0, 10), // Show first 10
        recommendation: 'Fix pricing on all affected items immediately'
      });
    }

    if (warningItems.length > 0) {
      issues.unshift({
        severity: BalanceIssueSeverity.WARNING,
        category: 'item_pricing_summary',
        description: `${warningItems.length} items have pricing warnings`,
        affectedCharacters: [...new Set(warningItems)].slice(0, 10),
        recommendation: 'Review and fix item pricing'
      });
    }

    logger.info(`Item pricing validation complete: ${items.length} items checked, ${issues.length} issues found`);

    return issues;
  }

  /**
   * Detect potential gold duplication
   */
  static async detectGoldDuplication(characterId: string, timeWindowMinutes: number = 5): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);

    const transactions = await GoldTransaction.find({
      characterId,
      timestamp: { $gte: windowStart }
    }).sort({ timestamp: 1 }).lean();

    // Check for impossible balance changes
    for (let i = 1; i < transactions.length; i++) {
      const prev = transactions[i - 1];
      const curr = transactions[i];

      // Balance should be continuous
      if (prev.balanceAfter !== curr.balanceBefore) {
        logger.warn(`Potential gold duplication detected for character ${characterId}`, {
          prevTransaction: prev._id,
          currTransaction: curr._id,
          expectedBalance: prev.balanceAfter,
          actualBalance: curr.balanceBefore
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Check if character's gold earning rate is suspicious
   */
  static async isEarningRateSuspicious(characterId: string): Promise<{
    suspicious: boolean;
    goldPerHour: number;
    expectedMax: number;
  }> {
    const character = await Character.findById(characterId).select('level').lean();
    if (!character) {
      return { suspicious: false, goldPerHour: 0, expectedMax: 0 };
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const earnedTransactions = await GoldTransaction.find({
      characterId,
      type: TransactionType.EARNED,
      timestamp: { $gte: oneHourAgo }
    }).lean();

    const goldPerHour = earnedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const expectedMax = EXPLOIT_THRESHOLDS.maxGoldPerHour;

    return {
      suspicious: goldPerHour > expectedMax,
      goldPerHour,
      expectedMax
    };
  }

  /**
   * Generate daily balance report
   */
  static async generateDailyReport(): Promise<{
    health: EconomicHealth;
    timestamp: Date;
    summary: string;
  }> {
    const health = await this.validateEconomicHealth();

    const criticalIssues = health.issues.filter(i => i.severity === BalanceIssueSeverity.CRITICAL);
    const warningIssues = health.issues.filter(i => i.severity === BalanceIssueSeverity.WARNING);

    let summary = 'Economic Health Report:\n';
    summary += `Gold Flow Ratio: ${health.goldFlowRatio.toFixed(2)} (Target: ${BALANCE_TARGETS.goldFlowRatio.target})\n`;
    summary += `Gini Coefficient: ${health.giniCoefficient.toFixed(2)} (Target: ${BALANCE_TARGETS.wealthInequality.target})\n`;
    summary += `Gold Velocity: ${health.goldVelocity.toFixed(1)} transactions/player/day\n`;
    summary += `Inflation Rate: ${health.inflationRate.toFixed(2)}%\n`;
    summary += `\nIssues: ${criticalIssues.length} critical, ${warningIssues.length} warnings\n`;

    if (criticalIssues.length > 0) {
      summary += '\nCRITICAL ISSUES:\n';
      criticalIssues.forEach(issue => {
        summary += `- ${issue.description}\n`;
      });
    }

    logger.info(summary);

    return {
      health,
      timestamp: new Date(),
      summary
    };
  }
}

export default BalanceValidationService;
