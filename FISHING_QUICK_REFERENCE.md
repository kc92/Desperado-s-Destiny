# Fishing System - Quick Reference Guide

## File Locations

```
shared/src/types/fishing.types.ts          - Type definitions
server/src/data/fishSpecies.ts             - All fish data
server/src/data/fishingLocations.ts        - All location data
server/src/data/fishingGear.ts             - Rods, reels, lines, bait, lures
server/src/models/FishingTrip.model.ts     - Database model
server/src/services/fishing.service.ts      - Core fishing logic
server/src/services/fishFighting.service.ts - Fight mechanics
```

## Quick Start Example

```typescript
import { FishingService } from '../services/fishing.service';
import { FishFightingService } from '../services/fishFighting.service';
import { SpotType } from '@desperados/shared';

// 1. Start fishing
const result = await FishingService.startFishing(
  characterId,
  'red_gulch_creek',
  SpotType.STRUCTURE,
  {
    rodId: 'bamboo_rod',
    reelId: 'simple_reel',
    lineId: 'silk_line',
    baitId: 'worms'
  }
);

// 2. Check for bite (periodic)
const biteCheck = await FishingService.checkForBite(characterId);

// 3. Set hook when bite occurs
if (biteCheck.hasBite) {
  const hookResult = await FishingService.setHook(characterId);
}

// 4. Fight the fish
const reelResult = await FishFightingService.performFightAction(
  characterId,
  'REEL'
);

const runResult = await FishFightingService.performFightAction(
  characterId,
  'LET_RUN'
);

// 5. End session
const endResult = await FishingService.endFishing(characterId);
```

## Fish Rarity Tiers

| Rarity | Count | Base Chance | Gold Range | Examples |
|--------|-------|-------------|------------|----------|
| COMMON | 7 | 20-40% | 5-15 | Catfish, Bluegill, Bass |
| QUALITY | 7 | 8-15% | 20-85 | Trout, Pike, Walleye |
| RARE | 5 | 2-4% | 100-200 | Golden Trout, Sturgeon, Gar |
| LEGENDARY | 4 | 0.3-1% | 500-2000 | Old Whiskers, The Ghost |

## Location Quick Stats

| Location | Difficulty | Access | Legendary Fish |
|----------|-----------|--------|----------------|
| Red Gulch Creek | 20 | Default | River King |
| Coyote River | 40 | Level 5 | - |
| Rio Frontera | 60 | Level 15 | - |
| Spirit Springs Lake | 35 | Level 3 | Old Whiskers |
| Longhorn Reservoir | 50 | Rep: Settler 25 | - |
| Mountain Lake | 70 | Level 20 | The Ghost |
| The Scar Pool | 95 | Quest | El Diablo |
| Sacred Waters | 55 | Rep: Nahi 50 | - |

## Gear Pricing Guide

### Rods
- Cane Pole: $25 (starter)
- Bamboo Rod: $75 (level 5)
- Steel Rod: $180 (level 15, +10% fight bonus)
- Custom Rod: $500 (level 25, +15% catch, +15% fight, +10% XP)

### Reels
- Simple Reel: $15
- Multiplier Reel: $85 (level 10, +10% fight speed)
- Drag Reel: $200 (level 20, +20% tension control)

### Lines
- Cotton Line: $5 (weak)
- Silk Line: $25 (good)
- Horse Hair Line: $50 (premium, low visibility)
- Wire Leader: $40 (required for big pike/muskie)

### Bait (Consumable)
- Worms: $1 (universal)
- Minnows: $3 (+10% predator fish)
- Crawfish: $2 (bass, catfish)
- Insects: $1 (trout, panfish)
- Cut Bait: $2 (catfish, sturgeon)
- Special Bait: $25 (+20% rare fish)
- Golden Grub: $50 (legendary bass bait)
- Spirit Worm: $100 (legendary trout bait)
- Blood Lure: $150 (El Diablo only)

## Fight Mechanics Cheat Sheet

