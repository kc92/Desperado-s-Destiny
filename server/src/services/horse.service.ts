import { ObjectId } from 'mongodb';
import { Horse, HorseDocument } from '../models/Horse.model';
import {
  HorseBreed,
  HorseGender,
  HorseSkill,
  HorseResponse,
  HorseListResponse,
  PurchaseHorseRequest,
  RenameHorseRequest,
  FeedHorseRequest,
  GroomHorseRequest,
  TrainHorseRequest,
  HorseCareNeeds,
  MountedCombatBonus
} from '@desperados/shared';
import {
  HORSE_BREEDS,
  generateHorseStats,
  selectRandomColor
} from '../data/horseBreeds';
import { HORSE_FOOD } from '../data/horseEquipment';

// ============================================================================
// HORSE PURCHASE & CREATION
// ============================================================================

export async function purchaseHorse(
  characterId: ObjectId,
  locationId: ObjectId,
  request: PurchaseHorseRequest
): Promise<HorseDocument> {
  const { breed, gender, name } = request;

  // Validate breed is available for purchase
  const breedDef = HORSE_BREEDS[breed];
  if (!breedDef.shopAvailable) {
    throw new Error('This breed cannot be purchased');
  }

  // Generate stats
  const stats = generateHorseStats(breed);
  const color = selectRandomColor(breed);

  // Determine age (purchased horses are typically 3-8 years old)
  const age = Math.floor(Math.random() * 6) + 3;

  // Select gender if not specified
  const horseGender = gender || randomGender();

  // Create horse
  const horse = new Horse({
    ownerId: characterId,
    name,
    breed,
    gender: horseGender,
    age,
    color,
    stats,
    derivedStats: calculateDerivedStats(stats, breed),
    bond: {
      level: 0,
      trust: 50,
      loyalty: false,
      lastInteraction: new Date()
    },
    training: {
      trainedSkills: [],
      maxSkills: breedDef.maxSkills,
      trainingProgress: new Map()
    },
    equipment: {
      saddle: undefined,
      saddlebags: undefined,
      horseshoes: undefined,
      barding: undefined
    },
    condition: {
      currentHealth: stats.health,
      currentStamina: stats.stamina,
      hunger: 100,
      cleanliness: 80,
      mood: 'good'
    },
    history: {
      purchasePrice: breedDef.basePrice,
      purchaseDate: new Date(),
      acquisitionMethod: 'purchase',
      racesWon: 0,
      racesEntered: 0,
      combatVictories: 0,
      combatsEntered: 0,
      distanceTraveled: 0
    },
    currentLocation: locationId,
    isActive: false
  });

  await horse.save();
  return horse;
}

export async function tameWildHorse(
  characterId: ObjectId,
  locationId: ObjectId,
  breed: HorseBreed,
  name: string,
  tamingSuccess: boolean
): Promise<HorseDocument | null> {
  if (!tamingSuccess) {
    return null;
  }

  const breedDef = HORSE_BREEDS[breed];
  if (!breedDef.wildEncounter) {
    throw new Error('This breed cannot be tamed from the wild');
  }

  // Wild horses have slightly better stats but lower temperament
  const stats = generateHorseStats(breed);
  stats.stamina = Math.min(100, stats.stamina + 5);
  stats.temperament = Math.max(20, stats.temperament - 10);

  const color = selectRandomColor(breed);
  const age = Math.floor(Math.random() * 8) + 2; // 2-10 years
  const gender = randomGender();

  const horse = new Horse({
    ownerId: characterId,
    name,
    breed,
    gender,
    age,
    color,
    stats,
    derivedStats: calculateDerivedStats(stats, breed),
    bond: {
      level: 5, // Slight bond from taming
      trust: 30, // Low trust initially
      loyalty: false,
      lastInteraction: new Date()
    },
    training: {
      trainedSkills: [],
      maxSkills: breedDef.maxSkills,
      trainingProgress: new Map()
    },
    equipment: {},
    condition: {
      currentHealth: stats.health,
      currentStamina: stats.stamina,
      hunger: 70,
      cleanliness: 50,
      mood: 'fair'
    },
    history: {
      purchasePrice: 0,
      purchaseDate: new Date(),
      acquisitionMethod: 'tame',
      racesWon: 0,
      racesEntered: 0,
      combatVictories: 0,
      combatsEntered: 0,
      distanceTraveled: 0
    },
    currentLocation: locationId,
    isActive: false
  });

  await horse.save();
  return horse;
}

