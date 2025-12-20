/**
 * Resource Exchange Rate Model
 *
 * Tracks dynamic pricing for Gold and Silver resources.
 * Prices fluctuate based on world events, market activity, and scheduled updates.
 *
 * Base rates:
 * - Gold: ~$100 per unit (+/- 20% volatility)
 * - Silver: ~$10 per unit (+/- 15% volatility)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { CurrencyType } from './GoldTransaction.model';

/**
 * Resource types that can be exchanged
 */
export type ExchangeableResource = CurrencyType.GOLD_RESOURCE | CurrencyType.SILVER_RESOURCE;

/**
 * Event types that can affect exchange rates
 */
export enum PriceEventType {
  // Positive events (increase price)
  GOLD_RUSH = 'GOLD_RUSH',              // +15-25% gold price
  SILVER_STRIKE = 'SILVER_STRIKE',       // +10-20% silver price
  MINE_COLLAPSE = 'MINE_COLLAPSE',       // +5-15% both (scarcity)
  BANDIT_RAIDS = 'BANDIT_RAIDS',         // +10% both (transport risk)
  HIGH_DEMAND = 'HIGH_DEMAND',           // +5-10% affected resource

  // Negative events (decrease price)
  MARKET_FLOOD = 'MARKET_FLOOD',         // -10-20% affected resource
  NEW_VEIN_FOUND = 'NEW_VEIN_FOUND',     // -5-15% affected resource
  ECONOMIC_BOOM = 'ECONOMIC_BOOM',       // -5% both (dollars worth more)

  // Neutral/periodic
  DAILY_FLUCTUATION = 'DAILY_FLUCTUATION', // +/- 2-5% random
  WEEKLY_ADJUSTMENT = 'WEEKLY_ADJUSTMENT', // Market correction toward base
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT', // Admin override
}

/**
 * Exchange rate document interface
 */
export interface IResourceExchangeRate extends Document {
  resourceType: ExchangeableResource;
  currentRate: number;           // Current dollars per unit
  baseRate: number;              // Base rate for this resource
  minRate: number;               // Floor rate (prevents crashes)
  maxRate: number;               // Ceiling rate (prevents bubbles)
  volatility: number;            // Max % change per event (0.0-1.0)
  lastUpdated: Date;
  lastEventType?: PriceEventType;
  lastEventDescription?: string;
  // 24-hour rolling stats
  high24h: number;
  low24h: number;
  volume24h: number;             // Units traded in last 24h
  // Trend indicator
  trend: 'up' | 'down' | 'stable';
  trendStrength: number;         // 0-100 strength of trend
}

/**
 * Price history entry for charting
 */
export interface IPriceHistoryEntry extends Document {
  resourceType: ExchangeableResource;
  rate: number;
  volume: number;                // Units traded at this price
  eventType?: PriceEventType;
  timestamp: Date;
}

/**
 * Resource Exchange Rate schema
 */
const ResourceExchangeRateSchema = new Schema<IResourceExchangeRate>({
  resourceType: {
    type: String,
    enum: [CurrencyType.GOLD_RESOURCE, CurrencyType.SILVER_RESOURCE],
    required: true,
    unique: true,
    index: true
  },
  currentRate: {
    type: Number,
    required: true,
    min: 1
  },
  baseRate: {
    type: Number,
    required: true,
    min: 1
  },
  minRate: {
    type: Number,
    required: true,
    min: 1
  },
  maxRate: {
    type: Number,
    required: true,
    min: 1
  },
  volatility: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.20
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastEventType: {
    type: String,
    enum: Object.values(PriceEventType)
  },
  lastEventDescription: {
    type: String,
    maxlength: 500
  },
  high24h: {
    type: Number,
    required: true,
    min: 0
  },
  low24h: {
    type: Number,
    required: true,
    min: 0
  },
  volume24h: {
    type: Number,
    default: 0,
    min: 0
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  trendStrength: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

/**
 * Price History schema for tracking historical rates
 */
const PriceHistorySchema = new Schema<IPriceHistoryEntry>({
  resourceType: {
    type: String,
    enum: [CurrencyType.GOLD_RESOURCE, CurrencyType.SILVER_RESOURCE],
    required: true,
    index: true
  },
  rate: {
    type: Number,
    required: true,
    min: 1
  },
  volume: {
    type: Number,
    default: 0,
    min: 0
  },
  eventType: {
    type: String,
    enum: Object.values(PriceEventType)
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient history queries
PriceHistorySchema.index({ resourceType: 1, timestamp: -1 });

// TTL index to auto-delete history older than 90 days
PriceHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

/**
 * Static method to get or initialize exchange rate for a resource
 */
ResourceExchangeRateSchema.statics.getOrCreateRate = async function(
  resourceType: ExchangeableResource
): Promise<IResourceExchangeRate> {
  let rate = await this.findOne({ resourceType });

  if (!rate) {
    // Initialize default rates
    const defaults = {
      [CurrencyType.GOLD_RESOURCE]: {
        baseRate: 100,
        minRate: 50,
        maxRate: 200,
        volatility: 0.20
      },
      [CurrencyType.SILVER_RESOURCE]: {
        baseRate: 10,
        minRate: 5,
        maxRate: 25,
        volatility: 0.15
      }
    };

    const config = defaults[resourceType];
    rate = await this.create({
      resourceType,
      currentRate: config.baseRate,
      baseRate: config.baseRate,
      minRate: config.minRate,
      maxRate: config.maxRate,
      volatility: config.volatility,
      high24h: config.baseRate,
      low24h: config.baseRate,
      volume24h: 0,
      trend: 'stable',
      trendStrength: 0
    });
  }

  return rate;
};

/**
 * Resource Exchange Rate model
 */
export const ResourceExchangeRate: Model<IResourceExchangeRate> = mongoose.model<IResourceExchangeRate>(
  'ResourceExchangeRate',
  ResourceExchangeRateSchema
);

/**
 * Price History model
 */
export const PriceHistory: Model<IPriceHistoryEntry> = mongoose.model<IPriceHistoryEntry>(
  'PriceHistory',
  PriceHistorySchema
);
