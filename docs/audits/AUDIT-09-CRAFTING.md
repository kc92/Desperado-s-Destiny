# AUDIT REPORT #09: CRAFTING & WORKSHOP SYSTEMS

**Date:** 2025-12-15
**Auditor:** Claude (Sonnet 4.5)
**System:** Desperados Destiny - Crafting, Masterwork, Workshop & Harvesting
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## EXECUTIVE SUMMARY

The crafting system shows **two parallel implementations** that are incompatible and will cause significant production issues. There's a well-designed profession-based system (Phase 7) and a simpler recipe-based system that operate independently. The masterwork system is well-implemented but disconnected from crafting. Workshop system is solid but isolated. Harvesting is well-implemented but only works for hunting.

**Overall Grade: C- (Functional but fragmented)**

### Critical Issues Found
- 🔴 **Dual Implementation Conflict** - Two incompatible crafting systems
- 🔴 **No Inventory Validation** - Materials not checked before crafting
- 🔴 **Missing Integration** - Masterwork/Workshop/Crafting all disconnected
- 🟠 **Missing Profession Data** - recipes_new.ts file doesn't exist
- 🟠 **Incomplete Material System** - No actual material items or checking

---

## SYSTEM 1: CORE CRAFTING SERVICE

### File Analysis
**Location:** `server/src/services/crafting.service.ts` (900 lines)

### ✅ WHAT IT DOES RIGHT

1. **Dual Implementation Support (Lines 172-445)**
   - Clever overloading for backward compatibility
   - Supports both simple string-based and complex object-based crafting
   - Type-safe with proper TypeScript signatures

2. **XP Calculation System (Lines 553-614)**
   ```typescript
   calculateXP(profile, recipe, currentLevel, toolQuality) {
     // Difficulty-based modifiers
     const levelDiff = recipe.difficulty - currentLevel;
     // Green/yellow/orange/gray system
     // Specialization bonuses
     // Tool quality bonuses
   }
   ```
   - Well-thought-out difficulty scaling
   - Encourages crafting appropriate-level recipes
   - Prevents power-leveling with trivial recipes

3. **Quality Determination (Lines 619-709)**
   - Multi-factor quality calculation
   - Skill, stats, tools, facilities all considered
   - Critical success mechanic adds excitement
   - Transparent calculations with QualityCalculation response

4. **Profession Progression Integration**
   - Automatic level-up detection (Lines 428-438)
   - Tier advancement tracking
   - XP-to-next-level calculations
   - First/last crafted date tracking

5. **Tool Quality Modifiers (Lines 718-755)**
   - Speed multipliers (1.0x to 3.0x)
   - XP multipliers (1.0x to 1.3x)
   - Quality bonuses (0 to 300 points)
   - Balanced progression

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: No Material Validation (Lines 125-126, 149, 152, 854-855)

```typescript
// Line 125-126
// Check materials (simplified - would check inventory in real implementation)
validation.requirements.hasMaterials = true; // Assume true for now

// Line 854-855
// TODO: Check materials in inventory
// For now, assume materials are available
```

**Impact:** Players can craft without having materials. Dupe exploit ready to happen.

#### 🔴 CRITICAL: Dual Implementation Confusion (Lines 172-445)

The `craftItem` method has TWO completely different implementations:

**Implementation 1: Database Recipe System** (Lines 189-266)
- Uses Recipe model from database
- Simple recipeId string lookup
- Basic inventory manipulation
- Fixed quality output ("common")

**Implementation 2: CraftingRecipe System** (Lines 268-444)
- Uses CraftingRecipe from shared types
- Complex profession-based system
- Quality calculation
- XP and leveling

**Problem:** These are incompatible. The controller only calls Implementation 1 (simple version), making all the advanced features unreachable.

#### 🔴 CRITICAL: Inventory Race Conditions (Lines 230-239, 315-325)

```typescript
// Deduct materials from inventory
for (const ingredient of recipeDoc.ingredients) {
  const inventoryItem = character.inventory.find(i => i.itemId === ingredient.itemId);
  if (inventoryItem) {
    inventoryItem.quantity -= ingredient.quantity;
    if (inventoryItem.quantity <= 0) {
      character.inventory = character.inventory.filter(i => i.itemId !== ingredient.itemId);
    }
  }
}
```

**Issues:**
- No transaction isolation
- Multiple deductions can happen simultaneously
- Can result in negative quantities
- No rollback on failure

#### 🟠 HIGH: Missing Recipe Learning Cost (Lines 484-486)

```typescript
// Check cost (simplified - would deduct gold in real implementation)
if (recipe.learningCost && recipe.learningCost > 0) {
  // Would check and deduct gold here
}
```

**Impact:** Free recipe learning. No gold economy for crafting knowledge.

#### 🟠 HIGH: Missing Facility Cost (Lines 483-486 in learnRecipe)

Facilities are checked but never cost gold or require acquisition. Profile methods reference facilities but there's no way to obtain them.

#### 🟡 MEDIUM: Inefficient Database Queries

```typescript
// Line 800: Loads ALL recipes every time
const recipes = await Recipe.find({ isUnlocked: true });

// Multiple character lookups without caching
const character = await Character.findById(characterId); // Line 92, 192, 292
```

