# Playtest Report - 2026-01-12

## Executive Summary
Comprehensive playtest of Desperados Destiny using Chrome DevTools MCP automation.
Tested with both max-level character (Phase 1) and new player experience (Phase 2).

---

## Phase 1: Max-Level Character Testing

### Test Account
- Username: PlaytestMax99 / playtest99@test.com
- Character: MaxTestChar (Settler Alliance)
- Stats: Level 50, TL 2671, All skills at 89

---

## Critical Bugs Found

### BUG-001: Shop Has No Purchase Functionality (P0 - CRITICAL)
**Location:** `/game/shop` and building Shop tabs
**Description:** The shop displays items with prices but there is NO way to purchase items:
- Items are displayed with names, rarity, prices
- "Prices falling" indicator shows Market Crash event works
- NO click handlers on items
- NO buy buttons
- NO purchase modal appears
- Both standalone shop and building merchant shops affected

**Impact:** Players cannot buy ANY items - completely broken economy
**Reproduction:** Navigate to /game/shop or any building's Shop tab

---

### BUG-002: Gang Creation Missing characterId (P0 - CRITICAL)
**Location:** `/game/gang` - Create Gang modal
**Description:** Gang creation fails with ERROR 400: "characterId, name, and tag are required"
- Form properly collects: name, tag, description, recruitment status
- API call does NOT include characterId
- Frontend service is missing characterId parameter

**Impact:** Players cannot create gangs
**Reproduction:**
1. Go to /game/gang
2. Click "Create Gang"
3. Fill form (name, tag, description)
4. Click "Create Gang ($5,000)"
5. Error appears

---

### BUG-003: Crime System ActionResult Validation (P1 - HIGH)
**Location:** Crime actions via Destiny Deck
**Description:** ActionResult validation fails when stopping card draws:
```
ActionResult validation failed:
- handRank: Cast to Number failed for value "3 Cards (0 Danger) | 3 streak, 24% risk" (type string)
- cardsDrawn: Must draw exactly 5 cards
```

**Root Cause:**
1. `handRank` field expects Number but receives descriptive string
2. Backend requires exactly 5 cards but UI allows 1-10 card draws

**Impact:** Crime actions may fail unexpectedly
**Reproduction:** Start a crime, draw less than 5 cards, stop

---

## Medium Priority Issues

### ISSUE-004: Skill Requirements Not Shown Before Actions (P2)
**Location:** Crime actions
**Description:** When attempting "Burglarize Store":
- Shows requirement only AFTER clicking: "Requires Burglary level 10 (you have 1)"
- Requirements should be visible before attempting action
**Impact:** Poor UX - players waste clicks discovering requirements

### ISSUE-005: Energy State Sync (P2)
**Location:** Sidebar vs page content
**Description:** Energy value in sidebar sometimes differs from page content
- May be timing issue with state updates
**Impact:** Confusing display

---

## Working Systems (Verified)

### Location System
- Red Gulch loads with 15 buildings
- Building details show correctly (name, description, danger level)
- Territory influence bar displays
- Overview/Craft/Travel tabs work

### Building Interiors
- The Golden Spur Saloon: Bar, Rest Area, Gambling Corner, Card Tables
- Miner's Supply Co: Jobs, Crimes, Craft, Shop tabs
- NPCs visible with descriptions
- Available actions shown (Social, Combat, Criminal)

### Crafting System
- 548 recipes available across professions
- Recipe details show: materials, quality chances, skill bonuses
- Categories: All Recipes, Cooking, Blacksmithing, etc.
- Quality system: Poor/Common/Good/Masterwork

### World Events
- Market Crash: -30% shop prices, +20% danger
- Heat Wave: +20% energy cost
- Events rotate and display correctly

### Travel System
- Nearby locations with energy costs shown
- Journey to other zones available
- Travel buttons functional

---

## Phase 2: New Player Experience

### Test Account
- Username: NewPlayer01 / newplayer01@test.com
- Character: RookieGunslinger (Settler Alliance)
- Starting stats: TL 30, CL 1, Energy 150/150, $100

### Registration Flow
- Form validation works (username availability check)
- Password strength meter with requirements
- Clear error messages
- "Claim Your Destiny" button properly disabled during submission

### Character Creation
- Step 1: Name (3-20 chars) + Faction selection (3 factions)
- Step 2: Confirmation with preview
- Cultural bonus shown (+5 Craft for Settlers)
- Starting benefits listed (150 Energy, 5-card Destiny Deck)

### Tutorial System
- Auto-triggers on first login for new character
- Mentor "Hawk" (Retired Gunslinger) with portrait
- Portrait expressions change (neutral, teaching)
- Faction-specific dialogue: "I see the badge. Settler Alliance."
- Progress tracking in top-right corner
- Skip Tutorial / Skip Section options
- 5-step Settler Orientation

---

## UI/UX Observations

### Positive
- Western theme consistent throughout
- Card/deck metaphors well integrated
- Building descriptions atmospheric and immersive
- Sidebar quick links comprehensive
- Energy regeneration timer helpful

### Areas for Improvement
- Shop needs purchase functionality
- Skill requirements should show pre-action
- Gang creation needs debugging
- Crime validation logic needs review

---

## Test Coverage Summary

| System | Status | Notes |
|--------|--------|-------|
| Registration | Working | Form validation good |
| Character Creation | Working | 2-step flow clean |
| Tutorial | Working | Auto-triggers, mentor dialogue |
| Location/Buildings | Working | 15 buildings in Red Gulch |
| Building Interiors | Working | Multiple activity tabs |
| Crafting | Working | 548 recipes |
| Shop | BROKEN | No purchase mechanism |
| Gang Creation | BROKEN | Missing characterId |
| Crimes | PARTIAL | Validation errors |
| Travel | Working | Energy cost shown |
| World Events | Working | Multiple events active |

---

## Recommendations

### Immediate Fixes (P0)
1. **Shop Purchase**: Add click handlers and purchase modal to shop items
2. **Gang Creation**: Include characterId in API request body

### Short-term Fixes (P1)
3. **Crime Validation**: Fix handRank type and cardsDrawn requirement
4. **Skill Requirements**: Show requirements before action attempt

### Quality of Life
5. **Energy Sync**: Ensure sidebar and content stay synchronized
6. **Loading States**: Add better loading indicators

---

## Environment
- Browser: Chrome with DevTools remote debugging (port 9222)
- Server: Docker containers (MongoDB, Redis, Backend, Frontend)
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

---

*Report generated via automated playtest using Chrome DevTools MCP*
*Playtest date: 2026-01-12*
