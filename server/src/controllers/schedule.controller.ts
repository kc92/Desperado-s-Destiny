/**
 * Schedule Controller
 *
 * Handles HTTP requests related to NPC schedules and locations
 */

import { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { TimeService } from '../services/time.service';
import {
  GetNPCsAtLocationResponse,
  GetNPCScheduleResponse,
  GetCurrentActivityResponse,
  CheckNPCAvailabilityResponse,
  GetAllNPCLocationsResponse,
  NPCActivity,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Get all NPCs currently at a specific location
 * GET /api/schedule/location/:locationId
 */
export const getNPCsAtLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { locationId } = req.params;
    const hour = req.query.hour ? parseInt(req.query.hour as string) : undefined;

    const npcsPresent = ScheduleService.getNPCsAtLocation(locationId, hour);
    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();

    const response: GetNPCsAtLocationResponse = {
      success: true,
      data: {
        locationId,
        locationName: npcsPresent[0]?.currentLocationName || 'Unknown Location',
        currentHour,
        npcsPresent,
        totalNPCs: npcsPresent.length,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting NPCs at location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NPCs at location',
    });
  }
};

/**
 * Get complete schedule for a specific NPC
 * GET /api/schedule/npc/:npcId
 */
export const getNPCSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { npcId } = req.params;
    const includeNextActivities = req.query.includeNext === 'true';

    const schedule = ScheduleService.getNPCSchedule(npcId);

    if (!schedule) {
      res.status(404).json({
        success: false,
        error: `NPC schedule not found for ID: ${npcId}`,
      });
      return;
    }

    const currentActivity = ScheduleService.getCurrentActivity(npcId);

    if (!currentActivity) {
      res.status(500).json({
        success: false,
        error: 'Failed to get current activity',
      });
      return;
    }

    const upcomingActivities = includeNextActivities
      ? ScheduleService.getUpcomingActivities(npcId, 5)
      : undefined;

    const response: GetNPCScheduleResponse = {
      success: true,
      data: {
        schedule,
        currentActivity,
        upcomingActivities,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting NPC schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NPC schedule',
    });
  }
};

/**
 * Get current activity for a specific NPC
 * GET /api/schedule/npc/:npcId/current
 */
export const getCurrentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { npcId } = req.params;
    const hour = req.query.hour ? parseInt(req.query.hour as string) : undefined;

    const activityState = ScheduleService.getCurrentActivity(npcId, hour);

    if (!activityState) {
      res.status(404).json({
        success: false,
        error: `NPC not found or no schedule: ${npcId}`,
      });
      return;
    }

    const response: GetCurrentActivityResponse = {
      success: true,
      data: {
        activityState,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting current activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current activity',
    });
  }
};

/**
 * Check if NPC is available for interaction
 * GET /api/schedule/npc/:npcId/available
 */
export const checkNPCAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { npcId } = req.params;
    const hour = req.query.hour ? parseInt(req.query.hour as string) : undefined;

    const activityState = ScheduleService.getCurrentActivity(npcId, hour);

    if (!activityState) {
      res.status(404).json({
        success: false,
        error: `NPC not found: ${npcId}`,
      });
      return;
    }

    const isAvailable = activityState.isAvailable;
    let availableAt: number | undefined;

    // If not available, find when they will be available
    if (!isAvailable) {
      const upcomingActivities = ScheduleService.getUpcomingActivities(npcId, 10);
      const nextAvailable = upcomingActivities.find(entry => entry.interruptible);
      availableAt = nextAvailable?.hour;
    }

    const response: CheckNPCAvailabilityResponse = {
      success: true,
      data: {
        isAvailable,
        reason: !isAvailable
          ? `${activityState.npcName} is ${activityState.currentActivity} and cannot be disturbed.`
          : undefined,
        availableAt,
        currentActivity: activityState.currentActivity,
        currentLocation: activityState.currentLocation,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error checking NPC availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check NPC availability',
    });
  }
};

/**
 * Get all NPC locations at current time
 * GET /api/schedule/locations
 */
export const getAllNPCLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const hour = req.query.hour ? parseInt(req.query.hour as string) : undefined;
    const locationFilter = req.query.location as string | undefined;
    const activityFilter = req.query.activity as NPCActivity | undefined;

    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();
    const locationMap = ScheduleService.getAllNPCLocations(currentHour);

    // Convert map to object structure
    const byLocation: {
      [locationId: string]: {
        locationName: string;
        npcs: any[];
      };
    } = {};

    let allNPCStates: any[] = [];

    locationMap.forEach((npcs, locationId) => {
      // Apply filters
      let filteredNPCs = npcs;

      if (locationFilter && locationId !== locationFilter) {
        return; // Skip this location
      }

      if (activityFilter) {
        filteredNPCs = npcs.filter(npc => npc.currentActivity === activityFilter);
      }

      if (filteredNPCs.length > 0) {
        byLocation[locationId] = {
          locationName: filteredNPCs[0].currentLocationName,
          npcs: filteredNPCs,
        };
        allNPCStates.push(...filteredNPCs);
      }
    });

    const response: GetAllNPCLocationsResponse = {
      success: true,
      data: {
        currentHour,
        npcStates: allNPCStates,
        totalNPCs: allNPCStates.length,
        byLocation,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Error getting all NPC locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NPC locations',
    });
  }
};

/**
 * Get NPCs by activity type
 * GET /api/schedule/activity/:activityType
 */
export const getNPCsByActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityType } = req.params;
    const hour = req.query.hour ? parseInt(req.query.hour as string) : undefined;

    // Validate activity type
    if (!Object.values(NPCActivity).includes(activityType as NPCActivity)) {
      res.status(400).json({
        success: false,
        error: `Invalid activity type: ${activityType}`,
      });
      return;
    }

    const npcs = ScheduleService.getNPCsByActivity(activityType as NPCActivity, hour);

    res.json({
      success: true,
      data: {
        activity: activityType,
        currentHour: hour !== undefined ? hour : TimeService.getCurrentHour(),
        npcs,
        totalNPCs: npcs.length,
      },
    });
  } catch (error) {
    logger.error('Error getting NPCs by activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NPCs by activity',
    });
  }
};

/**
 * Get activity statistics for current hour
 * GET /api/schedule/statistics
 */
export const getActivityStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const hour = req.query.hour ? parseInt(req.query.hour as string) : undefined;

    const stats = ScheduleService.getActivityStatistics(hour);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting activity statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity statistics',
    });
  }
};

/**
 * Get interaction context for an NPC
 * GET /api/schedule/npc/:npcId/interaction
 */
export const getNPCInteractionContext = async (req: Request, res: Response): Promise<void> => {
  try {
    const { npcId } = req.params;
    const reputation = req.query.reputation ? parseInt(req.query.reputation as string) : 50;

    const context = ScheduleService.getNPCInteractionContext(npcId, reputation);

    if (!context) {
      res.status(404).json({
        success: false,
        error: `NPC not found: ${npcId}`,
      });
      return;
    }

    res.json({
      success: true,
      data: context,
    });
  } catch (error) {
    logger.error('Error getting NPC interaction context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get interaction context',
    });
  }
};

/**
 * Get all available NPC schedules (admin/debug)
 * GET /api/schedule/all
 */
export const getAllSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const schedules = ScheduleService.getAllNPCSchedules();

    res.json({
      success: true,
      data: {
        schedules,
        totalNPCs: schedules.length,
      },
    });
  } catch (error) {
    logger.error('Error getting all schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get schedules',
    });
  }
};
