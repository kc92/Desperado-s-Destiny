/**
 * Incident Service
 *
 * Phase 14.2: Risk Simulation - Incident System
 *
 * Handles incident generation, prevention calculation, response processing,
 * and damage application.
 */

import mongoose from 'mongoose';
import { SecureRNG } from './base/SecureRNG';
import { Incident, IIncident } from '../models/Incident.model';
import { Property } from '../models/Property.model';
import { MiningClaim } from '../models/MiningClaim.model';
import { Character } from '../models/Character.model';
import { DollarService } from './dollar.service';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/Notification.model';
import { TerritoryBonusService } from './territoryBonus.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import {
  IncidentType,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  IncidentTargetType,
  IncidentResponseType,
  IncidentEffectType,
  InsuranceLevel,
  IIncidentEffect,
  IPreventionFactor,
  IIncidentResponse,
  IIncidentResolutionResult,
  IActiveIncidentSummary,
  IPreventionCalculation,
  IIncidentSpawnResult,
  IBatchIncidentSpawnResult,
} from '@desperados/shared';
import {
  INCIDENT_TIMING,
  BASE_INCIDENT_CHANCES,
  SEVERITY_MULTIPLIERS,
  PREVENTION_FACTORS,
  INCIDENT_INSURANCE_TIERS,
  RESPONSE_OPTIONS,
  INCIDENT_TYPE_CONFIGS,
  INCIDENT_BASE_EFFECTS,
  getIncidentTypesForTarget,
  rollSeverity,
  calculateEffectiveChance,
  calculateDamageEstimate,
} from '@desperados/shared';

/**
 * Target info for incident processing
 */
interface ITargetInfo {
  targetId: string;
  targetType: IncidentTargetType;
  targetName: string;
  characterId: string;
  zoneId: string;
  locationId: string;
  condition: number;
  guardCount: number;
  insuranceLevel: InsuranceLevel;
  hasGangProtection: boolean;
  securityUpgradeLevel: number;
  lastIncidentAt?: Date;
  estimatedValue: number;
}

export class IncidentService {
  /**
   * Check if an incident should spawn for a target
   */
  static async checkIncidentSpawn(
    targetId: string,
    targetType: IncidentTargetType
  ): Promise<IIncidentSpawnResult> {
    try {
      // Get target info
      const targetInfo = await this.getTargetInfo(targetId, targetType);
      if (!targetInfo) {
        return {
          targetId,
          targetType,
          targetName: 'Unknown',
          incidentOccurred: false,
          preventionCalculation: {
            baseChance: 0,
            factors: [],
            totalReduction: 0,
            finalChance: 0,
            isPrevented: true,
          },
        };
      }

      // Check cooldown from last incident
      if (targetInfo.lastIncidentAt) {
        const cooldownMs = INCIDENT_TIMING.POST_INCIDENT_IMMUNITY_HOURS * 60 * 60 * 1000;
        const timeSinceLastIncident = Date.now() - targetInfo.lastIncidentAt.getTime();
        if (timeSinceLastIncident < cooldownMs) {
          return {
            targetId,
            targetType,
            targetName: targetInfo.targetName,
            incidentOccurred: false,
            preventionCalculation: {
              baseChance: 0,
              factors: [],
              totalReduction: 0,
              finalChance: 0,
              isPrevented: true,
            },
            cooldownRemaining: Math.floor((cooldownMs - timeSinceLastIncident) / 1000),
          };
        }
      }

      // Check if there's already an active incident on this target
      const activeIncident = await Incident.findActiveByTarget(targetId);
      if (activeIncident) {
        return {
          targetId,
          targetType,
          targetName: targetInfo.targetName,
          incidentOccurred: false,
          preventionCalculation: {
            baseChance: 0,
            factors: [],
            totalReduction: 0,
            finalChance: 0,
            isPrevented: true,
          },
        };
      }

      // Calculate prevention factors
      const prevention = this.calculatePreventionFactors(targetInfo);

      // Get applicable incident types
      const applicableTypes = getIncidentTypesForTarget(targetType);
      if (applicableTypes.length === 0) {
        return {
          targetId,
          targetType,
          targetName: targetInfo.targetName,
          incidentOccurred: false,
          preventionCalculation: prevention,
        };
      }

      // Calculate base chance (adjusted for 30-min check interval)
      // Daily chance / 48 checks per day
      const baseDaily = BASE_INCIDENT_CHANCES[targetType];
      const checkChance = baseDaily / 48;

      // Apply prevention reduction
      const finalChance = calculateEffectiveChance(checkChance, prevention.totalReduction);

      // Roll for incident
      const roll = SecureRNG.float(0, 100, 2);
      const incidentOccurred = roll < finalChance;

      prevention.baseChance = checkChance;
      prevention.finalChance = finalChance;
      prevention.isPrevented = !incidentOccurred;

      if (!incidentOccurred) {
        return {
          targetId,
          targetType,
          targetName: targetInfo.targetName,
          incidentOccurred: false,
          preventionCalculation: prevention,
        };
      }

      // Select incident type weighted by base chance
      const incidentType = this.selectIncidentType(applicableTypes);

      // Create the incident
      const incident = await this.createIncident(targetInfo, incidentType);

      return {
        targetId,
        targetType,
        targetName: targetInfo.targetName,
        incidentOccurred: true,
        incidentType,
        incidentId: incident._id.toString(),
        preventionCalculation: prevention,
      };
    } catch (error) {
      logger.error(`[IncidentService] Error checking spawn for ${targetType} ${targetId}:`, error);
      return {
        targetId,
        targetType,
        targetName: 'Error',
        incidentOccurred: false,
        preventionCalculation: {
          baseChance: 0,
          factors: [],
          totalReduction: 0,
          finalChance: 0,
          isPrevented: true,
        },
      };
    }
  }

