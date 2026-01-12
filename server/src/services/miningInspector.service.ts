/**
 * Mining Inspector Service
 *
 * Phase 13: Deep Mining System
 *
 * Handles law enforcement patrols, inspections of illegal claims,
 * bribery mechanics, and consequences.
 */

import mongoose from 'mongoose';
import { IllegalClaim, IIllegalClaimDoc } from '../models/IllegalClaim.model';
import { Character } from '../models/Character.model';
import {
  ClaimLegalStatus,
  SuspicionLevel,
  SuspicionEventType,
  InspectorType,
  InspectionResult,
} from '@desperados/shared';
import {
  INSPECTION_TIMING,
  INSPECTOR_BRIBERY,
  SUSPICION_THRESHOLDS,
  BASE_INSPECTION_CHANCE,
} from '@desperados/shared';
import { IllegalMiningService } from './illegalMining.service';
import { SecureRNG } from './base/SecureRNG';
import { handleServiceError } from '../utils/errorHandling';

/**
 * Inspector patrol result
 */
interface PatrolResult {
  claimsChecked: number;
  claimsDiscovered: number;
  arrestsMade: number;
  claimsCondemned: number;
}

/**
 * Inspection encounter result
 */
interface InspectionEncounterResult {
  inspectorType: InspectorType;
  inspectorName: string;
  result: InspectionResult;
  claimDiscovered: boolean;
  bribeAttempted: boolean;
  bribeSuccess?: boolean;
  bribeAmount?: number;
  fineAmount?: number;
  jailTimeMinutes?: number;
  wantedLevelIncrease?: number;
  claimCondemned: boolean;
  oreSeized: number;
}

/**
 * Generated inspector for encounter
 */
interface GeneratedInspector {
  type: InspectorType;
  name: string;
  thoroughness: number; // 0-100, affects discovery chance
  corruptibility: number; // 0-100, affects bribe success
}

// Inspector name pools
const INSPECTOR_NAMES = [
  'Deputy Wheeler', 'Inspector Rawlings', 'Agent Barnes',
  'Deputy Colt', 'Inspector Harmon', 'Agent Prescott',
  'Deputy Morgan', 'Inspector Davis', 'Agent Crawford',
];

const MARSHAL_NAMES = [
  'Marshal Blackwood', 'Marshal Stone', 'Marshal Vance',
  'Marshal Hawkins', 'Marshal Garrett', 'Marshal Drake',
];

const FEDERAL_AGENT_NAMES = [
  'Federal Agent Morrison', 'Federal Agent Cross', 'Federal Agent Reed',
  'Federal Agent Sterling', 'Federal Agent Nash',
];

export class MiningInspectorService {
  /**
   * Run patrol across all illegal claims
   * Called by scheduled job every 2 hours
   */
  static async runPatrol(): Promise<PatrolResult> {
    const result: PatrolResult = {
      claimsChecked: 0,
      claimsDiscovered: 0,
      arrestsMade: 0,
      claimsCondemned: 0,
    };

    try {
      // Get all active illegal claims
      const claims = await IllegalClaim.find({
        isActive: true,
        legalStatus: { $ne: ClaimLegalStatus.LEGAL },
      });

      for (const claim of claims) {
        if (!claim.canBeInspected()) continue;

        result.claimsChecked++;

        // Calculate inspection chance based on suspicion
        const inspectionChance = this.calculateInspectionChance(claim);

        if (SecureRNG.range(0, 99) >= inspectionChance) {
          continue; // No inspection this round
        }

        // Generate inspector based on suspicion level
        const inspector = this.generateInspector(claim.currentAlertLevel);

        // Run the inspection
        const inspectionResult = await this.runInspection(claim, inspector);

        if (inspectionResult.claimDiscovered) {
          result.claimsDiscovered++;
        }

        if (inspectionResult.jailTimeMinutes && inspectionResult.jailTimeMinutes > 0) {
          result.arrestsMade++;
        }

        if (inspectionResult.claimCondemned) {
          result.claimsCondemned++;
        }
      }

      return result;
    } catch (error) {
      handleServiceError(error, { service: 'MiningInspectorService', method: 'runPatrol' });
      return result;
    }
  }

