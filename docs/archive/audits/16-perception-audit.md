# Perception System Audit Report

## Overview
The Perception System provides skill-based intelligence gathering for PvP duels with passive hints and active abilities that cost energy and have cooldowns.

## Files Analyzed
- Server: perception.service.ts
- Related: duelStateManager.service.ts

## What's Done Well
- Progressive skill tiers (confidence → hand ranges → tells → reveals → predictions)
- Poker face mitigation (opponent skill reduces effectiveness)
- Probability-based hints with trigger chances
- Contest roll mechanic (skill vs skill)
- Energy cost structure

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hand strength source unclear | perception.service.ts:170-176 | handStrength parameter not validated | Document contract |
| Cold read doesn't reveal hand | perception.service.ts:474-509 | Returns generic hint, not actual hand | Integrate poker evaluation |
| No energy validation | perception.service.ts:374-418 | No bounds checking on energy | Validate 0 <= energy <= maxEnergy |
| Reveals actual card objects | perception.service.ts:310-328 | Direct reference could be logged | Return card notation instead |
| Cooldown not enforced | perception.service.ts:80-89 | Returns cooldown but not tracked | Integrate with DuelStateManager |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Action prediction too simple | perception.service.ts:333-369 | Only uses hand strength | Include betting pattern + position |
| Confidence capped at 0.95 | perception.service.ts:235-241 | Even max level has doubt | Allow 0.99+ at max |
| False tell always detectable | perception.service.ts:530-562 | Opponent knows result | Only return to defender on loss |
| Behavior tell detection simplistic | perception.service.ts:272-305 | Counts aggressive bets only | Add temporal analysis |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Cheating abilities not implemented | perception.service.ts:599-603 | PEEK, MARK_CARDS, etc. defined only | Implement or remove |
| No ability abuse prevention | N/A | No max uses per round | Add limits |
| No card array validation | getPassiveHints() | Assumes valid array | Add null check |
| No betting pattern validation | getPassiveHints() | Assumes valid actions | Add type guards |
| Contest roll no max cap | perception.service.ts:568-583 | Could get 250+ score | Cap maximum |

## Bug Fixes Needed
1. **CRITICAL** - Implement actual hand reveal in cold read ability
2. **CRITICAL** - Integrate cooldown tracking with DuelStateManager
3. **CRITICAL** - Return card notation string instead of Card object
4. **CRITICAL** - Validate energy bounds before using ability
5. **HIGH** - Include betting pattern + position in action prediction
6. **HIGH** - Only return false tell detection to defending player

## Incomplete Implementations
- **Cheating Abilities** (PEEK, MARK_CARDS, REROLL, PALM_CARD) - defined but crash if used
- **Defense Against Ability Abuse** - no max energy pool, no max uses per round
- **Perception Level Progression** - no way to train perception skill
- **Integration with Actual Duel Service** - unclear integration point
- **Betting History Validation** - could be faked client-side

## Recommendations
1. Implement actual hand reveals for perception abilities
2. Track cooldowns in duel state manager
3. Add ability use limits per round
4. Validate all input arrays
5. Implement or remove cheating abilities
6. Document perception skill progression

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 3 hours
- Medium fixes: 3 hours
- Total: 11 hours

**Overall Score: 5/10** (Abilities don't actually reveal information)
