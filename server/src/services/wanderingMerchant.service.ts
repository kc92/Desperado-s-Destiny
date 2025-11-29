/**
 * Wandering Merchant Service
 *
 * Manages traveling merchants and their routes.
 * Tracks current locations, integrates with schedule system,
 * and provides location-based merchant discovery.
 */

import {
  WANDERING_MERCHANTS,
  WanderingMerchant,
  getMerchantById,
  getMerchantsAtLocation,
  getMerchantCurrentLocation,
  RouteStop,
  MerchantItem
} from '../data/wanderingMerchants';
import { NPCActivityState, NPCActivity } from '@desperados/shared';
import { TimeService } from './time.service';
import { ScheduleService } from './schedule.service';
import { Character, ICharacter } from '../models/Character.model';
import { Item, IItem } from '../models/Item.model';
import { GoldTransaction, TransactionSource } from '../models/GoldTransaction.model';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';
import { areTransactionsDisabled } from '../utils/transaction.helper';
import logger from '../utils/logger';

/**
 * Extended NPC state with merchant-specific data
 */
export interface WanderingMerchantState extends NPCActivityState {
  merchantId: string;
  merchantName: string;
  currentStop?: RouteStop;
  nextStop?: RouteStop;
  isAvailableForTrade: boolean;
  inventory: MerchantItem[];
  specialFeatures: string[];
  usesBarter: boolean;
  isHidden: boolean;
  discoveryCondition?: string;
}

/**
 * Wandering Merchant Service
 */
export class WanderingMerchantService {
  /**
   * Cache for discovered merchants (per player)
   * In production, this would be stored in database
   */
  private static discoveredMerchants: Map<string, Set<string>> = new Map();

  /**
   * Initialize the wandering merchant service
   * Registers all merchant schedules with the schedule service
   */
  static initialize(): void {
    for (const merchant of WANDERING_MERCHANTS) {
      // Register merchant schedule with ScheduleService
      ScheduleService.setNPCSchedule(merchant.schedule);
    }

    logger.info(`Wandering Merchant Service initialized with ${WANDERING_MERCHANTS.length} merchants`);
  }

  /**
   * Get all wandering merchants
   */
  static getAllMerchants(): WanderingMerchant[] {
    return WANDERING_MERCHANTS;
  }

  /**
   * Get merchant by ID
   */
  static getMerchant(merchantId: string): WanderingMerchant | undefined {
    return getMerchantById(merchantId);
  }

  /**
   * Get current day of week (1-7, Monday-Sunday)
   */
  private static getCurrentDayOfWeek(): number {
    const gameTime = TimeService.getCurrentGameTime();
    const dayOfWeek = gameTime.getDay();
    // Convert JS day (0=Sunday) to our system (1=Monday, 7=Sunday)
    return dayOfWeek === 0 ? 7 : dayOfWeek;
  }

  /**
   * Get merchant's current location based on day/time
   */
  static getMerchantLocation(merchantId: string): RouteStop | null {
    const dayOfWeek = this.getCurrentDayOfWeek();
    const hour = TimeService.getCurrentHour();
    return getMerchantCurrentLocation(merchantId, dayOfWeek, hour);
  }

  /**
   * Get all merchants currently at a location
   */
  static getMerchantsAtLocation(locationId: string): WanderingMerchant[] {
    const dayOfWeek = this.getCurrentDayOfWeek();
    const hour = TimeService.getCurrentHour();
    return getMerchantsAtLocation(locationId, dayOfWeek, hour);
  }

