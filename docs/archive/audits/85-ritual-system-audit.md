# Ritual System Audit Report

## Overview
The Ritual System enables dark ritual performance with components, participants, and risk/reward mechanics. Uses in-memory active ritual tracking and integrates with Corruption Service. Architecture is present but many effects are placeholder implementations (TODOs and logging-only).

## Files Analyzed
- Server: ritual.service.ts, ritual.controller.ts, ritual.routes.ts, rituals.ts (data)
- Client: useRituals.ts

## What's Done Well
- Well-defined ritual data structure with comprehensive fields (components, knowledge requirements, consequences)
- Proper ritual completion flow with success/failure/critical paths
- Clear separation between starting ritual (instant cost deduction) and completion (time-gated)
- Good error handling in controller with proper HTTP status codes
- Client hook has proper loading states and error handling
- Participation system framework in place
- Integration with CorruptionService for knowledge tracking

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| In-memory ritual tracking lost on server restart | ritual.service.ts:24-30 | `activeRituals = new Map()` loses all active rituals if server crashes | Persist to database (create RitualSession model with recovery logic) |
| No participant validation | ritual.service.ts:132-138 | Accepts any participant IDs without checking if online/valid | Query Character collection to validate participant existence |
| All ritual effects are stubs | ritual.service.ts:331-388 | Knowledge, power, summon, protection, transformation all just log - no actual effects applied | Implement full effect system with persistence |
| Unhandled ritual result application | ritual.service.ts:234-257 | Calls applyRitualResults but doesn't verify success; crashes silently | Add error handling and transaction rollback |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing component inventory check | ritual.service.ts:97-98 | TODO comment; ritual components never validated or consumed | Implement inventory check + consumption in startRitual |
| No location requirement enforcement | ritual.service.ts:98-99 | TODO comment; rituals can be started anywhere despite location requirements | Validate character.currentLocation matches ritual.location |
| Cooldown not implemented | ritual.service.ts:99-100 | TODO comment; no cooldown tracking between rituals | Add cooldown timestamp to character or separate model |
| Ritual failure consequences incomplete | ritual.service.ts:393-431 | Only applies corruption and madness; damage/sanity effects logged but not applied | Integrate with SanityService and health system |
| Client-server desync possible | ritual.service.ts:471-485 | Client has activeRitual state but server tracks in-memory Map; time can desync | Implement polling endpoint or WebSocket updates |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Ritual discovery endpoint not implemented | ritual.service.ts:525-550 | Service method exists but no controller endpoint defined | Add POST /rituals/:ritualId/discover endpoint |
| Arbitrary success chance calculation | ritual.service.ts:228 | Caps at 95% but formula undocumented | Document calculation logic and balance values |
| Critical success chance too high | ritual.service.ts:229 | RITUAL_CRITICAL_CHANCE constant unknown; could be unbalanced | Define in constants and review against design |
| No ritual-specific error messaging | ritual.routes.ts:43 | Generic error messages don't indicate why ritual can't start | Return detailed requirements from canPerformRitual check |
| Ritual duration not enforced | ritual.service.ts:156 | Time requirement stored but next call could complete immediately if time check loose | Ensure completesAt check is strict |

## Bug Fixes Needed
1. **ritual.service.ts:24-30** - Create RitualSession model and migrate to database persistence
2. **ritual.service.ts:132-138** - Add Character existence validation
3. **ritual.service.ts:97-99** - Implement component consumption and location validation
4. **ritual.service.ts:341-387** - Implement actual effect application (not just logging)
5. **ritual.service.ts:393-431** - Integrate with SanityService for sanity loss effects
6. **ritual.controller.ts** - Add discovery endpoint handler implementation
7. **useRituals.ts:220-226** - Add periodic polling for active ritual updates

## Incomplete Implementations
- All ritual effect systems (knowledge granting, stat bonuses, entity summoning, transformations, item grants)
- Failure consequence system (only corruption applied, sanity/damage stubs)
- Ritual discovery/learning progression
- Participant reward distribution
- Component inventory management and consumption
- Location-specific ritual requirements
- Cooldown tracking between ritual executions
- Ritual interruption prevention/protection mechanics

## Recommendations
1. **URGENT**: Migrate active rituals from in-memory Map to RitualSession database model
2. Implement complete effect application system with transaction safety
3. Add ritual component inventory validation and consumption
4. Integrate location validation for ritual execution
5. Implement cooldown system to prevent ritual spam
6. Create RitualEffect model to track all permanent effect changes
7. Add WebSocket real-time updates for active ritual progress
8. Implement participant reward system with configurable distribution
9. Add ritual logging/audit trail for balance analysis
10. Create admin tools for ritual balancing and testing

## Estimated Fix Effort
- Critical fixes: 12 hours
- High fixes: 10 hours
- Medium fixes: 6 hours
- Total: 28 hours

**Overall Score: 4/10** (Core framework present but 60% of features are unimplemented stubs; not production-ready)
