# BATCH 11: Production & Crafting Systems Audit Report

## Summary

| System | Grade | Production Ready | Critical Issues | Est. Fix Time |
|--------|-------|------------------|-----------------|---------------|
| Production System | C+ (62%) | 40% | 5 critical | 3-4 days |
| Crafting System | C+ (62%) | 35% | 4 critical | 2-3 sprints |
| Masterwork/Workshop | C+ (68%) | 45% | 4 critical | 25 hours |
| Recipe/Item Data | C+ (68%) | 40% | 5 critical | 2-3 sprints |

**Overall Assessment:** Production and crafting systems have **solid architectural foundations** but suffer from **CRITICAL SECURITY GAPS** that would allow **item duping, economy exploitation, and validation bypasses**. The systems lack transaction safety, distributed locking, and proper inventory atomicity. **NONE of these systems should be deployed to production without immediate remediation.**

---

## PRODUCTION SYSTEM

### Grade: C+ (62/100)

**System Overview:**
- Property-based item production with worker management
- Quality system with multiple factors (skill, tools, workers)
- Production tick job for batch processing
- Rate limiting on production endpoints

**Top 5 Strengths:**
1. **MongoDB Transactions** - Proper session usage with commit/rollback
2. **Distributed Lock Implementation** - `withLock` pattern prevents duplicate job execution
3. **Comprehensive Worker System** - Morale, loyalty, efficiency, XP progression
4. **Quality Calculation** - SecureRNG with multiple contributing factors
5. **Rate Limiting** - 20 req/min on /start endpoint

**Critical Issues:**

1. **DEPRECATED METHODS USED THROUGHOUT** (`production.service.ts:211, 374, 382`)
   - `character.deductGold()` - DEPRECATED (should use GoldService)
   - `character.addGold()` - DEPRECATED
   - `character.addExperience()` - DEPRECATED
   - **Transaction atomicity not guaranteed**

2. **UPDATE-STATUSES ENDPOINT SECURITY** (`Line 75`)
   - `POST /api/production/update-statuses` only has `requireAuth`
   - Any authenticated user can trigger mass production completion
   - Should be admin-only

3. **maxQuantity CALCULATION OVERFLOW** (`Line 587`)
   - `maxQuantity * (slot.currentOrder?.quantity || 1)` creates unbounded scaling
   - Order 1000 units × maxQuantity 100 = 100,000 units possible
   - **Economy exploit: unlimited item generation**

4. **RACE CONDITION: Gold Cost** (`Lines 109-112`)
   - `hasGold()` check before transaction, deduction after
   - Concurrent requests can bypass validation
   - **Double-spending possible**

5. **MATERIAL VALIDATION NOT LOCKED** (`Lines 120-125`)
   - Materials checked but not locked during transaction
   - Parallel request could consume same materials
   - **Duplication exploit**

**Missing Features:**
- No upper bound on production quantity input
- Worker assignment not atomic (same worker → multiple slots)
- Quality roll can exceed design thresholds with bonuses

**Production Status:** NOT READY - Critical exploits exist

---

## CRAFTING SYSTEM

### Grade: C+ (62/100)

**System Overview:**
- Item crafting with recipe validation
- Quality determination system (6 tiers: Shoddy → Masterwork)
- XP progression with skill tiers
- CraftedItem model with durability tracking

**Top 5 Strengths:**
1. **Sophisticated Quality Calculation** - Skill, stats, tools, specialization factors
2. **SecureRNG Usage** - Cryptographically secure randomization
3. **Skill Tier System** - Clear progression from Novice to Grandmaster
4. **CraftedItem Model** - Comprehensive durability and effects tracking
5. **Rate Limiting** - 30 crafts/minute on POST endpoint

**Critical Issues:**

1. **INVENTORY DUPING EXPLOIT** (`crafting.service.ts:219-254, 305-325`)
   - Inventory deductions happen WITHOUT transactional safety
   - Client crash/disconnect between check and save = items duplicated
   - **ECONOMY BREAKING: Unlimited item generation**

2. **RACE CONDITION: CONCURRENT CRAFTS**
   - Two simultaneous craft requests can both pass inventory check
   - Both deduct, resulting in negative inventory
   - No row-level locking or distributed locks

3. **MATERIAL VALIDATION BYPASSED** (`crafting.service.ts:125-126, 854`)
   ```typescript
   validation.requirements.hasMaterials = true; // Assume true for now
   // TODO: Check materials in inventory
   ```
   - `validateCrafting()` **ALWAYS** returns `hasMaterials: true`
   - Materials not actually checked in full crafting path

