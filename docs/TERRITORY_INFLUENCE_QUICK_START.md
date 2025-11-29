# Territory Influence System - Quick Start Guide

## Overview

The Territory Influence System allows six factions to compete for control of 11 territories. Players can influence outcomes through quests, donations, combat, and gang alignment.

## Quick Integration

### 1. Initialize the System

```bash
cd server
npm run script:init-territories
```

This creates all 11 territories with initial faction influence values.

### 2. Add to Server Startup

In `server/src/server.ts`:

```typescript
import { scheduleInfluenceDecay } from './jobs/influenceDecay.job';

// After database connection
scheduleInfluenceDecay(); // Runs daily at 3:00 AM
```

### 3. Common Use Cases

#### Award Influence for Quest Completion

```typescript
import { TerritoryInfluenceService } from '../services/territoryInfluence.service';
import { FactionId, InfluenceSource } from '@shared/types';

// When player completes a faction quest
const result = await TerritoryInfluenceService.applyQuestInfluence(
  'red_gulch',           // territoryId
  FactionId.SETTLER_ALLIANCE,  // factionId
  character._id,         // characterId
  character.name,        // characterName
  quest._id,             // questId
  15                     // influenceAmount (5-20 typical)
);

// result contains: territoryId, newInfluence, controlChanged, message
console.log(result.message);
```

#### Apply Crime Penalty

```typescript
// When player commits crime in controlled territory
const result = await TerritoryInfluenceService.applyCrimeInfluence(
  'fort_ashford',        // territoryId
  character._id,         // characterId
  character.name,        // characterName
  'robbery'              // crimeType
);

// Automatically penalizes controlling faction (-1 to -5)
if (result) {
  console.log(result.message);
}
```

#### Handle Faction Donation

```typescript
// When player donates to faction
const result = await TerritoryInfluenceService.applyDonationInfluence(
  'whiskey_bend',        // territoryId
  FactionId.RAILROAD_BARONS,   // factionId
  character._id,         // characterId
  character.name,        // characterName
  500                    // goldAmount (gives +5 influence at 100g per point)
);
```

#### Gang Alignment Daily Update

```typescript
// In daily gang maintenance job
const result = await TerritoryInfluenceService.applyGangAlignmentInfluence(
  gang._id,              // gangId
  gang.name,             // gangName
  'the_wastes',          // territoryId
  FactionId.INDEPENDENT_OUTLAWS,  // aligned faction
  3                      // influenceAmount (1-5 typical)
);
```

### 4. Display Territory Status

```typescript
// Get single territory
const territory = await TerritoryInfluenceService.getTerritoryInfluence('red_gulch');

console.log(territory.territoryName);        // "Red Gulch"
console.log(territory.controlLevel);         // "contested" | "disputed" | "controlled" | "dominated"
console.log(territory.controllingFaction);   // FactionId or undefined
console.log(territory.stability);            // 0-100

// Top factions by influence
territory.topFactions.forEach(f => {
  console.log(`${f.factionId}: ${f.influence}% (${f.trend})`);
});
```

```typescript
// Get all territories
const allTerritories = await TerritoryInfluenceService.getAllTerritories();
```

### 5. Get Player Benefits

```typescript
// Calculate benefits for aligned player
const benefits = await TerritoryInfluenceService.getAlignmentBenefits(
  'red_gulch',           // territoryId
  FactionId.SETTLER_ALLIANCE   // player's faction
);

if (benefits) {
  console.log(`Shop Discount: ${benefits.shopDiscount}%`);
  console.log(`Rep Bonus: ${benefits.reputationBonus}%`);
  console.log(`Crime Heat Reduction: ${benefits.crimeHeatReduction}%`);
  console.log(`Has Safe House: ${benefits.hasSafeHouse}`);
  console.log(`Job Priority: ${benefits.jobPriority}`);
}
```

### 6. Get Faction Overview

