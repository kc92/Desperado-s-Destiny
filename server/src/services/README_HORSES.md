# Horse System - Developer Quick Reference

## Service Overview

### horse.service.ts
**Core horse management and ownership**

```typescript
// Purchase a new horse
const horse = await purchaseHorse(characterId, locationId, {
  breed: HorseBreed.ARABIAN,
  gender: HorseGender.STALLION,
  name: "Thunder"
});

// Tame a wild horse (requires taming minigame success)
const wildHorse = await tameWildHorse(
  characterId,
  locationId,
  HorseBreed.MUSTANG,
  "Spirit",
  tamingSuccess: true
);

// Get all horses owned by character
const { horses, totalCount, activeHorse } = await getHorsesByOwner(characterId);

// Set active mount
await setActiveHorse(characterId, horseId);

// Feed horse
await feedHorse(characterId, {
  horseId,
  foodQuality: 'premium' // 'basic' | 'quality' | 'premium'
});

// Groom horse
await groomHorse(characterId, { horseId });

// Train a skill
const { horse, progress, completed } = await trainHorseSkill(characterId, {
  horseId,
  skill: HorseSkill.WAR_HORSE
});

// Get mounted combat bonuses
const bonuses = getMountedCombatBonus(horse);
// Returns: { attackBonus, defenseBonus, initiativeBonus, intimidationBonus, fleeChance }

// Record combat participation
await recordCombat(horseId, victory: true, damage: 20);

// Record travel
await recordTravel(horseId, miles: 15);

// Update condition (auto-decay over time)
await updateHorseCondition(horseId);
```

---

### horseBreeding.service.ts
**Breeding mechanics and genetics**

```typescript
// Breed two horses
const { result, mare } = await breedHorses(characterId, {
  stallionId,
  mareId
});

// result contains:
// - success: boolean
// - message: string
// - foal: { breed, gender, color, predictedStats, isExceptional, specialTrait }
// - dueDate: Date (330 days from now)

// Check for due pregnancies (should be run daily via cron)
const newborns = await checkPregnancies();
// Returns array of newly born foals

// Get breeding lineage
const lineage = await getBreedingLineage(horseId);
// Returns: { horse, sire, dam, foals, grandparents }

// Get breeding recommendations
const recommendations = await getBreedingRecommendations(characterId, horseId);
// Returns top 5 best matches with compatibility scores and predicted stats
```

**Breeding Formula:**
```
Foal Stat = (Sire Stat + Dam Stat) / 2 ± 15% random variance
Exceptional Chance = 5% (if true, +3 to all stats, +1 max skill)
Mutation Chance = 10% (random stat ±5)
Success Rate = 75% base × health × bond × age factors
```

---

### horseBond.service.ts
**Bond level progression and loyalty**

```typescript
// Update bond from activity
const { horse, previousLevel, newLevel, leveledUp } = await updateBond(
  horseId,
  'FEED_PREMIUM' // Activity key from BOND_ACTIVITIES
);

// Check bond decay (run periodically)
await checkBondDecay(horseId);
// Decay starts after 24 hours: -1/day, -2/day after 7 days, -3/day after 30 days

// Special bond events
const { horse, bondGain, trustGain, message } = await saveHorseFromDanger(
  horseId,
  'predator' // 'injury' | 'predator' | 'natural_disaster' | 'theft'
);

// Horse protects owner
const { horse, bondGain, message } = await horseProtectsOwner(horseId);

// Whistle for horse
const { success, arrivalTime, message } = await whistleForHorse(
  characterId,
  horseId,
  distance: 2 // miles
);
// Max distance: Partner=1mi, Companion=3mi, Bonded=10mi

// Get bond recommendations
const recommendations = getBondRecommendations(horse);
// Returns array of activity suggestions

// Handle horse death (tragic!)
const { bondLevel, traumaDuration, effectPenalty } = await handleHorseDeath(
  horseId,
  ownerId
);
// Bonded horses cause 7 days of -50% effectiveness trauma
```

**Bond Levels:**
```
0-20:   STRANGER      (basic commands, may flee)
21-40:  ACQUAINTANCE  (+5% travel speed)
41-60:  PARTNER       (whistle recall, +10% travel, +5% combat)
61-80:  COMPANION     (+15% travel, +10% combat, warns of danger)
81-100: BONDED        (never flees, +20% all, death trauma if killed)
```

---

### horseRacing.service.ts
**Competitions and leaderboards**

