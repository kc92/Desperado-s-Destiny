# Action Effects System - Quick Reference Guide

**Phase 11, Wave 11.1**

## Quick Integration Examples

### 1. Add Influence to Existing Action (Middleware Approach)

```typescript
// In your action handler
import { setActionInfluenceData } from '../middleware/actionInfluence.middleware';
import { ActionCategory, FactionId } from '@desperados/shared';

export async function handleBankRobbery(req: AuthRequest, res: Response) {
  // ... your existing action logic ...

  // Mark for influence tracking
  setActionInfluenceData(req, {
    success: result.success,
    actionId: 'rob-bank',
    actionCategory: ActionCategory.SPECIAL_BANK_ROBBERY,
    targetFaction: FactionId.SETTLER_ALLIANCE,
    territoryId: 'red-gulch',
    characterId: character._id.toString(),
  });

  res.json({ success: true, result });
}

// In your route
router.post('/rob-bank',
  requireAuth,
  handleBankRobbery,
  applyActionInfluence // <-- Auto-applies influence
);
```

### 2. Manual Influence Application

```typescript
import { ActionEffectsService } from '../services/actionEffects.service';

const result = await ActionEffectsService.applyActionInfluence(
  character._id,
  ActionCategory.COMBAT_DEFEND_TERRITORY,
  'fort-ashford',
  FactionId.MILITARY
);

console.log(`Influence: ${result.primaryInfluenceChange}`);
if (result.milestoneReached) {
  console.log(`Milestone: ${result.milestoneReached}`);
}
```

### 3. Get Player Contribution

```typescript
const contribution = await ActionEffectsService.getPlayerContribution(
  character._id,
  FactionId.SETTLER_ALLIANCE
);

console.log(`Total: ${contribution.totalInfluenceContributed}`);
console.log(`Milestone: ${contribution.currentMilestone}`);
console.log(`Weekly: ${contribution.weeklyInfluence}`);
```

### 4. Get Leaderboard

