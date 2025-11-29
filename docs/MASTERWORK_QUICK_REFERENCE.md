# Masterwork System - Quick Reference Card

## Quality Tiers (Fast Lookup)

| Quality | Color | Stats | Durability | Effects | Break? | Rename? |
|---------|-------|-------|------------|---------|--------|---------|
| Shoddy | Gray | 75% | 80% | 0 | YES | NO |
| Common | White | 100% | 100% | 0 | NO | NO |
| Fine | Green | 115% | 120% | 0 | NO | NO |
| Superior | Blue | 130% | 140% | 0 | NO | NO |
| Exceptional | Purple | 150% | 160% | 0-1 | NO | NO |
| Masterwork | Gold | 175% | 200% | 1-2 | NO | YES |

## Quality Formula (Quick)

```
Score = (Skill - Recipe) × 2
      + Materials (5-20%)
      + Tool (5-15%)
      + Facility (5-10%)
      + Specialization (0 or 10%)
      + Luck (±10%)
```

## Quality Thresholds

```
< 0  → Shoddy
0-29 → Common
30-59 → Fine
60-84 → Superior
85-94 → Exceptional
95+  → Masterwork
```

## Special Effect Categories

### Weapon (10 effects)
- Keen, Vicious, Swift, Draining, Thundering
- Brutal, Precise, Deadly, Relentless, Balanced

### Armor (10 effects)
- Resilient, Fortified, Evasive, Regenerating
- Fire/Bullet/Blade Resistant, Nimble, Guardian, Ironhide

### Tool (10 effects)
- Efficient, Masterful, Durable, Speedy, Yielding
- Precise, Blessed, Tireless, Frugal, Artisan

## Usage Examples

### 1. Determine Quality
```typescript
import { MasterworkService } from '@services/masterwork.service';

const context: CraftingContext = {
  characterId: char._id,
  characterName: char.name,
  skillLevel: 60,
  recipeLevel: 40,
  isSpecialized: true,
  materials: [
    { itemId: 'iron', qualityBonus: 15, isRare: false, isPerfect: false }
  ],
  tool: { toolId: 'hammer', qualityBonus: 10, isMasterwork: false },
  facility: { facilityType: 'advanced_workshop', qualityBonus: 7 }
};

const roll = MasterworkService.determineQuality(context);
// roll.finalQuality = ItemQuality.SUPERIOR (likely)
// roll.totalScore = 82 (base 40 + materials 15 + tool 10 + facility 7 + spec 10 + luck)
```

### 2. Create Crafted Item
```typescript
const craftedItem = await MasterworkService.createCraftedItem(
  characterId,
  'revolver-base',
  qualityRoll,
  context
);

console.log(craftedItem.quality); // 'superior'
console.log(craftedItem.statMultiplier); // 1.3
console.log(craftedItem.specialEffects); // []
```

### 3. Apply Durability Damage
```typescript
await craftedItem.applyDurabilityDamage(5);
// Applies special effect reductions automatically
```

### 4. Repair Item
```typescript
const canRepair = await MasterworkService.canRepair(charId, itemId);
if (canRepair.canRepair) {
  await craftedItem.repair(50); // Restore 50%
}
```

### 5. Rename Masterwork
```typescript
const renamed = await MasterworkService.renameMasterwork(
  itemId,
  crafterId,
  "Sarah's Mercy"
);
```

## File Locations

### Types
- `shared/src/types/masterwork.types.ts` - All interfaces/enums

### Models
- `server/src/models/CraftedItem.model.ts` - Database schema

### Services
- `server/src/services/masterwork.service.ts` - Business logic

### Data
- `server/src/data/specialEffects.ts` - All 30 effects
- `server/src/data/qualityTiers.ts` - Tier definitions

### Docs
- `docs/MASTERWORK_SYSTEM.md` - Full documentation
- `PHASE_7_WAVE_7.1_IMPLEMENTATION.md` - Implementation details

## Import Examples

### From Server Files
```typescript
// Types
import {
  ItemQuality,
  CraftingContext,
  QualityRoll
} from '../../../shared/src/types/masterwork.types';

// Model
import { CraftedItem, ICraftedItem } from '@models/CraftedItem.model';

// Service
import { MasterworkService } from '@services/masterwork.service';

// Data
import { WEAPON_EFFECTS, getRandomEffect } from '../data/specialEffects';
import { QUALITY_TIERS, getQualityFromScore } from '../data/qualityTiers';
```

### From Client Files
```typescript
import {
  ItemQuality,
  QualityTier,
  SpecialEffect
} from '@desperados/shared/src/types/masterwork.types';
```

## Common Patterns

### Check Item Quality
```typescript
if (item.quality === ItemQuality.MASTERWORK) {
  console.log("Legendary item!", item.customName);
}
```

### Display Quality Color
```typescript
import { QUALITY_COLORS } from '../data/qualityTiers';

const color = QUALITY_COLORS[item.quality];
// Returns: '#FFD700' for masterwork
```

