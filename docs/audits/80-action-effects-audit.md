# Action Effects System Audit Report

## Overview
The Action Effects system calculates and applies influence changes to faction standings based on player actions across combat, economic, criminal, social, and gang categories. It handles complex modifier calculations, spillover effects, diminishing returns, milestone tracking, and leaderboard rankings. Uses MongoDB transactions for data consistency.

## Files Analyzed
- Server: actionEffects.service.ts, actionInfluenceMap.ts
- Models: PlayerInfluenceContribution.model.ts, Character.model.ts, Gang.model.ts
- Types: actionEffects.types.ts
- Data: actionInfluenceMap.ts (configuration)

## What's Done Well
- Comprehensive action-to-influence mapping with 34 distinct action types and configurable effects
- Proper transaction handling with session.startTransaction() for atomicity
- Well-designed modifier system with multiple bonus types (level, reputation, gang, event, territory, skill)
- Sophisticated spillover rules covering 8 major factions with antagonist/ally relationships
- Territory volatility configuration allowing per-territory multipliers
- Milestone progression system with clear thresholds (100, 500, 1000, 2500, 5000)
- Diminishing returns implementation preventing action spam
- Leaderboard support with weekly/monthly aggregations
- Rich PlayerInfluenceContribution model with daily tracking and aggregations
- Proper indexing strategy on frequently queried fields
- Extensive configuration data with descriptive comments

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Event Bonus Always Zero | actionEffects.service.ts:253 | eventBonus is hardcoded to 0; no event system integration | Implement event detection and bonus calculation |
| Untested Spillover Conversion | actionEffects.service.ts:423-427 | actionFactionToTerritoryFaction conversion called but function not validated; possible null pointer | Add null checks after conversion; validate conversion is reversible |
| Missing ActionFactionId Enum Value | actionInfluenceMap.ts:20 | CRIMINAL_SMUGGLE references ActionFactionId.OUTLAW_FACTION but no mapping defined for null primaryFaction at runtime | Define runtime logic for determining faction from NPC/enemy context |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| N+1 Query Problem | actionEffects.service.ts:388-401 | calculateDiminishingReturns queries PlayerInfluenceContribution.find() without filtering; loads all contributions then filters in memory | Use aggregation pipeline with $match on characterId and date |
| Reputation Calculation Overflow | actionEffects.service.ts:297 | reputationBonus calculation could produce values >1.0 with high reputation; no maximum cap | Cap reputation bonus to max (e.g., 0.50 for +50%) |
| No Input Validation | actionEffects.service.ts:42-47 | characterId, actionCategory, territoryId not validated; could cause silent failures | Add schema validation for all input parameters |
| Missing Character Validation | actionEffects.service.ts:53-56 | If Character.findById returns null, throws "Character not found" but doesn't log character ID | Log character ID for debugging |
| Session Not Properly Handled | actionEffects.service.ts:48-232 | If error occurs before session.startTransaction(), endSession is called but session was never started | Move startTransaction before any async operations; wrap in try-finally |
| Unbounded Daily Array Growth | actionEffects.service.ts:273-294 | dailyContributions keeps only 90 days but re-sorts entire array on each contribution (O(n log n)) | Use date-based expiry query instead of sorting on every update |
| Skill Bonus Calculation Bug | actionEffects.service.ts:338-348 | getSkillBonus iterates character.skills but skills array structure not validated | Add type guards and logging for skill parsing |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hardcoded String Generation | actionEffects.service.ts:476-551 | Milestone rewards use template literals without validation that these exist in game | Validate cosmetic/ability/quest IDs exist in game data |
| Missing Milestone Bounds | actionEffects.service.ts:472-558 | If milestone parameter is unknown, baseRewards lookup returns undefined | Add exhaustiveness check or default case |
| Leak Sensitive Data | actionEffects.service.ts:220-223 | logger.info includes full character name and faction; logs visible to monitoring systems | Sanitize logs to not include personal identifying information |
| No Validation on Spillover Rates | actionInfluenceMap.ts:567-666 | Spillover rates could be >1.0 or negative; no validation | Add validation: 0 <= spilloverRate <= 1.0 |
| Territory ID Not Validated | actionEffects.service.ts:45-46 | territoryId parameter used but not validated against TERRITORY_VOLATILITY_MAP | Validate territoryId or log warning for unknown territories |
| Gang Bonus Calculation Incorrect | actionEffects.service.ts:318-319 | gangLevel * 0.03 could produce values >0.30 due to gang.level growing unbounded | Use Math.min(0.30, Math.max(0, gangLevel * 0.03)) |
| Spillover Effect Deadlock Risk | actionEffects.service.ts:145-179 | Secondary contributions created/updated in loop without checking if character already being processed | Add distributed lock or use atomic bulk operations |
| Missing Transaction Rollback Logic | actionEffects.service.ts:226-229 | Session abort doesn't retry or queue for later; failed contributions are silently lost | Add error recovery: retry with exponential backoff or queue for async processing |

