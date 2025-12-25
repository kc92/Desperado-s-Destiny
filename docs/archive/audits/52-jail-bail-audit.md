# Jail/Bail System Audit Report

## Overview
The Jail Service provides comprehensive imprisonment mechanics including jail sessions, escape attempts, bribing guards, bail payments, and jail activities (labor, socializing). Includes activity cooldowns, sentence tracking, and release mechanisms.

## Files Analyzed
- Server: jail.service.ts, jail.controller.ts, jail.routes.ts, jail.middleware.ts
- Shared: jail.types.ts

## What's Done Well
- Comprehensive jail activity system with escape attempts and bribing mechanics
- Proper transaction handling for critical operations
- Clear error messages with specific reasons for failures
- Good separation of concerns between service, controller, and middleware
- Notification system integration for jail events
- Support for external sessions allowing transaction coordination
- Well-defined jail reasons and locations enums
- Session management pattern allows either internal or external transactions

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Sentence calculation error | jail.service.ts:605-612 | Circular logic: getJailInfo calculates sentence using getRemainingJailTime which depends on sentence | Fix calculation to use actual jailedUntil time directly |
| Activity cooldown stub | jail.service.ts:725-731 | checkActivityCooldown always returns canPerform: true; cooldowns not actually enforced | Implement proper cooldown tracking |
| Missing escape penalty validation | jail.service.ts:224-226 | JAIL_ACTIVITIES.escape_attempt.failurePenalty used but could be undefined | Add validation that config contains required fields |
| No concurrent escape prevention | jail.service.ts:182-253 | Multiple simultaneous escape attempts could all succeed | Implement distributed lock |
| Unvalidated bribe calculations | jail.service.ts:285-297 | minBribe and acceptance calculations use unchecked config values | Add validation that config values are reasonable |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Incomplete bail parameters | jail.service.ts:78-79 | calculateBail uses both wantedLevel and sentence, but sentence not always passed | Add validation |
| Turn-in bounty mismatch | jail.service.ts:530-597 | turnInPlayer uses WANTED_ARREST_THRESHOLD but also multiplies bounty | Document multiplier application order |
| Prison labor XP not awarded properly | jail.service.ts:773-774 | XP awarded directly but gold uses GoldService transaction | Wrap XP in same transaction |
| Missing activity attempt recording | jail.service.ts:775-777 | recordActivityAttempt logs but doesn't update Character model | Implement proper cooldown storage |
| No jail escape skill checks | jail.service.ts:702-720 | Escape chance calculation hardcoded; doesn't validate skill existence | Add null checks for skills |
| Bribe guard half-loss unvalidated | jail.service.ts:329-330 | 50% gold loss could be exploited by rapid bribe attempts | Cap total bribe loss per sentence |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Location jail mapping incomplete | jail.service.ts:647-658 | Only 4 locations mapped; many frontier locations not handled | Add comprehensive mapping |
| No validation of jail reason | jail.service.ts:42-50 | JailReason parameter not validated against enum | Add enum validation |
| Missing bail amount documentation | jail.service.ts:678-679 | Formula not documented | Add comment explaining bail calculation |
| Town square mapping incomplete | jail.service.ts:664-672 | Only 4 jail locations return town squares | Add validation or logging |
| No max escape attempts | jail.service.ts:182-253 | Escape can be attempted repeatedly with no cumulative penalty | Implement max attempts |

## Bug Fixes Needed
1. **jail.service.ts:605-612** - Replace circular calculation with: Math.floor((character.jailedUntil.getTime() - Date.now()) / (60 * 1000))
2. **jail.service.ts:225-226** - Add null check: const penaltyMinutes = JAIL_ACTIVITIES.escape_attempt?.failurePenalty || 30
3. **jail.service.ts:726-731** - Implement cooldown: fetch cooldown from character.jailActivityCooldowns
4. **jail.service.ts:773-774** - Move addExperience call into GoldService transaction wrapper
5. **jail.service.ts:288** - Add validation: if (remainingMinutes <= 0) throw new Error('Already released')
6. **jail.service.ts:710-716** - Add null checks before accessing skill properties

## Incomplete Implementations
- Activity cooldown tracking: Stubbed method always returns true; needs Character model storage
- Jail activity attempt recording: Logged but not persisted for cooldown enforcement
- Location mapping completeness: Only 4 of 20+ frontier locations mapped to jails
- Max escape attempts: No limit on escape attempts; could be abused
- Escalating escape penalties: First attempt adds time, but no escalation documented

## Recommendations
1. **IMMEDIATE**: Fix sentence calculation circular logic
2. Implement proper activity cooldown tracking with Character model storage
3. Add comprehensive location-to-jail mapping
4. Document and validate bribe loss limits and escape attempt caps
5. Add test coverage for concurrent escape/bribe attempts
6. Move all reward-related code to use same transaction pattern

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 7 hours
- Medium fixes: 4 hours
- Total: 16 hours

**Overall Score: 6.5/10** (Good framework but with critical calculation bugs and stubbed cooldown system)
