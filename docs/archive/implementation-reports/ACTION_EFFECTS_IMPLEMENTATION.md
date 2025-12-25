# Action Effects System - Implementation Guide

**Phase 11, Wave 11.1: Player Action Effects on Territory**

## Overview

The Action Effects System makes player actions meaningfully impact territory control and faction standings. Every significant action contributes to faction influence, with modifiers based on character progression, gang alignment, and territory volatility.

## System Architecture

### Core Components

1. **Action Influence Map** - Defines base influence values for 50+ action types
2. **Player Contribution Tracking** - Records individual player influence contributions
3. **Leaderboard System** - Rankings and competition across factions
4. **Milestone System** - Progressive rewards for faction loyalty
5. **Spillover Effects** - How factions affect each other
6. **Territory Volatility** - Location-specific multipliers

## Files Created

### Shared Types
- `shared/src/types/actionEffects.types.ts` - Core types and interfaces

### Server Files
- `server/src/data/actionInfluenceMap.ts` - Action definitions and spillover rules
- `server/src/models/PlayerInfluenceContribution.model.ts` - Player tracking model
- `server/src/services/actionEffects.service.ts` - Influence calculation engine
- `server/src/services/influenceLeaderboard.service.ts` - Leaderboard queries
- `server/src/middleware/actionInfluence.middleware.ts` - Auto-apply middleware

## Action Categories

### Combat Actions (7 types)
- **COMBAT_NPC_KILL**: -2 to -10 faction influence
- **COMBAT_ENEMY_KILL**: +2 to +10 faction influence
- **COMBAT_DUEL_WIN**: +3 to +8 influence
- **COMBAT_DEFEND_TERRITORY**: +10 to +20 influence
- **COMBAT_RAID_TERRITORY**: -10 to -20 defender influence
- **COMBAT_BOUNTY_CLAIM**: +5 to +12 law enforcement
- **COMBAT_ESCORT_MISSION**: +4 to +10 influence

### Economic Actions (7 types)
- **ECONOMIC_FACTION_JOB**: +3 to +8 influence
- **ECONOMIC_TRADE**: +1 per 200 gold
- **ECONOMIC_DONATE**: +1 per 100 gold
- **ECONOMIC_SABOTAGE**: -5 to -15 rival influence
- **ECONOMIC_INVEST**: +5 to +20 influence
- **ECONOMIC_MERCHANT_DEAL**: +2 to +7 influence
- **ECONOMIC_PROPERTY_PURCHASE**: +5 to +15 influence

### Criminal Actions (7 types)
- **CRIMINAL_ROB_TERRITORY**: -2 to -5 controller influence
- **CRIMINAL_SMUGGLE**: +5 to +10 criminal faction
- **CRIMINAL_ARREST**: +3 to +8 law enforcement
- **CRIMINAL_BREAKOUT**: +8 to +15 outlaw, -15 law
- **CRIMINAL_PROTECTION_RACKET**: +4 to +9 influence
- **CRIMINAL_CONTRABAND**: +3 to +8 influence
- **CRIMINAL_ASSASSINATION**: -10 to -25 faction influence

### Social Actions (7 types)
- **SOCIAL_REPUTATION_QUEST**: +10 to +25 influence
- **SOCIAL_PROPAGANDA**: +3 to +8 influence
- **SOCIAL_RECRUIT**: +5 to +15 influence
- **SOCIAL_BETRAY**: -30 to -50 betrayed faction
- **SOCIAL_DIPLOMACY**: +5 to +12 influence
- **SOCIAL_NEGOTIATE**: +4 to +10 influence
- **SOCIAL_MEDIATE**: +2 to +7 influence

### Gang Actions (6 types)
- **GANG_CONTROL_BUILDING**: +2 to +5 daily passive
- **GANG_CLAIM_TERRITORY**: +10 to +30 influence
- **GANG_WAR_VICTORY**: +20 to +40 influence
- **GANG_ALLIANCE**: +5 to +15 to ally faction
- **GANG_RAID**: +8 to +18 influence
- **GANG_DEFEND**: +10 to +22 influence

