/**
 * Mount Model
 * Handles mounts and wagons that increase character carry capacity
 */

import mongoose, { Schema, Document } from 'mongoose';

export type MountType = 'horse' | 'mule' | 'wagon' | 'cart';

export interface IMount extends Document {
  name: string;
  type: MountType;
  description: string;
  carryCapacity: number;
  speedModifier: number;
  cost: number;
  requiredLevel: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MountSchema = new Schema<IMount>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['horse', 'mule', 'wagon', 'cart'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    carryCapacity: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Additional weight capacity granted by this mount',
    },
    speedModifier: {
      type: Number,
      required: true,
      default: 1.0,
      comment: 'Travel speed multiplier (1.0 = normal, 1.2 = 20% faster)',
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Purchase cost in gold',
    },
    requiredLevel: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      comment: 'Whether this mount can be purchased',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MountSchema.index({ type: 1 });
MountSchema.index({ isAvailable: 1, requiredLevel: 1 });

export const Mount = mongoose.model<IMount>('Mount', MountSchema);

// Seed data for common mounts
export const MOUNT_SEED_DATA = [
  {
    name: 'Brown Mare',
    type: 'horse',
    description: 'A reliable horse for carrying your gear across the frontier.',
    carryCapacity: 300,
    speedModifier: 1.1,
    cost: 500,
    requiredLevel: 5,
    isAvailable: true,
  },
  {
    name: 'Pack Mule',
    type: 'mule',
    description: 'Slow but sturdy. Can carry heavy loads without complaint.',
    carryCapacity: 400,
    speedModifier: 0.9,
    cost: 350,
    requiredLevel: 3,
    isAvailable: true,
  },
  {
    name: 'Supply Wagon',
    type: 'wagon',
    description: 'A large wagon for serious hauling. Requires two horses to pull.',
    carryCapacity: 1000,
    speedModifier: 0.7,
    cost: 2000,
    requiredLevel: 15,
    isAvailable: true,
  },
  {
    name: 'Hand Cart',
    type: 'cart',
    description: 'A simple cart you can pull yourself. Better than nothing.',
    carryCapacity: 150,
    speedModifier: 0.95,
    cost: 100,
    requiredLevel: 1,
    isAvailable: true,
  },
];
