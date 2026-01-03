/**
 * Reward Modifiers
 * Apply wager and streak modifiers to final rewards
 */

import { GameState } from '../types';

/**
 * Apply wager and streak modifiers to final rewards
 */
export function applyRewardModifiers(
  baseReward: { gold: number; xp: number },
  state: GameState,
  success: boolean
): { gold: number; xp: number; breakdown: string[] } {
  const breakdown: string[] = [];
  let goldMultiplier = 1.0;
  let xpMultiplier = 1.0;

  // === WAGER MULTIPLIER ===
  if (state.wagerMultiplier && state.wagerMultiplier > 1) {
    if (success) {
      goldMultiplier *= state.wagerMultiplier;
      breakdown.push(`Wager ${state.wagerTier}: ${state.wagerMultiplier}x gold`);
    } else {
      // On loss, wager amount is already deducted - no additional penalty to rewards
      breakdown.push(`Wager lost: -${state.wagerAmount} gold`);
    }
  }

  // === STREAK BONUS (only on success) ===
  if (success && state.streakBonus && state.streakBonus > 1) {
    goldMultiplier *= state.streakBonus;
    xpMultiplier *= (1 + (state.streakBonus - 1) * 0.5); // XP gets half the streak bonus
    breakdown.push(`Streak ${state.currentStreak}: ${state.streakBonus}x`);
  }

  // === HOT HAND (only on success) ===
  if (success && state.hotHandActive) {
    goldMultiplier *= 1.2;
    breakdown.push('Hot Hand: 1.2x gold');
  }

  // === UNDERDOG BONUS (built into success chance, not rewards) ===
  // But we note it for player feedback
  if (success && state.underdogBonus && state.underdogBonus > 0) {
    breakdown.push(`Underdog comeback! (+${Math.round(state.underdogBonus * 100)}% success)`);
  }

  return {
    gold: Math.floor(baseReward.gold * goldMultiplier),
    xp: Math.floor(baseReward.xp * xpMultiplier),
    breakdown
  };
}
