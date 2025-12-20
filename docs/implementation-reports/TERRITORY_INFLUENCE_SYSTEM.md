# Territory Influence System

**Phase 11, Wave 11.1 - Territory Influence System**

## Overview

The Territory Influence System allows six major factions to compete for control of 11 territories across the Sangre Territory. Players can influence territory control through their actions, and aligned players receive benefits in controlled territories.

## Factions

### 1. Settler Alliance
- **Description**: Legitimate business owners and law enforcement seeking order
- **Strengths**: Economic power, law enforcement
- **Style**: Lawful, structured, protective

### 2. Nahi Coalition
- **Description**: Native American tribes protecting sacred lands and traditions
- **Strengths**: Spiritual power, territorial defense
- **Style**: Defensive, spiritual, honor-bound

### 3. Frontera Cartel
- **Description**: Criminal organization controlling smuggling and vice
- **Strengths**: Criminal networks, wealth
- **Style**: Ruthless, profitable, underground

### 4. U.S. Military
- **Description**: Federal forces maintaining order and expanding territory
- **Strengths**: Military might, organization
- **Style**: Disciplined, powerful, authoritative

### 5. Railroad Barons
- **Description**: Corporate interests driving expansion and industrialization
- **Strengths**: Industrial power, wealth
- **Style**: Corporate, expansionist, pragmatic

### 6. Independent Outlaws
- **Description**: Player gangs and opportunistic criminals
- **Strengths**: Flexibility, player-driven
- **Style**: Chaotic, opportunistic, diverse

## Territories

### Towns (4)

#### 1. Red Gulch
- **Status**: Contested by all factions
- **Strategic Value**: 9/10 (Highest)
- **Description**: Bustling frontier town rich in resources
- **Initial Control**: Contested (multiple factions ~20% each)
- **Law Level**: 60%
- **Economic Health**: 70%

#### 2. The Frontera
- **Status**: Cartel Stronghold
- **Strategic Value**: 8/10
- **Description**: Lawless border town, smuggling center
- **Initial Control**: Frontera Cartel (60% dominated)
- **Law Level**: 20%
- **Economic Health**: 60%

#### 3. Fort Ashford
- **Status**: Military Installation
- **Strategic Value**: 7/10
- **Description**: Heavily fortified military base
- **Initial Control**: U.S. Military (70% dominated)
- **Law Level**: 90%
- **Economic Health**: 65%

#### 4. Whiskey Bend
- **Status**: Railroad Hub
- **Strategic Value**: 8/10
- **Description**: Contested between settlers and railroad
- **Initial Control**: Disputed (Railroad 35%, Settler 30%)
- **Law Level**: 65%
- **Economic Health**: 80%

### Wilderness (7)

#### 5. Kaiowa Mesa
- **Status**: Sacred Nahi Land
- **Strategic Value**: 6/10
- **Description**: Ancient burial grounds and spiritual sites
- **Initial Control**: Nahi Coalition (75% dominated)
- **Law Level**: 40%
- **Economic Health**: 30%

#### 6. Spirit Springs
- **Status**: Holy Springs
- **Strategic Value**: 7/10
- **Description**: Fresh water source with spiritual power
- **Initial Control**: Nahi Coalition (80% dominated)
- **Law Level**: 30%
- **Economic Health**: 40%

#### 7. Thunderbird's Perch
- **Status**: Sacred Mountain
- **Strategic Value**: 5/10
- **Description**: Site of ancient rituals and visions
- **Initial Control**: Nahi Coalition (85% dominated)
- **Law Level**: 20%
- **Economic Health**: 20%

#### 8. Longhorn Ranch
- **Status**: Settler Territory
- **Strategic Value**: 7/10
- **Description**: Vast cattle ranch, economic powerhouse
- **Initial Control**: Settler Alliance (65% controlled)
- **Law Level**: 50%
- **Economic Health**: 75%

#### 9. Goldfinger's Mine
- **Status**: Highly Contested
- **Strategic Value**: 10/10 (Maximum)
- **Description**: Rich gold mine, immense wealth
- **Initial Control**: Contested (5 factions ~20% each)
- **Law Level**: 30%
- **Economic Health**: 90%