### Calculate Effective Stats
```typescript
const effectiveStats = MasterworkService.calculateEffectiveStats(
  { combat: 10, cunning: 5 },
  item.quality,
  item.specialEffects
);
// Returns: { combat: 17.5, cunning: 8.75 } for Masterwork (1.75×)
```

### Get Repair Cost
```typescript
const cost = MasterworkService.calculateRepairCost(item, 50);
// Returns: { gold: 400, materials: [{ itemId: 'iron-ingot', quantity: 2 }] }
```

### Find Character's Masterworks
```typescript
const masterworks = await CraftedItem.find({
  characterId,
  quality: ItemQuality.MASTERWORK
});
```

### Find Crafter's Portfolio
```typescript
const crafted = await CraftedItem.findByCrafter(crafterId);
const masterworkCount = crafted.filter(
  i => i.quality === ItemQuality.MASTERWORK
).length;
```

## Database Queries

### Get All Exceptional+ Items
```typescript
const rareItems = await CraftedItem.find({
  quality: { $in: [ItemQuality.EXCEPTIONAL, ItemQuality.MASTERWORK] }
}).sort({ createdAt: -1 });
```

### Get Broken Items
```typescript
const broken = await CraftedItem.find({
  characterId,
  isBroken: true
});
```

### Get Items Needing Repair
```typescript
const needsRepair = await CraftedItem.find({
  characterId,
  $expr: { $lt: ['$durability.current', { $multiply: ['$durability.max', 0.5] }] }
});
```

## Balance Numbers

### Expected Quality Distribution
- Shoddy: 5%
- Common: 40%
- Fine: 30%
- Superior: 15%
- Exceptional: 8%
- Masterwork: 2%

### Repair Costs (per 25%)
- Shoddy: 25g + 1 iron
- Common: 50g + 1 iron
- Fine: 100g + 2 iron
- Superior: 200g + 3 iron
- Exceptional: 400g + 4 iron
- Masterwork: 800g + 5 iron

### Breakage Rates (Shoddy Only)
- 100% durability: 5% chance
- 50% durability: 10% chance
- 0% durability: Broken (100%)

## Testing Commands

### Create Test Context
```typescript
const testContext: CraftingContext = {
  characterId: 'test-char',
  characterName: 'Test Character',
  skillLevel: 50,
  recipeLevel: 30,
  isSpecialized: false,
  materials: [
    { itemId: 'iron', qualityBonus: 10, isRare: false, isPerfect: false }
  ],
  tool: { toolId: 'hammer', qualityBonus: 5, isMasterwork: false },
  facility: undefined
};
```

### Test Quality Determination
```typescript
const roll = MasterworkService.determineQuality(testContext);
console.log(roll.breakdown); // See full calculation
```

### Test Special Effect Generation
```typescript
const effects = MasterworkService.generateSpecialEffects(
  ItemQuality.MASTERWORK,
  'weapon'
);
console.log(effects.map(e => e.name)); // e.g., ['Keen', 'Swift']
```

## Error Handling

All service methods throw `AppError`:
```typescript
try {
  const item = await MasterworkService.renameMasterwork(id, crafterId, name);
} catch (error) {
  if (error instanceof AppError) {
    console.log(error.statusCode); // 400, 403, 404
    console.log(error.message); // "Only masterwork items can be renamed"
  }
}
```

## Performance Tips

1. **Use Lean Queries** for display:
```typescript
const items = await CraftedItem.find({ characterId }).lean();
```

2. **Project Only Needed Fields**:
```typescript
const items = await CraftedItem.find({ characterId })
  .select('quality statMultiplier specialEffects durability')
  .lean();
```

3. **Use Indexes**:
```typescript
// Already created: characterId, quality, crafterId, isBroken
await CraftedItem.find({ characterId, quality: 'masterwork' }); // Fast!
```

## Common Gotchas

1. **Quality vs Rarity**: Quality is for crafted items, Rarity is for base items
2. **Stacking**: Items with different quality don't stack
3. **Renaming**: Only Masterwork, only by original crafter
4. **Breakage**: Only Shoddy quality can break
5. **Effects**: Exceptional gets 0-1, Masterwork gets 1-2 (always)
6. **Repair**: Requires Craft skill 10+

## Quick Wins

### Easy Masterwork (Testing)
```typescript
const guaranteedMasterwork: CraftingContext = {
  skillLevel: 100,
  recipeLevel: 10,
  materials: [
    { qualityBonus: 20, ... }, // Perfect
    { qualityBonus: 20, ... }  // Perfect
  ],
  tool: { qualityBonus: 15, ... }, // Masterwork
  facility: { qualityBonus: 10, ... }, // Master Forge
  isSpecialized: true,
  // With average luck, score will be 95+
};
```

### Easy Shoddy (Testing)
```typescript
const guaranteedShoddy: CraftingContext = {
  skillLevel: 1,
  recipeLevel: 50,
  materials: [{ qualityBonus: 5, ... }], // Poor
  tool: undefined,
  facility: undefined,
  isSpecialized: false,
  // Score will be negative
};
```

---

**Keep this card handy during development!**

For full details, see `docs/MASTERWORK_SYSTEM.md`
