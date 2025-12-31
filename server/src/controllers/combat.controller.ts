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
import { CombatAction } from '@desperados/shared';

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

    // PRODUCTION FIX: Attach NPC data directly to encounter object for frontend
    // Frontend expects encounter.npc (not a separate npc field)
    const encounterWithNpc = populatedEncounter?.toObject() as unknown as Record<string, unknown> | undefined;
    if (encounterWithNpc) {
      encounterWithNpc.npc = {
        _id: npc._id,
        name: npc.name,
        level: npc.level,
        type: npc.type,
        maxHP: npc.maxHP,
        difficulty: npc.difficulty,
        description: npc.description,
        isBoss: npc.isBoss || false,
        lootTable: npc.lootTable
      };
    }

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: `Combat started with ${npc.name}`,
      data: {
        encounter: encounterWithNpc
      }
    });

    logger.info(`Combat started: ${character.name} vs ${npc.name}`);
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
      data: { npcs }
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
      kills: 0,
      totalDeaths: 0
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

// =============================================================================
// SPRINT 2: HOLD/DISCARD COMBAT SYSTEM ENDPOINTS
// =============================================================================

/**
 * POST /api/combat/:encounterId/start-turn
 * Start a new turn - draws cards and enters hold phase
 */
export const startTurn = asyncHandler(
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

    // Start turn
    const result = await CombatService.startPlayerTurn(
      encounterId,
      (character._id as any).toString()
    );

    if (!result.success) {
      throw new AppError(result.error || 'Failed to start turn', HttpStatus.BAD_REQUEST);
    }

    // PRODUCTION FIX: Attach NPC data to encounter for frontend
    let encounterWithNpc: Record<string, unknown> | undefined = result.encounter as unknown as Record<string, unknown> | undefined;
    if (result.encounter) {
      const npc = await NPC.findById((result.encounter as unknown as { npcId: string }).npcId);
      if (npc) {
        encounterWithNpc = 'toObject' in result.encounter && typeof (result.encounter as { toObject?: () => unknown }).toObject === 'function'
          ? (result.encounter as { toObject: () => Record<string, unknown> }).toObject()
          : { ...result.encounter } as Record<string, unknown>;
        encounterWithNpc.npc = {
          _id: npc._id,
          name: npc.name,
          level: npc.level,
          type: npc.type,
          maxHP: npc.maxHP,
          difficulty: npc.difficulty,
          description: npc.description,
          isBoss: npc.isBoss || false,
          lootTable: npc.lootTable
        };
      }
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Turn started - select cards to hold',
      data: {
        roundState: result.roundState,
        encounter: encounterWithNpc
      }
    });

    logger.info(`Turn started for encounter ${encounterId}`);
  }
);

/**
 * POST /api/combat/:encounterId/action
 * Process a player action during combat (hold, confirm_hold, reroll, peek, flee)
 */
