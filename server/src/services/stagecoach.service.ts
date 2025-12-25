/**
 * Stagecoach Service
 *
 * Handles stagecoach travel, booking, and journey mechanics
 */

import mongoose from 'mongoose';
import {
  Stagecoach,
  StagecoachRoute,
  BookingRequest,
  BookingResponse,
  PassengerInfo,
  StagecoachCargoManifest,
  StagecoachCargoItem,
  NPCDriver,
  NPCGuard,
  TravelProgress,
  StagecoachStatus,
  StagecoachEvent,
} from '@desperados/shared';
import { Character, ICharacter } from '../models/Character.model';
import { StagecoachTicket, IStagecoachTicket } from '../models/StagecoachTicket.model';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import {
  STAGECOACH_ROUTES,
  getRouteById,
  calculateFare,
  getNextDeparture,
} from '../data/stagecoachRoutes';
import { WAY_STATIONS } from '../data/wayStations';
import logger from '../utils/logger';
import { stagecoachStateManager } from './base/StateManager';
import { SecureRNG } from './base/SecureRNG';
import { WorldEventService } from './worldEvent.service';

/**
 * Stagecoach Service
 */
export class StagecoachService {

  /**
   * Get all available routes
   */
  static getAvailableRoutes(): StagecoachRoute[] {
    return STAGECOACH_ROUTES.filter(r => r.isActive);
  }

  /**
   * Get route details by ID
   */
  static getRouteDetails(routeId: string): StagecoachRoute | null {
    const route = getRouteById(routeId);
    return route || null;
  }

  /**
   * Get upcoming departures for a route
   */
  static getUpcomingDepartures(
    routeId: string,
    currentTime: Date = new Date()
  ): Array<{ time: Date; seatsAvailable: number; fare: number }> {
    const route = getRouteById(routeId);
    if (!route) {
      return [];
    }

    const currentHour = currentTime.getHours();
    const departures: Array<{ time: Date; seatsAvailable: number; fare: number }> = [];

    // Get next 4 departures
    let hour = currentHour;
    let daysOffset = 0;
    let count = 0;

    while (count < 4) {
      const nextDeparture = getNextDeparture(route, hour);

      if (nextDeparture >= 24) {
        hour = nextDeparture - 24;
        daysOffset++;
      } else {
        hour = nextDeparture;
      }

      const departureTime = new Date(currentTime);
      departureTime.setDate(departureTime.getDate() + daysOffset);
      departureTime.setHours(hour, 0, 0, 0);

      departures.push({
        time: departureTime,
        seatsAvailable: this.getAvailableSeats(route.id, departureTime),
        fare: route.fare.base,
      });

      count++;
      hour++;
    }

    return departures;
  }

  /**
   * Get available seats for a specific departure
   */
  private static getAvailableSeats(routeId: string, departureTime: Date): number {
    const route = getRouteById(routeId);
    if (!route) return 0;

    // Check route type for capacity
    const capacity = this.getCapacityForRoute(route);

    // Count booked tickets for this departure (would be database query in production)
    // For now, return capacity minus random bookings
    const bookedSeats = SecureRNG.range(0, Math.floor(capacity * 0.3));
    return capacity - bookedSeats;
  }

  /**
   * Get capacity based on route type
   */
  private static getCapacityForRoute(route: StagecoachRoute): number {
    // Luxury routes have fewer seats
    if (route.fare.perMile > 2.0) return 4;
    // Dangerous routes have fewer passengers willing to travel
    if (route.dangerLevel >= 8) return 6;
    // Standard routes
    return 8;
  }

