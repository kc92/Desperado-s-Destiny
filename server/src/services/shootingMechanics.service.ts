/**
 * Shooting Mechanics Service
 * Handles shot resolution, accuracy calculations, and scoring
 */

import { SecureRNG } from './base/SecureRNG';
import type {
  Target,
  ShootingShotResult,
  AllowedWeapon,
  WeatherConditions,
  AccuracyFactors,
  HitZone
} from '@desperados/shared';
import {
  WEAPON_BONUSES,
  DISTANCE_PENALTY_TABLE,
  FATIGUE_PENALTY_PER_SHOT,
  MAX_FATIGUE_PENALTY,
  TIME_BONUS_THRESHOLDS,
  PERFECT_ACCURACY_BONUS,
  CONSECUTIVE_HIT_MULTIPLIER
} from '@desperados/shared';
import {
  SIZE_MODIFIERS,
  MOVEMENT_PENALTIES
} from '../data/shootingTargets';

/**
 * SHOOTING MECHANICS SERVICE
 */
export class ShootingMechanicsService {
  /**
   * Resolve a shot at a target
   */
  static resolveShot(
    playerId: string,
    target: Target,
    marksmanshipSkill: number,
    weapon: AllowedWeapon,
    shotsAlreadyTaken: number,
    weather?: WeatherConditions
  ): ShootingShotResult {
    const startTime = Date.now();

    // Calculate accuracy factors
    const factors = this.calculateAccuracyFactors(
      marksmanshipSkill,
      weapon,
      target,
      shotsAlreadyTaken,
      weather
    );

    // Roll for hit
    const roll = SecureRNG.d100();
    const hit = roll <= factors.finalChance;

    // Determine hit zone if hit
    let zone: string | undefined;
    let points = 0;

    if (hit && target.hitZones.length > 0) {
      const hitZone = this.determineHitZone(target.hitZones, roll, factors.finalChance);
      zone = hitZone.name;
      points = hitZone.pointValue;
    } else if (hit) {
      points = target.pointValue;
    }

    // Calculate time taken (affected by weapon speed)
    const weaponSpeed = WEAPON_BONUSES[weapon].speed;
    const baseTime = this.calculateShotTime(target.distance, weaponSpeed);

    const endTime = Date.now();
    const actualTime = endTime - startTime;
    const time = Math.max(baseTime, actualTime);

    return {
      playerId,
      targetId: target.id,
      hit,
      zone,
      points,
      time,
      distance: target.distance,
      skillRoll: roll,
      accuracyBonus: factors.weaponBonus,
      weatherPenalty: factors.weatherPenalty,
      fatigueModifier: factors.fatiguePenalty
    };
  }

  /**
   * Calculate all accuracy factors
   */
  static calculateAccuracyFactors(
    baseSkill: number,
    weapon: AllowedWeapon,
    target: Target,
    shotsAlreadyTaken: number,
    weather?: WeatherConditions
  ): AccuracyFactors {
    // Base skill (0-100)
    const normalizedSkill = Math.min(Math.max(baseSkill, 0), 100);

    // Weapon bonus
    const weaponBonus = WEAPON_BONUSES[weapon].accuracy;

    // Distance penalty
    const distancePenalty = this.calculateDistancePenalty(weapon, target.distance);

    // Weather penalty
    const weatherPenalty = weather ? this.calculateWeatherPenalty(weather, target.distance) : 0;

    // Fatigue penalty
    const fatiguePenalty = this.calculateFatiguePenalty(shotsAlreadyTaken);

    // Size modifier
    const sizeModifier = SIZE_MODIFIERS[target.size];

    // Movement penalty
    const movementPenalty = target.movement
      ? MOVEMENT_PENALTIES[target.movement]
      : 0;

    // Total modifier
    const totalModifier =
      weaponBonus +
      distancePenalty +
      weatherPenalty +
      fatiguePenalty +
      sizeModifier +
      movementPenalty;

    // Final chance (clamped to 5-95%)
    const rawChance = normalizedSkill + totalModifier;
    const finalChance = Math.min(Math.max(rawChance, 5), 95);

    return {
      baseSkill: normalizedSkill,
      weaponBonus,
      distancePenalty,
      weatherPenalty,
      fatiguePenalty,
      sizeModifier,
      movementPenalty,
      totalModifier,
      finalChance
    };
  }