```typescript
// Enter a race
const race = await enterRace(characterId, horseId, raceId);

// Simulate race (for admin/event completion)
const results = await simulateRace(raceId, [
  { characterId: char1, horseId: horse1 },
  { characterId: char2, horseId: horse2 }
]);
// Returns: [{ race, yourPosition, prizeWon, experienceGained }, ...]

// Enter a horse show
const show = await enterShow(characterId, horseId, showId);

// Simulate show
const results = await simulateShow(
  showId,
  'beauty', // 'beauty' | 'skill' | 'obedience'
  participants
);
// Returns: [{ show, yourRank, prizeWon, bondGained }, ...]

// Get leaderboards
const racingChampions = await getRacingLeaderboard(10);
const warHorses = await getCombatLeaderboard(10);
const travelers = await getDistanceLeaderboard(10);

// Create events (for admin)
const race = createRace("Desert Sprint", locationId, 1.5, 50, 500, startTime);
const show = createShow("Beauty Contest", 'beauty', locationId, 25,
  { first: 200, second: 100, third: 50 }, showTime);
```

**Race Score Formula:**
```
Score = (Speed × 4) + (Stamina × 3) + (Condition × 2) + (Bond × 1)
× Bond Multiplier
× Skill Bonuses (Racing Form +20%, Speed Burst +10%)
× Equipment Bonuses
× Random Factor (90-110%)
```

---

## Data Reference

### Importing Breed Data
```typescript
import {
  HORSE_BREEDS,
  getBreedDefinition,
  getBreedsByRarity,
  generateHorseStats,
  selectRandomColor
} from '../data/horseBreeds';

const breedInfo = getBreedDefinition(HorseBreed.ARABIAN);
// { name, description, rarity, basePrice, statRanges, specialties, ... }

const commonBreeds = getBreedsByRarity(HorseRarity.COMMON);
const stats = generateHorseStats(HorseBreed.THOROUGHBRED);
const color = selectRandomColor(HorseBreed.PAINT_HORSE);
```

### Importing Equipment Data
```typescript
import {
  SADDLES,
  SADDLEBAGS,
  HORSESHOES,
  BARDING,
  HORSE_FOOD,
  getEquipmentById,
  getShopEquipment
} from '../data/horseEquipment';

const allSaddles = SADDLES; // Array of saddle definitions
const item = getEquipmentById('legendary_saddle');
const shopItems = getShopEquipment(); // Excludes legendary items

const food = HORSE_FOOD.find(f => f.quality === 'premium');
// { quality, name, description, cost, hungerRestored, bondBonus, ... }
```

### Importing Skill Data
```typescript
import {
  HORSE_SKILLS,
  getSkillDefinition,
  canLearnSkill,
  getActiveSynergies,
  simulateTrainingSession
} from '../data/horseSkills';

const skillInfo = getSkillDefinition(HorseSkill.WAR_HORSE);
// { name, description, trainingTime, trainingCost, requirements, effects }

const { canLearn, reasons } = canLearnSkill(horse, HorseSkill.ENDURANCE);

const synergies = getActiveSynergies(horse.training.trainedSkills);
// Returns: [{ skills, name, description, bonus }, ...]

const session = simulateTrainingSession(horse, HorseSkill.RACING_FORM);
// { skill, progressGain, bondGain, staminaCost, message }
```

---

## Common Integration Patterns

### Character Creates First Horse
```typescript
// In character creation or tutorial
const horse = await purchaseHorse(
  characterId,
  startingLocationId,
  {
    breed: HorseBreed.MORGAN, // Beginner-friendly
    name: characterName + "'s Horse"
  }
);

await setActiveHorse(characterId, horse._id);
```

### Daily Maintenance (Cron Job)
```typescript
// Run daily
async function dailyHorseMaintenance() {
  // Check for births
  const newborns = await checkPregnancies();

  // Update all horse conditions
  const allCharacters = await Character.find();
  for (const char of allCharacters) {
    await updateAllHorseConditions(char._id);
  }

  // Process stable upkeep
  const stables = await Stable.find();
  for (const stable of stables) {
    // Charge upkeep or apply penalties
  }
}
```

### Travel System Integration
```typescript
// When character travels
const activeHorse = await Horse.findOne({
  ownerId: characterId,
  isActive: true
});

if (activeHorse) {
  // Calculate speed bonus
  const speedBonus = activeHorse.derivedStats.travelSpeedBonus;
  const bondBonus = activeHorse.bond.level / 5; // 0-20% bonus
  const totalSpeedBonus = speedBonus + bondBonus;

  // Apply to travel time
  travelTime = baseTravelTime * (1 - totalSpeedBonus / 100);

  // Record travel
  await recordTravel(activeHorse._id, distanceInMiles);
}
```

