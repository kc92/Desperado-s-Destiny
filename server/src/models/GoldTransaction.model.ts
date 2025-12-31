/**
 * Currency Transaction Model
 *
 * Mongoose schema for tracking all currency/resource movements in the game economy
 * Supports: Dollars (primary currency), Gold Resource, Silver Resource
 * Provides complete audit trail for debugging and anti-cheat purposes
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Currency type enum - what type of currency/resource is being transacted
 */
export enum CurrencyType {
  DOLLAR = 'DOLLAR',           // Primary currency (was "gold")
  GOLD_RESOURCE = 'GOLD_RESOURCE',   // Gold bars/nuggets (valuable material)
  SILVER_RESOURCE = 'SILVER_RESOURCE', // Silver bars/nuggets (common material)
}

/**
 * Transaction type enum
 */
export enum TransactionType {
  EARNED = 'EARNED',
  SPENT = 'SPENT',
  TRANSFERRED = 'TRANSFERRED',
  EXCHANGED = 'EXCHANGED',     // Resource exchanged for currency (or vice versa)
}

/**
 * Transaction source enum - tracks where gold came from or went to
 */
export enum TransactionSource {
  // Earning sources
  COMBAT_VICTORY = 'COMBAT_VICTORY',
  CRIME_SUCCESS = 'CRIME_SUCCESS',
  BOUNTY_REWARD = 'BOUNTY_REWARD',
  QUEST_REWARD = 'QUEST_REWARD',
  ACHIEVEMENT = 'ACHIEVEMENT',
  JOB_INCOME = 'JOB_INCOME',
  STARTING_GOLD = 'STARTING_GOLD',
  ENCOUNTER = 'ENCOUNTER',
  SECRET_DISCOVERY = 'SECRET_DISCOVERY',

  // Spending sources
  COMBAT_DEATH = 'COMBAT_DEATH',
  BAIL_PAYMENT = 'BAIL_PAYMENT',
  LAY_LOW_PAYMENT = 'LAY_LOW_PAYMENT',
  SHOP_PURCHASE = 'SHOP_PURCHASE',
  SHOP_SALE = 'SHOP_SALE',
  JAIL_FINE = 'JAIL_FINE',
  BRIBE = 'BRIBE',
  DISGUISE_PURCHASE = 'DISGUISE_PURCHASE',

  // Transfer sources
  PLAYER_TRADE = 'PLAYER_TRADE',
  GANG_DEPOSIT = 'GANG_DEPOSIT',
  GANG_WITHDRAWAL = 'GANG_WITHDRAWAL',
  GANG_CREATION = 'GANG_CREATION',
  GANG_DISBAND_REFUND = 'GANG_DISBAND_REFUND',
  MAIL_SENT = 'MAIL_SENT',
  MAIL_ATTACHMENT_CLAIMED = 'MAIL_ATTACHMENT_CLAIMED',

  // War sources
  WAR_CONTRIBUTION = 'WAR_CONTRIBUTION',

  // Duel sources
  DUEL_WIN = 'DUEL_WIN',
  DUEL_LOSS = 'DUEL_LOSS',

  // Tournament sources
  TOURNAMENT_ENTRY = 'TOURNAMENT_ENTRY',
  TOURNAMENT_WIN = 'TOURNAMENT_WIN',

  // Bank vault sources
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  BANK_WITHDRAWAL = 'BANK_WITHDRAWAL',
  BANK_VAULT_UPGRADE = 'BANK_VAULT_UPGRADE',

  // Bounty sources
  BOUNTY_PLACED = 'BOUNTY_PLACED',

  // Property tax sources (Phase 8, Wave 8.1)
  TAX_PAYMENT = 'TAX_PAYMENT',
  TAX_REFUND = 'TAX_REFUND',
  PROPERTY_AUCTION_BID = 'PROPERTY_AUCTION_BID',
  PROPERTY_AUCTION_WIN = 'PROPERTY_AUCTION_WIN',
  PROPERTY_AUCTION_PROCEEDS = 'PROPERTY_AUCTION_PROCEEDS',
  BANKRUPTCY_FILING_FEE = 'BANKRUPTCY_FILING_FEE',
  FORECLOSURE_PENALTY = 'FORECLOSURE_PENALTY',

  // Production sources (Phase 8, Wave 8.1)
  PRODUCTION_START = 'PRODUCTION_START',
  PRODUCTION_COLLECT = 'PRODUCTION_COLLECT',
  PRODUCTION_CANCEL = 'PRODUCTION_CANCEL',
  WORKER_HIRE = 'WORKER_HIRE',
  WORKER_WAGE = 'WORKER_WAGE',
  WORKER_TRAINING = 'WORKER_TRAINING',
  WORKER_SEVERANCE = 'WORKER_SEVERANCE',
  WORKER_FEED = 'WORKER_FEED',
  WORKER_TASK = 'WORKER_TASK',  // Phase 11: Worker task rewards
  STRIKE_RESOLUTION = 'STRIKE_RESOLUTION',

