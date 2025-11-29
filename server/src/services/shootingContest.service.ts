/**
 * Shooting Contest Service
 * Manages shooting contests, registration, and progression
 */

import { ShootingContest, IShootingContest } from '../models/ShootingContest.model';
import { ShootingRecord } from '../models/ShootingRecord.model';
import { Character } from '../models/Character.model';
import { ShootingMechanicsService } from './shootingMechanics.service';
import { CONTEST_TEMPLATES } from '../data/shootingContests';
import { TARGET_SETS } from '../data/shootingTargets';
import type {
  ContestTemplate,
  ContestType,
  AllowedWeapon,
  RoundType,
  Target,
  ShootingShotResult,
  RoundScore,
  ShootingLeaderboardEntry
} from '@desperados/shared';

/**
 * SHOOTING CONTEST SERVICE
 */
export class ShootingContestService {
  /**
   * Create a new contest from template
   */
  static async createContest(templateId: string, scheduledStart: Date): Promise<IShootingContest> {
    const template = CONTEST_TEMPLATES[templateId];
    if (!template) {
      throw new Error(`Contest template not found: ${templateId}`);
    }

    // Generate weather for outdoor events
    const weather = template.location.includes('Underground')
      ? undefined
      : ShootingMechanicsService.generateWeather(template.location);

    // Create rounds from template
    const rounds = template.rounds.map((roundConfig, index) => ({
      roundNumber: index + 1,
      roundType: roundConfig.roundType,
      targets: this.getTargetsForRound(template.contestType, roundConfig.roundType),
      shotsPerPlayer: roundConfig.shotsPerPlayer,
      timeLimit: roundConfig.timeLimit,
      scores: new Map(),
      eliminations: roundConfig.eliminations,
      status: 'pending' as const
    }));

    const contest = await ShootingContest.create({
      name: template.name,
      description: template.description,
      contestType: template.contestType,
      location: template.location,
      scheduledStart,
      duration: 120, // 2 hours default
      entryFee: template.entryFee,
      minLevel: template.minLevel,
      maxParticipants: template.maxParticipants,
      minParticipants: template.minParticipants,
      allowedWeapons: template.allowedWeapons,
      registeredShooters: [],
      rounds,
      currentRound: 0,
      scoringSystem: template.scoringSystem,
      prizePool: template.basePrizePool,
      prizes: template.prizes,
      status: 'registration',
      weather,
      registrationEndsAt: new Date(scheduledStart.getTime() - 30 * 60 * 1000) // 30 min before
    });

    return contest;
  }

  /**
   * Register character for contest
   */
  static async registerForContest(
    contestId: string,
    characterId: string,
    weapon: AllowedWeapon
  ): Promise<IShootingContest> {
    const contest = await ShootingContest.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    // Check if can register
    if (!contest.canRegister(characterId)) {
      throw new Error('Cannot register for this contest');
    }

    // Check weapon is allowed
    if (!contest.allowedWeapons.includes(weapon)) {
      throw new Error(`Weapon ${weapon} not allowed in this contest`);
    }

    // Get character
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Check level requirement
    if (character.level < contest.minLevel) {
      throw new Error(`Character must be level ${contest.minLevel} or higher`);
    }

    // Get marksmanship skill (assuming it's in character.skills)
    const marksmanshipSkill = (character as any).skills?.marksmanship || 50;

    // Add to participants
    contest.registeredShooters.push({
      characterId: character._id as any,
      characterName: character.name,
      marksmanshipSkill,
      weapon,
      joinedAt: new Date(),
      eliminated: false,
      totalScore: 0
    });

    // Update prize pool (entry fees accumulate)
    contest.prizePool += contest.entryFee;

    // Check if ready to start
    if (contest.registeredShooters.length >= contest.minParticipants) {
      contest.status = 'ready';
    }

    await contest.save();

    // Record entry in shooting record
    const record = await ShootingRecord.findOrCreate(characterId, character.name);
    record.recordEntry();
    await record.save();

    return contest;
  }

