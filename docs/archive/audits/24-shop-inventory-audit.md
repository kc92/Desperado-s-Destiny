# Shop/Inventory System Audit Report

## Overview
The Shop/Inventory system handles buying, selling, equipping items with dual capacity constraints (slots + weight) and overflow handling.

## Files Analyzed
- Server: shop.service.ts, inventory.service.ts
- Client: useShop, useInventory (if exist)

## What's Done Well
- Atomic transaction handling for purchases
- Dual-constraint system (slots + weight)
- Overflow handling (pending rewards, ground drops)
- Price modifiers (faction reputation, NPC mood, world events)
- Groundwork for mounting bonuses

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Item duplication vulnerability | inventory.service.ts:193-196 | Concurrent addItems could duplicate | Use atomic operations |
| Gold race condition | shop.service.ts:176-181 | Stackable items not atomic | Use atomic deduction |
| Production bypasses inventory | production.service.ts:349-361 | Direct push ignores capacity | Use InventoryService |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No max quantity validation | inventory.service.ts:158-162 | Could request 999,999 | Add MAX_QUANTITY |
| Weight always 1 | inventory.service.ts:120-131 | TODO comment, system useless | Implement item weights |
| Ground items sort field | inventory.service.ts:467-470 | droppedAt doesn't exist | Use createdAt or expiresAt |
| Inventory type cast | inventory.service.ts:305-320 | `as any` hides issues | Fix type definitions |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No item existence validation | shop.service.ts:56-62 | No required field checks | Validate all fields |
| Stackable/non-stackable paths different | shop.service.ts:156-241 | Inconsistent transaction records | Unify paths |
| Capacity check wrong with weight=1 | inventory.service.ts:187-214 | Could accept items that don't fit | Fix after weight impl |
| N+1 in getInventoryWithDetails | shop.service.ts:418-427 | 50 items = 50 queries | Batch load items |

## Bug Fixes Needed
1. **CRITICAL - inventory.service.ts:193-196** - Use MongoDB atomic $push or findOneAndUpdate
2. **CRITICAL - shop.service.ts:176-181** - Use atomic gold deduction for stackable items
3. **CRITICAL - production.service.ts:349-361** - Route through InventoryService.addItems()
4. **HIGH - inventory.service.ts:120-131** - Implement actual item weight system

## Incomplete Implementations
- Item weight system (all items = 1)
- Crafting to inventory integration (duplicate code likely)
- Production to inventory integration (bypasses constraints)

## Integration Issues
- Production system manually pushes to inventory, bypassing capacity checks
- Crafting system likely has similar issues

## Recommendations
1. **IMMEDIATE**: Fix item duplication with atomic operations
2. **IMMEDIATE**: Fix gold race condition in stackable path
3. **IMMEDIATE**: Route production through InventoryService
4. Implement actual item weight system
5. Fix ground items sort field
6. Add MAX_QUANTITY constant
7. Batch load items in details query
8. Unify purchase paths

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 4 hours
- Medium fixes: 3 hours
- Total: 13 hours

**Overall Score: 4/10** (Critical item duplication and gold exploits)
