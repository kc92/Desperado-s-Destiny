/**
 * Race Simulation Service
 * Phase 13, Wave 13.2
 *
 * Service for simulating horse races with realistic mechanics
 */

import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';
import { HorseRace, HorseRaceDocument } from '../models/HorseRace.model';
import { Horse, HorseDocument } from '../models/Horse.model';
import {
  RaceSimulation,
  RaceHorseState,
  SimulationEvent,
  RaceResult,
  RaceIncidentReport,
  RacePosition,
  RaceIncident,
  RaceType,
  RACING_CONSTANTS
} from '@desperados/shared';

// ============================================================================
// RACE SIMULATION
// ============================================================================

/**
 * Simulate a complete horse race
 */
export async function simulateRace(raceId: ObjectId): Promise<RaceResult[]> {
  const race = await HorseRace.findById(raceId)
    .populate('registeredHorses.horseId');

  if (!race) {
    throw new Error('Race not found');
  }

  if (race.raceStatus !== 'POST_TIME' && race.raceStatus !== 'IN_PROGRESS') {
    throw new Error('Race must be at post time to simulate');
  }

  // Get active entries (not scratched)
  const activeEntries = race.registeredHorses.filter(e => !e.scratched);

  if (activeEntries.length < RACING_CONSTANTS.MIN_HORSES_PER_RACE) {
    throw new Error('Not enough horses to run race');
  }

  // Initialize horse states
  const horseStates: RaceHorseState[] = [];

  for (const entry of activeEntries) {
    const horse = await Horse.findById(entry.horseId);
    if (!horse) continue;

    const state = initializeHorseState(horse, entry, race);
    horseStates.push(state);
  }

  // Create simulation
  const simulation: RaceSimulation = {
    raceId,
    horses: horseStates,
    distance: race.distance,
    terrain: race.terrain,
    obstacles: race.obstacles,
    weather: race.weather,
    trackCondition: race.trackCondition,
    currentTime: 0,
    completed: false,
    events: []
  };

  // Add start event
  simulation.events.push({
    time: 0,
    type: 'START',
    description: 'And they\'re off!',
    involvedHorses: horseStates.map(h => h.horseId)
  });

  // Simulate race in time steps
  const timeStep = 0.5; // Half-second intervals
  let currentTime = 0;
  const maxTime = 600; // 10 minute max

  while (!simulation.completed && currentTime < maxTime) {
    currentTime += timeStep;
    simulation.currentTime = currentTime;

    // Update each horse
    for (const horse of simulation.horses) {
      updateHorsePosition(horse, timeStep, simulation, race.raceType);
    }

    // Check for incidents
    checkForIncidents(simulation, currentTime);

    // Check for obstacle interactions
    if (race.obstacles.length > 0) {
      checkObstacles(simulation, race.obstacles);
    }

    // Update positions
    updatePositions(simulation);

    // Check if all horses finished
    simulation.completed = simulation.horses.every(
      h => h.distanceCovered >= simulation.distance
    );
  }

  // Calculate results
  const results = calculateRaceResults(simulation, race);

  // Save results to race
  race.results = results;
  race.raceStatus = 'COMPLETED' as any;
  race.finalTime = results[0].finalTime;

  await race.save();

  // Update horse statistics
  await updateHorseStatistics(results);

  return results;
}

/**
 * Initialize horse state for simulation
 */
function initializeHorseState(
  horse: HorseDocument,
  entry: any,
  race: HorseRaceDocument
): RaceHorseState {
  // Calculate effective stats with modifiers
  const terrainMod = calculateTerrainModifier(horse, race.terrain[0]);
  const weatherMod = calculateWeatherModifier(race.weather);
  const trackMod = RACING_CONSTANTS.TRACK_CONDITION_MODIFIERS[race.trackCondition];
  const jockeyMod = entry.jockeySkillLevel / 100;

  const effectiveSpeed = horse.stats.speed * terrainMod * weatherMod * trackMod * (1 + jockeyMod * 0.2);
  const effectiveStamina = horse.stats.stamina * (1 + jockeyMod * 0.1);

  // Determine strategy based on horse temperament and jockey
  const strategy = determineRaceStrategy(horse, race.raceType);

  return {
    horseId: horse._id as any,
    entryInfo: entry,
    distanceCovered: 0,
    currentPosition: entry.postPosition,
    currentLane: entry.postPosition,
    currentSpeed: effectiveSpeed * 0.5, // Start at half speed
    currentStamina: effectiveStamina,
    currentMorale: horse.condition.mood === 'excellent' ? 100 : 80,
    strategy,
    energyReserve: 100,
    incidents: [],
    timeLost: 0,
    whipUsed: 0
  };
}

