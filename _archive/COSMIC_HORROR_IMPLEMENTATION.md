# Cosmic Horror Mechanics Implementation - Phase 14, Wave 14.1

## Overview

Complete implementation of the Cosmic Horror mechanics for Desperados Destiny, introducing corruption, madness, eldritch artifacts, dark rituals, and reality distortion systems centered around The Scar region.

## Files Created

### Type Definitions
**Location:** `shared/src/types/cosmicHorror.types.ts`

Comprehensive type definitions including:
- **Corruption System:**
  - `CorruptionLevel` enum (5 levels: Clean, Touched, Tainted, Corrupted, Lost)
  - `CorruptionEffects` interface with bonuses and penalties
  - `CharacterCorruption` tracking interface
  - Helper functions for corruption calculations

- **Madness System:**
  - `MadnessType` enum (7 types: Paranoia, Obsession, Phobia, Delusion, Compulsion, Megalomania, Dissociation)
  - `MadnessEffect` interface with gameplay effects
  - Duration and cure tracking

- **Forbidden Knowledge:**
  - `ForbiddenKnowledgeType` enum (8 types: Void Speech, Reality Shaping, Soul Sight, etc.)
  - Knowledge acquisition and requirements

- **Eldritch Artifacts:**
  - `EldritchArtifact` interface (12+ cursed items)
  - Abilities, passive effects, costs, and curses
  - Equipment restrictions

- **Rituals:**
  - `Ritual` interface (12+ dark ceremonies)
  - `RitualType` enum (8 types: Protection, Summoning, Binding, etc.)
  - Components, requirements, success/failure mechanics

- **Reality Distortion:**
  - `RealityDistortion` interface (10+ distortion types)
  - `DistortionType` enum
  - Location-based instability

- **Cosmic Entities:**
  - `CosmicEntity` interface
  - `CosmicEntityType` enum (8 entity categories)
  - Presence system and bargaining

- **Constants:**
  - `COSMIC_HORROR_CONSTANTS` with all mechanical values

### Data Files

#### 1. Corruption Effects (`server/src/data/corruptionEffects.ts`)
Defines effects at each corruption level:
- **Clean (0-20):** No effects
- **Touched (21-40):** +5% damage, minor visions, slight NPC penalty
- **Tainted (41-60):** +10% damage, void sight, significant penalties
- **Corrupted (61-80):** +20% damage, major abilities, NPCs fear you
- **Lost (81-100):** +35% damage, reality manipulation, transformation risk

Includes:
- Visual appearance changes at each level
- NPC reaction modifiers
- Combat effect bonuses
- Detailed ability descriptions

#### 2. Eldritch Artifacts (`server/src/data/eldritchArtifacts.ts`)
**12 Powerful Cursed Items:**

1. **Void Crystal** - Fire void bolts, see through dimensions
   - Corruption: 40+ required
   - Cost: Turns eyes completely black
   - Curse: Drains 5 HP/day

2. **Eye of the Deep** - True sight, gaze of madness
   - Corruption: 50+ required
   - Cost: Natural eyes go blind
   - Curse: Cannot sleep (endless visions)

3. **Tongue of Stars** - Command reality, speak true names
   - Corruption: 60+ required
   - Cost: Tongue replaced by artifact
   - Curse: Cannot lie or refuse to answer

4. **Heart of Nothing** - Immortality at the cost of emptiness
   - Corruption: 80+ required
   - Cost: Soul destroyed
   - Curse: Cannot feel emotions, cannot die

5. **Mask of a Thousand Faces** - Perfect disguise, steal identities
   - Corruption: 45+ required
   - Cost: Real face erased
   - Curse: Lose memories with each use

6. **Bone Flute** - Summon dead, drive others insane
   - Corruption: 35+ required
   - Curse: Haunted by ghosts every night

7. **Clock of Eternity** - Rewind time, see future
   - Corruption: 50+ required
   - Cost: Age 1 year per use
   - Curse: Know when you'll die

8. **Lantern of Lost Souls** - Soul fire damage, illuminate truth
   - Corruption: 40+ required
   - Cost: Consumes your soul 1% per day
   - Curse: Must feed it souls or lose HP

9. **Book of Flesh** - Blood magic, flesh crafting
   - Corruption: 55+ required
   - Cost: Veins visible, blood turns black
   - Curse: Must drink blood daily