4. **NO TRANSACTION WRAPPER**
   - `transaction.helper.ts` exists with `withLockAndTransaction()`
   - Crafting service **NEVER USES IT**
   - Every save is independent, no atomicity

**Incomplete Features:**
- Client craft time is visual only (no server enforcement)
- Recipe unlock bypass (learning cost never deducted)
- Inventory space never validated
- Facility bonuses hardcoded at 1.0x

**Production Status:** **NOT READY** - Trivial item duping possible

---

## MASTERWORK/WORKSHOP SYSTEM

### Grade: C+ (68/100)

**System Overview:**
- Quality determination for crafted items
- Workshop access control with requirements
- Durability and repair system
- Special effects for exceptional items

**Top 5 Strengths:**
1. **Clean Service Architecture** - Separation between MasterworkService and WorkshopService
2. **Transparent Quality Breakdown** - Players can see how quality is calculated
3. **Permission-Based Features** - Only crafter can rename masterwork items
4. **Rate Limiting** - Workshop (30 req/min), repair (10 req/min)
5. **Multi-Factor Quality** - 6 independent factors combine

**Critical Issues:**

1. **REPAIR CALCULATION BUG** (`workshop.controller.ts:614-615`)
   ```typescript
   // WRONG - replaces entire durability
   item.durability.current = Math.floor((item.durability.max * percentage) / 100);
   // Should ADD repair amount, not SET to percentage
   ```
   - Repairing 80% durability item to 50% **drops it to 50%**
   - **Game-breaking: Players lose durability when repairing**

2. **DURABILITY LOSS NEVER APPLIED**
   - `applyDurabilityDamage()` method exists but NEVER called
   - Combat, crafting, gathering don't reduce durability
   - Items never break despite model support

3. **NO WORKSHOP LOCATION CHECK FOR REPAIRS**
   - `repairItem()` doesn't verify character is at workshop
   - Players can repair items anywhere
   - Defeats entire workshop system purpose

4. **REAL TIME VS GAME TIME**
   - Workshop sessions use `new Date()` (real-world time)
   - Game has calendar system with game hours
   - Sessions expire immediately in game time

**Incomplete Features:**
- Shoddy quality unreachable (Math.max prevents negative scores)
- Repair materials hardcoded to iron-ingot only
- Quality breakdown logged but not returned in API
- Item breakage system partially implemented

**Production Status:** NOT READY - Repair bug is game-breaking

---

## RECIPE/ITEM DATA SYSTEM

### Grade: C+ (68/100)

**System Overview:**
- Recipe definitions for all craftable items
- Item data organized in 22+ category files
- Tool progression system (basic → legendary)
- ~350+ items across all categories

**Top 5 Strengths:**
1. **Modular Data Organization** - Clean separation by item category
2. **Recipe Template System** - Dynamic generation for tool recipes
3. **CraftedItem Model** - Sophisticated tracking capabilities
4. **Clear Recipe Structure** - Consistent schema across all recipes
5. **Duplicate Protection** - Seed uses threshold check

**Critical Issues:**

1. **MISSING ITEM DEFINITIONS**
   - `feathers` - Required for spirit-guides-headdress, NOT IN DATABASE
   - `snake-venom` - Required for vipers-kiss-darts, NOT IN DATABASE
   - Several output items also missing (warlords-helm, bulwarks-shield, etc.)
   - **Recipes broken, crafting fails**

2. **MATERIAL VALIDATION DISABLED** (`crafting.service.ts:854`)
   ```typescript
   // TODO: Check materials in inventory
   // For now, assume materials are available
   return { canCraft: true };  // Always returns true!
   ```
   - **EXPLOIT: Craft unlimited items without materials**

3. **NO INVENTORY SPACE CHECK** (`Line 151`)
   ```typescript
   validation.requirements.hasInventorySpace = true; // Always true!
   ```
   - Players can overflow inventory or dupe items

4. **NO ATOMIC TRANSACTIONS** (`Lines 230-254`)
   - Multiple inventory modifications without transaction
   - Single save after all modifications
   - **Data corruption risk on concurrent crafting**

5. **RECIPE ACCESS CONTROL MISSING** (`Line 799-801`)
   ```typescript
   const recipes = await Recipe.find({ isUnlocked: true });
   return recipes;  // All players see all recipes!
   ```
   - No per-character recipe learning
   - Locked content visible to everyone

**Data Integrity Issues:**
- Price inconsistencies across item tiers
- XP values appear arbitrary (no clear scaling formula)
- Craft time units undefined (minutes? ticks?)
- Old recipe seed file still present (maintenance confusion)

