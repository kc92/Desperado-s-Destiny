/**
 * SecureRNG - Cryptographically Secure Random Number Generation
 *
 * This service provides secure random number generation for all game systems
 * that require unpredictable outcomes (gambling, combat, loot drops, etc.)
 *
 * IMPORTANT: Replace ALL uses of Math.random() with SecureRNG methods
 */

import { randomBytes, randomInt } from 'crypto';

export class SecureRNG {
  /**
   * Generate cryptographically secure random number in range [min, max] (inclusive)
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   */
  static range(min: number, max: number): number {
    if (min > max) {
      throw new Error(`Invalid range: min (${min}) cannot be greater than max (${max})`);
    }
    if (min === max) {
      return min;
    }
    return randomInt(min, max + 1);
  }

  /**
   * Roll a die (d4, d6, d8, d10, d12, d20, d100, etc.)
   * @param sides Number of sides on the die
   * @returns Random number from 1 to sides (inclusive)
   */
  static roll(sides: number): number {
    if (sides < 1) {
      throw new Error(`Invalid die: must have at least 1 side, got ${sides}`);
    }
    return randomInt(1, sides + 1);
  }

  /**
   * Roll multiple dice and sum the results
   * @param count Number of dice to roll
   * @param sides Number of sides per die
   * @returns Sum of all dice rolls
   */
  static rollMultiple(count: number, sides: number): number {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += this.roll(sides);
    }
    return total;
  }

  /**
   * D20 roll with modifier (commonly used for skill checks)
   * @param modifier Bonus or penalty to add to roll
   * @returns Object with roll, modifier, and total
   */
  static d20(modifier: number = 0): { roll: number; modifier: number; total: number } {
    const roll = this.roll(20);
    return {
      roll,
      modifier,
      total: roll + modifier
    };
  }

  /**
   * Percentage roll (1-100)
   * @returns Random number from 1 to 100
   */
  static d100(): number {
    return this.roll(100);
  }

  /**
   * Check if roll succeeds against difficulty
   * Uses d100 style roll where higher is better
   * @param difficulty Target number to meet or exceed (1-100)
   * @param modifier Bonus or penalty to add
   * @returns Object with success flag, roll, and total
   */
  static rollCheck(
    difficulty: number,
    modifier: number = 0
  ): { success: boolean; roll: number; modifier: number; total: number; difficulty: number } {
    const roll = this.d100();
    const total = roll + modifier;
    return {
      success: total >= difficulty,
      roll,
      modifier,
      total,
      difficulty
    };
  }

  /**
   * D20 skill check against difficulty class (DC)
   * @param dc Difficulty class to meet or exceed
   * @param modifier Skill modifier
   * @returns Object with success flag and roll details
   */
  static skillCheck(
    dc: number,
    modifier: number = 0
  ): { success: boolean; roll: number; modifier: number; total: number; dc: number; criticalSuccess: boolean; criticalFailure: boolean } {
    const roll = this.roll(20);
    const total = roll + modifier;
    return {
      success: total >= dc,
      roll,
      modifier,
      total,
      dc,
      criticalSuccess: roll === 20,
      criticalFailure: roll === 1
    };
  }

  /**
   * Weighted random selection from array of items
   * @param items Array of { item: T, weight: number }
   * @returns Selected item
   */
  static weightedSelect<T>(items: Array<{ item: T; weight: number }>): T {
    if (items.length === 0) {
      throw new Error('Cannot select from empty array');
    }

    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);

    if (totalWeight <= 0) {
      throw new Error('Total weight must be positive');
    }

    let random = this.range(1, totalWeight);

    for (const { item, weight } of items) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }

    // Fallback (should never reach here)
    return items[items.length - 1].item;
  }

  /**
   * Select random item from array (equal probability)
   * @param items Array to select from
   * @returns Random item from array
   */
  static select<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot select from empty array');
    }
    return items[randomInt(0, items.length)];
  }

  /**
   * Select N random items from array without replacement
   * @param items Array to select from
   * @param count Number of items to select
   * @returns Array of selected items
   */
  static selectMultiple<T>(items: T[], count: number): T[] {
    if (count > items.length) {
      throw new Error(`Cannot select ${count} items from array of ${items.length}`);
    }

    const shuffled = this.shuffle([...items]);
    return shuffled.slice(0, count);
  }

  /**
   * Shuffle array using Fisher-Yates with crypto RNG
   * Returns a new shuffled array (does not modify original)
   * @param array Array to shuffle
   * @returns New shuffled array
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generate random bytes as hex string
   * @param length Number of bytes to generate
   * @returns Hex string of random bytes
   */
  static hex(length: number = 16): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate random bytes as base64 string
   * @param length Number of bytes to generate
   * @returns Base64 string of random bytes
   */
  static base64(length: number = 16): string {
    return randomBytes(length).toString('base64');
  }

  /**
   * Boolean with probability (0-1 or 0-100)
   * @param probability Probability of returning true (0-1 or 0-100)
   * @returns True with given probability
   */
  static chance(probability: number): boolean {
    // Handle both 0-1 and 0-100 formats
    const normalizedProbability = probability > 1 ? probability / 100 : probability;

    if (normalizedProbability <= 0) return false;
    if (normalizedProbability >= 1) return true;

    return this.d100() <= normalizedProbability * 100;
  }

  /**
   * Generate random float between min and max
   * @param min Minimum value
   * @param max Maximum value
   * @param precision Decimal places (default 2)
   */
  static float(min: number, max: number, precision: number = 2): number {
    const range = max - min;
    const multiplier = Math.pow(10, precision);
    const randomValue = randomInt(0, range * multiplier + 1) / multiplier;
    return Math.round((min + randomValue) * multiplier) / multiplier;
  }

  /**
   * Generate a standard 52-card deck and shuffle it
   * @returns Shuffled array of card strings (e.g., "AS", "2H", "KC")
   */
  static shuffledDeck(): string[] {
    const suits = ['S', 'H', 'D', 'C']; // Spades, Hearts, Diamonds, Clubs
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const deck: string[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(`${rank}${suit}`);
      }
    }

    return this.shuffle(deck);
  }

  /**
   * Deal cards from a deck
   * @param deck The deck to deal from (will be modified)
   * @param count Number of cards to deal
   * @returns Array of dealt cards
   */
  static dealCards(deck: string[], count: number): string[] {
    if (count > deck.length) {
      throw new Error(`Cannot deal ${count} cards from deck of ${deck.length}`);
    }
    return deck.splice(0, count);
  }
}

export default SecureRNG;
