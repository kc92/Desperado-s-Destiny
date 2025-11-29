# What-Waits-Below Cosmic Storyline - Developer Guide

Quick reference for implementing and working with the cosmic horror questline.

## Quick Start

### Starting the Questline

```typescript
import { CosmicQuestService } from '../services/cosmicQuest.service';

// Character must be level 25+
const { progress, firstQuest } = await CosmicQuestService.startCosmicStoryline(characterId);
```

### Getting Progress

```typescript
const progress = await CosmicQuestService.getCosmicProgress(characterId);

console.log(`Current Act: ${progress.currentAct}`);
console.log(`Corruption Level: ${progress.corruption.level}/100`);
console.log(`Quests Completed: ${progress.completedQuests.length}/20`);
```

### Completing Objectives

```typescript
const result = await CosmicQuestService.completeObjective(
  characterId,
  'cosmic_01_strange_happenings',
  'obj_01_visit_claim'
);

if (result.questCompleted) {
  console.log('Quest complete! Moving to next quest.');
}

if (result.visionTriggered) {
  // Show vision to player
  displayVision(result.visionTriggered);
}
```

### Making Choices

```typescript
const choice = await CosmicQuestService.makeChoice(
  characterId,
  'cosmic_04_cult_revealed',
  'choice_04_watch'
);

console.log(`Corruption changed by: ${choice.corruptionChange}`);
console.log(`Heading toward ending: ${choice.endingPath}`);
```

### Triggering Endings

```typescript
import { CosmicEndingService } from '../services/cosmicEnding.service';

// Based on player choice
const ending = await CosmicEndingService.triggerBanishment(characterId);
// or triggerDestruction, triggerBargain, triggerAwakening

console.log(ending.epilogue); // Show epilogue to player
console.log(ending.rewards); // Grant rewards
```

## Quest Flow

```
Act 1: WHISPERS (25-28)
  └─> 01: Strange Happenings
      └─> 02: Miner's Tale
          └─> 03: Dreams Deep
              └─> 04: Cult Revealed
                  └─> 05: Ancient Warnings

Act 2: DESCENT (28-32)
  └─> 06: Into The Scar
      └─> 07: Corruption Spreads
          └─> 08: Lost Expedition
              └─> 09: Voices Dark
                  └─> 10: First Seal

Act 3: REVELATION (32-36)
  └─> 11: Truth of Stars
      └─> 12: Coalition's Burden
          └─> 13: Cult's Plan
              └─> 14: Gathering Allies
                  └─> 15: Deep Temple

Act 4: CONFRONTATION (36-40)
  └─> 16: Preparations
      └─> 17: Final Descent
          └─> 18: Avatar
              └─> 19: The Choice [ENDINGS DIVERGE]
                  └─> 20: Aftermath
```

## Corruption Levels

```typescript
// Check corruption status
const state = await CosmicQuestService.getCorruptionState(characterId);

switch (state.warningLevel) {
  case 'safe': // 0-19
    // Normal gameplay
    break;
  case 'warning': // 20-39
    // Minor visual effects
    break;
  case 'danger': // 40-59
    // Significant changes
    break;
  case 'critical': // 60+
    // Point of no return approaching
    break;
}
```

## Corruption Thresholds

- **0-20**: Safe - Reversible, dreams only
- **20-40**: Warning - Minor physical changes
- **40-60**: Danger - Major transformation (hard to reverse)
- **60-80**: Critical - Irreversible transformation
- **80-100**: Transcendence - Merging with entity

## Ending Determination

```typescript
// Predict which ending player is heading toward
const prediction = await CosmicEndingService.predictEnding(characterId);

console.log(`Likely ending: ${prediction.likelyEnding}`);
console.log(`Confidence: ${prediction.confidence}%`);
console.log(`Factors: ${prediction.factors.join(', ')}`);
```

### Ending Triggers

**Banishment** (Low corruption + Coalition alliance):
```typescript
await CosmicEndingService.triggerBanishment(characterId);
```

**Destruction** (Any corruption + Military alliance):
```typescript
await CosmicEndingService.triggerDestruction(characterId);
```

**Bargain** (Medium corruption 30-60):
```typescript
await CosmicEndingService.triggerBargain(characterId);
```