  /**
   * Process batch incident checks for all targets
   */
  static async processBatchIncidentChecks(): Promise<IBatchIncidentSpawnResult> {
    const result: IBatchIncidentSpawnResult = {
      processedCount: 0,
      incidentsCreated: 0,
      incidentsPrevented: 0,
      onCooldown: 0,
      errors: 0,
      results: [],
    };

    try {
      // Get all active properties
      const properties = await Property.find({ status: 'active' }).select('_id name');
      for (const prop of properties) {
        result.processedCount++;
        const spawnResult = await this.checkIncidentSpawn(
          prop._id.toString(),
          IncidentTargetType.PROPERTY
        );
        result.results.push(spawnResult);

        if (spawnResult.incidentOccurred) {
          result.incidentsCreated++;
        } else if (spawnResult.cooldownRemaining) {
          result.onCooldown++;
        } else {
          result.incidentsPrevented++;
        }
      }

      // Get all active mining claims
      const claims = await MiningClaim.find({ status: 'active' }).select('_id claimId');
      for (const claim of claims) {
        result.processedCount++;
        const spawnResult = await this.checkIncidentSpawn(
          claim._id.toString(),
          IncidentTargetType.MINING_CLAIM
        );
        result.results.push(spawnResult);

        if (spawnResult.incidentOccurred) {
          result.incidentsCreated++;
        } else if (spawnResult.cooldownRemaining) {
          result.onCooldown++;
        } else {
          result.incidentsPrevented++;
        }
      }

      logger.info(`[IncidentService] Batch check complete: ${result.processedCount} targets, ${result.incidentsCreated} incidents`);
    } catch (error) {
      logger.error('[IncidentService] Error in batch incident check:', error);
      result.errors++;
    }

    return result;
  }