#### 🟡 MEDIUM: Inconsistent Error Handling

- Some methods return error objects: `{ canCraft: false, reason: 'error' }`
- Others throw exceptions
- No consistent error typing

#### 🟡 MEDIUM: Missing Batch Crafting

The `quantity` parameter is passed but:
- Line 345: Items are created in a loop (inefficient)
- Line 366: XP is multiplied by quantity but items aren't
- Inconsistent handling of batch operations

### 🔍 LOGICAL GAPS

1. **No Maximum Crafting Level Check**
   - Level 100 cap exists but no enforcement
   - Can theoretically craft at level 101+

2. **Critical Chance Not Used Consistently**
   - Calculated in quality determination (Line 657)
   - Set in response (Line 388) but not actually applied to quality
   - Two separate critical systems (quality and stats)

3. **Specialization Validation Missing**
   - Can set specializations without requirements
   - No limit enforcement (should be max 2)
   - Slot parameter (0 | 1) not validated

4. **Recipe Discovery System Stubbed** (Lines 872-896)
   ```typescript
   static async attemptRecipeDiscovery(...): Promise<RecipeDiscovery | null> {
     // This would check for discoverable recipes and roll for discovery
     // Placeholder implementation
     return null;
   }
   ```

5. **Session Management Incomplete**
   - `startCraftingSession` and `completeCraftingSession` exist in profile
   - Never called by crafting service
   - No time-based crafting implementation

### 📋 INCOMPLETE IMPLEMENTATIONS

1. **Line 799-801: TODO Comment**
   ```typescript
   // TODO: Filter by character's skill levels and unlocked recipes
   const recipes = await Recipe.find({ isUnlocked: true });
   ```

2. **Missing Profession Starter Recipes**
   - No automatic recipe unlock when learning profession
   - Players start with zero recipes

3. **No Crafting Stations/Location Validation**
   - getCraftingStations returns placeholder (controller line 226)
   - "Location-based station filtering coming soon"

4. **Recipe Requirements Not Enforced**
   - facility.optional flag exists but optional facilities still give bonuses
   - No penalty for missing optional facilities

---

## SYSTEM 2: CRAFTED ITEM MODEL

### File Analysis
**Location:** `server/src/models/CraftedItem.model.ts` (302 lines)

### ✅ WHAT IT DOES RIGHT

1. **Comprehensive Item Tracking**
   - Quality tier with stat multipliers
   - Crafter attribution (reputation system ready)
   - Special effects array
   - Durability system with current/max
   - Quality roll transparency (breakdown array)

2. **Durability System (Lines 198-236)**
   ```typescript
   applyDurabilityDamage(damage: number): Promise<void> {
     // Apply durability loss reduction from special effects
     let actualDamage = damage;
     for (const effect of this.specialEffects) {
       if (effect.durabilityLossReduction) {
         actualDamage *= 1 - effect.durabilityLossReduction / 100;
       }
     }
     this.durability.current = Math.max(0, this.durability.current - actualDamage);
     if (this.durability.current === 0) {
       this.isBroken = true;
     }
   }
   ```
   - Proper special effect application
   - Broken state tracking
   - Repair tracking (lastRepairedAt)

3. **Shoddy Quality Breakage (Lines 241-252)**
   - Low-quality items can break randomly
   - Chance increases as durability decreases
   - Adds risk/reward to cheap items

4. **Special Effects Schema (Lines 116-147)**
   - Extensive effect property support
   - Category-based organization
   - Both flat and percentage bonuses

5. **Good Indexing Strategy**
   - Compound indexes for common queries
   - Character + quality index for inventory filtering
   - Crafter + date for portfolio viewing

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Completely Disconnected from Crafting

**Problem:** CraftedItem model is NEVER created by CraftingService.

```typescript
// CraftingService creates simple inventory items (Line 246-250)
character.inventory.push({
  itemId: recipeDoc.output.itemId,
  quantity: recipeDoc.output.quantity,
  acquiredAt: new Date()
});

// Should create CraftedItem with quality, effects, etc.
// But doesn't. Dead model.
```

**Impact:** All the masterwork features are unreachable. Quality system doesn't work.

#### 🟠 HIGH: No Ownership Validation

```typescript
// Line 489: Anyone can check if they own an item
if (item.characterId.toString() !== characterId) {
  return { canRepair: false, reason: 'You do not own this item' };
}
```

But:
- No method to transfer ownership
- No selling/trading support
- No gang shared items

#### 🟡 MEDIUM: Repair Cost Not Actually Charged

Line 498-501 checks craft skill but doesn't check/deduct gold for repair costs.

#### 🟡 MEDIUM: Special Effects Not Validated

- No validation that effects match item type
- Can theoretically have weapon effects on armor
- Effect limits (min/max) not enforced

### 🔍 LOGICAL GAPS

1. **No Equipment Integration**
   - isEquipped flag exists
   - No method to equip/unequip
   - No link to Character equipment slots

2. **Custom Names for Masterwork**
   - Stored in customName field
   - But Line 113: maxlength: 50, no profanity filter
   - No name uniqueness checking

