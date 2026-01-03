/**
 * Streak System
 * Track win/loss streaks and calculate bonuses
 */

/**
 * Calculate streak bonus based on consecutive wins
 * Rewards hot hands while preventing runaway bonuses
 *
 * Streak 1-2: 1.0x (no bonus)
 * Streak 3: 1.1x
 * Streak 4: 1.2x
 * Streak 5: 1.3x
 * Streak 6+: 1.5x (capped)
 */
export function calculateStreakBonus(consecutiveWins: number): number {
  if (consecutiveWins < 3) return 1.0;
  if (consecutiveWins === 3) return 1.1;
  if (consecutiveWins === 4) return 1.2;
  if (consecutiveWins === 5) return 1.3;
  return 1.5; // Max cap at 6+ wins
}

/**
 * Calculate underdog bonus for players on a losing streak
 * Helps prevent frustration spirals
 *
 * 0-2 losses: 0% bonus
 * 3 losses: +5% success chance
 * 4 losses: +10% success chance
 * 5+ losses: +15% success chance (capped)
 */
export function calculateUnderdogBonus(consecutiveLosses: number): number {
  if (consecutiveLosses < 3) return 0;
  if (consecutiveLosses === 3) return 0.05;
  if (consecutiveLosses === 4) return 0.10;
  return 0.15; // Max cap at 5+ losses
}

/**
 * Check if hot hand is triggered
 * Hot hand activates after 4+ consecutive wins
 * Lasts for 3 rounds with +20% success rate
 */
export function checkHotHand(consecutiveWins: number): { active: boolean; rounds: number } {
  if (consecutiveWins >= 4) {
    return { active: true, rounds: 3 };
  }
  return { active: false, rounds: 0 };
}

/**
 * Update streak tracking after a game result
 */
export function updateStreakTracking(
  currentStreak: number,
  hotHandActive: boolean,
  hotHandRoundsLeft: number,
  success: boolean
): {
  newStreak: number;
  newStreakBonus: number;
  newHotHandActive: boolean;
  newHotHandRoundsLeft: number;
  newUnderdogBonus: number;
} {
  if (success) {
    const newStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
    const hotHand = checkHotHand(newStreak);

    return {
      newStreak,
      newStreakBonus: calculateStreakBonus(newStreak),
      newHotHandActive: hotHand.active || (hotHandActive && hotHandRoundsLeft > 1),
      newHotHandRoundsLeft: hotHand.active ? hotHand.rounds : Math.max(0, hotHandRoundsLeft - 1),
      newUnderdogBonus: 0 // Reset on win
    };
  } else {
    // Loss - track negative streak for underdog bonus
    const lossStreak = currentStreak <= 0 ? currentStreak - 1 : -1;

    return {
      newStreak: lossStreak,
      newStreakBonus: 1.0,
      newHotHandActive: false,
      newHotHandRoundsLeft: 0,
      newUnderdogBonus: calculateUnderdogBonus(Math.abs(lossStreak))
    };
  }
}