**Awakening** (High corruption 60+ + Cult alliance):
```typescript
await CosmicEndingService.triggerAwakening(characterId);
```

## Key NPCs

```typescript
import { CosmicNPC } from '@desperados/shared';

const npcs = {
  prophet: CosmicNPC.THE_PROPHET,
  chief: CosmicNPC.CHIEF_FALLING_STAR,
  blackwood: CosmicNPC.DR_BLACKWOOD,
  ezekiel: CosmicNPC.HIGH_PRIEST_EZEKIEL,
  survivor: CosmicNPC.THE_SURVIVOR,
  voice: CosmicNPC.THE_VOICE,
  mcgraw: CosmicNPC.MINER_MCGRAW,
  holloway: CosmicNPC.SERGEANT_HOLLOWAY,
  delgado: CosmicNPC.PROFESSOR_DELGADO,
  shaman: CosmicNPC.SHAMAN_GRAY_WOLF
};
```

## Artifacts & Powers

### Artifacts
```typescript
import { COSMIC_ARTIFACTS } from '../data/cosmicLore';

// Get artifact by ID
const guardianLegacy = COSMIC_ARTIFACTS.find(a => a.id === 'artifact_guardian_legacy');
const slayersMark = COSMIC_ARTIFACTS.find(a => a.id === 'artifact_slayers_mark');
const covenantStone = COSMIC_ARTIFACTS.find(a => a.id === 'artifact_covenant_stone');
const dreamersCrown = COSMIC_ARTIFACTS.find(a => a.id === 'artifact_dreamers_crown');
```

### Powers
```typescript
import { COSMIC_POWERS } from '../data/cosmicLore';

// Get power by ID
const dreamSight = COSMIC_POWERS.find(p => p.id === 'power_dream_sight');
const corruptionSight = COSMIC_POWERS.find(p => p.id === 'power_corruption_sight');
const cosmicUnderstanding = COSMIC_POWERS.find(p => p.id === 'power_cosmic_understanding');
```

## Lore System

```typescript
// Get all discovered lore
const allLore = await CosmicQuestService.getDiscoveredLore(characterId);

// Get lore by category
const petroglyphs = await CosmicQuestService.getDiscoveredLore(
  characterId,
  LoreCategory.PETROGLYPHS
);

const cultManifestos = await CosmicQuestService.getDiscoveredLore(
  characterId,
  LoreCategory.CULT_MANIFESTO
);
```

### Lore Categories
- `PETROGLYPHS` - Ancient stone carvings
- `MINERS_JOURNAL` - Mining expedition notes
- `SCIENTIFIC_NOTES` - Dr. Blackwood's research
- `CULT_MANIFESTO` - Cult writings
- `ORAL_HISTORY` - Coalition elder stories
- `ENTITY_DREAMS` - Dreams from entity
- `ARCHAEOLOGICAL` - Excavation findings
- `PROPHECY` - Ancient predictions

## Vision System

```typescript
// Get all visions experienced
const visions = await CosmicQuestService.getExperiencedVisions(characterId);

// Manually add vision (usually triggered automatically)
await CosmicQuestService.addVision(characterId, {
  id: 'vision_01_example',
  name: 'Example Vision',
  narrative: 'You see...',
  timestamp: new Date()
});
```

## Sanity Events

```typescript
// Trigger sanity event
const event: SanityEvent = {
  id: 'sanity_custom',
  trigger: 'Custom trigger',
  description: 'Something terrifying happens...',
  corruptionGain: 5,
  choices: [
    {
      id: 'choice_resist',
      text: 'Resist the madness',
      corruptionModifier: -2,
      consequence: 'You maintain control'
    },
    {
      id: 'choice_embrace',
      text: 'Embrace the truth',
      corruptionModifier: 5,
      consequence: 'You understand more'
    }
  ]
};

const result = await CosmicQuestService.triggerSanityEvent(characterId, event);
```

## Quest Data Access

```typescript
import { COSMIC_QUESTS, getCosmicQuest, getNextQuest, getQuestsByAct } from '../data/cosmicQuests';

// Get specific quest
const quest = getCosmicQuest('cosmic_01_strange_happenings');

// Get next quest in chain
const next = getNextQuest('cosmic_01_strange_happenings');

// Get all quests in an act
const act1Quests = getQuestsByAct(1);
const act2Quests = getQuestsByAct(2);
```

