# Gang Economy Quick Start Guide

Quick reference for developers working with the Gang Economy system.

## Core Concepts

### 4 Bank Accounts
1. **Operating Fund** - Daily operations (Officer+ can withdraw)
2. **War Chest** - Gang wars only (Leader controlled)
3. **Investment Fund** - Long-term investments (Leader controlled)
4. **Emergency Reserve** - Crisis fund (Leader only, no auto-deductions)

### 8 Business Types

**Legitimate (No Raids):**
- Saloon: 1,000g → 50-200g/day
- General Store: 800g → 30-100g/day
- Stable: 1,200g → 40-120g/day
- Hotel: 2,000g → 60-250g/day

**Criminal (Raid Risk):**
- Gambling Den: 2,000g → 100-400g/day (5% raid risk)
- Smuggling Ring: 3,000g → 150-500g/day (15% raid risk)
- Protection Racket: 1,500g → 80-300g/day (5% raid risk, needs territory)
- Counterfeiting: 5,000g → 200-600g/day (25% raid risk, gang level 5+)

### 6 Heist Targets
- Stagecoach: 1k-3k payout, 2 members, 30% risk
- Red Gulch Bank: 2k-5k payout, 3 members, 40% risk
- Wealthy Estate: 2.5k-6k payout, 3 members, 50% risk, level 2+
- Whiskey Bend Bank: 3k-8k payout, 4 members, 60% risk, level 3+
- Railroad Express: 3.5k-9k payout, 4 members, 70% risk, level 4+
- Fort Ashford Payroll: 4k-10k payout, 5 members, 80% risk, level 5+

## Quick API Reference

### Bank Operations
```typescript
// Deposit (any member)
POST /api/gangs/:gangId/bank/deposit
Body: { accountType: 'operating_fund', amount: 1000 }

// Withdraw (officer+)
POST /api/gangs/:gangId/bank/withdraw
Body: { accountType: 'operating_fund', amount: 500 }

// Transfer (officer+)
POST /api/gangs/:gangId/bank/transfer
Body: { fromAccount: 'operating_fund', toAccount: 'war_chest', amount: 1000 }
```

### Business Operations
```typescript
// Buy business (leader only)
POST /api/gangs/:gangId/businesses/buy
Body: {
  businessType: 'saloon',
  customName: 'Dusty Trails Saloon',
  location: 'Red Gulch'
}

// Sell business (leader only)
POST /api/gangs/:gangId/businesses/:businessId/sell
```

### Heist Operations
```typescript
// Start planning (leader only)
POST /api/gangs/:gangId/heists/plan
Body: {
  target: 'red_gulch_bank',
  roleAssignments: [
    { role: 'lookout', characterId: '...' },
    { role: 'safecracker', characterId: '...' },
    { role: 'muscle', characterId: '...' }
  ]
}

// Increase planning (any member)
POST /api/gangs/:gangId/heists/:heistId/plan
Body: { amount: 10 }  // Increases progress by 10%

// Execute heist (leader only, requires 100% planning + full crew)
POST /api/gangs/:gangId/heists/:heistId/execute
```

### Payroll Setup
```typescript
// Set payroll (leader only)
POST /api/gangs/:gangId/payroll
Body: {
  wages: [
    { memberId: '...', amount: 100 },
    { memberId: '...', amount: 50 }
  ],
  officerBonuses: [
    { officerId: '...', amount: 50 }
  ]
}
```

## Service Usage

### Initialize Economy
```typescript
import { GangEconomyService } from '../services/gangEconomy.service';

// Automatically called when gang is created
await GangEconomyService.initializeEconomy(gangId, gangName);
```

### Business Operations
```typescript
// Purchase business
const business = await GangEconomyService.purchaseBusiness(
  gangId,
  characterId,
  {
    businessType: BusinessType.SALOON,
    location: 'Red Gulch',
    customName: 'My Saloon'
  }
);

// Sell business
const salePrice = await GangEconomyService.sellBusiness(
  gangId,
  characterId,
  businessId
);
```

### Heist Operations
```typescript
import { HeistService } from '../services/heist.service';

// Get available targets
const targets = await HeistService.getAvailableHeists(gangId);

// Plan heist
const heist = await HeistService.planHeist(gangId, characterId, {
  target: HeistTarget.RED_GULCH_BANK,
  roleAssignments: [...]
});

// Execute heist
const result = await HeistService.executeHeist(gangId, heistId, characterId);
// Returns: { outcome, payout, arrested[], casualties[] }
```

## Automated Jobs

### Daily Jobs (Run at Midnight)
```typescript
import { runDailyEconomyJobs } from '../jobs/gangEconomyJobs';

// Cron schedule: 0 0 * * *
await runDailyEconomyJobs();

// Includes:
// - Business income generation
// - Business raid checks
// - Investment maturity processing
```

### Weekly Jobs (Run Sunday Midnight)
```typescript
import { runWeeklyEconomyJobs } from '../jobs/gangEconomyJobs';

// Cron schedule: 0 0 * * 0
await runWeeklyEconomyJobs();

// Includes:
// - Payroll processing
// - Weekly interest calculation
```

### Manual Job Execution
```typescript
import {
  processDailyBusinessIncome,
  processBusinessRaids,
  processWeeklyPayroll,
  processMaturedInvestments,
  processWeeklyInterest
} from '../jobs/gangEconomyJobs';

// Run individual jobs manually
await processDailyBusinessIncome();
await processBusinessRaids();
await processWeeklyPayroll();
await processMaturedInvestments();
await processWeeklyInterest();
```

## Common Patterns

