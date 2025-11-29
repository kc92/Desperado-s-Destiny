# Masterwork System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MASTERWORK ITEM SYSTEM                          │
│                     Phase 7, Wave 7.1 Complete                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client/UI     │────▶│   API Routes    │────▶│   Controllers   │
│                 │     │  (Future 7.2)   │     │   (Future 7.2)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │           MasterworkService (masterwork.service.ts)           │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ • determineQuality()      - Quality calculation        │  │  │
│  │  │ • createCraftedItem()     - Create with quality        │  │  │
│  │  │ • generateSpecialEffects()- Effect selection           │  │  │
│  │  │ • renameMasterwork()      - Custom naming              │  │  │
│  │  │ • calculateRepairCost()   - Repair pricing             │  │  │
│  │  │ • canRepair()             - Repair validation          │  │  │
│  │  │ • calculateEffectiveStats() - Stat calculation         │  │  │
│  │  │ • getQualityTier()        - Tier information           │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │    MODELS    │ │     DATA     │ │    UTILS     │
        └──────────────┘ └──────────────┘ └──────────────┘
                │              │               │
                ▼              ▼               ▼
    ┌───────────────────────────────────────────────────┐
    │           CraftedItem.model.ts                    │
    │  ┌─────────────────────────────────────────────┐ │
    │  │ Schema:                                     │ │
    │  │  • characterId (owner)                      │ │
    │  │  • baseItemId (reference)                   │ │
    │  │  • quality (enum)                           │ │
    │  │  • statMultiplier (1.75× max)               │ │
    │  │  • crafterId (crafter)                      │ │
    │  │  • customName (optional)                    │ │
    │  │  • specialEffects []                        │ │
    │  │  • durability {current, max}                │ │
    │  │  • qualityRoll (metadata)                   │ │
    │  │  • isEquipped, isBroken                     │ │
    │  │                                             │ │
    │  │ Methods:                                    │ │
    │  │  • applyDurabilityDamage()                  │ │
    │  │  • repair()                                 │ │
    │  │  • checkBreakage()                          │ │
    │  │  • toItemData()                             │ │
    │  │                                             │ │
    │  │ Statics:                                    │ │
    │  │  • findByCharacter()                        │ │
    │  │  • findMasterworks()                        │ │
    │  │  • findByCrafter()                          │ │
    │  └─────────────────────────────────────────────┘ │
    └───────────────────────────────────────────────────┘

    ┌───────────────────────────────────────────────────┐
    │           specialEffects.ts                       │
    │  ┌─────────────────────────────────────────────┐ │
    │  │ WEAPON_EFFECTS [10]                         │ │
    │  │  • Keen, Vicious, Swift, Draining...        │ │
    │  │                                             │ │
    │  │ ARMOR_EFFECTS [10]                          │ │
    │  │  • Resilient, Fortified, Evasive...         │ │
    │  │                                             │ │
    │  │ TOOL_EFFECTS [10]                           │ │
    │  │  • Efficient, Masterful, Durable...         │ │
    │  │                                             │ │
    │  │ Functions:                                  │ │
    │  │  • getEffectsByCategory()                   │ │
    │  │  • getRandomEffect()                        │ │
    │  │  • getRandomEffects()                       │ │
    │  │  • getEffectById()                          │ │
    │  └─────────────────────────────────────────────┘ │
    └───────────────────────────────────────────────────┘

    ┌───────────────────────────────────────────────────┐
    │           qualityTiers.ts                         │
    │  ┌─────────────────────────────────────────────┐ │
    │  │ QUALITY_TIERS                               │ │
    │  │  • Shoddy (75% stats, 80% dur)              │ │
    │  │  • Common (100%, 100%)                      │ │
    │  │  • Fine (115%, 120%)                        │ │
    │  │  • Superior (130%, 140%)                    │ │
    │  │  • Exceptional (150%, 160%, 0-1 FX)         │ │
    │  │  • Masterwork (175%, 200%, 1-2 FX)          │ │
    │  │                                             │ │
    │  │ QUALITY_THRESHOLDS                          │ │
    │  │  • Score ranges for each tier               │ │
    │  │                                             │ │
    │  │ BASE_DURABILITY                             │ │
    │  │  • By item type                             │ │
    │  │                                             │ │
    │  │ Functions:                                  │ │
    │  │  • getQualityTier()                         │ │
    │  │  • getQualityFromScore()                    │ │
    │  └─────────────────────────────────────────────┘ │
    └───────────────────────────────────────────────────┘

                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SHARED TYPES                                 │
