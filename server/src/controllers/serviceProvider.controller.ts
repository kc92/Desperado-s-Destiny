/**
 * Service Provider Controller
 *
 * Handles HTTP requests for wandering service provider interactions
 */

import { Request, Response } from 'express';
import { wanderingNPCService } from '../services/wanderingNpc.service';
import {
  GetServiceProvidersAtLocationRequest,
  GetProviderScheduleRequest,
  UseServiceRequest,
} from '@desperados/shared';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get service providers at a location
 * GET /api/service-providers/location/:locationId
 */
export const getProvidersAtLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { locationId } = req.params;
    const characterId = req.user?.characterId;

    const result = await wanderingNPCService.getProvidersAtLocation(
      locationId,
      characterId
    );

    res.json(result);
  }
);

/**
 * Get provider schedule
 * GET /api/service-providers/:providerId/schedule
 */
export const getProviderSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { providerId } = req.params;

    const result = await wanderingNPCService.getProviderSchedule(providerId);

    res.json(result);
  }
);

/**
 * Get available services from a provider
 * GET /api/service-providers/:providerId/services
 */
export const getAvailableServices = asyncHandler(
  async (req: Request, res: Response) => {
    const { providerId } = req.params;
    const characterId = req.user?.characterId;

    if (!characterId) {
      return res.status(401).json({
        success: false,
        message: 'Character ID required',
      });
    }

    const services = wanderingNPCService.getAvailableServices(
      providerId,
      characterId
    );

    res.json({
      success: true,
      services,
    });
  }
);

/**
 * Use a service
 * POST /api/service-providers/:providerId/use-service
 */
export const useService = asyncHandler(
  async (req: Request, res: Response) => {
    const { providerId } = req.params;
    const characterId = req.user?.characterId;

    if (!characterId) {
      return res.status(401).json({
        success: false,
        message: 'Character ID required',
      });
    }

    const requestData: UseServiceRequest = {
      providerId,
      characterId,
      serviceId: req.body.serviceId,
      paymentType: req.body.paymentType || 'gold',
      barterItems: req.body.barterItems,
    };

    const result = await wanderingNPCService.useService(requestData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  }
);

/**
 * Get all service providers
 * GET /api/service-providers
 */
export const getAllProviders = asyncHandler(
  async (req: Request, res: Response) => {
    const { WANDERING_SERVICE_PROVIDERS } = await import(
      '../data/wanderingServiceProviders'
    );

    res.json({
      success: true,
      providers: WANDERING_SERVICE_PROVIDERS.map((provider) => ({
        id: provider.id,
        name: provider.name,
        title: provider.title,
        profession: provider.profession,
        description: provider.description,
        faction: provider.faction,
        route: provider.route.map((stop) => ({
          locationName: stop.locationName,
          arrivalDay: stop.arrivalDay,
          departureDay: stop.departureDay,
        })),
      })),
    });
  }
);
