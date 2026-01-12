/**
 * Boss Encounter Controller
 *
 * Handles HTTP requests for individual boss encounters (not world bosses)
 * including encounter initiation, combat, and rewards
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { BossEncounterService } from '../services/bossEncounter.service';
import { BossPhaseService } from '../services/bossPhase.service';
import { BossAttackRequest } from '@desperados/shared';
import { BossEncounter as BossEncounterModel, BossDiscovery } from '../models/BossEncounter.model';
import { getBossById, getAllBosses } from '../data/bosses';
import logger from '../utils/logger';
import { clampLimit } from '../utils/validation';

/**
 * GET /api/boss-encounters
 * Get all available bosses and character's discovery progress
 */
export async function getAllBossesWithProgress(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    // Get all bosses from data
    const bosses = getAllBosses();

    // Get character's discovery records - limit to prevent OOM (game shouldn't have more than 100 bosses)
    const discoveries = await BossDiscovery.find({ characterId }).limit(200);
    const discoveryMap = new Map<string, any>();
    discoveries.forEach(d => {
      discoveryMap.set(d.bossId, d);
    });

    // Build response with progress
    const bossesWithProgress = bosses.map(boss => {
      const discovery = discoveryMap.get(boss.id);
      return {
        boss: {
          id: boss.id,
          name: boss.name,
          description: boss.description,
          tier: boss.tier,
          levelRequirement: boss.level,
          playerLimit: boss.playerLimit,
          location: boss.location
        },
        progress: discovery ? {
          discovered: discovery.discovered,
          discoveredAt: discovery.discoveredAt,
          encounterCount: discovery.encounterCount,
          victoryCount: discovery.victoryCount,
          defeatCount: discovery.defeatCount,
          bestAttempt: discovery.bestAttempt,
          firstKillRewardClaimed: discovery.firstKillRewardClaimed
        } : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        bosses: bossesWithProgress,
        totalBosses: bosses.length,
        discovered: discoveries.filter(d => d.discovered).length,
        defeated: discoveries.filter(d => d.victoryCount > 0).length
      }
    });
  } catch (error) {
    logger.error('Error getting bosses with progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get boss data'
    });
  }
}

/**
 * GET /api/boss-encounters/:bossId
 * Get specific boss details and character's discovery progress
 */
export async function getBossDetails(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { bossId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!bossId) {
      res.status(400).json({
        success: false,
        error: 'Boss ID required'
      });
      return;
    }

    const boss = getBossById(bossId);
    if (!boss) {
      res.status(404).json({
        success: false,
        error: 'Boss not found'
      });
      return;
    }

    // Get character's discovery
    const discovery = await BossDiscovery.findOne({ characterId, bossId });

    res.status(200).json({
      success: true,
      data: {
        boss: {
          id: boss.id,
          name: boss.name,
          description: boss.description,
          tier: boss.tier,
          health: boss.health,
          damage: boss.damage,
          phases: boss.phases.map(p => ({
            phaseNumber: p.phaseNumber,
            name: p.name,
            healthThreshold: p.healthThreshold,
            description: p.description
          })),
          abilities: boss.abilities.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            type: a.type
          })),
          goldReward: boss.goldReward,
          experienceReward: boss.experienceReward,
          firstKillBonus: boss.firstKillBonus,
          playerLimit: boss.playerLimit,
          enrageTimer: boss.enrageTimer,
          respawnCooldown: boss.respawnCooldown,
          location: boss.location
        },
        progress: discovery ? {
          discovered: discovery.discovered,
          discoveredAt: discovery.discoveredAt,
          discoveryMethod: discovery.discoveryMethod,
          encounterCount: discovery.encounterCount,
          victoryCount: discovery.victoryCount,
          defeatCount: discovery.defeatCount,
          lastEncounteredAt: discovery.lastEncounteredAt,
          lastVictoryAt: discovery.lastVictoryAt,
          bestAttempt: discovery.bestAttempt,
          firstKillRewardClaimed: discovery.firstKillRewardClaimed
        } : null
      }
    });
  } catch (error) {
    logger.error('Error getting boss details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get boss details'
    });
  }
}

/**
 * GET /api/boss-encounters/:bossId/availability
 * Check if a boss is available for the character
 */
export async function checkAvailability(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { bossId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!bossId) {
      res.status(400).json({
        success: false,
        error: 'Boss ID required'
      });
      return;
    }

    const availability = await BossEncounterService.checkAvailability(characterId, bossId);

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    logger.error('Error checking boss availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check boss availability'
    });
  }
}