  /**
   * Get target information for incident processing
   */
  static async getTargetInfo(
    targetId: string,
    targetType: IncidentTargetType
  ): Promise<ITargetInfo | null> {
    try {
      if (targetType === IncidentTargetType.PROPERTY || targetType === IncidentTargetType.BUSINESS) {
        const property = await Property.findById(targetId);
        if (!property || property.status !== 'active') return null;

        const character = await Character.findById(property.ownerId).select('gangId');
        const lastIncident = await Incident.getLastIncidentOnTarget(targetId);

        // Calculate security upgrade level
        let securityLevel = 0;
        const securityUpgrade = property.upgrades?.find((u: any) => u.type === 'security_system');
        if (securityUpgrade) {
          securityLevel = securityUpgrade.level || 1;
        }

        return {
          targetId: property._id.toString(),
          targetType,
          targetName: property.name,
          characterId: property.ownerId!.toString(),
          zoneId: property.locationId.split('_')[0] || property.locationId,
          locationId: property.locationId,
          condition: property.condition,
          guardCount: property.workers?.filter((w: any) => w.type === 'guard')?.length || 0,
          insuranceLevel: (property as any).insuranceLevel || InsuranceLevel.NONE,
          hasGangProtection: !!character?.gangId,
          securityUpgradeLevel: securityLevel,
          lastIncidentAt: lastIncident?.occurredAt,
          estimatedValue: property.purchasePrice || 5000,
        };
      }

      if (targetType === IncidentTargetType.MINING_CLAIM) {
        const claim = await MiningClaim.findById(targetId);
        if (!claim || claim.status !== 'active') return null;

        const character = await Character.findById(claim.characterId).select('gangId');
        const lastIncident = await Incident.getLastIncidentOnTarget(targetId);

        return {
          targetId: claim._id.toString(),
          targetType,
          targetName: claim.claimId,
          characterId: claim.characterId.toString(),
          zoneId: claim.locationId.split('_')[0] || claim.locationId,
          locationId: claim.locationId,
          condition: claim.condition,
          guardCount: 0,
          insuranceLevel: InsuranceLevel.NONE,
          hasGangProtection: !!character?.gangId,
          securityUpgradeLevel: 0,
          lastIncidentAt: lastIncident?.occurredAt,
          estimatedValue: claim.tier * 1000,
        };
      }

      return null;
    } catch (error) {
      logger.error(`[IncidentService] Error getting target info for ${targetId}:`, error);
      return null;
    }
  }

  /**
   * Calculate prevention factors for a target
   */
  static calculatePreventionFactors(targetInfo: ITargetInfo): IPreventionCalculation {
    const factors: IPreventionFactor[] = [];
    let totalReduction = 0;

    // Condition factor (per 10 points above 50)
    if (targetInfo.condition > PREVENTION_FACTORS.CONDITION_THRESHOLD) {
      const conditionBonus = Math.floor(
        (targetInfo.condition - PREVENTION_FACTORS.CONDITION_THRESHOLD) / 10
      ) * PREVENTION_FACTORS.CONDITION_PER_10_POINTS;
      if (conditionBonus > 0) {
        factors.push({
          type: 'condition',
          reductionPercent: conditionBonus,
          description: `Good condition (${targetInfo.condition}%)`,
        });
        totalReduction += conditionBonus;
      }
    }

    // Guard factor
    if (targetInfo.guardCount > 0) {
      const guardReduction = Math.min(
        targetInfo.guardCount * PREVENTION_FACTORS.GUARD_REDUCTION_PER,
        PREVENTION_FACTORS.MAX_GUARD_REDUCTION
      );
      factors.push({
        type: 'guards',
        reductionPercent: guardReduction,
        description: `${targetInfo.guardCount} guard(s) on duty`,
      });
      totalReduction += guardReduction;
    }

    // Territory control factor
    if (targetInfo.hasGangProtection) {
      factors.push({
        type: 'gang_protection',
        reductionPercent: PREVENTION_FACTORS.GANG_PROTECTION_REDUCTION,
        description: 'Gang protection active',
      });
      totalReduction += PREVENTION_FACTORS.GANG_PROTECTION_REDUCTION;
    }

    // Security upgrade factor
    if (targetInfo.securityUpgradeLevel > 0) {
      const securityReduction = Math.min(
        targetInfo.securityUpgradeLevel * PREVENTION_FACTORS.SECURITY_UPGRADE_PER_LEVEL,
        PREVENTION_FACTORS.MAX_SECURITY_REDUCTION
      );
      factors.push({
        type: 'upgrade',
        reductionPercent: securityReduction,
        description: `Security system level ${targetInfo.securityUpgradeLevel}`,
      });
      totalReduction += securityReduction;
    }

    // Insurance presence factor
    if (targetInfo.insuranceLevel !== InsuranceLevel.NONE) {
      factors.push({
        type: 'insurance',
        reductionPercent: PREVENTION_FACTORS.INSURANCE_PRESENCE_REDUCTION,
        description: `${targetInfo.insuranceLevel} insurance`,
      });
      totalReduction += PREVENTION_FACTORS.INSURANCE_PRESENCE_REDUCTION;
    }

    // Cap total reduction
    totalReduction = Math.min(totalReduction, PREVENTION_FACTORS.MAX_TOTAL_PREVENTION);

    return {
      baseChance: 0, // Will be set by caller
      factors,
      totalReduction,
      finalChance: 0, // Will be set by caller
      isPrevented: false, // Will be set by caller
    };
  }