│                   (shared/src/types/masterwork.types.ts)             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ • ItemQuality enum (6 tiers)                                  │  │
│  │ • SpecialEffectCategory enum (weapon/armor/tool)              │  │
│  │ • QualityTier interface (tier configuration)                  │  │
│  │ • SpecialEffect interface (effect properties)                 │  │
│  │ • QualityRoll interface (calculation breakdown)               │  │
│  │ • CraftingContext interface (input parameters)                │  │
│  │ • CraftedItemData interface (item data)                       │  │
│  │ • MaterialQuality, ToolQuality, FacilityBonus interfaces      │  │
│  │ • RepairContext, RenameContext interfaces                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Quality Determination Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    QUALITY DETERMINATION                          │
└──────────────────────────────────────────────────────────────────┘

INPUT: CraftingContext
  ├─ characterId, characterName
  ├─ skillLevel (e.g., 60)
  ├─ recipeLevel (e.g., 40)
  ├─ isSpecialized (true/false)
  ├─ materials[] (with quality bonuses)
  ├─ tool (with quality bonus)
  └─ facility (with quality bonus)

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  CALCULATE COMPONENTS                             │
└──────────────────────────────────────────────────────────────────┘

1. Base Chance = (skillLevel - recipeLevel) × 2
   Example: (60 - 40) × 2 = 40

2. Material Bonus = Σ(material.qualityBonus)
   Example: 15% + 15% = 30

3. Tool Bonus = tool.qualityBonus
   Example: 10%

4. Facility Bonus = facility.qualityBonus
   Example: 7%

5. Specialization Bonus = isSpecialized ? 10 : 0
   Example: 10%

6. Luck Roll = Random(-10, +10)
   Example: +5%

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  TOTAL SCORE                                      │
└──────────────────────────────────────────────────────────────────┘

Total = 40 + 30 + 10 + 7 + 10 + 5 = 102

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  MAP TO QUALITY TIER                              │
└──────────────────────────────────────────────────────────────────┘

Score 102 ≥ 95 → MASTERWORK

                    ▼

OUTPUT: QualityRoll
  ├─ baseChance: 40
  ├─ materialBonus: 30
  ├─ toolBonus: 10
  ├─ facilityBonus: 7
  ├─ specializationBonus: 10
  ├─ luckRoll: 5
  ├─ totalScore: 102
  ├─ finalQuality: 'masterwork'
  └─ breakdown: ["Base: 40%", "Materials: +30%", ...]
```

## Item Creation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    CREATE CRAFTED ITEM                            │
└──────────────────────────────────────────────────────────────────┘

INPUT:
  ├─ characterId (owner)
  ├─ baseItemId (e.g., 'revolver-base')
  ├─ qualityRoll (from determination)
  └─ context (crafting details)

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  FETCH BASE ITEM                                  │
└──────────────────────────────────────────────────────────────────┘

Item.findByItemId(baseItemId)
  ├─ name: "Revolver"
  ├─ type: 'weapon'
  ├─ rarity: 'rare'
  └─ baseStats: {combat: 10}

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  DETERMINE ITEM TYPE                              │
└──────────────────────────────────────────────────────────────────┘

baseItem.type === 'weapon' → itemType = 'weapon'

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  GENERATE SPECIAL EFFECTS                         │
└──────────────────────────────────────────────────────────────────┘

quality = MASTERWORK
  ├─ minEffects = 1
  ├─ maxEffects = 2
  └─ Random(1, 2) = 2 effects

getRandomEffects('weapon', 2)
  ├─ Effect 1: "Keen" (+10% crit)
  └─ Effect 2: "Swift" (+10% attack speed)

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  CALCULATE DURABILITY                             │
└──────────────────────────────────────────────────────────────────┘

1. Base = 150 (weapon)
2. Rarity = ×1.5 (rare)
3. Quality = ×2.0 (masterwork)
4. Effects = ×1.0 (no durability bonuses)

Final = 150 × 1.5 × 2.0 × 1.0 = 450

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  CREATE DATABASE RECORD                           │
└──────────────────────────────────────────────────────────────────┘

new CraftedItem({
  characterId,
  baseItemId: 'revolver-base',
  quality: 'masterwork',
  statMultiplier: 1.75,
  crafterId,
  crafterName: 'Sarah Ironhand',
  specialEffects: [keen, swift],
  durability: {current: 450, max: 450},
  qualityRoll,
  isEquipped: false,
  isBroken: false
})

                    ▼

OUTPUT: ICraftedItem (saved to database)
```

## Combat Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    COMBAT WITH CRAFTED ITEM                       │
└──────────────────────────────────────────────────────────────────┘

