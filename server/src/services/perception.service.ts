/**
 * Perception Service
 * Handles skill-based intelligence gathering during PvP duels
 *
 * Passive abilities reveal hints based on skill level differences
 * Active abilities allow targeted reads with energy cost
 */

import { Card, BettingAction } from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

// =============================================================================
// TYPES
// =============================================================================

export enum PerceptionHintType {
  CONFIDENCE = 'confidence',
  HAND_RANGE = 'hand_range',
  BEHAVIOR_TELL = 'behavior_tell',
  PARTIAL_REVEAL = 'partial_reveal',
  ACTION_PREDICT = 'action_predict',
  FALSE_TELL = 'false_tell'
}

export interface PerceptionHint {
  type: PerceptionHintType;
  message: string;
  confidence: number; // 0-1, how reliable the hint is
  revealedCard?: Card; // For partial reveal type
  predictedAction?: BettingAction; // For action predict type
}

export enum DuelAbility {
  READ_OPPONENT = 'read_opponent',
  COLD_READ = 'cold_read',
  POKER_FACE = 'poker_face',
  FALSE_TELL = 'false_tell',
  PEEK = 'peek',
  MARK_CARDS = 'mark_cards',
  REROLL = 'reroll',
  PALM_CARD = 'palm_card'
}

export interface AbilityResult {
  success: boolean;
  ability: DuelAbility;
  effect?: {
    hints?: PerceptionHint[];
    blockedRounds?: number;
    revealedCards?: Card[];
  };
  energyCost: number;
  cooldownRounds: number;
  message: string;
  detected?: boolean; // True if cheat was detected by opponent
}

export interface ContestResult {
  success: boolean;
  margin: number;
  attackerRoll: number;
  defenderRoll: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ABILITY_COSTS: Record<DuelAbility, number> = {
  [DuelAbility.READ_OPPONENT]: 10,
  [DuelAbility.COLD_READ]: 25,
  [DuelAbility.POKER_FACE]: 20,
  [DuelAbility.FALSE_TELL]: 15,
  [DuelAbility.PEEK]: 5,
  [DuelAbility.MARK_CARDS]: 30,
  [DuelAbility.REROLL]: 15,
  [DuelAbility.PALM_CARD]: 40
};

const ABILITY_COOLDOWNS: Record<DuelAbility, number> = {
  [DuelAbility.READ_OPPONENT]: 2,
  [DuelAbility.COLD_READ]: 3,
  [DuelAbility.POKER_FACE]: 4,
  [DuelAbility.FALSE_TELL]: 2,
  [DuelAbility.PEEK]: 1,
  [DuelAbility.MARK_CARDS]: 5,
  [DuelAbility.REROLL]: 2,
  [DuelAbility.PALM_CARD]: 5
};

// Confidence messages based on hand strength
const CONFIDENCE_MESSAGES = {
  weak: [
    "They seem nervous...",
    "Their hands are shaking slightly",
    "They're avoiding eye contact",
    "A bead of sweat forms on their brow"
  ],
  moderate: [
    "They appear calm",
    "Their expression is neutral",
    "They maintain steady breathing",
    "A professional composure"
  ],
  strong: [
    "They seem very confident",
    "A slight smile plays at their lips",
    "They're relaxed and assured",
    "Their eyes gleam with anticipation"
  ]
};

// Hand range messages
const HAND_RANGE_MESSAGES = {
  weak: [
    "Probably a weak hand",
    "Doesn't look like they hit anything",
    "Their cards aren't cooperating"
  ],
  moderate: [
    "A decent hand, perhaps",
    "Something playable",
    "Middle of the road"
  ],
  strong: [
    "They might have something good",
    "Could be a strong hand",
    "They seem to like their cards"
  ],
  very_strong: [
    "They're sitting on something big",
    "A powerful hand, likely",
    "Be very careful here"
  ]
};

// Behavior tells
const BEHAVIOR_TELLS = {
  bluffing: [
    "They're considering a bluff",
    "Watch out - false confidence detected",
    "Their bravado seems manufactured"
  ],
  genuine: [
    "They believe in their hand",
    "No deception sensed",
    "Playing it straight"
  ],
  uncertain: [
    "They're unsure themselves",
    "Wavering between options",
    "Could go either way"
  ]
};

// =============================================================================
// SERVICE CLASS
// =============================================================================

class PerceptionService {
  /**
   * Calculate passive perception hints based on skill levels
   *
   * @param perceiverLevel - Perception skill level of the observer
   * @param opponentPokerFaceLevel - Poker Face skill level of the opponent
   * @param opponentHand - The opponent's actual hand
   * @param opponentBettingPattern - Recent betting actions for behavior analysis
   * @param handStrength - Calculated hand strength (1-10)
   */
  getPassiveHints(
    perceiverLevel: number,
    opponentPokerFaceLevel: number,
    opponentHand: Card[],
    opponentBettingPattern: BettingAction[],
    handStrength: number
  ): PerceptionHint[] {
    const hints: PerceptionHint[] = [];

    // Calculate effective perception (reduced by opponent's poker face)
    const pokerFaceMitigation = Math.floor(opponentPokerFaceLevel / 10) * 5;
    const effectivePerception = Math.max(1, perceiverLevel - pokerFaceMitigation);

    logger.debug(`[Perception] Effective level: ${effectivePerception} (base ${perceiverLevel}, mitigated by ${pokerFaceMitigation})`);

    // Tier 1 (Level 1-10): Confidence reading
    if (effectivePerception >= 1) {
      const confidenceHint = this.generateConfidenceHint(handStrength, effectivePerception);
      if (confidenceHint) hints.push(confidenceHint);
    }

    // Tier 2 (Level 11-20): Hand range estimation
    if (effectivePerception >= 11) {
      const rangeHint = this.generateHandRangeHint(handStrength, effectivePerception);
      if (rangeHint) hints.push(rangeHint);
    }

    // Tier 3 (Level 21-35): Behavior tells
    if (effectivePerception >= 21) {
      const behaviorHint = this.generateBehaviorTell(opponentBettingPattern, handStrength, effectivePerception);
      if (behaviorHint) hints.push(behaviorHint);
    }

    // Tier 4 (Level 36-45): Partial card reveal
    if (effectivePerception >= 36) {
      const revealHint = this.generatePartialReveal(opponentHand, effectivePerception);
      if (revealHint) hints.push(revealHint);
    }

    // Tier 5 (Level 46-50): Action prediction
    if (effectivePerception >= 46) {
      const predictHint = this.generateActionPrediction(opponentBettingPattern, handStrength, effectivePerception);
      if (predictHint) hints.push(predictHint);
    }

    return hints;
  }

