/**
 * Achievement Model
 * Tracks player achievements and badges
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  characterId: mongoose.Types.ObjectId;
  achievementType: string;
  title: string;
  description: string;
  category: 'combat' | 'crime' | 'social' | 'economy' | 'exploration' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
  reward: {
    gold?: number;
    experience?: number;
    item?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    achievementType: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['combat', 'crime', 'social', 'economy', 'exploration', 'special'],
      required: true
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'legendary'],
      default: 'bronze'
    },
    progress: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    reward: {
      gold: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      item: { type: String }
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
AchievementSchema.index({ characterId: 1, achievementType: 1 }, { unique: true });
AchievementSchema.index({ characterId: 1, completed: 1 });
AchievementSchema.index({ characterId: 1, category: 1 });

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

// Achievement definitions for initialization
export const ACHIEVEMENT_DEFINITIONS = [
  // Combat achievements
  {
    type: 'first_blood',
    title: 'First Blood',
    description: 'Win your first combat',
    category: 'combat',
    tier: 'bronze',
    target: 1,
    reward: { gold: 100, experience: 50 }
  },
  {
    type: 'gunslinger_10',
    title: 'Gunslinger',
    description: 'Win 10 combats',
    category: 'combat',
    tier: 'bronze',
    target: 10,
    reward: { gold: 500, experience: 200 }
  },
  {
    type: 'gunslinger_50',
    title: 'Veteran Gunslinger',
    description: 'Win 50 combats',
    category: 'combat',
    tier: 'silver',
    target: 50,
    reward: { gold: 2500, experience: 1000 }
  },
  {
    type: 'gunslinger_100',
    title: 'Legendary Gunslinger',
    description: 'Win 100 combats',
    category: 'combat',
    tier: 'gold',
    target: 100,
    reward: { gold: 10000, experience: 5000 }
  },

  // Crime achievements
  {
    type: 'petty_thief',
    title: 'Petty Thief',
    description: 'Complete your first crime',
    category: 'crime',
    tier: 'bronze',
    target: 1,
    reward: { gold: 100, experience: 50 }
  },
  {
    type: 'criminal_10',
    title: 'Criminal',
    description: 'Complete 10 crimes',
    category: 'crime',
    tier: 'bronze',
    target: 10,
    reward: { gold: 500, experience: 200 }
  },
  {
    type: 'criminal_50',
    title: 'Notorious Criminal',
    description: 'Complete 50 crimes',
    category: 'crime',
    tier: 'silver',
    target: 50,
    reward: { gold: 2500, experience: 1000 }
  },
  {
    type: 'criminal_100',
    title: 'Master Criminal',
    description: 'Complete 100 crimes',
    category: 'crime',
    tier: 'gold',
    target: 100,
    reward: { gold: 10000, experience: 5000 }
  },

  // Social achievements
  {
    type: 'first_friend',
    title: 'Making Friends',
    description: 'Add your first friend',
    category: 'social',
    tier: 'bronze',
    target: 1,
    reward: { gold: 50, experience: 25 }
  },
  {
    type: 'social_5',
    title: 'Social Butterfly',
    description: 'Have 5 friends',
    category: 'social',
    tier: 'bronze',
    target: 5,
    reward: { gold: 250, experience: 100 }
  },
  {
    type: 'gang_member',
    title: 'Gang Member',
    description: 'Join a gang',
    category: 'social',
    tier: 'bronze',
    target: 1,
    reward: { gold: 500, experience: 250 }
  },
  {
    type: 'gang_leader',
    title: 'Gang Leader',
    description: 'Create your own gang',
    category: 'social',
    tier: 'silver',
    target: 1,
    reward: { gold: 2500, experience: 1000 }
  },

  // Economy achievements
  {
    type: 'first_gold',
    title: 'First Gold',
    description: 'Earn 1,000 gold total',
    category: 'economy',
    tier: 'bronze',
    target: 1000,
    reward: { experience: 100 }
  },
  {
    type: 'wealthy',
    title: 'Wealthy',
    description: 'Earn 10,000 gold total',
    category: 'economy',
    tier: 'bronze',
    target: 10000,
    reward: { experience: 500 }
  },
  {
    type: 'rich',
    title: 'Rich',
    description: 'Earn 100,000 gold total',
    category: 'economy',
    tier: 'silver',
    target: 100000,
    reward: { experience: 2500 }
  },
  {
    type: 'tycoon',
    title: 'Tycoon',
    description: 'Earn 1,000,000 gold total',
    category: 'economy',
    tier: 'gold',
    target: 1000000,
    reward: { experience: 10000 }
  },

  // Exploration achievements
  {
    type: 'explorer',
    title: 'Explorer',
    description: 'Visit all territories',
    category: 'exploration',
    tier: 'silver',
    target: 12,
    reward: { gold: 1000, experience: 500 }
  },
  {
    type: 'action_hero',
    title: 'Action Hero',
    description: 'Complete 100 actions',
    category: 'exploration',
    tier: 'silver',
    target: 100,
    reward: { gold: 2500, experience: 1000 }
  },

  // Special achievements
  {
    type: 'royal_flush',
    title: 'Royal Flush',
    description: 'Draw a Royal Flush in the Destiny Deck',
    category: 'special',
    tier: 'legendary',
    target: 1,
    reward: { gold: 50000, experience: 10000 }
  },
  {
    type: 'survivor',
    title: 'Survivor',
    description: 'Survive 10 near-death experiences',
    category: 'special',
    tier: 'gold',
    target: 10,
    reward: { gold: 5000, experience: 2500 }
  }
];

export default Achievement;
