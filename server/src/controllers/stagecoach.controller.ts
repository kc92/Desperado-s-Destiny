/**
 * Stagecoach Controller
 *
 * Handles HTTP requests for stagecoach travel system endpoints
 */

import { Request, Response } from 'express';
import { StagecoachService } from '../services/stagecoach.service';
import { StagecoachAmbushService } from '../services/stagecoachAmbush.service';
import logger from '../utils/logger';

export class StagecoachController {
  // ============================================
  // PUBLIC ROUTES (No character required)
  // ============================================

  /**
   * GET /api/stagecoach/routes
   * Get all available stagecoach routes
   */
  static async getRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = StagecoachService.getAvailableRoutes();

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      logger.error('Error getting stagecoach routes:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stagecoach routes'
      });
    }
  }

  /**
   * GET /api/stagecoach/routes/:routeId
   * Get details for a specific route
   */
  static async getRouteDetails(req: Request, res: Response): Promise<void> {
    try {
      const { routeId } = req.params;

      if (!routeId) {
        res.status(400).json({
          success: false,
          error: 'Route ID is required'
        });
        return;
      }

      const route = StagecoachService.getRouteDetails(routeId);

      if (!route) {
        res.status(404).json({
          success: false,
          error: 'Route not found'
        });
        return;
      }

      res.json({
        success: true,
        data: route
      });
    } catch (error) {
      logger.error('Error getting route details:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get route details'
      });
    }
  }

  /**
   * GET /api/stagecoach/way-stations
   * Get all way stations
   */
  static async getWayStations(req: Request, res: Response): Promise<void> {
    try {
      const wayStations = StagecoachService.getWayStations();

      res.json({
        success: true,
        data: wayStations
      });
    } catch (error) {
      logger.error('Error getting way stations:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get way stations'
      });
    }
  }

  /**
   * GET /api/stagecoach/routes/:routeId/departures
   * Get upcoming departures for a route
   */
  static async getUpcomingDepartures(req: Request, res: Response): Promise<void> {
    try {
      const { routeId } = req.params;

      if (!routeId) {
        res.status(400).json({
          success: false,
          error: 'Route ID is required'
        });
        return;
      }

      const departures = StagecoachService.getUpcomingDepartures(routeId);

      res.json({
        success: true,
        data: departures
      });
    } catch (error) {
      logger.error('Error getting upcoming departures:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get departures'
      });
    }
  }

  // ============================================
  // PROTECTED ROUTES (Character required)
  // ============================================

  /**
   * POST /api/stagecoach/tickets/book
   * Book a stagecoach ticket
   * Body: { routeId, departureLocationId, destinationLocationId, departureTime?, luggageWeight?, weaponDeclared? }
   */
  static async bookTicket(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const {
        routeId,
        departureLocationId,
        destinationLocationId,
        departureTime,
        luggageWeight,
        weaponDeclared
      } = req.body;

      if (!routeId || !departureLocationId || !destinationLocationId) {
        res.status(400).json({
          success: false,
          error: 'Route ID, departure location, and destination location are required'
        });
        return;
      }

      const result = await StagecoachService.bookTicket({
        characterId,
        routeId,
        departureLocationId,
        destinationLocationId,
        departureTime: departureTime ? new Date(departureTime) : undefined,
        luggageWeight: luggageWeight || 0,
        weaponDeclared: weaponDeclared || false
      });

      res.json({
        success: result.success,
        data: result.success ? result : undefined,
        error: result.success ? undefined : result.message
      });
    } catch (error) {
      logger.error('Error booking ticket:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book ticket'
      });
    }
  }

  /**
   * GET /api/stagecoach/tickets/active
   * Get active ticket for character
   */
  static async getActiveTicket(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      const ticket = await StagecoachService.getActiveTicket(characterId);

      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      logger.error('Error getting active ticket:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get active ticket'
      });
    }
  }

  /**
   * GET /api/stagecoach/tickets/history
   * Get travel history for character
   */
  static async getTravelHistory(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      const history = await StagecoachService.getTravelHistory(characterId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error getting travel history:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get travel history'
      });
    }
  }

  /**
   * POST /api/stagecoach/tickets/:ticketId/cancel
   * Cancel a ticket and get refund
   */
  static async cancelTicket(req: Request, res: Response): Promise<void> {
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

      const result = await StagecoachService.cancelTicket(ticketId, characterId);

      res.json({
        success: result.success,
        data: result.success ? result : undefined,
        error: result.success ? undefined : result.message
      });
    } catch (error) {
      logger.error('Error canceling ticket:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel ticket'
      });
    }
  }

  /**
   * GET /api/stagecoach/tickets/:ticketId/progress
   * Get travel progress for an active journey
   */
  static async getTravelProgress(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({
          success: false,
          error: 'Ticket ID is required'
        });
        return;
      }

      const progress = await StagecoachService.getTravelProgress(ticketId);

      if (!progress) {
        res.status(404).json({
          success: false,
          error: 'No active journey found for this ticket'
        });
        return;
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      logger.error('Error getting travel progress:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get travel progress'
      });
    }
  }

  /**
   * POST /api/stagecoach/tickets/:ticketId/complete
   * Complete a journey (for testing/admin)
   */
  static async completeJourney(req: Request, res: Response): Promise<void> {
    try {
      const { ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({
          success: false,
          error: 'Ticket ID is required'
        });
        return;
      }

      const success = await StagecoachService.completeJourney(ticketId);

      res.json({
        success,
        message: success ? 'Journey completed successfully' : 'Failed to complete journey'
      });
    } catch (error) {
      logger.error('Error completing journey:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete journey'
      });
    }
  }

  // ============================================
  // AMBUSH ROUTES
  // ============================================

  /**
   * GET /api/stagecoach/ambush/spots/:routeId
   * Get ambush spots for a route
   */
  static async getAmbushSpots(req: Request, res: Response): Promise<void> {
    try {
      const { routeId } = req.params;

      if (!routeId) {
        res.status(400).json({
          success: false,
          error: 'Route ID is required'
        });
        return;
      }

      const spots = StagecoachAmbushService.getAmbushSpotsForRoute(routeId);

      res.json({
        success: true,
        data: spots
      });
    } catch (error) {
      logger.error('Error getting ambush spots:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ambush spots'
      });
    }
  }

  /**
   * GET /api/stagecoach/ambush/spots/:routeId/:spotId
   * Get a specific ambush spot
   */
  static async getAmbushSpot(req: Request, res: Response): Promise<void> {
    try {
      const { spotId } = req.params;

      if (!spotId) {
        res.status(400).json({
          success: false,
          error: 'Spot ID is required'
        });
        return;
      }

      const spot = StagecoachAmbushService.getAmbushSpot(spotId);

      if (!spot) {
        res.status(404).json({
          success: false,
          error: 'Ambush spot not found'
        });
        return;
      }

      res.json({
        success: true,
        data: spot
      });
    } catch (error) {
      logger.error('Error getting ambush spot:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ambush spot'
      });
    }
  }

  /**
   * GET /api/stagecoach/ambush/plan
   * Get active ambush plan for character
   */
  static async getActivePlan(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      const plan = StagecoachAmbushService.getActivePlan(characterId);

      res.json({
        success: true,
        data: plan || null
      });
    } catch (error) {
      logger.error('Error getting active plan:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get active plan'
      });
    }
  }

  /**
   * POST /api/stagecoach/ambush/setup
   * Setup an ambush
   * Body: { routeId, ambushSpotId, scheduledTime, gangMemberIds?, strategy? }
   */
  static async setupAmbush(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { routeId, ambushSpotId, scheduledTime, gangMemberIds, strategy } = req.body;

      if (!routeId || !ambushSpotId || !scheduledTime) {
        res.status(400).json({
          success: false,
          error: 'Route ID, ambush spot ID, and scheduled time are required'
        });
        return;
      }

      const result = await StagecoachAmbushService.setupAmbush(
        characterId,
        routeId,
        ambushSpotId,
        new Date(scheduledTime),
        gangMemberIds,
        strategy
      );

      res.json({
        success: result.success,
        data: result.success ? result : undefined,
        error: result.success ? undefined : result.message
      });
    } catch (error) {
      logger.error('Error setting up ambush:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to setup ambush'
      });
    }
  }

  /**
   * POST /api/stagecoach/ambush/execute
   * Execute an ambush
   * Body: { stagecoachId: string }
   */
  static async executeAmbush(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { stagecoachId } = req.body;

      if (!stagecoachId) {
        res.status(400).json({
          success: false,
          error: 'Stagecoach ID is required'
        });
        return;
      }

      const result = await StagecoachAmbushService.executeAmbush(characterId, stagecoachId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error executing ambush:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute ambush'
      });
    }
  }

  /**
   * POST /api/stagecoach/ambush/cancel
   * Cancel an active ambush plan
   */
  static async cancelAmbush(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      const success = StagecoachAmbushService.cancelPlan(characterId);

      res.json({
        success,
        message: success ? 'Ambush plan canceled' : 'No active ambush plan to cancel'
      });
    } catch (error) {
      logger.error('Error canceling ambush:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel ambush'
      });
    }
  }

  /**
   * POST /api/stagecoach/ambush/defend
   * Defend against an ambush as a passenger
   * Body: { stagecoachId: string }
   */
  static async defendStagecoach(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { stagecoachId } = req.body;

      if (!stagecoachId) {
        res.status(400).json({
          success: false,
          error: 'Stagecoach ID is required'
        });
        return;
      }

      const result = await StagecoachAmbushService.defendStagecoach(characterId, stagecoachId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error defending stagecoach:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to defend stagecoach'
      });
    }
  }

  /**
   * POST /api/stagecoach/ambush/loot/distribute
   * Calculate loot distribution for gang members
   * Body: { totalValue, loot, gangMemberIds }
   */
  static async calculateLootDistribution(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { totalValue, loot, gangMemberIds } = req.body;

      if (!totalValue || !loot || !Array.isArray(loot)) {
        res.status(400).json({
          success: false,
          error: 'Total value and loot array are required'
        });
        return;
      }

      const distribution = StagecoachAmbushService.calculateLootDistribution(
        totalValue,
        loot,
        characterId,
        gangMemberIds || []
      );

      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      logger.error('Error calculating loot distribution:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate loot distribution'
      });
    }
  }
}
