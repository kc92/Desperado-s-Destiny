# NPC Relationships System Audit Report

## Overview
System 45 implements faction reputation mechanics where characters gain or lose standing with three major factions (Settler Alliance, Nahi Coalition, Frontera) through their actions. The system tracks reputation points (-100 to +100) that map to standing levels (hostile to honored) with associated benefits, price modifiers, and rival faction penalties.

## Files Analyzed
- Server: reputation.service.ts, reputation.controller.ts
- Shared: reputation.types.ts

## What's Done Well
- Clean, well-documented service class with clear method names and purposes
- Proper transaction handling in modifyReputation using MongoDB sessions
- Comprehensive logging of reputation changes with context
- Comprehensive standing threshold and price modifier calculations
- Rival faction penalty system creates meaningful relationship dynamics
- Faction-specific benefits properly differentiated by standing level
- History tracking for audit trail and player feedback
- Well-structured controller with error handling for each endpoint

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No input validation on faction parameter | reputation.service.ts:32-37 | modifyReputation accepts any string as faction without validation | Add enum validation for Faction type |
| Missing character existence check in history endpoint | reputation.controller.ts:105-119 | getHistory doesn't verify character exists before querying | Add early character existence check |
| Unsafe type assertion in controller | reputation.controller.ts:26-33 | Type casting Record without validation could fail at runtime | Add proper type guards before casting |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No rate limiting on reputation endpoints | reputation.controller.ts:16-52 | API endpoints vulnerable to spam/abuse | Implement rate limiting middleware |
| Amount not capped before database | reputation.service.ts:51-52 | Capping happens in memory but transaction isn't atomic if cap changes | Move cap calculation before transaction |
| No validation of amount parameter | reputation.service.ts:32-37 | Negative amounts could be abused for reputation farming | Add explicit validation: if (Math.abs(amount) > MAX_CHANGE) throw |
| Missing error handling in bulkUpdateReputation | reputation.service.ts:314-333 | If one update fails, others may still proceed | Wrap in transaction and abort on any failure |
| No access control on controller | reputation.controller.ts:16-52 | Character access not verified on endpoints | Ensure req.character is authenticated before use |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| TODO comment in ReputationSpreadingService | reputationSpreading.service.ts:436 | "TODO: Calculate per-faction" indicates incomplete implementation | Implement faction-specific standing calculations |
| Hard-coded rival relationships | reputation.service.ts:250-255 | Rival map is hard-coded and inflexible | Move to configuration file or database |
| No bounds checking on rival penalty | reputation.service.ts:248 | 30% penalty always applied regardless of impact | Add min/max bounds |
| Standing threshold gaps create dead zones | reputation.service.ts:103-109 | Gap between -50 and 0 is wider than other ranges | Rebalance thresholds for consistency |

## Bug Fixes Needed
1. **reputation.service.ts:32-37** - Add faction validation: if (!['settlerAlliance', 'nahiCoalition', 'frontera'].includes(faction)) throw
2. **reputation.service.ts:51-52** - Move amount capping before line 52 to ensure cap is applied during transaction
3. **reputation.controller.ts:18-20** - Add explicit null check: if (!characterId) throw new AppError('Character not found', 401)
4. **reputation.service.ts:245-248** - Add validation: if (amount <= 0 || rivalPenalty < 0) return with explicit logging
5. **reputation.controller.ts:59-99** - Add try-catch for session handling in case transaction fails

## Incomplete Implementations
- Faction-specific reputation decay: No time-based reputation decay; standing persists indefinitely
- Cross-faction reputation calculations: Setting stance with one faction doesn't auto-adjust others
- Character faction membership: No way to join/leave factions mechanically
- Achievement system integration: Reputation achievements/badges not implemented
- Player-vs-Player reputation: Only faction reputation, no individual character reputation

## Recommendations
1. **IMMEDIATE**: Implement input validation for all faction parameters
2. Add rate limiting on reputation endpoints
3. Implement faction decay system to make reputation dynamic over time
4. Add comprehensive audit logging with user/cause tracking
5. Create admin UI to view/manage reputation per character
6. Implement achievement system tied to reputation milestones

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 8 hours
- Medium fixes: 6 hours
- Total: 18 hours

**Overall Score: 7/10** (Core mechanics are solid and well-structured, but missing validation, rate limiting, and dynamic features like decay)
