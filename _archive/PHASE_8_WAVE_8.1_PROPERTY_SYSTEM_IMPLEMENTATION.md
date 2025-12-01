# Phase 8, Wave 8.1 - Property Ownership System Implementation

**Status**: ✅ **COMPLETE**
**Date**: 2025-11-26
**Implementation**: Property Models & Purchase System

---

## 📋 Overview

This wave implements a comprehensive property ownership system for Desperados Destiny, allowing players to purchase, upgrade, and manage various types of properties including ranches, shops, workshops, homesteads, mines, saloons, and stables.

---

## 🎯 Implemented Features

### 1. Property Types (7 Types)

| Property Type | Base Price | Income Type | Special Feature |
|--------------|-----------|-------------|-----------------|
| **Ranch** | 1,000g | Production | Livestock and crop production |
| **Shop** | 1,500g | Sales | Customer traffic and trade |
| **Workshop** | 1,200g | Crafting | Enhanced crafting capabilities |
| **Homestead** | 800g | None | Safe storage and respawn point |
| **Mine** | 2,000g | Extraction | Passive ore generation |
| **Saloon** | 3,000g | Entertainment | Games and social hub |
| **Stable** | 1,800g | Breeding | Mount breeding and training |

### 2. Property Size Categories

- **Small**: Base storage 50, Taxes 10g/week
- **Medium**: Base storage 100, Taxes 25g/week
- **Large**: Base storage 200, Taxes 50g/week
- **Huge**: Base storage 500, Taxes 100g/week

### 3. Property Tier System (1-5)

Each tier provides exponential improvements:

| Tier | Name | Upgrade Slots | Worker Slots | Production Slots | Storage Multiplier | Upgrade Cost |
|------|------|---------------|--------------|------------------|--------------------|--------------|
| 1 | Basic | 2 | 1 | 1 | 1x | 500g |
| 2 | Improved | 4 | 2 | 2 | 1.5x | 1,500g |
| 3 | Advanced | 6 | 3 | 3 | 2x | 5,000g |
| 4 | Superior | 8 | 5 | 4 | 3x | 15,000g |
| 5 | Legendary | 10 | 8 | 5 | 5x | 50,000g |

### 4. Purchase System

**Purchase Sources**:
- ✅ Direct purchase from NPCs (fixed price)
- ✅ Foreclosure sales (cheaper, may have issues)
- ✅ Quest rewards (rare)
- ✅ Player transfers
- 🔜 Auction house (player bidding) - Framework ready

**Purchase Requirements**:
- Minimum gold amount
- Level requirements
- Reputation requirements
- Faction standing
- Down payment for loans

### 5. Loan System

**Configuration**:
- Down payment: 20-50% of property price
- Interest rate: 5-15% based on reputation/level
- Payment interval: Weekly (7 days)
- Missed payment penalty: 50 gold per missed payment
- Foreclosure threshold: 3 missed payments

**Features**:
- ✅ Loan creation with dynamic interest rates
- ✅ Weekly payment tracking
- ✅ Missed payment penalties
- ✅ Early payoff option
- ✅ Automatic foreclosure on 3 missed payments

### 6. Upgrade System

**35 Unique Upgrades** across all property types:

#### Ranch Upgrades (5)
- **Livestock Pen**: +10 livestock capacity per level
- **Crop Field**: +20 crop capacity per level
- **Water Well**: +15% production speed
- **Barn**: +50 storage capacity per level
- **Windmill**: +25% water efficiency, requires well

#### Shop Upgrades (5)
- **Display Cases**: +10% sales price
- **Back Room**: +100 storage per level
- **Shop Sign**: +15% customer traffic
- **Security System**: -20% theft chance
- **Expanded Inventory**: +50 item types

#### Workshop Upgrades (5)
- **Forge**: Metal crafting unlocked, weapon repairs
- **Master Workbench**: +15% crafting speed per level
- **Tool Rack**: +2 crafting slots per level
- **Quality Tools**: +20% quality, +5% masterwork chance
- **Ventilation System**: +10% worker efficiency

