/**
 * Market State Model
 * Phase R2: Economy Foundation
 *
 * Tracks global economy state, price indexes, and market health indicators.
 * Updated hourly by the economyTick job.
 */

import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  MarketSentiment,
  LiquidityLevel,
  EconomyItemCategory,
  CategoryMetric,
} from '@desperados/shared';

/**
 * Market State document interface
 */
export interface IMarketState extends Document {
  // Singleton identifier (always 'global')
  stateId: string;

  // Last update timestamp
  lastUpdated: Date;

  // Global indicators
  globalPriceIndex: number; // 100 = baseline
  volatilityIndex: number; // 0-100
  liquidityLevel: LiquidityLevel;
  marketSentiment: MarketSentiment;

  // Supply/Demand ratio
  globalSupplyDemandRatio: number;

  // Active economic events (references)
  activeEconomicEvents: mongoose.Types.ObjectId[];

  // Category-level metrics
  categoryMetrics: Map<string, CategoryMetric>;

  // Historical snapshots (last 24 hourly snapshots)
  hourlySnapshots: {
    timestamp: Date;
    globalPriceIndex: number;
    volatilityIndex: number;
    sentiment: MarketSentiment;
  }[];

  // Economy health alerts
  alerts: {
    type: 'inflation' | 'deflation' | 'volatility' | 'liquidity' | 'exploit';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: Date;
    acknowledged: boolean;
  }[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Market State model static methods
 */
export interface IMarketStateModel extends Model<IMarketState> {
  getGlobalState(): Promise<IMarketState>;
  updateGlobalPriceIndex(newIndex: number): Promise<IMarketState>;
  addAlert(
    type: 'inflation' | 'deflation' | 'volatility' | 'liquidity' | 'exploit',
    severity: 'low' | 'medium' | 'high',
    message: string
  ): Promise<IMarketState>;
  recordHourlySnapshot(): Promise<IMarketState>;
}

/**
 * Category Metric subdocument schema
 */
const CategoryMetricSchema = new Schema<CategoryMetric>(
  {
    category: {
      type: String,
      required: true,
      enum: Object.values(EconomyItemCategory),
    },
    priceIndex: { type: Number, default: 100 },
    volume24h: { type: Number, default: 0 },
    transactionCount: { type: Number, default: 0 },
    averagePrice: { type: Number, default: 0 },
    trend: {
      type: String,
      enum: ['rising', 'stable', 'falling'],
      default: 'stable',
    },
  },
  { _id: false }
);

/**
 * Hourly snapshot subdocument schema
 */
const HourlySnapshotSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    globalPriceIndex: { type: Number, required: true },
    volatilityIndex: { type: Number, required: true },
    sentiment: {
      type: String,
      enum: Object.values(MarketSentiment),
      required: true,
    },
  },
  { _id: false }
);

/**
 * Alert subdocument schema
 */
const AlertSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['inflation', 'deflation', 'volatility', 'liquidity', 'exploit'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
    },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Market State schema
 */
const MarketStateSchema = new Schema<IMarketState>(
  {
    // Singleton identifier
    stateId: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },

    // Last update timestamp
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    // Global indicators
    globalPriceIndex: {
      type: Number,
      default: 100,
      min: 0,
      max: 500,
    },
    volatilityIndex: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    liquidityLevel: {
      type: String,
      enum: Object.values(LiquidityLevel),
      default: LiquidityLevel.MEDIUM,
    },
    marketSentiment: {
      type: String,
      enum: Object.values(MarketSentiment),
      default: MarketSentiment.NEUTRAL,
    },

    // Supply/Demand
    globalSupplyDemandRatio: {
      type: Number,
      default: 1.0,
      min: 0.1,
      max: 10,
    },

    // Active economic events
    activeEconomicEvents: [{
      type: Schema.Types.ObjectId,
      ref: 'EconomicEvent',
    }],

    // Category metrics (stored as Map)
    categoryMetrics: {
      type: Map,
      of: CategoryMetricSchema,
      default: () => new Map(),
    },

    // Hourly snapshots (rolling window of 24)
    hourlySnapshots: {
      type: [HourlySnapshotSchema],
      default: [],
    },

    // Alerts
    alerts: {
      type: [AlertSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MarketStateSchema.index({ stateId: 1 }, { unique: true });
MarketStateSchema.index({ lastUpdated: -1 });

/**
 * Static: Get global market state (create if doesn't exist)
 */
MarketStateSchema.statics.getGlobalState = async function (): Promise<IMarketState> {
  let state = await this.findOne({ stateId: 'global' });

  if (!state) {
    // Initialize with default category metrics
    const categoryMetrics = new Map<string, CategoryMetric>();
    for (const category of Object.values(EconomyItemCategory)) {
      if (category !== EconomyItemCategory.ALL) {
        categoryMetrics.set(category, {
          category,
          priceIndex: 100,
          volume24h: 0,
          transactionCount: 0,
          averagePrice: 0,
          trend: 'stable',
        });
      }
    }

    state = await this.create({
      stateId: 'global',
      categoryMetrics,
    });
  }

  return state;
};

/**
 * Static: Update global price index
 */
MarketStateSchema.statics.updateGlobalPriceIndex = async function (
  newIndex: number
): Promise<IMarketState> {
  const state = await (this as IMarketStateModel).getGlobalState();

  // Calculate trend
  const oldIndex = state.globalPriceIndex;
  const change = newIndex - oldIndex;
  const changePercent = (change / oldIndex) * 100;

  // Update sentiment based on change
  if (changePercent > 5) {
    state.marketSentiment = MarketSentiment.BULLISH;
  } else if (changePercent < -5) {
    state.marketSentiment = MarketSentiment.BEARISH;
  } else {
    state.marketSentiment = MarketSentiment.NEUTRAL;
  }

  // Update volatility based on absolute change
  const absChange = Math.abs(changePercent);
  state.volatilityIndex = Math.min(100, state.volatilityIndex * 0.9 + absChange * 10);

  state.globalPriceIndex = newIndex;
  state.lastUpdated = new Date();

  await state.save();
  return state;
};

/**
 * Static: Add an alert
 */
MarketStateSchema.statics.addAlert = async function (
  type: 'inflation' | 'deflation' | 'volatility' | 'liquidity' | 'exploit',
  severity: 'low' | 'medium' | 'high',
  message: string
): Promise<IMarketState> {
  const state = await (this as IMarketStateModel).getGlobalState();

  state.alerts.push({
    type,
    severity,
    message,
    timestamp: new Date(),
    acknowledged: false,
  });

  // Keep only last 100 alerts
  if (state.alerts.length > 100) {
    state.alerts = state.alerts.slice(-100);
  }

  await state.save();
  return state;
};

/**
 * Static: Record hourly snapshot
 */
MarketStateSchema.statics.recordHourlySnapshot = async function (): Promise<IMarketState> {
  const state = await (this as IMarketStateModel).getGlobalState();

  state.hourlySnapshots.push({
    timestamp: new Date(),
    globalPriceIndex: state.globalPriceIndex,
    volatilityIndex: state.volatilityIndex,
    sentiment: state.marketSentiment,
  });

  // Keep only last 24 snapshots
  if (state.hourlySnapshots.length > 24) {
    state.hourlySnapshots = state.hourlySnapshots.slice(-24);
  }

  await state.save();
  return state;
};

// Virtual for id
MarketStateSchema.virtual('id').get(function () {
  return this._id?.toString();
});

// Ensure virtuals are included
MarketStateSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const MarketState = mongoose.model<IMarketState, IMarketStateModel>(
  'MarketState',
  MarketStateSchema
);

export default MarketState;
