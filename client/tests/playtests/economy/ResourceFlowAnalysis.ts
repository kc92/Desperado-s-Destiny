/**
 * ResourceFlowAnalysis.ts
 *
 * Comprehensive economic health analysis tracking gold/item flow between bots,
 * identifying bottlenecks, measuring wealth distribution, and scoring market health.
 *
 * Features:
 * - Gold flow tracking (sources, sinks, net flow)
 * - Item flow analysis (production, consumption, transfers)
 * - Economic bottleneck detection
 * - Wealth distribution analysis (Gini coefficient, percentiles)
 * - Inflation/deflation measurement
 * - Economic health scoring
 * - Resource sink/source identification
 * - Flow visualization data
 * - Market efficiency metrics
 * - Economic cycle detection
 */

import { MarketSimulation, MarketItem, Trade, EconomicMetrics } from './EconomySimulation';
import { TradingNetwork, TradeRoute } from './TradingNetwork';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Flow of resources from one bot to another
 */
export interface ResourceFlow {
  flowId: string;
  fromBotId: string;
  toBotId: string;
  resourceType: 'gold' | 'item';
  itemId?: string;
  amount: number;
  timestamp: Date;
  flowType: FlowType;
  value: number; // Gold equivalent value
}

export type FlowType =
  | 'trade'          // Bot-to-bot trade
  | 'job_reward'     // Job completion
  | 'combat_loot'    // Combat reward
  | 'sale'           // Market sale
  | 'purchase'       // Market purchase
  | 'gift'           // Free transfer
  | 'quest_reward'   // Quest completion
  | 'gang_payment'   // Gang-related transfer
  | 'tax'            // System tax
  | 'sink';          // Permanent removal

/**
 * Economic entity (bot or system)
 */
export interface EconomicEntity {
  entityId: string;
  entityType: 'bot' | 'system' | 'market';
  currentGold: number;
  currentInventoryValue: number;
  totalWealth: number;
  wealthRank: number;
  wealthPercentile: number;
  netWorth: number;
  cashFlow24h: number; // Net gold gain/loss
  flowVelocity: number; // How quickly resources move through entity
}

/**
 * Economic bottleneck
 */
export interface EconomicBottleneck {
  bottleneckId: string;
  type: 'supply' | 'demand' | 'liquidity' | 'monopoly' | 'stagnation';
  severity: number; // 0-1
  affectedItems: string[];
  affectedBots: string[];
  description: string;
  detectedAt: Date;
  impact: number; // Estimated gold value impact
  recommendation: string;
}

/**
 * Wealth distribution snapshot
 */
export interface WealthDistribution {
  timestamp: Date;
  totalWealth: number;
  meanWealth: number;
  medianWealth: number;
  wealthByPercentile: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
  };
  giniCoefficient: number;
  top10PercentShare: number; // % of wealth held by top 10%
  bottom50PercentShare: number; // % of wealth held by bottom 50%
  wealthConcentration: 'low' | 'medium' | 'high' | 'extreme';
}

/**
 * Resource sink/source
 */
export interface ResourceNode {
  nodeId: string;
  nodeType: 'sink' | 'source' | 'transformer';
  resourceType: 'gold' | 'item';
  itemId?: string;
  flowRate: number; // Units per hour
  totalProcessed: number;
  efficiency: number; // 0-1, how well it processes resources
  capacity: number; // Max flow rate
  utilization: number; // Current / capacity
  description: string;
}

/**
 * Economic health assessment
 */
