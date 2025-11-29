/**
 * World Boss Controller
 *
 * Handles HTTP requests for world boss encounters and boss fight systems
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { AuthRequest } from '../middleware/requireAuth';
import { Character } from '../models/Character.model';
import { WorldBossService } from '../services/worldBoss.service';
import { BossEncounterService } from '../services/bossEncounter.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError, HttpStatus } from '../types';
import { WorldBossType, BossAttackRequest } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * GET /api/world-bosses
 * Get all world bosses and their status
 */
export const getAllWorldBosses = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const bosses = WorldBossService.getAllScheduledSpawns();

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'World bosses retrieved successfully',
      data: {
        bosses
      }
    });
  }
);

/**
 * GET /api/world-bosses/:bossId/status
 * Get status of a specific world boss
 */
export const getWorldBossStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { bossId } = req.params;

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    const status = WorldBossService.getBossStatus(bossId as WorldBossType);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Boss status retrieved',
      data: status
    });
  }
);

/**
 * GET /api/world-bosses/:bossId/leaderboard
 * Get leaderboard for a world boss session
 */
export const getWorldBossLeaderboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { bossId } = req.params;

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    const leaderboard = WorldBossService.getSessionLeaderboard(bossId as WorldBossType);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Leaderboard retrieved',
      data: {
        bossId,
        leaderboard
      }
    });
  }
);

/**
 * POST /api/world-bosses/:bossId/join
 * Join a world boss fight
 */
export const joinWorldBoss = asyncHandler(
  async (req: CharacterRequest, res: Response) => {
    const { bossId } = req.params;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      throw new AppError('Character required', HttpStatus.BAD_REQUEST);
    }

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', HttpStatus.NOT_FOUND);
    }

    const result = await WorldBossService.joinWorldBoss(
      characterId,
      character.name,
      { bossId: bossId as WorldBossType }
    );

    if (!result.success) {
      throw new AppError(result.message || 'Failed to join boss fight', HttpStatus.BAD_REQUEST);
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.message,
      data: {
        bossSession: result.bossSession
      }
    });

    logger.info(`${character.name} joined world boss fight: ${bossId}`);
  }
);

/**
 * POST /api/world-bosses/:bossId/attack
 * Attack a world boss
 */
export const attackWorldBoss = asyncHandler(
  async (req: CharacterRequest, res: Response) => {
    const { bossId } = req.params;
    const { damage } = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      throw new AppError('Character required', HttpStatus.BAD_REQUEST);
    }

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    if (typeof damage !== 'number' || damage < 0) {
      throw new AppError('Valid damage value is required', HttpStatus.BAD_REQUEST);
    }

    const result = await WorldBossService.attackWorldBoss(
      characterId,
      bossId as WorldBossType,
      damage
    );

    if (!result.success) {
      throw new AppError(result.message, HttpStatus.BAD_REQUEST);
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.message,
      data: {
        damageDealt: result.damageDealt,
        bossHealth: result.bossHealth,
        phaseChange: result.phaseChange,
        defeated: result.defeated
      }
    });

    if (result.defeated) {
      logger.info(`World boss ${bossId} defeated!`);
    }
  }
);

/**
 * GET /api/world-bosses/:bossId/participant
 * Get participant data for current character
 */
export const getParticipantData = asyncHandler(
  async (req: CharacterRequest, res: Response) => {
    const { bossId } = req.params;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      throw new AppError('Character required', HttpStatus.BAD_REQUEST);
    }

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    const participantData = WorldBossService.getParticipantData(
      bossId as WorldBossType,
      characterId
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: participantData ? 'Participant data retrieved' : 'Not participating',
      data: {
        participant: participantData || null
      }
    });
  }
);

/**
 * POST /api/world-bosses/:bossId/spawn
 * Spawn a world boss (admin only)
 */
export const spawnWorldBoss = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { bossId } = req.params;

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    // TODO: Add admin authorization check

    const session = await WorldBossService.spawnWorldBoss(bossId as WorldBossType);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: `World boss ${session.boss.name} has been spawned!`,
      data: {
        bossId: session.bossId,
        bossName: session.boss.name,
        maxHealth: session.maxHealth,
        endsAt: session.endsAt
      }
    });

    logger.info(`Admin spawned world boss: ${bossId}`);
  }
);

