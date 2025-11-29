/**
 * Combat Controller
 *
 * Handles HTTP requests for turn-based combat system
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Character } from '../models/Character.model';
import { NPC } from '../models/NPC.model';
import { CombatEncounter } from '../models/CombatEncounter.model';
import { CombatService } from '../services/combat.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * POST /api/combat/start
 * Start combat with an NPC
 */
export const startCombat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { npcId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    if (!npcId) {
      throw new AppError('NPC ID is required', HttpStatus.BAD_REQUEST);
    }

    // Get user's active character (assuming first active character)
    const characters = await Character.findByUserId(userId);
    if (!characters || characters.length === 0) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    const character = characters[0];

    // Check if character is jailed
    if (character.isJailed && character.jailedUntil && new Date() < character.jailedUntil) {
      throw new AppError('Character is jailed and cannot start combat', HttpStatus.FORBIDDEN);
    }

    // Fetch NPC to include in response
    const npc = await NPC.findById(npcId);
    if (!npc) {
      throw new AppError('NPC not found', HttpStatus.NOT_FOUND);
    }

    // Initiate combat
    const encounter = await CombatService.initiateCombat(character, npcId);

    // Populate NPC data for response
    const populatedEncounter = await CombatEncounter.findById(encounter._id).populate('npcId');

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: `Combat started with ${npc.name}`,
      data: {
        encounter: populatedEncounter,
        npc: {
          name: npc.name,
          level: npc.level,
          type: npc.type,
          maxHP: npc.maxHP,
          difficulty: npc.difficulty,
          description: npc.description
        }
      }
    });

    logger.info(`Combat started: ${character.name} vs ${npc.name}`);
  }
);

/**
 * POST /api/combat/turn/:encounterId
 * Play a combat turn
 */
export const playTurn = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { encounterId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    if (!encounterId) {
      throw new AppError('Encounter ID is required', HttpStatus.BAD_REQUEST);
    }

    // Get character
    const characters = await Character.findByUserId(userId);
    if (!characters || characters.length === 0) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    const character = characters[0];

    // Play turn
    const result = await CombatService.playPlayerTurn(
      encounterId,
      (character._id as any).toString()
    );

    // Build response message
    let message = 'Turn completed';
    if (result.combatEnded) {
      if (result.lootAwarded) {
        message = `Victory! You earned ${result.lootAwarded.gold} gold and ${result.lootAwarded.xp} XP`;
      } else if (result.deathPenalty) {
        message = `Defeat! You lost ${result.deathPenalty.goldLost} gold and were respawned`;
      }
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message,
      data: {
        encounter: result.encounter,
        playerRound: result.playerRound,
        npcRound: result.npcRound,
        combatEnded: result.combatEnded,
        lootAwarded: result.lootAwarded,
        deathPenalty: result.deathPenalty
      }
    });

    logger.info(`Turn played in encounter ${encounterId}`);
  }
);

/**
 * GET /api/combat/active
 * Get character's active combat encounter
 */
export const getActiveCombat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Get character
    const characters = await Character.findByUserId(userId);
    if (!characters || characters.length === 0) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    const character = characters[0];

    // Get active encounter
    const encounter = await CombatEncounter.findActiveByCharacter(
      (character._id as any).toString()
    );

    if (!encounter) {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'No active combat',
        data: {
          encounter: null
        }
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Active combat found',
      data: {
        encounter
      }
    });
  }
);

/**
 * GET /api/combat/npcs
 * List all active NPCs
 */
export const listNPCs = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const npcs = await CombatService.getActiveNPCs();

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'NPCs retrieved successfully',
      data: npcs
    });
  }
);

/**
 * GET /api/combat/history
 * Get combat history for character
 */
export const getCombatHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const page = parseInt((req.query as any)['page'] as string) || 1;
    const limit = parseInt((req.query as any)['limit'] as string) || 50;

    if (!userId) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Get character
    const characters = await Character.findByUserId(userId);
    if (!characters || characters.length === 0) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    const character = characters[0];

    // Get history
    const history = await CombatService.getCombatHistory(
      (character._id as any).toString(),
      page,
      limit
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Combat history retrieved',
      data: history
    });
  }
);

/**
 * GET /api/combat/stats
 * Get combat stats for character
 */
export const getCombatStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Get character
    const characters = await Character.findByUserId(userId);
    if (!characters || characters.length === 0) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    const character = characters[0];

    // Get combat stats
    const stats = character.combatStats || {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      kills: 0
    };

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Combat stats retrieved',
      data: {
        stats
      }
    });
  }
);

/**
 * POST /api/combat/flee/:encounterId
 * Flee from combat
 */
export const fleeCombat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { encounterId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    if (!encounterId) {
      throw new AppError('Encounter ID is required', HttpStatus.BAD_REQUEST);
    }

    // Get character
    const characters = await Character.findByUserId(userId);
    if (!characters || characters.length === 0) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    const character = characters[0];

    // Flee
    const encounter = await CombatService.fleeCombat(
      encounterId,
      (character._id as any).toString()
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Successfully fled from combat',
      data: {
        encounter
      }
    });

    logger.info(`Character ${character.name} fled from encounter ${encounterId}`);
  }
);

export default {
  startCombat,
  playTurn,
  getActiveCombat,
  listNPCs,
  getCombatHistory,
  getCombatStats,
  fleeCombat
};