3. **Quality Roll Stored But Not Used**
   - qualityRoll breakdown is informational only
   - Can't recalculate or verify
   - Takes up database space

---

## SYSTEM 3: MASTERWORK SERVICE

### File Analysis
**Location:** `server/src/services/masterwork.service.ts` (506 lines)

### ✅ WHAT IT DOES RIGHT

1. **Quality System is Excellent (Lines 111-172)**
   ```typescript
   determineQuality(context: CraftingContext): QualityRoll {
     // 1. BASE CHANCE: (Skill Level - Recipe Level) * 2%
     const skillDifference = context.skillLevel - context.recipeLevel;
     const baseChance = skillDifference * 2;

     // 2-5. Various bonuses
     const materialBonus = ...
     const toolBonus = ...
     const facilityBonus = ...
     const specializationBonus = ...

     // 6. LUCK ROLL: Random factor ±10%
     const luckRoll = (SecureRNG.chance(1) * 20) - 10;
   }
   ```

   **Why This is Great:**
   - Skill matters most (base chance)
   - Multiple progression paths (materials, tools, facilities)
   - Random factor prevents perfect prediction
   - Transparent breakdown for players

2. **Quality Tiers Well Balanced (Lines 26-93)**
   - Shoddy: 0.75x stats, can break (punishing)
   - Common: 1.0x baseline
   - Fine: 1.15x (+15%)
   - Superior: 1.3x (+30%)
   - Exceptional: 1.5x (+50%, 0-1 effects)
   - Masterwork: 1.75x (+75%, 1-2 effects, renameable)

3. **Special Effect Generation (Lines 196-240)**
   - Category-based (weapon/armor/tool)
   - Random count based on quality
   - Uses SecureRNG for fairness

4. **Complete Item Creation (Lines 244-342)**
   - Calculates base durability from item type
   - Applies rarity multiplier
   - Applies quality multiplier
   - Applies effect bonuses
   - Creates full CraftedItem document

5. **Rename Validation (Lines 347-378)**
   - Ownership check
   - Quality check (masterwork only)
   - Crafter check (only crafter can rename)
   - Length validation

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Never Called by Crafting System

**The entire masterwork system is orphaned.**

```typescript
// CraftingService should call MasterworkService.determineQuality()
// But it doesn't. It has its own quality calculation.

// MasterworkService.createCraftedItem() is never invoked
// CraftingService just adds to inventory directly
```

**Impact:** 500 lines of quality code that never runs.

#### 🟠 HIGH: Item Type Determination Fragile (Lines 261-268)

```typescript
let itemType: 'weapon' | 'armor' | 'tool';
if (baseItem.type === 'weapon') {
  itemType = 'weapon';
} else if (baseItem.type === 'armor') {
  itemType = 'armor';
} else {
  itemType = 'tool';  // Everything else is a tool?
}
```

**Problem:** Consumables, quest items, mounts all become "tools" and get tool effects.

#### 🟠 HIGH: Repair Cost Calculation But No Execution (Lines 429-470)

calculateRepairCost returns gold and materials needed, but:
- No method to actually perform repair
- No deduction happens
- Just informational

#### 🟡 MEDIUM: Quality Thresholds Hardcoded (Lines 98-105)

```typescript
const QUALITY_THRESHOLDS: QualityThresholds = {
  [ItemQuality.SHODDY]: -Infinity,
  [ItemQuality.COMMON]: 0,
  [ItemQuality.FINE]: 30,
  [ItemQuality.SUPERIOR]: 60,
  [ItemQuality.EXCEPTIONAL]: 85,
  [ItemQuality.MASTERWORK]: 95
};
```

**Issues:**
- No way to adjust for game balance
- Should be in configuration
- Can't tune for different item types

#### 🟡 MEDIUM: Effective Stats Calculation Unused (Lines 397-424)

calculateEffectiveStats is a pure function but never called by any system.

### 🔍 LOGICAL GAPS

1. **Facility Bonus is Always 0**
   - Line 127: `const facilityBonus = context.facility?.qualityBonus || 0;`
   - But context.facility is optional and often undefined
   - Facilities don't provide bonus in practice

2. **Luck Roll Can Make Masterwork Impossible**
   - Line 132: luckRoll can be -10
   - If total score is 94.5, bad luck makes it 84.5 (Exceptional not Masterwork)
   - Should use luck for exceeding threshold, not for total

3. **No Failure State**
   - Minimum quality is Shoddy
   - Can never completely fail to craft
   - Could add "Destroyed" outcome for very low rolls

4. **Repair Skill Check Hardcoded**
   - Line 499: Requires 'craft' skill level 10
   - Should vary by item quality/tier
   - Masterwork items should need master crafters

---

## SYSTEM 4: WORKSHOP SERVICE

### File Analysis
**Location:** `server/src/services/workshop.service.ts` (558 lines)

### ✅ WHAT IT DOES RIGHT

1. **Access Validation Comprehensive (Lines 32-117)**
   - Level requirements
   - Reputation requirements
   - Faction membership
   - Quest completion
   - Gold requirements
   - Item requirements
   - Operating hours check

