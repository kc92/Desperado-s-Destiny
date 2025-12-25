# Mysterious Figure System Audit Report

## Overview
The Mysterious Figure System manages 10 wandering supernatural/enigmatic NPCs with cryptic quests, trade mechanics, and lore integration. Provides spawn conditions based on time/weather/player state, offers branching questlines, and connects to The Scar mythology. Heavy reliance on static data-driven configuration with limited dynamic behavior.

## Files Analyzed
- Server: mysteriousFigure.service.ts, mysteriousFigures.ts (data)
- Seeds: mysteriousFigureQuests.seed.ts

## What's Done Well
- Comprehensive spawn condition system (location, time, weather, player state, level gates)
- Good separation of public information (greeting, hints) from mechanics (spawn logic)
- Discovery system prevents overpowered figures from appearing to new players
- Multiple interaction modes (talk, trade, quest, information)
- Lore organization by topic with knowledge areas
- Quest integration with QuestDefinition creation
- Supernatural level classification system
- Warning/hint system for The Scar connection
- Event-triggered special appearances
- Trade system with gold/barter options

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Type Casting Everywhere | mysteriousFigure.service.ts:100,155,302-303 | Heavy use of `character as any` and `figure as any` bypassing type safety | Create proper TypeScript types or use discriminated unions |
| Unvalidated Inventory Access | mysteriousFigure.service.ts:179-181,613,621,625,630,634 | Assumes `character.inventory` exists and is array; no null checks | Add type guards: `if (!Array.isArray(character.inventory)) throw AppError` |
| Missing Transaction Scope | mysteriousFigure.service.ts:611,641 | Gold/inventory modifications not in transaction - race condition for concurrent trades | Wrap trade in MongoDB session transaction |
| Quest Creation Side Effect | mysteriousFigure.service.ts:391-406 | Creates QuestDefinition as side effect - duplicates if quest already exists | Check both character quest history AND QuestDefinition existence atomically |
| Incomplete Player Condition Checks | mysteriousFigure.service.ts:157-192 | Switch statement with empty cases (worthy_deed, arrogant_action, demon_encounter, cursed) always returns true | Implement actual condition checks or remove placeholder cases |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Time-of-Day Hardcoding | mysteriousFigure.service.ts:516-523 | Uses `new Date().getHours()` for game time instead of game server time | Use centralized TimeService |
| No Authorization Check | mysteriousFigure.service.ts:583-648 | Trade doesn't validate character has discovered figure before trading | Add discovery check before trade |
| Random Spawn Chance Design | mysteriousFigure.service.ts:83,549 | Multiple random() checks cause unpredictable spawn rates | Calculate single probability |
| Barter Item Validation Missing | mysteriousFigure.service.ts:612-626 | Assumes barterItem exists in inventory without type checking | Add validation |
| No Duplicate Quest Prevention | mysteriousFigure.service.ts:378-382 | Only checks CharacterQuest, not if player already accepted from another interaction | Add double-check |
| Inventory Index Access | mysteriousFigure.service.ts:621 | findIndex() called but then used without bounds check | Add bounds check before splice |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No Figure Availability | mysteriousFigure.service.ts:226-234 | interact() doesn't check if figure actually exists at location/time | Add location/time validation |
| Magic Number Spawn Chances | mysteriousFigure.service.ts:549 | Event-triggered spawn 50% hardcoded | Extract to constant |
| Cryptic Hints Unsorted | mysteriousFigure.service.ts:259 | Takes first 3 hints, doesn't shuffle (deterministic response) | Use `.sort(() => Math.random() - 0.5)` |
| Incomplete Dialog Cases | mysteriousFigure.service.ts:261-263 | Returns greeting + 2 hints but doesn't vary based on character history | No context awareness for repeated interactions |
| Missing Lore Validation | mysteriousFigure.service.ts:440 | getLore() returns empty array if topic not found | Return contextual message |
| Save Without Verification | mysteriousFigure.service.ts:641,475 | character.save() called but result not verified | Add error handling |

## Bug Fixes Needed
1. **mysteriousFigure.service.ts:100,155** - Replace `as any` casts with proper types
2. **mysteriousFigure.service.ts:179-181** - Add inventory guard
3. **mysteriousFigure.service.ts:611-641** - Wrap in transaction
4. **mysteriousFigure.service.ts:516-523** - Replace with centralized time: `GameTimeService.getCurrentHour()`
5. **mysteriousFigure.service.ts:83,549** - Simplify spawn probability
6. **mysteriousFigure.service.ts:621** - Add bounds check
7. **mysteriousFigure.service.ts:378-382** - Add discovery check in trade
8. **mysteriousFigure.service.ts:157-192** - Implement actual condition checks

## Incomplete Implementations
- Player condition checking system has 7 placeholder cases with no logic
- Game time relies on real world clock, not game server time
- Lore/dialogue has empty category fallbacks
- No tracking of which figures player has encountered before
- Discovery system only prevents spawn, doesn't affect interaction
- Quest outcomes don't branch based on player choices
- Warning system about The Scar is informational only
- No consequence system for refusing quests
- Trade history not tracked
- Event triggers not implemented (near_death, moral_choice, artifact_found, demon_encounter)

## Recommendations
1. **CRITICAL**: Remove all `as any` type casts and implement proper TypeScript interfaces
2. **CRITICAL**: Implement transaction safety for all trade operations
3. **CRITICAL**: Implement missing player condition checks
4. **HIGH**: Add discovery requirement validation before allowing trade/quest acceptance
5. **HIGH**: Integrate with GameTimeService instead of real-world clock
6. **HIGH**: Add comprehensive error handling for inventory operations
7. **MEDIUM**: Implement event triggers for special appearances
8. **MEDIUM**: Create quest outcome branching system
9. **LOW**: Track figure encounter history and dialogue variation
10. **LOW**: Implement consequence system for quest refusal

## Estimated Fix Effort
- Critical fixes: 12 hours
- High fixes: 8 hours
- Medium fixes: 6 hours
- Total: 26 hours

**Overall Score: 5/10** (Ambitious design with good spawn/interaction framework but multiple critical gaps - missing type safety, no transactions, incomplete conditions, no discovery enforcement)
