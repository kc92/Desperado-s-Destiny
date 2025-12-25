# Masterwork Item System

## Overview

The Masterwork Item System is a comprehensive quality tier system for all crafted items in Desperados Destiny. Every crafted item has a quality that affects its stats, durability, appearance, and potential special effects.

## Quality Tiers

### 1. Shoddy (Gray - #9E9E9E)
- **Stat Multiplier**: 75% of base stats
- **Durability Multiplier**: 80%
- **Special Effects**: None
- **Can Break**: Yes (random chance during use)
- **Can Rename**: No

**How to Get**: Made when skill is far below recipe requirement, bad luck, or poor materials.

**Example**: A poorly crafted revolver that might jam or break in combat.

---

### 2. Common (White - #FFFFFF)
- **Stat Multiplier**: 100% of base stats
- **Durability Multiplier**: 100%
- **Special Effects**: None
- **Can Break**: No
- **Can Rename**: No

**How to Get**: Standard crafting success with adequate skill and materials.

**Example**: A standard revolver that works as expected.

---

### 3. Fine (Green - #4CAF50)
- **Stat Multiplier**: 115% of base stats
- **Durability Multiplier**: 120% (+20% durability)
- **Special Effects**: None
- **Can Break**: No
- **Can Rename**: No

**How to Get**: Good skill level, quality materials, favorable luck.

**Example**: A well-crafted revolver with better balance and finish.

---

### 4. Superior (Blue - #2196F3)
- **Stat Multiplier**: 130% of base stats
- **Durability Multiplier**: 140% (+40% durability)
- **Special Effects**: None
- **Can Break**: No
- **Can Rename**: No

**How to Get**: High skill, rare materials, good facilities, favorable luck.

**Example**: An expertly crafted revolver with exceptional accuracy.

---

### 5. Exceptional (Purple - #9C27B0)
- **Stat Multiplier**: 150% of base stats
- **Durability Multiplier**: 160% (+60% durability)
- **Special Effects**: 0-1 random bonus effect
- **Can Break**: No
- **Can Rename**: No

**How to Get**: Expert skill, exceptional materials, critical success.

**Example**: A masterfully crafted revolver with distinctive engravings and a chance for a special effect like "Keen" (+10% critical chance).

---

### 6. Masterwork (Gold - #FFD700)
- **Stat Multiplier**: 175% of base stats
- **Durability Multiplier**: 200% (+100% durability)
- **Special Effects**: 1-2 special effects (always)
- **Can Break**: No
- **Can Rename**: Yes (by crafter only)

**How to Get**: Master crafter (90+ skill), perfect materials, specialized facility, critical success.

**Example**: "Whiskey Pete's Judgment" - A legendary revolver with both "Keen" and "Swift" effects, custom-named by its creator.

---

## Quality Determination Algorithm

The quality of a crafted item is determined by combining multiple factors:

### Formula Components

```
Total Score = Base Chance + Material Bonus + Tool Bonus + Facility Bonus + Specialization Bonus + Luck Roll
```

### 1. Base Chance
```
Base Chance = (Skill Level - Recipe Level) × 2%
```

**Examples**:
- Skill 50, Recipe 30 = (50 - 30) × 2 = 40 points
- Skill 30, Recipe 30 = (30 - 30) × 2 = 0 points
- Skill 20, Recipe 30 = (20 - 30) × 2 = -20 points

### 2. Material Quality Bonus
```
Material Bonus = +5% to +20% per material
```

**Material Tiers**:
- **Poor Materials**: +5%
- **Standard Materials**: +10%
- **Quality Materials**: +15%
- **Perfect Materials**: +20%

Multiple materials stack additively.

### 3. Tool Quality Bonus
```
Tool Bonus = +5% to +15%
```

**Tool Tiers**:
- **Worn Tools**: +5%
- **Standard Tools**: +8%
- **Fine Tools**: +12%
- **Masterwork Tools**: +15%

### 4. Facility Bonus
```
Facility Bonus = +5% to +10%
```

**Facility Types**:
- **Basic Workshop**: +5%
- **Advanced Workshop**: +7%
- **Master Forge**: +10%
- **Guild Hall** (with specialization): +10%

