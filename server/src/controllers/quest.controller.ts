/**
 * Quest Controller
 * Handles quest API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { QuestService } from '../services/quest.service';
import { QuestDefinition } from '../models/Quest.model';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get available quests for character
 * GET /api/quests/available
 */
export const getAvailableQuests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const quests = await QuestService.getAvailableQuests(characterId);

    res.status(200).json({
      success: true,
      data: { quests }
    });
  }
);

/**
 * Get character's active quests
 * GET /api/quests/active
 */
export const getActiveQuests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const quests = await QuestService.getActiveQuests(characterId);

    // Get definitions for each quest
    const questsWithDefs = await Promise.all(
      quests.map(async (quest) => {
        const definition = await QuestDefinition.findOne({ questId: quest.questId });
        return {
          ...quest.toObject(),
          definition
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { quests: questsWithDefs }
    });
  }
);

/**
 * Get character's completed quests
 * GET /api/quests/completed
 */
export const getCompletedQuests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const quests = await QuestService.getCompletedQuests(characterId);

    res.status(200).json({
      success: true,
      data: { quests }
    });
  }
);

/**
 * Accept a quest
 * POST /api/quests/accept
 */
export const acceptQuest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { questId } = req.body;

    if (!questId) {
      return res.status(400).json({
        success: false,
        error: 'questId is required'
      });
    }

    const quest = await QuestService.acceptQuest(characterId, questId);
    const definition = await QuestDefinition.findOne({ questId });

    res.status(200).json({
      success: true,
      data: {
        message: `Quest accepted: ${definition?.name}`,
        quest,
        definition
      }
    });
  }
);

/**
 * Abandon a quest
 * POST /api/quests/abandon
 */
export const abandonQuest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { questId } = req.body;

    if (!questId) {
      return res.status(400).json({
        success: false,
        error: 'questId is required'
      });
    }

    await QuestService.abandonQuest(characterId, questId);

    res.status(200).json({
      success: true,
      data: {
        message: 'Quest abandoned'
      }
    });
  }
);

/**
 * Get quest details
 * GET /api/quests/:questId
 */
export const getQuestDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { questId } = req.params;

    const { quest, definition } = await QuestService.getQuestDetails(characterId, questId);

    res.status(200).json({
      success: true,
      data: { quest, definition }
    });
  }
);
