# Gang Wars System Audit Report

## Overview
Gang Wars System manages territory conflicts with raid contributions via deck games, champion duels, and leader showdowns. Integrates with gang economy and deck games with real-time Socket.io updates.

## Files Analyzed
- Server: gangWar.service.ts, gangWarDeck.service.ts, GangWar.model.ts, gangWar.controller.ts, gangWar.routes.ts
- Client: useGangStore.ts (war handling)

## What's Done Well
- Transaction-Safe War Declaration: Atomically deducts funding and creates war record
- Contribution Mechanics: Members contribute gold to push capture points
- Deck Game Integration: Raids use Press Your Luck, duels/showdowns use Poker
- Raid Points Scaling: Win=5pts, Loss=1pt, multiplied by suit bonus
- Champion Duel System: Selected champions get 25pts per win
- Leader Showdown: High-stakes final decision with 50pts swing
- War Expiration: Auto-resolves at 24-hour mark via cron job
- Socket.io Events: Real-time war updates (declared, contributed, resolved, raided)
- War Logging: Comprehensive war log with timestamps and events
- Territory Ownership: Winner gains territory, loser loses it

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Capture points can exceed 200 or go negative | gangWarDeck.service.ts:219-222 | Math.min/max prevent overflow but tested incorrectly | Verify: min(200, x), max(0, y) applied correctly |
| Character energy never regenerated in raids | gangWarDeck.service.ts:88-91 | regenerateEnergy() called but energy deduction has no regen delay | Raid energy cost (10) locks player, no regeneration mechanics |
| War resolution can crash if gang null | gangWar.service.ts:289-296 | Checks for gang but error message references it unsafely | Add defensive null checks |
| Raid game state can be abandoned | gangWarDeck.service.ts:109-114 | activeRaids Map can leak memory if client crashes mid-raid | Add timeout cleanup (5 min max raid duration) |
| Champion duel doesn't exist check missing | gangWarDeck.service.ts:301-302 | championDuels.has() can be stale | Verify war status ACTIVE before allowing challenge |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Member raid cooldown unenforced | gangWarDeck.service.ts:108-114 | Checks activeRaids but doesn't track per-character cooldown | Add 5-minute cooldown per character per territory |
| Raid points applied immediately | gangWarDeck.service.ts:218-222 | capturePoints updated before war saved | Could miss if save fails |
| War funding minimum not validated | gangWar.service.ts:35-37 | Only checks funding < 1000 | Should also validate against character/gang gold |
| Contribution doesn't check war active | gangWar.service.ts:185 | Only checks status but war could be in grace period | Add check that war not past resolve time |
| War log doesn't track character contributions | gangWar.service.ts:226 | Contribute event added but individual contributions not tracked | Add contributor array to track who contributed how much |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Showdown requires 30-point range | gangWarDeck.service.ts:520 | abs(cp - 100) > 30 prevents most games | Range may be too tight, consider 50-point window |
| Champion selection no validation | gangWarDeck.service.ts:289-298 | Assumes champions exist and are in correct gangs | Should validate before starting duel |
| Raid game doesn't prevent abuse | gangWarDeck.service.ts:117-123 | Game difficulty/suit hardcoded, no variety | Randomize suit, difficulty based on war intensity |
| In-memory state loss on server restart | gangWarDeck.service.ts:59-61 | activeRaids, championDuels, leaderShowdowns lost | Persist to database or queue system |
| War history pagination inefficient | gangWar.service.ts:399-418 | No timestamp indexing mentioned | Query could scan many documents |

## Bug Fixes Needed
1. **CRITICAL - gangWarDeck.service.ts:88-91** - Character energy deducted but no regeneration mechanics
2. **CRITICAL - gangWarDeck.service.ts:109-114** - Raid games can leak memory, no timeout cleanup
3. **HIGH - gangWar.service.ts:35-37** - War funding not validated against actual balance
4. **HIGH - gangWarDeck.service.ts:226** - Contribution event logged but individual contributions not tracked
5. **MEDIUM - gangWarDeck.service.ts:117-123** - Game parameters hardcoded
6. **MEDIUM - gangWarDeck.service.ts:59-61** - In-memory maps lost on server restart

## Incomplete Implementations
- War alliances system (WarAlliance type defined but not used)
- War prisoners system (WarPrisoner type defined, no ransom mechanics)
- War battles system (WarBattle type defined, no battle resolution)
- War casualties system (WarCasualty type defined, no death mechanics)
- War missions system (WarMission type defined, no missions generated)
- Gang war deck cards (no card-specific bonuses or tactics)
- War intel/scouting phase (no pre-war intelligence)
- War phases (only ACTIVE/RESOLVED, no PLANNING/PREPARATION)
- Territory morale damage (losers don't lose morale)
- War costs escalation (defending doesn't cost gold over time)
- Raid team cooperation (each raid independent, no synergy)
- Champion selection UI missing
- War notifications to defending gang missing

## Recommendations
1. **IMMEDIATE**: Fix character energy regeneration
2. Add timeout cleanup to in-memory maps (5-min max per active game)
3. Validate war funding against character gold balance
4. Add per-character raid cooldown enforcement (5 minutes minimum)
5. Implement individual contribution tracking in war log
6. Add champion selection with validation before duel starts
7. Implement game state persistence (database or Redis) for server restarts
8. Complete alliances, prisoners, and battles systems
9. Add defending gang notifications of incoming attacks

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 6 hours
- Medium fixes: 5 hours
- Total: 16 hours

**Overall Score: 4/10** (Core mechanics working but energy system broken, in-memory state loss, many unimplemented features)
