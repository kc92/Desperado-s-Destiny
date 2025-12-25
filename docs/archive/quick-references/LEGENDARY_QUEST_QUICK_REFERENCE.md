# Legendary Quest System - Quick Reference

## 6 Legendary Quest Chains

### 1. The Legend of Jesse James
- **Level**: 25-30
- **Theme**: Historical + Legend
- **Quests**: 6
- **Duration**: 8-12 hours
- **Difficulty**: Very Hard
- **Prerequisites**: Level 25, Outlaw Reputation 500
- **Key NPCs**: Frank James, Zerelda Samuel, Robert Ford, Detective Thornton
- **Rewards**:
  - James Gang Revolver (legendary weapon)
  - Outlaw's Bandana (cosmetic)
  - Tycoon's Watch (utility)
  - Title: "Legend of the West"
- **Story**: Track Jesse James' hidden treasure and uncover the railroad conspiracy that led to his death

### 2. The Seven Sacred Artifacts
- **Level**: 28-35
- **Theme**: Supernatural + Coalition Lore
- **Quests**: 7
- **Duration**: 12-15 hours
- **Difficulty**: Very Hard
- **Prerequisites**: Level 28, Coalition Reputation 1000
- **Key NPCs**: Elder Silver Dawn, Crow Speaker, Shadow Walker, Broken Antler
- **Rewards**:
  - 7 Sacred Artifacts (legendary set)
  - Complete set grants "Perfect Balance" bonus
  - Title: "Spirit Touched"
  - Coalition max reputation
- **Story**: Recover seven sacred Coalition artifacts representing the seven directions

### 3. The Ghost Riders
- **Level**: 30-35
- **Theme**: Supernatural Horror + Mystery
- **Quests**: 5
- **Duration**: 8-10 hours
- **Difficulty**: Hard
- **Prerequisites**: Level 30
- **Key NPCs**: Marcus Dalton, Widow Kane, Reverend Black, Midnight Rose
- **Rewards**:
  - Phantom Horse (legendary mount)
  - Dead-Eye's Revolver (cursed weapon)
  - Ghost Rider Duster (cosmetic)
  - Title: "Rider of the Storm"
- **Story**: Investigate a legendary gang that vanished 20 years ago - are they dead or cursed?

### 4. The Last Conquistador
- **Level**: 32-38
- **Theme**: Historical + Supernatural
- **Quests**: 6
- **Duration**: 10-14 hours
- **Difficulty**: Very Hard
- **Prerequisites**: Level 32
- **Key NPCs**: Ghost of Coronado, Aztec Priest Tlaloc, Dr. Maria Cortez, Jack Harrison
- **Rewards**:
  - Cortez's Blade (legendary rapier)
  - Spanish Conquistador Armor Set
  - Medallion of Quetzalcoatl (mythic)
  - Title: "The Conquistador"
- **Story**: Follow a 300-year-old treasure map to find Spanish gold and face an ancient Aztec curse

### 5. The Railroad Conspiracy
- **Level**: 30-36
- **Theme**: Political Intrigue
- **Quests**: 5
- **Duration**: 10-12 hours
- **Difficulty**: Hard
- **Prerequisites**: Level 30
- **Key NPCs**: Cornelius Vandermeer III, Senator Blackwell, Margaret Walsh, The Gentleman
- **Rewards**:
  - Tycoon's Pocket Watch (utility)
  - The Vandermeer Files (leverage)
  - Railroad Depot (property)
  - Title: "The Truth"
- **Story**: Expose corporate corruption and political conspiracy at the highest levels

### 6. The Gunslinger's Legacy
- **Level**: 35-40
- **Theme**: Combat-Focused
- **Quests**: 6
- **Duration**: 12-15 hours
- **Difficulty**: Legendary
- **Prerequisites**: Level 35, Complete "Duel Master" quest
- **Key NPCs**: Spirits of Wild Bill Hickok, Annie Oakley, Doc Holliday, Wyatt Earp, Belle Starr, Clay Allison
- **Rewards**:
  - 6 Legendary Weapons (one from each gunslinger)
  - Complete set grants "Last Gunslinger" bonus
  - Title: "Last Gunslinger"
  - Ultimate combat abilities
- **Story**: Collect the weapons of six legendary gunslingers and prove yourself worthy

## Quest Components

### Combat Encounters
- **Boss Fights**: Single powerful enemy
- **Wave Defense**: Survive multiple waves
- **Duels**: One-on-one showdowns
- **Survival**: Last a set duration
- **Ambush**: Surprise attacks

### Puzzles
- **Treasure Maps**: Find locations using clues
- **Ciphers**: Decode encrypted messages (Caesar, Substitution, Vigenere)
- **Information Gathering**: Interview NPCs for clues
- **Environmental**: Interact with objects in correct order

### Moral Choices
- **Moral**: Good vs. Evil decisions
- **Strategic**: Tactical choices
- **Faction**: Choose between factions
- **Sacrifice**: What are you willing to give up?
- **Truth**: Expose or hide the truth?

