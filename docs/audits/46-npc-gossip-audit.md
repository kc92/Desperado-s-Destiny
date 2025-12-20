# NPC Gossip System Audit Report

## Overview
System 46 implements a gossip spreading system where NPCs share information through their social networks. It handles gossip creation from game events, spreading through NPC relationships, reputation impact tracking, and NPC opinion formation based on what they've heard. Gossip degrades in truthfulness as it spreads through hops.

## Files Analyzed
- Server: gossip.service.ts, reputationSpreading.service.ts, gossip.controller.ts
- Shared: gossip.types.ts
- Data: npcRelationships.ts

## What's Done Well
- Clean event-driven gossip generation in GossipService.onGameEvent
- Well-structured hop-based spreading algorithm with magnitude degradation
- Comprehensive gossip types and categories defined in types
- Opinion generation based on relationship strength and type
- Batch processing in reputationSpreading service prevents memory exhaustion
- Proper error handling and logging throughout
- Flexible gossip configuration system with event-specific parameters
- Detailed dialogue modifications based on NPC reactions

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No verification that origin NPC exists | gossip.service.ts:65-112 | createGossip accepts any npcId without validation | Add check: const npc = await NPC.findById(originNpc) |
| Missing transaction safety in spreadGossip | gossip.service.ts:154-187 | Multiple NPCs updated without transaction; partial spreads possible | Wrap entire spread in transaction |
| No bounds checking on random sentiment change | reputationSpreading.service.ts:228-230 | Exaggeration can flip sentiment entirely | Add bounds: max 20% sentiment change |
| Race condition in hop distance tracking | reputationSpreading.service.ts:140-192 | Parallel spreads could cause same NPC to get conflicting hop distances | Use atomic operations or locking |
| Unsafe dynamic import without error handling | reputationSpreading.service.ts:261-262 | Dynamic import of relationship data could fail silently | Wrap in try-catch with fallback |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No validation of gossip category enum | gossip.service.ts:65-112 | Any string accepted as category without validation | Add: if (!Object.values(GossipCategory).includes(category)) throw |
| Hard-coded gossip content templates | gossip.service.ts:117-149 | Simple template system doesn't generate varied gossip | Implement actual template engine with variables |
| Missing NPC knowledge lookup | gossip.service.ts:300-308 | getGossipAboutNPC doesn't verify NPC exists | Add NPC existence check |
| No duplicate gossip prevention | gossip.service.ts:65-112 | Same gossip can be created multiple times from same event | Check if gossip already exists before creating |
| Spreading to same NPC multiple times | reputationSpreading.service.ts:305-330 | shareChance uses Math.random without deduplication | De-duplicate connected NPCs before spreading |
| Credibility never increases over time | reputationSpreading.service.ts:233 | Credibility always decreases with hops, never recovers | Add: if (source === WITNESSED) credibility = 100 |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Batch size hardcoded | reputationSpreading.service.ts:525, 588 | BATCH_SIZE = 100 not configurable | Make configurable via constants file |
| No gossip expiration enforcement | gossip.service.ts:404-406 | cleanupOldGossip called but no scheduler | Implement cron job or background worker |
| Gossip truthfulness never recovers | gossip.service.ts:65-112 | Once created, gossip truthfulness can't improve | Add witness verification mechanic |
| Missing relationship strength normalization | reputationSpreading.service.ts:320 | shareChance formula assumes strength 0-10 | Add bounds: Math.max(0, Math.min(1, conn.strength / 10)) |
| No maximum gossip versions | gossip.types.ts:1-83 | Gossip can be distorted indefinitely | Add: currentVersion > maxVersions -> forget gossip |

## Bug Fixes Needed
1. **gossip.service.ts:65-112** - Add origin NPC validation before creating
2. **reputationSpreading.service.ts:228-230** - Cap sentiment exaggeration: Math.max(-100, Math.min(100, sentiment + exaggeration))
3. **reputationSpreading.service.ts:305-330** - De-duplicate: const connected = [...new Set(nextHopNPCs)]
4. **reputationSpreading.service.ts:261-262** - Add fallback for missing relationship data
5. **gossip.service.ts:154-187** - Wrap spreadGossip in transaction
6. **gossip.service.ts:300-308** - Add NPC existence check before lookup

## Incomplete Implementations
- Player-driven gossip creation: Only system can create gossip, players can't start rumors
- Gossip contradiction system: No mechanic for conflicting gossip to reduce credibility
- Gossip verification: No way to verify/debunk gossip through evidence
- Gossip absorption into canon: No mechanism for gossip to become "accepted truth"
- NPC embellishment preferences: All NPCs embellish equally regardless of personality
- Visual gossip chains: No way to see how gossip spread or who told whom

## Recommendations
1. **IMMEDIATE**: Add transaction safety to gossip spreading
2. Implement enum validation for gossip categories
3. Add NPC existence verification before creating/spreading gossip
4. Implement proper template system for gossip generation
5. Add de-duplication in NPC spreading to prevent double-spreads
6. Implement scheduled cleanup of expired gossip
7. Add gossip verification/debunking mechanic

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 10 hours
- Medium fixes: 8 hours
- Total: 24 hours

**Overall Score: 6.5/10** (Good architecture with hop-based spreading, but significant transaction safety issues, missing validation, and incomplete content generation)
