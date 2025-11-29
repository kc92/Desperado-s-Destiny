/**
 * Gambling Controller
 * Handles gambling game API endpoints for non-deck games
 * (Blackjack, Roulette, Craps, Faro, Three-Card Monte, Wheel of Fortune)
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as GamblingService from '../services/gambling.service';
import {
  GAMBLING_GAMES,
  GAMBLING_ITEMS,
  GAMBLING_LOCATIONS,
  getGamblingGameById,
  getGamesByType,
  getGamesAtLocation,
  getGamblingLocationById,
} from '../data/gamblingGames';
import { GamblingSession } from '../models/GamblingSession.model';
import { GamblingHistory } from '../models/GamblingHistory.model';

/**
 * Get all available gambling games
 * GET /api/gambling/games
 */
export const getGames = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { type, location } = req.query;

    let games = Object.values(GAMBLING_GAMES);

    // Filter by game type if specified
    if (type && typeof type === 'string') {
      games = games.filter((game) => game.gameType === type);
    }

    // Filter by location if specified
    if (location && typeof location === 'string') {
      games = games.filter((game) =>
        game.availableLocations.includes(location)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        games,
        total: games.length,
      },
    });
  }
);

/**
 * Get specific game details
 * GET /api/gambling/games/:gameId
 */
export const getGameDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { gameId } = req.params;

    const game = getGamblingGameById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
      });
    }

    // Check if character meets requirements
    let canPlay = true;
    let reason = '';
    if (req.character) {
      if (req.character.level < game.minimumLevel) {
        canPlay = false;
        reason = `Requires level ${game.minimumLevel}`;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        game,
        canPlay,
        reason,
      },
    });
  }
);

/**
 * Get all gambling locations
 * GET /api/gambling/locations
 */
export const getLocations = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const locations = Object.values(GAMBLING_LOCATIONS);

    res.status(200).json({
      success: true,
      data: {
        locations,
        total: locations.length,
      },
    });
  }
);

/**
 * Get specific location details
 * GET /api/gambling/locations/:locationId
 */
export const getLocationDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { locationId } = req.params;

    const location = getGamblingLocationById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    // Get available games at this location
    const availableGames = getGamesAtLocation(locationId);

    // Check access for character
    let canEnter = true;
    let accessDeniedReason = '';
    if (req.character && location.reputationRequired !== undefined) {
      // For underground locations, need criminal rep (negative)
      // For exclusive locations, need high rep (positive)
      const charRep = typeof req.character.reputation === 'number'
        ? req.character.reputation
        : 0;

      if (location.reputationRequired < 0 && charRep > location.reputationRequired) {
        canEnter = false;
        accessDeniedReason = 'You need a criminal reputation to enter here';
      } else if (location.reputationRequired > 0 && charRep < location.reputationRequired) {
        canEnter = false;
        accessDeniedReason = `Requires reputation of ${location.reputationRequired}`;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        location,
        availableGames,
        canEnter,
        accessDeniedReason,
      },
    });
  }
);

/**
 * Get gambling items catalog
 * GET /api/gambling/items
 */
export const getItems = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const items = Object.values(GAMBLING_ITEMS);

    res.status(200).json({
      success: true,
      data: {
        items,
        total: items.length,
      },
    });
  }
);

/**
 * Start a gambling session
 * POST /api/gambling/sessions
 */
export const startSession = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { gameId, location, initialBet, eventId } = req.body;

    if (!gameId || !location || initialBet === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Game ID, location, and initial bet are required',
      });
    }

    const session = await GamblingService.startGamblingSession(
      characterId,
      gameId,
      location,
      initialBet,
      eventId
    );

    res.status(201).json({
      success: true,
      data: session,
      message: 'Gambling session started! Good luck!',
    });
  }
);

/**
 * Get current active session
 * GET /api/gambling/sessions/current
 */
export const getCurrentSession = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const session = await GamblingSession.findActiveSessionByCharacter(characterId);

    if (!session) {
      return res.status(200).json({
        success: true,
        data: {
          session: null,
          hasActiveSession: false,
        },
      });
    }

    // Get game details
    const game = getGamblingGameById(session.gameId);

    res.status(200).json({
      success: true,
      data: {
        session,
        game,
        hasActiveSession: true,
      },
    });
  }
);

/**
 * Place a bet in active session
 * POST /api/gambling/sessions/:sessionId/bet
 */
export const placeBet = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { sessionId } = req.params;
    const { betAmount, betType, betDetails } = req.body;

    if (betAmount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Bet amount is required',
      });
    }

    const result = await GamblingService.makeBet(
      sessionId,
      characterId,
      betAmount,
      betType,
      betDetails
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * End gambling session
 * POST /api/gambling/sessions/:sessionId/end
 */
export const endSession = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { sessionId } = req.params;

    const session = await GamblingService.endGamblingSession(sessionId, characterId);

    res.status(200).json({
      success: true,
      data: session,
      message: session.netProfit >= 0
        ? `Session ended! You won ${session.netProfit} gold!`
        : `Session ended. You lost ${Math.abs(session.netProfit)} gold.`,
    });
  }
);

/**
 * Get character's gambling stats
 * GET /api/gambling/my-stats
 */
export const getMyStats = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const stats = await GamblingService.getGamblingStats(characterId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

/**
 * Get character's gambling history
 * GET /api/gambling/history
 */
export const getHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { limit = 20, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const sessions = await GamblingSession.find({
      characterId,
      status: 'COMPLETED',
    })
      .sort({ endTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await GamblingSession.countDocuments({
      characterId,
      status: 'COMPLETED',
    });

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

/**
 * Get gambling leaderboard
 * GET /api/gambling/leaderboard
 */
export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { metric = 'PROFIT', limit = 20 } = req.query;

    const validMetrics = ['PROFIT', 'WINS', 'SESSIONS', 'BIGGEST_WIN'] as const;
    const leaderboardMetric = validMetrics.includes(metric as any)
      ? (metric as 'PROFIT' | 'WINS' | 'SESSIONS' | 'BIGGEST_WIN')
      : 'PROFIT';

    const leaderboard = await GamblingService.getGamblingLeaderboard(
      leaderboardMetric,
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        metric: leaderboardMetric,
      },
    });
  }
);
