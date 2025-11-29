/**
 * Gold Transaction Model
 *
 * Mongoose schema for tracking all gold movements in the game economy
 * Provides complete audit trail for debugging and anti-cheat purposes
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Transaction type enum
 */
export enum TransactionType {
  EARNED = 'EARNED',
  SPENT = 'SPENT',
  TRANSFERRED = 'TRANSFERRED',
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
  STRIKE_RESOLUTION = 'STRIKE_RESOLUTION',

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
}

/**
 * Gold Transaction document interface
 */
export interface IGoldTransaction extends Document {
  characterId: mongoose.Types.ObjectId;
  amount: number; // Positive for EARNED, negative for SPENT
  type: TransactionType;
  source: TransactionSource;
  balanceBefore: number;
  balanceAfter: number;
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
 * Gold Transaction schema definition
 */
const GoldTransactionSchema = new Schema<IGoldTransaction>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
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
GoldTransactionSchema.index({ source: 1, timestamp: -1 });
GoldTransactionSchema.index({ type: 1, timestamp: -1 });

/**
 * Gold Transaction model
 */
export const GoldTransaction: Model<IGoldTransaction> = mongoose.model<IGoldTransaction>(
  'GoldTransaction',
  GoldTransactionSchema
);
