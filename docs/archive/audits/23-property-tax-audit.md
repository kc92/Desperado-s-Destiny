# Property Tax System Audit Report

## Overview
The Property Tax System handles tax calculations, collection, delinquency tracking, and foreclosure processes for gang bases. Architecture spans propertyTax.service.ts, foreclosure.service.ts, and supporting models.

## Files Analyzed
- Server: propertyTax.service.ts, foreclosure.service.ts
- Models: PropertyTax, TaxDelinquency, PropertyAuction

## What's Done Well
- Proper separation between tax calculation and foreclosure
- Transaction support using MongoDB sessions
- Ownership verification on sensitive operations
- Clear state management with enums (TaxPaymentStatus, DelinquencyStage)
- Auto-payment system with fund checks
- Multiple tax categories (property, income, upkeep, special)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Session null bypass | propertyTax.service.ts:46 | `.session(session ?? null)` defeats protection | Check session exists |
| Delinquency payment logic | propertyTax.service.ts:190-205 | amountToDeduct set wrong, money logic bug | Fix calculation |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No transaction in getOwnerTaxSummary | propertyTax.service.ts:405-472 | Race conditions possible | Add session |
| Wrong transaction source | propertyTax.service.ts:237 | Uses GANG_DEPOSIT, needs TAX_PAYMENT | Add correct source |
| Missing gang null check | propertyTax.service.ts:105 | Casts to any, could fail | Validate populated |
| Property condition hardcoded | propertyTax.service.ts:86 | Always 100, no degradation | Track actual condition |
| Auction race condition | foreclosure.service.ts:162-204 | Each auction saved without transaction | Add session wrapping |
| Character property ownership TODO | foreclosure.service.ts:272-273 | Not implemented | Complete transfer logic |
| Wrong foreclosure sources | foreclosure.service.ts:268, 321 | Uses SHOP_PURCHASE/SALE | Add auction sources |
| Bank ownership TODO | foreclosure.service.ts:345-346 | Just deactivates property | Implement system |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Simple property valuation | propertyTax.service.ts:71-72 | tier * 10000 only | Consider location, improvements |
| Auto-payment no limit | propertyTax.service.ts:309-356 | Could timeout with many properties | Add batch processing |
| Premature delinquency | propertyTax.service.ts:348 | No time validation | Check overdue time |
| N+1 queries in summary | propertyTax.service.ts:431-433 | Loops querying delinquency | Use findByOwnerId |

## Bug Fixes Needed
1. **CRITICAL - propertyTax.service.ts:190-205** - Fix delinquency payment: `amountToDeduct = amount - debtPaid` or similar
2. **CRITICAL - propertyTax.service.ts:46** - Check session exists before chaining
3. **HIGH - foreclosure.service.ts:162-204** - Add transaction wrapper for auction processing
4. **HIGH - foreclosure.service.ts:272-273** - Implement character property ownership transfer

## Incomplete Implementations
- Property condition tracking (always 100)
- Character property ownership in foreclosure
- Bank ownership system for failed auctions
- Proper transaction sources (TAX_PAYMENT, PROPERTY_AUCTION_*)

## Recommendations
1. **IMMEDIATE**: Fix delinquency payment logic
2. **IMMEDIATE**: Implement proper session handling
3. Add transaction wrapping to getOwnerTaxSummary
4. Implement character property ownership
5. Add proper transaction sources
6. Implement property condition degradation
7. Improve property valuation
8. Add batch processing for auto-payment

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 6 hours
- Medium fixes: 3 hours
- Total: 13 hours

**Overall Score: 5/10** (Critical money logic bug, many incomplete features)
