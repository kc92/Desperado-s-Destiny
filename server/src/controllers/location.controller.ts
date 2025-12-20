/**
 * Location Controller
 * Handles location-related operations
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { Location } from '../models/Location.model';
import { Character } from '../models/Character.model';
import { LocationService } from '../services/location.service';
import { TimeService } from '../services/time.service';
import { CrowdService } from '../services/crowd.service';
import { ScheduleService } from '../services/schedule.service';
import { processGameAction, resolveActionGame } from '../services/actionDeck.service';
import { PlayerAction, getAvailableActions } from '../services/deckGames';

/**
 * Get all locations
 * GET /api/locations
 */
export const getAllLocations = asyncHandler(
  async (req: Request, res: Response) => {
    const { region, type } = req.query;

    const filter: any = { isHidden: false };
    if (region) filter.region = region;
    if (type) filter.type = type;

    const locations = await Location.find(filter).lean();

    res.status(200).json({
      success: true,
      data: { locations },
    });
  }
);

/**
 * Get location by ID
 * GET /api/locations/:id
 */
export const getLocationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const location = await Location.findById(id).lean();

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    // Get connected locations
    const connectedIds = location.connections.map(c => c.targetLocationId);
    const connectedLocations = await Location.find({
      _id: { $in: connectedIds },
    }).lean();

    // Get crowd state
    const crowdState = await CrowdService.getCrowdLevel(id);
    const crowdEffects = crowdState
      ? CrowdService.getCrimeModifier(crowdState.currentLevel)
      : null;

    // Get NPCs currently at this location
    const npcsPresent = ScheduleService.getNPCsAtLocation(id);
    const currentHour = TimeService.getCurrentHour();

    res.status(200).json({
      success: true,
      data: {
        location: {
          ...location,
          connectedLocations,
          crowdState,
          crowdEffects,
          npcsPresent,
          currentHour,
        },
      },
    });
  }
);

/**
 * Get current character's location
 * GET /api/locations/current
 */
export const getCurrentLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.character?._id;

    if (!characterId) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found',
      });
    }

    // currentLocation can be either an ObjectId or a string slug like "red-gulch"
    const mongoose = await import('mongoose');
    let location;
    if (mongoose.Types.ObjectId.isValid(character.currentLocation)) {
      location = await Location.findById(character.currentLocation).lean();
    } else {
      location = await Location.findOne({ id: character.currentLocation }).lean();
    }

    if (!location) {
      // Default to town square if location not found
      const defaultLocation = await Location.findOne({ type: 'town_square' }).lean();
      return res.status(200).json({
        success: true,
        data: { location: defaultLocation },
      });
    }

    // Get connected locations
    const connectedIds = location.connections.map(c => c.targetLocationId);
    const connectedLocations = await Location.find({
      _id: { $in: connectedIds },
    }).lean();

    // Get crowd state
    const locationIdStr = (location as any)._id?.toString() || '';
    const crowdState = await CrowdService.getCrowdLevel(locationIdStr);
    const crowdEffects = crowdState
      ? CrowdService.getCrimeModifier(crowdState.currentLevel)
      : null;

    res.status(200).json({
      success: true,
      data: {
        location: {
          ...location,
          connectedLocations,
          crowdState,
          crowdEffects,
        },
      },
    });
  }
);

/**
 * Get locations by region
 * GET /api/locations/region/:region
 */
export const getLocationsByRegion = asyncHandler(
  async (req: Request, res: Response) => {
    const { region } = req.params;

    const locations = await Location.find({
      region,
      isHidden: false,
    }).lean();

    res.status(200).json({
      success: true,
      data: { region, locations },
    });
  }
);

/**
 * Get town buildings (for town hub display)
 * GET /api/locations/town/buildings
 */
export const getTownBuildings = asyncHandler(
  async (req: Request, res: Response) => {
    const buildings = await Location.find({
      region: 'town',
      isHidden: false,
    })
      .select('name description shortDescription type icon availableActions requirements isUnlocked')
      .lean();

    res.status(200).json({
      success: true,
      data: { buildings },
    });
  }
);

/**
 * Travel to a new location
 * POST /api/locations/travel
 */
