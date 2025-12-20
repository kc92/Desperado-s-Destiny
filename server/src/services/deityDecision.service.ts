/**
 * Deity Decision Service
 *
 * Core AI decision engine for the deity system.
 * Calculates attention levels, evaluates intervention opportunities,
 * and coordinates proactive deity behavior beyond simple threshold triggers.
 *
 * The two deities:
 * - The Gambler (ORDER) - Values honor, justice, fate, fair play
 * - The Outlaw King (CHAOS) - Values freedom, survival, chaos, rebellion
 */

import mongoose, { Types } from 'mongoose';
import { DeityAttention, IDeityAttention, DeityName } from '../models/DeityAttention.model';
import { CharacterKarma, ICharacterKarma, IKarmaAction, IKarmaValues } from '../models/CharacterKarma.model';
import { DeityAgent, IDeityAgent } from '../models/DeityAgent.model';
import { DivineManifestation, ManifestationType } from '../models/DivineManifestation.model';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import logger from '../utils/logger';

// ============================================================================
// ATTENTION CALCULATION WEIGHTS
// ============================================================================

/**
 * Weights for calculating deity attention based on karma dimensions
 * Higher weight = more attention from that deity for that dimension
 */
const ATTENTION_WEIGHTS = {
  GAMBLER: {
    honor: 0.3,
    justice: 0.3,
    deception: -0.2,   // Negative = reduces attention (disliked trait)
    chaos: -0.15,
    mercy: 0.15,
    loyalty: 0.2,
    greed: -0.1,
    charity: 0.1,
    survival: 0.05,
    cruelty: -0.1
  },
  OUTLAW_KING: {
    chaos: 0.3,
    survival: 0.25,
    deception: 0.15,
    honor: -0.1,
    justice: -0.2,
    greed: 0.1,
    cruelty: 0.1,
    mercy: 0.05,
    loyalty: 0.15,
    charity: -0.05
  }
};

/**
 * Base intervention chances (per deity tick)
 */
const INTERVENTION_CHANCES = {
  DREAM: 0.15,       // 15% base chance during rest
  STRANGER: 0.05,    // 5% base chance per tick
  OMEN: 0.08,        // 8% base chance per tick
  WHISPER: 0.10      // 10% base chance per tick
};

/**
 * Mood modifiers for intervention types
 */
const MOOD_MODIFIERS: Record<string, Record<string, number>> = {
  PLEASED: { blessing: 1.5, curse: 0.5, whisper: 1.2 },
  AMUSED: { blessing: 1.2, curse: 0.8, whisper: 1.0 },
  NEUTRAL: { blessing: 1.0, curse: 1.0, whisper: 1.0 },
  DISPLEASED: { blessing: 0.8, curse: 1.2, whisper: 0.9 },
  WRATHFUL: { blessing: 0.5, curse: 2.0, whisper: 0.7 }
};

// ============================================================================
// KARMA TRAJECTORY ANALYSIS
// ============================================================================

export interface IKarmaTrajectory {
  direction: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'VOLATILE';
  velocityPerDay: number;        // Average karma change per day
  consistency: number;           // 0-1, how consistent the trend is
  recentDramaticActions: number; // Count of major/extreme actions recently
  daysAnalyzed: number;
}

// ============================================================================
// DEITY DECISION SERVICE
// ============================================================================

class DeityDecisionService {
  /**
   * Calculate attention level for a character from a specific deity
   * Returns 0-100
   */
  async calculateAttention(
    karma: ICharacterKarma,
    deity: DeityName
  ): Promise<number> {
    try {
      let attention = 0;
      const weights = ATTENTION_WEIGHTS[deity];

      // 1. Base attention from affinity magnitude (0-50 points)
      const affinity = deity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;
      attention += Math.abs(affinity) * 0.5;

      // 2. Attention from karma dimensions (0-30 points)
      const karmaValues = karma.karma;
      for (const [dimension, weight] of Object.entries(weights)) {
        const value = karmaValues[dimension as keyof IKarmaValues] || 0;
        // Extreme values (positive or negative) draw more attention
        attention += Math.abs(value) * Math.abs(weight) * 0.3;
      }

      // 3. Activity bonus from recent actions (0-20 points)
      const recentActions = karma.recentActions.filter(a =>
        Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000
      );
      attention += Math.min(recentActions.length * 2, 20);

      // 4. Moral conflict bonus (deities love drama) (+15 points)
      if (karma.detectMoralConflict()) {
        attention += 15;
      }

      // 5. Rival attention bonus (if favored by opposing deity) (+10 points)
      const rivalAffinity = deity === 'GAMBLER' ? karma.outlawKingAffinity : karma.gamblerAffinity;
      if (rivalAffinity > 50) {
        attention += 10;
      }

      // 6. Penalty for recent intervention (temporary reduction)
      const deityAttention = await DeityAttention.findByCharacterAndDeity(karma.characterId, deity);
      if (deityAttention?.lastInterventionAt) {
        const hoursSince = (Date.now() - deityAttention.lastInterventionAt.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 4) {
          attention *= 0.5; // 50% reduction for 4 hours after intervention
        } else if (hoursSince < 8) {
          attention *= 0.75; // 25% reduction for 8 hours
        }
      }

      return Math.min(100, Math.max(0, attention));
    } catch (error) {
      // ERR-2 FIX: Graceful error handling - return neutral attention on failure
      logger.error(`Failed to calculate attention for character ${karma.characterId} from ${deity}:`, error);
      return 0; // Return 0 attention on error - deity is not watching
    }
  }

