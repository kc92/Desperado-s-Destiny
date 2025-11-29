/**
 * Location Routes
 * Routes for location-related operations
 */

import { Router } from 'express';
import { requireAuth, requireCharacter } from '../middleware/auth.middleware';
import locationController from '../controllers/location.controller';

const router = Router();

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/map', locationController.getTerritoryMap);
router.get('/town/buildings', locationController.getTownBuildings);
router.get('/region/:region', locationController.getLocationsByRegion);

// Building routes (public)
router.get('/buildings/:buildingId', locationController.getBuildingDetails);

// Building routes (protected)
router.post('/buildings/:buildingId/enter', requireAuth, requireCharacter, locationController.enterBuilding);
router.post('/buildings/exit', requireAuth, requireCharacter, locationController.exitBuilding);

// Town buildings route
router.get('/:townId/buildings', locationController.getBuildingsInTown);

// Protected routes (require authentication and character)
router.get('/current', requireAuth, requireCharacter, locationController.getCurrentLocation);
router.get('/current/actions', requireAuth, requireCharacter, locationController.getCurrentLocationActions);
router.get('/current/jobs', requireAuth, requireCharacter, locationController.getCurrentLocationJobs);
router.post('/current/jobs/:jobId', requireAuth, requireCharacter, locationController.performJob);
router.get('/current/shops', requireAuth, requireCharacter, locationController.getCurrentLocationShops);
router.post('/current/shops/:shopId/purchase', requireAuth, requireCharacter, locationController.purchaseItem);
router.post('/travel', requireAuth, requireCharacter, locationController.travelToLocation);

// This must come last to avoid matching other routes
router.get('/:id', locationController.getLocationById);

export default router;
