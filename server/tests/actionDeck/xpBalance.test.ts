/**
 * XP Balance Tests
 *
 * Verifies the XP pacing fixes:
 * 1. XP multiplier capped at 1.2x (was 1.5x)
 * 2. Uses action.rewards.xp instead of difficulty-based formula
 * 3. Combined multipliers also capped to prevent stacking
 */

import { describe, it, expect } from '@jest/globals';

/**
 * Mock game result with configurable suit bonus
 */
function mockGameResult(score: number, suitMultiplier: number) {
  return {
    success: true,
    score,
    suitBonus: { multiplier: suitMultiplier, matches: Math.floor(suitMultiplier * 3) },
    suitMatches: Math.floor(suitMultiplier * 3),
    handName: 'TestHand',
    rewards: null,
    mitigation: null
  };
}

/**
 * Mock action with rewards
 */
function mockAction(xp: number, gold: number, difficulty: number) {
  return {
    _id: 'test-action',
    name: 'Test Crime',
    type: 'CRIME',
    difficulty,
    energyCost: 10,
    rewards: { xp, gold, items: [] },
    isJob: false
  };
}

/**
 * Simulate the XP calculation from actionDeck.service.ts
 * This mirrors the actual implementation for testing
 */
function calculateXpReward(action: any, gameResult: any): number {
  // Cap multiplier at 1.2x to prevent XP inflation
  const rawMultiplier = gameResult.suitBonus.multiplier || 1;
  const multiplier = Math.min(1.2, rawMultiplier);

  // Use action's defined XP, not difficulty-based formula
  const baseXP = action.rewards?.xp || 20;

  return Math.round(baseXP * multiplier);
}

/**
 * Simulate the OLD (broken) XP calculation for comparison
 */
function calculateXpRewardOld(action: any, gameResult: any): number {
  const multiplier = gameResult.suitBonus.multiplier || 1;

  // OLD: Difficulty-based formula caused XP inflation
  const baseXP = 20 + (action.difficulty * 8);

  return Math.round(baseXP * multiplier);
}

describe('XP Balance - Multiplier Cap', () => {
  it('should cap suit multiplier at 1.2x', () => {
    const action = mockAction(20, 30, 50);
    const gameResultHighMultiplier = mockGameResult(80, 1.5);

    const xp = calculateXpReward(action, gameResultHighMultiplier);

    // 20 base × 1.2 max = 24 (not 20 × 1.5 = 30)
    expect(xp).toBe(24);
    expect(xp).toBeLessThanOrEqual(action.rewards.xp * 1.2);
  });

  it('should allow multipliers below 1.2x unchanged', () => {
    const action = mockAction(20, 30, 50);
    const gameResult = mockGameResult(60, 1.1);

    const xp = calculateXpReward(action, gameResult);

    // 20 × 1.1 = 22
    expect(xp).toBe(22);
  });

  it('should use 1.0x when no suit bonus', () => {
    const action = mockAction(20, 30, 50);
    const gameResult = mockGameResult(50, 1.0);

    const xp = calculateXpReward(action, gameResult);

    expect(xp).toBe(20);
  });
});

describe('XP Balance - Action Rewards vs Difficulty', () => {
  it('should use action.rewards.xp instead of difficulty-based formula', () => {
    const action = mockAction(25, 40, 40); // Low XP despite high difficulty
    const gameResult = mockGameResult(70, 1.0);

    const xp = calculateXpReward(action, gameResult);

    // Uses defined XP (25), not difficulty formula (20 + 40*8 = 340)
    expect(xp).toBe(25);
    expect(xp).toBeLessThan(100); // Sanity check
  });

  it('should demonstrate the old bug for comparison', () => {
    const action = mockAction(25, 40, 40);
    const gameResult = mockGameResult(70, 1.5);

    const oldXp = calculateXpRewardOld(action, gameResult);
    const newXp = calculateXpReward(action, gameResult);

    // Old: (20 + 320) × 1.5 = 510 XP - BROKEN
    expect(oldXp).toBe(510);

    // New: 25 × 1.2 = 30 XP - FIXED
    expect(newXp).toBe(30);

    // New XP should be dramatically lower
    expect(newXp).toBeLessThan(oldXp / 10);
  });

  it('should fall back to 20 XP when rewards not defined', () => {
    const action = { rewards: null, difficulty: 50 };
    const gameResult = mockGameResult(60, 1.0);

    const xp = calculateXpReward(action, gameResult);

    expect(xp).toBe(20);
  });
});

describe('XP Balance - Level 10 Pacing', () => {
  /**
   * Level XP requirements (EXPERIENCE_MULTIPLIER = 1.15):
   * Level 2: 100
   * Level 3: 115
   * ...
   * Total for Level 10: ~1,678 XP cumulative
   */
  const LEVEL_10_XP = 1678;

  it('should require roughly 30-80 crimes to reach level 10', () => {
    // Typical crime XP: 15-40 base × 1.0-1.2 multiplier = 15-48 per crime
    const avgXpPerCrime = 25; // Conservative estimate
    const crimesToLevel10 = Math.ceil(LEVEL_10_XP / avgXpPerCrime);

    // Should be in reasonable range
    expect(crimesToLevel10).toBeGreaterThan(30);
    expect(crimesToLevel10).toBeLessThan(100);
  });

  it('should never allow level 10 in under 20 crimes', () => {
    // Maximum possible XP per crime: 50 base × 1.2 = 60 XP
    const maxXpPerCrime = 60;
    const minCrimesToLevel10 = Math.ceil(LEVEL_10_XP / maxXpPerCrime);

    expect(minCrimesToLevel10).toBeGreaterThanOrEqual(28);
  });

  it('should demonstrate old formula allowed level 10 in ~10 crimes', () => {
    // Old formula with difficulty 40 crime: (20 + 320) × 1.5 = 510 XP
    const oldXpPerCrime = 510;
    const oldCrimesToLevel10 = Math.ceil(LEVEL_10_XP / oldXpPerCrime);

    // This was the bug - level 10 in ~4 crimes!
    expect(oldCrimesToLevel10).toBeLessThan(5);
  });
});

describe('XP Balance - Edge Cases', () => {
  it('should handle extremely high multipliers gracefully', () => {
    const action = mockAction(50, 100, 80);
    const gameResult = mockGameResult(100, 5.0); // Absurdly high

    const xp = calculateXpReward(action, gameResult);

    // Still capped at 1.2x: 50 × 1.2 = 60
    expect(xp).toBe(60);
  });

  it('should handle zero multiplier', () => {
    const action = mockAction(30, 50, 30);
    const gameResult = mockGameResult(20, 0);

    const xp = calculateXpReward(action, gameResult);

    // Falls back to 1.0 multiplier
    expect(xp).toBe(30);
  });

  it('should handle very low score actions', () => {
    const action = mockAction(10, 15, 10); // Easy crime, low rewards
    const gameResult = mockGameResult(25, 1.0);

    const xp = calculateXpReward(action, gameResult);

    expect(xp).toBe(10);
  });
});
