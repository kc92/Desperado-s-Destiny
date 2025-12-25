# Skill Training System Audit Report

## Overview
The Skill Training System handles offline progression, skill leveling, and integration with the Destiny Deck suit bonuses. Skills improve character success rates through leveling.

## Files Analyzed
- Server: skill.service.ts, skill.controller.ts, skill.routes.ts
- Client: Skills.tsx
- Shared: skills.constants.ts

## What's Done Well
- Skill Definitions & Constants (30+ skills, 4 suits, clear progression)
- Transaction-Safe Training (mongoose transactions throughout)
- XP Progression System (exponential curve, tier system)
- Offline Progression Support (auto-complete on login)
- Suit Bonus Integration (getSkillBonusForSuit method)
- Client-Side UI (complete interface, category filtering)
- Input Validation (skillId, exists, max level checks)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Training complete race condition | skill.service.ts:270-279 | Check outside transaction | Move check inside transaction |
| Notification failure silent | skill.service.ts:325-347 | Catch swallows error | Log and ensure retry |
| Starting level unclear | skill.service.ts:32 | Level 1 vs 0 design issue | Clarify and adjust XP |
| TOCTOU vulnerability | skill.service.ts:271 | isTrainingComplete() outside transaction | Validate completesAt inside |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Concurrent training weak | skill.service.ts:113-118 | In-memory check can be bypassed | Add database index |
| Training time not validated | skill.service.ts:150 | Could be 0 or extreme | Validate min/max bounds |
| Inline skill initialization | skill.service.ts:129-140 | Creates on demand in transaction | Initialize all at creation |
| Client polling no backoff | Skills.tsx:59-65 | Constant requests | Only poll while training |
| Quest integration missing | skill.service.ts:311-317 | QuestService may not exist | Ensure available |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No skill unlock validation | skill.controller.ts | Can train locked skills | Check SKILL_UNLOCKS |
| XP calculation inconsistent | skill.service.ts vs controller | Two calculation locations | Centralize |
| MAX_CONCURRENT_TRAINING unused | skills.constants.ts:466 | Constant never checked | Use or document |
| No session injection | skill.controller.ts | Can't use in larger transactions | Add session param |
| Time remaining calculation | skill.controller.ts:134 | Uses completesAt - startedAt | Should be completesAt - now |
| No training interruption | skill.routes.ts:34 | Jailed players keep training | Auto-cancel on jail |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No skill spec template | skills.constants.ts | Manual configuration | Create factory function |
| Tier thresholds hardcoded | skills.constants.ts:355-391 | Can't easily adjust | Extract to constants |
| No skill bonus cap | Character.model.ts:790-804 | Bonuses accumulate infinitely | Cap at reasonable value |
| Hardcoded suit names | skill.service.ts:328-334 | Could diverge from enum | Import from constants |

## Bug Fixes Needed
1. **CRITICAL - skill.service.ts:270-279** - Move training completion check inside transaction
2. **CRITICAL - skill.service.ts:325-347** - Ensure notifications are reliable
3. **skill.service.ts:113-118** - Add unique index to prevent concurrent training
4. **skill.service.ts:150** - Validate training time is reasonable
5. **skill.controller.ts** - Check skill unlock requirements

## Incomplete Implementations
- **Skill Unlock System** - Defined but never validated
- **Training Interruption** - Jailed players continue training
- **Skill XP Tracking** - Experience field unused in UI
- **Mentor Integration** - Placeholder for MentorPanel

## Recommendations
1. **IMMEDIATE**: Fix training completion race condition
2. **IMMEDIATE**: Fix notification failure handling
3. Implement skill unlock checking
4. Fix concurrent training race condition
5. Auto-cancel training on jail
6. Implement skill XP visibility in UI

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 5 hours
- Medium fixes: 4 hours
- Total: 13 hours

**Overall Score: 6/10** (Critical race conditions in training)
