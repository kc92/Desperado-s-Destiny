/**
 * TradingNetwork.ts
 *
 * Bot-to-bot trading system with personality-driven offer generation,
 * trust-based trading, and economic specialization.
 *
 * Features:
 * - Direct bot-to-bot trades (player market)
 * - Trade offer generation based on personality and needs
 * - Reputation system affecting trade willingness
 * - Bartering and negotiation simulation
 * - Trade route optimization
 * - Economic specialization (merchants, crafters, etc.)
 * - Social trading network analysis
 * - Trusted trading partners
 */

import { PersonalityProfile, PersonalityTraits } from '../intelligence/PersonalitySystem';
import { SocialIntelligence, Relationship, RelationshipStage } from '../social/SocialIntelligence';
import { MarketSimulation, MarketItem, EconomicArchetype } from './EconomySimulation';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Trade offer between two bots
 */
export interface TradeOffer {
  offerId: string;
  fromBotId: string;
  toBotId: string;
  offeredItems: TradeItem[];
  requestedItems: TradeItem[];
  offeredGold: number;
  requestedGold: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  trustRequired: number; // 0-1, how much trust needed to accept
  motivation: TradeMotivation;
  counterOffers: TradeOffer[];
}

/**
 * Item in a trade offer
 */
export interface TradeItem {
  itemId: string;
  itemName: string;
  quantity: number;
  estimatedValue: number;
}

/**
 * Why a bot wants to trade
 */
export type TradeMotivation =
  | 'need_item'           // Bot needs specific item
  | 'excess_inventory'    // Bot has too many items
  | 'profit'              // Arbitrage opportunity
  | 'help_friend'         // Helping a friend
  | 'build_relationship'  // Social networking
  | 'speculation'         // Betting on price changes
  | 'specialization';     // Trading as part of economic role

/**
 * Bot's trading reputation
 */
export interface TradingReputation {
  botId: string;
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  averageResponseTime: number; // minutes
  reliabilityScore: number; // 0-1
  fairnessScore: number; // 0-1 (based on trade value ratios)
  lastTraded: Date;
  specialization?: EconomicSpecialization;
  tradingPartners: string[]; // Frequent trade partners
  blacklist: string[]; // Bots to avoid
}

/**
 * Economic specialization role
 */
export type EconomicSpecialization =
  | 'weapon_dealer'
  | 'armor_smith'
  | 'potion_maker'
  | 'resource_gatherer'
  | 'luxury_trader'
  | 'general_merchant'
  | 'craftsman'
  | 'fence'; // Trades stolen/illegal goods

/**
 * Trade route between bots
 */
export interface TradeRoute {
  routeId: string;
  bot1Id: string;
  bot2Id: string;
  primaryGoods: string[]; // Item categories traded
  tradeFrequency: number; // Trades per day
  totalVolume: number; // Total gold value traded
  profitability: number; // Average profit per trade
  established: Date;
  lastTrade: Date;
  routeStrength: number; // 0-1, how established the route is
}

/**
 * Negotiation state for bartering
 */
export interface NegotiationState {
  negotiationId: string;
  participants: [string, string]; // Two bot IDs
  currentOffer: TradeOffer;
  rounds: number;
  maxRounds: number;
  status: 'ongoing' | 'agreed' | 'failed';
  history: TradeOffer[];
}

/**
 * Trade opportunity detected by bot
 */
export interface TradeOpportunity {
  opportunityId: string;
  targetBotId: string;
  type: 'arbitrage' | 'need_based' | 'social' | 'speculative';
  expectedProfit: number;
  riskLevel: number; // 0-1
  itemsInvolved: string[];
  confidence: number; // 0-1, how confident bot is in this opportunity
  reasoning: string;
}

// ============================================================================
// TRADING NETWORK CLASS
// ============================================================================

/**
 * Main trading network engine
 */
export class TradingNetwork {
  private marketSim: MarketSimulation;
  private socialIntelligence: Map<string, SocialIntelligence> = new Map();
  private reputations: Map<string, TradingReputation> = new Map();
  private activeOffers: Map<string, TradeOffer> = new Map();
  private completedTrades: TradeOffer[] = [];
  private tradeRoutes: Map<string, TradeRoute> = new Map();
  private negotiations: Map<string, NegotiationState> = new Map();
  private specializations: Map<string, EconomicSpecialization> = new Map();