  /**
   * Start contest
   */
  static async startContest(contestId: string): Promise<IShootingContest> {
    const contest = await ShootingContest.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (!contest.canStart()) {
      throw new Error('Contest cannot start yet');
    }

    contest.status = 'in_progress';
    contest.startedAt = new Date();
    contest.currentRound = 0;

    // Initialize first round
    const firstRound = contest.rounds[0];
    if (firstRound) {
      firstRound.status = 'in_progress';
    }

    await contest.save();
    return contest;
  }

  /**
   * Shoot at a target
   */
  static async shoot(
    contestId: string,
    characterId: string,
    targetId: string
  ): Promise<{ shot: ShootingShotResult; contest: IShootingContest }> {
    const contest = await ShootingContest.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (contest.status !== 'in_progress' && contest.status !== 'final_round') {
      throw new Error('Contest is not in progress');
    }

    // Get current round
    const currentRound = contest.rounds[contest.currentRound];
    if (!currentRound || currentRound.status !== 'in_progress') {
      throw new Error('No active round');
    }

    // Find participant
    const participant = contest.registeredShooters.find(
      p => p.characterId.toString() === characterId && !p.eliminated
    );

    if (!participant) {
      throw new Error('Character not in contest or eliminated');
    }

    // Find target
    const target = currentRound.targets.find(t => t.id === targetId);
    if (!target) {
      throw new Error('Target not found');
    }

    // Get or create score for this player in this round
    const scoreKey = characterId;
    let roundScore = currentRound.scores.get(scoreKey);

    if (!roundScore) {
      roundScore = {
        playerId: characterId,
        playerName: participant.characterName,
        shots: [],
        totalPoints: 0,
        accuracy: 0,
        averageTime: 0,
        bonusMultiplier: 1,
        finalScore: 0,
        rank: 0,
        eliminated: false
      };
      currentRound.scores.set(scoreKey, roundScore);
    }

    // Check if already took max shots
    if (roundScore.shots.length >= currentRound.shotsPerPlayer) {
      throw new Error('Already took maximum shots for this round');
    }

    // Resolve shot
    const shot = ShootingMechanicsService.resolveShot(
      characterId,
      target,
      participant.marksmanshipSkill,
      participant.weapon,
      roundScore.shots.length,
      contest.weather
    );

    // Add shot to round score
    roundScore.shots.push(shot);

    // Recalculate score
    const scoreData = ShootingMechanicsService.calculateScore(
      roundScore.shots,
      contest.scoringSystem
    );

    roundScore.totalPoints = scoreData.totalPoints;
    roundScore.accuracy = scoreData.accuracy;
    roundScore.averageTime = scoreData.averageTime;
    roundScore.finalScore = scoreData.finalScore;

    // Update contest
    currentRound.scores.set(scoreKey, roundScore);
    await contest.save();

    return { shot, contest };
  }

  /**
   * Complete current round
   */
  static async completeRound(contestId: string): Promise<IShootingContest> {
    const contest = await ShootingContest.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    const currentRound = contest.rounds[contest.currentRound];
    if (!currentRound) {
      throw new Error('No active round');
    }

    // Rank players
    const scores = Array.from(currentRound.scores.values()) as RoundScore[];
    const rankings = ShootingMechanicsService.rankPlayers(scores as any);

    // Apply rankings
    for (const ranking of rankings) {
      const score = currentRound.scores.get(ranking.playerId);
      if (score) {
        score.rank = ranking.rank;
        currentRound.scores.set(ranking.playerId, score);
      }
    }

    // Handle eliminations
    if (currentRound.eliminations && currentRound.eliminations > 0) {
      const sortedScores = scores.sort((a: any, b: any) => {
        const aRank = currentRound.scores.get(a.playerId)?.rank || 999;
        const bRank = currentRound.scores.get(b.playerId)?.rank || 999;
        return aRank - bRank;
      });

      // Eliminate bottom performers
      const toEliminate = sortedScores.slice(-currentRound.eliminations);
      for (const score of toEliminate) {
        (score as any).eliminated = true;
        currentRound.scores.set((score as any).playerId, score);

        // Mark in participant list
        const participant = contest.registeredShooters.find(
          p => p.characterId.toString() === (score as any).playerId
        );
        if (participant) {
          participant.eliminated = true;
          participant.eliminatedInRound = contest.currentRound + 1;
        }
      }
    }

    // Update participant total scores
    for (const [playerId, score] of currentRound.scores.entries()) {
      const participant = contest.registeredShooters.find(
        p => p.characterId.toString() === playerId
      );
      if (participant) {
        participant.totalScore += score.finalScore;
      }
    }

    // Complete round
    currentRound.status = 'completed';
    currentRound.completedAt = new Date();

    // Move to next round or complete contest
    if (contest.currentRound < contest.rounds.length - 1) {
      contest.currentRound += 1;
      const nextRound = contest.rounds[contest.currentRound];
      nextRound.status = 'in_progress';

      // Check if final round
      if (contest.currentRound === contest.rounds.length - 1) {
        contest.status = 'final_round';
      }
    } else {
      // Contest complete
      await this.completeContest(contest);
    }

    await contest.save();
    return contest;
  }