  /**
   * Select incident type based on weighted chances
   */
  static selectIncidentType(applicableTypes: IncidentType[]): IncidentType {
    // Weight by base chance from config
    const weighted: Array<{ type: IncidentType; weight: number }> = applicableTypes.map(type => ({
      type,
      weight: INCIDENT_TYPE_CONFIGS[type].baseChance,
    }));

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let roll = SecureRNG.float(0, totalWeight, 4);

    for (const { type, weight } of weighted) {
      roll -= weight;
      if (roll <= 0) return type;
    }

    return applicableTypes[0];
  }

  /**
   * Create a new incident
   */
  static async createIncident(
    targetInfo: ITargetInfo,
    incidentType: IncidentType
  ): Promise<IIncident> {
    const config = INCIDENT_TYPE_CONFIGS[incidentType];
    const severity = rollSeverity(config.severityDistribution);
    const severityMult = SEVERITY_MULTIPLIERS[severity];

    // Calculate effects with severity multiplier
    const effects: IIncidentEffect[] = config.baseEffects.map(effect => ({
      ...effect,
      value: Math.floor(effect.value * severityMult),
    }));

    // Calculate damage estimate
    const totalDamageEstimate = calculateDamageEstimate(
      effects,
      severity,
      targetInfo.estimatedValue
    );

    // Build available responses
    const availableResponses: IIncidentResponse[] = config.availableResponses.map(responseType => {
      const baseResponse = RESPONSE_OPTIONS[responseType];
      let cost = baseResponse.cost;

      // Calculate dynamic cost for PAY_TO_FIX
      if (responseType === IncidentResponseType.PAY_TO_FIX) {
        cost = Math.floor(totalDamageEstimate * 0.5); // 50% of damage to fix
      }

      return {
        ...baseResponse,
        cost,
        description: this.getResponseDescription(responseType, incidentType),
      };
    });

    // Calculate expiry
    const expiresAt = new Date(
      Date.now() + config.responseWindowHours * 60 * 60 * 1000
    );

    // Create the incident
    const incident = new Incident({
      targetType: targetInfo.targetType,
      targetId: targetInfo.targetId,
      targetName: targetInfo.targetName,
      characterId: targetInfo.characterId,
      category: config.category,
      type: incidentType,
      severity,
      status: IncidentStatus.PENDING,
      zoneId: targetInfo.zoneId,
      locationId: targetInfo.locationId,
      occurredAt: new Date(),
      expiresAt,
      effects,
      totalDamageEstimate,
      preventionFactors: [],
      totalPreventionReduction: 0,
      wasPartiallyPrevented: false,
      availableResponses,
      insuranceLevel: targetInfo.insuranceLevel,
      insuranceClaimed: false,
      notificationSent: false,
      reminderSent: false,
    });

    await incident.save();

    logger.info(
      `[IncidentService] Created ${severity} ${incidentType} incident on ${targetInfo.targetName} (${targetInfo.targetId})`
    );

    return incident;
  }