  // Tutorial sources
  TUTORIAL_REWARD = 'TUTORIAL_REWARD',

  // Gambling sources (Phase 13, Wave 13.1)
  GAMBLING_WIN = 'GAMBLING_WIN',
  GAMBLING_LOSS = 'GAMBLING_LOSS',
  GAMBLING_ENTRY_FEE = 'GAMBLING_ENTRY_FEE',
  GAMBLING_EVENT_PRIZE = 'GAMBLING_EVENT_PRIZE',
  GAMBLING_CHEAT_FINE = 'GAMBLING_CHEAT_FINE',
  GAMBLING_SESSION_START = 'GAMBLING_SESSION_START',
  GAMBLING_SESSION_CASHOUT = 'GAMBLING_SESSION_CASHOUT',

  // Boss encounter sources
  BOSS_VICTORY = 'BOSS_VICTORY',

  // Bounty hunter sources
  BOUNTY_PAYOFF = 'BOUNTY_PAYOFF',
  HIRE_HUNTER = 'HIRE_HUNTER',

  // Wandering NPC service sources
  SERVICE_PURCHASE = 'SERVICE_PURCHASE',

  // Companion sources
  COMPANION_PURCHASE = 'COMPANION_PURCHASE',
  COMPANION_CARE = 'COMPANION_CARE',

  // Hunting and fishing sources
  FISHING = 'FISHING',
  HUNTING = 'HUNTING',

  // Transportation sources
  STAGECOACH_TICKET = 'STAGECOACH_TICKET',
  TRAIN_TICKET = 'TRAIN_TICKET',
  TRAIN_REFUND = 'TRAIN_REFUND',
  CARGO_SHIPPING = 'CARGO_SHIPPING',
  REFUND = 'REFUND',

  // Crime sources
  CRIME_PROFIT = 'CRIME_PROFIT',
  TRAIN_ROBBERY = 'TRAIN_ROBBERY',

  // Ritual and special sources
  RITUAL = 'RITUAL',

  // Poker tournament sources
  POKER_TOURNAMENT = 'POKER_TOURNAMENT',
  POKER_BOUNTY = 'POKER_BOUNTY',
  POKER_PRIZE = 'POKER_PRIZE',

  // Login reward sources (Phase B - Competitor Parity)
  LOGIN_REWARD = 'LOGIN_REWARD',
  LOGIN_MONTHLY_BONUS = 'LOGIN_MONTHLY_BONUS',

  // Daily Contract sources (Phase B - Competitor Parity)
  CONTRACT_REWARD = 'CONTRACT_REWARD',
  STREAK_BONUS = 'STREAK_BONUS',

  // Marketplace sources (Phase C - Competitor Parity)
  MARKETPLACE_SALE = 'MARKETPLACE_SALE',
  MARKETPLACE_PURCHASE = 'MARKETPLACE_PURCHASE',
  MARKETPLACE_TAX = 'MARKETPLACE_TAX',
  MARKETPLACE_LISTING_FEE = 'MARKETPLACE_LISTING_FEE',
  MARKETPLACE_BID_RESERVE = 'MARKETPLACE_BID_RESERVE',
  MARKETPLACE_BID_REFUND = 'MARKETPLACE_BID_REFUND',
  MARKETPLACE_AUCTION_WIN = 'MARKETPLACE_AUCTION_WIN',
  MARKETPLACE_LISTING_EXPIRED = 'MARKETPLACE_LISTING_EXPIRED',

  // Property sources
  PROPERTY_PURCHASE = 'PROPERTY_PURCHASE',
  PROPERTY_LOSS = 'PROPERTY_LOSS',

  // NPC interaction sources
  NPC_INTERACTION = 'NPC_INTERACTION',
  NPC_TRADE = 'NPC_TRADE',

  // Quest sources
  QUEST_COMPLETION = 'QUEST_COMPLETION',

  // Combat loot sources
  COMBAT_LOOT = 'COMBAT_LOOT',

  // Horse racing sources (Phase 13, Wave 13.2)
  RACE_BET = 'RACE_BET',
  RACE_PAYOUT = 'RACE_PAYOUT',
  RACE_REFUND = 'RACE_REFUND',

  // Horse ownership sources
  HORSE_PURCHASE = 'HORSE_PURCHASE',
  HORSE_CARE = 'HORSE_CARE',
  HORSE_SALE = 'HORSE_SALE',

  // Shooting contest sources
  SHOOTING_CONTEST_ENTRY = 'SHOOTING_CONTEST_ENTRY',
  SHOOTING_CONTEST_PRIZE = 'SHOOTING_CONTEST_PRIZE',

