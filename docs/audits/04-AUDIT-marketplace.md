# Marketplace System Audit Report

## Overview

The Desperados Destiny marketplace system (branded as "Frontier Exchange") is a player-to-player trading platform supporting both fixed-price buyout listings and auction-style bidding. The system handles item listings, bid management, instant purchases, price history tracking, and automated auction resolution through scheduled jobs.

**Audit Date:** 2025-12-14
**Scope:** Full-stack marketplace implementation including backend services, database models, API routes, client components, and automated jobs.

---

## Files Analyzed

### Backend Services
- `server/src/services/marketplace.service.ts` (1,492 lines)
- `server/src/jobs/marketplace.job.ts` (263 lines)

### Models
- `server/src/models/MarketListing.model.ts` (376 lines)
- `server/src/models/PriceHistory.model.ts` (506 lines)

### Controllers & Routes
- `server/src/controllers/marketplace.controller.ts` (545 lines)
- `server/src/routes/marketplace.routes.ts` (196 lines)

### Client-Side
- `client/src/pages/MarketplacePage.tsx` (487 lines)
- `client/src/hooks/useMarketplace.ts` (474 lines)
- `client/src/components/marketplace/` (10 components)

---

## What Works Well

### 1. **Comprehensive Transaction Safety**
- **MongoDB Transactions**: All critical operations use proper MongoDB sessions with transaction support
- **Atomic Operations**: Bid placement, gold transfer, and inventory updates are wrapped in transactions
- **Rollback on Failure**: Proper error handling with session.abortTransaction() ensures data consistency

### 2. **Bid Reserve System**
- Excellent implementation of reserved bids using a Map to track gold already held for each bidder
- Prevents double-deduction when a bidder raises their own bid (lines 616-633)
- Only charges the incremental difference between old and new bid amounts
- Automatic refund of previous highest bidder when outbid

### 3. **Batch Refund Optimization (H8 Fix)**
- Implementation of `batchRefundGold()` for refunding multiple bidders at once (lines 782-796, 1291-1305)
- Avoids N+1 query problem when processing auctions with many bidders
- Significantly improves performance for popular auctions

### 4. **Price History & Analytics**
- Sophisticated price tracking with daily snapshots (PriceHistory.model.ts)
- Calculates price changes over 24h, 7d, and 30d periods
- Maintains rolling window of last 100 sales per item
- Provides price suggestions based on historical data with confidence levels

### 5. **Input Validation**
- Controller has strong validation with whitelisted enums for rarity, listing types, and sort orders
- Safe integer parsing with bounds checking (`parsePositiveInt` with max limits)
- Search query sanitization with min/max length validation
- Category validation against known categories