#### Homestead Upgrades (5)
- **Additional Bedroom**: +5% energy regen rate
- **Kitchen**: Food crafting unlocked
- **Root Cellar**: +100 storage per level
- **Garden**: Passive food generation
- **Security System**: -25% burglary chance

#### Mine Upgrades (5)
- **Support Beams**: -20% accident chance
- **Mine Cart Rails**: +25% extraction speed
- **Ventilation Shaft**: +15% worker efficiency
- **Explosives Storage**: Blasting unlocked, rare ore access
- **Water Pump**: Deeper levels accessible

#### Saloon Upgrades (5)
- **Bar Expansion**: +10 customer capacity
- **Performance Stage**: +25% customer traffic, entertainment events
- **Rental Rooms**: +2 rooms per level, passive income
- **Gaming Tables**: Gambling unlocked, +100g/week
- **Bouncer**: -30% brawl damage, troublemaker removal

#### Stable Upgrades (5)
- **Additional Stalls**: +5 mount capacity
- **Training Ring**: Mount training unlocked
- **Tack Room**: +50 equipment storage
- **Feed Storage**: -20% feed costs
- **Breeding Pen**: Horse breeding unlocked

### 7. Worker System

**Worker Types** (8):
- Farmhand
- Shopkeeper
- Craftsman
- Miner
- Bartender
- Stable Hand
- Security
- Manager

**Worker Skills**:
- **Novice** (1-25): 1x wage multiplier
- **Skilled** (26-50): 1.5x wage multiplier
- **Expert** (51-75): 2x wage multiplier
- **Master** (76-100): 3x wage multiplier

**Worker Management**:
- Hire workers with varying skill levels
- Weekly wages based on skill tier
- Fire workers at will
- Workers contribute to production efficiency

### 8. Storage System

- Capacity based on property size and tier
- Deposit/withdraw items
- Track item quantities and timestamps
- Storage management integrated with character inventory

### 9. Production System

- Multiple production slots per property
- Recipe-based production
- Worker assignment to production
- Time-based completion
- Quality and yield bonuses from upgrades

### 10. Property Status System

**Status Types**:
- **Active**: Property is fully operational
- **Abandoned**: Not maintained, condition < 20%
- **Foreclosed**: Seized due to unpaid loans
- **Under Construction**: Being upgraded

**Condition System**:
- 0-100% condition rating
- 1% decay per week without maintenance
- Affects production efficiency
- Abandonment at <20% condition

---

## 📁 Files Created

### 1. Type Definitions
**File**: `shared/src/types/property.types.ts` (577 lines)

Exports:
- `PropertyType` enum (imported from production.types)
- `PropertySize` enum
- `PropertyStatus` enum
- `PropertyTier` type
- `PurchaseSource` enum
- `UpgradeCategory` enum
- Property upgrade enums for each type
- `PropertyUpgrade` interface
- `WorkerType` enum
- `PropertyStorage` interface
- `StorageItem` interface
- `Property` interface (main)
- `PropertyLoan` interface
- `PropertyListing` interface
- `PropertyRequirements` interface
- All configuration constants
- Request/response types

**Integration**: Added to `shared/src/types/index.ts` for export

### 2. Property Model
**File**: `server/src/models/Property.model.ts` (475 lines)

Features:
- Mongoose schema with full validation
- Instance methods for property management
- Static methods for querying
- Indexes for performance
- Full type safety with TypeScript

**Instance Methods**:
- `calculateTotalUpkeep()`: Calculate weekly costs
- `applyConditionDecay()`: Apply weekly decay
- `getAvailableUpgradeSlots()`: Check upgrade capacity
- `getAvailableWorkerSlots()`: Check worker capacity
- `getTotalStorageCapacity()`: Get storage limit
- `addUpgrade()`: Install upgrade
- `hireWorker()`: Add worker
- `fireWorker()`: Remove worker
- `depositItem()`: Add to storage
- `withdrawItem()`: Remove from storage
- `calculateWeeklyIncome()`: Estimate earnings
- `payTaxes()`: Pay property taxes
- `foreclose()`: Seize property

