# Frontier Zodiac System Audit Report

## Overview
The Frontier Zodiac system provides an astrological progression system where characters earn star fragments through activities, complete constellations, and unlock bonuses based on current zodiac signs and birth signs. The system features peak day bonuses (2x multiplier) and Star Walker status for completing all 12 constellations. The client-side React hook provides fallback calculations for offline scenarios.

## Files Analyzed
- Server: frontierZodiac.service.ts, frontierZodiac.controller.ts
- Model: FrontierZodiac.model.ts
- Client: useZodiac.ts
- Data: server/src/data/frontierZodiac.ts

## What's Done Well
- Well-structured service with clear method organization
- Proper separation of constellation progress tracking from bonus calculation
- Instance methods properly handle Map operations with markModified calls
- Good error handling with AppError custom exception type
- Proper pre-save hook to recalculate constellation completion stats
- Multiple index strategies on frequently queried fields
- Client-side fallback calculations for resilience
- Comprehensive leaderboard querying with population
- Peak day multiplier properly documented (2.0x)
- Birth sign selected as permanent one-time choice with validation

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Birth Sign Set as Mutable String | model.ts:119 | birthSign defaults to empty string `''` but check is `if (zodiac.birthSign)` - empty string truthy fails | Default to null, check with falsy operator: `if (!zodiac.birthSign)` |
| Fragment Overflow on Constellation | model.ts:198 | addFragments() caps completion at fragmentsRequired but continues accumulating totalFragments | Cap totalFragments per constellation or allow overflow tracking |
| Star Walker Hardcoded Sign IDs | model.ts:296-300 | checkStarWalker() uses hardcoded array of sign IDs instead of querying FRONTIER_SIGNS | Import FRONTIER_SIGNS from data and use .map(s => s.id) |
| No Transactional Constellation Completion | service.ts:226-258 | addStarFragments updates zodiac without checking concurrent updates; two adds could both mark complete | Use findByIdAndUpdate with $set conditions or transaction |
| Optimistic Update Mismatch | useZodiac.ts:283-289 | After API error, sets birthSign optimistically in state but doesn't persist; state inconsistent with server | Either remove optimistic update or sync after with fetch |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Birth Sign Cannot Be Changed | service.ts:177-180 | Throws error if birthSign already set, but no admin override method exists | Add admin method to reset birth sign or allow one-time change window |
| No Validation for Negative Fragments | model.ts:178 | addFragments checks `amount <= 0` but no guard in service calling it | Add validation in service.ts:215-216 before calling |
| Bonus Multiplier Stack Overflow | model.ts:632-636 | calculateBonusMultiplier multiplies 2.0 * 2.0 if both birth sign AND peak day; could reach 4.0 | Document whether stacking is intended or cap at 3.0 |
| Fragment Calculation Missing isStarWalker Check | model.ts:618-624 | calculateFragmentReward applies multipliers but isStarWalker applied last, could exceed reasonable caps | Add global cap: `Math.min(255, fragments)` or verify balance |
| Unhandled Populate Error | model.ts:363, 373 | getLeaderboard/getStarWalkers populate characterId but don't handle null references in UI | Add null check in leaderboard rendering or verify Character always exists |
| No Zodiac Initialization Check | controller.ts:118-120 | getProgress accesses req.character without checking if auth middleware attached | Add auth middleware documentation or explicit check |
| Peak Day Bonus Not Capped | service.ts:344-375 | isPeakDay multiplier always 2.0, no cap on total activity bonuses; could reach 3.0x+ | Document max multiplier or implement cap |
| Missing Fragment Decay | service.ts:591-627 | calculateFragmentReward high but never decays; players could farm unlimited | Implement daily/weekly caps or diminishing returns |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No Peak Day Caching | useZodiac.ts:120-123 | isPeakDay computed every render but checks real date; should cache for performance | Use setInterval to check once per hour for peak day changes |
| Constellation Completion Without Date | model.ts:200 | Sets completedAt date but getProgress() returns in zodiac state; if date passed claimable forever | Implement claim expiration window (e.g., 30 days) |
| Leaderboard Pagination Missing | service.ts:533 | getLeaderboard uses single limit but no offset/skip for pagination | Add offset parameter: `find(...).skip(offset).limit(limit)` |
| No Favorite Activity Validation | service.ts:437-439 | Updates stats.favoriteActivity on first bonus, but doesn't verify activity is real | Add activity whitelist validation |
| Controller Type Casting Unsafe | controller.ts:118 | `req.character?._id?.toString()` could return undefined, checked with `if (!characterId)` but toString() might fail first | Reorder: `const characterId = req.character?._id; if (!characterId) throw...` |

## Bug Fixes Needed
1. **model.ts:119** - Change default from `''` to `null` and update checks: `if (zodiac.birthSign === null)` or use Optional
2. **model.ts:296-300** - Import and use: `const signIds = FRONTIER_SIGNS.map(s => s.id);`
3. **model.ts:198-207** - Add cap: `if (progress.fragmentsEarned > fragmentsRequired) progress.fragmentsEarned = fragmentsRequired;`
4. **service.ts:226** - Wrap in transaction or use atomic findByIdAndUpdate
5. **useZodiac.ts:283-289** - Remove optimistic update or add cache validation
6. **service.ts:214-216** - Add: `if (amount <= 0 || !Number.isInteger(amount)) throw new AppError(...)`
7. **model.ts:632-636** - Change to: `let multiplier = 1.0; if (isBirthSign) multiplier += 1.0; if (isPeakDay) multiplier = Math.min(3.0, multiplier * 2.0);`
8. **model.ts:618-624** - Add: `Math.min(255, fragments)` as global cap
9. **controller.ts:118-120** - Verify auth middleware or add explicit check

## Incomplete Implementations
- Sign compatibility system (method exists but unused)
- Fragment decay/daily caps mechanism
- Claim expiration windows for rewards
- Leaderboard pagination
- Favorite activity validation against whitelist
- Fragment farming prevention

## Recommendations
1. **HIGH PRIORITY**: Fix birthSign type mismatch (empty string vs null) to prevent boolean coercion bugs
2. **HIGH PRIORITY**: Implement atomic constellation completion updates with transactions
3. **HIGH PRIORITY**: Add daily fragment earning caps or diminishing returns to prevent farming
4. Implement fragment expiration/decay system for balance
5. Add claim expiration windows (30 days) for constellation rewards
6. Implement pagination for leaderboards with offset/limit
7. Add whitelist validation for favorite_activity field
8. Cache peak day status with 1-hour TTL instead of recalculating every render
9. Implement sign compatibility system usage documentation or create dedicated endpoint
10. Add comprehensive audit logging for all constellation completions and reward claims
11. Create admin panel for zodiac stat adjustments and resets
12. Implement constellation reset on new lunar cycle (monthly) or document permanence

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 8 hours
- Medium fixes: 5 hours
- Total: 19 hours

**Overall Score: 7/10** (Well-structured progression system but birth sign type issue and missing transaction support need fixing)
