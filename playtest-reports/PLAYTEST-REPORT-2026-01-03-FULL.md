# Desperados Destiny Full Playtest Report
**Date:** 2026-01-03
**Tester:** Claude (Autonomous Playtest)
**Test Account:** playtest-full@desperados.dev
**Character:** FullPlaytestHero (Settler Alliance, TL 27, CL 1)

---

## Executive Summary

**Overall Status:** CRITICAL BLOCKERS - Tutorial & Academy systems non-functional

| Metric | Value |
|--------|-------|
| New Bugs Found | 3 (BUG-007, BUG-008, BUG-009) |
| Critical Bugs | 3 |
| Tutorial Phases Completed | ~43% (blocked at "Making a Living") |
| Academy Quests Completed | 0/27 (blocked - NPCs don't exist) |
| Core Game Systems | WORKING |

---

## Bug Report

### BUG-007: Abandoned Mine Location Unreachable [CRITICAL]

**Severity:** Critical (Blocking)
**Status:** OPEN
**Phase:** Main Tutorial - "Making a Living"

**Description:**
The tutorial step "Travel to the Abandoned Mine" cannot be completed because:
1. The Abandoned Mine location has no travel connections (`connections: []`)
2. It doesn't appear on the Territory map
3. Western Outpost only connects to Red Gulch

**Root Cause:**
In `server/src/data/locations/frontier_locations.ts:10-42`, the Abandoned Mine is defined but has `connections: []`, making it unreachable via travel.

**Fix Required:**
Add travel connections from nearby locations to Abandoned Mine, OR change the tutorial to reference an existing accessible location.

---

### BUG-008: "Skip Tutorial" Removes Entire Tutorial [CRITICAL]

**Severity:** Critical (Blocking)
**Status:** OPEN
**Phase:** Main Tutorial

**Description:**
Clicking the "Skip Tutorial" button completely removes the tutorial system instead of skipping the current section/step. The tutorial panel disappears entirely with no way to resume.

**Expected Behavior:**
- "Skip Section" should skip current section and advance to next
- "Skip Tutorial" should offer confirmation before removing entirely
- Tutorial should be resumable from settings

**Actual Behavior:**
- Single click removes tutorial permanently
- No confirmation dialog
- No way to resume tutorial

---

### BUG-009: Skill Academy Quests Reference Non-Existent NPCs/Locations [CRITICAL]

**Severity:** Critical (Blocking)
**Status:** OPEN
**Phase:** Skill Academy

**Description:**
All 27 Skill Academy tutorial quests have objectives that reference NPCs and locations that don't exist in the game world:

| Quest | Objective | Missing Target |
|-------|-----------|----------------|
| Fists of Fury | Meet Iron Jack at Combat Yard | `npc:iron-jack-thornwood` |
| Fists of Fury | Defeat training dummies | `npc:training-dummy` |
| Dead-Eye Basics | Meet Iron Jack at firing range | Location doesn't exist |
| Open Sesame | Meet Viola in Back Room | `npc:silk-viola-marchetti` |
| ... | ... | All 27 quests affected |

**Root Cause:**
Quest objectives in `server/src/data/quests/skill-academy.ts` reference NPCs and locations that haven't been implemented in the game world.

**Fix Required:**
1. Add mentor NPCs to specific locations (Iron Jack, Silk Viola, Walking Moon, Gus Hornsby)
2. Add training objects (dummies, targets, practice locks, etc.)
3. Create academy training area locations

---

## What Works (Verified Functional)

### 1. Account & Character Creation
- Registration flow works
- Email auto-verification works (DEV mode)
- Character creation works (after BUG-001 fix from previous session)

### 2. Core Game Loop - Jobs
- "Work" button triggers Destiny Deck card game
- Card game UI renders correctly
- Turn-based draw/hold mechanic works
- Suit matching system works
- Multiple turns (3 rounds)

### 3. Location System
- Location pages load correctly
- Location descriptions and atmosphere text display
- Faction influence bars work
- Nearby locations with "Go" buttons display

### 4. Criminal Opportunities
- 20 crimes displayed at Western Outpost
- Crime details (energy, reward, difficulty, wanted level, jail time)
- "Attempt Crime" buttons visible

### 5. Skill Academy UI
- Academy page loads
- 4 mentor tabs (Combat, Cunning, Spirit, Craft)
- Mentor cards with personality descriptions
- "Start Tutorial" buttons work (BUG-003 fix verified)
- Quest modal displays correctly
- Quest tracking in Quest Log

### 6. Dynamic World Events
- Events rotate (Heat Wave, Faction Rally, Dust Storm)
- Event effects display (+20% energy cost, +25% reputation, etc.)
- Timer countdown works

### 7. Navigation & UI
- All sidebar links work
- Quick Links menu works
- Character stats panel displays
- Energy regeneration displays

---

## Engagement Analysis (What Was Testable)

### Tutorial Dialogue System
| Metric | Score | Notes |
|--------|-------|-------|
| Pacing | 4/5 | Good typewriter effect |
| Clarity | 4/5 | Hawk's dialogue is clear |
| Engagement | 4/5 | Mentor expressions add personality |
| Skip Option | 3/5 | Skip button too aggressive |

### Destiny Deck Card Game
| Metric | Score | Notes |
|--------|-------|-------|
| Clarity | 5/5 | Clear instructions on hold/draw |
| Visual Design | 4/5 | Card rendering is good |
| Poker Hand Reference | 5/5 | Helpful hand ranking guide |
| Engagement | 4/5 | Adds skill element to jobs |

### Skill Academy
| Metric | Score | Notes |
|--------|-------|-------|
| Mentor Personalities | 5/5 | Distinct, thematic characters |
| Visual Hierarchy | 4/5 | Clear overview -> category -> skill |
| Quest Modal | 4/5 | Clear objectives and rewards |
| Level Gating | 5/5 | Lock icons show requirements clearly |

---

## Systemic Issues Identified

### 1. Content Pipeline Gap
Quest/tutorial content references game world elements (NPCs, locations, objects) that don't exist. The content authoring has outpaced world building.

**Affected Systems:**
- Main Tutorial (9 phases)
- Skill Academy (27 quests)
- Combat encounters (training dummies)
- NPC interactions (mentors)

### 2. Location Connectivity
Locations exist in data but lack travel connections, making them unreachable.

**Affected Locations:**
- Abandoned Mine
- Potentially other "frontier" locations

---

## Recommendations

### Priority 1: Critical Fixes (Blocking All Tutorials)

1. **Add Mentor NPCs to Game World**
   - Iron Jack Thornwood at Western Outpost or Red Gulch
   - Silk Viola Marchetti at The Hideout or Villa Esperanza
   - Walking Moon at Sacred Springs or Kaiowa Mesa
   - Augustus "Gus" Hornsby at Railroad Camp or Settler's Fort

2. **Add Training Objects**
   - Training dummies for combat practice
   - Practice locks for lockpicking
   - Target range for shooting

3. **Fix Location Connectivity**
   - Add connections to Abandoned Mine
   - Or redirect tutorial to existing mining location

4. **Fix Skip Tutorial Behavior**
   - Add "Skip Section" option
   - Add confirmation for "Skip All"
   - Allow tutorial resume from settings

### Priority 2: Content Completion

5. **Complete Tutorial Phase Content**
   - Ensure all 9 phases can be completed end-to-end
   - Add combat encounters for training

6. **Quest Objective Validation**
   - Verify all quest targets exist before allowing quest start
   - Show "Coming Soon" for unavailable quests

### Priority 3: Polish

7. **Tutorial UX Improvements**
   - Make ACTION REQUIRED more prominent
   - Add waypoint/arrow to action target
   - Auto-navigate option for travel objectives

---

## Test Environment

| Component | Status |
|-----------|--------|
| Server | Running (nodemon) |
| Client | Vite dev server (localhost:5173) |
| Database | MongoDB (connected) |
| Browser | Chrome (DevTools MCP) |
| Test Duration | ~45 minutes |

---

## Files Modified During Playtest

None - this was a read-only playtest session. Bugs documented for later fixing.

---

## Previous Fixes Verified

| Bug | Fix | Status |
|-----|-----|--------|
| BUG-001 | Character schema min/max values | VERIFIED |
| BUG-002 | Travel buttons covered by chat | VERIFIED |
| BUG-003 | Academy buttons covered by chat | VERIFIED |

---

## Conclusion

The core game engine and UI systems are functional and engaging. The Destiny Deck poker mechanic for jobs is innovative and works well. The mentor personalities are distinctive and thematic.

However, **the tutorial and skill academy systems are completely blocked** due to missing NPCs, locations, and training objects. The content layer (quests, dialogue) has been authored but the corresponding world content (NPCs, locations, interactive objects) has not been implemented.

**Critical Path to Playable Beta:**
1. Add 4 mentor NPCs to the game world
2. Add training objects (dummies, targets, locks, etc.)
3. Fix location connectivity
4. Ensure all tutorial phases can complete

**Estimated Work:** 2-4 hours to unblock tutorials, assuming NPC and object spawn systems exist.

---

*Report generated by autonomous playtest using Chrome DevTools MCP*
