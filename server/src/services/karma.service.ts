/**
 * Karma Service
 *
 * Core service for tracking player karma across 10 dimensions and managing
 * deity relationships. Actions are recorded, affinities calculated, and
 * divine interventions triggered when thresholds are crossed.
 *
 * The two deities watch player actions:
 * - The Gambler (ORDER) - Values honor, justice, fate, fair play
 * - The Outlaw King (CHAOS) - Values freedom, survival, chaos, rebellion
 */

import mongoose, { Types } from 'mongoose';
import { CharacterKarma, ICharacterKarma, KarmaDimension, IKarmaAction, IBlessing, ICurse } from '../models/CharacterKarma.model';
import { DivineManifestation, IDivineManifestation, ManifestationType, DeityName } from '../models/DivineManifestation.model';
import { DeityAttention } from '../models/DeityAttention.model';
import deityDecisionService from './deityDecision.service';
import logger from '../utils/logger';

// ============================================================================
// KARMA RULES - Maps actions to karma dimension changes
// ============================================================================

export interface IKarmaRule {
  dimensions: Partial<Record<KarmaDimension, number>>;
  witnessChance: number;  // 0-1 chance a deity notices this action
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME';
  description: string;
}

export const KARMA_RULES: Record<string, IKarmaRule> = {
  // ==================== CRIME ACTIONS ====================
  CRIME_MURDER: {
    dimensions: { CRUELTY: 8, CHAOS: 5, JUSTICE: -10 },
    witnessChance: 0.9,
    severity: 'EXTREME',
    description: 'Took a life'
  },
  CRIME_MURDER_SELF_DEFENSE: {
    dimensions: { SURVIVAL: 5, CRUELTY: 2 },
    witnessChance: 0.6,
    severity: 'MODERATE',
    description: 'Killed in self-defense'
  },
  CRIME_THEFT_POOR: {
    dimensions: { GREED: 5, CHARITY: -8, HONOR: -3 },
    witnessChance: 0.7,
    severity: 'MAJOR',
    description: 'Stole from the poor'
  },
  CRIME_THEFT_RICH: {
    dimensions: { GREED: 3, CHAOS: 2 },
    witnessChance: 0.5,
    severity: 'MODERATE',
    description: 'Stole from the wealthy'
  },
  CRIME_THEFT_GANG: {
    dimensions: { GREED: 4, LOYALTY: -8, HONOR: -5 },
    witnessChance: 0.8,
    severity: 'MAJOR',
    description: 'Stole from your own gang'
  },
  CRIME_ASSAULT: {
    dimensions: { CRUELTY: 4, CHAOS: 3 },
    witnessChance: 0.6,
    severity: 'MODERATE',
    description: 'Assaulted someone'
  },
  CRIME_ROBBERY: {
    dimensions: { GREED: 4, CHAOS: 3, HONOR: -2 },
    witnessChance: 0.7,
    severity: 'MODERATE',
    description: 'Committed robbery'
  },
  CRIME_ARSON: {
    dimensions: { CHAOS: 8, CRUELTY: 4 },
    witnessChance: 0.85,
    severity: 'MAJOR',
    description: 'Set fire to property'
  },

  // ==================== COMBAT ACTIONS ====================
  COMBAT_SPARE_ENEMY: {
    dimensions: { MERCY: 8, HONOR: 3, SURVIVAL: -2 },
    witnessChance: 0.8,
    severity: 'MAJOR',
    description: 'Showed mercy to a defeated foe'
  },
  COMBAT_EXECUTE_ENEMY: {
    dimensions: { CRUELTY: 5, MERCY: -5, SURVIVAL: 2 },
    witnessChance: 0.75,
    severity: 'MAJOR',
    description: 'Executed a defeated enemy'
  },
  COMBAT_FAIR_DUEL: {
    dimensions: { HONOR: 5, JUSTICE: 2 },
    witnessChance: 0.7,
    severity: 'MODERATE',
    description: 'Fought a fair duel'
  },
  COMBAT_AMBUSH: {
    dimensions: { DECEPTION: 5, HONOR: -5, SURVIVAL: 3 },
    witnessChance: 0.6,
    severity: 'MODERATE',
    description: 'Ambushed an enemy'
  },
  COMBAT_FLED: {
    dimensions: { SURVIVAL: 5, HONOR: -2 },
    witnessChance: 0.4,
    severity: 'MINOR',
    description: 'Fled from combat'
  },
  COMBAT_PROTECTED_CIVILIAN: {
    dimensions: { MERCY: 6, HONOR: 4, JUSTICE: 3 },
    witnessChance: 0.8,
    severity: 'MAJOR',
    description: 'Protected an innocent'
  },

  // ==================== SOCIAL ACTIONS ====================
  NPC_HELPED_FREE: {
    dimensions: { CHARITY: 5, MERCY: 3 },
    witnessChance: 0.5,
    severity: 'MODERATE',
    description: 'Helped someone without reward'
  },
  NPC_HELPED_PAID: {
    dimensions: { CHARITY: 2 },
    witnessChance: 0.3,
    severity: 'MINOR',
    description: 'Helped someone for payment'
  },
  NPC_BETRAYED: {
    dimensions: { DECEPTION: 8, LOYALTY: -10, HONOR: -5 },
    witnessChance: 0.9,
    severity: 'EXTREME',
    description: 'Betrayed someone who trusted you'
  },
  NPC_LIED_TO: {
    dimensions: { DECEPTION: 3, HONOR: -2 },
    witnessChance: 0.4,
    severity: 'MINOR',
    description: 'Told a lie'
  },
  NPC_KEPT_PROMISE: {
    dimensions: { HONOR: 4, LOYALTY: 3 },
    witnessChance: 0.6,
    severity: 'MODERATE',
    description: 'Kept a promise'
  },
  NPC_BROKE_PROMISE: {
    dimensions: { HONOR: -6, DECEPTION: 4, LOYALTY: -3 },
    witnessChance: 0.7,
    severity: 'MAJOR',
    description: 'Broke a promise'
  },

  // ==================== GANG ACTIONS ====================
  GANG_PROTECTED_MEMBER: {
    dimensions: { LOYALTY: 8, HONOR: 3 },
    witnessChance: 0.7,
    severity: 'MAJOR',
    description: 'Protected a gang member'
  },
  GANG_BETRAYED_MEMBER: {
    dimensions: { LOYALTY: -10, DECEPTION: 5 },
    witnessChance: 0.9,
    severity: 'EXTREME',
    description: 'Betrayed a gang member'
  },
  GANG_SHARED_LOOT: {
    dimensions: { CHARITY: 4, LOYALTY: 3, GREED: -2 },
    witnessChance: 0.5,
    severity: 'MODERATE',
    description: 'Shared loot fairly with gang'
  },
  GANG_HOARDED_LOOT: {
    dimensions: { GREED: 5, LOYALTY: -4 },
    witnessChance: 0.6,
    severity: 'MODERATE',
    description: 'Kept more than your share'
  },

  // ==================== ECONOMY ACTIONS ====================
  GAVE_TO_POOR: {
    dimensions: { CHARITY: 8, GREED: -3 },
    witnessChance: 0.7,
    severity: 'MAJOR',
    description: 'Gave generously to the needy'
  },
  EXPLOITED_WORKER: {
    dimensions: { GREED: 5, CRUELTY: 3, JUSTICE: -3 },
    witnessChance: 0.6,
    severity: 'MODERATE',
    description: 'Exploited a worker'
  },
  PAID_FAIR_WAGE: {
    dimensions: { JUSTICE: 3, HONOR: 2 },
    witnessChance: 0.4,
    severity: 'MINOR',
    description: 'Paid workers fairly'
  },
  LOAN_SHARK_ACTION: {
    dimensions: { GREED: 6, CRUELTY: 4 },
    witnessChance: 0.5,
    severity: 'MODERATE',
    description: 'Engaged in predatory lending'
  },

  // ==================== LAW ACTIONS ====================
  TURNED_IN_CRIMINAL: {
    dimensions: { JUSTICE: 5, LOYALTY: -2 },
    witnessChance: 0.7,
    severity: 'MODERATE',
    description: 'Turned in a criminal'
  },
  HELPED_CRIMINAL_ESCAPE: {
    dimensions: { CHAOS: 5, JUSTICE: -5, LOYALTY: 4 },
    witnessChance: 0.75,
    severity: 'MAJOR',
    description: 'Helped a criminal escape'
  },
  BRIBED_OFFICIAL: {
    dimensions: { CHAOS: 3, JUSTICE: -4, DECEPTION: 3 },
    witnessChance: 0.6,
    severity: 'MODERATE',
    description: 'Bribed an official'
  },
  REFUSED_BRIBE: {
    dimensions: { HONOR: 5, JUSTICE: 3 },
    witnessChance: 0.5,
    severity: 'MODERATE',
    description: 'Refused a bribe'
  },

  // ==================== GAMBLING ACTIONS ====================
  GAMBLING_CHEATED: {
    dimensions: { DECEPTION: 6, HONOR: -5, GREED: 3 },
    witnessChance: 0.8,
    severity: 'MAJOR',
    description: 'Cheated at gambling'
  },
  GAMBLING_FAIR_WIN: {
    dimensions: { HONOR: 2 },
    witnessChance: 0.4,
    severity: 'MINOR',
    description: 'Won fairly at gambling'
  },
  GAMBLING_HONORED_DEBT: {
    dimensions: { HONOR: 4, JUSTICE: 2 },
    witnessChance: 0.5,
    severity: 'MODERATE',
    description: 'Paid gambling debts'
  },
  GAMBLING_FLED_DEBT: {
    dimensions: { HONOR: -5, DECEPTION: 3, SURVIVAL: 2 },
    witnessChance: 0.7,
    severity: 'MAJOR',
    description: 'Fled from gambling debts'
  }
};

