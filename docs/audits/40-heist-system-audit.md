# Heist System Audit Report

## Overview
The Heist System enables gangs to plan and execute heists against various targets with role-based crew assignments, skill-based success calculations, and dynamic outcome determination. It includes planning progression, risk management, and consequences for crew members (arrests/casualties).

## Files Analyzed
- Server: heist.service.ts, heist.controller.ts, heist.routes.ts, GangHeist.model.ts, heist.constants (inferred)
- Client: useHeist.ts

## What's Done Well
- Clear heist lifecycle management (PLANNING -> READY -> IN_PROGRESS -> COMPLETED)
- Skill-based success calculation factoring in planning progress, crew skill, risk, and heat
- Proper transaction support for critical operations (planHeist, executeHeist, cancelHeist)
- Role-based crew assignment system with skill level tracking
- Cooldown mechanism prevents target spam (isTargetOnCooldown static method)
- Gang economy integration for equipment cost deduction
- Outcome probabilities well-balanced (success/partial/failure ranges)
- Clear separation of concerns between service, controller, routes
- Equipment cost system prevents free heist planning

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race Condition: Role Assignment During Execution | heist.service.ts:162 | addRoleAssignment called outside transaction but heist gets saved in transaction | Move role assignment into transaction context |
| Missing Gang Leadership Validation | heist.service.ts:95 | isLeader check doesn't verify leader actually exists or still has permissions | Validate leader status and permissions |
| Unbounded Heat Level Calculation | heist.service.ts:297-299 | No cap on total heat from multiple active heists | Implement heat level cap per gang (e.g., 100 max) |
| No Character Availability Validation | heist.service.ts:149-157 | Accepts character assignments without checking if alive, imprisoned, or busy | Validate character is available |
| Missing Equipment Cost Refund | heist.service.ts:122-124 | Equipment cost deducted but never refunded on heist cancellation | Refund equipment cost when heist is cancelled |
| Incomplete Arrest Consequences | heist.service.ts:275-281 | Logs arrest but doesn't actually apply jail time | Integrate with jail system to apply actual penalties |
| Missing Casualty Application | heist.service.ts:286-293 | Logs casualties but doesn't apply death/injury to character | Integrate with character death system |
| Race Condition: Concurrent Execution | heist.service.ts:238-307 | Multiple concurrent executeHeist calls could process same heist | Add execution lock or use $setOnInsert |
| Floating Point Randomness | heist.service.ts:346-347 | Uses Math.random() directly without seeding | Use deterministic random with seed for testing |
| No Validation of Economy State | heist.service.ts:110 | Assumes GangEconomy exists but doesn't validate balance | Add early validation that economy record exists |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing Target Validation | heist.service.ts:80-82 | Accepts heist target without validating it exists in game world | Validate target exists and is valid heist location |
| Incomplete Success Chance Calculation | heist.service.ts:299-325 | Formula doesn't account for equipment quality, previous failures, or guard levels | Add equipment quality bonus and guard level modifier |
| No Gang Level Escalation | heist.service.ts:46-49 | Gang level requirement checked but no difficulty tiers | Implement difficulty progression based on gang level |
| Missing Role Requirements Validation | heist.service.ts:137-163 | Accepts any role assignments without validating required roles are filled | Add validation that all required roles are assigned |
| No Participant Status Tracking | heist.service.ts:156 | Checks gang membership but doesn't track who specifically is participating | Add explicit participant list with status |
| Arbitrary Arrest Rates | heist.service.ts:367-374, 381 | Arrest counts calculated with hardcoded percentages (50%, 60%) | Make arrest rates configurable based on security level |
| No Risk Level Scaling | heist.service.ts:140 | Risk level set from config but never adjusted based on planning | Implement dynamic risk scaling based on preparation |
| Missing Cooldown Validation Message | heist.service.ts:100-103 | Cooldown error message doesn't show when target becomes available | Add cooldown expiration timestamp to error |
| Incomplete Role Skill Validation | heist.service.ts:159-160 | Calculates skill as character.level * 2 without actual skill proficiencies | Use actual relevant skill levels |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No Target Cooldown Configuration | heist.service.ts:44 | isTargetOnCooldown uses hardcoded cooldownDays from config | Validate cooldown days is reasonable (1-30) |
| Hardcoded Planning Progress Increment | heist.controller.ts:186 | Increases planning by 10 points by default | Document progress mechanics |
| Missing Role Assignment Endpoint | heist.controller.ts:300-342 | assignRole endpoint returns stub message | Implement role assignment or remove endpoint |
| No Heist State Validation in Controller | heist.controller.ts:169 | increasePlanning doesn't validate heist is in PLANNING status | Add status validation in controller |
| Incomplete Casualty Handling | heist.service.ts:391-400 | Only applies casualties on high-risk failure with 20% chance | Adjust casualty probability based on difficulty |
| Missing Partial Success Logic | heist.service.ts:361-374 | Partial success exists but outcomes not fully differentiated | Enhance partial success with unique consequences |
| No Gang Reputation Integration | heist.service.ts:268 | Doesn't integrate with gang reputation system | Add reputation gains/losses based on outcomes |
| Missing Heist History Tracking | heist.service.ts:374 | Completed heists stored but no structured history | Add detailed heist journal with statistics |

