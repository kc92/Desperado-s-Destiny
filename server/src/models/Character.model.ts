/**
 * Character Model
 *
 * Mongoose schema for player characters in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Faction, ENERGY, PROGRESSION, FACTIONS } from '@desperados/shared';
import { TransactionSource } from './GoldTransaction.model';
import logger from '../utils/logger';
import { createExactMatchRegex } from '../utils/stringUtils';

/**
 * Character appearance customization
 */
export interface CharacterAppearance {
  bodyType: 'male' | 'female' | 'non-binary';
  skinTone: number; // 0-10
  facePreset: number; // 0-9
  hairStyle: number; // 0-14
  hairColor: number; // 0-7
}

/**
 * Character stat block
 */
export interface CharacterStats {
  cunning: number;
  spirit: number;
  combat: number;
  craft: number;
}

/**
 * Skill training record
 *
 * LEVELING SYSTEM REFACTOR: Skills now max at 99 (not 50)
 * totalXpEarned tracks lifetime XP for prestige calculations
 */
export interface CharacterSkill {
  skillId: string;
  level: number;
  experience: number;
  /** Lifetime XP earned in this skill (for prestige tracking) */
  totalXpEarned: number;
  trainingStarted?: Date;
  trainingCompletes?: Date;
}

/**
 * Inventory item
 */
export interface InventoryItem {
  itemId: string;
  quantity: number;
  acquiredAt: Date;
}

/**
 * Equipment slots
 */
export interface CharacterEquipment {
  weapon: string | null;
  head: string | null;
  body: string | null;
  feet: string | null;
  mount: string | null;
  accessory: string | null;
}

/**
 * Combat statistics
 */
export interface CombatStats {
  wins: number;
  losses: number;
  totalDamage: number;
  kills: number;
  totalDeaths: number;  // AAA BALANCE: Track all deaths for stakes visibility
}

/**
 * Fate Mark - Accumulated bad luck that increases permadeath risk
 */
export interface CharacterFateMark {
  acquiredAt: Date;
  source: string;  // FateMarkSource enum value
  description?: string;
}

/**
 * Prestige system data
 *
 * LEVELING SYSTEM REFACTOR: Prestige now based on Total Level 1000+
 * and Combat Level 75+ with XP/Gold multiplier bonuses
 */
export interface CharacterPrestige {
  /** Current prestige rank (0-10) */
  currentRank: number;
  /** Total number of times prestiged */
  totalPrestiges: number;
  /** XP multiplier from prestige (1.0 = no bonus, 1.5 = +50%) */
  xpMultiplier: number;
  /** Gold multiplier from prestige */
  goldMultiplier: number;
  /** Permanent stat bonuses from prestige */
  permanentBonuses: Array<{
    type: string;
    value: number;
    description: string;
  }>;
  /** History of prestige events */
  prestigeHistory: Array<{
    rank: number;
    achievedAt: Date;
    /** @deprecated Use totalLevelAtPrestige instead */
    levelAtPrestige: number;
    /** Total Level when prestiged */
    totalLevelAtPrestige?: number;
    /** Combat Level when prestiged */
    combatLevelAtPrestige?: number;
  }>;
}

/**
 * Player event statistics tracking (Phase 1 Tech Debt Fix)
 */
export interface PlayerEventStats {
  nightTravels: number;
  mysteriousEncounters: number;
  bountyHunterSurvived: number;
  weatherHazardsSurvived: number;
  hostileFactionEncounters: number;
  friendlyFactionGifts: number;
  eventsTotal: number;
}

/**
 * Bounty Portfolio - Passive bounty investment system (Phase 5.1)
 */
export interface BountyInvestment {
  bountyId: string;           // Reference to BountyHunt document
  targetId: string;           // Bounty target ID
  goldInvested: number;       // Amount of gold invested
  investedAt: Date;           // When investment was made
  expectedReturn: number;     // Expected payout if successful
  status: 'active' | 'completed' | 'failed';
}

export interface BountyPortfolio {
  activeBounties: BountyInvestment[];  // Current bounty investments
  portfolioValue: number;               // Total gold currently invested
  totalInvested: number;                // Lifetime total invested
  totalReturns: number;                 // Lifetime total returns collected
  pendingReturns: number;               // Returns ready to collect
  successfulInvestments: number;        // Count of successful bounties
  failedInvestments: number;            // Count of failed bounties
}

/**
 * Fence Trust Record - Tracks trust with black market fences (Phase 13 - Deep Mining)
 */
export interface FenceTrustRecord {
  fenceLocationId: string;              // Fence location ID
  trustLevel: number;                   // 0-100 trust with this fence
  totalTransactions: number;            // Total number of transactions
  totalValueTraded: number;             // Lifetime value of items traded
  lastTransactionAt?: Date;             // Last transaction timestamp
  stingOperationsTriggered: number;     // Number of times caught in stings
}

/**
 * Character document interface
 */
export interface ICharacter extends Document {
  // Ownership
  userId: mongoose.Types.ObjectId;

  // Identity
  name: string;
  faction: Faction;

  // Appearance
  appearance: CharacterAppearance;

  // Progression (Legacy - being replaced by Total Level system)
  /** @deprecated Use totalLevel instead - kept for migration compatibility */
  level: number;
  /** @deprecated Character XP replaced by skill XP system */
  experience: number;