export const travelToLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { targetLocationId } = req.body;
    const characterId = req.character?._id;

    if (!characterId) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found',
      });
    }

    // Check if jailed
    if (character.isCurrentlyJailed()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot travel while in jail',
      });
    }

    // Get current location
    const currentLocation = await Location.findById(character.currentLocation);

    // Get target location
    const targetLocation = await Location.findById(targetLocationId);
    if (!targetLocation) {
      return res.status(404).json({
        success: false,
        message: 'Target location not found',
      });
    }

    // Check if target is connected or in same region (town)
    let travelTime = 0;
    let energyCost = 0;

    if (currentLocation) {
      const connection = currentLocation.connections.find(
        c => c.targetLocationId === targetLocationId
      );

      if (connection) {
        travelTime = connection.travelTime;
        energyCost = connection.energyCost;
      } else if (currentLocation.region === 'town' && targetLocation.region === 'town') {
        // Within town, instant travel
        travelTime = 0;
        energyCost = 0;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Cannot travel to that location from here',
        });
      }
    }

    // Check energy
    if (energyCost > 0) {
      character.regenerateEnergy();
      if (character.energy < energyCost) {
        return res.status(400).json({
          success: false,
          message: `Not enough energy. Need ${energyCost}, have ${Math.floor(character.energy)}`,
        });
      }
      character.energy -= energyCost;
    }

    // Check requirements
    if (targetLocation.requirements) {
      const req = targetLocation.requirements;

      if (req.minLevel && character.level < req.minLevel) {
        return res.status(400).json({
          success: false,
          message: `Requires level ${req.minLevel}`,
        });
      }

      if (req.gangMember && !character.gangId) {
        return res.status(400).json({
          success: false,
          message: 'Must be in a gang to access this location',
        });
      }
    }

    // Update character location
    character.currentLocation = targetLocationId;
    character.lastActive = new Date();
    await character.save();

    // Get connected locations for response
    const connectedIds = targetLocation.connections.map(c => c.targetLocationId);
    const connectedLocations = await Location.find({
      _id: { $in: connectedIds },
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        result: {
          success: true,
          newLocation: {
            ...targetLocation.toJSON(),
            connectedLocations,
          },
          travelTime,
          energySpent: energyCost,
        },
        character: {
          currentLocation: character.currentLocation,
          energy: Math.floor(character.energy),
        },
      },
    });
  }
);

/**
 * Get available actions at current location
 * GET /api/locations/current/actions
 */
export const getCurrentLocationActions = asyncHandler(
  async (req: Request, res: Response) => {
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const actions = await LocationService.getAvailableActions(
      character.currentLocation,
      character
    );

    res.status(200).json({
      success: true,
      data: { actions },
    });
  }
);

/**
 * Get available jobs at current location
 * GET /api/locations/current/jobs
 */
export const getCurrentLocationJobs = asyncHandler(
  async (req: Request, res: Response) => {
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const jobs = await LocationService.getAvailableJobs(
      character.currentLocation,
      character
    );

    res.status(200).json({
      success: true,
      data: { jobs },
    });
  }
);

/**
 * Perform a job at current location
 * POST /api/locations/current/jobs/:jobId
 */
export const performJob = asyncHandler(
  async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const result = await LocationService.performJob(
      character._id.toString(),
      character.currentLocation,
      jobId
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Refresh character data
    const updatedCharacter = await Character.findById(character._id);

    res.status(200).json({
      success: true,
      data: {
        result,
        character: updatedCharacter?.toSafeObject(),
      },
    });
  }
);

/**
 * Start a job with deck game
 * POST /api/locations/current/jobs/:jobId/start
 */
export const startJob = asyncHandler(
  async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const result = await LocationService.startJobWithDeck(
      character._id.toString(),
      character.currentLocation,
      jobId
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        gameState: result.gameState,
        availableActions: getAvailableActions(result.gameState),
        jobInfo: result.jobInfo,
      },
    });
  }
);

/**
 * Play a job deck game (process game action)
 * POST /api/locations/current/jobs/:jobId/play
 */
export const playJob = asyncHandler(
  async (req: Request, res: Response) => {
    const { gameId, action } = req.body as { gameId: string; action: PlayerAction };
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    if (!gameId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Missing gameId or action',
      });
    }

    // Check if game should be resolved immediately (forfeit/submit)
    if (action.type === 'forfeit' || action.type === 'submit') {
      // Resolve the game and apply job rewards
      const result = await resolveActionGame(gameId);

      // Refresh character data
      const updatedCharacter = await Character.findById(character._id);

      return res.status(200).json({
        success: true,
        data: {
          completed: true,
          gameResult: result.gameResult,
          actionResult: result.actionResult,
          character: updatedCharacter?.toSafeObject(),
        },
      });
    }

    // Process game action
    const newState = await processGameAction(gameId, action);

    // Check if game is now complete (status set by game logic)
    if (newState.status === 'resolved' || newState.status === 'busted') {
      // Resolve the game and apply job rewards
      const result = await resolveActionGame(gameId);

      // Refresh character data
      const updatedCharacter = await Character.findById(character._id);

      return res.status(200).json({
        success: true,
        data: {
          completed: true,
          gameResult: result.gameResult,
          actionResult: result.actionResult,
          character: updatedCharacter?.toSafeObject(),
        },
      });
    }

    // Game continues
    res.status(200).json({
      success: true,
      data: {
        completed: false,
        gameState: newState,
        availableActions: getAvailableActions(newState),
      },
    });
  }
);