2. **Multiple Access Models (Lines 145-240)**
   - Hourly rental
   - Daily membership
   - Weekly membership
   - Monthly membership
   - Yearly membership
   - One-time gold cost

3. **Session Management (Lines 398-444)**
   - Active session tracking
   - Membership expiration
   - Time-based rentals
   - Facility usage tracking

4. **Query Functions Well Designed (Lines 269-389)**
   - Find by profession
   - Find by location
   - Find by tier
   - Find by accessibility
   - Get best workshop for character
   - Get recommendations

5. **Workshop Data Rich (workshops.ts)**
   - 8 detailed workshops across 4 towns
   - Profession-specific facilities
   - Tier-based quality bonuses
   - Unique features per workshop
   - Restriction system (criminal/legal)

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Not Integrated with Crafting

**Workshop service exists but crafting doesn't use it.**

```typescript
// CraftingService checks facilities (Line 129-145)
const facility = profile.getFacility(recipe.requirements.facility.type);

// But profile.facilities is empty - no way to populate it
// Workshop system tracks access but doesn't grant facilities
```

**Impact:** Workshops are cosmetic. Players pay for access but get nothing.

#### 🟠 HIGH: No Workshop Benefit Application

Workshop has qualityBonus and productionSpeedBonus but:
- Never passed to crafting context
- Never applied to calculations
- Just stored data

#### 🟠 HIGH: Multiple Workshop Definitions

Two separate workshop type systems:

**System 1: properties/workshops.ts**
- UrbanWorkshop type
- 8 specific workshop instances
- Property-focused (pricing, size, workers)

**System 2: WorkshopBuilding (referenced in service)**
- Different structure
- Different data shape
- Incompatible types

**Problem:** Code imports from wrong source, types don't match.

#### 🟡 MEDIUM: Operating Hours Not Game-Time

```typescript
// Line 124: Uses real-world time
currentHour: number = new Date().getHours()
```

Should use game time system, not server time.

#### 🟡 MEDIUM: Membership Expiration Calculation Flawed

```typescript
// Lines 245-260
switch (type) {
  case 'daily':
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // ...
}
```

**Issues:**
- Real-time, not game-time
- No consideration of offline time
- Could buy daily pass and server restarts = lost time

### 🔍 LOGICAL GAPS

1. **Workshop Capacity Unused**
   - ALL_WORKSHOPS have capacity property
   - No tracking of current users
   - No "workshop full" state

2. **Worker System Defined But Not Implemented**
   - maxWorkers, requiredRoles exist
   - No actual worker hiring/management
   - No benefit from having workers

3. **Commission Slots Unused**
   - commissionSlotsPerDay defined
   - No commission/order system
   - No NPC customers

4. **Special Features Are Flavor Text**
   - Each workshop has specialFeatures array
   - Not mechanically implemented
   - Just descriptions

5. **License Requirements Not Enforced**
   - ammunition_works requires "Federal firearms manufacturing license"
   - No way to obtain license
   - No actual enforcement

---

## SYSTEM 5: HARVESTING SERVICE

### File Analysis
**Location:** `server/src/services/harvesting.service.ts` (285 lines)

### ✅ WHAT IT DOES RIGHT

1. **Transaction Safety (Lines 32-33)**
   ```typescript
   const session = await mongoose.startSession();
   session.startTransaction();
   ```
   - Proper MongoDB sessions
   - Rollback on error (Lines 238-241)
   - Prevents item duplication

2. **Quality-Based Rewards (Lines 129-131)**
   - Uses shot placement from hunting
   - Skinning skill bonus
   - Quality multiplier affects value and XP

3. **Skill-Gated Resources (Lines 138-141)**
   ```typescript
   if (resource.skillRequirement && character.getSkillLevel('skinning') < resource.skillRequirement) {
     continue; // Skip this resource
   }
   ```
   - Higher skill = more resources available
   - Progression system

4. **Variable Quantities (Lines 149-151)**
   - Base quantity + variation
   - RNG makes harvesting interesting
   - Not perfectly predictable

5. **Proper Energy Deduction (Lines 182-183)**
   - Uses EnergyService
   - Tracks energy spent on trip

### ❌ WHAT'S WRONG

#### 🟠 HIGH: Hunting-Specific Only

**Title says "Harvesting Service" but it only harvests animals.**

- No plant harvesting
- No ore/mineral harvesting
- No wood/lumber harvesting
- Only works with HuntingTrip model

#### 🟡 MEDIUM: Success Chance Not Clearly Communicated

```typescript
// Line 144-145
const successRoll = SecureRNG.chance(1);
const adjustedChance = resource.successChance + (skinningBonus / 100);
```

**Problem:**
- If resource.successChance is 0.7 (70%)
- And skinningBonus is 20
- adjustedChance is 0.7 + 0.2 = 0.9 (90%)
- But if successChance is 1.0 and bonus is 50, it's 1.5 (150%?)
- Needs clamping to max 1.0

#### 🟡 MEDIUM: No Bulk Harvesting

- Can only harvest one animal at a time
- No "harvest all" for multiple kills
- Tedious if you kill 5 deer

#### 🟡 MEDIUM: Generic Message Generation (Lines 249-264)

