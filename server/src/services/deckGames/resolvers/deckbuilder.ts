/**
 * Deckbuilder Resolver
 * Resolve deckbuilder games
 */

import { GameState, GameResult } from '../types';

/**
 * Resolve deckbuilder game
 */
export function resolveDeckbuilderGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  // Score based on combos found
  let score = 0;
  const combos: string[] = [];

  // Count ranks
  const rankCounts: Record<string, number> = {};
  state.hand.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  // Check for pairs/trips/quads
  Object.values(rankCounts).forEach(count => {
    if (count >= 4) { score += 200; combos.push('Four of a Kind'); }
    else if (count >= 3) { score += 100; combos.push('Triple'); }
    else if (count >= 2) { score += 50; combos.push('Pair'); }
  });

  // Efficiency bonus for unused draws
  const efficiency = (state.maxTurns - state.hand.length) * 10;
  score += efficiency;

  const threshold = state.difficulty * 100;
  const success = score >= threshold;

  return {
    success,
    score,
    handName: combos.length > 0 ? combos.join(', ') : 'No Combos',
    suitMatches,
    suitBonus,
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.1) }
  };
}
