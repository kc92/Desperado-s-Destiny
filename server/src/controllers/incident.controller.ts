/**
 * Incident Controller
 *
 * Phase 14.2: Risk Simulation - Incident System
 *
 * Handles incident viewing, response, and history endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { IncidentService } from '../services/incident.service';
import { Incident } from '../models/Incident.model';
import { IncidentResponseType, IncidentStatus } from '@desperados/shared';

/**
 * Get active incidents for current character
 * GET /api/incidents/active
 */
export const getActiveIncidents = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const incidents = await IncidentService.getActiveIncidents(characterId);

    res.status(200).json({
      success: true,
      data: {
        incidents,
        count: incidents.length,
      },
    });
  }
);

/**
 * Get incident details
 * GET /api/incidents/:incidentId
 */
export const getIncidentDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { incidentId } = req.params;

    const incident = await IncidentService.getIncidentDetails(incidentId, characterId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        incident,
        timeRemaining: incident.getTimeRemaining(),
        canRespond: incident.canRespond(),
      },
    });
  }
);

/**
 * Respond to an incident
 * POST /api/incidents/:incidentId/respond
 */
export const respondToIncident = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { incidentId } = req.params;
    const { responseType, useInsurance } = req.body;

    if (!responseType) {
      return res.status(400).json({
        success: false,
        error: 'Response type is required',
      });
    }

    // Validate response type
    if (!Object.values(IncidentResponseType).includes(responseType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid response type',
      });
    }

    const result = await IncidentService.respondToIncident(
      incidentId,
      characterId,
      responseType,
      useInsurance || false
    );

    res.status(200).json({
      success: true,
      data: result,
      message: result.message,
    });
  }
);

/**
 * Get incident history
 * GET /api/incidents/history
 */
export const getIncidentHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const incidents = await IncidentService.getIncidentHistory(characterId, limit);

    res.status(200).json({
      success: true,
      data: {
        incidents: incidents.map(incident => ({
          incidentId: incident._id.toString(),
          type: incident.type,
          severity: incident.severity,
          targetName: incident.targetName,
          targetType: incident.targetType,
          occurredAt: incident.occurredAt,
          resolvedAt: incident.resolvedAt,
          status: incident.status,
          damageEstimate: incident.totalDamageEstimate,
          actualDamage: incident.actualDamage,
          recovered: incident.recoveredAmount,
          selectedResponse: incident.selectedResponse,
          insuranceClaimed: incident.insuranceClaimed,
        })),
        count: incidents.length,
      },
    });
  }
);

/**
 * Get incident statistics
 * GET /api/incidents/stats
 */
export const getIncidentStats = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    // Get active count
    const activeCount = await Incident.countActiveByCharacter(characterId);

    // Get history stats (last 30 days) - use aggregation to prevent OOM
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const statsAgg = await Incident.aggregate([
      {
        $match: {
          characterId,
          occurredAt: { $gte: thirtyDaysAgo },
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', IncidentStatus.RESOLVED] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', IncidentStatus.FAILED] }, 1, 0] } },
          prevented: { $sum: { $cond: [{ $eq: ['$status', IncidentStatus.PREVENTED] }, 1, 0] } },
          totalDamage: { $sum: { $ifNull: ['$actualDamage', 0] } },
          totalRecovered: { $sum: { $ifNull: ['$recoveredAmount', 0] } },
          insuranceClaimCount: { $sum: { $cond: ['$insuranceClaimed', 1, 0] } },
          insuranceRecovery: { $sum: { $ifNull: ['$insuranceRecovery', 0] } },
        }
      }
    ]);

    // Get type breakdown
    const byTypeAgg = await Incident.aggregate([
      { $match: { characterId, occurredAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get severity breakdown
    const bySeverityAgg = await Incident.aggregate([
      { $match: { characterId, occurredAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const baseStats = statsAgg[0] || {
      total: 0,
      resolved: 0,
      failed: 0,
      prevented: 0,
      totalDamage: 0,
      totalRecovered: 0,
      insuranceClaimCount: 0,
      insuranceRecovery: 0,
    };

    const byType: Record<string, number> = {};
    for (const item of byTypeAgg) {
      byType[item._id] = item.count;
    }

    const bySeverity: Record<string, number> = {};
    for (const item of bySeverityAgg) {
      bySeverity[item._id] = item.count;
    }

    const stats = {
      activeIncidents: activeCount,
      last30Days: {
        total: baseStats.total,
        resolved: baseStats.resolved,
        failed: baseStats.failed,
        prevented: baseStats.prevented,
        totalDamage: baseStats.totalDamage,
        totalRecovered: baseStats.totalRecovered,
        insuranceClaimCount: baseStats.insuranceClaimCount,
        insuranceRecovery: baseStats.insuranceRecovery,
      },
    };

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        byType,
        bySeverity,
      },
    });
  }
);

/**
 * Ignore an incident (accept full damage)
 * POST /api/incidents/:incidentId/ignore
 */
export const ignoreIncident = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { incidentId } = req.params;

    const result = await IncidentService.respondToIncident(
      incidentId,
      characterId,
      IncidentResponseType.IGNORE,
      false
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Incident ignored. Full damage applied.',
    });
  }
);

/**
 * Claim insurance for an incident
 * POST /api/incidents/:incidentId/claim-insurance
 */
export const claimInsurance = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { incidentId } = req.params;

    const result = await IncidentService.respondToIncident(
      incidentId,
      characterId,
      IncidentResponseType.INSURANCE_CLAIM,
      true
    );

    res.status(200).json({
      success: true,
      data: result,
      message: result.insuranceRecovery > 0
        ? `Insurance claim approved! Recovered $${result.insuranceRecovery}.`
        : 'Insurance claim filed but incident type not covered.',
    });
  }
);