  // Holiday sources
  HOLIDAY_REWARD = 'HOLIDAY_REWARD',
  HOLIDAY_CURRENCY_CONVERSION = 'HOLIDAY_CURRENCY_CONVERSION',

  // Subscription sources (Phase 12, Wave 12.1)
  SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
  SUBSCRIPTION_PURCHASE = 'SUBSCRIPTION_PURCHASE',

  // Wealth tax sources (Phase 3.3 Balance Fix)
  WEALTH_TAX = 'WEALTH_TAX',

  // Sprint 7: Mid-game activity sources
  BOUNTY_HUNTING = 'BOUNTY_HUNTING',
  MINING_CLAIM = 'MINING_CLAIM',
  CATTLE_DRIVE = 'CATTLE_DRIVE',

  // Milestone and Property income sources
  MILESTONE_REWARD = 'MILESTONE_REWARD',
  PROPERTY_INCOME = 'PROPERTY_INCOME',

  // Investment sources (Phase 10)
  INVESTMENT = 'INVESTMENT',
  INVESTMENT_RETURN = 'INVESTMENT_RETURN',

  // Business sources (Phase 12)
  BUSINESS_REVENUE = 'BUSINESS_REVENUE',
  BUSINESS_ESTABLISHMENT = 'BUSINESS_ESTABLISHMENT',
  BUSINESS_SERVICE_FEE = 'BUSINESS_SERVICE_FEE',
  BUSINESS_PRODUCT_SALE = 'BUSINESS_PRODUCT_SALE',
  BUSINESS_OPERATING_COST = 'BUSINESS_OPERATING_COST',

  // Admin sources
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',

  // Workshop sources
  WORKSHOP_ACCESS = 'WORKSHOP_ACCESS',
  ITEM_REPAIR = 'ITEM_REPAIR',

  // Guard/Raid sources
  GUARD_HIRE = 'GUARD_HIRE',
  GUARD_PREMIUM = 'GUARD_PREMIUM',

  // Permanent unlock sources
  PERMANENT_UNLOCK_BONUS = 'PERMANENT_UNLOCK_BONUS',

  // Fence operation sources
  FENCE_SALE = 'FENCE_SALE',
  FENCE_STING_CONFISCATION = 'FENCE_STING_CONFISCATION',

  // Deep mining sources (Phase 4 - Economy Hardening)
  DEEP_MINING_EQUIPMENT = 'DEEP_MINING_EQUIPMENT',
  DEEP_MINING_REPAIR = 'DEEP_MINING_REPAIR',
  GANG_PROTECTION_FEE = 'GANG_PROTECTION_FEE',
  RECIPE_LEARNING = 'RECIPE_LEARNING',

  // Devil deal sources (Cosmic Horror)
  DEVIL_DEAL = 'DEVIL_DEAL',
}

/**
 * Currency Transaction document interface
 */
export interface IGoldTransaction extends Document {
  characterId: mongoose.Types.ObjectId;
  currencyType: CurrencyType;  // Which currency/resource is being transacted
  amount: number; // Positive for EARNED, negative for SPENT
  type: TransactionType;
  source: TransactionSource;
  balanceBefore: number;
  balanceAfter: number;
  // Exchange-specific fields (only used when type === EXCHANGED)
  exchangeRate?: number;       // Rate at time of exchange (e.g., 100 = $100 per gold)
  exchangedFrom?: CurrencyType; // Source currency in exchange transactions
  metadata?: {
    npcId?: mongoose.Types.ObjectId;
    crimeId?: string;
    targetCharacterId?: mongoose.Types.ObjectId;
    encounterId?: mongoose.Types.ObjectId;
    itemId?: string;
    description?: string;
  };
  timestamp: Date;
}

/**
 * Currency Transaction schema definition
 */
const GoldTransactionSchema = new Schema<IGoldTransaction>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  currencyType: {
    type: String,
    enum: Object.values(CurrencyType),
    required: true,
    default: CurrencyType.DOLLAR,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  source: {
    type: String,
    enum: Object.values(TransactionSource),
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true,
    min: 0
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },
  // Exchange-specific fields
  exchangeRate: {
    type: Number,
    min: 0
  },
  exchangedFrom: {
    type: String,
    enum: Object.values(CurrencyType)
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

/**
 * Indexes for efficient querying
 */
GoldTransactionSchema.index({ characterId: 1, timestamp: -1 });
GoldTransactionSchema.index({ characterId: 1, currencyType: 1, timestamp: -1 });
GoldTransactionSchema.index({ source: 1, timestamp: -1 });
GoldTransactionSchema.index({ type: 1, timestamp: -1 });
GoldTransactionSchema.index({ currencyType: 1, timestamp: -1 });

/**
 * Gold Transaction model
 */
export const GoldTransaction: Model<IGoldTransaction> = mongoose.model<IGoldTransaction>(
  'GoldTransaction',
  GoldTransactionSchema
);
