/**
 * Frontier Zodiac Routes
 * API endpoints for the Western-themed zodiac calendar system
 */

import { Router } from 'express';
import { FrontierZodiacController } from '../controllers/frontierZodiac.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * ==========================================
 * PUBLIC ROUTES (No authentication required)
 * ==========================================
 */

/**
 * GET /api/zodiac/current
 * Get the current zodiac sign based on real-world date
 *
 * Response: {
 *   currentSign: FrontierSign,
 *   isPeakDay: boolean,
 *   peakDayBonusMultiplier: number,
 *   message: string
 * }
 */
router.get('/current', asyncHandler(FrontierZodiacController.getCurrentSign));

/**
 * GET /api/zodiac/signs
 * Get all 12 frontier zodiac signs with their details
 *
 * Response: {
 *   signs: FrontierSign[],
 *   count: number,
 *   currentSignId: string | null
 * }
 */
router.get('/signs', asyncHandler(FrontierZodiacController.getAllSigns));

/**
 * GET /api/zodiac/signs/:signId
 * Get details for a specific zodiac sign
 *
 * Response: {
 *   sign: FrontierSign,
 *   oppositeSign: FrontierSign,
 *   isCurrentSign: boolean
 * }
 */
router.get('/signs/:signId', asyncHandler(FrontierZodiacController.getSignById));

/**
 * GET /api/zodiac/peak-day
 * Check if today is a peak day for any sign
 *
 * Response: {
 *   isPeakDay: boolean,
 *   sign: FrontierSign | null,
 *   bonusMultiplier: number,
 *   message: string
 * }
 */
router.get('/peak-day', asyncHandler(FrontierZodiacController.getPeakDay));

/**
 * GET /api/zodiac/date/:month/:day
 * Get the zodiac sign for a specific date
 *
 * Params: month (1-12), day (1-31)
 * Response: {
 *   month: number,
 *   day: number,
 *   sign: FrontierSign
 * }
 */
router.get('/date/:month/:day', asyncHandler(FrontierZodiacController.getSignForDate));

/**
 * GET /api/zodiac/compatibility/:signId1/:signId2
 * Check compatibility between two signs
 *
 * Response: {
 *   sign1: FrontierSign,
 *   sign2: FrontierSign,
 *   compatibility: {
 *     compatible: boolean,
 *     level: 'excellent' | 'good' | 'neutral' | 'challenging',
 *     reason: string
 *   }
 * }
 */
router.get('/compatibility/:signId1/:signId2', asyncHandler(FrontierZodiacController.getCompatibility));

/**
 * GET /api/zodiac/leaderboard
 * Get zodiac leaderboard
 *
 * Query params:
 *   - metric: 'totalFragments' | 'constellationsCompleted' (default: 'totalFragments')
 *   - limit: number (default: 100, max: 500)
 *
 * Response: {
 *   leaderboard: Array<{ rank, characterId, birthSign, totalFragments, constellationsCompleted, isStarWalker }>,
 *   metric: string
 * }
 */
router.get('/leaderboard', asyncHandler(FrontierZodiacController.getLeaderboard));

/**
 * GET /api/zodiac/star-walkers
 * Get all Star Walkers (players who completed all 12 constellations)
 *
 * Response: {
 *   starWalkers: Array<{ characterId, birthSign, starWalkerAt, totalFragments }>,
 *   count: number,
 *   rewards: StarWalkerReward
 * }
 */
router.get('/star-walkers', asyncHandler(FrontierZodiacController.getStarWalkers));

/**
 * ==========================================
 * AUTHENTICATED ROUTES (Require login + character)
 * ==========================================
 */

// Apply authentication middleware to all routes below
router.use(requireAuth);

/**
 * GET /api/zodiac/progress
 * Get character's zodiac progress including constellation completion
 *
 * Response: {
 *   birthSign: FrontierSign | null,
 *   birthSignSetAt: Date | null,
 *   constellations: Record<string, ConstellationProgress>,
 *   totalFragments: number,
 *   isStarWalker: boolean,
 *   completionPercentage: number,
 *   peakDaysAttended: number,
 *   stats: { totalBonusesApplied, totalPeakDayBonuses, constellationsCompleted }
 * }
 */
router.get('/progress', asyncHandler(FrontierZodiacController.getProgress));

/**
 * POST /api/zodiac/birth-sign
 * Set character's birth sign (one-time selection, cannot be changed)
 *
 * Body: { signId: string }
 * Response: {
 *   success: boolean,
 *   sign: FrontierSign,
 *   message: string
 * }
 */
router.post('/birth-sign', requireCsrfToken, asyncHandler(FrontierZodiacController.setBirthSign));

/**
 * GET /api/zodiac/bonuses
 * Get active zodiac bonuses for the current character
 *
 * Response: {
 *   currentSign: FrontierSign,
 *   birthSign: FrontierSign | null,
 *   isPeakDay: boolean,
 *   activeBonuses: ActiveBonus[],
 *   summary: {
 *     activityBonuses: Record<string, number>,
 *     skillBonuses: Record<string, number>,
 *     specialBonuses: Record<string, number>
 *   },
 *   isBirthSignActive: boolean,
 *   bonusMultiplier: number
 * }
 */
router.get('/bonuses', asyncHandler(FrontierZodiacController.getActiveBonuses));

/**
 * POST /api/zodiac/constellation/:signId/claim
 * Claim reward for completing a constellation
 *
 * Params: signId - The sign whose constellation reward to claim
 * Response: {
 *   reward: ConstellationReward,
 *   message: string
 * }
 */
router.post('/constellation/:signId/claim', requireCsrfToken, asyncHandler(FrontierZodiacController.claimConstellationReward));

/**
 * POST /api/zodiac/peak-day/attend
 * Record attendance for a peak day (awards bonus fragments)
 *
 * Response: {
 *   recorded: boolean,
 *   sign: FrontierSign | null,
 *   message: string
 * }
 */
router.post('/peak-day/attend', requireCsrfToken, asyncHandler(FrontierZodiacController.attendPeakDay));

/**
 * POST /api/zodiac/fragments/award
 * Award star fragments to character (internal/game use)
 * This would typically be called by other game systems when activities are completed
 *
 * Body: { signId: string, amount: number }
 * Response: {
 *   fragmentsAdded: number,
 *   totalFragments: number,
 *   constellationProgress: {
 *     fragmentsEarned: number,
 *     fragmentsRequired: number,
 *     percentComplete: number,
 *     completed: boolean,
 *     justCompleted: boolean
 *   },
 *   becameStarWalker: boolean,
 *   message: string
 * }
 */
router.post('/fragments/award', requireCsrfToken, asyncHandler(FrontierZodiacController.awardFragments));

export default router;