**Static Methods**:
- `findByOwner()`: Get character's properties
- `findByLocation()`: Get properties in location
- `findAvailableProperties()`: Get unclaimed properties
- `findForeclosedProperties()`: Get foreclosed properties

### 3. Property Loan Model
**File**: `server/src/models/PropertyLoan.model.ts` (294 lines)

Features:
- Loan tracking and payment management
- Interest calculation
- Overdue detection
- Penalty calculation

**Instance Methods**:
- `calculatePayment()`: Get payment amount
- `makePayment()`: Process payment
- `missPayment()`: Record missed payment
- `payoffLoan()`: Pay off full balance
- `isOverdue()`: Check if payment overdue
- `getDaysOverdue()`: Calculate days late
- `calculatePenalty()`: Get penalty amount

**Static Methods**:
- `findByCharacter()`: Get character's loans
- `findByProperty()`: Get property's loan
- `findOverdueLoans()`: Get all overdue loans
- `createLoan()`: Create new loan

### 4. Property Purchase Service
**File**: `server/src/services/propertyPurchase.service.ts` (653 lines)

**Methods**:

**Listings**:
- `getAvailableListings()`: Get properties for sale
- `getForeclosedListings()`: Get foreclosed properties

**Purchase**:
- `purchaseProperty()`: Buy property (cash or loan)
- `placeBid()`: Auction bidding (framework)
- `transferProperty()`: Transfer ownership

**Upgrades**:
- `upgradeTier()`: Upgrade property tier
- `addUpgrade()`: Install property upgrade

**Workers**:
- `hireWorker()`: Hire new worker
- `fireWorker()`: Dismiss worker

**Management**:
- `manageStorage()`: Deposit/withdraw items
- `makeLoanPayment()`: Pay loan installment
- `getOwnedProperties()`: Get character properties
- `getCharacterLoans()`: Get character loans

**Features**:
- Transaction safety with MongoDB sessions
- Gold tracking integration
- Character inventory integration
- Loan interest calculation based on reputation
- Worker wage calculation based on skill tier

### 5. Property Upgrades Data
**File**: `server/src/data/propertyUpgrades.ts` (574 lines)

**Exports**:
- `RANCH_UPGRADES`: 5 ranch upgrade definitions
- `SHOP_UPGRADES`: 5 shop upgrade definitions
- `WORKSHOP_UPGRADES`: 5 workshop upgrade definitions
- `HOMESTEAD_UPGRADES`: 5 homestead upgrade definitions
- `MINE_UPGRADES`: 5 mine upgrade definitions
- `SALOON_UPGRADES`: 5 saloon upgrade definitions
- `STABLE_UPGRADES`: 5 stable upgrade definitions
- `ALL_PROPERTY_UPGRADES`: Combined registry

**Helper Functions**:
- `getUpgradesByPropertyType()`: Filter by property
- `getUpgradeById()`: Lookup upgrade
- `canInstallUpgrade()`: Validate upgrade eligibility

**Each upgrade includes**:
- ID and name
- Description
- Category (capacity/efficiency/defense/comfort/specialty)
- Cost
- Minimum tier requirement
- Maximum level
- Benefits list
- Requirements (e.g., prerequisite upgrades)

---

## 🔧 Technical Implementation

### Type Safety

All code is fully typed with TypeScript:
- Shared types between client and server
- Enums for all categorical data
- Interfaces for all data structures
- Type imports/exports properly configured

### Database Design

**Indexes Created**:
```typescript
// Property indexes
{ ownerId: 1, status: 1 }
{ locationId: 1, status: 1 }
{ propertyType: 1, status: 1 }
{ status: 1, lastTaxPayment: 1 }

// PropertyLoan indexes
{ characterId: 1, isActive: 1 }
{ nextPaymentDue: 1, isActive: 1 }
{ missedPayments: 1, isActive: 1 }
{ propertyId: 1 } // unique
```

### Transaction Safety

