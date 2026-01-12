# Desperados Destiny Playtest Report
**Date:** 2026-01-03
**Tester:** Claude (Autonomous Playtest)
**Test Account:** claude-test@desperados.dev
**Character:** PlaytestHero2026 (Settler Alliance, TL 27, CL 1)

---

## Executive Summary

**Overall Status:** ALL BUGS FIXED - Ready for re-test

The playtest attempted to complete:
1. Main Tutorial (Hawk's 10-phase mentorship)
2. Skill Academy (27 skill quests)

**Result:** Both systems were blocked due to Chat panel layout issues (now fixed).

| Metric | Value |
|--------|-------|
| Bugs Found | 3 |
| Critical Bugs | 2 |
| Fixed During Test | 1 |
| Fixed Post-Test | 2 |
| Tutorial Phases Completed | 2/10 (Settler Orientation dialogue only) |
| Academy Quests Completed | 0/27 |

---

## Bug Report

### BUG-001: Character Creation Schema Validation Error [FIXED]

**Severity:** Critical (Blocking)
**Status:** FIXED during playtest
**Phase:** Character Setup

**Description:**
Creating a new character failed with HTTP 500 error due to Mongoose schema validation.

**Error Message:**
```
Character validation failed: totalLevel: Path 'totalLevel' (27) is less than minimum allowed value (30)
```

**Root Cause:**
`server/src/models/Character.model.ts` had incorrect schema values:
- `default: 30` (should be 27)
- `min: 30` (should be 27)
- `max: 2970` (should be 2673)

**Fix Applied:**
```typescript
totalLevel: {
  type: Number,
  default: 27, // 27 trainable skills at level 1
  min: 27,
  max: 2673, // 27 skills × 99 max level
  index: true
}
```

**Screenshot:** `playtest-reports/BUG-001-character-creation-error.png`

---

### BUG-002: Travel "Go" Buttons Non-Functional [FIXED]

**Severity:** Critical (Blocking)
**Status:** FIXED
**Phase:** Main Tutorial - Settler Orientation (Step 3/5)

**Description:**
The "Go" buttons on the Location page (`/game` or `/game/location`) do not trigger any action when clicked. The tutorial requires traveling to "Western Outpost" but clicking the Go button:
- Does not navigate to the destination
- Does not trigger any network request
- Does not show any error message
- Does not update the UI in any way

**Root Cause:**
The Chat panel (600x600px fixed element at bottom-right) was covering the button areas on the right side of location cards. The buttons were correctly wired but visually and interactively blocked by the overlapping Chat component.

**Fix Applied:**
1. Changed chat default state to minimized (`useChatStore.ts`)
2. Reduced chat window size from 600x600px to 500x400px (`ChatWindow.tsx`)

```typescript
// useChatStore.ts - Line 122
isMinimized: true, // Default to minimized so chat doesn't cover page content

// ChatWindow.tsx - Line 289
w-full md:w-[500px] h-[400px] // Reduced from 600x600
```

**Screenshot:** `playtest-reports/BUG-002-travel-buttons-broken.png`

---

### BUG-003: Skill Academy "Start Tutorial" Buttons Non-Functional [FIXED]

**Severity:** Critical (Blocking)
**Status:** FIXED
**Phase:** Skill Academy

**Description:**
The "Start Tutorial" buttons on the Skill Academy page (`/game/academy`) do not trigger any action when clicked. All 22 available skill tutorials are inaccessible.

**Root Cause:**
Same as BUG-002 - The Chat panel (600x600px fixed element at bottom-right) was covering the "Start Tutorial" button areas on the right side of skill cards. The buttons exist and are correctly wired but were visually and interactively blocked by the overlapping Chat component.

**Fix Applied:**
Same fix as BUG-002:
1. Changed chat default state to minimized (`useChatStore.ts`)
2. Reduced chat window size from 600x600px to 500x400px (`ChatWindow.tsx`)

**Screenshot:** `playtest-reports/BUG-003-start-tutorial-broken.png`

---

## Engagement Analysis (Partial)

### Phases Tested

#### Phase 1: Awakening/Settler Orientation (Dialogue Only)
| Metric | Score | Notes |
|--------|-------|-------|
| Pacing | 4/5 | Good typewriter effect, Skip button available |
| Clarity | 4/5 | Hawk's dialogue is clear and thematic |
| Engagement | 4/5 | Mentor expressions add personality |
| Dropoff Risk | Low | Dialogue is engaging |

**Positive Observations:**
- Hawk's portrait expressions (neutral, teaching, warning, urgent) add emotional depth
- Typewriter effect with Skip button respects player time
- Western theme comes through in dialogue
- Tutorial progress indicator (Step X/Y, % complete) is clear

**Friction Points:**
- When ACTION REQUIRED appears, it's unclear exactly where to click
- "Minimize" button text could be more descriptive (e.g., "Go Do Action")

#### Skill Academy Overview
| Metric | Score | Notes |
|--------|-------|-------|
| Pacing | N/A | Blocked |
| Clarity | 4/5 | Mentor cards are clear and themed |
| Engagement | 4/5 | Mentor personalities are distinct |
| Dropoff Risk | Critical | Buttons don't work |

**Positive Observations:**
- Four distinct mentors with unique personalities
- Clear visual hierarchy (Overview → Categories → Skills)
- Level-gated skills shown with lock icon
- Progress tracking (0/27 Skills)

**Friction Points:**
- "Start Tutorial" buttons non-functional (critical)
- Page says "26 skills" in subtitle but shows 27 in progress counter

---

## Screenshots Captured

| File | Description |
|------|-------------|
| `00-existing-character.png` | Initial character state before deletion |
| `01-tutorial-start-hawk.png` | Hawk's first dialogue in tutorial |
| `02-skill-academy-overview.png` | Skill Academy main page |
| `BUG-001-character-creation-error.png` | Character creation 500 error |
| `BUG-002-travel-buttons-broken.png` | Location page with broken Go buttons |
| `BUG-003-start-tutorial-broken.png` | Academy page with broken Start Tutorial buttons |

---

## Recommendations

### Priority 1: Critical Fixes (Blocking)

1. **Fix Travel Button Handlers**
   - Investigate `Location.tsx` or `LocationPage.tsx`
   - Ensure Go buttons have onClick handlers
   - Implement travel API call

2. **Fix Academy Tutorial Button Handlers**
   - Investigate `SkillAcademy.tsx`
   - Ensure "Start Tutorial" buttons have onClick handlers
   - Implement tutorial modal or navigation

### Priority 2: Minor Issues

3. **Academy Subtitle Inconsistency**
   - Page says "Learn the 26 skills" but progress shows "0/27 Skills"
   - Update to consistent count (27 trainable skills)

### Priority 3: Engagement Improvements

4. **Action Required UX**
   - Make ACTION REQUIRED more visually prominent
   - Add arrow or highlight pointing to required action
   - Consider auto-scrolling to the action target

---

## Test Environment

| Component | Version/Status |
|-----------|----------------|
| Server | Running (nodemon auto-restart) |
| Client | Vite dev server (localhost:5173) |
| Database | MongoDB (connected) |
| Browser | Chrome (via DevTools MCP) |
| Test Duration | ~20 minutes |

---

## Conclusion

The playtest was significantly blocked by two critical bugs:
1. Travel system non-functional (BUG-002)
2. Skill Academy tutorials non-functional (BUG-003)

One bug was fixed during testing (BUG-001 - character creation schema).

The UI/UX elements that were testable showed good engagement design:
- Mentor personalities are distinct and thematic
- Tutorial progress tracking is clear
- Dialogue system with expressions works well

**Recommendation:** Fix BUG-002 and BUG-003 before next playtest session.