// ============================================================================
// DEITY AFFINITY WEIGHTS - How each deity responds to karma dimensions
// ============================================================================

export const DEITY_AFFINITY_WEIGHTS: Record<'GAMBLER' | 'OUTLAW_KING', Record<string, number>> = {
  GAMBLER: {
    MERCY: 0.3,
    CRUELTY: -0.2,
    GREED: -0.1,
    CHARITY: 0.2,
    JUSTICE: 0.8,
    CHAOS: -0.8,
    HONOR: 0.9,
    DECEPTION: -0.7,
    SURVIVAL: 0.1,
    LOYALTY: 0.5
  },
  OUTLAW_KING: {
    MERCY: 0.1,
    CRUELTY: 0.3,
    GREED: 0.2,
    CHARITY: -0.1,
    JUSTICE: -0.6,
    CHAOS: 0.9,
    HONOR: -0.3,
    DECEPTION: 0.4,
    SURVIVAL: 0.8,
    LOYALTY: 0.5
  }
};

// ============================================================================
// KARMA THRESHOLDS - When divine interventions trigger
// ============================================================================

export const KARMA_THRESHOLDS = {
  MINOR: 25,
  MODERATE: 50,
  MAJOR: 75,
  EXTREME: 90
} as const;

// ============================================================================
// BLESSING & CURSE DEFINITIONS
// ============================================================================