export interface EconomicHealthReport {
  timestamp: Date;
  overallScore: number; // 0-100
  components: {
    marketLiquidity: number;
    tradingActivity: number;
    wealthDistribution: number;
    priceStability: number;
    resourceAvailability: number;
    economicGrowth: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  strengths: string[];
  trends: {
    direction: 'improving' | 'stable' | 'declining';
    velocity: number; // Rate of change
  };
}

/**
 * Economic cycle phase
 */
export interface EconomicCycle {
  currentPhase: 'expansion' | 'peak' | 'contraction' | 'trough';
  phaseDuration: number; // Days in current phase
  cycleNumber: number;
  indicators: {
    gdp: number; // Total value created
    gdpGrowth: number; // % change
    unemployment: number; // % of inactive bots
    inflation: number; // % price change
    consumerConfidence: number; // 0-1
  };
  forecast: {
    nextPhase: string;
    estimatedTransition: Date;
    confidence: number;
  };
}

/**
 * Flow graph node for visualization
 */
export interface FlowGraphNode {
  id: string;
  type: 'bot' | 'system';
  wealth: number;
  inflow: number;
  outflow: number;
  netFlow: number;
}

/**
 * Flow graph edge for visualization
 */
export interface FlowGraphEdge {
  from: string;
  to: string;
  value: number; // Gold value
  volume: number; // Number of transactions
  type: FlowType;
}

// ============================================================================
// RESOURCE FLOW ANALYSIS CLASS
// ============================================================================

/**
 * Main resource flow analysis engine
 */
export class ResourceFlowAnalysis {
  private marketSim: MarketSimulation;
  private tradingNetwork: TradingNetwork;
  private flows: ResourceFlow[] = [];
  private entities: Map<string, EconomicEntity> = new Map();
  private bottlenecks: EconomicBottleneck[] = [];
  private wealthHistory: WealthDistribution[] = [];
  private resourceNodes: Map<string, ResourceNode> = new Map();
  private cycleHistory: EconomicCycle[] = [];

  // Configuration
  private readonly FLOW_HISTORY_LIMIT = 10000;
  private readonly WEALTH_SNAPSHOT_INTERVAL_HOURS = 1;
  private readonly BOTTLENECK_THRESHOLD = 0.7;

  constructor(marketSim: MarketSimulation, tradingNetwork: TradingNetwork) {
    this.marketSim = marketSim;
    this.tradingNetwork = tradingNetwork;
    this.initializeSystemNodes();
  }

  /**
   * Initialize system resource nodes (sources and sinks)
   */
  private initializeSystemNodes(): void {
    // Gold sources
    this.resourceNodes.set('job_system', {
      nodeId: 'job_system',
      nodeType: 'source',
      resourceType: 'gold',
      flowRate: 0,
      totalProcessed: 0,
      efficiency: 1.0,
      capacity: Infinity,
      utilization: 0,
      description: 'Job system gold generation'
    });

    this.resourceNodes.set('combat_system', {
      nodeId: 'combat_system',
      nodeType: 'source',
      resourceType: 'gold',
      flowRate: 0,
      totalProcessed: 0,
      efficiency: 1.0,
      capacity: Infinity,
      utilization: 0,
      description: 'Combat loot gold generation'
    });

    // Gold sinks
    this.resourceNodes.set('shop_system', {
      nodeId: 'shop_system',
      nodeType: 'sink',
      resourceType: 'gold',
      flowRate: 0,
      totalProcessed: 0,
      efficiency: 1.0,
      capacity: Infinity,
      utilization: 0,
      description: 'Shop purchases gold removal'
    });

    this.resourceNodes.set('tax_system', {
      nodeId: 'tax_system',
      nodeType: 'sink',
      resourceType: 'gold',
      flowRate: 0,
      totalProcessed: 0,
      efficiency: 1.0,
      capacity: Infinity,
      utilization: 0,
      description: 'Tax collection gold removal'
    });
  }

  // ============================================================================
  // FLOW TRACKING
  // ============================================================================

