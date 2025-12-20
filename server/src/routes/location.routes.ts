/**
 * Location Routes
 * Routes for location-related operations
 */

import { Router } from 'express';
import { requireAuth, requireCharacter } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import locationController from '../controllers/location.controller';

const router = Router();

// Public routes
router.get('/', asyncHandler(locationController.getAllLocations));
router.get('/map', asyncHandler(locationController.getTerritoryMap));
router.get('/town/buildings', asyncHandler(locationController.getTownBuildings));
router.get('/region/:region', asyncHandler(locationController.getLocationsByRegion));

// Building routes (public)
router.get('/buildings/:buildingId', asyncHandler(locationController.getBuildingDetails));

// Building routes (protected)
router.post('/buildings/:buildingId/enter', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.enterBuilding));
router.post('/buildings/exit', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.exitBuilding));

// Town buildings route
router.get('/:townId/buildings', asyncHandler(locationController.getBuildingsInTown));

// Protected routes (require authentication and character)
router.get('/current', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocation));
router.get('/current/actions', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocationActions));
router.get('/current/jobs', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocationJobs));
router.post('/current/jobs/:jobId', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.performJob));
router.post('/current/jobs/:jobId/start', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.startJob));
router.post('/current/jobs/:jobId/play', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.playJob));
router.get('/current/shops', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocationShops));
router.post('/current/shops/:shopId/purchase', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.purchaseItem));
router.get('/current/travel-options', requireAuth, requireCharacter, asyncHandler(locationController.getZoneAwareTravel));
router.post('/travel', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.travelToLocation));

// This must come last to avoid matching other routes
router.get('/:id', asyncHandler(locationController.getLocationById));

export default router;