```typescript
// Get faction's global status
const overview = await TerritoryInfluenceService.getFactionOverview(
  FactionId.NAHI_COALITION
);

console.log(`Total Territories: ${overview.totalTerritories}`);
console.log(`Dominated: ${overview.dominatedTerritories}`);
console.log(`Controlled: ${overview.controlledTerritories}`);
console.log(`Total Influence: ${overview.totalInfluence}`);
console.log(`Strength: ${overview.strength}`); // 'weak' | 'moderate' | 'strong' | 'dominant'
```

### 7. View Influence History

```typescript
// Get territory history
const history = await TerritoryInfluenceService.getInfluenceHistory(
  'red_gulch',
  50  // limit (default 50)
);

history.forEach(h => {
  console.log(`${h.timestamp}: ${h.factionId} ${h.amount > 0 ? '+' : ''}${h.amount} (${h.source})`);
  if (h.characterName) {
    console.log(`  by ${h.characterName}`);
  }
});
```

```typescript
// Get character's contributions
const contributions = await TerritoryInfluenceService.getCharacterInfluence(
  character._id,
  50
);
```

## Territory IDs

Use these IDs when calling service methods:

**Towns:**
- `red_gulch` - Contested by all factions
- `the_frontera` - Cartel stronghold
- `fort_ashford` - Military installation
- `whiskey_bend` - Railroad hub

**Wilderness:**
- `kaiowa_mesa` - Nahi sacred land
- `spirit_springs` - Nahi holy springs
- `thunderbird_perch` - Nahi sacred mountain
- `longhorn_ranch` - Settler cattle ranch
- `goldfingers_mine` - Rich gold mine (highest value)
- `the_wastes` - Outlaw haven
- `the_scar` - Dangerous wasteland

## Faction IDs

```typescript
import { FactionId } from '@shared/types';

FactionId.SETTLER_ALLIANCE      // Legitimate business, law
FactionId.NAHI_COALITION        // Native American tribes
FactionId.FRONTERA_CARTEL       // Criminal organization
FactionId.US_MILITARY           // Federal forces
FactionId.RAILROAD_BARONS       // Corporate interests
FactionId.INDEPENDENT_OUTLAWS   // Player gangs
```

## Influence Sources

```typescript
import { InfluenceSource } from '@shared/types';

// Positive
InfluenceSource.FACTION_QUEST      // +5 to +20
InfluenceSource.FACTION_DONATION   // +1 per 100 gold
InfluenceSource.ENEMY_KILL         // +2 to +10
InfluenceSource.STRUCTURE_BUILD    // +10 to +30
InfluenceSource.EVENT_WIN          // +15 to +50
InfluenceSource.GANG_ALIGNMENT     // +1 to +5 daily

// Negative
InfluenceSource.FACTION_ATTACK     // -5 to -20
InfluenceSource.RIVAL_QUEST        // -2 to -10
InfluenceSource.CRIMINAL_ACTIVITY  // -1 to -5
InfluenceSource.EVENT_LOSS         // -10 to -30

// System
InfluenceSource.DAILY_DECAY        // -1% daily
InfluenceSource.SYSTEM_ADJUSTMENT  // Admin adjustments
```

## Control Levels

```typescript
import { ControlLevel } from '@shared/types';

ControlLevel.CONTESTED   // No faction > 30%
ControlLevel.DISPUTED    // One faction 30-49%
ControlLevel.CONTROLLED  // One faction 50-69%
ControlLevel.DOMINATED   // One faction 70%+
```

## Benefits by Control Level

| Level | Shop Discount | Rep Bonus | Crime Heat | Safe House | Job Priority |
|-------|---------------|-----------|------------|------------|--------------|
| Contested | 0% | 0% | 0% | No | No |
| Disputed | 5% | 5% | 5% | No | No |
| Controlled | 15% | 10% | 10% | Yes | No |
| Dominated | 25% | 15% | 15% | Yes | Yes |

## Example API Routes

