/**
 * Bounty Hunter Controller
 *
 * Handles HTTP requests for bounty hunter system
 */

import { Request, Response } from 'express';
import { BountyHunterService } from '../services/bountyHunter.service';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  HireHunterRequest,
  PayOffHunterRequest,
  GetAvailableHuntersResponse,
  GetActiveEncountersResponse,
  HireHunterResponse,
  PayOffHunterResponse,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Check if a bounty hunter should spawn
 * POST /api/bounty-hunters/check-spawn
 */
export const checkHunterSpawn = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.character?._id.toString();
  const { location } = req.body;

  if (!characterId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const result = await BountyHunterService.checkHunterSpawn(characterId, location);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * Get available hunters for hire
 * GET /api/bounty-hunters/available
 */
export const getAvailableHunters = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.character?._id.toString();

  if (!characterId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const hunters = await BountyHunterService.getAvailableHunters(characterId);

  const response: GetAvailableHuntersResponse = {
    success: true,
    hunters,
  };

  res.json(response);
});

/**
 * Hire a bounty hunter
 * POST /api/bounty-hunters/hire
 */
export const hireHunter = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.character?._id.toString();
  const { hunterId, targetId, payment } = req.body as HireHunterRequest;

  if (!characterId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  if (!hunterId || !targetId) {
    res.status(400).json({
      success: false,
      message: 'Hunter ID and target ID are required',
    });
    return;
  }

  const result = await BountyHunterService.hireHunter(hunterId, targetId, characterId);

  const response: HireHunterResponse = {
    success: result.success,
    message: result.message,
    cost: result.cost,
  };

  res.json(response);
});

/**
 * Get active hunter encounters for current character
 * GET /api/bounty-hunters/encounters
 */
export const getActiveEncounters = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.character?._id.toString();

  if (!characterId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const encounters = await BountyHunterService.getActiveEncounters(characterId);

  const response: GetActiveEncountersResponse = {
    success: true,
    encounters,
  };

  res.json(response);
});

/**
 * Pay off a bounty hunter
 * POST /api/bounty-hunters/payoff
 */
export const payOffHunter = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.character?._id.toString();
  const { encounterId, amount } = req.body as PayOffHunterRequest;

  if (!characterId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  if (!encounterId) {
    res.status(400).json({
      success: false,
      message: 'Encounter ID is required',
    });
    return;
  }

  const result = await BountyHunterService.payOffHunter(encounterId, characterId);

  const response: PayOffHunterResponse = {
    success: result.success,
    message: result.message,
    accepted: result.accepted,
  };

  res.json(response);
});

/**
 * Resolve a hunter encounter (combat result)
 * POST /api/bounty-hunters/resolve
 */
export const resolveEncounter = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.character?._id.toString();
  const { encounterId, result } = req.body;

  if (!characterId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  if (!encounterId || !result) {
    res.status(400).json({
      success: false,
      message: 'Encounter ID and result are required',
    });
    return;
  }

  if (!['escaped', 'captured', 'hunter_defeated'].includes(result)) {
    res.status(400).json({
      success: false,
      message: 'Invalid result. Must be: escaped, captured, or hunter_defeated',
    });
    return;
  }

  await BountyHunterService.resolveEncounter(encounterId, result);

  res.json({
    success: true,
    message: `Encounter resolved: ${result}`,
  });
});

/**
 * Get hunter details
 * GET /api/bounty-hunters/:hunterId
 */
export const getHunterDetails = asyncHandler(async (req: Request, res: Response) => {
  const { hunterId } = req.params;

  // Import here to avoid circular dependency
  const { getHunterById } = await import('../data/bountyHunters');
  const hunter = getHunterById(hunterId);

  if (!hunter) {
    res.status(404).json({
      success: false,
      message: 'Hunter not found',
    });
    return;
  }

  // Return public hunter info (not internal game mechanics)
  res.json({
    success: true,
    hunter: {
      id: hunter.id,
      name: hunter.name,
      title: hunter.title,
      level: hunter.level,
      specialty: hunter.specialty,
      personality: hunter.personality,
      backstory: hunter.backstory,
      faction: hunter.faction,
      territory: hunter.territory,
      isHireable: hunter.hireConfig?.hireableBy !== 'not_hireable',
    },
  });
});

/**
 * Get all hunters (public information)
 * GET /api/bounty-hunters
 */
export const getAllHunters = asyncHandler(async (req: Request, res: Response) => {
  // Import here to avoid circular dependency
  const { BOUNTY_HUNTERS } = await import('../data/bountyHunters');

  const hunters = BOUNTY_HUNTERS.map((hunter) => ({
    id: hunter.id,
    name: hunter.name,
    title: hunter.title,
    level: hunter.level,
    specialty: hunter.specialty,
    faction: hunter.faction,
    territory: hunter.territory,
    isHireable: hunter.hireConfig?.hireableBy !== 'not_hireable',
  }));

  res.json({
    success: true,
    hunters,
  });
});