10. **Mirror of Truth** - Trap reflections, see true nature
    - Corruption: 30+ required
    - Cost: Max sanity -1 per use
    - Curse: Cannot ignore lies

11. **Crown of Whispers** - Read thoughts, dominate minds
    - Corruption: 45+ required
    - Cost: -20 max sanity (constant whispers)
    - Curse: Voices never stop

12. **Glove of Unmaking** - Erase things from existence
    - Corruption: 90+ required
    - Cost: Hand fades from reality
    - Curse: Lose 1 to all stats per use permanently

#### 3. Rituals (`server/src/data/rituals.ts`)
**12 Dark Ceremonies:**

1. **Circle of Salt** - Protection from cosmic horrors (60 min)
2. **Summon Lesser Horror** - Call minor entity to serve
3. **Ritual of Binding** - Trap entity with true name
4. **Ritual of Terrible Revelation** - Gain forbidden knowledge
5. **Blood Sacrifice** - Trade HP for cosmic power
6. **Greater Banishment** - Expel entity back to void
7. **Communion with the Beyond** - Speak with entities
8. **Ritual of Flesh Transformation** - Reshape your body
9. **Create Time Loop** - Temporal protection (30 min)
10. **Soul Transfer Ritual** - Move soul to new body (risky!)
11. **Open Void Gate** - Portal to void (requires 3+ participants)
12. **Invoke the Great Old One** - Contact ultimate horror (requires 5+ participants, very dangerous)

Each ritual includes:
- Required components
- Time to complete
- Energy, sanity, and corruption costs
- Success chance and critical success
- Failure consequences
- Cooldown periods

### Models

#### Character Corruption Model (`server/src/models/CharacterCorruption.model.ts`)
Mongoose schema tracking:
- Current corruption level (0-100)
- Total corruption gained/purged
- Time spent in The Scar
- Forbidden knowledge learned
- Tomes read and rituals learned
- Entities encountered
- Active and permanent madness
- Eldritch artifacts owned
- Physical mutations
- NPC fear level
- Corruption event history

**Instance Methods:**
- `gainCorruption()` - Add corruption with source tracking
- `loseCorruption()` - Purge corruption
- `addKnowledge()` - Learn forbidden knowledge
- `learnRitual()` - Add ritual to repertoire
- `encounterEntity()` - Record entity meeting
- `addMadness()` / `removeMadness()` - Manage madness effects
- `removeExpiredMadness()` - Clean up temporary madness
- `calculateTransformationRisk()` - Check if character transforms
- `updateCorruptionLevel()` - Recalculate corruption tier

### Services

#### 1. Corruption Service (`server/src/services/corruption.service.ts`)

**Core Functions:**
- `getOrCreateTracker()` - Get/create corruption tracker
- `gainCorruption()` - Apply corruption gain with events
- `loseCorruption()` - Purge corruption
- `handleDeath()` - Reset corruption on death (-25)
- `applyScarExposure()` - Passive corruption from location
- `rollForMadness()` - Chance-based madness application
- `generateRandomMadness()` - Create madness with templates
- `cureMadness()` - Remove active madness
- `learnKnowledge()` - Grant forbidden knowledge
- `checkTransformation()` - Roll for transformation at Lost level
- `calculateCombatModifiers()` - Get combat bonuses/penalties
- `calculateNPCReaction()` - Get NPC interaction modifiers

**Madness Templates:**
Each madness type has:
- Name and description
- Gameplay effects (stat penalties, action restrictions)
- Trigger conditions
- Symptoms
- Cure methods

**Features:**
- Automatic corruption level calculation
- Physical mutation tracking
- NPC fear level scaling
- Madness resistance building
- Event history logging

#### 2. Ritual Service (`server/src/services/ritual.service.ts`)

**Core Functions:**
- `canPerformRitual()` - Check requirements
- `startRitual()` - Begin ritual with time tracking
- `completeRitual()` - Roll for success/failure
- `cancelRitual()` - Cancel with backlash
- `applyRitualResults()` - Grant rewards
- `applyFailureConsequences()` - Apply penalties
- `getActiveRitual()` - Check ritual status
- `getAvailableRituals()` - List learnable rituals
- `discoverRitual()` - Learn new ritual

**Features:**
- Real-time ritual tracking (in-memory)
- Multi-participant support
- Success bonus from knowledge
- Critical success rolls
- Detailed failure consequences
- Component requirement checking