## Bug Fixes Needed
1. **CRITICAL - heist.service.ts:162** - Move addRoleAssignment into transaction scope
2. **CRITICAL - heist.service.ts:95** - Add comprehensive leader validation
3. **CRITICAL - heist.service.ts:122-124** - Implement equipment cost refund on cancellation
4. **CRITICAL - heist.service.ts:149-157** - Add character availability validation
5. **CRITICAL - heist.service.ts:275-281** - Integrate with jail system for arrests
6. **CRITICAL - heist.service.ts:286-293** - Integrate with character death system for casualties
7. **CRITICAL - heist.service.ts:297-299** - Add heat level cap per gang
8. **HIGH - heist.service.ts:346-347** - Replace Math.random() with seedable randomness
9. **HIGH - heist.service.ts:110** - Add early economy state validation
10. **HIGH - heist.service.ts:80-82** - Add target existence validation

## Incomplete Implementations
- Target System - Heist targets referenced but HEIST_CONFIGS location/structure not evident
- Equipment Quality System - Equipment cost exists but no quality tiers affecting success
- Guard/Security System - Risk level set but no guard AI or difficulty modifiers
- Casualty/Death Integration - Casualties tracked but not applied to character system
- Arrest/Jail Integration - Arrests tracked but not applied to jail system
- Gang Reputation System - No reputation gains/losses for heist outcomes
- Crew Experience System - No skill improvement from heist participation
- Heat Management System - Heat tracked but no consequences (wanted level increases)
- Role-specific Bonuses - Roles assigned but no unique skill bonuses per role
- Heist Planning Activities - Progress tracked but no specific activities to gain it
- Escape Sequence - No post-heist escape mechanics or getaway scenarios

## Recommendations
1. **CRITICAL**: Implement transaction safety for all concurrent operations
2. **CRITICAL**: Add character availability and state validation before assignment
3. **CRITICAL**: Complete integration with jail, death, and gang reputation systems
4. **CRITICAL**: Implement equipment cost refund on cancellation
5. **HIGH**: Validate all foreign references (targets, characters, factions)
6. **HIGH**: Implement deterministic randomness for testing and reproducibility
7. **HIGH**: Add heat level caps and consequences to gang operations
8. **MEDIUM**: Implement role-specific skill bonuses and requirements
9. **MEDIUM**: Add heist planning activities and progress mechanics
10. **MEDIUM**: Create gang reputation and crew experience progression systems

## Estimated Fix Effort
- Critical fixes: 8 hours
- High fixes: 6 hours
- Medium fixes: 7 hours
- Total: 21 hours

**Overall Score: 6/10** (Solid planning and execution mechanics with proper transaction support, but missing critical integrations with character systems)
