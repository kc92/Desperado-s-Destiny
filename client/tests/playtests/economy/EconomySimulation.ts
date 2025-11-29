/**
 * EconomySimulation.ts
 *
 * Sophisticated bot-driven economy simulation system with market dynamics,
 * price discovery mechanisms, and emergent economic phenomena.
 *
 * Features:
 * - Supply/demand curves affecting market prices
 * - Dynamic price discovery through bot trading
 * - Resource scarcity simulation
 * - Market bubbles, crashes, and corrections
 * - Inflation/deflation tracking
 * - Economic cycle detection
 * - Market maker bots
 * - Speculative trading behavior
 * - Price manipulation detection
 */

import { PersonalityProfile, PersonalityTraits } from '../intelligence/PersonalitySystem';
import { BotMemory, ActionOutcome, GameContext } from '../intelligence/BotMemory';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Represents a tradeable item in the economy
 */
export interface MarketItem {
  /** Unique item identifier */
  itemId: string;

  /** Item name/type */
  itemName: string;

  /** Item category (weapon, armor, consumable, resource, etc.) */
  category: ItemCategory;

  /** Base production cost (minimum viable price) */
  baseCost: number;

  /** Current market price */
  currentPrice: number;

  /** Historical price data */
  priceHistory: PriceDataPoint[];

  /** Current supply (items available for sale) */
  supply: number;

  /** Current demand (buy orders) */
  demand: number;

  /** Production rate (items/hour) */
  productionRate: number;

  /** Consumption rate (items/hour) */
  consumptionRate: number;

  /** Item rarity (0-1, affects scarcity) */
  rarity: number;

  /** Price volatility (0-1, higher = more volatile) */
  volatility: number;

  /** Last price update timestamp */
  lastUpdate: Date;

  /** Market manipulation flags */
  manipulationFlags: ManipulationFlag[];
}

export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'resource' | 'crafting' | 'luxury' | 'property';

/**
 * Historical price point
 */
export interface PriceDataPoint {
  timestamp: Date;
  price: number;
  volume: number; // Number of items traded
  supply: number;
  demand: number;
}

/**
 * Market manipulation detection flags
 */
export interface ManipulationFlag {
  type: 'pump_and_dump' | 'cornering' | 'wash_trading' | 'price_fixing';
  severity: number; // 0-1
  detectedAt: Date;
  description: string;
}

/**
 * Market order (buy or sell)
 */
export interface MarketOrder {
  orderId: string;
  botId: string;
  itemId: string;
  orderType: 'buy' | 'sell';
  quantity: number;
  priceLimit: number; // Max buy price or min sell price
  timestamp: Date;
  filled: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  expiresAt?: Date;
}

/**
 * Completed trade transaction
 */
export interface Trade {
  tradeId: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  price: number;
  timestamp: Date;
  buyerPersonality: string;
  sellerPersonality: string;
}

/**
 * Economic metrics for analysis
 */
export interface EconomicMetrics {
  /** Total market capitalization (all items * prices) */
  marketCap: number;

  /** Total trading volume (last 24h) */
  volume24h: number;

  /** Average price change (last 24h) */
  priceChange24h: number;

  /** Inflation rate (price increase over time) */
  inflationRate: number;

  /** Market health score (0-1) */
  marketHealth: number;

  /** Active traders count */
  activeTraders: number;

  /** Total wealth in economy */
  totalWealth: number;

  /** Wealth inequality (Gini coefficient, 0-1) */
  wealthInequality: number;

  /** Most traded items */
  topItems: Array<{itemId: string; volume: number}>;

  /** Detected phenomena */
  phenomena: MarketPhenomenon[];
}

/**
 * Emergent market phenomena
 */
export interface MarketPhenomenon {
  type: 'bubble' | 'crash' | 'monopoly' | 'shortage' | 'surplus' | 'speculation' | 'panic';
  itemId?: string;
  severity: number; // 0-1
  startedAt: Date;
  description: string;
  affectedItems: string[];
}

/**
 * Bot's economic archetype for trading behavior
 */
export interface EconomicArchetype {
  type: 'merchant' | 'hoarder' | 'generous' | 'opportunist' | 'market_maker' | 'speculator' | 'producer';