/**
 * Get shops at current location
 * GET /api/locations/current/shops
 */
export const getCurrentLocationShops = asyncHandler(
  async (req: Request, res: Response) => {
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const location = await Location.findById(character.currentLocation);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Current location not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { shops: location.shops },
    });
  }
);

/**
 * Purchase an item from a shop
 * POST /api/locations/current/shops/:shopId/purchase
 */
export const purchaseItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { shopId } = req.params;
    const { itemId } = req.body;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
      });
    }

    const result = await LocationService.purchaseItem(
      character._id.toString(),
      character.currentLocation,
      shopId,
      itemId
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Refresh character data
    const updatedCharacter = await Character.findById(character._id);

    res.status(200).json({
      success: true,
      data: {
        result,
        character: updatedCharacter?.toSafeObject(),
      },
    });
  }
);

/**
 * Get territory map with all locations
 * GET /api/locations/map
 */
export const getTerritoryMap = asyncHandler(
  async (req: Request, res: Response) => {
    const locations = await LocationService.getAllLocationsForMap();

    res.status(200).json({
      success: true,
      data: { locations },
    });
  }
);

/**
 * Get all buildings in a specific town
 * GET /api/locations/:townId/buildings
 */
export const getBuildingsInTown = asyncHandler(
  async (req: Request, res: Response) => {
    const { townId } = req.params;

    // Find the town
    const town = await Location.findById(townId);
    if (!town) {
      return res.status(404).json({
        success: false,
        message: 'Town not found',
      });
    }

    // Find buildings where parentId matches the town
    const buildings = await Location.find({
      parentId: town._id,
      isHidden: false,
    })
      .select('name type description shortDescription icon operatingHours requirements npcs availableActions shops')
      .lean();

    // Get current time state
    const timeState = TimeService.getCurrentTimeState();

    // Check operating hours to set isOpen flag with enhanced time information
    const buildingsWithStatus = buildings.map(building => {
      const accessResult = TimeService.isBuildingOpen(
        building.type,
        building.operatingHours
      );

      return {
        id: building._id,
        name: building.name,
        type: building.type,
        description: building.shortDescription || building.description,
        icon: building.icon,
        isOpen: accessResult.isOpen,
        opensAt: accessResult.opensAt,
        closesAt: accessResult.closesAt,
        closedReason: accessResult.reason,
        currentPeriod: timeState.currentPeriod,
      };
    });

    res.status(200).json({
      success: true,
      data: { buildings: buildingsWithStatus },
    });
  }
);

/**
 * Enter a building
 * POST /api/locations/buildings/:buildingId/enter
 */
export const enterBuilding = asyncHandler(
  async (req: Request, res: Response) => {
    const { buildingId } = req.params;
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const building = await Location.findById(buildingId);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found',
      });
    }

    // Check operating hours using time service
    const accessResult = TimeService.isBuildingOpen(
      building.type,
      building.operatingHours
    );

    if (!accessResult.isOpen) {
      return res.status(400).json({
        success: false,
        message: `${building.name} is closed. ${accessResult.reason}`,
        data: {
          opensAt: accessResult.opensAt,
          closesAt: accessResult.closesAt,
          currentPeriod: accessResult.currentPeriod,
        },
      });
    }

    // Check requirements
    if (building.requirements) {
      const req = building.requirements;

      if (req.minLevel && character.level < req.minLevel) {
        return res.status(400).json({
          success: false,
          message: `Requires level ${req.minLevel}`,
        });
      }

      // TODO: Implement reputation check when character reputation system is added
      // if (req.minReputation && character.reputation < req.minReputation) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Requires reputation of ${req.minReputation}`,
      //   });
      // }

      if ((req as any).maxWanted !== undefined && character.wantedLevel > (req as any).maxWanted) {
        return res.status(400).json({
          success: false,
          message: `Your wanted level is too high (max ${(req as any).maxWanted})`,
        });
      }

      if (req.gangMember && !character.gangId) {
        return res.status(400).json({
          success: false,
          message: 'Must be in a gang to access this building',
        });
      }
    }

    // Update character location to the building
    const characterDoc = await Character.findById(character._id);
    if (!characterDoc) {
      return res.status(404).json({
        success: false,
        message: 'Character not found',
      });
    }

    characterDoc.currentLocation = building._id.toString();
    characterDoc.lastActive = new Date();
    await characterDoc.save();

    // Get crowd state for this building
    const crowdState = await CrowdService.getCrowdLevel(building._id.toString());
    const crowdEffects = crowdState
      ? CrowdService.getCrimeModifier(crowdState.currentLevel)
      : null;

    res.status(200).json({
      success: true,
      data: {
        building: {
          id: building._id,
          name: building.name,
          type: building.type,
          description: building.description,
          atmosphere: building.atmosphere,
          npcs: building.npcs,
          availableActions: building.availableActions,
          shops: building.shops,
          jobs: building.jobs,
          crowdState,
          crowdEffects,
        },
        character: {
          currentLocation: characterDoc.currentLocation,
        },
      },
    });
  }
);

