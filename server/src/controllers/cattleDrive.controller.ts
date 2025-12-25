/**
 * Cattle Drive Controller
 * Handles cattle drive API requests
 *
 * Sprint 7: Mid-Game Content - Cattle Drives (L30 unlock)
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CattleDriveService } from '../services/cattleDrive.service';
import { getDriveRoute, DriveRoute } from '../data/activities/cattleDrives';
import logger from '../utils/logger';

/**
 * GET /api/cattle-drives/routes/:characterId
 * Get available drive routes for a character
 */
export async function getAvailableRoutes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const { routes, activeDrive, canStartDrive } = await CattleDriveService.getAvailableRoutesForCharacter(characterId);

    res.status(200).json({
      success: true,
      data: {
        routes: routes.map(r => ({
          routeId: r.routeId,
          name: r.name,
          description: r.description,
          levelRequired: r.levelRequired,
          phases: r.phases,
          energyCostPerPhase: r.energyCostPerPhase,
          baseCattleCapacity: r.baseCattleCapacity,
          baseReward: r.baseReward,
          baseXp: r.baseXp,
          eventChance: r.eventChance,
          participantBonusPercent: r.participantBonusPercent,
          flavorText: r.flavorText
        })),
        activeDrive: activeDrive ? {
          driveId: activeDrive.driveId,
          routeId: activeDrive.routeId,
          status: activeDrive.status,
          currentPhase: activeDrive.currentPhase,
          totalPhases: activeDrive.totalPhases,
          currentCattle: activeDrive.currentCattle,
          startingCattle: activeDrive.startingCattle,
          hasPendingEvent: !!activeDrive.pendingEvent
        } : null,
        canStartDrive
      }
    });
  } catch (error) {
    logger.error('Error getting cattle drive routes:', error);
    res.status(500).json({ success: false, error: 'Failed to get routes' });
  }
}

/**
 * POST /api/cattle-drives/start
 * Start a new cattle drive
 * Body: { characterId: string, routeId: string }
 */
export async function startDrive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, routeId } = req.body;
    if (!characterId || !routeId) {
      res.status(400).json({ success: false, error: 'Character ID and route ID required' });
      return;
    }

    const result = await CattleDriveService.startDrive(characterId, routeId as DriveRoute);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    const route = getDriveRoute(routeId as DriveRoute);

    res.status(200).json({
      success: true,
      data: {
        driveId: result.drive?.driveId,
        routeName: route?.name,
        status: result.drive?.status,
        currentPhase: result.drive?.currentPhase,
        totalPhases: result.drive?.totalPhases,
        currentCattle: result.drive?.currentCattle,
        message: `Your cattle drive on the ${route?.name} has begun! ${result.drive?.currentCattle} head of cattle await delivery.`
      }
    });
  } catch (error) {
    logger.error('Error starting cattle drive:', error);
    res.status(500).json({ success: false, error: 'Failed to start cattle drive' });
  }
}

/**
 * POST /api/cattle-drives/progress
 * Advance to the next phase
 * Body: { characterId: string }
 */
export async function progressDrive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const result = await CattleDriveService.progressDrive(characterId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        currentPhase: result.drive?.currentPhase,
        totalPhases: result.drive?.totalPhases,
        currentCattle: result.drive?.currentCattle,
        status: result.drive?.status,
        eventTriggered: result.eventTriggered ? {
          eventId: result.eventTriggered.eventId,
          name: result.eventTriggered.name,
          description: result.eventTriggered.description,
          choices: result.eventTriggered.choices.map(c => ({
            choiceId: c.choiceId,
            label: c.label,
            description: c.description,
            hasSkillCheck: !!c.skillCheck
          })),
          flavorText: result.eventTriggered.flavorText
        } : null,
        message: result.eventTriggered
          ? `Phase ${result.phaseCompleted} complete, but trouble awaits: ${result.eventTriggered.name}!`
          : `Phase ${result.phaseCompleted} of ${result.drive?.totalPhases} complete. The herd moves on.`
      }
    });
  } catch (error) {
    logger.error('Error progressing cattle drive:', error);
    res.status(500).json({ success: false, error: 'Failed to progress cattle drive' });
  }
}