/**
 * Update horse position for one time step
 */
function updateHorsePosition(
  horse: RaceHorseState,
  timeStep: number,
  simulation: RaceSimulation,
  raceType: RaceType
): void {
  if (horse.distanceCovered >= simulation.distance) {
    return; // Horse finished
  }

  // Calculate current speed based on strategy and position in race
  const raceProgress = horse.distanceCovered / simulation.distance;

  let speedMultiplier = 1.0;

  // Apply strategy
  if (horse.strategy === RacePosition.FRONT_RUNNER) {
    // Fast start, tire late
    if (raceProgress < 0.3) speedMultiplier = 1.15;
    else if (raceProgress > 0.8) speedMultiplier = 0.85;
  } else if (horse.strategy === RacePosition.CLOSER) {
    // Save energy for final push
    if (raceProgress < 0.7) speedMultiplier = 0.9;
    else speedMultiplier = 1.2;
  } else if (horse.strategy === RacePosition.STALKER) {
    // Stay close to leader
    speedMultiplier = 1.0;
  }

  // Stamina affects late-race speed
  const staminaFactor = horse.currentStamina / 100;
  if (raceProgress > 0.5) {
    speedMultiplier *= (0.7 + 0.3 * staminaFactor);
  }

  // Morale affects performance
  const moraleFactor = horse.currentMorale / 100;
  speedMultiplier *= (0.8 + 0.2 * moraleFactor);

  // Apply speed
  const actualSpeed = horse.currentSpeed * speedMultiplier;

  // Convert speed to yards per second (game abstraction)
  const yardsPerSecond = actualSpeed / 10;

  // Update distance
  horse.distanceCovered += yardsPerSecond * timeStep;

  // Deplete stamina
  const staminaDrain = (speedMultiplier * 2) * timeStep;
  horse.currentStamina = Math.max(0, horse.currentStamina - staminaDrain);

  // Energy reserve depletes in sprints
  if (raceType === RaceType.SPRINT || raceProgress > 0.8) {
    horse.energyReserve = Math.max(0, horse.energyReserve - staminaDrain);
  }

  // Jockey whip usage (final stretch)
  if (raceProgress > 0.85 && horse.energyReserve > 20 && Math.random() < 0.1) {
    horse.whipUsed++;
    horse.currentSpeed *= 1.1;
    horse.energyReserve -= 10;
  }
}

/**
 * Check for random incidents
 */
function checkForIncidents(
  simulation: RaceSimulation,
  currentTime: number
): void {
  for (const horse of simulation.horses) {
    if (horse.distanceCovered >= simulation.distance) continue;

    // Low chance of incidents
    const incidentChance = 0.001; // 0.1% per time step

    if (Math.random() < incidentChance) {
      const incident = generateRandomIncident();
      horse.incidents.push(incident);

      // Apply incident effects
      const timePenalty = getIncidentPenalty(incident);
      horse.timeLost += timePenalty;
      horse.currentSpeed *= 0.5; // Temporary slowdown
      horse.currentMorale -= 10;

      // Add to simulation events
      simulation.events.push({
        time: currentTime,
        type: 'INCIDENT',
        description: `${getHorseName(horse)} experienced a ${incident.toLowerCase()}!`,
        involvedHorses: [horse.horseId],
        impact: [{
          horseId: horse.horseId,
          speedChange: -50
        }]
      });

      // Recover speed gradually
      setTimeout(() => {
        horse.currentSpeed *= 2;
      }, 1000);
    }
  }
}

/**
 * Check for obstacle interactions (steeplechase)
 */
function checkObstacles(
  simulation: RaceSimulation,
  obstacles: any[]
): void {
  for (const horse of simulation.horses) {
    for (const obstacle of obstacles) {
      // Check if horse just reached this obstacle
      if (
        horse.distanceCovered >= obstacle.position &&
        horse.distanceCovered < obstacle.position + 10 &&
        !horse.incidents.includes(`CLEARED_${obstacle.id}` as any)
      ) {
        // Attempt to clear obstacle
        const clearanceChance = calculateObstacleClearanceChance(horse, obstacle);

        if (Math.random() < clearanceChance) {
          // Success!
          horse.incidents.push(`CLEARED_${obstacle.id}` as any);
          simulation.events.push({
            time: simulation.currentTime,
            type: 'OBSTACLE',
            description: `${getHorseName(horse)} clears ${obstacle.name}!`,
            involvedHorses: [horse.horseId]
          });
        } else {
          // Failed to clear - penalty
          horse.timeLost += obstacle.penaltyOnFailure;
          horse.currentSpeed *= 0.7;
          horse.currentMorale -= 15;
          horse.incidents.push(RaceIncident.STUMBLE);

          simulation.events.push({
            time: simulation.currentTime,
            type: 'OBSTACLE',
            description: `${getHorseName(horse)} stumbles at ${obstacle.name}!`,
            involvedHorses: [horse.horseId],
            impact: [{
              horseId: horse.horseId,
              speedChange: -30
            }]
          });

          // Check for injury
          if (Math.random() * 100 < obstacle.injuryRisk) {
            horse.currentStamina *= 0.5;
          }
        }
      }
    }
  }
}

