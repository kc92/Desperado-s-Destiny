# Destiny Deck Engine Audit Report

## Overview
The Destiny Deck Engine is a sophisticated poker-based challenge system with action-deck integration, skill-based bonuses, and comprehensive hand evaluation.

## Files Analyzed
- Server: action.controller.ts, actionDeck.service.ts, handEvaluator.service.ts, action.routes.ts
- Client: DeckGame.tsx (MISSING!)

## What's Done Well
- Hand Evaluation Logic (comprehensive poker hand evaluation, all rankings)
- Skill-Based Bonuses (character skills affect suit-specific actions)
- Atomic Transactions (energy deducted atomically)
- Error Handling (try-catch blocks, ownership verification)
- Crime Integration (crime resolution after action)
- Rate Limiting (60 challenges per minute)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Difficulty threshold wrong | action.controller.ts:238 | difficulty * 100,000 = impossible to win | Change to difficulty * 100 |
| Missing client component | DeckGame.tsx | File doesn't exist, routes unusable | Create component or remove routes |
| Items not awarded | action.controller.ts:279 | TODO comment, items never given | Implement or remove from rewards |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Memory leak in pending games | actionDeck.service.ts:32-47 | In-memory maps lost on restart | Move to Redis/database |
| Uses deprecated spendEnergy | actionDeck.service.ts:271 | Not atomic, race condition | Use EnergyService.spend() |
| Race condition crime resolve | action.controller.ts:316-321 | Character reload outside transaction | Handle within transaction |
| Uses stats not skills | action.controller.ts:30-39 | Bonuses from stats instead of skill levels | Use getSkillBonusForSuit() |
| Incorrect bonus storage | actionDeck.service.ts:284-290 | Stored bonuses don't match actual | Store actual bonuses used |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No difficulty validation | action.controller.ts:122-130 | Difficulty range not validated | Validate 0-100 range |
| XP calculation wrong | action.controller.ts:250-256 | Doesn't use game result multiplier | Use game engine rewards |
| N+1 query potential | action.controller.ts:484 | Two separate queries | Combine into aggregation |
| No card count validation | action.controller.ts:220 | Assumes 5 cards returned | Add assertion |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hand description unclear | handEvaluator.service.ts:74 | Shows rank number not card | Use card display format |
| Hardcoded hand rankings | handEvaluator.service.ts:61-178 | No enum, magic numbers | Use HandRank enum |
| No seeded RNG | handEvaluator.service.ts:328-336 | Can't replay games | Add optional seed param |

## Bug Fixes Needed
1. **CRITICAL - action.controller.ts:238** - Change `action.difficulty * 100000` to `action.difficulty * 100`
2. **CRITICAL - action.controller.ts:279** - Implement item reward or remove from response
3. **actionDeck.service.ts:32-47** - Move pending games to Redis
4. **actionDeck.service.ts:271** - Use EnergyService.spend()
5. **action.controller.ts:30-39** - Use skill levels not stats for bonuses

## Incomplete Implementations
- **Interactive Deck Game System** - Routes exist but no client component
- **Item Rewards** - TODO comment, never implemented
- **Unified Suit Bonus Calculation** - Two separate implementations

## Recommendations
1. **IMMEDIATE**: Fix difficulty threshold (actions are impossible to win!)
2. **IMMEDIATE**: Fix suit bonus to use skills not stats
3. **IMMEDIATE**: Fix energy deduction to use atomic service
4. Move pending games from memory to Redis
5. Create DeckGame.tsx client component or remove routes
6. Implement seeded RNG for replay/testing

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 5 hours
- Medium fixes: 3 hours
- Total: 14 hours

**Overall Score: 4/10** (CRITICAL: Difficulty calculation makes game unplayable!)
