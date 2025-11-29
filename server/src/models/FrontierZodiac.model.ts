/**
 * Frontier Zodiac Model
 * Tracks character zodiac progress, constellation completion, and birth signs
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Types } from 'mongoose';

/**
 * Constellation progress subdocument
 */
export interface IConstellationProgress {
  fragmentsEarned: number;
  completed: boolean;
  completedAt?: Date;
  rewardClaimed: boolean;
}

/**
 * Peak day attendance record
 */
export interface IPeakDayAttendance {
  signId: string;
  date: Date;
  bonusApplied: boolean;
}

/**
 * Character Zodiac interface
 */
export interface ICharacterZodiac {
  characterId: Types.ObjectId;
  birthSign: string;
  birthSignSetAt: Date;
  constellations: Map<string, IConstellationProgress>;
  totalFragments: number;
  isStarWalker: boolean; // Completed all 12 constellations
  starWalkerAt?: Date;
  peakDaysAttended: IPeakDayAttendance[];
  lastFragmentEarnedAt?: Date;
  // Statistics
  stats: {
    totalBonusesApplied: number;
    totalPeakDayBonuses: number;
    constellationsCompleted: number;
    favoriteActivity?: string;
  };
}

/**
 * Instance methods interface
 */
interface ICharacterZodiacMethods {
  addFragments(signId: string, amount: number, fragmentsRequired: number): boolean;
  hasCompletedConstellation(signId: string): boolean;
  canClaimReward(signId: string): boolean;
  claimReward(signId: string): boolean;
  attendPeakDay(signId: string): boolean;
  hasAttendedPeakDay(signId: string, date: Date): boolean;
  getProgress(signId: string): IConstellationProgress | null;
  checkStarWalker(): boolean;
}

/**
 * Static methods interface
 */
interface ICharacterZodiacModel extends Model<ICharacterZodiacDocument, object, ICharacterZodiacMethods> {
  findByCharacterId(characterId: string | Types.ObjectId): Promise<ICharacterZodiacDocument | null>;
  findOrCreate(characterId: string | Types.ObjectId): Promise<ICharacterZodiacDocument>;
  getLeaderboard(metric: 'totalFragments' | 'constellationsCompleted', limit?: number): Promise<ICharacterZodiacDocument[]>;
  getStarWalkers(): Promise<ICharacterZodiacDocument[]>;
  getByBirthSign(signId: string, limit?: number): Promise<ICharacterZodiacDocument[]>;
}

/**
 * Document interface
 */
export interface ICharacterZodiacDocument extends ICharacterZodiac, Document, ICharacterZodiacMethods {}

/**
 * Constellation progress schema
 */
const constellationProgressSchema = new Schema<IConstellationProgress>(
  {
    fragmentsEarned: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    rewardClaimed: { type: Boolean, default: false }
  },
  { _id: false }
);

/**
 * Peak day attendance schema
 */
const peakDayAttendanceSchema = new Schema<IPeakDayAttendance>(
  {
    signId: { type: String, required: true },
    date: { type: Date, required: true },
    bonusApplied: { type: Boolean, default: true }
  },
  { _id: false }
);

/**
 * Character Zodiac schema
 */
const characterZodiacSchema = new Schema<ICharacterZodiacDocument, ICharacterZodiacModel>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true
    },
    birthSign: {
      type: String,
      default: '',
      index: true
    },
    birthSignSetAt: {
      type: Date
    },
    constellations: {
      type: Map,
      of: constellationProgressSchema,
      default: new Map()
    },
    totalFragments: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    isStarWalker: {
      type: Boolean,
      default: false,
      index: true
    },
    starWalkerAt: {
      type: Date
    },
    peakDaysAttended: {
      type: [peakDayAttendanceSchema],
      default: []
    },
    lastFragmentEarnedAt: {
      type: Date
    },
    stats: {
      totalBonusesApplied: { type: Number, default: 0 },
      totalPeakDayBonuses: { type: Number, default: 0 },
      constellationsCompleted: { type: Number, default: 0 },
      favoriteActivity: { type: String }
    }
  },
  {
    timestamps: true,
    collection: 'characterZodiacs'
  }
);

// Indexes for efficient queries
characterZodiacSchema.index({ characterId: 1, birthSign: 1 });
characterZodiacSchema.index({ totalFragments: -1 });
characterZodiacSchema.index({ 'stats.constellationsCompleted': -1 });
characterZodiacSchema.index({ isStarWalker: 1, starWalkerAt: -1 });

/**
 * Instance method: Add star fragments to a constellation
 */
characterZodiacSchema.methods.addFragments = function (
  signId: string,
  amount: number,
  fragmentsRequired: number
): boolean {
  if (amount <= 0) return false;

  let progress = this.constellations.get(signId);

  if (!progress) {
    progress = {
      fragmentsEarned: 0,
      completed: false,
      rewardClaimed: false
    };
  }

  // Don't add fragments to already completed constellations
  if (progress.completed) return false;

  progress.fragmentsEarned += amount;
  this.totalFragments += amount;
  this.lastFragmentEarnedAt = new Date();

  // Check for completion
  if (progress.fragmentsEarned >= fragmentsRequired) {
    progress.completed = true;
    progress.completedAt = new Date();
    this.stats.constellationsCompleted += 1;
  }

  this.constellations.set(signId, progress);
  this.markModified('constellations');

  return true;
};

/**
 * Instance method: Check if a constellation is completed
 */
characterZodiacSchema.methods.hasCompletedConstellation = function (signId: string): boolean {
  const progress = this.constellations.get(signId);
  return progress?.completed ?? false;
};

