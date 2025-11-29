# NPC Gang Conflict System - Integration Guide

## Quick Start Integration

### Step 1: Register Routes

Add to `server/src/routes/index.ts`:

```typescript
import npcGangConflictRoutes from './npcGangConflict.routes';

// Add with other routes
app.use('/api/npc-gangs', npcGangConflictRoutes);
```

### Step 2: Initialize Relationships on Gang Creation

Add to `server/src/services/gang.service.ts` in the `createGang` method, after gang creation:

```typescript
// Initialize NPC gang relationships
const { NPCGangConflictService } = await import('./npcGangConflict.service');
await NPCGangConflictService.initializeGangRelationships(gang[0]._id as mongoose.Types.ObjectId);
```

### Step 3: Start Cron Jobs

Add to your server startup file (e.g., `server/src/server.ts`):

```typescript
import { startNPCGangJobs } from './jobs/npcGangEvents';

// After database connection
startNPCGangJobs();
```

### Step 4: Seed Territory Zones (if not already done)

The NPC gangs reference zones that should exist. Ensure these zones are seeded:

```typescript
import { seedTerritoryZones } from './seeds/territoryZones.seed';

// In your seed/init script
await seedTerritoryZones();
```

### Step 5: Export Types from Shared Package

Already done in `shared/src/types/index.ts`:

```typescript
export * from './npcGang.types';
```

---

## Optional: Manual Testing Endpoints

### Test Flow 1: View NPC Gangs

```bash
# Get all NPC gangs
curl -X GET http://localhost:3001/api/npc-gangs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific gang
curl -X GET http://localhost:3001/api/npc-gangs/el-rey-frontera \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get overview (includes relationship, missions, etc)
curl -X GET http://localhost:3001/api/npc-gangs/el-rey-frontera/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Flow 2: Pay Tribute

```bash
curl -X POST http://localhost:3001/api/npc-gangs/el-rey-frontera/tribute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Flow 3: Challenge Territory

```bash
# Initiate challenge
curl -X POST http://localhost:3001/api/npc-gangs/el-rey-frontera/challenge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"zoneId": "frontera-cantina-strip"}'

# Complete challenge mission
curl -X POST http://localhost:3001/api/npc-gangs/el-rey-frontera/challenge/mission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"missionType": "combat"}'

# Fight final battle
curl -X POST http://localhost:3001/api/npc-gangs/el-rey-frontera/challenge/final-battle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Flow 4: Accept Mission

```bash
# Get available missions
curl -X GET http://localhost:3001/api/npc-gangs/comanche-raiders/missions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Accept mission
curl -X POST http://localhost:3001/api/npc-gangs/comanche-raiders/missions/comanche-hunt-1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Flow 5: Simulate Attack (Testing)

```bash
curl -X POST http://localhost:3001/api/npc-gangs/el-rey-frontera/attack \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"attackType": "raid"}'
```

---

## Database Indexes

The NPCGangRelationship model automatically creates these indexes:
- `{ playerGangId: 1, npcGangId: 1 }` (unique)
- `{ playerGangId: 1, attitude: 1 }`
- `{ npcGangId: 1, relationshipScore: -1 }`
- `{ activeConflict: 1 }`

No manual index creation needed.

---

## Environment Variables

No new environment variables required. Uses existing:
- Database connection
- JWT authentication
- Rate limiting settings

---

## Dependencies

All dependencies already in project:
- mongoose
- express
- node-cron (may need to add to package.json)

If `node-cron` is not installed:

```bash
cd server
npm install node-cron
npm install --save-dev @types/node-cron
```

---

## Frontend Integration Points

### 1. NPC Gang List Page

```typescript
// Get all NPC gangs
const response = await fetch('/api/npc-gangs', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data: npcGangs } = await response.json();

// Display gang cards with:
// - Name, leader, strength
// - Your relationship status
// - Controlled zones
// - Available actions (pay tribute, view missions, challenge)
```

### 2. NPC Gang Detail Page

```typescript
// Get full overview
const response = await fetch(`/api/npc-gangs/${gangId}/overview`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { data: overview } = await response.json();

// Display:
// - Gang information
// - Your relationship score and attitude
// - Available missions
// - Active missions
// - Recent attacks
// - Challenge status
// - Tribute button
```

### 3. Tribute Payment Button

```typescript
const payTribute = async (gangId: string) => {
  const response = await fetch(`/api/npc-gangs/${gangId}/tribute`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  if (result.success) {
    alert(`Paid ${result.data.amountPaid} gold. Relationship: ${result.data.newRelationship}`);
  }
};
```

### 4. Mission List

```typescript
// Get missions
const response = await fetch(`/api/npc-gangs/${gangId}/missions`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { data: missions } = await response.json();

// Display each mission with:
// - Name, description, type
// - Requirements (level, rep, etc)
// - Rewards
// - Accept button (if requirements met)
```

