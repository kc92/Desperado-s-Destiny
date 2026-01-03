/**
 * Bail Out System
 * Calculate bail-out values for early game exit
 */

/**
 * Calculate bail-out value
 * Players can cash out early for a guaranteed partial reward
 * Value depends on game progress and current score
 *
 * @param currentScore - Current game score (0-100+)
 * @param turnsRemaining - How many turns left
 * @param maxTurns - Total turns in game
 * @param difficulty - Game difficulty (1-5)
 * @param baseReward - What full success would pay
 * @returns Guaranteed value if player bails out now
 */
export function calculateBailOutValue(
  currentScore: number,
  turnsRemaining: number,
  maxTurns: number,
  difficulty: number,
  baseReward: number
): { canBailOut: boolean; value: number; percent: number } {
  // Can only bail out after at least 1 turn and before last turn
  if (turnsRemaining >= maxTurns || turnsRemaining <= 0) {
    return { canBailOut: false, value: 0, percent: 0 };
  }

  // Progress through the game (0-1)
  const progress = (maxTurns - turnsRemaining) / maxTurns;

  // Score factor - how close to "good" score (assume 50+ is decent)
  const scoreFactor = Math.min(1, currentScore / 50);

  // Base bail-out percentage (30% minimum, up to 70%)
  const basePercent = 0.30 + (progress * 0.25) + (scoreFactor * 0.15);

  // Difficulty penalty - harder games penalize early bail-out more
  const difficultyPenalty = (difficulty - 1) * 0.05;
  const finalPercent = Math.max(0.20, basePercent - difficultyPenalty);

  const value = Math.floor(baseReward * finalPercent);

  return {
    canBailOut: true,
    value,
    percent: Math.round(finalPercent * 100)
  };
}
