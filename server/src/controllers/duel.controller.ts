/**
 * Duel Controller
 * API endpoints for PvP deck game challenges
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { DuelService } from '../services/duel.service';
import { DuelType } from '../models/Duel.model';
import { Character } from '../models/Character.model';
import { getAvailableActions } from '../services/deckGames';
import { sanitizeErrorMessage } from '../utils/errors';
import { DUEL_CONSTANTS } from '@desperados/shared';

/**
 * Calculate maximum wager for a character
 * BALANCE FIX: Dynamic wager limits based on level and wealth
 *
 * @param level - Character level
 * @param gold - Character gold
 * @returns Maximum allowed wager
 */
function calculateMaxWager(level: number, gold: number): number {
  const { WAGER_LIMITS, MAX_WAGER } = DUEL_CONSTANTS;

  // Three constraints: level-based, wealth-based, and absolute cap
  const levelCap = level * WAGER_LIMITS.PER_LEVEL_MULTIPLIER;
  const goldCap = Math.floor(gold * WAGER_LIMITS.MAX_GOLD_PERCENT);
  const absoluteCap = MAX_WAGER;

  return Math.min(levelCap, goldCap, absoluteCap);
}

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
      // BALANCE FIX: Validate wager limits before creating challenge
      const wager = wagerAmount || 0;

      if (wager > 0) {
        // Get both characters for validation
        const challenger = await Character.findById(characterId);
        const target = await Character.findById(targetId);

        if (!challenger || !target) {
          res.status(400).json({ success: false, error: 'Character not found' });
          return;
        }

        // Check level difference for wagered duels
        const { WAGER_LIMITS } = DUEL_CONSTANTS;
        const levelDiff = Math.abs(challenger.level - target.level);
        if (levelDiff > WAGER_LIMITS.MAX_LEVEL_DIFFERENCE) {
          res.status(400).json({
            success: false,
            error: `Wagered duels require characters within ${WAGER_LIMITS.MAX_LEVEL_DIFFERENCE} levels of each other. Level difference: ${levelDiff}`
          });
          return;
        }

        // Check minimum wager
        if (wager < WAGER_LIMITS.ABSOLUTE_MIN) {
          res.status(400).json({
            success: false,
            error: `Minimum wager is $${WAGER_LIMITS.ABSOLUTE_MIN}`
          });
          return;
        }

        // Check maximum wager based on challenger's level and gold
        const maxWager = calculateMaxWager(challenger.level, challenger.gold);
        if (wager > maxWager) {
          res.status(400).json({
            success: false,
            error: `Maximum wager for your level is $${maxWager}. Requested: $${wager}`
          });
          return;
        }

        // Also check if target can afford the wager
        const targetMaxWager = calculateMaxWager(target.level, target.gold);
        if (wager > targetMaxWager) {
          res.status(400).json({
            success: false,
            error: `Target cannot afford this wager amount (their max: ${targetMaxWager})`
          });
          return;
        }
      }

      const duel = await DuelService.createChallenge(
        characterId,
        targetId,
        type || DuelType.CASUAL,
        wager
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
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
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
      const playerState = await DuelService.getDuelGameState(duelId, characterId);

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
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
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
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
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
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
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

    const gameState = await DuelService.getDuelGameState(duelId, characterId);

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
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
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
