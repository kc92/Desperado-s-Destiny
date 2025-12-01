# Phase 7, Wave 7.1: Masterwork Item System - Implementation Complete

## Overview

The Masterwork Item System has been fully implemented, providing a comprehensive quality tier system for all crafted items in Desperados Destiny. This system adds depth, excitement, and meaningful progression to the crafting experience.

## Implementation Date
**November 26, 2025**

---

## Files Created

### 1. Type Definitions
**File**: `shared/src/types/masterwork.types.ts`

**Exports**:
- `ItemQuality` enum (6 quality tiers)
- `SpecialEffectCategory` enum
- `QualityTier` interface
- `SpecialEffect` interface
- `QualityRoll` interface
- `MaterialQuality` interface
- `ToolQuality` interface
- `FacilityBonus` interface
- `CraftedItemData` interface
- `CraftingContext` interface
- `QualityThresholds` interface
- `BreakageResult` interface
- `DurabilityDamageContext` interface
- `RepairContext` interface
- `RenameContext` interface

**Integration**: Added to `shared/src/types/index.ts` for central export.

---

### 2. Database Model
**File**: `server/src/models/CraftedItem.model.ts`

**Schema**:
- Character ownership tracking
- Base item reference
- Quality tier and multipliers
- Crafter attribution
- Custom naming (Masterwork only)
- Special effects array
- Durability tracking (current/max)
- Quality roll details for transparency
- Equipped/broken status flags
- Timestamps (created, updated, last repaired)

**Indexes**:
- `characterId` (owner lookup)
- `baseItemId` (item type lookup)
- `quality` (rarity queries)
- `crafterId` (crafter portfolio)
- Compound: `characterId + quality`
- Compound: `crafterId + createdAt`

**Instance Methods**:
- `applyDurabilityDamage(damage)` - Apply wear and tear
- `repair(percentage)` - Restore durability
- `checkBreakage()` - Shoddy quality breakage check
- `toItemData()` - Convert to transport format

**Static Methods**:
- `findByCharacter(characterId)` - Get all items for owner
- `findMasterworks()` - Get all legendary items
- `findByCrafter(crafterId)` - Get crafter's portfolio

---

### 3. Core Service
**File**: `server/src/services/masterwork.service.ts`

**Key Features**:

#### Quality Determination Algorithm
```typescript
determineQuality(context: CraftingContext): QualityRoll
```

Implements the complete formula:
```
Total Score = Base Chance + Material Bonus + Tool Bonus +
              Facility Bonus + Specialization Bonus + Luck Roll
```

**Components**:
1. **Base Chance**: `(Skill Level - Recipe Level) × 2%`
2. **Material Bonus**: `+5% to +20%` (stacks for multiple materials)
3. **Tool Bonus**: `+5% to +15%`
4. **Facility Bonus**: `+5% to +10%`
5. **Specialization Bonus**: `+10%` if specialized
6. **Luck Roll**: Random `±10%`

**Quality Thresholds**:
- `< 0` → Shoddy
- `0-29` → Common
- `30-59` → Fine
- `60-84` → Superior
- `85-94` → Exceptional
- `95+` → Masterwork

#### Special Effects Generation
```typescript
generateSpecialEffects(quality: ItemQuality, itemType): SpecialEffect[]
```

- Exceptional: 50% chance for 1 effect
- Masterwork: Always 1-2 effects
- Random selection from category (weapon/armor/tool)
- No duplicates

#### Item Creation
```typescript
createCraftedItem(characterId, baseItemId, qualityRoll, context): ICraftedItem
```

- Fetches base item data
- Applies quality multipliers
- Generates special effects
- Calculates durability (base × rarity × quality × effects)
- Creates database record
- Returns crafted item

#### Utility Methods
- `renameMasterwork()` - Custom naming for legendary items
- `getQualityTier()` - Get tier information
- `calculateEffectiveStats()` - Apply quality and effects to stats
- `calculateRepairCost()` - Determine repair requirements
- `canRepair()` - Validate repair eligibility

---

### 4. Special Effects Data
**File**: `server/src/data/specialEffects.ts`

**30 Total Effects** across 3 categories:

#### Weapon Effects (10)
1. **Keen** - +10% critical chance
2. **Vicious** - +15% damage vs wounded
3. **Swift** - +10% attack speed
4. **Draining** - Heal 5% of damage dealt
5. **Thundering** - 10% chance to stun
6. **Brutal** - +12% damage
7. **Precise** - +5 combat (flat)
8. **Deadly** - +7% crit, +8% damage
9. **Relentless** - +15% attack speed
10. **Balanced** - +10% combat (percentage)

#### Armor Effects (10)
1. **Resilient** - +15% durability
2. **Fortified** - +10% damage reduction
3. **Evasive** - +10% dodge
4. **Regenerating** - +1 HP/min
5. **Fire Resistant** - +25% fire resistance
6. **Bullet Resistant** - +25% bullet resistance
7. **Blade Resistant** - +25% blade resistance
8. **Nimble** - +15% dodge, +5 cunning
9. **Guardian** - +8% DR, +1 HP/min
10. **Ironhide** - +12% DR, +10% durability

#### Tool Effects (10)
1. **Efficient** - -20% material cost
2. **Masterful** - +10% quality chance
3. **Durable** - -50% durability loss
4. **Speedy** - +25% crafting speed
5. **Yielding** - +20% gathering yield
6. **Precise** - +15% quality, +5 craft
7. **Blessed** - +20% quality chance
8. **Tireless** - +20% speed, -30% durability loss
9. **Frugal** - -25% materials, +10% yield
10. **Artisan** - +12% quality, +15% craft

**Helper Functions**:
- `getEffectsByCategory(category)` - Filter by type
- `getRandomEffect(category)` - Single random effect
- `getRandomEffects(category, count)` - Multiple unique effects
- `getEffectById(effectId)` - Lookup by ID

---

### 5. Quality Tier Constants
**File**: `server/src/data/qualityTiers.ts`

**Exports**:
- `QUALITY_TIERS` - Complete tier definitions
- `QUALITY_THRESHOLDS` - Score boundaries
- `BASE_DURABILITY` - Base values by item type
- `RARITY_DURABILITY_MULTIPLIER` - Rarity modifiers
- `QUALITY_COLORS` - UI color codes

**Helper Functions**:
- `getQualityTier(quality)` - Get tier by name
- `getAllQualityTiers()` - Get all tiers as array
- `getQualityFromScore(score)` - Convert score to quality

---

### 6. Documentation
**File**: `docs/MASTERWORK_SYSTEM.md`

Comprehensive 400+ line documentation covering:
- Complete quality tier descriptions
- Quality determination algorithm with examples
- All 30 special effects with descriptions
- Durability system mechanics
- Repair system costs and requirements
- Masterwork naming system
- 4 detailed crafting scenarios
- Integration points with other systems
- Future enhancement roadmap
- Database schema
- Testing strategy
- Balancing notes

---

## Quality Tier System

### 6 Quality Levels