  /**
   * Complete the entire contest
   */
  private static async completeContest(contest: IShootingContest): Promise<void> {
    contest.status = 'completed';
    contest.completedAt = new Date();

    // Determine final rankings
    const activePlayers = contest.registeredShooters.filter(p => !p.eliminated);
    const sorted = activePlayers.sort((a, b) => b.totalScore - a.totalScore);

    // Assign placements
    sorted.forEach((participant, index) => {
      participant.finalPlacement = index + 1;
    });

    // Set winner
    if (sorted.length > 0) {
      contest.winnerId = sorted[0].characterId;
      contest.winnerName = sorted[0].characterName;
    }

    // Award prizes
    for (const participant of contest.registeredShooters) {
      if (participant.finalPlacement) {
        const prize = contest.prizes.find(p => p.placement === participant.finalPlacement);
        if (prize) {
          await this.awardPrize(
            participant.characterId.toString(),
            participant.characterName,
            contest,
            prize,
            participant.finalPlacement
          );
        }
      }
    }
  }

  /**
   * Award prize to character
   */
  private static async awardPrize(
    characterId: string,
    characterName: string,
    contest: IShootingContest,
    prize: any,
    placement: number
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Award gold (would integrate with gold service in real implementation)
    // character.gold += prize.gold;

    // Update shooting record
    const record = await ShootingRecord.findOrCreate(characterId, characterName);
    const participant = contest.registeredShooters.find(
      p => p.characterId.toString() === characterId
    );

    if (participant) {
      // Update records
      const lastRound = contest.rounds[contest.rounds.length - 1];
      const finalScore = lastRound.scores.get(characterId);

      if (finalScore) {
        record.updateRecord(
          contest.contestType,
          participant.totalScore,
          finalScore.accuracy,
          finalScore.averageTime,
          contest._id.toString()
        );
      }

      // Record win/loss
      if (placement === 1) {
        record.recordWin(prize.gold);
      } else {
        record.recordLoss(prize.gold);
      }

      // Add title if awarded
      if (prize.title) {
        record.addTitle(prize.title, contest.contestType, contest._id.toString());
      }

      await record.save();
    }

    // Award reputation, items, etc would go here
  }

  /**
   * Get targets for a round based on contest type and round type
   */
  private static getTargetsForRound(contestType: ContestType, roundType: RoundType): Target[] {
    const targetSet = TARGET_SETS[contestType];
    if (!targetSet) return [];

    // Map round types to target sets
    if (roundType === 'qualification') {
      return targetSet.qualification || [];
    } else if (roundType === 'semifinals' || roundType === 'elimination') {
      return targetSet.semifinals || [];
    } else if (roundType === 'finals' || roundType === 'shootoff') {
      return targetSet.finals || [];
    }

    return targetSet.qualification || [];
  }

  /**
   * Get active contests
   */
  static async getActiveContests(): Promise<IShootingContest[]> {
    return ShootingContest.find({
      status: { $in: ['registration', 'ready', 'in_progress', 'final_round'] }
    }).sort({ scheduledStart: 1 });
  }

