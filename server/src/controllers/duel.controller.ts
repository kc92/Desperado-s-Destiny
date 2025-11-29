/**
 * Duel Controller
 * API endpoints for PvP deck game challenges
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { DuelService } from '../services/duel.service';
import { DuelType } from '../models/Duel.model';
import { getAvailableActions } from '../services/deckGames';

/**
 * Challenge another player to a duel
 * POST /api/duels/challenge
 */
export const challengePlayer = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const { targetId, type, wagerAmount } = req.body;

    if (!targetId) {
      res.status(400).json({ success: false, error: 'Target character ID required' });
      return;
    }

    try {
      const duel = await DuelService.createChallenge(
        characterId,
        targetId,
        type || DuelType.CASUAL,
        wagerAmount || 0
      );

      res.status(201).json({
        success: true,
        data: {
          duelId: duel._id,
          challengedName: duel.challengedName,
          type: duel.type,
          wagerAmount: duel.wagerAmount,
          expiresAt: duel.expiresAt
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Accept a duel challenge
 * POST /api/duels/:duelId/accept
 */
export const acceptDuel = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { duelId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      const duel = await DuelService.acceptChallenge(duelId, characterId);

      // Auto-start the game
      const gameState = await DuelService.startDuelGame(duelId);
      const playerState = DuelService.getDuelGameState(duelId, characterId);

      res.json({
        success: true,
        data: {
          duelId: duel._id,
          status: duel.status,
          opponent: duel.challengerName,
          gameState: playerState ? {
            hand: playerState.hand,
            turnNumber: playerState.turnNumber,
            maxTurns: playerState.maxTurns,
            timeLimit: playerState.timeLimit,
            availableActions: getAvailableActions(playerState)
          } : null
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Decline a duel challenge
 * POST /api/duels/:duelId/decline
 */
export const declineDuel = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { duelId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      await DuelService.declineChallenge(duelId, characterId);

      res.json({
        success: true,
        data: { message: 'Challenge declined' }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Cancel a duel challenge (by challenger)
 * POST /api/duels/:duelId/cancel
 */
export const cancelDuel = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { duelId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      await DuelService.cancelChallenge(duelId, characterId);

      res.json({
        success: true,
        data: { message: 'Challenge cancelled' }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get game state for an active duel
 * GET /api/duels/:duelId/game
 */
export const getDuelGame = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { duelId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const gameState = DuelService.getDuelGameState(duelId, characterId);

    if (!gameState) {
      res.status(404).json({ success: false, error: 'Duel game not found' });
      return;
    }

    const elapsed = (Date.now() - gameState.startedAt.getTime()) / 1000;
    const timeRemaining = Math.max(0, gameState.timeLimit - elapsed);

    res.json({
      success: true,
      data: {
        gameId: gameState.gameId,
        status: gameState.status,
        hand: gameState.hand,
        turnNumber: gameState.turnNumber,
        maxTurns: gameState.maxTurns,
        timeRemaining: Math.round(timeRemaining),
        availableActions: getAvailableActions(gameState)
      }
    });
  }
);

/**
 * Play a card action in the duel
 * POST /api/duels/:duelId/play
 */
export const playDuelAction = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { duelId } = req.params;
    const { action } = req.body;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    if (!action) {
      res.status(400).json({ success: false, error: 'Action required' });
      return;
    }

    try {
      const result = await DuelService.processDuelAction(duelId, characterId, action);

      if (result.duelComplete) {
        res.json({
          success: true,
          data: {
            status: 'completed',
            hand: result.gameState.hand,
            duelResult: result.result
          }
        });
      } else if (result.isResolved) {
        res.json({
          success: true,
          data: {
            status: 'waiting_opponent',
            hand: result.gameState.hand,
            message: 'Waiting for opponent to finish'
          }
        });
      } else {
        res.json({
          success: true,
          data: {
            status: 'continue',
            hand: result.gameState.hand,
            turnNumber: result.gameState.turnNumber,
            availableActions: getAvailableActions(result.gameState)
          }
        });
      }
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get pending challenges for the character
 * GET /api/duels/pending
 */
export const getPendingChallenges = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const challenges = await DuelService.getPendingChallenges(characterId);

    res.json({
      success: true,
      data: challenges.map(c => ({
        duelId: c._id,
        challengerName: c.challengerName,
        type: c.type,
        wagerAmount: c.wagerAmount,
        expiresAt: c.expiresAt
      }))
    });
  }
);

/**
 * Get active duels for the character
 * GET /api/duels/active
 */
export const getActiveDuels = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const duels = await DuelService.getActiveDuels(characterId);

    res.json({
      success: true,
      data: duels.map(d => ({
        duelId: d._id,
        challengerName: d.challengerName,
        challengedName: d.challengedName,
        isChallenger: d.challengerId.toString() === characterId,
        status: d.status,
        type: d.type,
        wagerAmount: d.wagerAmount,
        expiresAt: d.expiresAt
      }))
    });
  }
);

/**
 * Get duel history for the character
 * GET /api/duels/history
 */
export const getDuelHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const history = await DuelService.getDuelHistory(characterId, limit);

    res.json({
      success: true,
      data: history.map(d => ({
        duelId: d._id,
        opponentName: d.challengerId.toString() === characterId
          ? d.challengedName
          : d.challengerName,
        won: d.winnerId?.toString() === characterId,
        type: d.type,
        wagerAmount: d.wagerAmount,
        myScore: d.challengerId.toString() === characterId
          ? d.challengerScore
          : d.challengedScore,
        opponentScore: d.challengerId.toString() === characterId
          ? d.challengedScore
          : d.challengerScore,
        myHand: d.challengerId.toString() === characterId
          ? d.challengerHandName
          : d.challengedHandName,
        opponentHand: d.challengerId.toString() === characterId
          ? d.challengedHandName
          : d.challengerHandName,
        completedAt: d.completedAt
      }))
    });
  }
);

/**
 * Get duel statistics for the character
 * GET /api/duels/stats
 */
export const getDuelStats = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const stats = await DuelService.getDuelStats(characterId);

    res.json({
      success: true,
      data: stats
    });
  }
);
