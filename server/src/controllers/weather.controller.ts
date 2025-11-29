/**
 * Weather Controller
 *
 * Handles weather-related API endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { WeatherService } from '../services/weather.service';
import { WeatherType } from '../models/WorldState.model';
import type { RegionType } from '../services/weather.service';

/**
 * GET /api/weather
 * Get current weather for all regions
 */
export const getAllWeather = asyncHandler(async (req: Request, res: Response) => {
  const regionalWeather = await WeatherService.getAllRegionalWeather();

  const weatherData = regionalWeather.map(weather => ({
    region: weather.region,
    weather: weather.currentWeather,
    intensity: weather.intensity,
    description: WeatherService.getWeatherDescription(
      weather.currentWeather,
      weather.intensity
    ),
    effects: WeatherService.getWeatherEffects(weather.currentWeather, weather.intensity),
    startedAt: weather.startedAt,
    endsAt: weather.endsAt,
    isSupernatural: weather.isSupernatural,
    travelable: WeatherService.isWeatherTravelable(weather.currentWeather, weather.intensity),
  }));

  res.status(200).json({
    success: true,
    data: {
      weather: weatherData,
    },
  });
});

/**
 * GET /api/weather/region/:region
 * Get current weather for a specific region
 */
export const getRegionWeather = asyncHandler(async (req: Request, res: Response) => {
  const { region } = req.params;

  const weather = await WeatherService.getRegionalWeather(region as RegionType);

  if (!weather) {
    res.status(404).json({
      success: false,
      message: `No weather data found for region: ${region}`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      region: weather.region,
      weather: weather.currentWeather,
      intensity: weather.intensity,
      description: WeatherService.getWeatherDescription(
        weather.currentWeather,
        weather.intensity
      ),
      effects: WeatherService.getWeatherEffects(weather.currentWeather, weather.intensity),
      startedAt: weather.startedAt,
      endsAt: weather.endsAt,
      isSupernatural: weather.isSupernatural,
      travelable: WeatherService.isWeatherTravelable(weather.currentWeather, weather.intensity),
    },
  });
});

/**
 * GET /api/weather/location/:locationId
 * Get current weather at a specific location
 */
export const getLocationWeather = asyncHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;

  const weather = await WeatherService.getLocationWeather(locationId);

  if (!weather) {
    res.status(404).json({
      success: false,
      message: `No weather data found for location: ${locationId}`,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      weather: weather.weather,
      intensity: weather.intensity,
      description: WeatherService.getWeatherDescription(weather.weather, weather.intensity),
      effects: weather.effects,
      isSupernatural: weather.isSupernatural,
      travelable: WeatherService.isWeatherTravelable(weather.weather, weather.intensity),
    },
  });
});

/**
 * POST /api/weather/update
 * Manually trigger weather update (can be called by cron job)
 */
export const updateWeather = asyncHandler(async (req: Request, res: Response) => {
  const worldState = await WeatherService.updateWorldWeather();

  res.status(200).json({
    success: true,
    message: 'Weather updated successfully',
    data: {
      regionalWeather: worldState.regionalWeather,
    },
  });
});

/**
 * POST /api/weather/set
 * Admin endpoint to set weather for a region (for testing)
 */
export const setWeather = asyncHandler(async (req: Request, res: Response) => {
  const { region, weather, intensity, duration } = req.body;

  if (!region || !weather) {
    res.status(400).json({
      success: false,
      message: 'Region and weather type are required',
    });
    return;
  }

  // Validate weather type
  if (!Object.values(WeatherType).includes(weather)) {
    res.status(400).json({
      success: false,
      message: `Invalid weather type. Valid types: ${Object.values(WeatherType).join(', ')}`,
    });
    return;
  }

  const worldState = await WeatherService.setRegionalWeather(
    region as RegionType,
    weather as WeatherType,
    intensity || 5,
    duration || 60
  );

  const updatedWeather = worldState.regionalWeather.find(w => w.region === region);

  res.status(200).json({
    success: true,
    message: `Weather set for ${region}`,
    data: {
      region: updatedWeather?.region,
      weather: updatedWeather?.currentWeather,
      intensity: updatedWeather?.intensity,
      endsAt: updatedWeather?.endsAt,
    },
  });
});

/**
 * GET /api/weather/types
 * Get all available weather types and their effects
 */
export const getWeatherTypes = asyncHandler(async (req: Request, res: Response) => {
  const weatherTypes = Object.values(WeatherType).map(type => ({
    type,
    effects: WeatherService.getWeatherEffects(type, 5), // Default intensity
    description: WeatherService.getWeatherDescription(type, 5),
  }));

  res.status(200).json({
    success: true,
    data: {
      weatherTypes,
    },
  });
});
