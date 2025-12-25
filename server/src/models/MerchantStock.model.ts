/**
 * Merchant Stock Model
 *
 * PHASE 4 FIX: Tracks wandering merchant inventory levels to prevent
 * infinite stock exploit. Stock is tracked per merchant per item and
 * resets on merchant refresh cycles.
 */

import mongoose, { Schema, Document, ClientSession } from 'mongoose';
import logger from '../utils/logger';

/**
 * Interface for Merchant Stock document
 */
export interface IMerchantStock extends Document {
  /** Merchant ID */
  merchantId: string;
  /** Item ID in merchant's inventory */
  itemId: string;
  /** Current stock level */
  currentStock: number;
  /** Initial stock when restocked */
  initialStock: number;
  /** Last restock timestamp */
  lastRestockAt: Date;
  /** Next restock timestamp (for TTL/auto-cleanup) */
  nextRestockAt?: Date;
}

const MerchantStockSchema = new Schema<IMerchantStock>(
  {
    merchantId: {
      type: String,
      required: true,
      index: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
    initialStock: {
      type: Number,
      required: true,
      min: 0,
    },
    lastRestockAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    nextRestockAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - one stock entry per merchant-item pair
MerchantStockSchema.index(
  { merchantId: 1, itemId: 1 },
  { unique: true }
);

/**
 * Get or initialize stock for a merchant item
 * Returns current stock level, initializing if needed
 */
MerchantStockSchema.statics.getStock = async function (
  merchantId: string,
  itemId: string,
  initialStock: number,
  session?: ClientSession
): Promise<number> {
  // Use findOneAndUpdate with upsert to atomically get or create
  const stock = await this.findOneAndUpdate(
    { merchantId, itemId },
    {
      $setOnInsert: {
        merchantId,
        itemId,
        currentStock: initialStock,
        initialStock,
        lastRestockAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      session,
    }
  );

  return stock.currentStock;
};

/**
 * Attempt to purchase items from stock
 * Returns true if successful, false if insufficient stock
 * Uses atomic operations to prevent race conditions
 */
MerchantStockSchema.statics.purchaseStock = async function (
  merchantId: string,
  itemId: string,
  quantity: number,
  initialStock: number,
  session?: ClientSession
): Promise<{ success: boolean; remainingStock: number }> {
  // First, ensure stock record exists
  await this.getStock(merchantId, itemId, initialStock, session);

  // Atomically decrement stock only if sufficient quantity exists
  const result = await this.findOneAndUpdate(
    {
      merchantId,
      itemId,
      currentStock: { $gte: quantity }, // Atomic check: only if enough stock
    },
    {
      $inc: { currentStock: -quantity },
    },
    {
      new: true,
      session,
    }
  );

  if (!result) {
    // Insufficient stock - get current level for error message
    const current = await this.findOne({ merchantId, itemId }).session(session || null);
    return {
      success: false,
      remainingStock: current?.currentStock ?? 0,
    };
  }

  logger.debug(`Merchant stock updated: ${merchantId}/${itemId} - ${quantity} purchased, ${result.currentStock} remaining`);

  return {
    success: true,
    remainingStock: result.currentStock,
  };
};

/**
 * Restock a merchant item to initial level
 */
MerchantStockSchema.statics.restockItem = async function (
  merchantId: string,
  itemId: string,
  newStock?: number,
  session?: ClientSession
): Promise<IMerchantStock | null> {
  const stock = await this.findOne({ merchantId, itemId }).session(session || null);

  if (!stock) {
    return null;
  }

  stock.currentStock = newStock ?? stock.initialStock;
  stock.lastRestockAt = new Date();
  await stock.save({ session });

  logger.info(`Merchant ${merchantId} item ${itemId} restocked to ${stock.currentStock}`);

  return stock;
};

/**
 * Restock all items for a merchant
 */
MerchantStockSchema.statics.restockMerchant = async function (
  merchantId: string,
  session?: ClientSession
): Promise<number> {
  const result = await this.updateMany(
    { merchantId },
    [
      {
        $set: {
          currentStock: '$initialStock',
          lastRestockAt: new Date(),
        },
      },
    ],
    { session }
  );

  logger.info(`Merchant ${merchantId} fully restocked: ${result.modifiedCount} items`);

  return result.modifiedCount;
};

/**
 * Get all stock levels for a merchant
 */
MerchantStockSchema.statics.getMerchantStock = async function (
  merchantId: string
): Promise<Map<string, number>> {
  const stocks = await this.find({ merchantId }).lean();
  const stockMap = new Map<string, number>();

  for (const stock of stocks) {
    stockMap.set(stock.itemId, stock.currentStock);
  }

  return stockMap;
};

// Add static methods to interface
export interface IMerchantStockModel extends mongoose.Model<IMerchantStock> {
  getStock(
    merchantId: string,
    itemId: string,
    initialStock: number,
    session?: ClientSession
  ): Promise<number>;
  purchaseStock(
    merchantId: string,
    itemId: string,
    quantity: number,
    initialStock: number,
    session?: ClientSession
  ): Promise<{ success: boolean; remainingStock: number }>;
  restockItem(
    merchantId: string,
    itemId: string,
    newStock?: number,
    session?: ClientSession
  ): Promise<IMerchantStock | null>;
  restockMerchant(
    merchantId: string,
    session?: ClientSession
  ): Promise<number>;
  getMerchantStock(
    merchantId: string
  ): Promise<Map<string, number>>;
}

export const MerchantStock = mongoose.model<IMerchantStock, IMerchantStockModel>(
  'MerchantStock',
  MerchantStockSchema
);