/**
 * Exit current building back to parent town
 * POST /api/locations/buildings/exit
 */
export const exitBuilding = asyncHandler(
  async (req: Request, res: Response) => {
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    // Get current building
    const currentBuilding = await Location.findById(character.currentLocation);
    if (!currentBuilding) {
      return res.status(404).json({
        success: false,
        message: 'Current location not found',
      });
    }

    // Check if in a building (has parent)
    if (!currentBuilding.parentId) {
      return res.status(400).json({
        success: false,
        message: 'Not currently in a building',
      });
    }

    // Get parent town
    const parentTown = await Location.findById(currentBuilding.parentId);
    if (!parentTown) {
      return res.status(404).json({
        success: false,
        message: 'Parent location not found',
      });
    }

    // Update character location to parent town
    const characterDoc = await Character.findById(character._id);
    if (!characterDoc) {
      return res.status(404).json({
        success: false,
        message: 'Character not found',
      });
    }

    characterDoc.currentLocation = parentTown._id.toString();
    characterDoc.lastActive = new Date();
    await characterDoc.save();

    res.status(200).json({
      success: true,
      data: {
        location: {
          id: parentTown._id,
          name: parentTown.name,
          type: parentTown.type,
          description: parentTown.description,
        },
        character: {
          currentLocation: characterDoc.currentLocation,
        },
      },
    });
  }
);

/**
 * Get building details
 * GET /api/locations/buildings/:buildingId
 */
export const getBuildingDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { buildingId } = req.params;

    const building = await Location.findById(buildingId).lean();
    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found',
      });
    }

    // Check operating hours and get time-based description
    const accessResult = TimeService.isBuildingOpen(
      building.type,
      building.operatingHours
    );

    const timeState = TimeService.getCurrentTimeState();
    const atmosphereText = TimeService.getLocationDescription(
      building.atmosphere || building.description,
      building.type
    );

    res.status(200).json({
      success: true,
      data: {
        building: {
          id: building._id,
          name: building.name,
          type: building.type,
          description: building.description,
          shortDescription: building.shortDescription,
          atmosphere: atmosphereText,
          icon: building.icon,
          imageUrl: building.imageUrl,
          operatingHours: building.operatingHours,
          isOpen: accessResult.isOpen,
          opensAt: accessResult.opensAt,
          closesAt: accessResult.closesAt,
          closedReason: accessResult.reason,
          currentPeriod: timeState.currentPeriod,
          requirements: building.requirements,
          npcs: building.npcs,
          availableActions: building.availableActions,
          shops: building.shops,
          jobs: building.jobs,
          dominantFaction: building.dominantFaction,
        },
        timeState,
      },
    });
  }
);

/**
 * Get zone-aware travel options for current location
 * GET /api/locations/current/travel-options
 */
export const getZoneAwareTravel = asyncHandler(
  async (req: Request, res: Response) => {
    const character = req.character;

    if (!character) {
      return res.status(401).json({
        success: false,
        message: 'No character selected',
      });
    }

    const travelOptions = await LocationService.getConnectedLocationsWithZones(
      character.currentLocation
    );

    res.status(200).json({
      success: true,
      data: travelOptions,
    });
  }
);

export default {
  getAllLocations,
  getLocationById,
  getCurrentLocation,
  getLocationsByRegion,
  getTownBuildings,
  travelToLocation,
  getCurrentLocationActions,
  getCurrentLocationJobs,
  performJob,
  startJob,
  playJob,
  getCurrentLocationShops,
  purchaseItem,
  getTerritoryMap,
  getBuildingsInTown,
  enterBuilding,
  exitBuilding,
  getBuildingDetails,
  getZoneAwareTravel,
};
