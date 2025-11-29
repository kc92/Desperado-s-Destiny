/**
 * Faction War Controller
 *
 * HTTP endpoints for faction war events and participation
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import { Response, NextFunction } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { FactionWarService } from '../services/factionWar.service';
import { TerritoryFactionId } from '@desperados/shared';
import logger from '../utils/logger';

export class FactionWarController {
  // ========================
  // WAR EVENT CREATION
  // ========================

  /**
   * POST /api/faction-wars
   * Create a new war event from template
   * Body: { templateId, attackingFaction, defendingFaction, targetTerritory, customStartTime? }
   */
  static async createWarEvent(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { templateId, attackingFaction, defendingFaction, targetTerritory, customStartTime } = req.body;

      if (!templateId || !attackingFaction || !defendingFaction || !targetTerritory) {
        res.status(400).json({
          success: false,
          error: 'templateId, attackingFaction, defendingFaction, and targetTerritory are required',
        });
        return;
      }

      const startTime = customStartTime ? new Date(customStartTime) : undefined;

      const warEvent = await FactionWarService.createWarEvent(
        templateId,
        attackingFaction as TerritoryFactionId,
        defendingFaction as TerritoryFactionId,
        targetTerritory,
        startTime
      );

      res.status(201).json({
        success: true,
        data: { warEvent },
        message: `War event "${warEvent.name}" created successfully!`,
      });
    } catch (error) {
      logger.error('Error creating war event:', error);
      const message = error instanceof Error ? error.message : 'Failed to create war event';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // WAR EVENT QUERIES
  // ========================

  /**
   * GET /api/faction-wars/active
   * Get all active war events
   */
  static async getActiveEvents(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const events = await FactionWarService.getActiveEvents();

      res.status(200).json({
        success: true,
        data: { events },
      });
    } catch (error) {
      logger.error('Error getting active war events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get active war events',
      });
    }
  }

  /**
   * GET /api/faction-wars/upcoming
   * Get upcoming war events
   */
  static async getUpcomingEvents(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const events = await FactionWarService.getUpcomingEvents();

      res.status(200).json({
        success: true,
        data: { events },
      });
    } catch (error) {
      logger.error('Error getting upcoming war events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get upcoming war events',
      });
    }
  }

  /**
   * GET /api/faction-wars/:warEventId
   * Get war event details with participants
   */
  static async getWarEventDetails(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { warEventId } = req.params;

      const details = await FactionWarService.getWarEventDetails(warEventId);

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      logger.error('Error getting war event details:', error);
      const message = error instanceof Error ? error.message : 'Failed to get war event details';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/faction-wars/:warEventId/statistics
   * Get war event statistics
   */
  static async getWarStatistics(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { warEventId } = req.params;

      const stats = await FactionWarService.getWarStatistics(warEventId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting war statistics:', error);
      const message = error instanceof Error ? error.message : 'Failed to get war statistics';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // WAR PARTICIPATION
  // ========================

  /**
   * POST /api/faction-wars/:warEventId/join
   * Join a war event
   * Body: { side }
   */
  static async joinWarEvent(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { warEventId } = req.params;
      const { side } = req.body;
      const characterId = req.character?._id?.toString();

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'Character ID is required',
        });
        return;
      }

      if (!side) {
        res.status(400).json({
          success: false,
          error: 'side (faction) is required',
        });
        return;
      }

      const participant = await FactionWarService.joinWarEvent(
        warEventId,
        characterId,
        side as TerritoryFactionId
      );

      res.status(201).json({
        success: true,
        data: { participant },
        message: 'Successfully joined the war event!',
      });
    } catch (error) {
      logger.error('Error joining war event:', error);
      const message = error instanceof Error ? error.message : 'Failed to join war event';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // WAR EVENT MANAGEMENT
  // ========================

  /**
   * POST /api/faction-wars/update-phases
   * Update war event phases (admin/cron job)
   */
  static async updateEventPhases(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const updated = await FactionWarService.updateEventPhases();

      res.status(200).json({
        success: true,
        data: { eventsUpdated: updated },
        message: `${updated} war event(s) phase updated`,
      });
    } catch (error) {
      logger.error('Error updating event phases:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update event phases',
      });
    }
  }

  /**
   * POST /api/faction-wars/:warEventId/resolve
   * Manually resolve a war event (admin use)
   */
  static async resolveWarEvent(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { warEventId } = req.params;

      // Get the event first
      const { event } = await FactionWarService.getWarEventDetails(warEventId);

      // Resolve it
      await FactionWarService.resolveWarEvent(event);

      res.status(200).json({
        success: true,
        message: 'War event resolved successfully',
      });
    } catch (error) {
      logger.error('Error resolving war event:', error);
      const message = error instanceof Error ? error.message : 'Failed to resolve war event';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
}