1. Character attacks with crafted weapon

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  LOAD EQUIPPED WEAPON                             │
└──────────────────────────────────────────────────────────────────┘

weapon = CraftedItem.findOne({
  characterId,
  isEquipped: true,
  baseItemId: /weapon/
})

weapon.quality = 'masterwork'
weapon.statMultiplier = 1.75
weapon.specialEffects = ['Keen', 'Swift']

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  CALCULATE BASE DAMAGE                            │
└──────────────────────────────────────────────────────────────────┘

baseWeaponDamage = 20
qualityModifier = 1.75 (masterwork)

damage = 20 × 1.75 = 35

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  APPLY SPECIAL EFFECTS                            │
└──────────────────────────────────────────────────────────────────┘

For each effect in weapon.specialEffects:

  "Keen": critChance += 10%
    ├─ Check: random(0,100) < critChance?
    └─ If yes: damage ×= 2

  "Swift": attackSpeed += 10%
    ├─ Already applied (turn order)
    └─ No damage modification

Final damage = 70 (if crit)

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  APPLY DURABILITY DAMAGE                          │
└──────────────────────────────────────────────────────────────────┘

baseDurabilityLoss = 2 (per combat)

weapon.applyDurabilityDamage(2)
  ├─ Check for durability loss reduction effects
  ├─ None found
  └─ durability.current -= 2

weapon.durability: 448/450

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  CHECK FOR BREAKAGE                               │
└──────────────────────────────────────────────────────────────────┘

weapon.checkBreakage()
  ├─ quality !== 'shoddy'
  └─ return false (masterwork never breaks)

                    ▼

OUTPUT: Combat complete, weapon still functional
```

## Repair System Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    REPAIR CRAFTED ITEM                            │
└──────────────────────────────────────────────────────────────────┘

INPUT:
  ├─ characterId
  ├─ itemId
  └─ repairPercentage (e.g., 50%)

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  VALIDATE REPAIR                                  │
└──────────────────────────────────────────────────────────────────┘

MasterworkService.canRepair(characterId, itemId)
  ├─ Character exists? ✓
  ├─ Item exists? ✓
  ├─ Character owns item? ✓
  ├─ Item needs repair? ✓
  └─ Character has Craft 10+? ✓

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  CALCULATE REPAIR COST                            │
└──────────────────────────────────────────────────────────────────┘

item.quality = 'masterwork'
baseGoldCost = 800g per 100%

For 50% repair:
  ├─ Gold: 800 × 0.5 = 400g
  └─ Materials: 3 iron ingots

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  DEDUCT COSTS                                     │
└──────────────────────────────────────────────────────────────────┘

character.gold -= 400
character.inventory.remove('iron-ingot', 3)

                    ▼

┌──────────────────────────────────────────────────────────────────┐
│                  APPLY REPAIR                                     │
└──────────────────────────────────────────────────────────────────┘

item.durability.current = 200/450 (44%)

repairAmount = 450 × 0.5 = 225

item.durability.current = min(450, 200 + 225) = 425

item.lastRepairedAt = new Date()
item.isBroken = false

                    ▼

OUTPUT: Item repaired to 94% durability
```

## Database Schema Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    CraftedItem Collection                         │
└──────────────────────────────────────────────────────────────────┘

_id: ObjectId("...")                    [Primary Key]
  ├─ Unique identifier
  └─ Auto-generated

characterId: ObjectId("...")            [Index, Foreign Key → Character]
  ├─ Who owns this item
  └─ Required

baseItemId: "revolver-base"             [Index, Foreign Key → Item]
  ├─ Reference to Item collection
  └─ Required

quality: "masterwork"                   [Index, Enum]
  ├─ One of 6 tiers
  └─ Default: "common"

statMultiplier: 1.75                    [Number]
  ├─ Applied to all stats
  └─ Range: 0.75 - 1.75

crafterId: ObjectId("...")              [Index, Foreign Key → Character]
  ├─ Who crafted this item
  └─ Required

crafterName: "Sarah Ironhand"           [String]
  ├─ Cached name for display
  └─ Required

customName: "Sarah's Mercy"             [String, Optional]
  ├─ Custom name (Masterwork only)
  └─ Max 50 chars

specialEffects: [                       [Array of Objects]
  {
    effectId: "keen",
    name: "Keen",
    description: "...",
    category: "weapon",
    criticalChanceBonus: 10
  },
  {
    effectId: "swift",
    name: "Swift",
    description: "...",
    category: "weapon",
    attackSpeedBonus: 10
  }
]

durability: {                           [Object]
  current: 450,                         [Number, ≥ 0]
  max: 450                              [Number, ≥ 1]
}

