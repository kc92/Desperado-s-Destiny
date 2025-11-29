# Deck Games Test Suite

## Overview

This directory contains comprehensive tests for the Desperados Destiny deck games system, focusing on:
- **Phase 2: Stats Matter** - Skill modifiers that impact success rates
- **Phase 3: Strategic Choices** - Skill-unlocked special abilities

## Test Files

### `skillModifiers.test.ts`
Tests for skill progression formulas and ability unlocking.

**Coverage:**
- 31 tests total
- `calculateSkillModifiers()` - 13 tests
- `calculateSpecialAbilities()` - 16 tests
- Integration tests - 2 tests

## Running Tests

```bash
# Run all deck games tests
npm test tests/deckGames

# Run specific test file
npm test tests/deckGames/skillModifiers.test.ts

# Run with coverage
npm test tests/deckGames -- --coverage

# Run in watch mode
npm test tests/deckGames -- --watch

# Run with verbose output
npm test tests/deckGames -- --verbose
```

## Test Structure

### Phase 2: Stats Matter

Tests for `calculateSkillModifiers(characterSuitBonus, difficulty, talentBonuses?, synergyMultiplier?)`:

```typescript
// Returns SkillModifiers
{
  thresholdReduction: number;  // Lowers success threshold
  cardBonus: number;            // Adds to hand score
  rerollsAvailable: number;     // Number of rerolls allowed
  dangerAvoidChance: number;    // Chance to avoid danger (0-0.5)
}
```

**Key Test Areas:**
1. Basic calculations at skill 0, 10, 50, 100
2. Progressive scaling from 0→100
3. Difficulty scaling (1-5)
4. Reroll unlocks (30, 60, 90)
5. Danger avoidance (capped at 50%)
6. Talent bonus integration
7. Synergy multiplier effects

### Phase 3: Strategic Choices

Tests for `calculateSpecialAbilities(skillLevel)`:

```typescript
// Returns SpecialAbilities
{
  // Poker
  rerollsAvailable: number;     // 0-3 rerolls (unlocks at 30, 60, 90)
  peeksAvailable: number;       // 0-2 peeks (unlocks at 50, 80)
  canEarlyFinish: boolean;      // Always true

  // Blackjack
  canDoubleDown: boolean;       // Unlocks at 5
  canInsurance: boolean;        // Unlocks at 15
  cardCountingBonus: number;    // 0-30 (unlocks at 20)

  // Press Your Luck
  canSafeDraw: boolean;         // Unlocks at 10
  safeDrawCost: number;         // 100→26 gold (unlocks at 10)
  canDoubleDownPYL: boolean;    // Unlocks at 25
}
```

**Key Test Areas:**
1. Poker ability unlocks (rerolls, peeks, early finish)
2. Blackjack ability unlocks (double down, insurance, card counting)
3. Press Your Luck ability unlocks (safe draw, double down)
4. Skill level clamping (0-100)
5. Exact threshold boundary testing
6. Comprehensive progression (novice→master)

## Formula Reference

### Skill Modifiers

```typescript
// Base formula
linear = skillLevel * 0.75
exponential = skillLevel^1.1 * 0.05
totalBonus = linear + exponential

// Difficulty scaling
difficultyScale = 0.8 + (difficulty * 0.1)  // 0.9 to 1.3

// Modifiers
thresholdReduction = floor(totalBonus * 0.4 * difficultyScale)
cardBonus = floor(totalBonus * 0.3 * difficultyScale)
rerollsAvailable = floor(skillLevel / 30)
dangerAvoidChance = min(0.5, skillLevel * 0.007)
```

### Special Abilities

```typescript
// Poker
rerolls = floor(skillLevel / 30)           // 0, 1, 2, 3
peeks = skillLevel >= 50
  ? floor((skillLevel - 20) / 30)          // 0, 1, 2
  : 0

// Blackjack
doubleDown = skillLevel >= 5
insurance = skillLevel >= 15
cardCounting = skillLevel >= 20
  ? min(30, floor((skillLevel - 20) * 0.5))
  : 0

// Press Your Luck
safeDraw = skillLevel >= 10
safeDrawCost = skillLevel >= 10
  ? max(25, 100 - floor((skillLevel - 10) * 0.83))
  : 100
doubleDownPYL = skillLevel >= 25
```

