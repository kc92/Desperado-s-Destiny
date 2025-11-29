/**
 * Conquest Service
 *
 * Core conquest mechanics including siege declaration, war execution, and control transfer
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import mongoose from 'mongoose';
import {
  ConquestStage,
  ConquestAttemptStatus,
  TerritoryFactionId as FactionId,
  OccupationStatus,
  SiegeRequirement,
  ConquestObjective,
  ConquestResources,
  ConquestResult,
  SiegeEligibility,
  DeclareSiegeRequest,
  RallyDefenseRequest,
  ControlChange,
  CONQUEST_CONSTANTS,
} from '@desperados/shared';
import { ConquestAttempt, IConquestAttempt } from '../models/ConquestAttempt.model';
import {
  TerritoryConquestState,
  ITerritoryConquestState,
} from '../models/TerritoryConquestState.model';
import { CONQUEST_CONFIG } from '../data/conquestConfig';

/**
 * Conquest Service Class
 */
export class ConquestService {
  /**
   * Check if faction can declare siege on territory
   */
  async checkSiegeEligibility(
    territoryId: string,
    attackingFaction: FactionId,
    currentInfluence: number
  ): Promise<SiegeEligibility> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    const requirements: SiegeRequirement[] = [];
    const warnings: string[] = [];

    // Check influence requirement
    const influenceReq: SiegeRequirement = {
      type: 'influence',
      met: currentInfluence >= CONQUEST_CONSTANTS.SIEGE_THRESHOLD,
      current: currentInfluence,
      required: CONQUEST_CONSTANTS.SIEGE_THRESHOLD,
      description: `Must have ${CONQUEST_CONSTANTS.SIEGE_THRESHOLD}% influence`,
    };
    requirements.push(influenceReq);

    // Check resource requirements
    const resourceReq: SiegeRequirement = {
      type: 'resources',
      met: true, // Checked when committing resources
      current: 0,
      required: CONQUEST_CONSTANTS.MIN_GOLD_COST,
      description: `Requires ${CONQUEST_CONSTANTS.MIN_GOLD_COST} gold, ${CONQUEST_CONSTANTS.MIN_SUPPLIES_COST} supplies, ${CONQUEST_CONSTANTS.MIN_TROOPS} troops`,
    };
    requirements.push(resourceReq);

    // Check cooldown
    const now = new Date();
    const cooldownExpired =
      !state.conquestCooldownUntil || state.conquestCooldownUntil <= now;
    const cooldownReq: SiegeRequirement = {
      type: 'cooldown',
      met: cooldownExpired,
      current: cooldownExpired ? CONQUEST_CONSTANTS.CONQUEST_COOLDOWN : 0,
      required: CONQUEST_CONSTANTS.CONQUEST_COOLDOWN,
      description: `Territory cannot be sieged for ${CONQUEST_CONSTANTS.CONQUEST_COOLDOWN} days after last siege`,
    };
    requirements.push(cooldownReq);

    // Check if already under siege
    if (state.underSiege) {
      warnings.push('Territory is already under siege');
    }

    // Calculate estimated costs
    const estimatedCost: ConquestResources = {
      gold: CONQUEST_CONSTANTS.MIN_GOLD_COST,
      supplies: CONQUEST_CONSTANTS.MIN_SUPPLIES_COST,
      troops: CONQUEST_CONSTANTS.MIN_TROOPS,
    };

    // Adjust for fortifications
    const fortificationMultiplier = 1 + state.totalDefenseBonus / 100;
    estimatedCost.gold = Math.floor(estimatedCost.gold * fortificationMultiplier);
    estimatedCost.supplies = Math.floor(estimatedCost.supplies * fortificationMultiplier);
    estimatedCost.troops = Math.floor(estimatedCost.troops * fortificationMultiplier);

    const allMet = requirements.every((req) => req.met);

