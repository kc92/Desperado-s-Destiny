/**
 * War Schedule Service
 *
 * Phase 2.1: Weekly War Schedule
 *
 * Manages weekly war schedule lifecycle:
 * - Phase transitions (Declaration → Preparation → Active → Resolution → Cooldown)
 * - Window validation for war declarations
 * - Season integration
 * - Automatic schedule creation
 */

import mongoose from 'mongoose';
import { WarWeekSchedule, IWarWeekSchedule } from '../models/WarWeekSchedule.model';
import { WarSeason, IWarSeason } from '../models/WarSeason.model';
import { GangPowerRating } from '../models/GangPowerRating.model';
import { GangWar } from '../models/GangWar.model';
import { Gang } from '../models/Gang.model';
import {
  WeeklyWarPhase,
  WarLeagueTier,
  WAR_SCHEDULE,
} from '@desperados/shared';
import logger from '../utils/logger';
import { getSocketIO } from '../config/socket';

// =============================================================================
// TYPES
// =============================================================================

export interface PhaseTransitionResult {
  previousPhase: WeeklyWarPhase;
  newPhase: WeeklyWarPhase;
  weekNumber: number;
  seasonNumber: number;
}

export interface ScheduleStatus {
  currentPhase: WeeklyWarPhase;
  weekNumber: number;
  seasonNumber: number;
  declarationWindowOpen: boolean;
  resolutionWindowActive: boolean;
  nextPhaseChange: Date;
  activeWarsCount: number;
  declaredWarsCount: number;
}