### 6. **Security Features**
- Rate limiting: 60 marketplace operations per hour per user
- Authentication and character ownership middleware on all protected routes
- Prevention of self-trading (buyers can't bid on own listings)
- Cannot cancel auctions with active bids

### 7. **Rich Client UX**
- Real-time countdown timers on listings
- Bid status indicators (winning/outbid) with visual feedback
- Transaction history with profit/loss calculations
- Price history charts and suggestions

### 8. **Automated Processing**
- Distributed locking prevents job conflicts in multi-instance deployments
- Cron jobs for expired listings (every 1 min), price updates (every 5 min), cleanup (hourly)
- Graceful handling when jobs are already running on another instance

---

## Issues Found

### CRITICAL SEVERITY

#### [RACE-1] Bid Race Condition
**Severity:** CRITICAL
**File:** marketplace.service.ts:566-697
**Description:** The `placeBid()` function has a race condition vulnerability. Between reading the listing (line 575) and updating it (line 676), another bid could be placed. The service uses standard `findById()` then modifies and saves, which is not atomic.
**Impact:** Two users could simultaneously place bids, resulting in:
- Gold deduction for both users
- Only one bid being recorded
- Potential loss of funds for one bidder
- Invalid currentBid state
**Recommendation:** Use `findOneAndUpdate()` with optimistic locking or version field

---

#### [RACE-2] Buy Now Race Condition
**Severity:** CRITICAL
**File:** marketplace.service.ts:702-866
**Description:** Similar race condition in `buyNow()`. Multiple users could attempt to buy the same item simultaneously.
**Impact:**
- Multiple gold deductions
- Item awarded to multiple buyers
- Data corruption in listing status
**Recommendation:** Use atomic `findOneAndUpdate()` with status check

---

#### [SEC-1] Missing Inventory Validation
**Severity:** HIGH
**File:** marketplace.service.ts:201-208
**Description:** The `createListing()` function only checks if inventory item exists and quantity is sufficient. It doesn't validate that the item isn't equipped or locked.
**Impact:** Players could list equipped items or quest items, breaking game state
**Recommendation:** Add validation for `item.equipped === false` and `item.locked !== true`

---

### HIGH SEVERITY

#### [BUG-1] Bid Increment Validation Bypass
**Severity:** HIGH
**File:** marketplace.service.ts:597-602
**Description:** Minimum bid increment is calculated as 5% but edge case allows bids equal to current bid.
**Recommendation:** Change validation to `if (amount <= minBid)` instead of `if (amount < minBid)`

---

#### [DATA-1] Listing Type Validation Inconsistency
**Severity:** HIGH
**File:** marketplace.service.ts:1458-1473
**Description:** Validation allows 'both' as listing type but queries may not handle it correctly.
**Impact:** Listings with type 'both' might not be processed correctly by cron jobs
**Recommendation:** Update static methods to explicitly handle 'both' type

---

#### [PERF-1] N+1 Query in getMyBids
**Severity:** MEDIUM
**File:** marketplace.service.ts:889-894
**Description:** `getMyBids()` returns full listing documents without projection.
**Impact:** Returns full bid history for all bids, causing memory bloat
**Recommendation:** Add `.select()` to limit fields

---

### MEDIUM SEVERITY

#### [LOGIC-1] Featured Listing Cost Not Validated in Transaction
**File:** marketplace.service.ts:531-543
**Description:** Race condition where seller spends gold elsewhere between check and deduction
**Recommendation:** Fetch seller within the same session

---

#### [LOGIC-2] Price Filter Logic Incomplete
**File:** marketplace.service.ts:342-365
**Description:** Price filters don't account for auctions where current bid exceeds filter range
**Recommendation:** Include currentBid in price filter logic

---

#### [VALIDATION-1] Quantity Not Validated for Non-Stackable Items
**File:** marketplace.service.ts:206-209
**Description:** Controller sets quantity but service doesn't validate stackability
**Impact:** Could create listings with quantity > 1 for unique items
**Recommendation:** Add validation for non-stackable items

---

### LOW SEVERITY

#### [UX-1] Expired Listings Not Immediately Removed
**File:** marketplace.service.ts:324
**Description:** Expired listings remain visible for up to 60 seconds
**Impact:** Minor UX issue
**Note:** Acceptable trade-off

---

#### [PERF-2] Missing Index on reservedBids Map
**File:** MarketListing.model.ts:212-216
**Note:** Maps can't be directly indexed in MongoDB - this is a limitation

---

#### [DATA-2] No Cleanup of Old Price History
**File:** PriceHistory.model.ts
**Description:** Very old PriceHistory documents are never deleted
**Impact:** Database growth for items no longer in game

---

## Incomplete Implementations

### [STUB-1] Listing Fee Disabled
**Line:** 38
**Description:** `LISTING_FEE_PERCENT: 0.01` is defined but never used

### [STUB-2] Category Validation Not Type-Safe
**Lines:** 74-81
**Description:** Subcategory validation is missing in the controller

### [MISSING-1] No Socket Notification for Outbid
**Lines:** 654-659
**Description:** No real-time socket notification for outbid events
**Impact:** Users only see they were outbid on page refresh

### [MISSING-2] No Transaction History Pagination on Backend
**Lines:** Client 296-308
**Description:** Transaction history endpoint not exposed in routes

### [MISSING-3] UpdateListingPrice Only Updates Buyout
**Lines:** 233-258
**Description:** Starting price cannot be changed for auctions

---

## Logical Gaps

### [GAP-1] Auction Sniping Not Addressed
**Description:** No anti-snipe mechanism
**Impact:** Poor UX for auction participants
**Recommendation:** Implement auto-extend (add 5 minutes if bid placed in last 5 minutes)

### [GAP-2] No Minimum Price Enforcement
**Description:** Items can be listed for 1 gold
**Impact:** Economic deflation

### [GAP-3] Tax Avoidance Through Price Manipulation
**Description:** 5% tax only on sale price, not item value
**Impact:** Gold sink bypass through collusion

### [GAP-4] No Duplicate Listing Prevention
**Description:** Seller can list same item multiple times
**Impact:** Marketplace spam

### [GAP-5] Bid History Exposure
**Description:** Full bid history including all bidder names is exposed
**Impact:** Privacy concern

### [GAP-6] No Reserve Price Option
**Description:** Auctions don't support reserve prices
**Impact:** Sellers risk losing valuable items to low bids

### [GAP-7] Cron Job Single Point of Failure
**Description:** If cron jobs fail, auctions won't be processed
**Recommendation:** Add health checks and alerting

### [GAP-8] No Marketplace Ban/Suspension System
**Description:** No mechanism to ban users for violations

### [GAP-9] Price History Not Updated on Canceled Sales
**Description:** Cancellations don't adjust price trends

### [GAP-10] No Escrow for Auctions
**Description:** If character deleted, item is lost
**Recommendation:** Implement pending rewards or mail system

---

## Recommendations

### Immediate (Critical)

1. **Fix Bid Race Condition (RACE-1)**
   - Replace findById + save with findOneAndUpdate
   - Add version field for optimistic locking

2. **Fix Buy Now Race Condition (RACE-2)**
   - Use atomic update with status check

3. **Add Inventory Item Validation (SEC-1)**
   - Check `equipped` and `locked` flags before listing

### High Priority

4. **Fix Bid Increment Validation (BUG-1)** - Change to `<=` comparison

5. **Update Listing Type Queries (DATA-1)** - Include 'both' in queries

6. **Optimize getMyBids Query (PERF-1)** - Add projection

### Medium Priority

7. **Add Real-Time Outbid Notifications** - Socket.io integration

8. **Implement Transaction History Endpoint** - Add backend route

9. **Add Anti-Snipe Auto-Extend** - 5-minute extensions

10. **Add Duplicate Listing Check** - Prevent spam

### Low Priority / Nice-to-Have

11. **Add Reserve Price Support**
12. **Implement Listing Analytics**
13. **Add Marketplace Reputation System**
14. **Improve Price Filters**
15. **Add Bulk Operations**

---

## Risk Assessment

### Overall Risk Level: **MEDIUM-HIGH**

### Risk Breakdown:

**Critical Risks (2):**
- Race conditions in bid placement and buy now operations

**High Risks (3):**
- Bid increment validation bypass
- Listing type inconsistency
- N+1 query performance issues

**Medium Risks (6):**
- Various logic gaps around pricing, validation, and transaction handling

**Low Risks (Multiple):**
- UX improvements and feature completeness items

### Security Posture: **GOOD**
- Strong authentication and authorization
- Rate limiting in place
- Input validation comprehensive

### Performance: **GOOD**
- Batch refund optimization
- Indexes properly configured

### Data Integrity: **MEDIUM**
- Race conditions pose risk to data consistency

### Completeness: **MEDIUM-HIGH**
- Core features fully implemented
- Some edge cases not handled

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Files Reviewed | 16 |
| Total Lines Reviewed | ~5,500 |
| Critical Issues Found | 3 |
| High Priority Issues | 3 |
| Medium Priority Issues | 6 |
| Logical Gaps | 10 |
| Recommendations | 15 |

**Code Quality:** 4/5
**Security:** 4/5
**Transaction Safety:** 3/5
**Completeness:** 4/5
**Overall:** 3.5/5

---

## Conclusion

The marketplace system has a **solid foundation** with comprehensive transaction safety, good input validation, and thoughtful UX features. However, **critical race conditions** in bid placement and buy now operations must be addressed before production deployment.

**Primary Action Items:**
1. Fix race conditions with atomic operations
2. Add inventory validation for listings
3. Implement real-time outbid notifications

**Estimated effort to production-ready:** 1-2 weeks of focused development.
