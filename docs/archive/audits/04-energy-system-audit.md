# Energy System Audit Report

## Overview
The Energy System manages energy regeneration, spending, and grants with explicit transaction safety. The implementation spans server-side services and controllers with client-side store integration.

## Files Analyzed
- Server: energy.service.ts, energy.controller.ts, energy.routes.ts, Character.model.ts
- Client: useEnergyStore.ts, useEnergy.ts

## What's Done Well
- Atomic Operations & Race Condition Prevention (optimistic locking, retry on race)
- Energy Regeneration Logic (pure calculation, multiplier system scaffolded)
- Backward Compatibility (legacy methods marked @deprecated)
- Proper Error Handling (try-catch, consistent response format)
- Client-Server Synchronization (energy timer, periodic sync)
- Route Security (auth + character ownership required)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Regeneration not persisted | energy.controller.ts:22 | regenerateEnergy() mutates in-memory only, no save() | Add await character.save() |
| Race condition in performChallenge | action.controller.ts:156-178 | Soft check before atomic op can be invalidated | Remove soft check or make advisory |
| Deprecated methods still called | actionDeck.service.ts:90, 93 | Uses non-atomic instance methods | Use EnergyService.canAfford() |
| Infinite recursive retry | energy.service.ts:215-221 | No depth limit on race condition retry | Add counter/backoff |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Async call during transaction | energy.service.ts:167 | getRegenMultiplier() called in atomic op | Cache before transaction |
| Instance methods not session-aware | Character.model.ts:625-649 | No MongoDB session support | Deprecate or add session param |
| Response schema mismatch | energy.controller.ts:26-36 | Response doesn't match frontend interface | Align schemas |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No rate limiting on energy endpoints | energy.routes.ts | Could be spammed | Add rateLimit middleware |
| Premium system incomplete | Character.model.ts:590-591 | TODO comment for premium check | Complete integration |
| Client timer can drift | useEnergyStore.ts:80-112 | Updates every 1 second | Sync every 30 seconds |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Unclear regen formula | game.constants.ts:12-33 | "per hour" vs millisecond rates | Add documentation |
| Energy bonus system unused | useEnergy.ts:12-29 | Interface defined but never populated | Remove or implement |

## Bug Fixes Needed
1. **energy.controller.ts:22** - Add `await character.save()` after regenerateEnergy()
2. **action.controller.ts:165-178** - Remove soft energy check, rely on atomic failure
3. **energy.service.ts:221** - Add retry counter/backoff to prevent stack overflow
4. **actionDeck.service.ts:90, 93** - Use EnergyService methods instead of deprecated instance methods
5. **energy.service.ts:167** - Cache premium multiplier before transaction

## Incomplete Implementations
- Premium Energy System (constants defined but not integrated)
- Energy Bonuses (interface defined but unused)

## Recommendations
1. **IMMEDIATE**: Fix energy regeneration persistence
2. **IMMEDIATE**: Fix race condition in performChallenge
3. **IMMEDIATE**: Add retry limit to optimistic lock
4. Add rate limiting to energy endpoints
5. Complete premium status integration
6. Implement client-side drift correction

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 3 hours
- Medium fixes: 2 hours
- Total: 9 hours

**Overall Score: 6/10** (Critical race conditions need immediate fix)
