/**
 * Racing Controller
 * Handles horse racing API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { ObjectId } from 'mongodb';
import * as horseRacingService from '../services/horseRacing.service';
import {
  PRESTIGIOUS_EVENTS,
  getUpcomingEvents,
  checkEventQualification,
  getPrestigiousEvent,
  RACING_TROPHIES,
} from '../data/raceTemplates';
import { Horse } from '../models/Horse.model';
import { HorseRace } from '../models/HorseRace.model';
import { calculateBondMultiplier } from '../services/horseBond.service';
import { HorseSkill } from '@desperados/shared';

/**
 * Get all upcoming races
 * GET /api/racing/races
 */
export const getRaces = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Get upcoming prestigious events
    const prestigiousEvents = getUpcomingEvents();

    // Get regular scheduled races from database
    const scheduledRaces = await HorseRace.find({
      status: { $in: ['upcoming', 'open'] },
      startTime: { $gte: new Date() },
    })
      .sort({ startTime: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        prestigiousEvents,
        scheduledRaces,
        totalUpcoming: prestigiousEvents.length + scheduledRaces.length,
      },
    });
  }
);

/**
 * Get specific race details
 * GET /api/racing/races/:raceId
 */
export const getRaceDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { raceId } = req.params;

    // Check if it's a prestigious event
    const prestigiousEvent = getPrestigiousEvent(raceId);
    if (prestigiousEvent) {
      // Check if character qualifies
      let qualification = null;
      if (req.character) {
        // Get reputation as a number (handle different rep formats)
        let repValue = 0;
        if (typeof req.character.reputation === 'number') {
          repValue = req.character.reputation;
        } else if (req.character.reputation && typeof req.character.reputation === 'object') {
          // Sum faction reps or use total
          const rep = req.character.reputation as { outlaws?: number; coalition?: number; settlers?: number };
          repValue = (rep.outlaws || 0) + (rep.coalition || 0) + (rep.settlers || 0);
        }
        // Use Total Level for event qualification (divided by 10 for backward compat)
        const effectiveLevel = Math.floor((req.character.totalLevel || 30) / 10);
        qualification = checkEventQualification(
          prestigiousEvent,
          effectiveLevel,
          repValue,
          0 // TODO: Get actual race wins
        );
      }

      return res.status(200).json({
        success: true,
        data: {
          event: prestigiousEvent,
          qualification,
          isPrestigious: true,
        },
      });
    }

    // Check regular races
    const race = await HorseRace.findById(raceId);
    if (!race) {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        race,
        isPrestigious: false,
      },
    });
  }
);

/**
 * Get all prestigious events
 * GET /api/racing/events
 */
export const getPrestigiousEvents = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const events = Object.values(PRESTIGIOUS_EVENTS);
    const upcoming = getUpcomingEvents();

    res.status(200).json({
      success: true,
      data: {
        events,
        upcoming,
        trophies: RACING_TROPHIES,
      },
    });
  }
);

/**
 * Enter a race
 * POST /api/racing/races/:raceId/enter
 */
export const enterRace = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;
    const { raceId } = req.params;
    const { horseId } = req.body;

    if (!horseId) {
      return res.status(400).json({
        success: false,
        error: 'Horse ID is required',
      });
    }

    // Verify horse ownership
    const horse = await Horse.findOne({
      _id: horseId,
      ownerId: characterId,
    });

    if (!horse) {
      return res.status(404).json({
        success: false,
        error: 'Horse not found or not owned by you',
      });
    }

    const result = await horseRacingService.enterRace(
      new ObjectId(characterId.toString()),
      new ObjectId(horseId),
      new ObjectId(raceId)
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Successfully entered the race!',
    });
  }
);

/**
 * Place a bet on a race
 * POST /api/racing/races/:raceId/bet
 */
export const placeBet = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;
    const { raceId } = req.params;
    const { horseId, amount, betType = 'win' } = req.body;

    if (!horseId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Horse ID and bet amount are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Bet amount must be positive',
      });
    }

    // Check character has enough gold
    if (req.character!.gold < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds for this bet',
      });
    }

    // TODO: Implement full betting via raceBetting.service
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      data: {
        betId: new ObjectId().toString(),
        raceId,
        horseId,
        amount,
        betType,
        odds: 2.5, // Placeholder odds
        potentialWinnings: Math.floor(amount * 2.5),
      },
      message: 'Bet placed successfully!',
    });
  }
);

/**
 * Get character's horses eligible for racing
 * GET /api/racing/my-horses
 */
