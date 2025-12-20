# World Events System Audit Report

## Overview
The World Events system manages dynamic world activities that affect gameplay through weather, economic changes, and social events. It tracks active events, participant contributions, and rewards through MongoDB with proper event lifecycle management (SCHEDULED → ACTIVE → COMPLETED/CANCELLED). The system integrates with WeatherService and generates game news headlines.

## Files Analyzed
- Server: worldEvent.service.ts
- Models: WorldEvent.model.ts
- Types: shared/src/types/index.ts (system events)
- Data: Event templates embedded in service

## What's Done Well
- Clear event lifecycle management with explicit state transitions
- Proper enum usage for event types and statuses
- Good separation of event effects, rewards, and participant tracking
- Compound indexes on status+scheduledStart for efficient event retrieval
- Proper use of mongoose references for character relationships
- News headline and gossip integration for world immersion
- Graceful fallback to in-memory world state initialization
- Time progression system with realistic game-to-real-world time conversion (1 real minute = 15 game minutes)
- Template-driven event creation reduces code duplication

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race Condition on Event Start | worldEvent.service.ts:248-250 | Event status updated without checking current status; concurrent calls could start same event twice | Add conditional update: `{status: SCHEDULED}` in update filter |
| Missing Reward Distribution Validation | worldEvent.service.ts:294-298 | rewardParticipant() called in loop without verifying participant actually participated | Add contribution check before rewarding |
| No Idempotency on Reward Claims | worldEvent.service.ts:293-298 | Participant.rewarded flag checked but updated AFTER rewardParticipant call; race condition if two calls concurrent | Move rewarded=true update BEFORE reward call with atomic operation |
| Unhandled Character Load Failure | worldEvent.service.ts:352-353 | Character.findById returns null but no error thrown; silent failure leaves participant unrewarded | Add logging and error handling for missing characters |
| Event Effect Unapplied | worldEvent.service.ts:222 | worldEffects stored in event but never actually applied to game systems | Implement integration with price/danger/travel modifiers |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No XP Reward Implementation | worldEvent.service.ts:361 | Comment says would add more reward types but switch only handles gold and xp; xp not updated | Implement character.addExperience() call or use experience property |
| Duplicate News Headline Risk | worldEvent.service.ts:253-256 | Headlines unshifted without deduplication; same event headline could appear multiple times | Add Set or indexOf check before unshift |
| No Participation Validation | worldEvent.service.ts:323-325 | maxParticipants check only blocks at join time, not persistent; could exceed limit with concurrent joins | Implement atomic increment with compare on participantCount |
| Missing Location Validation | worldEvent.service.ts:218 | locationId converted to ObjectId without validation it exists in database | Add Location.findById check before event creation |
| Stale Weather Service Call | worldEvent.service.ts:192 | updateWeather() delegates to WeatherService but doesn't verify state was actually updated | Add validation or at least log response |
| News Duplicate in Headlines | worldEvent.service.ts:394-398 | addNewsHeadline() adds without deduplication; identical headlines can accumulate | Check if headline already in top 5 before adding |
| No Event Cancellation Logic | worldEvent.service.ts:278-306 | endExpiredEvents assumes all active events with scheduledEnd <= now should be COMPLETED; no CANCELLED handling | Handle cancelled events separately |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Random Event Template Pick Unweighted | worldEvent.service.ts:201-202 | createRandomEvent picks random from templates with equal probability; unrealistic balance | Use weighted distribution map |
| Gossip Age Overflow | worldEvent.service.ts:417-419 | gossip.age increments infinitely; at 10 cycles removed but numeric overflow risk with long uptimes | Use timestamp-based age instead of counter |
| No Objective Progress Tracking | worldEvent.service.ts:241-249 | objectives can exist but objectives[].current never updated anywhere | Implement actual objective progress API endpoint |
| Scheduled Start Within 30 Minutes | worldEvent.service.ts:210 | Random delay 0-30 minutes for event start could cause clumping; no distribution | Use exponential/normal distribution for spacing |
| Missing Recurring Event Support | worldEvent.service.ts:136-137 | isRecurring and recurringPattern fields exist but never used; no cron job processes them | Implement recurring event spawn logic or remove fields |

## Bug Fixes Needed
1. **worldEvent.service.ts:248** - Change to use findByIdAndUpdate with conditional: `{_id: eventId, status: SCHEDULED}`
2. **worldEvent.service.ts:295-299** - Implement atomic transaction: check rewarded flag, reward, then mark rewarded in single transaction
3. **worldEvent.service.ts:352-354** - Add: `if (!character) { logger.error(...); return; }`
4. **worldEvent.service.ts:253-256** - Add dedup: `if (!state.currentHeadlines.includes(headline)) state.currentHeadlines.unshift(...)`
5. **worldEvent.service.ts:356-361** - Complete XP reward by implementing character.experience += reward.amount
6. **worldEvent.service.ts:323** - Implement atomic find-and-update with `$inc: {participantCount: 1}` with compare on count < maxParticipants
7. **worldEvent.service.ts:218** - Add: `const location = await Location.findById(locationId); if (!location) throw new Error(...);`
8. **worldEvent.service.ts:394-398** - Refactor to check existing: `if (!state.currentHeadlines.slice(0,5).includes(headline))`

## Incomplete Implementations
- Event effect application to game systems (stored but never used)
- Objective progress tracking and completion
- Recurring event spawning logic
- Reward distribution for all reward types (only gold/xp partially implemented)
- XP reward integration
- News headline deduplication
- Participant contribution scaling
- Territory capture notifications

## Recommendations
1. **HIGH PRIORITY**: Implement atomic update with conditional for event status transitions to prevent concurrent duplicates
2. **HIGH PRIORITY**: Complete XP reward distribution and validate character updates
3. **HIGH PRIORITY**: Implement actual worldEffect application through a separate service method
4. Create EventEffectsService to apply modifiers to prices, danger levels, travel times
5. Implement recurring event spawner job that checks isRecurring events and creates copies
6. Add deduplication for headlines and gossip using Set or recent list tracking
7. Implement objective progress updates with API endpoint for tracking
8. Add weights to createRandomEvent to control event frequency distribution
9. Add participating character count to contributions for better scaling
10. Create cleanup job for old completed events (archive after 7 days)
11. Add SystemEventService.dispatch calls for game-affecting events (TERRITORY_DISPUTE, GANG_WAR)

## Estimated Fix Effort
- Critical fixes: 10 hours
- High fixes: 8 hours
- Medium fixes: 6 hours
- Total: 24 hours

**Overall Score: 6/10** (Good lifecycle management but critical race conditions and missing effect application need immediate attention)
