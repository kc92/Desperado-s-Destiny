# Destiny Deck System - Test Report

**Date:** 2026-01-16
**Tester:** Claude (Automated Testing)
**Environment:** Production (desperadosdestiny.com)

---

## Executive Summary

Testing revealed **critical bugs** that make the Destiny Deck system **non-functional in production**. The system fails to process game actions, loses game state on page reload, and has fundamental issues with card selection and scoring logic.

### Severity Overview

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 3 | System-breaking bugs |
| **High** | 4 | Major functionality issues |
| **Medium** | 2 | Incorrect behavior |

---

## Critical Bugs

### BUG-001: API Requests Being Aborted (CRITICAL)

**Severity:** Critical
**Location:** Client-side API calls to `/api/locations/current/jobs/{jobId}/play`
**Impact:** Deck game is completely unusable

**Steps to Reproduce:**
1. Start a job that uses Destiny Deck (e.g., "Smuggle Goods")
2. Complete Turn 1 (cards dealt successfully)
3. Attempt to draw/redraw cards on Turn 2
4. Observe "Failed to process action" error

**Expected:** API call succeeds and game progresses
**Actual:** All API requests fail with `net::ERR_ABORTED`

**Evidence:**
```
reqid=2568 POST .../smuggle-goods/play [failed - net::ERR_ABORTED]
reqid=2572 POST .../smuggle-goods/play [failed - net::ERR_ABORTED]
reqid=2576 POST .../smuggle-goods/play [failed - net::ERR_ABORTED]
```

**Request Body (valid):**
```json
{"gameId":"f5c7773d-075e-49bf-97ba-bd5759c7e8d2","action":{"type":"draw","cardIndices":[]}}
```

**Root Cause:** Unknown - requires server-side investigation. Possible causes:
- CORS misconfiguration
- Request timeout/cancellation
- Server-side error causing connection reset

---

### BUG-002: Deck Game State Not Persisted (CRITICAL)

**Severity:** Critical
**Location:** `server/src/services/deckGames/` - In-memory game storage
**Impact:** Game progress lost on any disconnection

**Steps to Reproduce:**
1. Start a deck game
2. Progress to Turn 2
3. Refresh the page (or lose connection)
4. Re-login and select character

**Expected:** Game state preserved, can resume
**Actual:** Game completely lost, no recovery possible

**Evidence:**
- After page reload, deck game modal no longer appears
- No UI to resume previous game
- Energy/cooldown status unknown (possibly consumed)

**Root Cause:** Games are stored in server memory (`Map` objects), not in MongoDB:
```typescript
// server/src/services/deckGames/actions/poker.ts
// Game state stored only in local Map, lost on server restart or connection loss
```

---

### BUG-003: Card Selection Not Clickable (CRITICAL)

**Severity:** Critical
**Location:** `client/src/components/game/deckgames/PokerHoldDraw.tsx`
**Impact:** Cannot hold cards - core game mechanic broken

**Steps to Reproduce:**
1. Start a deck game
2. Wait for cards to be dealt
3. Attempt to click on any card to hold it
4. Observe that click does not register

**Expected:** Card shows "HOLD" indicator, green ring, lifted position
**Actual:** Card click times out, no visual change, no state update

**Evidence:**
- Cards render as `<image>` elements in accessibility tree, not interactive buttons
- Click timeout on card elements
- Only "Draw", "Cash Out", and "Forfeit" buttons are interactive

**Root Cause:** Card buttons may not be properly accessible/clickable. Possible issues:
- Event handlers not attached to card elements
- CSS `pointer-events: none` blocking clicks
- Z-index issues with overlay elements

---

## High Severity Bugs

### BUG-004: Ace-Low Straight Not Detected

**Severity:** High
**Location:** `server/src/services/deckGames/deck/pokerHand.ts:checkStraight()`
**Impact:** Players lose points on valid poker hands

**Code Issue:**
```typescript
// Line ~15-20: Ace is ALWAYS treated as 14
if (c.rank === Rank.ACE) return 14;  // Never returns 1
```

**Expected:** A-2-3-4-5 (wheel) scores as Straight (500 pts)
**Actual:** A-2-3-4-5 scores as High Card (100 pts)

---

### BUG-005: Kickers Ignored in Hand Scoring