// ============================================================================
// HORSE MANAGEMENT
// ============================================================================

export async function getHorsesByOwner(characterId: ObjectId): Promise<HorseListResponse> {
  const horses = await Horse.find({ ownerId: characterId })
    .sort({ isActive: -1, 'bond.level': -1 })
    .exec();

  const horseResponses = horses.map(horse => formatHorseResponse(horse));
  const activeHorse = horses.find(h => h.isActive);

  return {
    horses: horseResponses,
    totalCount: horses.length,
    activeHorse: activeHorse?._id as any
  };
}

export async function getHorseById(horseId: ObjectId): Promise<HorseDocument | null> {
  return await Horse.findById(horseId).exec();
}

export async function setActiveHorse(
  characterId: ObjectId,
  horseId: ObjectId
): Promise<HorseDocument> {
  // Deactivate all horses
  await Horse.updateMany({ ownerId: characterId }, { isActive: false });

  // Activate selected horse
  const horse = await Horse.findOneAndUpdate(
    { _id: horseId, ownerId: characterId },
    { isActive: true },
    { new: true }
  );

  if (!horse) {
    throw new Error('Horse not found');
  }

  return horse;
}

export async function renameHorse(
  characterId: ObjectId,
  request: RenameHorseRequest
): Promise<HorseDocument> {
  const { horseId, newName } = request;

  const horse = await Horse.findOneAndUpdate(
    { _id: horseId, ownerId: characterId },
    { name: newName },
    { new: true }
  );

  if (!horse) {
    throw new Error('Horse not found');
  }

  return horse;
}

// ============================================================================
// HORSE CARE
// ============================================================================

export async function feedHorse(
  characterId: ObjectId,
  request: FeedHorseRequest
): Promise<HorseDocument> {
  const { horseId, foodQuality } = request;

  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  // Get food definition
  const foodOptions = HORSE_FOOD.filter(f => f.quality === foodQuality);
  if (foodOptions.length === 0) {
    throw new Error('Invalid food quality');
  }

  // Use first option of that quality (could be expanded to let player choose)
  const food = foodOptions[0];

  // Apply food effects
  horse.feed(food.hungerRestored, food.bondBonus);

  if (food.staminaBonus) {
    horse.condition.currentStamina = Math.min(
      horse.stats.stamina,
      horse.condition.currentStamina + food.staminaBonus
    );
  }

  if (food.healthBonus) {
    horse.condition.currentHealth = Math.min(
      horse.stats.health,
      horse.condition.currentHealth + food.healthBonus
    );
  }

  await horse.save();
  return horse;
}

export async function groomHorse(
  characterId: ObjectId,
  request: GroomHorseRequest
): Promise<HorseDocument> {
  const { horseId } = request;

  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  horse.groom();
  await horse.save();

  return horse;
}

export async function restHorse(
  characterId: ObjectId,
  horseId: ObjectId,
  hours: number
): Promise<HorseDocument> {
  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  horse.rest(hours);
  await horse.save();

  return horse;
}

export async function healHorse(
  characterId: ObjectId,
  horseId: ObjectId,
  healthRestored: number
): Promise<HorseDocument> {
  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  horse.condition.currentHealth = Math.min(
    horse.stats.health,
    horse.condition.currentHealth + healthRestored
  );

  await horse.save();
  return horse;
}

// ============================================================================
// TRAINING
// ============================================================================

