import { ObjectId } from 'mongodb';
import { Horse, HorseDocument } from '../models/Horse.model';
import {
  HorseRace,
  HorseShow,
  RaceResultResponse,
  ShowResultResponse,
  HorseSkill
} from '@desperados/shared';
import { getBondLevel, calculateBondMultiplier } from './horseBond.service';
import { SecureRNG } from './base/SecureRNG';

// ============================================================================
// RACING SYSTEM
// ============================================================================

export async function enterRace(
  characterId: ObjectId,
  horseId: ObjectId,
  raceId: ObjectId
): Promise<HorseRace> {
  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  // Validate horse is in good condition
  if (horse.condition.currentStamina < horse.stats.stamina * 0.7) {
    throw new Error('Horse is too tired to race');
  }

  if (horse.condition.currentHealth < horse.stats.health * 0.8) {
    throw new Error('Horse is injured and cannot race');
  }

  // In a real implementation, this would fetch from a Race model
  // For now, we'll return a mock race structure
  const race: any = { // TODO: Fix HorseRace type to match actual schema
    _id: raceId,
    name: 'Desert Sprint',
    // location removed - not in HorseRace interface
    distance: 1.5,
    entryFee: 50,
    prizePool: 500,
    requirements: {},
    participants: [
      {
        characterId,
        horseId,
        odds: 0
      }
    ],
    status: 'upcoming',
    startTime: new Date(Date.now() + 3600000), // 1 hour from now
    createdAt: new Date()
  };

  return race;
}

export async function simulateRace(
  raceId: ObjectId,
  participants: Array<{ characterId: ObjectId; horseId: ObjectId }>
): Promise<RaceResultResponse[]> {
  // Fetch all participating horses
  const horseIds = participants.map(p => p.horseId);
  const horses = await Horse.find({ _id: { $in: horseIds } });

  if (horses.length !== participants.length) {
    throw new Error('Some horses not found');
  }

  // Calculate race scores for each horse
  const raceResults = horses.map(horse => {
    const score = calculateRaceScore(horse);
    return {
      horse,
      score,
      finishTime: calculateFinishTime(horse, 1.5) // 1.5 mile race
    };
  });

  // Sort by score (higher is better)
  raceResults.sort((a, b) => b.score - a.score);

  // Assign positions and prizes
  const prizeDistribution = [0.5, 0.3, 0.2]; // 1st, 2nd, 3rd
  const totalPrize = 500;

  const results: RaceResultResponse[] = raceResults.map((result, index) => {
    const position = index + 1;
    const prizePercentage = prizeDistribution[index] || 0;
    const prizeWon = Math.floor(totalPrize * prizePercentage);
    const experienceGained = Math.max(10, 30 - position * 5);

    // Update horse stats
    result.horse.history.racesEntered += 1;
    if (position === 1) {
      result.horse.history.racesWon += 1;
      result.horse.bond.level = Math.min(100, result.horse.bond.level + 5);
    }

    // Stamina cost
    result.horse.condition.currentStamina = Math.max(
      0,
      result.horse.condition.currentStamina - Math.floor(result.horse.stats.stamina * 0.3)
    );

    result.horse.save();

    return {
      race: {
        _id: raceId,
        name: 'Desert Sprint',
        // location removed - not in HorseRace interface
        distance: 1.5,
        entryFee: 50,
        prizePool: totalPrize,
        requirements: {},
        participants: [],
        status: 'completed',
        startTime: new Date(),
        completedAt: new Date(),
        createdAt: new Date()
      },
      yourPosition: position,
      prizeWon,
      experienceGained
    } as any; // TODO: Fix return type to match actual schema
  });

  return results;
}

function calculateRaceScore(horse: HorseDocument): number {
  let score = 0;

  // Speed is primary factor (40%)
  score += horse.stats.speed * 4;

  // Stamina matters for longer races (30%)
  score += horse.stats.stamina * 3;

  // Current condition affects performance (20%)
  const healthPercent = horse.condition.currentHealth / horse.stats.health;
  const staminaPercent = horse.condition.currentStamina / horse.stats.stamina;
  score += (healthPercent + staminaPercent) / 2 * 200;

  // Equipment bonuses (applied before multipliers so they benefit from bonuses)
  score += horse.derivedStats.travelSpeedBonus * 5;

  // Calculate combined multiplier from all sources, capped at 1.5x total
  // This prevents multiplicative compounding from making trained horses 2x+ better
  const bondMultiplier = calculateBondMultiplier(horse.bond.level);
  let skillMultiplier = 1.0;

  // Racing Form skill: +15% (reduced from 20% to fit within cap)
  if (horse.training.trainedSkills.includes(HorseSkill.RACING_FORM)) {
    skillMultiplier += 0.15;
  }

  // Speed Burst skill: +10%
  if (horse.training.trainedSkills.includes(HorseSkill.SPEED_BURST)) {
    skillMultiplier += 0.10;
  }

  // Combine bond and skill multipliers, cap total bonus at 50% (1.5x max)
  const combinedMultiplier = bondMultiplier * skillMultiplier;
  const cappedMultiplier = Math.min(1.5, combinedMultiplier);
  score *= cappedMultiplier;

  // Add some randomness (±10%)
  const randomFactor = SecureRNG.float(0.9, 1.1, 2);
  score *= randomFactor;

  return Math.round(score);
}