### World Effects
- **Faction Reputation**: +/- reputation with factions
- **NPC Relationships**: Affect how NPCs treat you
- **Location Unlocks**: Open new areas
- **World State**: Change the game world
- **Quest Availability**: Lock/unlock future quests

### Rewards
- **Experience**: Level up faster
- **Gold**: Currency
- **Items**: Unique legendary items
- **Titles**: Display achievements
- **Skill Points**: Enhance abilities
- **Properties**: Own buildings

## API Usage

### Get Available Chains
```typescript
const chains = await LegendaryQuestService.getAvailableChains(characterId);
// Returns all chains with unlock status and prerequisites
```

### Start a Chain
```typescript
const result = await LegendaryQuestService.startChain(characterId, chainId);
// Starts the first quest automatically
```

### Get Current Quest
```typescript
const quest = await LegendaryQuestService.getQuest(characterId, chainId, questId);
// Returns quest details and progress
```

### Complete Objective
```typescript
const result = await LegendaryQuestService.completeObjective(
  characterId,
  chainId,
  questId,
  objectiveId
);
// Marks objective complete, returns next objective
```

### Make Moral Choice
```typescript
const result = await LegendaryQuestService.makeChoice(
  characterId,
  chainId,
  questId,
  choiceId,
  optionId
);
// Records choice, applies consequences, awards rewards
```

### Complete Quest
```typescript
const result = await LegendaryQuestService.completeQuest(
  characterId,
  chainId,
  questId
);
// Awards rewards, unlocks next quest, checks for chain completion
```

### Get Statistics
```typescript
const stats = await LegendaryQuestService.getPlayerStats(characterId);
// Returns completion percentages, items obtained, titles, etc.
```

## Progress Tracking

### Chain Progress
```typescript
interface ChainProgress {
  chainId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  currentQuestNumber: number;
  questProgresses: QuestProgress[];
  milestonesReached: number[];
  totalPlayTime: number;
  deathCount: number;
  choicesMade: Record<string, string>;
}
```

### Quest Progress
```typescript
interface QuestProgress {
  questId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'failed';
  completedObjectives: string[];
  currentObjective?: string;
  choicesMade: Record<string, string>;
  encountersCompleted: string[];
  puzzleProgress?: Record<string, any>;
}
```

## Design Patterns

### Quest Structure
1. **Prologue**: Set the stage
2. **6-7 Quests**: Progressive narrative
3. **Epilogue**: Resolve the story
4. **Milestone Rewards**: Every 2-3 quests
5. **Final Reward**: Chain completion bonus

### Each Quest Contains
- **Briefing**: What's happening
- **Lore Entries**: Historical/mythological background
- **Dialogues**: NPC conversations with choices
- **Objectives**: Primary, optional, and hidden
- **Combat**: Encounters and boss fights
- **Puzzles**: Brain teasers and challenges
- **Moral Choices**: Consequential decisions
- **Rewards**: Experience, gold, items, titles
- **World Effects**: Lasting changes
- **Completion Text**: Next steps

### Difficulty Progression
- **Hard**: Challenging but fair
- **Very Hard**: Requires skill and strategy
- **Legendary**: Ultimate end-game challenge

## Unique Features

### Set Bonuses
- **Seven Sacred Artifacts**: +50 all stats, walk between worlds
- **Six Legendary Guns**: Perfect accuracy, unlimited ammo, enemies surrender

### Cursed Items
- **Dead-Eye's Revolver**: Never miss, but drains life
- Balance power with risk

### Moral Complexity
- No "right" answers
- Choices have lasting consequences
- Multiple valid paths through story

### Historical Accuracy
- Real dates and locations
- Actual historical figures
- Period-appropriate events
- Authentic Western lore

## Tips for Implementation

### Frontend Display
1. Show chain cards with level requirements
2. Display progress bars for completion
3. Highlight current objectives
4. Show unlocked rewards
5. Track lore entries in codex
6. Display titles prominently

### Balance Considerations
1. Scale difficulty with player level
2. Test moral choice consequences
3. Ensure rewards are worthwhile
4. Make puzzles challenging but solvable
5. Boss fights should feel epic

### Narrative Pacing
1. Build tension gradually
2. Reveal lore through discovery
3. Make choices feel meaningful
4. Provide closure in epilogues
5. Leave hooks for future content

## File Locations

- **Types**: `shared/src/types/legendaryQuest.types.ts`
- **Quest Data**: `server/src/data/legendaryQuests/`
- **Model**: `server/src/models/LegendaryProgress.model.ts`
- **Service**: `server/src/services/legendaryQuest.service.ts`
- **Documentation**: This file

## Statistics

- **Total Chains**: 6
- **Total Quests**: 35+
- **Total Code**: 4,836 lines
- **Unique Items**: 45+
- **Titles**: 6
- **NPCs**: 20+
- **Lore Entries**: 30+
- **Combat Encounters**: 40+
- **Puzzles**: 15+
- **Moral Choices**: 30+

---

**Ready for**: Controller implementation, routing, and frontend integration