/**
 * Update race positions
 */
function updatePositions(simulation: RaceSimulation): void {
  // Sort horses by distance covered
  const sorted = [...simulation.horses].sort(
    (a, b) => b.distanceCovered - a.distanceCovered
  );

  // Update positions
  sorted.forEach((horse, index) => {
    const newPosition = index + 1;
    if (newPosition !== horse.currentPosition) {
      const oldPosition = horse.currentPosition;
      horse.currentPosition = newPosition;
      (horse as any).positionChanges += Math.abs(newPosition - oldPosition);
    }
  });

  // Add position change events
  const leader = sorted[0];
  const previousLeader = simulation.horses.find(h => h.currentPosition === 1);

  if (previousLeader && previousLeader.horseId !== leader.horseId) {
    simulation.events.push({
      time: simulation.currentTime,
      type: 'POSITION_CHANGE',
      description: `${getHorseName(leader)} takes the lead!`,
      involvedHorses: [leader.horseId]
    });
  }
}

/**
 * Calculate final race results
 */
function calculateRaceResults(
  simulation: RaceSimulation,
  race: HorseRaceDocument
): RaceResult[] {
  // Sort horses by finish
  const finished = simulation.horses.sort(
    (a, b) => {
      // Compare by distance first
      if (b.distanceCovered !== a.distanceCovered) {
        return b.distanceCovered - a.distanceCovered;
      }
      // If same distance, compare by speed
      return b.currentSpeed - a.currentSpeed;
    }
  );

  const results: RaceResult[] = [];

  finished.forEach((horse, index) => {
    const position = index + 1;

    // Calculate finish time
    const finishTime = simulation.currentTime + horse.timeLost;

    // Calculate margins (lengths behind)
    const margins: number[] = [];
    if (position > 1) {
      const horseAhead = finished[index - 1];
      const distanceDiff = horseAhead.distanceCovered - horse.distanceCovered;
      const lengths = Math.max(0.1, distanceDiff / 8); // 8 feet per length
      margins.push(parseFloat(lengths.toFixed(1)));
    }

    // Calculate speeds
    const avgSpeed = horse.distanceCovered / finishTime;
    const topSpeed = horse.currentSpeed;

    // Calculate prize money
    const prizeMoney = calculatePrizeMoney(position, race);

    // Calculate experience and reputation
    const experienceGained = calculateExperience(position, race.prestige, race.raceType);
    const reputationGained = calculateReputation(position, race.prestige);

    // Check for track record
    const trackRecord = (race as any).speedRecord ?
      finishTime < (race as any).speedRecord.time : position === 1;

    // Check for perfect run
    const perfectRun = horse.incidents.filter(
      i => !i.toString().startsWith('CLEARED_')
    ).length === 0;

    results.push({
      position,
      horseId: horse.horseId,
      ownerId: horse.entryInfo.ownerId,
      jockeyId: horse.entryInfo.jockeyId,
      finalTime: finishTime,
      margins,
      topSpeed,
      avgSpeed,
      incidents: horse.incidents.filter(i => !i.toString().startsWith('CLEARED_')),
      positionChanges: (horse as any).positionChanges,
      prizeMoney,
      experienceGained,
      reputationGained,
      trackRecord,
      perfectRun
    });
  });

  return results;
}

/**
 * Update horse statistics after race
 */
