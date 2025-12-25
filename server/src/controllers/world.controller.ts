/**
 * World Controller
 * Handles world state, time, weather, and global events
 */

import { Request, Response } from 'express';
import { WorldState } from '../models/WorldState.model';
import { WorldEvent, EventStatus } from '../models/WorldEvent.model';
import { asyncHandler } from '../middleware/asyncHandler';
import { safeAchievementUpdate } from '../utils/achievementUtils';

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

/**
 * GET /api/world/events
 * Get active and upcoming world events
 */
export const getActiveEvents = asyncHandler(async (req: Request, res: Response) => {
  // Get active events
  const activeEvents = await WorldEvent.find({
    status: EventStatus.ACTIVE,
  })
    .sort({ priority: -1, scheduledStart: -1 })
    .select({
      name: 1,
      description: 1,
      type: 1,
      isGlobal: 1,
      locationId: 1,
      region: 1,
      scheduledStart: 1,
      scheduledEnd: 1,
      worldEffects: 1,
      participationRewards: 1,
      newsHeadline: 1,
      participantCount: 1,
    });

  // Get upcoming events (next 6 hours)
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const upcomingEvents = await WorldEvent.find({
    status: EventStatus.SCHEDULED,
    scheduledStart: { $gte: now, $lte: sixHoursFromNow },
  })
    .sort({ scheduledStart: 1 })
    .limit(5)
    .select({
      name: 1,
      description: 1,
      type: 1,
      isGlobal: 1,
      region: 1,
      scheduledStart: 1,
      scheduledEnd: 1,
      newsHeadline: 1,
    });

  res.status(200).json({
    success: true,
    data: {
      activeEvents,
      upcomingEvents,
      activeCount: activeEvents.length,
      upcomingCount: upcomingEvents.length,
    },
  });
});

/**
 * GET /api/world/events/:eventId
 * Get details of a specific event
 */
export const getEventDetails = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;

  const event = await WorldEvent.findById(eventId);

  if (!event) {
    res.status(404).json({
      success: false,
      error: 'Event not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: event,
  });
});

/**
 * POST /api/world/events/:eventId/join
 * Join an active world event
 */
export const joinEvent = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const characterId = req.body.characterId || (req as any).character?._id;

  if (!characterId) {
    res.status(400).json({
      success: false,
      error: 'Character ID required',
    });
    return;
  }

  const event = await WorldEvent.findById(eventId);

  if (!event) {
    res.status(404).json({
      success: false,
      error: 'Event not found',
    });
    return;
  }

  if (event.status !== EventStatus.ACTIVE) {
    res.status(400).json({
      success: false,
      error: 'Event is not currently active',
    });
    return;
  }

  // Check if already participating
  const alreadyJoined = event.participants.some(
    (p) => p.characterId.toString() === characterId.toString()
  );

  if (alreadyJoined) {
    res.status(400).json({
      success: false,
      error: 'Already participating in this event',
    });
    return;
  }

  // Check max participants
  if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
    res.status(400).json({
      success: false,
      error: 'Event is at maximum capacity',
    });
    return;
  }

  // Add participant
  event.participants.push({
    characterId,
    joinedAt: new Date(),
    contribution: 0,
    rewarded: false,
  });
  event.participantCount++;

  await event.save();

  // Track achievement: event_veteran (participate in 25 world events)
  safeAchievementUpdate(characterId.toString(), 'event_veteran', 1, 'world:joinEvent');

  res.status(200).json({
    success: true,
    message: `Joined event: ${event.name}`,
    data: {
      eventId: event._id,
      eventName: event.name,
      participantCount: event.participantCount,
    },
  });
});
