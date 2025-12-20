/**
 * Legendary Hunt Controller
 *
 * Handles all legendary animal hunt HTTP requests including
 * discovery, tracking, combat, and rewards
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import legendaryHuntService from '../services/legendaryHunt.service';
import legendaryCombatService from '../services/legendaryCombat.service';
import logger from '../utils/logger';

/**
 * GET /api/legendary-hunts
 * Get all legendary animals with character's progress
 * Query: { category?: string, location?: string, discoveryStatus?: string }
 */
export async function getLegendaryAnimals(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const { category, location, discoveryStatus } = req.query;

    const filters: {
      category?: string;
      location?: string;
      discoveryStatus?: any;
    } = {};

    if (category && typeof category === 'string') {
      filters.category = category;
    }
    if (location && typeof location === 'string') {
      filters.location = location;
    }
    if (discoveryStatus && typeof discoveryStatus === 'string') {
      filters.discoveryStatus = parseInt(discoveryStatus, 10);
    }

    const result = await legendaryHuntService.getLegendaryAnimals(
      new mongoose.Types.ObjectId(characterId),
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.status(200).json({
      success: result.success,
      data: {
        legendaries: result.legendaries
      }
    });
  } catch (error) {
    logger.error('Error getting legendary animals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get legendary animals'
    });
  }
}

/**
 * GET /api/legendary-hunts/:legendaryId
 * Get specific legendary animal with character's progress
 */
export async function getLegendaryAnimal(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { legendaryId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!legendaryId) {
      res.status(400).json({
        success: false,
        error: 'Legendary ID required'
      });
      return;
    }

    const result = await legendaryHuntService.getLegendaryAnimals(
      new mongoose.Types.ObjectId(characterId)
    );

    const legendary = result.legendaries.find(l => l.legendary?.id === legendaryId);

    if (!legendary) {
      res.status(404).json({
        success: false,
        error: 'Legendary animal not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: legendary
    });
  } catch (error) {
    logger.error('Error getting legendary animal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get legendary animal'
    });
  }
}

/**
 * POST /api/legendary-hunts/:legendaryId/discover-clue
 * Discover a clue for a legendary animal at a location
 * Body: { location: string }
 */
export async function discoverClue(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { legendaryId } = req.params;
    const { location } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!legendaryId) {
      res.status(400).json({
        success: false,
        error: 'Legendary ID required'
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

    const result = await legendaryHuntService.discoverClue(
      new mongoose.Types.ObjectId(characterId),
      legendaryId,
      location
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message
      });
      return;
    }

    logger.info(`Character ${characterId} discovered clue for ${legendaryId}`);

    res.status(200).json({
      success: true,
      data: {
        clue: result.clue,
        discovered: result.discovered,
        message: result.message
      }
    });
  } catch (error) {
    logger.error('Error discovering clue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to discover clue'
    });
  }
}

/**
 * POST /api/legendary-hunts/:legendaryId/hear-rumor
 * Hear a rumor about a legendary animal from an NPC
 * Body: { npcId: string }
 */
export async function hearRumor(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { legendaryId } = req.params;
    const { npcId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!npcId) {
      res.status(400).json({
        success: false,
        error: 'NPC ID required'
      });
      return;
    }

    const result = await legendaryHuntService.hearRumor(
      new mongoose.Types.ObjectId(characterId),
      npcId,
      legendaryId
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message
      });
      return;
    }

    logger.info(`Character ${characterId} heard rumor about legendary from NPC ${npcId}`);

    res.status(200).json({
      success: true,
      data: {
        rumor: result.rumor,
        message: result.message
      }
    });
  } catch (error) {
    logger.error('Error hearing rumor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to hear rumor'
    });
  }
}

/**
 * POST /api/legendary-hunts/:legendaryId/initiate
 * Initiate a hunt against a legendary animal
 * Body: { location: string }
 */
export async function initiateLegendaryHunt(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { legendaryId } = req.params;
    const { location } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!legendaryId) {
      res.status(400).json({
        success: false,
        error: 'Legendary ID required'
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

    const result = await legendaryHuntService.initiateLegendaryHunt(
      new mongoose.Types.ObjectId(characterId),
      legendaryId,
      location
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    // Store the session for combat
    if (result.session) {
      await legendaryCombatService.storeSession(result.session);
    }

    logger.info(`Character ${characterId} initiated hunt against ${legendaryId}`);

    res.status(200).json({
      success: true,
      data: {
        session: result.session,
        message: result.message
      }
    });
  } catch (error) {
    logger.error('Error initiating legendary hunt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate legendary hunt'
    });
  }
}

/**
 * POST /api/legendary-hunts/combat/:sessionId/attack
 * Execute a turn in legendary combat
 * Body: { action: 'attack' | 'special' | 'defend' | 'item' | 'flee', itemId?: string }
 */
export async function executeHuntTurn(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { sessionId } = req.params;
    const { action, itemId } = req.body;

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

    if (!action) {
      res.status(400).json({
        success: false,
        error: 'Action required'
      });
      return;
    }

    const validActions = ['attack', 'special', 'defend', 'item', 'flee'];
    if (!validActions.includes(action)) {
      res.status(400).json({
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
      return;
    }

    // Verify session belongs to character
    const session = await legendaryCombatService.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Hunt session not found'
      });
      return;
    }

    if (session.characterId !== characterId) {
      res.status(403).json({
        success: false,
        error: 'This hunt session does not belong to your character'
      });
      return;
    }

    const result = await legendaryCombatService.executeHuntTurn({
      sessionId,
      action: action as 'attack' | 'special' | 'defend' | 'item' | 'flee',
      itemId
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    logger.info(`Character ${characterId} executed ${action} in hunt session ${sessionId}`);

    res.status(200).json({
      success: true,
      data: {
        session: result.session,
        turnResult: result.turnResult,
        message: result.message
      }
    });
  } catch (error) {
    logger.error('Error executing hunt turn:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute hunt turn'
    });
  }
}