  // NEW: Total Level System (sum of all skill levels)
  /** Total Level = sum of all skill levels (30-2970) */
  totalLevel: number;
  /** Total combat XP earned (for Combat Level calculation) */
  combatXp: number;
  /** Combat Level derived from combatXp (1-138) */
  combatLevel: number;
  /** Claimed Total Level milestones (e.g., 'tenderfoot', 'legend') */
  claimedTotalLevelMilestones: string[];
  /** Claimed Combat Level milestones (e.g., 'scrapper', 'gunslinger') */
  claimedCombatLevelMilestones: string[];

  // Resources
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: Date;

  // Primary Currency (Dollars)
  dollars: number;
  lockedDollars: number; // Dollars locked in active wagers (duels, etc.)

  // Legacy gold field - DEPRECATED, use dollars instead
  /** @deprecated Use dollars instead - kept for migration compatibility */
  gold: number;
  /** @deprecated Use lockedDollars instead */
  lockedGold: number;

  // Precious Metal Resources (not currency - can be sold for dollars)
  goldResource: number;    // Gold bars/nuggets - valuable resource
  silverResource: number;  // Silver bars/nuggets - common resource

  // Property Income Cap Tracking (BALANCE FIX)
  dailyProductionIncome: number; // Gold earned from properties today
  lastProductionIncomeReset: Date; // When daily income was last reset

  // Bank Vault
  bankVaultBalance: number;
  bankVaultTier: 'none' | 'bronze' | 'silver' | 'gold';

  // Location
  currentLocation: string;

  // Gang
  gangId: mongoose.Types.ObjectId | null;

  // Mount System
  activeMountId: mongoose.Types.ObjectId | null;

  // Stats
  stats: CharacterStats;

  // Skills
  skills: CharacterSkill[];

  // Inventory
  inventory: InventoryItem[];

  // Equipment
  equipment: CharacterEquipment;

  // Combat Stats
  combatStats: CombatStats;

  // Crime and Jail System
  isJailed: boolean;
  isDead: boolean;
  isKnockedOut: boolean;

  // Permadeath System
  fateMarks: CharacterFateMark[];  // Accumulated bad luck marks
  deathLocation?: string;          // Where permadeath occurred
  diedAt?: Date;                   // When permadeath occurred
  causeOfDeath?: string;           // How they died
  killedBy?: string;               // Who/what killed them

  jailedUntil: Date | null;
  jailOffense: string | null;
  wantedLevel: number;
  lastWantedDecay: Date;
  bountyAmount: number;
  lastArrestTime: Date | null;
  arrestCooldowns: Map<string, Date>;
  jobCooldowns: Map<string, Date>;
  lastBailCost: number;

  // Reputation System
  factionReputation: {
    settlerAlliance: number;
    nahiCoalition: number;
    frontera: number;
  };
  criminalReputation: number;

  // Moral Reputation (Phase 19.3: Marshal/Outlaw system)
  moralReputation: number;  // -100 (Notorious Outlaw) to +100 (Legendary Marshal)
  moralReputationDailyChange: number;  // Track daily changes for limit
  lastMoralDecay: Date;

  // Legendary Quest System - Unlocked locations and NPC relationships
  unlockedLocations: string[];
  npcRelationships: Map<string, number>;

  // Legacy compatibility - reputation alias
  reputation?: {
    outlaws?: number;
    coalition?: number;
    settlers?: number;
  };

  // Disguise System
  currentDisguise: string | null;
  disguiseExpiresAt: Date | null;
  disguiseFaction: string | null;

  // Mentor System
  currentMentorId: string | null;

  // Tutorial System
  tutorialRewardsClaimed: string[]; // IDs of tutorial steps where rewards have been claimed

  // Milestone System (Sprint 7)
  claimedMilestones: string[];      // Level milestones claimed (e.g., 'level-5', 'level-10')
  unlockedFeatures: string[];       // Features unlocked by milestones (e.g., 'bounty_hunting', 'mining_claims')
  milestoneModifiers: {             // Permanent stat bonuses from milestones
    wilderness_income?: number;
    property_discount?: number;
    social_success?: number;
    crime_success?: number;
    combat_bonus?: number;
    all_stats?: number;
  };

  // Crafting Specializations (Phase 7.1)
  specializations?: Array<{
    pathId: string;
    professionId: string;
    unlockedAt: Date;
    masteryProgress: number;
    uniqueRecipesUnlocked: string[];
  }>;

  // Crafting professions (for workshop access)
  professions?: string[];

  // Completed quests (for quest-gated content)
  completedQuests?: string[];

  // Progression System (Phase 6)
  talents?: Array<{
    talentId: string;
    ranks: number;
    unlockedAt: Date;
  }>;
  prestige?: CharacterPrestige;

  // Player Event Statistics (Phase 1 Tech Debt Fix)
  playerEventStats?: PlayerEventStats;

  // Bounty Portfolio (Phase 5.1 - Passive bounty income)
  bountyPortfolio?: BountyPortfolio;

  // Fence Trust (Phase 13 - Deep Mining)
  fenceTrust?: FenceTrustRecord[];

  // Location Visit Tracking (Phase 5 Feature Enhancement)
  visitedLocations?: Map<string, number>;  // locationId -> visit count

