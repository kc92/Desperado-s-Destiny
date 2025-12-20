# Bribe System Audit Report

## Overview
The Bribe System handles NPC and guard bribery mechanics with success probability calculations, criminal reputation tracking, and transaction safety. Clean separation between guard bribes (instant access) and NPC bribes (probabilistic information). Integrates with GoldService for transaction logging.

## Files Analyzed
- Server: bribe.service.ts, bribe.controller.ts, bribe.routes.ts
- Client: useBribe.ts

## What's Done Well
- Proper MongoDB transaction handling for all gold operations
- Dual bribe types with distinct mechanics (guards vs NPCs)
- Success probability calculation based on amount + character cunning
- Criminal reputation system integrated with bribe operations
- Clean error handling in controllers with meaningful messages
- Character stat integration (cunning multiplier for NPC bribes)
- Audit trail via GoldService transaction logging
- Failed bribe penalty (50% gold loss) incentivizes success
- Clean client hook with proper typing and error handling

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Guard bribe has no cooldown | bribe.service.ts:24-87 | Can bribe same guard unlimited times for 30 min access each | Implement cooldown (30+ minutes) or one-time-per-session |
| No NPC disposition tracking | bribe.service.ts:92-189 | NPC reaction doesn't affect future bribe cost or success chance | Track NPC relationship and apply multiplier to future bribes |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Success formula doesn't account for NPC type | bribe.service.ts:120-126 | Generic 50% base chance ignores if NPC is merchant vs guard vs noble | Create NPC type multipliers in calculation |
| Failed bribe doesn't refund some gold | bribe.service.ts:159-181 | Loses 50% on failure which is harsh; no negotiation mechanic | Consider partial success (get some info for 50% cost) |
| Criminal reputation too low penalty | bribe.service.ts:143 | +2 reputation on NPC bribe seems low; should reflect corruption | Increase to 5+ or tie to NPC danger level |
| Bribe amount validation too loose | bribe.controller.ts:79-85 | Only checks amount > 0, not if it exceeds character's actual gold | Add: `if (amount > character.gold) throw new AppError(...)` |
| No regional difficulty modifiers | bribe.service.ts:194-207 | Bribe cost same everywhere; doesn't account for location economy | Add location multiplier |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Cunning stat value not documented | bribe.service.ts:122 | `character.stats.cunning * 2` multiplier is magic number | Document: max cunning = X, so max bonus = Y |
| Guard bribe building access undefined | bribe.service.ts:77 | Returns success but doesn't actually grant building access | Define access token/duration storage mechanism |
| No calculation endpoint return format | bribe.routes.ts:26 | GET /bribe/calculate exists but controller incomplete | Complete getBuildingOptions implementation |
| Client doesn't validate NPC exists | useBribe.ts:145-168 | Accepts any npcId without verification | Add NPC existence check before sending |
| Missing bribe history tracking | bribe.service.ts:24-87 | No record of previous successful bribes to same NPC | Track in NPC disposition model for relationship mechanics |

## Bug Fixes Needed
1. **bribe.service.ts:24-87** - Add cooldown check for guard bribes
2. **bribe.service.ts:120-126** - Add NPC type calculation and document formula
3. **bribe.service.ts:143** - Increase criminal rep penalty to 5+
4. **bribe.controller.ts:79-85** - Add amount validation against character gold
5. **bribe.service.ts:194-207** - Implement location economy multiplier in calculation
6. **bribe.routes.ts:26-32** - Complete getBuildingOptions controller implementation

## Incomplete Implementations
- Building access grant mechanism (success but no persistence)
- NPC disposition/relationship system (affects future bribes)
- Multiple NPC bribe success paths (info tiers)
- Regional economy bribe modifiers
- Guard cooldown tracking
- Bribe history and statistics
- Criminal network reputation integration

## Recommendations
1. Implement NPC disposition/relationship model to track bribe history
2. Add cooldown system preventing re-bribe of same guard within X minutes
3. Create building access token system with persistence
4. Implement location economy multipliers for regional balance
5. Add NPC type (merchant/guard/noble) with different bribe mechanics
6. Create criminal reputation tier system affecting bribe costs
7. Implement partial success for NPC bribes (reduced info for lower cost)
8. Add bribe success/failure analytics for balance monitoring
9. Link guard bribes to specific building access restrictions
10. Create reputation spread mechanic (NPCs talk about who bribes them)

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 6 hours
- Medium fixes: 4 hours
- Total: 14 hours

**Overall Score: 7.5/10** (Solid core functionality with good transaction safety and stat integration; missing relationship mechanics and some feature completeness)
