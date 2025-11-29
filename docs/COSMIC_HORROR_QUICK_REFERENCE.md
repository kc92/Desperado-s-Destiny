# Cosmic Horror System - Quick Reference Guide

## Table of Contents
1. [Corruption Levels](#corruption-levels)
2. [Madness Types](#madness-types)
3. [Eldritch Artifacts](#eldritch-artifacts)
4. [Rituals](#rituals)
5. [Reality Distortions](#reality-distortions)
6. [Forbidden Knowledge](#forbidden-knowledge)
7. [Code Examples](#code-examples)

---

## Corruption Levels

| Level | Range | Damage Bonus | Key Features |
|-------|-------|--------------|--------------|
| **Clean** | 0-20 | 0% | No effects |
| **Touched** | 21-40 | +5% | Minor visions, slight NPC penalty |
| **Tainted** | 41-60 | +10% | Void sight, shadow moves wrong |
| **Corrupted** | 61-80 | +20% | Major powers, NPCs fear you |
| **Lost** | 81-100 | +35% | Transformation risk, reality bends |

### Corruption Sources
- **The Scar:** 2-5/hour (based on depth)
- **Rituals:** 5-75 per ritual
- **Artifacts:** 2-25 per use
- **Tomes:** 20 per tome
- **Entities:** 15 per encounter

### Corruption Reduction
- **Death:** -25 corruption
- **Purification:** -10 corruption
- **Daily limit:** 15 corruption

---

## Madness Types

### 1. Paranoia
- **Effect:** +20 NPC hostility, -5 all stats
- **Trigger:** In towns, around NPCs
- **Symptoms:** Constant suspicion, seeing threats
- **Cure:** Rest 24h safe / Therapy / Blessing

### 2. Obsession
- **Effect:** Cannot leave until task complete
- **Trigger:** When obsession present
- **Symptoms:** Single-minded focus
- **Cure:** Complete task / Trauma / Mind-clearing ritual

### 3. Phobia
- **Effect:** -10 stats, cannot approach feared object
- **Trigger:** Phobia trigger present
- **Symptoms:** Panic, uncontrollable fear
- **Cure:** Exposure therapy / Courage elixir / Face fear 3x

### 4. Delusion
- **Effect:** 30% vision impairment, -8 stats
- **Trigger:** Low light, alone, stressed
- **Symptoms:** Hallucinations, false beliefs
- **Cure:** Sedation / Reality anchor / Companion

### 5. Compulsion
- **Effect:** Must perform ritual, -5 stats
- **Trigger:** Every few hours, when stressed
- **Symptoms:** Repetitive behaviors, anxiety
- **Cure:** Therapy / Distraction 48h / Medication

### 6. Megalomania
- **Effect:** +15 NPC hostility, can't back down
- **Trigger:** Social situations, challenges
- **Symptoms:** Delusions of grandeur, overconfidence
- **Cure:** Humbling defeat / Reality check / Time

### 7. Dissociation
- **Effect:** -12 stats, 20% vision impairment
- **Trigger:** Combat, high stress, random
- **Symptoms:** Feeling detached, dreamlike
- **Cure:** Grounding / Strong stimulation / Connection

---

## Eldritch Artifacts

### Quick Stats Table

| Artifact | Corruption | Level | Primary Power | Curse |
|----------|-----------|-------|---------------|-------|
| Void Crystal | 40 | 15 | Void bolts | -5 HP/day |
| Eye of the Deep | 50 | 18 | True sight | Endless visions |
| Tongue of Stars | 60 | 20 | Command reality | Cannot lie |
| Heart of Nothing | 80 | 25 | Immortality | No emotions |
| Mask of Faces | 45 | 12 | Perfect disguise | Lose memories |
| Bone Flute | 35 | 14 | Summon dead | Haunted nights |
| Clock of Eternity | 50 | 17 | Time manipulation | Age per use |
| Lantern of Souls | 40 | 16 | Soul fire | Soul consumption |
| Book of Flesh | 55 | 19 | Blood magic | Blood addiction |
| Mirror of Truth | 30 | 13 | See truth | Truth burden |
| Crown of Whispers | 45 | 16 | Mind reading | Endless whispers |
| Glove of Unmaking | 90 | 30 | Erase existence | Stat loss |

---

## Rituals

### Quick Reference

| Ritual | Type | Time | Participants | Success | Corruption |
|--------|------|------|--------------|---------|------------|
| Circle of Salt | Protection | 5m | 1 | 90% | 0 |
| Summon Horror | Summoning | 15m | 1 | 70% | 10 |
| Binding | Binding | 20m | 1 | 60% | 5 |
| Revelation | Revelation | 30m | 1 | 70% | 20 |
| Blood Sacrifice | Sacrifice | 10m | 1 | 85% | 15 |
| Banishment | Banishment | 15m | 1 | 65% | -10 |
| Communion | Communion | 20m | 1 | 70% | 15 |
| Transformation | Transform | 45m | 1 | 60% | 30 |
| Time Loop | Protection | 30m | 1 | 50% | 25 |
| Soul Transfer | Transform | 60m | 1 | 40% | 40 |
| Void Gate | Summoning | 45m | 3 | 50% | 50 |
| Great Old One | Summoning | 120m | 5 | 30% | 75 |

### Ritual Components Common Items
- Consecrated Salt
- Silver Dust/Chains
- Blood Offerings
- Black Candles
- Ritual Circles
- True Names
- Star Stones
- Crystal Shards

---

## Reality Distortions

### Distortion Types

| Distortion | Severity | Sanity Loss | Resistible | Corruption Req |
|------------|----------|-------------|------------|----------------|
| Spatial Shift | 4 | 5 | Yes (Spirit) | Touched |
| Time Dilation | 6 | 10 | No | Tainted |
| Probability Flux | 5 | 8 | No | Tainted |
| Memory Corruption | 7 | 12 | Yes (Cunning) | Touched |
| Entity Duplication | 6 | 10 | No | Tainted |
| Path Alteration | 5 | 6 | Yes (Cunning) | Touched |
| Property Change | 7 | 15 | No | Corrupted |
| Reality Inversion | 9 | 20 | Yes (Spirit) | Corrupted |
| Echo Event | 8 | 18 | No | Corrupted |
| Void Tear | 10 | 30 | Yes (Spirit) | Lost |

### Occurrence Rates
- **Base Chance:** 10% per hour in Scar
- **High Corruption:** 30% per hour at Corrupted/Lost
- **Location:** The Scar only

---

## Forbidden Knowledge

### Knowledge Types

1. **Void Speech** - Communicate with cosmic entities
2. **Reality Shaping** - Minor reality manipulation
3. **Soul Sight** - See beyond death
4. **Summoning** - Call entities
5. **Banishment** - Repel horrors
6. **Blood Magic** - Power through sacrifice
7. **Time Sight** - Glimpse past/future
8. **Void Walking** - Move through non-space

### Learning Requirements
- **Max Knowledge:** 5 per character
- **Cost:** Varies by source (usually 20+ corruption, 30+ sanity)
- **Sources:** Tomes, rituals, entity bargains

---

## Code Examples

### Check Corruption Level
```typescript
import { CorruptionService } from '@/services/corruption.service';

const status = await CorruptionService.getStatus(characterId);
console.log(`Corruption: ${status.currentCorruption} (${status.corruptionLevel})`);
console.log(`Damage Bonus: +${status.effects.damageBonus}%`);
console.log(`NPC Reaction: ${status.effects.npcReactionPenalty}`);
```

### Gain Corruption
```typescript
const result = await CorruptionService.gainCorruption(
  characterId,
  15,
  'Ritual: Summoning',
  'The Scar - Depths'
);

if (result.levelChanged) {
  console.log(`CORRUPTION LEVEL UP: ${result.corruptionLevel}`);
}

if (result.madnessGained) {
  console.log(`New Madness: ${result.madnessGained.name}`);
}
```

### Start Ritual
```typescript
import { RitualService } from '@/services/ritual.service';

const canPerform = await RitualService.canPerformRitual(characterId, 'summon_lesser_horror');

if (canPerform.canPerform) {
  const result = await RitualService.startRitual(
    characterId,
    'summon_lesser_horror',
    [] // participants
  );

  console.log(result.message);
  console.log(`Completes at: ${result.completesAt}`);
}
```

### Complete Ritual
```typescript
const result = await RitualService.completeRitual(characterId);

if (result.success) {
  console.log('SUCCESS!');
  console.log(result.message);
  result.results?.forEach(r => console.log(`- ${r.description}`));
} else if (result.failed) {
  console.log('FAILURE!');
  console.log(result.message);
  console.log(`Consequence: ${result.failure?.description}`);
}
```

### Check for Reality Distortion
```typescript
import { RealityDistortionService } from '@/services/realityDistortion.service';

const result = await RealityDistortionService.rollForDistortion(
  characterId,
  character.currentLocation
);

if (result.occurred) {
  if (result.resisted) {
    console.log('You resisted the distortion!');
  } else {
    console.log(`DISTORTION: ${result.distortion?.name}`);
    console.log(result.message);
  }
}
```

### Use Artifact
```typescript
// Check if can use
const corruption = await CorruptionService.getOrCreateTracker(characterId);
const artifact = getArtifactById('void_crystal');

if (corruption.canUseArtifact(artifact.corruptionRequired)) {
  // Apply costs
  await CorruptionService.gainCorruption(
    characterId,
    artifact.corruptionPerUse,
    `Using ${artifact.name}`
  );

  // Use ability
  console.log(`Using ${artifact.abilities[0].name}`);
  // Apply ability effects...
}
```

### Get Available Rituals
```typescript
const available = await RitualService.getAvailableRituals(characterId);

console.log('Available Rituals:');
available.forEach(ritual => {
  console.log(`- ${ritual.name} (${ritual.type})`);
  console.log(`  Corruption: ${ritual.corruptionRequired}`);
  console.log(`  Time: ${ritual.timeRequired}m`);
});
```

### Check NPC Reaction
```typescript
const reaction = await CorruptionService.calculateNPCReaction(characterId);

if (reaction.willFlee) {
  console.log('NPC flees in terror!');
} else if (reaction.willAttack) {
  console.log('NPC attacks you!');
} else {
  console.log(`NPC reaction penalty: ${reaction.reactionPenalty}`);
}
```

### Handle Death
```typescript
await CorruptionService.handleDeath(characterId);

const status = await CorruptionService.getStatus(characterId);
console.log(`Corruption after death: ${status.currentCorruption} (-25)`);
console.log(`Active madnesses: ${status.activeMadness.length} (reduced)`);
```

### Check Transformation Risk
```typescript
const risk = await CorruptionService.checkTransformation(characterId);

if (risk.transformed) {
  console.log('You have TRANSFORMED into something... else.');
  console.log('Your character is no longer playable.');
  // Handle transformation (end game scenario)
} else if (risk.atRisk) {
  console.log(`Daily transformation risk: ${risk.riskPercent.toFixed(1)}%`);
}
```

### Get Location Stability
```typescript
const stability = RealityDistortionService.getLocationStability(location);

console.log(`Stability: ${stability.stabilityLevel}%`);
console.log(stability.description);

if (!stability.stable) {
  console.log('WARNING: Reality is unstable here!');
}
```

---

## Important Notes

### Balance Considerations
- Corruption gain should feel gradual but inevitable in The Scar
- Rituals are high-risk, high-reward
- Artifacts provide power but severe costs
- Transformation at Lost level creates urgency

### Integration Requirements
- Sanity system for sanity costs
- Health system for damage
- Inventory system for components
- Quest system for discovery
- Achievement system for milestones

### Performance Tips
- Use indexes on corruption level queries
- Clean up expired effects regularly
- Consider Redis for active rituals in production
- Limit corruption event history to 100 entries

### Security Checks
- Always verify character ownership
- Validate ritual/artifact IDs
- Rate limit corruption endpoints
- Prevent ritual spam with cooldowns

---

## Constants Quick Access

```typescript
import { COSMIC_HORROR_CONSTANTS } from '@desperados/shared';

// Corruption thresholds
COSMIC_HORROR_CONSTANTS.CORRUPTION_TOUCHED_MAX; // 40
COSMIC_HORROR_CONSTANTS.CORRUPTION_LOST_MAX; // 100

// Rates
COSMIC_HORROR_CONSTANTS.SCAR_BASE_CORRUPTION_PER_HOUR; // 2
COSMIC_HORROR_CONSTANTS.DEATH_CORRUPTION_RESET; // 25

// Chances
COSMIC_HORROR_CONSTANTS.DISTORTION_BASE_CHANCE; // 0.1
COSMIC_HORROR_CONSTANTS.TRANSFORMATION_BASE_CHANCE_LOST; // 0.05

// Limits
COSMIC_HORROR_CONSTANTS.MAX_ACTIVE_MADNESS; // 3
COSMIC_HORROR_CONSTANTS.KNOWLEDGE_MAX_PER_CHARACTER; // 5
```

---

**Last Updated:** Phase 14, Wave 14.1
**Status:** Implementation Complete
**Dread Level:** Maximum