function calculateFinishTime(horse: HorseDocument, distanceMiles: number): number {
  // Calculate time in seconds
  // Average racing horse: ~35-40 mph for short distances
  const baseSpeed = 30 + (horse.stats.speed / 100 * 20); // 30-50 mph
  const effectiveSpeed = baseSpeed + horse.derivedStats.travelSpeedBonus;

  const timeHours = distanceMiles / effectiveSpeed;
  const timeSeconds = timeHours * 3600;

  // Add randomness
  const variance = timeSeconds * 0.05; // ±5%
  const finalTime = timeSeconds + SecureRNG.range(-variance, variance);

  return Math.round(finalTime);
}

// ============================================================================
// HORSE SHOWS
// ============================================================================

export async function enterShow(
  characterId: ObjectId,
  horseId: ObjectId,
  showId: ObjectId
): Promise<HorseShow> {
  const horse = await Horse.findOne({ _id: horseId, ownerId: characterId });
  if (!horse) {
    throw new Error('Horse not found');
  }

  // Validate horse condition
  if (horse.condition.cleanliness < 70) {
    throw new Error('Horse must be well-groomed for shows');
  }

  if (horse.condition.hunger < 60) {
    throw new Error('Horse must be well-fed for shows');
  }

  const show: any = { // TODO: Fix HorseShow type
    _id: showId,
    name: 'Western Heritage Show',
    type: 'beauty',
    // location removed - not in HorseShow interface
    entryFee: 25,
    prizes: {
      first: 200,
      second: 100,
      third: 50
    },
    requirements: {},
    participants: [
      {
        characterId,
        horseId
      }
    ],
    status: 'upcoming',
    showTime: new Date(Date.now() + 7200000), // 2 hours from now
    createdAt: new Date()
  };

  return show;
}

export async function simulateShow(
  showId: ObjectId,
  showType: 'beauty' | 'skill' | 'obedience',
  participants: Array<{ characterId: ObjectId; horseId: ObjectId }>
): Promise<ShowResultResponse[]> {
  const horseIds = participants.map(p => p.horseId);
  const horses = await Horse.find({ _id: { $in: horseIds } });

  if (horses.length !== participants.length) {
    throw new Error('Some horses not found');
  }

  // Calculate show scores
  const showResults = horses.map(horse => {
    const score = calculateShowScore(horse, showType);
    return { horse, score };
  });

  // Sort by score
  showResults.sort((a, b) => b.score - a.score);

  // Assign prizes
  const prizes = [200, 100, 50];

  const results: ShowResultResponse[] = showResults.map((result, index) => {
    const rank = index + 1;
    const prizeWon = prizes[index] || 0;
    const bondGained = rank === 1 ? 8 : rank === 2 ? 5 : rank === 3 ? 3 : 1;

    // Update horse
    result.horse.bond.level = Math.min(100, result.horse.bond.level + bondGained);
    result.horse.save();

    return {
      show: {
        _id: showId,
        name: 'Western Heritage Show',
        type: showType,
        // location removed - not in HorseShow interface
        entryFee: 25,
        prizes: { first: 200, second: 100, third: 50 },
        requirements: {},
        participants: [],
        status: 'completed',
        showTime: new Date(),
        completedAt: new Date(),
        createdAt: new Date()
      },
      yourRank: rank,
      prizeWon,
      bondGained
    } as any; // TODO: Fix return type to match actual schema
  });

  return results;
}