/**
 * POST /api/cattle-drives/event
 * Handle a pending event choice
 * Body: { characterId: string, choiceId: string }
 */
export async function handleEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, choiceId } = req.body;
    if (!characterId || !choiceId) {
      res.status(400).json({ success: false, error: 'Character ID and choice ID required' });
      return;
    }

    const result = await CattleDriveService.handleEvent(characterId, choiceId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        outcome: result.outcome,
        cattleLost: result.cattleLost,
        bonusGold: result.bonusGold,
        message: result.message,
        driveStatus: result.drive?.status,
        currentCattle: result.drive?.currentCattle,
        currentPhase: result.drive?.currentPhase
      }
    });
  } catch (error) {
    logger.error('Error handling cattle drive event:', error);
    res.status(500).json({ success: false, error: 'Failed to handle event' });
  }
}

/**
 * POST /api/cattle-drives/complete
 * Complete the drive and collect rewards
 * Body: { characterId: string }
 */
export async function completeDrive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const result = await CattleDriveService.completeDrive(characterId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        gold: result.gold,
        xp: result.xp,
        survivalRate: Math.round(result.survivalRate * 100),
        cattleDelivered: result.cattleDelivered,
        cattleLost: result.cattleLost,
        message: `Cattle drive complete! Delivered ${result.cattleDelivered} head and earned $${result.gold.toLocaleString()}.`
      }
    });
  } catch (error) {
    logger.error('Error completing cattle drive:', error);
    res.status(500).json({ success: false, error: 'Failed to complete cattle drive' });
  }
}

/**
 * POST /api/cattle-drives/abandon
 * Abandon the current drive
 * Body: { characterId: string }
 */
export async function abandonDrive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const result = await CattleDriveService.abandonDrive(characterId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        partialReward: result.partialReward,
        message: result.partialReward && result.partialReward > 0
          ? `Drive abandoned. You salvaged $${result.partialReward.toLocaleString()} from the venture.`
          : 'Drive abandoned. No reward collected.'
      }
    });
  } catch (error) {
    logger.error('Error abandoning cattle drive:', error);
    res.status(500).json({ success: false, error: 'Failed to abandon cattle drive' });
  }
}

/**
 * GET /api/cattle-drives/status/:characterId
 * Get the status of the active drive
 */
export async function getActiveDriveStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const { drive, route, pendingEvent } = await CattleDriveService.getActiveDriveStatus(characterId);

    if (!drive) {
      res.status(200).json({
        success: true,
        data: { activeDrive: null }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        activeDrive: {
          driveId: drive.driveId,
          routeId: drive.routeId,
          routeName: route?.name,
          status: drive.status,
          currentPhase: drive.currentPhase,
          totalPhases: drive.totalPhases,
          currentCattle: drive.currentCattle,
          startingCattle: drive.startingCattle,
          survivalRate: Math.round((drive.currentCattle / drive.startingCattle) * 100),
          events: drive.events,
          startedAt: drive.startedAt,
          pendingEvent: pendingEvent ? {
            eventId: pendingEvent.eventId,
            name: pendingEvent.name,
            description: pendingEvent.description,
            choices: pendingEvent.choices.map(c => ({
              choiceId: c.choiceId,
              label: c.label,
              description: c.description,
              hasSkillCheck: !!c.skillCheck
            })),
            flavorText: pendingEvent.flavorText
          } : null
        }
      }
    });
  } catch (error) {
    logger.error('Error getting cattle drive status:', error);
    res.status(500).json({ success: false, error: 'Failed to get drive status' });
  }
}

/**
 * GET /api/cattle-drives/stats/:characterId
 * Get cattle drive statistics for a character
 */
export async function getStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const stats = await CattleDriveService.getStatistics(characterId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting cattle drive statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
}