### Special Actions (5 types)
- **SPECIAL_TRAIN_HEIST**: -15 to -30 railroad, +60% outlaw
- **SPECIAL_BANK_ROBBERY**: -18 to -35 faction, +70% outlaw
- **SPECIAL_ARTIFACT_RECOVERY**: +20 to +45 faction
- **SPECIAL_RITUAL_COMPLETION**: +25 to +50 Nahi Coalition
- **SPECIAL_LEGENDARY_HUNT**: +20 to +40 influence

## Influence Modifiers

### Character Level Bonus
```
+1% per level above 10
Level 15: +5% influence
Level 30: +20% influence
Level 50: +40% influence
```

### Reputation Bonus
```
+1% per 100 reputation
50 reputation: +0.5% influence
100 reputation: +1% influence
-50 reputation: -0.5% influence (penalties work too)
```

### Gang Bonus
```
+3% per gang level (max 30%)
Gang Level 5: +15% influence
Gang Level 10: +30% influence
```

### Skill Bonus
```
+2% per average skill level (max 20%)
Average skill 5: +10% influence
Average skill 10: +20% influence
```

### Territory Multipliers
- **Red Gulch**: 1.25x (volatile)
- **Fort Ashford**: 0.80x (stable, military controlled)
- **The Frontera**: 1.50x (chaotic)
- **Coalition Lands**: 0.75x (protected)
- **Whiskey Ridge**: 1.10x
- **Silver Springs**: 1.15x
- **Default**: 1.0x

## Faction Spillover System

When one faction gains, others may lose (and vice versa):

### Military Gains
- **Antagonists**: Outlaw -40%, Cartel -25%
- **Allies**: Law +20%, Settlers +15%

### Nahi Coalition Gains
- **Antagonists**: Railroad -35%, Military -20%
- **Allies**: Chinese Tong +15%

### Frontera Cartel Gains
- **Antagonists**: Settlers -30%, Law -35%
- **Allies**: Outlaws +20%

### Settler Alliance Gains
- **Antagonists**: Cartel -30%, Outlaws -20%
- **Allies**: Law +15%, Military +10%

### Law Enforcement Gains
- **Antagonists**: Outlaws -50%, Cartel -30%
- **Allies**: Settlers +15%, Military +20%

### Outlaw Faction Gains
- **Antagonists**: Law -45%, Military -25%
- **Allies**: Cartel +15%

## Milestone System

### Contribution Milestones

| Milestone | Influence Required | Rewards |
|-----------|-------------------|---------|
| **Ally** | 100 | Title, Bandana, Quest, 500 gold, 100 XP |
| **Champion** | 500 | Title, Vest + Hat, Perk, Quest, 2,000 gold, 500 XP |
| **Hero** | 1,000 | Title, Coat + Boots, 2 Abilities, Quest, 5,000 gold, 1,500 XP |
| **Legend** | 2,500 | Title, Legendary Outfit + Weapon, 3 Abilities, Quest, 10,000 gold, 3,000 XP |
| **Mythic** | 5,000 | Title, Mythic Set + Mount, 4 Abilities, Quest, 25,000 gold, 7,500 XP |

### Milestone Rewards Include
- Unique faction titles
- Exclusive cosmetics (clothing, weapons, mounts)
- Special abilities and perks
- Faction-specific quests
- Gold and XP bonuses

## Diminishing Returns

To prevent farming, influence gains decrease after repeated actions:

```typescript
Daily Limits:
- Standard actions: 20/day, diminish after 5 at 90% rate
- Gang actions: 10/day, diminish after 3 at 85% rate
- Special actions: 5/day, diminish after 2 at 80% rate

Example:
Action 1-5: Full influence
Action 6: 90% influence
Action 7: 81% influence (0.90 * 0.90)
Action 8: 73% influence (0.90^3)
```

## Implementation Examples

### Example 1: Adding Influence to Existing Action

