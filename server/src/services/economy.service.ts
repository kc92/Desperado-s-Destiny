/**
 * Economy Service
 * Phase R2: Economy Foundation
 *
 * Manages the game's economic system including:
 * - Market state tracking
 * - Economic event spawning and management
 * - Price calculations with event modifiers
 * - Economy health monitoring
 */

import mongoose from 'mongoose';
import { MarketState, IMarketState } from '../models/MarketState.model';
import { EconomicEvent, IEconomicEvent } from '../models/EconomicEvent.model';
import { ItemTransaction } from '../models/ItemTransaction.model';
import { PriceHistory } from '../models/PriceHistory.model';
import {
  EconomicEventType,
  EconomicEventSeverity,
  EconomyItemCategory,
  MarketSentiment,
  LiquidityLevel,
  EconomyReport,
  EconomyTickResult,
  EconomicEventConfig,
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

// =============================================================================
// ECONOMIC EVENT CONFIGURATIONS
// =============================================================================

/**
 * Configuration for each economic event type
 */
export const ECONOMIC_EVENT_CONFIGS: EconomicEventConfig[] = [
  // Positive events
  {
    type: EconomicEventType.GOLD_RUSH,
    name: 'Gold Rush',
    description: 'Word of a new gold strike has miners flooding the territory. Mining equipment prices soar!',
    baseSpawnChance: 0.02,
    minSeverity: 1,
    maxSeverity: 3,
    minDurationHours: 12,
    maxDurationHours: 48,
    priceModifiers: [
      { category: EconomyItemCategory.MINING, modifier: 40, description: 'Mining equipment in high demand' },
      { category: EconomyItemCategory.TOOLS, modifier: 25, description: 'Tools selling fast' },
      { category: EconomyItemCategory.PROVISIONS, modifier: 15, description: 'Miners need supplies' },
    ],
    exclusiveWith: [EconomicEventType.MINING_STRIKE],
  },
  {
    type: EconomicEventType.TRADE_BOOM,
    name: 'Trade Boom',
    description: 'Increased trade activity along the frontier has lowered prices on many goods.',
    baseSpawnChance: 0.03,
    minSeverity: 1,
    maxSeverity: 2,
    minDurationHours: 24,
    maxDurationHours: 72,
    priceModifiers: [
      { category: EconomyItemCategory.ALL, modifier: -10, description: 'Goods flowing freely' },
      { category: EconomyItemCategory.LUXURY, modifier: -20, description: 'Luxury items more accessible' },
    ],
    exclusiveWith: [EconomicEventType.BANDIT_BLOCKADE],
  },
  {
    type: EconomicEventType.RAILROAD_EXPANSION,
    name: 'Railroad Expansion',
    description: 'The railroad is expanding! Construction supplies and workers are in high demand.',
    baseSpawnChance: 0.015,
    minSeverity: 2,
    maxSeverity: 3,
    minDurationHours: 48,
    maxDurationHours: 96,
    priceModifiers: [
      { category: EconomyItemCategory.MATERIALS, modifier: 35, description: 'Construction materials scarce' },
      { category: EconomyItemCategory.TOOLS, modifier: 20, description: 'Tools in demand' },
    ],
  },
  {
    type: EconomicEventType.CATTLE_BOOM,
    name: 'Cattle Boom',
    description: 'High beef prices in the East have ranchers expanding their herds.',
    baseSpawnChance: 0.025,
    minSeverity: 1,
    maxSeverity: 2,
    minDurationHours: 24,
    maxDurationHours: 72,
    priceModifiers: [
      { category: EconomyItemCategory.LIVESTOCK, modifier: 30, description: 'Cattle prices up' },
      { category: EconomyItemCategory.PROVISIONS, modifier: -15, description: 'Meat prices down' },
    ],
  },
  {
    type: EconomicEventType.HARVEST_BOUNTY,
    name: 'Harvest Bounty',
    description: 'A bumper crop has flooded the market with cheap provisions.',
    baseSpawnChance: 0.03,
    minSeverity: 1,
    maxSeverity: 2,
    minDurationHours: 48,
    maxDurationHours: 96,
    priceModifiers: [
      { category: EconomyItemCategory.PROVISIONS, modifier: -25, description: 'Food prices plummet' },
    ],
    exclusiveWith: [EconomicEventType.DROUGHT],
  },

  // Negative events
  {
    type: EconomicEventType.DROUGHT,
    name: 'Drought',
    description: 'A severe drought is affecting the territory. Water and provisions are scarce.',
    baseSpawnChance: 0.02,
    minSeverity: 1,
    maxSeverity: 3,
    minDurationHours: 48,
    maxDurationHours: 120,
    priceModifiers: [
      { category: EconomyItemCategory.PROVISIONS, modifier: 45, description: 'Food and water scarce' },
      { category: EconomyItemCategory.LIVESTOCK, modifier: -20, description: 'Ranchers selling off herds' },
    ],
    exclusiveWith: [EconomicEventType.HARVEST_BOUNTY],
  },
  {
    type: EconomicEventType.BANK_PANIC,
    name: 'Bank Panic',
    description: 'Rumors of bank failures have people hoarding cash. Credit is tight.',
    baseSpawnChance: 0.01,
    minSeverity: 2,
    maxSeverity: 3,
    minDurationHours: 24,
    maxDurationHours: 72,
    priceModifiers: [
      { category: EconomyItemCategory.ALL, modifier: -20, description: 'Sellers desperate for cash' },
      { category: EconomyItemCategory.LUXURY, modifier: -40, description: 'Luxury items unwanted' },
    ],
  },
  {
    type: EconomicEventType.MINING_STRIKE,
    name: 'Mining Strike',
    description: 'Miners have walked off the job. Mining operations are at a standstill.',
    baseSpawnChance: 0.015,
    minSeverity: 1,
    maxSeverity: 2,
    minDurationHours: 24,
    maxDurationHours: 72,
    priceModifiers: [
      { category: EconomyItemCategory.MINING, modifier: -30, description: 'Mining equipment unwanted' },
      { category: EconomyItemCategory.MATERIALS, modifier: 25, description: 'Raw materials getting scarce' },
    ],
    exclusiveWith: [EconomicEventType.GOLD_RUSH],
  },
  {
    type: EconomicEventType.SUPPLY_SHORTAGE,
    name: 'Supply Shortage',
    description: 'Supply lines have been disrupted. General goods are in short supply.',
    baseSpawnChance: 0.025,
    minSeverity: 1,
    maxSeverity: 3,
    minDurationHours: 12,
    maxDurationHours: 48,
    priceModifiers: [
      { category: EconomyItemCategory.PROVISIONS, modifier: 30, description: 'Basic supplies scarce' },
      { category: EconomyItemCategory.MEDICINE, modifier: 35, description: 'Medicine hard to find' },
      { category: EconomyItemCategory.AMMUNITION, modifier: 25, description: 'Ammo running low' },
    ],
  },
  {
    type: EconomicEventType.BANDIT_BLOCKADE,
    name: 'Bandit Blockade',
    description: 'Bandits are attacking trade routes. Merchants are charging a premium for the risk.',
    baseSpawnChance: 0.02,
    minSeverity: 1,
    maxSeverity: 2,
    minDurationHours: 24,
    maxDurationHours: 72,
    priceModifiers: [
      { category: EconomyItemCategory.ALL, modifier: 15, description: 'Danger premium on all goods' },
      { category: EconomyItemCategory.WEAPONS, modifier: 25, description: 'Weapons in high demand' },
      { category: EconomyItemCategory.AMMUNITION, modifier: 30, description: 'Ammo selling fast' },
    ],
    exclusiveWith: [EconomicEventType.TRADE_BOOM],
  },

  // Neutral/Mixed events
  {
    type: EconomicEventType.TRADE_CARAVAN,
    name: 'Trade Caravan',
    description: 'A merchant caravan has arrived with exotic goods from distant lands.',
    baseSpawnChance: 0.04,
    minSeverity: 1,
    maxSeverity: 1,
    minDurationHours: 6,
    maxDurationHours: 24,
    priceModifiers: [
      { category: EconomyItemCategory.LUXURY, modifier: -25, description: 'Exotic goods available' },
      { category: EconomyItemCategory.CRAFTING, modifier: -15, description: 'Crafting materials plentiful' },
    ],
  },
  {
    type: EconomicEventType.MARKET_SPECULATION,
    name: 'Market Speculation',
    description: 'Speculators are driving up prices on certain goods.',
    baseSpawnChance: 0.03,
    minSeverity: 1,
    maxSeverity: 2,
    minDurationHours: 12,
    maxDurationHours: 36,
    priceModifiers: [
      { category: EconomyItemCategory.MATERIALS, modifier: 20, description: 'Materials being hoarded' },
    ],
  },
  {
    type: EconomicEventType.GOVERNMENT_CONTRACT,
    name: 'Government Contract',
    description: 'The government is buying supplies for a major project.',
    baseSpawnChance: 0.02,
    minSeverity: 1,
    maxSeverity: 2,
    minDurationHours: 24,
    maxDurationHours: 72,
    priceModifiers: [
      { category: EconomyItemCategory.MATERIALS, modifier: 25, description: 'Government buying materials' },
      { category: EconomyItemCategory.PROVISIONS, modifier: 15, description: 'Supplies being requisitioned' },
    ],
  },
  {
    type: EconomicEventType.FOREIGN_INVESTORS,
    name: 'Foreign Investors',
    description: 'Foreign investors are pouring money into the territory.',
    baseSpawnChance: 0.015,
    minSeverity: 2,
    maxSeverity: 3,
    minDurationHours: 48,
    maxDurationHours: 96,
    priceModifiers: [
      { category: EconomyItemCategory.ALL, modifier: 10, description: 'Increased demand across the board' },
      { category: EconomyItemCategory.LUXURY, modifier: 30, description: 'Rich investors want luxury' },
    ],
  },
];

// =============================================================================
// MARKET STATE OPERATIONS
// =============================================================================

/**
 * Get current market state
 */
export async function getMarketState(): Promise<IMarketState> {
  return MarketState.getGlobalState();
}

/**
 * Get market state as a snapshot for API response
 */
export async function getMarketStateSnapshot(): Promise<{
  globalPriceIndex: number;
  volatilityIndex: number;
  liquidityLevel: LiquidityLevel;
  marketSentiment: MarketSentiment;
  activeEventCount: number;
  lastUpdated: Date;
}> {
  const state = await MarketState.getGlobalState();
  const activeEvents = await EconomicEvent.getActiveEvents();

  return {
    globalPriceIndex: state.globalPriceIndex,
    volatilityIndex: state.volatilityIndex,
    liquidityLevel: state.liquidityLevel,
    marketSentiment: state.marketSentiment,
    activeEventCount: activeEvents.length,
    lastUpdated: state.lastUpdated,
  };
}

// =============================================================================
// ECONOMIC EVENT OPERATIONS
// =============================================================================

/**
 * Get all active economic events
 */
export async function getActiveEconomicEvents(): Promise<IEconomicEvent[]> {
  return EconomicEvent.getActiveEvents();
}

/**
 * Get active events for a specific region
 */
export async function getActiveEventsForRegion(regionId: string): Promise<IEconomicEvent[]> {
  return EconomicEvent.getActiveEventsForRegion(regionId);
}

/**
 * Spawn a new economic event
 */
export async function spawnEconomicEvent(
  type: EconomicEventType,
  severity?: EconomicEventSeverity,
  triggeredBy: 'system' | 'admin' | 'player_action' = 'system',
  triggerSource?: string
): Promise<IEconomicEvent> {
  const config = ECONOMIC_EVENT_CONFIGS.find((c) => c.type === type);
  if (!config) {
    throw new Error(`Unknown economic event type: ${type}`);
  }

  // Check for exclusive events
  if (config.exclusiveWith && config.exclusiveWith.length > 0) {
    const activeEvents = await EconomicEvent.getActiveEvents();
    for (const activeEvent of activeEvents) {
      if (config.exclusiveWith.includes(activeEvent.type)) {
        throw new Error(
          `Cannot spawn ${type} while ${activeEvent.type} is active (exclusive events)`
        );
      }
    }
  }

  // Determine severity
  const eventSeverity =
    severity || SecureRNG.range(config.minSeverity, config.maxSeverity) as EconomicEventSeverity;

  // Determine duration
  const durationHours = SecureRNG.range(config.minDurationHours, config.maxDurationHours);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  const event = await EconomicEvent.create({
    type,
    name: config.name,
    description: config.description,
    severity: eventSeverity,
    affectedRegions: config.regionPreferences || ['all'],
    affectedCategories: config.priceModifiers.map((m) => m.category),
    priceModifiers: config.priceModifiers.map((m) => ({
      ...m,
      // Scale modifier by severity
      modifier: Math.round(m.modifier * (0.6 + eventSeverity * 0.2)),
    })),
    duration: durationHours,
    startedAt: now,
    expiresAt,
    isActive: true,
    newsHeadline: `${config.name}: ${config.description.substring(0, 50)}...`,
    triggeredBy,
    triggerSource,
  });

  // Update market state with new event
  const state = await MarketState.getGlobalState();
  state.activeEconomicEvents.push(event._id as mongoose.Types.ObjectId);
  await state.save();

  logger.info(`Spawned economic event: ${config.name} (severity ${eventSeverity}, ${durationHours}h)`);

  return event;
}

/**
 * Try to randomly spawn an economic event based on configured probabilities
 */
export async function trySpawnRandomEvent(): Promise<IEconomicEvent | null> {
  const activeEvents = await EconomicEvent.getActiveEvents();
  const activeTypes = activeEvents.map((e) => e.type);

  // Limit max concurrent events
  if (activeEvents.length >= 3) {
    return null;
  }

  for (const config of ECONOMIC_EVENT_CONFIGS) {
    // Skip if already active
    if (activeTypes.includes(config.type)) {
      continue;
    }

    // Skip if exclusive event is active
    if (config.exclusiveWith?.some((t) => activeTypes.includes(t))) {
      continue;
    }

    // Check spawn chance
    if (SecureRNG.chance(config.baseSpawnChance)) {
      try {
        return await spawnEconomicEvent(config.type);
      } catch (error) {
        logger.warn(`Failed to spawn event ${config.type}:`, error);
      }
    }
  }

  return null;
}

/**
 * Expire old events and clean up market state
 */
export async function expireEvents(): Promise<number> {
  const expiredCount = await EconomicEvent.expireEvents();

  if (expiredCount > 0) {
    // Clean up market state references
    const state = await MarketState.getGlobalState();
    const activeEvents = await EconomicEvent.getActiveEvents();
    state.activeEconomicEvents = activeEvents.map((e) => e._id as mongoose.Types.ObjectId);
    await state.save();

    logger.info(`Expired ${expiredCount} economic events`);
  }

  return expiredCount;
}

// =============================================================================
// PRICE CALCULATIONS
// =============================================================================

/**
 * Calculate price modifier from economic events for a category and region
 */
export async function calculateEventPriceModifier(
  category: EconomyItemCategory,
  regionId?: string
): Promise<number> {
  return EconomicEvent.calculateTotalModifier(category, regionId);
}

/**
 * Apply economic event modifiers to a base price
 */
export async function applyEventModifiers(
  basePrice: number,
  category: EconomyItemCategory,
  regionId?: string
): Promise<number> {
  const modifier = await calculateEventPriceModifier(category, regionId);
  const multiplier = 1 + modifier / 100;
  return Math.max(1, Math.round(basePrice * multiplier));
}

// =============================================================================
// MARKET ANALYTICS
// =============================================================================

/**
 * Update market state based on recent activity
 */
export async function updateMarketState(): Promise<IMarketState> {
  const state = await MarketState.getGlobalState();
  const now = new Date();
  const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get transaction counts for liquidity calculation
  const transactionCount = await ItemTransaction.countDocuments({
    timestamp: { $gte: day24h },
  });

  // Update liquidity level
  if (transactionCount > 500) {
    state.liquidityLevel = LiquidityLevel.HIGH;
  } else if (transactionCount > 100) {
    state.liquidityLevel = LiquidityLevel.MEDIUM;
  } else {
    state.liquidityLevel = LiquidityLevel.LOW;
  }

  // Calculate global price index from category metrics
  let totalIndex = 0;
  let categoryCount = 0;
  for (const [, metric] of state.categoryMetrics) {
    totalIndex += metric.priceIndex;
    categoryCount++;
  }

  if (categoryCount > 0) {
    const newIndex = totalIndex / categoryCount;
    await MarketState.updateGlobalPriceIndex(newIndex);
  }

  // Record hourly snapshot
  await MarketState.recordHourlySnapshot();

  // Check for alerts
  if (state.globalPriceIndex > 130) {
    await MarketState.addAlert('inflation', 'high', 'Global price index exceeds 130 - significant inflation detected');
  } else if (state.globalPriceIndex < 70) {
    await MarketState.addAlert('deflation', 'high', 'Global price index below 70 - significant deflation detected');
  }

  if (state.volatilityIndex > 80) {
    await MarketState.addAlert('volatility', 'high', 'Market volatility exceeding safe levels');
  }

  state.lastUpdated = new Date();
  await state.save();

  return state;
}

/**
 * Generate a comprehensive economy report
 */
export async function getEconomyReport(): Promise<EconomyReport> {
  const state = await MarketState.getGlobalState();
  const activeEvents = await EconomicEvent.getActiveEvents();
  const now = new Date();
  const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get transaction summary
  const transactions = await ItemTransaction.find({
    timestamp: { $gte: day24h },
  });

  const totalVolume = transactions.reduce((sum, t) => sum + t.price * (t.quantity || 1), 0);
  const totalTransactions = transactions.length;
  const averageTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

  // Get top traded items
  const topItems = await PriceHistory.getTopItems(undefined, 10);

  // Get price change leaders
  const trendingItems = await PriceHistory.getTrendingItems(10);

  // Convert category metrics to array
  const categoryMetrics = [];
  for (const [, metric] of state.categoryMetrics) {
    categoryMetrics.push(metric);
  }

  return {
    timestamp: now,
    marketState: {
      id: state._id.toString(),
      lastUpdated: state.lastUpdated,
      globalPriceIndex: state.globalPriceIndex,
      volatilityIndex: state.volatilityIndex,
      liquidityLevel: state.liquidityLevel,
      marketSentiment: state.marketSentiment,
      globalSupplyDemandRatio: state.globalSupplyDemandRatio,
      activeEventCount: activeEvents.length,
      categoryMetrics,
    },
    activeEvents: activeEvents.map((e) => ({
      id: e._id.toString(),
      type: e.type,
      name: e.name,
      description: e.description,
      severity: e.severity,
      affectedRegions: e.affectedRegions,
      priceModifiers: e.priceModifiers,
      duration: e.duration,
      startedAt: e.startedAt,
      expiresAt: e.expiresAt,
      isActive: e.isActive,
    })),
    summary24h: {
      totalTransactions,
      totalVolume,
      averageTransactionValue: Math.round(averageTransactionValue),
      topTradedItems: topItems.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        volume: item.stats.totalVolume,
      })),
      priceChangeLeaders: trendingItems.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        priceChange: item.stats.priceChange24h,
      })),
    },
    alerts: state.alerts
      .filter((a) => !a.acknowledged)
      .map((a) => ({
        type: a.type,
        severity: a.severity,
        message: a.message,
        timestamp: a.timestamp,
      })),
  };
}

