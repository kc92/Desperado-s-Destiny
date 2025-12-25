# Wandering NPCs System Audit Report

## Overview
The Wandering NPC system manages traveling merchants and service providers with schedules, trust relationships, and service offerings. It includes two complementary services: WanderingMerchantService handles merchant inventory/trading, and WanderingNPCService handles generic service providers. The system integrates with ScheduleService but has critical incomplete integrations.

## Files Analyzed
- Server: wanderingNpc.service.ts, wanderingMerchant.service.ts
- Client: useMerchants.ts (React hook)
- Data: wanderingServiceProviders.ts, wanderingMerchants.ts

## What's Done Well
- Well-designed trust system with progressive unlocks
- Service cost calculation with trust-based discounts properly implemented
- Comprehensive route scheduling with day-of-week and hour tracking
- Good service requirement checking with detailed failure reasons
- Excellent merchant search functionality
- Strong buy transaction handling with MongoDB sessions and atomic operations
- Detailed merchant statistics and upcoming arrival prediction
- Client-side React hook properly structured with proper error handling

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| TODO: Bounty Not Retrieved | wanderingNpc.service.ts:375 | checkServiceRequirements checks bounty but receives hardcoded 0; actual character bounty never fetched | Get bounty from Character model or service parameter |
| TODO: Payment Never Deducted | wanderingNpc.service.ts:406 | Comment explicitly says "TODO: Actually deduct payment"; service cost calculated but never charged | Implement gold deduction with transaction logging |
| TODO: Effects Never Applied | wanderingNpc.service.ts:435 | Comment says "TODO: Actually apply service effects to character"; service purchased but effects ignored | Call character service to apply buffs/effects |
| Relationship Persistence Missing | wanderingNpc.service.ts:183-184 | Relationships stored in-memory Map; lost on server restart. No database backing | Implement relationship persistence in MongoDB |
| Usage Records Lost | wanderingNpc.service.ts:184 | Service usage records stored in-memory only; no history or audit trail | Create ServiceUsageRecord collection in MongoDB |
| No Merchant Availability Check | wanderingMerchant.service.ts:495-499 | buyFromMerchant checks merchant state but doesn't verify merchant is actually at player's location | Add location validation: player.location == merchant.currentLocation |
| Inventory Sync Issues | wanderingMerchant.service.ts:558 | Database Item lookup (findByItemId) assumes items exist; no fallback for merchant-only items | Handle both database items and merchant-specific inventory items clearly |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No Date/Time Validation for Routes | wanderingMerchant.service.ts:286 | arrivalDate calculation uses real Date.now() then adds game days; can produce invalid dates | Use TimeService to get game time, add game days properly |
| Schedule-Service Integration Gap | wanderingMerchant.service.ts:124 | Calls ScheduleService.getCurrentActivity but doesn't check for null result; crashes on missing schedule | Add null check: if (!activity) return createDefaultMerchantState() |
| Incorrect Day of Week Conversion | wanderingMerchant.service.ts:86-89 | Converts JS day (0=Sun) to 1=Mon system, but WANDERING_MERCHANTS data uses 0-indexed days; mismatch | Verify and fix day-of-week system consistency across services |
| Trust Discount Extraction Fragile | wanderingMerchant.service.ts:456 | Regex parse of discount percentage ("50% discount") can fail if text format changes | Create structured TrustBenefit interface instead of string parsing |
| No Quantity Validation for Stock | wanderingMerchant.service.ts:514-516 | Checks stock but doesn't prevent overselling; multiple concurrent requests can sell same item twice | Add atomic stock decrement or reservation system |
| Character State Inconsistency | wanderingMerchant.service.ts:584 | Character saved with session but inventory state may not match database transaction state | Add post-transaction validation or idempotency key |
| Missing Service Requirement Defaults | wanderingNpc.service.ts:80-104 | Checks req.minTrustLevel and req.maxBounty but assumes service.requirements exists | Add null checks: `if (!service.requirements) return { canUse: true }` |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Trust Discount Capped at 5 | wanderingNpc.service.ts:497 | Math.min(trust, 5) hard-coded cap doesn't respect provider.maxTrust values | Use provider.maxTrust or define constant MAX_TRUST |
| Cooldown Uses Real Time | wanderingNpc.service.ts:391-399 | Cooldown stored in minutes but compared to Date.now(); uses real wall-clock time not game time | Use game time from TimeService for consistency |
| Dialogue Truncated for Unknowns | wanderingMerchant.service.ts:287 | If dialogue context doesn't exist, returns 'Hello.' instead of fallback dialogue | Use proper fallback or base dialogue from merchant data |
| Random Dialogue Always Possible | wanderingMerchant.service.ts:275-283 | Trust dialogue selection doesn't check if array is empty; can throw on undefined | Add length check: `if (options.length === 0) return defaultDialogue` |
| isServiceAvailable Complexity | wanderingNpc.service.ts:154-177 | Helper function iterates trustBonuses twice to check availability; O(n) performance | Create single-pass check that returns both availability and unlocked services |
| Day of Week Modulo Bug | wanderingMerchant.service.ts:189 | `const currentIndex = merchant.route.indexOf(currentStop)` can return -1 if currentStop not found | Add bounds check: `if (currentIndex === -1) return merchant.route[0]` |