    return {
      canDeclare: allMet && !state.underSiege,
      territoryId,
      attackingFaction,
      requirements,
      estimatedCost,
      estimatedDuration: CONQUEST_CONSTANTS.WARNING_PERIOD_MIN +
        CONQUEST_CONSTANTS.ASSAULT_DURATION_MIN,
      warnings,
    };
  }

  /**
   * Declare siege on territory
   */
  async declareSiege(request: DeclareSiegeRequest): Promise<IConquestAttempt> {
    const { territoryId, attackingFaction, resourceCommitment, requestedAllies, warDuration } =
      request;

    // Get territory state
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    if (state.underSiege) {
      throw new Error('Territory is already under siege');
    }

    if (!state.canBeSieged()) {
      throw new Error('Territory cannot be sieged at this time');
    }

    // Validate resources
    if (
      resourceCommitment.gold < CONQUEST_CONSTANTS.MIN_GOLD_COST ||
      resourceCommitment.supplies < CONQUEST_CONSTANTS.MIN_SUPPLIES_COST ||
      resourceCommitment.troops < CONQUEST_CONSTANTS.MIN_TROOPS
    ) {
      throw new Error('Insufficient resources committed');
    }

    // Check requirements
    const requirements: SiegeRequirement[] = [
      {
        type: 'influence',
        met: true, // Assumed to be checked before calling
        current: CONQUEST_CONSTANTS.SIEGE_THRESHOLD,
        required: CONQUEST_CONSTANTS.SIEGE_THRESHOLD,
        description: 'Influence requirement met',
      },
      {
        type: 'resources',
        met: true,
        current: resourceCommitment.gold,
        required: CONQUEST_CONSTANTS.MIN_GOLD_COST,
        description: 'Resource commitment met',
      },
      {
        type: 'cooldown',
        met: true,
        current: CONQUEST_CONSTANTS.CONQUEST_COOLDOWN,
        required: CONQUEST_CONSTANTS.CONQUEST_COOLDOWN,
        description: 'Cooldown period expired',
      },
    ];

    // Create conquest attempt
    const attempt = await ConquestAttempt.create({
      territoryId,
      territoryName: state.territoryName,
      attackingFaction,
      defendingFaction: state.currentController,
      stage: ConquestStage.SIEGE_DECLARED,
      status: ConquestAttemptStatus.PENDING,
      declaredAt: new Date(),
      requirementsMet: requirements,
      allRequirementsMet: true,
      defenseRallied: false,
      defendingAllies: [],
      attackingAllies: requestedAllies || [],
      attackerResources: resourceCommitment,
      defenderResources: { gold: 0, supplies: 0, troops: 0 },
      controlTransferred: false,
    });

    // Update territory state
    state.underSiege = true;
    state.siegeAttemptId = attempt._id as mongoose.Types.ObjectId;
    state.contestedBy = [attackingFaction];
    state.lastSiegeAt = new Date();
    await state.save();

    return attempt;
  }

  /**
   * Rally defense for a siege
   */
  async rallyDefense(request: RallyDefenseRequest): Promise<IConquestAttempt> {
    const { siegeAttemptId, defendingFaction, resourceCommitment, requestedAllies } = request;

    const attempt = await ConquestAttempt.findById(siegeAttemptId);
    if (!attempt) {
      throw new Error('Siege attempt not found');
    }

    if (attempt.defendingFaction !== defendingFaction) {
      throw new Error('Not the defending faction');
    }

    if (attempt.status !== ConquestAttemptStatus.PENDING) {
      throw new Error('Siege is no longer in preparation phase');
    }

    // Update defense
    attempt.defenseRallied = true;
    attempt.defenderResources = resourceCommitment;
    attempt.defendingAllies = requestedAllies || [];

    await attempt.save();
    return attempt;
  }

  /**
   * Start siege assault (war event begins)
   */
  async startAssault(siegeAttemptId: string, warEventId?: string): Promise<IConquestAttempt> {
    const attempt = await ConquestAttempt.findById(siegeAttemptId);
    if (!attempt) {
      throw new Error('Siege attempt not found');
    }

    if (attempt.status !== ConquestAttemptStatus.PENDING) {
      throw new Error('Siege is not in pending state');
    }

    // Generate objectives
    const objectives = this.generateConquestObjectives(attempt);

    // Update attempt
    attempt.stage = ConquestStage.ASSAULT;
    attempt.status = ConquestAttemptStatus.ACTIVE;
    attempt.objectives = objectives;
    if (warEventId) {
      attempt.warEventId = new mongoose.Types.ObjectId(warEventId);
    }
    attempt.warScore = { attacker: 0, defender: 0 };

    await attempt.save();
    return attempt;
  }

  /**
   * Generate conquest objectives
   */
  private generateConquestObjectives(attempt: IConquestAttempt): ConquestObjective[] {
    const objectives: ConquestObjective[] = [];

    // Primary objective: Capture flag
    objectives.push({
      id: `obj_capture_flag_${Date.now()}`,
      type: 'capture_flag',
      description: 'Capture the territory flag',
      points: 200,
      completed: false,
    });

    // Hold position objective
    objectives.push({
      id: `obj_hold_position_${Date.now()}`,
      type: 'hold_position',
      description: 'Hold strategic position for duration',
      points: 100,
      completed: false,
    });

    // Eliminate defenders
    objectives.push({
      id: `obj_eliminate_${Date.now()}`,
      type: 'eliminate_defenders',
      description: 'Eliminate defending forces',
      points: 50,
      completed: false,
    });

    return objectives;
  }

  /**
   * Complete conquest attempt
   */
  async completeConquest(
    siegeAttemptId: string,
    attackerScore: number,
    defenderScore: number
  ): Promise<ConquestResult> {
    const attempt = await ConquestAttempt.findById(siegeAttemptId);
    if (!attempt) {
      throw new Error('Siege attempt not found');
    }

    const state = await TerritoryConquestState.findByTerritory(attempt.territoryId);
    if (!state) {
      throw new Error('Territory state not found');
    }

    // Update war score
    attempt.warScore = { attacker: attackerScore, defender: defenderScore };
    attempt.stage = ConquestStage.CONTROL_CHANGE;

    // Determine winner
    const winner = attempt.determineWinner();
    const controlChanged = winner === attempt.attackingFaction;

    let result: ConquestResult;

    if (controlChanged) {
      // Attacker wins - transfer control
      result = await this.transferControl(attempt, state, attackerScore, defenderScore);
      attempt.status = ConquestAttemptStatus.SUCCEEDED;
    } else {
      // Defender wins - maintain control
      result = await this.defendSuccessful(attempt, state, attackerScore, defenderScore);
      attempt.status = ConquestAttemptStatus.FAILED;
    }

    attempt.completedAt = new Date();
    attempt.controlTransferred = controlChanged;
    await attempt.save();

    // Clear siege state
    state.underSiege = false;
    state.siegeAttemptId = undefined;
    state.contestedBy = [];
    await state.save();

    return result;
  }

  /**
   * Transfer territory control
   */
  private async transferControl(
    attempt: IConquestAttempt,
    state: ITerritoryConquestState,
    attackerScore: number,
    defenderScore: number
  ): Promise<ConquestResult> {
    const previousController = state.currentController;
    const newController = attempt.attackingFaction;

    // Calculate influence change
    const scoreDifference = attackerScore - defenderScore;
    const scoreBonus = Math.floor(
      scoreDifference * CONQUEST_CONFIG.controlTransfer.winner.scoreMultiplier
    );
    const influenceGain =
      Math.min(
        CONQUEST_CONSTANTS.CONTROL_TRANSFER_GAIN +
          scoreBonus,
        CONQUEST_CONFIG.controlTransfer.winner.maximumInfluenceGain
      );

    // Record control change
    const controlChange: ControlChange = {
      previousController,
      newController,
      changedAt: new Date(),
      influenceChange: influenceGain,
      warEventId: attempt.warEventId?.toString(),
      method: 'conquest',
    };

    // Update state
    state.currentController = newController;
    state.controlEstablishedAt = new Date();
    state.previousControllers.push(controlChange);
    state.totalSiegesFallen += 1;

    // Set occupation status
    state.occupationStatus = OccupationStatus.FRESH;
    state.occupationEfficiency = 50;
    state.stabilityPeriodEnds = new Date(
      Date.now() + CONQUEST_CONSTANTS.STABILIZATION_PERIOD * 24 * 60 * 60 * 1000
    );

    // Set conquest cooldown
    state.conquestCooldownUntil = new Date(
      Date.now() + CONQUEST_CONSTANTS.CONQUEST_COOLDOWN * 24 * 60 * 60 * 1000
    );

    // Damage fortifications (50% damage on conquest)
    for (const fort of state.fortifications) {
      state.damageFortification(fort.type, 50);
    }

    await state.save();

    return {
      success: true,
      territoryId: attempt.territoryId,
      territoryName: attempt.territoryName,
      previousController,
      newController,
      influenceChange: influenceGain,
      controlChange,
      message: `${newController} has successfully conquered ${attempt.territoryName}!`,
      rewards: {
        gold: Math.floor(attempt.defenderResources.gold * 0.5),
        reputation: 100,
        influenceGained: influenceGain,
      },
    };
  }

  /**
   * Successful defense
   */
  private async defendSuccessful(
    attempt: IConquestAttempt,
    state: ITerritoryConquestState,
    attackerScore: number,
    defenderScore: number
  ): Promise<ConquestResult> {
    const defender = state.currentController;

    // Update state
    state.totalSiegesDefended += 1;

    // Set conquest cooldown
    state.conquestCooldownUntil = new Date(
      Date.now() + CONQUEST_CONSTANTS.CONQUEST_COOLDOWN * 24 * 60 * 60 * 1000
    );

    // Light fortification damage (20% damage on successful defense)
    for (const fort of state.fortifications) {
      state.damageFortification(fort.type, 20);
    }

    await state.save();

    const controlChange: ControlChange = {
      previousController: defender,
      newController: defender,
      changedAt: new Date(),
      influenceChange: 0,
      warEventId: attempt.warEventId?.toString(),
      method: 'conquest',
    };

    return {
      success: false,
      territoryId: attempt.territoryId,
      territoryName: attempt.territoryName,
      previousController: defender,
      newController: defender,
      influenceChange: 0,
      controlChange,
      message: `${defender} has successfully defended ${attempt.territoryName}!`,
      penalties: {
        influenceLost: 0,
        goldLost: Math.floor(attempt.attackerResources.gold * 0.7),
        fortificationsDamaged: state.fortifications.length,
      },
    };
  }

  /**
   * Cancel siege
   */
  async cancelSiege(siegeAttemptId: string): Promise<void> {
    const attempt = await ConquestAttempt.findById(siegeAttemptId);
    if (!attempt) {
      throw new Error('Siege attempt not found');
    }

    if (attempt.status === ConquestAttemptStatus.ACTIVE) {
      throw new Error('Cannot cancel active siege');
    }

    attempt.status = ConquestAttemptStatus.CANCELLED;
    await attempt.save();

    // Clear territory state
    const state = await TerritoryConquestState.findByTerritory(attempt.territoryId);
    if (state) {
      state.underSiege = false;
      state.siegeAttemptId = undefined;
      state.contestedBy = [];
      await state.save();
    }
  }

  /**
   * Get active sieges
   */
  async getActiveSieges(): Promise<IConquestAttempt[]> {
    return ConquestAttempt.find({
      status: { $in: [ConquestAttemptStatus.PENDING, ConquestAttemptStatus.ACTIVE] },
    }).sort({ declaredAt: -1 });
  }

  /**
   * Get conquest history for territory
   */
  async getConquestHistory(territoryId: string): Promise<IConquestAttempt[]> {
    return ConquestAttempt.find({ territoryId }).sort({ declaredAt: -1 }).limit(20);
  }

  /**
   * Get faction conquest statistics
   */
  async getFactionStatistics(factionId: FactionId) {
    const attempts = await ConquestAttempt.findByFaction(factionId);

    const asAttacker = attempts.filter((a) => a.attackingFaction === factionId);
    const asDefender = attempts.filter((a) => a.defendingFaction === factionId);

    const siegesWon = asAttacker.filter(
      (a) => a.status === ConquestAttemptStatus.SUCCEEDED
    ).length;
    const siegesLost = asAttacker.filter(
      (a) => a.status === ConquestAttemptStatus.FAILED
    ).length;
    const siegesDefended = asDefender.filter(
      (a) => a.status === ConquestAttemptStatus.FAILED
    ).length;

    const controlledTerritories = await TerritoryConquestState.findByController(factionId);

    return {
      factionId,
      totalTerritoriesControlled: controlledTerritories.length,
      siegesInitiated: asAttacker.length,
      siegesWon,
      siegesLost,
      siegesDefended,
      totalInfluenceGained: attempts
        .filter((a) => a.influenceResult && a.influenceResult > 0)
        .reduce((sum, a) => sum + (a.influenceResult || 0), 0),
      totalInfluenceLost: attempts
        .filter((a) => a.influenceResult && a.influenceResult < 0)
        .reduce((sum, a) => sum + Math.abs(a.influenceResult || 0), 0),
      fortificationsBuilt: controlledTerritories.reduce(
        (sum, t) => sum + t.fortifications.length,
        0
      ),
      resistanceActivitiesCompleted: 0, // Calculated elsewhere
    };
  }

  /**
   * Update occupation status for all territories
   */
  async updateOccupationStatuses(): Promise<void> {
    const territories = await TerritoryConquestState.find({
      occupationStatus: { $in: [OccupationStatus.FRESH, OccupationStatus.STABILIZING] },
    });

    for (const territory of territories) {
      territory.updateOccupationStatus();
      await territory.save();
    }
  }

  /**
   * Initialize conquest state for territory
   */
  async initializeTerritoryConquestState(
    territoryId: string,
    territoryName: string,
    initialController: FactionId
  ): Promise<ITerritoryConquestState> {
    const existing = await TerritoryConquestState.findByTerritory(territoryId);
    if (existing) {
      return existing;
    }

    return TerritoryConquestState.create({
      territoryId,
      territoryName,
      currentController: initialController,
      controlEstablishedAt: new Date(),
      occupationStatus: OccupationStatus.STABLE,
      occupationEfficiency: 100,
      underSiege: false,
      contestedBy: [],
      previousControllers: [],
      totalSiegesDefended: 0,
      totalSiegesFallen: 0,
      fortificationLevel: 0,
      fortifications: [],
      defenseBonuses: [],
      totalDefenseBonus: 0,
      hasActiveResistance: false,
      resistanceStrength: 0,
      resistanceActivities: [],
    });
  }
}

/**
 * Export singleton instance
 */
export const conquestService = new ConquestService();