  /**
   * Generate confidence-based hint
   */
  private generateConfidenceHint(handStrength: number, perceptionLevel: number): PerceptionHint | null {
    // Random chance to trigger based on perception level
    const triggerChance = 0.3 + (perceptionLevel * 0.01);
    if (!SecureRNG.chance(triggerChance)) return null;

    let category: 'weak' | 'moderate' | 'strong';
    if (handStrength <= 3) category = 'weak';
    else if (handStrength <= 6) category = 'moderate';
    else category = 'strong';

    const messages = CONFIDENCE_MESSAGES[category];
    const message = SecureRNG.select(messages);

    // Confidence in the hint accuracy
    const confidence = 0.5 + (perceptionLevel * 0.01);

    return {
      type: PerceptionHintType.CONFIDENCE,
      message,
      confidence: Math.min(0.95, confidence)
    };
  }

  /**
   * Generate hand range hint
   */
  private generateHandRangeHint(handStrength: number, perceptionLevel: number): PerceptionHint | null {
    const triggerChance = 0.25 + ((perceptionLevel - 10) * 0.015);
    if (!SecureRNG.chance(triggerChance)) return null;

    let category: 'weak' | 'moderate' | 'strong' | 'very_strong';
    if (handStrength <= 2) category = 'weak';
    else if (handStrength <= 5) category = 'moderate';
    else if (handStrength <= 7) category = 'strong';
    else category = 'very_strong';

    const messages = HAND_RANGE_MESSAGES[category];
    const message = SecureRNG.select(messages);

    const confidence = 0.4 + ((perceptionLevel - 10) * 0.02);

    return {
      type: PerceptionHintType.HAND_RANGE,
      message,
      confidence: Math.min(0.9, confidence)
    };
  }

  /**
   * Generate behavior tell hint
   */
  private generateBehaviorTell(
    bettingPattern: BettingAction[],
    handStrength: number,
    perceptionLevel: number
  ): PerceptionHint | null {
    const triggerChance = 0.2 + ((perceptionLevel - 20) * 0.02);
    if (!SecureRNG.chance(triggerChance)) return null;

    // Analyze if they're likely bluffing (betting aggressively with weak hand)
    const aggressiveBets = bettingPattern.filter(
      a => a === BettingAction.BET || a === BettingAction.RAISE || a === BettingAction.ALL_IN
    ).length;

    let category: 'bluffing' | 'genuine' | 'uncertain';

    if (aggressiveBets > 2 && handStrength <= 3) {
      category = 'bluffing';
    } else if (handStrength >= 6) {
      category = 'genuine';
    } else {
      category = 'uncertain';
    }

    const messages = BEHAVIOR_TELLS[category];
    const message = SecureRNG.select(messages);

    const confidence = 0.35 + ((perceptionLevel - 20) * 0.025);

    return {
      type: PerceptionHintType.BEHAVIOR_TELL,
      message,
      confidence: Math.min(0.85, confidence)
    };
  }

