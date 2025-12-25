# Legendary Hunts System Audit Report

## Overview
The Legendary Hunts system manages single-player encounters against powerful legendary animals with discovery mechanics, combat sessions, and reward distribution.

## Files Analyzed
- Server: legendaryHunt.service.ts, legendaryCombat.service.ts, LegendaryHunt.model.ts
- Data: legendaryAnimals.ts

## What's Done Well
- Discovery system with clue locations and skill requirements
- Comprehensive hunt record model with tracking
- Leaderboard generation
- Phase management with health thresholds
- Ability cooldown system
- Difficulty rating calculation
- Completion rewards (gold, XP, items, titles)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Sessions not persisted | legendaryCombat.service.ts:23 | activeSessions Map in-memory only | Move to MongoDB |
| No character validation | legendaryCombat.service.ts:76, 245 | References character.stats without check | Validate character exists |
| No ownership check | legendaryHunt.controller.ts:375 | Can attack someone else's hunt | Verify characterId matches session |
| Defense calculation wrong | legendaryCombat.service.ts:245 | Uses combat stat as defense | Use defense stat |
| No death check | legendaryCombat.service.ts:73-80 | Dead player can attack | End encounter if health <= 0 |
| No damage cap | legendaryCombat.service.ts:142-145 | Can send 999999 damage | Cap to characterLevel * 50 |
| Minion damage stacking | legendaryCombat.service.ts:306-312 | All added without accountability | Track minion HP separately |
| Negative health possible | legendaryCombat.service.ts:156 | No Math.max(0, ...) | Add lower bound |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Session not saved after complete | legendaryCombat.service.ts:461 | Deleted without saving details | Persist before delete |
| Phase abilities not updated | legendaryCombat.service.ts:385-397 | Boss uses old phase abilities | Update after phase change |
| No health scaling | legendaryHunt.service.ts:414 | Same health for all character levels | Scale by level difference |
| Cooldown not set first use | legendaryCombat.service.ts:293-294 | Only if ability exists | Always set cooldown |
| Turn count off-by-one | legendaryCombat.service.ts:62, 68 | Increment before checking death | Check death before increment |
| Status effects never expire | legendaryCombat.service.ts:252 | Duration never ticked | Tick at end of turn |
| Missing newspaper headline | legendaryCombat.service.ts:455 | Field might not exist | Add fallback string |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No enrage timer | legendaryCombat.service.ts | No time limit | Add enrageAt field |
| Items not added to inventory | legendaryHunt.service.ts:558-567 | Rolled but not stored | Add to inventory |
| Flee doesn't end session | legendaryCombat.service.ts:194-205 | Returns but session active | End encounter on flee |
| Multiple hunts allowed | legendaryHunt.service.ts:330-436 | Can have concurrent hunts | Check for active hunt |
| Difficulty ignores stats | legendaryCombat.service.ts:551-555 | Only level difference | Include combat stat |

## Bug Fixes Needed
1. **CRITICAL** - Move activeSessions to MongoDB
2. **CRITICAL** - Add `if (session.characterId !== characterId) throw` ownership check
3. **CRITICAL** - Use defense stat: `(character.stats.defense || 0) * 2`
4. **CRITICAL** - Check `character.stats.currentHealth <= 0` before processing
5. **CRITICAL** - Cap damage: `Math.min(damage, characterLevel * 50)`
6. **CRITICAL** - Use `Math.max(0, legendaryHealth - damage)`
7. **HIGH** - Persist session to MongoDB before deleting from memory
8. **HIGH** - Scale health: `legendary.health * (1 + levelDiff * 0.1)`

## Incomplete Implementations
- Persistent Session Storage - only in-memory
- Item Inventory Integration - items awarded but not stored
- Environmental Hazards - not triggered in phases
- Minion Summoning - spawned but health/death not tracked
- Enrage Timer - no time limit enforcement
- Flee Mechanic - doesn't end encounter
- Effect Duration - applied but never ticked
- News Integration - headline generated but not posted

## Security Issues
- **CRITICAL**: No ownership validation - can hijack sessions
- Session IDs might be guessable

## Recommendations
1. **IMMEDIATE (P0)**: Fix ownership check (critical security)
2. **IMMEDIATE (P0)**: Fix defense calculation (inverted balance)
3. Add session persistence to MongoDB
4. Validate character exists/alive
5. Cap damage based on stats
6. Fix minion damage stacking
7. Implement health scaling

## Estimated Fix Effort
- Critical fixes: 8 hours
- High fixes: 5 hours
- Medium fixes: 4 hours
- Total: 17 hours

**Overall Score: 4/10** (Critical security and gameplay issues)