### 5. Specialization Bonus
```
Specialization Bonus = +10% if specialized
```

Character must have chosen this crafting profession as their specialization.

### 6. Luck Roll
```
Luck Roll = Random(-10%, +10%)
```

Pure RNG to add variance and excitement.

---

## Quality Score to Tier Mapping

| Score Range | Quality Tier |
|-------------|-------------|
| < 0 | Shoddy |
| 0 - 29 | Common |
| 30 - 59 | Fine |
| 60 - 84 | Superior |
| 85 - 94 | Exceptional |
| 95+ | Masterwork |

---

## Special Effects

### Weapon Effects

1. **Keen** - +10% critical chance
2. **Vicious** - +15% damage vs wounded enemies
3. **Swift** - +10% attack speed
4. **Draining** - Heal 5% of damage dealt
5. **Thundering** - 10% chance to stun on hit
6. **Brutal** - +12% damage
7. **Precise** - +5 combat skill (flat)
8. **Deadly** - +7% critical chance, +8% damage
9. **Relentless** - +15% attack speed
10. **Balanced** - +10% combat skill (percentage)

### Armor Effects

1. **Resilient** - +15% durability
2. **Fortified** - +10% damage reduction
3. **Evasive** - +10% dodge chance
4. **Regenerating** - +1 HP/minute
5. **Fire Resistant** - +25% fire resistance
6. **Bullet Resistant** - +25% bullet resistance
7. **Blade Resistant** - +25% blade resistance
8. **Nimble** - +15% dodge, +5 cunning
9. **Guardian** - +8% damage reduction, +1 HP/minute
10. **Ironhide** - +12% damage reduction, +10% durability

### Tool Effects

1. **Efficient** - -20% material cost when crafting
2. **Masterful** - +10% quality chance on crafted items
3. **Durable** - -50% durability loss
4. **Speedy** - +25% crafting speed
5. **Yielding** - +20% gathering yield
6. **Precise** - +15% quality chance, +5 craft skill
7. **Blessed** - +20% quality chance
8. **Tireless** - +20% crafting speed, -30% durability loss
9. **Frugal** - -25% material cost, +10% gathering yield
10. **Artisan** - +12% quality chance, +15% craft skill

---

## Example Crafting Scenarios

### Scenario 1: Beginner Crafting
```
Character: "Rusty Jake"
Skill Level: 15
Recipe Level: 10
Materials: Standard iron (10%)
Tool: Worn hammer (5%)
Facility: None (0%)
Specialization: No (0%)
Luck Roll: -3%

Total Score = 10 + 10 + 5 + 0 + 0 - 3 = 22 points
Result: COMMON quality
```

### Scenario 2: Skilled Crafting
```
Character: "Sarah Ironhand"
Skill Level: 55
Recipe Level: 40
Materials: Quality steel (15%) + Rare leather (18%)
Tool: Fine hammer (12%)
Facility: Advanced Workshop (7%)
Specialization: Yes (10%)
Luck Roll: +7%

Total Score = 30 + 33 + 12 + 7 + 10 + 7 = 99 points
Result: MASTERWORK quality (with 1-2 special effects!)
```

### Scenario 3: Under-skilled Attempt
```
Character: "Clumsy Pete"
Skill Level: 5
Recipe Level: 30
Materials: Poor iron (5%)
Tool: None (0%)
Facility: None (0%)
Specialization: No (0%)
Luck Roll: -8%

Total Score = -50 + 5 + 0 + 0 + 0 - 8 = -53 points
Result: SHODDY quality (can break during use!)
```

### Scenario 4: Master Craftsman
```
Character: "Ironforge McKenzie"
Skill Level: 95
Recipe Level: 50
Materials: Perfect Damascus steel (20%) + Perfect hardwood (20%)
Tool: Masterwork hammer (15%)
Facility: Master Forge (10%)
Specialization: Weaponsmithing (10%)
Luck Roll: +9%

Total Score = 90 + 40 + 15 + 10 + 10 + 9 = 174 points
Result: MASTERWORK quality guaranteed!
Effects: 2 special effects (e.g., "Keen" + "Swift")
Custom Name: Can name it "McKenzie's Pride"
```

---

## Durability System

