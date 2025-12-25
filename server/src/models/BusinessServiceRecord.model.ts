/**
 * Business Service Record Model
 *
 * Mongoose schema for tracking all business transactions
 * Phase 12: Business Ownership System
 *
 * Records all services rendered and products sold for:
 * - Revenue tracking
 * - Analytics and reporting
 * - P2P transaction history
 * - Customer satisfaction tracking
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { IBusinessServiceRecord } from '@desperados/shared';

/**
 * Business Service Record document interface
 * Note: businessId and customerId are ObjectId in mongoose but serialize to string in JSON
 */
export interface IBusinessServiceRecordDoc extends Document, Omit<IBusinessServiceRecord, '_id' | 'businessId' | 'customerId'> {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
}

/**
 * Business Service Record static methods interface
 */
export interface IBusinessServiceRecordModel extends Model<IBusinessServiceRecordDoc> {
  findByBusiness(businessId: string, limit?: number): Promise<IBusinessServiceRecordDoc[]>;
  findByCustomer(customerId: string, limit?: number): Promise<IBusinessServiceRecordDoc[]>;
  getRevenueForPeriod(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ total: number; count: number }>;
  getTopServices(
    businessId: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<Array<{ serviceId: string; name: string; revenue: number; count: number }>>;
  getAverageSatisfaction(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number>;
}

/**
 * Business Service Record schema definition
 */
const BusinessServiceRecordSchema = new Schema<IBusinessServiceRecordDoc>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    serviceId: {
      type: String,
      index: true,
    },
    productId: {
      type: String,
      index: true,
    },

    // Transaction type
    transactionType: {
      type: String,
      enum: ['service', 'product_sale', 'p2p_service'],
      required: true,
      index: true,
    },

    // Customer info
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    isNPC: {
      type: Boolean,
      required: true,
      index: true,
    },

    // Transaction details
    serviceName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    workerIds: {
      type: [String],
      default: [],
    },

    // Satisfaction
    satisfaction: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    tipAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Timing
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // Minutes
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
BusinessServiceRecordSchema.index({ businessId: 1, createdAt: -1 });
BusinessServiceRecordSchema.index({ businessId: 1, transactionType: 1, createdAt: -1 });
BusinessServiceRecordSchema.index({ customerId: 1, createdAt: -1 });
BusinessServiceRecordSchema.index({ businessId: 1, serviceId: 1, createdAt: -1 });
BusinessServiceRecordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90-day TTL

/**
 * Static method: Find records for a business
 */
BusinessServiceRecordSchema.statics.findByBusiness = async function (
  businessId: string,
  limit: number = 100
): Promise<IBusinessServiceRecordDoc[]> {
  return this.find({
    businessId: new mongoose.Types.ObjectId(businessId),
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method: Find records for a customer
 */
BusinessServiceRecordSchema.statics.findByCustomer = async function (
  customerId: string,
  limit: number = 100
): Promise<IBusinessServiceRecordDoc[]> {
  return this.find({
    customerId: new mongoose.Types.ObjectId(customerId),
    isNPC: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method: Get revenue for a period
 */
BusinessServiceRecordSchema.statics.getRevenueForPeriod = async function (
  businessId: string,
  startDate: Date,
  endDate: Date
): Promise<{ total: number; count: number }> {
  const result = await this.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $add: ['$totalPrice', '$tipAmount'] } },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { total: 0, count: 0 };
};

/**
 * Static method: Get top services by revenue
 */
BusinessServiceRecordSchema.statics.getTopServices = async function (
  businessId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<Array<{ serviceId: string; name: string; revenue: number; count: number }>> {
  const result = await this.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: startDate, $lte: endDate },
        serviceId: { $exists: true },
      },
    },
    {
      $group: {
        _id: '$serviceId',
        name: { $first: '$serviceName' },
        revenue: { $sum: { $add: ['$totalPrice', '$tipAmount'] } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { revenue: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        serviceId: '$_id',
        name: 1,
        revenue: 1,
        count: 1,
        _id: 0,
      },
    },
  ]);

  return result;
};

/**
 * Static method: Get average satisfaction for a period
 */
BusinessServiceRecordSchema.statics.getAverageSatisfaction = async function (
  businessId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const result = await this.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        avgSatisfaction: { $avg: '$satisfaction' },
      },
    },
  ]);

  return result[0]?.avgSatisfaction ?? 50;
};

/**
 * Business Service Record model
 */
export const BusinessServiceRecord = mongoose.model<
  IBusinessServiceRecordDoc,
  IBusinessServiceRecordModel
>('BusinessServiceRecord', BusinessServiceRecordSchema);
