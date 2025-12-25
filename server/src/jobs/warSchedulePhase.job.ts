/**
 * War Schedule Phase Job
 *
 * Phase 2.1: Weekly War Schedule
 *
 * Handles war schedule phase transitions:
 * - Hourly phase checks (DECLARATION → PREPARATION → ACTIVE → RESOLUTION → COOLDOWN)
 * - Auto-tournament bracket generation (Thursday 23:30 UTC)
 * - Power rating refresh for stale entries
 */

import { WarScheduleService } from '../services/warSchedule.service';
import { AutoTournamentService } from '../services/autoTournament.service';
import { WarTierService } from '../services/warTier.service';
import { WeeklyWarPhase, WAR_SCHEDULE } from '@desperados/shared';
import logger from '../utils/logger';

// =============================================================================
// PHASE TRANSITION
// =============================================================================

/**
 * Process war schedule phase transitions
 * Called hourly to check for phase changes
 */
export async function processPhaseTransition(): Promise<{
  transitioned: boolean;
  previousPhase?: WeeklyWarPhase;
  newPhase?: WeeklyWarPhase;
  message: string;
}> {
  const startTime = Date.now();

  try {
    const result = await WarScheduleService.transitionPhase();

    if (result) {
      const duration = Date.now() - startTime;
      logger.info(
        `War phase transitioned: ${result.previousPhase} → ${result.newPhase} ` +
        `(Season ${result.seasonNumber}, Week ${result.weekNumber}) in ${duration}ms`
      );

      return {
        transitioned: true,
        previousPhase: result.previousPhase,
        newPhase: result.newPhase,
        message: `Phase transitioned from ${result.previousPhase} to ${result.newPhase}`,
      };
    }

    return {
      transitioned: false,
      message: 'No phase transition needed',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error processing war phase transition:', error);

    return {
      transitioned: false,
      message: `Phase transition failed: ${errorMessage}`,
    };
  }
}

// =============================================================================
// AUTO-TOURNAMENT BRACKET GENERATION
// =============================================================================

/**
 * Generate auto-tournament brackets
 * Called on Thursday at 23:30 UTC (end of declaration window)
 */
export async function generateTournamentBrackets(): Promise<{
  success: boolean;
  matchesCreated: number;
  byeCount: number;
  errors: string[];
  message: string;
}> {
  const startTime = Date.now();

  try {
    // Check if it's the right time (Thursday between 23:00 and 00:00 UTC)
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const hour = now.getUTCHours();

    // Only generate on Thursday (day 4) at the configured time
    if (dayOfWeek !== WAR_SCHEDULE.BRACKET_GENERATION_DAY) {
      return {
        success: true,
        matchesCreated: 0,
        byeCount: 0,
        errors: [],
        message: 'Not bracket generation day',
      };
    }

    if (hour !== WAR_SCHEDULE.BRACKET_GENERATION_HOUR) {
      return {
        success: true,
        matchesCreated: 0,
        byeCount: 0,
        errors: [],
        message: 'Not bracket generation hour',
      };
    }

    const result = await AutoTournamentService.generateBrackets();
    const duration = Date.now() - startTime;

    logger.info(
      `Tournament brackets generated: ${result.matchesCreated} matches, ` +
      `${result.byeCount} byes, ${result.errors.length} errors in ${duration}ms`
    );

    return {
      success: result.errors.length === 0,
      matchesCreated: result.matchesCreated,
      byeCount: result.byeCount,
      errors: result.errors,
      message: `Generated ${result.matchesCreated} tournament matches`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error generating tournament brackets:', error);

    return {
      success: false,
      matchesCreated: 0,
      byeCount: 0,
      errors: [errorMessage],
      message: `Bracket generation failed: ${errorMessage}`,
    };
  }
}

// =============================================================================
// POWER RATING REFRESH
// =============================================================================

/**
 * Refresh stale power ratings
 * Called periodically to ensure ratings are up to date
 */
export async function refreshStalePowerRatings(): Promise<{
  refreshed: number;
  message: string;
}> {
  const startTime = Date.now();

  try {
    const refreshed = await WarTierService.refreshStaleRatings();
    const duration = Date.now() - startTime;

    if (refreshed > 0) {
      logger.info(`Refreshed ${refreshed} stale power ratings in ${duration}ms`);
    }

    return {
      refreshed,
      message: `Refreshed ${refreshed} stale power ratings`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error refreshing stale power ratings:', error);

    return {
      refreshed: 0,
      message: `Power rating refresh failed: ${errorMessage}`,
    };
  }
}

// =============================================================================
// SEASON MANAGEMENT
// =============================================================================

/**
 * Check and handle season transitions
 * Called weekly to check if season should conclude
 */
export async function checkSeasonTransition(): Promise<{
  seasonEnded: boolean;
  newSeasonStarted: boolean;
  message: string;
}> {
  try {
    const season = await WarScheduleService.getOrCreateCurrentSeason();

    if (season.shouldConclude()) {
      // Season transition is handled by WarScheduleService.transitionPhase()
      // during the cooldown phase
      return {
        seasonEnded: false,
        newSeasonStarted: false,
        message: 'Season will conclude during next cooldown phase',
      };
    }

    return {
      seasonEnded: false,
      newSeasonStarted: false,
      message: 'Season is active',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error checking season transition:', error);

    return {
      seasonEnded: false,
      newSeasonStarted: false,
      message: `Season check failed: ${errorMessage}`,
    };
  }
}

// =============================================================================
// STATUS CHECK
// =============================================================================

/**
 * Get current war schedule status
 * Useful for monitoring and debugging
 */
export async function getWarScheduleStatus(): Promise<{
  currentPhase: WeeklyWarPhase;
  weekNumber: number;
  seasonNumber: number;
  declarationWindowOpen: boolean;
  resolutionWindowActive: boolean;
  nextPhaseChange: Date;
  activeWarsCount: number;
  declaredWarsCount: number;
}> {
  try {
    return await WarScheduleService.getScheduleStatus();
  } catch (error) {
    logger.error('Error getting war schedule status:', error);
    throw error;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  processPhaseTransition,
  generateTournamentBrackets,
  refreshStalePowerRatings,
  checkSeasonTransition,
  getWarScheduleStatus,
};