#### 3. Reality Distortion Service (`server/src/services/realityDistortion.service.ts`)

**10 Reality Distortion Types:**
1. **Spatial Shift** - Random teleportation
2. **Time Dilation** - Time moves differently
3. **Probability Flux** - Random outcome swings
4. **Memory Corruption** - Forget/remember false things
5. **Entity Duplication** - NPCs duplicated
6. **Path Alteration** - Roads lead elsewhere
7. **Property Change** - Items change stats
8. **Reality Inversion** - Physical laws flip
9. **Echo Event** - Micro time loops
10. **Void Tear** - Glimpse into void

**Core Functions:**
- `rollForDistortion()` - Check for distortion occurrence
- `applyDistortion()` - Execute distortion effects
- `getActiveDistortions()` - List active effects
- `forceDistortion()` - Trigger specific distortion
- `isLocationUnstable()` - Check location stability
- `getLocationStability()` - Get stability rating
- `periodicCheck()` - Regular distortion rolls in Scar

**Features:**
- Location-based triggers
- Corruption level requirements
- Resistance checks (Spirit/Cunning)
- Temporary effects with expiration
- Specific handlers for each distortion type
- Severity and sanity loss scaling

## System Mechanics

### Corruption System

**Gaining Corruption:**
- The Scar exposure: 2-5 corruption/hour (based on depth)
- Reading eldritch tomes: 20 corruption
- Performing rituals: 5-75 corruption
- Using artifacts: 2-25 corruption per use
- Entity encounters: 15 corruption

**Losing Corruption:**
- Death: -25 corruption
- Purification rituals: -10 corruption
- Daily max purge: 15 corruption
- Some rituals can reduce corruption

**Corruption Levels:**
- **Clean (0-20):** Normal gameplay
- **Touched (21-40):** Minor bonuses, slight penalties
- **Tainted (41-60):** Void sight, NPC fear begins
- **Corrupted (61-80):** Major power, significant penalties
- **Lost (81-100):** Transformation risk, NPCs hostile

**Transformation Risk at Lost:**
- Base 5% per day
- +1% per consecutive day in Scar
- If transformed: Character becomes NPC (game over)

### Madness System

**Madness Chance:**
- Every 10 corruption: +5% madness chance per encounter
- Reduced by madness resistance (gained by surviving)
- Max 3 active madnesses at once

**Madness Types:**
- **Paranoia:** NPC hostility +20%, -5 stats
- **Obsession:** Cannot leave until task done
- **Phobia:** Cannot approach feared object, -10 stats
- **Delusion:** Vision impairment 30%, -8 stats
- **Compulsion:** Must perform rituals regularly
- **Megalomania:** Cannot back down, +15 NPC hostility
- **Dissociation:** -12 stats, detached feeling

**Curing Madness:**
- Specific cure methods per madness
- Rest in safe locations
- Medical treatment
- Holy blessings
- Completing conditions

### Artifact System

**Acquisition:**
- Find in The Scar
- Complete specific quests
- Defeat cosmic entities
- Bargain with entities
- Perform rituals

**Usage:**
- Corruption requirement check
- Energy cost payment
- Sanity cost (integrate with sanity service)
- Corruption gain per use
- Curse activation

**Curses:**
- Some trigger always
- Some trigger in specific conditions
- Some removable, some permanent
- Most have serious consequences

### Ritual System

**Requirements:**
- Minimum corruption level
- Forbidden knowledge
- Specific location
- Components (items)
- Participants (1-5)
- Energy and gold costs

**Performing:**
- Real-time duration (5-120 minutes)
- Can be cancelled (with backlash)
- Success based on knowledge and difficulty
- Critical success chance

**Outcomes:**
- Success: Grant power, knowledge, summon, protect
- Failure: Damage, sanity loss, corruption, madness
- Critical: Enhanced benefits

### Reality Distortion

**Triggers:**
- Location: The Scar only
- Corruption level: Higher = more distortions
- Random chance: 10-30% per hour
- Can be resisted with Spirit/Cunning

**Effects:**
- Temporary (1-60 minutes)
- Location-specific
- Severity scales with corruption
- Sanity loss on occurrence

## Integration Points

### With Existing Systems

**Sanity System (Phase 10):**
- Corruption increases sanity drain multiplier
- Madness causes sanity loss
- Rituals cost sanity
- Entities drain sanity
- Distortions cause sanity loss