/**
 * GET /api/legendary-hunts/combat/:sessionId
 * Get current hunt session status
 */
export async function getHuntSession(req: CharacterRequest, res: Response): Promise<void> {
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

    const session = await legendaryCombatService.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Hunt session not found'
      });
      return;
    }

    if (session.characterId !== characterId) {
      res.status(403).json({
        success: false,
        error: 'This hunt session does not belong to your character'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        session
      }
    });
  } catch (error) {
    logger.error('Error getting hunt session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hunt session'
    });
  }
}

/**
 * DELETE /api/legendary-hunts/combat/:sessionId
 * Abandon a hunt session
 */
export async function abandonHuntSession(req: CharacterRequest, res: Response): Promise<void> {
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

    const session = await legendaryCombatService.getSession(sessionId);
    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Hunt session not found'
      });
      return;
    }

    if (session.characterId !== characterId) {
      res.status(403).json({
        success: false,
        error: 'This hunt session does not belong to your character'
      });
      return;
    }

    await legendaryCombatService.removeSession(sessionId);

    logger.info(`Character ${characterId} abandoned hunt session ${sessionId}`);

    res.status(200).json({
      success: true,
      data: {
        message: 'Hunt session abandoned'
      }
    });
  } catch (error) {
    logger.error('Error abandoning hunt session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to abandon hunt session'
    });
  }
}

/**
 * GET /api/legendary-hunts/:legendaryId/difficulty
 * Get difficulty rating for a legendary hunt
 */
export async function getDifficultyRating(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { legendaryId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!legendaryId) {
      res.status(400).json({
        success: false,
        error: 'Legendary ID required'
      });
      return;
    }

    // Get character level
    const character = req.character;
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const difficulty = legendaryCombatService.calculateDifficultyRating(
      legendaryId,
      character.level
    );

    res.status(200).json({
      success: true,
      data: difficulty
    });
  } catch (error) {
    logger.error('Error getting difficulty rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get difficulty rating'
    });
  }
}

/**
 * GET /api/legendary-hunts/trophies
 * Get all legendary trophies for character
 */
export async function getTrophies(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const trophies = await legendaryHuntService.getLegendaryTrophies(
      new mongoose.Types.ObjectId(characterId)
    );

    res.status(200).json({
      success: true,
      data: {
        trophies,
        count: trophies.length
      }
    });
  } catch (error) {
    logger.error('Error getting trophies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trophies'
    });
  }
}

/**
 * GET /api/legendary-hunts/:legendaryId/leaderboard
 * Get leaderboard for a legendary animal
 * Query: { limit?: number }
 */
export async function getLeaderboard(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { legendaryId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!legendaryId) {
      res.status(400).json({
        success: false,
        error: 'Legendary ID required'
      });
      return;
    }

    const leaderboard = await legendaryHuntService.getLegendaryLeaderboard(legendaryId, limit);

    if (!leaderboard) {
      res.status(404).json({
        success: false,
        error: 'Legendary animal not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    logger.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    });
  }
}

/**
 * POST /api/legendary-hunts/:legendaryId/claim-rewards
 * Claim rewards after defeating a legendary (if not auto-claimed)
 */
export async function claimRewards(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id?.toString();
    const { legendaryId } = req.params;
    const { sessionId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!legendaryId) {
      res.status(400).json({
        success: false,
        error: 'Legendary ID required'
      });
      return;
    }

    // Get session to pass to reward function
    const session = sessionId ? await legendaryCombatService.getSession(sessionId) : undefined;

    if (session && session.characterId !== characterId) {
      res.status(403).json({
        success: false,
        error: 'Session does not belong to your character'
      });
      return;
    }

    const rewards = await legendaryHuntService.awardLegendaryRewards(
      new mongoose.Types.ObjectId(characterId),
      legendaryId,
      session as any
    );

    logger.info(`Character ${characterId} claimed rewards for defeating ${legendaryId}`);

    res.status(200).json({
      success: true,
      data: {
        rewards,
        message: 'Rewards claimed successfully'
      }
    });
  } catch (error) {
    logger.error('Error claiming rewards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim rewards'
    });
  }
}

export default {
  getLegendaryAnimals,
  getLegendaryAnimal,
  discoverClue,
  hearRumor,
  initiateLegendaryHunt,
  executeHuntTurn,
  getHuntSession,
  abandonHuntSession,
  getDifficultyRating,
  getTrophies,
  getLeaderboard,
  claimRewards
};
