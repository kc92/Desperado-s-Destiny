/**
 * Worker Controller
 *
 * Handles HTTP requests for advanced worker management operations
 * Basic hire/fire is in property.controller - this handles training, wages, strikes, etc.
 */

import { Response } from 'express';
import { WorkerManagementService } from '../services/workerManagement.service';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

export class WorkerController {
  /**
   * GET /api/workers/listings
   * Generate available worker listings for hiring
   */
  static async getWorkerListings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { count, propertyLevel } = req.query;

      const listingCount = count ? parseInt(count as string, 10) : 5;
      const level = propertyLevel ? parseInt(propertyLevel as string, 10) : 1;

      if (listingCount < 1 || listingCount > 20) {
        res.status(400).json({
          success: false,
          error: 'Count must be between 1 and 20',
        });
        return;
      }

      const listings = WorkerManagementService.generateWorkerListings(listingCount, level);

      res.status(200).json({
        success: true,
        data: {
          listings,
          total: listings.length,
        },
      });
    } catch (error) {
      logger.error('Error generating worker listings:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate listings',
      });
    }
  }

  /**
   * POST /api/workers/hire
   * Hire a worker from listings
   */
  static async hireWorker(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId, characterId, listing } = req.body;

      if (!propertyId || !characterId || !listing) {
        res.status(400).json({
          success: false,
          error: 'propertyId, characterId, and listing are required',
        });
        return;
      }

      const worker = await WorkerManagementService.hireWorker(propertyId, characterId, listing);

      res.status(201).json({
        success: true,
        data: worker,
        message: `Hired ${worker.name} as ${worker.specialization}`,
      });
    } catch (error) {
      logger.error('Error hiring worker:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to hire worker',
      });
    }
  }

  /**
   * POST /api/workers/:workerId/fire
   * Fire a worker
   */
  static async fireWorker(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const result = await WorkerManagementService.fireWorker(workerId, characterId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error firing worker:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fire worker',
      });
    }
  }

  /**
   * POST /api/workers/:workerId/train
   * Train a worker to increase skill
   */
  static async trainWorker(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const worker = await WorkerManagementService.trainWorker(workerId, characterId);

      res.status(200).json({
        success: true,
        data: worker,
        message: `${worker.name} trained! Skill level: ${worker.skillLevel}`,
      });
    } catch (error) {
      logger.error('Error training worker:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to train worker',
      });
    }
  }

  /**
   * POST /api/workers/:workerId/rest
   * Rest a worker to restore morale
   */
  static async restWorker(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const worker = await WorkerManagementService.restWorker(workerId, characterId);

      res.status(200).json({
        success: true,
        data: worker,
        message: `${worker.name} rested. Morale: ${worker.morale}`,
      });
    } catch (error) {
      logger.error('Error resting worker:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rest worker',
      });
    }
  }

  /**
   * POST /api/workers/:workerId/resolve-strike
   * Resolve a worker strike
   */
  static async resolveStrike(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const { characterId, bonus } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const bonusAmount = bonus ? parseInt(bonus, 10) : 0;

      const worker = await WorkerManagementService.resolveStrike(workerId, characterId, bonusAmount);

      res.status(200).json({
        success: true,
        data: worker,
        message: bonusAmount > 0
          ? `Strike resolved with ${bonusAmount} gold bonus`
          : 'Strike resolved',
      });
    } catch (error) {
      logger.error('Error resolving strike:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve strike',
      });
    }
  }

  /**
   * POST /api/workers/pay-wages
   * Pay wages to all workers due
   */
  static async payWages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      const result = await WorkerManagementService.payWorkerWages(characterId);

      res.status(200).json({
        success: true,
        data: result,
        message: result.unpaidWorkers.length > 0
          ? `Paid ${result.workersPaid} workers (${result.totalCost} gold). Failed to pay: ${result.unpaidWorkers.join(', ')}`
          : `Paid ${result.workersPaid} workers (${result.totalCost} gold)`,
      });
    } catch (error) {
      logger.error('Error paying wages:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pay wages',
      });
    }
  }

  /**
   * GET /api/workers/property/:propertyId
   * Get all workers for a property
   */
  static async getPropertyWorkers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      const workers = await WorkerManagementService.getPropertyWorkers(propertyId);

      res.status(200).json({
        success: true,
        data: {
          workers,
          total: workers.length,
        },
      });
    } catch (error) {
      logger.error('Error getting property workers:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workers',
      });
    }
  }

  /**
   * GET /api/workers/property/:propertyId/available
   * Get available (unassigned) workers for a property
   */
  static async getAvailableWorkers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      const workers = await WorkerManagementService.getAvailableWorkers(propertyId);

      res.status(200).json({
        success: true,
        data: {
          workers,
          total: workers.length,
        },
      });
    } catch (error) {
      logger.error('Error getting available workers:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available workers',
      });
    }
  }

  /**
   * GET /api/workers/:workerId
   * Get worker details
   */
  static async getWorkerDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;

      const worker = await WorkerManagementService.getWorkerDetails(workerId);

      if (!worker) {
        res.status(404).json({
          success: false,
          error: 'Worker not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: worker,
      });
    } catch (error) {
      logger.error('Error getting worker details:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get worker details',
      });
    }
  }
}

export default WorkerController;