export const getMyRaceHorses = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;

    // Limit to prevent OOM - a character shouldn't own more than 50 horses
    const horses = await Horse.find({
      ownerId: characterId,
    })
      .select('name breed stats condition history bond')
      .limit(50);

    // Filter to horses in good condition for racing
    const eligibleHorses = horses.filter((horse) => {
      const staminaPercent =
        horse.condition.currentStamina / horse.stats.stamina;
      const healthPercent = horse.condition.currentHealth / horse.stats.health;
      return staminaPercent >= 0.7 && healthPercent >= 0.8;
    });

    const ineligibleHorses = horses.filter((horse) => {
      const staminaPercent =
        horse.condition.currentStamina / horse.stats.stamina;
      const healthPercent = horse.condition.currentHealth / horse.stats.health;
      return staminaPercent < 0.7 || healthPercent < 0.8;
    });

    res.status(200).json({
      success: true,
      data: {
        eligible: eligibleHorses,
        ineligible: ineligibleHorses.map((horse) => ({
          ...horse.toObject(),
          reason:
            horse.condition.currentStamina / horse.stats.stamina < 0.7
              ? 'Too tired to race'
              : 'Injured - needs rest',
        })),
        totalHorses: horses.length,
      },
    });
  }
);

/**
 * Get race history for character
 * GET /api/racing/history
 */
export const getRaceHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;
    const { limit = 20, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const raceHistory = await HorseRace.find({
      'participants.characterId': characterId,
      status: 'completed',
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalRaces = await HorseRace.countDocuments({
      'participants.characterId': characterId,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      data: {
        races: raceHistory,
        pagination: {
          total: totalRaces,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalRaces / Number(limit)),
        },
      },
    });
  }
);

/**
 * Get racing leaderboard
 * GET /api/racing/leaderboard
 */
export const getRacingLeaderboard = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { type = 'wins', limit = 20 } = req.query;

    // Aggregate top racers based on wins
    const leaderboard = await Horse.aggregate([
      {
        $group: {
          _id: '$ownerId',
          totalWins: { $sum: '$history.racesWon' },
          totalRaces: { $sum: '$history.racesEntered' },
          bestHorse: { $first: '$name' },
        },
      },
      { $sort: { totalWins: -1 } },
      { $limit: Number(limit) },
    ]);

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
 * Get betting odds for a race
 * GET /api/racing/races/:raceId/odds
 */
export const getRaceOdds = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { raceId } = req.params;

    const race = await HorseRace.findById(raceId);
    if (!race) {
      return res.status(404).json({
        success: false,
        error: 'Race not found',
      });
    }

    // Calculate odds for each participant
    const odds = await Promise.all(
      race.registeredHorses.map(async (participant) => {
        const horse = await Horse.findById(participant.horseId);
        if (!horse) return null;

        // Calculate odds based on all factors that affect race score
        const speedScore = horse.stats.speed;
        const staminaScore = horse.stats.stamina;
        const winRate =
          horse.history.racesEntered > 0
            ? horse.history.racesWon / horse.history.racesEntered
            : 0.5;

        // Factor in bond level (1.0 to 1.5x multiplier)
        const bondMultiplier = calculateBondMultiplier(horse.bond.level);

        // Factor in racing skills
        let skillBonus = 0;
        if (horse.training.trainedSkills.includes(HorseSkill.RACING_FORM)) {
          skillBonus += 0.15;
        }
        if (horse.training.trainedSkills.includes(HorseSkill.SPEED_BURST)) {
          skillBonus += 0.10;
        }

        // Calculate total advantage (capped at 1.5x, matching race scoring)
        const totalMultiplier = Math.min(1.5, bondMultiplier * (1 + skillBonus));

        // Calculate odds - lower stats/bonuses = higher (worse) odds
        // statsContribution: 0-200 points from speed+stamina
        // multiplierContribution: 1.0-1.5
        // winRateContribution: 0-0.5 from history
        const statsContribution = (speedScore + staminaScore) / 40; // 0-5
        const multiplierContribution = (totalMultiplier - 1) * 4;   // 0-2
        const winRateContribution = winRate * 2;                     // 0-1

        const baseOdds = Math.max(
          1.1,
          6 - statsContribution - multiplierContribution - winRateContribution
        );

        return {
          horseId: horse._id,
          horseName: horse.name,
          odds: Number(baseOdds.toFixed(2)),
          stats: {
            speed: horse.stats.speed,
            stamina: horse.stats.stamina,
          },
          record: {
            wins: horse.history.racesWon,
            races: horse.history.racesEntered,
          },
          bonuses: {
            bondLevel: horse.bond.level,
            hasRacingForm: horse.training.trainedSkills.includes(HorseSkill.RACING_FORM),
            hasSpeedBurst: horse.training.trainedSkills.includes(HorseSkill.SPEED_BURST),
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        raceId,
        odds: odds.filter((o) => o !== null),
      },
    });
  }
);
