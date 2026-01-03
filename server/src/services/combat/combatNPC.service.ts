/**
 * Combat NPC Service
 *
 * NPC card drawing and hold/discard AI strategy.
 * Handles all NPC combat decision-making logic.
 *
 * REFACTOR: Extracted from combat.service.ts to follow single responsibility principle
 */

import {
  Card,
  HandRank,
  shuffleDeck,
  drawCards,
  evaluateHand
} from '@desperados/shared';
import { SecureRNG } from '../base/SecureRNG';
import { INPC } from '../../models/NPC.model';
import { ICombatEncounter, ICurrentRound } from '../../models/CombatEncounter.model';
import { CombatCalculationService } from './combatCalculation.service';

/**
 * Result of NPC turn in hold/discard combat
 */
export interface NPCTurnResult {
  npcHand: Card[];
  npcHandRank: HandRank;
  npcDamage: number;
}

export class CombatNPCService {
  /**
   * Simulate NPC card draw based on difficulty
   * Higher difficulty = chance to redraw for better hand
   *
   * @param difficulty - NPC difficulty level (1-10+)
   * @returns Array of 5 cards for NPC hand
   */
  static drawNPCCards(difficulty: number): Card[] {
    const deck = shuffleDeck();
    const { drawn } = drawCards(deck, 5);

    // Difficulty-based redraw chance
    let redrawChance = 0;
    if (difficulty >= 1 && difficulty <= 3) {
      redrawChance = 0;
    } else if (difficulty >= 4 && difficulty <= 6) {
      redrawChance = 0.3;
    } else if (difficulty >= 7 && difficulty <= 9) {
      redrawChance = 0.5;
    } else {
      redrawChance = 0.7; // Difficulty 10+
    }

    // SECURITY FIX: Use SecureRNG for redraw chance
    // Check if NPC gets a redraw
    if (SecureRNG.chance(redrawChance)) {
      const deck2 = shuffleDeck();
      const { drawn: redrawn } = drawCards(deck2, 5);

      // Compare hands and keep the better one
      const eval1 = evaluateHand(drawn);
      const eval2 = evaluateHand(redrawn);

      return eval2.score > eval1.score ? redrawn : drawn;
    }

    return drawn;
  }

