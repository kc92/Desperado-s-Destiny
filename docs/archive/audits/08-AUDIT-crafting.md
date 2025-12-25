# Crafting System Audit Report

## Overview

The crafting system comprises three distinct but related subsystems:
1. **Crafting Service** - 6-profession skill-based crafting with quality mechanics
2. **Production Service** - Property-based mass production with workers
3. **Workshop Service** - Workshop access and facility management

**Audit Date:** 2025-12-14
**Overall Status:** Partially Implemented with Critical Gaps
**Risk Level:** HIGH - Material deduction issues, missing validation, incomplete implementations

---

## Files Analyzed

### Backend Services
- `server/src/services/crafting.service.ts` (~900 lines)
- `server/src/services/production.service.ts` (~500 lines)
- `server/src/services/workshop.service.ts` (~200 lines)

### Models
- `server/src/models/CraftedItem.model.ts`
- `server/src/models/CraftingProfile.model.ts`
- `server/src/models/ProductionSlot.model.ts`
- `server/src/models/Recipe.model.ts`

### Controllers
- `server/src/controllers/crafting.controller.ts`
- `server/src/controllers/workshop.controller.ts`

### Jobs
- `server/src/jobs/productionTick.job.ts`

### Types
- `shared/src/types/crafting.types.ts`

---

## What Works Well

### 1. Strong Type Definitions
- Comprehensive TypeScript interfaces for all crafting types
- Well-structured enums (ProfessionId, CraftingQuality, CraftingSkillTier)
- Complete type coverage for requests/responses

### 2. Profession System Architecture
**File:** `server/src/data/professionDefinitions.ts`
- All 6 professions fully defined (Blacksmithing, Leatherworking, Alchemy, Cooking, Tailoring, Gunsmithing)
- Complete skill tier progression (Novice → Grandmaster)
- Well-balanced XP multipliers (1.0 → 3.0)

### 3. Quality Calculation System
**File:** `crafting.service.ts:618-708`
- Sophisticated quality determination algorithm
- Multiple factors: skill level, character stats, tools, facilities, specialization
- Critical success chance implementation
- Quality tiers properly mapped to stat multipliers (0.6 → 1.5)

### 4. Production Service Implementation
**File:** `production.service.ts`
- **Transaction safety:** Uses MongoDB sessions for atomic operations
- **Worker management:** Proper worker assignment/unassignment logic
- **Time calculations:** Accurate production time with bonuses
- **Rush orders:** Properly implemented with cost multipliers
- **Quality system:** Production quality affects output quantity
- **Cancellation logic:** 50% refund, material return based on progress

### 5. Production Tick Job
**File:** `productionTick.job.ts`
- **Distributed locking:** Prevents duplicate execution across instances
- **Worker health system:** Automatic recovery from sickness
- **Morale system:** Natural morale trending toward 50
- **Weekly wage system:** Automated worker payments with proper logging
- **Worker quit mechanics:** Workers leave after 14 days without pay

### 6. Model Completeness
All models have:
- Proper TypeScript interfaces
- Comprehensive instance and static methods
- Appropriate indexes
- Validation constraints
- Subdocument schemas where needed

---

## Critical Issues Found

### CRITICAL: Duplicate Material Deduction
**Risk:** HIGH - Players lose materials twice
**File:** `crafting.service.ts:229-238, 314-324`

**Problem:** Materials deducted TWICE in the full version:
- First deduction at lines 229-238 (using `recipeDoc.ingredients`)
- Second deduction at lines 314-324 (using `craftingRecipe.materials`)

**Impact:** Players would lose 2x materials per craft

---

### CRITICAL: Missing Material Validation
**Risk:** HIGH - Exploits, economy imbalance
**File:** `crafting.service.ts:125, 148, 151`

**Problem:**
```typescript
validation.requirements.hasMaterials = true; // Assume true for now
validation.requirements.hasEnergy = true;
validation.requirements.hasInventorySpace = true;
```

**Impact:**
- Players can craft without materials
- No energy cost enforcement
- No inventory space validation
- Economy-breaking exploit

---

### CRITICAL: No Transaction Safety in Crafting
**Risk:** HIGH - Data corruption, race conditions
**File:** `crafting.service.ts:183-444`

**Problem:** Main `craftItem` method has no MongoDB session or transaction wrapping:
- Material deduction not atomic
- Profile XP updates not atomic
- Inventory additions not atomic
- If any step fails mid-process, partial state corruption occurs

**Comparison:** Production service properly uses sessions

---

### HIGH: Material Schema Confusion
**Risk:** MEDIUM-HIGH - Different schemas, unclear flow

**Problem:** Two different material schemas:
1. **Recipe Model:** `ingredients: { itemId, quantity }`
2. **CraftingRecipe Type:** `materials: { materialId, materialName, category, quantity }`

Different field names (`itemId` vs `materialId`) cause confusion and potential bugs.

---

### HIGH: Incomplete Recipe Learning System
**Risk:** MEDIUM - Feature not functional
**File:** `crafting.service.ts:483-485, 798-799`