## Bug Fixes Needed
1. **wanderingNpc.service.ts:375** - Query character bounty: `const character = await Character.findById(request.characterId); const bounty = character?.bounty || 0`
2. **wanderingNpc.service.ts:406** - Add payment deduction: `await character.deductGold(cost.gold, TransactionSource.SERVICE_PURCHASE)`
3. **wanderingNpc.service.ts:435** - Apply effects: `if (service.effects) await applyServiceEffects(character, service.effects)`
4. **wanderingMerchant.service.ts:124** - Add null check: `if (!activity) { logger.warn(...); return null; }`
5. **wanderingMerchant.service.ts:189** - Add bounds check: `if (currentIndex === -1) return merchant.route[0];`
6. **wanderingMerchant.service.ts:495-499** - Add location validation in buyFromMerchant
7. **wanderingMerchant.service.ts:514-516** - Use atomic operations or reservation system for stock

## Incomplete Implementations
- Relationship persistence: Trust relationships only in-memory, lost on restart
- Service effects: Core system implemented but never applied to character
- Payment system: Costs calculated but never charged to player
- Location verification: No check that merchant is at player's location during trades
- Inventory management: Merchant inventory separate from Item database; no unified system
- Schedule persistence: Merchants use ScheduleService but don't persist schedule changes
- Faction reputation: Service relationships don't affect faction reputation
- Service discovery: New services don't broadcast to players when available
- Bounty validation: Bounty parameter hardcoded to 0
- Cooldown system: Uses real time instead of game time

## Recommendations
1. **URGENT**: Implement relationship persistence (ServiceProviderRelationship collection in MongoDB)
2. Complete payment deduction: deductGold and transaction logging
3. Complete service effects: Create ServiceEffectService to apply buffs/debuffs/healing
4. Add location validation for merchant trades (player must be at merchant's location)
5. Create unified inventory system (merge merchant-specific items with Item database)
6. Switch cooldown system from real time to game time (TimeService)
7. Add bounty lookup from Character model
8. Create schema validation for routes and schedules (Zod)
9. Implement schedule persistence with version control
10. Add merchant discovery events/notifications
11. Create faction reputation tracking for service providers
12. Add service provider conflict system (some providers work for different factions)
13. Implement merchant "reputation" as separate from player relationship
14. Add batch operations for merchant updates (sync all merchant states once per hour)

## Estimated Fix Effort
- Critical fixes: 8 hours
- High fixes: 6 hours
- Medium fixes: 4 hours
- Total: 18 hours

**Overall Score: 5/10** (Excellent design but non-functional due to TODO comments for payment, effects, and persistence; critical missing functionality prevents production use)