  /**
   * Process player response to an incident
   */
  static async respondToIncident(
    incidentId: string,
    characterId: string,
    responseType: IncidentResponseType,
    useInsurance: boolean = false
  ): Promise<IIncidentResolutionResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const incident = await Incident.findById(incidentId).session(session);
      if (!incident) {
        throw new Error('Incident not found');
      }

      if (incident.characterId.toString() !== characterId) {
        throw new Error('You do not own this target');
      }

      if (!incident.canRespond()) {
        throw new Error('Cannot respond to this incident (expired or already resolved)');
      }

      // Find the selected response
      const response = incident.availableResponses.find(r => r.type === responseType);
      if (!response) {
        throw new Error('Invalid response type');
      }

      // Check if character can afford response cost
      if (response.cost > 0) {
        const canAfford = await DollarService.canAfford(characterId, response.cost);
        if (!canAfford) {
          throw new Error(`Insufficient funds. Response costs $${response.cost}`);
        }
      }

      // Update incident status
      incident.status = IncidentStatus.IN_PROGRESS;
      incident.selectedResponse = responseType;
      incident.responseStartedAt = new Date();

      // Deduct response cost
      if (response.cost > 0) {
        await DollarService.deductDollars(
          characterId,
          response.cost,
          TransactionSource.PROPERTY_INCOME,
          { reason: `Incident response: ${responseType}` },
          session
        );
      }

      // Roll for success
      const roll = SecureRNG.float(0, 100, 2);
      const success = roll < response.successChance;

      incident.responseCompletedAt = new Date();
      incident.responseSuccess = success;

      // Calculate damage
      let damageApplied = incident.totalDamageEstimate;
      let damagePreventedByResponse = 0;

      if (success) {
        damagePreventedByResponse = Math.floor(
          incident.totalDamageEstimate * (response.damageReduction / 100)
        );
        damageApplied = incident.totalDamageEstimate - damagePreventedByResponse;
      }

      // Handle insurance
      let insuranceRecovery = 0;
      if (useInsurance && incident.insuranceLevel !== InsuranceLevel.NONE) {
        const insuranceConfig = INCIDENT_INSURANCE_TIERS[incident.insuranceLevel];

        // Check if incident type is covered
        if (insuranceConfig.coveredIncidentTypes.includes(incident.type)) {
          const potentialRecovery = Math.floor(
            damageApplied * (insuranceConfig.recoveryPercent / 100)
          );
          insuranceRecovery = Math.min(potentialRecovery, insuranceConfig.maxClaimPerIncident);
          incident.insuranceClaimed = true;
          incident.insuranceRecovery = insuranceRecovery;
        }
      }

      const totalRecovered = damagePreventedByResponse + insuranceRecovery;
      const finalCost = response.cost + damageApplied - insuranceRecovery;

      // Apply effects to target
      await this.applyEffectsToTarget(incident, damageApplied, session);

      // Mark as resolved
      incident.status = success ? IncidentStatus.RESOLVED : IncidentStatus.FAILED;
      incident.resolvedAt = new Date();
      incident.actualDamage = damageApplied;
      incident.recoveredAmount = totalRecovered;
      await incident.save({ session });

      await session.commitTransaction();

      const result: IIncidentResolutionResult = {
        success: true,
        incidentId,
        status: incident.status,
        damageApplied,
        damagePreventedByResponse,
        insuranceRecovery,
        totalRecovered,
        finalCost,
        effectsApplied: incident.effects,
        message: success
          ? `Response successful! Prevented $${damagePreventedByResponse} in damage.`
          : `Response failed. Full damage of $${damageApplied} applied.`,
      };

      logger.info(
        `[IncidentService] Incident ${incidentId} resolved with ${responseType}: ${result.message}`
      );