```typescript
import {
  setActionInfluenceData,
  mapActionToInfluenceCategory,
  determineTargetFaction
} from '../middleware/actionInfluence.middleware';
import { ActionCategory, FactionId } from '@desperados/shared';

export async function performBankRobbery(req: AuthRequest, res: Response) {
  // ... existing action logic ...

  // Mark action for influence processing
  setActionInfluenceData(req, {
    success: result.success,
    actionId: 'rob-bank',
    actionCategory: ActionCategory.SPECIAL_BANK_ROBBERY,
    targetFaction: FactionId.SETTLER_ALLIANCE, // Bank's faction
    territoryId: 'red-gulch',
    characterId: character._id.toString(),
  });

  res.json({ success: true, result });
}

// In route:
router.post('/rob-bank',
  requireAuth,
  performBankRobbery,
  applyActionInfluence // <-- Auto-applies influence
);
```

### Example 2: Manual Influence Application

```typescript
import { ActionEffectsService } from '../services/actionEffects.service';
import { ActionCategory, FactionId } from '@desperados/shared';

// Apply influence directly
const influenceResult = await ActionEffectsService.applyActionInfluence(
  character._id,
  ActionCategory.COMBAT_DEFEND_TERRITORY,
  'fort-ashford',
  FactionId.MILITARY
);

if (influenceResult.milestoneReached) {
  // Character reached a new milestone!
  console.log(`Milestone reached: ${influenceResult.milestoneReached}`);
  // Award rewards, send notification, etc.
}
```

### Example 3: Checking Player Contribution

```typescript
import { ActionEffectsService } from '../services/actionEffects.service';
import { FactionId } from '@desperados/shared';

// Get player's contribution to a faction
const contribution = await ActionEffectsService.getPlayerContribution(
  character._id,
  FactionId.NAHI_COALITION
);

if (contribution) {
  console.log(`Total influence: ${contribution.totalInfluenceContributed}`);
  console.log(`Current milestone: ${contribution.currentMilestone}`);
  console.log(`Weekly influence: ${contribution.weeklyInfluence}`);

  // Get next milestone
  const next = contribution.getNextMilestone();
  if (next) {
    console.log(`Next: ${next.milestone} (${next.remaining} remaining)`);
  }
}
```

### Example 4: Leaderboard Queries

```typescript
import { InfluenceLeaderboardService } from '../services/influenceLeaderboard.service';
import { FactionId } from '@desperados/shared';

// Get faction leaderboard
const leaderboard = await InfluenceLeaderboardService.getFactionLeaderboard(
  FactionId.SETTLER_ALLIANCE,
  100, // Top 100
  'weekly' // This week's rankings
);

console.log(`Faction: ${leaderboard.factionName}`);
console.log(`Total influence: ${leaderboard.totalFactionInfluence}`);
console.log(`Weekly growth: ${leaderboard.weeklyGrowth}`);

for (const entry of leaderboard.topContributors) {
  console.log(
    `#${entry.rank}: ${entry.characterName} (${entry.totalInfluence} influence)`
  );
}

// Get character's rank
const rank = await InfluenceLeaderboardService.getCharacterRank(
  character._id,
  FactionId.SETTLER_ALLIANCE,
  'weekly'
);

console.log(`Your rank: #${rank.rank} of ${rank.totalContributors}`);
console.log(`Percentile: Top ${rank.percentile}%`);
```

## Faction Alignment

### Settler Alliance
- Values: Law, order, civilization
- Antagonists: Cartel, Outlaws
- Allies: Law Enforcement, Military
- Strong in: Red Gulch, Silver Springs

### Nahi Coalition
- Values: Tradition, spirituality, land
- Antagonists: Railroad, Military
- Allies: Chinese Tong
- Strong in: Coalition Lands

### Frontera Cartel
- Values: Power, profit, expansion
- Antagonists: Settlers, Law
- Allies: Outlaws
- Strong in: The Frontera

### Law Enforcement
- Values: Justice, order, protection
- Antagonists: Outlaws, Cartel
- Allies: Settlers, Military
- Strong in: Fort Ashford, settled areas

### Outlaw Faction
- Values: Freedom, chaos, rebellion
- Antagonists: Law, Military
- Allies: Cartel (sometimes)
- Strong in: Whiskey Ridge, wilderness

### Railroad Corporation
- Values: Progress, commerce, expansion
- Antagonists: Nahi Coalition, Outlaws
- Allies: Settlers, Military
- Strong in: Railroad Junction

## Database Schema

### PlayerInfluenceContribution Collection

```javascript
{
  characterId: ObjectId,
  characterName: String,
  factionId: String (enum),
  totalInfluenceContributed: Number,
  currentMilestone: String (enum, nullable),
  milestonesAchieved: [String],

  contributionsByType: [{
    category: String (ActionCategory),
    amount: Number
  }],

  contributionsByTerritory: [{
    territoryId: String,
    amount: Number
  }],

  dailyContributions: [{
    date: Date,
    amount: Number,
    actionCount: Number
  }],

  weeklyInfluence: Number,
  monthlyInfluence: Number,

  lastContribution: Date,
  firstContribution: Date,
  lastMilestoneReached: Date,
  totalActionsPerformed: Number
}
```

## Performance Considerations

### Indexes
```javascript
// Primary lookup
{ characterId: 1, factionId: 1 } (unique)