/**
 * POST /api/boss-encounters/:bossId/initiate
 * Initiate a boss encounter
 * Body: { location: string, partyMemberIds?: string[] }
 */
export async function initiateBossEncounter(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { bossId } = req.params;
    const { location, partyMemberIds } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!bossId) {
      res.status(400).json({
        success: false,
        error: 'Boss ID required'
      });
      return;
    }

    if (!location) {
      res.status(400).json({
        success: false,
        error: 'Location required'
      });
      return;
    }

    const result = await BossEncounterService.initiateBossEncounter(
      characterId,
      bossId,
      location,
      partyMemberIds
    );

    logger.info(`Boss encounter initiated: ${bossId} by character ${characterId}`);

    res.status(201).json({
      success: true,
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
        },
        message: `Boss encounter started: ${result.boss.name}`
      }
    });
  } catch (error: any) {
    logger.error('Error initiating boss encounter:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to initiate boss encounter'
    });
  }
}

/**
 * GET /api/boss-encounters/sessions/:sessionId
 * Get current boss encounter session status
 */
export async function getEncounterSession(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { sessionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
      return;
    }

    const encounter = await BossEncounterModel.findOne({ sessionId });

    if (!encounter) {
      res.status(404).json({
        success: false,
        error: 'Boss encounter session not found'
      });
      return;
    }

    // Verify character is in encounter
    const isParticipant = encounter.characterIds.some(
      id => id.toString() === characterId
    );

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        error: 'You are not a participant in this encounter'
      });
      return;
    }

    const boss = getBossById(encounter.bossId);

    res.status(200).json({
      success: true,
      data: {
        session: {
          sessionId: encounter.sessionId,
          bossId: encounter.bossId,
          bossName: boss?.name || 'Unknown',
          currentPhase: encounter.currentPhase,
          bossHealth: encounter.bossHealth,
          bossMaxHealth: encounter.bossMaxHealth,
          turnCount: encounter.turnCount,
          status: encounter.status,
          playerStates: Object.fromEntries(encounter.playerStates),
          startedAt: encounter.startedAt,
          enrageAt: encounter.enrageAt
        }
      }
    });
  } catch (error) {
    logger.error('Error getting encounter session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get encounter session'
    });
  }
}

/**
 * GET /api/boss-encounters/active
 * Get character's active boss encounter if any
 */
export async function getActiveEncounter(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const encounter = await BossEncounterModel.findActiveByCharacter(characterId);

    if (!encounter) {
      res.status(200).json({
        success: true,
        data: {
          activeEncounter: null,
          message: 'No active boss encounter'
        }
      });
      return;
    }

    const boss = getBossById(encounter.bossId);

    res.status(200).json({
      success: true,
      data: {
        activeEncounter: {
          sessionId: encounter.sessionId,
          bossId: encounter.bossId,
          bossName: boss?.name || 'Unknown',
          currentPhase: encounter.currentPhase,
          bossHealth: encounter.bossHealth,
          bossMaxHealth: encounter.bossMaxHealth,
          turnCount: encounter.turnCount,
          status: encounter.status,
          startedAt: encounter.startedAt,
          enrageAt: encounter.enrageAt
        }
      }
    });
  } catch (error) {
    logger.error('Error getting active encounter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active encounter'
    });
  }
}

/**
 * POST /api/boss-encounters/sessions/:sessionId/attack
 * Execute a combat action in boss encounter
 * Body: { action: 'attack' | 'defend' | 'item' | 'flee', targetId?: string, itemId?: string }
 */
export async function processBossAttack(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { sessionId } = req.params;
    const { action, targetId, itemId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
      return;
    }

    const validActions = ['attack', 'defend', 'item', 'flee'];
    if (!action || !validActions.includes(action)) {
      res.status(400).json({
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
      return;
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
      res.status(400).json({
        success: false,
        error: result.message || 'Attack failed'
      });
      return;
    }

    let message = 'Combat round completed';
    if (result.combatEnded) {
      message = result.result?.outcome === 'victory'
        ? 'Victory! The boss has been defeated!'
        : 'Defeat! Your party has fallen...';
      logger.info(`Boss encounter ended: ${sessionId} - ${result.result?.outcome}`);
    }

    res.status(200).json({
      success: true,
      data: {
        session: result.session,
        round: result.round,
        combatEnded: result.combatEnded,
        result: result.result,
        message
      }
    });
  } catch (error: any) {
    logger.error('Error processing boss attack:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to process attack'
    });
  }
}

