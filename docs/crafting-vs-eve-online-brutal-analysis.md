# Crafting System vs EVE Online - Honest Analysis

**Date:** January 2026 (Updated: January 4, 2026)
**Verdict:** Desperados Destiny's crafting has grown from skeleton to competitive indie system

---

## THE BRUTAL NUMBERS

### EVE Online's Industry System

| Category | Count | Notes |
|----------|-------|-------|
| **Ships** | ~420+ | All player-manufacturable |
| **Modules** | ~2,500+ | High slots, low slots, rigs, etc. |
| **Ammunition** | ~200+ | All sizes and factions |
| **Drones** | ~150+ | Combat, mining, utility |
| **Blueprints (BPOs)** | ~3,000+ | Tech I items alone |
| **Blueprint Copies (BPCs)** | ~1,500+ | Tech II, faction, storyline |
| **Raw Materials** | ~30+ | Minerals, planetary, gas |
| **Intermediate Components** | ~200+ | Reaction products, PI outputs |
| **Structures** | ~50+ | Citadels, engineering complexes |
| **TOTAL CRAFTABLE ITEMS** | **~8,000+** | Conservative estimate |

### Desperados Destiny's Crafting System

| Category | Count | Notes |
|----------|-------|-------|
| **Recipes (11 profession files)** | **588** | Distributed across all professions |
| **Professions** | **11** | Original 6 + Native Crafts, Prospecting, Woodworking, Trapping, Leadership |
| **Raw Materials** | **50+** | Ores, hides, herbs, woods, fibers |
| **Refined Materials** | **40+** | Ingots, leathers, cloths, oils |
| **Components** | **80+** | Blade blanks, barrels, assemblies |
| **Base Materials** | **100+** | Gathered resources |
| **Crafting Tools** | **55** | 11 professions × 5 quality tiers |
| **Crafting Facilities** | **41** | Across 8 locations |
| **Gathering Nodes** | **24** | 6 types across wilderness locations |
| **TOTAL CRAFTABLE ITEMS** | **588** | Full recipe system |
| **TOTAL MATERIALS** | **~270+** | Raw + refined + components |

---

## SCALE COMPARISON

```
EVE Online:     ████████████████████████████████████████ 8,000+ items
Desperados:     ███████ 588 recipes

EVE Online is ~14x larger in craftable content (down from 178x).
```

### Percentage Comparison

| Metric | EVE Online | Desperados | % of EVE | Previous |
|--------|------------|------------|----------|----------|
| Craftable items | 8,000+ | 588 | **7.4%** | 0.56% |
| Raw materials | 30+ | 50+ | **167%** | 13% |
| Components | 200+ | 80+ | **40%** | 7% |
| Total materials | 230+ | 270+ | **117%** | 23% |
| Professions | 15+ | 11 | **73%** | 40% |

**Progress:** Recipe count increased 13x since initial analysis (45 → 588).

---

## DEPTH ANALYSIS

### Production Chain Depth

**EVE Online:**
```
Mining → Reprocessing → Minerals (8 types)
                        ↓
                    Components (T1/T2)
                        ↓
                    Sub-assemblies
                        ↓
                    Final Item

Depth: 4-6 tiers
```

**Desperados Destiny:**
```
Gather Material → Craft Item

Sometimes:
Gather Material → Refine → Craft Item

Depth: 1-2 tiers
```

### Example Production Chains

**EVE: Building a Raven (Battleship)**
```
1. Mine Veldspar, Scordite, Pyroxeres, Plagioclase, Omber, Kernite, Jaspet
2. Reprocess into: Tritanium, Pyerite, Mexallon, Isogen, Nocxium, Zydrine, Megacyte
3. Manufacture components: Armor Plates, Capacitor Batteries, Graviton Reactors, etc.
4. Manufacture ship using 15+ different components
5. Total materials: ~30+ distinct items across 4 production tiers
```

**Desperados: Building a Rifle**
```
1. Get 7 metal-ingot, 3 tanned-hide, 5 gun-oil
2. Click craft
3. Done

Total materials: 3 items, 1 production tier
```

---

## ECONOMIC DEPTH

### EVE Online's Economy Features

| Feature | Present | Description |
|---------|---------|-------------|
| Regional price differences | ✅ | Prices vary by solar system |
| Market buy/sell orders | ✅ | Limit orders with duration |
| Manufacturing cost index | ✅ | More factories = higher costs |
| Material efficiency research | ✅ | Reduce input materials by 10% |
| Time efficiency research | ✅ | Reduce build time by 20% |
| Blueprint copying | ✅ | Duplicate BPOs for sale |
| Invention | ✅ | Create T2 BPCs from T1 |
| Reactions | ✅ | Chemical/gas processing |
| Planetary Interaction | ✅ | Extract resources from planets |
| Contract system | ✅ | Courier, auction, item exchange |
| Corporation manufacturing | ✅ | Shared facilities and blueprints |
| Player-owned structures | ✅ | Bonuses to manufacturing |
| Supply chains | ✅ | Complex interdependencies |