Messages are quality-based but don't mention specific resources obtained. Could be more informative.

### 🔍 LOGICAL GAPS

1. **No Tool Quality Bonus**
   - Skinning knife quality should matter
   - Only skill bonus considered
   - Missing progression path

2. **No Weather/Time Effects**
   - Meat spoils in heat
   - Could add environmental factors
   - More realistic survival

3. **No Rare Resource Rolls**
   - All resources from animal are fixed
   - Could have rare/bonus items (pristine pelt, etc.)
   - No excitement factor

4. **Energy Cost Fixed**
   - Always HUNTING_CONSTANTS.HARVESTING_ENERGY
   - Should vary by animal size
   - Harvesting bear vs rabbit should differ

---

## SYSTEM 6: CRAFTING PROFILE MODEL

### File Analysis
**Location:** `server/src\models\CraftingProfile.model.ts` (545 lines)

### ✅ WHAT IT DOES RIGHT

1. **Complete Progression Tracking**
   - 6 professions with independent progress
   - XP, level, tier all tracked
   - Statistics (total crafts, criticals, masterworks)
   - Material usage tracking (Map<string, number>)

2. **Specialization System (Lines 355-377)**
   - Must be level 50+ to specialize
   - Max 2 specializations (validated)
   - Slot-based (can change)
   - Confirmation required to replace

3. **Auto-Leveling Implementation (Lines 403-438)**
   ```typescript
   addProfessionXP(professionId, xp) {
     profession.xp += xp;
     // Check for level ups
     while (profession.xp >= profession.xpToNextLevel && profession.level < 100) {
       profession.level += 1;
       profession.xpToNextLevel = calculateXPForLevel(profession.level);
       profession.tier = getTierForLevel(profession.level);
     }
   }
   ```
   - Handles multiple level-ups
   - Updates tier automatically
   - Level 100 cap enforced

4. **Good Data Normalization**
   - Professions use Map for O(1) lookup
   - Materials used tracked separately
   - Reputation separate from professions

5. **Facility Ownership (Lines 135-162)**
   - Tier system (1-5)
   - Location tracking
   - Condition/maintenance
   - Upgrades array

### ❌ WHAT'S WRONG

#### 🟠 HIGH: Facilities Have No Acquisition Method

Profile can store facilities but:
- No way to purchase them
- No way to build them
- Workshop access doesn't grant them
- `getFacility()` always returns null in practice

#### 🟠 HIGH: XP Formula Mismatch (Lines 518-521)

```typescript
function calculateXPForLevel(level: number): number {
  // Exponential curve: 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}
```

But CraftingService (Line 776) uses:
```typescript
return Math.floor(100 * Math.pow(level, 1.5) * multiplier);
```

**Different formulas!** Profile doesn't include tier multiplier.

**Result:** XP required is inconsistent between systems.

#### 🟡 MEDIUM: Active Crafting Session Unused

```typescript
// Lines 452-474: Session start/complete methods
activeCraftingSession?: IActiveCraftingSession;
```

**Problem:**
- Never used by CraftingService
- Time-based crafting not implemented
- Quality roll stored but not applied
- Dead feature

#### 🟡 MEDIUM: Recipe Learning Duplicates

```typescript
// Line 385-388
if (!this.unlockedRecipes.includes(recipeId)) {
  this.unlockedRecipes.push(recipeId);
}
```

**Issues:**
- Array scan is O(n)
- Should use Set
- Large recipe lists = slow
- No recipe organization (by profession, tier, etc.)

### 🔍 LOGICAL GAPS

1. **Reputation Tracking But No Effects**
   - `reputation: Map<string, number>` exists
   - No faction/guild system implemented
   - No reputation benefits

2. **Fastest Craft Tracking (Lines 245-249)**
   ```typescript
   fastestCraft?: {
     recipeId: string;
     timeInSeconds: number;
     date: Date;
   };
   ```
   - Tracked but never set
   - Time-based crafting doesn't exist
   - Dead stat

3. **Gold Earned/Spent Tracked (Lines 237-238)**
   - goldEarned and goldSpent exist
   - Never incremented by crafting
   - Should track selling crafted items

4. **Favorite Recipe Detection (Line 244)**
   - favoriteRecipe exists
   - Never calculated
   - Could be "most crafted recipe"

---

## INTEGRATION ANALYSIS

### The Disconnection Problem

```
┌─────────────────────┐
│  CraftingService    │ ──┐
│  (Simple Mode)      │   │
└─────────────────────┘   │
                          │
┌─────────────────────┐   │   ┌──────────────────┐
│ MasterworkService   │   ├──X│  CraftedItem     │
│  (Quality System)   │   │   │    Model         │
└─────────────────────┘   │   └──────────────────┘
                          │
┌─────────────────────┐   │
│  WorkshopService    │   │
│  (Access & Bonuses) │   │
└─────────────────────┘   │
                          │
┌─────────────────────┐   │
│  CraftingProfile    │ ──┘
│  (Progression)      │
└─────────────────────┘
```

**ALL SYSTEMS EXIST. NONE TALK TO EACH OTHER.**

### What Should Happen vs. What Happens