  /**
   * Calculate distance penalty based on weapon type
   */
  private static calculateDistancePenalty(weapon: AllowedWeapon, distance: number): number {
    // Determine weapon category
    let category: 'pistol' | 'rifle' | 'shotgun';

    if (['revolver', 'derringer', 'competition_pistol'].includes(weapon)) {
      category = 'pistol';
    } else if (['winchester', 'sharps_rifle', 'competition_rifle'].includes(weapon)) {
      category = 'rifle';
    } else {
      category = 'shotgun';
    }

    const ranges = DISTANCE_PENALTY_TABLE[category];

    if (distance <= ranges.close.max) return ranges.close.penalty;
    if (distance <= ranges.medium.max) return ranges.medium.penalty;
    if (distance <= ranges.long.max) return ranges.long.penalty;
    return ranges.extreme.penalty;
  }

  /**
   * Calculate weather penalty
   */
  private static calculateWeatherPenalty(weather: WeatherConditions, distance: number): number {
    let penalty = 0;

    // Wind penalty (increases with distance)
    const windFactor = (weather.windSpeed / 30) * (distance / 100);
    penalty -= windFactor * 10; // Max -10% from wind at extreme distance

    // Precipitation penalty
    switch (weather.precipitation) {
      case 'light_rain':
        penalty -= 5;
        break;
      case 'heavy_rain':
        penalty -= 15;
        break;
      case 'dust_storm':
        penalty -= 25;
        break;
    }

    // Visibility penalty
    if (weather.visibility < 100) {
      penalty -= (100 - weather.visibility) / 5; // Max -20% at 0 visibility
    }

    return Math.max(penalty, -40); // Cap at -40%
  }

  /**
   * Calculate fatigue penalty from consecutive shots
   */
  private static calculateFatiguePenalty(shotsAlreadyTaken: number): number {
    const penalty = shotsAlreadyTaken * FATIGUE_PENALTY_PER_SHOT;
    return -Math.min(penalty, MAX_FATIGUE_PENALTY);
  }

  /**
   * Determine which hit zone was struck
   */
  private static determineHitZone(hitZones: HitZone[], roll: number, finalChance: number): HitZone {
    // Sort zones by difficulty (hardest first)
    const sortedZones = [...hitZones].sort((a, b) => a.difficulty - b.difficulty);

    // Allocate hit chance proportionally
    let cumulativeChance = 0;
    const normalizedRoll = (roll / finalChance) * 100;

    for (const zone of sortedZones) {
      const zoneChance = 100 * zone.difficulty / sortedZones.reduce((sum, z) => sum + z.difficulty, 0);
      cumulativeChance += zoneChance;

      if (normalizedRoll <= cumulativeChance) {
        return zone;
      }
    }

    // Fallback to least difficult zone
    return sortedZones[sortedZones.length - 1];
  }

  /**
   * Calculate shot time based on distance and weapon speed
   */
  private static calculateShotTime(distance: number, weaponSpeedModifier: number): number {
    // Base time: 1000ms + distance factor
    const baseTime = 1000 + (distance / 100) * 200;

    // Apply weapon speed modifier (positive = faster)
    const modifier = 1 - (weaponSpeedModifier / 100);

    return Math.floor(baseTime * modifier);
  }

  /**
   * Calculate bonus multiplier for a round
   */
  static calculateBonusMultiplier(
    shots: ShootingShotResult[],
    accuracy: number,
    averageTime: number
  ): number {
    let multiplier = 1.0;

    // Perfect accuracy bonus
    if (accuracy === 100) {
      multiplier += PERFECT_ACCURACY_BONUS;
    }

    // Time bonus
    if (averageTime <= TIME_BONUS_THRESHOLDS.fast.maxTime) {
      multiplier += TIME_BONUS_THRESHOLDS.fast.bonus;
    } else if (averageTime <= TIME_BONUS_THRESHOLDS.average.maxTime) {
      multiplier += TIME_BONUS_THRESHOLDS.average.bonus;
    }

    // Consecutive hits bonus
    let consecutiveHits = 0;
    let maxConsecutive = 0;

    for (const shot of shots) {
      if (shot.hit) {
        consecutiveHits++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveHits);
      } else {
        consecutiveHits = 0;
      }
    }

