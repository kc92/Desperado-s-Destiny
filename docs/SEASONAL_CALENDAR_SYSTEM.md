# Seasonal Calendar System
**Phase 12, Wave 12.2 - Desperados Destiny**

## Overview

The Seasonal Calendar System tracks game time, seasons, holidays, and moon phases. It creates dynamic gameplay where activities, prices, and events change based on the time of year.

## Time System

### Time Conversion
- **1 real day = 1 game week** (7 game days)
- **7 real days = 1 game month** (4 game weeks)
- **84 real days = 1 game year** (12 game months)
- **Seasons last 3 game months** each

This means a complete year cycle takes about 12 real weeks (3 months).

### Game Calendar Structure
```typescript
{
  currentYear: 1885,        // Starting year
  currentMonth: 1-12,       // January to December
  currentWeek: 1-4,         // Week of the month
  currentDay: 1-7,          // Day of week (1=Sunday)
  currentSeason: Season,    // SPRING, SUMMER, FALL, WINTER
  currentMoonPhase: MoonPhase  // Moon cycle
}
```

## The Four Seasons

### Spring (March-May)
**Weather:** Mild, rainy, muddy roads
**Theme:** Rebirth and planting

**Effects:**
- +20% crop yield when planting
- +15% fishing bonus
- +10% gathering bonus
- -15% travel speed (muddy roads)
- Rain probability: 40%

**Economic Impact:**
- Seed prices: +10%
- Lighter clothing: -10%
- Fresh medicine: +5%

**Activities:**
- Planting crops
- Spring roundup
- Easter celebrations
- Wildflower gathering
- Fishing in swollen rivers

### Summer (June-August)
**Weather:** Hot, dry, dust storms
**Theme:** Peak activity and heat danger

**Effects:**
- +20% animal spawns (wildlife active)
- +5% hunting bonus
- -5% fishing bonus
- +10% travel speed (dry roads)
- +15% energy cost (heat exhaustion)
- 2 HP/hour heat damage in extreme conditions
- Heat wave probability: 30%

**Economic Impact:**
- Fresh produce: -10%
- Furs: -30% (out of season)
- Alcohol: +5% (everyone wants a cold beer)
- Medicine: +10% (heat illness)

**Activities:**
- Peak hunting season
- Night travel to avoid heat
- Swimming and cooling off
- Independence Day celebrations
- Mining operations

### Fall (September-November)
**Weather:** Perfect conditions, harvest time
**Theme:** Abundance and preparation

**Effects:**
- +30% crop yield at harvest
- +20% hunting bonus
- +15% gathering bonus
- +15% travel speed (excellent roads)
- -5% energy cost
- Clear weather probability: 35%

**Economic Impact:**
- Crops: -30% (harvest glut)
- Food: -20% (abundant)
- Furs: +10% (hunting season)
- Warmer clothing: +10%
- Ammunition: +5%

**Activities:**
- Harvesting crops
- Peak hunting season
- Fall festivals
- Preparing for winter
- County fairs

### Winter (December-February)
**Weather:** Cold, harsh, dangerous
**Theme:** Survival and hardship

**Effects:**
- -70% crop yield (dormant)
- -40% animal spawns (scarce)
- -30% travel speed (ice, snow)
- +50% travel danger (exposure, wolves)
- +20% energy cost
- 3 HP/hour exposure damage
- -30% NPC activity (staying indoors)
- Cold snap probability: 30%

**Economic Impact:**
- Crops: +50% (scarce)
- Food: +30% (preserved only)
- Firewood: +30% (essential)
- Warm clothing: +30%
- Furs: +30% (high demand)
- Medicine: +20% (cold/flu)

**Activities:**
- Indoor activities
- Ice fishing
- Repairing equipment
- Christmas and New Year celebrations
- Survival challenges

## Moon Phases

The moon follows a 28-day cycle (4 real days), affecting supernatural events and crime.

### New Moon (0% illumination)
- **Crime Detection:** -50% (perfect darkness)
- **Crime Bonus Gold:** +25%
- **Supernatural Encounters:** 15% chance
- **Weird West Powers:** +15%
- **Best for:** Robberies, stealth missions

### Waxing Crescent (25% illumination)
- **Crime Detection:** -30%
- **Crime Bonus Gold:** +15%
- **Supernatural Encounters:** 8% chance

### First Quarter (50% illumination)
- **Crime Detection:** -15%
- **Crime Bonus Gold:** +5%
- **Supernatural Encounters:** 5% chance
- **Neutral phase**

### Waxing Gibbous (75% illumination)
- **Crime Detection:** Normal
- **Supernatural Encounters:** 10% chance
- **Fishing Bonus:** +10%
- **Wolf Activity:** +15%

### Full Moon (100% illumination)
- **Crime Detection:** +30% (bright light)
- **Crime Bonus Gold:** -10%
- **Supernatural Encounters:** 30% chance (PEAK)
- **Weird West Powers:** +25%
- **Fishing Bonus:** +20%
- **Wolf Activity:** +30% (werewolves!)
- **NPC Behavior:** Erratic (+20% modifier)
- **Coalition ceremonies performed**

