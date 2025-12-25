# Time-of-Day System - Quick Start Guide

## What Was Implemented

The Time-of-Day System creates a dynamic 24-hour game world with:
- **7 Time Periods** (Dawn, Morning, Noon, Afternoon, Evening, Night, Midnight)
- **4:1 Accelerated Time** (6 real hours = 1 full game day)
- **Building Operating Hours** with automatic open/close
- **Crime Time Modifiers** (crimes easier at night, some time-restricted)
- **Dynamic Atmosphere** that changes throughout the day

## How Game Time Works

### Time Progression
```
1 real minute = 4 game minutes
15 real minutes = 1 game hour
6 real hours = 24 game hours (full day)
```

### Time Periods
| Period | Game Hours | Detection | Best For |
|--------|-----------|-----------|----------|
| Dawn | 5-7 | 70% | Early risers, churches |
| Morning | 7-12 | 100% | Shopping, business |
| Noon | 12-14 | 100% | All activities |
| Afternoon | 14-17 | 100% | Peak activity |
| Evening | 17-21 | 80% | Saloons, social |
| Night | 21-24 | 50% | Crimes, entertainment |
| Midnight | 0-5 | 30% | Illegal activities |

## Building Hours at a Glance

### Daytime Buildings (Closed at Night)
- **Banks:** 8:00 - 17:00
- **General Stores:** 7:00 - 19:00
- **Blacksmiths:** 6:00 - 18:00
- **Government Offices:** 8:00 - 17:00

### Evening/Night Buildings
- **Saloons:** 14:00 - 4:00 (next day)
- **Cantinas:** 16:00 - 3:00
- **Fighting Pits:** 18:00 - 3:00

### Always Open (24/7)
- Hotels
- Train Stations
- Stables
- Hideouts
- Shrines

### Illegal Buildings (Night Only)
- **Smuggler Dens:** 20:00 - 5:00

## Crime Strategy Guide

### Time-Restricted Crimes
- **Bank Heist** - Only during banking hours (8-17)
- **Home Invasion** - Only at night (21-5)
- **Pickpocketing** - Only when crowds exist (7-21)
- **Smuggling** - Only under darkness (20-7)
- **Cattle Rustling** - Only at night (21-5)

### Best Times for Crimes

#### Maximum Stealth (Midnight 0-5)
- 30% witness chance
- Example: 30% base × 0.3 = 9% actual
- **Best for:** High-stakes crimes

#### Moderate Stealth (Night 21-24)
- 50% witness chance
- Example: 30% base × 0.5 = 15% actual
- **Good for:** Most crimes

#### Risky (Daytime)
- 100% witness chance
- Example: 30% base × 1.0 = 30% actual
- **Avoid unless required**

## API Usage Examples

### Get Current Time
```javascript
GET /api/time

Response:
{
  "timeState": {
    "currentHour": 14,
    "currentPeriod": "afternoon",
    "isDaylight": true,
    "effectModifiers": {
      "crimeDetectionModifier": 1.0,
      "npcActivityLevel": 1.0,
      "travelSafetyModifier": 1.0
    }
  }
}
```

### Check Building Status
```javascript
GET /api/time/building/bank/status

Response (if closed):
{
  "isOpen": false,
  "reason": "Closed. Opens at 8:00, closes at 17:00",
  "opensAt": 8,
  "closesAt": 17,
  "currentPeriod": "night"
}
```

### Check Crime Availability
```javascript
POST /api/time/crime/check
Body: { "crimeName": "Bank Heist", "baseWitnessChance": 80 }

Response (if unavailable):
{
  "isAvailable": false,
  "reason": "Banks are only open during business hours"
}

Response (if available):
{
  "isAvailable": true,
  "effectiveWitnessChance": 24,
  "timeModifier": 0.3
}
```

## Frontend Integration Tips

### Display Current Time Period
```typescript
const { timeState } = await fetch('/api/time').then(r => r.json());
showTimeIndicator(timeState.currentPeriod); // Show "Evening" badge
```

### Disable Closed Buildings
```typescript
const buildings = await fetchTownBuildings();
buildings.forEach(b => {
  if (!b.isOpen) {
    disableBuilding(b.id);
    showTooltip(`Opens at ${b.opensAt}:00`);
  }
});
```

### Show Crime Detection Chance
```typescript
const crimeCheck = await checkCrimeAvailability(crimeName, baseChance);
if (crimeCheck.isAvailable) {
  showWitnessChance(crimeCheck.effectiveWitnessChance);
  // "Witness chance: 24% (modified by time)"
} else {
  disableCrime(crimeName);
  showReason(crimeCheck.reason);
}
```

## Technical Details

### Files Created
- `shared/src/types/time.types.ts` - Type definitions
- `server/src/services/time.service.ts` - Core logic (536 lines)
- `server/src/controllers/time.controller.ts` - API endpoints
- `server/src/routes/time.routes.ts` - Routes

### Files Modified
- `shared/src/types/index.ts` - Export time types
- `server/src/routes/index.ts` - Register time routes
- `server/src/controllers/location.controller.ts` - Time-based building access
- `server/src/services/crime.service.ts` - Time-based crime modifiers

### Performance
- **Zero database queries** - Pure calculation
- **Sub-millisecond response** - Simple math operations
- **Stateless** - Scales horizontally
- **Cacheable** - Client can cache time state

## Testing Checklist

### Manual Tests
- [ ] Visit bank at midnight - Should be closed
- [ ] Visit saloon at noon - Should be closed
- [ ] Visit hotel at any time - Should be open
- [ ] Attempt bank heist at night - Should be unavailable
- [ ] Attempt pickpocket at midnight - Should have ~9% witness chance
- [ ] Check location atmosphere changes over time

### Verification Commands
```bash
# Test current time endpoint
curl http://localhost:5000/api/time

# Test building status
curl http://localhost:5000/api/time/building/bank/status

# Test crime check
curl -X POST http://localhost:5000/api/time/crime/check \
  -H "Content-Type: application/json" \
  -d '{"crimeName":"Bank Heist","baseWitnessChance":80}'
```

## Known Limitations

1. **No Day of Week** - Every day is the same (no weekends)
2. **No Seasons** - Day length doesn't vary
3. **Fixed Ratio** - 4:1 time is hardcoded (admin override could be added)
4. **Basic NPC Availability** - Full schedules coming in Phase 3

## Next Steps (Phase 3)

- Full NPC schedules (NPCs move between locations)
- Weather system integration
- Special events at specific times
- Dynamic shop pricing based on time
- Day-of-week variations

## Quick Reference Card

**Crime Times:**
- 🌙 Midnight (0-5): 30% detection - BEST
- 🌃 Night (21-24): 50% detection - GOOD
- 🌆 Evening (17-21): 80% detection - OK
- ☀️ Daytime: 100% detection - RISKY

**Building Hours:**
- 🏦 Banks: 8-17
- 🛒 Shops: 7-19
- 🍺 Saloons: 14-4
- ⛪ Churches: 5-21
- 🏨 Hotels: 24/7

**Time Progression:**
- ⏱️ 15 min = 1 hour
- 🕐 6 hours = full day
