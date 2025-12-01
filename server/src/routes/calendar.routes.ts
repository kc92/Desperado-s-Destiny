/**
 * Calendar Routes
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * API routes for accessing calendar, season, and time information
 */

import { Router } from 'express';
import { calendarService } from '../services/calendar.service';
import { seasonService } from '../services/season.service';
import { TIME_CONVERSION } from '../services/calendar.service';
import { getAllHolidays } from '../data/holidays';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/calendar
 * Get current calendar state
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const calendar = await calendarService.getCalendar();
    const currentDate = await calendarService.getCurrentDate();
    const upcomingHolidays = await calendarService.getUpcomingHolidays(5);
    const activeEvents = calendar.scheduledEvents.filter((e) =>
      calendar.activeEventIds.includes(e.id)
    );

    res.json({
      success: true,
      data: {
        calendar: {
          currentYear: calendar.currentYear,
          currentMonth: calendar.currentMonth,
          currentWeek: calendar.currentWeek,
          currentDay: calendar.currentDay,
          currentSeason: calendar.currentSeason,
          currentMoonPhase: calendar.currentMoonPhase,
          activeHoliday: calendar.getActiveHoliday(),
          activeEvents,
          seasonalEffects: calendar.seasonalEffects,
          lastTick: calendar.lastTick,
        },
        currentDate,
        timeConversion: TIME_CONVERSION,
        upcomingHolidays,
        upcomingEvents: activeEvents,
      },
    });
  })
);

/**
 * GET /api/calendar/current-date
 * Get just the current date
 */
router.get(
  '/current-date',
  asyncHandler(async (req, res) => {
    const currentDate = await calendarService.getCurrentDate();
    const formattedDate = calendarService.formatDate(currentDate);

    res.json({
      success: true,
      data: {
        currentDate,
        formatted: formattedDate,
      },
    });
  })
);

/**
 * GET /api/calendar/season
 * Get current season information
 */
router.get(
  '/season',
  asyncHandler(async (req, res) => {
    const seasonInfo = await seasonService.getSeasonInfo();

    res.json({
      success: true,
      data: seasonInfo,
    });
  })
);

/**
 * GET /api/calendar/moon-phase
 * Get current moon phase information
 */
router.get(
  '/moon-phase',
  asyncHandler(async (req, res) => {
    const moonInfo = await seasonService.getMoonPhaseInfo();

    res.json({
      success: true,
      data: moonInfo,
    });
  })
);

/**
 * GET /api/calendar/holidays
 * Get all holidays
 */
router.get(
  '/holidays',
  asyncHandler(async (req, res) => {
    const calendar = await calendarService.getCalendar();
    const allHolidays = getAllHolidays();
    const activeHoliday = calendar.getActiveHoliday();
    const upcoming = await calendarService.getUpcomingHolidays(5);

    res.json({
      success: true,
      data: {
        holidays: allHolidays,
        activeHoliday,
        upcoming,
      },
    });
  })
);

/**
 * GET /api/calendar/activity-check/:activity
 * Check if it's a good time for an activity
 */
router.get(
  '/activity-check/:activity',
  asyncHandler(async (req, res) => {
    const { activity } = req.params;

    const validActivities = ['hunting', 'fishing', 'crime', 'trading'];
    if (!validActivities.includes(activity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid activity. Must be one of: hunting, fishing, crime, trading',
      });
    }

    const result = await seasonService.isGoodTimeFor(
      activity as 'hunting' | 'fishing' | 'crime' | 'trading'
    );

    res.json({
      success: true,
      data: {
        activity,
        ...result,
      },
    });
  })
);

/**
 * GET /api/calendar/price-modifier/:category
 * Get seasonal price modifier for an item category
 */
router.get(
  '/price-modifier/:category',
  asyncHandler(async (req, res) => {
    const { category } = req.params;

    const validCategories = [
      'crops',
      'livestock',
      'furs',
      'fish',
      'wood',
      'ore',
      'medicine',
      'clothing',
      'weapons',
      'ammunition',
      'food',
      'alcohol',
      'luxury',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item category',
      });
    }

    const modifier = await seasonService.getPriceModifier(
      category as any
    );

    res.json({
      success: true,
      data: {
        category,
        modifier,
        trend:
          modifier > 1.1
            ? 'high'
            : modifier < 0.9
              ? 'low'
              : 'normal',
      },
    });
  })
);

/**
 * POST /api/calendar/admin/advance
 * Admin: Force advance time
 */
router.post(
  '/admin/advance',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { days } = req.body;

    if (!days || days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        error: 'Days must be between 1 and 365',
      });
    }

    await calendarService.forceAdvanceTime(days);
    const currentDate = await calendarService.getCurrentDate();

    res.json({
      success: true,
      data: {
        message: `Advanced ${days} days`,
        currentDate,
        formatted: calendarService.formatDate(currentDate),
      },
    });
  })
);

/**
 * POST /api/calendar/admin/sync
 * Admin: Sync calendar with real time
 */
router.post(
  '/admin/sync',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await calendarService.syncCalendar();
    const currentDate = await calendarService.getCurrentDate();

    res.json({
      success: true,
      data: {
        message: 'Calendar synced with real time',
        currentDate,
        formatted: calendarService.formatDate(currentDate),
      },
    });
  })
);

export default router;