**Severity:** High
**Location:** `server/src/services/deckGames/deck/pokerHand.ts:evaluatePokerHand()`
**Impact:** Wrong winner in competitive scenarios, unfair scoring

**Code Issue:**
```typescript
// Fixed scores without kicker consideration
if (counts[0] === 2 && counts[1] === 2) return { handName: 'Two Pair', score: 200 };
if (counts[0] === 2) return { handName: 'One Pair', score: 100 };
// Two players with K-K-x-x-x both get 100 points regardless of kickers
```

**Expected:** K-K-A-9-5 > K-K-Q-9-5 (Ace kicker beats Queen)
**Actual:** Both hands score identically

---

### BUG-006: No Hold Index Validation

**Severity:** High
**Location:** `server/src/services/deckGames/actions/poker.ts:processAction()`
**Impact:** Potential game state corruption, exploits possible

**Code Issue:**
```typescript
// HOLD action accepts any indices without validation
if (action.type === 'hold') {
  state.heldCards = action.cardIndices || [];  // No bounds checking!
  return state;
}
```

**Expected:** Reject indices outside 0-4 range
**Actual:** Invalid indices [-1, 5, 100] are accepted

---

### BUG-007: Server Error - Skills Endpoint Failing

**Severity:** High
**Location:** `/api/skills` endpoint
**Impact:** Skill system unavailable, error toast shown on game load

**Evidence:**
```
[ERROR] Failed to get skills
SERVER ERROR: "Failed to get skills"
```

**Root Cause:** Server responding with 500 error on skills endpoint

---

## Medium Severity Bugs

### BUG-008: CORS Errors on World State Endpoints

**Severity:** Medium
**Location:** `/api/world/events`, `/api/world/state`
**Impact:** World events not loading, stale data displayed

**Evidence:**
```
Access to XMLHttpRequest at 'https://api.desperadosdestiny.com/api/world/events'
from origin 'https://www.desperadosdestiny.com' has been blocked by CORS policy
```

---

### BUG-009: Socket Connection Errors

**Severity:** Medium
**Location:** WebSocket connection to server
**Impact:** Real-time features (chat, notifications) not working

**Evidence:**
```
[ERROR] [Socket] Connection error (multiple instances)
[WARN] Chat socket connection failed, will retry on room join
```

---

## Test Environment Issues

During testing, the following environment issues were observed:

1. **Rate Limiting (429):** Multiple login attempts were rate-limited
2. **Network Errors:** Intermittent `net::ERR_FAILED` on various endpoints
3. **Session Loss:** Session was invalidated during testing, requiring re-login

---

## Recommendations

### Immediate Actions (P0)

1. **Investigate API request abortion** - Why are deck game requests failing?
2. **Add database persistence for deck games** - Critical for production reliability
3. **Fix card click handlers** - Core gameplay broken

### Short-term Fixes (P1)

4. **Fix Ace-low straight detection** in `pokerHand.ts`
5. **Implement kicker scoring** for tie-breaking
6. **Add hold index validation** (bounds checking)
7. **Fix CORS headers** for world state endpoints

### Architecture Improvements (P2)

8. **Move game state to MongoDB** with proper session recovery
9. **Add proper error handling** and retry logic for API calls
10. **Implement WebSocket reconnection** with exponential backoff

---

## Test Artifacts

Screenshots saved to:
- `scratchpad/destiny_deck_error_state.png` - Error message during gameplay
- `scratchpad/destiny_deck_initial.png` - Initial hand state
- `scratchpad/destiny_deck_turn2_pair.png` - Turn 2 with pair

---

## Appendix: Code Analysis References

### Files Analyzed

| File | Lines of Interest |
|------|-------------------|
| `server/src/services/deckGames/deck/pokerHand.ts` | 15-20 (Ace handling), 45-60 (scoring) |
| `server/src/services/deckGames/actions/poker.ts` | 25-35 (hold action) |
| `client/src/components/game/deckgames/PokerHoldDraw.tsx` | Card click handlers |
| `client/src/components/game/deckgames/DeckGame.tsx` | Game orchestration |

### Existing Unit Test Results

The shared package tests pass, but they test the **client-side** hand evaluation which differs from the server-side implementation:

- `shared/src/utils/destinyDeck.utils.ts` - Uses correct scoring with kickers
- `server/src/services/deckGames/deck/pokerHand.ts` - Simplified scoring without kickers

This discrepancy means client and server could disagree on hand rankings.