      return result;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`[IncidentService] Error responding to incident ${incidentId}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Process expired incidents (auto-damage)
   */
  static async processExpiredIncidents(): Promise<number> {
    const expiredIncidents = await Incident.findExpired();
    let processed = 0;

    for (const incident of expiredIncidents) {
      try {
        const session = await mongoose.startSession();
        session.startTransaction();

        // Apply full damage
        await this.applyEffectsToTarget(incident, incident.totalDamageEstimate, session);

        // Check for auto insurance claim
        let insuranceRecovery = 0;
        if (incident.insuranceLevel !== InsuranceLevel.NONE) {
          const insuranceConfig = INCIDENT_INSURANCE_TIERS[incident.insuranceLevel];
          if (insuranceConfig.coveredIncidentTypes.includes(incident.type)) {
            const potentialRecovery = Math.floor(
              incident.totalDamageEstimate * (insuranceConfig.recoveryPercent / 100)
            );
            insuranceRecovery = Math.min(potentialRecovery, insuranceConfig.maxClaimPerIncident);
            incident.insuranceClaimed = true;
            incident.insuranceRecovery = insuranceRecovery;
          }
        }

        incident.status = IncidentStatus.FAILED;
        incident.resolvedAt = new Date();
        incident.actualDamage = incident.totalDamageEstimate;
        incident.recoveredAmount = insuranceRecovery;
        await incident.save({ session });

        await session.commitTransaction();
        session.endSession();

        processed++;

        logger.info(
          `[IncidentService] Expired incident ${incident._id} auto-resolved with $${incident.totalDamageEstimate} damage`
        );
      } catch (error) {
        logger.error(`[IncidentService] Error processing expired incident ${incident._id}:`, error);
      }
    }

    return processed;
  }

  /**
   * Apply incident effects to target
   */
  static async applyEffectsToTarget(
    incident: IIncident,
    damageMultiplier: number,
    session?: mongoose.ClientSession
  ): Promise<void> {
    const damageRatio = damageMultiplier / incident.totalDamageEstimate;

    for (const effect of incident.effects) {
      const scaledValue = Math.floor(effect.value * damageRatio);

      try {
        switch (effect.type) {
          case IncidentEffectType.CONDITION_DAMAGE:
            if (incident.targetType === IncidentTargetType.MINING_CLAIM) {
              const claim = await MiningClaim.findById(incident.targetId).session(session || null);
              if (claim) {
                claim.applyDecay(scaledValue);
                await claim.save({ session });
              }
            } else {
              const property = await Property.findById(incident.targetId).session(session || null);
              if (property) {
                property.condition = Math.max(0, property.condition - scaledValue);
                await property.save({ session });
              }
            }
            break;

          case IncidentEffectType.GOLD_LOSS:
          case IncidentEffectType.FINE:
            // Deduct gold from character
            const goldAmount = effect.type === IncidentEffectType.FINE
              ? scaledValue
              : Math.floor(scaledValue * 10); // Percentage to flat value

            const canDeduct = await DollarService.canAfford(incident.characterId.toString(), goldAmount);
            if (canDeduct) {
              await DollarService.deductDollars(
                incident.characterId.toString(),
                goldAmount,
                TransactionSource.PROPERTY_INCOME,
                { reason: `Incident damage: ${incident.type}` },
                session
              );
            }
            break;

          case IncidentEffectType.PRODUCTION_HALT:
            // Set halt end time on property
            if (incident.targetType !== IncidentTargetType.MINING_CLAIM) {
              const property = await Property.findById(incident.targetId).session(session || null);
              if (property) {
                const haltUntil = new Date(Date.now() + scaledValue * 60 * 60 * 1000);
                (property as any).productionHaltedUntil = haltUntil;
                await property.save({ session });
              }
            }
            break;

          case IncidentEffectType.STATUS_CHANGE:
            // Change claim status to contested
            if (incident.targetType === IncidentTargetType.MINING_CLAIM) {
              const claim = await MiningClaim.findById(incident.targetId).session(session || null);
              if (claim && claim.status === 'active') {
                claim.status = 'contested';
                await claim.save({ session });
              }
            }
            break;

          // Other effect types would be implemented similarly
        }
      } catch (effectError) {
        logger.error(`[IncidentService] Error applying effect ${effect.type}:`, effectError);
      }
    }
  }

  /**
   * Get active incidents for character
   */
  static async getActiveIncidents(characterId: string): Promise<IActiveIncidentSummary[]> {
    const incidents = await Incident.findActiveByCharacter(characterId);

    return incidents.map(incident => ({
      incidentId: incident._id.toString(),
      type: incident.type,
      severity: incident.severity,
      targetType: incident.targetType,
      targetName: incident.targetName,
      targetId: incident.targetId.toString(),
      timeRemaining: incident.getTimeRemaining(),
      estimatedDamage: incident.totalDamageEstimate,
      availableResponseCount: incident.availableResponses.length,
      insuranceAvailable: incident.insuranceLevel !== InsuranceLevel.NONE,
    }));
  }

  /**
   * Get incident details
   */
  static async getIncidentDetails(incidentId: string, characterId: string): Promise<IIncident | null> {
    const incident = await Incident.findById(incidentId);
    if (!incident || incident.characterId.toString() !== characterId) {
      return null;
    }
    return incident;
  }

  /**
   * Get incident history for character
   */
  static async getIncidentHistory(
    characterId: string,
    limit: number = 20
  ): Promise<IIncident[]> {
    return Incident.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $in: [IncidentStatus.RESOLVED, IncidentStatus.FAILED, IncidentStatus.PREVENTED] },
    })
      .sort({ occurredAt: -1 })
      .limit(limit);
  }

  /**
   * Get response description for display
   */
  static getResponseDescription(
    responseType: IncidentResponseType,
    incidentType: IncidentType
  ): string {
    const descriptions: Record<IncidentResponseType, string> = {
      [IncidentResponseType.IGNORE]: 'Accept the damage and move on',
      [IncidentResponseType.PAY_TO_FIX]: 'Pay to fix the damage immediately',
      [IncidentResponseType.INSURANCE_CLAIM]: 'File an insurance claim for recovery',
      [IncidentResponseType.CALL_FIRE_BRIGADE]: 'Call the fire brigade to contain the blaze',
      [IncidentResponseType.HIRE_GUARDS]: 'Hire guards to track down the thieves',
      [IncidentResponseType.EMERGENCY_REPAIRS]: 'Commission emergency structural repairs',
      [IncidentResponseType.EXTERMINATOR]: 'Hire an exterminator to clear the pests',
      [IncidentResponseType.NEGOTIATE]: 'Negotiate with the striking workers',
      [IncidentResponseType.DEFEND_CLAIM]: 'Confront the claim jumpers directly',
      [IncidentResponseType.BRIBE_INSPECTOR]: 'Offer the inspector a "donation"',
      [IncidentResponseType.EVACUATE]: 'Evacuate and wait for conditions to improve',
    };

    return descriptions[responseType] || 'Respond to the incident';
  }

  /**
   * Send reminders for incidents about to expire
   */
  static async sendIncidentReminders(): Promise<number> {
    const incidents = await Incident.findNeedingReminder(INCIDENT_TIMING.REMINDER_MINUTES_BEFORE);
    let sent = 0;

    for (const incident of incidents) {
      try {
        // Mark reminder as sent
        incident.reminderSent = true;
        await incident.save();

        // Send notification to incident owner
        await NotificationService.sendNotification(
          incident.characterId,
          NotificationType.SYSTEM,
          `Incident "${incident.type}" expires soon! Respond before time runs out.`,
          { link: '/properties/incidents', priority: 'high' }
        );

        sent++;
      } catch (error) {
        logger.error(`[IncidentService] Error sending reminder for ${incident._id}:`, error);
      }
    }

    return sent;
  }
}