| Quality | Color | Stat % | Durability % | Effects | Can Break | Can Rename |
|---------|-------|--------|--------------|---------|-----------|------------|
| Shoddy | Gray (#9E9E9E) | 75% | 80% | None | Yes | No |
| Common | White (#FFFFFF) | 100% | 100% | None | No | No |
| Fine | Green (#4CAF50) | 115% | 120% | None | No | No |
| Superior | Blue (#2196F3) | 130% | 140% | None | No | No |
| Exceptional | Purple (#9C27B0) | 150% | 160% | 0-1 | No | No |
| Masterwork | Gold (#FFD700) | 175% | 200% | 1-2 | No | Yes |

---

## Quality Determination Examples

### Example 1: Masterwork Creation
```typescript
Context:
- Skill: 95 (Master Craftsman)
- Recipe Level: 50
- Materials: 2× Perfect (+20% each) = +40%
- Tool: Masterwork (+15%)
- Facility: Master Forge (+10%)
- Specialization: Yes (+10%)
- Luck: +9%

Calculation:
Base: (95-50)×2 = 90
Total: 90 + 40 + 15 + 10 + 10 + 9 = 174

Result: MASTERWORK (score ≥ 95) ✓
Effects: 2 random from category
Can Rename: Yes
```

### Example 2: Shoddy Failure
```typescript
Context:
- Skill: 5 (Novice)
- Recipe Level: 30
- Materials: Poor (+5%)
- Tool: None (0%)
- Facility: None (0%)
- Specialization: No (0%)
- Luck: -8%

Calculation:
Base: (5-30)×2 = -50
Total: -50 + 5 + 0 + 0 + 0 - 8 = -53

Result: SHODDY (score < 0) ✓
Effects: None
Can Break: Yes (5-15% chance on use)
```

### Example 3: Fine Quality
```typescript
Context:
- Skill: 35
- Recipe Level: 25
- Materials: Quality (+15%)
- Tool: Standard (+8%)
- Facility: Basic Workshop (+5%)
- Specialization: No (0%)
- Luck: +2%

Calculation:
Base: (35-25)×2 = 20
Total: 20 + 15 + 8 + 5 + 0 + 2 = 50

Result: FINE (30-59 range) ✓
Stats: 115% of base
Durability: 120% of base
```

---

## Special Effects System

### Effect Selection Logic

**Exceptional Items**:
```typescript
if (quality === EXCEPTIONAL) {
  numEffects = Math.random() < 0.5 ? 1 : 0; // 50% chance
}
```

**Masterwork Items**:
```typescript
if (quality === MASTERWORK) {
  numEffects = Math.random() < 0.5 ? 2 : 1; // 50/50 for 1 or 2
}
```

### Effect Examples

**Weapon Combo** (Masterwork Revolver):
- "Swift" (+10% attack speed)
- "Keen" (+10% critical chance)
= Fast-firing, accurate revolver

**Armor Combo** (Masterwork Duster):
- "Guardian" (+8% damage reduction, +1 HP/min)
- "Nimble" (+15% dodge, +5 cunning)
= Defensive tank with evasion

**Tool Combo** (Masterwork Hammer):
- "Artisan" (+12% quality, +15% craft skill)
- "Blessed" (+20% quality chance)
= Supreme quality boost for future crafts

---

## Durability System

### Base Durability
```typescript
weapon: 150
armor: 200
tool: 100
other: 100
```

### Calculation Formula
```typescript
Final Durability = Base × Rarity Mult × Quality Mult × (1 + Effect Bonuses)
```

### Example: Legendary Masterwork Weapon
```typescript
Base: 150 (weapon)
Rarity: ×3.0 (legendary)
Quality: ×2.0 (masterwork)
Effect: +15% (Resilient)

Final = 150 × 3.0 × 2.0 × 1.15 = 1,035 durability
```

---

## Breakage System

### Shoddy Items Only
```typescript
baseChance = 5%
durabilityPenalty = (100 - currentDurabilityPercent) / 10

breakChance = baseChance + durabilityPenalty

Examples:
- 100% durability: 5% break chance
- 50% durability: 10% break chance
- 10% durability: 14% break chance
- 0% durability: Item is broken
```

---

## Repair System

### Requirements
- **Minimum Skill**: Craft 10
- **Must Own Item**: characterId match
- **Cannot Be At Max**: current < max

### Costs by Quality

| Quality | Gold/25% | Material/25% |
|---------|----------|--------------|
| Shoddy | 25g | 1 iron |
| Common | 50g | 1 iron |
| Fine | 100g | 2 iron |
| Superior | 200g | 3 iron |
| Exceptional | 400g | 4 iron |
| Masterwork | 800g | 5 iron |

### Repair Example
```typescript
Item: Masterwork Revolver
Current Durability: 300/600 (50%)
Target: 75% (+25 percentage points)

Cost:
- Gold: 800g × (25/100) = 200g
- Materials: 2 iron ingots

Result:
- New Durability: 450/600 (75%)
- lastRepairedAt: Updated
- isBroken: false
```

---

## Masterwork Naming

### Rules
- **Quality Required**: Masterwork only
- **Authorization**: Original crafter only
- **Length**: 3-50 characters
- **Validation**: Trimmed, non-empty

### Examples
```
"Sarah's Mercy" - A compassionate gunslinger's revolver
"The Iron Constitution" - Legendary armor of a tank
"Forge of Legends" - Master craftsman's hammer
"El Dorado's Blessing" - Lucky prospector's tool
"Whiskey Pete's Last Word" - Famous outlaw's shotgun
```

### Lore Integration
Named items can be referenced by NPCs:
```
NPC: "Did you hear? Sarah's Mercy was spotted in Tombstone!"
NPC: "They say The Iron Constitution has never been pierced."
NPC: "I'd give my left arm for a tool from the Forge of Legends."
```

---

## Integration Points

### 1. Crafting Service Integration
```typescript
// In CraftingService.craftItem()

// After material validation, before adding to inventory:
const context: CraftingContext = {
  characterId: character._id,
  characterName: character.name,
  skillLevel: character.skills.find(s => s.skillId === 'craft').level,
  recipeLevel: recipe.skillRequired.level,
  isSpecialized: character.craftingProfile?.specialization === 'weaponsmithing',
  materials: getMaterialQuality(recipe.ingredients),
  tool: getEquippedTool(character),
  facility: getCurrentFacility(character)
};

const qualityRoll = MasterworkService.determineQuality(context);

const craftedItem = await MasterworkService.createCraftedItem(
  character._id,
  recipe.output.itemId,
  qualityRoll,
  context
);

// Store reference in character inventory
character.craftedItems.push(craftedItem._id);
```

### 2. Combat System Integration
```typescript
// In CombatService.calculateDamage()

let damage = baseDamage * weapon.statMultiplier; // Quality bonus

// Apply special effects
for (const effect of weapon.specialEffects) {
  if (effect.damageBonus) {
    damage *= (1 + effect.damageBonus / 100);
  }
  if (effect.criticalChanceBonus) {
    critChance += effect.criticalChanceBonus;
  }
}

// Apply durability damage
await weapon.applyDurabilityDamage(1);

// Check for breakage (Shoddy only)
if (weapon.checkBreakage()) {
  weapon.isBroken = true;
  await weapon.save();
  return { message: "Your weapon broke during combat!" };
}
```

### 3. Inventory System Integration
```typescript
// Display in inventory
interface InventoryItem {
  baseItem: IItem;
  craftedData?: ICraftedItem;
  quality: ItemQuality;
  displayName: string;
  effects: SpecialEffect[];
  durabilityPercent: number;
}

// Items with different quality don't stack
function canStack(item1, item2): boolean {
  if (item1.craftedData && item2.craftedData) {
    return item1.craftedData.quality === item2.craftedData.quality;
  }
  return true; // Non-crafted items stack normally
}
```

### 4. UI Integration
```typescript
// Quality badge component
<QualityBadge
  quality={item.quality}
  color={QUALITY_COLORS[item.quality]}
  statBonus={`+${(item.statMultiplier - 1) * 100}%`}
/>

// Special effects tooltip
<EffectsTooltip>
  {item.specialEffects.map(effect => (
    <Effect key={effect.effectId}>
      <strong>{effect.name}</strong>: {effect.description}
    </Effect>
  ))}
</EffectsTooltip>

// Durability bar
<DurabilityBar
  current={item.durability.current}
  max={item.durability.max}
  quality={item.quality}
  isBroken={item.isBroken}
/>
```

---

## Database Indexes

```typescript
// CraftedItem collection indexes
db.crafteditems.createIndex({ characterId: 1 })
db.crafteditems.createIndex({ baseItemId: 1 })
db.crafteditems.createIndex({ quality: 1 })
db.crafteditems.createIndex({ crafterId: 1 })
db.crafteditems.createIndex({ isBroken: 1 })
db.crafteditems.createIndex({ characterId: 1, quality: 1 })
db.crafteditems.createIndex({ crafterId: 1, createdAt: -1 })
db.crafteditems.createIndex({ quality: 1, createdAt: -1 })
```

---

## Testing Checklist

### Unit Tests
- [ ] Quality determination algorithm
- [ ] Score to quality tier mapping
- [ ] Special effect generation
- [ ] Durability calculation
- [ ] Breakage probability
- [ ] Repair cost calculation
- [ ] Stat modifier application

### Integration Tests
- [ ] Craft item with quality
- [ ] Apply combat damage with effects
- [ ] Repair damaged item
- [ ] Rename masterwork item
- [ ] Break shoddy item
- [ ] Stack items by quality

### Edge Cases
- [ ] Negative skill differential (< recipe level)
- [ ] Maximum quality stacking (all +20% materials)
- [ ] Minimum quality (no bonuses, bad luck)
- [ ] Multiple effects on same stat
- [ ] Repair at 0 durability
- [ ] Rename non-masterwork (should fail)
- [ ] Rename by non-crafter (should fail)

---

## Performance Considerations

### Optimizations
1. **Indexes**: Created for common queries (by character, by quality, by crafter)
2. **Lean Queries**: Use `.lean()` for read-only operations
3. **Projection**: Only fetch needed fields for display
4. **Caching**: Quality tier definitions are static constants

### Scaling
- Crafted items are separate collection (not embedded)
- Paginated queries for large inventories
- Background job for durability tick (if implemented)

---

## Future Enhancements

### Phase 7.2: Advanced Crafting
- **Gem Socketing**: Add slots for stat gems
- **Enchanting**: Magical enhancements
- **Reforging**: Upgrade quality tier (expensive)
- **Transmutation**: Reroll special effects

### Phase 7.3: Social Crafting
- **Crafting Orders**: Commission specific items
- **Crafter Signatures**: Mark on all items
- **Masterwork Gallery**: Public showcase
- **Apprenticeship**: Teach others

### Phase 7.4: Economy
- **Quality Pricing**: Market value by quality
- **Auction House**: Masterwork category
- **Item Insurance**: Protect valuables
- **Crafting Contests**: Weekly competitions

---

## API Routes (Future)

### Quality Information
```
GET /api/masterwork/quality-tiers
GET /api/masterwork/special-effects
GET /api/masterwork/special-effects/:category
```

### Item Management
```
POST /api/masterwork/rename
  Body: { itemId, newName }
  Auth: Must be crafter

POST /api/masterwork/repair
  Body: { itemId, percentage }
  Auth: Must own item

GET /api/masterwork/item/:id
  Returns: Full crafted item details
```

### Statistics
```
GET /api/masterwork/character/:id/crafted
  Returns: All items crafted by character

GET /api/masterwork/character/:id/owned
  Returns: All items owned by character

GET /api/masterwork/leaderboard/masterworks
  Returns: Top crafters by masterwork count
```

---

## Balancing Philosophy

### Quality Distribution Target
Based on normal gameplay with moderate materials and skill:
- **Shoddy**: 5% (failures, low skill)
- **Common**: 40% (baseline)
- **Fine**: 30% (good execution)
- **Superior**: 15% (high skill)
- **Exceptional**: 8% (expert craft)
- **Masterwork**: 2% (legendary)

### Stat Balance
- Each quality tier provides meaningful upgrade
- Masterwork is 1.75× powerful as Common (not 10×)
- Special effects provide 10-25% benefit each
- Multiple effects can synergize but not compound infinitely

### Economy Balance
- Masterworks are rare but achievable
- Repair costs scale to prevent disposable items
- Quality materials have value
- Specialization is rewarded but not mandatory

---

## Success Metrics

### Implementation Metrics
- ✅ 5 new TypeScript files created
- ✅ 1 comprehensive documentation file
- ✅ 6 quality tiers implemented
- ✅ 30 special effects defined
- ✅ Full quality algorithm with 6 factors
- ✅ Durability system with breakage
- ✅ Repair system with costs
- ✅ Masterwork naming system
- ✅ Database model with indexes
- ✅ Service layer with 10+ methods
- ✅ Type-safe throughout
- ✅ Zero TypeScript compilation errors (in new files)

### Player Engagement (Future)
- % of players crafting vs buying
- Average quality of crafted items
- Masterwork creation rate
- Named masterwork count
- Repair service usage
- Item breakage incidents

---

## Known Limitations

### Current Version (7.1)
1. **Material Quality**: System designed but material quality data not yet assigned
2. **Tool Quality**: Tool quality bonuses not yet implemented in Item model
3. **Facilities**: Facility bonuses designed but facility system not yet built
4. **API Routes**: Service layer complete, API routes not yet created
5. **UI Components**: Backend ready, frontend components not yet built

### Workarounds
- Default material bonus: +10% (standard)
- Default tool bonus: +5% (basic)
- Default facility bonus: 0% (none)
- Direct service calls for testing
- Console/logs for quality feedback

---

## Migration Path

### Adding to Existing Crafting System

**Step 1**: Update Item model to include quality tier flag
```typescript
// Item.model.ts
craftable: {
  type: Boolean,
  default: false
}
defaultQuality: {
  type: String,
  enum: ['common'], // For non-crafted items
  default: 'common'
}
```

**Step 2**: Modify CraftingService.craftItem()
```typescript
// After material validation
if (recipe.enableQuality) {
  // Use masterwork system
  const context = buildCraftingContext(character, recipe);
  const qualityRoll = MasterworkService.determineQuality(context);
  const craftedItem = await MasterworkService.createCraftedItem(...);
  return craftedItem;
} else {
  // Use old system (backward compatible)
  character.inventory.push({ itemId, quantity });
}
```

**Step 3**: Update Character inventory schema
```typescript
// Character.model.ts
craftedItems: [{
  type: Schema.Types.ObjectId,
  ref: 'CraftedItem'
}]
```

**Step 4**: Create migration script for existing items
```typescript
// Optional: Convert existing crafted items to Common quality
db.characters.find({ "inventory.itemId": { $exists: true }}).forEach(char => {
  char.inventory.forEach(item => {
    if (isCraftableItem(item.itemId)) {
      const crafted = new CraftedItem({
        characterId: char._id,
        baseItemId: item.itemId,
        quality: ItemQuality.COMMON,
        statMultiplier: 1.0,
        // ... other fields
      });
      crafted.save();
    }
  });
});
```

---

## Developer Notes

### Code Style
- TypeScript strict mode compatible
- Functional where possible
- Mongoose models for persistence
- Service layer for business logic
- Data files for static configuration

### Import Paths
All server files use relative imports:
```typescript
import { ... } from '../../../shared/src/types/masterwork.types';
```

This matches the existing pattern in:
- `server/src/models/CraftingProfile.model.ts`
- `server/src/data/professionDefinitions.ts`

### Error Handling
All service methods throw `AppError` for consistency:
```typescript
if (!item) {
  throw new AppError('Item not found', 404);
}
```

### Logging
Comprehensive logging for debugging:
```typescript
logger.info('Quality determination', { totalScore, finalQuality });
logger.info('Created crafted item', { characterId, quality });
```

---

## Conclusion

Phase 7, Wave 7.1 is **COMPLETE**. The Masterwork Item System provides:

✅ **6 Quality Tiers** from Shoddy to Masterwork
✅ **Comprehensive Quality Algorithm** with 6 factors
✅ **30 Special Effects** across 3 categories
✅ **Durability System** with breakage and repair
✅ **Masterwork Naming** for legendary items
✅ **Full Type Safety** with TypeScript
✅ **Database Model** with optimized indexes
✅ **Service Layer** with 10+ methods
✅ **400+ Line Documentation**
✅ **Ready for Integration** with crafting, combat, inventory

The system is designed to scale, balance player progression, and create memorable moments when that Masterwork item is finally crafted.

**Next Steps**:
1. Implement API routes for masterwork endpoints
2. Create UI components for quality display
3. Integrate with existing CraftingService
4. Add material quality data to Item collection
5. Build facility system for bonuses
6. Create frontend quality badge components
7. Add masterwork gallery page
8. Implement crafting competitions

---

**Implementation Status**: ✅ COMPLETE
**TypeScript Compilation**: ✅ PASSES (new files)
**Documentation**: ✅ COMPREHENSIVE
**Ready for Testing**: ✅ YES
**Ready for Integration**: ✅ YES

---

*Generated by Claude Code - Phase 7, Wave 7.1 Implementation*
*Desperados Destiny - Western MMORPG*
*November 26, 2025*