### Check Permissions
```typescript
const gang = await Gang.findById(gangId);

if (!gang.isMember(characterId)) {
  throw new Error('Not a gang member');
}

if (!gang.isOfficer(characterId)) {
  throw new Error('Officer rank required');
}

if (!gang.isLeader(characterId)) {
  throw new Error('Leader rank required');
}
```

### Transaction Safety
```typescript
const session = await mongoose.startSession();

try {
  await session.startTransaction();

  // Perform operations
  const economy = await GangEconomy.findOne({ gangId }).session(session);
  economy.deductFromAccount(accountType, amount);
  await economy.save({ session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Calculate Business ROI
```typescript
const business = await GangBusiness.findById(businessId);

const roi = business.getROI(); // Returns percentage
const daysOwned = business.getDaysOwned();
const canGenerateIncome = business.canGenerateIncome();
```

### Calculate Heist Success
```typescript
const heist = await GangHeist.findById(heistId);

const successChance = heist.calculateSuccessChance();
// Takes into account:
// - Planning progress
// - Crew skill levels
// - Risk level
// - Gang heat level
```

## Database Queries

### Find Gang Economy
```typescript
const economy = await GangEconomy.findOne({ gangId });
```

### Find Active Businesses
```typescript
const businesses = await GangBusiness.find({
  gangId,
  status: BusinessStatus.ACTIVE
});
```

### Find Businesses Needing Income
```typescript
const businesses = await GangBusiness.findBusinessesNeedingIncome();
```

### Find Active Heists
```typescript
const heists = await GangHeist.findActiveHeists(gangId);
```

### Check Heist Cooldown
```typescript
const onCooldown = await GangHeist.isTargetOnCooldown(
  gangId,
  HeistTarget.RED_GULCH_BANK,
  7 // days
);
```

## Constants & Config

### Import Shared Types
```typescript
import {
  GangBankAccountType,
  BusinessType,
  BusinessCategory,
  HeistTarget,
  HeistRole,
  RiskLevel,
  BUSINESS_CONFIGS,
  HEIST_CONFIGS,
  BANK_INTEREST,
  PAYROLL_CONSTANTS
} from '@desperados/shared';
```

### Access Business Config
```typescript
const config = BUSINESS_CONFIGS[BusinessType.SALOON];
// {
//   name: 'Saloon',
//   category: BusinessCategory.LEGITIMATE,
//   startupCost: 1000,
//   dailyIncome: { min: 50, max: 200 },
//   operatingCost: 20,
//   riskLevel: RiskLevel.SAFE,
//   description: '...'
// }
```

### Access Heist Config
```typescript
const config = HEIST_CONFIGS[HeistTarget.RED_GULCH_BANK];
// {
//   name: 'Red Gulch Bank',
//   location: 'Red Gulch',
//   potentialPayout: { min: 2000, max: 5000 },
//   requiredMembers: 3,
//   equipmentCost: 200,
//   baseRiskLevel: 40,
//   requiredRoles: [HeistRole.LOOKOUT, HeistRole.SAFECRACKER, HeistRole.MUSCLE],
//   cooldownDays: 7
// }
```

## Error Handling

### Common Errors
```typescript
// Insufficient funds
'Insufficient funds in operating_fund. Have X, need Y'

// Permission denied
'Only the leader can purchase businesses'
'Only officers and leaders can withdraw from gang accounts'

// Business requirements
'Gang must be level 5 to purchase this business'
'Gang must control at least one territory to run a protection racket'

// Heist requirements
'Heist is not ready to execute'
'Gang must be level 3 for this heist'
'Heist target is on cooldown for 7 days'

// Payroll
'Wage must be between 0 and 1000'
'Member X not found in gang'
```

## Testing Examples

### Create Test Economy
```typescript
const economy = await GangEconomyService.initializeEconomy(
  gangId,
  'Test Gang'
);

// Deposit funds
await GangEconomyService.depositToAccount(
  gangId,
  characterId,
  GangBankAccountType.OPERATING_FUND,
  10000
);
```

### Simulate Business Income
```typescript
const business = await GangBusiness.create({
  gangId,
  gangName: 'Test Gang',
  name: 'Test Saloon',
  businessType: BusinessType.SALOON,
  category: BusinessCategory.LEGITIMATE,
  location: 'Red Gulch',
  startupCost: 1000,
  dailyIncome: { min: 50, max: 200 },
  riskLevel: RiskLevel.SAFE,
  operatingCost: 20,
  status: BusinessStatus.ACTIVE
});

const income = business.calculateDailyIncome();
// Returns random value between 30-180 (income - cost)
```

### Test Heist Execution
```typescript
const heist = await HeistService.planHeist(gangId, leaderId, {
  target: HeistTarget.STAGECOACH,
  roleAssignments: [
    { role: HeistRole.MUSCLE, characterId: char1 },
    { role: HeistRole.DRIVER, characterId: char2 }
  ]
});

// Increase planning to 100%
for (let i = 0; i < 10; i++) {
  await HeistService.increasePlanning(gangId, heist._id, char1, 10);
}

// Execute
const result = await HeistService.executeHeist(gangId, heist._id, leaderId);
// Check result.outcome, result.payout, etc.
```

## Monitoring

### Key Metrics to Track
- Total economies initialized
- Daily business income generated
- Businesses raided per day
- Weekly payroll amounts
- Heist success/failure rates
- Investment returns
- Failed transactions

### Logging
All major operations log to console with prefix:
- `[GangEconomy]` for economy operations
- Check logs for daily/weekly job execution
- Monitor for transaction failures

---

**Need more details?** See `PHASE_6_GANG_ECONOMY_COMPLETE.md` for comprehensive documentation.