**SHOULD:**
1. Player enters workshop → WorkshopService grants access
2. Player selects recipe → CraftingService validates
3. Crafting starts → Creates session in CraftingProfile
4. Time passes → Session completes
5. Quality determined → MasterworkService.determineQuality()
6. Item created → MasterworkService.createCraftedItem()
7. XP awarded → CraftingProfile.addProfessionXP()
8. Stats updated → Profile saves

**ACTUALLY HAPPENS:**
1. Player selects recipe → CraftingService
2. Inventory items deducted (no validation)
3. Inventory items added (no quality)
4. Character saved
5. Done

**All other systems are bypassed.**

---

## RECIPE DATA ANALYSIS

### Recipe Model (Recipe.model.ts)

**Simple structure:**
- recipeId, name, description
- category: weapon/armor/consumable/ammo/material
- ingredients: itemId + quantity array
- output: itemId + quantity
- skillRequired: skillId + level
- craftTime, xpReward, isUnlocked

**Issues:**
1. No quality tier (always common)
2. No profession link
3. No difficulty rating
4. No tool requirements
5. No facility requirements
6. Skill system is vague (skillId is any string)

### recipes_new.ts - MISSING FILE

**File referenced but doesn't exist:**
```typescript
// crafting.service.ts Line 3
import { getRecipe } from '../data/recipes_new.ts';  // Not found!
```

**Impact:** Advanced recipe system is incomplete.

### Profession Definitions (professionDefinitions.ts)

**Excellent data:**
- 6 professions fully defined
- Bonuses per tier (Novice to Grandmaster)
- Facility requirements
- Material categories
- Trainer locations
- Primary stat mappings

**But:** No actual recipes defined for any profession.

---

## CRITICAL BUGS

### BUG #1: Material Dupe Exploit 🔴
**File:** crafting.service.ts
**Lines:** 220-228, 306-313

**Exploit:**
1. Start crafting item A (requires 10 iron)
2. Immediately start crafting item B (requires 10 iron)
3. Both check inventory (20 iron available)
4. Both proceed
5. Both deduct 10 iron (total: 20 deducted)
6. Both succeed
7. Player has 2 items from 20 iron, should only craft 1

**Fix Required:** Use MongoDB transactions or distributed locks.

### BUG #2: Negative Inventory Quantities 🔴
**File:** crafting.service.ts
**Line:** 234

```typescript
inventoryItem.quantity -= ingredient.quantity;
```

**No bounds checking.** If quantity goes negative:
- Item shows negative count
- Can sell infinite items
- Economy breaks

**Fix Required:** Add validation.

### BUG #3: XP Overflow at Level 100 🟡
**File:** CraftingProfile.model.ts
**Line:** 428

```typescript
while (profession.xp >= profession.xpToNextLevel && profession.level < 100) {
```

**Problem:** At level 100, xpToNextLevel is 0 (or error), but XP keeps accumulating. Wasted XP.

**Fix Required:** Cap XP accumulation or allow prestige.

### BUG #4: Success Chance Can Exceed 100% 🟡
**File:** harvesting.service.ts
**Line:** 145

```typescript
const adjustedChance = resource.successChance + (skinningBonus / 100);
```

If successChance is 0.9 and bonus is 50, adjusted is 1.4 (140%). RNG check always succeeds but logically wrong.

**Fix Required:** Clamp to Math.min(1.0, adjustedChance).

### BUG #5: Workshop Type Mismatch 🟠
**File:** workshop.service.ts
**Line:** 18

```typescript
import { getWorkshop } from '../data/workshops';
```

But workshops.ts exports `UrbanWorkshop` while service expects `WorkshopBuilding`.

**Result:** Runtime errors when accessing workshop properties.

---

## MISSING FEATURES

### From TODO Comments

1. **Material Validation** (crafting.service.ts:854)
   - Check inventory before crafting
   - Prevent crafting without materials

2. **Recipe Filtering** (crafting.service.ts:799)
   - Filter by skill levels
   - Filter by unlocked status
   - Proper access control

3. **Location-Based Stations** (crafting.controller.ts:226)
   - Workshops only at certain locations
   - Travel required for special crafting

### From Incomplete Systems

4. **Time-Based Crafting**
   - ActiveCraftingSession exists
   - startCraftingSession method exists
   - Never called, never used

5. **Recipe Discovery**
   - attemptRecipeDiscovery stubbed
   - Discovery chance fields exist
   - No implementation

6. **Workshop Commission System**
   - commissionSlotsPerDay defined
   - No NPC order system
   - No commission tracking

7. **Facility Ownership/Purchase**
   - Facilities tracked in profile
   - No way to acquire
   - No purchase mechanic

8. **Worker Hiring/Management**
   - Worker roles defined
   - maxWorkers, requiredRoles exist
   - No hiring system

9. **Repair System**
   - calculateRepairCost exists
   - canRepair checks implemented
   - No actual repair execution

10. **Material Items**
    - Recipes reference materials
    - No material item definitions
    - No gathering system (except hunting)

---

## RECOMMENDATIONS

### Priority 1: Critical Fixes (Do Immediately) 🔴