    if (maxConsecutive >= 3) {
      multiplier += (maxConsecutive - 2) * CONSECUTIVE_HIT_MULTIPLIER;
    }

    return multiplier;
  }

  /**
   * Generate random weather conditions
   */
  static generateWeather(location: string): WeatherConditions {
    // Base conditions
    let windSpeed = SecureRNG.float(0, 1) * 15; // 0-15 mph average
    let temperature = 70 + SecureRNG.float(0, 1) * 30; // 70-100°F
    let precipitation: WeatherConditions['precipitation'] = 'clear';
    let visibility = 100;

    // Location-specific adjustments
    if (location.includes('Fort Ashford')) {
      // Military range - often windy
      windSpeed += SecureRNG.float(0, 1) * 10;
    } else if (location.includes('Frontera')) {
      // Underground - no weather
      windSpeed = 0;
      temperature = 75;
      visibility = 90; // Dim lighting
    } else if (location.includes('Whiskey Bend')) {
      // Exhibition grounds - optimal conditions
      windSpeed = SecureRNG.float(0, 1) * 5;
      visibility = 100;
    }

    // Random weather events (10% chance)
    if (SecureRNG.chance(0.1) && !location.includes('Frontera')) {
      const event = SecureRNG.float(0, 1);
      if (event < 0.3) {
        precipitation = 'light_rain';
        visibility = 85;
      } else if (event < 0.5) {
        precipitation = 'heavy_rain';
        visibility = 60;
      } else {
        precipitation = 'dust_storm';
        windSpeed += 15;
        visibility = 50;
      }
    }

    return {
      windSpeed: Math.round(windSpeed),
      windDirection: SecureRNG.range(0, 359),
      temperature: Math.round(temperature),
      precipitation,
      visibility
    };
  }

  /**
   * Calculate final score from shots
   */
  static calculateScore(
    shots: ShootingShotResult[],
    scoringSystem: string
  ): {
    totalPoints: number;
    accuracy: number;
    averageTime: number;
    finalScore: number;
  } {
    if (shots.length === 0) {
      return {
        totalPoints: 0,
        accuracy: 0,
        averageTime: 0,
        finalScore: 0
      };
    }

    const totalPoints = shots.reduce((sum, shot) => sum + shot.points, 0);
    const hits = shots.filter(s => s.hit).length;
    const accuracy = (hits / shots.length) * 100;
    const totalTime = shots.reduce((sum, shot) => sum + shot.time, 0);
    const averageTime = totalTime / shots.length;

    let finalScore = totalPoints;

    // Apply scoring system
    if (scoringSystem === 'average_accuracy') {
      finalScore = accuracy * 10; // Scale accuracy to 1000 points max
    } else if (scoringSystem === 'time_based') {
      // Lower time is better - invert for scoring
      finalScore = hits > 0 ? (10000 / averageTime) * hits : 0;
    }

    // Apply bonus multiplier for total_points system
    if (scoringSystem === 'total_points') {
      const bonusMultiplier = this.calculateBonusMultiplier(shots, accuracy, averageTime);
      finalScore = Math.floor(totalPoints * bonusMultiplier);
    }

    return {
      totalPoints,
      accuracy: Math.round(accuracy * 10) / 10,
      averageTime: Math.round(averageTime),
      finalScore: Math.round(finalScore)
    };
  }

  /**
   * Rank players by score
   */
  static rankPlayers(
    scores: Array<{ playerId: string; finalScore: number; accuracy: number; averageTime: number }>
  ): Array<{ playerId: string; rank: number }> {
    // Sort by score (descending), then accuracy, then time (ascending)
    const sorted = [...scores].sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.averageTime - b.averageTime;
    });

    return sorted.map((score, index) => ({
      playerId: score.playerId,
      rank: index + 1
    }));
  }
}
