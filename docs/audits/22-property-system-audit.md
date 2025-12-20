# Property System Audit Report

## Overview
The Property System handles land ownership, purchases with loans, upgrades, workers, and production. Complex system with significant economic implications but incomplete in several areas.

## Files Analyzed
- Server: propertyPurchase.service.ts, property.controller.ts, property.routes.ts

## What's Done Well
- Loan creation with interest rates by character level
- Gold service integration with audit trail
- Property ownership transfer (ownerId, purchase date, tax date)
- Max properties enforcement
- Tier upgrade progression (one tier at a time)
- Worker wage calculation by skill tiers

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Uses non-existent methods | propertyPurchase.service.ts:656-664 | buyer.deductGold(), seller.addGold() don't exist | WILL CRASH - Use GoldService |
| No session in transfer | propertyPurchase.service.ts:617-681 | GoldService calls don't pass session | Pass session to all calls |
| fireWorker no transaction | propertyPurchase.service.ts:465-483 | No session, no severance payment | Add transaction management |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No down payment validation | propertyPurchase.service.ts:148 | Could be invalid number | Validate 20-80% |
| Property availability race | propertyPurchase.service.ts:132-139 | Check not atomic with purchase | Use findOneAndUpdate |
| Storage method wrong params | propertyPurchase.service.ts:522 | depositItem second param wrong | Review method signature |
| Loan completion missing | propertyPurchase.service.ts:559-612 | No paid-off logic, perpetual loans | Mark loan complete |
| Worker hiring cost not validated | propertyPurchase.service.ts:413-428 | Poor error context if insufficient | Pre-validate gold |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Simplified interest rate | propertyPurchase.service.ts:208-214 | Could go negative at high levels | Add floor, consider reputation |
| Missing location name | propertyPurchase.service.ts:88 | TODO comment, returns ID | Query Location model |
| Undefined method calls | propertyPurchase.service.ts:395, 330 | getAvailableWorkerSlots(), getAvailableUpgradeSlots() | Verify methods exist |
| Hardcoded production values | propertyPurchase.service.ts:281-292 | status: 'idle', baseCapacity: 1 | Load from config |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Fixed worker name arrays | propertyPurchase.service.ts:702-725 | English/western only | Make configurable |
| Monthly payment not validated | propertyPurchase.service.ts:579 | Assumes accurate calculation | Verify calculation |
| No property insurance | N/A | No loss protection | Consider adding |
| Worker loyalty hardcoded | propertyPurchase.service.ts:440 | Always 50 | Vary by type |

## Bug Fixes Needed
1. **CRITICAL - propertyPurchase.service.ts:656-664** - Replace Character methods with GoldService:
   ```typescript
   // WRONG:
   await buyer.deductGold(price, ...)
   // CORRECT:
   await GoldService.deductGold(buyer._id, price, ..., session)
   ```
2. **CRITICAL - propertyPurchase.service.ts:465-483** - Add transaction to fireWorker
3. **HIGH - propertyPurchase.service.ts:132-139** - Use atomic findOneAndUpdate for availability
4. **HIGH - propertyPurchase.service.ts:395, 330** - Verify Property model methods exist

## Incomplete Implementations
- **Property Auction System** (line 220-222): "not yet implemented"
- **Production System**: No startProduction, collection, or worker assignment
- **Upgrade Definitions**: Uses placeholder cost `500 * property.tier`
- **Property Maintenance/Degradation**: Condition never changes
- **Property Tax Collection**: lastTaxPayment set but never collected
- **Bankruptcy/Foreclosure**: Sources exist but no logic

## Recommendations
1. **IMMEDIATE**: Fix critical bugs (property transfer, fireWorker)
2. **IMMEDIATE**: Fix property availability race condition
3. Implement loan completion logic
4. Implement property tax collection
5. Implement worker severance on firing
6. Validate all input parameters
7. Pass sessions to all GoldService calls
8. Implement property auction
9. Implement production with income generation

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 5 hours
- Medium fixes: 4 hours
- Total: 15 hours

**Overall Score: 4/10** (CRITICAL: Property transfer will crash, many incomplete features)