### Combat System Integration
```typescript
// At combat start
const activeHorse = await Horse.findOne({
  ownerId: characterId,
  isActive: true
});

if (activeHorse) {
  const bonuses = getMountedCombatBonus(activeHorse);

  // Apply bonuses to character
  character.combatStats.attack += bonuses.attackBonus;
  character.combatStats.defense += bonuses.defenseBonus;
  character.initiative += bonuses.initiativeBonus;

  // Check if horse flees
  if (Math.random() * 100 < bonuses.fleeChance) {
    // Horse fled! Character fights on foot
    character.isMounted = false;
  }
}

// After combat
if (activeHorse && character.isMounted) {
  const damageTaken = calculateHorseDamage();
  await recordCombat(activeHorse._id, victory, damageTaken);
}
```

### Shop Integration
```typescript
// Horse shop
router.get('/api/horses/shop', async (req, res) => {
  const { reputation } = req.character;

  const availableBreeds = getBreedsByReputationRequired(reputation)
    .filter(b => b.shopAvailable);

  const equipment = getShopEquipment();

  res.json({ breeds: availableBreeds, equipment });
});

// Purchase horse
router.post('/api/horses/purchase', async (req, res) => {
  const { breed, name } = req.body;
  const breedDef = getBreedDefinition(breed);

  // Check gold
  if (req.character.gold < breedDef.basePrice) {
    return res.status(400).json({ error: 'Insufficient gold' });
  }

  // Purchase
  const horse = await purchaseHorse(
    req.character._id,
    req.character.location,
    { breed, name }
  );

  // Deduct gold
  req.character.gold -= breedDef.basePrice;
  await req.character.save();

  res.json({ horse });
});
```

### Wild Encounter Integration
```typescript
// Random wilderness encounter
if (Math.random() < 0.05) { // 5% chance
  const wildBreeds = getWildEncounterBreeds();
  const encounterBreed = wildBreeds[Math.floor(Math.random() * wildBreeds.length)];

  // Taming minigame
  const tamingSuccess = await playTamingMinigame(character, encounterBreed);

  if (tamingSuccess) {
    const horse = await tameWildHorse(
      character._id,
      character.location,
      encounterBreed.breed,
      "Wild " + encounterBreed.name,
      true
    );

    // Notify player
    return {
      type: 'wild_horse_tamed',
      horse,
      message: `You successfully tamed a wild ${encounterBreed.name}!`
    };
  } else {
    return {
      type: 'taming_failed',
      message: 'The wild horse escaped...'
    };
  }
}
```

---

## Testing Helpers

### Create Test Horses
```typescript
// Create a horse with specific stats for testing
async function createTestHorse(
  ownerId: ObjectId,
  overrides: Partial<Horse> = {}
) {
  const horse = new Horse({
    ownerId,
    name: 'Test Horse',
    breed: HorseBreed.QUARTER_HORSE,
    gender: HorseGender.STALLION,
    age: 5,
    color: HorseColor.BAY,
    stats: {
      speed: 70,
      stamina: 70,
      health: 70,
      bravery: 70,
      temperament: 70
    },
    ...overrides
  });

  await horse.save();
  return horse;
}

// Create bonded horse
const bondedHorse = await createTestHorse(characterId, {
  bond: { level: 95, trust: 95, loyalty: true, lastInteraction: new Date() },
  training: {
    trainedSkills: [
      HorseSkill.WAR_HORSE,
      HorseSkill.ENDURANCE,
      HorseSkill.SPEED_BURST
    ],
    maxSkills: 6,
    trainingProgress: new Map()
  }
});
```

---

## Common Gotchas

1. **Always check horse ownership** before operations
   ```typescript
   const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
   if (!horse) throw new Error('Horse not found');
   ```

2. **Update condition before checking status**
   ```typescript
   horse.updateCondition();
   if (horse.condition.hunger < 20) {
     // Horse is starving!
   }
   ```

3. **Bond decay runs automatically** - don't forget to check timestamps

4. **Equipment bonuses** need to be recalculated when equipment changes

5. **Breeding requires both horses to be owned** by same character

6. **Stamina can go to 0** - check before racing or combat

7. **Legendary horses can't be purchased** - only found via special encounters

---

## Performance Notes

- Use `.lean()` for read-only operations
- Populate selectively (horses can have many foals)
- Index queries on `ownerId`, `breed`, `bond.level`
- Batch condition updates for multiple horses
- Cache breed definitions (they're static)

---

## Error Handling

```typescript
try {
  const horse = await purchaseHorse(characterId, locationId, request);
} catch (error) {
  if (error.message === 'This breed cannot be purchased') {
    // Handle wild-only breed
  } else if (error.message.includes('not found')) {
    // Handle missing horse
  } else {
    // Generic error
  }
}
```

Common errors:
- "Horse not found"
- "This breed cannot be purchased"
- "Horse cannot breed at this time"
- "Stable is at capacity"
- "Horse is too tired to race"
- "Horse already knows this skill"