  /**
   * Run inspection on a specific claim
   */
  static async runInspection(
    claim: IIllegalClaimDoc,
    inspector: GeneratedInspector
  ): Promise<InspectionEncounterResult> {
    const result: InspectionEncounterResult = {
      inspectorType: inspector.type,
      inspectorName: inspector.name,
      result: InspectionResult.NOT_FOUND,
      claimDiscovered: false,
      bribeAttempted: false,
      claimCondemned: false,
      oreSeized: 0,
    };

    try {
      // Check if claim is discovered
      const discoveryChance = this.calculateDiscoveryChance(claim, inspector);
      result.claimDiscovered = SecureRNG.range(0, 99) < discoveryChance;

      if (!result.claimDiscovered) {
        // Claim not found - passed inspection
        result.result = InspectionResult.NOT_FOUND;

        // Record in claim history
        await IllegalMiningService.recordInspectionResult(
          claim._id.toString(),
          inspector.type === InspectorType.FEDERAL_AGENT ? 'marshal' : 'inspector',
          'passed'
        );

        return result;
      }

      // Claim discovered! Now determine consequences
      // Add suspicion for being spotted
      await IllegalMiningService.recordPatrolSpotted(claim._id.toString());

      // Determine severity based on suspicion level
      if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.WARRANT_ISSUED.min) {
        // Warrant level - arrest
        result.result = InspectionResult.ARRESTED;
        result.jailTimeMinutes = this.calculateJailTime(claim, inspector);
        result.wantedLevelIncrease = 2;
        result.oreSeized = claim.totalOreCollected;

        // Condemn claim at warrant level
        result.claimCondemned = true;
        await IllegalMiningService.condemnClaim(claim._id.toString(), 'Warrant-level arrest during inspection');

        // Record in claim history
        await IllegalMiningService.recordInspectionResult(
          claim._id.toString(),
          inspector.type === InspectorType.FEDERAL_AGENT ? 'marshal' : 'inspector',
          'caught',
          result.oreSeized * 5 // Fine based on ore
        );

      } else if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.ACTIVE_SEARCH.min) {
        // Active search level - citation with possible arrest
        const severityRoll = SecureRNG.range(0, 99);

        if (severityRoll < 30) {
          // Arrest
          result.result = InspectionResult.ARRESTED;
          result.jailTimeMinutes = this.calculateJailTime(claim, inspector) * 0.5;
          result.wantedLevelIncrease = 1;
        } else {
          // Citation
          result.result = InspectionResult.CITATION;
          result.fineAmount = this.calculateFine(claim, inspector);
        }

        result.oreSeized = Math.floor(claim.totalOreCollected * 0.5);

        await IllegalMiningService.recordInspectionResult(
          claim._id.toString(),
          inspector.type === InspectorType.FEDERAL_AGENT ? 'marshal' : 'inspector',
          'caught',
          result.fineAmount
        );

      } else if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.SUSPICIOUS.min) {
        // Suspicious level - warning or citation
        const severityRoll = SecureRNG.range(0, 99);

        if (severityRoll < 50) {
          result.result = InspectionResult.CITATION;
          result.fineAmount = this.calculateFine(claim, inspector) * 0.5;
        } else {
          result.result = InspectionResult.WARNED;
        }

        await IllegalMiningService.recordInspectionResult(
          claim._id.toString(),
          inspector.type === InspectorType.FEDERAL_AGENT ? 'marshal' : 'inspector',
          'caught',
          result.fineAmount
        );

      } else {
        // Low suspicion - warning only
        result.result = InspectionResult.WARNED;

        await IllegalMiningService.recordInspectionResult(
          claim._id.toString(),
          inspector.type === InspectorType.FEDERAL_AGENT ? 'marshal' : 'inspector',
          'passed' // Just a warning counts as passed
        );
      }

      return result;
    } catch (error) {
      handleServiceError(error, { service: 'MiningInspectorService', method: 'runInspection', claimId: claim._id.toString(), inspectorType: inspector.type });
      return result;
    }
  }

  /**
   * Player-initiated bribe attempt during inspection
   */
  static async attemptBribe(
    characterId: string,
    claimId: string,
    inspectorType: InspectorType,
    bribeAmount: number
  ): Promise<{ success: boolean; result: InspectionResult; message: string }> {
    try {
      const claim = await IllegalClaim.findById(claimId);
      if (!claim || claim.characterId.toString() !== characterId) {
        return { success: false, result: InspectionResult.WARNED, message: 'Claim not found' };
      }

      // Federal agents cannot be bribed
      if (inspectorType === InspectorType.FEDERAL_AGENT) {
        // Attempted bribe of federal agent - severe consequences
        claim.addSuspicion(SuspicionEventType.BRIBE_FAILED, 50, {
          inspectorType,
          bribeAmount,
          reason: 'federal_agent',
        });
        await claim.save();

        return {
          success: false,
          result: InspectionResult.ARRESTED,
          message: 'Federal agents cannot be bribed! You are under arrest.',
        };
      }

      // Process bribe through IllegalMiningService
      const bribeResult = await IllegalMiningService.processBribeAttempt(
        claimId,
        characterId,
        bribeAmount,
        inspectorType === InspectorType.MARSHAL ? 'marshal' : 'inspector'
      );

      if (bribeResult.success) {
        return {
          success: true,
          result: InspectionResult.BRIBED,
          message: 'The inspector looks the other way...',
        };
      } else {
        return {
          success: false,
          result: InspectionResult.CITATION,
          message: 'Your bribe was rejected! Things just got worse.',
        };
      }
    } catch (error) {
      handleServiceError(error, { service: 'MiningInspectorService', method: 'attemptBribe', characterId, claimId, inspectorType, bribeAmount });
      return { success: false, result: InspectionResult.WARNED, message: 'Bribe failed' };
    }
  }

  /**
   * Calculate inspection chance based on claim suspicion
   */
  private static calculateInspectionChance(claim: IIllegalClaimDoc): number {
    // Base chance from config (10%)
    let baseChance = BASE_INSPECTION_CHANCE * 100; // Convert to percentage

    // Increase with suspicion level
    if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.WARRANT_ISSUED.min) {
      baseChance *= 3; // 3x more likely with warrant
    } else if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.ACTIVE_SEARCH.min) {
      baseChance *= 2; // 2x more likely during active search
    } else if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.SUSPICIOUS.min) {
      baseChance *= 1.5; // 1.5x more likely when suspicious
    }

    // Gang protection reduces chance
    if (claim.hasGangProtection()) {
      baseChance *= 0.5; // 50% reduction
    }

    return Math.min(80, baseChance); // Cap at 80%
  }

  /**
   * Calculate discovery chance during inspection
   */
  private static calculateDiscoveryChance(claim: IIllegalClaimDoc, inspector: GeneratedInspector): number {
    // Base discovery from inspector thoroughness
    let discovery = inspector.thoroughness;

    // Suspicion increases discovery
    discovery += claim.suspicionLevel * 0.3;

    // Gang protection reduces discovery (gang hides evidence)
    if (claim.hasGangProtection()) {
      discovery *= 0.6; // 40% harder to discover
    }

    // Recent activity increases discovery (fresh tracks)
    if (claim.lastCollectionAt) {
      const hoursSinceCollection = (Date.now() - claim.lastCollectionAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCollection < 24) {
        discovery += 15; // Recent activity bonus
      }
    }

    return Math.min(95, discovery); // Cap at 95%
  }

  /**
   * Generate an inspector for an encounter
   */
  private static generateInspector(alertLevel: SuspicionLevel): GeneratedInspector {
    let type: InspectorType;
    let namePool: string[];
    let thoroughness: number;
    let corruptibility: number;

    // Higher alert levels get tougher inspectors
    const typeRoll = SecureRNG.range(0, 99);

    if (alertLevel === SuspicionLevel.WARRANT_ISSUED) {
      if (typeRoll < 30) {
        type = InspectorType.FEDERAL_AGENT;
        namePool = FEDERAL_AGENT_NAMES;
        thoroughness = SecureRNG.range(85, 100); // 85-100
        corruptibility = 0; // Cannot be bribed
      } else {
        type = InspectorType.MARSHAL;
        namePool = MARSHAL_NAMES;
        thoroughness = SecureRNG.range(70, 90); // 70-90
        corruptibility = SecureRNG.range(20, 50); // 20-50
      }
    } else if (alertLevel === SuspicionLevel.ACTIVE_SEARCH) {
      if (typeRoll < 50) {
        type = InspectorType.MARSHAL;
        namePool = MARSHAL_NAMES;
        thoroughness = SecureRNG.range(60, 85); // 60-85
        corruptibility = SecureRNG.range(30, 60); // 30-60
      } else {
        type = InspectorType.INSPECTOR;
        namePool = INSPECTOR_NAMES;
        thoroughness = SecureRNG.range(50, 75); // 50-75
        corruptibility = SecureRNG.range(40, 80); // 40-80
      }
    } else {
      // SUSPICIOUS or UNKNOWN
      type = InspectorType.INSPECTOR;
      namePool = INSPECTOR_NAMES;
      thoroughness = SecureRNG.range(30, 60); // 30-60
      corruptibility = SecureRNG.range(50, 90); // 50-90
    }

    const name = SecureRNG.select(namePool);

    return { type, name, thoroughness, corruptibility };
  }

  /**
   * Calculate jail time for arrest
   */
  private static calculateJailTime(claim: IIllegalClaimDoc, inspector: GeneratedInspector): number {
    // Base time from suspicion level
    let baseTime = 15; // 15 minutes minimum

    if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.WARRANT_ISSUED.min) {
      baseTime = 60; // 1 hour for warrant
    } else if (claim.suspicionLevel >= SUSPICION_THRESHOLDS.ACTIVE_SEARCH.min) {
      baseTime = 30; // 30 minutes for active search
    }

    // Inspector type multiplier
    if (inspector.type === InspectorType.FEDERAL_AGENT) {
      baseTime *= 2; // Double for federal
    } else if (inspector.type === InspectorType.MARSHAL) {
      baseTime *= 1.5; // 1.5x for marshal
    }

    // Repeat offender penalty
    const priorCatches = claim.inspectionHistory.filter((h) => h.result === 'caught').length;
    baseTime += priorCatches * 10; // +10 minutes per prior catch

    return Math.min(120, Math.floor(baseTime)); // Cap at 2 hours
  }

  /**
   * Calculate fine amount
   */
  private static calculateFine(claim: IIllegalClaimDoc, inspector: GeneratedInspector): number {
    // Base fine
    let baseFine = 500;

    // Scale with collected value
    baseFine += claim.totalValueCollected * 0.1; // 10% of collected value

    // Inspector type multiplier
    if (inspector.type === InspectorType.FEDERAL_AGENT) {
      baseFine *= 2;
    } else if (inspector.type === InspectorType.MARSHAL) {
      baseFine *= 1.5;
    }

    // Suspicion multiplier
    baseFine *= 1 + (claim.suspicionLevel / 100);

    return Math.floor(baseFine);
  }

  /**
   * Get inspection likelihood for UI display
   */
  static getInspectionLikelihood(claim: IIllegalClaimDoc): {
    chance: number;
    inspectorType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  } {
    const chance = this.calculateInspectionChance(claim);

    let inspectorType: string;
    let severity: 'low' | 'medium' | 'high' | 'critical';

    if (claim.currentAlertLevel === SuspicionLevel.WARRANT_ISSUED) {
      inspectorType = 'Marshal or Federal Agent';
      severity = 'critical';
    } else if (claim.currentAlertLevel === SuspicionLevel.ACTIVE_SEARCH) {
      inspectorType = 'Marshal or Inspector';
      severity = 'high';
    } else if (claim.currentAlertLevel === SuspicionLevel.SUSPICIOUS) {
      inspectorType = 'Inspector';
      severity = 'medium';
    } else {
      inspectorType = 'Random Inspector';
      severity = 'low';
    }

    return { chance, inspectorType, severity };
  }
}