export interface DeclarationEligibility {
  eligible: boolean;
  reasons: string[];
  gangTier: WarLeagueTier;
  warsThisWeek: number;
  maxWarsPerWeek: number;
}

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class WarScheduleService {
  /**
   * Get or create the current week's schedule
   */
  static async getCurrentWeekSchedule(): Promise<IWarWeekSchedule> {
    // Try to find existing current week
    let schedule = await WarWeekSchedule.findCurrentWeek();

    if (schedule) {
      return schedule;
    }

    // Create new week schedule
    const season = await this.getOrCreateCurrentSeason();
    schedule = await WarWeekSchedule.createWeekSchedule(
      season._id,
      season.currentWeek
    );

    logger.info(`Created new week schedule: Season ${season.seasonNumber}, Week ${season.currentWeek}`);

    return schedule;
  }

  /**
   * Get or create the current season
   */
  static async getOrCreateCurrentSeason(): Promise<IWarSeason> {
    let season = await WarSeason.findActiveSeason();

    if (!season) {
      season = await WarSeason.createNewSeason();
      logger.info(`Created new season: ${season.name}`);
    }

    return season;
  }

  /**
   * Get the current war phase
   */
  static async getCurrentPhase(): Promise<WeeklyWarPhase> {
    const schedule = await this.getCurrentWeekSchedule();
    return schedule.phase;
  }

  /**
   * Get complete schedule status
   */
  static async getScheduleStatus(): Promise<ScheduleStatus> {
    const schedule = await this.getCurrentWeekSchedule();
    const season = await WarSeason.findById(schedule.seasonId);

    const now = new Date();
    const declarationWindowOpen = schedule.canDeclareWar();
    const resolutionWindowActive = schedule.isResolutionActive();

    // Calculate next phase change
    let nextPhaseChange: Date;
    switch (schedule.phase) {
      case WeeklyWarPhase.DECLARATION:
        nextPhaseChange = schedule.declarationWindowEnd;
        break;
      case WeeklyWarPhase.PREPARATION:
        nextPhaseChange = schedule.resolutionWindowStart;
        break;
      case WeeklyWarPhase.ACTIVE:
      case WeeklyWarPhase.RESOLUTION:
        nextPhaseChange = schedule.resolutionWindowEnd;
        break;
      default:
        // Cooldown - next Monday
        nextPhaseChange = this.getNextMonday();
    }

    return {
      currentPhase: schedule.phase,
      weekNumber: schedule.weekNumber,
      seasonNumber: season?.seasonNumber || 1,
      declarationWindowOpen,
      resolutionWindowActive,
      nextPhaseChange,
      activeWarsCount: schedule.activeWars.length,
      declaredWarsCount: schedule.declaredWars.length,
    };
  }

  /**
   * Check if a gang can declare war
   */
  static async canGangDeclareWar(
    gangId: mongoose.Types.ObjectId
  ): Promise<DeclarationEligibility> {
    const reasons: string[] = [];
    const schedule = await this.getCurrentWeekSchedule();

    // Check declaration window
    if (!schedule.canDeclareWar()) {
      reasons.push('Declaration window is closed (Mon-Thu only)');
    }

    // Get gang's power rating and tier
    let gangPowerRating = await GangPowerRating.findByGang(gangId);
    if (!gangPowerRating) {
      gangPowerRating = await GangPowerRating.calculateAndCache(gangId);
    }

    // Check cooldown
    const gang = await Gang.findById(gangId);
    if (!gang) {
      return {
        eligible: false,
        reasons: ['Gang not found'],
        gangTier: WarLeagueTier.BRONZE,
        warsThisWeek: 0,
        maxWarsPerWeek: WAR_SCHEDULE.MAX_WARS_PER_WEEK,
      };
    }

    if (gang.warCooldownUntil && gang.warCooldownUntil > new Date()) {
      reasons.push(`Gang is on war cooldown until ${gang.warCooldownUntil.toISOString()}`);
    }

    // Check wars this week
    const warsThisWeek = await GangWar.countDocuments({
      $or: [
        { attackerGangId: gangId },
        { defenderGangId: gangId },
      ],
      weekScheduleId: schedule._id,
    });

    if (warsThisWeek >= WAR_SCHEDULE.MAX_WARS_PER_WEEK) {
      reasons.push(`Maximum wars per week (${WAR_SCHEDULE.MAX_WARS_PER_WEEK}) reached`);
    }

    // Check if already in an active war
    const activeWar = await GangWar.findOne({
      $or: [
        { attackerGangId: gangId },
        { defenderGangId: gangId },
      ],
      status: { $in: ['declared', 'preparation', 'scheduled', 'active'] },
    });

    if (activeWar) {
      reasons.push('Gang is already involved in an active war');
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      gangTier: gangPowerRating.tier,
      warsThisWeek,
      maxWarsPerWeek: WAR_SCHEDULE.MAX_WARS_PER_WEEK,
    };
  }

  /**
   * Check if resolution window is currently active
   */
  static async isResolutionWindowActive(): Promise<boolean> {
    const schedule = await this.getCurrentWeekSchedule();
    return schedule.isResolutionActive();
  }

  /**
   * Transition to the next phase
   * Called by the cron job
   */
  static async transitionPhase(): Promise<PhaseTransitionResult | null> {
    const schedule = await this.getCurrentWeekSchedule();
    const season = await WarSeason.findById(schedule.seasonId);
    const previousPhase = schedule.phase;

    const now = new Date();
    let newPhase: WeeklyWarPhase | null = null;

    // Determine what phase we should be in based on time
    if (now < schedule.declarationWindowStart) {
      // Before declaration window - cooldown from previous week
      newPhase = WeeklyWarPhase.COOLDOWN;
    } else if (now <= schedule.declarationWindowEnd) {
      newPhase = WeeklyWarPhase.DECLARATION;
    } else if (now < schedule.resolutionWindowStart) {
      newPhase = WeeklyWarPhase.PREPARATION;
    } else if (now <= schedule.resolutionWindowEnd) {
      if (schedule.activeWars.length > 0) {
        newPhase = WeeklyWarPhase.ACTIVE;
      } else {
        newPhase = WeeklyWarPhase.RESOLUTION;
      }
    } else {
      newPhase = WeeklyWarPhase.COOLDOWN;
    }

    // If no phase change needed, return null
    if (newPhase === previousPhase) {
      return null;
    }

    // Handle phase-specific logic
    switch (newPhase) {
      case WeeklyWarPhase.PREPARATION:
        await this.handlePreparationPhase(schedule);
        break;
      case WeeklyWarPhase.ACTIVE:
        await this.handleActivePhase(schedule);
        break;
      case WeeklyWarPhase.RESOLUTION:
        await this.handleResolutionPhase(schedule);
        break;
      case WeeklyWarPhase.COOLDOWN:
        await this.handleCooldownPhase(schedule, season);
        break;
    }

    // Update schedule phase
    schedule.phase = newPhase;
    await schedule.save();

    // Emit socket event for phase change
    const io = getSocketIO();
    if (io) {
      io.emit('war:phase_changed', {
        previousPhase,
        newPhase,
        weekNumber: schedule.weekNumber,
        seasonNumber: season?.seasonNumber || 1,
      });
    }

    logger.info(`War phase transitioned: ${previousPhase} → ${newPhase}`);

    return {
      previousPhase,
      newPhase,
      weekNumber: schedule.weekNumber,
      seasonNumber: season?.seasonNumber || 1,
    };
  }

  /**
   * Handle preparation phase - finalize declarations, generate brackets
   */
  private static async handlePreparationPhase(schedule: IWarWeekSchedule): Promise<void> {
    // Move all declared wars to scheduled status
    await GangWar.updateMany(
      {
        weekScheduleId: schedule._id,
        status: 'declared',
      },
      {
        $set: { status: 'scheduled' },
      }
    );

    // Trigger auto-tournament bracket generation if enabled
    if (schedule.autoTournament.enabled) {
      logger.info('Auto-tournament bracket generation will be triggered');
      // This will be handled by autoTournament.service.ts
    }
  }

  /**
   * Handle active phase - activate scheduled wars
   */
  private static async handleActivePhase(schedule: IWarWeekSchedule): Promise<void> {
    // Activate all scheduled wars
    const result = await GangWar.updateMany(
      {
        weekScheduleId: schedule._id,
        status: 'scheduled',
      },
      {
        $set: {
          status: 'active',
          startsAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      // Update schedule's active wars list
      const activeWars = await GangWar.find({
        weekScheduleId: schedule._id,
        status: 'active',
      }).select('_id');

      schedule.activeWars = activeWars.map(w => w._id as mongoose.Types.ObjectId);
      await schedule.save();

      logger.info(`Activated ${result.modifiedCount} wars for week ${schedule.weekNumber}`);
    }
  }

  /**
   * Handle resolution phase - auto-resolve remaining wars
   */
  private static async handleResolutionPhase(schedule: IWarWeekSchedule): Promise<void> {
    // Find wars that haven't been resolved
    const unresolvedWars = await GangWar.find({
      weekScheduleId: schedule._id,
      status: 'active',
    });

    for (const war of unresolvedWars) {
      try {
        // Auto-resolve based on current scores
        await this.autoResolveWar(war);
      } catch (error) {
        logger.error(`Failed to auto-resolve war ${war._id}:`, error);
      }
    }

    // Move wars to resolved list
    const resolvedWars = await GangWar.find({
      weekScheduleId: schedule._id,
      status: 'resolved',
    }).select('_id');

    schedule.resolvedWars = resolvedWars.map(w => w._id as mongoose.Types.ObjectId);
    schedule.activeWars = [];
    await schedule.save();
  }

  /**
   * Handle cooldown phase - prepare for next week
   */
  private static async handleCooldownPhase(
    schedule: IWarWeekSchedule,
    season: IWarSeason | null
  ): Promise<void> {
    // Complete the current week
    schedule.phase = WeeklyWarPhase.COOLDOWN;
    await schedule.save();

    // Check if season should conclude
    if (season && season.shouldConclude()) {
      await WarSeason.concludeSeason(season._id);
      logger.info(`Season ${season.seasonNumber} concluded`);

      // Create new season
      await WarSeason.createNewSeason();
    } else if (season) {
      // Advance to next week
      const canAdvance = await season.advanceWeek();
      if (canAdvance) {
        // Create next week's schedule
        await WarWeekSchedule.createWeekSchedule(season._id, season.currentWeek);
        logger.info(`Created schedule for week ${season.currentWeek}`);
      }
    }
  }

  /**
   * Auto-resolve a war based on current scores
   */
  private static async autoResolveWar(war: any): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Determine winner based on scores
      let outcome: string;
      if (war.attackerScore > war.defenderScore) {
        outcome = 'attacker_victory';
      } else if (war.defenderScore > war.attackerScore) {
        outcome = 'defender_victory';
      } else {
        outcome = 'draw';
      }

      war.status = 'resolved';
      war.outcome = outcome;
      war.endsAt = new Date();
      war.warLog.push({
        timestamp: new Date(),
        event: 'WAR_AUTO_RESOLVED',
        data: {
          outcome,
          attackerScore: war.attackerScore,
          defenderScore: war.defenderScore,
        },
      });

      await war.save({ session });

      // Update gang power ratings
      const attackerRating = await GangPowerRating.findByGang(war.attackerGangId);
      const defenderRating = await GangPowerRating.findByGang(war.defenderGangId);

      if (outcome === 'attacker_victory') {
        if (attackerRating) await attackerRating.recordWin();
        if (defenderRating) await defenderRating.recordLoss();
      } else if (outcome === 'defender_victory') {
        if (attackerRating) await attackerRating.recordLoss();
        if (defenderRating) await defenderRating.recordWin();
      }

      // Update season standings
      const schedule = await WarWeekSchedule.findById(war.weekScheduleId);
      if (schedule) {
        const season = await WarSeason.findById(schedule.seasonId);
        if (season) {
          // Update attacker standing
          await season.updateGangStanding(
            war.attackerGangId,
            war.attackerGangName,
            war.attackerGangTag || '',
            attackerRating?.tier || WarLeagueTier.BRONZE,
            outcome === 'attacker_victory' ? 'win' : outcome === 'defender_victory' ? 'loss' : 'draw',
            war.attackerScore
          );

          // Update defender standing
          if (war.defenderGangId) {
            await season.updateGangStanding(
              war.defenderGangId,
              war.defenderGangName,
              war.defenderGangTag || '',
              defenderRating?.tier || WarLeagueTier.BRONZE,
              outcome === 'defender_victory' ? 'win' : outcome === 'attacker_victory' ? 'loss' : 'draw',
              war.defenderScore
            );
          }
        }
      }

      await session.commitTransaction();

      logger.info(`Auto-resolved war ${war._id}: ${outcome}`);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get the next Monday at 00:00 UTC
   */
  private static getNextMonday(): Date {
    const now = new Date();
    const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(0, 0, 0, 0);
    return nextMonday;
  }

  /**
   * Register a war with the current week's schedule
   */
  static async registerWar(
    warId: mongoose.Types.ObjectId,
    attackerGangId: mongoose.Types.ObjectId,
    defenderGangId: mongoose.Types.ObjectId
  ): Promise<void> {
    const schedule = await this.getCurrentWeekSchedule();

    // Add to declared wars
    if (!schedule.declaredWars.some(id => id.equals(warId))) {
      schedule.declaredWars.push(warId);
      await schedule.save();
    }

    logger.info(`Registered war ${warId} with week ${schedule.weekNumber}`);
  }

  /**
   * Get schedule for a specific gang
   */
  static async getGangSchedule(
    gangId: mongoose.Types.ObjectId
  ): Promise<{
    currentPhase: WeeklyWarPhase;
    canDeclare: DeclarationEligibility;
    upcomingWars: any[];
    recentWars: any[];
  }> {
    const schedule = await this.getCurrentWeekSchedule();
    const canDeclare = await this.canGangDeclareWar(gangId);

    // Get upcoming wars (declared/scheduled)
    const upcomingWars = await GangWar.find({
      $or: [
        { attackerGangId: gangId },
        { defenderGangId: gangId },
      ],
      status: { $in: ['declared', 'scheduled'] },
      weekScheduleId: schedule._id,
    }).select('attackerGangName defenderGangName status startsAt');

    // Get recent wars (last 5)
    const recentWars = await GangWar.find({
      $or: [
        { attackerGangId: gangId },
        { defenderGangId: gangId },
      ],
      status: 'resolved',
    })
      .sort({ endsAt: -1 })
      .limit(5)
      .select('attackerGangName defenderGangName outcome endsAt attackerScore defenderScore');

    return {
      currentPhase: schedule.phase,
      canDeclare,
      upcomingWars,
      recentWars,
    };
  }

  /**
   * Refresh all stale power ratings
   * Called by cron job
   */
  static async refreshStalePowerRatings(): Promise<number> {
    return GangPowerRating.refreshStaleRatings();
  }
}

export default WarScheduleService;