  /**
   * Get full state for a wandering merchant
   */
  static getMerchantState(merchantId: string): WanderingMerchantState | null {
    const merchant = getMerchantById(merchantId);
    if (!merchant) {
      logger.warn(`Merchant not found: ${merchantId}`);
      return null;
    }

    // Get current location from route
    const currentStop = this.getMerchantLocation(merchantId);

    // Get activity from schedule service
    const activity = ScheduleService.getCurrentActivity(merchant.schedule.npcId);

    if (!activity) {
      logger.warn(`No activity found for merchant: ${merchantId}`);
      return null;
    }

    // Determine if available for trade (working activity and at a location)
    const isAvailableForTrade =
      activity.currentActivity === NPCActivity.WORKING &&
      currentStop !== null &&
      activity.isAvailable;

    // Get next stop
    const nextStop = this.getNextStop(merchant, currentStop);

    const state: WanderingMerchantState = {
      // Base activity state
      npcId: merchant.id,
      npcName: merchant.name,
      currentActivity: activity.currentActivity,
      currentLocation: currentStop?.locationId || 'traveling',
      currentLocationName: currentStop?.locationName || 'On the Road',
      isAvailable: activity.isAvailable,
      activityDialogue: activity.activityDialogue,
      startTime: activity.startTime,
      endTime: activity.endTime,
      nextActivity: activity.nextActivity,

      // Merchant-specific data
      merchantId: merchant.id,
      merchantName: merchant.name,
      currentStop,
      nextStop,
      isAvailableForTrade,
      inventory: merchant.inventory,
      specialFeatures: merchant.specialFeatures,
      usesBarter: merchant.barter || false,
      isHidden: merchant.hidden || false,
      discoveryCondition: merchant.discoveryCondition
    };

    return state;
  }

  /**
   * Get next stop on merchant's route
   */
  private static getNextStop(merchant: WanderingMerchant, currentStop: RouteStop | null): RouteStop | undefined {
    if (!currentStop) {
      // Currently traveling, find next stop in sequence
      const dayOfWeek = this.getCurrentDayOfWeek();
      const hour = TimeService.getCurrentHour();

      // Find the next stop in the future
      for (const stop of merchant.route) {
        if (stop.arrivalDay > dayOfWeek ||
            (stop.arrivalDay === dayOfWeek && stop.arrivalHour > hour)) {
          return stop;
        }
      }
      // Wrap around to first stop
      return merchant.route[0];
    } else {
      // At a location, find next stop
      const currentIndex = merchant.route.indexOf(currentStop);
      const nextIndex = (currentIndex + 1) % merchant.route.length;
      return merchant.route[nextIndex];
    }
  }

  /**
   * Get all merchants currently available for trading
   */
  static getAvailableMerchants(): WanderingMerchantState[] {
    const available: WanderingMerchantState[] = [];

    for (const merchant of WANDERING_MERCHANTS) {
      const state = this.getMerchantState(merchant.id);
      if (state && state.isAvailableForTrade && !state.isHidden) {
        available.push(state);
      }
    }

    return available;
  }

  /**
   * Get merchants by faction
   */
  static getMerchantsByFaction(faction: string): WanderingMerchant[] {
    return WANDERING_MERCHANTS.filter(m => m.faction === faction);
  }

  /**
   * Check if player has discovered a hidden merchant
   */
  static hasPlayerDiscovered(playerId: string, merchantId: string): boolean {
    const playerDiscoveries = this.discoveredMerchants.get(playerId);
    return playerDiscoveries?.has(merchantId) || false;
  }

  /**
   * Mark merchant as discovered by player
   */
  static discoverMerchant(playerId: string, merchantId: string): void {
    if (!this.discoveredMerchants.has(playerId)) {
      this.discoveredMerchants.set(playerId, new Set());
    }
    this.discoveredMerchants.get(playerId)!.add(merchantId);
    logger.info(`Player ${playerId} discovered merchant ${merchantId}`);
  }

  /**
   * Get all merchants visible to a player (including discovered hidden ones)
   */
  static getVisibleMerchantsForPlayer(playerId: string): WanderingMerchant[] {
    return WANDERING_MERCHANTS.filter(merchant => {
      if (!merchant.hidden) return true;
      return this.hasPlayerDiscovered(playerId, merchant.id);
    });
  }

  /**
   * Get merchant inventory filtered by trust level
   */
  static getMerchantInventory(merchantId: string, playerTrustLevel: number = 0): MerchantItem[] {
    const merchant = getMerchantById(merchantId);
    if (!merchant) return [];

    // Filter inventory by trust level
    return merchant.inventory.filter(item => {
      const requiredTrust = item.trustRequired || 0;
      return playerTrustLevel >= requiredTrust;
    });
  }

