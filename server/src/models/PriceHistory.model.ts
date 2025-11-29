/**
 * Price History Model
 *
 * Mongoose schema for tracking marketplace price history and statistics
 * Used for price suggestions and market analytics
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Individual sale record
 */
export interface SaleRecord {
  price: number;
  quantity: number;
  date: Date;
  listingId?: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  buyerId?: mongoose.Types.ObjectId;
}

/**
 * Aggregated price statistics
 */
export interface PriceStats {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  totalVolume: number;
  totalSales: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
}

/**
 * Daily price snapshot
 */
export interface DailySnapshot {
  date: Date;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  salesCount: number;
}

/**
 * Price History document interface
 */
export interface IPriceHistory extends Document {
  // Item identification
  itemId: string;
  itemName: string;
  category: string;
  subcategory?: string;
  rarity: string;

  // Recent sales (rolling window, last 100 sales)
  sales: SaleRecord[];

  // Aggregated statistics
  stats: PriceStats;

  // Daily snapshots for charting (last 30 days)
  dailySnapshots: DailySnapshot[];

  // Market activity metrics
  activeListings: number;
  averageListingDuration: number; // in hours

  // Timestamps
  lastSaleAt?: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Price History model static methods
 */
export interface IPriceHistoryModel extends Model<IPriceHistory> {
  findOrCreateByItemId(itemId: string, itemName: string, category: string, rarity?: string): Promise<IPriceHistory>;
  recordSale(itemId: string, price: number, quantity: number, listingId?: string, sellerId?: string, buyerId?: string): Promise<IPriceHistory>;
  updateStats(itemId: string): Promise<IPriceHistory | null>;
  getTopItems(category?: string, limit?: number): Promise<IPriceHistory[]>;
  getTrendingItems(limit?: number): Promise<IPriceHistory[]>;
}

/**
 * Price History schema definition
 */
const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    // Item identification
    itemId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    itemName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    subcategory: {
      type: String,
      index: true
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common'
    },