1. **Fix Material Validation**
   ```typescript
   // Add to validateCrafting
   for (const material of recipe.materials) {
     const totalNeeded = material.quantity * quantity;
     const inventoryItem = character.inventory.find(i => i.itemId === material.materialId);
     if (!inventoryItem || inventoryItem.quantity < totalNeeded) {
       validation.errors.push(`Insufficient ${material.materialId}: need ${totalNeeded}, have ${inventoryItem?.quantity || 0}`);
       validation.canCraft = false;
       validation.requirements.hasMaterials = false;
     }
   }
   ```

2. **Add Transaction Safety to Crafting**
   ```typescript
   static async craftItem(...) {
     const session = await mongoose.startSession();
     session.startTransaction();
     try {
       // All database operations use session
       await character.save({ session });
       await profile.save({ session });
       await session.commitTransaction();
     } catch (error) {
       await session.abortTransaction();
       throw error;
     } finally {
       session.endSession();
     }
   }
   ```

3. **Integrate Masterwork into Crafting**
   ```typescript
   // Replace simple item creation with:
   const qualityRoll = MasterworkService.determineQuality(craftingContext);
   const craftedItem = await MasterworkService.createCraftedItem(
     characterId,
     recipe.output.itemId,
     qualityRoll,
     craftingContext
   );
   ```

4. **Fix XP Formula Consistency**
   Use same calculation in both services:
   ```typescript
   const tierDef = SKILL_TIERS.find(t => t.tier === profession.tier);
   const multiplier = tierDef?.xpMultiplier || 1.0;
   return Math.floor(100 * Math.pow(level, 1.5) * multiplier);
   ```

### Priority 2: High-Value Features (Do Soon) 🟠

5. **Connect Workshops to Crafting**
   - Workshop access grants facility usage
   - Apply workshop quality bonuses
   - Apply workshop speed bonuses
   - Check operating hours

6. **Implement Recipe Discovery**
   - Crafting gives chance to discover new recipes
   - Based on skill level
   - Add discovery message/notification

7. **Add Repair Execution**
   ```typescript
   static async repairItem(characterId, itemId, targetPercentage) {
     const cost = this.calculateRepairCost(item, targetPercentage);
     // Deduct gold
     // Deduct materials
     // Call item.repair(targetPercentage)
     // Return success
   }
   ```

8. **Create Material Items**
   - Define material item database
   - Link to recipes
   - Add to shop/loot tables

### Priority 3: Polish & Enhancement (Do Later) 🟡

9. **Implement Time-Based Crafting**
   - Long crafts (hours/days)
   - Queue system
   - Rush completion for gold

10. **Add Batch Crafting**
    - Craft multiple items efficiently
    - XP per item but only one transaction
    - Progress bar

11. **Workshop Commission System**
    - NPCs order items
    - Deadline system
    - Reputation rewards

12. **Facility Purchase System**
    - Buy/build facilities
    - Upgrade tiers
    - Maintenance costs

13. **Add Gathering for All Material Types**
    - Herbalism (plants)
    - Mining (ores)
    - Logging (wood)
    - Scavenging (parts)

---

## CODE QUALITY ASSESSMENT

### Strengths
- Clear separation of concerns
- Good use of TypeScript types
- Comprehensive data modeling
- SecureRNG for fairness
- Transaction safety in harvesting

### Weaknesses
- Duplicate implementations
- Missing integration points
- Inconsistent error handling
- TODO comments everywhere
- Dead code (unused methods)

### Technical Debt
- **High:** Two crafting systems need merging
- **High:** Model integration requires refactor
- **Medium:** Recipe data needs consolidation
- **Medium:** Inventory system needs strengthening
- **Low:** Code cleanup (remove unused methods)

---

## TESTING RECOMMENDATIONS

### Unit Tests Needed

1. **CraftingService**
   - Test XP calculation at various levels
   - Test quality determination
   - Test material validation
   - Test specialization bonuses

2. **MasterworkService**
   - Test quality tier boundaries
   - Test special effect generation
   - Test durability calculation
   - Test rename validation

3. **WorkshopService**
   - Test access validation
   - Test membership expiration
   - Test cost calculation
   - Test operating hours

4. **HarvestingService**
   - Test transaction rollback
   - Test quality multipliers
   - Test skill gating
   - Test success probability

### Integration Tests Needed

1. **Full Craft Flow**
   - Enter workshop
   - Select recipe
   - Check materials
   - Craft item
   - Receive quality item
   - Gain XP
   - Level up

2. **Material Flow**
   - Gather materials
   - Verify inventory
   - Craft item
   - Verify material deduction
   - Verify item creation

3. **Progression Flow**
   - Start at level 1
   - Craft items
   - Gain XP
   - Level to tier changes
   - Unlock specialization

### Exploit Tests Needed

1. **Dupe Prevention**
   - Simultaneous craft requests
   - Race condition testing
   - Transaction rollback

2. **Overflow Testing**
   - Level 100 XP gain
   - Max inventory quantity
   - Negative quantity prevention

3. **Access Control**
   - Craft without materials
   - Craft without skill
   - Use unavailable workshop

---

## PERFORMANCE CONCERNS