  /**
   * Get merchant dialogue based on trust level
   */
  static getMerchantDialogue(
    merchantId: string,
    playerTrustLevel: number = 0,
    context: 'greeting' | 'trading' | 'departure' | 'busy' = 'greeting'
  ): string {
    const merchant = getMerchantById(merchantId);
    if (!merchant) return 'Hello.';

    // Handle trust-based dialogue
    if (context === 'greeting') {
      if (playerTrustLevel >= 4) {
        const options = merchant.dialogue.trust.high;
        return options[Math.floor(Math.random() * options.length)];
      } else if (playerTrustLevel >= 2) {
        const options = merchant.dialogue.trust.medium;
        return options[Math.floor(Math.random() * options.length)];
      } else {
        const options = merchant.dialogue.trust.low;
        return options[Math.floor(Math.random() * options.length)];
      }
    }

    // Handle other context types
    const options = merchant.dialogue[context];
    return options[Math.floor(Math.random() * options.length)] || 'Hello.';
  }

  /**
   * Calculate travel time between two locations
   */
  static getTravelTimeBetweenStops(stop1: RouteStop, stop2: RouteStop): number {
    // Calculate days and hours between stops
    let dayDiff = stop2.arrivalDay - stop1.departureDay;
    if (dayDiff < 0) dayDiff += 7; // Wrap around week

    const hourDiff = stop2.arrivalHour - stop1.departureHour;
    return (dayDiff * 24) + hourDiff;
  }

  /**
   * Get merchant's full route schedule
   */
  static getMerchantRouteSchedule(merchantId: string): RouteStop[] {
    const merchant = getMerchantById(merchantId);
    return merchant?.route || [];
  }

  /**
   * Check if merchant will be at location soon
   */
  static willMerchantArriveSoon(
    merchantId: string,
    locationId: string,
    hoursAhead: number = 24
  ): { willArrive: boolean; hoursUntilArrival?: number; arrivalStop?: RouteStop } {
    const merchant = getMerchantById(merchantId);
    if (!merchant) return { willArrive: false };

    const currentDay = this.getCurrentDayOfWeek();
    const currentHour = TimeService.getCurrentHour();
    const currentTimeInHours = (currentDay - 1) * 24 + currentHour;

    for (const stop of merchant.route) {
      if (stop.locationId !== locationId) continue;

      const arrivalTimeInHours = (stop.arrivalDay - 1) * 24 + stop.arrivalHour;
      let hoursUntilArrival = arrivalTimeInHours - currentTimeInHours;

      // Handle week wrap-around
      if (hoursUntilArrival < 0) {
        hoursUntilArrival += 7 * 24; // Add a week
      }

      if (hoursUntilArrival <= hoursAhead) {
        return {
          willArrive: true,
          hoursUntilArrival,
          arrivalStop: stop
        };
      }
    }

    return { willArrive: false };
  }

  /**
   * Get all merchants arriving at location soon
   */
  static getUpcomingMerchantsAtLocation(
    locationId: string,
    hoursAhead: number = 48
  ): Array<{ merchant: WanderingMerchant; hoursUntilArrival: number; stop: RouteStop }> {
    const upcoming: Array<{ merchant: WanderingMerchant; hoursUntilArrival: number; stop: RouteStop }> = [];

    for (const merchant of WANDERING_MERCHANTS) {
      const arrival = this.willMerchantArriveSoon(merchant.id, locationId, hoursAhead);
      if (arrival.willArrive && arrival.hoursUntilArrival !== undefined && arrival.arrivalStop) {
        upcoming.push({
          merchant,
          hoursUntilArrival: arrival.hoursUntilArrival,
          stop: arrival.arrivalStop
        });
      }
    }

    // Sort by arrival time
    upcoming.sort((a, b) => a.hoursUntilArrival - b.hoursUntilArrival);

    return upcoming;
  }

