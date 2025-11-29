# Faction War Events - Quick Start Guide

Quick reference for implementing and using the Faction War Events system.

---

## 🚀 Quick Setup

### 1. Schedule the Job (Add to your cron)
```typescript
import { scheduleWarEvents } from './jobs/warEventScheduler.job';

// Run every hour
cron.schedule('0 * * * *', async () => {
  await scheduleWarEvents();
});
```

### 2. Initialize Spawn Tracking
The scheduler automatically tracks last spawn times. First run will be eligible for all event types.

---

## 📋 Common Operations

### Create War Event Manually
```typescript
import { FactionWarService } from './services/factionWar.service';
import { FactionId } from '@desperados/shared';

const event = await FactionWarService.createWarEvent(
  'border_patrol_clash',  // template ID
  FactionId.SETTLER_ALLIANCE,  // attacker
  FactionId.FRONTERA_CARTEL,   // defender
  'border-crossing'  // territory ID
);
```

### Character Joins Event
```typescript
const participant = await FactionWarService.joinWarEvent(
  warEventId,
  characterId,
  FactionId.SETTLER_ALLIANCE  // which side to join
);
```

### Contribute to Objectives
```typescript
import { WarObjectivesService } from './services/warObjectives.service';

// Manual contribution
const result = await WarObjectivesService.contributeToObjective(
  warEventId,
  characterId,
  objectiveId,
  5  // amount of progress
);

// Automatic tracking
await WarObjectivesService.recordNPCKill(warEventId, characterId, enemyFaction);
await WarObjectivesService.recordDuelWin(warEventId, winnerId, loserId);
await WarObjectivesService.recordSupportAction(warEventId, characterId, 'heal');
```

### Get Event Information
```typescript
// Get active events
const activeEvents = await FactionWarService.getActiveEvents();

// Get upcoming events
const upcoming = await FactionWarService.getUpcomingEvents();

// Get full event details
const { event, participants, leaderboard } = await FactionWarService.getWarEventDetails(warEventId);

// Get statistics
const stats = await FactionWarService.getWarStatistics(warEventId);
```

---

## 🎯 Event Types

| Type | Duration | Participants | Frequency | Templates |
|------|----------|--------------|-----------|-----------|
| **SKIRMISH** | 2-6h | 5-20 | Daily | 3 |
| **BATTLE** | 12-24h | 20-50 | 2-3/week | 3 |
| **CAMPAIGN** | 3-7 days | 50-200 | 1-2/month | 2 |
| **WAR** | 1-2 weeks | 100-1000 | Quarterly | 2 |

---

## 📊 Objective Types

### Combat (7)
- `KILL_NPCS` - Defeat enemy faction NPCs
- `WIN_DUELS` - Win duels against enemy players
- `DEFEND_LOCATION` - Hold a location for X time
- `ESCORT_CONVOY` - Protect supply wagons
- `ASSASSINATE_COMMANDER` - Eliminate field commander
- `ELIMINATE_SQUAD` - Destroy elite squad
- `BREAK_SIEGE` - Break through enemy lines

### Strategic (7)
- `CAPTURE_POINT` - Seize and hold strategic location
- `DESTROY_SUPPLIES` - Destroy enemy supply caches
- `CUT_COMMUNICATIONS` - Sever telegraph lines
- `SABOTAGE_EQUIPMENT` - Disable enemy equipment
- `PLANT_FLAG` - Raise faction colors
- `SECURE_BRIDGE` - Control bridge crossing
- `INFILTRATE_BASE` - Sneak into enemy HQ

### Support (7)
- `HEAL_ALLIES` - Tend wounded allies
- `DELIVER_SUPPLIES` - Supply frontline positions
- `SCOUT_POSITIONS` - Reconnaissance missions
- `SPREAD_PROPAGANDA` - Demoralize enemies
- `RECRUIT_NPCS` - Rally neutral NPCs
- `FORTIFY_POSITION` - Build defenses
- `RALLY_TROOPS` - Boost morale

---

## 🏆 Reward Tiers

### Victory Rewards (Winners Only)
- Gold: 500 × event multiplier
- XP: 1000 × event multiplier
- Faction reputation

### Participation Rewards (Everyone)
| Event Type | Gold | XP |
|------------|------|-----|
| Skirmish | 50 | 100 |
| Battle | 150 | 300 |
| Campaign | 500 | 800 |
| War | 1000 | 2000 |

### MVP Rewards (Top 5%)
- 3× victory rewards
- Special title
- Cosmetic items

---

## 🔧 Admin Functions

### Force Spawn Event
```typescript
import { forceSpawnWarEvent } from './jobs/warEventScheduler.job';
import { WarEventType } from '@desperados/shared';

// Spawn specific event
const event = await forceSpawnWarEvent(
  WarEventType.BATTLE,
  'fort_assault',  // optional template ID
  'fort-ashford'   // optional territory ID
);
```

