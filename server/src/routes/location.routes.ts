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

// PRODUCTION FIX: All location routes now require authentication
// This prevents information disclosure and ensures only logged-in players can browse locations
router.get('/', requireAuth, asyncHandler(locationController.getAllLocations));
router.get('/map', requireAuth, asyncHandler(locationController.getTerritoryMap));
router.get('/town/buildings', requireAuth, asyncHandler(locationController.getTownBuildings));
router.get('/region/:region', requireAuth, asyncHandler(locationController.getLocationsByRegion));

// Building routes (now require auth)
router.get('/buildings/:buildingId', requireAuth, asyncHandler(locationController.getBuildingDetails));

// Building routes (protected)
router.post('/buildings/:buildingId/enter', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.enterBuilding));
router.post('/buildings/exit', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.exitBuilding));

// Town buildings route (now require auth)
router.get('/:townId/buildings', requireAuth, asyncHandler(locationController.getBuildingsInTown));

// Protected routes (require authentication and character)
router.get('/current', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocation));
router.get('/current/actions', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocationActions));
router.get('/current/actions/filtered', requireAuth, requireCharacter, asyncHandler(locationController.getFilteredLocationActions));
router.get('/current/jobs', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocationJobs));
router.post('/current/jobs/:jobId', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.performJob));
router.post('/current/jobs/:jobId/start', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.startJob));
router.post('/current/jobs/:jobId/play', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.playJob));
router.get('/current/shops', requireAuth, requireCharacter, asyncHandler(locationController.getCurrentLocationShops));
router.post('/current/shops/:shopId/purchase', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.purchaseItem));
router.get('/current/travel-options', requireAuth, requireCharacter, asyncHandler(locationController.getZoneAwareTravel));
router.get('/current/hostiles', requireAuth, requireCharacter, asyncHandler(locationController.getLocationHostiles));
router.post('/travel', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(locationController.travelToLocation));

// This must come last to avoid matching other routes (now require auth)
router.get('/:id', requireAuth, asyncHandler(locationController.getLocationById));

export default router;
