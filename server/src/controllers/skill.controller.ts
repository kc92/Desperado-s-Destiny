/**
 * Skill Controller
 *
 * Handles all skill-related HTTP requests
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { SkillService } from '../services/skill.service';
import { Character } from '../models/Character.model';
import { SKILLS } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Get all skills and character's skill progress
 * GET /api/skills
 */
export async function getSkills(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Check if training is complete and auto-complete (handles offline completion)
    let currentCharacter = character;
    const autoCompleteResult = await SkillService.checkAndAutoComplete((character._id as any).toString());
    if (autoCompleteResult.completed) {
      // Reload character to get updated data
      const refreshedCharacter = await Character.findById(character._id);
      if (refreshedCharacter) {
        currentCharacter = refreshedCharacter;
      }
    }

    // Get all available skills
    const availableSkills = Object.values(SKILLS).map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      suit: skill.suit,
      category: skill.category,
      maxLevel: skill.maxLevel,
      baseTrainingTime: skill.baseTrainingTime,
      icon: skill.icon
    }));

    // Get character's skill progress
    const characterSkills = currentCharacter.skills.map(skill => {
      const xpToNextLevel = SkillService.calculateXPForNextLevel(skill.level);
      return {
        skillId: skill.skillId,
        level: skill.level,
        xp: skill.experience,
        xpToNextLevel
      };
    });

    // Get current training status
    const currentTraining = currentCharacter.getCurrentTraining();
    let trainingStatus = null;

    if (currentTraining && currentTraining.trainingStarted && currentTraining.trainingCompletes) {
      const xpReward = SkillService.calculateXPForNextLevel(currentTraining.level);
      trainingStatus = {
        skillId: currentTraining.skillId,
        startedAt: currentTraining.trainingStarted,
        completesAt: currentTraining.trainingCompletes,
        xpToGain: xpReward
      };
    }

    // Get suit bonuses
    const bonuses = SkillService.calculateSuitBonuses(currentCharacter);

    res.status(200).json({
      success: true,
      data: {
        skills: availableSkills,
        characterSkills,
        currentTraining: trainingStatus,
        bonuses
      }
    });
  } catch (error) {
    logger.error('Error getting skills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get skills'
    });
  }
}

/**
 * Start training a skill
 * POST /api/skills/train
 * Body: { skillId: string }
 */
export async function startTraining(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const { skillId } = req.body;

    if (!skillId) {
      res.status(400).json({
        success: false,
        error: 'skillId is required'
      });
      return;
    }

    const result = await SkillService.startTraining((character._id as any).toString(), skillId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    const timeRemaining = result.training!.completesAt.getTime() - result.training!.startedAt.getTime();

    res.status(200).json({
      success: true,
      data: {
        training: result.training,
        timeRemaining,
        message: 'Training started successfully'
      }
    });
  } catch (error) {
    logger.error('Error starting training:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start training'
    });
  }
}

/**
 * Cancel current training
 * POST /api/skills/cancel
 */
export async function cancelTraining(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const result = await SkillService.cancelTraining((character._id as any).toString());

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Training cancelled'
    });
  } catch (error) {
    logger.error('Error cancelling training:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel training'
    });
  }
}

/**
 * Complete current training and award XP
 * POST /api/skills/complete
 */
export async function completeTraining(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const result = await SkillService.completeTraining((character._id as any).toString());

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    // Get updated bonuses - reload character using proper Mongoose query
    const refreshedCharacter = await Character.findById(character._id);
    const bonuses = SkillService.calculateSuitBonuses(refreshedCharacter || character);

    res.status(200).json({
      success: true,
      data: {
        result: result.result,
        bonuses,
        message: result.result!.leveledUp
          ? `Skill leveled up to ${result.result!.newLevel}!`
          : 'XP gained'
      }
    });
  } catch (error) {
    logger.error('Error completing training:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete training'
    });
  }
}

/**
 * Get character's suit bonuses
 * GET /api/skills/bonuses
 */
export async function getSuitBonuses(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const bonuses = SkillService.calculateSuitBonuses(character);

    // Format with details
    const detailedBonuses = Object.keys(bonuses).map(suit => {
      const skillsForSuit = character.skills.filter(skill => {
        const skillDef = SKILLS[skill.skillId.toUpperCase()];
        return skillDef && skillDef.suit === suit;
      });

      return {
        suit,
        total: bonuses[suit],
        skills: skillsForSuit.map(skill => {
          const skillDef = SKILLS[skill.skillId.toUpperCase()];
          return {
            skillName: skillDef!.name,
            bonus: skill.level
          };
        })
      };
    });

    res.status(200).json({
      success: true,
      data: {
        bonuses,
        details: detailedBonuses
      }
    });
  } catch (error) {
    logger.error('Error getting suit bonuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suit bonuses'
    });
  }
}