#### 10. The Wastes
- **Status**: Outlaw Haven
- **Strategic Value**: 4/10
- **Description**: Lawless badlands, criminal hideout
- **Initial Control**: Independent Outlaws (50% controlled)
- **Law Level**: 10%
- **Economic Health**: 25%

#### 11. The Scar
- **Status**: Neutral/Dangerous
- **Strategic Value**: 3/10
- **Description**: Desolate wasteland, unpredictable
- **Initial Control**: Contested (Independent 30%, others lower)
- **Law Level**: 5%
- **Economic Health**: 10%

## Control Mechanics

### Control Levels

1. **Contested** (No faction > 30%)
   - No controlling faction
   - Unstable, rapidly changing
   - Minimal benefits

2. **Disputed** (One faction 30-49%, others close)
   - Weak control by one faction
   - Vulnerable to takeover
   - Moderate benefits

3. **Controlled** (One faction 50-69%)
   - Strong control
   - Stable but challengeable
   - Good benefits

4. **Dominated** (One faction 70%+)
   - Absolute control
   - Very difficult to challenge
   - Maximum benefits

### Influence Range
- Each faction has 0-100% influence per territory
- Total influence across all factions can exceed 100%
- Relative influence determines control

## Influence Sources

### Positive Influence (Gain)

| Source | Amount | Description |
|--------|--------|-------------|
| Faction Quests | +5 to +20 | Complete quests for aligned faction |
| Donations | +1 per 100 gold | Donate gold to faction |
| Enemy Kills | +2 to +10 | Kill members of rival factions |
| Structure Building | +10 to +30 | Build faction structures |
| Event Victories | +15 to +50 | Win territory events |
| Gang Alignment | +1 to +5 daily | Passive gain from gang alignment |

### Negative Influence (Loss)

| Source | Amount | Description |
|--------|--------|-------------|
| Faction Attacks | -5 to -20 | Attack aligned faction members |
| Rival Quests | -2 to -10 | Complete quests for rival factions |
| Criminal Activity | -1 to -5 | Crimes in controlled territory |
| Event Defeats | -10 to -30 | Lose territory events |

### Daily Decay
- All factions decay 1% per day toward equilibrium (16.67%)
- Prevents permanent lockdown
- Requires active maintenance
- Minimum floor of 5% influence

## Player Benefits

### Alignment Benefits by Control Level

| Control Level | Shop Discount | Rep Bonus | Crime Heat Reduction |
|---------------|---------------|-----------|---------------------|
| Contested | 0% | 0% | 0% |
| Disputed | 5% | 5% | 5% |
| Controlled | 15% | 10% | 10% |
| Dominated | 25% | 15% | 15% |

### Additional Benefits
- **Safe Houses**: Access in Controlled/Dominated territories
- **Job Priority**: Priority access in Dominated territories
- **Safe Passage**: Reduced NPC aggression
- **Exclusive Quests**: Faction-specific missions

## Faction Control Benefits

When a faction controls a territory, they receive:
- **Tax Revenue**: Daily gold income
- **Reputation Multiplier**: Faster reputation gains
- **Service Discounts**: Cheaper faction services
- **Exclusive Quests**: Special faction missions
- **Safe Passage**: Faction members not attacked

## Technical Implementation

### Database Models

#### TerritoryInfluence
```typescript
{
  territoryId: string;
  territoryName: string;
  territoryType: 'TOWN' | 'WILDERNESS';
  factionInfluence: FactionInfluence[];
  controllingFaction?: FactionId;
  controlLevel: ControlLevel;
  stability: number; // 0-100
  lawLevel: number; // 0-100
  economicHealth: number; // 0-100
  previousController?: FactionId;
  controlChangedAt?: Date;
  contestedSince?: Date;
  activeBuffs: TerritoryEffect[];
  activeDebuffs: TerritoryEffect[];
  lastDecayAt: Date;
}
```

#### InfluenceHistory
```typescript
{
  territoryId: string;
  territoryName: string;
  factionId: FactionId;
  amount: number;
  source: InfluenceSource;
  characterId?: string;
  characterName?: string;
  gangId?: string;
  gangName?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}
```

### Service Methods

#### TerritoryInfluenceService

