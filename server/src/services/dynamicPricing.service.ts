/**
 * Dynamic Pricing Service
 *
 * Manages supply/demand mechanics and dynamic pricing for the economy system
 * Integrates with world events and provides real-time price adjustments
 */

import mongoose from 'mongoose';
import { ItemTransaction } from '../models/ItemTransaction.model';
import { Item } from '../models/Item.model';
import { WorldEventService } from './worldEvent.service';
import { Location } from '../models/Location.model';
import logger from '../utils/logger';

interface PriceModifier {
  source: 'supply' | 'demand' | 'event' | 'territory' | 'season';
  modifier: number; // Percentage: -30 to +50
  expiresAt?: Date;
}

interface ItemPriceData {
  basePrice: number;
  currentPrice: number;
  modifiers: PriceModifier[];
  supplyLevel: 'scarce' | 'low' | 'normal' | 'high' | 'surplus';
  demandLevel: 'none' | 'low' | 'normal' | 'high' | 'extreme';
  trend: 'rising' | 'stable' | 'falling';
}

// Supply level price impacts
const SUPPLY_MODIFIERS = {
  scarce: 0.40,   // +40% price
  low: 0.15,      // +15% price
  normal: 0,      // No change
  high: -0.10,    // -10% price
  surplus: -0.25, // -25% price
};

// Demand level price impacts
const DEMAND_MODIFIERS = {
  none: -0.20,    // -20% price
  low: -0.10,     // -10% price
  normal: 0,      // No change
  high: 0.20,     // +20% price
  extreme: 0.50,  // +50% price
};

// Thresholds for supply/demand levels (transactions in 24h window)
const SUPPLY_THRESHOLDS = {
  scarce: 0,      // 0 sell transactions
  low: 5,         // 1-5 sell transactions
  normal: 20,     // 6-20 sell transactions
  high: 50,       // 21-50 sell transactions
  surplus: 51,    // 51+ sell transactions
};

const DEMAND_THRESHOLDS = {
  none: 0,        // 0 buy transactions
  low: 3,         // 1-3 buy transactions
  normal: 15,     // 4-15 buy transactions
  high: 40,       // 16-40 buy transactions
  extreme: 41,    // 41+ buy transactions
};

// Cache for price data (5 minute TTL)
interface CachedPriceData extends ItemPriceData {
  cachedAt: Date;
}

