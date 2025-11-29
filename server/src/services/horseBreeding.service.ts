import { ObjectId } from 'mongodb';
import { Horse, HorseDocument } from '../models/Horse.model';
import {
  HorseBreed,
  HorseGender,
  HorseBreedingResult,
  BreedingResponse,
  BreedHorsesRequest,
  BreedingGenetics
} from '@desperados/shared';
import { HORSE_BREEDS, selectRandomColor } from '../data/horseBreeds';

// ============================================================================
// CONSTANTS
// ============================================================================

const GESTATION_PERIOD_DAYS = 330; // ~11 months
const BREEDING_COOLDOWN_DAYS = 365; // 1 year between pregnancies
const EXCEPTIONAL_FOAL_CHANCE = 0.05; // 5% chance for exceptional traits
const MUTATION_CHANCE = 0.10; // 10% chance for minor stat mutation

// ============================================================================
// BREEDING MECHANICS
// ============================================================================

export async function breedHorses(
  characterId: ObjectId,
  request: BreedHorsesRequest
): Promise<BreedingResponse> {
  const { stallionId, mareId } = request;

  // Fetch both horses
  const stallion = await Horse.findOne({ _id: stallionId, ownerId: characterId });
  const mare = await Horse.findOne({ _id: mareId, ownerId: characterId });

  if (!stallion || !mare) {
    throw new Error('One or both horses not found');
  }

  // Validate genders
  if (stallion.gender !== HorseGender.STALLION) {
    throw new Error('First horse must be a stallion');
  }
  if (mare.gender !== HorseGender.MARE) {
    throw new Error('Second horse must be a mare');
  }

  // Validate breeding eligibility
  if (!stallion.canBreed) {
    throw new Error('Stallion cannot breed at this time');
  }
  if (!mare.canBreed) {
    throw new Error('Mare cannot breed at this time');
  }

  // Calculate breeding success chance
  const successChance = calculateBreedingSuccess(stallion, mare);
  const success = Math.random() < successChance;

  if (!success) {
    return {
      result: {
        success: false,
        message: 'Breeding attempt was unsuccessful. The horses were not compatible at this time.'
      },
      mare: mare.toObject() as any
    };
  }

  // Generate foal genetics
  const genetics = generateFoalGenetics(stallion, mare);
  const dueDate = new Date(Date.now() + GESTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // Update mare
  mare.breeding = mare.breeding || {
    foals: [],
    isPregnant: true,
    pregnantBy: stallion._id as any,
    dueDate
  };
  mare.breeding.isPregnant = true;
  mare.breeding.pregnantBy = stallion._id as any;
  mare.breeding.dueDate = dueDate;

  await mare.save();

  // Set breeding cooldowns
  const cooldownDate = new Date(Date.now() + BREEDING_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  stallion.breeding = stallion.breeding || { foals: [] };
  stallion.breeding.breedingCooldown = cooldownDate;
  await stallion.save();

  // Determine foal breed (can inherit from either parent)
  const foalBreed = Math.random() < 0.5 ? stallion.breed : mare.breed;

  // Determine gender
  const foalGender = Math.random() < 0.5 ? HorseGender.STALLION : HorseGender.MARE;

  // Determine color
  const foalColor = selectRandomColor(foalBreed);

  // Check for exceptional traits
  const isExceptional = Math.random() < EXCEPTIONAL_FOAL_CHANCE;
  const specialTrait = isExceptional ? generateSpecialTrait(genetics) : undefined;

  return {
    result: {
      success: true,
      message: `Success! ${mare.name} is pregnant and will give birth in ${GESTATION_PERIOD_DAYS} days.`,
      foal: {
        breed: foalBreed,
        gender: foalGender,
        color: foalColor,
        predictedStats: genetics.foalStats,
        isExceptional,
        specialTrait
      },
      dueDate
    },
    mare: mare.toObject() as any
  };
}

export async function checkPregnancies(): Promise<HorseDocument[]> {
  const now = new Date();
  const pregnantMares = await Horse.find({
    'breeding.isPregnant': true,
    'breeding.dueDate': { $lte: now }
  });

  const newborns: HorseDocument[] = [];

  for (const mare of pregnantMares) {
    try {
      const foal = await birthFoal(mare);
      if (foal) {
        newborns.push(foal);
      }
    } catch (error) {
      console.error(`Error birthing foal for mare ${mare._id}:`, error);
    }
  }

  return newborns;
}

async function birthFoal(mare: HorseDocument): Promise<HorseDocument | null> {
  if (!mare.breeding?.pregnantBy || !mare.breeding.isPregnant) {
    return null;
  }

  const stallion = await Horse.findById(mare.breeding.pregnantBy);
  if (!stallion) {
    // Stallion no longer exists, but birth still happens
    console.warn(`Stallion ${mare.breeding.pregnantBy} not found for mare ${mare._id}`);
  }

  // Generate foal
  const genetics = stallion
    ? generateFoalGenetics(stallion, mare)
    : generateSoloFoalGenetics(mare);

  const foalBreed = stallion
    ? (Math.random() < 0.5 ? stallion.breed : mare.breed)
    : mare.breed;

  const foalGender = Math.random() < 0.5 ? HorseGender.STALLION : HorseGender.MARE;
  const foalColor = selectRandomColor(foalBreed);
  const isExceptional = Math.random() < EXCEPTIONAL_FOAL_CHANCE;

  const breedDef = HORSE_BREEDS[foalBreed];

  // Create foal
  const foal = new Horse({
    ownerId: mare.ownerId,
    name: `${mare.name}'s Foal`,
    breed: foalBreed,
    gender: foalGender,
    age: 0, // Newborn (will age to 2 before rideable)
    color: foalColor,
    stats: genetics.foalStats,
    derivedStats: {
      carryCapacity: 0, // Can't carry anything yet
      travelSpeedBonus: 0,
      combatBonus: 0
    },
    bond: {
      level: 10, // Born bonded to owner
      trust: 60,
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
      currentHealth: genetics.foalStats.health,
      currentStamina: genetics.foalStats.stamina,
      hunger: 100,
      cleanliness: 100,
      mood: 'excellent'
    },
    breeding: {
      birthDate: new Date(),
      sire: stallion?._id,
      dam: mare._id,
      foals: []
    },
    history: {
      purchasePrice: 0,
      purchaseDate: new Date(),
      acquisitionMethod: 'breed',
      racesWon: 0,
      racesEntered: 0,
      combatVictories: 0,
      combatsEntered: 0,
      distanceTraveled: 0
    },
    currentLocation: mare.currentLocation,
    isActive: false
  });

  // Add exceptional traits
  if (isExceptional) {
    applyExceptionalTraits(foal, genetics);
  }

  await foal.save();

  // Update mare
  mare.breeding.isPregnant = false;
  mare.breeding.pregnantBy = undefined;
  mare.breeding.dueDate = undefined;
  mare.breeding.foals.push(foal._id);
  mare.breeding.breedingCooldown = new Date(
    Date.now() + BREEDING_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  );

  await mare.save();

  // Update stallion if exists
  if (stallion) {
    stallion.breeding = stallion.breeding || { foals: [] };
    stallion.breeding.foals.push(foal._id);
    await stallion.save();
  }

  return foal;
}

// ============================================================================
// GENETICS CALCULATION
// ============================================================================

function calculateBreedingSuccess(stallion: HorseDocument, mare: HorseDocument): number {
  let baseChance = 0.75; // 75% base success rate

  // Health affects breeding
  const stallionHealthPercent = stallion.condition.currentHealth / stallion.stats.health;
  const mareHealthPercent = mare.condition.currentHealth / mare.stats.health;

  baseChance *= (stallionHealthPercent + mareHealthPercent) / 2;

  // Bond level with owner affects breeding (calm horses breed better)
  const avgBond = (stallion.bond.level + mare.bond.level) / 200;
  baseChance *= (0.8 + avgBond * 0.4); // 80-120% modifier

  // Age affects breeding
  if (stallion.age < 5 || stallion.age > 18) {
    baseChance *= 0.8;
  }
  if (mare.age < 4 || mare.age > 16) {
    baseChance *= 0.8;
  }

  // Temperament affects compatibility
  const tempDiff = Math.abs(stallion.stats.temperament - mare.stats.temperament);
  if (tempDiff > 40) {
    baseChance *= 0.9; // Less compatible
  }

  return Math.max(0.2, Math.min(0.95, baseChance));
}

function generateFoalGenetics(
  stallion: HorseDocument,
  mare: HorseDocument
): BreedingGenetics {
  const sireStats = stallion.stats;
  const damStats = mare.stats;

  // Average parent stats with variance
  const foalStats = {
    speed: inheritStat(sireStats.speed, damStats.speed),
    stamina: inheritStat(sireStats.stamina, damStats.stamina),
    health: inheritStat(sireStats.health, damStats.health),
    bravery: inheritStat(sireStats.bravery, damStats.bravery),
    temperament: inheritStat(sireStats.temperament, damStats.temperament)
  };

  // Random inheritance rolls (for display/flavor)
  const inheritanceRolls = [
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random()
  ];

  // Check for exceptional genetics
  const isExceptional =
    Object.values(foalStats).filter(stat => stat >= 85).length >= 3;

  // Mutations
  const mutations: string[] = [];
  if (Math.random() < MUTATION_CHANCE) {
    const mutationStat = ['speed', 'stamina', 'health', 'bravery', 'temperament'][
      Math.floor(Math.random() * 5)
    ] as keyof typeof foalStats;
    const mutationAmount = Math.floor(Math.random() * 11) - 5; // -5 to +5
    foalStats[mutationStat] = Math.max(1, Math.min(100, foalStats[mutationStat] + mutationAmount));

    if (mutationAmount > 0) {
      mutations.push(`Positive ${mutationStat} mutation (+${mutationAmount})`);
    } else if (mutationAmount < 0) {
      mutations.push(`Negative ${mutationStat} mutation (${mutationAmount})`);
    }
  }

  return {
    sireStats,
    damStats,
    inheritanceRolls,
    foalStats,
    isExceptional,
    mutations
  };
}

function generateSoloFoalGenetics(mare: HorseDocument): BreedingGenetics {
  // When sire is unknown/deleted, use mare's stats with more variance
  const damStats = mare.stats;

  const foalStats = {
    speed: inheritStat(damStats.speed, damStats.speed, 20),
    stamina: inheritStat(damStats.stamina, damStats.stamina, 20),
    health: inheritStat(damStats.health, damStats.health, 20),
    bravery: inheritStat(damStats.bravery, damStats.bravery, 20),
    temperament: inheritStat(damStats.temperament, damStats.temperament, 20)
  };

  return {
    sireStats: damStats,
    damStats,
    inheritanceRolls: [0.5, 0.5, 0.5, 0.5, 0.5],
    foalStats,
    isExceptional: false,
    mutations: []
  };
}

function inheritStat(sireValue: number, damValue: number, variance: number = 15): number {
  const average = (sireValue + damValue) / 2;
  const variation = (Math.random() * variance * 2) - variance; // -variance to +variance
  const result = Math.round(average + variation);
  return Math.max(1, Math.min(100, result));
}

// ============================================================================
// EXCEPTIONAL TRAITS
// ============================================================================

function generateSpecialTrait(genetics: BreedingGenetics): string {
  const traits = [
    'Champion Bloodline: +5% in all races',
    'Natural Warrior: +10% combat effectiveness',
    'Iron Constitution: +20 max health',
    'Boundless Energy: +15% stamina regeneration',
    'Swift as Wind: +10% travel speed',
    'Fearless Heart: Never affected by intimidation',
    'Quick Learner: Training time reduced by 25%',
    'Hardy: Immune to minor injuries',
    'Elegant Gait: Rider charisma +15',
    'Eagle Eyes: Enhanced perception and awareness'
  ];

  // Weight towards traits matching high stats
  if (genetics.foalStats.speed >= 85) return traits[4]; // Swift as Wind
  if (genetics.foalStats.stamina >= 85) return traits[3]; // Boundless Energy
  if (genetics.foalStats.health >= 85) return traits[2]; // Iron Constitution
  if (genetics.foalStats.bravery >= 85) return traits[5]; // Fearless Heart

  return traits[Math.floor(Math.random() * traits.length)];
}

function applyExceptionalTraits(foal: HorseDocument, genetics: BreedingGenetics): void {
  // Exceptional foals get slight stat boost
  foal.stats.speed = Math.min(100, foal.stats.speed + 3);
  foal.stats.stamina = Math.min(100, foal.stats.stamina + 3);
  foal.stats.health = Math.min(100, foal.stats.health + 3);

  // Increase max skills
  foal.training.maxSkills = Math.min(8, foal.training.maxSkills + 1);
}

// ============================================================================
// BREEDING HISTORY
// ============================================================================

export async function getBreedingLineage(horseId: ObjectId): Promise<{
  horse: HorseDocument;
  sire?: HorseDocument;
  dam?: HorseDocument;
  foals: HorseDocument[];
  grandparents?: {
    paternalGrandSire?: HorseDocument;
    paternalGrandDam?: HorseDocument;
    maternalGrandSire?: HorseDocument;
    maternalGrandDam?: HorseDocument;
  };
}> {
  const horse = await Horse.findById(horseId);
  if (!horse) {
    throw new Error('Horse not found');
  }

  let sire: HorseDocument | undefined;
  let dam: HorseDocument | undefined;
  const foals: HorseDocument[] = [];

  if (horse.breeding?.sire) {
    sire = (await Horse.findById(horse.breeding.sire)) || undefined;
  }

  if (horse.breeding?.dam) {
    dam = (await Horse.findById(horse.breeding.dam)) || undefined;
  }

  if (horse.breeding?.foals && horse.breeding.foals.length > 0) {
    const foalDocs = await Horse.find({ _id: { $in: horse.breeding.foals } });
    foals.push(...foalDocs);
  }

  // Get grandparents
  let grandparents;
  if (sire || dam) {
    grandparents = {
      paternalGrandSire: sire?.breeding?.sire
        ? ((await Horse.findById(sire.breeding.sire)) || undefined)
        : undefined,
      paternalGrandDam: sire?.breeding?.dam
        ? ((await Horse.findById(sire.breeding.dam)) || undefined)
        : undefined,
      maternalGrandSire: dam?.breeding?.sire
        ? ((await Horse.findById(dam.breeding.sire)) || undefined)
        : undefined,
      maternalGrandDam: dam?.breeding?.dam
        ? ((await Horse.findById(dam.breeding.dam)) || undefined)
        : undefined
    };
  }

  return {
    horse,
    sire,
    dam,
    foals,
    grandparents
  };
}

// ============================================================================
// BREEDING RECOMMENDATIONS
// ============================================================================

export async function getBreedingRecommendations(
  characterId: ObjectId,
  horseId: ObjectId
): Promise<{
  targetHorse: HorseDocument;
  bestMatches: Array<{
    horse: HorseDocument;
    compatibilityScore: number;
    predictedStats: BreedingGenetics['foalStats'];
    reasons: string[];
  }>;
}> {
  const targetHorse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!targetHorse) {
    throw new Error('Horse not found');
  }

  if (!targetHorse.canBreed) {
    throw new Error('This horse cannot breed at this time');
  }

  // Find compatible horses (opposite gender, can breed)
  const requiredGender =
    targetHorse.gender === HorseGender.STALLION ? HorseGender.MARE : HorseGender.STALLION;

  const candidates = await Horse.find({
    ownerId: characterId,
    gender: requiredGender,
    age: { $gte: 3, $lte: 20 },
    'breeding.isPregnant': { $ne: true },
    $or: [
      { 'breeding.breedingCooldown': { $exists: false } },
      { 'breeding.breedingCooldown': { $lte: new Date() } }
    ]
  });

  const matches = candidates.map(candidate => {
    const genetics =
      targetHorse.gender === HorseGender.STALLION
        ? generateFoalGenetics(targetHorse, candidate)
        : generateFoalGenetics(candidate, targetHorse);

    const compatibility = calculateBreedingSuccess(
      targetHorse.gender === HorseGender.STALLION ? targetHorse : candidate,
      targetHorse.gender === HorseGender.MARE ? targetHorse : candidate
    );

    const reasons: string[] = [];

    // Analyze predicted foal
    const avgStat =
      Object.values(genetics.foalStats).reduce((a, b) => a + b, 0) / 5;

    if (avgStat >= 75) {
      reasons.push('Excellent predicted stats');
    } else if (avgStat >= 60) {
      reasons.push('Good predicted stats');
    }

    if (genetics.foalStats.speed >= 80) {
      reasons.push('High speed offspring');
    }
    if (genetics.foalStats.stamina >= 80) {
      reasons.push('High stamina offspring');
    }

    if (compatibility >= 0.85) {
      reasons.push('Highly compatible pair');
    }

    if (candidate.breed === targetHorse.breed) {
      reasons.push('Pure breed offspring');
    } else {
      reasons.push('Crossbreed (varied traits)');
    }

    return {
      horse: candidate,
      compatibilityScore: compatibility,
      predictedStats: genetics.foalStats,
      reasons
    };
  });

  // Sort by compatibility and predicted stats
  matches.sort((a, b) => {
    const aScore = a.compatibilityScore * 0.5 +
      Object.values(a.predictedStats).reduce((sum, stat) => sum + stat, 0) / 500;
    const bScore = b.compatibilityScore * 0.5 +
      Object.values(b.predictedStats).reduce((sum, stat) => sum + stat, 0) / 500;
    return bScore - aScore;
  });

  return {
    targetHorse,
    bestMatches: matches.slice(0, 5) // Top 5 recommendations
  };
}