### Database Queries

**Problem Areas:**

1. **Line 800:** `Recipe.find({ isUnlocked: true })` loads ALL recipes
   - Could be 1000s of recipes
   - No pagination
   - No caching

2. **Multiple Character Lookups:**
   - findById called 3+ times per craft
   - Should cache in request scope
   - Wastes database connections

3. **Inventory Scanning:**
   - O(n) scan per material check
   - O(n) scan per material deduction
   - Should use Map for O(1)

**Recommendations:**
- Add Redis caching for recipes
- Implement request-scoped caching
- Index optimization on inventory queries
- Consider inventory as Map instead of Array

### Computational Complexity

**Quality Calculation:**
- Currently O(1) - Good
- Multiple RNG calls acceptable
- No loops or recursion

**XP Calculation:**
- O(1) math operations - Good
- While loop for leveling concerns:
  - Line 428: `while (profession.xp >= profession.xpToNextLevel)`
  - Could infinite loop if xpToNextLevel is 0
  - Add max iteration guard

---

## SECURITY CONCERNS

### Input Validation

**Missing Validation:**

1. **recipeId Injection**
   - Not validated before database query
   - Could be malicious string
   - Use allowlist or UUID validation

2. **Quantity Bounds**
   - No maximum quantity check
   - Could request craft 999999 items
   - Server CPU/memory attack

3. **characterId Tampering**
   - Passed from middleware
   - What if middleware bypassed?
   - Should re-validate in service

### Authorization

**Weaknesses:**

1. **No Workshop Access Enforcement**
   - Player could call craft without workshop
   - Access checked but not enforced
   - Should block at service layer

2. **Recipe Learning**
   - Free recipe learning (gold not deducted)
   - No quest/trainer requirement
   - Could learn all recipes instantly

3. **Masterwork Renaming**
   - Only crafter can rename (good)
   - But no profanity filter
   - Could rename to offensive text

### Rate Limiting

**Current:** 30 crafts/minute (routes.ts:26)

**Issues:**
- Should vary by craft time
- Masterwork crafts should cost more "rate"
- Batch crafting could bypass limit

---

## FINAL VERDICT

### System Grades

| System | Functionality | Integration | Code Quality | Grade |
|--------|--------------|-------------|--------------|-------|
| Core Crafting | ⚠️ Partial | ❌ Poor | ✅ Good | C |
| Masterwork | ✅ Complete | ❌ None | ✅ Excellent | B (unused) |
| Workshop | ✅ Complete | ❌ None | ✅ Good | B (isolated) |
| Harvesting | ✅ Complete | ✅ Good | ✅ Excellent | A- |
| Crafting Profile | ✅ Complete | ⚠️ Partial | ✅ Good | B |
| Crafted Item | ✅ Complete | ❌ None | ✅ Good | B (dead) |

### Overall: C- (Functional but Fragmented)

**Why C-?**
- Individual systems are well-coded
- But they don't work together
- Critical features missing (material validation)
- Serious exploits present (dupe bugs)
- Half-implemented (two crafting systems)

**Potential: A- (If Integrated)**
- All pieces exist
- Quality system is excellent
- Just needs connecting
- 1-2 sprints to production-ready

---

## APPENDIX: File Reference

### Core Files Analyzed
1. `server/src/services/crafting.service.ts` (900 lines)
2. `server/src/services/masterwork.service.ts` (506 lines)
3. `server/src/services/workshop.service.ts` (558 lines)
4. `server/src/services/harvesting.service.ts` (285 lines)
5. `server/src/models/CraftedItem.model.ts` (302 lines)
6. `server/src/models/CraftingProfile.model.ts` (545 lines)
7. `server/src/models/Recipe.model.ts` (88 lines)
8. `server/src/models/Item.model.ts` (190 lines)
9. `server/src/data/professionDefinitions.ts` (804 lines)
10. `server/src/data/properties/workshops.ts` (547 lines)
11. `server/src/data/specialEffects.ts` (310 lines)
12. `server/src/controllers/crafting.controller.ts` (237 lines)
13. `server/src/routes/crafting.routes.ts` (56 lines)

### Total Lines Analyzed: 5,328 lines

---

## ACTION ITEMS SUMMARY

**Immediate (Before Production):**
- [ ] Add material validation to crafting
- [ ] Implement transaction safety for crafts
- [ ] Fix XP formula consistency
- [ ] Add bounds checking on quantities
- [ ] Integrate masterwork into crafting flow

**Short Term (Sprint 1):**
- [ ] Connect workshops to crafting bonuses
- [ ] Implement repair execution
- [ ] Add recipe discovery
- [ ] Create material item database
- [ ] Add comprehensive error handling

**Medium Term (Sprint 2):**
- [ ] Implement time-based crafting
- [ ] Add batch crafting support
- [ ] Workshop commission system
- [ ] Facility purchase/upgrade
- [ ] Gathering for all material types

**Long Term (Future):**
- [ ] Merge dual crafting implementations
- [ ] Refactor for better integration
- [ ] Add advanced progression features
- [ ] Implement crafting achievements
- [ ] Add player marketplace for crafted items

---

**End of Audit Report**
