/**
 * Train Controller
 *
 * Handles HTTP requests for train travel system endpoints
 */

import { Request, Response } from 'express';
import { TrainService } from '../services/train.service';
import { TrainRobberyService } from '../services/trainRobbery.service';
import { TicketClass, RobberyApproach } from '@desperados/shared';
import logger from '../utils/logger';

export class TrainController {
  // ============================================
  // PUBLIC ROUTES (No character required)
  // ============================================

  /**
   * GET /api/trains/routes
   * Get all available train routes
   */
  static async getRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = TrainService.getAvailableRoutes();

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      logger.error('Error getting train routes:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get train routes'
      });
    }
  }

  /**
   * GET /api/trains/schedules
   * Get all train schedules
   */
  static async getSchedules(req: Request, res: Response): Promise<void> {
    try {
      const schedules = TrainService.getAllSchedules();

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      logger.error('Error getting train schedules:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get train schedules'
      });
    }
  }

  /**
   * GET /api/trains/:trainId
   * Get information about a specific train
   */
  static async getTrainInfo(req: Request, res: Response): Promise<void> {
    try {
      const { trainId } = req.params;

      if (!trainId) {
        res.status(400).json({
          success: false,
          error: 'Train ID is required'
        });
        return;
      }

      const train = TrainService.getTrainInfo(trainId);

      if (!train) {
        res.status(404).json({
          success: false,
          error: 'Train not found'
        });
        return;
      }

      res.json({
        success: true,
        data: train
      });
    } catch (error) {
      logger.error('Error getting train info:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get train info'
      });
    }
  }

  /**
   * GET /api/trains/station/:locationId
   * Check if a location has a train station
   */
  static async checkStation(req: Request, res: Response): Promise<void> {
    try {
      const { locationId } = req.params;

      if (!locationId) {
        res.status(400).json({
          success: false,
          error: 'Location ID is required'
        });
        return;
      }

      const hasStation = TrainService.hasTrainStation(locationId);

      res.json({
        success: true,
        data: {
          locationId,
          hasStation
        }
      });
    } catch (error) {
      logger.error('Error checking train station:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check station'
      });
    }
  }

  // ============================================
  // PROTECTED ROUTES (Character required)
  // ============================================

  /**
   * GET /api/trains/search
   * Search for available trains between two locations
   * Query: { origin: string, destination: string, afterTime?: string }
   */
  static async searchTrains(req: Request, res: Response): Promise<void> {
    try {
      const { origin, destination, afterTime } = req.query;

      if (!origin || !destination) {
        res.status(400).json({
          success: false,
          error: 'Origin and destination are required'
        });
        return;
      }

      const afterDate = afterTime ? new Date(afterTime as string) : new Date();
      const trains = TrainService.getAvailableTrainsForJourney(
        origin as string,
        destination as string,
        afterDate
      );

      res.json({
        success: true,
        data: trains
      });
    } catch (error) {
      logger.error('Error searching trains:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search trains'
      });
    }
  }

  /**
   * GET /api/trains/routes/between
   * Get routes between two specific locations
   * Query: { origin: string, destination: string }
   */
  static async getRoutesBetween(req: Request, res: Response): Promise<void> {
    try {
      const { origin, destination } = req.query;

      if (!origin || !destination) {
        res.status(400).json({
          success: false,
          error: 'Origin and destination are required'
        });
        return;
      }

      const routes = TrainService.getRoutesBetweenLocations(
        origin as string,
        destination as string
      );

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      logger.error('Error getting routes between locations:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get routes'
      });
    }
  }

  /**
   * GET /api/trains/location/:locationId/departures
   * Get all trains departing from a location
   */
  static async getTrainsAtLocation(req: Request, res: Response): Promise<void> {
    try {
      const { locationId } = req.params;
      const { afterTime } = req.query;

      if (!locationId) {
        res.status(400).json({
          success: false,
          error: 'Location ID is required'
        });
        return;
      }

      const afterDate = afterTime ? new Date(afterTime as string) : new Date();
      const trains = TrainService.getTrainsAtLocation(locationId, afterDate);

      res.json({
        success: true,
        data: trains
      });
    } catch (error) {
      logger.error('Error getting trains at location:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get trains'
      });
    }
  }

  /**
   * POST /api/trains/tickets/purchase
   * Purchase a train ticket
   * Body: { origin: string, destination: string, ticketClass: TicketClass, departureTime?: string }
   */
  static async purchaseTicket(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { origin, destination, ticketClass, departureTime } = req.body;

      if (!origin || !destination || !ticketClass) {
        res.status(400).json({
          success: false,
          error: 'Origin, destination, and ticket class are required'
        });
        return;
      }

      if (!Object.values(TicketClass).includes(ticketClass)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ticket class'
        });
        return;
      }

      const result = await TrainService.purchaseTicket({
        characterId,
        origin,
        destination,
        ticketClass,
        departureTime: departureTime ? new Date(departureTime) : undefined
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error purchasing ticket:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to purchase ticket'
      });
    }
  }

  /**
   * GET /api/trains/tickets
   * Get character's train tickets
   * Query: { includeUsed?: boolean }
   */
  static async getTickets(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const includeUsed = req.query.includeUsed === 'true';

      const tickets = await TrainService.getCharacterTickets(characterId, includeUsed);

      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      logger.error('Error getting tickets:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tickets'
      });
    }
  }

  /**
   * POST /api/trains/tickets/:ticketId/board
   * Board a train using a ticket
   */
  static async boardTrain(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({
          success: false,
          error: 'Ticket ID is required'
        });
        return;
      }

      const result = await TrainService.boardTrain(characterId, ticketId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error boarding train:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to board train'
      });
    }
  }

  /**
   * POST /api/trains/tickets/:ticketId/refund
   * Refund a train ticket
   */
  static async refundTicket(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({
          success: false,
          error: 'Ticket ID is required'
        });
        return;
      }

      const result = await TrainService.refundTicket(characterId, ticketId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error refunding ticket:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refund ticket'
      });
    }
  }

  /**
   * POST /api/trains/cargo/quote
   * Get a cargo shipping quote
   * Body: { origin: string, destination: string, cargo: TrainCargoItem[], insured?: boolean }
   */
  static async getCargoQuote(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { origin, destination, cargo, insured } = req.body;

      if (!origin || !destination || !cargo || !Array.isArray(cargo)) {
        res.status(400).json({
          success: false,
          error: 'Origin, destination, and cargo array are required'
        });
        return;
      }

      const quote = await TrainService.getCargoQuote({
        characterId,
        origin,
        destination,
        cargo,
        insured: insured || false
      });

      res.json({
        success: true,
        data: quote
      });
    } catch (error) {
      logger.error('Error getting cargo quote:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cargo quote'
      });
    }
  }

  /**
   * POST /api/trains/cargo/ship
   * Ship cargo via train
   * Body: { origin: string, destination: string, cargo: TrainCargoItem[], insured?: boolean }
   */
  static async shipCargo(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { origin, destination, cargo, insured } = req.body;

      if (!origin || !destination || !cargo || !Array.isArray(cargo)) {
        res.status(400).json({
          success: false,
          error: 'Origin, destination, and cargo array are required'
        });
        return;
      }

      const result = await TrainService.shipCargo({
        characterId,
        origin,
        destination,
        cargo,
        insured: insured || false
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error shipping cargo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to ship cargo'
      });
    }
  }

  // ============================================
  // TRAIN ROBBERY ROUTES
  // ============================================

  /**
   * POST /api/trains/robbery/scout
   * Scout a train for robbery intelligence
   * Body: { trainId: string, departureTime?: string }
   */
  static async scoutTrain(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { trainId, departureTime } = req.body;

      if (!trainId) {
        res.status(400).json({
          success: false,
          error: 'Train ID is required'
        });
        return;
      }

      const intelligence = await TrainRobberyService.scoutTrain({
        characterId,
        trainId,
        departureTime: departureTime ? new Date(departureTime) : new Date()
      });

      res.json({
        success: true,
        data: intelligence
      });
    } catch (error) {
      logger.error('Error scouting train:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scout train'
      });
    }
  }

  /**
   * POST /api/trains/robbery/plan
   * Plan a train robbery
   * Body: { trainId, departureTime, approach, targetLocation, gangMemberIds, equipment }
   */
  static async planRobbery(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { trainId, departureTime, approach, targetLocation, gangMemberIds, equipment } = req.body;

      if (!trainId || !departureTime || !approach || !targetLocation) {
        res.status(400).json({
          success: false,
          error: 'Train ID, departure time, approach, and target location are required'
        });
        return;
      }

      if (!Object.values(RobberyApproach).includes(approach)) {
        res.status(400).json({
          success: false,
          error: 'Invalid robbery approach'
        });
        return;
      }

      const plan = await TrainRobberyService.planRobbery(
        characterId,
        trainId,
        new Date(departureTime),
        approach,
        targetLocation,
        gangMemberIds || [],
        equipment || []
      );

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      logger.error('Error planning robbery:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to plan robbery'
      });
    }
  }

  /**
   * POST /api/trains/robbery/:robberyId/execute
   * Execute a planned train robbery
   */
  static async executeRobbery(req: Request, res: Response): Promise<void> {
    try {
      const { robberyId } = req.params;

      if (!robberyId) {
        res.status(400).json({
          success: false,
          error: 'Robbery ID is required'
        });
        return;
      }

      const result = await TrainRobberyService.executeRobbery(robberyId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error executing robbery:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute robbery'
      });
    }
  }

  /**
   * GET /api/trains/robbery/plans
   * Get character's robbery plans
   */
  static async getRobberyPlans(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      const plans = TrainRobberyService.getCharacterRobberyPlans(characterId);

      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      logger.error('Error getting robbery plans:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get robbery plans'
      });
    }
  }

  /**
   * GET /api/trains/robbery/:robberyId
   * Get a specific robbery plan
   */
  static async getRobberyPlan(req: Request, res: Response): Promise<void> {
    try {
      const { robberyId } = req.params;

      if (!robberyId) {
        res.status(400).json({
          success: false,
          error: 'Robbery ID is required'
        });
        return;
      }

      const plan = TrainRobberyService.getRobberyPlan(robberyId);

      if (!plan) {
        res.status(404).json({
          success: false,
          error: 'Robbery plan not found'
        });
        return;
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error) {
      logger.error('Error getting robbery plan:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get robbery plan'
      });
    }
  }

  /**
   * GET /api/trains/robbery/pursuit
   * Get active Pinkerton pursuit for character
   */
  static async getActivePursuit(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      const pursuit = TrainRobberyService.getActivePursuit(characterId);

      res.json({
        success: true,
        data: pursuit
      });
    } catch (error) {
      logger.error('Error getting active pursuit:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pursuit status'
      });
    }
  }
}
