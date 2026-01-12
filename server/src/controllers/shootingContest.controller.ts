/**
 * Shooting Contest Controller
 * Handles shooting contest API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ShootingContestService } from '../services/shootingContest.service';
import { ShootingContest } from '../models/ShootingContest.model';
import { ShootingRecord } from '../models/ShootingRecord.model';
import { CONTEST_TEMPLATES } from '../data/shootingContests';

/**
 * Get all active contests
 * GET /api/shooting/contests
 */
export const getActiveContests = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { status = 'registration', limit = 20 } = req.query;

    const contests = await ShootingContest.find({
      status: { $in: status === 'all' ? ['registration', 'ready', 'in_progress'] : [status] },
      scheduledStart: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    })
      .sort({ scheduledStart: 1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        contests,
        totalActive: contests.length,
      },
    });
  }
);

/**
 * Get contest templates
 * GET /api/shooting/templates
 */
export const getContestTemplates = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const templates = Object.values(CONTEST_TEMPLATES);

    res.status(200).json({
      success: true,
      data: {
        templates,
        total: templates.length,
      },
    });
  }
);

/**
 * Get specific contest details
 * GET /api/shooting/contests/:contestId
 */
export const getContestDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { contestId } = req.params;

    const contest = await ShootingContest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    // Check if character is registered
    let isRegistered = false;
    if (req.character) {
      isRegistered = contest.registeredShooters.some(
        (s) => s.characterId.toString() === req.character!._id.toString()
      );
    }

    res.status(200).json({
      success: true,
      data: {
        contest,
        isRegistered,
        canRegister: req.character ? contest.canRegister(req.character._id.toString()) : false,
      },
    });
  }
);

/**
 * Register for a contest
 * POST /api/shooting/contests/:contestId/register
 */
export const registerForContest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contestId } = req.params;
    const { weapon } = req.body;

    if (!weapon) {
      return res.status(400).json({
        success: false,
        error: 'Weapon selection is required',
      });
    }

    const contest = await ShootingContestService.registerForContest(
      contestId,
      characterId,
      weapon
    );

    res.status(200).json({
      success: true,
      data: contest,
      message: 'Successfully registered for the contest!',
    });
  }
);

/**
 * Take a shot in current round
 * POST /api/shooting/contests/:contestId/shoot
 */
export const takeShot = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { contestId } = req.params;
    const { targetIndex } = req.body;

    const result = await ShootingContestService.shoot(
      contestId,
      characterId,
      targetIndex !== undefined ? String(targetIndex) : '0'
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Get shooting leaderboard
 * GET /api/shooting/leaderboard
 */
export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { type = 'wins', limit = 20 } = req.query;

    // Map query param to valid leaderboard type
    const validTypes = ['wins', 'money', 'contest_type'] as const;
    const leaderboardType = validTypes.includes(type as any) ? type as 'wins' | 'money' | 'contest_type' : 'wins';

    const leaderboard = await ShootingContestService.getLeaderboard(
      leaderboardType,
      undefined, // contestType (optional)
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        type,
      },
    });
  }
);

/**
 * Get character's shooting record
 * GET /api/shooting/my-record
 */
export const getMyRecord = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const record = await ShootingRecord.findOne({ characterId });

    if (!record) {
      return res.status(200).json({
        success: true,
        data: {
          record: null,
          message: 'No shooting record found. Join a contest to start building your record!',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { record },
    });
  }
);

/**
 * Get upcoming contests for character
 * GET /api/shooting/my-contests
 */
export const getMyContests = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;

    // Limit to prevent OOM - a character shouldn't be in more than 50 active contests
    const contests = await ShootingContest.find({
      'registeredShooters.characterId': characterId,
      status: { $in: ['registration', 'ready', 'in_progress'] },
    })
      .sort({ scheduledStart: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        contests,
        total: contests.length,
      },
    });
  }
);

/**
 * Get contest history for character
 * GET /api/shooting/history
 */
export const getContestHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;
    const { limit = 20, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const contests = await ShootingContest.find({
      'registeredShooters.characterId': characterId,
      status: 'completed',
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ShootingContest.countDocuments({
      'registeredShooters.characterId': characterId,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      data: {
        contests,
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
 * Create a new contest (admin/scheduled)
 * POST /api/shooting/contests
 */
export const createContest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { templateId, scheduledStart } = req.body;

    if (!templateId || !scheduledStart) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and scheduled start time are required',
      });
    }

    const contest = await ShootingContestService.createContest(
      templateId,
      new Date(scheduledStart)
    );

    res.status(201).json({
      success: true,
      data: contest,
      message: 'Contest created successfully!',
    });
  }
);
