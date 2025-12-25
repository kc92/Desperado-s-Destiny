/**
 * Economy Types
 * Phase R2: Economy Foundation
 *
 * Types for the event-driven economy system
 */

/**
 * Economic event types that affect market prices
 */
export enum EconomicEventType {
  // Positive market events
  GOLD_RUSH = 'gold_rush',
  TRADE_BOOM = 'trade_boom',
  RAILROAD_EXPANSION = 'railroad_expansion',
  CATTLE_BOOM = 'cattle_boom',
  HARVEST_BOUNTY = 'harvest_bounty',

  // Negative market events
  DROUGHT = 'drought',
  BANK_PANIC = 'bank_panic',
  MINING_STRIKE = 'mining_strike',
  SUPPLY_SHORTAGE = 'supply_shortage',
  BANDIT_BLOCKADE = 'bandit_blockade',

  // Neutral/Mixed events
  TRADE_CARAVAN = 'trade_caravan',
  MARKET_SPECULATION = 'market_speculation',
  GOVERNMENT_CONTRACT = 'government_contract',
  FOREIGN_INVESTORS = 'foreign_investors',
}

/**
 * Market sentiment indicators
 */
export enum MarketSentiment {
  BULLISH = 'bullish',
  NEUTRAL = 'neutral',
  BEARISH = 'bearish',
}

/**
 * Liquidity levels in the market
 */
export enum LiquidityLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Item categories affected by economic events
 */
export enum EconomyItemCategory {
  WEAPONS = 'weapons',
  AMMUNITION = 'ammunition',
  PROVISIONS = 'provisions',
  MATERIALS = 'materials',
  CRAFTING = 'crafting',
  LUXURY = 'luxury',
  LIVESTOCK = 'livestock',
  MINING = 'mining',
  MEDICINE = 'medicine',
  TOOLS = 'tools',
  ALL = 'all',
}

/**
 * Price modifier applied by an economic event
 */
export interface EconomicPriceModifier {
  category: EconomyItemCategory;
  modifier: number; // Percentage: -50 to +100
  description: string;
}

/**
 * Economic event severity levels
 */
export type EconomicEventSeverity = 1 | 2 | 3;

/**
 * Economic event interface (for API responses)
 */
export interface EconomicEvent {
  id: string;
  type: EconomicEventType;
  name: string;
  description: string;
  severity: EconomicEventSeverity;
  affectedRegions: string[]; // 'all' or specific region IDs
  priceModifiers: EconomicPriceModifier[];
  duration: number; // Hours
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

/**
 * Category-level market metrics
 */
export interface CategoryMetric {
  category: EconomyItemCategory;
  priceIndex: number; // 100 = baseline
  volume24h: number;
  transactionCount: number;
  averagePrice: number;
  trend: 'rising' | 'stable' | 'falling';
}

/**
 * Global market state snapshot
 */
export interface MarketStateSnapshot {
  id: string;
  lastUpdated: Date;

  // Global indicators
  globalPriceIndex: number; // 100 = baseline
  volatilityIndex: number; // 0-100
  liquidityLevel: LiquidityLevel;
  marketSentiment: MarketSentiment;

  // Supply/Demand
  globalSupplyDemandRatio: number;

  // Active economic events
  activeEventCount: number;

  // Category metrics
  categoryMetrics: CategoryMetric[];
}

/**
 * Economy report for admin dashboard
 */
export interface EconomyReport {
  timestamp: Date;
  marketState: MarketStateSnapshot;
  activeEvents: EconomicEvent[];

  // 24h summary
  summary24h: {
    totalTransactions: number;
    totalVolume: number;
    averageTransactionValue: number;
    topTradedItems: {
      itemId: string;
      itemName: string;
      volume: number;
    }[];
    priceChangeLeaders: {
      itemId: string;
      itemName: string;
      priceChange: number;
    }[];
  };

  // Alerts
  alerts: {
    type: 'inflation' | 'deflation' | 'volatility' | 'liquidity' | 'exploit';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: Date;
  }[];
}

/**
 * Economic event spawn configuration
 */
export interface EconomicEventConfig {
  type: EconomicEventType;
  name: string;
  description: string;
  baseSpawnChance: number; // 0-1
  minSeverity: EconomicEventSeverity;
  maxSeverity: EconomicEventSeverity;
  minDurationHours: number;
  maxDurationHours: number;
  priceModifiers: EconomicPriceModifier[];
  regionPreferences?: string[]; // Preferred regions for this event
  exclusiveWith?: EconomicEventType[]; // Can't coexist with these events
}

/**
 * Economy tick result
 */
export interface EconomyTickResult {
  timestamp: Date;
  marketStateUpdated: boolean;
  eventsSpawned: number;
  eventsExpired: number;
  priceIndexesUpdated: number;
  alerts: string[];
}
