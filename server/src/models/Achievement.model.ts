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
  category: 'combat' | 'crime' | 'social' | 'economy' | 'exploration' | 'special' | 'crafting' | 'gambling' | 'progression';
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
  claimedAt?: Date;
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
      enum: ['combat', 'crime', 'social', 'economy', 'exploration', 'special', 'crafting', 'gambling', 'progression'],
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
    claimed: {
      type: Boolean,
      default: false
    },
    claimedAt: {
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
AchievementSchema.index({ characterId: 1, completed: 1, claimed: 1 }); // For unclaimed rewards query

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
  },

  // Additional Combat achievements
  {
    type: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Defeat your first boss',
    category: 'combat',
    tier: 'silver',
    target: 1,
    reward: { gold: 1000, experience: 500 }
  },
  {
    type: 'boss_hunter_5',
    title: 'Boss Hunter',
    description: 'Defeat 5 bosses',
    category: 'combat',
    tier: 'gold',
    target: 5,
    reward: { gold: 5000, experience: 2500 }
  },
  {
    type: 'flawless_victory',
    title: 'Flawless Victory',
    description: 'Win a combat without taking damage',
    category: 'combat',
    tier: 'gold',
    target: 1,
    reward: { gold: 2500, experience: 1000 }
  },

  // Crafting achievements
  {
    type: 'first_craft',
    title: 'Apprentice Crafter',
    description: 'Craft your first item',
    category: 'crafting',
    tier: 'bronze',
    target: 1,
    reward: { gold: 100, experience: 50 }
  },
  {
    type: 'crafter_10',
    title: 'Journeyman Crafter',
    description: 'Craft 10 items',
    category: 'crafting',
    tier: 'bronze',
    target: 10,
    reward: { gold: 500, experience: 200 }
  },
  {
    type: 'crafter_50',
    title: 'Expert Crafter',
    description: 'Craft 50 items',
    category: 'crafting',
    tier: 'silver',
    target: 50,
    reward: { gold: 2500, experience: 1000 }
  },
  {
    type: 'crafter_100',
    title: 'Master Crafter',
    description: 'Craft 100 items',
    category: 'crafting',
    tier: 'gold',
    target: 100,
    reward: { gold: 10000, experience: 5000 }
  },
  {
    type: 'quality_crafter',
    title: 'Quality Artisan',
    description: 'Craft 10 high-quality items',
    category: 'crafting',
    tier: 'silver',
    target: 10,
    reward: { gold: 2000, experience: 1000 }
  },

  // Gambling achievements
  {
    type: 'first_gamble',
    title: 'Feeling Lucky',
    description: 'Win your first gambling game',
    category: 'gambling',
    tier: 'bronze',
    target: 1,
    reward: { gold: 100, experience: 50 }
  },
  {
    type: 'gambler_25',
    title: 'Card Shark',
    description: 'Win 25 gambling games',
    category: 'gambling',
    tier: 'silver',
    target: 25,
    reward: { gold: 2500, experience: 1000 }
  },
  {
    type: 'high_roller',
    title: 'High Roller',
    description: 'Win 10,000 gold from gambling',
    category: 'gambling',
    tier: 'gold',
    target: 10000,
    reward: { gold: 5000, experience: 2500 }
  },
  {
    type: 'jackpot_winner',
    title: 'Jackpot Winner',
    description: 'Hit a jackpot of 5,000+ gold in a single game',
    category: 'gambling',
    tier: 'gold',
    target: 1,
    reward: { gold: 2500, experience: 1500 }
  },

  // Progression achievements
  {
    type: 'level_10',
    title: 'Rising Gunslinger',
    description: 'Reach level 10',
    category: 'progression',
    tier: 'bronze',
    target: 10,
    reward: { gold: 500, experience: 250 }
  },
  {
    type: 'level_25',
    title: 'Seasoned Outlaw',
    description: 'Reach level 25',
    category: 'progression',
    tier: 'silver',
    target: 25,
    reward: { gold: 2500, experience: 1000 }
  },
  {
    type: 'level_50',
    title: 'Living Legend',
    description: 'Reach level 50',
    category: 'progression',
    tier: 'legendary',
    target: 50,
    reward: { gold: 25000, experience: 10000 }
  },
  {
    type: 'skill_master',
    title: 'Skill Master',
    description: 'Master a skill to level 100',
    category: 'progression',
    tier: 'gold',
    target: 1,
    reward: { gold: 10000, experience: 5000 }
  },
  {
    type: 'multi_skilled',
    title: 'Jack of All Trades',
    description: 'Reach level 50 in 5 different skills',
    category: 'progression',
    tier: 'gold',
    target: 5,
    reward: { gold: 7500, experience: 3500 }
  },

  // Additional Exploration achievements
  {
    type: 'wanderer',
    title: 'Wanderer',
    description: 'Visit 25 different locations',
    category: 'exploration',
    tier: 'bronze',
    target: 25,
    reward: { gold: 500, experience: 250 }
  },
  {
    type: 'world_traveler',
    title: 'World Traveler',
    description: 'Visit 50 different locations',
    category: 'exploration',
    tier: 'silver',
    target: 50,
    reward: { gold: 2500, experience: 1000 }
  },
  {
    type: 'mysterious_encounter',
    title: 'Mysterious Encounter',
    description: 'Encounter a mysterious stranger',
    category: 'exploration',
    tier: 'silver',
    target: 1,
    reward: { gold: 1000, experience: 500 }
  },
  {
    type: 'night_owl',
    title: 'Night Owl',
    description: 'Complete 20 activities at night',
    category: 'exploration',
    tier: 'bronze',
    target: 20,
    reward: { gold: 750, experience: 350 }
  },

  // Additional Special/Hidden achievements
  {
    type: 'jailbreak',
    title: 'Jailbreak',
    description: 'Escape from jail',
    category: 'special',
    tier: 'silver',
    target: 1,
    reward: { gold: 1500, experience: 750 }
  },
  {
    type: 'bounty_legend',
    title: 'Most Wanted',
    description: 'Reach wanted level 5 (maximum notoriety)',
    category: 'special',
    tier: 'gold',
    target: 5,
    reward: { gold: 5000, experience: 2500 }
  },

  // World Event achievements
  {
    type: 'event_veteran',
    title: 'Event Veteran',
    description: 'Participate in 25 world events',
    category: 'exploration',
    tier: 'silver',
    target: 25,
    reward: { gold: 2000, experience: 1000 }
  },
  {
    type: 'storm_survivor',
    title: 'Storm Survivor',
    description: 'Complete 10 actions during severe weather',
    category: 'exploration',
    tier: 'bronze',
    target: 10,
    reward: { gold: 500, experience: 250 }
  },
  {
    type: 'gold_rush_winner',
    title: 'Gold Rush Prospector',
    description: 'Earn 10,000 gold during Gold Rush events',
    category: 'economy',
    tier: 'gold',
    target: 10000,
    reward: { gold: 5000, experience: 2500 }
  },
  {
    type: 'bounty_hunter_survivor',
    title: 'Bounty Hunter Survivor',
    description: 'Survive 5 bounty hunter encounters',
    category: 'combat',
    tier: 'silver',
    target: 5,
    reward: { gold: 2500, experience: 1000 }
  },

  // Prestige achievements
  {
    type: 'first_prestige',
    title: 'Born Again',
    description: 'Complete your first prestige and start anew with power',
    category: 'progression',
    tier: 'gold',
    target: 1,
    reward: { gold: 10000, experience: 5000 }
  },
  {
    type: 'prestige_2',
    title: 'The Desperado',
    description: 'Reach prestige rank 2',
    category: 'progression',
    tier: 'gold',
    target: 1,
    reward: { gold: 25000, experience: 12500 }
  },
  {
    type: 'prestige_3',
    title: "Third Time's The Charm",
    description: 'Reach prestige rank 3 (Gunslinger)',
    category: 'progression',
    tier: 'legendary',
    target: 1,
    reward: { gold: 50000, experience: 25000 }
  },
  {
    type: 'prestige_4',
    title: 'Living Legend',
    description: 'Reach prestige rank 4 (Legend)',
    category: 'progression',
    tier: 'legendary',
    target: 1,
    reward: { gold: 75000, experience: 35000 }
  },
  {
    type: 'prestige_5',
    title: 'Mythic Outlaw',
    description: 'Reach the maximum prestige rank (Mythic)',
    category: 'progression',
    tier: 'legendary',
    target: 1,
    reward: { gold: 100000, experience: 50000 }
  },
  {
    type: 'endgame_boss_5',
    title: 'Endgame Hunter',
    description: 'Defeat 5 endgame bosses (Level 45+)',
    category: 'combat',
    tier: 'gold',
    target: 5,
    reward: { gold: 15000, experience: 7500 }
  },
  {
    type: 'cosmic_serpent_complete',
    title: 'Serpent Slayer',
    description: 'Defeat the Cosmic Serpent',
    category: 'combat',
    tier: 'legendary',
    target: 1,
    reward: { gold: 20000, experience: 10000 }
  },
  {
    type: 'cosmic_truth_complete',
    title: 'The Truth Revealed',
    description: 'Complete The Cosmic Truth encounter and achieve transcendence',
    category: 'special',
    tier: 'legendary',
    target: 1,
    reward: { gold: 50000, experience: 25000 }
  },
  {
    type: 'prestige_speed_run',
    title: 'Speed Demon',
    description: 'Reach level 50 and prestige within 7 days of starting',
    category: 'special',
    tier: 'legendary',
    target: 1,
    reward: { gold: 30000, experience: 15000 }
  }
];

export default Achievement;