## Bug Fixes Needed
1. **actionEffects.service.ts:253** - Implement event system integration for eventBonus calculation
2. **actionEffects.service.ts:388-401** - Replace find().filter() with aggregation pipeline using $match
3. **actionEffects.service.ts:297** - Cap reputation bonus to maximum (0.50 or configurable)
4. **actionEffects.service.ts:42-47** - Add input validation for characterId, actionCategory, territoryId
5. **actionEffects.service.ts:318-319** - Fix gang bonus calculation: Math.min(0.30, Math.max(0, gangLevel * 0.03))
6. **actionEffects.service.ts:438-439** - Add null check after actionFactionToTerritoryFaction conversion
7. **actionEffects.service.ts:169-173** - Use findByIdAndUpdate with $inc for atomic secondary contributions
8. **PlayerInfluenceContribution.model.ts:291-292** - Remove in-memory sorting; use chronological insertion
9. **actionInfluenceMap.ts:567-666** - Add validation that spillover rates are between 0 and 1.0
10. **actionEffects.service.ts:48-232** - Ensure session.startTransaction() called before any async operations

## Incomplete Implementations
- Event system integration (TODO at line 253; eventBonus always 0)
- No validation that generated cosmetic/ability/quest IDs exist in game data
- Missing transaction rollback logic for failed contributions (silent failures)
- No distributed lock implementation for preventing concurrent modification deadlocks
- No async queue for retrying failed transactions
- Gang faction alignment check simplified (comment at line 316 says "can be expanded")

## Recommendations
1. **CRITICAL**: Implement event system with bonus calculation logic
2. **CRITICAL**: Add null checks after actionFactionToTerritoryFaction conversions
3. **CRITICAL**: Validate all input parameters (characterId, actionCategory, territoryId)
4. **HIGH**: Fix N+1 query in calculateDiminishingReturns using aggregation
5. **HIGH**: Cap reputation bonus to configurable maximum (e.g., 0.50)
6. **HIGH**: Fix gang bonus calculation to prevent values >0.30
7. **HIGH**: Use atomic $inc operations for secondary contributions instead of create/update loop
8. **MEDIUM**: Implement distributed lock to prevent concurrent modification deadlocks
9. **MEDIUM**: Add transaction retry logic with exponential backoff
10. **MEDIUM**: Validate generated cosmetic/ability/quest IDs against game data
11. **MEDIUM**: Remove in-memory sorting of dailyContributions; use MongoDB ordering
12. **MEDIUM**: Improve rank calculation with compound index on (factionId, totalInfluenceContributed)
13. **LOW**: Sanitize logs to remove personally identifiable information
14. **LOW**: Add warning/validation for unknown territory IDs

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 7 hours
- Medium fixes: 6 hours
- Total: 19 hours

**Overall Score: 7/10** (Excellent design with transactions and complex modifier system but significant gaps in validation, null handling, and N+1 queries)