### Base Durability by Type
- **Weapons**: 150
- **Armor**: 200
- **Tools**: 100
- **Other**: 100

### Rarity Multipliers
- **Common**: ×1.0
- **Uncommon**: ×1.2
- **Rare**: ×1.5
- **Epic**: ×2.0
- **Legendary**: ×3.0

### Quality Multipliers
- **Shoddy**: ×0.8
- **Common**: ×1.0
- **Fine**: ×1.2
- **Superior**: ×1.4
- **Exceptional**: ×1.6
- **Masterwork**: ×2.0

### Final Durability Calculation
```
Final Durability = Base × Rarity Multiplier × Quality Multiplier × (1 + Special Effect Bonuses)
```

**Example**: Masterwork Epic Revolver with "Resilient" effect
```
150 (weapon base) × 2.0 (epic) × 2.0 (masterwork) × 1.15 (resilient +15%)
= 690 durability points
```

---

## Durability Loss

### Actions That Damage Durability
- **Combat**: 1-5 points per fight
- **Crafting**: 0.5-2 points per craft
- **Gathering**: 1-3 points per gather
- **General Use**: 0.1-1 point

### Durability Loss Reduction
Special effects can reduce durability loss:
- **Durable**: -50% loss
- **Tireless**: -30% loss

**Example**: A tool with "Durable" effect loses only 1 point instead of 2 per craft.

---

## Item Breakage

### Shoddy Quality Breakage
Shoddy items have a chance to break on use:
```
Base Breakage Chance = 5%
Increased by Damage = +0.1% per 1% durability lost

Example:
- At 100% durability: 5% break chance
- At 50% durability: 10% break chance
- At 10% durability: 14% break chance
```

**Broken items**:
- Cannot be equipped
- Cannot be used
- Must be repaired before use
- Severe breakage may destroy the item

---

## Repair System

### Repair Requirements
- **Minimum Craft Skill**: 10
- **Gold Cost**: Varies by quality
- **Materials**: Varies by quality

### Repair Costs by Quality

| Quality | Base Gold Cost | Material Required |
|---------|---------------|------------------|
| Shoddy | 25g | 1 iron per 25% |
| Common | 50g | 1 iron per 25% |
| Fine | 100g | 2 iron per 25% |
| Superior | 200g | 3 iron per 25% |
| Exceptional | 400g | 4 iron per 25% |
| Masterwork | 800g | 5 iron per 25% |

**Note**: Costs scale with repair percentage.

### Partial Repairs
Players can choose repair percentage (25%, 50%, 75%, 100%).

**Example**: Repairing a Masterwork item to 50%
- Gold Cost: 400g
- Materials: 3 iron ingots

---

## Masterwork Naming

### Requirements
- Item must be **Masterwork** quality
- Only the **original crafter** can rename
- Name must be 3-50 characters

### Naming Examples
- "Sarah's Mercy" (revolver)
- "The Iron Constitution" (armor)
- "Forge of Legends" (hammer)
- "Whiskey Pete's Last Word" (shotgun)
- "El Dorado's Blessing" (lucky charm)

### Lore Integration
Named masterworks can become legendary items that NPCs reference:
- "Did you hear about Sarah's Mercy? They say it never misses."
- "I once saw The Iron Constitution turn aside a shotgun blast!"

---

## Integration Points

### With Crafting System
The quality determination occurs during the `craftItem()` call in `CraftingService`:

```typescript
// After validating materials and skills
const context: CraftingContext = {
  characterId: character._id,
  characterName: character.name,
  skillLevel: character.skills.find(s => s.skillId === 'craft').level,
  recipeLevel: recipe.skillRequired.level,
  isSpecialized: character.craftingProfile.specialization === 'weaponsmithing',
  materials: [
    { itemId: 'iron-ingot', qualityBonus: 10, isRare: false, isPerfect: false }
  ],
  tool: { toolId: 'hammer', qualityBonus: 8, isMasterwork: false },
  facility: { facilityType: 'basic_workshop', qualityBonus: 5 }
};

const qualityRoll = MasterworkService.determineQuality(context);
const craftedItem = await MasterworkService.createCraftedItem(
  character._id,
  recipe.output.itemId,
  qualityRoll,
  context
);
```