All financial operations use MongoDB sessions:
- Property purchases
- Tier upgrades
- Worker hiring
- Storage management
- Loan payments
- Property transfers

### Gold Integration

Integrated with existing `GoldTransaction` system:
- All purchases tracked
- All payments tracked
- Complete audit trail
- Transaction sources defined

### Constants and Configuration

All game balance values extracted to constants:
- `PROPERTY_TIER_INFO`: Tier progression
- `PROPERTY_SIZE_INFO`: Size characteristics
- `PROPERTY_TYPE_INFO`: Type details
- `LOAN_CONFIG`: Loan parameters
- `PROPERTY_CONSTRAINTS`: System limits
- `BASE_WORKER_WAGES`: Worker costs
- `WORKER_SKILL_TIERS`: Skill progression
- `CONDITION_THRESHOLDS`: Condition states

---

## 🎮 Game Mechanics

### Property Acquisition Flow

1. **Browse Listings**
   - View available properties by location
   - Check requirements (level, gold, reputation)
   - See property details (size, tier, condition)

2. **Purchase Decision**
   - Choose between cash or loan
   - If loan: select down payment (20-50%)
   - Interest rate calculated from reputation
   - System validates gold and requirements

3. **Ownership Transfer**
   - Gold deducted from character
   - Loan created if applicable
   - Property ownership updated
   - First tax payment date set

### Property Management Flow

1. **Upgrades**
   - Check available upgrade slots
   - View available upgrades for property type
   - Verify tier requirements
   - Purchase and install

2. **Workers**
   - Check available worker slots
   - Hire workers by type and skill level
   - Wages calculated by skill tier
   - 1 week upfront payment required

3. **Production**
   - Assign workers to production slots
   - Select recipes/products
   - Monitor production time
   - Collect completed production

4. **Maintenance**
   - Pay weekly taxes
   - Pay weekly upkeep
   - Pay worker wages
   - Maintain property condition

### Loan Management Flow

1. **Weekly Payments**
   - Payment due every 7 days
   - Minimum payment required
   - Can pay extra to reduce balance
   - Can pay off early

2. **Missed Payments**
   - 50 gold penalty per missed payment
   - Counter increments
   - Next payment date extended 7 days

3. **Foreclosure**
   - After 3 missed payments
   - Property seized
   - Ownership removed
   - Condition reduced
   - Workers dismissed
   - Property listed as foreclosed

### Condition Decay System

- 1% decay per week naturally
- Condition affects production efficiency
- <90%: Excellent
- <70%: Good
- <50%: Fair
- <30%: Poor
- <20%: Abandoned status

---

## 🔮 Future Enhancements (Not Implemented)

### Wave 8.2 - Advanced Features
- Auction system implementation
- Property insurance
- Natural disasters and events
- Property reputation system
- Visitor/customer system
- Revenue sharing with gang

### Wave 8.3 - Social Features
- Property tours
- Guest access permissions
- Property parties/events
- Co-ownership system
- Property guilds

### Wave 8.4 - Economy Integration
- Market price fluctuations
- Supply and demand
- Competing properties
- Property value appreciation
- Real estate market

---

## 📊 System Constraints

```typescript
MAX_PROPERTIES_PER_CHARACTER: 5
MAX_WORKERS_PER_PROPERTY: 10
MAX_UPGRADES_PER_PROPERTY: 10
MAX_PRODUCTION_SLOTS: 5
CONDITION_DECAY_PER_WEEK: 1
ABANDONMENT_WEEKS: 4
FORECLOSURE_RECOVERY_PERCENTAGE: 60
```

---

## 🧪 Testing Recommendations

### Unit Tests Needed

1. **Property Model Tests**
   - Condition decay
   - Upgrade slot limits
   - Worker slot limits
   - Storage management
   - Income calculation

2. **Loan Model Tests**
   - Payment calculation
   - Interest accrual
   - Overdue detection
   - Foreclosure triggers

