/**
 * Special Abilities
 * Calculate special abilities based on character skill level
 */

import { SpecialAbilities } from '../types';

/**
 * Calculate special abilities based on character skill level
 * This is the key to meaningful progression - higher skill unlocks more options!
 */
export function calculateSpecialAbilities(skillLevel: number): SpecialAbilities {
  const skill = Math.max(0, Math.min(100, skillLevel));

  return {
    // === POKER ===
    // Rerolls: 1 at skill 30, 2 at skill 60, 3 at skill 90
    rerollsAvailable: Math.floor(skill / 30),
    // Peeks: 1 at skill 50, 2 at skill 80
    peeksAvailable: skill >= 50 ? Math.floor((skill - 20) / 30) : 0,
    // Early finish always available
    canEarlyFinish: true,

    // === BLACKJACK ===
    // Double down at skill 5+
    canDoubleDown: skill >= 5,
    // Insurance at skill 15+
    canInsurance: skill >= 15,
    // Card counting bonus: 0-30 based on skill (at 20+)
    cardCountingBonus: skill >= 20 ? Math.min(30, Math.floor((skill - 20) * 0.5)) : 0,

    // === PRESS YOUR LUCK ===
    // Safe draw at skill 10+
    canSafeDraw: skill >= 10,
    // Safe draw cost: 100 gold at skill 10, down to 25 gold at skill 100
    safeDrawCost: skill >= 10 ? Math.max(25, 100 - Math.floor((skill - 10) * 0.83)) : 100,
    // Double down at skill 25+
    canDoubleDownPYL: skill >= 25
  };
}