export const processAction = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { encounterId } = req.params;
    const action = req.body as CombatAction;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    if (!encounterId) {
      throw new AppError('Encounter ID is required', HttpStatus.BAD_REQUEST);
    }

    if (!action || !action.type) {
      throw new AppError('Action type is required', HttpStatus.BAD_REQUEST);
    }

    // Validate action type
    const validActions = ['hold', 'confirm_hold', 'reroll', 'peek', 'flee'];
    if (!validActions.includes(action.type)) {
      throw new AppError(`Invalid action type: ${action.type}`, HttpStatus.BAD_REQUEST);
    }

    // Get character
    const characters = await Character.findByUserId(userId);
    if (!characters || characters.length === 0) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    const character = characters[0];

    // Process action
    const result = await CombatService.processPlayerAction(
      encounterId,
      (character._id as any).toString(),
      action
    );

    if (!result.success) {
      throw new AppError(result.error || 'Action failed', HttpStatus.BAD_REQUEST);
    }

    // PRODUCTION FIX: Attach NPC data to encounter for frontend
    let encounterWithNpc: Record<string, unknown> | undefined = result.encounter as unknown as Record<string, unknown> | undefined;
    if (result.encounter && (result.encounter as unknown as { npcId?: string }).npcId) {
      const npc = await NPC.findById((result.encounter as unknown as { npcId: string }).npcId);
      if (npc) {
        encounterWithNpc = 'toObject' in result.encounter && typeof (result.encounter as { toObject?: () => unknown }).toObject === 'function'
          ? (result.encounter as { toObject: () => Record<string, unknown> }).toObject()
          : { ...result.encounter } as Record<string, unknown>;
        encounterWithNpc.npc = {
          _id: npc._id,
          name: npc.name,
          level: npc.level,
          type: npc.type,
          maxHP: npc.maxHP,
          difficulty: npc.difficulty,
          description: npc.description,
          isBoss: npc.isBoss || false,
          lootTable: npc.lootTable
        };
      }
    }

    // Build response message
    let message = 'Action processed';
    if (result.combatEnded) {
      if (result.lootAwarded) {
        message = `Victory! You earned $${result.lootAwarded.gold} and ${result.lootAwarded.xp} XP`;
      } else if (result.deathPenalty) {
        message = `Defeat! You lost $${result.deathPenalty.goldLost}`;
      } else if (action.type === 'flee') {
        message = 'Successfully fled from combat';
      }
    } else if (action.type === 'hold') {
      message = 'Cards selected - confirm to continue';
    } else if (action.type === 'confirm_hold') {
      message = 'Round complete - ready for next turn';
    } else if (action.type === 'reroll') {
      message = 'Card rerolled';
    } else if (action.type === 'peek') {
      message = 'Peeked at next card';
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message,
      data: {
        roundState: result.roundState,
        encounter: encounterWithNpc,
        combatEnded: result.combatEnded,
        lootAwarded: result.lootAwarded,
        deathPenalty: result.deathPenalty
      }
    });

    logger.info(`Action ${action.type} processed for encounter ${encounterId}`);
  }
);

/**
 * GET /api/combat/:encounterId/state
 * Get current round state for an encounter
 */
export const getRoundState = asyncHandler(
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

    // Get state
    const result = await CombatService.getRoundState(
      encounterId,
      (character._id as any).toString()
    );

    if (!result.success) {
      throw new AppError(result.error || 'Failed to get state', HttpStatus.BAD_REQUEST);
    }

    // PRODUCTION FIX: Attach NPC data to encounter for frontend
    let encounterWithNpc: Record<string, unknown> | undefined = result.encounter as unknown as Record<string, unknown> | undefined;
    if (result.encounter && (result.encounter as unknown as { npcId?: string }).npcId) {
      const npc = await NPC.findById((result.encounter as unknown as { npcId: string }).npcId);
      if (npc) {
        encounterWithNpc = 'toObject' in result.encounter && typeof (result.encounter as { toObject?: () => unknown }).toObject === 'function'
          ? (result.encounter as { toObject: () => Record<string, unknown> }).toObject()
          : { ...result.encounter } as Record<string, unknown>;
        encounterWithNpc.npc = {
          _id: npc._id,
          name: npc.name,
          level: npc.level,
          type: npc.type,
          maxHP: npc.maxHP,
          difficulty: npc.difficulty,
          description: npc.description,
          isBoss: npc.isBoss || false,
          lootTable: npc.lootTable
        };
      }
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.roundState ? 'Round state retrieved' : 'No active round',
      data: {
        roundState: result.roundState,
        encounter: encounterWithNpc
      }
    });
  }
);

// =============================================================================
// END SPRINT 2: HOLD/DISCARD COMBAT SYSTEM ENDPOINTS
// =============================================================================

export default {
  startCombat,
  getActiveCombat,
  listNPCs,
  getCombatHistory,
  getCombatStats,
  fleeCombat,
  // Sprint 2: Hold/Discard endpoints
  startTurn,
  processAction,
  getRoundState
};
