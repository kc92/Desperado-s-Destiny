/**
 * Train Service
 *
 * Handles train operations including tickets, travel, and cargo shipping
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { TrainTicket, ITrainTicket } from '../models/TrainTicket.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  TrainType,
  TrainStatus,
  TicketClass,
  TicketStatus,
  TrainSchedule,
  TrainRoute,
  TrainTravelRequest,
  TrainTravelResult,
  CargoShippingRequest,
  CargoShippingQuote,
  CargoShipment,
  TrainCargoItem,
  TRAIN_CONSTANTS,
} from '@desperados/shared';
import {
  TRAIN_ROUTES,
  getTrainRoute,
  findRoutesBetween,
  calculateTravelTime,
} from '../data/trainRoutes';
import {
  ALL_TRAIN_SCHEDULES,
  getTrainSchedule,
  getNextDeparture,
  getAvailableTrains,
} from '../data/trainSchedules';
import logger from '../utils/logger';

export class TrainService {
  /**
   * Get all available routes
   */
  static getAvailableRoutes(): TrainRoute[] {
    return TRAIN_ROUTES.filter((route) => route.isActive);
  }

  /**
   * Get all train schedules
   */
  static getAllSchedules(): TrainSchedule[] {
    return ALL_TRAIN_SCHEDULES;
  }

  /**
   * Get routes between two locations
   */
  static getRoutesBetweenLocations(origin: string, destination: string): TrainRoute[] {
    return findRoutesBetween(origin, destination);
  }

  /**
   * Get available trains for a journey
   */
  static getAvailableTrainsForJourney(
    origin: string,
    destination: string,
    afterTime: Date = new Date()
  ): Array<{
    schedule: TrainSchedule;
    route: TrainRoute;
    departureTime: Date;
    arrivalTime: Date;
    duration: number;
    prices: Record<TicketClass, number>;
  }> {
    const routes = findRoutesBetween(origin, destination);
    const availableTrains: Array<any> = [];

    for (const route of routes) {
      const trains = getAvailableTrains(route.routeId, afterTime.getHours());

      for (const schedule of trains) {
        // Skip non-passenger trains for regular travel
        if (
          schedule.trainType !== TrainType.PASSENGER &&
          schedule.trainType !== TrainType.VIP_EXPRESS &&
          schedule.trainType !== TrainType.MAIL_EXPRESS
        ) {
          continue;
        }

        const departureTime = getNextDeparture(schedule, afterTime);
        const travelTime = calculateTravelTime(route, origin, destination);

        if (travelTime === null) continue;

        const arrivalTime = new Date(departureTime.getTime() + travelTime * 60 * 1000);

        // Calculate prices based on distance and class
        const basePrice = Math.floor(travelTime / 60) * 50; // $50 per hour of travel
        const prices = {
          [TicketClass.COACH]: basePrice,
          [TicketClass.FIRST_CLASS]: basePrice * 3,
          [TicketClass.PRIVATE_CAR]: basePrice * 10,
        };

        availableTrains.push({
          schedule,
          route,
          departureTime,
          arrivalTime,
          duration: travelTime,
          prices,
        });
      }
    }

    // Sort by departure time
    return availableTrains.sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime());
  }

  /**
   * Purchase a train ticket
   */
  static async purchaseTicket(request: TrainTravelRequest): Promise<TrainTravelResult> {
    const character = await Character.findById(request.characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Validate character is at origin location
    if (character.currentLocation !== request.origin) {
      throw new Error('Character must be at the departure location');
    }

    // Find available trains
    const availableTrains = this.getAvailableTrainsForJourney(
      request.origin,
      request.destination,
      request.departureTime
    );

    if (availableTrains.length === 0) {
      throw new Error('No trains available for this route');
    }

    // Select the train (first available if no specific time requested)
    const selectedTrain = request.departureTime
      ? availableTrains.find(
          (t) => t.departureTime.getTime() === request.departureTime!.getTime()
        ) || availableTrains[0]
      : availableTrains[0];

    const ticketPrice = selectedTrain.prices[request.ticketClass];

    // Check if character can afford ticket
    if (!character.hasGold(ticketPrice)) {
      throw new Error(`Insufficient gold. Ticket costs $${ticketPrice}`);
    }

    // Deduct gold
    await character.deductGold(ticketPrice, TransactionSource.TRAIN_TICKET, {
      trainId: selectedTrain.schedule.trainId,
      origin: request.origin,
      destination: request.destination,
      ticketClass: request.ticketClass,
    });

    // Create ticket
    const ticket = await TrainTicket.create({
      passengerId: character._id,
      passengerName: character.name,
      trainId: selectedTrain.schedule.trainId,
      routeId: selectedTrain.route.routeId,
      ticketClass: request.ticketClass,
      origin: request.origin,
      destination: request.destination,
      departureTime: selectedTrain.departureTime,
      arrivalTime: selectedTrain.arrivalTime,
      price: ticketPrice,
      status: TicketStatus.VALID,
      perks: TRAIN_CONSTANTS.TICKET_PERKS[request.ticketClass],
      purchasedAt: new Date(),
    });

    logger.info(
      `Character ${character.name} purchased ${request.ticketClass} ticket on train ${selectedTrain.schedule.trainName} for $${ticketPrice}`
    );

    await character.save();

    return {
      ticket: ticket.toJSON() as any,
      train: selectedTrain.schedule,
      departureTime: selectedTrain.departureTime,
      arrivalTime: selectedTrain.arrivalTime,
      duration: selectedTrain.duration,
      cost: ticketPrice,
      perks: TRAIN_CONSTANTS.TICKET_PERKS[request.ticketClass],
    };
  }

  /**
   * Use a ticket to board a train and travel
   */
  static async boardTrain(
    characterId: string,
    ticketId: string
  ): Promise<{
    success: boolean;
    arrivalTime: Date;
    destination: string;
    message: string;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const ticket = await TrainTicket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Validate ticket belongs to character
    if (ticket.passengerId.toString() !== characterId) {
      throw new Error('This ticket does not belong to you');
    }

    // Validate ticket can be used
    if (!ticket.canUse()) {
      throw new Error('Ticket cannot be used at this time');
    }

    // Validate character is at departure location
    if (character.currentLocation !== ticket.origin) {
      throw new Error('You must be at the departure location to board');
    }

    // Use ticket
    ticket.use();
    await ticket.save();

    // Update character location (instant travel in this implementation)
    // In a real-time game, you might track character as "in transit"
    character.currentLocation = ticket.destination;
    character.lastActive = new Date();
    await character.save();

    logger.info(
      `Character ${character.name} boarded train and traveled from ${ticket.origin} to ${ticket.destination}`
    );

    return {
      success: true,
      arrivalTime: ticket.arrivalTime,
      destination: ticket.destination,
      message: `You board the train and settle into your ${ticket.ticketClass.toLowerCase().replace('_', ' ')} seat. The journey to ${ticket.destination} will take ${Math.floor((ticket.arrivalTime.getTime() - ticket.departureTime.getTime()) / 60000)} minutes.`,
    };
  }

  /**
   * Refund a ticket
   */
  static async refundTicket(
    characterId: string,
    ticketId: string
  ): Promise<{
    success: boolean;
    refundAmount: number;
    message: string;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const ticket = await TrainTicket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Validate ticket belongs to character
    if (ticket.passengerId.toString() !== characterId) {
      throw new Error('This ticket does not belong to you');
    }

    // Validate ticket can be refunded
    if (!ticket.canRefund()) {
      throw new Error(
        'Ticket cannot be refunded. Refunds must be requested at least 2 hours before departure.'
      );
    }

    // Calculate refund (80% of ticket price)
    const refundAmount = Math.floor(ticket.price * 0.8);

    // Refund ticket
    ticket.refund();
    await ticket.save();

    // Add gold back to character
    await character.addGold(refundAmount, TransactionSource.TRAIN_REFUND, {
      ticketId: ticket._id.toString(),
      originalPrice: ticket.price,
    });

    await character.save();

    logger.info(
      `Character ${character.name} refunded ticket ${ticketId} for $${refundAmount}`
    );

    return {
      success: true,
      refundAmount,
      message: `Ticket refunded. You received $${refundAmount} (80% of the ticket price).`,
    };
  }

  /**
   * Get character's tickets
   */
  static async getCharacterTickets(
    characterId: string,
    includeUsed: boolean = false
  ): Promise<ITrainTicket[]> {
    const query: any = { passengerId: characterId };

    if (!includeUsed) {
      query.status = { $in: [TicketStatus.VALID, TicketStatus.EXPIRED] };
    }

    return TrainTicket.find(query).sort({ departureTime: -1 });
  }

  /**
   * Get a cargo shipping quote
   */
  static async getCargoQuote(request: CargoShippingRequest): Promise<CargoShippingQuote> {
    const routes = findRoutesBetween(request.origin, request.destination);
    if (routes.length === 0) {
      throw new Error('No routes available between these locations');
    }

    // Calculate total weight and value
    let totalWeight = 0;
    let totalValue = 0;

    for (const item of request.cargo) {
      totalWeight += item.weight * item.quantity;
      totalValue += item.value * item.quantity;
    }

    // Calculate shipping cost based on weight
    const shippingCost = Math.ceil(totalWeight * TRAIN_CONSTANTS.CARGO_RATE_PER_LB);

    // Calculate insurance cost if requested
    const insuranceCost = request.insured
      ? Math.ceil(totalValue * TRAIN_CONSTANTS.INSURANCE_RATE)
      : 0;

    const totalCost = shippingCost + insuranceCost;

    // Find next available freight train
    const route = routes[0];
    const freightTrains = ALL_TRAIN_SCHEDULES.filter(
      (s) =>
        s.routeId === route.routeId &&
        (s.trainType === TrainType.FREIGHT || s.trainType === TrainType.SUPPLY_RUN) &&
        s.status === TrainStatus.RUNNING
    );

    if (freightTrains.length === 0) {
      throw new Error('No freight trains available for this route');
    }

    const selectedTrain = freightTrains[0];
    const departureTime = getNextDeparture(selectedTrain);
    const travelTime = calculateTravelTime(route, request.origin, request.destination) || 0;
    const arrivalTime = new Date(departureTime.getTime() + travelTime * 60 * 1000);

    return {
      shippingCost,
      insuranceCost,
      totalCost,
      totalWeight,
      totalValue,
      estimatedDeparture: departureTime,
      estimatedArrival: arrivalTime,
      duration: travelTime,
      availableTrains: freightTrains.map((t) => t.trainId),
    };
  }

  /**
   * Ship cargo
   */
  static async shipCargo(
    request: CargoShippingRequest
  ): Promise<{
    shipment: CargoShipment;
    cost: number;
    message: string;
  }> {
    const character = await Character.findById(request.characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Validate character is at origin
    if (character.currentLocation !== request.origin) {
      throw new Error('Character must be at the origin location to ship cargo');
    }

    // Get quote
    const quote = await this.getCargoQuote(request);

    // Check if character can afford shipping
    if (!character.hasGold(quote.totalCost)) {
      throw new Error(`Insufficient gold. Shipping costs $${quote.totalCost}`);
    }

    // Deduct gold
    await character.deductGold(quote.totalCost, TransactionSource.CARGO_SHIPPING, {
      origin: request.origin,
      destination: request.destination,
      weight: quote.totalWeight,
      insured: request.insured,
    });

    // Create cargo shipment record (simplified - would be in database in full implementation)
    const shipment: CargoShipment = {
      shipperId: character._id as any,
      shipperName: character.name,
      trainId: quote.availableTrains[0],
      routeId: findRoutesBetween(request.origin, request.destination)[0].routeId,
      origin: request.origin,
      destination: request.destination,
      cargo: request.cargo,
      totalWeight: quote.totalWeight,
      totalValue: quote.totalValue,
      insured: request.insured,
      insuranceCost: quote.insuranceCost,
      shippingCost: quote.shippingCost,
      departureTime: quote.estimatedDeparture,
      arrivalTime: quote.estimatedArrival,
      status: 'pending',
    };

    await character.save();

    logger.info(
      `Character ${character.name} shipped ${request.cargo.length} items from ${request.origin} to ${request.destination} for $${quote.totalCost}`
    );

    return {
      shipment,
      cost: quote.totalCost,
      message: `Cargo shipped successfully. Your shipment will depart at ${quote.estimatedDeparture.toLocaleString()} and arrive at ${quote.estimatedArrival.toLocaleString()}.`,
    };
  }

  /**
   * Get train schedule information for a specific train
   */
  static getTrainInfo(trainId: string): TrainSchedule | null {
    return getTrainSchedule(trainId) || null;
  }

  /**
   * Check if a location has a train station
   */
  static hasTrainStation(locationId: string): boolean {
    return TRAIN_ROUTES.some((route) =>
      route.stops.some((stop) => stop.locationId === locationId)
    );
  }

  /**
   * Get all trains departing from a location
   */
  static getTrainsAtLocation(locationId: string, afterTime: Date = new Date()): TrainSchedule[] {
    const routesAtLocation = TRAIN_ROUTES.filter((route) =>
      route.stops.some(
        (stop) => stop.locationId === locationId && (stop.canBoard || stop.isTerminal)
      )
    );

    const trains: TrainSchedule[] = [];

    for (const route of routesAtLocation) {
      const routeTrains = ALL_TRAIN_SCHEDULES.filter((s) => s.routeId === route.routeId);
      trains.push(...routeTrains);
    }

    return trains.filter((train) => train.status === TrainStatus.RUNNING);
  }
}