/**
 * Instance method: Check if reward can be claimed
 */
characterZodiacSchema.methods.canClaimReward = function (signId: string): boolean {
  const progress = this.constellations.get(signId);
  return progress?.completed === true && progress?.rewardClaimed === false;
};

/**
 * Instance method: Claim constellation reward
 */
characterZodiacSchema.methods.claimReward = function (signId: string): boolean {
  const progress = this.constellations.get(signId);

  if (!progress || !progress.completed || progress.rewardClaimed) {
    return false;
  }

  progress.rewardClaimed = true;
  this.constellations.set(signId, progress);
  this.markModified('constellations');

  return true;
};

/**
 * Instance method: Record peak day attendance
 */
characterZodiacSchema.methods.attendPeakDay = function (signId: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already attended today
  const alreadyAttended = this.peakDaysAttended.some(
    (attendance: IPeakDayAttendance) =>
      attendance.signId === signId &&
      attendance.date.toDateString() === today.toDateString()
  );

  if (alreadyAttended) return false;

  this.peakDaysAttended.push({
    signId,
    date: today,
    bonusApplied: true
  });

  this.stats.totalPeakDayBonuses += 1;
  this.markModified('peakDaysAttended');

  return true;
};

/**
 * Instance method: Check if peak day was attended
 */
characterZodiacSchema.methods.hasAttendedPeakDay = function (signId: string, date: Date): boolean {
  return this.peakDaysAttended.some(
    (attendance: IPeakDayAttendance) =>
      attendance.signId === signId &&
      attendance.date.toDateString() === date.toDateString()
  );
};

/**
 * Instance method: Get constellation progress
 */
characterZodiacSchema.methods.getProgress = function (signId: string): IConstellationProgress | null {
  return this.constellations.get(signId) || null;
};

/**
 * Instance method: Check and update Star Walker status
 */
characterZodiacSchema.methods.checkStarWalker = function (): boolean {
  if (this.isStarWalker) return true;

  // All 12 signs must be completed
  const signIds = [
    'prospector', 'coyote', 'stallion', 'rattlesnake',
    'eagle', 'longhorn', 'gunslinger', 'cactus_flower',
    'vulture', 'tumbleweed', 'wolf', 'north_star'
  ];

  const allCompleted = signIds.every(signId => {
    const progress = this.constellations.get(signId);
    return progress?.completed === true;
  });

  if (allCompleted) {
    this.isStarWalker = true;
    this.starWalkerAt = new Date();
    return true;
  }

  return false;
};

/**
 * Static method: Find by character ID
 */
characterZodiacSchema.statics.findByCharacterId = function (
  characterId: string | Types.ObjectId
): Promise<ICharacterZodiacDocument | null> {
  return this.findOne({ characterId });
};

/**
 * Static method: Find or create zodiac record for character
 */
characterZodiacSchema.statics.findOrCreate = async function (
  characterId: string | Types.ObjectId
): Promise<ICharacterZodiacDocument> {
  let zodiac = await this.findOne({ characterId });

  if (!zodiac) {
    zodiac = await this.create({
      characterId,
      constellations: new Map(),
      totalFragments: 0,
      isStarWalker: false,
      peakDaysAttended: [],
      stats: {
        totalBonusesApplied: 0,
        totalPeakDayBonuses: 0,
        constellationsCompleted: 0
      }
    });
  }

  return zodiac;
};

/**
 * Static method: Get leaderboard
 */
characterZodiacSchema.statics.getLeaderboard = function (
  metric: 'totalFragments' | 'constellationsCompleted',
  limit: number = 100
): Promise<ICharacterZodiacDocument[]> {
  const sortField = metric === 'totalFragments' ? { totalFragments: -1 } : { 'stats.constellationsCompleted': -1 };

  return this.find({ birthSign: { $ne: '' } })
    .sort(sortField as any)
    .limit(limit)
    .populate('characterId', 'name level')
    .exec();
};

/**
 * Static method: Get all Star Walkers
 */
characterZodiacSchema.statics.getStarWalkers = function (): Promise<ICharacterZodiacDocument[]> {
  return this.find({ isStarWalker: true })
    .sort({ starWalkerAt: -1 })
    .populate('characterId', 'name level')
    .exec();
};

/**
 * Static method: Get characters by birth sign
 */
characterZodiacSchema.statics.getByBirthSign = function (
  signId: string,
  limit: number = 50
): Promise<ICharacterZodiacDocument[]> {
  return this.find({ birthSign: signId })
    .sort({ totalFragments: -1 })
    .limit(limit)
    .populate('characterId', 'name level')
    .exec();
};

// Pre-save hook to update stats
characterZodiacSchema.pre('save', function (next) {
  // Recalculate constellations completed if needed
  if (this.isModified('constellations')) {
    let completed = 0;
    this.constellations.forEach((progress) => {
      if (progress.completed) completed++;
    });
    this.stats.constellationsCompleted = completed;
  }
  next();
});

// Virtual for completion percentage
characterZodiacSchema.virtual('completionPercentage').get(function () {
  return Math.round((this.stats.constellationsCompleted / 12) * 100);
});

// Ensure virtuals are included when converting to JSON
characterZodiacSchema.set('toJSON', { virtuals: true });
characterZodiacSchema.set('toObject', { virtuals: true });

export const CharacterZodiac = mongoose.model<ICharacterZodiacDocument, ICharacterZodiacModel>(
  'CharacterZodiac',
  characterZodiacSchema
);

export default CharacterZodiac;