  // Title System (Phase 5 Feature Enhancement)
  earnedTitles?: string[];  // Earned title IDs
  activeTitle?: string;     // Currently displayed title

  // Devil Deals (Permadeath Protection)
  devilDeals?: Array<{
    type: string;
    purchasedAt: Date;
    expiresAt?: Date;
    consumed: boolean;
    consumedAt?: Date;
  }>;

  // Active Effects (Tavern buffs, temporary bonuses)
  activeEffects: Array<{
    effectId: string;
    effectType: 'regen_buff' | 'stat_buff' | 'skill_buff';
    magnitude: number;
    appliedAt: Date;
    expiresAt: Date;
    sourceLocation?: string;
    sourceName?: string;
  }>;

  // Activity Cooldowns (tavern activities, etc.)
  activityCooldowns: Map<string, Date>;

  // Timestamps
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;

  // Instance methods
  calculateEnergyRegen(): number;
  regenerateEnergy(): void;
  canAffordAction(cost: number): boolean;
  spendEnergy(cost: number): void;
  addExperience(amount: number): Promise<void>;
  toSafeObject(): any;

  // Dollar methods (primary currency)
  hasDollars(amount: number): boolean;
  addDollars(amount: number, source: TransactionSource, metadata?: any): Promise<number>;
  deductDollars(amount: number, source: TransactionSource, metadata?: any): Promise<number>;

  // Resource methods
  hasGoldResource(amount: number): boolean;
  hasSilverResource(amount: number): boolean;

  // Skill methods
  getSkill(skillId: string): CharacterSkill | undefined;
  getSkillLevel(skillId: string): number;
  getSkillBonusForSuit(suit: string): number;
  getCurrentTraining(): CharacterSkill | null;
  canStartTraining(): boolean;
  isTrainingComplete(): boolean;

  // Crime and Jail methods
  isCurrentlyJailed(): boolean;
  getRemainingJailTime(): number;
  releaseFromJail(): void;
  increaseWantedLevel(amount: number): void;
  decreaseWantedLevel(amount: number): void;
  calculateBounty(): number;
  canBeArrested(): boolean;
  decayWantedLevel(): boolean;
  sendToJail(minutes: number, bailCost?: number, offense?: string): void;
  canArrestTarget(targetId: string): boolean;
  recordArrest(targetId: string): void;

  // Virtuals
  energyRegenRate: number;
  nextLevelXP: number;
}

/**
 * Character static methods interface
 */
export interface ICharacterModel extends Model<ICharacter> {
  findByUserId(userId: string): Promise<ICharacter[]>;
  findActiveByName(name: string): Promise<ICharacter | null>;
  getCharacterCount(userId: string): Promise<number>;
}

/**
 * Character schema definition
 */
