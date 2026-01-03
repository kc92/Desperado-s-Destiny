/**
 * Skill Training Controller
 *
 * Handles skill training activity requests
 * Part of Phase 19: Core Loop Overhaul
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { SkillTrainingService } from '../services/skillTraining.service';
import logger from '../utils/logger';

/**
 * Get all training activities
 * GET /api/skill-training/activities
 */
export async function getActivities(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const locationType = req.query.location as string | undefined;

    const result = await SkillTrainingService.getAvailableActivities(
      (character._id as any).toString(),
      locationType
    );

    res.status(200).json({
      success: true,
      data: {
        activities: result.activities,
        available: result.available,
        cooldowns: result.cooldowns,
        stats: SkillTrainingService.getActivityStats()
      }
    });
  } catch (error) {
    logger.error('Error getting training activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get training activities'
    });
  }
}

/**
 * Get activities for a specific skill
 * GET /api/skill-training/activities/:skillId
 */
export async function getActivitiesForSkill(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { skillId } = req.params;

    const activities = SkillTrainingService.getActivitiesForSkill(skillId);

    if (activities.length === 0) {
      res.status(404).json({
        success: false,
        error: `No activities found for skill: ${skillId}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        skillId,
        activities
      }
    });
  } catch (error) {
    logger.error('Error getting skill activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get skill activities'
    });
  }
}

/**
 * Get Level 1 available activities
 * GET /api/skill-training/level1
 */
export async function getLevel1Activities(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const activities = SkillTrainingService.getLevel1Activities();

    res.status(200).json({
      success: true,
      data: {
        count: activities.length,
        activities
      }
    });
  } catch (error) {
    logger.error('Error getting level 1 activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get level 1 activities'
    });
  }
}

/**
 * Check requirements for a training activity
 * GET /api/skill-training/check/:activityId
 */
export async function checkRequirements(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;
    const { activityId } = req.params;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const requirements = await SkillTrainingService.checkRequirements(
      (character._id as any).toString(),
      activityId
    );

    const activity = SkillTrainingService.getActivityById(activityId);

    res.status(200).json({
      success: true,
      data: {
        activity,
        requirements
      }
    });
  } catch (error) {
    logger.error('Error checking training requirements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check requirements'
    });
  }
}

/**
 * Perform a training activity
 * POST /api/skill-training/perform
 */
export async function performTraining(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;
    const { activityId } = req.body;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    if (!activityId) {
      res.status(400).json({
        success: false,
        error: 'Activity ID is required'
      });
      return;
    }

    const result = await SkillTrainingService.performTraining(
      (character._id as any).toString(),
      activityId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error performing training:', error);

    // Handle validation errors
    if (error.statusCode === 400 || error.message) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to perform training'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to perform training'
    });
  }
}

/**
 * Get cooldowns for all activities
 * GET /api/skill-training/cooldowns
 */
export async function getCooldowns(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const cooldowns = await SkillTrainingService.getCharacterCooldowns(
      (character._id as any).toString()
    );

    res.status(200).json({
      success: true,
      data: {
        cooldowns
      }
    });
  } catch (error) {
    logger.error('Error getting cooldowns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cooldowns'
    });
  }
}

/**
 * Get training activity stats (public endpoint)
 * GET /api/skill-training/stats
 */
export async function getActivityStats(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const stats = SkillTrainingService.getActivityStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting activity stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity stats'
    });
  }
}
