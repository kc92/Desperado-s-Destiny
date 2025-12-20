/**
 * Permanent Unlock Controller
 * HTTP handlers for permanent unlock routes
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as unlockService from '../services/permanentUnlock.service';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get all account unlocks for the authenticated user
 * GET /api/unlocks
 */
export const getAccountUnlocks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const accountUnlocks = await unlockService.getAccountUnlocks(userId);

  res.json({
    success: true,
    data: accountUnlocks
  });
});

/**
 * Get available unlocks (both earned and not earned)
 * GET /api/unlocks/available
 */
export const getAvailableUnlocks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const availableUnlocks = await unlockService.getAvailableUnlocks(userId);

  res.json({
    success: true,
    data: availableUnlocks
  });
});

/**
 * Get progress toward a specific unlock
 * GET /api/unlocks/:id/progress
 */
export const getUnlockProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  const progress = await unlockService.getUnlockProgress(userId, id);

  res.json({
    success: true,
    data: progress
  });
});

/**
 * Claim an earned unlock
 * POST /api/unlocks/:id/claim
 */
export const claimUnlock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  const result = await unlockService.claimUnlock(userId, id);

  res.json({
    success: true,
    data: result
  });
});

/**
 * Check eligibility for an unlock
 * GET /api/unlocks/:id/eligibility
 */
export const checkEligibility = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  const result = await unlockService.checkUnlockEligibility(userId, id);

  res.json({
    success: true,
    data: result
  });
});

/**
 * Get max character slots
 * GET /api/unlocks/character-slots
 */
export const getCharacterSlots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const maxSlots = await unlockService.getMaxCharacterSlots(userId);
  const canCreate = await unlockService.canCreateCharacter(userId);

  res.json({
    success: true,
    data: {
      maxSlots,
      canCreate
    }
  });
});

/**
 * Sync legacy unlocks
 * POST /api/unlocks/sync-legacy
 */
export const syncLegacyUnlocks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  await unlockService.syncLegacyUnlocks(userId);

  const accountUnlocks = await unlockService.getAccountUnlocks(userId);

  res.json({
    success: true,
    message: 'Legacy unlocks synced',
    data: accountUnlocks
  });
});