### Desperados Destiny's Economy Features

| Feature | Present | Description |
|---------|---------|-------------|
| Marketplace with auctions | ✅ | Working |
| Price history | ✅ | Working |
| Tax system | ✅ | Working |
| Material efficiency research | ❌ | Not implemented |
| Blueprint system | ❌ | Not implemented |
| Regional price differences | ❌ | Not implemented |
| Supply chains | ⚠️ | 1-2 tiers only |
| Corporation manufacturing | ⚠️ | Gang system exists, no shared crafting |
| Contract system | ❌ | Not implemented |
| Player-owned factories | ❌ | Properties exist but no manufacturing bonus |

---

## PROFESSION SYSTEM COMPARISON

### EVE Online Skills

| Aspect | EVE Online |
|--------|------------|
| Manufacturing skills | ~15+ (Industry, Mass Production, etc.) |
| Research skills | ~10+ (Metallurgy, Research, etc.) |
| Science skills | ~20+ (Required for T2) |
| Level cap | 5 per skill |
| Skill training | Real-time (days to months) |
| Total industry skill points | ~10 million SP possible |

### Desperados Destiny Professions

| Aspect | Desperados |
|--------|------------|
| Professions | 11 total |
| Original 6 | Blacksmithing, Leatherworking, Alchemy, Cooking, Tailoring, Gunsmithing |
| Added 5 | Native Crafts, Prospecting, Woodworking, Trapping, Leadership |
| Level cap | 100 |
| Specializations | 2 max |
| Skill tiers | 6 (Novice → Grandmaster) |
| Training | Instant on craft |
| Avg recipes/profession | ~53 |

**Current state:** The profession SYSTEM remains well-designed (crafting.types.ts is 492 LOC of types). With **588 recipes** across 11 professions averaging ~53 each, the Ferrari now has proper fuel in the tank.

---

## RECIPE BREAKDOWN BY PROFESSION

### Current Recipe Distribution (588 total)

| Profession | Recipe Count | Examples |
|------------|--------------|----------|
| **Alchemy** | 70 | Tonics, elixirs, poisons, oils, reagents |
| **Blacksmithing** | 65 | Weapons, tools, metal components, horseshoes |
| **Cooking** | 65 | Meals, preserved foods, trail rations, drinks |
| **Gunsmithing** | 62 | Firearms, ammunition, gun components, upgrades |
| **Leatherworking** | 60 | Armor, saddles, bags, straps, tanned goods |
| **Native Crafts** | 60 | Traditional items, ceremonial gear, natural remedies |
| **Tailoring** | 58 | Clothing, cloth armor, bandages, accessories |
| **Woodworking** | 48 | Furniture, tool handles, wagon parts, carvings |
| **Prospecting** | 48 | Refined ores, assayed materials, gem cutting |
| **Trapping** | 46 | Trap components, processed furs, bait |
| **Leadership** | 46 | Gang equipment, command items, tactical gear |

### Skill Tier Coverage

| Tier | Level Range | Recipes Available |
|------|-------------|-------------------|
| Novice | 1-15 | ~180 recipes |
| Apprentice | 16-30 | ~150 recipes |
| Journeyman | 31-50 | ~130 recipes |
| Expert | 51-70 | ~80 recipes |
| Master | 71-90 | ~35 recipes |
| Grandmaster | 91-100 | ~13 recipes |

### Gap Analysis vs EVE