### 5. Territory Challenge UI

```typescript
// Challenge initiation
const startChallenge = async (gangId: string, zoneId: string) => {
  const response = await fetch(`/api/npc-gangs/${gangId}/challenge`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ zoneId })
  });

  const result = await response.json();
  // Show challenge status: 0/3 missions complete
};

// Progress tracking
const completeMission = async (gangId: string, missionType: string) => {
  const response = await fetch(`/api/npc-gangs/${gangId}/challenge/mission`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ missionType })
  });

  const result = await response.json();
  // Update UI: X/3 missions complete
  if (result.data.challengeComplete) {
    // Show "Final Battle" button
  }
};

// Final battle
const fightBoss = async (gangId: string) => {
  const response = await fetch(`/api/npc-gangs/${gangId}/challenge/final-battle`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  if (result.data.victory) {
    // Show victory screen with rewards
  } else {
    // Show defeat screen
  }
};
```

### 6. Relationship Display

```typescript
// Relationship bar component
const RelationshipBar = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score <= -50) return 'red';
    if (score <= -10) return 'orange';
    if (score >= 50) return 'green';
    if (score >= 10) return 'lightgreen';
    return 'gray';
  };

  const getLabel = (score: number) => {
    if (score <= -50) return 'Hostile';
    if (score <= -10) return 'Unfriendly';
    if (score >= 50) return 'Allied';
    if (score >= 10) return 'Friendly';
    return 'Neutral';
  };

  return (
    <div>
      <div className="relationship-label">{getLabel(score)}</div>
      <div className="relationship-bar">
        <div
          className="relationship-fill"
          style={{
            width: `${((score + 100) / 200) * 100}%`,
            backgroundColor: getColor(score)
          }}
        />
      </div>
      <div className="relationship-score">{score}/100</div>
    </div>
  );
};
```

---

## Cron Job Schedules

Jobs run automatically once started:

- **NPC Attacks**: Daily at midnight (`0 0 * * *`)
- **World Events**: Every 3 days at noon (`0 12 */3 * *`)
- **Tribute Reset**: Weekly on Monday at midnight (`0 0 * * 1`)
- **Challenge Expiration**: Daily at 3 AM (`0 3 * * *`)

To stop jobs (e.g., during maintenance):

```typescript
import { stopNPCGangJobs } from './jobs/npcGangEvents';

stopNPCGangJobs();
```

---

## Error Handling

Common errors and solutions:

### "Character must be in a gang"
- User's character doesn't have `gangId` set
- Solution: Create/join gang first

### "Only the gang leader can..."
- Permission check failed
- Solution: Only leader can pay tribute, challenge zones

### "Gang must be level 15 or higher..."
- Gang level requirement not met
- Solution: Level up gang by adding members, completing activities

### "Insufficient gang funds..."
- Gang bank doesn't have enough gold
- Solution: Deposit more gold to gang bank

### "Challenge not complete..."
- Tried final battle before completing 3 missions
- Solution: Complete all challenge missions first

### "Relationship not found"
- Database relationship record missing
- Solution: Auto-initialized on first request, shouldn't happen

---

## Monitoring

### Logs to Watch

```
NPC gang attacks processed successfully
Generated world event: <event title>
Gang <name> paid <amount> tribute to <npc gang>
Gang <name> challenged <npc gang> for zone <zone>
Gang <name> won/lost final battle against <npc gang>
```

### Metrics to Track

- NPC attacks per day
- Tribute payments per week
- Active challenges
- Territory conquests
- World events generated
- Mission completions

---

## Performance Notes

- All operations use MongoDB transactions for safety
- Indexes optimize relationship lookups
- Cron jobs run during low-traffic hours
- Rate limiting prevents API abuse
- World events cached in memory

---

## Security

- All endpoints require authentication
- Gang membership verified
- Leader permissions enforced
- Transaction rollback on errors
- Rate limiting on expensive operations
- Input validation on all requests

---

## Next Steps After Integration

1. **Create Frontend UI**
   - NPC gang list page
   - Individual gang detail pages
   - Relationship tracking dashboard
   - Mission boards
   - Challenge tracker

2. **Add Notifications**
   - NPC attack alerts
   - Tribute due reminders
   - Mission completion notices
   - World event announcements

3. **Balance Testing**
   - Adjust tribute costs
   - Fine-tune attack frequencies
   - Balance mission rewards
   - Test boss fight difficulty

4. **Add Analytics**
   - Track most popular NPC gangs
   - Monitor tribute payment rates
   - Analyze challenge success rates
   - World event participation

---

## Support

For questions or issues with NPC Gang system:
- Check console logs for error details
- Verify database indexes created
- Ensure cron jobs started
- Test with Postman/curl first
- Review relationship scores in database

---

**Integration complete! The NPC Gang Conflict system is ready for use.**