**Problem:**
- Cost check commented out (free recipes)
- No filtering by skill level
- Anyone can see all recipes regardless of profession level

---

### MEDIUM: Production Material Check Incomplete
**File:** `production.service.ts:217-232`

**Issue:** Initial material check validates ALL materials exist, even non-consumed ones that shouldn't be deducted.

---

## Incomplete Implementations

### Recipe Discovery System
**File:** `crafting.service.ts:888-895`
- Stubbed out, always returns null
- No recipe discovery feature

### Material Inventory Checks
**File:** `crafting.service.ts:853`
- `canCraft()` method doesn't validate materials
- TODO comment in code

### Missing Client-Side Components
- No crafting UI components found
- No workshop interface
- No production management

### Workshop Gold Deduction
**File:** `workshop.controller.ts:204-209`
- Direct property mutation instead of `character.deductGold()`
- Bypasses transaction logging

---

## Logical Gaps

### Quality Roll Determinism
**File:** `crafting.service.ts:673`
- Quality roll happens at craft time
- Not deterministic or reproducible
- No seed for testing
- RNG manipulation concerns

### XP Calculation Dead Code
**File:** `crafting.service.ts:561-576, 578-582`
- `greenModifier` and `orangeModifier` calculated but never used
- Dead code in response structure

### Missing Recipe Seed Data
- No recipe data files found
- System cannot be tested end-to-end
- Players have nothing to craft

### Facility Upgrade System Incomplete
- Schema exists but no service methods
- No cost deduction logic
- No API endpoints for upgrades

### Crafting Statistics Not Updated
- In simplified `craftItem` version:
  - No crafting stats updated
  - No profession XP awarded
  - No totalItemsCrafted increment

---

## Race Conditions & Concurrency

### Concurrent Crafting Sessions
**File:** `CraftingProfile.model.ts:452-461`

**Problem:** Check-then-act pattern without lock
- Two concurrent requests could both pass the check
- Both sessions could start
- Second save would overwrite first

### Material Deduction Race
**File:** `crafting.service.ts:304-324`

**Scenario:**
1. User initiates 2 craft requests simultaneously
2. Both check materials → both see 10 wood available
3. Both deduct 10 wood
4. Result: -10 wood (negative quantity)

---

## Security Concerns

### No Input Sanitization
- No validation on recipeId format
- No validation on quantity limits
- No rate limiting

### No Permission Checks on Recipe Learning
- Anyone can learn any recipe
- No checks for faction, quest, or reputation requirements

### Production Ownership Validation
- String comparison on ObjectIds (should use `.equals()`)

---

## Recommendations by Priority

### CRITICAL (Fix Immediately)

1. **Fix Duplicate Material Deduction** (crafting.service.ts:314-324)
   - Remove duplicate deduction logic
   - Test thoroughly with unit tests

2. **Implement Material Validation** (crafting.service.ts:125)
   - Add actual inventory checks
   - Validate quantities before crafting

3. **Add Transaction Safety to Crafting** (crafting.service.ts:183-444)
   - Wrap in MongoDB sessions
   - Ensure atomic operations

4. **Fix Material Schema Confusion**
   - Standardize on one schema
   - Update all references

### HIGH (Fix Before Production)

5. **Implement Recipe Learning Costs** (crafting.service.ts:483-485)
6. **Add Recipe Seed Data**
7. **Fix Workshop Gold Deduction** (workshop.controller.ts:206)
8. **Implement Recipe Filtering** (crafting.service.ts:798-799)

### MEDIUM (Quality Improvements)

9. **Add Concurrency Protection**
10. **Complete Facility Upgrade System**
11. **Fix XP Calculation Dead Code**
12. **Add Client-Side Components**

### LOW (Future Enhancements)

13. **Recipe Discovery System**
14. **Crafting Statistics Tracking**
15. **Input Validation & Sanitization**

---

## Summary Table

| Component | Status | Issues | Risk Level |
|-----------|--------|--------|------------|
| Crafting Service | Partial | Duplicate deduction, no validation, no transactions | HIGH |
| Production Service | Good | Minor edge cases | MEDIUM |
| Workshop Service | Partial | Missing gold transaction logging | HIGH |
| Models | Complete | Minor concurrency concerns | MEDIUM |
| Controllers | Basic | Missing validation | MEDIUM |
| Client UI | Missing | No implementation | HIGH |
| Data/Seeds | Missing | No recipes | HIGH |
| Tests | Missing | No coverage | HIGH |

---

## Conclusion

The crafting system has a **solid architectural foundation** with comprehensive type definitions, well-designed models, and sophisticated quality/XP mechanics. The **production system is notably better implemented** than the core crafting service.

However, **critical issues** prevent production deployment:

1. Duplicate material deduction - Game-breaking bug
2. Missing validation - Economy exploit
3. No transaction safety - Data corruption risk
4. No recipes - System not usable
5. No client UI - Backend only

**Recommendation:** Address all CRITICAL and HIGH priority issues before production deployment. The system requires approximately **3-5 days of focused development** to reach production-ready status.

**Production Readiness:** 50%