const priceCache = new Map<string, CachedPriceData>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class DynamicPricingService {
  /**
   * Calculate current price for an item at a location
   */
  static async getItemPrice(
    itemId: string,
    locationId: string,
    transactionType: 'buy' | 'sell'
  ): Promise<ItemPriceData> {
    const cacheKey = `${itemId}:${locationId}:${transactionType}`;

    // Check cache
    const cached = priceCache.get(cacheKey);
    if (cached && (Date.now() - cached.cachedAt.getTime()) < CACHE_TTL_MS) {
      logger.debug(`Price cache hit for ${cacheKey}`);
      return {
        basePrice: cached.basePrice,
        currentPrice: cached.currentPrice,
        modifiers: cached.modifiers,
        supplyLevel: cached.supplyLevel,
        demandLevel: cached.demandLevel,
        trend: cached.trend,
      };
    }

    const modifiers: PriceModifier[] = [];

    // Get supply/demand levels
    const supplyLevel = await this.calculateSupplyLevel(itemId, locationId);
    const demandLevel = await this.calculateDemandLevel(itemId, locationId);

    // Add supply modifier
    modifiers.push({
      source: 'supply',
      modifier: SUPPLY_MODIFIERS[supplyLevel] * 100
    });

    // Add demand modifier
    modifiers.push({
      source: 'demand',
      modifier: DEMAND_MODIFIERS[demandLevel] * 100
    });

    // Get world event modifiers
    try {
      const activeEvents = await WorldEventService.getActiveEventsForLocation(locationId);
      for (const event of activeEvents) {
        for (const effect of event.worldEffects) {
          if (effect.type === 'price_modifier') {
            // Check if this event affects this item
            // target can be 'all', 'shop_items', itemId, or item type
            const item = await Item.findByItemId(itemId);
            if (!item) continue;

            const appliesToItem =
              effect.target === 'all' ||
              effect.target === 'shop_items' ||
              effect.target === itemId ||
              effect.target === item.type;

            if (appliesToItem) {
              const modifierPercent = (effect.value - 1) * 100;
              modifiers.push({
                source: 'event',
                modifier: modifierPercent
              });
              logger.debug(`World event "${event.name}" modified price by ${modifierPercent}%`);
            }
          }
        }
      }
    } catch (eventError) {
      logger.warn('Failed to check world events for price modifiers:', eventError);
    }

    // Get base price
    const basePrice = await this.getBasePrice(itemId, transactionType);

    // Calculate final price
    const currentPrice = this.applyModifiers(basePrice, modifiers);

    // Calculate trend
    const trend = this.calculateTrend(modifiers);

    const priceData: ItemPriceData = {
      basePrice,
      currentPrice,
      modifiers,
      supplyLevel,
      demandLevel,
      trend,
    };

    // Cache the result
    priceCache.set(cacheKey, {
      ...priceData,
      cachedAt: new Date(),
    });

    return priceData;
  }

  /**
   * Record transaction for supply/demand tracking
   */
  static async recordTransaction(
    itemId: string,
    locationId: string,
    quantity: number,
    transactionType: 'buy' | 'sell',
    price: number
  ): Promise<void> {
    try {
      await ItemTransaction.create({
        itemId,
        locationId,
        quantity,
        type: transactionType,
        price,
        timestamp: new Date(),
      });

      // Clear cache for this item/location
      const buyKey = `${itemId}:${locationId}:buy`;
      const sellKey = `${itemId}:${locationId}:sell`;
      priceCache.delete(buyKey);
      priceCache.delete(sellKey);

      logger.debug(`Recorded ${transactionType} transaction: ${quantity}x ${itemId} at ${locationId}`);
    } catch (error) {
      logger.error('Failed to record transaction:', error);
      // Don't throw - transaction recording is not critical
    }
  }

  /**
   * Calculate supply level based on recent sales
   */
  static async calculateSupplyLevel(
    itemId: string,
    locationId: string
  ): Promise<'scarce' | 'low' | 'normal' | 'high' | 'surplus'> {
    try {
      // Count sell transactions in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const sellCount = await ItemTransaction.countDocuments({
        itemId,
        locationId,
        type: 'sell',
        timestamp: { $gte: twentyFourHoursAgo }
      });

      // Determine supply level
      if (sellCount === 0) return 'scarce';
      if (sellCount <= SUPPLY_THRESHOLDS.low) return 'low';
      if (sellCount <= SUPPLY_THRESHOLDS.normal) return 'normal';
      if (sellCount <= SUPPLY_THRESHOLDS.high) return 'high';
      return 'surplus';
    } catch (error) {
      logger.warn('Failed to calculate supply level:', error);
      return 'normal'; // Default to normal on error
    }
  }

  /**
   * Calculate demand level based on recent purchases
   */
  static async calculateDemandLevel(
    itemId: string,
    locationId: string
  ): Promise<'none' | 'low' | 'normal' | 'high' | 'extreme'> {
    try {
      // Count buy transactions in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const buyCount = await ItemTransaction.countDocuments({
        itemId,
        locationId,
        type: 'buy',
        timestamp: { $gte: twentyFourHoursAgo }
      });

      // Determine demand level
      if (buyCount === 0) return 'none';
      if (buyCount <= DEMAND_THRESHOLDS.low) return 'low';
      if (buyCount <= DEMAND_THRESHOLDS.normal) return 'normal';
      if (buyCount <= DEMAND_THRESHOLDS.high) return 'high';
      return 'extreme';
    } catch (error) {
      logger.warn('Failed to calculate demand level:', error);
      return 'normal'; // Default to normal on error
    }
  }

  /**
   * Apply all price modifiers to base price
   */
  static applyModifiers(basePrice: number, modifiers: PriceModifier[]): number {
    let price = basePrice;

    // Apply each modifier
    for (const modifier of modifiers) {
      const multiplier = 1 + (modifier.modifier / 100);
      price *= multiplier;
    }

    // Round to nearest dollar and ensure minimum of 1
    return Math.max(1, Math.round(price));
  }

  /**
   * Get base price for an item
   */
  private static async getBasePrice(itemId: string, transactionType: 'buy' | 'sell'): Promise<number> {
    const item = await Item.findByItemId(itemId);
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return transactionType === 'buy' ? item.price : item.sellPrice;
  }

  /**
   * Calculate price trend based on modifiers
   */
  private static calculateTrend(modifiers: PriceModifier[]): 'rising' | 'stable' | 'falling' {
    const totalModifier = modifiers.reduce((sum, mod) => sum + mod.modifier, 0);

    if (totalModifier > 10) return 'rising';
    if (totalModifier < -10) return 'falling';
    return 'stable';
  }

  /**
   * Get transaction history for an item at a location
   */
  static async getTransactionHistory(
    itemId: string,
    locationId: string,
    hours: number = 24
  ): Promise<{
    buyCount: number;
    sellCount: number;
    averageBuyPrice: number;
    averageSellPrice: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const transactions = await ItemTransaction.find({
      itemId,
      locationId,
      timestamp: { $gte: since }
    });

    const buyTransactions = transactions.filter(t => t.type === 'buy');
    const sellTransactions = transactions.filter(t => t.type === 'sell');

    const avgBuyPrice = buyTransactions.length > 0
      ? buyTransactions.reduce((sum, t) => sum + t.price, 0) / buyTransactions.length
      : 0;

    const avgSellPrice = sellTransactions.length > 0
      ? sellTransactions.reduce((sum, t) => sum + t.price, 0) / sellTransactions.length
      : 0;

    return {
      buyCount: buyTransactions.length,
      sellCount: sellTransactions.length,
      averageBuyPrice: Math.round(avgBuyPrice),
      averageSellPrice: Math.round(avgSellPrice),
    };
  }

  /**
   * Clear price cache (useful for testing or admin commands)
   */
  static clearCache(): void {
    priceCache.clear();
    logger.info('Price cache cleared');
  }

  /**
   * Get cache statistics (for monitoring)
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: priceCache.size,
      keys: Array.from(priceCache.keys()),
    };
  }
}