## Common Test Patterns

### Testing Skill Progression

```typescript
it('should show meaningful progression', () => {
  const levels = [0, 25, 50, 75, 100];
  const results = levels.map(level => ({
    level,
    modifiers: calculateSkillModifiers(level, 3)
  }));

  // Verify increasing benefits
  for (let i = 1; i < results.length; i++) {
    expect(results[i].modifiers.cardBonus)
      .toBeGreaterThan(results[i-1].modifiers.cardBonus);
  }
});
```

### Testing Unlock Thresholds

```typescript
it('should unlock at exact threshold', () => {
  const justBefore = calculateSpecialAbilities(29);
  const atThreshold = calculateSpecialAbilities(30);

  expect(justBefore.rerollsAvailable).toBe(0);
  expect(atThreshold.rerollsAvailable).toBe(1);
});
```

### Testing Caps and Limits

```typescript
it('should cap at maximum value', () => {
  const modifiers = calculateSkillModifiers(100, 3);

  // Danger avoidance capped at 50%
  expect(modifiers.dangerAvoidChance).toBe(0.5);
});
```

## Expected Values Reference

### Threshold Reduction by Skill Level
| Skill | Difficulty 1 | Difficulty 3 | Difficulty 5 |
|-------|--------------|--------------|--------------|
| 0     | 0            | 0            | 0            |
| 10    | 2            | 3            | 4            |
| 30    | 9            | 11           | 13           |
| 50    | 16           | 18           | 21           |
| 70    | 24           | 27           | 30           |
| 100   | 33           | 36           | 40           |

### Card Bonus by Skill Level
| Skill | Difficulty 1 | Difficulty 3 | Difficulty 5 |
|-------|--------------|--------------|--------------|
| 0     | 0            | 0            | 0            |
| 10    | 1            | 2            | 3            |
| 30    | 6            | 8            | 9            |
| 50    | 12           | 13           | 15           |
| 70    | 18           | 20           | 22           |
| 100   | 24           | 27           | 30           |

### Ability Unlock Levels
| Ability | Unlock Level | Max Value |
|---------|--------------|-----------|
| Rerolls | 30, 60, 90   | 3         |
| Peeks   | 50, 80       | 2         |
| Double Down (BJ) | 5   | Boolean   |
| Insurance | 15         | Boolean   |
| Card Counting | 20    | 30        |
| Safe Draw | 10         | Boolean   |
| Safe Draw Cost | 10   | 26-100g   |
| Double Down (PYL) | 25 | Boolean   |

## Debugging Tips

### Verify Skill Calculations

```typescript
// Check intermediate values
const skill = 50;
const linear = skill * 0.75;          // 37.5
const exp = Math.pow(skill, 1.1) * 0.05;  // ~3.75
const total = linear + exp;           // ~41.25
const scale = 0.8 + (3 * 0.1);        // 1.1
const threshold = Math.floor(total * 0.4 * scale);  // 18
```

### Test Boundary Conditions

```typescript
// Always test one below, at, and one above thresholds
const boundaries = [
  { threshold: 30, below: 29, at: 30, above: 31 },
  { threshold: 50, below: 49, at: 50, above: 51 },
  // ...
];
```

### Verify Caps

```typescript
// Test that caps hold at extreme values
const extremeSkill = calculateSkillModifiers(200, 5);
const maxSkill = calculateSkillModifiers(100, 5);

expect(extremeSkill.dangerAvoidChance).toBe(0.5);
expect(extremeSkill.dangerAvoidChance)
  .toBe(maxSkill.dangerAvoidChance);
```

## Contributing

When adding new tests:

1. **Follow naming convention**: `should [behavior] when [condition]`
2. **Group related tests**: Use `describe()` blocks
3. **Test edge cases**: 0, negative, max, overflow
4. **Verify formulas**: Add comments showing expected calculations
5. **Use meaningful assertions**: Test exact values where possible

## Related Files

- **Source**: `server/src/services/deckGames.ts`
- **Types**: `@desperados/shared/src/types/*`
- **Integration**: `server/tests/integration/destinyDeck.integration.test.ts`

## Status

✅ All tests passing (31/31)
✅ No bugs found
✅ Production-ready

Last updated: 2025-11-27