**Production Status:** NOT READY - Missing items break crafting flows

---

## CROSS-SYSTEM FINDINGS

### Architecture Strengths
- Consistent service-controller-route patterns
- MongoDB session support in core operations
- SecureRNG usage instead of Math.random()
- Rate limiting infrastructure exists
- CraftedItem model is well-designed

### Critical Shared Problems

1. **No Transaction Safety Across Systems**
   - Production: deprecated methods bypass transactions
   - Crafting: no `withLockAndTransaction()` usage
   - Workshop: repair doesn't verify ownership atomically
   - Recipe: inventory modifications unprotected

2. **Material/Inventory Duplication Vectors**
   - Production: materials checked but not locked
   - Crafting: validation bypassed entirely
   - Both systems vulnerable to race conditions

3. **Validation Stubs Throughout**
   - `hasMaterials = true` (always)
   - `hasInventorySpace = true` (always)
   - `hasEnergy = true` (always)
   - **Core validation is TODO comments**

4. **Integration Gaps**
   - CraftedItem quality system never used in crafting
   - Durability damage never applied anywhere
   - Facility bonuses hardcoded at 1.0x
   - Specialization bonuses hardcoded at 10%

### Economy Attack Surface

| Attack | Production | Crafting | Workshop | Recipes |
|--------|------------|----------|----------|---------|
| Item Duping | ✅ Vulnerable | ✅ Vulnerable | ❌ Safe | ✅ Vulnerable |
| Material Bypass | ✅ Vulnerable | ✅ Vulnerable | ❌ N/A | ✅ Vulnerable |
| Gold Exploit | ✅ Vulnerable | ❌ Safe | ❌ Safe | ❌ Safe |
| Quantity Overflow | ✅ Vulnerable | ❌ Safe | ❌ Safe | ❌ Safe |
| Race Conditions | ✅ Vulnerable | ✅ Vulnerable | ⚠️ Minor | ✅ Vulnerable |

---

## PRIORITY FIX ORDER

### Immediate (Ship Blockers)
1. **IMPLEMENT TRANSACTION WRAPPER** for all crafting/production
   ```typescript
   await withLockAndTransaction(`lock:craft:${characterId}`, async (session) => { ... });
   ```
2. **FIX MATERIAL VALIDATION** - Remove `hasMaterials = true` stub
3. **ADD INVENTORY ATOMICITY** - Use MongoDB `$inc` operators
4. **FIX REPAIR CALCULATION** - Add repair amount, don't set to percentage
5. **ADD MISSING ITEM DEFINITIONS** - feathers, snake-venom, all output items

### High Priority (Week 1)
1. Add admin-only middleware to update-statuses endpoint
2. Implement quantity bounds validation
3. Use GoldService directly (remove deprecated methods)
4. Implement durability loss in combat/gathering
5. Add workshop location check for repairs

### Medium Priority (Week 2)
1. Implement recipe access control per-character
2. Add inventory space validation
3. Integrate facility bonuses properly
4. Fix real-time vs game-time in workshop sessions
5. Implement recipe discovery system

---

## ESTIMATED EFFORT

| System | Critical Fixes | Full Completion |
|--------|---------------|-----------------|
| Production | 3-4 days | 2 weeks |
| Crafting | 2-3 sprints | 4-6 weeks |
| Masterwork/Workshop | 25 hours | 1-2 weeks |
| Recipe/Item Data | 2-3 sprints | 4-6 weeks |
| **Total** | **~3-4 weeks** | **~10-14 weeks** |

---

## CONCLUSION

The production and crafting systems represent **significant development investment** with:
- Sophisticated quality calculations
- Multi-factor bonus systems
- Comprehensive data models (CraftedItem, PropertyWorker)
- Well-designed recipe templates

However, they are **critically broken** due to:

1. **No transaction safety** - Item duping trivially possible
2. **Validation stubs** - Material checks bypassed entirely
3. **Missing data** - Recipe items don't exist in database
4. **Integration gaps** - Quality/durability systems never connected

**Key Insight:** The CraftedItem model is excellent but **never used**. The crafting system creates basic items without quality tiers, durability, or special effects. This represents significant wasted development.

**Security Assessment:** These systems have **game-breaking exploits**:
- Unlimited item generation via material bypass
- Economy destruction through quantity overflow
- Item duplication through race conditions

**Recommendation:** **DO NOT DEPLOY** any of these systems until transaction safety is implemented. A player discovering the material bypass would break the entire game economy within hours.

Estimated time to production-ready: **3-4 weeks of focused engineering** for critical fixes only. Full feature completion would require **10-14 weeks**.