### Waning Phases
Mirror the waxing phases in reverse.

## Holidays

### Major Holidays

**New Year's Day** (January 1)
- Free drinks at midnight
- +15 NPC mood
- +10% energy regen
- -10% shop prices (sales)

**Valentine's Day** (February 14)
- Romance quests available
- Flower gathering +10%
- +10 NPC mood
- +20% flower/chocolate prices

**St. Patrick's Day** (March 17)
- Irish celebrations
- +20 NPC mood
- Bar brawl chance +10%
- Green beer drinking contests

**Easter** (April 15)
- Easter egg hunts
- +15 NPC mood
- Gathering bonus +15%
- Community celebrations

**Independence Day** (July 4)
- Biggest celebration!
- +25 NPC mood
- +15% energy regen
- Shooting contests
- Fireworks
- Special patriotic quests

**Halloween** (October 31)
- **SUPERNATURAL EVENT**
- Ghost encounters +50%
- Werewolf hunts
- Costume parties
- Séances
- +20% combat modifier (supernatural)

**Día de los Muertos** (November 2)
- **SUPERNATURAL EVENT**
- Spirit communication
- Altar building
- +30% supernatural encounters
- Coalition ceremonies

**Thanksgiving** (November 24)
- Community feasts
- +20 NPC mood
- +20% energy regen
- Turkey hunting
- +15% food prices

**Christmas Eve** (December 24)
- Christmas truce (gang wars pause)
- +25 NPC mood
- -50% combat modifier (peace)
- Church services

**Christmas Day** (December 25)
- Peace on earth
- +30 NPC mood
- -70% combat modifier
- Gift exchanges
- -20% shop prices

**New Year's Eve** (December 31)
- Saloon parties
- +20 NPC mood
- Countdown celebrations
- +15% drunk fight chance

## Monthly Themes

Each month has unique flavor and atmosphere:

**January:** Winter hardship, cabin fever, wolves
**February:** Valentine's romance, late winter storms
**March:** Spring thaw, flooding, mudslides
**April:** Easter, planting, new beginnings
**May:** Cattle drives, festivals, spring peak
**June:** Summer begins, heat waves
**July:** Independence Day, peak summer heat
**August:** Dog days, drought, dust storms
**September:** Harvest begins, relief from heat
**October:** Halloween, supernatural peak, hunting season
**November:** Thanksgiving, final harvest, winterizing
**December:** Christmas, harsh winter, year-end reflection

## Seasonal Effects on Gameplay

### Travel
```typescript
Spring:  0.85x speed (muddy)
Summer:  1.10x speed (dry)
Fall:    1.15x speed (excellent)
Winter:  0.70x speed (ice/snow)
```

### Economy
Prices fluctuate by category and season:
- **Crops:** Cheap in fall harvest, expensive in winter
- **Furs:** Expensive in winter, cheap in summer
- **Clothing:** Seasonal (heavy coats in winter)
- **Firewood:** Expensive in winter, cheap in summer
- **Fresh food:** Expensive in winter, cheap in harvest

### Activities
- **Hunting:** Best in fall (+20%), good in summer (+5%)
- **Fishing:** Best in spring (+15%), best on full moon (+20%)
- **Gathering:** Best in fall (+15%), good in spring (+10%)
- **Mining:** Penalty in winter (-15%)
- **Crime:** Best on new moon (+25% loot), risky on full moon

### Health & Energy
- **Summer:** 2 HP/hour heat damage, +15% energy cost
- **Winter:** 3 HP/hour exposure damage, +20% energy cost
- **Spring/Fall:** No damage, normal energy

## API Endpoints

### Get Current Calendar
```
GET /api/calendar
```
Returns complete calendar state, current date, upcoming holidays.

### Get Season Info
```
GET /api/calendar/season
```
Returns current season, effects, monthly theme, days until next season.

### Get Moon Phase
```
GET /api/calendar/moon-phase
```
Returns current moon phase, effects, days until full/new moon.

### Check Activity Timing
```
GET /api/calendar/activity-check/:activity
```
Parameters: `hunting`, `fishing`, `crime`, `trading`
Returns if it's a good time, reason, and bonus.

### Get Price Modifier
```
GET /api/calendar/price-modifier/:category
```
Returns seasonal price modifier for item category.

### Admin: Advance Time
```
POST /api/calendar/admin/advance
Body: { days: number }
```
Force advance the calendar (testing/admin).

## Integration Examples

### Pricing System
```typescript
// Apply seasonal pricing to items
const basePrice = 100;
const category = 'crops';
const seasonalPrice = await seasonService.applySeasonalPricing(basePrice, category);
// In fall: ~70 gold (harvest)
// In winter: ~150 gold (scarce)
```

### Hunting Success
```typescript
// Calculate hunting success with seasonal bonus
const baseChance = 50;
const huntingBonus = await seasonService.getHuntingBonus();
const totalChance = baseChance + huntingBonus;
// In fall: 70% (50 + 20)
// In winter: 60% (50 + 10)
```