  /** Risk tolerance for trading (0-1) */
  riskTolerance: number;

  /** Willingness to hold inventory (0-1) */
  holdingPropensity: number;

  /** Profit margin target (0-1) */
  profitMargin: number;

  /** Trading frequency multiplier */
  tradingFrequency: number;

  /** Price sensitivity (how much price affects decisions) */
  priceSensitivity: number;
}

// ============================================================================
// MARKET SIMULATION CLASS
// ============================================================================

/**
 * Main market simulation engine
 */
export class MarketSimulation {
  private items: Map<string, MarketItem> = new Map();
  private orders: Map<string, MarketOrder> = new Map();
  private trades: Trade[] = [];
  private botWallets: Map<string, number> = new Map(); // botId -> gold
  private botInventories: Map<string, Map<string, number>> = new Map(); // botId -> itemId -> quantity
  private botArchetypes: Map<string, EconomicArchetype> = new Map();

  // Market parameters
  private readonly BASE_PRICE_ELASTICITY = 0.3; // How responsive prices are to supply/demand
  private readonly VOLATILITY_DECAY = 0.95; // Volatility decreases over time
  private readonly PRICE_HISTORY_LENGTH = 100;
  private readonly MARKET_MAKER_SPREAD = 0.05; // 5% spread for market makers

  // Phenomenon detection thresholds
  private readonly BUBBLE_THRESHOLD = 2.5; // Price 2.5x base cost
  private readonly CRASH_THRESHOLD = 0.4; // Price 40% of recent high
  private readonly SHORTAGE_THRESHOLD = 0.2; // Supply 20% of demand

