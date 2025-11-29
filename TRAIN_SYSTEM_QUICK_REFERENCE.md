# Train System - Quick Reference Guide

## File Structure

```
shared/src/types/
  └── train.types.ts          # All TypeScript types and enums

server/src/data/
  ├── trainRoutes.ts          # 6 route definitions
  └── trainSchedules.ts       # 17 train schedules

server/src/models/
  └── TrainTicket.model.ts    # Mongoose ticket model

server/src/services/
  ├── train.service.ts        # Passenger & cargo operations
  └── trainRobbery.service.ts # Heist mechanics
```

## Quick Usage Examples

### 1. Purchase a Train Ticket

```typescript
import { TrainService } from './services/train.service';
import { TicketClass } from '@desperados/shared';

const result = await TrainService.purchaseTicket({
  characterId: '507f1f77bcf86cd799439011',
  origin: 'WHISKEY_BEND',
  destination: 'RED_GULCH',
  ticketClass: TicketClass.FIRST_CLASS,
  departureTime: undefined // Next available
});

// Returns: { ticket, train, departureTime, arrivalTime, duration, cost, perks }
```

### 2. Board a Train

```typescript
const boardingResult = await TrainService.boardTrain(
  characterId,
  ticketId
);

// Character location automatically updated to destination
// Returns: { success, arrivalTime, destination, message }
```

### 3. Ship Cargo

```typescript
const quote = await TrainService.getCargoQuote({
  characterId,
  origin: 'RED_GULCH',
  destination: 'WHISKEY_BEND',
  cargo: [
    { itemId: 'gold_ore', itemName: 'Gold Ore', quantity: 10, weight: 5, value: 100 }
  ],
  insured: true
});

// Returns: { shippingCost, insuranceCost, totalCost, totalWeight, totalValue, ... }

const shipment = await TrainService.shipCargo(request);
```

### 4. Scout a Train

```typescript
import { TrainRobberyService } from './services/trainRobbery.service';

const intel = await TrainRobberyService.scoutTrain({
  characterId,
  trainId: 'GOLD_TRAIN',
  departureTime: new Date('2024-01-15 04:00')
});

// Returns: { scouted, guardCount, securityLevel, cargoTypes, estimatedValue, vulnerabilities, ... }
```

### 5. Plan a Train Robbery

```typescript
const plan = await TrainRobberyService.planRobbery(
  plannerId,
  'MILITARY_PAYROLL', // trainId
  new Date('2024-01-15 14:00'), // departureTime
  RobberyApproach.BRIDGE_BLOCK,
  'CANYON_BRIDGE', // targetLocation
  ['char1', 'char2', 'char3', 'char4'], // gangMemberIds
  [ // equipment
    { itemId: 'dynamite', itemName: 'Dynamite', quantity: 3, purpose: 'blow safe' },
    { itemId: 'rope', itemName: 'Rope', quantity: 5, purpose: 'tie up guards' }
  ]
);

// Returns: { _id, plannerId, targetTrainId, approach, gangMembers, estimatedLoot, estimatedRisk, ... }
```

### 6. Execute Robbery

```typescript
const result = await TrainRobberyService.executeRobbery(robberyId);

// Returns complete result:
// {
//   robberyId, success, phase, lootCollected, totalValue,
//   casualties, witnessCount, bountyIncrease, pursuitLevel,
//   gangMembersFate, consequences, narrative, completedAt
// }
```

## Key Constants

### Ticket Prices (per hour of travel)
- Coach: $50
- First Class: $150
- Private Car: $500

### Energy Costs
- Scout Train: 15 energy
- Robbery Planning: 0 energy (time-based)

### Requirements
- Scouting: 5+ Cunning
- Gang Size: 3-8 members
- Refunds: 2+ hours before departure (80% refund)
- Boarding: Within 1 hour before departure

### Robbery Consequences by Train Type

| Train Type | Bounty | Wanted | Pursuit Duration |
|------------|--------|--------|------------------|
| Passenger | +$200 | +1 | 3 days |
| Freight | +$300 | +1 | 5 days |
| Military | +$1000 | +3 | 14 days |
| VIP Express | +$600 | +2 | 7 days |
| Gold Train | +$1500 | +3 | 21 days |

## Routes Summary

1. **Transcontinental** (4h): Whiskey Bend → Fort Ashford → Red Gulch → Frontera
2. **Mining Spur** (45m): Red Gulch ↔ Goldfinger's Mine
3. **Military Supply** (90m): Fort Ashford → Supply Depot (restricted)
4. **Border Express** (2h): Frontera → Ciudad Destino (permit required)
5. **Canyon Route** (3h): Whiskey Bend → Devil's Canyon → Red Gulch
6. **Northern Loop** (5h): Fort Ashford → Silver Creek → North Pass → Timber Ridge → Fort Ashford

