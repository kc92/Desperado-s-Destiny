## Task Summary: task-004

**Bug:** XP pacing too fast - Level 10 in ~10 crimes (P1)
**Completed:** 2026-01-01

---

### Root Cause

The XP inflation was caused by TWO issues in `actionDeck.service.ts`:

1. **Difficulty-based XP formula** instead of action-defined rewards:
   - Old: `(20 + (action.difficulty * 8)) * multiplier`
   - For difficulty 40: (20 + 320) × 1.5 = 510 XP per crime!
   - New: `(action.rewards?.xp || 20) * multiplier`
   - Uses defined XP (10-50 range) × capped multiplier

2. **Uncapped suit bonus multiplier**:
   - Old: multipliers could stack to 1.5x or higher
   - New: `Math.min(1.2, rawMultiplier)` caps at 1.2x

---

### Test Written

- **File:** `server/tests/actionDeck/xpBalance.test.ts`
- **Key Tests:**
  - `should cap suit multiplier at 1.2x`
  - `should use action.rewards.xp instead of difficulty-based formula`
  - `should demonstrate old formula allowed level 10 in ~4 crimes`
  - `should require roughly 30-80 crimes to reach level 10`
  - `should never allow level 10 in under 20 crimes`

---

### Implementation

- **File:** `server/src/services/actionDeck.service.ts:72-85`
- **Changes:**
  1. Added `Math.min(1.2, rawSuitMultiplier)` for job XP calculations
  2. Added `Math.min(1.2, xpMultiplier)` and combined cap for job rewards
  3. Changed action XP from `(20 + (difficulty * 8)) * multiplier` to `(action.rewards?.xp || 20) * multiplier`
  4. Added multiplier cap at line 252: `Math.min(1.2, rawMultiplier)`

- **File:** `server/src/services/crime.service.ts`
- **Changes:** Added criminal skill XP system (bonus feature)

- **File:** `shared/src/constants/criminalSkills.constants.ts`
- **New:** Criminal skills definitions for crime progression

---

### XP Pacing Results

| Metric | Before | After |
|--------|--------|-------|
| Max XP per crime | 510+ | 60 |
| Crimes to Level 10 | ~4 | ~67 |
| Multiplier cap | None | 1.2x |

---

### Git Commits

- `test(xp): add XP balance verification tests`
- `fix(xp): cap multipliers and use action-defined XP rewards`

---

### Learnings for Future Tasks

1. **Difficulty != Reward**: Never derive rewards from difficulty values directly
2. **Cap multipliers**: Always cap multiplicative bonuses to prevent exponential growth
3. **Test pacing math**: Write tests that verify level progression timelines

---

### Related Files

- `server/src/services/actionDeck.service.ts:46-92, 247-309` - XP calculations
- `server/tests/actionDeck/xpBalance.test.ts` - Balance tests
- `shared/src/constants/game.constants.ts:82-108` - PROGRESSION constants