```typescript
import { InfluenceLeaderboardService } from '../services/influenceLeaderboard.service';

const leaderboard = await InfluenceLeaderboardService.getFactionLeaderboard(
  FactionId.SETTLER_ALLIANCE,
  100,
  'weekly'
);

for (const entry of leaderboard.topContributors) {
  console.log(`#${entry.rank}: ${entry.characterName}`);
}
```

## Action Categories Reference

### Combat
```typescript
ActionCategory.COMBAT_NPC_KILL          // -2 to -10
ActionCategory.COMBAT_ENEMY_KILL        // +2 to +10
ActionCategory.COMBAT_DUEL_WIN          // +3 to +8
ActionCategory.COMBAT_DEFEND_TERRITORY  // +10 to +20
ActionCategory.COMBAT_RAID_TERRITORY    // -10 to -20
ActionCategory.COMBAT_BOUNTY_CLAIM      // +5 to +12
ActionCategory.COMBAT_ESCORT_MISSION    // +4 to +10
```

### Economic
```typescript
ActionCategory.ECONOMIC_FACTION_JOB     // +3 to +8
ActionCategory.ECONOMIC_TRADE           // +1 per 200 gold
ActionCategory.ECONOMIC_DONATE          // +1 per 100 gold
ActionCategory.ECONOMIC_SABOTAGE        // -5 to -15
ActionCategory.ECONOMIC_INVEST          // +5 to +20
ActionCategory.ECONOMIC_MERCHANT_DEAL   // +2 to +7
ActionCategory.ECONOMIC_PROPERTY_PURCHASE // +5 to +15
```

### Criminal
```typescript
ActionCategory.CRIMINAL_ROB_TERRITORY     // -2 to -5
ActionCategory.CRIMINAL_SMUGGLE           // +5 to +10
ActionCategory.CRIMINAL_ARREST            // +3 to +8
ActionCategory.CRIMINAL_BREAKOUT          // +8 to +15
ActionCategory.CRIMINAL_PROTECTION_RACKET // +4 to +9
ActionCategory.CRIMINAL_CONTRABAND        // +3 to +8
ActionCategory.CRIMINAL_ASSASSINATION     // -10 to -25
```

### Social
```typescript
ActionCategory.SOCIAL_REPUTATION_QUEST  // +10 to +25
ActionCategory.SOCIAL_PROPAGANDA        // +3 to +8
ActionCategory.SOCIAL_RECRUIT           // +5 to +15
ActionCategory.SOCIAL_BETRAY            // -30 to -50
ActionCategory.SOCIAL_DIPLOMACY         // +5 to +12
ActionCategory.SOCIAL_NEGOTIATE         // +4 to +10
ActionCategory.SOCIAL_MEDIATE           // +2 to +7
```

### Gang
```typescript
ActionCategory.GANG_CONTROL_BUILDING  // +2 to +5 daily
ActionCategory.GANG_CLAIM_TERRITORY   // +10 to +30
ActionCategory.GANG_WAR_VICTORY       // +20 to +40
ActionCategory.GANG_ALLIANCE          // +5 to +15
ActionCategory.GANG_RAID              // +8 to +18
ActionCategory.GANG_DEFEND            // +10 to +22
```

### Special
```typescript
ActionCategory.SPECIAL_TRAIN_HEIST        // -15 to -30
ActionCategory.SPECIAL_BANK_ROBBERY       // -18 to -35
ActionCategory.SPECIAL_ARTIFACT_RECOVERY  // +20 to +45
ActionCategory.SPECIAL_RITUAL_COMPLETION  // +25 to +50
ActionCategory.SPECIAL_LEGENDARY_HUNT     // +20 to +40
```

## Faction IDs

```typescript
FactionId.SETTLER_ALLIANCE   // Settlers
FactionId.NAHI_COALITION     // Native Coalition
FactionId.FRONTERA_CARTEL    // Mexican Cartel
FactionId.LAW_ENFORCEMENT    // Sheriffs & Marshals
FactionId.OUTLAW_FACTION     // Bandits & Outlaws
FactionId.RAILROAD_CORP      // Railroad Company
FactionId.CHINESE_TONG       // Chinese Tong
FactionId.MILITARY           // US Military
```

## Milestone Thresholds

```typescript
ContributionMilestone.ALLY      // 100 influence
ContributionMilestone.CHAMPION  // 500 influence
ContributionMilestone.HERO      // 1,000 influence
ContributionMilestone.LEGEND    // 2,500 influence
ContributionMilestone.MYTHIC    // 5,000 influence
```

## Territory Multipliers

```typescript
'red-gulch'       → 1.25x (volatile)
'fort-ashford'    → 0.80x (stable)
'the-frontera'    → 1.50x (chaotic)
'coalition-lands' → 0.75x (protected)
'whiskey-ridge'   → 1.10x
'silver-springs'  → 1.15x
default           → 1.00x
```

## Modifier Calculations

```typescript
Character Level:  +1% per level above 10 (max +40%)
Reputation:       +1% per 100 reputation
Gang Bonus:       +3% per gang level (max +30%)
Skill Bonus:      +2% per avg skill level (max +20%)
Territory:        0.75x to 1.50x based on location
Event Bonus:      0% to 100% during events
```

## Diminishing Returns

```typescript
Standard Actions: 20/day, diminish after 5 at 90%
Gang Actions:     10/day, diminish after 3 at 85%
Special Actions:  5/day,  diminish after 2 at 80%
```

## Files to Import From

```typescript
// Types
import {
  ActionCategory,
  FactionId,
  ContributionMilestone,
  InfluenceChangeResult,
  // ... etc
} from '@desperados/shared';

// Services
import { ActionEffectsService } from '../services/actionEffects.service';
import { InfluenceLeaderboardService } from '../services/influenceLeaderboard.service';

// Middleware
import {
  applyActionInfluence,
  setActionInfluenceData,
  mapActionToInfluenceCategory,
  determineTargetFaction,
} from '../middleware/actionInfluence.middleware';

// Models
import { PlayerInfluenceContribution } from '../models/PlayerInfluenceContribution.model';
```

## Common Patterns

### Pattern 1: Auto-detect action category

```typescript
import { mapActionToInfluenceCategory } from '../middleware/actionInfluence.middleware';

const category = mapActionToInfluenceCategory('CRIME', 'rob-bank');
// Returns: ActionCategory.CRIMINAL_ROB_TERRITORY
```

### Pattern 2: Auto-detect faction

```typescript
import { determineTargetFaction } from '../middleware/actionInfluence.middleware';

const faction = determineTargetFaction('settler-job', 'red-gulch');
// Returns: FactionId.SETTLER_ALLIANCE
```

### Pattern 3: Check milestone progress

```typescript
const contribution = await PlayerInfluenceContribution.findByCharacter(
  characterId,
  factionId
);

const nextMilestone = contribution.getNextMilestone();
if (nextMilestone) {
  console.log(`Next: ${nextMilestone.milestone}`);
  console.log(`Need: ${nextMilestone.remaining} more influence`);
}
```

### Pattern 4: Get character rank

```typescript
const rankData = await InfluenceLeaderboardService.getCharacterRank(
  character._id,
  FactionId.SETTLER_ALLIANCE,
  'weekly'
);