### With Combat System
Special effects modify combat calculations:

```typescript
// In combat calculation
if (weapon.specialEffects.some(e => e.effectId === 'keen')) {
  criticalChance += 10;
}

if (armor.specialEffects.some(e => e.effectId === 'fortified')) {
  damageReduction += 10;
}
```

### With Inventory System
Quality affects item display and stacking:
- Items of different quality don't stack
- Quality badge shown in UI
- Special effects listed in tooltip

---

## API Endpoints (Future Implementation)

### GET /api/crafting/quality-tiers
Returns all quality tier definitions.

### POST /api/crafting/craft-with-quality
Crafts an item with quality determination.

### POST /api/crafting/rename-masterwork
Renames a masterwork item (crafter only).

### POST /api/crafting/repair-item
Repairs a damaged item.

### GET /api/crafting/special-effects
Returns all available special effects.

---

## Database Schema

### CraftedItem Collection
```typescript
{
  _id: ObjectId,
  characterId: ObjectId, // Owner
  baseItemId: string, // Reference to Item collection
  quality: 'shoddy' | 'common' | 'fine' | 'superior' | 'exceptional' | 'masterwork',
  statMultiplier: number,
  crafterId: ObjectId, // Who crafted it
  crafterName: string,
  customName?: string, // Masterwork only
  specialEffects: [
    {
      effectId: string,
      name: string,
      description: string,
      category: 'weapon' | 'armor' | 'tool',
      // Effect properties...
    }
  ],
  durability: {
    current: number,
    max: number
  },
  qualityRoll: {
    baseChance: number,
    materialBonus: number,
    toolBonus: number,
    facilityBonus: number,
    specializationBonus: number,
    luckRoll: number,
    totalScore: number,
    finalQuality: string,
    breakdown: [string]
  },
  isEquipped: boolean,
  isBroken: boolean,
  createdAt: Date,
  lastRepairedAt: Date
}
```

---

## Future Enhancements

### Phase 7.2 - Advanced Features
1. **Socketing System**: Add gem slots to Exceptional/Masterwork items
2. **Enchanting**: Magical enhancements for specific stats
3. **Reforging**: Chance to upgrade quality tier
4. **Transmutation**: Change special effects

### Phase 7.3 - Social Features
1. **Crafting Orders**: Commission specific quality/effects
2. **Signature Items**: Crafter's mark on all items
3. **Masterwork Gallery**: Hall of fame for legendary items
4. **Apprenticeship**: Teach quality crafting to others

### Phase 7.4 - Economy Integration
1. **Quality-Based Pricing**: Market prices vary by quality
2. **Auction House**: Special category for Masterworks
3. **Item Insurance**: Protect valuable items
4. **Crafting Contests**: Weekly competitions

---

## Testing Strategy

### Unit Tests
- Quality determination algorithm
- Special effect generation
- Durability calculations
- Breakage probability

### Integration Tests
- Crafting with quality
- Combat with special effects
- Repair system
- Renaming system

### Edge Cases
- Negative skill differential
- Maximum quality stacking
- Multiple special effects interaction
- Broken item handling

---

## Balancing Notes

### Quality Distribution (Expected)
Based on normal gameplay:
- **Shoddy**: 5% (low skill attempts)
- **Common**: 40% (standard crafting)
- **Fine**: 30% (good materials/skill)
- **Superior**: 15% (high skill)
- **Exceptional**: 8% (expert craft)
- **Masterwork**: 2% (legendary craft)

### Special Effect Balance
- Each effect provides 10-25% benefit in its area
- Multiple effects can synergize (e.g., Swift + Deadly)
- No effect should be "must-have" - variety is key

### Economy Impact
- Masterwork items should be 5-10× more valuable than Common
- Repair costs should be meaningful but not prohibitive
- Quality materials should be worth acquiring

---

## Conclusion

The Masterwork Item System adds depth, excitement, and meaningful progression to crafting in Desperados Destiny. Every crafted item tells a story of the crafter's skill, luck, and dedication. From humble Shoddy beginnings to legendary Masterwork creations, the system rewards mastery while maintaining accessibility for all players.

**May your hammer strike true and your crafts be Masterwork!**
