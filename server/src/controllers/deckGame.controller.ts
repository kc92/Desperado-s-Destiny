/**
 * Deck Game Controller
 * Handles deck mini-game sessions
 * Uses MongoDB for persistence to survive page refreshes and server restarts
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
import { DeckGameSession } from '../models/DeckGameSession.model';
import logger from '../utils/logger';

// In-memory cache for fast access (falls back to DB)
const gameCache = new Map<string, GameState>();

// Helper to get game from cache or DB
async function getGameState(gameId: string): Promise<GameState | null> {
  // Check cache first
  const cached = gameCache.get(gameId);
  if (cached) {
    return cached;
  }

  // Fall back to DB
  try {
    const session = await DeckGameSession.findOne({ sessionId: gameId });
    if (session) {
      const gameState = session.gameState as GameState;
      // Restore Date objects that may have been serialized
      if (gameState.startedAt && !(gameState.startedAt instanceof Date)) {
        gameState.startedAt = new Date(gameState.startedAt);
      }
      // Update cache
      gameCache.set(gameId, gameState);
      return gameState;
    }
  } catch (err) {
    logger.error('Failed to fetch deck game from DB', err as Error);
  }

  return null;
}

// Helper to save game to cache and DB
async function saveGameState(gameState: GameState, characterId: string): Promise<void> {
  // Update cache
  gameCache.set(gameState.gameId, gameState);

  // Persist to DB
  try {
    await DeckGameSession.findOneAndUpdate(
      { sessionId: gameState.gameId },
      {
        sessionId: gameState.gameId,
        characterId,
        gameType: gameState.gameType,
        context: 'action', // Default context
        gameState,
        startedAt: gameState.startedAt,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minute TTL
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    logger.error('Failed to save deck game to DB', err as Error);
  }
}

// Helper to delete game from cache and DB
async function deleteGame(gameId: string): Promise<void> {
  gameCache.delete(gameId);

  try {
    await DeckGameSession.deleteOne({ sessionId: gameId });
  } catch (err) {
    logger.error('Failed to delete deck game from DB', err as Error);
  }
}

// Cleanup functions (kept for backwards compatibility, but MongoDB TTL handles expiry)
function startDeckGameCleanup(): void {
  // MongoDB TTL index handles automatic cleanup
  // This function is kept for backwards compatibility
}

function stopDeckGameCleanup(): void {
  // No-op - MongoDB TTL handles cleanup
}

export { startDeckGameCleanup, stopDeckGameCleanup };

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

    // Store the game state in cache and DB
    await saveGameState(gameState, characterId);

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

    // Get game state from cache or DB
    const gameState = await getGameState(gameId);
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
      await deleteGame(gameId);

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
      await saveGameState(newState, characterId);

      // If game resolved, return result
      if (newState.status === 'resolved') {
        const result = resolveGame(newState);
        await deleteGame(gameId);

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
export const getGameStateEndpoint = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { gameId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const gameState = await getGameState(gameId);
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

    const gameState = await getGameState(gameId);
    if (!gameState) {
      res.status(404).json({ success: false, error: 'Game not found or expired' });
      return;
    }

    if (gameState.playerId !== characterId) {
      res.status(403).json({ success: false, error: 'Not your game' });
      return;
    }

    // Remove the game from cache and DB
    await deleteGame(gameId);

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
  getGameState: getGameStateEndpoint,
  forfeitGame
};
