# Gang Bases - Quick Reference Guide

## Base Tier Costs & Capacities

| Tier | Name | Cost | Members | Storage | Defense |
|------|------|------|---------|---------|---------|
| 1 | Hideout | 500g | 5 | 50 | 10 |
| 2 | Safehouse | 2,000g | 10 | 100 | 25 |
| 3 | Compound | 5,000g | 20 | 250 | 50 |
| 4 | Fortress | 15,000g | 35 | 500 | 75 |
| 5 | Criminal Empire HQ | 50,000g | 50 | 1,000 | 100 |

## Location Bonuses

| Location | Bonus 1 | Bonus 2 |
|----------|---------|---------|
| Frontera | +20% crime success | -20% law detection |
| Wilderness | +10% escape | Harder to find |
| Near Town | +10% recruitment | Easier supplies |
| Mountains | +25% defense | Hard to reach |

## Facilities

| Facility | Min Tier | Cost | Key Benefits |
|----------|----------|------|--------------|
| Meeting Room | 1 | Free | Gang chat bonus |
| Storage | 1 | Free | Item storage |
| Armory | 2 | Free | Shared weapons |
| War Room | 3 | 2,000g | War planning |
| Training Grounds | 3 | 1,500g | +5% XP |
| Stables | 3 | 800g | Mount storage |
| Prison Cells | 4 | 3,000g | Hold prisoners |
| Underground Vault | 4 | 5,000g | +50% storage |

## Upgrades

| Upgrade | Min Tier | Cost | Key Benefits |
|---------|----------|------|--------------|
| Forge | 3 | 2,500g | Repair/craft weapons |
| Infirmary | 2 | 2,000g | Faster HP recovery |
| Lookout Tower | 3 | 1,800g | +15% defense, early warning |
| Secret Exit | 2 | 3,000g | +1 escape route, +25% escape |
| Alarm System | 3 | 2,200g | +20% defense, alerts |
| Trap System | 3 | 2,800g | +30% defense |
| Stable Expansion | 3 | 1,500g | +10% mount speed |
| Reinforced Vault | 4 | 4,000g | 2× storage capacity |

## Defense Costs

### Guards
- **Hire Cost**: Level × 50 gold
- **Upkeep**: Level × 10 gold/week
- **Max**: 10 guards

### Traps
- **Cost**: Effectiveness × 10 gold
- **Max**: 15 traps
- **Types**: Alarm, Damage, Slow, Capture

## Permissions

| Action | Leader | Officer | Member |
|--------|--------|---------|--------|
| Establish base | ✅ | ❌ | ❌ |
| Upgrade tier | ✅ | ❌ | ❌ |
| Add facility/upgrade | ✅ | ❌ | ❌ |
| Hire/fire guards | ✅ | ❌ | ❌ |
| Install/remove traps | ✅ | ❌ | ❌ |
| View base | ✅ | ✅ | ✅ |
| Deposit items | ✅ | ✅ | ✅ |
| Withdraw items | ✅ | ✅ | ❌ |

## API Endpoints

```
POST   /api/gangs/:gangId/base/establish
GET    /api/gangs/:gangId/base
POST   /api/gangs/:gangId/base/upgrade
POST   /api/gangs/:gangId/base/facility
POST   /api/gangs/:gangId/base/upgrade-feature

POST   /api/gangs/:gangId/base/defense/guard
DELETE /api/gangs/:gangId/base/defense/guard/:guardId
POST   /api/gangs/:gangId/base/defense/trap
DELETE /api/gangs/:gangId/base/defense/trap/:trapId

GET    /api/gangs/:gangId/base/storage
POST   /api/gangs/:gangId/base/storage/deposit
POST   /api/gangs/:gangId/base/storage/withdraw
```

## Defense Rating Formula

```
Base Defense (10-100 based on tier)
+ (Active Guards' Combat Skills / 10)
+ (Active Traps' Effectiveness / 10)
+ Location Defense Bonus
+ (Alarm Level / 10)
= Overall Defense (max 100)
```

## Constraints

- Max Facilities: 8
- Max Upgrades: 8
- Max Guards: 10
- Max Traps: 15
- Max Storage: Tier-dependent (50-1,000)
- Max Escape Routes: 5

## Development Setup

### Import Types
```typescript
import {
  BaseTier,
  BaseLocationType,
  FacilityType,
  BaseUpgradeType,
  BASE_TIER_INFO,
  BASE_LOCATION_INFO,
  FACILITY_INFO,
  BASE_UPGRADE_INFO,
} from '@desperados/shared';
```

### Models
```typescript
import { GangBase, IGangBase } from '../models/GangBase.model';
import { Gang, IGang } from '../models/Gang.model';
```

### Services
```typescript
import { GangBaseService } from '../services/gangBase.service';
```

## Example: Establish a Base

```typescript
const base = await GangBaseService.establishBase(
  gangId,           // Gang ID
  characterId,      // Leader character ID
  BaseTier.HIDEOUT, // Starting tier (1)
  BaseLocationType.FRONTERA, // Location
  'The Badlands',   // Region name
  { x: 100, y: 200 } // Optional coordinates
);
```

## Example: Full Progression

1. **Establish**: Hideout in Frontera (500g)
2. **Upgrade**: → Safehouse (2,000g)
3. **Add Facility**: Training Grounds (1,500g)
4. **Add Upgrade**: Lookout Tower (1,800g)
5. **Hire Guards**: 2× Level 10 guards (1,000g)
6. **Install Traps**: 3× Alarm traps (varies)
7. **Upgrade**: → Compound (5,000g)
8. **Add Facility**: War Room (2,000g)
9. Continue upgrading...

**Total for Tier 3 with features**: ~13,300+ gold

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Gang already has a base" | Base exists | Can't create second base |
| "Only the gang leader can..." | Permission denied | Must be leader |
| "Insufficient gang bank funds" | Not enough gold | Deposit more gold |
| "Base must be tier X or higher" | Tier requirement | Upgrade base tier first |
| "Cannot add facility" | Max reached or duplicate | Check constraints |
| "Insufficient items in storage" | Not enough items | Check storage quantity |

## Tips for Players

1. **Start in Frontera** for crime bonuses if you're an outlaw gang
2. **Choose Mountains** if you prioritize defense
3. **Upgrade to Tier 3** ASAP for Training Grounds (+5% XP)
4. **Add Lookout Tower** early for raid protection
5. **Install Secret Exit** before engaging in gang wars
6. **Hire high-level guards** rather than many low-level ones
7. **Use storage** to share weapons among members
8. **Coordinate deposits** to maximize storage efficiency

## Integration Notes

- Gang base automatically linked to gang via `baseId` field
- Storage integrates with character inventory system
- Gold costs use gang bank (not individual character gold)
- All operations logged for audit trail
- Defense rating recalculated automatically on changes

---

*Quick Reference | Phase 6 Wave 6.1 | Gang Bases/Headquarters*
