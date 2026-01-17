# Desperados Destiny - Playtest Bug Log

**Playtest Date:** 2026-01-16
**Tester:** Claude (Automated Browser Playtest)
**Account:** claude.outlaw.test@gmail.com
**Character:** DustyOutlaw (Frontera)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 1 |
| Medium | 1 |
| Low | 0 |

---

## Bugs Found

### BUG-001: Server Error "Failed to get skills" on Game Load
**Severity:** Medium
**Location:** /game (main game page)
**Steps to Reproduce:**
1. Login to account
2. Select character and click "Play"
3. Wait for game to load
**Expected:** Game loads without errors
**Actual:** Server error toast appears: "Failed to get skills"
**Notes:** Game still loads and appears functional. Error may be related to skills API endpoint. Dismissable error toast. Reproduces on every page reload.

### BUG-002: Tutorial Progress Resets on Page Reload
**Severity:** High
**Location:** Tutorial system (client-side state)
**Steps to Reproduce:**
1. Start the tutorial (Frontera Job section)
2. Progress through several steps (reached Step 3/5)
3. Refresh the page (F5 or browser reload)
4. Observe tutorial state
**Expected:** Tutorial progress persists after page reload
**Actual:** Tutorial resets to Step 1/5, 0% Complete. All dialogue progress is lost.
**Notes:** Tutorial step progress appears to be stored only in client-side state (React useState or similar) and not persisted to the server or localStorage. This is a significant UX issue as users who refresh or navigate away lose all tutorial progress. Character location persisted correctly (still at Smuggler's Den), but tutorial step did not.

### BUG-003: Aggressive Rate Limiting Blocks All Gameplay (CRITICAL)
**Severity:** CRITICAL
**Location:** All API endpoints including authentication
**Steps to Reproduce:**
1. Login to the game
2. Navigate to a location (costs 3 energy)
3. Start a job (Smuggle Goods)
4. Click to hold 2 cards in the Destiny Deck card game
5. Click "Draw" button
6. Observe rate limiting error
7. Attempt any further action - all blocked
8. Even navigation or re-login becomes blocked
**Expected:** Normal gameplay actions should not trigger rate limiting
**Actual:**
- "Too many requests from this IP, please try again later" error appears
- Multiple toasts stack (2+ simultaneously)
- "Failed to process action" appears in card game modal
- "Failed to start job" when trying to retry
- Eventually even page navigation triggers logout
- Login itself becomes rate limited
**Impact:**
- Tutorial CANNOT be completed (blocked at job completion step)
- Cannot skip tutorial (requires completing 2 more steps first)
- Creates a catch-22: can't complete tutorial, can't skip tutorial
- New players would be completely stuck
- Game is essentially unplayable
**Notes:**
- Rate limiting is FAR too aggressive for normal gameplay
- Clicking 2-3 UI elements in a few seconds triggers the limiter
- The rate limiter appears to be IP-based and affects ALL endpoints
- Even authenticated users performing legitimate game actions are blocked
- The Destiny Deck card game requires quick interactions (hold multiple cards, then draw) which is impossible under current limits
- Rate limit appears to have a very long cooldown period (still blocked after 60+ seconds of inactivity)
**Recommendation:**
1. Increase rate limit thresholds significantly (at least 10-20 requests per second for authenticated users)
2. Implement per-endpoint rate limits instead of global IP limit
3. Whitelist game action endpoints from aggressive limiting
4. Do NOT apply rate limiting to UI interactions (hold card, draw card should be one logical action)
5. Ensure login endpoint has higher threshold than game endpoints

---

## Session Notes

**Start Time:** ~12:00 PM game time
**End Time:** Session blocked by rate limiting
**Total Duration:** ~15 minutes active testing before complete block

### Progression Tracking
- Starting Total Level: 30
- Ending Total Level: 30 (no progression possible due to rate limiting)
- Skills Trained: None (blocked)
- Gold Earned: $0 (blocked)
- Energy Used: 3 (for one travel action)

### Session Timeline
1. Successfully logged in and selected character
2. Observed "Failed to get skills" error on game load (BUG-001)
3. Started tutorial, progressed through dialogue
4. Navigated to Smuggler's Den (3 energy)
5. Page reload caused tutorial reset (BUG-002)
6. Re-progressed through tutorial dialogue
7. Started Smuggle Goods job - Destiny Deck card game
8. Held 2 Jacks (pair), attempted to draw
9. Hit rate limiting (BUG-003) - BLOCKED
10. Multiple retry attempts - all rate limited
11. Tried to skip tutorial - not allowed (need 2 more steps)
12. Tried to navigate to Skills page - got logged out
13. Tried to log back in - RATE LIMITED
14. PLAYTEST BLOCKED - Cannot continue

---

## Feature Checklist

- [x] Account login
- [x] Character selection
- [~] Tutorial - Faction intro (partial - dialogue worked, action blocked)
- [ ] Tutorial - Destiny Deck quiz (BLOCKED by rate limiting)
- [ ] Tutorial - Combat basics (BLOCKED by rate limiting)
- [ ] Tutorial - Economy basics (BLOCKED by rate limiting)
- [ ] Tutorial - Progression system (BLOCKED by rate limiting)
- [ ] Tutorial completion (BLOCKED by rate limiting)
- [ ] Skill training (BLOCKED by rate limiting)
- [ ] Training activities (BLOCKED by rate limiting)
- [ ] Resource gathering (mining) (BLOCKED by rate limiting)
- [ ] Resource gathering (other) (BLOCKED by rate limiting)
- [ ] Crafting (BLOCKED by rate limiting)
- [~] Jobs/actions (partial - started job, card game blocked)
- [ ] Crimes (BLOCKED by rate limiting)
- [ ] Jail system (BLOCKED by rate limiting)
- [ ] Wanted level (BLOCKED by rate limiting)
- [ ] Expeditions (BLOCKED by rate limiting)
- [x] Location travel (worked once - 3 energy)
- [ ] Quests (BLOCKED by rate limiting)
- [ ] Shops (buying) (BLOCKED by rate limiting)
- [ ] Shops (selling) (BLOCKED by rate limiting)
- [ ] Currency exchange (BLOCKED by rate limiting)
- [ ] Inventory management (BLOCKED by rate limiting)
- [ ] Equipment system (BLOCKED by rate limiting)
- [ ] Dueling (BLOCKED by rate limiting)
- [ ] Bounty hunting (BLOCKED by rate limiting)
- [ ] Legendary hunts (BLOCKED by rate limiting)
- [ ] Gang system (BLOCKED by rate limiting)
- [ ] Mail system (BLOCKED by rate limiting)
- [ ] Settings (BLOCKED by rate limiting)
- [ ] Leaderboard (BLOCKED by rate limiting)

---

## Experience Summary

**Overall Flow:** 2/10 (completely blocked by rate limiting)
**Tutorial Clarity:** 6/10 (dialogue was clear, but actions couldn't be completed)
**UI/UX Quality:** 7/10 (UI looks good when visible, but errors stack badly)
**Game Engagement:** N/A (unable to engage with core gameplay due to rate limiting)

### Major Friction Points
1. **CRITICAL: Rate limiting blocks ALL gameplay** - Cannot complete tutorial, cannot skip tutorial, cannot even re-login after being rate limited. This is a complete game-breaking issue.
2. **Tutorial progress not persisted** - Page reload resets tutorial to Step 1/5, losing all progress
3. **"Failed to get skills" error on every page load** - Minor but concerning server error
4. **Error toasts stack and don't auto-dismiss quickly** - Multiple rate limit toasts obscure the UI
5. **Cannot skip tutorial early** - Must complete 3/5 steps before skip is available, but rate limiting prevents this

### Best Features
1. **Visual design** - The Western aesthetic is well-executed with good typography and color scheme
2. **Location system** - Smuggler's Den had atmospheric description and clear navigation
3. **Tutorial dialogue** - Hawk mentor's dialogue was engaging and informative (before being blocked)
4. **Character stats display** - Sidebar shows all relevant info clearly (Energy, Dollars, Level, Stats)
5. **Event system** - Noticed active events (Supply Shortage, Faction Rally) which adds dynamism

### Recommendations
1. **URGENT: Fix rate limiting immediately** - Current config makes the game unplayable
   - Increase thresholds to at least 20-30 requests per 10 seconds
   - Implement sliding window instead of hard blocks
   - Separate game actions from authentication limits
2. **Persist tutorial progress** - Store in localStorage or server-side
3. **Fix skills API error** - Investigate why /api/skills endpoint fails on load
4. **Improve error handling** - Auto-dismiss toasts after 5 seconds, don't stack duplicates
5. **Allow earlier tutorial skip** - Let players skip after Step 1 if they want to explore freely

### Overall Assessment
**The game shows promise but is currently UNPLAYABLE due to rate limiting.** The visual design and game concept are appealing, but the aggressive rate limiting creates a complete blocker that prevents any meaningful testing or gameplay. This must be fixed before any further playtesting can occur.

No gameplay progression was possible. All core features remain untested due to this critical blocker.