const CharacterSchema = new Schema<ICharacter>(
  {
    // Ownership
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Identity
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    faction: {
      type: String,
      required: true,
      enum: Object.values(Faction)
    },

    // Appearance
    appearance: {
      bodyType: {
        type: String,
        required: true,
        enum: ['male', 'female', 'non-binary']
      },
      skinTone: {
        type: Number,
        required: true,
        min: 0,
        max: 10
      },
      facePreset: {
        type: Number,
        required: true,
        min: 0,
        max: 9
      },
      hairStyle: {
        type: Number,
        required: true,
        min: 0,
        max: 14
      },
      hairColor: {
        type: Number,
        required: true,
        min: 0,
        max: 7
      }
    },

    // Progression (Legacy - being replaced by Total Level system)
    /** @deprecated Use totalLevel instead */
    level: {
      type: Number,
      default: 1,
      min: PROGRESSION.MIN_LEVEL,
      max: PROGRESSION.MAX_LEVEL
    },
    /** @deprecated Character XP replaced by skill XP system */
    experience: {
      type: Number,
      default: 0,
      min: 0
    },

    // NEW: Total Level System (RuneScape/Therian Saga style)
    /** Total Level = sum of all skill levels (30-2970) */
    totalLevel: {
      type: Number,
      default: 30, // 30 skills at level 1
      min: 30,
      max: 2970,
      index: true // For leaderboards
    },
    /** Total combat XP earned (for Combat Level calculation) */
    combatXp: {
      type: Number,
      default: 0,
      min: 0
    },
    /** Combat Level derived from combatXp (1-138) */
    combatLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 138,
      index: true // For PvP matchmaking
    },
    /** Claimed Total Level milestones */
    claimedTotalLevelMilestones: {
      type: [String],
      default: []
    },
    /** Claimed Combat Level milestones */
    claimedCombatLevelMilestones: {
      type: [String],
      default: []
    },

    // Resources
    energy: {
      type: Number,
      default: ENERGY.FREE_MAX
    },
    maxEnergy: {
      type: Number,
      default: ENERGY.FREE_MAX
    },
    lastEnergyUpdate: {
      type: Date,
      default: Date.now
    },
    // Primary Currency (Dollars)
    dollars: {
      type: Number,
      default: 100,  // Starting dollars (was starting gold)
      min: 0
    },
    lockedDollars: {
      type: Number,
      default: 0,
      min: 0
    },

    // Legacy gold field - DEPRECATED (kept for migration)
    gold: {
      type: Number,
      default: 0,  // Changed from 100 - new characters start with dollars
      min: 0
    },
    lockedGold: {
      type: Number,
      default: 0,
      min: 0
    },

    // Precious Metal Resources
    goldResource: {
      type: Number,
      default: 0,
      min: 0,
      max: 100000  // Cap at 100k gold bars
    },
    silverResource: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000000  // Cap at 1M silver bars
    },

    // Property Income Cap Tracking (BALANCE FIX)
    dailyProductionIncome: {
      type: Number,
      default: 0,
      min: 0
    },
    lastProductionIncomeReset: {
      type: Date,
      default: Date.now
    },

    // Bank Vault System
    bankVaultBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    bankVaultTier: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold'],
      default: 'none'
    },

    // Location
    currentLocation: {
      type: String,
      required: true
    },

    // Gang
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      default: null,
      index: true
    },

    // Mount System
    activeMountId: {
      type: Schema.Types.ObjectId,
      ref: 'Mount',
      default: null,
      index: true,
      comment: 'Currently active mount for carry capacity bonus'
    },

    // Stats
    stats: {
      cunning: { type: Number, default: 0 },
      spirit: { type: Number, default: 0 },
      combat: { type: Number, default: 0 },
      craft: { type: Number, default: 0 }
    },

    // Skills (max level now 99 instead of 50)
    skills: [{
      skillId: { type: String, required: true },
      level: { type: Number, default: 1, min: 1, max: 99 },
      experience: { type: Number, default: 0, min: 0 },
      /** Lifetime XP earned in this skill (for prestige tracking) */
      totalXpEarned: { type: Number, default: 0, min: 0 },
      trainingStarted: { type: Date },
      trainingCompletes: { type: Date }
    }],

    // Inventory
    inventory: [{
      itemId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      acquiredAt: { type: Date, default: Date.now }
    }],

    // Equipment
    equipment: {
      weapon: { type: String, default: null },
      head: { type: String, default: null },
      body: { type: String, default: null },
      feet: { type: String, default: null },
      mount: { type: String, default: null },
      accessory: { type: String, default: null }
    },

    // Combat Stats
    combatStats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      totalDamage: { type: Number, default: 0 },
      kills: { type: Number, default: 0 },
      totalDeaths: { type: Number, default: 0 }  // AAA BALANCE: All death types tracked
    },

    // Crime and Jail System
    isJailed: {
      type: Boolean,
      default: false
    },
    isDead: {
      type: Boolean,
      default: false
    },
    isKnockedOut: {
      type: Boolean,
      default: false
    },

    // Permadeath System
    fateMarks: {
      type: [{
        acquiredAt: { type: Date, required: true },
        source: { type: String, required: true },
        description: { type: String }
      }],
      default: []
    },
    deathLocation: {
      type: String,
      default: undefined
    },
    diedAt: {
      type: Date,
      default: undefined
    },
    causeOfDeath: {
      type: String,
      default: undefined
    },
    killedBy: {
      type: String,
      default: undefined
    },

    jailedUntil: {
      type: Date,
      default: null
    },
    jailOffense: {
      type: String,
      default: null
    },
    wantedLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    lastWantedDecay: {
      type: Date,
      default: Date.now
    },
    bountyAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastArrestTime: {
      type: Date,
      default: null
    },
    arrestCooldowns: {
      type: Map,
      of: Date,
      default: new Map()
    },
    jobCooldowns: {
      type: Map,
      of: Date,
      default: new Map()
    },
    lastBailCost: {
      type: Number,
      default: 0,
      min: 0
    },

    // Reputation System
    factionReputation: {
      settlerAlliance: { type: Number, default: 0, min: -100, max: 100 },
      nahiCoalition: { type: Number, default: 0, min: -100, max: 100 },
      frontera: { type: Number, default: 0, min: -100, max: 100 },
    },
    criminalReputation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // Moral Reputation (Phase 19.3: Marshal/Outlaw system)
    moralReputation: {
      type: Number,
      default: 0,
      min: -100,
      max: 100
    },
    moralReputationDailyChange: {
      type: Number,
      default: 0
    },
    lastMoralDecay: {
      type: Date,
      default: Date.now
    },

    // Legendary Quest System - Unlocked locations and NPC relationships
    unlockedLocations: {
      type: [String],
      default: [],
      index: true,
    },
    npcRelationships: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    // Disguise System
    currentDisguise: {
      type: String,
      default: null
    },
    disguiseExpiresAt: {
      type: Date,
      default: null
    },
    disguiseFaction: {
      type: String,
      enum: ['settler', 'nahi', 'frontera', null],
      default: null
    },

    // Mentor System
    currentMentorId: {
      type: String,
      default: null
    },

    // Tutorial System
    tutorialRewardsClaimed: {
      type: [String],
      default: []
    },

    // Milestone System (Sprint 7)
    claimedMilestones: {
      type: [String],
      default: []
    },
    unlockedFeatures: {
      type: [String],
      default: []
    },
    milestoneModifiers: {
      type: {
        wilderness_income: { type: Number, default: 0 },
        property_discount: { type: Number, default: 0 },
        social_success: { type: Number, default: 0 },
        crime_success: { type: Number, default: 0 },
        combat_bonus: { type: Number, default: 0 },
        all_stats: { type: Number, default: 0 }
      },
      default: {}
    },

    // Crafting Specializations (Phase 7.1)
    specializations: {
      type: [{
        pathId: { type: String, required: true },
        professionId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        masteryProgress: { type: Number, default: 0, min: 0, max: 100 },
        uniqueRecipesUnlocked: [{ type: String }]
      }],
      default: []
    },

    // Progression System (Phase 6)
    talents: {
      type: [{
        talentId: { type: String, required: true },
        ranks: { type: Number, required: true, min: 1, max: 3 },
        unlockedAt: { type: Date, default: Date.now }
      }],
      default: []
    },
    prestige: {
      type: {
        currentRank: { type: Number, default: 0, min: 0, max: 10 },
        totalPrestiges: { type: Number, default: 0, min: 0 },
        /** XP multiplier from prestige (1.0 = no bonus) */
        xpMultiplier: { type: Number, default: 1.0, min: 1.0 },
        /** Gold multiplier from prestige (1.0 = no bonus) */
        goldMultiplier: { type: Number, default: 1.0, min: 1.0 },
        permanentBonuses: [{
          type: { type: String, required: true },
          value: { type: Number, required: true },
          description: { type: String, required: true }
        }],
        prestigeHistory: [{
          rank: { type: Number, required: true },
          achievedAt: { type: Date, default: Date.now },
          /** @deprecated Use totalLevelAtPrestige */
          levelAtPrestige: { type: Number, required: true },
          totalLevelAtPrestige: { type: Number },
          combatLevelAtPrestige: { type: Number }
        }]
      },
      default: undefined
    },

    // Player Event Statistics (Phase 1 Tech Debt Fix)
    playerEventStats: {
      type: {
        nightTravels: { type: Number, default: 0, min: 0 },
        mysteriousEncounters: { type: Number, default: 0, min: 0 },
        bountyHunterSurvived: { type: Number, default: 0, min: 0 },
        weatherHazardsSurvived: { type: Number, default: 0, min: 0 },
        hostileFactionEncounters: { type: Number, default: 0, min: 0 },
        friendlyFactionGifts: { type: Number, default: 0, min: 0 },
        eventsTotal: { type: Number, default: 0, min: 0 }
      },
      default: undefined
    },

    // Bounty Portfolio (Phase 5.1 - Passive bounty income)
    bountyPortfolio: {
      type: {
        activeBounties: [{
          bountyId: { type: String, required: true },
          targetId: { type: String, required: true },
          goldInvested: { type: Number, required: true, min: 0 },
          investedAt: { type: Date, default: Date.now },
          expectedReturn: { type: Number, required: true, min: 0 },
          status: {
            type: String,
            enum: ['active', 'completed', 'failed'],
            default: 'active'
          }
        }],
        portfolioValue: { type: Number, default: 0, min: 0 },
        totalInvested: { type: Number, default: 0, min: 0 },
        totalReturns: { type: Number, default: 0, min: 0 },
        pendingReturns: { type: Number, default: 0, min: 0 },
        successfulInvestments: { type: Number, default: 0, min: 0 },
        failedInvestments: { type: Number, default: 0, min: 0 }
      },
      default: undefined
    },

    // Fence Trust (Phase 13 - Deep Mining)
    fenceTrust: {
      type: [{
        fenceLocationId: { type: String, required: true },
        trustLevel: { type: Number, default: 0, min: 0, max: 100 },
        totalTransactions: { type: Number, default: 0, min: 0 },
        totalValueTraded: { type: Number, default: 0, min: 0 },
        lastTransactionAt: { type: Date },
        stingOperationsTriggered: { type: Number, default: 0, min: 0 }
      }],
      default: []
    },

    // Location Visit Tracking (Phase 5 Feature Enhancement)
    visitedLocations: {
      type: Map,
      of: Number,
      default: new Map(),
      comment: 'Tracks how many times character has visited each location'
    },

    // Title System (Phase 5 Feature Enhancement)
    earnedTitles: {
      type: [String],
      default: [],
      comment: 'Titles earned through achievements and events'
    },
    activeTitle: {
      type: String,
      default: null,
      comment: 'Currently displayed title'
    },

    // Devil Deals (Permadeath Protection)
    devilDeals: {
      type: [{
        type: { type: String, required: true },
        purchasedAt: { type: Date, required: true },
        expiresAt: { type: Date },
        consumed: { type: Boolean, default: false },
        consumedAt: { type: Date }
      }],
      default: []
    },

    // Active Effects (Tavern buffs, temporary bonuses)
    activeEffects: {
      type: [{
        effectId: { type: String, required: true },
        effectType: {
          type: String,
          enum: ['regen_buff', 'stat_buff', 'skill_buff'],
          required: true
        },
        magnitude: { type: Number, required: true },
        appliedAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
        sourceLocation: { type: String },
        sourceName: { type: String }
      }],
      default: []
    },

    // Activity Cooldowns (tavern activities, etc.)
    activityCooldowns: {
      type: Map,
      of: Date,
      default: new Map()
    },

    // Activity tracking
    lastActive: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