3. **Service Tests**
   - Purchase with cash
   - Purchase with loan
   - Tier upgrades
   - Worker hiring/firing
   - Storage operations
   - Loan payments

### Integration Tests Needed

1. **Purchase Flow**
   - End-to-end purchase
   - Loan creation
   - Gold deduction
   - Ownership transfer

2. **Management Flow**
   - Upgrade installation
   - Worker management
   - Production cycle
   - Tax payments

3. **Foreclosure Flow**
   - Missed payments
   - Foreclosure trigger
   - Property recovery
   - Relisting

---

## 🚀 Deployment Checklist

- [x] Type definitions created and exported
- [x] Models created with full validation
- [x] Service layer implemented
- [x] Upgrade data defined
- [ ] Routes/Controllers created
- [ ] Database migrations/seeds
- [ ] Client UI components
- [ ] API documentation
- [ ] Unit tests
- [ ] Integration tests
- [ ] Admin tools for property management

---

## 📝 API Endpoints (To Be Implemented)

```typescript
// Listings
GET    /api/properties/listings
GET    /api/properties/listings/foreclosed
GET    /api/properties/listings/:locationId

// Purchase
POST   /api/properties/purchase
POST   /api/properties/bid
POST   /api/properties/transfer

// Management
GET    /api/properties/owned
PUT    /api/properties/:id/upgrade-tier
POST   /api/properties/:id/upgrades
GET    /api/properties/:id/upgrades/available

// Workers
POST   /api/properties/:id/workers
DELETE /api/properties/:id/workers/:workerId
GET    /api/properties/:id/workers/available

// Storage
POST   /api/properties/:id/storage/deposit
POST   /api/properties/:id/storage/withdraw

// Loans
GET    /api/properties/loans
POST   /api/properties/loans/:id/payment
GET    /api/properties/loans/:id/details
```

---

## 🎓 Developer Notes

### Adding New Property Types

1. Add to `PropertyType` enum in `production.types.ts`
2. Add upgrade enum in `property.types.ts`
3. Create upgrades in `propertyUpgrades.ts`
4. Add to `PROPERTY_TYPE_INFO` constant
5. Update model validation

### Adding New Upgrades

1. Define in appropriate upgrade section in `propertyUpgrades.ts`
2. Include all required fields:
   - id, name, description
   - category, propertyType
   - cost, minTier, maxLevel
   - benefits array
   - requirements (if any)

### Modifying Loan Parameters

Edit `LOAN_CONFIG` constant in `property.types.ts`:
- `MIN_DOWN_PAYMENT`
- `MAX_DOWN_PAYMENT`
- `MIN_INTEREST_RATE`
- `MAX_INTEREST_RATE`
- `MISSED_PAYMENT_PENALTY`
- `FORECLOSURE_THRESHOLD`
- `PAYMENT_INTERVAL_DAYS`

---

## 📚 Related Systems

This property system integrates with:

- **Character System**: Ownership, inventory, gold
- **Location System**: Property placement
- **Production System**: Crafting and output
- **Gang System**: Gang-owned properties (future)
- **Economy System**: Market prices (future)
- **Quest System**: Property rewards (future)

---

## ✅ Completion Summary

**Phase 8, Wave 8.1 is COMPLETE** with the following deliverables:

1. ✅ Comprehensive type system (577 lines)
2. ✅ Property model with full features (475 lines)
3. ✅ Property loan model (294 lines)
4. ✅ Purchase service with all operations (653 lines)
5. ✅ 35 unique property upgrades defined (574 lines)
6. ✅ Full TypeScript type safety
7. ✅ Transaction-safe database operations
8. ✅ Gold integration with audit trail
9. ✅ Worker system with skill tiers
10. ✅ Loan system with foreclosure

**Total Lines of Code**: ~2,573 lines

**Next Steps**:
- Implement API routes and controllers
- Create client UI components
- Add database seeds for initial properties
- Write comprehensive tests
- Document API endpoints
- Create admin tools

---

**Implementation Date**: November 26, 2025
**Developer**: Claude Code
**Status**: ✅ Ready for Review and Testing