async function updateHorseStatistics(results: RaceResult[]): Promise<void> {
  for (const result of results) {
    const horse = await Horse.findById(result.horseId);
    if (!horse) continue;

    // Update race history
    horse.history.racesEntered++;
    if (result.position === 1) {
      horse.history.racesWon++;
    }

    // Track record bonus
    if (result.trackRecord) {
      // Permanent speed bonus
      horse.stats.speed = Math.min(100, horse.stats.speed + 1);
    }

    // Perfect run bonus
    if (result.perfectRun) {
      horse.bond.level = Math.min(100, horse.bond.level + 5);
    }

    await horse.save();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate terrain modifier
 */
function calculateTerrainModifier(horse: HorseDocument, terrain: string): number {
  // Base modifier from constants
  const baseMod = 1 + (RACING_CONSTANTS.TERRAIN_PENALTIES[terrain as keyof typeof RACING_CONSTANTS.TERRAIN_PENALTIES] || 0) / 100;

  // TODO: Check horse terrain affinity from skills
  return baseMod;
}

/**
 * Calculate weather modifier
 */
function calculateWeatherModifier(weather: string): number {
  return 1 + (RACING_CONSTANTS.WEATHER_PENALTIES[weather as keyof typeof RACING_CONSTANTS.WEATHER_PENALTIES] || 0) / 100;
}

/**
 * Determine race strategy
 */
function determineRaceStrategy(horse: HorseDocument, raceType: RaceType): RacePosition {
  // Sprint races - front runners
  if (raceType === RaceType.SPRINT) {
    return RacePosition.FRONT_RUNNER;
  }

  // Endurance races - pacers
  if (raceType === RaceType.ENDURANCE) {
    return RacePosition.MID_PACK;
  }

  // Based on horse temperament
  if (horse.stats.temperament > 80) {
    return RacePosition.FRONT_RUNNER;
  } else if (horse.stats.temperament > 60) {
    return RacePosition.STALKER;
  } else if (horse.stats.temperament > 40) {
    return RacePosition.MID_PACK;
  } else {
    return RacePosition.CLOSER;
  }
}

/**
 * Generate random incident
 */
function generateRandomIncident(): RaceIncident {
  const incidents = [
    RaceIncident.STUMBLE,
    RaceIncident.HORSE_SPOOKED,
    RaceIncident.BUMPED,
    RaceIncident.BLOCKED
  ];

  return incidents[Math.floor(Math.random() * incidents.length)];
}

/**
 * Get incident time penalty
 */
function getIncidentPenalty(incident: RaceIncident): number {
  const penalties = {
    [RaceIncident.STUMBLE]: RACING_CONSTANTS.STUMBLE_PENALTY,
    [RaceIncident.INTERFERENCE]: RACING_CONSTANTS.INTERFERENCE_PENALTY,
    [RaceIncident.BREAK_EQUIPMENT]: 5,
    [RaceIncident.RIDER_FALL]: RACING_CONSTANTS.FALL_PENALTY,
    [RaceIncident.HORSE_SPOOKED]: 3,
    [RaceIncident.BLOCKED]: 2,
    [RaceIncident.BUMPED]: 1,
    [RaceIncident.FALSE_START]: 0
  };

  return penalties[incident] || 0;
}

/**
 * Calculate obstacle clearance chance
 */
function calculateObstacleClearanceChance(
  horse: RaceHorseState,
  obstacle: any
): number {
  // Base chance 80%
  let chance = 0.8;

  // Difficulty reduces chance
  chance -= obstacle.difficulty * 0.05;

  // Stamina affects success
  chance += (horse.currentStamina / 100) * 0.1;

  // Morale affects success
  chance += (horse.currentMorale / 100) * 0.05;

  // TODO: Check for jumping skills

  return Math.max(0.1, Math.min(0.95, chance));
}

/**
 * Calculate prize money
 */
function calculatePrizeMoney(position: number, race: HorseRaceDocument): number {
  if (position > race.prizeDistribution.length) {
    return 0;
  }

  const percentage = race.prizeDistribution[position - 1];
  return Math.floor(race.purse * percentage);
}

/**
 * Calculate experience gain
 */
function calculateExperience(
  position: number,
  prestige: number,
  raceType: RaceType
): number {
  let baseXP = RACING_CONSTANTS.RACE_XP_BASE;

  if (position === 1) {
    baseXP += RACING_CONSTANTS.RACE_XP_WIN;
  }

  // Prestige multiplier
  baseXP *= prestige / 5;

  // Race type multiplier
  if (raceType === RaceType.ENDURANCE || raceType === RaceType.STEEPLECHASE) {
    baseXP *= 1.5;
  }

  return Math.floor(baseXP);
}

/**
 * Calculate reputation gain
 */
function calculateReputation(position: number, prestige: number): number {
  let baseRep = 0;

  if (position === 1) {
    baseRep = RACING_CONSTANTS.RACE_REP_WIN;
  } else if (position === 2) {
    baseRep = RACING_CONSTANTS.RACE_REP_PLACE;
  } else if (position === 3) {
    baseRep = RACING_CONSTANTS.RACE_REP_SHOW;
  }

  // Prestige multiplier
  baseRep *= prestige / 5;

  return Math.floor(baseRep);
}

/**
 * Get horse display name
 */
function getHorseName(horse: RaceHorseState): string {
  return `Horse #${horse.entryInfo.postPosition}`;
}