CharacterSchema.index({ userId: 1, isActive: 1 });
CharacterSchema.index({ name: 1 }, { unique: true });
// Performance optimization indexes
CharacterSchema.index({ wantedLevel: 1, isActive: 1 }); // For wanted player queries
CharacterSchema.index({ level: -1, experience: -1 }); // For leaderboards
CharacterSchema.index({ faction: 1, level: -1 }); // For faction leaderboards
CharacterSchema.index({ jailedUntil: 1 }); // For jail release jobs
CharacterSchema.index({ lastActive: -1 }); // For active player queries
CharacterSchema.index({ gangId: 1, level: -1 }); // For gang member rankings
// H8 FIX: Additional indexes for common queries
CharacterSchema.index({ currentLocation: 1 }); // For location-based queries (players at location)
CharacterSchema.index({ isJailed: 1 }); // For jail status queries
CharacterSchema.index({ isActive: 1 }); // For active character filtering

// PERFORMANCE FIX: Compound indexes for high-frequency query patterns
CharacterSchema.index({ userId: 1, isActive: 1, currentLocation: 1 }); // User's characters at specific location
CharacterSchema.index({ totalLevel: -1, isActive: 1 }); // Global leaderboards by totalLevel
CharacterSchema.index({ combatLevel: -1, isActive: 1 }); // PvP matchmaking and combat leaderboards
CharacterSchema.index({ faction: 1, totalLevel: -1, isActive: 1 }); // Faction leaderboards with totalLevel
CharacterSchema.index({ gangId: 1, isActive: 1 }); // Active gang members queries
CharacterSchema.index({ isJailed: 1, jailedUntil: 1 }); // Jail release job optimization
CharacterSchema.index({ currentLocation: 1, isActive: 1, wantedLevel: 1 }); // Bounty hunting at location
CharacterSchema.index({ userId: 1 }); // Standalone user lookup (common pattern)

