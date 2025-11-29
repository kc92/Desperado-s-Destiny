# Wilderness Properties Data

Comprehensive wilderness property definitions for Desperados Destiny.

## Overview

This directory contains definitions for remote frontier properties:
- **Homesteads**: Wilderness residences (10 properties)
- **Mines**: Ore extraction operations (10 properties)
- **Ore Types**: Extractable minerals and gems (17 types)

## Files

### `oreTypes.ts`
Defines all ore types that can be mined, from common iron to legendary soulstone.

**Ore Rarities**:
- Common (4): Iron, Copper, Coal, Limestone
- Uncommon (3): Silver, Turquoise, Salt
- Rare (3): Gold, Platinum, Obsidian
- Very Rare (3): Ruby, Emerald, Sapphire
- Legendary (4): Diamond, Meteorite, Bloodstone, Soulstone

**Key Functions**:
```typescript
getOreType(oreId: string): OreType | undefined
getOresByRarity(rarity: OreRarity): OreType[]
getProcessingCost(oreId: string, quantity: number): number
getMarketPrice(oreId: string, demandModifier?: number): number
```

### `homesteads.ts`
Wilderness homestead properties ranging from small cabins to luxury estates.

**Size Distribution**:
- Small (4): 10-20 acres, 500-700g
- Medium (4): 35-50 acres, 1,500-2,000g
- Large (2): 80-100 acres, 4,500-5,000g

**Key Functions**:
```typescript
getHomestead(homesteadId: string): HomesteadProperty | undefined
getHomesteadsBySize(size: PropertySize): HomesteadProperty[]
getHomesteadsByLocation(locationId: string): HomesteadProperty[]
getAvailableHomesteads(characterLevel: number): HomesteadProperty[]
getHomesteadsWithFeature(feature: {...}): HomesteadProperty[]
```

### `mines.ts`
Mining operations from small prospector claims to industrial-scale operations.

**Size Distribution**:
- Small (4): Prospector claims, 600-1,200g
- Medium (4): Established mines, 2,500-4,000g
- Large (2): Industrial operations, 8,000-10,000g

**Key Functions**:
```typescript
getMine(mineId: string): MineProperty | undefined
getMinesBySize(size: PropertySize): MineProperty[]
getMinesByOre(oreType: PrimaryOreType): MineProperty[]
getAvailableMines(characterLevel: number): MineProperty[]
getSupernaturalMines(): MineProperty[]
calculateTotalDanger(mine: MineProperty): number
estimateWeeklyProduction(mine, minersWorking, upgrades?): {primary, secondary}
getRecommendedMinerWage(mine: MineProperty): number
```

### `wildernessIndex.ts`
Central export file with summary and validation functions.

**Main Exports**:
```typescript
import {
  // Ores
  ORE_TYPES,
  getOreType,

  // Homesteads
  HOMESTEADS,
  getHomestead,

  // Mines
  MINES,
  getMine,

  // Utilities
  WILDERNESS_PROPERTIES,
  getWildernessSummary,
  validateWildernessProperties,
} from './wildernessIndex';
```

## Usage Examples

### Get All Small Homesteads
```typescript
import { getHomesteadsBySize } from './homesteads';

const smallHomesteads = getHomesteadsBySize('small');
// Returns 4 homesteads: Pioneer's Dream, Frontier Refuge, etc.
```

### Find Gold Mines
```typescript
import { getMinesByOre } from './mines';

const goldMines = getMinesByOre('gold');
// Returns: Lucky Strike Claim, The Bonanza Mine, The Mother Lode
```

### Calculate Mine Economics
```typescript
import { getMine, estimateWeeklyProduction, getRecommendedMinerWage } from './mines';

const mine = getMine('the_bonanza_mine');
const production = estimateWeeklyProduction(mine, 5); // 5 miners
const wagePerMiner = getRecommendedMinerWage(mine);

console.log(`Weekly Production: ${production.primary} gold ore, ${production.secondary} silver ore`);
console.log(`Weekly Wages: ${wagePerMiner * 5 * 7}g for 5 miners`);
```

### Find Properties for New Players
```typescript
import { getAvailableHomesteads, getAvailableMines } from './wildernessIndex';

const beginnerHomesteads = getAvailableHomesteads(5); // Level 5
const beginnerMines = getAvailableMines(8); // Level 8
```

### Get Supernatural Properties
```typescript
import { getSupernaturalMines, getSupernaturalOres } from './wildernessIndex';

const hauntedMines = getSupernaturalMines();
// Returns: Silver Gulch, The Silver Lady, Titan's Quarry

const magicOres = getSupernaturalOres();
// Returns: Silver, Turquoise, Salt, Obsidian, all gems, etc.
```

