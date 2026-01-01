## Task Summary: task-001

**Bug:** Gathering items not added to inventory (P0)
**Completed:** 2025-12-31

---

### Root Cause

Mongoose doesn't automatically detect changes to nested arrays when you modify them directly with `.push()` or by modifying existing items. You must call `markModified('arrayField')` to trigger change detection.

The gathering service was:
1. Rolling loot successfully
2. Pushing items to `character.inventory`
3. Calling `character.save()`
4. **Missing:** `character.markModified('inventory')`

Result: Energy was deducted, success message returned, but inventory wasn't persisted.

---

### Test Written

- **File:** `server/tests/gathering/gathering.service.test.ts`
- **Key Test:** `should add gathered items to inventory and persist to database`
- **Assertions:**
  - Gathering returns success
  - Loot array is populated
  - Reloaded character has items in inventory
  - Item quantities match returned loot

---

### Implementation

- **File:** `server/src/services/gathering.service.ts:338-340`
- **Change:** Added `markModified` calls before save:
  ```typescript
  character.markModified('inventory');
  character.markModified('skills');
  ```

---

### Git Commits

- `test(gathering): add inventory persistence tests`
- `fix(gathering): add markModified for inventory persistence`

---

### Learnings for Future Tasks

1. **Mongoose nested arrays:** Always call `markModified()` when modifying nested arrays/subdocuments directly
2. **Transaction pattern:** The existing transaction pattern (session, commit, abort, finally) is correct
3. **Test pattern:** Reload entity from database after mutation to verify persistence

---

### Related Files

- `server/src/services/gathering.service.ts` - Main fix
- `server/src/models/Character.model.ts` - Inventory schema (lines 583-587)
- `server/tests/gathering/gathering.service.test.ts` - Tests