/**
 * Virtual: Energy regeneration rate (per hour)
 * Note: For now, assumes free player. Will be enhanced when premium system is added.
 */
CharacterSchema.virtual('energyRegenRate').get(function(this: ICharacter) {
  // TODO: Check user's subscription status when user model has premium field
  return ENERGY.FREE_REGEN_PER_HOUR;
});

/**
 * Virtual: Experience needed for next level
 */
CharacterSchema.virtual('nextLevelXP').get(function(this: ICharacter) {
  if (this.level >= PROGRESSION.MAX_LEVEL) {
    return 0;
  }
  return Math.floor(
    PROGRESSION.BASE_EXPERIENCE * Math.pow(PROGRESSION.EXPERIENCE_MULTIPLIER, this.level - 1)
  );
});

/**
 * Instance method: Calculate energy regeneration amount
 */
CharacterSchema.methods.calculateEnergyRegen = function(this: ICharacter): number {
  const now = Date.now();
  const lastUpdate = this.lastEnergyUpdate.getTime();
  const elapsedMs = now - lastUpdate;

  // Energy regenerates at a constant rate per hour
  const regenPerMs = this.energyRegenRate / (60 * 60 * 1000);
  const regenAmount = elapsedMs * regenPerMs;

  // Cap at max energy
  return Math.min(regenAmount, this.maxEnergy - this.energy);
};

/**
 * Instance method: Regenerate energy based on elapsed time
 */
CharacterSchema.methods.regenerateEnergy = function(this: ICharacter): void {
  const regenAmount = this.calculateEnergyRegen();
  this.energy = Math.min(this.energy + regenAmount, this.maxEnergy);
  this.lastEnergyUpdate = new Date();
};

/**
 * Instance method: Check if character can afford an action
 */
CharacterSchema.methods.canAffordAction = function(this: ICharacter, cost: number): boolean {
  this.regenerateEnergy();
  return this.energy >= cost;
};

/**
 * Instance method: Spend energy on an action
 */
CharacterSchema.methods.spendEnergy = function(this: ICharacter, cost: number): void {
  this.regenerateEnergy();
  if (!this.canAffordAction(cost)) {
    throw new Error('Insufficient energy');
  }
  this.energy -= cost;
  this.lastEnergyUpdate = new Date();
};

/**
 * Instance method: Add experience and handle level ups
 * @deprecated Use CharacterProgressionService.addExperience() instead for transaction safety
 */
CharacterSchema.methods.addExperience = async function(this: ICharacter, amount: number): Promise<void> {
  logger.warn('DEPRECATED: Character.addExperience() - Use CharacterProgressionService.addExperience() for transaction safety');
  this.experience += amount;

  // Check for level ups
  let leveledUp = false;
  const oldLevel = this.level;

  while (this.level < PROGRESSION.MAX_LEVEL) {
    const xpNeeded = Math.floor(
      PROGRESSION.BASE_EXPERIENCE * Math.pow(PROGRESSION.EXPERIENCE_MULTIPLIER, this.level - 1)
    );

    if (this.experience >= xpNeeded) {
      this.experience -= xpNeeded;
      this.level += 1;
      leveledUp = true;
      // On level up, could grant stat points, etc.
    } else {
      break;
    }
  }

  // Trigger quest progress if level increased
  if (leveledUp) {
    try {
      // Use dynamic import to avoid circular dependency
      const { QuestService } = await import('../services/quest.service');
      await QuestService.onLevelUp(this._id.toString(), this.level);
    } catch (questError) {
      // Don't fail level up if quest update fails
      logger.error('Failed to update quest progress for level up', {
        error: questError instanceof Error ? questError.message : questError,
        stack: questError instanceof Error ? questError.stack : undefined,
        characterId: this._id?.toString(),
        level: this.level
      });
    }
  }
};