### Check Scheduler Status
```typescript
import { getSchedulerStatus } from './jobs/warEventScheduler.job';

const status = getSchedulerStatus();
console.log('Last spawns:', status.lastSpawns);
console.log('Next eligible:', status.nextEligible);
```

### Update Event Phases Manually
```typescript
const updated = await FactionWarService.updateEventPhases();
console.log(`Updated ${updated} event phases`);
```

---

## 📡 API Endpoints (TODO)

Suggested REST endpoints:

```
GET    /api/war-events              - List active/upcoming events
GET    /api/war-events/:id          - Get event details
POST   /api/war-events/:id/join     - Join an event
POST   /api/war-events/:id/leave    - Leave an event
GET    /api/war-events/:id/objectives - Get objectives
POST   /api/war-events/:id/objectives/:objId/contribute - Contribute progress
GET    /api/war-events/:id/leaderboard - Get leaderboard
GET    /api/war-events/:id/stats    - Get statistics
GET    /api/war-events/history      - Get past events
```

---

## 🎮 Client Integration

### Display Active Wars
```typescript
const events = await fetchActiveWarEvents();

events.forEach(event => {
  console.log(`${event.name} - ${event.attackingFaction} vs ${event.defendingFaction}`);
  console.log(`Score: ${event.attackerScore} - ${event.defenderScore}`);
  console.log(`Participants: ${event.totalParticipants}`);
  console.log(`Phase: ${event.currentPhase}`);
});
```

### Show Objectives
```typescript
const objectives = await fetchWarObjectives(warEventId);

objectives.forEach(obj => {
  const progress = (obj.current / obj.target) * 100;
  console.log(`${obj.name}: ${progress.toFixed(1)}%`);
  console.log(`Reward: ${obj.completionBonus} points`);
});
```

### Display Leaderboard
```typescript
const leaderboard = await fetchWarLeaderboard(warEventId);

leaderboard.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.characterName} - ${entry.score} pts`);
  if (entry.mvp) console.log('   ⭐ MVP CANDIDATE');
});
```

---

## 🔍 Monitoring

### Key Metrics to Track
- Active events count by type
- Participant counts
- Average participation rate
- Completion rates by event type
- Most popular objectives
- MVP diversity
- Reward distribution

### Database Queries
```typescript
// Active events by type
const skirmishes = await FactionWarEvent.countDocuments({
  eventType: WarEventType.SKIRMISH,
  status: WarEventStatus.ACTIVE
});

// Average participants per event type
const avgParticipants = await FactionWarEvent.aggregate([
  { $match: { status: WarEventStatus.COMPLETED } },
  { $group: {
    _id: '$eventType',
    avgParticipants: { $avg: '$totalParticipants' }
  }}
]);

// Top MVP earners
const topMVPs = await WarParticipant.find({ mvpCandidate: true })
  .sort({ totalScore: -1 })
  .limit(10);
```

---

## ⚡ Performance Tips

1. **Index Usage**: Queries automatically use indexes on status, dates, and scores
2. **Lean Queries**: Use `.lean()` for read-only operations
3. **Batch Updates**: Scheduler updates all events in one cycle
4. **Caching**: Consider caching leaderboards during active events
5. **Pagination**: Limit leaderboard queries to top 50-100 entries

---

## 🐛 Troubleshooting

### Event Not Starting
- Check event status and phase
- Verify `startsAt` date is in past
- Run `updateEventPhases()` manually

### Objectives Not Completing
- Verify objective progress reaches target
- Check time limits haven't expired
- Ensure participant is on correct side

### Rewards Not Distributed
- Check event has reached RESOLUTION phase
- Verify `resolveWarEvent()` was called
- Check participant records for `rewardsEarned` array

### Scheduler Not Spawning Events
- Verify cooldown periods have passed
- Check concurrent event limits
- Ensure territories exist in database
- Verify random spawn chance succeeded

---

## 📚 Additional Resources

- **Full Implementation Report**: `FACTION_WAR_EVENTS_IMPLEMENTATION.md`
- **Type Definitions**: `shared/src/types/factionWar.types.ts`
- **Templates**: `server/src/data/warEventTemplates.ts`
- **Objectives**: `server/src/data/warObjectives.ts`

---

## 💡 Best Practices

1. **Always use transactions** when updating multiple records
2. **Check event phase** before allowing contributions
3. **Validate faction alignment** when joining events
4. **Scale objectives** based on participant count
5. **Track diverse contributions** for better MVP selection
6. **Log major events** for debugging and analytics
7. **Test with force spawn** before relying on scheduler
8. **Monitor cooldowns** to prevent event spam
9. **Populate references** only when displaying to users
10. **Use event templates** rather than creating from scratch

---

**Need Help?** Refer to the service implementations for detailed examples and error handling patterns.
