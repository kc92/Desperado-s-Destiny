# Animal Companion Combat System Audit Report

## Overview
The Animal Companion Combat System integrates companions into combat encounters with damage bonuses, defense reduction, ability usage, and contribution tracking.

## Files Analyzed
- Server: companionCombat.service.ts, companion.service.ts, taming.service.ts
- Client: useCompanions.ts

## What's Done Well
- Role-based damage scaling (ATTACKER, DEFENDER, SUPPORT, SCOUT)
- Bond level integration (higher bond = more effective)
- Transaction safety with sessions
- Proper ownership verification
- Health-based effectiveness

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| KO companion still switchable | companionCombat.service.ts:274-298 | isActive=false but location not changed | Set location to 'knocked_out' |
| No damage cap | companionCombat.service.ts:32-79 | Damage bonus unbounded | Add Math.min cap |
| Defense reduction divide by zero | companionCombat.service.ts:84-129 | companionDamage could be 0 | Use Math.max(1, companionDamage) |
| Auto-ability picks unavailable | companionCombat.service.ts:325-362 | Hardcoded ability IDs | Filter by companion.abilities |
| No encounter validation | companionCombat.service.ts:134-236 | encounterId parameter unused | Verify active combat session |
| Damage not tracked for combat | companionCombat.service.ts:241-269 | Companion damage not logged | Return data to duel service |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Training completion not verified | companion.service.ts:496-538 | Timestamp check might fail | Add explicit comparison |
| No bond loss on defeat | companionCombat.service.ts:421-444 | Only hunger/happiness reduced | Add companion.lossBond(5) |
| Cooldown not per-round | companion.service.ts:159 | Stored as timestamp | Store by round number |
| Only 20% health restored | companionCombat.service.ts:428-429 | Never fully recovers | Full heal on victory |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No respawn mechanic | N/A | Can't revive dead companions | Implement respawn |
| No experience system | N/A | encountersHelped tracked but no level-up | Add leveling |
| No fatigue mechanic | N/A | Can fight indefinitely | Add stamina system |
| No ability energy cost | N/A | Abilities free to use | Add companion energy |

## Bug Fixes Needed
1. **CRITICAL** - Set `companion.location = 'knocked_out'` when health = 0
2. **CRITICAL** - Add damage caps: `Math.min(bonus, maxBonusDamage)`
3. **CRITICAL** - Fix division: `Math.max(1, companionDamage)` as divisor
4. **CRITICAL** - Filter auto-abilities: `companion.abilities.includes(abilityId)`
5. **CRITICAL** - Validate encounterId matches active combat
6. **MEDIUM** - Add `companion.lossBond(5)` on defeat

## Incomplete Implementations
- Companion Respawn Mechanic - can't revive dead companions
- Companion Experience System - tracked but no level-up
- Companion Fatigue/Stamina - fights indefinitely
- Ability Energy Cost - not validated

## Recommendations
1. Implement KO state properly (prevent switching)
2. Add damage caps for balance
3. Fix defense reduction formula
4. Validate ability availability before auto-use
5. Track combat damage properly
6. Add bond loss consequences

## Estimated Fix Effort
- Critical fixes: 5 hours
- Medium fixes: 3 hours
- Low fixes: 6 hours
- Total: 14 hours

**Overall Score: 5/10** (Critical math and state bugs)
