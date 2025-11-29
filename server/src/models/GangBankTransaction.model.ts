/**
 * Gang Bank Transaction Model
 *
 * Mongoose schema for tracking all gang bank movements
 * Provides complete audit trail for gang finances
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { GangBankTransactionType, GangUpgradeType } from '@desperados/shared';

/**
 * Gang Bank Transaction document interface
 */
export interface IGangBankTransaction extends Document {
  gangId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  type: GangBankTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: {
    upgradeType?: GangUpgradeType;
    upgradeLevel?: number;
    warId?: string;
    description?: string;
  };
  timestamp: Date;
}

/**
 * Gang Bank Transaction schema definition
 */
const GangBankTransactionSchema = new Schema<IGangBankTransaction>({
  gangId: {
    type: Schema.Types.ObjectId,
    ref: 'Gang',
    required: true,
    index: true,
  },
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(GangBankTransactionType),
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceBefore: {
    type: Number,
    required: true,
    min: 0,
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

/**
 * Indexes for efficient querying
 */
GangBankTransactionSchema.index({ gangId: 1, timestamp: -1 });
GangBankTransactionSchema.index({ characterId: 1, timestamp: -1 });
GangBankTransactionSchema.index({ type: 1, timestamp: -1 });

/**
 * Gang Bank Transaction model
 */
export const GangBankTransaction: Model<IGangBankTransaction> =
  mongoose.model<IGangBankTransaction>('GangBankTransaction', GangBankTransactionSchema);