/**
 * Instance method: Return safe character object (no sensitive data)
 */
CharacterSchema.methods.toSafeObject = function(this: ICharacter) {
  const id = this._id.toString();
  return {
    id,
    _id: id,
    name: this.name,
    faction: this.faction,
    appearance: this.appearance,
    // Legacy level (deprecated)
    level: this.level,
    experience: this.experience,
    experienceToNextLevel: this.nextLevelXP,
    // NEW: Total Level System
    totalLevel: this.totalLevel || 30,
    combatXp: this.combatXp || 0,
    combatLevel: this.combatLevel || 1,
    // Energy
    energy: Math.floor(this.energy),
    maxEnergy: this.maxEnergy,
    // Primary currency (Dollars)
    dollars: this.dollars,
    // Precious metal resources
    goldResource: this.goldResource,
    silverResource: this.silverResource,
    // Backward compatibility - gold field mirrors dollars
    gold: this.dollars,
    currentLocation: this.currentLocation,
    locationId: this.currentLocation, // Alias for tutorial/navigation checks
    gangId: this.gangId ? this.gangId.toString() : null,
    stats: this.stats,
    skills: this.skills,
    inventory: this.inventory,
    combatStats: this.combatStats,
    isJailed: this.isJailed,
    jailedUntil: this.jailedUntil,
    wantedLevel: this.wantedLevel,
    bountyAmount: this.bountyAmount,
    createdAt: this.createdAt,
    lastActive: this.lastActive,
    // Permadeath system
    fateMarks: this.fateMarks || [],
    isDead: this.isDead || false,
    // Active effects (tavern buffs, etc.)
    activeEffects: this.activeEffects || [],
    // Prestige info
    prestige: this.prestige ? {
      rank: this.prestige.currentRank,
      xpMultiplier: this.prestige.xpMultiplier || 1.0,
      goldMultiplier: this.prestige.goldMultiplier || 1.0
    } : null
  };
};

/**
 * Instance method: Check if character has sufficient gold
 */
/**
 * Instance method: Check if character has enough dollars
 */
CharacterSchema.methods.hasDollars = function(this: ICharacter, amount: number): boolean {
  return this.dollars >= amount;
};

/**
 * Instance method: Add dollars to character with transaction tracking
 */
CharacterSchema.methods.addDollars = async function(
  this: ICharacter,
  amount: number,
  source: TransactionSource,
  metadata?: any
): Promise<number> {
  // Import DollarService dynamically to avoid circular dependencies
  const { DollarService } = await import('../services/dollar.service');
  const { newBalance } = await DollarService.addDollars(this._id as any, amount, source, metadata);
  // Update both fields for sync (DollarService atomic update handles DB, this syncs instance)
  this.dollars = newBalance;
  this.gold = newBalance; // Keep legacy field in sync
  return newBalance;
};

/**
 * Instance method: Deduct dollars from character with transaction tracking
 */
CharacterSchema.methods.deductDollars = async function(
  this: ICharacter,
  amount: number,
  source: TransactionSource,
  metadata?: any
): Promise<number> {
  // Import DollarService dynamically to avoid circular dependencies
  const { DollarService } = await import('../services/dollar.service');
  const { newBalance } = await DollarService.deductDollars(this._id as any, amount, source, metadata);
  // Update both fields for sync (DollarService atomic update handles DB, this syncs instance)
  this.dollars = newBalance;
  this.gold = newBalance; // Keep legacy field in sync
  return newBalance;
};

/**
 * Instance method: Check if character has enough gold resource
 */
CharacterSchema.methods.hasGoldResource = function(this: ICharacter, amount: number): boolean {
  return this.goldResource >= amount;
};

/**
 * Instance method: Check if character has enough silver resource
 */
CharacterSchema.methods.hasSilverResource = function(this: ICharacter, amount: number): boolean {
  return this.silverResource >= amount;
};

/**
 * Instance method: Get a specific skill by ID
 */
CharacterSchema.methods.getSkill = function(this: ICharacter, skillId: string): CharacterSkill | undefined {
  return this.skills.find(skill => skill.skillId === skillId);
};

/**
 * Instance method: Get skill level (returns 0 if skill not found)
 */
CharacterSchema.methods.getSkillLevel = function(this: ICharacter, skillId: string): number {
  const skill = this.getSkill(skillId);
  return skill ? skill.level : 0;
};

/**
 * Instance method: Calculate total skill bonus for a specific Destiny Deck suit
 * Each skill level = +1 to its suit
 */
CharacterSchema.methods.getSkillBonusForSuit = function(this: ICharacter, suit: string): number {
  // Import skills constants to map skills to suits
  const { SKILLS } = require('@desperados/shared');

  let totalBonus = 0;

  for (const characterSkill of this.skills) {
    const skillDef = SKILLS[characterSkill.skillId.toUpperCase()];
    if (skillDef && skillDef.suit === suit) {
      totalBonus += characterSkill.level;
    }
  }

  return totalBonus;
};

/**
 * Instance method: Get current training session (if any)
 */
CharacterSchema.methods.getCurrentTraining = function(this: ICharacter): CharacterSkill | null {
  const trainingSkill = this.skills.find(
    skill => skill.trainingStarted && skill.trainingCompletes
  );
  return trainingSkill || null;
};

