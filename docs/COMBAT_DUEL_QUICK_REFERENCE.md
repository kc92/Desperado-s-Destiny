# Combat Duel System - Quick Reference Guide

## Overview
The Combat Duel System (Phase 4) is a card-based tactical combat system where players split their 5-card hand between attack and defense each round.

---

## Card Values

| Card Type | Value |
|-----------|-------|
| 2-10 | Face Value |
| Jack (J) | 10 |
| Queen (Q) | 10 |
| King (K) | 10 |
| Ace (A) | 11 |

---

## Damage Calculation

```typescript
baseDamage = sum(attackCardValues)
skillModifier = floor(skillLevel * 0.3)
handBonus = getPokerHandBonus(attackCards)

totalDamage = max(1, baseDamage + weaponBonus + skillModifier + handBonus)
damageDealt = max(1, totalDamage - opponentDefense)
```

**Minimum damage:** Always 1 (even if defense exceeds attack)

---

## Defense Calculation

```typescript
baseDefense = sum(defenseCardValues)
skillModifier = floor(skillLevel * 0.3)
handBonus = floor(getPokerHandBonus(defenseCards) * 0.5)

totalDefense = max(0, baseDefense + armorBonus + skillModifier + handBonus)
damageTaken = max(0, opponentAttack - totalDefense)
```

**Minimum defense:** 0 (can completely block weak attacks)

---

## Poker Hand Bonuses

| Hand | Attack Bonus | Defense Bonus |
|------|--------------|---------------|
| High Card | +0 | +0 |
| Pair | +5 | +2 |
| Two Pair | +10 | +5 |
| Three of a Kind | +15 | +7 |
| Straight | +20 | +10 |
| Flush | +25 | +12 |
| Full House | +30 | +15 |
| Four of a Kind | +35 | +17 |
| Straight Flush | +40 | +20 |
| Royal Flush | +50 | +25 |

**Note:** Defense receives 50% of the attack bonus value

---

## Combat Flow

### 1. Initialization
- Player HP: Usually 100
- Opponent HP: Based on difficulty
- Draw initial 5 cards
- Combat round starts at 1

### 2. Each Round
1. **Card Selection**
   - Select cards for attack (0-5 cards)
   - Select cards for defense (0-5 cards)
   - Unassigned cards auto-assign to attack

2. **Execution**
   - Calculate player damage
   - Calculate opponent damage
   - Apply damage to both HP pools
   - Check victory/defeat conditions

3. **Next Round**
   - Discard used cards
   - Draw fresh 5 cards
   - Increment round counter
   - Reset attack/defense selections

### 3. End Conditions
- **Victory:** Opponent HP ≤ 0
- **Defeat:** Player HP ≤ 0
- **Timeout:** Round > 20 → Compare HP percentages
- **Flee:** Available rounds 1-3 only

---

## Flee Mechanics

**When Available:** Rounds 1, 2, 3 only
**After Round 3:** Cannot flee (must fight to end)

**Flee Results:**
- Status: Resolved (but not victory)
- Score: 10 (minimal)
- Experience: 5 XP
- Opponent HP: Reset to max (no victory credit)

---

## Victory Rewards

```typescript
difficultyMultiplier = 1 + (difficulty * 0.2)

baseGold = floor((30 + difficulty * 15) * difficultyMultiplier * suitBonus)
baseXP = floor((20 + difficulty * 8) * suitBonus)
```

**Example at Difficulty 3:**
- Difficulty Multiplier: 1.6
- Base Gold: ~120-240 (with suit bonus)
- Base XP: ~44-88 (with suit bonus)

---

## Strategic Tips

### Offense-Focused Build
- **Equipment:** High weapon bonus
- **Skill:** 30+ for damage modifier
- **Strategy:** 4-5 cards to attack, 0-1 to defense
- **Best For:** Low opponent HP, high player armor

### Defense-Focused Build
- **Equipment:** High armor bonus
- **Skill:** 30+ for defense modifier
- **Strategy:** 1-2 cards to attack, 3-4 to defense
- **Best For:** High opponent damage, need to outlast

### Balanced Build
- **Equipment:** Moderate weapon + armor
- **Skill:** 50+ for better modifiers
- **Strategy:** 2-3 attack, 2-3 defense
- **Best For:** Unknown opponents, general purpose