  /**
   * Calculate interest level (how "interesting" a player is to a deity)
   * Different from attention - interest is about narrative potential
   */
  async calculateInterest(
    karma: ICharacterKarma,
    characterId: string | Types.ObjectId,
    deity: DeityName
  ): Promise<number> {
    let interest = 0;

    // 1. Trajectory analysis - characters on dramatic paths are interesting
    const trajectory = await this.analyzeKarmaTrajectory(karma, deity);
    if (trajectory.direction === 'VOLATILE') {
      interest += 20;
    } else if (trajectory.recentDramaticActions > 2) {
      interest += 15;
    }

    // 2. Leadership positions are interesting
    const character = await Character.findById(characterId);
    if (character?.gangId) {
      const gang = await Gang.findById(character.gangId);
      if (gang?.leaderId?.toString() === characterId.toString()) {
        interest += 15;
      } else if (gang?.isOfficer(characterId)) {
        interest += 8;
      }
    }

    // 3. High level characters are more interesting
    if (character) {
      interest += Math.min(character.level / 5, 10); // Up to 10 points for level 50
    }

    // 4. Characters with active blessings/curses are more interesting
    const activeBlessings = karma.getActiveBlessings();
    const activeCurses = karma.getActiveCurses();
    interest += (activeBlessings.length + activeCurses.length) * 5;

    // 5. Characters near threshold crossings
    const nearThreshold = this.isNearThresholdCrossing(karma, deity);
    if (nearThreshold) {
      interest += 15;
    }

    return Math.min(100, Math.max(0, interest));
  }

  /**
   * Analyze karma trajectory over recent actions
   */
  async analyzeKarmaTrajectory(
    karma: ICharacterKarma,
    deity: DeityName
  ): Promise<IKarmaTrajectory> {
    const actions = karma.recentActions;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Group actions by day
    const actionsByDay = new Map<number, IKarmaAction[]>();
    for (const action of actions) {
      const dayIndex = Math.floor((now - action.timestamp.getTime()) / dayMs);
      if (!actionsByDay.has(dayIndex)) {
        actionsByDay.set(dayIndex, []);
      }
      actionsByDay.get(dayIndex)!.push(action);
    }

    if (actionsByDay.size < 2) {
      return {
        direction: 'STABLE',
        velocityPerDay: 0,
        consistency: 1,
        recentDramaticActions: actions.filter(a =>
          a.witnessedByDeity === deity || a.witnessedByDeity === 'BOTH'
        ).length,
        daysAnalyzed: actionsByDay.size
      };
    }

    // Calculate karma delta per day
    const dailyDeltas: number[] = [];
    const relevantDimensions = deity === 'GAMBLER'
      ? ['honor', 'justice', 'mercy', 'loyalty']
      : ['chaos', 'survival', 'deception', 'greed'];

    for (const [_day, dayActions] of actionsByDay) {
      let dayDelta = 0;
      for (const action of dayActions) {
        if (relevantDimensions.includes(action.dimension.toLowerCase())) {
          dayDelta += action.delta;
        }
      }
      dailyDeltas.push(dayDelta);
    }

    // Analyze trend
    const avgDelta = dailyDeltas.reduce((a, b) => a + b, 0) / dailyDeltas.length;
    const variance = dailyDeltas.reduce((sum, d) => sum + Math.pow(d - avgDelta, 2), 0) / dailyDeltas.length;
    const consistency = 1 - Math.min(1, Math.sqrt(variance) / 10);

    let direction: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'VOLATILE';
    if (variance > 25) {
      direction = 'VOLATILE';
    } else if (avgDelta > 2) {
      direction = 'IMPROVING';
    } else if (avgDelta < -2) {
      direction = 'DECLINING';
    } else {
      direction = 'STABLE';
    }

    // Count dramatic actions (MAJOR or EXTREME severity witnessed by this deity)
    const dramaticActions = actions.filter(a =>
      (a.witnessedByDeity === deity || a.witnessedByDeity === 'BOTH') &&
      Math.abs(a.delta) >= 5
    ).length;

    return {
      direction,
      velocityPerDay: avgDelta,
      consistency,
      recentDramaticActions: dramaticActions,
      daysAnalyzed: actionsByDay.size
    };
  }