  /**
   * Generate partial card reveal
   */
  private generatePartialReveal(opponentHand: Card[], perceptionLevel: number): PerceptionHint | null {
    const triggerChance = 0.15 + ((perceptionLevel - 35) * 0.03);
    if (!SecureRNG.chance(triggerChance)) return null;

    if (!opponentHand || opponentHand.length === 0) return null;

    // Reveal a random card
    const revealedCard = SecureRNG.select(opponentHand);

    const confidence = 0.8 + ((perceptionLevel - 35) * 0.02);

    return {
      type: PerceptionHintType.PARTIAL_REVEAL,
      message: `You glimpse one of their cards...`,
      confidence: Math.min(0.99, confidence),
      revealedCard
    };
  }

  /**
   * Generate action prediction
   */
  private generateActionPrediction(
    bettingPattern: BettingAction[],
    handStrength: number,
    perceptionLevel: number
  ): PerceptionHint | null {
    const triggerChance = 0.15 + ((perceptionLevel - 45) * 0.05);
    if (!SecureRNG.chance(triggerChance)) return null;

    // Predict based on hand strength and pattern
    let predictedAction: BettingAction;

    if (handStrength >= 7) {
      predictedAction = SecureRNG.chance(0.7) ? BettingAction.RAISE : BettingAction.BET;
    } else if (handStrength >= 4) {
      predictedAction = SecureRNG.chance(0.5) ? BettingAction.CALL : BettingAction.CHECK;
    } else {
      predictedAction = SecureRNG.chance(0.4) ? BettingAction.FOLD : BettingAction.CHECK;
    }

    const actionNames: Record<BettingAction, string> = {
      [BettingAction.CHECK]: 'check',
      [BettingAction.BET]: 'bet',
      [BettingAction.CALL]: 'call',
      [BettingAction.RAISE]: 'raise',
      [BettingAction.FOLD]: 'fold',
      [BettingAction.ALL_IN]: 'go all in'
    };

    const confidence = 0.5 + ((perceptionLevel - 45) * 0.05);

    return {
      type: PerceptionHintType.ACTION_PREDICT,
      message: `They'll likely ${actionNames[predictedAction]}`,
      confidence: Math.min(0.8, confidence),
      predictedAction
    };
  }

  /**
   * Process active ability use
   */
  useAbility(
    ability: DuelAbility,
    attackerPerceptionLevel: number,
    defenderSkillLevel: number, // Deception for READ_OPPONENT, Poker Face for COLD_READ, etc.
    opponentHand: Card[],
    currentEnergy: number
  ): AbilityResult {
    const energyCost = ABILITY_COSTS[ability];
    const cooldown = ABILITY_COOLDOWNS[ability];

    // Check energy
    if (currentEnergy < energyCost) {
      return {
        success: false,
        ability,
        energyCost: 0,
        cooldownRounds: 0,
        message: 'Not enough energy'
      };
    }

    // Process ability
    switch (ability) {
      case DuelAbility.READ_OPPONENT:
        return this.processReadOpponent(attackerPerceptionLevel, defenderSkillLevel, opponentHand, energyCost, cooldown);

      case DuelAbility.COLD_READ:
        return this.processColdRead(attackerPerceptionLevel, defenderSkillLevel, opponentHand, energyCost, cooldown);

      case DuelAbility.POKER_FACE:
        return this.processPokerFace(energyCost, cooldown);

      case DuelAbility.FALSE_TELL:
        return this.processFalseTell(attackerPerceptionLevel, defenderSkillLevel, energyCost, cooldown);

      default:
        return {
          success: false,
          ability,
          energyCost: 0,
          cooldownRounds: 0,
          message: 'Unknown ability'
        };
    }
  }

  /**
   * Read Opponent - Contest vs Deception to reveal 1-2 cards
   */
  private processReadOpponent(
    perceptionLevel: number,
    deceptionLevel: number,
    opponentHand: Card[],
    energyCost: number,
    cooldown: number
  ): AbilityResult {
    const contest = this.contestRoll(perceptionLevel, deceptionLevel);

    if (!contest.success) {
      return {
        success: false,
        ability: DuelAbility.READ_OPPONENT,
        energyCost,
        cooldownRounds: cooldown,
        message: 'Your opponent\'s deception blocks your read'
      };
    }

    // Reveal 1-2 cards based on margin
    const cardsToReveal = contest.margin > 15 ? 2 : 1;
    const revealedCards: Card[] = [];
    const shuffled = SecureRNG.shuffle([...opponentHand]);

    for (let i = 0; i < cardsToReveal && i < shuffled.length; i++) {
      revealedCards.push(shuffled[i]);
    }

    return {
      success: true,
      ability: DuelAbility.READ_OPPONENT,
      effect: {
        revealedCards,
        hints: revealedCards.map(card => ({
          type: PerceptionHintType.PARTIAL_REVEAL,
          message: 'Your keen eye spots a card',
          confidence: 1.0,
          revealedCard: card
        }))
      },
      energyCost,
      cooldownRounds: cooldown,
      message: `You read ${revealedCards.length} of their cards!`
    };
  }

