/**
 * Entertainer Controller
 *
 * Handles HTTP requests for the wandering entertainer system
 * Part of Phase 4, Wave 4.1 - Entertainment System
 */

import { Request, Response } from 'express';
import * as EntertainerService from '../services/entertainer.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../utils/errors';
import {
  getEntertainerById,
  getEntertainersByType,
  PerformanceType
} from '../data/wanderingEntertainers';

/**
 * Get all entertainers
 * GET /api/entertainers
 */
export const getAllEntertainers = asyncHandler(async (req: Request, res: Response) => {
  const entertainers = EntertainerService.getAllEntertainers();

  res.json({
    success: true,
    data: {
      entertainers,
      count: entertainers.length
    }
  });
});

/**
 * Get entertainer by ID
 * GET /api/entertainers/:entertainerId
 */
export const getEntertainerDetails = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId } = req.params;

  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    throw new AppError('Entertainer not found', 404);
  }

  res.json({
    success: true,
    data: { entertainer }
  });
});

/**
 * Get entertainers by type
 * GET /api/entertainers/type/:type
 */
export const getEntertainersByPerformanceType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;

  // Validate the performance type
  if (!Object.values(PerformanceType).includes(type as PerformanceType)) {
    throw new AppError(`Invalid performance type: ${type}`, 400);
  }

  const entertainers = getEntertainersByType(type as PerformanceType);

  res.json({
    success: true,
    data: {
      entertainers,
      count: entertainers.length,
      type
    }
  });
});

/**
 * Get entertainers at a specific location
 * GET /api/entertainers/location/:locationId
 */
export const getEntertainersAtLocation = asyncHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;
  const { day } = req.query;

  const currentDay = day ? parseInt(day as string, 10) : Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const entertainers = EntertainerService.getEntertainersAtLocationOnDay(locationId, currentDay);

  res.json({
    success: true,
    data: {
      entertainers,
      count: entertainers.length,
      locationId,
      currentDay
    }
  });
});

/**
 * Get available performances at a location
 * GET /api/entertainers/performances/location/:locationId
 */
export const getLocationPerformances = asyncHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;
  const { day } = req.query;

  const currentDay = day ? parseInt(day as string, 10) : Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const performances = EntertainerService.getLocationPerformances(locationId, currentDay);

  res.json({
    success: true,
    data: {
      performances,
      count: performances.length,
      locationId,
      currentDay
    }
  });
});

/**
 * Get entertainer's current location
 * GET /api/entertainers/:entertainerId/location
 */
export const getEntertainerLocation = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId } = req.params;
  const { day } = req.query;

  const currentDay = day ? parseInt(day as string, 10) : Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const location = EntertainerService.getEntertainerCurrentLocation(entertainerId, currentDay);

  if (!location) {
    throw new AppError('Entertainer not found', 404);
  }

  res.json({
    success: true,
    data: {
      ...location,
      entertainerId,
      currentDay
    }
  });
});

/**
 * Get entertainer schedule
 * GET /api/entertainers/:entertainerId/schedule
 */
export const getEntertainerSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId } = req.params;

  const schedule = EntertainerService.getEntertainerSchedule(entertainerId);

  if (!schedule) {
    throw new AppError('Entertainer not found', 404);
  }

  res.json({
    success: true,
    data: {
      schedule,
      entertainerId
    }
  });
});

/**
 * Check if entertainer is currently performing
 * GET /api/entertainers/:entertainerId/performing
 */
export const isEntertainerPerforming = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId } = req.params;
  const { hour } = req.query;

  const currentHour = hour ? parseInt(hour as string, 10) : new Date().getHours();

  const isPerforming = EntertainerService.isEntertainerPerforming(entertainerId, currentHour);

  res.json({
    success: true,
    data: {
      isPerforming,
      entertainerId,
      currentHour
    }
  });
});

/**
 * Search entertainers by name
 * GET /api/entertainers/search
 */
export const searchEntertainers = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    throw new AppError('Search query is required', 400);
  }

  const entertainers = EntertainerService.searchEntertainersByName(q);

  res.json({
    success: true,
    data: {
      entertainers,
      count: entertainers.length,
      query: q
    }
  });
});

/**
 * Watch a performance
 * POST /api/entertainers/:entertainerId/performances/:performanceId/watch
 */
export const watchPerformance = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId, performanceId } = req.params;
  const characterId = req.character?._id.toString();

  if (!characterId) {
    throw new AppError('Character not found', 404);
  }

  const result = await EntertainerService.watchPerformance(
    characterId,
    entertainerId,
    performanceId
  );

  res.json({
    success: result.success,
    data: result
  });
});

/**
 * Learn a skill from an entertainer
 * POST /api/entertainers/:entertainerId/skills/:skillId/learn
 */
export const learnSkill = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId, skillId } = req.params;
  const characterId = req.character?._id.toString();

  if (!characterId) {
    throw new AppError('Character not found', 404);
  }

  const result = await EntertainerService.learnSkillFromEntertainer(
    characterId,
    entertainerId,
    skillId
  );

  res.json({
    success: result.success,
    data: result
  });
});

/**
 * Get gossip from an entertainer
 * GET /api/entertainers/:entertainerId/gossip
 */
export const getGossipFromEntertainer = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId } = req.params;
  const { category } = req.query;
  const trustLevel = parseInt(req.query.trustLevel as string, 10) || 0;

  const gossip = EntertainerService.getGossipFromEntertainer(
    entertainerId,
    trustLevel,
    category as string | undefined
  );

  res.json({
    success: true,
    data: {
      gossip,
      entertainerId,
      trustLevel
    }
  });
});

/**
 * Get recommended performances for character
 * GET /api/entertainers/recommendations
 */
export const getRecommendedPerformances = asyncHandler(async (req: Request, res: Response) => {
  const characterLevel = req.character?.level || 1;
  const needs = (req.query.needs as string)?.split(',') || [];

  const performances = EntertainerService.getRecommendedPerformances(
    characterLevel,
    needs
  );

  res.json({
    success: true,
    data: {
      performances,
      count: performances.length
    }
  });
});

/**
 * Check if character can afford a performance
 * GET /api/entertainers/:entertainerId/performances/:performanceId/check-afford
 */
export const checkAffordPerformance = asyncHandler(async (req: Request, res: Response) => {
  const { entertainerId, performanceId } = req.params;
  const characterEnergy = req.character?.energy || 0;

  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    throw new AppError('Entertainer not found', 404);
  }

  const performance = entertainer.performances.find(p => p.id === performanceId);
  if (!performance) {
    throw new AppError('Performance not found', 404);
  }

  const affordCheck = EntertainerService.canAffordPerformance(characterEnergy, performance);

  res.json({
    success: true,
    data: {
      ...affordCheck,
      performanceId,
      performanceName: performance.name,
      energyCost: performance.energyCost,
      characterEnergy
    }
  });
});
