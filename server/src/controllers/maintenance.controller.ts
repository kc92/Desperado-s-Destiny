/**
 * Maintenance Controller
 *
 * Phase 14: Risk Simulation - Decay System
 *
 * Handles property and mining claim maintenance, repair, and condition reporting.
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { DecayService } from '../services/decay.service';
import { Property } from '../models/Property.model';
import { MiningClaim } from '../models/MiningClaim.model';

/**
 * Get property condition report
 * GET /api/maintenance/properties/:propertyId/condition
 */
export const getPropertyCondition = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { propertyId } = req.params;

    const report = await DecayService.getPropertyConditionReport(propertyId);

    res.status(200).json({
      success: true,
      data: report,
    });
  }
);

/**
 * Repair property condition
 * POST /api/maintenance/properties/:propertyId/repair
 */
export const repairProperty = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;
    const { propertyId } = req.params;
    const { targetCondition } = req.body;

    // Verify ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    if (!property.ownerId || property.ownerId.toString() !== characterId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this property',
      });
    }

    // Default to max condition if not specified
    const target = targetCondition ?? 100;
    if (target < 0 || target > 100) {
      return res.status(400).json({
        success: false,
        error: 'Target condition must be between 0 and 100',
      });
    }

    if (target <= property.condition) {
      return res.status(400).json({
        success: false,
        error: 'Target condition must be higher than current condition',
      });
    }

    const result = await DecayService.repairProperty(characterId, propertyId, target);

    res.status(200).json({
      success: true,
      data: result,
      message: `Property repaired to ${result.newCondition}% condition for $${result.cost}`,
    });
  }
);

/**
 * Perform maintenance action on property
 * POST /api/maintenance/properties/:propertyId/maintain
 */
export const maintainProperty = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;
    const { propertyId } = req.params;
    const { actionType } = req.body;

    // Verify ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    if (!property.ownerId || property.ownerId.toString() !== characterId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this property',
      });
    }

    // Default to 'inspect' if not specified
    const action = actionType || 'inspect';
    const validActions = ['inspect', 'clean', 'minor_repair', 'secure', 'deep_clean'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action type. Valid actions: ${validActions.join(', ')}`,
      });
    }

    const result = await DecayService.performPropertyMaintenance(
      characterId,
      propertyId,
      action
    );

    res.status(200).json({
      success: true,
      data: result,
      message: `Maintenance performed. Condition now at ${result.newCondition}%`,
    });
  }
);

/**
 * Get mining claim condition report
 * GET /api/maintenance/claims/:claimId/condition
 */
export const getClaimCondition = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { claimId } = req.params;

    const report = await DecayService.getClaimConditionReport(claimId);

    res.status(200).json({
      success: true,
      data: report,
    });
  }
);

/**
 * Rehabilitate mining claim condition
 * POST /api/maintenance/claims/:claimId/rehabilitate
 */
export const rehabilitateClaim = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id;
    const { claimId } = req.params;
    const { targetCondition } = req.body;

    // Verify ownership
    const claim = await MiningClaim.findById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Mining claim not found',
      });
    }

    if (claim.characterId.toString() !== characterId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this mining claim',
      });
    }

    // Default to max condition if not specified
    const target = targetCondition ?? 100;
    if (target < 0 || target > 100) {
      return res.status(400).json({
        success: false,
        error: 'Target condition must be between 0 and 100',
      });
    }

    if (target <= claim.condition) {
      return res.status(400).json({
        success: false,
        error: 'Target condition must be higher than current condition',
      });
    }

    const result = await DecayService.rehabilitateClaim(characterId, claimId, target);

    res.status(200).json({
      success: true,
      data: result,
      message: `Mining claim rehabilitated to ${result.newCondition}% condition for $${result.cost}`,
    });
  }
);

/**
 * Get assets needing attention (maintenance/repair)
 * GET /api/maintenance/alerts
 */
export const getMaintenanceAlerts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    // Get properties needing maintenance (condition < 70)
    const propertiesNeedingMaintenance = await DecayService.findPropertiesNeedingMaintenance(
      characterId,
      70
    );

    // Get claims needing rehabilitation (condition < 70)
    const claimsNeedingRehab = await DecayService.findClaimsNeedingRehabilitation(
      characterId,
      70
    );

    res.status(200).json({
      success: true,
      data: {
        properties: propertiesNeedingMaintenance.map((p) => ({
          id: p._id,
          name: p.name,
          type: p.propertyType,
          location: p.locationId,
          condition: p.condition,
          conditionTier: p.getConditionTier(),
          needsRepair: p.condition < 50,
          needsMaintenance: p.condition >= 50 && p.condition < 70,
        })),
        claims: claimsNeedingRehab.map((c) => ({
          id: c._id,
          claimId: c.claimId,
          tier: c.tier,
          location: c.locationId,
          condition: c.condition,
          conditionTier: c.getConditionTier(),
          needsRehabilitation: c.condition < 50,
          needsAttention: c.condition >= 50 && c.condition < 70,
          isOverworked: c.isOverworked(),
        })),
        summary: {
          propertiesNeedingAttention: propertiesNeedingMaintenance.length,
          claimsNeedingAttention: claimsNeedingRehab.length,
          totalAlertsCount:
            propertiesNeedingMaintenance.length + claimsNeedingRehab.length,
        },
      },
    });
  }
);

/**
 * Get comprehensive asset health summary
 * GET /api/maintenance/health
 */
export const getAssetHealth = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const summary = await DecayService.getAssetHealthSummary(characterId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  }
);

/**
 * Get estimated repair/maintenance costs
 * GET /api/maintenance/estimate
 */
export const getMaintenanceEstimate = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    // Get all properties needing attention
    const properties = await DecayService.findPropertiesNeedingMaintenance(characterId, 90);
    const claims = await DecayService.findClaimsNeedingRehabilitation(characterId, 90);

    let totalPropertyRepairCost = 0;
    let totalClaimRehabCost = 0;

    const propertyEstimates = properties.map((p) => {
      const repairCost = p.calculateRepairCost(100);
      totalPropertyRepairCost += repairCost;
      return {
        id: p._id,
        name: p.name,
        currentCondition: p.condition,
        repairToFullCost: repairCost,
        repairTo90Cost: p.calculateRepairCost(90),
        repairTo70Cost: p.calculateRepairCost(70),
      };
    });

    const claimEstimates = claims.map((c) => {
      const report = {
        id: c._id,
        claimId: c.claimId,
        currentCondition: c.condition,
        rehabToFullCost: 0,
        rehabTo90Cost: 0,
        rehabTo70Cost: 0,
      };

      // Calculate rehabilitation costs based on tier
      const baseRateFull = (100 - c.condition) * (25 * c.tier);
      const baseRate90 = Math.max(0, (90 - c.condition)) * (25 * c.tier);
      const baseRate70 = Math.max(0, (70 - c.condition)) * (25 * c.tier);

      report.rehabToFullCost = Math.floor(baseRateFull);
      report.rehabTo90Cost = Math.floor(baseRate90);
      report.rehabTo70Cost = Math.floor(baseRate70);

      totalClaimRehabCost += report.rehabToFullCost;
      return report;
    });

    res.status(200).json({
      success: true,
      data: {
        properties: propertyEstimates,
        claims: claimEstimates,
        totals: {
          propertyRepairCost: totalPropertyRepairCost,
          claimRehabCost: totalClaimRehabCost,
          grandTotal: totalPropertyRepairCost + totalClaimRehabCost,
        },
      },
    });
  }
);