## Train Types

| Type | Guards | Security | Typical Value |
|------|--------|----------|---------------|
| Passenger | 2 | 3/10 | $2,000 |
| Freight | 3 | 4/10 | $5,000 |
| Military | 8 | 9/10 | $50,000 |
| VIP Express | 5 | 7/10 | $25,000 |
| Gold Train | 12 | 10/10 | $100,000 |
| Prison Transport | 6 | 8/10 | $0 |
| Mail Express | 2 | 3/10 | $3,000 |
| Supply Run | 4 | 5/10 | $12,000 |

## Robbery Approach Modifiers

| Approach | Difficulty Modifier |
|----------|---------------------|
| Bridge Block | 1.0x (baseline) |
| Inside Job | 0.8x (easiest) |
| Tunnel Ambush | 0.9x |
| Stealth Boarding | 1.1x |
| Horseback Chase | 1.2x |
| Station Assault | 1.3x (hardest) |

## Gang Roles (Auto-Assigned)

- **Leader** - First member (30% cut)
- **Gunslinger** - High Combat (15% cut)
- **Lockpick** - High Cunning (15% cut)
- **Explosives** - High Craft (15% cut)
- **Lookout** - Secondary Cunning (15% cut)
- **Driver** - Fill role (15% cut)

## Pursuit Levels

1. **None** - Small jobs (<$5k)
2. **Local Sheriff** - $5k-$20k
3. **Federal Marshals** - $20k-$50k or VIP train
4. **Pinkerton Agents** - $50k+ or Gold Train
5. **Military** - Military trains

## Common Queries

### Find available trains
```typescript
const trains = TrainService.getAvailableTrainsForJourney(
  'WHISKEY_BEND',
  'RED_GULCH',
  new Date()
);
// Returns array of { schedule, route, departureTime, arrivalTime, duration, prices }
```

### Check for train station
```typescript
const hasStation = TrainService.hasTrainStation('RED_GULCH');
// Returns: boolean
```

### Get character's tickets
```typescript
const tickets = await TrainService.getCharacterTickets(characterId, false);
// Returns: ITrainTicket[] (excludes used tickets if second param is false)
```

### Get active Pinkerton pursuit
```typescript
const pursuit = TrainRobberyService.getActivePursuit(characterId);
// Returns: PinkertonPursuit | null
```

## Success Calculation Formula

```
Base Chance = 0.5
+ (Gang Size × 0.05)
+ (Average Combat / 100)
+ (Average Cunning / 100)
× Approach Difficulty Modifier
- (Security Level / 100)
- (Guards / 50)
+ 0.15 if scouted

Final = clamp(0.1, 0.9)
```

## Loot Distribution by Type

| Loot Type | % of Base Value |
|-----------|-----------------|
| Passenger Valuables | 30% |
| Cargo | 40% |
| Strongbox | 50% |
| Military Payroll | 80% |
| Gold Bars | 90% |
| Mail Bags | 20% |
| Supplies | 40% |

## Transaction Sources

All gold transactions are tracked with these sources:
- `TRAIN_TICKET` - Ticket purchases
- `TRAIN_REFUND` - Ticket refunds
- `CARGO_SHIPPING` - Freight shipping
- `TRAIN_ROBBERY` - Robbery proceeds

## Error Messages

Common validation errors:
- "Character not found"
- "Character must be at the departure location"
- "No trains available for this route"
- "Insufficient gold. Ticket costs $X"
- "Ticket cannot be used at this time"
- "Ticket cannot be refunded. Refunds must be requested at least 2 hours before departure."
- "Insufficient energy to scout train"
- "Scouting requires at least 5 Cunning"
- "Gang size must be between 3 and 8 members"
- "Robbery has already been executed"

## Next Steps for Integration

### Controllers Needed
1. `train.controller.ts` - REST endpoints for tickets and cargo
2. `trainRobbery.controller.ts` - REST endpoints for heists

### Routes Needed
1. `train.routes.ts` - HTTP routes
2. `trainRobbery.routes.ts` - HTTP routes

### Frontend Components Needed
1. Train Station UI - Browse schedules, purchase tickets
2. Ticket Management - View/refund tickets
3. Cargo Shipping UI - Create shipments
4. Robbery Planning UI - Scout and plan heists
5. Robbery Execution UI - Run and view results
6. Pursuit Tracker - Show active Pinkerton hunts

### Database Collections for Production
1. `TrainScheduleState` - Real-time train tracking
2. `CargoShipment` - Persistent shipment records
3. `RobberyPlan` - Persistent robbery plans
4. `RobberyResult` - Completed robbery records
5. `PinkertonPursuit` - Active pursuit tracking

Currently using in-memory Maps for robbery plans and pursuits - production should migrate these to MongoDB.