  /**
   * Get statistics about wandering merchants
   */
  static getMerchantStatistics(): {
    totalMerchants: number;
    currentlyAvailable: number;
    hiddenMerchants: number;
    barterMerchants: number;
    byFaction: Record<string, number>;
    currentLocations: Record<string, number>;
  } {
    const stats = {
      totalMerchants: WANDERING_MERCHANTS.length,
      currentlyAvailable: 0,
      hiddenMerchants: 0,
      barterMerchants: 0,
      byFaction: {} as Record<string, number>,
      currentLocations: {} as Record<string, number>
    };

    for (const merchant of WANDERING_MERCHANTS) {
      // Count by type
      if (merchant.hidden) stats.hiddenMerchants++;
      if (merchant.barter) stats.barterMerchants++;

      // Count by faction
      stats.byFaction[merchant.faction] = (stats.byFaction[merchant.faction] || 0) + 1;

      // Check availability
      const state = this.getMerchantState(merchant.id);
      if (state?.isAvailableForTrade) {
        stats.currentlyAvailable++;

        // Count current locations
        const location = state.currentLocationName;
        stats.currentLocations[location] = (stats.currentLocations[location] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Search for merchants by name or goods
   */
  static searchMerchants(query: string): WanderingMerchant[] {
    const lowerQuery = query.toLowerCase();

    return WANDERING_MERCHANTS.filter(merchant => {
      // Search by name
      if (merchant.name.toLowerCase().includes(lowerQuery)) return true;
      if (merchant.title.toLowerCase().includes(lowerQuery)) return true;

      // Search by inventory items
      const hasItem = merchant.inventory.some(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      );
      if (hasItem) return true;

      // Search by special features
      const hasFeature = merchant.specialFeatures.some(feature =>
        feature.toLowerCase().includes(lowerQuery)
      );
      if (hasFeature) return true;

      return false;
    });
  }

  /**
   * Get price modifier based on player trust
   */
  static getPriceModifier(merchantId: string, playerTrustLevel: number): number {
    const merchant = getMerchantById(merchantId);
    if (!merchant) return 1.0;

    // Check trust level unlocks for price discounts
    for (const trustLevel of merchant.trustLevels) {
      if (playerTrustLevel >= trustLevel.level) {
        // Extract discount percentage from benefit text
        const discountMatch = trustLevel.benefit.match(/(\d+)%\s*discount/i);
        if (discountMatch) {
          const discountPercent = parseInt(discountMatch[1]);
          return 1.0 - (discountPercent / 100);
        }
      }
    }

    return 1.0; // No discount
  }

  /**
   * Buy an item from a wandering merchant
   * Handles both merchant inventory items and database items
   */
  static async buyFromMerchant(
    characterId: string,
    merchantId: string,
    itemId: string,
    quantity: number = 1,
    playerTrustLevel: number = 0
  ): Promise<{
    character: ICharacter;
    item: MerchantItem;
    totalCost: number;
    priceModifier: number;
    message: string;
  }> {
    // Validate quantity
    if (quantity <= 0 || quantity > 100 || !Number.isInteger(quantity)) {
      throw new AppError('Invalid quantity', 400);
    }

    // Get merchant
    const merchant = getMerchantById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }

    // Check if merchant is available for trade
    const state = this.getMerchantState(merchantId);
    if (!state || !state.isAvailableForTrade) {
      throw new AppError('This merchant is not currently available for trading', 400);
    }

    // Find item in merchant's inventory
    const merchantItem = merchant.inventory.find(item => item.itemId === itemId);
    if (!merchantItem) {
      throw new AppError('Item not found in merchant inventory', 404);
    }

    // Check trust requirement
    const requiredTrust = merchantItem.trustRequired || 0;
    if (playerTrustLevel < requiredTrust) {
      throw new AppError(`You need trust level ${requiredTrust} with this merchant to buy this item`, 400);
    }

    // Check stock if limited
    if (merchantItem.quantity !== undefined && merchantItem.quantity < quantity) {
      throw new AppError(`Only ${merchantItem.quantity} items left in stock`, 400);
    }

    // Calculate price with trust discount
    const priceModifier = this.getPriceModifier(merchantId, playerTrustLevel);
    const basePrice = merchantItem.price * quantity;
    const totalCost = Math.round(basePrice * priceModifier);

    // Start transaction
    const useSession = !areTransactionsDisabled();
    const session = useSession ? await mongoose.startSession() : null;

    if (session) session.startTransaction();

    try {
      // Get character with lock
      const character = session
        ? await Character.findById(characterId).session(session)
        : await Character.findById(characterId);

      if (!character || !character.isActive) {
        throw new AppError('Character not found', 404);
      }

      // Check gold
      if (character.gold < totalCost) {
        throw new AppError(`Insufficient gold. Need ${totalCost}, have ${character.gold}`, 400);
      }

      // Deduct gold atomically
      await character.deductGold(totalCost, TransactionSource.SHOP_PURCHASE, {
        merchantId,
        merchantName: merchant.name,
        itemId: merchantItem.itemId,
        quantity,
        unitPrice: merchantItem.price,
        priceModifier
      });

      // Add item to inventory
      // Check if a database Item exists for this itemId
      const dbItem = await Item.findByItemId(itemId);

      if (dbItem && dbItem.isStackable) {
        // Use database item - check for existing stack
        const existingItem = character.inventory.find(inv => inv.itemId === itemId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          character.inventory.push({
            itemId: itemId,
            quantity,
            acquiredAt: new Date()
          });
        }
      } else {
        // Add as new inventory entry (merchant-specific item or non-stackable)
        const existingItem = character.inventory.find(inv => inv.itemId === itemId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          character.inventory.push({
            itemId: itemId,
            quantity,
            acquiredAt: new Date()
          });
        }
      }

      await character.save(session ? { session } : undefined);

      if (session) await session.commitTransaction();

      logger.info(`Character ${characterId} bought ${quantity}x ${merchantItem.name} from ${merchant.name} for ${totalCost}g`);

      return {
        character,
        item: merchantItem,
        totalCost,
        priceModifier,
        message: `Purchased ${quantity}x ${merchantItem.name} for ${totalCost} gold`
      };
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) session.endSession();
    }
  }

  /**
   * Debug: Log current state of all wandering merchants
   */
  static logCurrentState(): void {
    const dayOfWeek = this.getCurrentDayOfWeek();
    const hour = TimeService.getCurrentHour();
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    logger.info(`=== Wandering Merchants State (${dayNames[dayOfWeek]} ${hour}:00) ===`);

    for (const merchant of WANDERING_MERCHANTS) {
      const state = this.getMerchantState(merchant.id);
      if (!state) continue;

      const location = state.currentStop
        ? `${state.currentLocationName} (${state.currentActivity})`
        : 'Traveling between locations';

      const available = state.isAvailableForTrade ? 'OPEN FOR TRADE' : 'Not available';

      logger.info(`${merchant.name} - ${location} - ${available}`);

      if (state.nextStop) {
        logger.info(`  Next: ${state.nextStop.locationName} at ${dayNames[state.nextStop.arrivalDay]} ${state.nextStop.arrivalHour}:00`);
      }
    }

    const stats = this.getMerchantStatistics();
    logger.info('\nMerchant Statistics:', stats);
  }

  /**
   * Get merchant trust unlock info
   */
  static getTrustLevelInfo(merchantId: string, currentTrustLevel: number): {
    current: string;
    next?: { level: number; benefit: string; description: string };
    unlocked: Array<{ level: number; benefit: string; description: string }>;
  } {
    const merchant = getMerchantById(merchantId);
    if (!merchant) {
      return { current: 'Unknown', unlocked: [] };
    }

    // Get unlocked benefits
    const unlocked = merchant.trustLevels.filter(t => t.level <= currentTrustLevel);

    // Get next benefit
    const next = merchant.trustLevels.find(t => t.level > currentTrustLevel);

    // Determine current status
    let current = 'Stranger';
    if (currentTrustLevel >= 5) current = 'Closest Friend';
    else if (currentTrustLevel >= 4) current = 'Trusted Friend';
    else if (currentTrustLevel >= 3) current = 'Good Friend';
    else if (currentTrustLevel >= 2) current = 'Friend';
    else if (currentTrustLevel >= 1) current = 'Acquaintance';

    return { current, next, unlocked };
  }
}

// Initialize the service when module is loaded
WanderingMerchantService.initialize();

export default WanderingMerchantService;