  // Configuration
  private readonly OFFER_EXPIRY_HOURS = 2;
  private readonly MAX_NEGOTIATION_ROUNDS = 5;
  private readonly TRUST_THRESHOLD_STRANGER = 0.3;
  private readonly TRUST_THRESHOLD_FRIEND = 0.1;
  private readonly FAIR_TRADE_TOLERANCE = 0.15; // ±15% is considered fair

  constructor(marketSim: MarketSimulation) {
    this.marketSim = marketSim;
  }

  /**
   * Register bot in trading network
   */
  registerBot(
    botId: string,
    personality: PersonalityProfile,
    social: SocialIntelligence
  ): void {
    this.socialIntelligence.set(botId, social);

    // Initialize reputation
    this.reputations.set(botId, {
      botId,
      totalTrades: 0,
      successfulTrades: 0,
      failedTrades: 0,
      averageResponseTime: 30,
      reliabilityScore: 0.5,
      fairnessScore: 0.5,
      lastTraded: new Date(),
      tradingPartners: [],
      blacklist: []
    });

    // Assign specialization based on personality and archetype
    const specialization = this.determineSpecialization(personality);
    if (specialization) {
      this.specializations.set(botId, specialization);
      const rep = this.reputations.get(botId)!;
      rep.specialization = specialization;
    }
  }

  /**
   * Determine bot's economic specialization
   */
  private determineSpecialization(personality: PersonalityProfile): EconomicSpecialization | undefined {
    const archetype = this.marketSim.getBotArchetype(personality.archetype);
    if (!archetype) return undefined;

    // Merchants specialize based on personality
    if (archetype.type === 'merchant') {
      if (personality.traits.aggression > 0.6) return 'weapon_dealer';
      if (personality.traits.patience > 0.7) return 'armor_smith';
      if (personality.traits.sociability > 0.7) return 'luxury_trader';
      return 'general_merchant';
    }

    // Producers become crafters
    if (archetype.type === 'producer') {
      return Math.random() > 0.5 ? 'craftsman' : 'resource_gatherer';
    }

    // Criminals become fences
    if (personality.archetype === 'criminal') {
      return 'fence';
    }

    // Generous types become general merchants
    if (archetype.type === 'generous') {
      return 'general_merchant';
    }

    return undefined;
  }

  // ============================================================================
  // TRADE OFFER GENERATION
  // ============================================================================

  /**
   * Generate trade offer based on bot's needs and personality
   */
  generateTradeOffer(
    fromBotId: string,
    toBotId: string,
    motivation: TradeMotivation
  ): TradeOffer | null {
    const fromArchetype = this.marketSim.getBotArchetype(fromBotId);
    const toArchetype = this.marketSim.getBotArchetype(toBotId);
    if (!fromArchetype || !toArchetype) return null;

    const fromInventory = this.marketSim.getBotInventory(fromBotId);
    const toInventory = this.marketSim.getBotInventory(toBotId);
    const fromGold = this.marketSim.getBotGold(fromBotId);

    const social = this.socialIntelligence.get(fromBotId);
    const relationship = social?.getRelationship(toBotId, toBotId);

    // Determine what to offer and request
    const offer = this.constructOffer(
      fromBotId,
      toBotId,
      motivation,
      fromArchetype,
      toArchetype,
      fromInventory,
      toInventory,
      fromGold,
      relationship
    );

    if (!offer) return null;

    const offerId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const tradeOffer: TradeOffer = {
      offerId,
      fromBotId,
      toBotId,
      offeredItems: offer.offeredItems,
      requestedItems: offer.requestedItems,
      offeredGold: offer.offeredGold,
      requestedGold: offer.requestedGold,
      status: 'pending',
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.OFFER_EXPIRY_HOURS * 60 * 60 * 1000),
      trustRequired: this.calculateTrustRequired(offer, relationship),
      motivation,
      counterOffers: []
    };