// Leaderboards
{ factionId: 1, totalInfluenceContributed: -1 }
{ factionId: 1, weeklyInfluence: -1 }
{ factionId: 1, monthlyInfluence: -1 }

// Cleanup jobs
{ lastContribution: 1 }
```

### Caching Strategy
- Cache leaderboard results for 5 minutes
- Cache faction totals for 10 minutes
- Cache character ranks for 2 minutes
- Update contribution records immediately

## Testing Checklist

- [ ] Apply influence for each action category
- [ ] Verify modifier calculations (level, reputation, gang, skill)
- [ ] Test spillover effects between factions
- [ ] Verify diminishing returns after repeated actions
- [ ] Test milestone progression and rewards
- [ ] Verify territory multipliers work correctly
- [ ] Test leaderboard queries (all, weekly, monthly)
- [ ] Test rank calculations
- [ ] Verify contribution tracking accuracy
- [ ] Test edge cases (negative influence, zero gains)

## Future Enhancements

1. **Territory Flip Tracking**: Record when territories change hands
2. **Event Multipliers**: Special events that boost influence gains
3. **Faction Wars**: Periodic competitions between factions
4. **Faction Quests**: Dynamic quests based on faction needs
5. **Alliance System**: Temporary alliances between factions
6. **Faction Abilities**: Unlock special abilities per faction
7. **Territory Benefits**: Link influence to tangible territory bonuses
8. **Influence Decay**: Slow decay for inactive players
9. **Faction Storylines**: Narrative events based on faction dominance
10. **Cross-Server Competition**: Global faction leaderboards

## Integration Points

### Current Systems
- Actions System: Hook via middleware
- Territory System: Territory multipliers
- Gang System: Gang alignment bonuses
- Character System: Level and reputation modifiers
- Skill System: Skill-based bonuses

### Future Systems
- Quest System: Faction-specific quests
- Event System: Event multipliers
- Notification System: Milestone notifications
- Achievement System: Faction achievements
- Reward System: Cosmetics and abilities

## API Endpoints (To Be Created)

### Influence Management
- `GET /api/influence/my-contributions` - Get all player contributions
- `GET /api/influence/:factionId` - Get specific faction contribution
- `GET /api/influence/:factionId/rank` - Get player's faction rank

### Leaderboards
- `GET /api/leaderboards/global` - Global leaderboard
- `GET /api/leaderboards/faction/:factionId` - Faction leaderboard
- `GET /api/leaderboards/all-factions` - All faction leaderboards
- `GET /api/leaderboards/power-rankings` - Faction power rankings
- `GET /api/leaderboards/weekly-top` - Weekly top performers

### Statistics
- `GET /api/influence/stats/effectiveness` - Action effectiveness stats
- `GET /api/influence/stats/territory-flips` - Recent territory changes
- `GET /api/influence/stats/milestones` - Recent milestone achievements

## Configuration

All configuration values are in:
- `shared/src/types/actionEffects.types.ts` - Constants
- `server/src/data/actionInfluenceMap.ts` - Action definitions

Easy to adjust:
- Influence base values
- Modifier percentages
- Spillover rates
- Milestone thresholds
- Diminishing return rates
- Territory multipliers

## Conclusion

The Action Effects System provides deep player agency and meaningful progression beyond individual character advancement. Players can shape the world, compete for faction dominance, and earn exclusive rewards through their actions.

Every action matters. Every player contributes. Every faction competes.

**Welcome to the living, breathing world of Desperados Destiny.**