  /**
   * Record a resource flow
   */
  recordFlow(
    fromBotId: string,
    toBotId: string,
    resourceType: 'gold' | 'item',
    amount: number,
    flowType: FlowType,
    itemId?: string
  ): void {
    const item = itemId ? this.marketSim.getItem(itemId) : undefined;
    const value = resourceType === 'gold' ? amount : (item ? item.currentPrice * amount : 0);

    const flow: ResourceFlow = {
      flowId: `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromBotId,
      toBotId,
      resourceType,
      itemId,
      amount,
      timestamp: new Date(),
      flowType,
      value
    };

    this.flows.push(flow);

    // Maintain history limit
    if (this.flows.length > this.FLOW_HISTORY_LIMIT) {
      this.flows.shift();
    }

    // Update entity tracking
    this.updateEntity(fromBotId);
    this.updateEntity(toBotId);

    // Update resource nodes
    this.updateResourceNodes(flow);
  }

  /**
   * Update entity economic data
   */
  private updateEntity(botId: string): void {
    const gold = this.marketSim.getBotGold(botId);
    const inventory = this.marketSim.getBotInventory(botId);

    let inventoryValue = 0;
    for (const [itemId, quantity] of inventory.entries()) {
      const item = this.marketSim.getItem(itemId);
      if (item) {
        inventoryValue += item.currentPrice * quantity;
      }
    }

    const totalWealth = gold + inventoryValue;
    const cashFlow = this.calculateCashFlow24h(botId);
    const velocity = this.calculateFlowVelocity(botId);

    const entity: EconomicEntity = {
      entityId: botId,
      entityType: 'bot',
      currentGold: gold,
      currentInventoryValue: inventoryValue,
      totalWealth,
      wealthRank: 0, // Updated in calculateWealthDistribution
      wealthPercentile: 0,
      netWorth: totalWealth,
      cashFlow24h: cashFlow,
      flowVelocity: velocity
    };

    this.entities.set(botId, entity);
  }

  /**
   * Calculate 24-hour cash flow for bot
   */
  private calculateCashFlow24h(botId: string): number {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFlows = this.flows.filter(f => f.timestamp > oneDayAgo);

    let cashFlow = 0;
    for (const flow of recentFlows) {
      if (flow.toBotId === botId && flow.resourceType === 'gold') {
        cashFlow += flow.amount;
      }
      if (flow.fromBotId === botId && flow.resourceType === 'gold') {
        cashFlow -= flow.amount;
      }
    }

    return cashFlow;
  }

  /**
   * Calculate flow velocity (transaction frequency)
   */
  private calculateFlowVelocity(botId: string): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFlows = this.flows.filter(f =>
      f.timestamp > oneHourAgo &&
      (f.fromBotId === botId || f.toBotId === botId)
    );

    return recentFlows.length; // Transactions per hour
  }

  /**
   * Update resource node statistics
   */
  private updateResourceNodes(flow: ResourceFlow): void {
    let nodeId: string | null = null;

    switch (flow.flowType) {
      case 'job_reward':
        nodeId = 'job_system';
        break;
      case 'combat_loot':
        nodeId = 'combat_system';
        break;
      case 'purchase':
        nodeId = 'shop_system';
        break;
      case 'tax':
        nodeId = 'tax_system';
        break;
    }

    if (nodeId) {
      const node = this.resourceNodes.get(nodeId);
      if (node) {
        node.totalProcessed += flow.value;
        // Flow rate is updated periodically
      }
    }
  }

  // ============================================================================
  // WEALTH DISTRIBUTION ANALYSIS
  // ============================================================================

  /**
   * Calculate current wealth distribution
   */
  calculateWealthDistribution(): WealthDistribution {
    // Update all entities first
    for (const botId of this.entities.keys()) {
      this.updateEntity(botId);
    }

    const wealths = Array.from(this.entities.values())
      .map(e => e.totalWealth)
      .sort((a, b) => a - b);

    if (wealths.length === 0) {
      return {
        timestamp: new Date(),
        totalWealth: 0,
        meanWealth: 0,
        medianWealth: 0,
        wealthByPercentile: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, p99: 0 },
        giniCoefficient: 0,
        top10PercentShare: 0,
        bottom50PercentShare: 0,
        wealthConcentration: 'low'
      };
    }

    const totalWealth = wealths.reduce((sum, w) => sum + w, 0);
    const meanWealth = totalWealth / wealths.length;
    const medianWealth = this.percentile(wealths, 50);

    const distribution: WealthDistribution = {
      timestamp: new Date(),
      totalWealth,
      meanWealth,
      medianWealth,
      wealthByPercentile: {
        p10: this.percentile(wealths, 10),
        p25: this.percentile(wealths, 25),
        p50: medianWealth,
        p75: this.percentile(wealths, 75),
        p90: this.percentile(wealths, 90),
        p99: this.percentile(wealths, 99)
      },
      giniCoefficient: this.calculateGini(wealths),
      top10PercentShare: this.calculateTopShare(wealths, 0.1),
      bottom50PercentShare: this.calculateBottomShare(wealths, 0.5),
      wealthConcentration: 'medium' // Will be determined
    };

    // Determine concentration level
    if (distribution.giniCoefficient > 0.7) {
      distribution.wealthConcentration = 'extreme';
    } else if (distribution.giniCoefficient > 0.5) {
      distribution.wealthConcentration = 'high';
    } else if (distribution.giniCoefficient > 0.3) {
      distribution.wealthConcentration = 'medium';
    } else {
      distribution.wealthConcentration = 'low';
    }

    // Update entity ranks
    const sortedEntities = Array.from(this.entities.values())
      .sort((a, b) => b.totalWealth - a.totalWealth);

    sortedEntities.forEach((entity, index) => {
      entity.wealthRank = index + 1;
      entity.wealthPercentile = (index / sortedEntities.length) * 100;
    });

    this.wealthHistory.push(distribution);

    // Maintain history (keep last 100 snapshots)
    if (this.wealthHistory.length > 100) {
      this.wealthHistory.shift();
    }

    return distribution;
  }

  /**
   * Calculate percentile value
   */
  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
  }

  /**
   * Calculate Gini coefficient
   */
  private calculateGini(sortedWealths: number[]): number {
    if (sortedWealths.length === 0) return 0;

    let sumOfDifferences = 0;
    for (let i = 0; i < sortedWealths.length; i++) {
      for (let j = 0; j < sortedWealths.length; j++) {
        sumOfDifferences += Math.abs(sortedWealths[i] - sortedWealths[j]);
      }
    }

    const meanWealth = sortedWealths.reduce((sum, w) => sum + w, 0) / sortedWealths.length;
    if (meanWealth === 0) return 0;

    const gini = sumOfDifferences / (2 * sortedWealths.length * sortedWealths.length * meanWealth);
    return Math.min(1, gini);
  }

  /**
   * Calculate top X% wealth share
   */
  private calculateTopShare(sortedWealths: number[], fraction: number): number {
    if (sortedWealths.length === 0) return 0;

    const totalWealth = sortedWealths.reduce((sum, w) => sum + w, 0);
    if (totalWealth === 0) return 0;

    const topCount = Math.ceil(sortedWealths.length * fraction);
    const topWealth = sortedWealths.slice(-topCount).reduce((sum, w) => sum + w, 0);

    return topWealth / totalWealth;
  }

  /**
   * Calculate bottom X% wealth share
   */
  private calculateBottomShare(sortedWealths: number[], fraction: number): number {
    if (sortedWealths.length === 0) return 0;

    const totalWealth = sortedWealths.reduce((sum, w) => sum + w, 0);
    if (totalWealth === 0) return 0;

    const bottomCount = Math.ceil(sortedWealths.length * fraction);
    const bottomWealth = sortedWealths.slice(0, bottomCount).reduce((sum, w) => sum + w, 0);

    return bottomWealth / totalWealth;
  }

  // ============================================================================
  // BOTTLENECK DETECTION
  // ============================================================================

  /**
   * Detect economic bottlenecks
   */
  detectBottlenecks(): EconomicBottleneck[] {
    this.bottlenecks = [];

    // Supply bottlenecks (item shortages)
    this.detectSupplyBottlenecks();

    // Demand bottlenecks (no buyers)
    this.detectDemandBottlenecks();

    // Liquidity bottlenecks (insufficient gold)
    this.detectLiquidityBottlenecks();

    // Monopoly bottlenecks (one bot controls market)
    this.detectMonopolyBottlenecks();

    // Stagnation bottlenecks (low trading activity)
    this.detectStagnationBottlenecks();

    return this.bottlenecks;
  }

  /**
   * Detect supply bottlenecks
   */
  private detectSupplyBottlenecks(): void {
    const items = this.marketSim.getAllItems();

    for (const item of items) {
      if (item.supply < item.demand * 0.3) {
        // Severe shortage
        const severity = 1 - (item.supply / Math.max(1, item.demand));

        this.bottlenecks.push({
          bottleneckId: `supply_${item.itemId}`,
          type: 'supply',
          severity,
          affectedItems: [item.itemId],
          affectedBots: [],
          description: `Critical shortage of ${item.itemName}`,
          detectedAt: new Date(),
          impact: item.currentPrice * item.demand,
          recommendation: 'Increase production or reduce consumption'
        });
      }
    }
  }

  /**
   * Detect demand bottlenecks
   */
  private detectDemandBottlenecks(): void {
    const items = this.marketSim.getAllItems();

    for (const item of items) {
      if (item.demand < item.supply * 0.2 && item.supply > 10) {
        // Severe oversupply
        const severity = 1 - (item.demand / Math.max(1, item.supply));

        this.bottlenecks.push({
          bottleneckId: `demand_${item.itemId}`,
          type: 'demand',
          severity,
          affectedItems: [item.itemId],
          affectedBots: [],
          description: `Oversupply of ${item.itemName}, no buyers`,
          detectedAt: new Date(),
          impact: item.currentPrice * item.supply,
          recommendation: 'Reduce production or find new uses'
        });
      }
    }
  }

  /**
   * Detect liquidity bottlenecks
   */
  private detectLiquidityBottlenecks(): void {
    const entities = Array.from(this.entities.values());
    const lowLiquidityBots = entities.filter(e =>
      e.currentGold < 50 && e.totalWealth > 100
    );

    if (lowLiquidityBots.length > entities.length * 0.3) {
      // 30%+ of bots are illiquid
      const severity = lowLiquidityBots.length / entities.length;

      this.bottlenecks.push({
        bottleneckId: 'liquidity_crisis',
        type: 'liquidity',
        severity,
        affectedItems: [],
        affectedBots: lowLiquidityBots.map(e => e.entityId),
        description: 'Widespread gold shortage despite asset wealth',
        detectedAt: new Date(),
        impact: lowLiquidityBots.reduce((sum, e) => sum + e.totalWealth, 0),
        recommendation: 'Encourage selling assets or provide gold sources'
      });
    }
  }

  /**
   * Detect monopoly bottlenecks
   */
  private detectMonopolyBottlenecks(): void {
    const items = this.marketSim.getAllItems();

    for (const item of items) {
      // Check if any bot holds >50% of supply
      let maxHolding = 0;
      let maxHolderId = '';

      for (const entity of this.entities.values()) {
        const inventory = this.marketSim.getBotInventory(entity.entityId);
        const holding = inventory.get(item.itemId) || 0;
        if (holding > maxHolding) {
          maxHolding = holding;
          maxHolderId = entity.entityId;
        }
      }

      const totalSupply = item.supply + maxHolding;
      if (totalSupply > 0 && maxHolding / totalSupply > 0.5) {
        this.bottlenecks.push({
          bottleneckId: `monopoly_${item.itemId}`,
          type: 'monopoly',
          severity: maxHolding / totalSupply,
          affectedItems: [item.itemId],
          affectedBots: [maxHolderId],
          description: `${maxHolderId} controls ${((maxHolding / totalSupply) * 100).toFixed(0)}% of ${item.itemName}`,
          detectedAt: new Date(),
          impact: item.currentPrice * maxHolding,
          recommendation: 'Monitor for price manipulation'
        });
      }
    }
  }

  /**
   * Detect stagnation bottlenecks
   */
  private detectStagnationBottlenecks(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFlows = this.flows.filter(f => f.timestamp > oneHourAgo);

    if (recentFlows.length < this.entities.size * 0.5) {
      // Less than 0.5 transactions per bot per hour
      const severity = 1 - (recentFlows.length / (this.entities.size * 0.5));

      this.bottlenecks.push({
        bottleneckId: 'market_stagnation',
        type: 'stagnation',
        severity,
        affectedItems: [],
        affectedBots: [],
        description: 'Low trading activity across market',
        detectedAt: new Date(),
        impact: 0,
        recommendation: 'Stimulate economy with incentives or events'
      });
    }
  }

  // ============================================================================
  // ECONOMIC HEALTH SCORING
  // ============================================================================

  /**
   * Calculate comprehensive economic health score
   */
  calculateEconomicHealth(): EconomicHealthReport {
    const distribution = this.calculateWealthDistribution();
    const metrics = this.marketSim.getEconomicMetrics();
    const bottlenecks = this.detectBottlenecks();

    // Market liquidity (0-100)
    const avgGold = Array.from(this.entities.values())
      .reduce((sum, e) => sum + e.currentGold, 0) / Math.max(1, this.entities.size);
    const marketLiquidity = Math.min(100, (avgGold / 500) * 100);

    // Trading activity (0-100)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFlows = this.flows.filter(f => f.timestamp > oneHourAgo).length;
    const tradingActivity = Math.min(100, (recentFlows / this.entities.size) * 20);

    // Wealth distribution (0-100, lower Gini is better)
    const wealthDistributionScore = (1 - distribution.giniCoefficient) * 100;

    // Price stability (0-100)
    const avgVolatility = this.marketSim.getAllItems()
      .reduce((sum, item) => sum + item.volatility, 0) / Math.max(1, this.marketSim.getAllItems().length);
    const priceStability = (1 - avgVolatility) * 100;

    // Resource availability (0-100)
    const items = this.marketSim.getAllItems();
    const availableItems = items.filter(i => i.supply > i.demand * 0.3).length;
    const resourceAvailability = (availableItems / items.length) * 100;

    // Economic growth (0-100)
    let growthScore = 50; // Neutral
    if (this.wealthHistory.length >= 2) {
      const current = this.wealthHistory[this.wealthHistory.length - 1];
      const previous = this.wealthHistory[this.wealthHistory.length - 2];
      const growth = (current.totalWealth - previous.totalWealth) / Math.max(1, previous.totalWealth);
      growthScore = 50 + Math.min(50, Math.max(-50, growth * 1000));
    }

    // Overall score (weighted average)
    const overallScore = (
      marketLiquidity * 0.15 +
      tradingActivity * 0.20 +
      wealthDistributionScore * 0.15 +
      priceStability * 0.20 +
      resourceAvailability * 0.15 +
      growthScore * 0.15
    );

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    // Identify issues and strengths
    const issues: string[] = [];
    const strengths: string[] = [];

    if (marketLiquidity < 50) issues.push('Low market liquidity');
    else if (marketLiquidity > 80) strengths.push('High market liquidity');

    if (tradingActivity < 50) issues.push('Low trading activity');
    else if (tradingActivity > 80) strengths.push('Active trading market');

    if (distribution.giniCoefficient > 0.6) issues.push('High wealth inequality');
    else if (distribution.giniCoefficient < 0.3) strengths.push('Fair wealth distribution');

    if (avgVolatility > 0.5) issues.push('High price volatility');
    else if (avgVolatility < 0.2) strengths.push('Stable prices');

    if (resourceAvailability < 50) issues.push('Resource shortages');
    else if (resourceAvailability > 80) strengths.push('Abundant resources');

    if (bottlenecks.length > 5) issues.push(`${bottlenecks.length} economic bottlenecks detected`);

    // Determine trend
    let direction: 'improving' | 'stable' | 'declining' = 'stable';
    let velocity = 0;

    if (this.wealthHistory.length >= 3) {
      const scores = this.wealthHistory.slice(-3).map(h => h.totalWealth);
      const trend = scores[2] - scores[0];
      const rate = trend / Math.max(1, scores[0]);

      if (rate > 0.05) {
        direction = 'improving';
        velocity = rate;
      } else if (rate < -0.05) {
        direction = 'declining';
        velocity = Math.abs(rate);
      }
    }

    return {
      timestamp: new Date(),
      overallScore,
      components: {
        marketLiquidity,
        tradingActivity,
        wealthDistribution: wealthDistributionScore,
        priceStability,
        resourceAvailability,
        economicGrowth: growthScore
      },
      grade,
      issues,
      strengths,
      trends: {
        direction,
        velocity
      }
    };
  }

  // ============================================================================
  // FLOW VISUALIZATION
  // ============================================================================

  /**
   * Generate flow graph for visualization
   */
  generateFlowGraph(hours: number = 1): { nodes: FlowGraphNode[]; edges: FlowGraphEdge[] } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentFlows = this.flows.filter(f => f.timestamp > cutoff);

    // Build nodes
    const nodes: FlowGraphNode[] = [];
    const nodeMap = new Map<string, FlowGraphNode>();

    for (const entity of this.entities.values()) {
      const inflow = recentFlows
        .filter(f => f.toBotId === entity.entityId)
        .reduce((sum, f) => sum + f.value, 0);

      const outflow = recentFlows
        .filter(f => f.fromBotId === entity.entityId)
        .reduce((sum, f) => sum + f.value, 0);

      const node: FlowGraphNode = {
        id: entity.entityId,
        type: 'bot',
        wealth: entity.totalWealth,
        inflow,
        outflow,
        netFlow: inflow - outflow
      };

      nodes.push(node);
      nodeMap.set(entity.entityId, node);
    }

    // Build edges (aggregate flows between same entities)
    const edgeMap = new Map<string, FlowGraphEdge>();

    for (const flow of recentFlows) {
      const edgeKey = `${flow.fromBotId}_${flow.toBotId}_${flow.flowType}`;
      const existing = edgeMap.get(edgeKey);

      if (existing) {
        existing.value += flow.value;
        existing.volume++;
      } else {
        edgeMap.set(edgeKey, {
          from: flow.fromBotId,
          to: flow.toBotId,
          value: flow.value,
          volume: 1,
          type: flow.flowType
        });
      }
    }

    const edges = Array.from(edgeMap.values());

    return { nodes, edges };
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  /**
   * Generate comprehensive economic analysis report
   */
  generateReport(): string {
    const distribution = this.calculateWealthDistribution();
    const health = this.calculateEconomicHealth();
    const bottlenecks = this.detectBottlenecks();
    const metrics = this.marketSim.getEconomicMetrics();

    let report = `=== ECONOMIC ANALYSIS REPORT ===\n\n`;

    report += `OVERALL HEALTH: ${health.grade} (${health.overallScore.toFixed(1)}/100)\n`;
    report += `Trend: ${health.trends.direction.toUpperCase()}\n\n`;

    report += `COMPONENT SCORES:\n`;
    report += `- Market Liquidity: ${health.components.marketLiquidity.toFixed(1)}/100\n`;
    report += `- Trading Activity: ${health.components.tradingActivity.toFixed(1)}/100\n`;
    report += `- Wealth Distribution: ${health.components.wealthDistribution.toFixed(1)}/100\n`;
    report += `- Price Stability: ${health.components.priceStability.toFixed(1)}/100\n`;
    report += `- Resource Availability: ${health.components.resourceAvailability.toFixed(1)}/100\n`;
    report += `- Economic Growth: ${health.components.economicGrowth.toFixed(1)}/100\n\n`;

    report += `WEALTH DISTRIBUTION:\n`;
    report += `- Total Wealth: ${distribution.totalWealth.toFixed(0)} gold\n`;
    report += `- Mean Wealth: ${distribution.meanWealth.toFixed(0)} gold\n`;
    report += `- Median Wealth: ${distribution.medianWealth.toFixed(0)} gold\n`;
    report += `- Gini Coefficient: ${(distribution.giniCoefficient * 100).toFixed(1)}%\n`;
    report += `- Top 10% Share: ${(distribution.top10PercentShare * 100).toFixed(1)}%\n`;
    report += `- Bottom 50% Share: ${(distribution.bottom50PercentShare * 100).toFixed(1)}%\n`;
    report += `- Concentration: ${distribution.wealthConcentration.toUpperCase()}\n\n`;

    report += `WEALTH PERCENTILES:\n`;
    report += `- P10: ${distribution.wealthByPercentile.p10.toFixed(0)} gold\n`;
    report += `- P25: ${distribution.wealthByPercentile.p25.toFixed(0)} gold\n`;
    report += `- P50: ${distribution.wealthByPercentile.p50.toFixed(0)} gold\n`;
    report += `- P75: ${distribution.wealthByPercentile.p75.toFixed(0)} gold\n`;
    report += `- P90: ${distribution.wealthByPercentile.p90.toFixed(0)} gold\n`;
    report += `- P99: ${distribution.wealthByPercentile.p99.toFixed(0)} gold\n\n`;

    report += `ECONOMIC ISSUES (${health.issues.length}):\n`;
    health.issues.forEach(issue => {
      report += `- ${issue}\n`;
    });
    report += `\n`;

    report += `ECONOMIC STRENGTHS (${health.strengths.length}):\n`;
    health.strengths.forEach(strength => {
      report += `- ${strength}\n`;
    });
    report += `\n`;

    report += `BOTTLENECKS (${bottlenecks.length}):\n`;
    bottlenecks.slice(0, 10).forEach(b => {
      report += `- ${b.type.toUpperCase()}: ${b.description}\n`;
      report += `  Severity: ${(b.severity * 100).toFixed(0)}% | `;
      report += `Impact: ${b.impact.toFixed(0)} gold\n`;
      report += `  Fix: ${b.recommendation}\n`;
    });

    return report;
  }

  /**
   * Get specific bot's economic position
   */
  getBotEconomicProfile(botId: string): string {
    const entity = this.entities.get(botId);
    if (!entity) return 'Bot not found';

    const distribution = this.calculateWealthDistribution();

    let profile = `=== BOT ECONOMIC PROFILE: ${botId} ===\n\n`;

    profile += `WEALTH:\n`;
    profile += `- Gold: ${entity.currentGold.toFixed(0)}\n`;
    profile += `- Inventory Value: ${entity.currentInventoryValue.toFixed(0)}\n`;
    profile += `- Total Wealth: ${entity.totalWealth.toFixed(0)}\n`;
    profile += `- Wealth Rank: #${entity.wealthRank}\n`;
    profile += `- Wealth Percentile: Top ${(100 - entity.wealthPercentile).toFixed(1)}%\n\n`;

    profile += `CASH FLOW:\n`;
    profile += `- 24h Net Flow: ${entity.cashFlow24h > 0 ? '+' : ''}${entity.cashFlow24h.toFixed(0)} gold\n`;
    profile += `- Flow Velocity: ${entity.flowVelocity.toFixed(1)} tx/hour\n\n`;

    return profile;
  }
}