    // Recent sales (capped array for efficiency)
    sales: [{
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      date: {
        type: Date,
        required: true,
        default: Date.now
      },
      listingId: {
        type: Schema.Types.ObjectId,
        ref: 'MarketListing'
      },
      sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'Character'
      },
      buyerId: {
        type: Schema.Types.ObjectId,
        ref: 'Character'
      }
    }],

    // Aggregated statistics
    stats: {
      averagePrice: {
        type: Number,
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      },
      maxPrice: {
        type: Number,
        default: 0
      },
      medianPrice: {
        type: Number,
        default: 0
      },
      totalVolume: {
        type: Number,
        default: 0
      },
      totalSales: {
        type: Number,
        default: 0
      },
      priceChange24h: {
        type: Number,
        default: 0
      },
      priceChange7d: {
        type: Number,
        default: 0
      },
      priceChange30d: {
        type: Number,
        default: 0
      }
    },

    // Daily snapshots for charting
    dailySnapshots: [{
      date: {
        type: Date,
        required: true
      },
      openPrice: {
        type: Number,
        required: true
      },
      closePrice: {
        type: Number,
        required: true
      },
      highPrice: {
        type: Number,
        required: true
      },
      lowPrice: {
        type: Number,
        required: true
      },
      volume: {
        type: Number,
        default: 0
      },
      salesCount: {
        type: Number,
        default: 0
      }
    }],

    // Market activity metrics
    activeListings: {
      type: Number,
      default: 0
    },
    averageListingDuration: {
      type: Number,
      default: 0
    },

    // Timestamps
    lastSaleAt: {
      type: Date
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
PriceHistorySchema.index({ category: 1, 'stats.totalVolume': -1 });
PriceHistorySchema.index({ category: 1, 'stats.totalSales': -1 });
PriceHistorySchema.index({ 'stats.priceChange24h': -1 });
PriceHistorySchema.index({ lastSaleAt: -1 });

/**
 * Static: Find or create price history for an item
 */
PriceHistorySchema.statics.findOrCreateByItemId = async function(
  itemId: string,
  itemName: string,
  category: string,
  rarity: string = 'common'
): Promise<IPriceHistory> {
  let priceHistory = await this.findOne({ itemId });

  if (!priceHistory) {
    priceHistory = await this.create({
      itemId,
      itemName,
      category,
      rarity,
      sales: [],
      stats: {
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        medianPrice: 0,
        totalVolume: 0,
        totalSales: 0,
        priceChange24h: 0,
        priceChange7d: 0,
        priceChange30d: 0
      },
      dailySnapshots: [],
      activeListings: 0,
      averageListingDuration: 0,
      lastUpdated: new Date()
    });
  }

  return priceHistory;
};

/**
 * Static: Record a sale and update statistics
 */
PriceHistorySchema.statics.recordSale = async function(
  itemId: string,
  price: number,
  quantity: number,
  listingId?: string,
  sellerId?: string,
  buyerId?: string
): Promise<IPriceHistory> {
  const priceHistory = await this.findOne({ itemId });
  if (!priceHistory) {
    throw new Error(`Price history not found for item: ${itemId}`);
  }

  // Add sale record
  const saleRecord: SaleRecord = {
    price,
    quantity,
    date: new Date(),
    listingId: listingId ? new mongoose.Types.ObjectId(listingId) : undefined,
    sellerId: sellerId ? new mongoose.Types.ObjectId(sellerId) : undefined,
    buyerId: buyerId ? new mongoose.Types.ObjectId(buyerId) : undefined
  };

  priceHistory.sales.push(saleRecord);

  // Keep only last 100 sales
  if (priceHistory.sales.length > 100) {
    priceHistory.sales = priceHistory.sales.slice(-100);
  }

  priceHistory.lastSaleAt = new Date();
  priceHistory.lastUpdated = new Date();

  // Update statistics
  await priceHistory.save();
  // Call updateStats using self-reference
  return (this as IPriceHistoryModel).updateStats(itemId);
};

/**
 * Static: Update aggregated statistics for an item
 */
PriceHistorySchema.statics.updateStats = async function(
  itemId: string
): Promise<IPriceHistory | null> {
  const priceHistory = await this.findOne({ itemId });
  if (!priceHistory || priceHistory.sales.length === 0) {
    return priceHistory;
  }

  const sales = priceHistory.sales;
  const now = new Date();
  const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const day7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const day30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Calculate basic stats
  const prices = sales.map(s => s.price);
  const sortedPrices = [...prices].sort((a, b) => a - b);

  priceHistory.stats.averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  priceHistory.stats.minPrice = Math.min(...prices);
  priceHistory.stats.maxPrice = Math.max(...prices);
  priceHistory.stats.medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
  priceHistory.stats.totalVolume = sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  priceHistory.stats.totalSales = sales.length;

  // Calculate price changes
  const sales24h = sales.filter(s => s.date >= day24h);
  const salesBefore24h = sales.filter(s => s.date < day24h);
  const sales7d = sales.filter(s => s.date >= day7d);
  const salesBefore7d = sales.filter(s => s.date < day7d);
  const sales30d = sales.filter(s => s.date >= day30d);
  const salesBefore30d = sales.filter(s => s.date < day30d);

  // 24h price change
  if (sales24h.length > 0 && salesBefore24h.length > 0) {
    const avgRecent = sales24h.reduce((sum, s) => sum + s.price, 0) / sales24h.length;
    const avgOld = salesBefore24h.reduce((sum, s) => sum + s.price, 0) / salesBefore24h.length;
    priceHistory.stats.priceChange24h = ((avgRecent - avgOld) / avgOld) * 100;
  } else {
    priceHistory.stats.priceChange24h = 0;
  }

  // 7d price change
  if (sales7d.length > 0 && salesBefore7d.length > 0) {
    const avgRecent = sales7d.reduce((sum, s) => sum + s.price, 0) / sales7d.length;
    const avgOld = salesBefore7d.reduce((sum, s) => sum + s.price, 0) / salesBefore7d.length;
    priceHistory.stats.priceChange7d = ((avgRecent - avgOld) / avgOld) * 100;
  } else {
    priceHistory.stats.priceChange7d = 0;
  }

  // 30d price change
  if (sales30d.length > 0 && salesBefore30d.length > 0) {
    const avgRecent = sales30d.reduce((sum, s) => sum + s.price, 0) / sales30d.length;
    const avgOld = salesBefore30d.reduce((sum, s) => sum + s.price, 0) / salesBefore30d.length;
    priceHistory.stats.priceChange30d = ((avgRecent - avgOld) / avgOld) * 100;
  } else {
    priceHistory.stats.priceChange30d = 0;
  }

  // Update daily snapshot
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.date);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === today.getTime();
  });

  if (todaySales.length > 0) {
    const todayPrices = todaySales.map(s => s.price);
    const existingSnapshot = priceHistory.dailySnapshots.find(s => {
      const snapshotDate = new Date(s.date);
      snapshotDate.setHours(0, 0, 0, 0);
      return snapshotDate.getTime() === today.getTime();
    });

    if (existingSnapshot) {
      existingSnapshot.closePrice = todayPrices[todayPrices.length - 1];
      existingSnapshot.highPrice = Math.max(existingSnapshot.highPrice, ...todayPrices);
      existingSnapshot.lowPrice = Math.min(existingSnapshot.lowPrice, ...todayPrices);
      existingSnapshot.volume += todaySales.reduce((sum, s) => sum + s.price * s.quantity, 0);
      existingSnapshot.salesCount += todaySales.length;
    } else {
      priceHistory.dailySnapshots.push({
        date: today,
        openPrice: todayPrices[0],
        closePrice: todayPrices[todayPrices.length - 1],
        highPrice: Math.max(...todayPrices),
        lowPrice: Math.min(...todayPrices),
        volume: todaySales.reduce((sum, s) => sum + s.price * s.quantity, 0),
        salesCount: todaySales.length
      });

      // Keep only last 30 days of snapshots
      if (priceHistory.dailySnapshots.length > 30) {
        priceHistory.dailySnapshots = priceHistory.dailySnapshots.slice(-30);
      }
    }
  }

  priceHistory.lastUpdated = new Date();
  await priceHistory.save();

  return priceHistory;
};

/**
 * Static: Get top items by volume
 */
PriceHistorySchema.statics.getTopItems = async function(
  category?: string,
  limit: number = 10
): Promise<IPriceHistory[]> {
  const query: any = {};
  if (category) {
    query.category = category;
  }

  return this.find(query)
    .sort({ 'stats.totalVolume': -1 })
    .limit(limit);
};

/**
 * Static: Get trending items (highest price increase in 24h)
 */
PriceHistorySchema.statics.getTrendingItems = async function(
  limit: number = 10
): Promise<IPriceHistory[]> {
  return this.find({
    'stats.totalSales': { $gte: 5 } // At least 5 sales for significance
  })
    .sort({ 'stats.priceChange24h': -1 })
    .limit(limit);
};

/**
 * Price History model
 */
export const PriceHistory = mongoose.model<IPriceHistory, IPriceHistoryModel>(
  'PriceHistory',
  PriceHistorySchema
);