### Crime Detection
```typescript
// Apply moon phase to crime detection
const baseDetection = 30;
const modified = await seasonService.applyCrimeDetectionModifier(baseDetection);
// New moon: 15% (30 * 0.5)
// Full moon: 39% (30 * 1.3)
```

### Travel Time
```typescript
// Calculate travel time with seasonal effects
const baseTravelTime = 60; // minutes
const actualTime = await seasonService.calculateTravelTime(baseTravelTime);
// Spring: 51 minutes (60 * 0.85)
// Fall: 69 minutes (60 * 1.15)
```

## Calendar Job

The `calendarTick.job.ts` runs daily at midnight:

1. **Syncs calendar** with real time
2. **Checks for holidays** and activates them
3. **Generates flavor events** (30% chance)
4. **Updates seasonal effects**
5. **Triggers moon phase events**
6. **Logs special events** (full moon, holidays, etc.)

### Initialization

On server start, call:
```typescript
import { initializeCalendar, scheduleCalendarTick } from './jobs/calendarTick.job';

// Initialize calendar
await initializeCalendar();

// Schedule daily tick
scheduleCalendarTick();
```

## Database Schema

### GameCalendar Model
Single document (singleton) storing global calendar state:
- Current year, month, week, day
- Current season and moon phase
- All holidays
- Active holiday ID
- Scheduled events
- Seasonal effects (denormalized for performance)
- Real-world sync timestamps

## Files Created

### Types
- `shared/src/types/calendar.types.ts` - All TypeScript interfaces

### Data
- `server/src/data/seasonalEffects.ts` - Season effect definitions
- `server/src/data/monthlyThemes.ts` - Monthly flavor content
- `server/src/data/holidays.ts` - Holiday definitions
- `server/src/data/moonPhases.ts` - Moon phase effects

### Models
- `server/src/models/GameCalendar.model.ts` - MongoDB schema

### Services
- `server/src/services/calendar.service.ts` - Time tracking & calendar
- `server/src/services/season.service.ts` - Seasonal effects application

### Jobs
- `server/src/jobs/calendarTick.job.ts` - Daily time advancement

### Routes
- `server/src/routes/calendar.routes.ts` - API endpoints

### Utilities
- `server/src/utils/calendarUtils.ts` - Helper functions

## Usage Examples

### Display Current Date
```typescript
const currentDate = await calendarService.getCurrentDate();
const formatted = calendarService.formatDate(currentDate);
// "Monday, June 7, 1885 (Summer) 🌕"
```

### Check Seasonal Pricing
```typescript
const season = await seasonService.getCurrentSeason();
const furPrice = await seasonService.applySeasonalPricing(100, 'furs');
// Winter: 130 gold (high demand)
// Summer: 70 gold (out of season)
```

### Plan Activities
```typescript
const huntingCheck = await seasonService.isGoodTimeFor('hunting');
if (huntingCheck.isGood) {
  console.log(huntingCheck.reason); // "Fall is prime hunting season!"
  console.log(`Bonus: +${huntingCheck.bonus}%`);
}
```

### Holiday Events
```typescript
const calendar = await calendarService.getCalendar();
if (calendar.isHoliday()) {
  const holiday = calendar.getActiveHoliday();
  // Trigger special content for Halloween, Christmas, etc.
}
```

## Future Enhancements

1. **Weather Integration:** Seasonal weather probabilities drive weather system
2. **NPC Schedules:** NPCs follow seasonal routines
3. **Seasonal Quests:** Special quests available only in certain seasons
4. **Faction Events:** Gang wars intensify in summer, truces in winter
5. **Crop System:** Actual planting/harvesting mechanics
6. **Calendar UI:** Visual calendar showing holidays and moon phases
7. **Seasonal Achievements:** Unlock achievements during specific seasons
8. **Historical Events:** Major story events tied to specific dates

## Testing

The calendar automatically syncs with real time, but for testing:

```typescript
// Advance time manually
await calendarService.forceAdvanceTime(30); // Skip 30 days

// Check specific season
const springEffects = seasonService.getSeasonalEffects(Season.SPRING);

// Simulate holiday
// Just change the date to match holiday.month and holiday.day
```

## Performance Notes

- Calendar is a singleton (one document)
- Seasonal effects are denormalized for fast access
- Moon phase calculated on-demand
- Price modifiers cached per season
- Calendar tick runs once per day (minimal overhead)

## Immersion Features

- **Realistic time progression** that players can track
- **Seasonal variety** prevents monotony
- **Strategic planning** around seasons and moon phases
- **Dynamic economy** that feels alive
- **Cultural celebrations** that deepen world-building
- **Supernatural elements** tied to moon phases
- **Weather makes sense** for the season
- **NPCs react** to seasons and holidays

---

**The Seasonal Calendar System creates a living, breathing world that changes throughout the year, rewarding players who plan ahead and immersing them in the rhythms of frontier life.**
