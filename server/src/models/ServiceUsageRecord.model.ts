/**
 * Service Usage Record Model
 *
 * Tracks individual service usage instances by characters.
 * Replaces in-memory Map storage in wanderingNpc.service.ts
 */

import mongoose, { Schema, Document } from 'mongoose';
import { ServiceEffectType } from '@desperados/shared';

// Re-export for convenience
export { ServiceEffectType };

/**
 * Interface for Service Usage Record document
 */
export interface IServiceUsageRecord extends Document {
  /** Character ID who used the service */
  characterId: mongoose.Types.ObjectId;
  /** Service provider NPC ID */
  providerId: string;
  /** Service ID that was used */
  serviceId: string;
  /** Timestamp when service was used */
  usedAt: Date;
  /** Gold cost paid for the service */
  goldPaid: number;
  /** Barter items given (if applicable) */
  barterItems?: Array<{
    itemId: string;
    quantity: number;
  }>;
  /** Effects applied from the service */
  effectsApplied: Array<{
    type: ServiceEffectType;
    value: number;
    duration?: number; // in seconds
    expiresAt?: Date;
  }>;
  /** Cooldown expiration for this service (if applicable) */
  cooldownExpiresAt?: Date;
  /** Was this an emergency service */
  isEmergency: boolean;
  /** Location where service was used */
  locationId?: string;
}

const ServiceUsageRecordSchema = new Schema<IServiceUsageRecord>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    serviceId: {
      type: String,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    goldPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    barterItems: [
      {
        itemId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    effectsApplied: [
      {
        type: {
          type: String,
          enum: Object.values(ServiceEffectType),
          required: true,
        },
        value: { type: Number, required: true },
        duration: { type: Number },
        expiresAt: { type: Date },
      },
    ],
    cooldownExpiresAt: {
      type: Date,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    locationId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding recent usage by character and service (cooldown check)
ServiceUsageRecordSchema.index({ characterId: 1, serviceId: 1, usedAt: -1 });

// Index for finding all usage by character
ServiceUsageRecordSchema.index({ characterId: 1, usedAt: -1 });

// Index for cooldown queries
ServiceUsageRecordSchema.index({ characterId: 1, serviceId: 1, cooldownExpiresAt: 1 });

// Index for finding active effects (effects that haven't expired)
ServiceUsageRecordSchema.index({ 'effectsApplied.expiresAt': 1 });

/**
 * Static method to check if a service is on cooldown
 */
ServiceUsageRecordSchema.statics.isOnCooldown = async function (
  characterId: string | mongoose.Types.ObjectId,
  serviceId: string
): Promise<{ onCooldown: boolean; expiresAt?: Date }> {
  const record = await this.findOne({
    characterId,
    serviceId,
    cooldownExpiresAt: { $gt: new Date() },
  }).sort({ cooldownExpiresAt: -1 });

  if (record && record.cooldownExpiresAt) {
    return {
      onCooldown: true,
      expiresAt: record.cooldownExpiresAt,
    };
  }

  return { onCooldown: false };
};

/**
 * Static method to record a service usage
 */
ServiceUsageRecordSchema.statics.recordUsage = async function (
  characterId: string | mongoose.Types.ObjectId,
  providerId: string,
  serviceId: string,
  options: {
    goldPaid?: number;
    barterItems?: Array<{ itemId: string; quantity: number }>;
    effectsApplied?: Array<{
      type: ServiceEffectType;
      value: number;
      duration?: number;
    }>;
    cooldownSeconds?: number;
    isEmergency?: boolean;
    locationId?: string;
  } = {}
): Promise<IServiceUsageRecord> {
  const now = new Date();

  // Calculate effect expiration dates
  const effectsWithExpiry = (options.effectsApplied || []).map((effect) => ({
    ...effect,
    expiresAt: effect.duration
      ? new Date(now.getTime() + effect.duration * 1000)
      : undefined,
  }));

  const record = await this.create({
    characterId,
    providerId,
    serviceId,
    usedAt: now,
    goldPaid: options.goldPaid || 0,
    barterItems: options.barterItems,
    effectsApplied: effectsWithExpiry,
    cooldownExpiresAt: options.cooldownSeconds
      ? new Date(now.getTime() + options.cooldownSeconds * 1000)
      : undefined,
    isEmergency: options.isEmergency || false,
    locationId: options.locationId,
  });

  return record;
};

/**
 * Static method to get active effects for a character
 */
ServiceUsageRecordSchema.statics.getActiveEffects = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<
  Array<{
    serviceId: string;
    providerId: string;
    effect: {
      type: ServiceEffectType;
      value: number;
      expiresAt: Date;
    };
  }>
> {
  const now = new Date();

  const records = await this.find({
    characterId,
    'effectsApplied.expiresAt': { $gt: now },
  });

  const activeEffects: Array<{
    serviceId: string;
    providerId: string;
    effect: { type: ServiceEffectType; value: number; expiresAt: Date };
  }> = [];

  for (const record of records) {
    for (const effect of record.effectsApplied) {
      if (effect.expiresAt && effect.expiresAt > now) {
        activeEffects.push({
          serviceId: record.serviceId,
          providerId: record.providerId,
          effect: {
            type: effect.type as ServiceEffectType,
            value: effect.value,
            expiresAt: effect.expiresAt,
          },
        });
      }
    }
  }

  return activeEffects;
};

/**
 * Static method to get last usage of a service
 */
ServiceUsageRecordSchema.statics.getLastUsage = async function (
  characterId: string | mongoose.Types.ObjectId,
  serviceId: string
): Promise<IServiceUsageRecord | null> {
  return this.findOne({ characterId, serviceId }).sort({ usedAt: -1 });
};

// Add static methods to interface
export interface IServiceUsageRecordModel extends mongoose.Model<IServiceUsageRecord> {
  isOnCooldown(
    characterId: string | mongoose.Types.ObjectId,
    serviceId: string
  ): Promise<{ onCooldown: boolean; expiresAt?: Date }>;
  recordUsage(
    characterId: string | mongoose.Types.ObjectId,
    providerId: string,
    serviceId: string,
    options?: {
      goldPaid?: number;
      barterItems?: Array<{ itemId: string; quantity: number }>;
      effectsApplied?: Array<{
        type: ServiceEffectType;
        value: number;
        duration?: number;
      }>;
      cooldownSeconds?: number;
      isEmergency?: boolean;
      locationId?: string;
    }
  ): Promise<IServiceUsageRecord>;
  getActiveEffects(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<
    Array<{
      serviceId: string;
      providerId: string;
      effect: { type: ServiceEffectType; value: number; expiresAt: Date };
    }>
  >;
  getLastUsage(
    characterId: string | mongoose.Types.ObjectId,
    serviceId: string
  ): Promise<IServiceUsageRecord | null>;
}

export const ServiceUsageRecord = mongoose.model<
  IServiceUsageRecord,
  IServiceUsageRecordModel
>('ServiceUsageRecord', ServiceUsageRecordSchema);