  /**
   * NPC plays their turn using hold/discard strategy based on difficulty
   *
   * Strategy by difficulty:
   * - 1-3 (Easy): Hold random 0-2 cards
   * - 4-6 (Medium): Basic strategy - hold pairs and high cards
   * - 7-9 (Hard): Optimal hold + 20% redraw chance
   * - 10+ (Extreme): Optimal hold + 40% redraw + bonus damage
   *
   * @param encounter - Current combat encounter
   * @param npc - NPC being fought
   * @param _currentRound - Current round data (unused but kept for interface consistency)
   * @returns NPC's final hand, rank, and damage
   */
  static async playNPCHoldDiscardTurn(
    encounter: ICombatEncounter,
    npc: INPC,
    _currentRound: ICurrentRound
  ): Promise<NPCTurnResult> {
    // Draw initial NPC hand
    const npcDeck = shuffleDeck();
    const { drawn: initialHand, remaining: remainingDeck } = drawCards(npcDeck, 5);

    // Determine NPC hold strategy based on difficulty
    let finalHand: Card[];

    if (npc.difficulty <= 3) {
      // Easy: Hold random 0-2 cards
      const holdCount = SecureRNG.range(0, 2);
      const heldIndices = this.getRandomIndices(5, holdCount);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);
    } else if (npc.difficulty <= 6) {
      // Medium: Basic strategy - hold pairs and high cards
      const heldIndices = this.calculateBasicNPCHoldStrategy(initialHand);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);
    } else if (npc.difficulty <= 9) {
      // Hard: Optimal hold + 20% redraw chance
      const heldIndices = this.calculateOptimalNPCHoldStrategy(initialHand);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);

      // 20% chance to redraw for better hand
      if (SecureRNG.chance(0.2)) {
        const altDeck = shuffleDeck();
        const { drawn: altHand, remaining: altRemaining } = drawCards(altDeck, 5);
        const altHeld = this.calculateOptimalNPCHoldStrategy(altHand);
        const altFinal = this.applyHoldStrategy(altHand, altRemaining, altHeld);

        if (evaluateHand(altFinal).score > evaluateHand(finalHand).score) {
          finalHand = altFinal;
        }
      }
    } else {
      // Extreme (10+): Optimal hold + 40% redraw + bonus damage
      const heldIndices = this.calculateOptimalNPCHoldStrategy(initialHand);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);

      // 40% chance to redraw
      if (SecureRNG.chance(0.4)) {
        const altDeck = shuffleDeck();
        const { drawn: altHand, remaining: altRemaining } = drawCards(altDeck, 5);
        const altHeld = this.calculateOptimalNPCHoldStrategy(altHand);
        const altFinal = this.applyHoldStrategy(altHand, altRemaining, altHeld);

        if (evaluateHand(altFinal).score > evaluateHand(finalHand).score) {
          finalHand = altFinal;
        }
      }
    }

    // Evaluate final hand
    const npcEval = evaluateHand(finalHand);

    // Calculate damage (difficulty 10+ gets +5 bonus)
    const difficultyBonus = npc.difficulty >= 10 ? 5 : 0;
    const npcDamage = CombatCalculationService.calculateDamage(
      npcEval.rank,
      0,
      npc.difficulty + difficultyBonus
    );

    return {
      npcHand: finalHand,
      npcHandRank: npcEval.rank,
      npcDamage
    };
  }

  // ============================================================================
  // PRIVATE HELPERS - NPC AI Strategy
  // ============================================================================

  /**
   * Get random indices from a range
   * Used for easy difficulty random hold selection
   *
   * @param max - Maximum index (exclusive)
   * @param count - Number of indices to select
   * @returns Array of randomly selected indices
   */
  private static getRandomIndices(max: number, count: number): number[] {
    const indices: number[] = [];
    const available = Array.from({ length: max }, (_, i) => i);

    for (let i = 0; i < Math.min(count, max); i++) {
      const randomIdx = SecureRNG.range(0, available.length - 1);
      indices.push(available[randomIdx]);
      available.splice(randomIdx, 1);
    }

    return indices;
  }

  /**
   * Calculate basic NPC hold strategy - keep pairs and high cards
   * Used for medium difficulty (4-6)
   *
   * @param hand - Current hand of cards
   * @returns Indices of cards to hold
   */
  private static calculateBasicNPCHoldStrategy(hand: Card[]): number[] {
    const held: number[] = [];

    // Find pairs
    const rankCounts: Record<number, number[]> = {};
    hand.forEach((card, idx) => {
      if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
      rankCounts[card.rank].push(idx);
    });

    // Hold all pairs
    for (const indices of Object.values(rankCounts)) {
      if (indices.length >= 2) {
        held.push(...indices);
      }
    }

    // If no pairs, hold high cards (10+)
    if (held.length === 0) {
      hand.forEach((card, idx) => {
        if (card.rank >= 10) {
          held.push(idx);
        }
      });
    }

    // Limit to 3 cards for medium difficulty
    return held.slice(0, 3);
  }

  /**
   * Calculate optimal NPC hold strategy - poker optimal play
   * Used for hard (7-9) and extreme (10+) difficulty
   *
   * Priority order:
   * 1. Keep strong hands (three of a kind+) entirely
   * 2. Hold four of same suit (going for flush)
   * 3. Hold pairs/three of a kind
   * 4. Check for straight draw (4 consecutive)
   * 5. Hold high cards (10+)
   *
   * @param hand - Current hand of cards
   * @returns Indices of cards to hold
   */
  private static calculateOptimalNPCHoldStrategy(hand: Card[]): number[] {
    const eval_ = evaluateHand(hand);

    // If already have a strong hand (three of a kind or better), hold all
    if (eval_.rank >= HandRank.THREE_OF_A_KIND) {
      return [0, 1, 2, 3, 4];
    }

    // Find the cards that make up the current hand
    const held: number[] = [];

    // Count ranks and suits
    const rankCounts: Record<number, number[]> = {};
    const suitCounts: Record<string, number[]> = {};

    hand.forEach((card, idx) => {
      if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
      rankCounts[card.rank].push(idx);

      if (!suitCounts[card.suit]) suitCounts[card.suit] = [];
      suitCounts[card.suit].push(idx);
    });

    // Priority 1: Hold four of same suit (going for flush)
    for (const indices of Object.values(suitCounts)) {
      if (indices.length >= 4) {
        return indices;
      }
    }

    // Priority 2: Hold pairs/three of a kind
    const pairs: number[][] = [];
    for (const indices of Object.values(rankCounts)) {
      if (indices.length >= 2) {
        pairs.push(indices);
      }
    }

    if (pairs.length > 0) {
      // Hold all matching cards
      for (const pair of pairs) {
        held.push(...pair);
      }
      return held;
    }

    // Priority 3: Check for straight draw (4 consecutive)
    const sortedRanks = [...new Set(hand.map(c => c.rank))].sort((a, b) => a - b);
    for (let i = 0; i <= sortedRanks.length - 4; i++) {
      if (sortedRanks[i + 3] - sortedRanks[i] === 3) {
        // Found 4 consecutive, hold them
        const consecutiveRanks = sortedRanks.slice(i, i + 4);
        hand.forEach((card, idx) => {
          if (consecutiveRanks.includes(card.rank)) {
            held.push(idx);
          }
        });
        return held;
      }
    }

    // Priority 4: Hold high cards (10+)
    hand.forEach((card, idx) => {
      if (card.rank >= 10) {
        held.push(idx);
      }
    });

    return held;
  }

  /**
   * Apply hold strategy - keep held cards, draw replacements
   *
   * @param hand - Original hand
   * @param deck - Remaining deck to draw from
   * @param heldIndices - Indices of cards to keep
   * @returns New hand with held cards + replacements
   */
  private static applyHoldStrategy(
    hand: Card[],
    deck: Card[],
    heldIndices: number[]
  ): Card[] {
    const finalHand: Card[] = [];
    let deckIdx = 0;

    for (let i = 0; i < hand.length; i++) {
      if (heldIndices.includes(i)) {
        finalHand.push(hand[i]);
      } else {
        // Draw replacement
        if (deckIdx < deck.length) {
          finalHand.push(deck[deckIdx]);
          deckIdx++;
        } else {
          // Deck exhausted, keep original
          finalHand.push(hand[i]);
        }
      }
    }

    return finalHand;
  }
}

export default CombatNPCService;