interface IBlessingTemplate {
  type: string;
  description: string;
  effect: Record<string, number | string>;
  durationHours: number | null;  // null = permanent until removal
  triggerDimension?: KarmaDimension;
}

interface ICurseTemplate {
  type: string;
  description: string;
  effect: Record<string, number | string>;
  durationHours: number | null;
  removalCondition: string;
  triggerDimension?: KarmaDimension;
}

const GAMBLER_BLESSINGS: IBlessingTemplate[] = [
  {
    type: 'FORTUNE_FAVOR',
    triggerDimension: 'HONOR',
    description: 'The Gambler smiles upon your honor. Luck favors the righteous.',
    effect: { luck_bonus: 15, gambling_bonus: 10 },
    durationHours: 168  // 1 week
  },
  {
    type: 'RIGHTEOUS_HAND',
    triggerDimension: 'JUSTICE',
    description: 'Your pursuit of justice has not gone unnoticed. Your hand strikes true.',
    effect: { combat_bonus: 10, accuracy: 5 },
    durationHours: 72
  },
  {
    type: 'GENTLE_TOUCH',
    triggerDimension: 'MERCY',
    description: 'Mercy shown returns tenfold. Others see the light in you.',
    effect: { reputation_bonus: 20, npc_disposition: 10 },
    durationHours: 168
  },
  {
    type: 'GAMBLERS_LUCK',
    description: 'The cards fall in your favor. For now.',
    effect: { general_luck: 10, critical_chance: 5 },
    durationHours: 48
  }
];

const GAMBLER_CURSES: ICurseTemplate[] = [
  {
    type: 'FATES_DISFAVOR',
    triggerDimension: 'CHAOS',
    description: 'Your chaos offends the natural order. Fortune turns her back.',
    effect: { luck_penalty: -20, gambling_penalty: -15 },
    durationHours: null,
    removalCondition: 'Complete 5 lawful actions'
  },
  {
    type: 'MARKED_LIAR',
    triggerDimension: 'DECEPTION',
    description: 'Your lies have weight now. Truth-seekers sense your deceit.',
    effect: { deception_penalty: -25, npc_disposition: -10 },
    durationHours: null,
    removalCondition: 'Speak only truth for 24 hours (no deception actions)'
  },
  {
    type: 'UNLUCKY_STREAK',
    description: 'The dice have turned against you. Every flip, a loss.',
    effect: { general_luck: -15, critical_chance: -10 },
    durationHours: null,
    removalCondition: 'Win 3 fair gambles'
  }
];