qualityRoll: {                          [Object, Optional]
  baseChance: 90,
  materialBonus: 40,
  toolBonus: 15,
  facilityBonus: 10,
  specializationBonus: 10,
  luckRoll: 9,
  totalScore: 174,
  finalQuality: "masterwork",
  breakdown: [...]
}

isEquipped: false                       [Boolean]
  ├─ Currently equipped?
  └─ Default: false

isBroken: false                         [Boolean, Index]
  ├─ Is item broken?
  └─ Default: false

createdAt: ISODate("2025-11-26...")     [Date, Auto]
updatedAt: ISODate("2025-11-26...")     [Date, Auto]
lastRepairedAt: ISODate("...")          [Date, Optional]


┌──────────────────────────────────────────────────────────────────┐
│                           INDEXES                                 │
└──────────────────────────────────────────────────────────────────┘

1. { characterId: 1 }                   Fast owner lookups
2. { baseItemId: 1 }                    Fast item type queries
3. { quality: 1 }                       Fast rarity queries
4. { crafterId: 1 }                     Fast crafter portfolio
5. { isBroken: 1 }                      Fast broken item queries
6. { characterId: 1, quality: 1 }       Owner + quality composite
7. { crafterId: 1, createdAt: -1 }      Crafter timeline
8. { quality: 1, createdAt: -1 }        Quality timeline
```

## File Dependencies

```
┌──────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY GRAPH                               │
└──────────────────────────────────────────────────────────────────┘

shared/src/types/masterwork.types.ts
  └─ (no dependencies - pure types)

server/src/data/qualityTiers.ts
  └─ ../../../shared/src/types/masterwork.types

server/src/data/specialEffects.ts
  └─ ../../../shared/src/types/masterwork.types

server/src/models/CraftedItem.model.ts
  ├─ mongoose
  └─ ../../../shared/src/types/masterwork.types

server/src/services/masterwork.service.ts
  ├─ ../../../shared/src/types/masterwork.types
  ├─ ../models/CraftedItem.model
  ├─ ../models/Character.model
  ├─ ../models/Item.model
  ├─ ../utils/errors
  ├─ ../utils/logger
  └─ ../data/specialEffects


┌──────────────────────────────────────────────────────────────────┐
│                    INTEGRATION POINTS                             │
└──────────────────────────────────────────────────────────────────┘

CraftingService
  └─ Uses MasterworkService.determineQuality()
  └─ Uses MasterworkService.createCraftedItem()

CombatService
  └─ Reads CraftedItem.specialEffects
  └─ Calls CraftedItem.applyDurabilityDamage()
  └─ Calls CraftedItem.checkBreakage()

InventoryService
  └─ Displays CraftedItem quality
  └─ Groups items by quality

CharacterController
  └─ Fetches CraftedItem.findByCharacter()
  └─ Displays crafter attribution

ShopService
  └─ Prices based on quality
  └─ Displays special effects
```

## Scaling Considerations

```
┌──────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATION                       │
└──────────────────────────────────────────────────────────────────┘

Query Optimization:
  ├─ Use .lean() for read-only queries
  ├─ Project only needed fields
  ├─ Utilize compound indexes
  └─ Paginate large results

Caching:
  ├─ Quality tier definitions (static)
  ├─ Special effect definitions (static)
  ├─ Base item data (rarely changes)
  └─ Character equipped items (TTL cache)

Batch Operations:
  ├─ Bulk durability updates
  ├─ Batch repair processing
  └─ Periodic breakage checks

Background Jobs:
  ├─ Durability tick (if real-time)
  ├─ Broken item cleanup
  └─ Masterwork leaderboard updates


┌──────────────────────────────────────────────────────────────────┐
│                    STORAGE ESTIMATES                              │
└──────────────────────────────────────────────────────────────────┘

Per CraftedItem Document:
  ├─ Base fields: ~200 bytes
  ├─ Special effects: ~150 bytes each
  ├─ Quality roll data: ~100 bytes
  └─ Total: ~500 bytes average

For 10,000 items: ~5 MB
For 100,000 items: ~50 MB
For 1,000,000 items: ~500 MB

Indexes add ~20% overhead
Total with indexes: ~600 MB for 1M items

Expected per active player: 20-50 crafted items
Expected 1000 active players: 20,000-50,000 items
Storage: 10-25 MB
```

---

**Architecture Status**: ✅ COMPLETE
**Integration Ready**: ✅ YES
**Scalable**: ✅ YES
**Type-Safe**: ✅ YES

*Phase 7, Wave 7.1 - Desperados Destiny*
