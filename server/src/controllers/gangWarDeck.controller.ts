/**
 * Gang War Deck Controller
 * API endpoints for deck game integration with gang wars
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { GangWarDeckService } from '../services/gangWarDeck.service';
import { getAvailableActions } from '../services/deckGames';

/**
 * Start a raid mission
 * POST /api/wars/:warId/raid/start
 */
export const startRaid = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { warId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      const { raidId, gameState } = await GangWarDeckService.startRaid(
        warId,
        characterId
      );

      res.json({
        success: true,
        data: {
          raidId,
          hand: gameState.hand,
          turnNumber: gameState.turnNumber,
          maxTurns: gameState.maxTurns,
          timeLimit: gameState.timeLimit,
          relevantSuit: gameState.relevantSuit,
          availableActions: getAvailableActions(gameState)
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Process raid action
 * POST /api/wars/:warId/raid/:raidId/play
 */
export const playRaidAction = asyncHandler(
  async (req: Request, res: Response) => {
    const { raidId } = req.params;
    const { action } = req.body;

    if (!action) {
      res.status(400).json({ success: false, error: 'Action required' });
      return;
    }

    try {
      const result = await GangWarDeckService.processRaidAction(raidId, action);

      if (result.isResolved) {
        res.json({
          success: true,
          data: {
            status: 'completed',
            hand: result.gameState.hand,
            raidResult: result.raidResult
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
 * Get raid game state
 * GET /api/wars/:warId/raid/:raidId
 */
export const getRaidState = asyncHandler(
  async (req: Request, res: Response) => {
    const { raidId } = req.params;

    const raid = await GangWarDeckService.getRaidGameState(raidId);

    if (!raid) {
      res.status(404).json({ success: false, error: 'Raid not found' });
      return;
    }

    const elapsed = (Date.now() - raid.gameState.startedAt.getTime()) / 1000;
    const timeRemaining = Math.max(0, raid.gameState.timeLimit - elapsed);

    res.json({
      success: true,
      data: {
        raidId,
        side: raid.side,
        hand: raid.gameState.hand,
        turnNumber: raid.gameState.turnNumber,
        timeRemaining: Math.round(timeRemaining),
        availableActions: getAvailableActions(raid.gameState)
      }
    });
  }
);

/**
 * Start champion duel
 * POST /api/wars/:warId/champion/start
 */
export const startChampionDuel = asyncHandler(
  async (req: Request, res: Response) => {
    const { warId } = req.params;
    const { attackerChampionId, defenderChampionId } = req.body;

    if (!attackerChampionId || !defenderChampionId) {
      res.status(400).json({
        success: false,
        error: 'Both champion IDs required'
      });
      return;
    }

    try {
      const duel = await GangWarDeckService.startChampionDuel(
        warId,
        attackerChampionId,
        defenderChampionId
      );

      res.json({
        success: true,
        data: {
          warId,
          status: 'started',
          message: 'Champion duel started'
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get champion duel game state
 * GET /api/wars/:warId/champion/game
 */
export const getChampionDuelState = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { warId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const duel = await GangWarDeckService.getChampionDuelState(warId);

    if (!duel) {
      res.status(404).json({ success: false, error: 'Champion duel not found' });
      return;
    }

    // Determine which player
    const isAttacker = duel.attackerChampionId === characterId;
    const isDefender = duel.defenderChampionId === characterId;

    if (!isAttacker && !isDefender) {
      res.status(403).json({ success: false, error: 'Not a champion in this duel' });
      return;
    }

    const state = isAttacker ? duel.attackerState : duel.defenderState;
    const isResolved = isAttacker ? duel.attackerResolved : duel.defenderResolved;

    res.json({
      success: true,
      data: {
        warId,
        role: isAttacker ? 'attacker' : 'defender',
        hand: state.hand,
        turnNumber: state.turnNumber,
        status: isResolved ? 'waiting_opponent' : state.status,
        availableActions: isResolved ? [] : getAvailableActions(state)
      }
    });
  }
);

/**
 * Play champion duel action
 * POST /api/wars/:warId/champion/play
 */
export const playChampionAction = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { warId } = req.params;
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
      const result = await GangWarDeckService.processChampionAction(
        warId,
        characterId,
        action
      );

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
            hand: result.gameState.hand
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
 * Start leader showdown
 * POST /api/wars/:warId/showdown/start
 */
export const startShowdown = asyncHandler(
  async (req: Request, res: Response) => {
    const { warId } = req.params;

    try {
      await GangWarDeckService.startLeaderShowdown(warId);

      res.json({
        success: true,
        data: {
          warId,
          status: 'started',
          message: 'Leader showdown started'
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get showdown game state
 * GET /api/wars/:warId/showdown/game
 */
export const getShowdownState = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { warId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const showdown = await GangWarDeckService.getLeaderShowdownState(warId);

    if (!showdown) {
      res.status(404).json({ success: false, error: 'Showdown not found' });
      return;
    }

    const isAttacker = showdown.attackerLeaderId === characterId;
    const isDefender = showdown.defenderLeaderId === characterId;

    if (!isAttacker && !isDefender) {
      res.status(403).json({ success: false, error: 'Not a leader in this showdown' });
      return;
    }

    const state = isAttacker ? showdown.attackerState : showdown.defenderState;
    const isResolved = isAttacker ? showdown.attackerResolved : showdown.defenderResolved;

    res.json({
      success: true,
      data: {
        warId,
        role: isAttacker ? 'attacker' : 'defender',
        hand: state.hand,
        turnNumber: state.turnNumber,
        status: isResolved ? 'waiting_opponent' : state.status,
        availableActions: isResolved ? [] : getAvailableActions(state)
      }
    });
  }
);

/**
 * Play showdown action
 * POST /api/wars/:warId/showdown/play
 */
export const playShowdownAction = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { warId } = req.params;
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
      const result = await GangWarDeckService.processShowdownAction(
        warId,
        characterId,
        action
      );

      if (result.showdownComplete) {
        res.json({
          success: true,
          data: {
            status: 'completed',
            hand: result.gameState.hand,
            showdownResult: result.result
          }
        });
      } else if (result.isResolved) {
        res.json({
          success: true,
          data: {
            status: 'waiting_opponent',
            hand: result.gameState.hand
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
