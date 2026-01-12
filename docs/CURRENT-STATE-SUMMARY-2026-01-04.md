# Desperados Destiny - Current State Summary

**Date:** January 4, 2026
**Purpose:** Snapshot of system state after major refactoring work

---

## Executive Summary

Desperados Destiny has undergone significant content and system expansion. The game has evolved from a well-architected but content-sparse prototype to a feature-rich system with competitive depth.

### Key Metrics

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Trainable Skills | 26 | 30 | +15% |
| Crafting Recipes | 45 | 588 | +1,207% |
| Professions | 6 | 11 | +83% |
| Crafting Facilities | 0 | 41 | New |
| Gathering Nodes | 6 | 24 | +300% |
| Map Locations | ~40 | 33 (with positions) | Refined |

---

## Skills System (30 Total)

### Distribution by Category

| Category | Count | Skills |
|----------|-------|--------|
| **Combat** | 5 | Melee Combat, Ranged Combat, Defensive Tactics, Mounted Combat, Explosives |
| **Cunning** | 8 | Lockpicking, Stealth, Pickpocket, Tracking, Deception, Gambling, Duel Instinct, Sleight of Hand |
| **Spirit** | 6 | Medicine, Persuasion, Animal Handling, Leadership, Ritual Knowledge, Performance |
| **Craft** | 11 | Blacksmithing, Leatherworking, Cooking, Alchemy, Gunsmithing, Tailoring, Native Crafts, Prospecting, Woodworking, Trapping, Engineering |

### Key Changes
- Added 4 new craft skills: Tailoring, Native Crafts, Trapping (new professions)
- Renamed: Mining → Prospecting, Carpentry → Woodworking
- Engineering remains as utility skill (no matching profession)
- 38 training activities available

### Key Files
- `shared/src/constants/skills.constants.ts`
- `shared/src/constants/skillTraining.constants.ts`
- `server/src/services/skillTraining.service.ts`

---

## Crafting System (588 Recipes)

### Recipes by Profession

| Profession | Count | Key Outputs |
|------------|-------|-------------|
| Alchemy | 70 | Tonics, elixirs, poisons, oils |
| Blacksmithing | 65 | Weapons, tools, metal components |
| Cooking | 65 | Meals, preserved foods, drinks |
| Gunsmithing | 62 | Firearms, ammunition, upgrades |
| Leatherworking | 60 | Armor, saddles, bags |
| Native Crafts | 60 | Traditional items, remedies |
| Tailoring | 58 | Clothing, cloth armor |
| Woodworking | 48 | Furniture, tool handles |
| Prospecting | 48 | Refined ores, gems |
| Trapping | 46 | Trap components, furs |
| Leadership | 46 | Gang equipment, tactical gear |

### Skill Tier Distribution

| Tier | Level Range | Recipes |
|------|-------------|---------|
| Novice | 1-15 | ~180 |
| Apprentice | 16-30 | ~150 |
| Journeyman | 31-50 | ~130 |
| Expert | 51-70 | ~80 |
| Master | 71-90 | ~35 |
| Grandmaster | 91-100 | ~13 |

### Key Files
- `server/src/data/recipes/*.ts` (11 files)
- `shared/src/types/crafting.types.ts`
- `server/src/services/crafting.service.ts`

---

## Location System (33 Locations)

### Locations with Crafting Facilities (8)

| Location | Facilities |
|----------|-----------|
| Red Gulch | FORGE, ANVIL, GUN_LATHE, SEWING_TABLE, STOVE, LEATHER_WORKBENCH |
| The Frontera | DISTILLERY, CAULDRON, LEATHER_WORKBENCH |
| Kaiowa Mesa | MEDICINE_LODGE, CRAFT_CIRCLE, TANNING_RACK, LEATHER_WORKBENCH |
| Fort Ashford | GUN_LATHE, COMMAND_TENT, WAR_ROOM, FORGE |
| Goldfinger's Mine | ASSAY_TABLE, ORE_REFINERY, BLAST_FURNACE, FORGE |
| Longhorn Ranch | TANNING_RACK, SKINNING_RACK, STOVE, SMOKER, SAWMILL |
| Whiskey Bend | STOVE, DISTILLERY, SMOKER |
| Spirit Springs | CAULDRON, MEDICINE_LODGE |

### Interactive Travel Map

**Component:** `client/src/components/travel/TravelMap.tsx`

Features:
- SVG-based visual map
- All 33 locations with x,y coordinates
- Zone boundaries with color coding
- Energy cost display on connections
- Current location highlight
- Hover tooltips with zone/danger info

### Key Files
- `server/src/seeds/locations.seed.ts`
- `server/src/data/locations/frontier_locations.ts`
- `client/src/components/travel/TravelMap.tsx`

---

## Gathering System (24 Nodes)

### Node Types

| Type | Examples | Locations |
|------|----------|-----------|
| Mining | Iron Vein, Copper Vein | Mines, canyons |
| Herbalism | Wild Herbs, Sacred Sage | Mesa, springs |
| Woodcutting | Cottonwood, Juniper | Creek, forests |
| Foraging | Various | Wilderness |
| Hunting | Game Trail | Canyon, trail |
| Fishing | Fishing Hole | Creek, springs |

### Key Files
- `server/src/data/gatheringNodes.ts`
- `shared/src/types/location.types.ts` (LocationGatheringNode)

---

## Documentation Updated

### Comparison Documents
- `docs/crafting-vs-eve-online-brutal-analysis.md` - Updated with 588 recipes, grade B+
- `docs/inspiration-comparison-v1.md` - Updated with 30 skills, 11 professions
- `docs/inspiration-comparison-critical-analysis.md` - Updated grades and progress

### RAG Context Files
- `.claude/rag/00-PROJECT-OVERVIEW.md` - Updated statistics
- `.claude/rag/01-CHARACTER-PROGRESSION.md` - Updated to 30 skills
- `.claude/rag/04-ECONOMY-SYSTEM.md` - Added crafting section
- `.claude/rag/05-WORLD-GEOGRAPHY.md` - Added travel map and crafting facilities

---

## Outstanding Work

### High Priority (Game-Breaking Gaps)
1. **Territory Warfare** - Conquest mechanics not implemented
2. **Offline Progression** - No Therian-style task queue
3. **Gang Activities** - No organized crimes, heists, raids

### Medium Priority (Competitive Gaps)
4. Crime variety - Need 20+ more crime types
5. Random encounters - Need 50+ travel encounter types
6. Recipe discovery - Hook up discovery mechanic

### Low Priority (Polish)
7. Deck UI animation
8. Horse system depth
9. NPC schedules

---

## Comparison to Inspirations

| System | vs Torn | vs Therian Saga | vs AAA | Status |
|--------|---------|-----------------|--------|--------|
| Crafting | BETTER | COMPARABLE | BETTER | Strong |
| Skills | BETTER | BETTER | BETTER | Strong |
| Travel Map | SIMILAR | BETTER | BETTER | Strong |
| Gang Activities | WORSE | N/A | WORSE | Gap |
| Territory War | MUCH WORSE | N/A | N/A | Critical Gap |
| Offline Progression | WORSE | WORSE | SIMILAR | Gap |

---

## Verification

All statistics verified via codebase audit on January 4, 2026:
- Recipe counts verified by parsing 11 recipe files
- Skill counts verified from skills.constants.ts
- Facility counts verified from locations.seed.ts
- Node counts verified from gatheringNodes.ts

---

*Document generated after comprehensive codebase review and documentation update.*