function calculateShowScore(
  horse: HorseDocument,
  showType: 'beauty' | 'skill' | 'obedience'
): number {
  let score = 0;

  switch (showType) {
    case 'beauty':
      // Beauty shows judge appearance and presentation
      score += horse.stats.temperament * 2; // Calm horses present better
      score += horse.condition.cleanliness * 3; // Grooming is crucial
      score += horse.stats.health; // Overall health shows in appearance

      // Certain breeds score higher in beauty
      if (
        horse.breed === 'ARABIAN' ||
        horse.breed === 'FRIESIAN' ||
        horse.breed === 'ANDALUSIAN'
      ) {
        score *= 1.3;
      }

      if (horse.breed === 'PAINT_HORSE' || horse.breed === 'APPALOOSA') {
        score *= 1.2; // Distinctive markings
      }
      break;

    case 'skill':
      // Skill shows judge trained abilities
      score += horse.training.trainedSkills.length * 50;

      // Trick Horse skill is valuable here
      if (horse.training.trainedSkills.includes(HorseSkill.TRICK_HORSE)) {
        score += 100;
      }

      score += horse.stats.speed * 1.5;
      score += horse.stats.stamina * 1.5;
      score += horse.bond.level * 2; // Bond affects performance
      break;

    case 'obedience':
      // Obedience shows judge responsiveness and training
      score += horse.stats.temperament * 3;
      score += horse.bond.level * 3;
      score += horse.bond.trust * 2;
      score += horse.training.trainedSkills.length * 30;

      // War Horse skill shows excellent discipline
      if (horse.training.trainedSkills.includes(HorseSkill.WAR_HORSE)) {
        score += 80;
      }
      break;
  }

  // Overall condition matters for all shows
  const avgCondition = (
    horse.condition.hunger +
    horse.condition.cleanliness +
    (horse.condition.currentHealth / horse.stats.health * 100)
  ) / 3;

  score *= (0.8 + avgCondition / 500); // 80-100% multiplier based on condition

  // Randomness
  const randomFactor = SecureRNG.float(0.9, 1.1, 2);
  score *= randomFactor;

  return Math.round(score);
}

// ============================================================================
// RACE & SHOW CREATION
// ============================================================================

export function createRace(
  name: string,
  locationId: ObjectId,
  distance: number,
  entryFee: number,
  prizePool: number,
  startTime: Date
): HorseRace {
  return {
    _id: new ObjectId(),
    name,
    // location removed - not in HorseRace interface
    distance,
    entryFee,
    prizePool,
    requirements: {},
    participants: [],
    status: 'upcoming',
    startTime,
    createdAt: new Date()
  } as any; // TODO: Fix return type to match actual schema
}

export function createShow(
  name: string,
  type: 'beauty' | 'skill' | 'obedience',
  locationId: ObjectId,
  entryFee: number,
  prizes: { first: number; second: number; third: number },
  showTime: Date
): HorseShow {
  return {
    _id: new ObjectId(),
    name,
    type,
    // location removed - not in HorseShow interface
    entryFee,
    prizes,
    requirements: {},
    participants: [],
    status: 'upcoming',
    showTime,
    createdAt: new Date()
  } as any; // TODO: Fix return type to match actual schema
}

// ============================================================================
// LEADERBOARDS
// ============================================================================

export async function getRacingLeaderboard(limit: number = 10): Promise<Array<{
  rank: number;
  horse: HorseDocument;
  wins: number;
  winRate: number;
}>> {
  const topRacers = await Horse.find({ 'history.racesEntered': { $gt: 0 } })
    .sort({ 'history.racesWon': -1 })
    .limit(limit)
    .exec();

  return topRacers.map((horse, index) => ({
    rank: index + 1,
    horse,
    wins: horse.history.racesWon,
    winRate: horse.history.racesEntered > 0
      ? horse.history.racesWon / horse.history.racesEntered
      : 0
  }));
}

export async function getCombatLeaderboard(limit: number = 10): Promise<Array<{
  rank: number;
  horse: HorseDocument;
  victories: number;
  winRate: number;
}>> {
  const topWarHorses = await Horse.find({ 'history.combatsEntered': { $gt: 0 } })
    .sort({ 'history.combatVictories': -1 })
    .limit(limit)
    .exec();

  return topWarHorses.map((horse, index) => ({
    rank: index + 1,
    horse,
    victories: horse.history.combatVictories,
    winRate: horse.history.combatsEntered > 0
      ? horse.history.combatVictories / horse.history.combatsEntered
      : 0
  }));
}

export async function getDistanceLeaderboard(limit: number = 10): Promise<Array<{
  rank: number;
  horse: HorseDocument;
  distance: number;
}>> {
  const topTravelers = await Horse.find({ 'history.distanceTraveled': { $gt: 0 } })
    .sort({ 'history.distanceTraveled': -1 })
    .limit(limit)
    .exec();

  return topTravelers.map((horse, index) => ({
    rank: index + 1,
    horse,
    distance: horse.history.distanceTraveled
  }));
}