  /**
   * Check if character is near a threshold crossing
   */
  private isNearThresholdCrossing(karma: ICharacterKarma, deity: DeityName): boolean {
    const affinity = deity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;
    const thresholds = [25, 50, 75, 90, -25, -50, -75, -90];

    for (const threshold of thresholds) {
      const distance = Math.abs(affinity - threshold);
      if (distance <= 5 && distance > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Update attention triggers for a character
   */
  async updateAttentionTriggers(
    attention: IDeityAttention,
    karma: ICharacterKarma,
    characterId: string | Types.ObjectId
  ): Promise<void> {
    const deity = attention.deityName;

    // High karma check (any dimension > 50)
    const karmaValues = karma.karma;
    attention.triggers.highKarma = Object.values(karmaValues).some(v => Math.abs(v) > 50);

    // Recent drama check (major action in last 24h)
    const recentMajor = karma.recentActions.some(a =>
      Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000 &&
      Math.abs(a.delta) >= 5
    );
    attention.triggers.recentDrama = recentMajor;

    // Rival favored check
    const rivalAffinity = deity === 'GAMBLER' ? karma.outlawKingAffinity : karma.gamblerAffinity;
    attention.triggers.rivalFavored = rivalAffinity > 50;

    // Gambler watches gamblers
    if (deity === 'GAMBLER') {
      const gamblingActions = karma.recentActions.filter(a =>
        a.context.toLowerCase().includes('gambl') ||
        a.context.toLowerCase().includes('bet') ||
        a.context.toLowerCase().includes('poker') ||
        a.context.toLowerCase().includes('card')
      );
      attention.triggers.frequentGambler = gamblingActions.length >= 3;
    }

    // Outlaw King watches lawbreakers
    if (deity === 'OUTLAW_KING') {
      const crimeActions = karma.recentActions.filter(a =>
        a.actionType.startsWith('CRIME_') ||
        a.context.toLowerCase().includes('crime') ||
        a.context.toLowerCase().includes('outlaw')
      );
      attention.triggers.lawBreaker = crimeActions.length >= 3;
    }

    // Moral conflict
    attention.triggers.moralConflict = karma.detectMoralConflict() !== null;

    // Active quester check
    const questActions = karma.recentActions.filter(a =>
      a.context.toLowerCase().includes('quest')
    );
    attention.triggers.activeQuester = questActions.length >= 5;

    // Gang leader check
    const character = await Character.findById(characterId);
    if (character?.gangId) {
      const gang = await Gang.findById(character.gangId);
      attention.triggers.gangLeader = gang?.leaderId?.toString() === characterId.toString();
    } else {
      attention.triggers.gangLeader = false;
    }
  }

  /**
   * Evaluate whether an intervention should occur for a character
   * Returns the type of intervention, or null if none
   */
  async evaluateIntervention(
    attention: IDeityAttention,
    deity: IDeityAgent,
    karma: ICharacterKarma
  ): Promise<'DREAM' | 'STRANGER' | 'OMEN' | 'WHISPER' | null> {
    // Check deity global cooldown
    if (!deity.canIntervene()) {
      return null;
    }

    // Get attention-based intervention chance
    const baseChance = attention.calculateInterventionChance(0.1);

    // Apply mood modifier
    const moodMod = MOOD_MODIFIERS[deity.mood] || MOOD_MODIFIERS.NEUTRAL;

    // Evaluate each intervention type
    const interventionTypes: Array<'DREAM' | 'STRANGER' | 'OMEN' | 'WHISPER'> = ['WHISPER', 'OMEN', 'STRANGER', 'DREAM'];

    for (const type of interventionTypes) {
      // Check cooldown
      const canReceive = type === 'DREAM' ? attention.canReceiveDream() :
                         type === 'STRANGER' ? attention.canReceiveStranger() :
                         type === 'OMEN' ? attention.canReceiveOmen() :
                         attention.canReceiveWhisper();

      if (!canReceive) continue;

      // Calculate chance
      const typeChance = INTERVENTION_CHANCES[type] * baseChance * moodMod.blessing;

      // Roll for intervention
      if (Math.random() < typeChance) {
        return type;
      }
    }

    return null;
  }

  /**
   * Get or create attention record, recalculating values
   */
  async getOrUpdateAttention(
    characterId: string | Types.ObjectId,
    deityName: DeityName
  ): Promise<IDeityAttention> {
    let attention = await DeityAttention.findByCharacterAndDeity(characterId, deityName);

    if (!attention) {
      attention = new DeityAttention({
        characterId,
        deityName,
        attention: 0,
        interest: 0
      });
    }

    // Get karma record
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) {
      await attention.save();
      return attention;
    }

    // Recalculate attention and interest
    attention.attention = await this.calculateAttention(karma, deityName);
    attention.interest = await this.calculateInterest(karma, characterId, deityName);

    // Update triggers
    await this.updateAttentionTriggers(attention, karma, characterId);

    // Update trajectory
    const trajectory = await this.analyzeKarmaTrajectory(karma, deityName);
    attention.karmaTrajectory = trajectory.direction;

    // Update timestamp
    attention.lastEvaluatedAt = new Date();

    await attention.save();
    return attention;
  }

  /**
   * Get top watched characters for a deity
   */
  async getTopWatchedCharacters(
    deityName: DeityName,
    limit: number = 100
  ): Promise<IDeityAttention[]> {
    return DeityAttention.findTopWatched(deityName, limit);
  }

  /**
   * Check if character should receive a dream during rest
   * Returns the deity that sends the dream, or null
   */
  async checkForDream(
    characterId: string | Types.ObjectId,
    restType: 'short_rest' | 'full_rest' | 'hotel' | 'camp' | 'home'
  ): Promise<{ deity: DeityName; dreamType: string } | null> {
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) return null;

    // Check dream cooldown
    if (karma.lastDreamAt) {
      const hoursSince = (Date.now() - karma.lastDreamAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 8) return null;
    }

    // Base chance depends on rest type
    let baseChance = restType === 'full_rest' || restType === 'hotel' ? 0.3 :
                     restType === 'home' ? 0.25 : 0.15;

    // Get attention from both deities
    const gamblerAttention = await this.getOrUpdateAttention(characterId, 'GAMBLER');
    const outlawAttention = await this.getOrUpdateAttention(characterId, 'OUTLAW_KING');

    // Weight by attention level
    const totalAttention = gamblerAttention.attention + outlawAttention.attention;
    if (totalAttention < 10) return null; // Not enough attention for dreams

    const effectiveChance = baseChance * (totalAttention / 100);
    if (Math.random() > effectiveChance) return null;

    // Select deity weighted by attention
    const deity: DeityName = Math.random() < (gamblerAttention.attention / totalAttention)
      ? 'GAMBLER'
      : 'OUTLAW_KING';

    // Determine dream type based on trajectory
    const attention = deity === 'GAMBLER' ? gamblerAttention : outlawAttention;
    const affinity = deity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;

    let dreamType: string;
    if (attention.karmaTrajectory === 'IMPROVING' && affinity > 0) {
      dreamType = 'PROPHETIC';
    } else if (attention.karmaTrajectory === 'DECLINING' && affinity > 0) {
      dreamType = 'WARNING';
    } else if (attention.karmaTrajectory === 'IMPROVING' && affinity < 0) {
      dreamType = 'VISION';
    } else if (attention.karmaTrajectory === 'DECLINING' && affinity < 0) {
      dreamType = 'NIGHTMARE';
    } else if (attention.karmaTrajectory === 'VOLATILE') {
      dreamType = 'CHAOS_DREAM';
    } else {
      dreamType = 'MEMORY';
    }

    // Record the dream attempt
    attention.recordIntervention('DREAM');
    await attention.save();

    return { deity, dreamType };
  }

  /**
   * Calculate world mood factors for deity mood updates
   */
  async calculateWorldMoodFactors(): Promise<{
    honorableActionsToday: number;
    justiceServedToday: number;
    fairDuelsToday: number;
    cheatersExposedToday: number;
    lawsBrokenToday: number;
    prisonEscapesToday: number;
    chaosEventsToday: number;
    rebellionActsToday: number;
    totalPlayersActive: number;
    majorEventsActive: number;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Aggregate karma actions from the last 24 hours
    const recentKarma = await CharacterKarma.find({
      'recentActions.timestamp': { $gte: oneDayAgo }
    }).select('recentActions');

    let stats = {
      honorableActionsToday: 0,
      justiceServedToday: 0,
      fairDuelsToday: 0,
      cheatersExposedToday: 0,
      lawsBrokenToday: 0,
      prisonEscapesToday: 0,
      chaosEventsToday: 0,
      rebellionActsToday: 0,
      totalPlayersActive: 0,
      majorEventsActive: 0
    };

    const activePlayers = new Set<string>();

    for (const karma of recentKarma) {
      const recentActions = karma.recentActions.filter(a => a.timestamp >= oneDayAgo);

      for (const action of recentActions) {
        activePlayers.add(karma.characterId.toString());

        if (action.dimension === 'HONOR' && action.delta > 0) stats.honorableActionsToday++;
        if (action.dimension === 'JUSTICE' && action.delta > 0) stats.justiceServedToday++;
        if (action.actionType === 'COMBAT_FAIR_DUEL') stats.fairDuelsToday++;
        if (action.actionType === 'GAMBLING_CHEATED' && action.delta < 0) stats.cheatersExposedToday++;
        if (action.actionType.startsWith('CRIME_')) stats.lawsBrokenToday++;
        if (action.context.toLowerCase().includes('escape') && action.context.toLowerCase().includes('prison')) {
          stats.prisonEscapesToday++;
        }
        if (action.dimension === 'CHAOS' && action.delta > 0) stats.chaosEventsToday++;
        if (action.dimension === 'JUSTICE' && action.delta < 0) stats.rebellionActsToday++;

        if (Math.abs(action.delta) >= 5) stats.majorEventsActive++;
      }
    }

    stats.totalPlayersActive = activePlayers.size;

    return stats;
  }

  /**
   * Update deity mood based on world state
   */
  async updateDeityMood(deity: IDeityAgent): Promise<void> {
    const worldState = await this.calculateWorldMoodFactors();
    const isGambler = deity.name === 'The Gambler';

    let moodScore = 50; // Neutral baseline

    if (isGambler) {
      moodScore += worldState.honorableActionsToday * 0.5;
      moodScore += worldState.justiceServedToday * 1;
      moodScore += worldState.fairDuelsToday * 0.3;
      moodScore += worldState.cheatersExposedToday * 2;
      moodScore -= worldState.lawsBrokenToday * 0.2;
      moodScore -= worldState.chaosEventsToday * 0.5;
    } else {
      moodScore += worldState.lawsBrokenToday * 0.5;
      moodScore += worldState.prisonEscapesToday * 2;
      moodScore += worldState.chaosEventsToday * 1;
      moodScore += worldState.rebellionActsToday * 1.5;
      moodScore -= worldState.justiceServedToday * 0.3;
      moodScore -= worldState.honorableActionsToday * 0.1;
    }

    // Clamp mood score
    moodScore = Math.max(0, Math.min(100, moodScore));

    // Determine mood from score
    let newMood: 'PLEASED' | 'AMUSED' | 'NEUTRAL' | 'DISPLEASED' | 'WRATHFUL';
    if (moodScore >= 80) newMood = 'PLEASED';
    else if (moodScore >= 60) newMood = 'AMUSED';
    else if (moodScore >= 40) newMood = 'NEUTRAL';
    else if (moodScore >= 20) newMood = 'DISPLEASED';
    else newMood = 'WRATHFUL';

    deity.mood = newMood;

    // Update phase based on activity
    if (worldState.totalPlayersActive > 100 && worldState.majorEventsActive > 10) {
      deity.currentPhase = 'ACTIVE';
    } else if (worldState.totalPlayersActive > 50) {
      deity.currentPhase = 'WATCHING';
    } else if (worldState.totalPlayersActive > 10) {
      deity.currentPhase = 'DORMANT';
    }

    await deity.save();

    logger.debug(`Updated deity mood: ${deity.name} is now ${newMood} (phase: ${deity.currentPhase})`);
  }
}

export const deityDecisionService = new DeityDecisionService();
export default deityDecisionService;
