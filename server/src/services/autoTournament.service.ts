/**
 * Auto Tournament Service
 *
 * Phase 2.1: Weekly War Schedule
 *
 * Handles automatic tournament bracket generation for gangs:
 * - Generates brackets for opt-in gangs without declared wars
 * - Tier-based matchmaking within brackets
 * - Tournament war creation
 */

import mongoose from 'mongoose';
import { WarWeekSchedule, IWarWeekSchedule } from '../models/WarWeekSchedule.model';
import { GangPowerRating, IGangPowerRating } from '../models/GangPowerRating.model';
import { GangWar } from '../models/GangWar.model';
import { Gang, IGang } from '../models/Gang.model';
import { WarSeason } from '../models/WarSeason.model';
import {
  WarLeagueTier,
  GangWarStatus,
  AUTO_TOURNAMENT,
  WAR_SCHEDULE,
} from '@desperados/shared';
import logger from '../utils/logger';
import { getSocketIO } from '../config/socket';

// =============================================================================
// TYPES
// =============================================================================

export interface TournamentBracket {
  tier: WarLeagueTier;
  matches: TournamentMatch[];
  byes: mongoose.Types.ObjectId[]; // Gangs that couldn't be matched
}

export interface TournamentMatch {
  gang1Id: mongoose.Types.ObjectId;
  gang1Name: string;
  gang1PowerRating: number;
  gang2Id: mongoose.Types.ObjectId;
  gang2Name: string;
  gang2PowerRating: number;
  powerDifference: number;
  warId?: mongoose.Types.ObjectId;
}

