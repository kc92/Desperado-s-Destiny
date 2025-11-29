/**
 * Tournament Controller
 * API endpoints for PvP tournaments
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { TournamentService } from '../services/tournament.service';
import { TournamentType } from '../models/Tournament.model';
import { getAvailableActions } from '../services/deckGames';

/**
 * Create a new tournament (admin)
 * POST /api/tournaments
 */
export const createTournament = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      type,
      entryFee,
      maxParticipants,
      minParticipants,
      registrationMinutes
    } = req.body;

    if (!name || !maxParticipants) {
      res.status(400).json({
        success: false,
        error: 'Name and maxParticipants required'
      });
      return;
    }

    try {
      const tournament = await TournamentService.createTournament({
        name,
        type: type || TournamentType.SINGLE_ELIMINATION,
        entryFee: entryFee || 0,
        maxParticipants,
        minParticipants,
        registrationMinutes
      });

      res.status(201).json({
        success: true,
        data: {
          tournamentId: tournament._id,
          name: tournament.name,
          maxParticipants: tournament.maxParticipants,
          entryFee: tournament.entryFee,
          registrationEndsAt: tournament.registrationEndsAt
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Join a tournament
 * POST /api/tournaments/:tournamentId/join
 */
export const joinTournament = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { tournamentId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      const tournament = await TournamentService.joinTournament(
        tournamentId,
        characterId
      );

      res.json({
        success: true,
        data: {
          tournamentId: tournament._id,
          name: tournament.name,
          participants: tournament.participants.length,
          maxParticipants: tournament.maxParticipants
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Leave a tournament
 * POST /api/tournaments/:tournamentId/leave
 */
export const leaveTournament = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { tournamentId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      await TournamentService.leaveTournament(tournamentId, characterId);

      res.json({
        success: true,
        data: { message: 'Left tournament successfully' }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Start a tournament (admin/auto)
 * POST /api/tournaments/:tournamentId/start
 */
export const startTournament = asyncHandler(
  async (req: Request, res: Response) => {
    const { tournamentId } = req.params;

    try {
      const tournament = await TournamentService.startTournament(tournamentId);

      res.json({
        success: true,
        data: {
          tournamentId: tournament._id,
          status: tournament.status,
          participants: tournament.participants.length,
          totalRounds: tournament.totalRounds,
          currentRound: tournament.currentRound
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get tournament bracket
 * GET /api/tournaments/:tournamentId/bracket
 */
export const getTournamentBracket = asyncHandler(
  async (req: Request, res: Response) => {
    const { tournamentId } = req.params;

    try {
      const { tournament, bracket } = await TournamentService.getTournamentBracket(
        tournamentId
      );

      res.json({
        success: true,
        data: {
          tournament: {
            id: tournament._id,
            name: tournament.name,
            status: tournament.status,
            currentRound: tournament.currentRound,
            totalRounds: tournament.totalRounds,
            prizePool: tournament.prizePool,
            winnerId: tournament.winnerId,
            winnerName: tournament.winnerName
          },
          bracket
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get current match for player
 * GET /api/tournaments/:tournamentId/my-match
 */
export const getCurrentMatch = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { tournamentId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const match = await TournamentService.getCurrentMatch(
      tournamentId,
      characterId
    );

    if (!match) {
      res.json({
        success: true,
        data: null
      });
      return;
    }

    res.json({
      success: true,
      data: {
        matchId: match.matchId,
        round: match.round,
        status: match.status,
        opponentName:
          match.player1Id?.toString() === characterId
            ? match.player2Name
            : match.player1Name
      }
    });
  }
);

/**
 * Start tournament match game
 * POST /api/tournaments/:tournamentId/match/:matchId/start
 */
export const startMatch = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { tournamentId, matchId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      const gameState = await TournamentService.startTournamentMatch(
        tournamentId,
        matchId
      );

      // Get player's state
      const isPlayer1 = gameState.player1State.playerId === characterId;
      const playerState = isPlayer1
        ? gameState.player1State
        : gameState.player2State;

      res.json({
        success: true,
        data: {
          matchId,
          hand: playerState.hand,
          turnNumber: playerState.turnNumber,
          maxTurns: playerState.maxTurns,
          timeLimit: playerState.timeLimit,
          availableActions: getAvailableActions(playerState)
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * Play action in tournament match
 * POST /api/tournaments/:tournamentId/match/:matchId/play
 */
export const playMatchAction = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { matchId } = req.params;
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
      const result = await TournamentService.processTournamentAction(
        matchId,
        characterId,
        action
      );

      if (result.matchComplete) {
        res.json({
          success: true,
          data: {
            status: 'completed',
            hand: result.gameState.hand,
            matchResult: result.result
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
 * Get open tournaments
 * GET /api/tournaments/open
 */
export const getOpenTournaments = asyncHandler(
  async (req: Request, res: Response) => {
    const tournaments = await TournamentService.getOpenTournaments();

    res.json({
      success: true,
      data: tournaments.map(t => ({
        id: t._id,
        name: t.name,
        entryFee: t.entryFee,
        prizePool: t.prizePool,
        participants: t.participants.length,
        maxParticipants: t.maxParticipants,
        registrationEndsAt: t.registrationEndsAt
      }))
    });
  }
);

/**
 * Get active tournaments
 * GET /api/tournaments/active
 */
export const getActiveTournaments = asyncHandler(
  async (req: Request, res: Response) => {
    const tournaments = await TournamentService.getActiveTournaments();

    res.json({
      success: true,
      data: tournaments.map(t => ({
        id: t._id,
        name: t.name,
        prizePool: t.prizePool,
        participants: t.participants.length,
        currentRound: t.currentRound,
        totalRounds: t.totalRounds,
        startedAt: t.startedAt
      }))
    });
  }
);

/**
 * Get tournament history for character
 * GET /api/tournaments/history
 */
export const getTournamentHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const tournaments = await TournamentService.getTournamentHistory(
      characterId,
      limit
    );

    res.json({
      success: true,
      data: tournaments.map(t => {
        const participant = t.participants.find(
          p => p.characterId.toString() === characterId
        );
        return {
          id: t._id,
          name: t.name,
          placement: participant?.placement,
          prizePool: t.prizePool,
          participants: t.participants.length,
          completedAt: t.completedAt
        };
      })
    });
  }
);
