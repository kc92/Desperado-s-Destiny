/**
 * Currency Exchange Service
 *
 * Handles dynamic exchange of Gold/Silver resources to/from Dollars.
 * Prices fluctuate based on world events, market activity, and scheduled updates.
 *
 * Base Exchange Rates:
 * - 1 Gold = ~$100 (range: $50-$200, +/- 20% volatility)
 * - 1 Silver = ~$10 (range: $5-$25, +/- 15% volatility)
 */

import mongoose from 'mongoose';
import {
  ResourceExchangeRate,
  PriceHistory,
  IResourceExchangeRate,
  IPriceHistoryEntry,
  PriceEventType,
  ExchangeableResource
} from '../models/ResourceExchangeRate.model';
import {
  GoldTransaction,
  TransactionType,
  TransactionSource,
  CurrencyType
} from '../models/GoldTransaction.model';
import { Character } from '../models/Character.model';
import { CURRENCY_CONSTANTS } from '@desperados/shared';
import logger from '../utils/logger';
import { DollarService } from './dollar.service';
import { ResourceService, ResourceType } from './resource.service';
import { SecureRNG } from './base/SecureRNG';

interface ExchangeRates {
  gold: {
    buyRate: number;   // Price to BUY 1 gold (dollars spent)
    sellRate: number;  // Price to SELL 1 gold (dollars received)
    trend: 'up' | 'down' | 'stable';
    trendStrength: number;
    high24h: number;
    low24h: number;
  };
  silver: {
    buyRate: number;
    sellRate: number;
    trend: 'up' | 'down' | 'stable';
    trendStrength: number;
    high24h: number;
    low24h: number;
  };
  lastUpdated: Date;
  feeRate: number;
}

export class CurrencyExchangeService {
  /**
   * Get current exchange rates for all resources
   */
  static async getExchangeRates(): Promise<ExchangeRates> {
    const goldRate = await ResourceExchangeRate.findOne({
      resourceType: CurrencyType.GOLD_RESOURCE
    });

    const silverRate = await ResourceExchangeRate.findOne({
      resourceType: CurrencyType.SILVER_RESOURCE
    });

    // Use defaults if not initialized
    const goldCurrent = goldRate?.currentRate || CURRENCY_CONSTANTS.GOLD_BASE_RATE;
    const silverCurrent = silverRate?.currentRate || CURRENCY_CONSTANTS.SILVER_BASE_RATE;

    // Apply exchange fee for buy/sell spread
    const feeRate = CURRENCY_CONSTANTS.EXCHANGE_FEE_RATE;

    return {
      gold: {
        buyRate: Math.ceil(goldCurrent * (1 + feeRate)),   // Pay more to buy
        sellRate: Math.floor(goldCurrent * (1 - feeRate)), // Receive less when selling
        trend: goldRate?.trend || 'stable',
        trendStrength: goldRate?.trendStrength || 0,
        high24h: goldRate?.high24h || goldCurrent,
        low24h: goldRate?.low24h || goldCurrent,
      },
      silver: {
        buyRate: Math.ceil(silverCurrent * (1 + feeRate)),
        sellRate: Math.floor(silverCurrent * (1 - feeRate)),
        trend: silverRate?.trend || 'stable',
        trendStrength: silverRate?.trendStrength || 0,
        high24h: silverRate?.high24h || silverCurrent,
        low24h: silverRate?.low24h || silverCurrent,
      },
      lastUpdated: goldRate?.lastUpdated || new Date(),
      feeRate,
    };
  }