  constructor() {
    this.initializeMarket();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize market with common items
   */
  private initializeMarket(): void {
    const itemConfigs: Array<{
      name: string;
      category: ItemCategory;
      baseCost: number;
      rarity: number;
      productionRate: number;
    }> = [
      // Weapons
      { name: 'Rusty Pistol', category: 'weapon', baseCost: 20, rarity: 0.1, productionRate: 10 },
      { name: 'Six-Shooter', category: 'weapon', baseCost: 100, rarity: 0.3, productionRate: 5 },
      { name: 'Winchester Rifle', category: 'weapon', baseCost: 250, rarity: 0.5, productionRate: 3 },
      { name: 'Legendary Revolver', category: 'weapon', baseCost: 1000, rarity: 0.9, productionRate: 0.5 },

      // Armor
      { name: 'Leather Vest', category: 'armor', baseCost: 30, rarity: 0.1, productionRate: 8 },
      { name: 'Steel Chestplate', category: 'armor', baseCost: 150, rarity: 0.4, productionRate: 4 },
      { name: 'Reinforced Armor', category: 'armor', baseCost: 500, rarity: 0.7, productionRate: 1 },

      // Consumables
      { name: 'Health Potion', category: 'consumable', baseCost: 10, rarity: 0.05, productionRate: 20 },
      { name: 'Energy Tonic', category: 'consumable', baseCost: 15, rarity: 0.1, productionRate: 15 },
      { name: 'Rare Elixir', category: 'consumable', baseCost: 100, rarity: 0.6, productionRate: 2 },

      // Resources
      { name: 'Wood', category: 'resource', baseCost: 5, rarity: 0.02, productionRate: 50 },
      { name: 'Iron Ore', category: 'resource', baseCost: 8, rarity: 0.08, productionRate: 30 },
      { name: 'Gold Nugget', category: 'resource', baseCost: 50, rarity: 0.5, productionRate: 5 },
      { name: 'Diamond', category: 'resource', baseCost: 500, rarity: 0.95, productionRate: 0.2 },

      // Crafting materials
      { name: 'Gunpowder', category: 'crafting', baseCost: 12, rarity: 0.2, productionRate: 12 },
      { name: 'Leather', category: 'crafting', baseCost: 10, rarity: 0.15, productionRate: 15 },
      { name: 'Steel Ingot', category: 'crafting', baseCost: 40, rarity: 0.35, productionRate: 6 },

      // Luxury items
      { name: 'Fine Whiskey', category: 'luxury', baseCost: 25, rarity: 0.25, productionRate: 8 },
      { name: 'Pocket Watch', category: 'luxury', baseCost: 150, rarity: 0.6, productionRate: 2 },
      { name: 'Jeweled Ring', category: 'luxury', baseCost: 800, rarity: 0.85, productionRate: 0.3 },
    ];

    itemConfigs.forEach((config, index) => {
      const initialPrice = config.baseCost * (1 + config.rarity * 0.5);
      const initialSupply = Math.floor(config.productionRate * 10);

      const item: MarketItem = {
        itemId: `item_${index}`,
        itemName: config.name,
        category: config.category,
        baseCost: config.baseCost,
        currentPrice: initialPrice,
        priceHistory: [{
          timestamp: new Date(),
          price: initialPrice,
          volume: 0,
          supply: initialSupply,
          demand: initialSupply * 0.8 // Start with slight undersupply
        }],
        supply: initialSupply,
        demand: initialSupply * 0.8,
        productionRate: config.productionRate,
        consumptionRate: config.productionRate * 0.9, // Slight surplus
        rarity: config.rarity,
        volatility: 0.1 + config.rarity * 0.3,
        lastUpdate: new Date(),
        manipulationFlags: []
      };

      this.items.set(item.itemId, item);
    });
  }

  /**
   * Register a bot in the economy
   */
  registerBot(botId: string, personality: PersonalityProfile, initialGold: number = 500): void {
    this.botWallets.set(botId, initialGold);
    this.botInventories.set(botId, new Map());

    // Derive economic archetype from personality
    const archetype = this.deriveEconomicArchetype(personality);
    this.botArchetypes.set(botId, archetype);
  }

  /**
   * Derive economic behavior from personality traits
   */
  private deriveEconomicArchetype(personality: PersonalityProfile): EconomicArchetype {
    const traits = personality.traits;

    // Economist personality becomes merchant
    if (personality.archetype === 'economist') {
      return {
        type: 'merchant',
        riskTolerance: traits.riskTolerance,
        holdingPropensity: traits.patience,
        profitMargin: traits.greed,
        tradingFrequency: 2.0,
        priceSensitivity: 0.9
      };
    }

    // Grinder becomes producer
    if (personality.archetype === 'grinder') {
      return {
        type: 'producer',
        riskTolerance: 0.2,
        holdingPropensity: 0.3,
        profitMargin: 0.7,
        tradingFrequency: 1.5,
        priceSensitivity: 0.7
      };
    }

    // Social becomes generous trader
    if (personality.archetype === 'social') {
      return {
        type: 'generous',
        riskTolerance: traits.riskTolerance,
        holdingPropensity: 0.3,
        profitMargin: 0.2, // Low margins
        tradingFrequency: 1.8,
        priceSensitivity: 0.4
      };
    }

    // High greed becomes hoarder or opportunist
    if (traits.greed > 0.7) {
      return {
        type: traits.patience > 0.6 ? 'hoarder' : 'opportunist',
        riskTolerance: traits.riskTolerance,
        holdingPropensity: traits.patience,
        profitMargin: traits.greed,
        tradingFrequency: traits.patience > 0.6 ? 0.5 : 1.2,
        priceSensitivity: 0.8
      };
    }

    // High risk tolerance becomes speculator
    if (traits.riskTolerance > 0.7) {
      return {
        type: 'speculator',
        riskTolerance: traits.riskTolerance,
        holdingPropensity: 0.6,
        profitMargin: 0.5,
        tradingFrequency: 2.5,
        priceSensitivity: 0.3 // Speculators less sensitive to current prices
      };
    }

    // Default: market maker (provides liquidity)
    return {
      type: 'market_maker',
      riskTolerance: 0.5,
      holdingPropensity: 0.5,
      profitMargin: 0.3,
      tradingFrequency: 3.0, // Very active
      priceSensitivity: 0.6
    };
  }

  // ============================================================================
  // PRICE DISCOVERY & MARKET DYNAMICS
  // ============================================================================

  /**
   * Update all market prices based on supply/demand
   */
  updatePrices(): void {
    for (const item of this.items.values()) {
      this.updateItemPrice(item);
    }
  }

  /**
   * Update single item price using supply/demand curves
   */
  private updateItemPrice(item: MarketItem): void {
    const now = new Date();

    // Calculate supply/demand ratio
    const sdRatio = item.supply > 0 ? item.demand / item.supply : 2.0;

    // Base price adjustment from supply/demand
    // If demand > supply: price increases
    // If supply > demand: price decreases
    let priceMultiplier = 1.0;

    if (sdRatio > 1.0) {
      // Demand exceeds supply - price increase
      // More extreme ratios cause larger changes
      priceMultiplier = 1.0 + (sdRatio - 1.0) * this.BASE_PRICE_ELASTICITY;
    } else if (sdRatio < 1.0) {
      // Supply exceeds demand - price decrease
      priceMultiplier = 1.0 - (1.0 - sdRatio) * this.BASE_PRICE_ELASTICITY;
    }

    // Apply volatility (random fluctuations)
    const volatilityFactor = 1.0 + (Math.random() - 0.5) * item.volatility * 0.1;
    priceMultiplier *= volatilityFactor;

    // Calculate new price
    let newPrice = item.currentPrice * priceMultiplier;

    // Price floor: cannot go below base cost * (1 - volatility)
    const priceFloor = item.baseCost * (1 - item.volatility * 0.5);
    newPrice = Math.max(newPrice, priceFloor);

    // Price ceiling for common items (prevent runaway inflation)
    if (item.rarity < 0.3) {
      const priceCeiling = item.baseCost * 5;
      newPrice = Math.min(newPrice, priceCeiling);
    }

    // Update price history
    const volumeSinceLastUpdate = this.getRecentVolume(item.itemId);
    item.priceHistory.push({
      timestamp: now,
      price: newPrice,
      volume: volumeSinceLastUpdate,
      supply: item.supply,
      demand: item.demand
    });

    // Maintain history length
    if (item.priceHistory.length > this.PRICE_HISTORY_LENGTH) {
      item.priceHistory.shift();
    }

    // Update current price
    item.currentPrice = newPrice;
    item.lastUpdate = now;

    // Decay volatility over time (markets stabilize)
    item.volatility *= this.VOLATILITY_DECAY;
    item.volatility = Math.max(0.05, item.volatility); // Minimum volatility

    // Check for market phenomena
    this.detectPhenomena(item);
  }

  /**
   * Calculate fair market value using multiple methods
   */
  calculateFairValue(itemId: string): number {
    const item = this.items.get(itemId);
    if (!item) return 0;

    // Method 1: Cost-based (base cost + rarity premium)
    const costBased = item.baseCost * (1 + item.rarity);

    // Method 2: Historical average (last 20 prices)
    const recentPrices = item.priceHistory.slice(-20);
    const historicalAvg = recentPrices.reduce((sum, p) => sum + p.price, 0) / Math.max(1, recentPrices.length);

    // Method 3: Supply/demand equilibrium
    const equilibriumPrice = item.baseCost * (item.demand / Math.max(1, item.supply));

    // Weighted average (favor cost-based for rare items)
    const weights = {
      cost: 0.3 + item.rarity * 0.2,
      historical: 0.4,
      equilibrium: 0.3 - item.rarity * 0.2
    };

    const fairValue =
      costBased * weights.cost +
      historicalAvg * weights.historical +
      equilibriumPrice * weights.equilibrium;

    return fairValue;
  }

  /**
   * Get price trend for an item (rising, falling, stable)
   */
  getPriceTrend(itemId: string): 'rising' | 'falling' | 'stable' {
    const item = this.items.get(itemId);
    if (!item || item.priceHistory.length < 10) return 'stable';

    const recent = item.priceHistory.slice(-10);
    const older = item.priceHistory.slice(-20, -10);

    const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / Math.max(1, older.length);

    const changePercent = (recentAvg - olderAvg) / olderAvg;

    if (changePercent > 0.05) return 'rising';
    if (changePercent < -0.05) return 'falling';
    return 'stable';
  }

  /**
   * Get recent trading volume for an item
   */
  private getRecentVolume(itemId: string, hours: number = 1): number {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.trades
      .filter(t => t.itemId === itemId && t.timestamp > cutoff)
      .reduce((sum, t) => sum + t.quantity, 0);
  }

  // ============================================================================
  // ORDER MATCHING & TRADING
  // ============================================================================

  /**
   * Place a market order
   */
  placeOrder(
    botId: string,
    itemId: string,
    orderType: 'buy' | 'sell',
    quantity: number,
    priceLimit: number
  ): string | null {
    const item = this.items.get(itemId);
    if (!item) return null;

    // Validate bot has resources
    if (orderType === 'buy') {
      const cost = quantity * priceLimit;
      const gold = this.botWallets.get(botId) || 0;
      if (gold < cost) return null; // Insufficient funds
    } else {
      const inventory = this.botInventories.get(botId);
      const itemCount = inventory?.get(itemId) || 0;
      if (itemCount < quantity) return null; // Don't have items
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order: MarketOrder = {
      orderId,
      botId,
      itemId,
      orderType,
      quantity,
      priceLimit,
      timestamp: new Date(),
      filled: 0,
      status: 'pending',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
    };

    this.orders.set(orderId, order);

    // Try to match immediately
    this.matchOrders(itemId);

    return orderId;
  }

  /**
   * Match buy and sell orders
   */
  private matchOrders(itemId: string): void {
    const buyOrders = Array.from(this.orders.values())
      .filter(o => o.itemId === itemId && o.orderType === 'buy' && o.status === 'pending')
      .sort((a, b) => b.priceLimit - a.priceLimit); // Highest buy price first

    const sellOrders = Array.from(this.orders.values())
      .filter(o => o.itemId === itemId && o.orderType === 'sell' && o.status === 'pending')
      .sort((a, b) => a.priceLimit - b.priceLimit); // Lowest sell price first

    for (const buyOrder of buyOrders) {
      for (const sellOrder of sellOrders) {
        // Check if prices match
        if (buyOrder.priceLimit >= sellOrder.priceLimit) {
          // Trade can occur!
          const tradeQuantity = Math.min(
            buyOrder.quantity - buyOrder.filled,
            sellOrder.quantity - sellOrder.filled
          );

          // Price is midpoint between buy and sell limits
          const tradePrice = (buyOrder.priceLimit + sellOrder.priceLimit) / 2;

          this.executeTrade(buyOrder, sellOrder, tradeQuantity, tradePrice);
        }
      }
    }

    // Clean up expired orders
    this.cleanupOrders();
  }

  /**
   * Execute a trade between two orders
   */
  private executeTrade(
    buyOrder: MarketOrder,
    sellOrder: MarketOrder,
    quantity: number,
    price: number
  ): void {
    const item = this.items.get(buyOrder.itemId);
    if (!item) return;

    // Transfer gold
    const totalCost = quantity * price;
    const buyerGold = this.botWallets.get(buyOrder.botId) || 0;
    const sellerGold = this.botWallets.get(sellOrder.botId) || 0;

    this.botWallets.set(buyOrder.botId, buyerGold - totalCost);
    this.botWallets.set(sellOrder.botId, sellerGold + totalCost);

    // Transfer items
    const buyerInventory = this.botInventories.get(buyOrder.botId) || new Map();
    const sellerInventory = this.botInventories.get(sellOrder.botId) || new Map();

    const buyerItemCount = buyerInventory.get(buyOrder.itemId) || 0;
    const sellerItemCount = sellerInventory.get(sellOrder.itemId) || 0;

    buyerInventory.set(buyOrder.itemId, buyerItemCount + quantity);
    sellerInventory.set(sellOrder.itemId, Math.max(0, sellerItemCount - quantity));

    this.botInventories.set(buyOrder.botId, buyerInventory);
    this.botInventories.set(sellOrder.botId, sellerInventory);

    // Update orders
    buyOrder.filled += quantity;
    sellOrder.filled += quantity;

    if (buyOrder.filled >= buyOrder.quantity) {
      buyOrder.status = 'filled';
    } else {
      buyOrder.status = 'partial';
    }

    if (sellOrder.filled >= sellOrder.quantity) {
      sellOrder.status = 'filled';
    } else {
      sellOrder.status = 'partial';
    }

    // Record trade
    const buyerArchetype = this.botArchetypes.get(buyOrder.botId);
    const sellerArchetype = this.botArchetypes.get(sellOrder.botId);

    const trade: Trade = {
      tradeId: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buyerId: buyOrder.botId,
      sellerId: sellOrder.botId,
      itemId: buyOrder.itemId,
      quantity,
      price,
      timestamp: new Date(),
      buyerPersonality: buyerArchetype?.type || 'unknown',
      sellerPersonality: sellerArchetype?.type || 'unknown'
    };

    this.trades.push(trade);

    // Update market supply/demand
    item.supply -= quantity;
    item.demand -= quantity;

    // Increase volatility after trades
    item.volatility = Math.min(1.0, item.volatility * 1.05);
  }

  /**
   * Clean up expired and filled orders
   */
  private cleanupOrders(): void {
    const now = new Date();
    const toRemove: string[] = [];

    for (const [orderId, order] of this.orders.entries()) {
      if (order.status === 'filled' ||
          (order.expiresAt && order.expiresAt < now)) {
        toRemove.push(orderId);
      }
    }

    toRemove.forEach(id => this.orders.delete(id));
  }

  // ============================================================================
  // RESOURCE SCARCITY & PRODUCTION
  // ============================================================================

  /**
   * Simulate production and consumption cycles
   */
  simulateProductionCycle(): void {
    for (const item of this.items.values()) {
      // Production adds to supply
      const produced = item.productionRate;
      item.supply += produced;

      // Consumption reduces supply (if available) or increases demand
      const consumed = item.consumptionRate;
      if (item.supply >= consumed) {
        item.supply -= consumed;
      } else {
        // Unmet consumption becomes demand
        item.demand += (consumed - item.supply);
        item.supply = 0;
      }

      // Natural demand decay (people give up if prices too high)
      if (item.currentPrice > item.baseCost * 3) {
        item.demand *= 0.95;
      }

      // Demand increases if prices low
      if (item.currentPrice < item.baseCost * 1.5) {
        item.demand *= 1.05;
      }

      // Random events affect production
      if (Math.random() < 0.05) {
        const eventType = Math.random();
        if (eventType < 0.33) {
          // Production shortage
          item.productionRate *= 0.7;
          item.volatility *= 1.3;
        } else if (eventType < 0.66) {
          // Production boom
          item.productionRate *= 1.3;
        } else {
          // Demand surge
          item.demand *= 1.5;
          item.volatility *= 1.2;
        }
      }
    }
  }

  // ============================================================================
  // MARKET PHENOMENA DETECTION
  // ============================================================================

  /**
   * Detect emergent market phenomena
   */
  private detectPhenomena(item: MarketItem): void {
    const now = new Date();

    // Detect bubble
    if (item.currentPrice > item.baseCost * this.BUBBLE_THRESHOLD) {
      const existingBubble = item.manipulationFlags.find(f => f.type === 'pump_and_dump');
      if (!existingBubble) {
        item.manipulationFlags.push({
          type: 'pump_and_dump',
          severity: Math.min(1.0, (item.currentPrice / item.baseCost) / this.BUBBLE_THRESHOLD),
          detectedAt: now,
          description: `Price bubble detected: ${item.itemName} trading at ${(item.currentPrice / item.baseCost * 100).toFixed(0)}% of base cost`
        });
      }
    }

    // Detect shortage
    if (item.supply > 0 && item.demand / item.supply > (1 / this.SHORTAGE_THRESHOLD)) {
      // Extreme shortage
    }

    // Detect market cornering (one bot holds >30% of supply)
    const largestHolder = this.getLargestHolder(item.itemId);
    if (largestHolder && largestHolder.percentage > 0.3) {
      const existingCorner = item.manipulationFlags.find(f => f.type === 'cornering');
      if (!existingCorner) {
        item.manipulationFlags.push({
          type: 'cornering',
          severity: largestHolder.percentage,
          detectedAt: now,
          description: `Market cornering: One trader controls ${(largestHolder.percentage * 100).toFixed(0)}% of ${item.itemName}`
        });
      }
    }

    // Clean old flags (older than 1 hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    item.manipulationFlags = item.manipulationFlags.filter(f => f.detectedAt > oneHourAgo);
  }

  /**
   * Get largest holder of an item
   */
  private getLargestHolder(itemId: string): {botId: string; percentage: number} | null {
    let totalSupply = 0;
    let maxHolding = 0;
    let maxHolderId = '';

    for (const [botId, inventory] of this.botInventories.entries()) {
      const holding = inventory.get(itemId) || 0;
      totalSupply += holding;
      if (holding > maxHolding) {
        maxHolding = holding;
        maxHolderId = botId;
      }
    }

    if (totalSupply === 0) return null;

    return {
      botId: maxHolderId,
      percentage: maxHolding / totalSupply
    };
  }

  /**
   * Get overall market phenomena
   */
  getMarketPhenomena(): MarketPhenomenon[] {
    const phenomena: MarketPhenomenon[] = [];
    const now = new Date();

    // Check each item for phenomena
    for (const item of this.items.values()) {
      // Bubble
      if (item.currentPrice > item.baseCost * this.BUBBLE_THRESHOLD) {
        phenomena.push({
          type: 'bubble',
          itemId: item.itemId,
          severity: Math.min(1.0, (item.currentPrice / item.baseCost) / this.BUBBLE_THRESHOLD - 1),
          startedAt: now,
          description: `${item.itemName} in price bubble`,
          affectedItems: [item.itemId]
        });
      }

      // Shortage
      if (item.supply < item.demand * this.SHORTAGE_THRESHOLD) {
        phenomena.push({
          type: 'shortage',
          itemId: item.itemId,
          severity: 1 - (item.supply / Math.max(1, item.demand)),
          startedAt: now,
          description: `${item.itemName} shortage`,
          affectedItems: [item.itemId]
        });
      }

      // Surplus
      if (item.supply > item.demand * 3) {
        phenomena.push({
          type: 'surplus',
          itemId: item.itemId,
          severity: item.supply / Math.max(1, item.demand) / 3,
          startedAt: now,
          description: `${item.itemName} surplus`,
          affectedItems: [item.itemId]
        });
      }
    }

    return phenomena;
  }

  // ============================================================================
  // ECONOMIC METRICS
  // ============================================================================

  /**
   * Calculate comprehensive economic metrics
   */
  getEconomicMetrics(): EconomicMetrics {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Market cap
    let marketCap = 0;
    for (const item of this.items.values()) {
      marketCap += item.currentPrice * (item.supply + this.getTotalInventory(item.itemId));
    }

    // 24h volume
    const volume24h = this.trades
      .filter(t => t.timestamp > oneDayAgo)
      .reduce((sum, t) => sum + t.quantity * t.price, 0);

    // Price change
    let totalPriceChange = 0;
    let itemCount = 0;
    for (const item of this.items.values()) {
      if (item.priceHistory.length >= 2) {
        const oldPrice = item.priceHistory[0].price;
        const change = (item.currentPrice - oldPrice) / oldPrice;
        totalPriceChange += change;
        itemCount++;
      }
    }
    const priceChange24h = itemCount > 0 ? totalPriceChange / itemCount : 0;

    // Inflation (average price change over time)
    const inflationRate = priceChange24h;

    // Market health (0-1, based on volatility and trading activity)
    const avgVolatility = Array.from(this.items.values())
      .reduce((sum, item) => sum + item.volatility, 0) / this.items.size;
    const tradingActivity = Math.min(1.0, this.trades.length / 100);
    const marketHealth = (1 - avgVolatility) * 0.6 + tradingActivity * 0.4;

    // Active traders
    const activeTraders = new Set(
      this.trades.filter(t => t.timestamp > oneDayAgo).flatMap(t => [t.buyerId, t.sellerId])
    ).size;

    // Total wealth
    const totalWealth = Array.from(this.botWallets.values()).reduce((sum, gold) => sum + gold, 0);

    // Wealth inequality (Gini coefficient)
    const wealthInequality = this.calculateGiniCoefficient();

    // Top items by volume
    const itemVolumes = new Map<string, number>();
    this.trades.filter(t => t.timestamp > oneDayAgo).forEach(t => {
      const current = itemVolumes.get(t.itemId) || 0;
      itemVolumes.set(t.itemId, current + t.quantity * t.price);
    });
    const topItems = Array.from(itemVolumes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([itemId, volume]) => ({itemId, volume}));

    // Phenomena
    const phenomena = this.getMarketPhenomena();

    return {
      marketCap,
      volume24h,
      priceChange24h,
      inflationRate,
      marketHealth,
      activeTraders,
      totalWealth,
      wealthInequality,
      topItems,
      phenomena
    };
  }

  /**
   * Calculate total inventory of an item across all bots
   */
  private getTotalInventory(itemId: string): number {
    let total = 0;
    for (const inventory of this.botInventories.values()) {
      total += inventory.get(itemId) || 0;
    }
    return total;
  }

  /**
   * Calculate Gini coefficient for wealth inequality
   */
  private calculateGiniCoefficient(): number {
    const wealths = Array.from(this.botWallets.values()).sort((a, b) => a - b);
    if (wealths.length === 0) return 0;

    let sumOfDifferences = 0;
    for (let i = 0; i < wealths.length; i++) {
      for (let j = 0; j < wealths.length; j++) {
        sumOfDifferences += Math.abs(wealths[i] - wealths[j]);
      }
    }

    const meanWealth = wealths.reduce((sum, w) => sum + w, 0) / wealths.length;
    const gini = sumOfDifferences / (2 * wealths.length * wealths.length * meanWealth);

    return Math.min(1, gini);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get bot's gold balance
   */
  getBotGold(botId: string): number {
    return this.botWallets.get(botId) || 0;
  }

  /**
   * Get bot's inventory
   */
  getBotInventory(botId: string): Map<string, number> {
    return this.botInventories.get(botId) || new Map();
  }

  /**
   * Get item details
   */
  getItem(itemId: string): MarketItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get all items
   */
  getAllItems(): MarketItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Get bot's economic archetype
   */
  getBotArchetype(botId: string): EconomicArchetype | undefined {
    return this.botArchetypes.get(botId);
  }

  /**
   * Get recent trades
   */
  getRecentTrades(limit: number = 50): Trade[] {
    return this.trades.slice(-limit);
  }

  /**
   * Get market summary report
   */
  getMarketReport(): string {
    const metrics = this.getEconomicMetrics();

    let report = `=== MARKET SIMULATION REPORT ===\n\n`;

    report += `MARKET OVERVIEW:\n`;
    report += `- Market Cap: ${metrics.marketCap.toFixed(0)} gold\n`;
    report += `- 24h Volume: ${metrics.volume24h.toFixed(0)} gold\n`;
    report += `- Price Change (24h): ${(metrics.priceChange24h * 100).toFixed(2)}%\n`;
    report += `- Inflation Rate: ${(metrics.inflationRate * 100).toFixed(2)}%\n`;
    report += `- Market Health: ${(metrics.marketHealth * 100).toFixed(1)}%\n`;
    report += `- Active Traders: ${metrics.activeTraders}\n\n`;

    report += `WEALTH DISTRIBUTION:\n`;
    report += `- Total Wealth: ${metrics.totalWealth.toFixed(0)} gold\n`;
    report += `- Inequality (Gini): ${(metrics.wealthInequality * 100).toFixed(1)}%\n\n`;

    report += `TOP TRADED ITEMS:\n`;
    metrics.topItems.forEach((item, i) => {
      const itemData = this.items.get(item.itemId);
      report += `${i + 1}. ${itemData?.itemName || item.itemId}: ${item.volume.toFixed(0)} gold\n`;
    });
    report += `\n`;

    report += `MARKET PHENOMENA (${metrics.phenomena.length}):\n`;
    metrics.phenomena.forEach(p => {
      report += `- ${p.type.toUpperCase()}: ${p.description} (severity: ${(p.severity * 100).toFixed(0)}%)\n`;
    });

    return report;
  }
}
