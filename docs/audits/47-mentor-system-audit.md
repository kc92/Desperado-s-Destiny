# Mentor System Audit Report

## Overview
System 47 implements a mentorship system where players can study under NPCs to unlock abilities and progress through a relationship progression system (5 trust levels). Each mentor teaches 5 abilities across different trust levels, has a personal storyline with quests, and offers passive/active/unlock ability types with cooldowns and energy costs. Mentorships are exclusive (one at a time) and can have conflicting specialty pairings.

## Files Analyzed
- Server: mentor.service.ts, mentor.controller.ts, mentors.ts
- Client: mentor.service.ts, useMentors.ts, MentorDialogue.tsx
- Shared: mentor.types.ts

## What's Done Well
- Clean service layer with comprehensive eligibility checking
- Proper transaction handling in requestMentorship
- Support for multiple requirement types (level, faction rep, NPC trust, skills, bounty status)
- Conflict prevention system preventing incompatible mentorships
- Comprehensive mentor data with rich dialogue and storyline
- Client hook properly handles loading states and error cases
- MentorDialogue component integrates well with tutorial system
- Ability unlock progression tied to trust levels creates pacing
- Default mentor fallback data in hook prevents client crashes

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No validation that mentorId exists | mentor.service.ts:32-37 | getMentorDetails doesn't verify mentor exists before returning | Add: if (!mentor) throw new AppError('Mentor not found', 404) |
| Unsafe faction string manipulation | mentor.service.ts:74-78 | toLowerCase().replace() could fail or map wrong faction | Use explicit enum mapping: FACTION_MAP = {...} |
| Energy cost not checked before deduction | mentor.service.ts:318-326 | Spends energy without verifying canAffordAction result | Add bounds check: if (!character.canAffordAction(energyCost)) throw |
| No bounds on cooldown Map access | mentor.service.ts:310-314 | Accessing mentorship.activeAbilityCooldowns as Map without type safety | Add: const cooldowns = mentorship.activeAbilityCooldowns || new Map() |
| Missing mentor existence on advanceMentorship | mentor.service.ts:226-275 | Mentor data fetched but not validated as non-null before accessing | Add null check after getMentorById |
| Race condition in ability use | mentor.service.ts:328-342 | Cooldown set and character saved separately; could partially update | Wrap both updates in transaction |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No validation of mentorId parameter | mentor.service.ts:134-143 | requestMentorship accepts mentorId without validation | Add: const mentor = getMentorById(mentorId); if (!mentor) throw |
| Skill checking loops without bounds | mentor.service.ts:106-113 | No limit on skills object size; could cause slowdown | Add: if (Object.keys(skills).length > MAX_SKILLS) throw |
| Progress not validated in advanceMentorship | mentor.service.ts:239-240 | tasksCompleted could be negative or huge | Add validation: if (tasksCompleted < 0 || tasksCompleted > 100) throw |
| Mentor conflict checking incomplete | mentor.service.ts:117-126 | Only checks specialty, but specialty enum values don't match conflict data | Use actual mentor object comparison |
| Missing rate limiting on controller | mentor.controller.ts:14-179 | All endpoints lack rate limiting | Add rate limiting middleware |
| No transaction in completeStorylineQuest | mentor.service.ts:383-410 | Two separate saves could result in partial completion | Wrap both saves in transaction |
| Client doesn't validate mentor data shape | useMentors.ts:104-127 | Assumes API response has expected structure | Add Zod schema validation or type guards |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hardcoded Max Trust Level | mentor.service.ts:246 | MentorTrustLevel.HEIR hard-coded instead of using array length | Use: const maxLevel = Math.max(...MENTORS.abilities.map(a => a.trustRequired)) |
| No cooldown persistence on save | mentor.service.ts:331-332 | Cooldown Map may not serialize/deserialize correctly | Add custom serialization: activeAbilityCooldowns: cooldowns.toJSON() |
| Progress formula not documented | mentor.service.ts:240 | Magic number: tasksCompleted * 10 not explained | Add comment: // Each task = 10% of 100% progress required |
| No mentorship timeout | mentor.service.ts:154-188 | Mentorship has no expiration; can be abandoned indefinitely | Add: abandonmentThreshold: 30 days of inactivity |
| Hook fetchCurrentMentor could stale-cache | useMentors.ts:272-285 | No cache invalidation after state changes | Add dependency tracking or explicit invalidation |
| MentorDialogue doesn't handle missing portrait | MentorDialogue.tsx:278-286 | Fallback to placeholder only works if placeholder exists | Verify placeholder exists in build pipeline |

## Bug Fixes Needed
1. **mentor.service.ts:32-37** - Add mentor existence check
2. **mentor.service.ts:74-78** - Replace unsafe string manipulation with enum map
3. **mentor.service.ts:318-326** - Add explicit energy cost bounds check
4. **mentor.service.ts:310-314** - Add safe Map access with fallback
5. **mentor.service.ts:199-202** - Add null check after getMentorById
6. **mentor.service.ts:328-342** - Wrap cooldown and save in transaction
7. **mentor.controller.ts:31, 52, 73, 103, 121** - Add null checks on req.character assertion
8. **useMentors.ts:304-327** - Add Zod validation for API response shape

## Incomplete Implementations
- Mentor availability system: Mentors always available; no traveling/unavailable states despite enum
- Mentor-specific dialogue variations: Single dialogue set per mentor; no context-specific variation
- Ability tooltip system: Effects array not documented in UI; players don't see what abilities do
- Mentorship history UI: No UI to view past mentors or retained progress
- Training session system: Mentioned in hook types but not implemented in server
- Mentee reputation effects: Being mentee should affect NPC interactions; not implemented

## Recommendations
1. **IMMEDIATE**: Add mentor existence validation
2. Replace unsafe faction string manipulation with enum map
3. Add transaction safety to ability use
4. Implement mentor availability state machine
5. Add API response shape validation on client
6. Implement mentorship timeout/abandonment system
7. Add rate limiting to all mentor endpoints
8. Implement mentor-specific dialogue variation

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 8 hours
- Medium fixes: 7 hours
- Total: 20 hours

**Overall Score: 7.5/10** (Well-designed progression system with good eligibility checks, but missing validation on mentor IDs, unsafe string operations, and incomplete features like mentor availability)
