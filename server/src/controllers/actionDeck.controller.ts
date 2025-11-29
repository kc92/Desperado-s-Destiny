/**
 * Action-Deck Controller
 * Handles interactive deck-based action challenges
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  startActionWithDeck,
  processGameAction,
  resolveActionGame,
  getGameState,
  getPendingAction,
  cancelAction,
  isGameResolved
} from '../services/actionDeck.service';
import { getGameTypeName, getAvailableActions, PlayerAction } from '../services/deckGames';

/**
 * Start an action with interactive deck game
 * POST /api/actions/start
 */
export const startAction = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = (req as any).characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const { actionId } = req.body;

    if (!actionId) {
      res.status(400).json({ success: false, error: 'Action ID required' });
      return;
    }

    try {
      const { gameState, actionInfo } = await startActionWithDeck(characterId, actionId);

      res.json({
        success: true,
        data: {
          gameId: gameState.gameId,
          gameType: gameState.gameType,
          gameTypeName: getGameTypeName(gameState.gameType),
          hand: gameState.hand,
          turnNumber: gameState.turnNumber,
          maxTurns: gameState.maxTurns,
          timeLimit: gameState.timeLimit,
          relevantSuit: gameState.relevantSuit,
          difficulty: gameState.difficulty,
          availableActions: getAvailableActions(gameState),
          action: actionInfo
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Process player action in the deck game
 * POST /api/actions/play
 */
export const playAction = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const { gameId, action } = req.body as {
      gameId: string;
      action: PlayerAction;
    };

    if (!gameId || !action) {
      res.status(400).json({ success: false, error: 'Game ID and action required' });
      return;
    }

    // Verify ownership
    const gameState = getGameState(gameId);
    if (!gameState) {
      res.status(404).json({ success: false, error: 'Game not found or expired' });
      return;
    }

    if (gameState.playerId !== characterId) {
      res.status(403).json({ success: false, error: 'Not your game' });
      return;
    }

    try {
      const newState = processGameAction(gameId, action);

      // If game is resolved (or busted), auto-apply action results
      if (newState.status === 'resolved' || newState.status === 'busted') {
        const { gameResult, actionResult } = await resolveActionGame(gameId);

        res.json({
          success: true,
          data: {
            status: 'resolved',
            hand: newState.hand,
            gameResult: {
              success: gameResult.success,
              handName: gameResult.handName,
              score: gameResult.score,
              suitMatches: gameResult.suitMatches,
              suitBonus: gameResult.suitBonus,
              mitigation: gameResult.mitigation
            },
            actionResult
          }
        });
        return;
      }

      // Game continues
      res.json({
        success: true,
        data: {
          status: 'continue',
          hand: newState.hand,
          turnNumber: newState.turnNumber,
          availableActions: getAvailableActions(newState)
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get current game state
 * GET /api/actions/game/:gameId
 */
export const getActionGame = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { gameId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const gameState = getGameState(gameId);
    if (!gameState) {
      res.status(404).json({ success: false, error: 'Game not found or expired' });
      return;
    }

    if (gameState.playerId !== characterId) {
      res.status(403).json({ success: false, error: 'Not your game' });
      return;
    }

    const pendingAction = getPendingAction(gameId);
    const elapsed = (Date.now() - gameState.startedAt.getTime()) / 1000;
    const timeRemaining = Math.max(0, gameState.timeLimit - elapsed);

    res.json({
      success: true,
      data: {
        gameId: gameState.gameId,
        gameType: gameState.gameType,
        gameTypeName: getGameTypeName(gameState.gameType),
        status: gameState.status,
        hand: gameState.hand,
        turnNumber: gameState.turnNumber,
        maxTurns: gameState.maxTurns,
        timeRemaining: Math.round(timeRemaining),
        relevantSuit: gameState.relevantSuit,
        difficulty: gameState.difficulty,
        availableActions: getAvailableActions(gameState),
        action: pendingAction ? {
          name: pendingAction.action.name,
          type: pendingAction.action.type
        } : null
      }
    });
  }
);

/**
 * Forfeit/cancel an action game
 * POST /api/actions/game/:gameId/forfeit
 */
export const forfeitActionGame = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { gameId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const gameState = getGameState(gameId);
    if (!gameState) {
      res.status(404).json({ success: false, error: 'Game not found or expired' });
      return;
    }

    if (gameState.playerId !== characterId) {
      res.status(403).json({ success: false, error: 'Not your game' });
      return;
    }

    cancelAction(gameId);

    res.json({
      success: true,
      data: {
        status: 'forfeited',
        message: 'Action cancelled. No energy spent.'
      }
    });
  }
);

export default {
  startAction,
  playAction,
  getActionGame,
  forfeitActionGame
};
