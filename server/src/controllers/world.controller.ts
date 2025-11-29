/**
 * World Controller
 * Handles world state, time, weather, and global events
 */

import { Request, Response } from 'express';
import { WorldState } from '../models/WorldState.model';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * GET /api/world/state
 * Get current world state including time, weather, and global conditions
 */
export const getWorldState = asyncHandler(async (req: Request, res: Response) => {
  // Get or create world state
  let worldState = await WorldState.findOne();

  if (!worldState) {
    // Create default world state if none exists
    worldState = new WorldState({
      gameHour: 12,
      gameDay: 1,
      gameMonth: 6,
      gameYear: 1875,
      timeOfDay: 'NOON',
    });
    await worldState.save();
  }

  res.status(200).json({
    success: true,
    data: {
      worldState: {
        // Time
        gameHour: worldState.gameHour,
        gameDay: worldState.gameDay,
        gameMonth: worldState.gameMonth,
        gameYear: worldState.gameYear,
        timeOfDay: worldState.timeOfDay,
        lastTimeUpdate: worldState.lastTimeUpdate,

        // Weather
        currentWeather: worldState.currentWeather,
        weatherEffects: worldState.weatherEffects,
        nextWeatherChange: worldState.nextWeatherChange,
        weatherForecast: worldState.weatherForecast,

        // Headlines and gossip
        currentHeadlines: worldState.currentHeadlines,
        recentGossip: worldState.recentGossip,

        // Faction power
        factionPower: worldState.factionPower,
      },
    },
  });
});

/**
 * GET /api/world/time
 * Get current game time (lightweight endpoint)
 */
export const getGameTime = asyncHandler(async (req: Request, res: Response) => {
  let worldState = await WorldState.findOne();

  if (!worldState) {
    worldState = new WorldState({
      gameHour: 12,
      gameDay: 1,
      gameMonth: 6,
      gameYear: 1875,
      timeOfDay: 'NOON',
    });
    await worldState.save();
  }

  res.status(200).json({
    success: true,
    data: {
      gameHour: worldState.gameHour,
      gameDay: worldState.gameDay,
      gameMonth: worldState.gameMonth,
      gameYear: worldState.gameYear,
      timeOfDay: worldState.timeOfDay,
      lastTimeUpdate: worldState.lastTimeUpdate,
    },
  });
});

/**
 * GET /api/world/weather
 * Get current weather conditions (lightweight endpoint)
 */
export const getWeather = asyncHandler(async (req: Request, res: Response) => {
  let worldState = await WorldState.findOne();

  if (!worldState) {
    worldState = new WorldState();
    await worldState.save();
  }

  res.status(200).json({
    success: true,
    data: {
      currentWeather: worldState.currentWeather,
      weatherEffects: worldState.weatherEffects,
      nextWeatherChange: worldState.nextWeatherChange,
      weatherForecast: worldState.weatherForecast,
    },
  });
});