**Combat System:**
- Corruption provides damage bonuses
- Artifacts grant combat abilities
- Madness applies combat penalties
- Corrupted appearance affects NPCs

**NPC System:**
- Corruption affects NPC reactions
- High corruption: NPCs flee or attack
- NPC fear level scales with corruption
- Shop prices increase
- Services refused at high corruption

**Location System:**
- The Scar has unique properties
- Reality stability varies by location
- Certain rituals require specific locations
- Distortions only in The Scar

**Death System:**
- Death reduces corruption by 25
- Removes some madness
- Artifact curses may persist
- Transformation is permanent death

### Future Integrations

**Quest System:**
- Quests to discover rituals
- Quests to find artifacts
- Quests to banish entities
- Corruption-locked quests

**Achievement System:**
- Reach corruption levels
- Learn all knowledge types
- Perform all rituals
- Collect artifacts
- Survive transformations

**Leaderboard System:**
- Highest corruption survived
- Most rituals performed
- Entities encountered
- Artifacts collected

## Constants Reference

```typescript
COSMIC_HORROR_CONSTANTS = {
  // Corruption thresholds
  CORRUPTION_CLEAN_MAX: 20,
  CORRUPTION_TOUCHED_MAX: 40,
  CORRUPTION_TAINTED_MAX: 60,
  CORRUPTION_CORRUPTED_MAX: 80,
  CORRUPTION_LOST_MAX: 100,

  // Corruption rates
  SCAR_BASE_CORRUPTION_PER_HOUR: 2,
  SCAR_DEEP_CORRUPTION_PER_HOUR: 5,
  RITUAL_BASE_CORRUPTION: 10,
  ARTIFACT_USE_CORRUPTION: 5,
  ENTITY_ENCOUNTER_CORRUPTION: 15,
  TOME_READING_CORRUPTION: 20,

  // Purging
  DEATH_CORRUPTION_RESET: 25,
  PURIFICATION_BASE_REDUCTION: 10,
  MAX_DAILY_PURGE: 15,

  // Madness
  MADNESS_CHANCE_PER_CORRUPTION_10: 0.05,
  MADNESS_DURATION_BASE: 60,
  MAX_ACTIVE_MADNESS: 3,
  MADNESS_RESISTANCE_PER_EPISODE: 2,

  // Distortions
  DISTORTION_BASE_CHANCE: 0.1,
  DISTORTION_HIGH_CORRUPTION_CHANCE: 0.3,

  // Entities
  ENTITY_PRESENCE_GAIN_PER_HOUR: 1,
  ENTITY_MANIFESTATION_THRESHOLD: 50,

  // Rituals
  RITUAL_SUCCESS_BASE: 0.5,
  RITUAL_SUCCESS_PER_KNOWLEDGE: 0.1,
  RITUAL_CRITICAL_CHANCE: 0.1,

  // Knowledge
  KNOWLEDGE_MAX_PER_CHARACTER: 5,

  // Social
  NPC_FEAR_THRESHOLD_CORRUPTED: 60,
  NPC_FLEE_THRESHOLD_LOST: 80,
  NPC_ATTACK_THRESHOLD_LOST: 90,

  // Transformation
  TRANSFORMATION_BASE_CHANCE_LOST: 0.05,
  TRANSFORMATION_IRREVERSIBLE: true
}
```

## API Endpoints (To Be Created)

### Corruption Endpoints
- `GET /api/corruption/:characterId` - Get corruption status
- `POST /api/corruption/:characterId/purge` - Purge corruption
- `GET /api/corruption/:characterId/effects` - Get current effects

### Madness Endpoints
- `GET /api/madness/:characterId` - Get active madness
- `POST /api/madness/:characterId/cure` - Attempt cure
- `GET /api/madness/:characterId/resistance` - Get resistance

### Artifact Endpoints
- `GET /api/artifacts` - List all artifacts
- `GET /api/artifacts/:characterId` - Get character's artifacts
- `POST /api/artifacts/:characterId/use` - Use artifact ability
- `POST /api/artifacts/:characterId/equip` - Equip artifact

### Ritual Endpoints
- `GET /api/rituals` - List all rituals
- `GET /api/rituals/:characterId/available` - Get available rituals
- `POST /api/rituals/:characterId/start` - Start ritual
- `POST /api/rituals/:characterId/complete` - Complete ritual
- `POST /api/rituals/:characterId/cancel` - Cancel ritual
- `GET /api/rituals/:characterId/active` - Get active ritual