### Actions
- **REEL**: Increase tension, drain fish stamina fast
- **LET_RUN**: Decrease tension, fish recovers slightly

### Key Stats
- **Fish Stamina**: 0 = caught
- **Line Tension**: 100 = snap
- **Hook Strength**: 0 = escape

### Failure States
1. Tension >= 100 → Line snaps
2. Tension > Line Strength (random) → Line breaks
3. Hook Strength <= 0 → Fish escapes
4. Bite window expires → Missed hook set

### Quality Factors
- Fight speed (faster = better)
- Tension management (40-60% optimal)
- Consistency (low variance)
- Never exceed 80% tension
- Preserve hook strength

### Quality Bonuses
- 90+ quality = +25% gold and XP
- Personal record = bonus notification
- First catch = bonus notification
- Legendary catch = +200 XP bonus

## Time of Day Effects

| Time | Hours | Effect |
|------|-------|--------|
| DAWN | 5-7am | +20% activity |
| MORNING | 7-11am | Normal |
| MIDDAY | 11am-3pm | -10% activity |
| AFTERNOON | 3-6pm | Normal |
| DUSK | 6-8pm | +20% activity |
| NIGHT | 8pm-5am | Special fish |

## Weather Effects

| Weather | Effect |
|---------|--------|
| CLEAR | Normal |
| CLOUDY | +10% bite rate |
| RAIN | +15% bite rate, different fish |
| STORM | -50% bite rate, dangerous |
| FOG | Mystery fish bonus |

## Spot Types

| Spot | Good For |
|------|----------|
| SHALLOW | Panfish, small fish |
| DEEP | Large fish, catfish |
| STRUCTURE | Bass, pike, hiding fish |
| SURFACE | Trout (flies), active feeders |
| BOTTOM | Catfish, sturgeon |

## Energy Costs

- Cast line: 5 energy
- Fight fish: 10 energy (on landing)
- Session: AFK-friendly between bites

## Session Limits

- Max catches: 20 per session
- Timeout: 60 minutes
- Bite check: Every 60 seconds

## Common Patterns

### Beginner Setup (Total: $116)
```typescript
{
  rodId: 'bamboo_rod',      // $75
  reelId: 'simple_reel',    // $15
  lineId: 'silk_line',      // $25
  baitId: 'worms'           // $1
}
// Good for: Red Gulch Creek, Spirit Springs Lake
// Target: Common fish (catfish, bass, bluegill)
```

### Trophy Hunter Setup (Total: $785)
```typescript
{
  rodId: 'custom_rod',        // $500
  reelId: 'drag_reel',        // $200
  lineId: 'horsehair_line',   // $50
  baitId: 'special_bait'      // $25
  // Add: golden_grub ($50) for legendary bass
}
// Good for: All locations
// Target: Rare and legendary fish
```

### Pike/Muskie Setup (Total: $325)
```typescript
{
  rodId: 'steel_rod',       // $180
  reelId: 'multiplier_reel', // $85
  lineId: 'wire_leader',    // $40
  baitId: 'minnows'         // $3
  // lureId: 'plug'         // $20 (optional)
}
// Good for: Longhorn Reservoir, Coyote River
// Target: Pike, Muskie (30-50 lbs)
```

## Legendary Fish Guide

### Old Whiskers (Spirit Springs Lake)
- **Species**: Giant Catfish
- **Weight**: 80-100 lbs
- **Time**: Night only
- **Weather**: Storm, Fog preferred
- **Bait**: Special Bait or Blood Lure required
- **Reward**: 600 gold + legendary_whisker item
- **Lore**: 50-year-old catfish, unkillable legend

### The Ghost (Mountain Lake)
- **Species**: Albino Trout
- **Weight**: 12-15 lbs
- **Time**: Night only (moonlight)
- **Weather**: Clear or Fog
- **Bait**: Spirit Worm or Special Bait required
- **Reward**: 800 gold + ghost_scale + moonlight_pearl
- **Lore**: Transformed spirit warrior

