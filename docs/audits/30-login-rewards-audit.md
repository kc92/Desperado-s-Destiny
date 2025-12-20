# Login Rewards System Audit Report

## Overview
The Login Rewards system offers a 28-day cyclic reward calendar with 4 weeks of escalating rewards, weekly multipliers (1x→2.5x), premium items on day 7, and monthly bonus.

## Files Analyzed
- Server: loginReward.service.ts, loginReward.controller.ts, loginReward.routes.ts, LoginReward.model.ts
- Data: loginRewards.ts

## What's Done Well
- Consistent UTC time handling throughout
- 28-day cycle with automatic reset
- Streak calculation checking consecutive days
- Reward variety (gold, items, materials, energy, premium)
- Week multipliers (1.0x → 2.5x)
- Permission-based admin reset
- Transaction safety for rewards

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Timezone vulnerability | loginReward.service.ts:129-131 | PST player can claim twice | Document UTC requirement |
| Monthly bonus vulnerability | loginReward.service.ts:406-468 | Cycle reset edge case | Ensure flag persists |
| No duplicate claim protection | loginReward.service.ts:213-216 | Race condition possible | Wrap in transaction |
| Calendar cycle filter bug | loginReward.service.ts:342-347 | Old claims disappear on reset | Clarify behavior |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| longestStreak = currentStreak | loginReward.service.ts:500-504 | Never tracks highest | Add separate field |
| Premium probabilities not shown | loginReward.service.ts:388-401 | Function may not exist | Verify implementation |
| Energy overflow lost | loginReward.service.ts:305-310 | Silently wasted | Store or notify |
| Inventory increment race | loginReward.service.ts:318-330 | Not atomic | Use $inc operator |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Claimed rewards accumulation | loginReward.service.ts:254-256 | Keeps 56, loses history | Add pagination |
| Character lookup repeated | loginReward.controller.ts:19-31 | N+1 pattern | Use middleware |

## Bug Fixes Needed
1. **CRITICAL - loginReward.service.ts:213-216** - Wrap duplicate check in transaction
2. **CRITICAL - loginReward.service.ts:129-131** - Document that rewards reset at UTC midnight
3. **HIGH - loginReward.service.ts:500-504** - Add longestStreak field to model
4. **HIGH - loginReward.service.ts:318-330** - Use MongoDB atomic `$inc` for inventory

## Incomplete Implementations
- **Premium Reward System** - Generation not fully visible
- **Material Rarity Scaling** - No probability adjustment
- **Energy Over-Capping** - Silent loss
- **Longest Streak Tracking** - Always equals current

## Recommendations
1. Fix time zone documentation
2. Add longest streak separate field
3. Handle energy overflow
4. Use atomic inventory updates
5. Add requireCharacter middleware
6. Implement pagination for history
7. Verify premium reward functions exist

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 4 hours
- Medium fixes: 2 hours
- Total: 11 hours

**Overall Score: 6/10** (Time zone and race condition issues)