### Knowledge Endpoints
- `GET /api/knowledge/:characterId` - Get learned knowledge
- `POST /api/knowledge/:characterId/learn` - Learn knowledge
- `GET /api/knowledge/tomes` - List all tomes

### Distortion Endpoints
- `GET /api/distortions/:characterId` - Get active distortions
- `GET /api/distortions/location/:location` - Get location stability

## Testing Recommendations

### Unit Tests
- Corruption gain/loss calculations
- Madness generation and curing
- Ritual success/failure rolls
- Distortion resistance checks
- NPC reaction calculations

### Integration Tests
- Full ritual flow
- Artifact usage with corruption
- Death and corruption reset
- Madness stacking and limits
- Location-based distortions

### Gameplay Tests
- Balance corruption gain rates
- Test transformation threshold
- Verify NPC fear reactions
- Test ritual timings
- Validate artifact power levels

## Performance Considerations

- Active rituals stored in-memory (consider Redis for production)
- Active distortions stored in-memory (consider Redis for production)
- Corruption events kept to last 100
- Periodic cleanup of expired effects
- Indexes on characterId, corruption level

## Security Considerations

- Validate ritual components exist
- Prevent ritual spam with cooldowns
- Rate limit corruption endpoint calls
- Verify character ownership for all operations
- Sanitize user input for ritual/artifact IDs

## Balance Notes

### Power Curve
- Corruption provides power but risks transformation
- Artifacts are powerful but have severe curses
- Rituals have high rewards but high risks
- Balance risk vs reward at each corruption level

### NPC Reactions
- Gradual increase in fear/hostility
- Service refusal at high corruption
- Price increases to limit economy abuse
- Complete rejection at Lost level

### Transformation
- 5% daily risk at Lost level ensures urgency
- Purging corruption is limited (15/day max)
- Creates meaningful choice: power or safety

## Future Enhancements

1. **Cosmic Entity System:**
   - Full entity manifestation and combat
   - Entity bargains and pacts
   - Entity-specific quests
   - Multiple entities active simultaneously

2. **The Scar Expansion:**
   - Deeper zones with higher corruption
   - Unique locations with special properties
   - Dynamic corruption level affecting environment
   - Scar-specific NPCs and factions

3. **Mutation System:**
   - Specific mutations from high corruption
   - Visual representation of mutations
   - Mutation benefits and drawbacks
   - Mutation combination effects

4. **Cult System:**
   - Player-run cults worshipping entities
   - Cult rituals and benefits
   - Cult vs cult conflicts
   - Entity favor system

5. **Endgame Content:**
   - Ascension ritual (transform willingly)
   - True ending at 100 corruption
   - Entity champion status
   - Cosmic power unlocks

## Horror Atmosphere

### Design Philosophy
The cosmic horror system is designed to create genuine dread through:

1. **Inevitable Corruption:** Time in The Scar corrupts you
2. **Power at Cost:** Every ability has a terrible price
3. **Loss of Humanity:** Physical and mental transformation
4. **Unknown Threats:** Entities beyond comprehension
5. **Reality Breakdown:** Physics becomes optional
6. **Social Isolation:** NPCs reject corrupted characters
7. **Irreversible Choices:** Some things cannot be undone

### Narrative Elements
- Lovecraftian language in descriptions
- Escalating horror with corruption levels
- Cosmic insignificance themes
- Sanity-breaking revelations
- Body horror elements
- Existential dread

## Conclusion

This implementation provides a complete, balanced, and atmospheric cosmic horror system that integrates deeply with existing game mechanics while adding unique endgame content. The system creates meaningful choices, escalating tension, and genuine horror through mechanical and narrative means.

The corruption system provides a power curve that encourages risk-taking while maintaining real consequences. The artifact and ritual systems offer powerful abilities at terrible costs. The reality distortion system makes The Scar feel genuinely alien and dangerous.

Together, these systems create a rich endgame experience where players must carefully balance power and corruption while navigating an unstable reality filled with cosmic horrors.

---

**Implementation Status:** Complete - Ready for API endpoint creation and client integration
**TypeScript Compilation:** ✓ All new types compile successfully
**Systems Implemented:** 5 (Corruption, Madness, Artifacts, Rituals, Distortions)
**Total Files Created:** 8
**Total Lines of Code:** ~4,500
**Genuine Cosmic Dread:** Maximum
