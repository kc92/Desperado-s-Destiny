/**
 * Account Unlocks Model
 * Stores permanent unlocks at the user level (not character level)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  EarnedUnlock,
  UnlockCategory
} from '@desperados/shared';

/**
 * Mongoose document interface for AccountUnlocks
 */
export interface IAccountUnlocks extends Document {
  userId: mongoose.Types.ObjectId;
  unlocks: EarnedUnlock[];
  activeEffects: {
    totalCharacterSlots: number;
    cosmetics: {
      portraitFrames: string[];
      nameplateColors: string[];
      titles: string[];
      chatBadges: string[];
      profileBackgrounds: string[];
      deathAnimations: string[];
    };
    gameplay: {
      abilities: string[];
      horseBreeds: string[];
      companionTypes: string[];
      unlockedLocations: string[];
      startingLocations: string[];
    };
    convenience: {
      autoLoot: boolean;
      fastTravelPoints: string[];
      extraInventorySlots: number;
      extraBankVaultSlots: number;
      extraMailAttachmentSlots: number;
    };
    prestige: {
      factionAccess: string[];
      vipAreas: string[];
      npcDialogues: string[];
      hallOfFameEntry: boolean;
    };
  };
  stats: {
    totalUnlocks: number;
    unlocksPerCategory: {
      [UnlockCategory.COSMETIC]: number;
      [UnlockCategory.GAMEPLAY]: number;
      [UnlockCategory.CONVENIENCE]: number;
      [UnlockCategory.PRESTIGE]: number;
    };
    firstUnlockDate?: Date;
    lastUnlockDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  hasUnlock(unlockId: string): boolean;
  getUnclaimedUnlocks(): EarnedUnlock[];
  claimUnlock(unlockId: string): boolean;
}

/**
 * Earned Unlock subdocument schema
 */
const EarnedUnlockSchema = new Schema({
  unlockId: {
    type: String,
    required: true,
    index: true
  },
  earnedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  claimed: {
    type: Boolean,
    default: false
  },
  claimedAt: {
    type: Date
  }
}, { _id: false });

/**
 * Account Unlocks Schema
 */
const AccountUnlocksSchema = new Schema<IAccountUnlocks>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    unlocks: {
      type: [EarnedUnlockSchema],
      default: []
    },

    // Pre-computed active effects for quick access
    activeEffects: {
      totalCharacterSlots: {
        type: Number,
        default: 2 // Base 2 character slots
      },

      cosmetics: {
        portraitFrames: {
          type: [String],
          default: ['default']
        },
        nameplateColors: {
          type: [String],
          default: ['#FFFFFF'] // Default white
        },
        titles: {
          type: [String],
          default: []
        },
        chatBadges: {
          type: [String],
          default: []
        },
        profileBackgrounds: {
          type: [String],
          default: ['default']
        },
        deathAnimations: {
          type: [String],
          default: ['standard_fall']
        }
      },

      gameplay: {
        abilities: {
          type: [String],
          default: []
        },
        horseBreeds: {
          type: [String],
          default: ['standard_horse']
        },
        companionTypes: {
          type: [String],
          default: []
        },
        unlockedLocations: {
          type: [String],
          default: []
        },
        startingLocations: {
          type: [String],
          default: ['dusty_gulch'] // Default starting town
        }
      },

      convenience: {
        autoLoot: {
          type: Boolean,
          default: false
        },
        fastTravelPoints: {
          type: [String],
          default: []
        },
        extraInventorySlots: {
          type: Number,
          default: 0
        },
        extraBankVaultSlots: {
          type: Number,
          default: 0
        },
        extraMailAttachmentSlots: {
          type: Number,
          default: 0
        }
      },

      prestige: {
        factionAccess: {
          type: [String],
          default: []
        },
        vipAreas: {
          type: [String],
          default: []
        },
        npcDialogues: {
          type: [String],
          default: []
        },
        hallOfFameEntry: {
          type: Boolean,
          default: false
        }
      }
    },

    stats: {
      totalUnlocks: {
        type: Number,
        default: 0
      },
      unlocksPerCategory: {
        [UnlockCategory.COSMETIC]: {
          type: Number,
          default: 0
        },
        [UnlockCategory.GAMEPLAY]: {
          type: Number,
          default: 0
        },
        [UnlockCategory.CONVENIENCE]: {
          type: Number,
          default: 0
        },
        [UnlockCategory.PRESTIGE]: {
          type: Number,
          default: 0
        }
      },
      firstUnlockDate: {
        type: Date
      },
      lastUnlockDate: {
        type: Date
      }
    }
  },
  {
    timestamps: true,
    collection: 'account_unlocks'
  }
);

/**
 * Indexes for query optimization
 */
AccountUnlocksSchema.index({ userId: 1 });
AccountUnlocksSchema.index({ 'unlocks.unlockId': 1 });
AccountUnlocksSchema.index({ 'unlocks.earnedAt': -1 });
AccountUnlocksSchema.index({ 'unlocks.claimed': 1 });
AccountUnlocksSchema.index({ 'stats.totalUnlocks': -1 });

/**
 * Check if user has a specific unlock
 */
AccountUnlocksSchema.methods.hasUnlock = function (unlockId: string): boolean {
  return this.unlocks.some(u => u.unlockId === unlockId);
};

/**
 * Get unclaimed unlocks
 */
AccountUnlocksSchema.methods.getUnclaimedUnlocks = function (): EarnedUnlock[] {
  return this.unlocks.filter(u => !u.claimed);
};

/**
 * Mark unlock as claimed
 */
AccountUnlocksSchema.methods.claimUnlock = function (unlockId: string): boolean {
  const unlock = this.unlocks.find(u => u.unlockId === unlockId);
  if (unlock && !unlock.claimed) {
    unlock.claimed = true;
    unlock.claimedAt = new Date();
    return true;
  }
  return false;
};

/**
 * Static method to find or create account unlocks
 */
AccountUnlocksSchema.statics.findOrCreate = async function (
  userId: mongoose.Types.ObjectId
): Promise<IAccountUnlocks> {
  let accountUnlocks = await this.findOne({ userId });

  if (!accountUnlocks) {
    accountUnlocks = await this.create({
      userId,
      unlocks: [],
      activeEffects: {
        totalCharacterSlots: 2,
        cosmetics: {
          portraitFrames: ['default'],
          nameplateColors: ['#FFFFFF'],
          titles: [],
          chatBadges: [],
          profileBackgrounds: ['default'],
          deathAnimations: ['standard_fall']
        },
        gameplay: {
          abilities: [],
          horseBreeds: ['standard_horse'],
          companionTypes: [],
          unlockedLocations: [],
          startingLocations: ['dusty_gulch']
        },
        convenience: {
          autoLoot: false,
          fastTravelPoints: [],
          extraInventorySlots: 0,
          extraBankVaultSlots: 0,
          extraMailAttachmentSlots: 0
        },
        prestige: {
          factionAccess: [],
          vipAreas: [],
          npcDialogues: [],
          hallOfFameEntry: false
        }
      },
      stats: {
        totalUnlocks: 0,
        unlocksPerCategory: {
          [UnlockCategory.COSMETIC]: 0,
          [UnlockCategory.GAMEPLAY]: 0,
          [UnlockCategory.CONVENIENCE]: 0,
          [UnlockCategory.PRESTIGE]: 0
        }
      }
    });
  }

  return accountUnlocks;
};

/**
 * Export the model
 */
export const AccountUnlocks: Model<IAccountUnlocks> = mongoose.model<IAccountUnlocks>(
  'AccountUnlocks',
  AccountUnlocksSchema
);