## Common Patterns

### Starting a Quest
```typescript
const availableQuests = await CosmicQuestService.getAvailableQuests(characterId);
const nextQuest = availableQuests[0];

// Show quest briefing
console.log(nextQuest.briefing);

// Show objectives
nextQuest.objectives.forEach(obj => {
  console.log(`${obj.description}: ${obj.current}/${obj.required}`);
});
```

### Progressing Through Quest
```typescript
// Complete each objective
for (const objective of quest.objectives) {
  const result = await CosmicQuestService.completeObjective(
    characterId,
    quest.id,
    objective.id
  );

  // Add corruption
  if (result.corruptionGained > 0) {
    console.log(`Corruption +${result.corruptionGained}`);
  }

  // Show vision if triggered
  if (result.visionTriggered) {
    displayVision(result.visionTriggered);
  }

  // Quest complete
  if (result.questCompleted) {
    const completion = await CosmicQuestService.completeQuest(
      characterId,
      quest.id
    );

    // Grant rewards
    grantRewards(completion.rewards);

    // Move to next quest
    if (completion.nextQuest) {
      console.log(`Next quest: ${completion.nextQuest.name}`);
    }
  }
}
```

### Handling Player Choices
```typescript
// Present choice to player
const choice = quest.sanityEvents[0].choices![0];

console.log(choice.text);
console.log(`Corruption: ${choice.corruptionModifier > 0 ? '+' : ''}${choice.corruptionModifier}`);
console.log(`Result: ${choice.consequence}`);

// Player selects choice
const result = await CosmicQuestService.makeChoice(
  characterId,
  quest.id,
  choice.id
);

// Apply corruption
await CosmicQuestService.addCorruption(
  characterId,
  choice.corruptionModifier,
  'Player choice'
);
```

## Testing Checklist

- [ ] Character can start questline at level 25
- [ ] All 20 quests are accessible in sequence
- [ ] Corruption accumulates correctly
- [ ] Visions trigger at appropriate corruption levels
- [ ] Lore unlocks as intended
- [ ] Journal entries are recorded
- [ ] All four endings are achievable
- [ ] Ending prediction works correctly
- [ ] Artifacts are granted properly
- [ ] Powers unlock as expected
- [ ] NPC relationships track correctly
- [ ] World effects apply appropriately

## Debugging

```typescript
// Check current state
const progress = await CosmicQuestService.getCosmicProgress(characterId);

console.log('=== COSMIC PROGRESS DEBUG ===');
console.log(`Current Quest: ${progress.currentQuest}`);
console.log(`Current Act: ${progress.currentAct}`);
console.log(`Completed: ${progress.completedQuests.length}/20`);
console.log(`Corruption: ${progress.corruption.level}/100`);
console.log(`Effects: ${progress.corruption.effects.length}`);
console.log(`Visions: ${progress.experiencedVisions.length}`);
console.log(`Lore: ${progress.discoveredLore.length}`);
console.log(`Choices: ${progress.majorChoices.length}`);
console.log(`Ending Path: ${progress.endingPath || 'Undecided'}`);
```

## Performance Considerations

- Progress is stored in-memory (consider MongoDB model for production)
- Vision narratives can be long (lazy-load when needed)
- Lore entries accumulate (paginate display)
- World effects are permanent (cache for quick lookup)

## UI/UX Recommendations

1. **Corruption Indicator**: Visual meter showing corruption level
2. **Vision Display**: Full-screen overlay with atmospheric styling
3. **Journal**: Dedicated UI for reading entries
4. **Lore Codex**: Searchable/filterable lore browser
5. **Choice Dialog**: Clear presentation of consequences
6. **Ending Cutscene**: Cinematic presentation of epilogue

## Further Documentation

- Full implementation details: `COSMIC_STORY_IMPLEMENTATION.md`
- Type definitions: `shared/src/types/cosmicStory.types.ts`
- Quest data: `server/src/data/cosmicQuests/`
- Services: `server/src/services/cosmicQuest.service.ts`