### Poker Hand Strategy
- **Pairs in hand?** Keep together for +5 bonus
- **Flush possible?** Worth +25 bonus!
- **High cards?** Better in attack (10-11 value each)
- **Low cards?** Still useful for defense

---

## Skill Level Impact

| Skill Level | Modifier | Effect |
|-------------|----------|--------|
| 0 | +0 | No bonus |
| 10 | +3 | Small boost |
| 30 | +9 | Noticeable advantage |
| 50 | +15 | Significant power |
| 70 | +21 | Strong combatant |
| 100 | +30 | Master fighter |

**Formula:** `modifier = floor(skillLevel * 0.3)`

---

## Round Limits

- **Max Rounds:** 20
- **Flee Rounds:** 1-3
- **Typical Combat:** 3-7 rounds
- **Timeout Resolution:** HP percentage comparison

---

## Example Combat Scenario

### Setup
- Player HP: 100
- Opponent HP: 80
- Player Weapon: +5
- Player Armor: +3
- Player Skill: 30 (modifier = +9)

### Round 1
**Hand:** 10♠, 7♥, 5♣, A♦, 3♠

**Attack Cards:** 10♠, A♦, 7♥ (Pair? No, Flush? No)
- Base: 10 + 11 + 7 = 28
- Weapon: +5
- Skill: +9
- Hand Bonus: 0
- **Total Attack: 42**

**Defense Cards:** 5♣, 3♠
- Base: 5 + 3 = 8
- Armor: +3
- Skill: +9
- Hand Bonus: 0
- **Total Defense: 20**

**Opponent:**
- Attack: 25
- Defense: 10

**Results:**
- Player Damage Dealt: max(1, 42 - 10) = **32 damage** → Opponent HP: 48
- Player Damage Taken: max(0, 25 - 20) = **5 damage** → Player HP: 95

### Round 2
- Player HP: 95
- Opponent HP: 48
- Draw new 5 cards...

---

## Common Mistakes to Avoid

1. ❌ **All attack, no defense** - Can result in heavy damage taken
2. ❌ **Ignoring poker hands** - Missing +50 damage opportunities
3. ❌ **Not fleeing when outmatched** - Better to flee early than lose
4. ❌ **Forgetting skill bonuses** - Higher skill = significant advantage
5. ❌ **Random card split** - Strategic selection matters!

---

## Testing Coverage

All combat mechanics are thoroughly tested:
- ✅ 49 unit tests passing
- ✅ All damage/defense formulas verified
- ✅ Poker hand bonuses confirmed
- ✅ Victory/defeat conditions tested
- ✅ Flee mechanics validated
- ✅ Round progression checked
- ✅ Edge cases handled

**Test File:** `server/tests/deckGames/combatDuel.test.ts`

---

## API Actions

```typescript
// Select attack cards
processAction(state, {
  type: 'select_attack',
  cardIndices: [0, 1, 2]
});

// Select defense cards
processAction(state, {
  type: 'select_defense',
  cardIndices: [3, 4]
});

// Execute turn
processAction(state, {
  type: 'execute_turn'
});

// Flee (rounds 1-3 only)
processAction(state, {
  type: 'flee'
});
```

---

## Key Differences from Other Game Types

### vs. Poker Hold/Draw
- Combat uses HP instead of score
- Cards split between attack/defense
- Opponent actively fights back
- Rounds continue until HP depleted

### vs. Press Your Luck
- No danger cards
- All cards have value
- Strategic card allocation required
- Opponent interaction

### vs. Blackjack
- No bust mechanic
- All 5 cards used each round
- Active defense strategy
- Real-time opponent

---

## Future Enhancements (Potential)

- Special abilities unlocked at high skill
- Critical hits based on hand quality
- Combo attacks across multiple rounds
- Team combat (player + ally vs opponents)
- Environmental effects modifying damage
- Weapon/armor durability system

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**See Also:**
- `COMBAT_DUEL_TEST_REPORT.md` - Full test documentation
- `server/src/services/deckGames.ts` - Implementation code
- `docs/destiny-deck-algorithm.md` - Game design specification