export interface BracketGenerationResult {
  totalParticipants: number;
  matchesCreated: number;
  byeCount: number;
  brackets: TournamentBracket[];
  errors: string[];
}

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class AutoTournamentService {
  /**
   * Register a gang for auto-tournament
   */
  static async registerForTournament(
    gangId: mongoose.Types.ObjectId
  ): Promise<{ success: boolean; message: string }> {
    const schedule = await WarWeekSchedule.findCurrentWeek();
    if (!schedule) {
      return { success: false, message: 'No active week schedule found' };
    }

    if (!schedule.autoTournament.enabled) {
      return { success: false, message: 'Auto-tournament is not enabled for this week' };
    }

    // Check if already registered
    const isRegistered = schedule.autoTournament.participatingGangs.some(
      p => p.gangId.equals(gangId)
    );
    if (isRegistered) {
      return { success: false, message: 'Gang is already registered for auto-tournament' };
    }

    // Check if gang has already declared a war this week
    const existingWar = await GangWar.findOne({
      $or: [
        { attackerGangId: gangId },
        { defenderGangId: gangId },
      ],
      weekScheduleId: schedule._id,
      status: { $in: ['declared', 'scheduled', 'active'] },
    });

    if (existingWar) {
      return { success: false, message: 'Gang already has a war this week' };
    }

    // Get gang info
    const gang = await Gang.findById(gangId);
    if (!gang) {
      return { success: false, message: 'Gang not found' };
    }

    // Get power rating
    let rating = await GangPowerRating.findByGang(gangId);
    if (!rating) {
      rating = await GangPowerRating.calculateAndCache(gangId);
    }

    // Add to participants
    await schedule.addTournamentParticipant(
      gangId,
      gang.name,
      gang.tag || '',
      rating.tier,
      rating.powerRating
    );

    logger.info(`Gang ${gang.name} registered for auto-tournament`);

    return { success: true, message: 'Successfully registered for auto-tournament' };
  }

  /**
   * Unregister a gang from auto-tournament
   */
  static async unregisterFromTournament(
    gangId: mongoose.Types.ObjectId
  ): Promise<{ success: boolean; message: string }> {
    const schedule = await WarWeekSchedule.findCurrentWeek();
    if (!schedule) {
      return { success: false, message: 'No active week schedule found' };
    }

    const participantIndex = schedule.autoTournament.participatingGangs.findIndex(
      p => p.gangId.equals(gangId)
    );

    if (participantIndex === -1) {
      return { success: false, message: 'Gang is not registered for auto-tournament' };
    }

    // Check if brackets have already been generated
    if (schedule.autoTournament.bracketGenerated) {
      return { success: false, message: 'Cannot unregister after brackets have been generated' };
    }

    schedule.autoTournament.participatingGangs.splice(participantIndex, 1);
    await schedule.save();

    const gang = await Gang.findById(gangId);
    logger.info(`Gang ${gang?.name || gangId} unregistered from auto-tournament`);

    return { success: true, message: 'Successfully unregistered from auto-tournament' };
  }

  /**
   * Generate tournament brackets for all tiers
   * Called at end of declaration phase (Thursday 23:30 UTC)
   */
  static async generateBrackets(): Promise<BracketGenerationResult> {
    const schedule = await WarWeekSchedule.findCurrentWeek();
    if (!schedule) {
      throw new Error('No active week schedule found');
    }

    if (!schedule.autoTournament.enabled) {
      throw new Error('Auto-tournament is not enabled for this week');
    }

    if (schedule.autoTournament.bracketGenerated) {
      throw new Error('Brackets have already been generated for this week');
    }

    const errors: string[] = [];
    const brackets: TournamentBracket[] = [];
    let totalMatchesCreated = 0;
    let totalByes = 0;

    // Generate brackets per tier
    for (const tier of Object.values(WarLeagueTier)) {
      const tierParticipants = schedule.autoTournament.participatingGangs
        .filter(p => p.tier === tier);

      if (tierParticipants.length < 2) {
        // Not enough participants in this tier
        if (tierParticipants.length === 1) {
          totalByes++;
          brackets.push({
            tier,
            matches: [],
            byes: [tierParticipants[0].gangId],
          });
        }
        continue;
      }

      const tierBracket = await this.generateTierBracket(
        tierParticipants,
        tier,
        schedule._id,
        errors
      );

      brackets.push(tierBracket);
      totalMatchesCreated += tierBracket.matches.length;
      totalByes += tierBracket.byes.length;
    }

    // Mark brackets as generated
    schedule.autoTournament.bracketGenerated = true;
    await schedule.save();

    // Emit socket event
    const io = getSocketIO();
    if (io) {
      io.emit('tournament:brackets_generated', {
        weekNumber: schedule.weekNumber,
        matchesCreated: totalMatchesCreated,
        byeCount: totalByes,
      });
    }

    logger.info(`Generated tournament brackets: ${totalMatchesCreated} matches, ${totalByes} byes`);

    return {
      totalParticipants: schedule.autoTournament.participatingGangs.length,
      matchesCreated: totalMatchesCreated,
      byeCount: totalByes,
      brackets,
      errors,
    };
  }

  /**
   * Generate bracket for a specific tier
   */
  private static async generateTierBracket(
    participants: Array<{ gangId: mongoose.Types.ObjectId; tier: WarLeagueTier }>,
    tier: WarLeagueTier,
    scheduleId: mongoose.Types.ObjectId,
    errors: string[]
  ): Promise<TournamentBracket> {
    const matches: TournamentMatch[] = [];
    const byes: mongoose.Types.ObjectId[] = [];

    // Get power ratings for all participants
    const ratingsMap = new Map<string, IGangPowerRating>();
    for (const participant of participants) {
      const rating = await GangPowerRating.findByGang(participant.gangId);
      if (rating) {
        ratingsMap.set(participant.gangId.toString(), rating);
      }
    }

    // Sort by power rating
    const sortedParticipants = [...participants].sort((a, b) => {
      const ratingA = ratingsMap.get(a.gangId.toString())?.powerRating || 0;
      const ratingB = ratingsMap.get(b.gangId.toString())?.powerRating || 0;
      return ratingB - ratingA;
    });

    // Match participants using Swiss-style pairing
    const matched = new Set<string>();

    for (let i = 0; i < sortedParticipants.length; i++) {
      const gang1 = sortedParticipants[i];
      if (matched.has(gang1.gangId.toString())) continue;

      // Find best opponent from remaining unmatched
      let bestOpponent: typeof gang1 | null = null;
      let bestPowerDiff = Infinity;

      for (let j = i + 1; j < sortedParticipants.length; j++) {
        const gang2 = sortedParticipants[j];
        if (matched.has(gang2.gangId.toString())) continue;

        const rating1 = ratingsMap.get(gang1.gangId.toString())?.powerRating || 0;
        const rating2 = ratingsMap.get(gang2.gangId.toString())?.powerRating || 0;
        const powerDiff = Math.abs(rating1 - rating2);

        // Prefer closer power ratings
        if (powerDiff < bestPowerDiff) {
          bestPowerDiff = powerDiff;
          bestOpponent = gang2;
        }
      }

      if (bestOpponent) {
        matched.add(gang1.gangId.toString());
        matched.add(bestOpponent.gangId.toString());

        const rating1 = ratingsMap.get(gang1.gangId.toString());
        const rating2 = ratingsMap.get(bestOpponent.gangId.toString());

        try {
          // Create the tournament war
          const war = await this.createTournamentWar(
            gang1.gangId,
            bestOpponent.gangId,
            scheduleId,
            tier
          );

          matches.push({
            gang1Id: gang1.gangId,
            gang1Name: rating1?.gangName || 'Unknown',
            gang1PowerRating: rating1?.powerRating || 0,
            gang2Id: bestOpponent.gangId,
            gang2Name: rating2?.gangName || 'Unknown',
            gang2PowerRating: rating2?.powerRating || 0,
            powerDifference: bestPowerDiff,
            warId: war._id,
          });

          // Mark as matched in schedule - participants are tracked by war creation
          const updatedSchedule = await WarWeekSchedule.findById(scheduleId);
          if (updatedSchedule) {
            // War IDs are tracked in declaredWars array
            await updatedSchedule.save();
          }
        } catch (error: any) {
          errors.push(`Failed to create war for ${rating1?.gangName} vs ${rating2?.gangName}: ${error.message}`);
        }
      } else {
        // No opponent found - bye
        byes.push(gang1.gangId);
      }
    }

    return { tier, matches, byes };
  }

  /**
   * Create a tournament war between two gangs
   */
  private static async createTournamentWar(
    gang1Id: mongoose.Types.ObjectId,
    gang2Id: mongoose.Types.ObjectId,
    scheduleId: mongoose.Types.ObjectId,
    tier: WarLeagueTier
  ): Promise<any> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang1 = await Gang.findById(gang1Id).session(session);
      const gang2 = await Gang.findById(gang2Id).session(session);

      if (!gang1 || !gang2) {
        throw new Error('One or both gangs not found');
      }

      // Determine attacker/defender randomly
      const isGang1Attacker = Math.random() > 0.5;
      const attacker = isGang1Attacker ? gang1 : gang2;
      const defender = isGang1Attacker ? gang2 : gang1;

      const declaredAt = new Date();
      const schedule = await WarWeekSchedule.findById(scheduleId).session(session);
      const season = schedule ? await WarSeason.findById(schedule.seasonId).session(session) : null;

      // Create war with auto-tournament flag
      const war = await GangWar.create([{
        attackerGangId: attacker._id,
        attackerGangName: attacker.name,
        attackerGangTag: attacker.tag || '',
        defenderGangId: defender._id,
        defenderGangName: defender.name,
        defenderGangTag: defender.tag || '',
        status: GangWarStatus.SCHEDULED,
        declaredAt,
        startsAt: schedule?.resolutionWindowStart || declaredAt,
        weekScheduleId: scheduleId,
        seasonId: season?._id,
        tier,
        isAutoTournament: true,
        attackerFunding: AUTO_TOURNAMENT.DEFAULT_FUNDING,
        defenderFunding: AUTO_TOURNAMENT.DEFAULT_FUNDING,
        capturePoints: AUTO_TOURNAMENT.CAPTURE_POINTS,
        attackerContributions: [],
        defenderContributions: [],
        warLog: [{
          timestamp: declaredAt,
          event: 'AUTO_TOURNAMENT_MATCH',
          data: {
            attackerGang: attacker.name,
            defenderGang: defender.name,
            tier,
          },
        }],
      }], { session });

      // Add war to schedule
      if (schedule) {
        schedule.declaredWars.push(war[0]._id as mongoose.Types.ObjectId);
        await schedule.save({ session });
      }

      await session.commitTransaction();

      logger.info(`Created tournament war: ${attacker.name} vs ${defender.name} (${tier})`);

      return war[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get tournament status for a gang
   */
  static async getTournamentStatus(
    gangId: mongoose.Types.ObjectId
  ): Promise<{
    registered: boolean;
    matched: boolean;
    tier: WarLeagueTier | null;
    opponent: { gangId: mongoose.Types.ObjectId; gangName: string } | null;
    warId: mongoose.Types.ObjectId | null;
    bracketsGenerated: boolean;
  }> {
    const schedule = await WarWeekSchedule.findCurrentWeek();
    if (!schedule) {
      return {
        registered: false,
        matched: false,
        tier: null,
        opponent: null,
        warId: null,
        bracketsGenerated: false,
      };
    }

    const participant = schedule.autoTournament.participatingGangs.find(
      p => p.gangId.equals(gangId)
    );

    if (!participant) {
      return {
        registered: false,
        matched: false,
        tier: null,
        opponent: null,
        warId: null,
        bracketsGenerated: schedule.autoTournament.bracketGenerated,
      };
    }

    // Find tournament war if matched
    let opponent = null;
    let warId = null;

    // Find tournament war if matched
    const war = await GangWar.findOne({
      $or: [
        { attackerGangId: gangId },
        { defenderGangId: gangId },
      ],
      weekScheduleId: schedule._id,
      isAutoTournament: true,
    });

    if (war) {
      warId = war._id;
      const opponentId = war.attackerGangId.equals(gangId)
        ? war.defenderGangId
        : war.attackerGangId;
      const opponentName = war.attackerGangId.equals(gangId)
        ? war.defenderGangName
        : war.attackerGangName;
      opponent = { gangId: opponentId, gangName: opponentName };
    }

    return {
      registered: true,
      matched: !!war,
      tier: participant.tier,
      opponent,
      warId,
      bracketsGenerated: schedule.autoTournament.bracketGenerated,
    };
  }

  /**
   * Get all tournament participants for current week
   */
  static async getCurrentParticipants(): Promise<{
    total: number;
    byTier: { tier: WarLeagueTier; count: number; matched: number }[];
    participants: Array<{
      gangId: mongoose.Types.ObjectId;
      gangName: string;
      tier: WarLeagueTier;
      matched: boolean;
      powerRating: number;
    }>;
  }> {
    const schedule = await WarWeekSchedule.findCurrentWeek();
    if (!schedule) {
      return { total: 0, byTier: [], participants: [] };
    }

    // Get all gangs with tournament wars this week to check match status
    const tournamentWars = await GangWar.find({
      weekScheduleId: schedule._id,
      isAutoTournament: true,
    }).select('attackerGangId defenderGangId');

    const matchedGangIds = new Set<string>();
    tournamentWars.forEach(war => {
      matchedGangIds.add(war.attackerGangId.toString());
      matchedGangIds.add(war.defenderGangId.toString());
    });

    const participants = [];

    for (const p of schedule.autoTournament.participatingGangs) {
      const rating = await GangPowerRating.findByGang(p.gangId);
      const isMatched = matchedGangIds.has(p.gangId.toString());
      participants.push({
        gangId: p.gangId,
        gangName: rating?.gangName || p.gangName,
        tier: p.tier,
        matched: isMatched,
        powerRating: rating?.powerRating || p.powerRating,
      });
    }

    // Group by tier
    const byTier = Object.values(WarLeagueTier).map(tier => {
      const tierParticipants = participants.filter(p => p.tier === tier);
      return {
        tier,
        count: tierParticipants.length,
        matched: tierParticipants.filter(p => p.matched).length,
      };
    });

    return {
      total: participants.length,
      byTier,
      participants,
    };
  }

  /**
   * Enable/disable auto-tournament for a week
   */
  static async setTournamentEnabled(
    weekScheduleId: mongoose.Types.ObjectId,
    enabled: boolean
  ): Promise<void> {
    const schedule = await WarWeekSchedule.findById(weekScheduleId);
    if (!schedule) {
      throw new Error('Week schedule not found');
    }

    schedule.autoTournament.enabled = enabled;
    await schedule.save();

    logger.info(`Auto-tournament ${enabled ? 'enabled' : 'disabled'} for week ${schedule.weekNumber}`);
  }

  /**
   * Configure auto-tournament settings
   */
  static async configureTournament(
    weekScheduleId: mongoose.Types.ObjectId,
    config: {
      minParticipantsPerTier?: number;
      maxParticipantsPerTier?: number;
      matchingPreference?: 'power_rating' | 'random' | 'swiss';
    }
  ): Promise<void> {
    const schedule = await WarWeekSchedule.findById(weekScheduleId);
    if (!schedule) {
      throw new Error('Week schedule not found');
    }

    if (config.minParticipantsPerTier !== undefined) {
      schedule.autoTournament.minParticipantsPerTier = config.minParticipantsPerTier;
    }
    if (config.maxParticipantsPerTier !== undefined) {
      schedule.autoTournament.maxParticipantsPerTier = config.maxParticipantsPerTier;
    }
    if (config.matchingPreference !== undefined) {
      schedule.autoTournament.matchingPreference = config.matchingPreference;
    }

    await schedule.save();
  }
}

export default AutoTournamentService;