/**
 * POST /api/boss-encounters/sessions/:sessionId/abandon
 * Abandon a boss encounter (counts as defeat)
 */
export async function abandonEncounter(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { sessionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
      return;
    }

    const encounter = await BossEncounterModel.findOne({ sessionId });

    if (!encounter) {
      res.status(404).json({
        success: false,
        error: 'Boss encounter session not found'
      });
      return;
    }

    // Verify character is in encounter
    const isParticipant = encounter.characterIds.some(
      id => id.toString() === characterId
    );

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        error: 'You are not a participant in this encounter'
      });
      return;
    }

    if (encounter.status !== 'active') {
      res.status(400).json({
        success: false,
        error: 'Encounter is not active'
      });
      return;
    }

    // Mark as abandoned (defeat)
    encounter.status = 'defeat';
    encounter.endedAt = new Date();
    await encounter.save();

    // Update discovery records
    for (const charId of encounter.characterIds) {
      const discovery = await BossDiscovery.findOrCreate(charId.toString(), encounter.bossId);
      discovery.defeatCount += 1;
      await discovery.save();
    }

    logger.info(`Boss encounter abandoned: ${sessionId} by character ${characterId}`);

    res.status(200).json({
      success: true,
      data: {
        message: 'Boss encounter abandoned'
      }
    });
  } catch (error) {
    logger.error('Error abandoning encounter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to abandon encounter'
    });
  }
}

/**
 * GET /api/boss-encounters/:bossId/history
 * Get character's encounter history for a specific boss
 */
export async function getEncounterHistory(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { bossId } = req.params;
    // SECURITY FIX: Clamp limit to prevent pagination DoS
    const limit = clampLimit(req.query.limit, { defaultLimit: 10, maxLimit: 100 });

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!bossId) {
      res.status(400).json({
        success: false,
        error: 'Boss ID required'
      });
      return;
    }

    const encounters = await BossEncounterModel.find({
      bossId,
      characterIds: new mongoose.Types.ObjectId(characterId),
      status: { $in: ['victory', 'defeat', 'timeout'] }
    })
      .sort({ endedAt: -1 })
      .limit(limit);

    const boss = getBossById(bossId);

    res.status(200).json({
      success: true,
      data: {
        bossId,
        bossName: boss?.name || 'Unknown',
        history: encounters.map(e => ({
          sessionId: e.sessionId,
          outcome: e.status,
          turnCount: e.turnCount,
          bossHealthRemaining: e.bossHealth,
          duration: e.endedAt && e.startedAt
            ? (e.endedAt.getTime() - e.startedAt.getTime()) / 1000
            : null,
          playerCount: e.characterIds.length,
          startedAt: e.startedAt,
          endedAt: e.endedAt
        })),
        totalEncounters: encounters.length
      }
    });
  } catch (error) {
    logger.error('Error getting encounter history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get encounter history'
    });
  }
}

/**
 * GET /api/boss-encounters/:bossId/leaderboard
 * Get leaderboard for a specific boss
 * Query: { limit?: number }
 */
export async function getBossLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { bossId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!bossId) {
      res.status(400).json({
        success: false,
        error: 'Boss ID required'
      });
      return;
    }

    const boss = getBossById(bossId);
    if (!boss) {
      res.status(404).json({
        success: false,
        error: 'Boss not found'
      });
      return;
    }

    // Get top performers by victory count
    const topDiscoveries = await BossDiscovery.find({
      bossId,
      victoryCount: { $gt: 0 }
    })
      .sort({ victoryCount: -1, 'bestAttempt.duration': 1 })
      .limit(limit)
      .populate('characterId', 'name level');

    const leaderboard = topDiscoveries.map((d, index) => ({
      rank: index + 1,
      characterId: d.characterId,
      victoryCount: d.victoryCount,
      bestTime: d.bestAttempt?.duration,
      bestDamage: d.bestAttempt?.damageDealt,
      firstKill: d.firstKillRewardClaimed
    }));

    res.status(200).json({
      success: true,
      data: {
        bossId,
        bossName: boss.name,
        leaderboard
      }
    });
  } catch (error) {
    logger.error('Error getting boss leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    });
  }
}

export default {
  getAllBossesWithProgress,
  getBossDetails,
  checkAvailability,
  initiateBossEncounter,
  getEncounterSession,
  getActiveEncounter,
  processBossAttack,
  abandonEncounter,
  getEncounterHistory,
  getBossLeaderboard
};