### River King (Red Gulch Creek)
- **Species**: Massive Bass
- **Weight**: 18-22 lbs
- **Time**: Dawn or Dusk
- **Weather**: Cloudy, Rain
- **Bait**: Golden Grub, Minnows, Crawfish
- **Reward**: 1000 gold + kings_scale
- **Lore**: Fed by prospectors, grown huge

### El Diablo (The Scar Pool)
- **Species**: Blood-Red Cursed Fish
- **Weight**: 25-30 lbs
- **Time**: Night only
- **Weather**: Storm, Fog
- **Bait**: Blood Lure required
- **Reward**: 2000 gold + cursed_essence + blood_crystal
- **Lore**: Meteor-spawned supernatural entity

## Testing Commands

```typescript
// Get current session
const session = await FishingService.getCurrentSession(characterId);

// Get fight status
const status = await FishFightingService.getFightStatus(characterId);

// Abandon fight
const abandon = await FishFightingService.abandonFight(characterId, false);

// Release fish
const release = await FishFightingService.abandonFight(characterId, true);

// Get fishing stats
const stats = await FishingTrip.getCharacterFishingStats(characterId);
```

## Database Queries

```typescript
// Find active trip
const trip = await FishingTrip.findActiveTrip(characterId);

// Get all trips for character
const allTrips = await FishingTrip.find({
  characterId: new mongoose.Types.ObjectId(characterId)
});

// Get trips by location
const locationTrips = await FishingTrip.find({
  locationId: 'red_gulch_creek'
});

// Get statistics
const stats = await FishingTrip.getCharacterFishingStats(characterId);
/*
Returns:
{
  totalCatches: number,
  totalValue: number,
  totalExperience: number,
  biggestFish: CaughtFish,
  commonCaught: number,
  qualityCaught: number,
  rareCaught: number,
  legendaryCaught: number,
  speciesCaught: string[],
  legendaryCatches: CaughtFish[],
  locationsVisited: string[]
}
*/
```

## Tips for Implementation

1. **Controller Layer**: Create REST endpoints for each service method
2. **Real-time Updates**: Use WebSocket for bite notifications
3. **Client UI**: Display fish stats, tension meter, stamina bars
4. **Animations**: Add visual feedback for reeling/letting run
5. **Sound Effects**: Bite splash, reel cranking, line tension
6. **Notifications**: Toast messages for bites, catches, records
7. **Inventory**: Link to character inventory for gear/bait
8. **Shop**: Add fishing gear shop with purchase system
9. **Achievements**: Track first catches, records, legendaries
10. **Leaderboards**: Biggest fish, most catches, rarest species

## Common Issues

### "No bite yet"
- Normal behavior, check every 60 seconds
- Bite chance affected by time/weather/gear
- Common fish: 20-40% per minute
- Legendary fish: <1% per minute

### "Line snapped"
- Tension reached 100
- Use LET_RUN more often
- Upgrade to better rod (flexibility helps)
- Balance REEL and LET_RUN actions

### "Hook pulled free"
- Hook strength degraded to 0
- Happens over long fights
- Fight faster (more REEL)
- Get better gear for fight bonuses

### "Invalid fishing location"
- Check location access requirements
- Verify character level
- Check reputation requirements
- Some locations require quest completion

## Performance Notes

- Bite checks are periodic (60s), not constant polling
- Fight state stored in database between actions
- Session cleanup runs on timeout (60 min)
- Weighted probability pre-calculated per check
- No performance impact on other systems

## Future Integration Points

- **Skills**: Add fishing skill tree
- **Achievements**: Create fishing achievement set
- **Quests**: "Catch 10 bass" style objectives
- **Tournaments**: Scheduled competition events
- **Social**: Fishing parties, leaderboards
- **Crafting**: Use fish for cooking recipes
- **Property**: Display trophy mounts
- **Gang**: Gang fishing competitions