export async function trainHorseSkill(
  characterId: ObjectId,
  request: TrainHorseRequest
): Promise<{ horse: HorseDocument; progress: number; completed: boolean }> {
  const { horseId, skill } = request;

  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  // Check if already knows skill
  if (horse.training.trainedSkills.includes(skill)) {
    throw new Error('Horse already knows this skill');
  }

  // Check if at max skills
  if (
    horse.training.trainedSkills.length >= horse.training.maxSkills &&
    !horse.training.trainingProgress.has(skill)
  ) {
    throw new Error('Horse has learned maximum number of skills');
  }

  // Train the skill (each session adds 10-20 progress)
  const progressGain = Math.floor(Math.random() * 11) + 10;
  horse.train(skill, progressGain);

  const currentProgress = horse.training.trainingProgress.get(skill) || 0;
  const completed = horse.training.trainedSkills.includes(skill);

  await horse.save();

  return {
    horse,
    progress: completed ? 100 : currentProgress,
    completed
  };
}

// ============================================================================
// CONDITION UPDATES
// ============================================================================

export async function updateHorseCondition(horseId: ObjectId): Promise<HorseDocument> {
  const horse = await Horse.findById(horseId);
  if (!horse) {
    throw new Error('Horse not found');
  }

  horse.updateCondition();
  await horse.save();

  return horse;
}

export async function updateAllHorseConditions(characterId: ObjectId): Promise<void> {
  const horses = await Horse.find({ ownerId: characterId });

  for (const horse of horses) {
    horse.updateCondition();
    await horse.save();
  }
}

export function assessCareNeeds(horse: HorseDocument): HorseCareNeeds {
  const needs: HorseCareNeeds = {
    needsFeeding: horse.condition.hunger < 50,
    needsGrooming: horse.condition.cleanliness < 50,
    needsVet: horse.condition.currentHealth < horse.stats.health * 0.7,
    needsRest: horse.condition.currentStamina < horse.stats.stamina * 0.5,
    urgencyLevel: 'none',
    warnings: []
  };

  // Determine urgency
  if (
    horse.condition.hunger < 20 ||
    horse.condition.currentHealth < horse.stats.health * 0.3
  ) {
    needs.urgencyLevel = 'critical';
    if (horse.condition.hunger < 20) {
      needs.warnings.push('Horse is starving!');
    }
    if (horse.condition.currentHealth < horse.stats.health * 0.3) {
      needs.warnings.push('Horse is critically injured!');
    }
  } else if (
    horse.condition.hunger < 40 ||
    horse.condition.cleanliness < 30 ||
    horse.condition.currentHealth < horse.stats.health * 0.5
  ) {
    needs.urgencyLevel = 'high';
  } else if (needs.needsFeeding || needs.needsGrooming || needs.needsVet || needs.needsRest) {
    needs.urgencyLevel = 'medium';
  } else if (
    horse.condition.hunger < 80 ||
    horse.condition.cleanliness < 70
  ) {
    needs.urgencyLevel = 'low';
  }

  return needs;
}

// ============================================================================
// COMBAT & TRAVEL
// ============================================================================

export function getMountedCombatBonus(horse: HorseDocument): MountedCombatBonus {
  const breedDef = HORSE_BREEDS[horse.breed];

  // Base bonuses from horse stats
  let attackBonus = Math.floor(horse.stats.speed / 10);
  let defenseBonus = Math.floor(horse.stats.health / 10);
  let initiativeBonus = Math.floor(horse.stats.speed / 5);
  let intimidationBonus = Math.floor(horse.stats.bravery / 10);

  // Bond level provides additional bonuses
  const bondMultiplier = 1 + (horse.bond.level / 100);
  attackBonus = Math.floor(attackBonus * bondMultiplier);
  defenseBonus = Math.floor(defenseBonus * bondMultiplier);

  // Equipment bonuses
  const combatBonus = horse.derivedStats.combatBonus;
  attackBonus += combatBonus;
  defenseBonus += combatBonus;

  // Flee chance (lower is better)
  let fleeChance = 0;
  if (horse.bond.loyalty) {
    fleeChance = 0; // Bonded horses never flee
  } else {
    fleeChance = Math.max(0, 50 - horse.stats.bravery - horse.bond.level / 2);
  }

  return {
    attackBonus,
    defenseBonus,
    initiativeBonus,
    intimidationBonus,
    fleeChance
  };
}

