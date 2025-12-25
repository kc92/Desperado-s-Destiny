# PvE Combat System Audit Report

## Overview
The PvE Combat system implements turn-based encounters where players engage NPCs with card-driven damage calculation, HP management, and loot distribution.

## Files Analyzed
- Server: combat.controller.ts, combat.service.ts, combat.routes.ts
- Client: useCombatStore.ts, Combat.tsx

## What's Done Well
- Solid architecture & separation of concerns
- Comprehensive combat flow (encounter lifecycle)
- Excellent database safety (atomic operations, batch queries)
- Smart damage calculation (poker hand-based, skill bonuses)
- Complete loot system (gold, XP, items, first-kill bonuses)
- Robust error handling

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Turn race condition | combat.service.ts:321-327 | Two requests could both deal damage in one round | Use atomic find-and-update with turn validation |
| Energy cost not transactional | combat.service.ts:183-191 | Energy bypass if save fails after encounter creation | Move energy deduction after encounter or use transaction |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Damage calculation bias | combat.service.ts:266, 406 | NPC gets difficulty modifier, player doesn't | Apply difficulty to both or neither |
| Quest failure silent | combat.service.ts:525-531 | Quest update fails silently | Log warnings, consider throwing |
| NPC type check for loot | combat.service.ts:290-294 | Legendary drops only for bosses | Check drop table not just NPC type |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No NPC level validation | combat.controller.ts:48-51 | High-level NPCs vs low-level chars | Compare character level to NPC |
| Death penalty enum mismatch | combat.service.ts:346-369 | String vs enum comparison | Use proper DeathType enum |
| Incomplete flee combat | combat.service.ts:596-641 | HP not restored after flee | Reset or document behavior |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| NPC deactivation bloat | combat.service.ts:551-556 | Defeated NPCs persist | Implement soft-delete with TTL |

## Bug Fixes Needed
1. **CRITICAL - combat.service.ts:321-327** - Use `CombatEncounter.findOneAndUpdate({_id, turn: 0}, {turn: 1})` for atomic turn management
2. **CRITICAL - combat.service.ts:183-191** - Wrap encounter creation and energy deduction in single transaction
3. **HIGH - combat.service.ts:266, 406** - Apply difficulty modifier to player damage calculation too
4. **MEDIUM - combat.service.ts:346-369** - Use proper DeathType enum: `DeathType.LAWMAN`

## Incomplete Implementations
- AI/NPC Skill Usage - NPCs don't use special abilities
- Environmental Effects - No location-based modifiers
- Equipment Impact - Equipment exists but doesn't affect damage
- Combo System - No multipliers for consecutive wins
- Combat Statistics Aggregation - Stats tracked but no queries

## Recommendations
1. **IMMEDIATE**: Fix turn race condition with atomic operations
2. **IMMEDIATE**: Wrap energy/encounter in transaction
3. Apply difficulty modifier consistently
4. Add level validation before combat
5. Implement equipment damage bonuses

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 3 hours
- Medium fixes: 2 hours
- Total: 9 hours

**Overall Score: 6/10** (Critical race condition affects gameplay)
