/**
 * Risk/Reward Systems Tests (Phase 5)
 *
 * Tests all Phase 5 implementations:
 * - Wagering system (low, medium, high, VIP tiers)
 * - Streak tracking and bonuses
 * - Hot hand mechanics
 * - Underdog comeback bonuses
 * - Bail-out system
 * - Reward modifiers
 *
 * NOTE: These are pure utility function tests that do not require database setup
 */

import {
  getWagerConfig,
  calculateWager,
  calculateStreakBonus,
  calculateUnderdogBonus,
  checkHotHand,
  calculateBailOutValue,
  applyRewardModifiers,
  updateStreakTracking,
  GameState,
  WagerConfig
} from '../../src/services/deckGames';

// Disable database setup for this test suite (pure utility functions)
jest.mock('../../src/models/User.model', () => ({}));
jest.mock('../../src/models/Character.model', () => ({}));

describe('Phase 5: Risk/Reward Systems', () => {

  // =============================================================================
  // WAGERING SYSTEM TESTS
  // =============================================================================

  describe('getWagerConfig', () => {
    test('returns correct config for low tier', () => {
      const config = getWagerConfig('low');

      expect(config).toBeDefined();
      expect(config.tier).toBe('low');
      expect(config.minAmount).toBe(10);
      expect(config.maxAmount).toBe(100);
      expect(config.multiplier).toBe(1.0);
      expect(config.lossMultiplier).toBe(1.0);
      expect(config.unlockLevel).toBe(1);
      expect(config.houseEdge).toBe(0.0);
    });

    test('returns correct config for medium tier', () => {
      const config = getWagerConfig('medium');

      expect(config.tier).toBe('medium');
      expect(config.minAmount).toBe(100);
      expect(config.maxAmount).toBe(500);
      expect(config.multiplier).toBe(2.0);
      expect(config.lossMultiplier).toBe(1.5);
      expect(config.unlockLevel).toBe(10);
      expect(config.houseEdge).toBe(0.02);
    });

    test('returns correct config for high tier', () => {
      const config = getWagerConfig('high');

      expect(config.tier).toBe('high');
      expect(config.minAmount).toBe(500);
      expect(config.maxAmount).toBe(2000);
      expect(config.multiplier).toBe(5.0);
      expect(config.lossMultiplier).toBe(2.0);
      expect(config.unlockLevel).toBe(25);
      expect(config.houseEdge).toBe(0.05);
    });

    test('returns correct config for vip tier', () => {
      const config = getWagerConfig('vip');

      expect(config.tier).toBe('vip');
      expect(config.minAmount).toBe(2000);
      expect(config.maxAmount).toBe(10000);
      expect(config.multiplier).toBe(10.0);
      expect(config.lossMultiplier).toBe(3.0);
      expect(config.unlockLevel).toBe(50);
      expect(config.houseEdge).toBe(0.08);
    });

    test('defaults to low tier for invalid tier', () => {
      const config = getWagerConfig('invalid');

      expect(config.tier).toBe('low');
      expect(config.multiplier).toBe(1.0);
    });

    test('defaults to low tier for empty string', () => {
      const config = getWagerConfig('');

      expect(config.tier).toBe('low');
    });
  });

  describe('calculateWager', () => {
    test('rejects wager if character level too low', () => {
      const result = calculateWager(100, 'medium', 5, 1000);

      expect(result).toBeNull();
    });

    test('rejects wager if character cannot afford', () => {
      const result = calculateWager(500, 'high', 30, 200);

      expect(result).toBeNull();
    });

    test('clamps wager to minimum amount', () => {
      const result = calculateWager(5, 'low', 1, 1000);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(10); // Low tier min is 10
      expect(result!.multiplier).toBe(1.0);
      expect(result!.tier).toBe('low');
    });

    test('clamps wager to maximum amount', () => {
      const result = calculateWager(5000, 'medium', 15, 10000);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(500); // Medium tier max is 500
      expect(result!.multiplier).toBe(2.0);
      expect(result!.tier).toBe('medium');
    });

    test('accepts valid low tier wager', () => {
      const result = calculateWager(50, 'low', 1, 100);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(50);
      expect(result!.multiplier).toBe(1.0);
      expect(result!.tier).toBe('low');
    });

    test('accepts valid medium tier wager at unlock level', () => {
      const result = calculateWager(250, 'medium', 10, 500);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(250);
      expect(result!.multiplier).toBe(2.0);
      expect(result!.tier).toBe('medium');
    });

    test('accepts valid high tier wager', () => {
      const result = calculateWager(1000, 'high', 30, 5000);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(1000);
      expect(result!.multiplier).toBe(5.0);
      expect(result!.tier).toBe('high');
    });

    test('accepts valid vip tier wager', () => {
      const result = calculateWager(5000, 'vip', 50, 10000);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(5000);
      expect(result!.multiplier).toBe(10.0);
      expect(result!.tier).toBe('vip');
    });

    test('rejects vip tier for level 49 character', () => {
      const result = calculateWager(3000, 'vip', 49, 10000);

      expect(result).toBeNull();
    });

    test('edge case: exact gold amount available', () => {
      const result = calculateWager(100, 'low', 5, 100);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(100);
    });

    test('edge case: one gold short', () => {
      const result = calculateWager(101, 'low', 5, 100);

      expect(result).toBeNull();
    });
  });

  // =============================================================================
  // STREAK SYSTEM TESTS
  // =============================================================================

  describe('calculateStreakBonus', () => {
    test('returns 1.0 for no streak', () => {
      expect(calculateStreakBonus(0)).toBe(1.0);
    });

    test('returns 1.0 for 1 win streak', () => {
      expect(calculateStreakBonus(1)).toBe(1.0);
    });

    test('returns 1.0 for 2 win streak', () => {
      expect(calculateStreakBonus(2)).toBe(1.0);
    });

    test('returns 1.1 for 3 win streak', () => {
      expect(calculateStreakBonus(3)).toBe(1.1);
    });

    test('returns 1.2 for 4 win streak', () => {
      expect(calculateStreakBonus(4)).toBe(1.2);
    });

    test('returns 1.3 for 5 win streak', () => {
      expect(calculateStreakBonus(5)).toBe(1.3);
    });

    test('returns 1.5 for 6 win streak (capped)', () => {
      expect(calculateStreakBonus(6)).toBe(1.5);
    });

    test('returns 1.5 for 7+ win streak (capped)', () => {
      expect(calculateStreakBonus(7)).toBe(1.5);
      expect(calculateStreakBonus(10)).toBe(1.5);
      expect(calculateStreakBonus(100)).toBe(1.5);
    });
  });

  describe('calculateUnderdogBonus', () => {
    test('returns 0 for no losses', () => {
      expect(calculateUnderdogBonus(0)).toBe(0);
    });

    test('returns 0 for 1 loss', () => {
      expect(calculateUnderdogBonus(1)).toBe(0);
    });

    test('returns 0 for 2 losses', () => {
      expect(calculateUnderdogBonus(2)).toBe(0);
    });

    test('returns 0.05 for 3 losses', () => {
      expect(calculateUnderdogBonus(3)).toBe(0.05);
    });

    test('returns 0.10 for 4 losses', () => {
      expect(calculateUnderdogBonus(4)).toBe(0.10);
    });

    test('returns 0.15 for 5 losses (capped)', () => {
      expect(calculateUnderdogBonus(5)).toBe(0.15);
    });

    test('returns 0.15 for 6+ losses (capped)', () => {
      expect(calculateUnderdogBonus(6)).toBe(0.15);
      expect(calculateUnderdogBonus(10)).toBe(0.15);
      expect(calculateUnderdogBonus(100)).toBe(0.15);
    });
  });

  describe('checkHotHand', () => {
    test('returns inactive for 0 wins', () => {
      const result = checkHotHand(0);

      expect(result.active).toBe(false);
      expect(result.rounds).toBe(0);
    });

    test('returns inactive for 1 win', () => {
      const result = checkHotHand(1);

      expect(result.active).toBe(false);
      expect(result.rounds).toBe(0);
    });

    test('returns inactive for 2 wins', () => {
      const result = checkHotHand(2);

      expect(result.active).toBe(false);
      expect(result.rounds).toBe(0);
    });

    test('returns inactive for 3 wins', () => {
      const result = checkHotHand(3);

      expect(result.active).toBe(false);
      expect(result.rounds).toBe(0);
    });

    test('activates hot hand at 4 wins', () => {
      const result = checkHotHand(4);

      expect(result.active).toBe(true);
      expect(result.rounds).toBe(3);
    });

    test('activates hot hand at 5+ wins', () => {
      const result5 = checkHotHand(5);
      expect(result5.active).toBe(true);
      expect(result5.rounds).toBe(3);

      const result10 = checkHotHand(10);
      expect(result10.active).toBe(true);
      expect(result10.rounds).toBe(3);
    });
  });

  // =============================================================================
  // BAIL-OUT SYSTEM TESTS
  // =============================================================================

  describe('calculateBailOutValue', () => {
    test('cannot bail out at start (no turns taken)', () => {
      const result = calculateBailOutValue(0, 10, 10, 3, 1000);

      expect(result.canBailOut).toBe(false);
      expect(result.value).toBe(0);
      expect(result.percent).toBe(0);
    });

    test('cannot bail out on last turn', () => {
      const result = calculateBailOutValue(100, 0, 10, 3, 1000);

      expect(result.canBailOut).toBe(false);
      expect(result.value).toBe(0);
      expect(result.percent).toBe(0);
    });

    test('can bail out in middle of game', () => {
      const result = calculateBailOutValue(50, 5, 10, 3, 1000);

      expect(result.canBailOut).toBe(true);
      expect(result.value).toBeGreaterThan(0);
      expect(result.percent).toBeGreaterThan(0);
    });

    test('bail-out value scales with progress', () => {
      const early = calculateBailOutValue(25, 8, 10, 3, 1000);
      const mid = calculateBailOutValue(25, 5, 10, 3, 1000);
      const late = calculateBailOutValue(25, 2, 10, 3, 1000);

      expect(early.value).toBeLessThan(mid.value);
      expect(mid.value).toBeLessThan(late.value);
    });

    test('bail-out value scales with current score', () => {
      const lowScore = calculateBailOutValue(10, 5, 10, 3, 1000);
      const medScore = calculateBailOutValue(30, 5, 10, 3, 1000);
      const highScore = calculateBailOutValue(60, 5, 10, 3, 1000);

      expect(lowScore.value).toBeLessThan(medScore.value);
      expect(medScore.value).toBeLessThan(highScore.value);
    });

    test('difficulty penalty reduces bail-out value', () => {
      const easy = calculateBailOutValue(50, 5, 10, 1, 1000);
      const medium = calculateBailOutValue(50, 5, 10, 3, 1000);
      const hard = calculateBailOutValue(50, 5, 10, 5, 1000);

      expect(hard.value).toBeLessThan(medium.value);
      expect(medium.value).toBeLessThan(easy.value);
    });

    test('bail-out percent never goes below 20%', () => {
      const result = calculateBailOutValue(0, 9, 10, 5, 1000);

      expect(result.percent).toBeGreaterThanOrEqual(20);
    });

    test('bail-out value is proportional to base reward', () => {
      const lowReward = calculateBailOutValue(50, 5, 10, 3, 100);
      const highReward = calculateBailOutValue(50, 5, 10, 3, 1000);

      expect(highReward.value).toBeGreaterThan(lowReward.value);
      expect(highReward.value / lowReward.value).toBeCloseTo(10, 0);
    });

    test('near completion gives high bail-out value', () => {
      const result = calculateBailOutValue(80, 1, 10, 3, 1000);

      expect(result.canBailOut).toBe(true);
      expect(result.percent).toBeGreaterThan(50);
    });

    test('edge case: one turn after start', () => {
      const result = calculateBailOutValue(20, 9, 10, 3, 1000);

      expect(result.canBailOut).toBe(true);
      expect(result.value).toBeGreaterThan(0);
    });

    test('edge case: one turn before end', () => {
      const result = calculateBailOutValue(80, 1, 10, 3, 1000);

      expect(result.canBailOut).toBe(true);
      expect(result.value).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // REWARD MODIFIERS TESTS
  // =============================================================================

  describe('applyRewardModifiers', () => {
    test('applies no modifiers for basic success', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 1.0,
        streakBonus: 1.0,
        hotHandActive: false
      };

      const result = applyRewardModifiers(
        { gold: 100, xp: 50 },
        state as GameState,
        true
      );

      expect(result.gold).toBe(100);
      expect(result.xp).toBe(50);
      expect(result.breakdown).toHaveLength(0);
    });

    test('applies wager multiplier on success', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 2.0,
        wagerTier: 'medium',
        wagerAmount: 200,
        streakBonus: 1.0,
        hotHandActive: false
      };

      const result = applyRewardModifiers(
        { gold: 100, xp: 50 },
        state as GameState,
        true
      );

      expect(result.gold).toBe(200); // 100 * 2.0
      expect(result.xp).toBe(50);
      expect(result.breakdown).toContain('Wager medium: 2x gold');
    });

    test('notes wager loss on failure', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 2.0,
        wagerTier: 'medium',
        wagerAmount: 200,
        streakBonus: 1.0,
        hotHandActive: false
      };

      const result = applyRewardModifiers(
        { gold: 0, xp: 10 },
        state as GameState,
        false
      );

      expect(result.gold).toBe(0);
      expect(result.xp).toBe(10);
      expect(result.breakdown).toContain('Wager lost: -200 gold');
    });

    test('applies streak bonus on success', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 1.0,
        streakBonus: 1.3,
        currentStreak: 5,
        hotHandActive: false
      };

      const result = applyRewardModifiers(
        { gold: 100, xp: 50 },
        state as GameState,
        true
      );

      expect(result.gold).toBe(130); // 100 * 1.3
      expect(result.xp).toBe(57); // 50 * (1 + 0.3 * 0.5) = 50 * 1.15 = 57.5 rounded down
      expect(result.breakdown).toContain('Streak 5: 1.3x');
    });

    test('does not apply streak bonus on failure', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 1.0,
        streakBonus: 1.3,
        currentStreak: 5,
        hotHandActive: false
      };

      const result = applyRewardModifiers(
        { gold: 0, xp: 10 },
        state as GameState,
        false
      );

      expect(result.gold).toBe(0);
      expect(result.xp).toBe(10);
      expect(result.breakdown.some(s => s.includes('Streak'))).toBe(false);
    });

    test('applies hot hand bonus on success', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 1.0,
        streakBonus: 1.0,
        hotHandActive: true
      };

      const result = applyRewardModifiers(
        { gold: 100, xp: 50 },
        state as GameState,
        true
      );

      expect(result.gold).toBe(120); // 100 * 1.2
      expect(result.xp).toBe(50);
      expect(result.breakdown).toContain('Hot Hand: 1.2x gold');
    });

    test('stacks wager + streak + hot hand multipliers', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 5.0,
        wagerTier: 'high',
        wagerAmount: 1000,
        streakBonus: 1.5,
        currentStreak: 8,
        hotHandActive: true
      };

      const result = applyRewardModifiers(
        { gold: 100, xp: 50 },
        state as GameState,
        true
      );

      // 100 * 5.0 (wager) * 1.5 (streak) * 1.2 (hot hand) = 900
      expect(result.gold).toBe(900);
      // 50 * (1 + 0.5 * 0.5) = 50 * 1.25 = 62 (rounded down)
      expect(result.xp).toBe(62);
      expect(result.breakdown).toHaveLength(3);
    });

    test('notes underdog bonus in breakdown (but does not affect rewards)', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 1.0,
        streakBonus: 1.0,
        hotHandActive: false,
        underdogBonus: 0.15
      };

      const result = applyRewardModifiers(
        { gold: 100, xp: 50 },
        state as GameState,
        true
      );

      expect(result.gold).toBe(100);
      expect(result.xp).toBe(50);
      expect(result.breakdown.some(s => s.includes('Underdog'))).toBe(true);
    });

    test('VIP tier massive multiplier stack', () => {
      const state: Partial<GameState> = {
        wagerMultiplier: 10.0,
        wagerTier: 'vip',
        wagerAmount: 5000,
        streakBonus: 1.5,
        currentStreak: 10,
        hotHandActive: true
      };

      const result = applyRewardModifiers(
        { gold: 200, xp: 100 },
        state as GameState,
        true
      );

      // 200 * 10.0 * 1.5 * 1.2 = 3600
      expect(result.gold).toBe(3600);
    });
  });

  // =============================================================================
  // STREAK TRACKING TESTS
  // =============================================================================

  describe('updateStreakTracking', () => {
    test('increments streak on first win', () => {
      const result = updateStreakTracking(0, false, 0, true);

      expect(result.newStreak).toBe(1);
      expect(result.newStreakBonus).toBe(1.0); // No bonus yet
      expect(result.newHotHandActive).toBe(false);
      expect(result.newHotHandRoundsLeft).toBe(0);
      expect(result.newUnderdogBonus).toBe(0);
    });

    test('increments streak on consecutive wins', () => {
      const result = updateStreakTracking(2, false, 0, true);

      expect(result.newStreak).toBe(3);
      expect(result.newStreakBonus).toBe(1.1);
      expect(result.newHotHandActive).toBe(false);
    });

    test('activates hot hand at 4 wins', () => {
      const result = updateStreakTracking(3, false, 0, true);

      expect(result.newStreak).toBe(4);
      expect(result.newStreakBonus).toBe(1.2);
      expect(result.newHotHandActive).toBe(true);
      expect(result.newHotHandRoundsLeft).toBe(3);
    });

    test('maintains hot hand while active', () => {
      const result = updateStreakTracking(5, true, 2, true);

      expect(result.newStreak).toBe(6);
      expect(result.newStreakBonus).toBe(1.5); // Capped
      expect(result.newHotHandActive).toBe(true);
      expect(result.newHotHandRoundsLeft).toBe(3); // Refreshed
    });

    test('hot hand countdown decreases', () => {
      const result = updateStreakTracking(2, true, 3, true);

      expect(result.newStreak).toBe(3);
      expect(result.newHotHandActive).toBe(true);
      expect(result.newHotHandRoundsLeft).toBe(2);
    });

    test('hot hand expires after countdown', () => {
      const result = updateStreakTracking(2, true, 1, true);

      expect(result.newStreak).toBe(3);
      expect(result.newHotHandActive).toBe(false);
      expect(result.newHotHandRoundsLeft).toBe(0);
    });

    test('resets streak to -1 on first loss', () => {
      const result = updateStreakTracking(3, false, 0, false);

      expect(result.newStreak).toBe(-1);
      expect(result.newStreakBonus).toBe(1.0);
      expect(result.newHotHandActive).toBe(false);
      expect(result.newHotHandRoundsLeft).toBe(0);
      expect(result.newUnderdogBonus).toBe(0); // Only 1 loss
    });

    test('increments negative streak on consecutive losses', () => {
      const result = updateStreakTracking(-2, false, 0, false);

      expect(result.newStreak).toBe(-3);
      expect(result.newStreakBonus).toBe(1.0);
      expect(result.newUnderdogBonus).toBe(0.05);
    });

    test('builds underdog bonus over losses', () => {
      const result3 = updateStreakTracking(-2, false, 0, false);
      expect(result3.newUnderdogBonus).toBe(0.05);

      const result4 = updateStreakTracking(-3, false, 0, false);
      expect(result4.newUnderdogBonus).toBe(0.10);

      const result5 = updateStreakTracking(-4, false, 0, false);
      expect(result5.newUnderdogBonus).toBe(0.15);
    });

    test('caps underdog bonus at 5 losses', () => {
      const result = updateStreakTracking(-10, false, 0, false);

      expect(result.newStreak).toBe(-11);
      expect(result.newUnderdogBonus).toBe(0.15); // Capped
    });

    test('loss clears hot hand buff', () => {
      const result = updateStreakTracking(5, true, 3, false);

      expect(result.newStreak).toBe(-1);
      expect(result.newHotHandActive).toBe(false);
      expect(result.newHotHandRoundsLeft).toBe(0);
    });

    test('win from negative streak resets to 1', () => {
      const result = updateStreakTracking(-5, false, 0, true);

      expect(result.newStreak).toBe(1);
      expect(result.newStreakBonus).toBe(1.0);
      expect(result.newUnderdogBonus).toBe(0);
    });

    test('long win streak maintains cap', () => {
      const result = updateStreakTracking(20, true, 3, true);

      expect(result.newStreak).toBe(21);
      expect(result.newStreakBonus).toBe(1.5); // Still capped
      expect(result.newHotHandActive).toBe(true);
      expect(result.newHotHandRoundsLeft).toBe(3);
    });
  });

  // =============================================================================
  // INTEGRATION TESTS
  // =============================================================================

  describe('Integration: Complete Wagering Flow', () => {
    test('successful high-stakes game with streak and hot hand', () => {
      // Character: Level 30, 5000 gold, 5-win streak
      const wagerResult = calculateWager(1000, 'high', 30, 5000);
      expect(wagerResult).not.toBeNull();

      const streak = updateStreakTracking(5, true, 2, true);
      expect(streak.newStreak).toBe(6);
      expect(streak.newHotHandActive).toBe(true);

      const state: Partial<GameState> = {
        wagerMultiplier: wagerResult!.multiplier,
        wagerTier: 'high',
        wagerAmount: 1000,
        streakBonus: streak.newStreakBonus,
        currentStreak: streak.newStreak,
        hotHandActive: streak.newHotHandActive
      };

      const rewards = applyRewardModifiers(
        { gold: 300, xp: 150 },
        state as GameState,
        true
      );

      // 300 * 5.0 (high) * 1.5 (streak) * 1.2 (hot) = 2700
      expect(rewards.gold).toBe(2700);
      expect(rewards.breakdown.length).toBeGreaterThan(0);
    });

    test('failed high-stakes game breaks streak', () => {
      const wagerResult = calculateWager(1000, 'high', 30, 5000);
      expect(wagerResult).not.toBeNull();

      const streak = updateStreakTracking(5, true, 2, false);
      expect(streak.newStreak).toBe(-1);
      expect(streak.newHotHandActive).toBe(false);

      const state: Partial<GameState> = {
        wagerMultiplier: wagerResult!.multiplier,
        wagerTier: 'high',
        wagerAmount: 1000,
        streakBonus: 1.0,
        hotHandActive: false
      };

      const rewards = applyRewardModifiers(
        { gold: 0, xp: 10 },
        state as GameState,
        false
      );

      expect(rewards.gold).toBe(0);
      expect(rewards.breakdown.some(s => s.includes('Wager lost'))).toBe(true);
    });

    test('underdog comeback scenario', () => {
      // Player on 4-loss streak
      const streak = updateStreakTracking(-3, false, 0, false);
      expect(streak.newStreak).toBe(-4);
      expect(streak.newUnderdogBonus).toBe(0.10);

      // Now they win (10% bonus helped!)
      const comeback = updateStreakTracking(streak.newStreak, false, 0, true);
      expect(comeback.newStreak).toBe(1);
      expect(comeback.newUnderdogBonus).toBe(0);

      const state: Partial<GameState> = {
        wagerMultiplier: 1.0,
        streakBonus: 1.0,
        hotHandActive: false,
        underdogBonus: 0.10
      };

      const rewards = applyRewardModifiers(
        { gold: 100, xp: 50 },
        state as GameState,
        true
      );

      expect(rewards.breakdown.some(s => s.includes('Underdog'))).toBe(true);
    });
  });
});