- `initializeTerritories()`: Set up all territories with initial values
- `modifyInfluence()`: Add/remove faction influence
- `applyDailyDecay()`: Process daily influence decay
- `getTerritoryInfluence()`: Get current territory state
- `getAllTerritories()`: Get all territory summaries
- `getFactionOverview()`: Get faction's global status
- `getAlignmentBenefits()`: Calculate player benefits
- `getInfluenceHistory()`: Retrieve change history
- `applyQuestInfluence()`: Handle quest completion
- `applyDonationInfluence()`: Handle faction donations
- `applyCrimeInfluence()`: Handle criminal activity
- `applyGangAlignmentInfluence()`: Handle passive gang influence

### Jobs

#### influenceDecay.job
- Runs daily at 3:00 AM
- Applies 1% decay to all factions
- Moves influence toward equilibrium
- Checks for control changes
- Logs all decay events

### API Integration Points

The system is ready for API integration:

1. **GET /api/territories/influence**: List all territories
2. **GET /api/territories/influence/:id**: Get specific territory
3. **GET /api/factions/:id/overview**: Faction global status
4. **POST /api/territories/influence/modify**: Admin modify influence
5. **GET /api/territories/influence/history/:id**: Territory history
6. **GET /api/characters/:id/influence**: Character contributions

## Initialization

To initialize the territory system:

```bash
npm run script:init-territories
```

This will:
1. Create all 11 territories
2. Set initial faction influence values
3. Calculate initial control levels
4. Display summary of all territories

## Strategic Considerations

### For Players
- **Choose Alignment Carefully**: Benefits vary by faction and control level
- **Active Maintenance**: Influence decays without activity
- **Strategic Location**: Benefits only apply in controlled territories
- **Gang Coordination**: Gang alignment provides passive daily influence

### For Gangs
- **Territory Selection**: Focus on high-value contested territories
- **Faction Alignment**: Align with faction for passive influence
- **Coordinated Efforts**: Multiple gang members can stack influence
- **Defense**: Must maintain influence to prevent takeover

### For Factions (NPC)
- **Initial Strongholds**: Each faction starts with 1-3 dominated territories
- **Contested Zones**: Red Gulch and Goldfinger's Mine are key battlegrounds
- **Natural Barriers**: Some territories favor specific factions
- **Balance**: Decay system prevents permanent dominance

## Future Expansion Ideas

1. **Territory Events**: Special events that grant bonus influence
2. **Faction Alliances**: Temporary alliances between factions
3. **Territory Upgrades**: Player-built structures that boost influence
4. **Faction Reputation**: Separate reputation system per faction
5. **Dynamic Quests**: Quests based on current territory control
6. **Territory Wars**: Large-scale faction battles
7. **Neutral Zones**: Territories that can't be controlled
8. **Territory Benefits Stacking**: Multiple territory bonuses
9. **Faction Leaders**: NPC faction leaders with special quests
10. **Historical Events**: Major events that shift influence dramatically

## Files Created

1. `shared/src/types/territoryWar.types.ts` - Type definitions
2. `server/src/data/territoryDefinitions.ts` - Territory configurations
3. `server/src/models/TerritoryInfluence.model.ts` - Influence tracking model
4. `server/src/models/InfluenceHistory.model.ts` - Change history model
5. `server/src/services/territoryInfluence.service.ts` - Business logic
6. `server/src/jobs/influenceDecay.job.ts` - Daily decay job
7. `server/src/scripts/initializeTerritories.ts` - Initialization script

## Testing

The system is ready for testing:

1. **Initialize territories**: Run init script
2. **Modify influence**: Test influence changes
3. **Check control**: Verify control level calculations
4. **Test decay**: Run decay manually or wait for cron
5. **Verify benefits**: Calculate alignment benefits
6. **History tracking**: Check influence history logs

## Success Metrics

- ✅ All 11 territories defined with unique characteristics
- ✅ 6 factions with distinct influence patterns
- ✅ Dynamic control system with 4 levels
- ✅ Multiple influence sources (positive and negative)
- ✅ Daily decay system for balance
- ✅ Player alignment benefits by control level
- ✅ Complete historical tracking
- ✅ Strategic value-based territory importance
- ✅ TypeScript compilation successful
- ✅ Database models with proper indexes
- ✅ Service layer with comprehensive methods
- ✅ Automated daily maintenance job

---

**Status**: ✅ Complete - Phase 11, Wave 11.1 Territory Influence System is fully implemented and ready for integration.