  /**
   * Book a ticket
   */
  static async bookTicket(request: BookingRequest): Promise<BookingResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(request.characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Character not found',
          fare: 0,
          departureTime: new Date(),
          estimatedArrival: new Date(),
        };
      }

      // Check if character already has an active ticket
      const existingTicket = await StagecoachTicket.findActiveByCharacter(
        request.characterId
      );
      if (existingTicket) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'You already have an active stagecoach ticket',
          fare: 0,
          departureTime: new Date(),
          estimatedArrival: new Date(),
        };
      }

      // Get route
      const route = getRouteById(request.routeId);
      if (!route || !route.isActive) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Route not found or inactive',
          fare: 0,
          departureTime: new Date(),
          estimatedArrival: new Date(),
        };
      }

      // Validate locations are on route
      const departureStop = route.stops.find(
        s => s.locationId === request.departureLocationId
      );
      const destinationStop = route.stops.find(
        s => s.locationId === request.destinationLocationId
      );

      if (!departureStop || !destinationStop) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Invalid departure or destination location',
          fare: 0,
          departureTime: new Date(),
          estimatedArrival: new Date(),
        };
      }

      if (departureStop.stopOrder >= destinationStop.stopOrder) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'Destination must be after departure on route',
          fare: 0,
          departureTime: new Date(),
          estimatedArrival: new Date(),
        };
      }

      // Check character is at departure location
      if (character.currentLocation !== request.departureLocationId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'You must be at the departure location to book a ticket',
          fare: 0,
          departureTime: new Date(),
          estimatedArrival: new Date(),
        };
      }

      // Calculate fare
      const fare = calculateFare(route, departureStop.stopOrder, destinationStop.stopOrder);

      // Check character has enough dollars
      if (character.dollars < fare) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: `Not enough dollars. Ticket costs $${fare}`,
          fare,
          departureTime: new Date(),
          estimatedArrival: new Date(),
        };
      }

      // Determine departure time
      let departureTime: Date;
      if (request.departureTime) {
        departureTime = request.departureTime;
      } else {
        // Get next scheduled departure
        const currentHour = new Date().getHours();
        const nextHour = getNextDeparture(route, currentHour);
        departureTime = new Date();
        if (nextHour >= 24) {
          departureTime.setDate(departureTime.getDate() + 1);
          departureTime.setHours(nextHour - 24, 0, 0, 0);
        } else {
          departureTime.setHours(nextHour, 0, 0, 0);
        }
      }

      // Calculate arrival time with world event modifiers
      let travelHours = route.baseDuration;

      // Apply world event travel_time modifiers
      try {
        const activeEvents = await WorldEventService.getActiveEventsForLocation(request.departureLocationId);
        for (const event of activeEvents) {
          const travelMod = event.worldEffects.find(e => e.type === 'travel_time');
          if (travelMod && (travelMod.target === 'all' || travelMod.target === request.departureLocationId)) {
            const oldTravelHours = travelHours;
            travelHours = Math.ceil(travelHours * travelMod.value);
            logger.info(
              `World event "${event.name}" modified travel time from ${oldTravelHours}h to ${travelHours}h ` +
              `(${travelMod.value}x modifier: ${travelMod.description})`
            );
          }
        }
      } catch (eventError) {
        // Don't fail booking if event check fails
        logger.error('Failed to check world events for travel time modifiers:', eventError);
      }

      const estimatedArrival = new Date(departureTime.getTime() + travelHours * 60 * 60 * 1000);

      // Check seat availability
      const availableSeats = this.getAvailableSeats(route.id, departureTime);
      if (availableSeats <= 0) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          message: 'No seats available for this departure',
          fare,
          departureTime,
          estimatedArrival,
        };
      }

      // Assign seat number (simple assignment)
      const seatNumber = SecureRNG.range(1, this.getCapacityForRoute(route));

      // Deduct dollars
      await DollarService.deductDollars(
        character._id as any,
        fare,
        TransactionSource.STAGECOACH_TICKET,
        {
          routeId: route.id,
          routeName: route.name,
          departure: request.departureLocationId,
          destination: request.destinationLocationId,
          description: `Stagecoach ticket from ${departureStop.locationName} to ${destinationStop.locationName}`,
          currencyType: CurrencyType.DOLLAR,
        },
        session
      );

      // Create stagecoach ID
      const stagecoachId = `stagecoach_${route.id}_${departureTime.getTime()}`;

      // Create ticket
      const ticket = new StagecoachTicket({
        characterId: character._id,
        routeId: route.id,
        stagecoachId,
        departureLocation: request.departureLocationId,
        destinationLocation: request.destinationLocationId,
        departureTime,
        estimatedArrival,
        fare,
        seatNumber,
        luggageWeight: request.luggageWeight,
        weaponDeclared: request.weaponDeclared,
        status: 'booked',
        purchaseTime: new Date(),
      });

      await ticket.save({ session });

      // Create or update stagecoach
      const stagecoach = await this.getOrCreateStagecoach(
        stagecoachId,
        route,
        departureTime,
        estimatedArrival
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Character ${character.name} booked stagecoach ticket on route ${route.name} for $${fare}`
      );

      return {
        success: true,
        ticket: ticket.toJSON() as any,
        stagecoach,
        message: `Ticket booked! Departure at ${departureTime.toLocaleTimeString()}`,
        fare,
        departureTime,
        estimatedArrival,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error booking stagecoach ticket:', error);
      throw error;
    }
  }

  /**
   * Get or create stagecoach instance
   */
  private static async getOrCreateStagecoach(
    stagecoachId: string,
    route: StagecoachRoute,
    departureTime: Date,
    estimatedArrival: Date
  ): Promise<Stagecoach> {
    // Check if stagecoach already exists
    let stagecoach = await stagecoachStateManager.get<Stagecoach>(stagecoachId);

    if (!stagecoach) {
      // Create new stagecoach
      stagecoach = {
        id: stagecoachId,
        type: this.determineStagecoachType(route),
        capacity: this.getCapacityForRoute(route),
        currentRoute: route,
        driver: this.generateDriver(route),
        guards: this.generateGuards(route),
        passengers: [],
        cargo: this.generateCargo(route),
        condition: 100,
        currentPosition: {
          currentStopIndex: 0,
          nextStopIndex: 1,
          distanceToNext: 0,
          progressPercent: 0,
        },
        departureTime,
        estimatedArrival,
        status: 'loading',
        events: [],
      };

      // Store with 8-hour TTL (typical journey duration)
      await stagecoachStateManager.set(stagecoachId, stagecoach, { ttl: 28800 });
    }

    return stagecoach;
  }

  /**
   * Determine stagecoach type based on route
   */
  private static determineStagecoachType(route: StagecoachRoute): 'passenger' | 'mail' | 'treasure' | 'private' {
    if (route.fare.perMile > 2.0) return 'private';
    if (route.dangerLevel >= 7) return 'treasure';
    if (SecureRNG.chance(0.3)) return 'mail';
    return 'passenger';
  }

  /**
   * Generate NPC driver
   */
  private static generateDriver(route: StagecoachRoute): NPCDriver {
    const names = [
      'Old Pete',
      'Quick Draw McGraw',
      'Steady Eddie',
      'Iron Will Johnson',
      'Cautious Carl',
      'Daredevil Dan',
    ];

    const skill = Math.min(10, 3 + Math.floor(route.dangerLevel / 2));
    const experience = SecureRNG.range(5, 25);

    return {
      name: SecureRNG.select(names),
      skill,
      experience,
      personality: skill > 7 ? 'Confident and experienced' : 'Nervous but capable',
      combatAbility: Math.floor(skill * 0.6),
    };
  }

  /**
   * Generate NPC guards based on route danger
   */
  private static generateGuards(route: StagecoachRoute): NPCGuard[] {
    const guards: NPCGuard[] = [];
    const guardCount = Math.floor(route.dangerLevel / 3);

    const guardNames = [
      'Shotgun Sam',
      'Rifle Rick',
      'Quick-Eye Quinn',
      'Steady Steve',
      'Dead-Eye Dave',
    ];

    for (let i = 0; i < guardCount; i++) {
      guards.push({
        name: SecureRNG.select(guardNames),
        level: Math.floor(route.dangerLevel / 2) + SecureRNG.range(0, 4),
        weapon: SecureRNG.chance(0.5) ? 'Shotgun' : 'Rifle',
        accuracy: Math.min(10, 4 + Math.floor(route.dangerLevel / 2)),
        alertness: Math.min(10, 5 + Math.floor(route.dangerLevel / 3)),
      });
    }

    return guards;
  }

  /**
   * Generate cargo manifest
   */
  private static generateCargo(route: StagecoachRoute): StagecoachCargoManifest {
    const items = [];
    let totalValue = 0;
    let totalWeight = 0;

    // Mail is always present
    const mailValue = SecureRNG.range(50, 150);
    items.push({
      type: 'mail' as const,
      description: 'US Mail sacks',
      value: mailValue,
      weight: 50,
      protected: true,
    });
    totalValue += mailValue;
    totalWeight += 50;

    // Add parcels
    const parcelCount = SecureRNG.range(1, 4);
    for (let i = 0; i < parcelCount; i++) {
      const parcelValue = SecureRNG.range(10, 60);
      const parcelWeight = SecureRNG.range(10, 30);
      items.push({
        type: 'parcel' as const,
        description: 'General goods and parcels',
        value: parcelValue,
        weight: parcelWeight,
        owner: 'Various',
        protected: false,
      });
      totalValue += parcelValue;
      totalWeight += parcelWeight;
    }

    // High danger routes may have strongbox
    const hasStrongbox = route.dangerLevel >= 6 && SecureRNG.chance(0.5);
    let strongboxValue = 0;

    if (hasStrongbox) {
      strongboxValue = SecureRNG.range(500, 1500);
      items.push({
        type: 'strongbox' as const,
        description: 'Wells Fargo Strongbox',
        value: strongboxValue,
        weight: 100,
        protected: true,
      });
      totalValue += strongboxValue;
      totalWeight += 100;
    }

    return {
      items,
      totalValue,
      totalWeight,
      hasStrongbox,
      strongboxValue,
    };
  }

  /**
   * Cancel ticket and issue refund
   */
  static async cancelTicket(ticketId: string, characterId: string): Promise<{
    success: boolean;
    refundAmount: number;
    message: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const ticket = await StagecoachTicket.findById(ticketId).session(session);
      if (!ticket) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          refundAmount: 0,
          message: 'Ticket not found',
        };
      }

      // Verify ownership
      if (ticket.characterId.toString() !== characterId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          refundAmount: 0,
          message: 'You do not own this ticket',
        };
      }

      // Check if refundable
      if (!(ticket as any).isRefundable) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          refundAmount: 0,
          message: 'Ticket is no longer refundable',
        };
      }

      // Calculate refund (80% of original fare)
      const refundAmount = Math.floor(ticket.fare * 0.8);

      // Issue refund
      const character = await Character.findById(characterId).session(session);
      if (character) {
        await DollarService.addDollars(
          character._id as any,
          refundAmount,
          TransactionSource.REFUND,
          {
            ticketId: ticket._id.toString(),
            description: `Stagecoach ticket refund (80%)`,
            currencyType: CurrencyType.DOLLAR,
          },
          session
        );
      }

      // Update ticket
      ticket.status = 'cancelled';
      ticket.refunded = true;
      ticket.refundAmount = refundAmount;
      await ticket.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        refundAmount,
        message: `Ticket cancelled. Refunded $${refundAmount} (80% of fare)`,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error cancelling ticket:', error);
      throw error;
    }
  }

  /**
   * Get current travel progress
   */
  static async getTravelProgress(ticketId: string): Promise<TravelProgress | null> {
    const ticket = await StagecoachTicket.findById(ticketId);
    if (!ticket || ticket.status !== 'traveling') {
      return null;
    }

    const stagecoach = await stagecoachStateManager.get<Stagecoach>(ticket.stagecoachId);
    if (!stagecoach) {
      return null;
    }

    const elapsed = Date.now() - ticket.departureTime.getTime();
    const total = ticket.estimatedArrival.getTime() - ticket.departureTime.getTime();
    const progressPercent = Math.min(100, Math.floor((elapsed / total) * 100));

    return {
      stagecoachId: stagecoach.id,
      currentPosition: {
        ...stagecoach.currentPosition,
        progressPercent,
      },
      estimatedArrival: ticket.estimatedArrival,
      status: stagecoach.status,
      events: stagecoach.events,
      currentSpeed: 8, // MPH average
      delayMinutes: 0,
    };
  }

  /**
   * Complete journey (called when stagecoach arrives)
   */
  static async completeJourney(ticketId: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const ticket = await StagecoachTicket.findById(ticketId).session(session);
      if (!ticket) {
        await session.abortTransaction();
        session.endSession();
        return false;
      }

      const character = await Character.findById(ticket.characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return false;
      }

      // Update character location
      character.currentLocation = ticket.destinationLocation;
      character.lastActive = new Date();
      await character.save({ session });

      // Update ticket
      ticket.status = 'completed';
      ticket.completedTime = new Date();
      await ticket.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${character.name} completed stagecoach journey to ${ticket.destinationLocation}`);

      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error completing journey:', error);
      throw error;
    }
  }

  /**
   * Get active ticket for character
   */
  static async getActiveTicket(characterId: string): Promise<IStagecoachTicket | null> {
    return StagecoachTicket.findActiveByCharacter(characterId);
  }

  /**
   * Get travel history for character
   */
  static async getTravelHistory(characterId: string): Promise<IStagecoachTicket[]> {
    return StagecoachTicket.findCompletedByCharacter(characterId);
  }

  /**
   * Get way station information
   */
  static getWayStations() {
    return WAY_STATIONS;
  }
}