console.log(`Rank: #${rankData.rank} of ${rankData.totalContributors}`);
console.log(`Percentile: Top ${rankData.percentile}%`);
```

## Response Structure

### InfluenceChangeResult
```typescript
{
  success: true,
  characterId: "...",
  actionCategory: ActionCategory.COMBAT_DUEL_WIN,
  primaryFaction: FactionId.SETTLER_ALLIANCE,
  primaryInfluenceChange: 15,
  secondaryChanges: [
    {
      factionId: FactionId.OUTLAW_FACTION,
      influenceChange: -5,
      reason: "Antagonist faction spillover"
    }
  ],
  modifiersApplied: {
    base: 5,
    characterLevel: 0.05,  // +5%
    reputation: 0.02,      // +2%
    gang: 0.15,            // +15%
    event: 0,
    territory: 1.25,       // Red Gulch
    skill: 0.10,           // +10%
    total: 15
  },
  newTotalContribution: 250,
  milestoneReached: ContributionMilestone.CHAMPION,
  territoryId: "red-gulch",
  territoryInfluenceChanged: true,
  leaderboardRankChange: 42
}
```

## Database Queries

### Find contribution
```typescript
const contrib = await PlayerInfluenceContribution.findByCharacter(
  characterId,
  factionId
);
```

### Get top contributors
```typescript
const top = await PlayerInfluenceContribution.getTopContributors(
  factionId,
  100,
  'weekly'
);
```

### Get faction total
```typescript
const total = await PlayerInfluenceContribution.getFactionTotalInfluence(
  factionId
);
```

## Configuration Locations

**Action base values:**
`server/src/data/actionInfluenceMap.ts` → `ACTION_INFLUENCE_MAP`

**Spillover rules:**
`server/src/data/actionInfluenceMap.ts` → `FACTION_SPILLOVER_RULES`

**Territory volatility:**
`server/src/data/actionInfluenceMap.ts` → `TERRITORY_VOLATILITY_MAP`

**Milestone thresholds:**
`shared/src/types/actionEffects.types.ts` → `MILESTONE_THRESHOLDS`

**Diminishing returns:**
`shared/src/types/actionEffects.types.ts` → `DAILY_CONTRIBUTION_LIMITS`

## Quick Checklist for Adding New Action

- [ ] Choose appropriate `ActionCategory`
- [ ] Determine `targetFaction` (or let system infer)
- [ ] Call `setActionInfluenceData()` in handler
- [ ] Add `applyActionInfluence` middleware to route
- [ ] Test influence calculation
- [ ] Verify spillover effects
- [ ] Check diminishing returns work

## Troubleshooting

**No influence applied:**
- Check if `success: true` in action result
- Verify `actionCategory` is set
- Ensure `targetFaction` is valid
- Check middleware is attached to route

**Wrong influence amount:**
- Review modifier calculations
- Check territory multiplier
- Verify diminishing returns
- Look at daily action count

**Milestone not triggering:**
- Check total contribution >= threshold
- Verify milestone not already achieved
- Review `milestonesAchieved` array

**Leaderboard not updating:**
- Contribution saved to database?
- Check indexes are created
- Verify query filters
- Look for transaction errors

## Performance Tips

1. **Cache leaderboards** - 5 minute cache recommended
2. **Use lean() queries** - For read-only operations
3. **Limit result sets** - Default to 100 entries max
4. **Index all queries** - 5 indexes provided
5. **Batch updates** - Use transactions for multiple changes

## Complete Full Example

```typescript
// In controller
import { ActionEffectsService } from '../services/actionEffects.service';
import { setActionInfluenceData } from '../middleware/actionInfluence.middleware';
import { ActionCategory, FactionId } from '@desperados/shared';

export async function performFactionJob(req: AuthRequest, res: Response) {
  const { jobId } = req.body;
  const character = await Character.findById(req.characterId);

  // Perform job logic
  const result = await doJob(character, jobId);

  // Mark for influence
  setActionInfluenceData(req, {
    success: result.success,
    actionId: jobId,
    actionCategory: ActionCategory.ECONOMIC_FACTION_JOB,
    targetFaction: FactionId.SETTLER_ALLIANCE,
    territoryId: character.currentLocation,
    characterId: character._id.toString(),
  });

  res.json({ success: true, result });
}

// In route
router.post('/jobs/:jobId/perform',
  requireAuth,
  performFactionJob,
  applyActionInfluence // Automatic influence
);

// To check result (optional)
router.post('/jobs/:jobId/perform',
  requireAuth,
  performFactionJob,
  applyActionInfluence,
  (req, res, next) => {
    const influence = res.locals.influenceResult;
    if (influence?.milestoneReached) {
      // Send notification, etc.
    }
    next();
  }
);
```

---

**For full documentation, see:** `docs/ACTION_EFFECTS_IMPLEMENTATION.md`