/**
 * POST /api/world-bosses/:bossId/end
 * End a world boss session (admin only)
 */
export const endWorldBossSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { bossId } = req.params;
    const { victory } = req.body;

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    // TODO: Add admin authorization check

    await WorldBossService.endBossSession(bossId as WorldBossType, victory === true);

    res.status(HttpStatus.OK).json({
      success: true,
      message: `World boss session ended (${victory ? 'victory' : 'failure'})`
    });

    logger.info(`Admin ended world boss session: ${bossId}`);
  }
);

// ============================================
// Boss Encounter Routes (Individual Bosses)
// ============================================

/**
 * GET /api/world-bosses/encounters/:bossId/availability
 * Check if a boss is available for a character
 */
export const checkBossAvailability = asyncHandler(
  async (req: CharacterRequest, res: Response) => {
    const { bossId } = req.params;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      throw new AppError('Character required', HttpStatus.BAD_REQUEST);
    }

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    const availability = await BossEncounterService.checkAvailability(characterId, bossId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: availability.available ? 'Boss is available' : availability.reason,
      data: availability
    });
  }
);

/**
 * POST /api/world-bosses/encounters/:bossId/initiate
 * Initiate a boss encounter
 */
export const initiateBossEncounter = asyncHandler(
  async (req: CharacterRequest, res: Response) => {
    const { bossId } = req.params;
    const { location, partyMemberIds } = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      throw new AppError('Character required', HttpStatus.BAD_REQUEST);
    }

    if (!bossId) {
      throw new AppError('Boss ID is required', HttpStatus.BAD_REQUEST);
    }

    if (!location) {
      throw new AppError('Location is required', HttpStatus.BAD_REQUEST);
    }

    const result = await BossEncounterService.initiateBossEncounter(
      characterId,
      bossId,
      location,
      partyMemberIds
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: `Boss encounter started: ${result.boss.name}`,
      data: {
        session: result.session,
        boss: {
          id: result.boss.id,
          name: result.boss.name,
          description: result.boss.description,
          tier: result.boss.tier,
          phases: result.boss.phases.map(p => ({
            phaseNumber: p.phaseNumber,
            name: p.name,
            healthThreshold: p.healthThreshold
          }))
        }
      }
    });

    logger.info(`Boss encounter initiated: ${bossId} by character ${characterId}`);
  }
);

/**
 * POST /api/world-bosses/encounters/:sessionId/attack
 * Attack a boss in an encounter
 */
export const processBossAttack = asyncHandler(
  async (req: CharacterRequest, res: Response) => {
    const { sessionId } = req.params;
    const { action, targetId, itemId } = req.body;
    const characterId = req.character?._id?.toString();

    if (!characterId) {
      throw new AppError('Character required', HttpStatus.BAD_REQUEST);
    }

    if (!sessionId) {
      throw new AppError('Session ID is required', HttpStatus.BAD_REQUEST);
    }

    if (!action || !['attack', 'defend', 'item', 'flee'].includes(action)) {
      throw new AppError('Valid action is required (attack, defend, item, flee)', HttpStatus.BAD_REQUEST);
    }

    const attackRequest: BossAttackRequest = {
      sessionId,
      action,
      targetId,
      itemId
    };

    const result = await BossEncounterService.processBossAttack(
      sessionId,
      characterId,
      attackRequest
    );

    if (!result.success) {
      throw new AppError(result.message || 'Attack failed', HttpStatus.BAD_REQUEST);
    }

    res.status(HttpStatus.OK).json({
      success: true,
      message: result.combatEnded
        ? result.result?.outcome === 'victory'
          ? 'Victory! The boss has been defeated!'
          : 'Defeat! Your party has fallen...'
        : 'Combat round completed',
      data: {
        session: result.session,
        round: result.round,
        combatEnded: result.combatEnded,
        result: result.result
      }
    });

    if (result.combatEnded) {
      logger.info(`Boss encounter ended: ${sessionId} - ${result.result?.outcome}`);
    }
  }
);

export default {
  // World Boss endpoints
  getAllWorldBosses,
  getWorldBossStatus,
  getWorldBossLeaderboard,
  joinWorldBoss,
  attackWorldBoss,
  getParticipantData,
  spawnWorldBoss,
  endWorldBossSession,
  // Boss Encounter endpoints
  checkBossAvailability,
  initiateBossEncounter,
  processBossAttack
};
