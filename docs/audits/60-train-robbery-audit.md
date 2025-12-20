# Train Robbery System Audit Report

## Overview
The Train Robbery system manages train heist planning, execution, and consequences. It includes scouting, gang member assignment, risk calculation, and Pinkerton pursuit mechanics. Players coordinate with gang members to rob trains for loot while managing wanted levels and pursuit risk.

## Files Analyzed
- Server: train.service.ts, trainRobbery.service.ts
- Client: useTrain.ts
- Types: train.types.ts

## What's Done Well
- Well-defined robbery phases with clear progression
- Sophisticated risk calculation system
- Good separation between scouting, planning, and execution
- Comprehensive consequence tracking
- Pinkerton pursuit system adds narrative depth
- Gang member role assignment system
- Multiple robbery strategies supported
- Clear loot distribution mechanics

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| In-Memory Storage Only | trainRobbery.service.ts:38-39 | Robbery plans and pursuits stored in Map<>; lost on server restart | Persist to MongoDB or Redis |
| Insufficient Authorization | trainRobbery.service.ts:159 | No check that gang members consented to robbery | Add consent verification |
| Loot Manipulation | trainRobbery.service.ts:379 | No verification that actual train had this cargo | Validate cargo against train schedule |
| Character Modification Without Verification | trainRobbery.service.ts:415 | Characters modified during robbery without proper checks | Add validation |
| Wanted Level Not Persisted | trainRobbery.service.ts:426 | increaseWantedLevel() may not save immediately | Ensure wanted level is saved |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No Anti-Cheat Protection | trainRobbery.service.ts:597 | successChance can be manually calculated and exploited | Server-side only calculation |
| Missing Audit Trail | trainRobbery.service.ts | No logging of who was where during robbery | Add comprehensive logging |
| Double-Spend Risk | trainRobbery.service.ts | Loot distributed before verification of capture success | Verify all conditions first |
| Incomplete Pursuit Logic | trainRobbery.service.ts | Pinkerton pursuit setup but no encounter implementation | Complete pursuit mechanics |
| Missing Bounty Validation | trainRobbery.service.ts | No check if bounty was actually created | Verify bounty creation |
| Race Condition | trainRobbery.service.ts | Gang members could join multiple robberies simultaneously | Add exclusive lock |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hard-coded Casualty Calculations | trainRobbery.service.ts | Guard casualties don't scale with actual combat | Scale with combat results |
| Missing Rescue Mechanics | trainRobbery.service.ts | Captured gang members can't be rescued | Add rescue mission option |
| No Jurisdiction Logic | trainRobbery.service.ts | Robberies occur anywhere without location validation | Validate train route |
| Incomplete Equipment System | trainRobbery.service.ts | Equipment list accepted but never used | Apply equipment bonuses |
| No cooldown between robberies | trainRobbery.service.ts | Can attempt multiple robberies immediately | Add cooldown period |
| Train schedule not validated | train.service.ts | Can rob trains that don't exist | Validate train schedule |

## Bug Fixes Needed
1. **trainRobbery.service.ts:38-39** - Replace Map<> with MongoDB collection for robbery plans
2. **trainRobbery.service.ts:159** - Add gang member consent verification before adding to robbery
3. **trainRobbery.service.ts:379** - Validate loot against actual train cargo manifest
4. **trainRobbery.service.ts:426** - Add await character.save() after wanted level change
5. **trainRobbery.service.ts** - Add exclusive lock to prevent concurrent robbery participation

## Incomplete Implementations
- Robbery persistence: Plans stored in volatile Map, lost on restart
- Gang member consent: Members added without verification
- Pinkerton encounters: Pursuit created but no chase/capture mechanics
- Equipment bonuses: Equipment listed but not applied to success chance
- Rescue missions: No way to rescue captured gang members
- Train schedules: No validation that train exists at robbery time
- Casualty integration: Guards killed but no NPC death tracking

## Recommendations
1. **IMMEDIATE**: Persist robbery plans to MongoDB collection
2. Add gang member consent flow before robbery execution
3. Validate all cargo against train manifest
4. Complete Pinkerton pursuit and encounter mechanics
5. Implement equipment bonus application
6. Add robbery cooldown to prevent spam
7. Create rescue mission system for captured members
8. Add comprehensive audit logging for robberies
9. Validate train schedules before allowing robbery
10. Implement casualty tracking with NPC death system

## Estimated Fix Effort
- Critical fixes: 10 hours
- High fixes: 12 hours
- Medium fixes: 8 hours
- Total: 30 hours

**Overall Score: 5/10** (Good robbery mechanics design but critical persistence and authorization issues; in-memory storage prevents production use)
