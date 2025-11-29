/**
 * NewsSubscription Model
 * Phase 12, Wave 12.1 - Desperados Destiny
 */

import { Schema, model } from 'mongoose';
import { NewsSubscription } from '@desperados/shared';

const newsSubscriptionSchema = new Schema<NewsSubscription>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Character',
      index: true,
    },
    newspaperId: {
      type: String,
      required: true,
      index: true,
    },
    subscriptionType: {
      type: String,
      required: true,
      enum: ['single', 'monthly', 'archive'],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    deliveryMethod: {
      type: String,
      required: true,
      enum: ['mail', 'instant'],
      default: 'mail',
    },
    paid: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
newsSubscriptionSchema.index({ characterId: 1, newspaperId: 1 });
newsSubscriptionSchema.index({ newspaperId: 1, paid: 1 });
newsSubscriptionSchema.index({ endDate: 1, autoRenew: 1 });

// Virtual for active status
newsSubscriptionSchema.virtual('isActive').get(function () {
  if (!this.paid) {
    return false;
  }

  if (this.subscriptionType === 'single') {
    return true; // Single purchases are always "active" once paid
  }

  if (!this.endDate) {
    return true;
  }

  return new Date() <= this.endDate;
});

// Virtual for days remaining
newsSubscriptionSchema.virtual('daysRemaining').get(function () {
  if (!this.endDate || this.subscriptionType === 'single') {
    return null;
  }

  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to check if subscription needs renewal
newsSubscriptionSchema.methods.needsRenewal = function (): boolean {
  if (this.subscriptionType === 'single' || this.subscriptionType === 'archive') {
    return false;
  }

  if (!this.endDate) {
    return false;
  }

  const daysRemaining = this.daysRemaining;
  return daysRemaining !== null && daysRemaining <= 3;
};

// Method to renew subscription
newsSubscriptionSchema.methods.renew = async function (durationDays: number = 30): Promise<void> {
  const currentEnd = this.endDate || new Date();
  const newEnd = new Date(currentEnd);
  newEnd.setDate(newEnd.getDate() + durationDays);

  this.endDate = newEnd;
  this.paid = true;
  await this.save();
};

// Method to cancel subscription
newsSubscriptionSchema.methods.cancel = async function (): Promise<void> {
  this.autoRenew = false;
  await this.save();
};

// Static method to get active subscriptions for character
newsSubscriptionSchema.statics.getActiveForCharacter = function (characterId: string) {
  return this.find({
    characterId,
    paid: true,
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: new Date() } },
      { subscriptionType: 'single' },
    ],
  }).exec();
};

// Static method to get subscriptions needing renewal
newsSubscriptionSchema.statics.getNeedingRenewal = function () {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  return this.find({
    subscriptionType: 'monthly',
    paid: true,
    autoRenew: true,
    endDate: {
      $lte: threeDaysFromNow,
      $gte: new Date(),
    },
  }).exec();
};

// Static method to get expired subscriptions
newsSubscriptionSchema.statics.getExpired = function () {
  return this.find({
    paid: true,
    endDate: {
      $lt: new Date(),
    },
  }).exec();
};

// Static method to get subscribers count for newspaper
newsSubscriptionSchema.statics.getSubscriberCount = async function (
  newspaperId: string
): Promise<number> {
  return this.countDocuments({
    newspaperId,
    paid: true,
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: new Date() } },
    ],
  }).exec();
};

export const NewsSubscriptionModel = model<NewsSubscription>(
  'NewsSubscription',
  newsSubscriptionSchema
);
