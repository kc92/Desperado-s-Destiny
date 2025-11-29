/**
 * Deck Game Controller
 * Handles deck mini-game sessions
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  initGame,
  processAction,
  resolveGame,
  getGameTypeName,
  getAvailableActions,
  GameState,
  GameType,
  Suit,
  PlayerAction
} from '../services/deckGames';

// In-memory game state storage (use Redis in production)
const activeGames = new Map<string, GameState>();

// Clean up expired games every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [gameId, state] of activeGames) {
    const elapsed = now - state.startedAt.getTime();
    const maxTime = (state.timeLimit + 60) * 1000; // Extra minute buffer

    if (elapsed > maxTime) {
      activeGames.delete(gameId);
    }
  }
}, 5 * 60 * 1000);

/**
 * Start a new deck game
 * POST /api/deck/start
 */
export const startGame = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const {
      gameType,
      difficulty = 5,
      relevantSuit,
      timeLimit
    } = req.body as {
      gameType: GameType;
      difficulty?: number;
      relevantSuit?: Suit;
      timeLimit?: number;
    };

    if (!gameType) {
      res.status(400).json({ success: false, error: 'Game type required' });
      return;
    }

    // Validate game type
    const validTypes: GameType[] = ['pokerHoldDraw', 'pressYourLuck', 'blackjack', 'deckbuilder'];
    if (!validTypes.includes(gameType)) {
      res.status(400).json({ success: false, error: 'Invalid game type' });
      return;
    }

    // Initialize the game
    const gameState = initGame({
      gameType,
      playerId: characterId,
      difficulty: Math.max(1, Math.min(10, difficulty)),
      relevantSuit,
      timeLimit
    });

    // Store the game state
    activeGames.set(gameState.gameId, gameState);

    // Return initial state
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
        availableActions: getAvailableActions(gameState)
      }
    });
  }
);

/**
 * Process a player action
 * POST /api/deck/action
 */
export const gameAction = asyncHandler(
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

    // Get game state
    const gameState = activeGames.get(gameId);
    if (!gameState) {
      res.status(404).json({ success: false, error: 'Game not found or expired' });
      return;
    }

    // Verify player owns this game
    if (gameState.playerId !== characterId) {
      res.status(403).json({ success: false, error: 'Not your game' });
      return;
    }

    // Check if game is still active
    if (gameState.status !== 'waiting_action') {
      res.status(400).json({ success: false, error: 'Game is not waiting for action' });
      return;
    }

    // Check time limit
    const elapsed = (Date.now() - gameState.startedAt.getTime()) / 1000;
    if (elapsed > gameState.timeLimit) {
      // Auto-resolve on timeout
      const result = resolveGame(gameState);
      activeGames.delete(gameId);

      res.json({
        success: true,
        data: {
          status: 'timeout',
          result,
          message: 'Time expired - game auto-resolved'
        }
      });
      return;
    }

    try {
      // Process the action
      const newState = processAction(gameState, action);
      activeGames.set(gameId, newState);

      // If game resolved, return result
      if (newState.status === 'resolved') {
        const result = resolveGame(newState);
        activeGames.delete(gameId);

        res.json({
          success: true,
          data: {
            status: 'resolved',
            hand: newState.hand,
            result
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
 * GET /api/deck/:gameId
 */
export const getGameState = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { gameId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const gameState = activeGames.get(gameId);
    if (!gameState) {
      res.status(404).json({ success: false, error: 'Game not found or expired' });
      return;
    }

    if (gameState.playerId !== characterId) {
      res.status(403).json({ success: false, error: 'Not your game' });
      return;
    }

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
        availableActions: getAvailableActions(gameState)
      }
    });
  }
);

/**
 * Forfeit/abandon a game
 * POST /api/deck/:gameId/forfeit
 */
export const forfeitGame = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { gameId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const gameState = activeGames.get(gameId);
    if (!gameState) {
      res.status(404).json({ success: false, error: 'Game not found or expired' });
      return;
    }

    if (gameState.playerId !== characterId) {
      res.status(403).json({ success: false, error: 'Not your game' });
      return;
    }

    // Remove the game
    activeGames.delete(gameId);

    res.json({
      success: true,
      data: {
        status: 'forfeited',
        message: 'Game abandoned'
      }
    });
  }
);

export default {
  startGame,
  gameAction,
  getGameState,
  forfeitGame
};
