/**
 * Crime Controller
 *
 * Handles all crime-related HTTP requests (jail, wanted level, arrests, bounties)
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import { Character } from '../models/Character.model';
import { CrimeService } from '../services/crime.service';
import logger from '../utils/logger';

/**
 * POST /api/crimes/pay-bail
 * Pay bail to escape jail early
 */
export async function payBail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { characterId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: characterId'
      });
      return;
    }

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Pay bail
    const result = await CrimeService.payBail(characterId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: result.message,
        goldSpent: result.goldSpent
      }
    });
  } catch (error) {
    logger.error('Error paying bail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pay bail'
    });
  }
}

/**
 * GET /api/crimes/wanted
 * Get character's wanted status
 */
export async function getWantedStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const characterId = req.query['characterId'] as string;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Missing required query parameter: characterId'
      });
      return;
    }

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Calculate time until decay
    const hoursSinceDecay = (Date.now() - character.lastWantedDecay.getTime()) / (1000 * 60 * 60);
    const hoursUntilDecay = Math.max(0, 24 - hoursSinceDecay);

    // Get wanted level name
    const wantedLevelNames = [
      'Clean',
      'Petty Criminal',
      'Known Thief',
      'Outlaw',
      'Notorious',
      'Most Wanted'
    ];

    res.status(200).json({
      success: true,
      data: {
        wantedLevel: character.wantedLevel,
        wantedLevelName: wantedLevelNames[character.wantedLevel],
        bountyAmount: character.bountyAmount,
        canBeArrested: character.canBeArrested(),
        hoursUntilDecay: Math.round(hoursUntilDecay * 10) / 10,
        lastDecay: character.lastWantedDecay
      }
    });
  } catch (error) {
    logger.error('Error getting wanted status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wanted status'
    });
  }
}

/**
 * POST /api/crimes/lay-low
 * Reduce wanted level by laying low
 */
export async function layLow(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { characterId, useGold } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: characterId'
      });
      return;
    }

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Lay low
    const result = await CrimeService.layLow(characterId, useGold || false);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: `You laid low and kept your head down. Wanted level reduced to ${result.newWantedLevel}.`,
        newWantedLevel: result.newWantedLevel,
        costPaid: result.costPaid
      }
    });
  } catch (error) {
    logger.error('Error laying low:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lay low'
    });
  }
}

/**
 * POST /api/crimes/arrest/:targetCharacterId
 * Arrest another player (bounty hunting)
 */
export async function arrestPlayer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { characterId } = req.body;
    const targetCharacterId = req.params['targetCharacterId'];

    if (!characterId || !targetCharacterId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: characterId and targetCharacterId'
      });
      return;
    }

    // Verify arrester character ownership
    const arrester = await Character.findById(characterId);
    if (!arrester) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    if (arrester.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Perform arrest
    const result = await CrimeService.arrestPlayer(characterId, targetCharacterId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: result.message,
        bountyEarned: result.bountyEarned,
        targetJailTime: result.targetJailTime
      }
    });
  } catch (error) {
    logger.error('Error arresting player:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to arrest player'
    });
  }
}

/**
 * GET /api/crimes/bounties
 * Get public bounty board (all wanted criminals)
 */
export async function getBountyBoard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bounties = await CrimeService.getBountyList();

    res.status(200).json({
      success: true,
      data: {
        bounties,
        total: bounties.length
      }
    });
  } catch (error) {
    logger.error('Error getting bounty board:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bounty board'
    });
  }
}

/**
 * GET /api/crimes/jail-status
 * Get character's jail status
 */
export async function getJailStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const characterId = req.query['characterId'] as string;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Missing required query parameter: characterId'
      });
      return;
    }

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    const isJailed = character.isCurrentlyJailed();
    const remainingMinutes = character.getRemainingJailTime();
    const bailCost = character.wantedLevel * 50;

    res.status(200).json({
      success: true,
      data: {
        isJailed,
        jailedUntil: character.jailedUntil,
        remainingMinutes,
        bailCost,
        wantedLevel: character.wantedLevel
      }
    });
  } catch (error) {
    logger.error('Error getting jail status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get jail status'
    });
  }
}