const OUTLAW_KING_BLESSINGS: IBlessingTemplate[] = [
  {
    type: 'WILD_SPIRIT',
    triggerDimension: 'CHAOS',
    description: 'The Outlaw King grins at your chaos. Let it flow through you.',
    effect: { crit_bonus: 20, damage_variance: 15 },
    durationHours: 72
  },
  {
    type: 'UNKILLABLE',
    triggerDimension: 'SURVIVAL',
    description: 'You refuse to die. The King respects that. So does your body.',
    effect: { damage_reduction: 15, health_regen: 5 },
    durationHours: 168
  },
  {
    type: 'SILVER_TONGUE',
    triggerDimension: 'DECEPTION',
    description: 'Your lies are art. The King appreciates the craft.',
    effect: { deception_bonus: 25, bribe_discount: 20 },
    durationHours: 72
  },
  {
    type: 'OUTLAWS_FREEDOM',
    description: 'Chains cannot hold you. Bars cannot cage you.',
    effect: { escape_bonus: 30, jail_time_reduction: 50 },
    durationHours: 168
  }
];

const OUTLAW_KING_CURSES: ICurseTemplate[] = [
  {
    type: 'CHAINS_OF_ORDER',
    triggerDimension: 'JUSTICE',
    description: 'Your devotion to law disgusts the King. Feel the weight of your chains.',
    effect: { movement_penalty: -20, energy_cost_increase: 10 },
    durationHours: null,
    removalCondition: 'Break 3 laws'
  },
  {
    type: 'FOOLS_MARK',
    triggerDimension: 'HONOR',
    description: 'Honor? How quaint. How weak. The mark of a fool is upon you.',
    effect: { combat_penalty: -15, intimidation: -20 },
    durationHours: null,
    removalCondition: 'Betray an ally or break an oath'
  },
  {
    type: 'BRANDED_COWARD',
    description: 'The King despises cowards. Prove you have spine or suffer.',
    effect: { fear_penalty: 25, reputation_penalty: -15 },
    durationHours: null,
    removalCondition: 'Face death without flinching (survive combat at <10% HP)'
  }
];

// ============================================================================
// KARMA SERVICE CLASS
// ============================================================================

