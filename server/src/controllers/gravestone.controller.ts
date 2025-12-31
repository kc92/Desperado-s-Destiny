/**
 * Gravestone Controller
 * HTTP endpoints for gravestone and inheritance operations
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import GravestoneService from '../services/gravestone.service';
import { InheritanceService } from '../services/inheritance.service';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

/**
 * Get gravestones at a specific location
 * GET /api/gravestones/location/:locationId
 */
export const getGravestonesAtLocation = async (
  req: CharacterRequest,
  res: Response
): Promise<void> => {
  try {
    const { locationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const gravestones = await GravestoneService.getGravestonesAtLocation(
      locationId,
      limit
    );

    res.status(200).json({
      success: true,
      data: {
        gravestones,
        total: gravestones.length
      }
    });
  } catch (error) {
    logger.error('[GravestoneController] Error fetching location gravestones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gravestones',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Get user's gravestones (their dead characters)
 * GET /api/gravestones/mine
 */
export const getUserGravestones = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();

    const gravestones = await GravestoneService.getUserGravestones(userId);

    res.status(200).json({
      success: true,
      data: {
        gravestones,
        total: gravestones.length
      }
    });
  } catch (error) {
    logger.error('[GravestoneController] Error fetching user gravestones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your gravestones',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Get unclaimed gravestones for the user
 * GET /api/gravestones/unclaimed
 */
export const getUnclaimedGravestones = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();

    const gravestones = await GravestoneService.getUnclaimedGravestones(userId);

    res.status(200).json({
      success: true,
      data: {
        gravestones,
        total: gravestones.length
      }
    });
  } catch (error) {
    logger.error('[GravestoneController] Error fetching unclaimed gravestones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unclaimed gravestones',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Get a specific gravestone by ID
 * GET /api/gravestones/:id
 */
export const getGravestone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const gravestone = await GravestoneService.getGravestone(id);

    if (!gravestone) {
      res.status(404).json({
        success: false,
        error: 'Gravestone not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { gravestone }
    });
  } catch (error) {
    logger.error('[GravestoneController] Error fetching gravestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gravestone',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Get inheritance preview for a gravestone
 * GET /api/gravestones/:id/preview
 */
export const getInheritancePreview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const preview = await GravestoneService.getInheritancePreview(id);

    if (!preview) {
      res.status(404).json({
        success: false,
        error: 'Gravestone not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { preview }
    });
  } catch (error) {
    logger.error('[GravestoneController] Error fetching inheritance preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inheritance preview',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Claim inheritance from a gravestone
 * POST /api/gravestones/:id/claim
 */
export const claimInheritance = async (
  req: CharacterRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const character = req.character!;

    // Check if can claim
    const canClaim = await GravestoneService.canClaimGravestone(
      character._id.toString(),
      id
    );

    if (!canClaim.canClaim) {
      res.status(400).json({
        success: false,
        error: canClaim.reason || 'Cannot claim this inheritance'
      });
      return;
    }

    // Perform the inheritance claim
    const result = await InheritanceService.claimInheritance(
      character._id.toString(),
      id
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('[GravestoneController] Error claiming inheritance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim inheritance',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Check if current character can claim a gravestone
 * GET /api/gravestones/:id/can-claim
 */
export const canClaimGravestone = async (
  req: CharacterRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const character = req.character!;

    const result = await GravestoneService.canClaimGravestone(
      character._id.toString(),
      id
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('[GravestoneController] Error checking claim eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check claim eligibility',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Get graveyard statistics for the user
 * GET /api/gravestones/stats
 */
export const getGraveyardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();

    const stats = await GravestoneService.getGraveyardStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('[GravestoneController] Error fetching graveyard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch graveyard stats',
      message: sanitizeErrorMessage(error)
    });
  }
};

/**
 * Get recent deaths for world news
 * GET /api/gravestones/recent
 */
export const getRecentDeaths = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const gravestones = await GravestoneService.getRecentDeaths(limit);

    res.status(200).json({
      success: true,
      data: {
        gravestones,
        total: gravestones.length
      }
    });
  } catch (error) {
    logger.error('[GravestoneController] Error fetching recent deaths:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent deaths',
      message: sanitizeErrorMessage(error)
    });
  }
};