  /**
   * Get contests by type
   */
  static async getContestsByType(contestType: ContestType): Promise<IShootingContest[]> {
    return ShootingContest.find({
      contestType,
      status: { $in: ['registration', 'ready', 'in_progress', 'final_round'] }
    }).sort({ scheduledStart: 1 });
  }

  /**
   * Get contest by ID
   */
  static async getContest(contestId: string): Promise<IShootingContest | null> {
    return ShootingContest.findById(contestId);
  }

  /**
   * Get character's shooting record
   */
  static async getCharacterRecord(characterId: string): Promise<any> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    return ShootingRecord.findOrCreate(characterId, character.name);
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    type: 'wins' | 'money' | 'contest_type',
    contestType?: ContestType,
    limit: number = 10
  ): Promise<ShootingLeaderboardEntry[]> {
    let records: any[] = [];

    if (type === 'wins') {
      records = await ShootingRecord.getLeaderboardByWins(limit);
    } else if (type === 'money') {
      records = await ShootingRecord.getLeaderboardByPrizeMoney(limit);
    } else if (type === 'contest_type' && contestType) {
      records = await ShootingRecord.getLeaderboardByType(contestType, limit);
    }

    return records.map((record, index) => ({
      rank: index + 1,
      characterId: record.characterId.toString(),
      characterName: record.characterName,
      contestType,
      score: type === 'money' ? record.totalPrizeMoney : record.contestsWon,
      wins: record.contestsWon,
      accuracy: this.calculateAverageAccuracy(record),
      titles: record.titles.length
    }));
  }

  /**
   * Calculate average accuracy from records
   */
  private static calculateAverageAccuracy(record: any): number {
    if (record.records.length === 0) return 0;

    const totalAccuracy = record.records.reduce(
      (sum: number, r: any) => sum + r.bestAccuracy,
      0
    );

    return Math.round((totalAccuracy / record.records.length) * 10) / 10;
  }

  /**
   * Cancel contest
   */
  static async cancelContest(contestId: string): Promise<IShootingContest> {
    const contest = await ShootingContest.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (contest.status === 'completed') {
      throw new Error('Cannot cancel completed contest');
    }

    contest.status = 'cancelled';
    await contest.save();

    // Refund entry fees would go here

    return contest;
  }

  /**
   * Schedule recurring contests
   * Called by a cron job
   */
  static async scheduleRecurringContests(): Promise<void> {
    const now = new Date();

    for (const template of Object.values(CONTEST_TEMPLATES)) {
      // Calculate next scheduled time based on frequency
      const nextSchedule = this.calculateNextSchedule(template, now);

      // Check if contest already exists for this time
      const existing = await ShootingContest.findOne({
        name: template.name,
        scheduledStart: nextSchedule,
        status: { $ne: 'cancelled' }
      });

      if (!existing) {
        await this.createContest(template.id, nextSchedule);
      }
    }
  }

  /**
   * Calculate next schedule time for a template
   */
  private static calculateNextSchedule(template: ContestTemplate, from: Date): Date {
    const next = new Date(from);

    if (template.frequency === 'daily') {
      next.setHours(template.hour, 0, 0, 0);
      if (next <= from) {
        next.setDate(next.getDate() + 1);
      }
    } else if (template.frequency === 'weekly') {
      next.setHours(template.hour, 0, 0, 0);
      const currentDay = next.getDay();
      const targetDay = template.dayOfWeek || 0;
      const daysUntil = (targetDay - currentDay + 7) % 7;
      next.setDate(next.getDate() + (daysUntil || 7));
    } else if (template.frequency === 'monthly') {
      next.setDate(template.dayOfMonth || 1);
      next.setHours(template.hour, 0, 0, 0);
      if (next <= from) {
        next.setMonth(next.getMonth() + 1);
      }
    } else if (template.frequency === 'annual') {
      next.setMonth(5); // June
      next.setDate(template.dayOfMonth || 15);
      next.setHours(template.hour, 0, 0, 0);
      if (next <= from) {
        next.setFullYear(next.getFullYear() + 1);
      }
    }

    return next;
  }
}