    this.activeOffers.set(offerId, tradeOffer);
    return tradeOffer;
  }

  /**
   * Construct the actual offer details
   */
  private constructOffer(
    fromBotId: string,
    toBotId: string,
    motivation: TradeMotivation,
    fromArchetype: EconomicArchetype,
    toArchetype: EconomicArchetype,
    fromInventory: Map<string, number>,
    toInventory: Map<string, number>,
    fromGold: number,
    relationship?: Relationship
  ): {
    offeredItems: TradeItem[];
    requestedItems: TradeItem[];
    offeredGold: number;
    requestedGold: number;
  } | null {
    const offeredItems: TradeItem[] = [];
    const requestedItems: TradeItem[] = [];
    let offeredGold = 0;
    let requestedGold = 0;

    switch (motivation) {
      case 'excess_inventory':
        // Offer items bot has too many of
        for (const [itemId, quantity] of fromInventory.entries()) {
          if (quantity > 5) { // Has excess
            const item = this.marketSim.getItem(itemId);
            if (item) {
              const offerQty = Math.floor(quantity * 0.3); // Offer 30%
              offeredItems.push({
                itemId,
                itemName: item.itemName,
                quantity: offerQty,
                estimatedValue: item.currentPrice * offerQty
              });

              // Request gold based on archetype
              const priceMultiplier = fromArchetype.profitMargin;
              requestedGold += item.currentPrice * offerQty * (1 + priceMultiplier);
            }
          }
        }
        break;

      case 'need_item':
        // Request specific items bot needs
        const allItems = this.marketSim.getAllItems();
        const neededItems = allItems.filter(item => {
          const has = fromInventory.get(item.itemId) || 0;
          return has < 2; // Needs more
        });

        if (neededItems.length > 0) {
          const needed = neededItems[Math.floor(Math.random() * neededItems.length)];
          const hasIt = toInventory.get(needed.itemId) || 0;

          if (hasIt > 0) {
            const requestQty = Math.min(hasIt, 2);
            requestedItems.push({
              itemId: needed.itemId,
              itemName: needed.itemName,
              quantity: requestQty,
              estimatedValue: needed.currentPrice * requestQty
            });

            // Offer gold
            offeredGold = needed.currentPrice * requestQty;
          }
        }
        break;

      case 'profit':
        // Arbitrage: Buy low, sell high
        const profitableItems = this.findArbitrageOpportunities(fromInventory, toInventory);
        if (profitableItems.length > 0) {
          const item = profitableItems[0];
          requestedItems.push({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: 1,
            estimatedValue: item.currentPrice
          });
          offeredGold = item.currentPrice * 0.8; // Offer below market
        }
        break;

      case 'help_friend':
        // Generous offer to friend
        if (relationship && relationship.stage === RelationshipStage.FRIEND) {
          for (const [itemId, quantity] of fromInventory.entries()) {
            if (quantity > 3) {
              const item = this.marketSim.getItem(itemId);
              if (item) {
                offeredItems.push({
                  itemId,
                  itemName: item.itemName,
                  quantity: 1,
                  estimatedValue: item.currentPrice
                });
                requestedGold = item.currentPrice * 0.5; // 50% discount for friends
                break;
              }
            }
          }
        }
        break;

      case 'build_relationship':
        // Small gift to build trust
        for (const [itemId, quantity] of fromInventory.entries()) {
          if (quantity > 2) {
            const item = this.marketSim.getItem(itemId);
            if (item && item.currentPrice < 50) { // Small value gift
              offeredItems.push({
                itemId,
                itemName: item.itemName,
                quantity: 1,
                estimatedValue: item.currentPrice
              });
              requestedGold = 0; // Free gift
              break;
            }
          }
        }
        break;

      case 'speculation':
        // Buy items expected to increase in value
        const risingItems = this.marketSim.getAllItems().filter(item =>
          this.marketSim.getPriceTrend(item.itemId) === 'rising'
        );

        if (risingItems.length > 0) {
          const item = risingItems[Math.floor(Math.random() * risingItems.length)];
          const hasIt = toInventory.get(item.itemId) || 0;

          if (hasIt > 0) {
            requestedItems.push({
              itemId: item.itemId,
              itemName: item.itemName,
              quantity: 1,
              estimatedValue: item.currentPrice
            });
            offeredGold = item.currentPrice * 1.1; // Willing to pay premium
          }
        }
        break;

      case 'specialization':
        // Trade according to specialization
        const spec = this.specializations.get(fromBotId);
        if (spec) {
          const relevantItems = this.getItemsForSpecialization(spec);
          for (const [itemId, quantity] of fromInventory.entries()) {
            if (relevantItems.includes(itemId) && quantity > 0) {
              const item = this.marketSim.getItem(itemId);
              if (item) {
                offeredItems.push({
                  itemId,
                  itemName: item.itemName,
                  quantity: 1,
                  estimatedValue: item.currentPrice
                });
                requestedGold = item.currentPrice * (1 + fromArchetype.profitMargin);
                break;
              }
            }
          }
        }
        break;
    }

    if (offeredItems.length === 0 && offeredGold === 0 &&
        requestedItems.length === 0 && requestedGold === 0) {
      return null; // No valid offer
    }

    return { offeredItems, requestedItems, offeredGold, requestedGold };
  }

  /**
   * Find arbitrage opportunities
   */
  private findArbitrageOpportunities(
    myInventory: Map<string, number>,
    theirInventory: Map<string, number>
  ): MarketItem[] {
    const opportunities: MarketItem[] = [];

    for (const [itemId, quantity] of theirInventory.entries()) {
      if (quantity > 0) {
        const item = this.marketSim.getItem(itemId);
        if (item) {
          const fairValue = this.marketSim.calculateFairValue(itemId);
          if (item.currentPrice < fairValue * 0.8) {
            // Underpriced!
            opportunities.push(item);
          }
        }
      }
    }

    return opportunities.sort((a, b) => {
      const aProfit = this.marketSim.calculateFairValue(a.itemId) - a.currentPrice;
      const bProfit = this.marketSim.calculateFairValue(b.itemId) - b.currentPrice;
      return bProfit - aProfit;
    });
  }

  /**
   * Get items relevant to a specialization
   */
  private getItemsForSpecialization(spec: EconomicSpecialization): string[] {
    const allItems = this.marketSim.getAllItems();

    switch (spec) {
      case 'weapon_dealer':
        return allItems.filter(i => i.category === 'weapon').map(i => i.itemId);
      case 'armor_smith':
        return allItems.filter(i => i.category === 'armor').map(i => i.itemId);
      case 'potion_maker':
        return allItems.filter(i => i.category === 'consumable').map(i => i.itemId);
      case 'resource_gatherer':
        return allItems.filter(i => i.category === 'resource').map(i => i.itemId);
      case 'luxury_trader':
        return allItems.filter(i => i.category === 'luxury').map(i => i.itemId);
      case 'craftsman':
        return allItems.filter(i => i.category === 'crafting').map(i => i.itemId);
      case 'general_merchant':
      case 'fence':
        return allItems.map(i => i.itemId); // Trade everything
      default:
        return [];
    }
  }

  /**
   * Calculate trust required for trade
   */
  private calculateTrustRequired(
    offer: {offeredItems: TradeItem[]; requestedItems: TradeItem[]; offeredGold: number; requestedGold: number},
    relationship?: Relationship
  ): number {
    const offeredValue = offer.offeredItems.reduce((sum, i) => sum + i.estimatedValue, 0) + offer.offeredGold;
    const requestedValue = offer.requestedItems.reduce((sum, i) => sum + i.estimatedValue, 0) + offer.requestedGold;

    if (offeredValue === 0 || requestedValue === 0) {
      // Free trade requires high trust
      return 0.8;
    }

    const ratio = Math.abs(offeredValue - requestedValue) / Math.max(offeredValue, requestedValue);

    // Fair trades require less trust
    if (ratio < this.FAIR_TRADE_TOLERANCE) {
      return relationship && relationship.stage === RelationshipStage.FRIEND ? 0.1 : 0.3;
    }

    // Unfair trades require more trust
    return Math.min(0.9, 0.5 + ratio);
  }

  // ============================================================================
  // TRADE EVALUATION & ACCEPTANCE
  // ============================================================================

  /**
   * Decide whether to accept a trade offer
   */
  shouldAcceptTrade(botId: string, offerId: string): boolean {
    const offer = this.activeOffers.get(offerId);
    if (!offer || offer.toBotId !== botId) return false;

    const archetype = this.marketSim.getBotArchetype(botId);
    if (!archetype) return false;

    const social = this.socialIntelligence.get(botId);
    const relationship = social?.getRelationship(offer.fromBotId, offer.fromBotId);
    const reputation = this.reputations.get(offer.fromBotId);

    // Check trust
    const trustLevel = relationship?.trust || 0;
    if (trustLevel < offer.trustRequired) {
      return false; // Don't trust them enough
    }

    // Check reputation
    if (reputation && reputation.reliabilityScore < 0.3) {
      return false; // Bad reputation
    }

    // Check if blacklisted
    const myRep = this.reputations.get(botId);
    if (myRep?.blacklist.includes(offer.fromBotId)) {
      return false;
    }

    // Evaluate trade fairness
    const fairness = this.evaluateTradeFairness(offer);

    // Different archetypes have different acceptance criteria
    switch (archetype.type) {
      case 'merchant':
        // Merchants want profit
        return fairness >= -0.1; // Accept if not too unfair

      case 'generous':
        // Generous bots accept most trades
        return fairness >= -0.3;

      case 'hoarder':
        // Hoarders rarely accept
        return fairness > 0.2 && Math.random() < 0.3;

      case 'opportunist':
        // Only accept profitable trades
        return fairness > 0.1;

      case 'market_maker':
        // Accept fair trades
        return Math.abs(fairness) < 0.15;

      case 'speculator':
        // Accept if items might increase in value
        const hasRisingItems = offer.requestedItems.some(item =>
          this.marketSim.getPriceTrend(item.itemId) === 'rising'
        );
        return hasRisingItems || fairness > 0;

      case 'producer':
        // Accept if need items for production
        return fairness >= -0.15;

      default:
        return fairness >= 0;
    }
  }

  /**
   * Evaluate trade fairness (-1 to 1, negative = bad for recipient)
   */
  private evaluateTradeFairness(offer: TradeOffer): number {
    const receivingValue = offer.offeredItems.reduce((sum, i) => sum + i.estimatedValue, 0) + offer.offeredGold;
    const givingValue = offer.requestedItems.reduce((sum, i) => sum + i.estimatedValue, 0) + offer.requestedGold;

    if (givingValue === 0) return 1; // Free stuff is always good
    if (receivingValue === 0) return -1; // Giving for free is bad (unless generous)

    return (receivingValue - givingValue) / givingValue;
  }

  /**
   * Generate counter-offer
   */
  generateCounterOffer(botId: string, originalOfferId: string): TradeOffer | null {
    const original = this.activeOffers.get(originalOfferId);
    if (!original || original.toBotId !== botId) return null;

    const fairness = this.evaluateTradeFairness(original);

    // Only counter if trade is somewhat unfair
    if (Math.abs(fairness) < 0.1) return null;

    // Adjust the offer
    const counter: TradeOffer = JSON.parse(JSON.stringify(original));
    counter.offerId = `counter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    counter.status = 'pending';
    counter.createdAt = new Date();

    if (fairness < 0) {
      // Bad deal for us - request more
      if (counter.requestedGold > 0) {
        counter.requestedGold *= 0.8; // Ask for less gold
      } else if (counter.offeredGold > 0) {
        counter.offeredGold *= 1.2; // Offer more gold
      }
    } else {
      // Too good for us - make it fairer
      if (counter.offeredGold > 0) {
        counter.offeredGold *= 0.9;
      }
    }

    original.counterOffers.push(counter);
    return counter;
  }

  // ============================================================================
  // TRADE EXECUTION
  // ============================================================================

  /**
   * Execute accepted trade
   */
  executeTrade(offerId: string): boolean {
    const offer = this.activeOffers.get(offerId);
    if (!offer || offer.status !== 'accepted') return false;

    // Transfer items and gold through market simulation
    // This is simplified - in reality would use MarketSimulation methods

    const fromInventory = this.marketSim.getBotInventory(offer.fromBotId);
    const toInventory = this.marketSim.getBotInventory(offer.toBotId);

    // Validate both parties have resources
    // (Actual implementation would be more robust)

    // Record trade
    this.completedTrades.push(offer);

    // Update reputations
    this.updateReputationAfterTrade(offer.fromBotId, offer.toBotId, true);

    // Update trade routes
    this.updateTradeRoute(offer.fromBotId, offer.toBotId, offer);

    // Remove from active offers
    this.activeOffers.delete(offerId);

    return true;
  }

  /**
   * Update trading reputation after trade
   */
  private updateReputationAfterTrade(bot1Id: string, bot2Id: string, success: boolean): void {
    for (const botId of [bot1Id, bot2Id]) {
      const rep = this.reputations.get(botId);
      if (rep) {
        rep.totalTrades++;
        if (success) {
          rep.successfulTrades++;
        } else {
          rep.failedTrades++;
        }

        rep.reliabilityScore = rep.successfulTrades / Math.max(1, rep.totalTrades);
        rep.lastTraded = new Date();

        // Add to trading partners if not already there
        const otherId = botId === bot1Id ? bot2Id : bot1Id;
        if (!rep.tradingPartners.includes(otherId)) {
          rep.tradingPartners.push(otherId);
        }
      }
    }
  }

  /**
   * Update or create trade route
   */
  private updateTradeRoute(bot1Id: string, bot2Id: string, offer: TradeOffer): void {
    const routeKey = [bot1Id, bot2Id].sort().join('_');
    const existing = this.tradeRoutes.get(routeKey);

    const tradeValue = offer.offeredItems.reduce((s, i) => s + i.estimatedValue, 0) + offer.offeredGold;
    const categories = [...new Set([
      ...offer.offeredItems.map(i => this.marketSim.getItem(i.itemId)?.category),
      ...offer.requestedItems.map(i => this.marketSim.getItem(i.itemId)?.category)
    ].filter(Boolean) as string[])];

    if (existing) {
      existing.tradeFrequency = (existing.tradeFrequency * 0.9) + 0.1; // Exponential moving average
      existing.totalVolume += tradeValue;
      existing.lastTrade = new Date();
      existing.routeStrength = Math.min(1, existing.routeStrength + 0.05);
      existing.primaryGoods = [...new Set([...existing.primaryGoods, ...categories])];
    } else {
      const route: TradeRoute = {
        routeId: `route_${routeKey}`,
        bot1Id,
        bot2Id,
        primaryGoods: categories,
        tradeFrequency: 1,
        totalVolume: tradeValue,
        profitability: 0,
        established: new Date(),
        lastTrade: new Date(),
        routeStrength: 0.2
      };
      this.tradeRoutes.set(routeKey, route);
    }
  }

  // ============================================================================
  // NEGOTIATION
  // ============================================================================

  /**
   * Start negotiation process
   */
  startNegotiation(bot1Id: string, bot2Id: string, initialOffer: TradeOffer): string {
    const negotiationId = `negotiation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const negotiation: NegotiationState = {
      negotiationId,
      participants: [bot1Id, bot2Id],
      currentOffer: initialOffer,
      rounds: 0,
      maxRounds: this.MAX_NEGOTIATION_ROUNDS,
      status: 'ongoing',
      history: [initialOffer]
    };

    this.negotiations.set(negotiationId, negotiation);
    return negotiationId;
  }

  /**
   * Continue negotiation with counter-offer
   */
  continueNegotiation(negotiationId: string, counterOffer: TradeOffer): void {
    const negotiation = this.negotiations.get(negotiationId);
    if (!negotiation || negotiation.status !== 'ongoing') return;

    negotiation.currentOffer = counterOffer;
    negotiation.rounds++;
    negotiation.history.push(counterOffer);

    // Check if agreement reached
    const fairness = this.evaluateTradeFairness(counterOffer);
    if (Math.abs(fairness) < this.FAIR_TRADE_TOLERANCE) {
      negotiation.status = 'agreed';
      counterOffer.status = 'accepted';
      return;
    }

    // Check if max rounds reached
    if (negotiation.rounds >= negotiation.maxRounds) {
      negotiation.status = 'failed';
    }
  }

  // ============================================================================
  // ANALYSIS & REPORTING
  // ============================================================================

  /**
   * Get trading statistics for a bot
   */
  getTradingStats(botId: string): TradingReputation | undefined {
    return this.reputations.get(botId);
  }

  /**
   * Get strongest trade routes
   */
  getTopTradeRoutes(limit: number = 10): TradeRoute[] {
    return Array.from(this.tradeRoutes.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);
  }

  /**
   * Get network graph for visualization
   */
  getTradingNetwork(): {nodes: string[]; edges: Array<{from: string; to: string; weight: number}>} {
    const nodes = Array.from(this.reputations.keys());
    const edges: Array<{from: string; to: string; weight: number}> = [];

    for (const route of this.tradeRoutes.values()) {
      edges.push({
        from: route.bot1Id,
        to: route.bot2Id,
        weight: route.totalVolume
      });
    }

    return { nodes, edges };
  }

  /**
   * Find trade opportunities for bot
   */
  findTradeOpportunities(botId: string): TradeOpportunity[] {
    const opportunities: TradeOpportunity[] = [];
    const myInventory = this.marketSim.getBotInventory(botId);
    const myGold = this.marketSim.getBotGold(botId);
    const myArchetype = this.marketSim.getBotArchetype(botId);

    if (!myArchetype) return [];

    // Check all other bots
    for (const otherId of this.reputations.keys()) {
      if (otherId === botId) continue;

      const otherInventory = this.marketSim.getBotInventory(otherId);
      const social = this.socialIntelligence.get(botId);
      const relationship = social?.getRelationship(otherId, otherId);

      // Arbitrage opportunities
      const arbitrageItems = this.findArbitrageOpportunities(myInventory, otherInventory);
      for (const item of arbitrageItems.slice(0, 3)) {
        const profit = this.marketSim.calculateFairValue(item.itemId) - item.currentPrice;
        opportunities.push({
          opportunityId: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          targetBotId: otherId,
          type: 'arbitrage',
          expectedProfit: profit,
          riskLevel: item.volatility,
          itemsInvolved: [item.itemId],
          confidence: 0.7,
          reasoning: `Buy ${item.itemName} below market value`
        });
      }

      // Social opportunities (help friends)
      if (relationship && relationship.stage === RelationshipStage.FRIEND) {
        opportunities.push({
          opportunityId: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          targetBotId: otherId,
          type: 'social',
          expectedProfit: 0,
          riskLevel: 0.1,
          itemsInvolved: [],
          confidence: 0.9,
          reasoning: 'Build relationship with friend through trading'
        });
      }
    }

    return opportunities.sort((a, b) => b.expectedProfit - a.expectedProfit);
  }

  /**
   * Generate trading network report
   */
  getTradingNetworkReport(): string {
    const totalTrades = this.completedTrades.length;
    const activeOffers = this.activeOffers.size;
    const routes = this.tradeRoutes.size;
    const avgReputation = Array.from(this.reputations.values())
      .reduce((sum, r) => sum + r.reliabilityScore, 0) / Math.max(1, this.reputations.size);

    let report = `=== TRADING NETWORK REPORT ===\n\n`;

    report += `NETWORK OVERVIEW:\n`;
    report += `- Active Traders: ${this.reputations.size}\n`;
    report += `- Completed Trades: ${totalTrades}\n`;
    report += `- Active Offers: ${activeOffers}\n`;
    report += `- Established Routes: ${routes}\n`;
    report += `- Avg Reliability: ${(avgReputation * 100).toFixed(1)}%\n\n`;

    report += `TOP TRADE ROUTES:\n`;
    const topRoutes = this.getTopTradeRoutes(5);
    topRoutes.forEach((route, i) => {
      report += `${i + 1}. ${route.bot1Id} <-> ${route.bot2Id}\n`;
      report += `   Volume: ${route.totalVolume.toFixed(0)} gold, `;
      report += `Frequency: ${route.tradeFrequency.toFixed(1)}/day\n`;
    });
    report += `\n`;

    report += `SPECIALIZATIONS:\n`;
    const specializations = new Map<EconomicSpecialization, number>();
    for (const spec of this.specializations.values()) {
      specializations.set(spec, (specializations.get(spec) || 0) + 1);
    }
    for (const [spec, count] of specializations.entries()) {
      report += `- ${spec}: ${count} bots\n`;
    }

    return report;
  }
}