```typescript
import { Router } from 'express';
import { TerritoryInfluenceService } from '../services/territoryInfluence.service';

const router = Router();

// Get all territories
router.get('/territories/influence', async (req, res) => {
  const territories = await TerritoryInfluenceService.getAllTerritories();
  res.json({ territories });
});

// Get specific territory
router.get('/territories/influence/:territoryId', async (req, res) => {
  const territory = await TerritoryInfluenceService.getTerritoryInfluence(
    req.params.territoryId
  );
  res.json({ territory });
});

// Get faction overview
router.get('/factions/:factionId/overview', async (req, res) => {
  const overview = await TerritoryInfluenceService.getFactionOverview(
    req.params.factionId as FactionId
  );
  res.json({ overview });
});

// Get territory history
router.get('/territories/influence/:territoryId/history', async (req, res) => {
  const history = await TerritoryInfluenceService.getInfluenceHistory(
    req.params.territoryId,
    parseInt(req.query.limit as string) || 50
  );
  res.json({ history });
});

// Get player's alignment benefits
router.get('/territories/:territoryId/benefits', requireAuth, async (req, res) => {
  const character = req.character; // from auth middleware
  const factionId = character.primaryFaction; // assume this exists

  const benefits = await TerritoryInfluenceService.getAlignmentBenefits(
    req.params.territoryId,
    factionId
  );
  res.json({ benefits });
});

export default router;
```

## Manual Influence Modification

For admin/testing purposes:

```typescript
import { TerritoryInfluenceService } from '../services/territoryInfluence.service';
import { FactionId, InfluenceSource } from '@shared/types';

const result = await TerritoryInfluenceService.modifyInfluence(
  'red_gulch',                    // territoryId
  FactionId.SETTLER_ALLIANCE,     // factionId
  25,                             // amount (positive or negative)
  InfluenceSource.SYSTEM_ADJUSTMENT,  // source
  undefined,                      // characterId (optional)
  undefined,                      // characterName (optional)
  undefined,                      // gangId (optional)
  undefined,                      // gangName (optional)
  { reason: 'Admin adjustment' }  // metadata (optional)
);
```

## Testing the Decay System

To manually trigger the daily decay:

```typescript
import { runInfluenceDecayNow } from '../jobs/influenceDecay.job';

// Run decay immediately (normally runs at 3:00 AM)
await runInfluenceDecayNow();
```

## Database Queries

Direct model access if needed:

```typescript
import { TerritoryInfluence } from '../models/TerritoryInfluence.model';
import { InfluenceHistory } from '../models/InfluenceHistory.model';

// Find all contested territories
const contested = await TerritoryInfluence.findContested();

// Find territories controlled by faction
const controlled = await TerritoryInfluence.findControlledByFaction(
  FactionId.NAHI_COALITION
);

// Get influence history for character
const history = await InfluenceHistory.findByCharacter(character._id, 100);
```

## Important Notes

1. **Daily Decay**: All faction influence decays 1% daily toward equilibrium (16.67%)
2. **Historical Tracking**: All influence changes are logged with full attribution
3. **Control Changes**: System automatically detects and logs control changes
4. **Benefits Only Apply**: Players only get benefits in territories controlled by their faction
5. **Multiple Factions**: Total influence across all factions can exceed 100%
6. **Trends**: System tracks whether influence is rising, falling, or stable

## Troubleshooting

### Territory not found
```typescript
// Make sure you initialized territories first
npm run script:init-territories
```

### Influence not changing
```typescript
// Check control level - dominated territories are hard to change
const territory = await TerritoryInfluenceService.getTerritoryInfluence(territoryId);
console.log(territory.controlLevel); // If 'dominated', need 70%+ influence to overcome
```

### Benefits not applying
```typescript
// Benefits only apply if faction controls the territory
const benefits = await TerritoryInfluenceService.getAlignmentBenefits(
  territoryId,
  playerFaction
);
console.log(benefits.shopDiscount); // Will be 0 if faction doesn't control
```

## Further Reading

- `TERRITORY_INFLUENCE_SYSTEM.md` - Complete system documentation
- `PHASE_11_WAVE_11.1_COMPLETION.md` - Implementation details
- `shared/src/types/territoryWar.types.ts` - Type definitions
- `server/src/services/territoryInfluence.service.ts` - Service implementation

---

**Ready to integrate!** Start with `npm run script:init-territories` and add the cron job to server startup.