  /**
   * Cold Read - Contest vs Poker Face to reveal exact hand strength
   */
  private processColdRead(
    perceptionLevel: number,
    pokerFaceLevel: number,
    opponentHand: Card[],
    energyCost: number,
    cooldown: number
  ): AbilityResult {
    const contest = this.contestRoll(perceptionLevel, pokerFaceLevel);

    if (!contest.success) {
      return {
        success: false,
        ability: DuelAbility.COLD_READ,
        energyCost,
        cooldownRounds: cooldown,
        message: 'Their poker face gives nothing away'
      };
    }

    // Calculate actual hand strength (would integrate with poker evaluation)
    // For now, return a hint about hand type
    return {
      success: true,
      ability: DuelAbility.COLD_READ,
      effect: {
        hints: [{
          type: PerceptionHintType.HAND_RANGE,
          message: 'You see through their facade - you know exactly what they hold',
          confidence: 1.0
        }]
      },
      energyCost,
      cooldownRounds: cooldown,
      message: 'Cold read successful - their hand is revealed to you'
    };
  }

  /**
   * Poker Face - Block all reads for X rounds
   */
  private processPokerFace(energyCost: number, cooldown: number): AbilityResult {
    return {
      success: true,
      ability: DuelAbility.POKER_FACE,
      effect: {
        blockedRounds: 2
      },
      energyCost,
      cooldownRounds: cooldown,
      message: 'Your expression becomes unreadable'
    };
  }

  /**
   * False Tell - Feed fake information
   */
  private processFalseTell(
    attackerDeceptionLevel: number,
    defenderPerceptionLevel: number,
    energyCost: number,
    cooldown: number
  ): AbilityResult {
    const contest = this.contestRoll(attackerDeceptionLevel, defenderPerceptionLevel);

    if (!contest.success) {
      return {
        success: false,
        ability: DuelAbility.FALSE_TELL,
        energyCost,
        cooldownRounds: cooldown,
        message: 'They see through your deception'
      };
    }

    return {
      success: true,
      ability: DuelAbility.FALSE_TELL,
      effect: {
        hints: [{
          type: PerceptionHintType.FALSE_TELL,
          message: 'You plant false confidence signals',
          confidence: 0.0 // This hint is a lie
        }]
      },
      energyCost,
      cooldownRounds: cooldown,
      message: 'Your false tell is convincing'
    };
  }

  /**
   * Skill contest mechanic
   * Both sides roll, higher skill gets bonus
   */
  contestRoll(attackerSkill: number, defenderSkill: number): ContestResult {
    // Roll d100 + skill bonus
    const attackerRoll = SecureRNG.d100() + Math.floor(attackerSkill * 1.5);
    const defenderRoll = SecureRNG.d100() + Math.floor(defenderSkill * 1.5);

    const margin = attackerRoll - defenderRoll;

    logger.debug(`[Perception Contest] Attacker: ${attackerRoll} vs Defender: ${defenderRoll} = Margin ${margin}`);

    return {
      success: margin > 0,
      margin,
      attackerRoll,
      defenderRoll
    };
  }

  /**
   * Get available abilities based on skill level
   */
  getAvailableAbilities(perceptionLevel: number, sleightOfHandLevel: number): DuelAbility[] {
    const abilities: DuelAbility[] = [];

    // Perception-based abilities
    if (perceptionLevel >= 35) abilities.push(DuelAbility.READ_OPPONENT);
    if (perceptionLevel >= 45) abilities.push(DuelAbility.COLD_READ);

    // Defense abilities (always available but effectiveness varies)
    abilities.push(DuelAbility.POKER_FACE);
    abilities.push(DuelAbility.FALSE_TELL);

    // Cheating abilities (Sleight of Hand)
    if (sleightOfHandLevel >= 20) abilities.push(DuelAbility.PEEK);
    if (sleightOfHandLevel >= 40) abilities.push(DuelAbility.MARK_CARDS);

    return abilities;
  }

  /**
   * Get ability energy cost
   */
  getAbilityCost(ability: DuelAbility): number {
    return ABILITY_COSTS[ability] || 0;
  }

  /**
   * Get ability cooldown
   */
  getAbilityCooldown(ability: DuelAbility): number {
    return ABILITY_COOLDOWNS[ability] || 0;
  }
}

// Export singleton instance
export const perceptionService = new PerceptionService();
export default perceptionService;
