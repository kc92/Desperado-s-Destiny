/**
 * Hunting Trip Model - Phase 10, Wave 10.1
 *
 * Tracks hunting trips and their progress
 */

import mongoose, { Schema, Document } from 'mongoose';
import type {
  AnimalSpecies,
  HuntingWeapon,
  TrackFreshness,
  TrackDirection,
  TrackDistance,
  ShotPlacement,
  KillQuality,
  HarvestResourceType
} from '@desperados/shared';

/**
 * Hunting Trip document interface
 */
export interface IHuntingTrip extends Document {
  /** Character ID */
  characterId: mongoose.Types.ObjectId;
  /** Hunting ground location */
  huntingGroundId: string;

  /** Trip timestamps */
  startedAt: Date;
  completedAt?: Date;

  /** Trip status */
  status: 'tracking' | 'stalking' | 'aiming' | 'shooting' | 'harvesting' | 'complete' | 'failed';

  /** Tracking progress (0-100%) */
  trackingProgress?: number;

  /** Top-level shot placement for quick access */
  shotPlacement?: ShotPlacement;

  /** Target animal */
  targetAnimal?: AnimalSpecies;

  /** Tracking phase data */
  trackingResult?: {
    success: boolean;
    message: string;
    animalType?: AnimalSpecies;
    freshness?: TrackFreshness;
    direction?: TrackDirection;
    distance?: TrackDistance;
    difficulty?: number;
    trackingBonus?: number;
    companionBonus?: number;
  };

  /** Stalking phase data */
  stalkingResult?: {
    success: boolean;
    message: string;
    animalInRange?: boolean;
    windFavorable?: boolean;
    noiseLevel?: number;
    detectionChance?: number;
    stealthBonus?: number;
    spooked?: boolean;
    canShoot?: boolean;
    shotDistance?: number;
  };

  /** Shooting phase data */
  shotResult?: {
    success: boolean;
    message: string;
    hit: boolean;
    placement?: ShotPlacement;
    damage?: number;
    killed?: boolean;
    wounded?: boolean;
    marksmanshipBonus?: number;
    weaponBonus?: number;
    fled?: boolean;
    attacking?: boolean;
  };

  /** Harvest phase data */
  harvestResult?: {
    success: boolean;
    message: string;
    quality: KillQuality;
    qualityMultiplier: number;
    resources: Array<{
      type: HarvestResourceType;
      itemId: string;
      name: string;
      quantity: number;
      quality: KillQuality;
      value: number;
    }>;
    totalValue: number;
    skinningBonus?: number;
    xpGained: number;
  };

  /** Resources used */
  energySpent: number;
  goldEarned: number;
  xpEarned: number;

  /** Equipment used */
  weaponUsed?: HuntingWeapon;
  companionId?: mongoose.Types.ObjectId;

  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hunting Trip schema
 */
const HuntingTripSchema = new Schema<IHuntingTrip>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    huntingGroundId: {
      type: String,
      required: true,
      index: true
    },

    startedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    completedAt: {
      type: Date
    },

    status: {
      type: String,
      enum: ['tracking', 'stalking', 'aiming', 'shooting', 'harvesting', 'complete', 'failed'],
      default: 'tracking',
      required: true,
      index: true
    },

    trackingProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    shotPlacement: {
      type: String,
      enum: ['HEAD', 'HEART', 'LUNGS', 'BODY', 'MISS']
    },

    targetAnimal: {
      type: String,
      enum: [
        'RABBIT', 'PRAIRIE_DOG', 'SQUIRREL', 'RACCOON', 'SKUNK', 'OPOSSUM',
        'TURKEY', 'PHEASANT', 'DUCK', 'GOOSE', 'COYOTE', 'FOX', 'BADGER',
        'WHITE_TAILED_DEER', 'MULE_DEER', 'PRONGHORN', 'WILD_BOAR', 'JAVELINA',
        'BIGHORN_SHEEP', 'ELK', 'BLACK_BEAR', 'GRIZZLY_BEAR', 'MOUNTAIN_LION',
        'WOLF', 'BISON', 'EAGLE', 'RATTLESNAKE', 'ARMADILLO', 'PORCUPINE'
      ]
    },

    trackingResult: {
      type: {
        success: Boolean,
        message: String,
        animalType: String,
        freshness: {
          type: String,
          enum: ['FRESH', 'RECENT', 'OLD', 'COLD']
        },
        direction: {
          type: String,
          enum: ['NORTH', 'NORTHEAST', 'EAST', 'SOUTHEAST', 'SOUTH', 'SOUTHWEST', 'WEST', 'NORTHWEST']
        },
        distance: {
          type: String,
          enum: ['NEAR', 'MEDIUM', 'FAR']
        },
        difficulty: Number,
        trackingBonus: Number,
        companionBonus: Number
      },
      _id: false
    },

    stalkingResult: {
      type: {
        success: Boolean,
        message: String,
        animalInRange: Boolean,
        windFavorable: Boolean,
        noiseLevel: Number,
        detectionChance: Number,
        stealthBonus: Number,
        spooked: Boolean,
        canShoot: Boolean,
        shotDistance: Number
      },
      _id: false
    },

    shotResult: {
      type: {
        success: Boolean,
        message: String,
        hit: Boolean,
        placement: {
          type: String,
          enum: ['HEAD', 'HEART', 'LUNGS', 'BODY', 'MISS']
        },
        damage: Number,
        killed: Boolean,
        wounded: Boolean,
        marksmanshipBonus: Number,
        weaponBonus: Number,
        fled: Boolean,
        attacking: Boolean
      },
      _id: false
    },

    harvestResult: {
      type: {
        success: Boolean,
        message: String,
        quality: {
          type: String,
          enum: ['PERFECT', 'EXCELLENT', 'GOOD', 'COMMON', 'POOR'],
          required: true
        },
        qualityMultiplier: Number,
        resources: [{
          type: {
            type: String,
            enum: ['MEAT', 'HIDE', 'FUR', 'PELT', 'BONE', 'ANTLER', 'HORN', 'FEATHER', 'CLAW', 'TOOTH', 'TROPHY']
          },
          itemId: String,
          name: String,
          quantity: Number,
          quality: {
            type: String,
            enum: ['PERFECT', 'EXCELLENT', 'GOOD', 'COMMON', 'POOR']
          },
          value: Number
        }],
        totalValue: Number,
        skinningBonus: Number,
        xpGained: Number
      },
      _id: false
    },

    energySpent: {
      type: Number,
      default: 0,
      min: 0
    },
    goldEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0
    },

    weaponUsed: {
      type: String,
      enum: ['HUNTING_RIFLE', 'VARMINT_RIFLE', 'BOW', 'SHOTGUN', 'PISTOL']
    },
    companionId: {
      type: Schema.Types.ObjectId,
      ref: 'AnimalCompanion'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
HuntingTripSchema.index({ characterId: 1, status: 1 });
HuntingTripSchema.index({ characterId: 1, createdAt: -1 });
HuntingTripSchema.index({ huntingGroundId: 1 });
HuntingTripSchema.index({ targetAnimal: 1 });
HuntingTripSchema.index({ completedAt: 1 });

// Virtual for id
HuntingTripSchema.virtual('id').get(function () {
  return this._id?.toString();
});

// Ensure virtuals are included in JSON
HuntingTripSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const HuntingTrip = mongoose.model<IHuntingTrip>('HuntingTrip', HuntingTripSchema);
export default HuntingTrip;
