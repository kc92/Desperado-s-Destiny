# Seasonal Calendar System - Quick Reference
**Phase 12, Wave 12.2**

## Time System

```
1 real day = 1 game week (7 game days)
7 real days = 1 game month (28 game days)
84 real days = 1 game year (336 game days)
21 real days = 1 game season (3 months)
```

## Seasons at a Glance

| Season | Months | Travel | Energy | Best For |
|--------|--------|--------|--------|----------|
| Spring | Mar-May | 0.85x | 1.0x | Fishing (+15%), Planting |
| Summer | Jun-Aug | 1.10x | 1.15x | Hunting (+5%), Trading |
| Fall | Sep-Nov | 1.15x | 0.95x | Hunting (+20%), Harvest |
| Winter | Dec-Feb | 0.70x | 1.20x | Survival, Indoor activities |

## Price Modifiers Quick View

| Item | Spring | Summer | Fall | Winter |
|------|--------|--------|------|--------|
| Crops | 1.1x | 0.9x | 0.7x | 1.5x |
| Furs | 0.8x | 0.7x | 1.1x | 1.3x |
| Food | 1.0x | 0.95x | 0.8x | 1.3x |
| Wood | 1.0x | 1.0x | 1.05x | 1.3x |
| Clothing | 0.9x | 1.0x | 1.1x | 1.3x |

## Moon Phases

| Phase | Illumination | Crime Detection | Supernatural | Best For |
|-------|--------------|-----------------|--------------|----------|
| New Moon | 0% | 0.5x | 15% | Crime (+25% loot) |
| Full Moon | 100% | 1.3x | 30% | Fishing (+20%) |

## Major Holidays

- **Jan 1:** New Year's Day - Sales, celebrations
- **Feb 14:** Valentine's Day - Romance quests
- **Jul 4:** Independence Day - Biggest celebration!
- **Oct 31:** Halloween - Supernatural peak
- **Nov 2:** Día de los Muertos - Spirit communication
- **Dec 25:** Christmas - Peace on earth

## API Quick Reference

```typescript
// Get current calendar state
GET /api/calendar

// Get season info
GET /api/calendar/season

// Get moon phase
GET /api/calendar/moon-phase

// Check if good time for activity
GET /api/calendar/activity-check/hunting
GET /api/calendar/activity-check/fishing
GET /api/calendar/activity-check/crime
GET /api/calendar/activity-check/trading

// Get price modifier
GET /api/calendar/price-modifier/crops

// Admin: Advance time
POST /api/calendar/admin/advance
Body: { days: 30 }
```

## Service Usage

```typescript
// Apply seasonal pricing
const price = await seasonService.applySeasonalPricing(100, 'furs');

// Get hunting bonus
const bonus = await seasonService.getHuntingBonus();

// Apply crime detection
const detection = await seasonService.applyCrimeDetectionModifier(30);

// Calculate travel time
const time = await seasonService.calculateTravelTime(60);

// Check activity timing
const check = await seasonService.isGoodTimeFor('hunting');
```

## Integration Points

1. **Economy:** Use `seasonService.applySeasonalPricing()`
2. **Hunting:** Add `seasonService.getHuntingBonus()`
3. **Fishing:** Add `seasonService.getFishingBonus()`
4. **Crime:** Apply `seasonService.applyCrimeDetectionModifier()`
5. **Travel:** Use `seasonService.calculateTravelTime()`
6. **Energy:** Apply `seasonalEffects.energyCostModifier`
7. **Health:** Check `seasonService.getHealthDrainRate()`

## Startup Integration

```typescript
import { initializeCalendar, scheduleCalendarTick } from './jobs/calendarTick.job';
import calendarRoutes from './routes/calendar.routes';

// Initialize calendar
await initializeCalendar();

// Schedule daily tick
scheduleCalendarTick();

// Add routes
app.use('/api/calendar', calendarRoutes);
```

## Key Files

- **Types:** `shared/src/types/calendar.types.ts`
- **Calendar Service:** `server/src/services/calendar.service.ts`
- **Season Service:** `server/src/services/season.service.ts`
- **Model:** `server/src/models/GameCalendar.model.ts`
- **Job:** `server/src/jobs/calendarTick.job.ts`
- **Routes:** `server/src/routes/calendar.routes.ts`

## Common Scenarios

### Pricing an Item
```typescript
const basePrice = 100;
const category: ItemCategory = 'crops';
const finalPrice = await seasonService.applySeasonalPricing(basePrice, category);
// Fall: ~70 gold, Winter: ~150 gold
```

### Calculating Success Rates
```typescript
const baseHuntingChance = 50;
const seasonalBonus = await seasonService.getHuntingBonus();
const totalChance = baseHuntingChance + seasonalBonus;
// Fall: 70%, Winter: 60%
```

### Crime Planning
```typescript
const moonEffects = await seasonService.getCurrentMoonPhaseEffects();
if (moonEffects.crimeDetectionModifier < 1.0) {
  // Good time for crime!
  const bonusGold = moonEffects.crimeBonusGold;
  // New moon: +25% bonus
}
```

### Travel Planning
```typescript
const baseTravelTime = 60; // minutes
const actualTime = await seasonService.calculateTravelTime(baseTravelTime);
// Winter: ~86 minutes (0.7x speed = more time)
// Fall: ~51 minutes (1.15x speed = less time)
```

### Display Current Date
```typescript
const currentDate = await calendarService.getCurrentDate();
const formatted = calendarService.formatDate(currentDate);
// "Monday, June 7, 1885 (Summer) 🌕"
```

## Effect Values Summary

### Seasonal Effects
- **Travel Speed:** 0.70x to 1.15x
- **Energy Cost:** 1.0x to 1.20x
- **Crop Yield:** 0.30x to 1.30x
- **Hunting Bonus:** 0 to +20%
- **Fishing Bonus:** -10% to +15%
- **Price Modifiers:** 0.70x to 1.50x
- **Health Drain:** 0 to 3 HP/hour

### Moon Phase Effects
- **Crime Detection:** 0.50x to 1.30x
- **Crime Bonus:** -10% to +25%
- **Supernatural Chance:** 5% to 30%
- **Fishing Bonus:** -10% to +20%
- **Weird West Power:** +5% to +25%

### Holiday Effects
- **Shop Prices:** 0.80x to 1.30x
- **NPC Mood:** +5 to +30
- **Energy Regen:** -10 to +20
- **Combat Modifier:** 0.30x to 1.20x

## Testing

```bash
# Run calendar test script
cd server
npx ts-node src/scripts/testCalendar.ts
```

## Tips

1. **Plan ahead:** Check upcoming holidays for sales
2. **Hunt in fall:** Best season for hunting (+20%)
3. **Fish on full moon:** (+20% bonus)
4. **Crime on new moon:** (+25% loot, -50% detection)
5. **Stock up before winter:** Prices increase dramatically
6. **Travel in fall:** Fastest travel speed
7. **Plant in spring:** +20% crop yield
8. **Harvest in fall:** +30% crop yield
9. **Avoid winter travel:** Slow and dangerous
10. **Use seasonal pricing:** Buy low in season, sell high out of season

---

**The calendar system is ready to breathe life into your Wild West world!**
