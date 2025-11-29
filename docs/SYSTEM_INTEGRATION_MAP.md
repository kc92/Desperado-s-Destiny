# System Integration Map

## Overview

This document maps all system integrations in Desperados Destiny, showing dependencies, data flows, event chains, and shared resources.

## Table of Contents

- [System Overview](#system-overview)
- [Core System Dependencies](#core-system-dependencies)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Event Chains](#event-chains)
- [Shared Resources](#shared-resources)
- [Integration Points](#integration-points)

---

## System Overview

### Tier 1: Foundation Systems
**Required for all other systems to function**

- **User**: Account authentication and authorization
- **Character**: Player character management
- **Legacy**: Cross-character progression
- **Database**: MongoDB data persistence

### Tier 2: Core Gameplay Systems
**Essential game mechanics**

- **Combat**: Turn-based HP combat with Destiny Deck
- **Gold**: Economy and transaction management
- **Energy**: Action point system
- **Skill**: Character skill progression
- **Quest**: Mission and objective tracking
- **Achievement**: Player accomplishment tracking

### Tier 3: Social & Territory Systems
**Player interaction and world control**

- **Gang**: Player organization system
- **Friend**: Social connections
- **Mail**: Player-to-player messaging
- **Chat**: Real-time communication
- **Territory**: Zone control and influence
- **Gang War**: Inter-gang conflicts
- **Faction War**: Large-scale territory wars

### Tier 4: Economy & Crafting Systems
**Resource management and creation**

- **Shop**: Item purchasing and selling
- **Crafting**: Item creation from recipes
- **Property**: Real estate ownership and income
- **Bank**: Secure gold storage
- **Trading**: Player-to-player exchanges

### Tier 5: World & Environment Systems
**Living world mechanics**

- **Location**: Travel and zone management
- **NPC**: Non-player character interactions
- **World Event**: Dynamic world changes
- **Time**: Game world time progression
- **Weather**: Environmental conditions
- **Season**: Seasonal events and changes

### Tier 6: Crime & Law Systems
**Outlaw mechanics**

- **Crime**: Criminal action system
- **Jail**: Incarceration mechanics
- **Bounty**: Wanted system and bounty hunting
- **Reputation**: Faction and criminal standing
- **Gossip**: Rumor spreading and fame

### Tier 7: Advanced Features
**Specialized gameplay systems**

- **Hunting**: Wildlife tracking and harvesting
- **Fishing**: Fish catching mechanics
- **Horse**: Mount system and breeding
- **Companion**: Animal companions
- **Gambling**: Card games and betting
- **Tournament**: Competitive events
- **Newspaper**: Dynamic news generation

### Tier 8: Meta Systems
**Supporting infrastructure**

- **Notification**: Player alert system
- **Death**: Death penalty and respawn
- **Performance Monitor**: System health tracking
- **Event Dispatcher**: Cross-system event routing

---

## Core System Dependencies

### User System
**Dependencies**: None (foundation)
**Depended on by**: Character, Legacy, Auth, Profile

```
User
├── Character (1:many)
├── Legacy Profile (1:1)
└── Auth Sessions (1:many)
```

### Character System
**Dependencies**: User, Legacy
**Depended on by**: Combat, Gold, Quest, Skill, Gang, All gameplay systems

```
Character
├── User (many:1) - ownership
├── Legacy (many:1 via User) - bonuses
├── Gang (many:1) - membership
├── Location (many:1) - current position
├── Skills (1:many embedded) - abilities
├── Inventory (1:many embedded) - items
└── Equipment (1:1 embedded) - worn gear
```

### Legacy System
**Dependencies**: User
**Depended on by**: Character (bonuses), All systems (tracking)

```
Legacy Profile
├── User (1:1) - ownership
├── Character Contributions (1:many embedded) - history
├── Milestone Progress (1:many embedded) - achievements
└── Rewards (1:many embedded) - unlocked bonuses
```

### Combat System
**Dependencies**: Character, Energy, Gold, NPC
**Triggers**: Quest progress, Achievement unlocks, Reputation changes, Legacy updates

```
Combat
├── Character (many:1) - combatant
├── NPC (many:1) - opponent
├── Energy (consumes 10 per combat)
├── Destiny Deck (card resolution)
├── Gold Service (rewards)
├── XP System (experience gain)
├── Quest Service (kill objectives)
├── Achievement Service (combat achievements)
├── Reputation Service (fame/infamy)
├── Legacy Service (lifetime stats)
└── Death Service (defeat penalty)
```

### Gold System
**Dependencies**: Character
**Triggers**: Legacy tracking, Quest objectives

```
Gold Transaction
├── Character (many:1) - owner
├── Transaction History (audit trail)
├── World Event Modifiers (dynamic rates)
├── Quest Service (gold objectives)
└── Legacy Service (lifetime gold tracking)
```

### Quest System
**Dependencies**: Character, Gold
**Triggers**: XP rewards, Gold rewards, Achievement unlocks, Reputation gains

```
Quest
├── Character Quest Progress (many:1)
├── Objectives (1:many embedded)
│   ├── Kill objectives → Combat integration
│   ├── Collection objectives → Item integration
│   ├── Visit objectives → Location integration
│   ├── Gold objectives → Economy integration
│   └── Skill objectives → Skill integration
├── Rewards
│   ├── Gold → Gold Service
│   ├── XP → Character progression
│   ├── Items → Inventory
│   └── Reputation → Reputation Service
└── Legacy Service (quest completion tracking)
```

---

## Data Flow Diagrams

### Character Creation Flow

```
User Registration
    ↓
User Account Created
    ↓
Character Creation Request
    ↓
┌─────────────────────────────┐
│ 1. Create Character Record  │
│    - Basic info             │
│    - Starting stats         │
│    - Initial gold: 100      │
│    - Starting location      │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 2. Create/Get Legacy Profile│
│    - Link to user           │
│    - Check existing bonuses │
│    - Increment char count   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 3. Apply Legacy Bonuses     │
│    - Bonus starting gold    │
│    - Bonus starting XP      │
│    - Unlocked features      │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 4. Initialize Systems       │
│    - Create energy tracker  │
│    - Set up skill slots     │
│    - Initialize inventory   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 5. Dispatch Events          │
│    - CHARACTER_CREATED      │
│    → Quest System           │
│    → Achievement System     │
│    → Notification System    │
└─────────────────────────────┘
    ↓
Character Ready for Play
```

### Combat Victory Flow

```
Combat Victory
    ↓
┌─────────────────────────────┐
│ 1. Roll Loot                │
│    - Calculate gold (50-100)│
│    - Fixed XP (150)         │
│    - Roll item drops (30%)  │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 2. Award Gold               │
│    - GoldService.addGold()  │
│    - Apply world modifiers  │
│    - Create transaction     │
│    - Update character.gold  │
└─────────────────────────────┘
    ↓ (triggers)
┌─────────────────────────────┐
│ 3. Quest Progress Check     │
│    - QuestService.onGoldEarned() │
│    - Update gold objectives │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 4. Award Experience         │
│    - Character.addExperience()  │
│    - Check for level up     │
│    - Grant stat points      │
└─────────────────────────────┘
    ↓ (if level up)
┌─────────────────────────────┐
│ 5. Level Up Chain           │
│    - Update character.level │
│    - QuestService.onLevelUp()│
│    - Check feature unlocks  │
│    - Dispatch LEVEL_UP event│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 6. Award Items              │
│    - Add to inventory       │
│    - QuestService.onItemCollected() │
│    - Check for achievements │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 7. Update Combat Stats      │
│    - combatStats.wins++     │
│    - combatStats.kills++    │
│    - combatStats.totalDamage│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 8. Update Reputation        │
│    - Criminal rep increase  │
│    - Faction rep changes    │
│    - Fame calculation       │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 9. Legacy Tracking          │
│    - totalEnemiesDefeated++ │
│    - totalGoldEarned += X   │
│    - Check milestones       │
│    - Update tier if needed  │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 10. Dispatch Event          │
│     - COMBAT_VICTORY        │
│     → Quest System          │
│     → Achievement System    │
│     → Reputation System     │
│     → Legacy System         │
│     → Notification System   │
└─────────────────────────────┘
    ↓
Combat Complete
```

### Boss Defeat Flow (Enhanced)

```
Boss Defeated
    ↓
All steps from Combat Victory Flow
    ↓ PLUS
┌─────────────────────────────┐
│ 11. Check First Kill        │
│     - Query combat history  │
│     - Guarantee drop if first│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 12. Roll Legendary Drops    │
│     - Check boss drop table │
│     - Apply drop rates      │
│     - Add legendary items   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 13. Trigger Achievements    │
│     - Boss-specific achieves│
│     - Boss kill count       │
│     - All bosses achievement│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 14. Legendary Quest Progress│
│     - Update boss objectives│
│     - Check quest completion│
│     - Award legendary rewards│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 15. Major Reputation Impact │
│     - Large fame increase   │
│     - Faction rep boost     │
│     - Gossip system trigger │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 16. Newspaper Article       │
│     - Generate headline     │
│     - Record feat           │
│     - Server-wide broadcast │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 17. Legacy Milestone        │
│     - totalBossesKilled++   │
│     - Check boss milestones │
│     - Award tier bonuses    │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 18. Dispatch BOSS_DEFEATED  │
│     → Quest System (high pri)│
│     → Achievement System    │
│     → Reputation System     │
│     → Legacy System         │
│     → Newspaper System      │
│     → Notification System   │
└─────────────────────────────┘
    ↓
Boss Victory Complete
```

### Quest Completion Flow

```
Quest Objectives Met
    ↓
┌─────────────────────────────┐
│ 1. Mark Quest Complete      │
│    - Update status          │
│    - Record completion date │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 2. Calculate Rewards        │
│    - Base rewards           │
│    - Bonus multipliers      │
│    - Legacy bonuses         │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 3. Award Gold Reward        │
│    - GoldService.addGold()  │
│    → Quest progress check   │
│    → Legacy tracking        │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 4. Award XP Reward          │
│    - Character.addExperience() │
│    - Possible level up      │
│    → Legacy tracking        │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 5. Award Item Rewards       │
│    - Add to inventory       │
│    - Check inventory limits │
│    → Item collection quests │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 6. Award Reputation         │
│    - Faction rep increase   │
│    - Unlock faction content │
│    → Gossip system          │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 7. Check Achievements       │
│    - Quest completion count │
│    - Quest type achievements│
│    - All quests achievement │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 8. Update Legacy Stats      │
│    - totalQuestsCompleted++ │
│    - Quest type counters    │
│    - Check milestones       │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 9. Unlock Follow-up Quests  │
│    - Check quest chains     │
│    - Make available         │
│    → Notification           │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 10. Dispatch QUEST_COMPLETED│
│     → Achievement System    │
│     → Reputation System     │
│     → Legacy System         │
│     → Notification System   │
└─────────────────────────────┘
    ↓
Quest Complete
```

### Gang Action Flow

```
Gang Action Executed
    ↓
┌─────────────────────────────┐
│ 1. Validate Gang Member     │
│    - Check membership       │
│    - Check rank permissions │
│    - Check gang resources   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 2. Execute Action           │
│    - Deduct gang bank       │
│    - Spend member energy    │
│    - Roll outcome           │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 3. Update Territory         │
│    - Increase influence     │
│    - Check for capture      │
│    - Update control map     │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 4. Update Gang Reputation   │
│    - Gang rep increase      │
│    - Territory fame         │
│    - Rival gang relations   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 5. Distribute Member Rewards│
│    - Award contribution pts │
│    - Split gold rewards     │
│    - Individual XP bonuses  │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 6. Check Member Rank Ups    │
│    - Contribution thresholds│
│    - Promote if qualified   │
│    → Notification           │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 7. Update Legacy Stats      │
│    - Gang activity tracking │
│    - Territory control      │
│    - Social milestones      │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ 8. Dispatch Events          │
│    - TERRITORY_CAPTURED     │
│    - GANG_RANK_CHANGED      │
│    → Achievement System     │
│    → Notification System    │
│    → Newspaper System       │
└─────────────────────────────┘
    ↓
Gang Action Complete
```

---

## Event Chains

### Death Event Chain

```
Character Dies (HP = 0)
    ↓
DEATH_SERVICE.handleDeath()
    ↓
┌─────────────────────────────┐
│ Check Death Type            │
│  - Combat                   │
│  - PvP Duel                 │
│  - Execution                │
│  - Environmental            │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Calculate Penalties         │
│  - Gold loss (10%)          │
│  - XP loss (5%)             │
│  - Item drop chance         │
│  - Reputation loss          │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Apply Death Penalty         │
│  - Deduct gold              │
│  - Deduct XP                │
│  - Drop items               │
│  - Update combat stats      │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Check Special Conditions    │
│  - Lawful NPC → Jail        │
│  - Bounty Hunter → Bounty   │
│  - Gang War → Territory     │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Respawn Character           │
│  - Full HP restore          │
│  - Respawn at faction town  │
│  - Clear debuffs            │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Update Related Systems      │
│  → Quest (death count)      │
│  → Achievement (deaths)     │
│  → Legacy (lifetime deaths) │
│  → Reputation (fame loss)   │
│  → Notification (death msg) │
└─────────────────────────────┘
    ↓
CHARACTER_DIED event dispatched
    ↓
Death handled
```

### Skill Level Up Chain

```
Skill Training Complete
    ↓
SKILL_SERVICE.completeTraining()
    ↓
┌─────────────────────────────┐
│ Increase Skill Level        │
│  - skill.level++            │
│  - Reset XP counter         │
│  - Update timestamp         │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Check Unlock Thresholds     │
│  - Level 5 → Advanced jobs  │
│  - Level 10 → Master recipes│
│  - Level 15 → Expert actions│
│  - Level 20 → MAX (milestone)│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Unlock Related Content      │
│  - New jobs available       │
│  - New recipes learned      │
│  - New NPC dialogs          │
│  - New locations accessible │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Update Quest Progress       │
│  - Skill level objectives   │
│  - Skill max objectives     │
│  - Check quest completion   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Check Achievements          │
│  - Skill level achievements │
│  - All skills trained       │
│  - Specific skill mastery   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Update Legacy Stats         │
│  - Skill points earned++    │
│  - Skills maxed (if 20)     │
│  - Check skill milestones   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Dispatch Events             │
│  - SKILL_LEVEL_UP           │
│  - SKILL_MAXED (if level 20)│
│  → Quest System             │
│  → Achievement System       │
│  → Legacy System            │
│  → Notification System      │
└─────────────────────────────┘
    ↓
Skill Level Up Complete
```

### Property Income Flow

```
Daily Income Timer Triggers
    ↓
PROPERTY_SERVICE.processDailyIncome()
    ↓
┌─────────────────────────────┐
│ Find All Active Properties  │
│  - Player-owned             │
│  - Operational status       │
│  - Not foreclosed           │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ For Each Property:          │
│  - Calculate base income    │
│  - Apply property upgrades  │
│  - Apply worker bonuses     │
│  - Apply world event mods   │
│  - Apply legacy multipliers │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Award Income to Owner       │
│  - GoldService.addGold()    │
│  - Source: PROPERTY_INCOME  │
│  - Metadata: property info  │
└─────────────────────────────┘
    ↓ (triggers from Gold Service)
┌─────────────────────────────┐
│ Quest Progress Check        │
│  - Gold earned objectives   │
│  - Property income objectives│
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Legacy Tracking             │
│  - totalGoldEarned++        │
│  - Property income tracking │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Notification                │
│  - "Property earned X gold" │
│  - Daily income summary     │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Dispatch PROPERTY_INCOME    │
│  → Gold System              │
│  → Legacy System            │
└─────────────────────────────┘
    ↓
Property Income Processed
```

---

## Shared Resources

### Gold Currency

**Primary Resource**: Gold coins (integer)

**Systems that PRODUCE gold:**
- Combat (loot drops)
- Quests (rewards)
- Property (daily income)
- Gambling (winnings)
- Shop (selling items)
- Crafting (selling crafted goods)
- Gang (member rewards)
- Achievements (bonus rewards)
- Daily bonuses
- Fishing/Hunting (selling catches)
- Train/Stagecoach robberies

**Systems that CONSUME gold:**
- Shop (purchasing)
- Crafting (material costs)
- Skills (training fees)
- Property (purchase, upgrades, taxes)
- Bank (vault fees)
- Gambling (bets)
- Gang (contributions, upgrades)
- Bribes (jail, guards, officials)
- Travel (train, stagecoach tickets)
- Services (NPC services, healing)
- Mail (postage fees)

**Integration Points:**
- `GoldService.addGold()` - All gold gains
- `GoldService.deductGold()` - All gold spending
- `GoldTransaction` model - Audit trail
- Quest objectives - Gold earned tracking
- Legacy stats - Lifetime gold tracking
- World events - Gold multipliers

### Experience Points (XP)

**Primary Resource**: Experience points (integer)

**Systems that PRODUCE XP:**
- Combat (enemy defeats)
- Quests (completion rewards)
- Skills (training activities)
- Exploration (discovery bonuses)
- Achievements (unlock bonuses)
- Gang activities (group bonuses)
- Daily activities
- Tournament participation

**Systems that CONSUME XP:**
- Character leveling (threshold requirements)
- Death penalty (5% XP loss)

**Integration Points:**
- `Character.addExperience()` - XP gain method
- Level up triggers - Multiple system notifications
- Quest objectives - XP tracking
- Legacy stats - XP milestone tracking

### Energy

**Primary Resource**: Energy points (regenerating integer)

**Systems that CONSUME energy:**
- Combat (10 energy per encounter)
- Actions (variable costs 5-20)
- Crimes (10-30 energy)
- Skills (training energy cost)
- Jobs (work energy cost)
- Travel (movement between locations)
- Crafting (production energy)
- Fishing/Hunting trips
- Gang activities

**Integration Points:**
- `EnergyService.spendEnergy()` - Energy deduction
- `Character.regenerateEnergy()` - Passive regen
- Energy middleware - API protection
- Premium bonuses - Increased regen
- World events - Energy cost modifiers

### Reputation

**Shared Resource**: Reputation points (per faction, -100 to +100)

**Systems that AFFECT reputation:**
- Quests (faction-aligned rewards)
- Combat (faction NPC kills)
- Crimes (negative rep with lawful factions)
- Gang activities (faction alignment)
- Territory control (influence gains)
- NPC interactions (dialog choices)
- World events (participation bonuses)

**Systems that USE reputation:**
- Shop (prices, availability)
- NPCs (dialog options, services)
- Quests (unlock requirements)
- Locations (access restrictions)
- Factions (membership, ranks)
- World events (faction-specific)

**Integration Points:**
- `ReputationService.modifyReputation()`
- Faction access checks
- Price modifiers in shops
- Quest unlock conditions
- Achievement triggers

---

## Integration Points

### Critical Integration Points

#### 1. Character → Gold
**File**: `server/src/models/Character.model.ts`
**Methods**: `addGold()`, `deductGold()`
**Flow**: Character methods delegate to GoldService

```typescript
// In Character model
async addGold(amount: number, source: TransactionSource, metadata?: any) {
  const { GoldService } = await import('../services/gold.service');
  const { newBalance } = await GoldService.addGold(
    this._id, amount, source, metadata
  );
  this.gold = newBalance;
  return newBalance;
}
```

#### 2. Combat → Multiple Systems
**File**: `server/src/services/combat.service.ts`
**Method**: `awardLoot()`
**Integrates with**: Gold, XP, Items, Quests, Legacy

```typescript
private static async awardLoot(character, npc, loot, session) {
  // 1. Award gold (triggers Quest + Legacy)
  await GoldService.addGold(characterId, loot.gold, SOURCE, metadata, session);

  // 2. Award XP (triggers level up checks)
  await character.addExperience(loot.xp);

  // 3. Award items (triggers Quest item objectives)
  for (const item of loot.items) {
    // Add to inventory
    // Trigger QuestService.onItemCollected()
  }

  // 4. Update combat stats
  character.combatStats.wins++;

  // 5. Update NPC (mark defeated)
  npc.isActive = false;

  await character.save({ session });
  await npc.save({ session });
}
```

#### 3. Quest → Reward Distribution
**File**: `server/src/services/quest.service.ts`
**Method**: `completeQuest()`
**Integrates with**: Gold, XP, Items, Reputation, Legacy

```typescript
async completeQuest(characterId: string, questId: string) {
  // 1. Mark quest complete
  const quest = await CharacterQuest.findOne({ characterId, questId });
  quest.status = QuestStatus.COMPLETED;

  // 2. Award rewards
  if (quest.rewards.gold) {
    await GoldService.addGold(
      characterId,
      quest.rewards.gold,
      TransactionSource.QUEST_REWARD,
      { questId, questName: quest.name }
    ); // Triggers: Quest gold objectives, Legacy tracking
  }

  if (quest.rewards.xp) {
    await character.addExperience(quest.rewards.xp);
    // Triggers: Possible level up → Quest, Achievement, Legacy
  }

  if (quest.rewards.reputation) {
    await ReputationService.modifyReputation(
      characterId,
      quest.faction,
      quest.rewards.reputation
    ); // Triggers: Gossip system, Access unlocks
  }

  // 3. Dispatch event
  await SystemEventService.emitQuestCompleted(characterId, questId, rewards);
  // Routes to: Achievement, Reputation, Legacy, Notification
}
```

#### 4. Level Up → Feature Unlocks
**File**: `server/src/models/Character.model.ts`
**Method**: `addExperience()`
**Integrates with**: Quests, Features, Legacy

```typescript
async addExperience(amount: number) {
  this.experience += amount;

  let leveledUp = false;
  const oldLevel = this.level;

  while (this.level < MAX_LEVEL && this.experience >= nextLevelXP) {
    this.experience -= nextLevelXP;
    this.level++;
    leveledUp = true;
  }

  if (leveledUp) {
    // Trigger quest progress
    await QuestService.onLevelUp(this._id.toString(), this.level);

    // Check feature unlocks
    if (this.level === 5) {
      // Unlock: Gang system
    }
    if (this.level === 10) {
      // Unlock: Property system
    }
    if (this.level === 15) {
      // Unlock: Legendary quests
    }

    // Dispatch event
    await SystemEventService.emitCharacterLevelUp(
      this._id.toString(),
      this.level
    );
  }
}
```

#### 5. Legacy → New Character Bonuses
**File**: `server/src/controllers/character.controller.ts`
**Method**: `createCharacter()`
**Integrates with**: Legacy, Character

```typescript
async createCharacter(req, res) {
  const userId = req.user.id;

  // 1. Get legacy profile
  const legacy = await LegacyProfileModel.getOrCreate(userId);

  // 2. Calculate bonuses
  const bonuses = LegacyService.calculateNewCharacterBonuses(legacy);
  // Returns: { goldBonus, xpBonus, unlockedFeatures }

  // 3. Create character with bonuses
  const character = await Character.create({
    ...characterData,
    gold: 100 + bonuses.goldBonus,
    experience: bonuses.xpBonus,
    // Apply feature unlocks
  });

  // 4. Update legacy
  legacy.updateStat('totalCharactersCreated', 1);
  await legacy.save();

  // 5. Dispatch event
  await SystemEventService.emitCharacterCreated(userId, character._id);
}
```

#### 6. Gang Actions → Member Rewards
**File**: `server/src/services/gang.service.ts`
**Method**: `executeGangAction()`
**Integrates with**: Gang, Character, Gold, Territory, Reputation

```typescript
async executeGangAction(gangId: string, actionType: string) {
  const gang = await Gang.findById(gangId).populate('members.characterId');

  // 1. Execute action
  const result = await this.resolveAction(gang, actionType);

  // 2. Update territory
  if (result.territoryGain) {
    await TerritoryService.increaseInfluence(
      gang._id,
      result.territory,
      result.territoryGain
    );
  }

  // 3. Update gang reputation
  gang.reputation += result.reputationGain;

  // 4. Distribute member rewards
  const rewardPerMember = Math.floor(result.goldReward / gang.members.length);

  for (const member of gang.members) {
    // Award gold
    await GoldService.addGold(
      member.characterId._id,
      rewardPerMember,
      TransactionSource.GANG_REWARD,
      { gangId, action: actionType }
    );

    // Award contribution points
    member.contributionPoints += result.contributionPoints;

    // Check rank up
    if (this.qualifiesForPromotion(member)) {
      member.rank = this.getNextRank(member.rank);
      await SystemEventService.dispatch(
        SystemName.GANG,
        SystemEventType.GANG_RANK_CHANGED,
        { characterId: member.characterId._id, newRank: member.rank }
      );
    }
  }

  await gang.save();

  // 5. Dispatch gang action event
  await SystemEventService.dispatch(
    SystemName.GANG,
    SystemEventType.TERRITORY_CAPTURED,
    { gangId, territory: result.territory }
  );
}
```

---

## Testing Integration Points

### Integration Test Requirements

For each integration point, tests should verify:

1. **Data Flow**: Information correctly flows between systems
2. **Event Propagation**: Events trigger appropriate downstream systems
3. **Transaction Safety**: Multi-system updates are atomic
4. **Error Handling**: Failures in one system don't corrupt others
5. **Performance**: Integration doesn't create bottlenecks

### Critical Test Scenarios

#### Scenario 1: Combat Victory Integration
```
Test: Character defeats enemy NPC

Verify:
✓ Gold added to character
✓ Gold transaction recorded
✓ XP awarded
✓ Possible level up
✓ Items added to inventory
✓ Combat stats updated
✓ Quest kill objective updated
✓ Quest item objective updated (if applicable)
✓ Quest gold objective updated
✓ Legacy enemy defeat counter
✓ Legacy gold earned counter
✓ Reputation updated
✓ NPC marked as defeated
✓ All updates are atomic (transaction)
```

#### Scenario 2: Quest Completion Integration
```
Test: Character completes quest

Verify:
✓ Quest marked complete
✓ Gold reward granted
✓ XP reward granted
✓ Possible level up from XP
✓ Items awarded
✓ Reputation reward applied
✓ Follow-up quest unlocked
✓ Achievement checked
✓ Legacy quest counter updated
✓ Notification sent
✓ All rewards are atomic
```

#### Scenario 3: Character Creation Integration
```
Test: User creates new character

Verify:
✓ Character record created
✓ Legacy profile retrieved/created
✓ Legacy bonuses calculated
✓ Bonus gold applied
✓ Bonus XP applied
✓ Features unlocked based on legacy
✓ Legacy character count updated
✓ Starting quests available
✓ Character ready for play
✓ Event dispatched to systems
```

#### Scenario 4: Death Penalty Integration
```
Test: Character dies in combat

Verify:
✓ Death detected
✓ Gold penalty calculated (10%)
✓ Gold deducted atomically
✓ XP penalty calculated (5%)
✓ XP deducted
✓ Items dropped (if applicable)
✓ Combat stats updated (losses++)
✓ Respawn location determined
✓ Character HP restored
✓ Quest death counter updated
✓ Legacy death counter updated
✓ Notification sent
✓ All penalties are atomic
```

---

## System Health Monitoring

### Health Check Requirements

Use `IntegrationHealthChecker` to verify:

1. **System Connectivity**: All systems can communicate
2. **Dependency Health**: Dependencies are operational
3. **Data Flow**: Critical flows are working
4. **Latency**: Response times are acceptable
5. **Error Rates**: Integration errors are low

### Health Check Frequency

- **Startup**: Full health check on server start
- **Hourly**: Critical system checks
- **On Error**: Targeted health check after failures
- **Manual**: Admin-triggered comprehensive check

### Health Status Levels

- **Healthy**: All systems operational, good latency
- **Degraded**: Some non-critical issues, higher latency
- **Critical**: Required systems down or major issues
- **Down**: Complete system failure

---

## Troubleshooting Integration Issues

### Common Integration Problems

1. **Missing Event Propagation**
   - Symptom: Quest not updating after combat
   - Check: Event subscription for system
   - Solution: Verify SystemEventService.subscribe() called

2. **Transaction Rollback Issues**
   - Symptom: Partial updates after error
   - Check: Session usage in service calls
   - Solution: Ensure session passed to all operations

3. **Circular Dependencies**
   - Symptom: Import errors, undefined services
   - Check: Import graph
   - Solution: Use dynamic imports where needed

4. **Race Conditions**
   - Symptom: Inconsistent state, flaky tests
   - Check: Async operation ordering
   - Solution: Await all promises, use transactions

5. **Memory Leaks**
   - Symptom: Increasing memory usage
   - Check: Event listener cleanup
   - Solution: Unsubscribe when done

### Debug Tools

```typescript
// Check event routing
SystemEventService.getStats()

// Verify system health
IntegrationHealthChecker.generateHealthReport()

// Test specific integration
IntegrationHealthChecker.isIntegrationHealthy(
  SystemName.COMBAT,
  SystemName.GOLD
)

// View dependency graph
IntegrationHealthChecker.getDependencyGraph()
```

---

## Future Integration Improvements

### Planned Enhancements

1. **Event Replay**: Record and replay event chains for debugging
2. **Integration Metrics**: Track integration performance and reliability
3. **Auto-Recovery**: Automatic retry and recovery for failed integrations
4. **Circuit Breakers**: Prevent cascade failures
5. **Event Sourcing**: Full event history for audit and replay
6. **Dead Letter Queue**: Handle failed events separately
7. **Rate Limiting**: Prevent event flooding
8. **Priority Queues**: Ensure critical events process first

---

This integration map is a living document. Update it as new systems are added or integrations change.

Last Updated: Phase 15, Wave 15.2