class KarmaService {
  /**
   * Record a karma-affecting action for a character
   * Main entry point for the karma system
   */
  async recordAction(
    characterId: string | Types.ObjectId,
    actionType: string,
    context: string = '',
    session?: mongoose.ClientSession
  ): Promise<{
    karma: ICharacterKarma;
    intervention: IDivineManifestation | null;
  }> {
    const rule = KARMA_RULES[actionType];
    if (!rule) {
      logger.warn(`Unknown karma action type: ${actionType}`);
      return { karma: await this.getOrCreateKarma(characterId), intervention: null };
    }

    // Determine if a deity witnesses this action (done once, outside retry loop)
    const witness = this.determineWitness(rule.witnessChance);

    // Retry logic for optimistic concurrency control
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.recordActionAttempt(characterId, actionType, context, rule, witness, session);
      } catch (error: unknown) {
        // Check if it's a version conflict error (MongoDB E11000 or VersionError)
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isVersionConflict = errorMessage.includes('VersionError') ||
          errorMessage.includes('version') ||
          errorMessage.includes('E11000');

        if (isVersionConflict && attempt < maxRetries - 1) {
          // Exponential backoff: 50ms, 100ms, 200ms
          const delay = 50 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          logger.debug(`Karma record version conflict, retrying (attempt ${attempt + 2}/${maxRetries})`);
          lastError = error instanceof Error ? error : new Error(errorMessage);
          continue;
        }
        throw error;
      }
    }

    // If we get here, all retries failed
    logger.error(`Failed to record karma action after ${maxRetries} attempts`, { characterId, actionType, error: lastError });
    throw lastError || new Error('Failed to record karma action');
  }

  /**
   * Single attempt to record a karma action
   * Separated for retry logic
   */
  private async recordActionAttempt(
    characterId: string | Types.ObjectId,
    actionType: string,
    context: string,
    rule: IKarmaRule,
    witness: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH' | 'NONE',
    session?: mongoose.ClientSession
  ): Promise<{
    karma: ICharacterKarma;
    intervention: IDivineManifestation | null;
  }> {
    // Get or create karma record
    let karma = await this.getOrCreateKarma(characterId, session);

    // Determine primary dimension (highest absolute delta for deterministic selection)
    let primaryDimension: KarmaDimension = 'HONOR';
    let primaryDelta = 0;
    for (const [dimension, delta] of Object.entries(rule.dimensions)) {
      if (Math.abs(delta as number) > Math.abs(primaryDelta)) {
        primaryDimension = dimension.toUpperCase() as KarmaDimension;
        primaryDelta = delta as number;
      }
    }

    // Apply karma dimension changes
    const changes: IKarmaAction = {
      actionType,
      dimension: primaryDimension,
      delta: primaryDelta,
      timestamp: new Date(),
      context: context || rule.description,
      witnessedByDeity: witness
    };

    // Update all affected dimensions
    for (const [dimension, delta] of Object.entries(rule.dimensions)) {
      const dimKey = dimension.toLowerCase() as keyof typeof karma.karma;
      const currentValue = karma.karma[dimKey] || 0;
      karma.karma[dimKey] = Math.max(-100, Math.min(100, currentValue + delta));
    }

    // Update deity affinities
    this.updateDeityAffinities(karma, rule.dimensions, witness);

    // Add to recent actions (keep last 100)
    karma.recentActions.push(changes);
    if (karma.recentActions.length > 100) {
      karma.recentActions = karma.recentActions.slice(-100);
    }
    karma.totalActions++;

    // Check for divine intervention
    let intervention: IDivineManifestation | null = null;
    if (witness !== 'NONE') {
      const threshold = await this.checkDivineIntervention(karma, witness, rule);
      if (threshold) {
        intervention = await this.generateIntervention(karma, witness, threshold, rule, session);
      }
    }

    // Save karma record with version check (Mongoose optimistic concurrency)
    if (session) {
      await karma.save({ session });
    } else {
      await karma.save();
    }

    // Update deity attention based on action (proactive AI system)
    await this.updateDeityAttention(characterId, karma, rule, witness);

    logger.debug(`Karma recorded for character ${characterId}: ${actionType}`, {
      dimensions: rule.dimensions,
      witness,
      intervention: intervention ? intervention.type : null
    });

    return { karma, intervention };
  }

  /**
   * Update deity attention records when karma changes
   * This connects the reactive karma system to the proactive deity AI engine
   */
  private async updateDeityAttention(
    characterId: string | Types.ObjectId,
    karma: ICharacterKarma,
    rule: IKarmaRule,
    witness: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH' | 'NONE'
  ): Promise<void> {
    try {
      const charIdStr = characterId.toString();

      // Update attention for both deities
      const deities: DeityName[] = ['GAMBLER', 'OUTLAW_KING'];

      for (const deity of deities) {
        // Get or create attention record
        const attention = await DeityAttention.getOrCreate(charIdStr, deity);

        // Update karma trajectory
        const trajectory = await deityDecisionService.analyzeKarmaTrajectory(karma, deity);
        attention.karmaTrajectory = trajectory.direction;

        // Calculate new attention level
        const newAttention = await deityDecisionService.calculateAttention(karma, deity);
        attention.attention = newAttention;

        // Calculate interest level
        attention.interest = await deityDecisionService.calculateInterest(karma, charIdStr, deity);

        // Update triggers based on karma state
        await deityDecisionService.updateAttentionTriggers(attention, karma, charIdStr);

        // Boost attention if this deity witnessed the action
        if (witness === deity || witness === 'BOTH') {
          const attentionBoost = rule.severity === 'EXTREME' ? 15 :
            rule.severity === 'MAJOR' ? 10 :
            rule.severity === 'MODERATE' ? 5 : 2;
          attention.attention = Math.min(100, attention.attention + attentionBoost);
        }

        await attention.save();
      }
    } catch (error) {
      // Don't fail the karma recording if attention update fails
      logger.error('Error updating deity attention:', error);
    }
  }

  /**
   * Determine which deity (if any) witnesses an action
   */
  private determineWitness(witnessChance: number): 'GAMBLER' | 'OUTLAW_KING' | 'BOTH' | 'NONE' {
    const roll = Math.random();

    if (roll > witnessChance) {
      return 'NONE';
    }

    // Both deities watching is rare
    if (roll < witnessChance * 0.1) {
      return 'BOTH';
    }

    // Random selection between deities
    return Math.random() < 0.5 ? 'GAMBLER' : 'OUTLAW_KING';
  }

  /**
   * Update deity affinities based on karma changes
   */
  private updateDeityAffinities(
    karma: ICharacterKarma,
    changes: Partial<Record<KarmaDimension, number>>,
    witness: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH' | 'NONE'
  ): void {
    for (const [dimension, delta] of Object.entries(changes)) {
      const dimUpper = dimension.toUpperCase();

      // Calculate Gambler affinity change
      const gamblerWeight = DEITY_AFFINITY_WEIGHTS.GAMBLER[dimUpper] || 0;
      const gamblerDelta = delta * gamblerWeight * (witness === 'GAMBLER' || witness === 'BOTH' ? 1.5 : 1);
      karma.gamblerAffinity = Math.max(-100, Math.min(100, karma.gamblerAffinity + gamblerDelta));

      // Calculate Outlaw King affinity change
      const outlawWeight = DEITY_AFFINITY_WEIGHTS.OUTLAW_KING[dimUpper] || 0;
      const outlawDelta = delta * outlawWeight * (witness === 'OUTLAW_KING' || witness === 'BOTH' ? 1.5 : 1);
      karma.outlawKingAffinity = Math.max(-100, Math.min(100, karma.outlawKingAffinity + outlawDelta));
    }
  }

  /**
   * Check if karma thresholds have been crossed for divine intervention
   */
  private async checkDivineIntervention(
    karma: ICharacterKarma,
    witness: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH',
    rule: IKarmaRule
  ): Promise<'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME' | null> {
    const affinity = witness === 'GAMBLER'
      ? karma.gamblerAffinity
      : witness === 'OUTLAW_KING'
        ? karma.outlawKingAffinity
        : Math.max(Math.abs(karma.gamblerAffinity), Math.abs(karma.outlawKingAffinity));

    const absAffinity = Math.abs(affinity);

    // Check thresholds in descending order
    const thresholds: Array<'EXTREME' | 'MAJOR' | 'MODERATE' | 'MINOR'> = ['EXTREME', 'MAJOR', 'MODERATE', 'MINOR'];

    for (const tier of thresholds) {
      const threshold = KARMA_THRESHOLDS[tier];

      if (absAffinity >= threshold) {
        // LOGIC-1 FIX: Check all dimensions affected by this action, not just the first one
        // An action can affect multiple karma dimensions, so we need to check if ANY of them
        // have a threshold that was recently triggered at this tier
        const affectedDimensions = Object.keys(rule.dimensions) as KarmaDimension[];

        // Find if any dimension has a recent threshold trigger
        const recentTrigger = affectedDimensions.find(dimension => {
          const existingThreshold = karma.thresholds.find(t =>
            t.tier === tier && t.dimension === dimension
          );
          if (!existingThreshold || !existingThreshold.lastTriggered) {
            return false; // Not triggered yet, so not blocking
          }
          const hoursSince = (Date.now() - existingThreshold.lastTriggered.getTime()) / (1000 * 60 * 60);
          return hoursSince < 24; // Returns true if on cooldown (blocking)
        });

        // If no dimension is on cooldown for this tier, allow intervention
        if (!recentTrigger) {
          return tier;
        }
      }
    }

    return null;
  }

  /**
   * Generate a divine intervention (blessing or curse)
   */
  private async generateIntervention(
    karma: ICharacterKarma,
    witness: 'GAMBLER' | 'OUTLAW_KING' | 'BOTH',
    tier: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME',
    rule: IKarmaRule,
    session?: mongoose.ClientSession
  ): Promise<IDivineManifestation | null> {
    // Determine which deity acts (if BOTH, pick the one with stronger affinity)
    let actingDeity: DeityName;
    if (witness === 'BOTH') {
      actingDeity = Math.abs(karma.gamblerAffinity) >= Math.abs(karma.outlawKingAffinity)
        ? 'GAMBLER'
        : 'OUTLAW_KING';
    } else {
      actingDeity = witness;
    }

    const affinity = actingDeity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;
    const isPositive = affinity > 0;

    // Select and apply blessing or curse
    let manifestationType: ManifestationType;
    let message: string;
    let effect: Record<string, unknown>;

    if (isPositive) {
      const blessing = this.selectBlessing(actingDeity, tier, Object.keys(rule.dimensions)[0] as KarmaDimension);
      manifestationType = 'BLESSING';
      message = blessing.description;
      effect = blessing.effect;

      // Add blessing to karma record
      const newBlessing: IBlessing = {
        source: actingDeity,
        type: blessing.type,
        power: tier === 'EXTREME' ? 3 : tier === 'MAJOR' ? 2 : 1,
        expiresAt: blessing.durationHours ? new Date(Date.now() + blessing.durationHours * 60 * 60 * 1000) : null,
        description: blessing.description,
        grantedAt: new Date()
      };
      karma.blessings.push(newBlessing);
    } else {
      const curse = this.selectCurse(actingDeity, tier, Object.keys(rule.dimensions)[0] as KarmaDimension);
      manifestationType = 'CURSE';
      message = curse.description;
      effect = { ...curse.effect, removalCondition: curse.removalCondition };

      // Add curse to karma record
      const newCurse: ICurse = {
        source: actingDeity,
        type: curse.type,
        severity: tier === 'EXTREME' ? 3 : tier === 'MAJOR' ? 2 : 1,
        expiresAt: curse.durationHours ? new Date(Date.now() + curse.durationHours * 60 * 60 * 1000) : null,
        description: curse.description,
        removalCondition: curse.removalCondition,
        inflictedAt: new Date()
      };
      karma.curses.push(newCurse);
    }

    // Update threshold tracking
    const dimension = Object.keys(rule.dimensions)[0] as KarmaDimension;
    const existingThreshold = karma.thresholds.find(t => t.tier === tier && t.dimension === dimension);
    if (existingThreshold) {
      existingThreshold.lastTriggered = new Date();
      existingThreshold.value = Math.abs(affinity);
    } else {
      karma.thresholds.push({
        dimension,
        value: Math.abs(affinity),
        tier,
        lastTriggered: new Date()
      });
    }

    // Create manifestation record
    const manifestation = new DivineManifestation({
      deityName: actingDeity,
      targetCharacterId: karma.characterId,
      type: manifestationType,
      message,
      effect: JSON.stringify(effect),
      urgency: tier === 'EXTREME' ? 'CRITICAL' : tier === 'MAJOR' ? 'HIGH' : tier === 'MODERATE' ? 'MEDIUM' : 'LOW',
      triggeringKarma: {
        dimension,
        value: affinity,
        threshold: tier
      }
    });

    if (session) {
      await manifestation.save({ session });
    } else {
      await manifestation.save();
    }

    // Update deity statistics (if DeityAgent model is being used)
    // This is deferred to a future implementation

    logger.info(`Divine intervention triggered for character ${karma.characterId}`, {
      deity: actingDeity,
      type: manifestationType,
      tier,
      affinity
    });

    return manifestation;
  }

  /**
   * Select an appropriate blessing based on deity, tier, and triggering dimension
   */
  private selectBlessing(deity: DeityName, tier: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME', dimension: KarmaDimension): IBlessingTemplate {
    const blessings = deity === 'GAMBLER' ? GAMBLER_BLESSINGS : OUTLAW_KING_BLESSINGS;

    // Try to find dimension-specific blessing
    const dimBlessing = blessings.find(b => b.triggerDimension === dimension);
    if (dimBlessing && (tier === 'MAJOR' || tier === 'EXTREME')) {
      return dimBlessing;
    }

    // Fall back to default blessing
    const defaultBlessing = blessings.find(b => !b.triggerDimension);
    return defaultBlessing || blessings[0];
  }

  /**
   * Select an appropriate curse based on deity, tier, and triggering dimension
   */
  private selectCurse(deity: DeityName, tier: 'MINOR' | 'MODERATE' | 'MAJOR' | 'EXTREME', dimension: KarmaDimension): ICurseTemplate {
    const curses = deity === 'GAMBLER' ? GAMBLER_CURSES : OUTLAW_KING_CURSES;

    // Try to find dimension-specific curse
    const dimCurse = curses.find(c => c.triggerDimension === dimension);
    if (dimCurse && (tier === 'MAJOR' || tier === 'EXTREME')) {
      return dimCurse;
    }

    // Fall back to default curse
    const defaultCurse = curses.find(c => !c.triggerDimension);
    return defaultCurse || curses[0];
  }

  /**
   * Get or create karma record for a character
   */
  async getOrCreateKarma(
    characterId: string | Types.ObjectId,
    session?: mongoose.ClientSession
  ): Promise<ICharacterKarma> {
    let karma = await CharacterKarma.findOne({ characterId }).session(session || null);

    if (!karma) {
      karma = new CharacterKarma({
        characterId,
        karma: {
          mercy: 0,
          cruelty: 0,
          greed: 0,
          charity: 0,
          justice: 0,
          chaos: 0,
          honor: 0,
          deception: 0,
          survival: 0,
          loyalty: 0
        },
        gamblerAffinity: 0,
        outlawKingAffinity: 0
      });

      if (session) {
        await karma.save({ session });
      } else {
        await karma.save();
      }
    }

    return karma;
  }

  /**
   * Get karma summary for a character
   */
  async getKarmaSummary(characterId: string | Types.ObjectId): Promise<{
    karma: ICharacterKarma;
    dominantTrait: { trait: string; value: number; isPositive: boolean };
    gamblerRelationship: string;
    outlawKingRelationship: string;
    activeBlessings: IBlessing[];
    activeCurses: ICurse[];
    moralConflict: string | null;
  }> {
    const karma = await this.getOrCreateKarma(characterId);

    return {
      karma,
      dominantTrait: karma.getDominantTrait(),
      gamblerRelationship: karma.getDeityRelationship('GAMBLER'),
      outlawKingRelationship: karma.getDeityRelationship('OUTLAW_KING'),
      activeBlessings: karma.getActiveBlessings(),
      activeCurses: karma.getActiveCurses(),
      moralConflict: karma.detectMoralConflict()
    };
  }

  /**
   * Get undelivered divine messages for a character
   */
  async getUndeliveredManifestations(characterId: string | Types.ObjectId): Promise<IDivineManifestation[]> {
    return DivineManifestation.findUndelivered(characterId);
  }

  /**
   * Get unacknowledged divine messages
   */
  async getUnacknowledgedManifestations(characterId: string | Types.ObjectId): Promise<IDivineManifestation[]> {
    return DivineManifestation.findUnacknowledged(characterId);
  }

  /**
   * Mark a manifestation as delivered
   */
  async markManifestationDelivered(manifestationId: string | Types.ObjectId): Promise<void> {
    const manifestation = await DivineManifestation.findById(manifestationId);
    if (manifestation) {
      await manifestation.markDelivered();
    }
  }

  /**
   * Mark a manifestation as acknowledged with optional response
   */
  async acknowledgeManifestations(
    manifestationId: string | Types.ObjectId,
    response?: string
  ): Promise<void> {
    const manifestation = await DivineManifestation.findById(manifestationId);
    if (manifestation) {
      await manifestation.markAcknowledged(response);
    }
  }

  /**
   * Remove an expired curse
   */
  async removeCurse(
    characterId: string | Types.ObjectId,
    curseType: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    const karma = await this.getOrCreateKarma(characterId, session);

    const curseIndex = karma.curses.findIndex(c => c.type === curseType);
    if (curseIndex === -1) {
      return false;
    }

    karma.curses.splice(curseIndex, 1);

    if (session) {
      await karma.save({ session });
    } else {
      await karma.save();
    }

    logger.info(`Curse ${curseType} removed from character ${characterId}`);
    return true;
  }

  /**
   * Remove an expired blessing
   */
  async removeBlessing(
    characterId: string | Types.ObjectId,
    blessingType: string,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    const karma = await this.getOrCreateKarma(characterId, session);

    const blessingIndex = karma.blessings.findIndex(b => b.type === blessingType);
    if (blessingIndex === -1) {
      return false;
    }

    karma.blessings.splice(blessingIndex, 1);

    if (session) {
      await karma.save({ session });
    } else {
      await karma.save();
    }

    logger.info(`Blessing ${blessingType} removed from character ${characterId}`);
    return true;
  }

  /**
   * Get manifestation history for a character
   */
  async getManifestationHistory(
    characterId: string | Types.ObjectId,
    options: {
      deity?: DeityName;
      type?: ManifestationType;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<IDivineManifestation[]> {
    return DivineManifestation.getManifestationHistory(characterId, options);
  }

  /**
   * Check if character has specific blessing type
   */
  async hasBlessing(characterId: string | Types.ObjectId, blessingType: string): Promise<boolean> {
    const karma = await this.getOrCreateKarma(characterId);
    return karma.hasBlessing(blessingType);
  }

  /**
   * Check if character has specific curse type
   */
  async hasCurse(characterId: string | Types.ObjectId, curseType: string): Promise<boolean> {
    const karma = await this.getOrCreateKarma(characterId);
    return karma.hasCurse(curseType);
  }

  /**
   * Get all characters being watched by a specific deity
   */
  async getWatchedCharacters(deity: DeityName, limit: number = 100): Promise<ICharacterKarma[]> {
    return CharacterKarma.findWatchedByDeity(deity, limit);
  }
}

export const karmaService = new KarmaService();
export default karmaService;
