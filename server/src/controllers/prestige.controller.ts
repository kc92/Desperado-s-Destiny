/**
 * Prestige Controller
 * HTTP endpoints for the prestige/endgame system
 */

import { Request, Response } from 'express';
import { ProgressionService, PRESTIGE_RANKS } from '../services/progression.service';
import { Character, CharacterPrestige } from '../models/Character.model';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';
import { safeAchievementUpdate } from '../utils/achievementUtils';

/**
 * Get prestige info for current character
 * GET /api/prestige
 */
export const getPrestigeInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const characterId = req.query.characterId as string;
    if (!characterId) {
      res.status(400).json({ error: 'Character ID required' });
      return;
    }

    const info = await ProgressionService.getPrestigeInfo(characterId);

    res.status(200).json({
      success: true,
      data: {
        currentRank: info.currentRank.currentRank,
        totalPrestiges: info.currentRank.totalPrestiges,
        permanentBonuses: info.currentRank.permanentBonuses,
        nextRank: info.nextRank,
        canPrestige: info.canPrestige,
        prestigeHistory: info.currentRank.prestigeHistory,
      },
    });
  } catch (error) {
    logger.error('[PrestigeController] Error fetching prestige info:', error);
    res.status(500).json({
      error: 'Failed to fetch prestige info',
      message: sanitizeErrorMessage(error),
    });
  }
};

/**
 * Perform prestige reset
 * POST /api/prestige/reset
 */
export const performPrestige = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { characterId } = req.body;
    if (!characterId) {
      res.status(400).json({ error: 'Character ID required' });
      return;
    }

    // Verify character belongs to authenticated user
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ error: 'Not authorized to prestige this character' });
      return;
    }

    const result = await ProgressionService.performPrestige(characterId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
      });
      return;
    }

    // Track achievements for prestige (with safe error handling)
    safeAchievementUpdate(characterId, 'first_prestige', 1, 'prestige:reset');
    if (result.newRank) {
      safeAchievementUpdate(characterId, `prestige_${result.newRank.rank}`, 1, 'prestige:rank');
    }

    logger.info(`[PrestigeController] Character ${characterId} prestiged to rank ${result.newRank?.rank}`);

    res.status(200).json({
      success: true,
      message: `Congratulations! You've prestiged to ${result.newRank?.name}!`,
      data: {
        newRank: result.newRank,
      },
    });
  } catch (error) {
    logger.error('[PrestigeController] Error performing prestige:', error);
    res.status(500).json({
      error: 'Failed to perform prestige',
      message: sanitizeErrorMessage(error),
    });
  }
};

/**
 * Get prestige history for a character
 * GET /api/prestige/history
 */
export const getPrestigeHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const characterId = req.query.characterId as string;
    if (!characterId) {
      res.status(400).json({ error: 'Character ID required' });
      return;
    }

    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    const prestige: CharacterPrestige = character.prestige ?? {
      currentRank: 0,
      totalPrestiges: 0,
      xpMultiplier: 1.0,
      goldMultiplier: 1.0,
      permanentBonuses: [],
      prestigeHistory: [],
    };

    res.status(200).json({
      success: true,
      data: {
        history: prestige.prestigeHistory,
        totalPrestiges: prestige.totalPrestiges,
      },
    });
  } catch (error) {
    logger.error('[PrestigeController] Error fetching prestige history:', error);
    res.status(500).json({
      error: 'Failed to fetch prestige history',
      message: sanitizeErrorMessage(error),
    });
  }
};

/**
 * Get all prestige rank definitions
 * GET /api/prestige/ranks
 */
export const getPrestigeRanks = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        ranks: PRESTIGE_RANKS,
        maxRank: PRESTIGE_RANKS.length,
      },
    });
  } catch (error) {
    logger.error('[PrestigeController] Error fetching prestige ranks:', error);
    res.status(500).json({
      error: 'Failed to fetch prestige ranks',
      message: sanitizeErrorMessage(error),
    });
  }
};

/**
 * Check prestige eligibility
 * GET /api/prestige/eligibility
 */
export const checkPrestigeEligibility = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const characterId = req.query.characterId as string;
    if (!characterId) {
      res.status(400).json({ error: 'Character ID required' });
      return;
    }

    const info = await ProgressionService.getPrestigeInfo(characterId);

    // Build requirements list with new Total Level system
    const requirements = [];
    if (info.nextRank) {
      const character = await Character.findById(characterId);
      if (character) {
        const totalLevel = character.totalLevel || 30;
        const combatLevel = character.combatLevel || 1;
        const skillsAt50Plus = character.skills.filter(s => s.level >= 50).length;

        // Total Level requirement: 1000+
        requirements.push({
          type: 'totalLevel',
          current: totalLevel,
          required: 1000,
          met: totalLevel >= 1000,
        });

        // Combat Level requirement: 75+
        requirements.push({
          type: 'combatLevel',
          current: combatLevel,
          required: 75,
          met: combatLevel >= 75,
        });

        // Skills at 50+ requirement: 5+
        requirements.push({
          type: 'skillsAt50',
          current: skillsAt50Plus,
          required: 5,
          met: skillsAt50Plus >= 5,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        eligible: info.canPrestige,
        currentRank: info.currentRank.currentRank,
        nextRank: info.nextRank,
        requirements,
        atMaxRank: info.nextRank === null,
      },
    });
  } catch (error) {
    logger.error('[PrestigeController] Error checking prestige eligibility:', error);
    res.status(500).json({
      error: 'Failed to check prestige eligibility',
      message: sanitizeErrorMessage(error),
    });
  }
};
