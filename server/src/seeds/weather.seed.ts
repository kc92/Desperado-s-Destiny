/**
 * Weather Seed
 *
 * Initializes regional weather for the game world
 */

import { WeatherService } from '../services/weather.service';
import { WorldState } from '../models/WorldState.model';
import logger from '../utils/logger';

export async function seedWeather(): Promise<void> {
  try {
    logger.info('Seeding regional weather...');

    // Get or create world state
    let worldState = await WorldState.findOne();

    if (!worldState) {
      worldState = new WorldState({
        gameHour: 12,
        gameDay: 1,
        gameMonth: 6,
        gameYear: 1885,
        timeOfDay: 'NOON',
      });
      await worldState.save();
      logger.info('Created world state');
    }

    // Initialize regional weather using the weather service
    await WeatherService.updateWorldWeather();

    logger.info('Weather seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding weather:', error);
    throw error;
  }
}

export default seedWeather;