export async function recordCombat(
  horseId: ObjectId,
  victory: boolean,
  damage: number
): Promise<void> {
  const horse = await Horse.findById(horseId);
  if (!horse) return;

  horse.history.combatsEntered += 1;
  if (victory) {
    horse.history.combatVictories += 1;
    horse.bond.level = Math.min(100, horse.bond.level + 3);
  }

  // Apply damage
  horse.condition.currentHealth = Math.max(0, horse.condition.currentHealth - damage);

  // Stamina cost from combat
  horse.condition.currentStamina = Math.max(
    0,
    horse.condition.currentStamina - Math.floor(horse.stats.stamina * 0.2)
  );

  await horse.save();
}

export async function recordTravel(
  horseId: ObjectId,
  miles: number
): Promise<void> {
  const horse = await Horse.findById(horseId);
  if (!horse) return;

  horse.history.distanceTraveled += miles;

  // Stamina cost from travel
  const staminaCost = Math.floor(miles * 2);
  horse.condition.currentStamina = Math.max(0, horse.condition.currentStamina - staminaCost);

  // Hunger increases with travel
  horse.condition.hunger = Math.max(0, horse.condition.hunger - Math.floor(miles / 2));

  // Bond increases slightly with travel
  horse.bond.level = Math.min(100, horse.bond.level + 1);
  horse.bond.lastInteraction = new Date();

  await horse.save();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateDerivedStats(
  stats: HorseDocument['stats'],
  breed: HorseBreed
): HorseDocument['derivedStats'] {
  const breedDef = HORSE_BREEDS[breed];

  let carryCapacity = 50; // Base capacity
  let travelSpeedBonus = 0;
  let combatBonus = 0;

  // Breed-specific bonuses
  if (breed === HorseBreed.PERCHERON) {
    carryCapacity = 150;
  } else if (breed === HorseBreed.ARABIAN || breed === HorseBreed.AKHAL_TEKE) {
    travelSpeedBonus = 10;
  } else if (breed === HorseBreed.ANDALUSIAN || breed === HorseBreed.FRIESIAN) {
    combatBonus = 15;
  }

  // Stats influence derived stats
  carryCapacity += Math.floor(stats.health / 5);
  travelSpeedBonus += Math.floor(stats.speed / 10);
  combatBonus += Math.floor(stats.bravery / 10);

  return {
    carryCapacity,
    travelSpeedBonus,
    combatBonus
  };
}

function randomGender(): HorseGender {
  const rand = Math.random();
  if (rand < 0.45) return HorseGender.STALLION;
  if (rand < 0.90) return HorseGender.MARE;
  return HorseGender.GELDING;
}

function formatHorseResponse(horse: HorseDocument): HorseResponse {
  return {
    horse: horse.toObject(),
    bondLevelName: horse.bondLevelName as any,
    canBreed: horse.canBreed,
    canTrain: horse.training.trainedSkills.length < horse.training.maxSkills,
    needsCare: horse.needsCare
  };
}

// ============================================================================
// AGING & MAINTENANCE
// ============================================================================

export async function ageHorse(horseId: ObjectId): Promise<void> {
  const horse = await Horse.findById(horseId);
  if (!horse) return;

  (horse as any).age();
  await horse.save();
}

export async function ageAllHorses(): Promise<void> {
  const horses = await Horse.find();

  for (const horse of horses) {
    (horse as any).age();
    await horse.save();
  }
}