/**
 * Instance method: Check if character can start training a new skill
 */
CharacterSchema.methods.canStartTraining = function(this: ICharacter): boolean {
  return this.getCurrentTraining() === null;
};

/**
 * Instance method: Check if current training is complete
 */
CharacterSchema.methods.isTrainingComplete = function(this: ICharacter): boolean {
  const training = this.getCurrentTraining();
  if (!training || !training.trainingCompletes) {
    return false;
  }
  return new Date() >= training.trainingCompletes;
};

/**
 * Instance method: Check if character is currently jailed
 */
CharacterSchema.methods.isCurrentlyJailed = function(this: ICharacter): boolean {
  if (!this.isJailed || !this.jailedUntil) {
    return false;
  }
  return new Date() < this.jailedUntil;
};

/**
 * Instance method: Get remaining jail time in minutes
 */
CharacterSchema.methods.getRemainingJailTime = function(this: ICharacter): number {
  if (!this.isCurrentlyJailed()) {
    return 0;
  }
  const remaining = this.jailedUntil!.getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
};

/**
 * Instance method: Release character from jail
 */
CharacterSchema.methods.releaseFromJail = function(this: ICharacter): void {
  this.isJailed = false;
  this.jailedUntil = null;
  this.jailOffense = null;
};

/**
 * Instance method: Send character to jail
 */
CharacterSchema.methods.sendToJail = function(this: ICharacter, minutes: number, bailCost?: number, offense?: string): void {
  this.isJailed = true;
  this.jailedUntil = new Date(Date.now() + minutes * 60 * 1000);
  this.jailOffense = offense ?? null;
  // Store bail cost from action if provided, otherwise calculate based on wanted level
  this.lastBailCost = bailCost ?? (this.wantedLevel * 50);
};

/**
 * Instance method: Increase wanted level
 */
CharacterSchema.methods.increaseWantedLevel = function(this: ICharacter, amount: number): void {
  this.wantedLevel = Math.min(5, this.wantedLevel + amount);
  this.bountyAmount = this.calculateBounty();
};

/**
 * Instance method: Decrease wanted level
 */
CharacterSchema.methods.decreaseWantedLevel = function(this: ICharacter, amount: number): void {
  this.wantedLevel = Math.max(0, this.wantedLevel - amount);
  this.bountyAmount = this.calculateBounty();
};

/**
 * Instance method: Calculate bounty based on wanted level
 */
CharacterSchema.methods.calculateBounty = function(this: ICharacter): number {
  return this.wantedLevel * 100;
};

/**
 * Instance method: Check if character can be arrested
 */
CharacterSchema.methods.canBeArrested = function(this: ICharacter): boolean {
  return this.wantedLevel >= 3 && !this.isCurrentlyJailed();
};

/**
 * Instance method: Decay wanted level (called every 24h)
 */
CharacterSchema.methods.decayWantedLevel = function(this: ICharacter): boolean {
  if (this.wantedLevel === 0) {
    return false;
  }

  const now = new Date();
  const hoursSinceDecay = (now.getTime() - this.lastWantedDecay.getTime()) / (1000 * 60 * 60);

  if (hoursSinceDecay >= 24) {
    this.decreaseWantedLevel(1);
    this.lastWantedDecay = now;
    return true;
  }

  return false;
};

/**
 * Instance method: Check if character can arrest a target
 */
CharacterSchema.methods.canArrestTarget = function(this: ICharacter, targetId: string): boolean {
  // Can't arrest if you're jailed or a criminal yourself
  if (this.isCurrentlyJailed()) {
    return false;
  }

  // Check cooldown
  const cooldowns = this.arrestCooldowns as Map<string, Date>;
  const lastArrest = cooldowns.get(targetId);
  if (lastArrest) {
    const hoursSinceArrest = (Date.now() - lastArrest.getTime()) / (1000 * 60 * 60);
    if (hoursSinceArrest < 1) {
      return false;
    }
  }

  return true;
};

/**
 * Instance method: Record an arrest to prevent spam
 */
CharacterSchema.methods.recordArrest = function(this: ICharacter, targetId: string): void {
  const cooldowns = this.arrestCooldowns as Map<string, Date>;
  cooldowns.set(targetId, new Date());
  this.arrestCooldowns = cooldowns;
};

/**
 * Static method: Find all active characters for a user
 */
CharacterSchema.statics.findByUserId = async function(
  userId: string
): Promise<ICharacter[]> {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  }).sort({ lastActive: -1 });
};

/**
 * Static method: Find active character by name (case-insensitive)
 */
CharacterSchema.statics.findActiveByName = async function(
  name: string
): Promise<ICharacter | null> {
  return this.findOne({
    name: createExactMatchRegex(name),
    isActive: true
  });
};

/**
 * Static method: Get count of characters for a user
 */
CharacterSchema.statics.getCharacterCount = async function(
  userId: string
): Promise<number> {
  return this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true
  });
};

/**
 * Helper function to get starting location for a faction
 */
export function getStartingLocation(faction: Faction): string {
  return FACTIONS[faction].startingLocationId;
}

/**
 * Character model
 */
export const Character = mongoose.model<ICharacter, ICharacterModel>('Character', CharacterSchema);
