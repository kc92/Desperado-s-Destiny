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

    // Get history stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentIncidents = await Incident.find({
      characterId,
      occurredAt: { $gte: thirtyDaysAgo },
    });

    const stats = {
      activeIncidents: activeCount,
      last30Days: {
        total: recentIncidents.length,
        resolved: recentIncidents.filter(i => i.status === IncidentStatus.RESOLVED).length,
        failed: recentIncidents.filter(i => i.status === IncidentStatus.FAILED).length,
        prevented: recentIncidents.filter(i => i.status === IncidentStatus.PREVENTED).length,
        totalDamage: recentIncidents.reduce((sum, i) => sum + (i.actualDamage || 0), 0),
        totalRecovered: recentIncidents.reduce((sum, i) => sum + (i.recoveredAmount || 0), 0),
        insuranceClaimCount: recentIncidents.filter(i => i.insuranceClaimed).length,
        insuranceRecovery: recentIncidents.reduce((sum, i) => sum + (i.insuranceRecovery || 0), 0),
      },
    };

    // Group by type
    const byType: Record<string, number> = {};
    for (const incident of recentIncidents) {
      byType[incident.type] = (byType[incident.type] || 0) + 1;
    }

    // Group by severity
    const bySeverity: Record<string, number> = {};
    for (const incident of recentIncidents) {
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
    }

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