| Category | EVE Has | Desperados Has | Status |
|----------|---------|----------------|--------|
| Tier progressions | 50+ variants | Progressive tiers per profession | ✅ Addressed |
| Profession-specific items | Hundreds per profession | ~53 per profession | ⚠️ Growing |
| Rare/unique craftables | Faction, T2, storyline | Quality tiers + discovery | ✅ Exists |
| Consumable variety | 200+ boosters/drugs | 70+ alchemy items | ⚠️ Reasonable |
| Armor variety | 500+ modules | 60+ leatherworking | ⚠️ Growing |
| Vehicle crafting | 420+ ships | 0 (mounts aren't crafted) | ❌ Not planned |

---

## WHAT THE CODE STRUCTURE PROMISES vs DELIVERS

### The Promise (crafting.types.ts)

```typescript
export enum ProfessionId {
  BLACKSMITHING = 'blacksmithing',
  LEATHERWORKING = 'leatherworking',
  ALCHEMY = 'alchemy',
  COOKING = 'cooking',
  TAILORING = 'tailoring',
  GUNSMITHING = 'gunsmithing',
  NATIVE_CRAFTS = 'native_crafts',   // NEW
  PROSPECTING = 'prospecting',       // NEW
  WOODWORKING = 'woodworking',       // NEW
  TRAPPING = 'trapping',             // NEW
  LEADERSHIP = 'leadership'          // NEW
}

export enum CraftingSkillTier {
  NOVICE = 'novice',           // 1-15
  APPRENTICE = 'apprentice',   // 16-30
  JOURNEYMAN = 'journeyman',   // 31-50
  EXPERT = 'expert',           // 51-70
  MASTER = 'master',           // 71-90
  GRANDMASTER = 'grandmaster'  // 91-100
}

// 18 facility types defined
// 20+ material categories defined
// 6 quality tiers defined
// Recipe discovery system defined
// Specialization system defined
```

### The Reality (11 recipe files)

```typescript
// 588 recipes total (up from 45)
// All 6 skill tiers have recipes
// Novice: 180+ recipes
// Apprentice: 150+ recipes
// Journeyman: 130+ recipes
// Expert: 80+ recipes
// Master: 35+ recipes
// Grandmaster: 13+ recipes
// 41 crafting facilities at 8 locations
// 24 gathering node definitions
// Location-aware crafting working
```

---

## UPDATED VERDICT

### System vs Content Score

| Aspect | Previous | Current | Notes |
|--------|----------|---------|-------|
| **Type System** | A | A | 492 LOC of well-designed types |
| **Service Logic** | A | A | 1,259 LOC of production-ready code |
| **Quality System** | A | A | Poor → Legendary tiers work |
| **Recipe Content** | F | B | 588 recipes across 11 professions |
| **Material Depth** | D | B | 270+ materials, multi-tier chains |
| **Progression Content** | F | B+ | Recipes through Grandmaster tier |
| **Facility Usage** | F | A- | 41 facilities at 8 locations |
| **Gathering System** | - | B | 24 node definitions, location-aware |
| **Overall** | **D+** | **B+** | System now has content to match |

### Progress Toward Targets

| Target | Needed | Current | Status |
|--------|--------|---------|--------|
| **Minimum Viable (Therian Saga)** | 200+ recipes | 588 | ✅ **EXCEEDED** |
| **Competitive (browser games)** | 500+ recipes | 588 | ✅ **MET** |
| **EVE-like depth** | 2,000+ recipes | 588 | 29% complete |

### Remaining Gap to EVE

| Metric | EVE Online | Desperados | Gap |
|--------|------------|------------|-----|
| Craftable items | 8,000+ | 588 | ~7,400 |
| Recipes per profession | ~500 | ~53 | ~450 each |
| Production tiers | 5 | 3 | 2 more |
| Player structures | ✅ | ❌ | Not planned |
| Regional markets | ✅ | ❌ | Single market |

### Realistic Next Steps

**Phase 1 - Content Expansion (Completed ✅):**
- ~~200+ recipes~~ → 588 achieved
- ~~All skill tiers~~ → Novice through Grandmaster
- ~~11 professions~~ → Done

**Phase 2 - Depth Expansion (In Progress):**
- Add 4-tier production chains
- Implement recipe discovery
- Add profession specializations with unique recipes
- Target: 800+ recipes

**Phase 3 - Economy Features (Future):**
- Regional price differences
- Corporation/gang shared crafting
- Blueprint/schematic system
- Target: 1,200+ recipes

---

## REMAINING RECOMMENDATIONS

### Priority 1: Deepen Material Chains ✅ PARTIALLY DONE

Current: Raw → Refined → Component → Item (3 tiers)
Needed: Add more 4-tier chains for high-end items

### Priority 2: Recipe Discovery System

The code supports but doesn't fully utilize:
- Recipe discovery mechanic (find recipes through exploration)
- Rare recipe drops from activities
- Reputation-locked recipes

### Priority 3: Specialization Content

Each profession supports specializations. Need:
- Unique recipes per specialization path
- Exclusive materials per spec
- Bonus synergies between specs

### Priority 4: Quality Tier Recipes

Add more recipes that specifically target:
- Legendary tier items (91-100)
- Master tier items (71-90)
- These are the thinnest tiers currently

---

## CONCLUSION

**Desperados Destiny has evolved from a skeleton to a competitive crafting system.**

The crafting service (1,259 LOC) and type system (492 LOC) remain production-quality. The profession structure, quality tiers, and progression curves are well-designed.

**What changed:**
- 45 recipes → **588 recipes** (13x increase)
- 6 professions → **11 professions** (83% increase)
- Recipes through level 25 → **Recipes through Grandmaster (100)**
- No facilities defined → **41 facilities at 8 locations**
- No gathering → **24 node definitions with location awareness**

**The system now has meaningful content.** While not at EVE's 8,000+ recipes, we've exceeded the "minimum viable" and "competitive browser game" targets. The crafting system is now a genuine gameplay feature rather than a placeholder.

**Next focus:** Depth over breadth - more complex production chains, recipe discovery, and specialization content.

---

## Sources

- [EVE University Wiki - Manufacturing](https://wiki.eveuniversity.org/Manufacturing)
- [EVE University Wiki - Static Data Export](https://wiki.eveuniversity.org/Static_Data_Export)
- [EVE Online Ships Database](https://www.eveonlineships.com)
- [Fuzzwork - Understanding the SDE](https://www.fuzzwork.co.uk/2021/07/17/understanding-the-eve-online-sde-1/)
- [CCP Developers - SDE](https://developers.eveonline.com/docs/resources/)