// =============================================================================
// ECONOMY TICK (Hourly Update)
// =============================================================================

/**
 * Run the hourly economy tick
 * Called by the economyTick.job.ts
 */
export async function runEconomyTick(): Promise<EconomyTickResult> {
  const startTime = Date.now();
  const alerts: string[] = [];

  try {
    // 1. Expire old events
    const eventsExpired = await expireEvents();
    if (eventsExpired > 0) {
      alerts.push(`Expired ${eventsExpired} economic events`);
    }

    // 2. Try to spawn new random events
    let eventsSpawned = 0;
    const spawnedEvent = await trySpawnRandomEvent();
    if (spawnedEvent) {
      eventsSpawned++;
      alerts.push(`Spawned new event: ${spawnedEvent.name}`);
    }

    // 3. Update market state
    await updateMarketState();

    // 4. Update category price indexes
    const priceHistories = await PriceHistory.find({
      lastSaleAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    for (const history of priceHistories) {
      try {
        await (PriceHistory as any).updateStats(history.itemId);
      } catch (error) {
        logger.warn(`Failed to update price history for ${history.itemId}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`Economy tick completed in ${duration}ms`);

    return {
      timestamp: new Date(),
      marketStateUpdated: true,
      eventsSpawned,
      eventsExpired,
      priceIndexesUpdated: priceHistories.length,
      alerts,
    };
  } catch (error) {
    logger.error('Economy tick failed:', error);
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Market state
  getMarketState,
  getMarketStateSnapshot,
  updateMarketState,

  // Economic events
  getActiveEconomicEvents,
  getActiveEventsForRegion,
  spawnEconomicEvent,
  trySpawnRandomEvent,
  expireEvents,

  // Price calculations
  calculateEventPriceModifier,
  applyEventModifiers,

  // Reports
  getEconomyReport,

  // Tick
  runEconomyTick,

  // Config
  ECONOMIC_EVENT_CONFIGS,
};
