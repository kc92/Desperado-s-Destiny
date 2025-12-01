# NPC Schedules System - Quick Start Guide

## What It Does
NPCs now follow realistic daily schedules - they sleep, work, eat, socialize, and move between locations throughout the day. The world feels alive!

## Key Features
- **15 Activity Types**: sleeping, working, eating, patrolling, drinking, gambling, performing, etc.
- **12 Sample NPCs**: Bartender, Sheriff, Doctor, Priest, Blacksmith, Merchant, etc.
- **Dynamic Location Tracking**: NPCs automatically appear at the right place at the right time
- **Interruptibility**: Some activities allow player interaction, others don't
- **Activity-Based Dialogue**: NPCs respond differently based on what they're doing

## API Endpoints

### Find NPCs at a Location
```
GET /api/schedule/location/:locationId?hour=14
```
Returns all NPCs present at that location at the specified hour.

### Get NPC's Schedule
```
GET /api/schedule/npc/:npcId?includeNext=true
```
Returns complete schedule and current activity.

### Check NPC Availability
```
GET /api/schedule/npc/:npcId/available
```
Returns whether you can interact with the NPC right now.

### Find NPCs by Activity
```
GET /api/schedule/activity/working?hour=10
```
Returns all NPCs performing that activity.

### Get Statistics
```
GET /api/schedule/statistics?hour=20
```
Returns breakdown of what NPCs are doing.

## Sample NPCs

### Red Gulch Bartender (Jake "Whiskey" McGraw)
- **Works**: Red Gulch Saloon (14:00-3:00)
- **Sleeps**: Hotel Room (4:00-11:00)
- **Availability**: Available while working

### Sheriff (Hank Ironside)
- **Patrols**: Main Street (7:00-9:00, 17:00-20:00)
- **Office**: Sheriff's Office (9:00-17:00)
- **Sleeps**: Sheriff Quarters (22:00-6:00)
- **Emergency**: Available even while sleeping

### Doctor (Dr. Sarah Whitfield)
- **Office**: Doctor's Office (8:00-17:00)
- **House Calls**: Residential Area (17:00-19:00)
- **Emergency**: Always available for medical emergencies

### Priest (Father Miguel)
- **Prayers**: Church (5:00-7:00, 17:00-19:00)
- **Services**: Church (8:00-12:00)
- **Visiting**: Residential (13:00-17:00)
- **Unavailable**: During prayer times

### Saloon Entertainer (Rose "Songbird" Dalton)
- **Performs**: Saloon (20:00-3:00)
- **Sleeps**: Hotel (3:00-11:00)
- **Rests**: Hotel (15:00-18:00)
- **Unavailable**: While performing

## Integration with Locations

When you query a location, it now includes NPCs present:

```json
{
  "location": {
    "name": "Red Gulch Saloon",
    "npcsPresent": [
      {
        "npcName": "Jake 'Whiskey' McGraw",
        "currentActivity": "working",
        "isAvailable": true,
        "activityDialogue": "Welcome! What can I get you?"
      }
    ],
    "currentHour": 15
  }
}
```

## Creating New NPC Schedules

### Use a Template:
```typescript
import { ScheduleService, NPCArchetype } from '@desperados/shared';

const newNPC = ScheduleService.createScheduleFromTemplate(
  'npc_new_shopkeeper',
  'Bob the Shopkeeper',
  NPCArchetype.WORKER,
  'shop_upstairs',      // home location
  'general_store'       // work location
);
```

### Available Archetypes:
- `WORKER` - Shopkeepers, tradespeople
- `OUTLAW` - Criminals, gang members
- `LAWMAN` - Sheriff, deputies
- `RELIGIOUS` - Priests, shamans
- `ENTERTAINER` - Performers, musicians
- `MERCHANT` - Traders
- `DOCTOR` - Medical professionals
- `SERVANT` - Stable hands, workers
- `GAMBLER` - Professional gamblers
- `VAGRANT` - Drifters

## Activity Interruptibility

### Always Interruptible:
- Working, Shopping, Socializing, Drinking, Gambling, Patrolling, Guarding

### Sometimes Interruptible:
- Eating, Resting, Traveling, Waking (depends on NPC)

### Never Interruptible:
- Sleeping, Praying, Performing (unless emergency priority)

### Emergency Priority:
- Doctors always available for medical emergencies
- Lawmen available for crimes even while sleeping

## Dialogue System

NPCs respond differently based on:
1. **Current Activity** - Different dialogue for working vs drinking
2. **Player Reputation** - Friendly (75+), Neutral (25-75), Hostile (<25)
3. **Availability** - Busy responses when not interruptible

Example dialogue patterns:
```typescript
// Working
"How can I help you?"  // Friendly
"What do you need?"    // Neutral
"Not interested."      // Hostile

// Drinking
"Buy me a drink?"      // Friendly
"*hic* What?"          // Neutral
"Go away!"             // Hostile
```

## Testing

Run the tests:
```bash
cd server
npm test -- schedule.service.test.ts
```

## Time System Integration

- Game time runs 4x real-time (1 real hour = 4 game hours)
- Full day cycle in 6 real hours
- Schedules automatically update with game time
- Use TimeService to get current game hour

## Quick Examples

### Find who's at the saloon right now:
```typescript
const npcs = ScheduleService.getNPCsAtLocation('red_gulch_saloon');
console.log(`${npcs.length} NPCs present`);
npcs.forEach(npc => {
  console.log(`${npc.npcName}: ${npc.currentActivity}`);
});
```

### Check if doctor is available:
```typescript
const available = ScheduleService.isNPCAvailable('npc_doctor_red_gulch');
if (available) {
  console.log('Doctor is available!');
} else {
  console.log('Doctor is busy');
}
```

### Get activity statistics:
```typescript
const stats = ScheduleService.getActivityStatistics();
console.log(`Hour ${stats.hour}: ${stats.totalNPCs} NPCs`);
console.log(`Most common: ${stats.mostCommonActivity}`);
```

## Files to Reference

- **Types**: `shared/src/types/schedule.types.ts`
- **Service**: `server/src/services/schedule.service.ts`
- **Sample Data**: `server/src/data/npcSchedules.ts`
- **Tests**: `server/src/tests/schedule/schedule.service.test.ts`
- **Full Docs**: `PHASE_3_WAVE_3.1_NPC_SCHEDULES_IMPLEMENTATION.md`

## Next Steps

1. Add more NPCs with schedules
2. Implement weekend variations
3. Add special event schedules
4. Create quest objectives based on schedules
5. Add NPC-to-NPC relationships

---

**The world is now ALIVE with NPCs following realistic daily routines!**