## Property Features

### Homestead Buildings
- `CABIN` - Basic shelter
- `HOUSE` - Standard home
- `MANOR` - Luxury residence
- `CELLAR` - Underground storage
- `WELL` - Water source
- `SMOKEHOUSE` - Food preservation
- `WORKSHOP` - Crafting facility
- `WATCHTOWER` - Defense structure
- `HIDDEN_CACHE` - Secret storage
- `BARN` - Large storage/animals
- `STABLE` - Horse housing

### Terrain Types
- `PLAINS` - Open grasslands
- `MOUNTAIN` - High elevation
- `VALLEY` - Protected lowland
- `FOREST` - Wooded area
- `DESERT` - Arid wasteland
- `CANYON` - Deep gorge

### Mine Risks
- **Cave-in Risk**: Structural collapse danger (1-10)
- **Flood Risk**: Water intrusion danger (1-10)
- **Gas Risk**: Toxic gas danger (1-10, coal mines)
- **Danger Level**: Overall worker safety (1-10)
- **Cursed**: Supernatural corruption
- **Haunted**: Spirit activity

## Special Properties

### Highest Defensibility
1. **Eagle's Nest**: 10 (mountain fortress)
2. **The Hermitage**: 9 (hidden canyon)
3. **Thunder Ridge Estate**: 8 (cliffside)

### Most Dangerous Mines
1. **Titan's Quarry**: Danger 10, cursed, near Wastes
2. **Coal Hollow**: Danger 7, gas risk 8
3. **The Silver Lady**: Danger 7, haunted

### Most Valuable Ores
1. **Diamond**: 500g base value
2. **Soulstone**: 400g (cursed)
3. **Meteorite**: 300g (supernatural)
4. **Bloodstone**: 250g (cursed)

### Best Production Homesteads
1. **Coyote Springs Ranch**: 10 gardens, 6 pens
2. **Frontier Manor**: 15 gardens, 10 pens
3. **Settler's Rest**: 5 gardens, 2 pens

## Integration Points

### With Property System
- Uses `PropertySize` enum from `@desperados/shared`
- Uses `PropertyType` enum for type classification
- Compatible with property upgrade system
- Integrates with worker management

### With Location System
Properties reference location IDs:
- `goldfinger_district` - Mining region
- `spirit_springs_outskirts` - Coalition territory
- `wastes_edge` - Dangerous borderlands
- `kaiowa_highlands` - Sacred mountains
- `frontier_wilderness_east` - Remote frontier

### With Faction System
Some properties require faction standing:
- **Nahi Coalition**: Spirit Springs, Kaiowa properties
- **Blood Pact**: Cursed Wastes properties

### With Economy System
- Weekly taxes (based on size and value)
- Weekly upkeep (maintenance costs)
- Ore market prices with demand fluctuation
- Worker wages (danger-adjusted)

## Validation

Run validation to check data integrity:

```typescript
import { validateWildernessProperties } from './wildernessIndex';

const validation = validateWildernessProperties();

if (!validation.valid) {
  console.log('Errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.log('Warnings:', validation.warnings);
}
```

Current validation results:
- ✅ 10 homesteads validated
- ✅ 10 mines validated
- ✅ 17 ore types validated
- ✅ All IDs match
- ✅ All prices valid
- ✅ All ranges within bounds
- ✅ 0 errors, 0 warnings

## Summary Statistics

Get a quick overview:

```typescript
import { getWildernessSummary } from './wildernessIndex';

const summary = getWildernessSummary();

console.log(`Total Homesteads: ${summary.totalHomesteads}`);
console.log(`Total Mines: ${summary.totalMines}`);
console.log(`Total Ore Types: ${summary.totalOreTypes}`);
```

Output:
```
Total Homesteads: 10
Total Mines: 10
Total Ore Types: 17
```

## Notes

- All properties have unique IDs
- Level requirements range from 5 to 35
- Prices balanced for game economy
- Supernatural elements integrated throughout
- Western frontier atmosphere maintained
- Risk vs. reward balanced for each property

## Future Enhancements

- Property events (discoveries, disasters)
- Dynamic ore spawn rates
- Seasonal modifiers
- Weather effects on production
- Property condition degradation
- Claim jumping mechanics
- Ghost town system
- Property auctions

---

**Phase 8, Wave 8.2 - Wilderness Properties**
*Complete property definitions ready for database integration*