  /**
   * Sell resource for dollars
   * Character receives dollars at the current sell rate
   *
   * @param characterId - Character selling resource
   * @param type - Resource type ('gold' or 'silver')
   * @param amount - Amount of resource to sell
   * @returns Transaction result
   */
  static async sellResource(
    characterId: string | mongoose.Types.ObjectId,
    type: ResourceType,
    amount: number
  ): Promise<{
    dollarsReceived: number;
    resourceSold: number;
    rate: number;
    fee: number;
    newDollarBalance: number;
    newResourceBalance: number;
  }> {
    if (amount <= 0) {
      throw new Error('Sell amount must be positive');
    }

    if (amount > CURRENCY_CONSTANTS.MAX_EXCHANGE_AMOUNT) {
      throw new Error(`Maximum exchange amount is ${CURRENCY_CONSTANTS.MAX_EXCHANGE_AMOUNT}`);
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const session = disableTransactions ? null : await mongoose.startSession();

    try {
      if (session) {
        await session.startTransaction();
      }

      // Get current rate
      const currencyType = type === 'gold' ? CurrencyType.GOLD_RESOURCE : CurrencyType.SILVER_RESOURCE;
      const rateDoc = await ResourceExchangeRate.findOne({ resourceType: currencyType });

      const baseRate = rateDoc?.currentRate ||
        (type === 'gold' ? CURRENCY_CONSTANTS.GOLD_BASE_RATE : CURRENCY_CONSTANTS.SILVER_BASE_RATE);

      const feeRate = CURRENCY_CONSTANTS.EXCHANGE_FEE_RATE;
      const sellRate = Math.floor(baseRate * (1 - feeRate));
      const dollarsReceived = amount * sellRate;
      const fee = amount * Math.floor(baseRate * feeRate);

      // Check resource balance
      const hasEnough = await ResourceService.hasEnough(characterId, type, amount);
      if (!hasEnough) {
        throw new Error(`Insufficient ${type} resource`);
      }

      // Deduct resource
      const resourceResult = await ResourceService.deductResource(
        characterId,
        type,
        amount,
        TransactionSource.MARKETPLACE_SALE,
        {
          exchangeType: 'sell',
          exchangeRate: sellRate,
          fee,
        },
        session || undefined
      );

      // Add dollars
      const dollarResult = await DollarService.addDollars(
        characterId,
        dollarsReceived,
        TransactionSource.MARKETPLACE_SALE,
        {
          exchangeType: 'sell',
          resourceType: type,
          resourceAmount: amount,
          exchangeRate: sellRate,
          fee,
        },
        session || undefined
      );

      // Update volume tracking
      if (rateDoc) {
        await ResourceExchangeRate.updateOne(
          { resourceType: currencyType },
          { $inc: { volume24h: amount } },
          { session: session || undefined }
        );
      }

      // Record price history
      await PriceHistory.create([{
        resourceType: currencyType,
        rate: sellRate,
        volume: amount,
        timestamp: new Date(),
      }], session ? { session } : {});

      if (session) await session.commitTransaction();

      logger.info(
        `Resource sold: ${amount} ${type} sold for $${dollarsReceived} at rate $${sellRate}/${type}`
      );

      return {
        dollarsReceived,
        resourceSold: amount,
        rate: sellRate,
        fee,
        newDollarBalance: dollarResult.newBalance,
        newResourceBalance: resourceResult.newBalance,
      };
    } catch (error) {
      if (session) await session.abortTransaction();
      logger.error(`Error selling ${type} resource:`, error);
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Buy resource with dollars
   * Character spends dollars to receive resource at current buy rate
   *
   * @param characterId - Character buying resource
   * @param type - Resource type ('gold' or 'silver')
   * @param amount - Amount of resource to buy
   * @returns Transaction result
   */
  static async buyResource(
    characterId: string | mongoose.Types.ObjectId,
    type: ResourceType,
    amount: number
  ): Promise<{
    dollarsSpent: number;
    resourceBought: number;
    rate: number;
    fee: number;
    newDollarBalance: number;
    newResourceBalance: number;
  }> {
    if (amount <= 0) {
      throw new Error('Buy amount must be positive');
    }

    if (amount > CURRENCY_CONSTANTS.MAX_EXCHANGE_AMOUNT) {
      throw new Error(`Maximum exchange amount is ${CURRENCY_CONSTANTS.MAX_EXCHANGE_AMOUNT}`);
    }

    const disableTransactions = process.env.DISABLE_TRANSACTIONS === 'true';
    const session = disableTransactions ? null : await mongoose.startSession();

    try {
      if (session) {
        await session.startTransaction();
      }

      // Get current rate
      const currencyType = type === 'gold' ? CurrencyType.GOLD_RESOURCE : CurrencyType.SILVER_RESOURCE;
      const rateDoc = await ResourceExchangeRate.findOne({ resourceType: currencyType });

      const baseRate = rateDoc?.currentRate ||
        (type === 'gold' ? CURRENCY_CONSTANTS.GOLD_BASE_RATE : CURRENCY_CONSTANTS.SILVER_BASE_RATE);

      const feeRate = CURRENCY_CONSTANTS.EXCHANGE_FEE_RATE;
      const buyRate = Math.ceil(baseRate * (1 + feeRate));
      const dollarsNeeded = amount * buyRate;
      const fee = amount * Math.ceil(baseRate * feeRate);

      // Check dollar balance
      const canAfford = await DollarService.canAfford(characterId, dollarsNeeded);
      if (!canAfford) {
        throw new Error(`Insufficient dollars. Need $${dollarsNeeded}`);
      }

      // Deduct dollars
      const dollarResult = await DollarService.deductDollars(
        characterId,
        dollarsNeeded,
        TransactionSource.MARKETPLACE_PURCHASE,
        {
          exchangeType: 'buy',
          resourceType: type,
          resourceAmount: amount,
          exchangeRate: buyRate,
          fee,
        },
        session || undefined
      );

      // Add resource
      const resourceResult = await ResourceService.addResource(
        characterId,
        type,
        amount,
        TransactionSource.MARKETPLACE_PURCHASE,
        {
          exchangeType: 'buy',
          exchangeRate: buyRate,
          fee,
        },
        session || undefined
      );

      // Update volume tracking
      if (rateDoc) {
        await ResourceExchangeRate.updateOne(
          { resourceType: currencyType },
          { $inc: { volume24h: amount } },
          { session: session || undefined }
        );
      }

      // Record price history
      await PriceHistory.create([{
        resourceType: currencyType,
        rate: buyRate,
        volume: amount,
        timestamp: new Date(),
      }], session ? { session } : {});

      if (session) await session.commitTransaction();

      logger.info(
        `Resource bought: ${amount} ${type} bought for $${dollarsNeeded} at rate $${buyRate}/${type}`
      );

      return {
        dollarsSpent: dollarsNeeded,
        resourceBought: amount,
        rate: buyRate,
        fee,
        newDollarBalance: dollarResult.newBalance,
        newResourceBalance: resourceResult.newBalance,
      };
    } catch (error) {
      if (session) await session.abortTransaction();
      logger.error(`Error buying ${type} resource:`, error);
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Update prices based on world event
   *
   * @param eventType - Type of price event
   * @param description - Event description
   * @param affectedResource - Optional specific resource, or both if not specified
   */
  static async updatePrices(
    eventType: PriceEventType,
    description: string,
    affectedResource?: ResourceType
  ): Promise<void> {
    const updates: Array<{
      resourceType: ExchangeableResource;
      multiplier: number;
    }> = [];

    // Determine price changes based on event type
    switch (eventType) {
      case PriceEventType.GOLD_RUSH:
        updates.push({
          resourceType: CurrencyType.GOLD_RESOURCE,
          multiplier: 1 + SecureRNG.float(0.15, 0.25, 2) // +15-25%
        });
        break;

      case PriceEventType.SILVER_STRIKE:
        updates.push({
          resourceType: CurrencyType.SILVER_RESOURCE,
          multiplier: 1 + SecureRNG.float(0.10, 0.20, 2) // +10-20%
        });
        break;

      case PriceEventType.MINE_COLLAPSE:
        updates.push(
          { resourceType: CurrencyType.GOLD_RESOURCE, multiplier: 1 + SecureRNG.float(0.05, 0.15, 2) },
          { resourceType: CurrencyType.SILVER_RESOURCE, multiplier: 1 + SecureRNG.float(0.05, 0.15, 2) }
        );
        break;

      case PriceEventType.BANDIT_RAIDS:
        updates.push(
          { resourceType: CurrencyType.GOLD_RESOURCE, multiplier: 1.10 },
          { resourceType: CurrencyType.SILVER_RESOURCE, multiplier: 1.10 }
        );
        break;

      case PriceEventType.MARKET_FLOOD:
        if (affectedResource === 'gold') {
          updates.push({ resourceType: CurrencyType.GOLD_RESOURCE, multiplier: SecureRNG.float(0.80, 0.90, 2) });
        } else if (affectedResource === 'silver') {
          updates.push({ resourceType: CurrencyType.SILVER_RESOURCE, multiplier: SecureRNG.float(0.80, 0.90, 2) });
        } else {
          updates.push(
            { resourceType: CurrencyType.GOLD_RESOURCE, multiplier: 0.85 },
            { resourceType: CurrencyType.SILVER_RESOURCE, multiplier: 0.85 }
          );
        }
        break;

      case PriceEventType.NEW_VEIN_FOUND:
        if (affectedResource === 'gold') {
          updates.push({ resourceType: CurrencyType.GOLD_RESOURCE, multiplier: SecureRNG.float(0.85, 0.95, 2) });
        } else {
          updates.push({ resourceType: CurrencyType.SILVER_RESOURCE, multiplier: SecureRNG.float(0.85, 0.95, 2) });
        }
        break;

      case PriceEventType.ECONOMIC_BOOM:
        updates.push(
          { resourceType: CurrencyType.GOLD_RESOURCE, multiplier: 0.95 },
          { resourceType: CurrencyType.SILVER_RESOURCE, multiplier: 0.95 }
        );
        break;

      case PriceEventType.DAILY_FLUCTUATION:
        const goldFlux = 1 + SecureRNG.float(-0.05, 0.05, 2); // +/- 5%
        const silverFlux = 1 + SecureRNG.float(-0.05, 0.05, 2);
        updates.push(
          { resourceType: CurrencyType.GOLD_RESOURCE, multiplier: goldFlux },
          { resourceType: CurrencyType.SILVER_RESOURCE, multiplier: silverFlux }
        );
        break;

      case PriceEventType.WEEKLY_ADJUSTMENT:
        // Trend back toward base rate
        const goldRate = await ResourceExchangeRate.findOne({ resourceType: CurrencyType.GOLD_RESOURCE });
        const silverRate = await ResourceExchangeRate.findOne({ resourceType: CurrencyType.SILVER_RESOURCE });

        if (goldRate) {
          const goldDiff = CURRENCY_CONSTANTS.GOLD_BASE_RATE - goldRate.currentRate;
          updates.push({
            resourceType: CurrencyType.GOLD_RESOURCE,
            multiplier: 1 + (goldDiff / goldRate.currentRate) * 0.2 // Move 20% toward base
          });
        }
        if (silverRate) {
          const silverDiff = CURRENCY_CONSTANTS.SILVER_BASE_RATE - silverRate.currentRate;
          updates.push({
            resourceType: CurrencyType.SILVER_RESOURCE,
            multiplier: 1 + (silverDiff / silverRate.currentRate) * 0.2
          });
        }
        break;

      default:
        break;
    }

    // Apply updates
    for (const update of updates) {
      await this.applyPriceChange(update.resourceType, update.multiplier, eventType, description);
    }
  }

  /**
   * Apply a price change to a resource
   */
  private static async applyPriceChange(
    resourceType: ExchangeableResource,
    multiplier: number,
    eventType: PriceEventType,
    description: string
  ): Promise<void> {
    const isGold = resourceType === CurrencyType.GOLD_RESOURCE;
    const minRate = isGold ? CURRENCY_CONSTANTS.GOLD_MIN_RATE : CURRENCY_CONSTANTS.SILVER_MIN_RATE;
    const maxRate = isGold ? CURRENCY_CONSTANTS.GOLD_MAX_RATE : CURRENCY_CONSTANTS.SILVER_MAX_RATE;
    const baseRate = isGold ? CURRENCY_CONSTANTS.GOLD_BASE_RATE : CURRENCY_CONSTANTS.SILVER_BASE_RATE;

    // Get or create rate document
    let rateDoc = await ResourceExchangeRate.findOne({ resourceType });

    if (!rateDoc) {
      rateDoc = await ResourceExchangeRate.create({
        resourceType,
        currentRate: baseRate,
        baseRate,
        minRate,
        maxRate,
        volatility: isGold ? CURRENCY_CONSTANTS.GOLD_VOLATILITY : CURRENCY_CONSTANTS.SILVER_VOLATILITY,
        high24h: baseRate,
        low24h: baseRate,
        volume24h: 0,
        trend: 'stable',
        trendStrength: 0
      });
    }

    const oldRate = rateDoc.currentRate;
    let newRate = Math.round(oldRate * multiplier);

    // Clamp to min/max
    newRate = Math.max(minRate, Math.min(maxRate, newRate));

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendStrength = 0;

    if (newRate > oldRate) {
      trend = 'up';
      trendStrength = Math.min(100, Math.round(((newRate - oldRate) / oldRate) * 1000));
    } else if (newRate < oldRate) {
      trend = 'down';
      trendStrength = Math.min(100, Math.round(((oldRate - newRate) / oldRate) * 1000));
    }

    // Update the rate
    await ResourceExchangeRate.updateOne(
      { resourceType },
      {
        $set: {
          currentRate: newRate,
          lastUpdated: new Date(),
          lastEventType: eventType,
          lastEventDescription: description,
          trend,
          trendStrength,
          high24h: Math.max(rateDoc.high24h, newRate),
          low24h: Math.min(rateDoc.low24h, newRate),
        }
      }
    );

    // Record in price history
    await PriceHistory.create({
      resourceType,
      rate: newRate,
      volume: 0,
      eventType,
      timestamp: new Date(),
    });

    logger.info(
      `Exchange rate updated: ${isGold ? 'Gold' : 'Silver'} ${oldRate} -> ${newRate} ` +
      `(${eventType}: ${description})`
    );
  }

  /**
   * Get price history for charting
   *
   * @param type - Resource type
   * @param days - Number of days of history
   * @returns Array of price history entries
   */
  static async getPriceHistory(
    type: ResourceType,
    days: number = 7
  ): Promise<IPriceHistoryEntry[]> {
    const currencyType = type === 'gold' ? CurrencyType.GOLD_RESOURCE : CurrencyType.SILVER_RESOURCE;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return PriceHistory.find({
      resourceType: currencyType,
      timestamp: { $gte: cutoff }
    })
      .sort({ timestamp: 1 })
      .lean() as unknown as Promise<IPriceHistoryEntry[]>;
  }

  /**
   * Reset 24h statistics (called by scheduled job)
   */
  static async reset24hStats(): Promise<void> {
    const resources = [CurrencyType.GOLD_RESOURCE, CurrencyType.SILVER_RESOURCE];

    for (const resourceType of resources) {
      const doc = await ResourceExchangeRate.findOne({ resourceType });
      if (doc) {
        await ResourceExchangeRate.updateOne(
          { resourceType },
          {
            $set: {
              high24h: doc.currentRate,
              low24h: doc.currentRate,
              volume24h: 0,
            }
          }
        );
      }
    }

    logger.info('24h exchange stats reset');
  }

  /**
   * Initialize default exchange rates if they don't exist
   */
  static async initializeRates(): Promise<void> {
    const goldExists = await ResourceExchangeRate.findOne({
      resourceType: CurrencyType.GOLD_RESOURCE
    });

    if (!goldExists) {
      await ResourceExchangeRate.create({
        resourceType: CurrencyType.GOLD_RESOURCE,
        currentRate: CURRENCY_CONSTANTS.GOLD_BASE_RATE,
        baseRate: CURRENCY_CONSTANTS.GOLD_BASE_RATE,
        minRate: CURRENCY_CONSTANTS.GOLD_MIN_RATE,
        maxRate: CURRENCY_CONSTANTS.GOLD_MAX_RATE,
        volatility: CURRENCY_CONSTANTS.GOLD_VOLATILITY,
        high24h: CURRENCY_CONSTANTS.GOLD_BASE_RATE,
        low24h: CURRENCY_CONSTANTS.GOLD_BASE_RATE,
        volume24h: 0,
        trend: 'stable',
        trendStrength: 0
      });
      logger.info('Initialized Gold exchange rate');
    }

    const silverExists = await ResourceExchangeRate.findOne({
      resourceType: CurrencyType.SILVER_RESOURCE
    });

    if (!silverExists) {
      await ResourceExchangeRate.create({
        resourceType: CurrencyType.SILVER_RESOURCE,
        currentRate: CURRENCY_CONSTANTS.SILVER_BASE_RATE,
        baseRate: CURRENCY_CONSTANTS.SILVER_BASE_RATE,
        minRate: CURRENCY_CONSTANTS.SILVER_MIN_RATE,
        maxRate: CURRENCY_CONSTANTS.SILVER_MAX_RATE,
        volatility: CURRENCY_CONSTANTS.SILVER_VOLATILITY,
        high24h: CURRENCY_CONSTANTS.SILVER_BASE_RATE,
        low24h: CURRENCY_CONSTANTS.SILVER_BASE_RATE,
        volume24h: 0,
        trend: 'stable',
        trendStrength: 0
      });
      logger.info('Initialized Silver exchange rate');
    }
  }
}
