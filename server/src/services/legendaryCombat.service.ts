/**
 * Legendary Combat Service
 *
 * Multi-phase boss fight mechanics for legendary animal encounters
 */

import { SecureRNG } from './base/SecureRNG';
import mongoose from 'mongoose';
import {
  LegendaryHuntSession,
  LegendaryHuntAttackRequest,
  LegendaryHuntAttackResponse,
  LegendaryHuntCompleteResponse,
  LegendaryAbility,
  CombatPhase,
} from '@desperados/shared';
import { Character } from '../models/Character.model';
import { LegendaryHunt } from '../models/LegendaryHunt.model';
import { LegendaryCombatSession } from '../models/LegendaryCombatSession.model';
import { getLegendaryById } from '../data/legendaryAnimals';
import { awardLegendaryRewards } from './legendaryHunt.service';
import logger from '../utils/logger';
import { SkillService } from './skill.service';

/**
 * Execute turn in legendary hunt
 */
export async function executeHuntTurn(
  request: LegendaryHuntAttackRequest
): Promise<LegendaryHuntAttackResponse> {
  try {
    const sessionDoc = await LegendaryCombatSession.findOne({ sessionId: request.sessionId });
    if (!sessionDoc) {
      return {
        success: false,
        turnResult: {
          playerAction: '',
          playerDamage: 0,
          legendaryAction: '',
          legendaryDamage: 0,
        },
        error: 'Hunt session not found',
      };
    }

    // Convert DB document to session object
    const session: LegendaryHuntSession = {
      sessionId: sessionDoc.sessionId,
      characterId: sessionDoc.characterId.toString(),
      legendaryId: sessionDoc.legendaryId,
      legendary: sessionDoc.legendary,
      currentPhase: sessionDoc.currentPhase,
      legendaryHealth: sessionDoc.legendaryHealth,
      legendaryMaxHealth: sessionDoc.legendaryMaxHealth,
      turnCount: sessionDoc.turnCount,
      totalDamageDone: sessionDoc.totalDamageDone,
      abilitiesUsed: sessionDoc.abilitiesUsed,
      currentCooldowns: sessionDoc.currentCooldowns,
      activeMinions: sessionDoc.activeMinions,
      startedAt: sessionDoc.startedAt,
      location: sessionDoc.location,
    };

    const legendary = session.legendary;
    const character = await Character.findById(session.characterId);
    if (!character) {
      return {
        success: false,
        turnResult: {
          playerAction: '',
          playerDamage: 0,
          legendaryAction: '',
          legendaryDamage: 0,
        },
        error: 'Character not found',
      };
    }

    // Increment turn counter
    session.turnCount++;

    // Handle player action
    const playerResult = await handlePlayerAction(session, character, request);

    // Check if legendary is defeated
    if (session.legendaryHealth <= 0) {
      return await completeLegendaryHunt(session, character, true, playerResult);
    }

    // Handle legendary turn
    const legendaryResult = await handleLegendaryTurn(session, character);

    // Check if player is defeated
    if ((character.stats as any).currentHealth <= 0) {
      return await completeLegendaryHunt(session, character, false, {
        ...playerResult,
        ...legendaryResult,
      });
    }

    // Update session in database
    await LegendaryCombatSession.findOneAndUpdate(
      { sessionId: request.sessionId },
      {
        currentPhase: session.currentPhase,
        legendaryHealth: session.legendaryHealth,
        turnCount: session.turnCount,
        totalDamageDone: session.totalDamageDone,
        abilitiesUsed: session.abilitiesUsed,
        currentCooldowns: session.currentCooldowns,
        activeMinions: session.activeMinions,
      },
      { new: true }
    );

    // Build turn result
    const turnResult = {
      playerAction: playerResult.action,
      playerDamage: playerResult.damage,
      legendaryAction: legendaryResult.action,
      legendaryDamage: legendaryResult.damage,
      minionActions: legendaryResult.minionActions,
      statusEffects: [...playerResult.statusEffects, ...legendaryResult.statusEffects],
      phaseChange: playerResult.phaseChange,
      defeated: false,
      playerDefeated: false,
    };

    return {
      success: true,
      session,
      turnResult,
      message: buildTurnMessage(turnResult),
    };
  } catch (error) {
    logger.error('Error executing hunt turn', { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
    return {
      success: false,
      turnResult: {
        playerAction: '',
        playerDamage: 0,
        legendaryAction: '',
        legendaryDamage: 0,
      },
      error: 'Failed to execute turn',
    };
  }
}

/**
 * Handle player's action
 */
async function handlePlayerAction(
  session: LegendaryHuntSession,
  character: any,
  request: LegendaryHuntAttackRequest
): Promise<{
  action: string;
  damage: number;
  statusEffects: string[];
  phaseChange?: number;
}> {
  const legendary = session.legendary;
  let action = '';
  let damage = 0;
  const statusEffects: string[] = [];
  let phaseChange: number | undefined;

  const effectiveCombat = SkillService.getEffectiveStat(character, 'combat');

  switch (request.action) {
    case 'attack':
      // Calculate damage
      const baseDamage = effectiveCombat * 10;
      const critRoll = SecureRNG.float(0, 1);
      const isCrit = critRoll <= (character.criticalChance || 0.1);
      damage = Math.floor(baseDamage * (isCrit ? 2 : 1));

      // Apply legendary defense
      const currentPhase = getCurrentPhase(session);
      const defenseMultiplier = currentPhase.defensePowerMultiplier;
      const finalDamage = Math.max(
        1,
        damage - Math.floor(legendary.defensePower * defenseMultiplier)
      );

      // Apply damage
      session.legendaryHealth -= finalDamage;
      session.totalDamageDone += finalDamage;
      damage = finalDamage;

      action = isCrit ? 'Critical Attack' : 'Attack';
      if (isCrit) {
        statusEffects.push('Critical Hit!');
      }

      // Check for phase change
      const healthPercent = (session.legendaryHealth / session.legendaryMaxHealth) * 100;
      phaseChange = checkPhaseChange(session, healthPercent);

      break;

    case 'special':
      // Use character special ability (simplified)
      action = 'Special Ability';
      damage = Math.floor(effectiveCombat * 15);
      session.legendaryHealth -= damage;
      session.totalDamageDone += damage;
      statusEffects.push('Used Special Ability');
      break;

    case 'defend':
      action = 'Defend';
      damage = 0;
      statusEffects.push('Defensive Stance (+50% Defense this turn)');
      // Would apply temporary defense buff
      break;

    case 'item':
      action = 'Used Item';
      damage = 0;
      // Would handle item usage
      statusEffects.push('Used Item');
      break;

    case 'flee':
      if (legendary.canFlee) {
        action = 'Attempted Flee';
        damage = 0;
        statusEffects.push('Fled from combat!');
        // Would end session
      } else {
        action = 'Flee Failed';
        damage = 0;
        statusEffects.push('Cannot flee from this legendary!');
      }
      break;
  }

  return { action, damage, statusEffects, phaseChange };
}

/**
 * Handle legendary's turn
 */
async function handleLegendaryTurn(
  session: LegendaryHuntSession,
  character: any
): Promise<{
  action: string;
  damage: number;
  statusEffects: string[];
  minionActions?: string[];
}> {
  const legendary = session.legendary;
  const currentPhase = getCurrentPhase(session);
  const statusEffects: string[] = [];
  const minionActions: string[] = [];

  // Legendary chooses ability
  const ability = chooseLegendaryAbility(session, currentPhase);

  let action = '';
  let damage = 0;

  if (ability) {
    action = ability.name;

    // Execute ability
    switch (ability.type) {
      case 'attack':
        // Calculate damage
        const baseDamage = legendary.attackPower * currentPhase.attackPowerMultiplier;
        const finalDamage = Math.floor(baseDamage + (ability.damage || 0));

        // Apply to character (simplified - would check character defense)
        const charCombatStat = SkillService.getEffectiveStat(character, 'combat');
        const characterDefense = charCombatStat * 5;
        const actualDamage = Math.max(1, finalDamage - characterDefense);

        damage = actualDamage;

        // Apply effect if any
        if (ability.effect) {
          statusEffects.push(`${ability.effect.type} applied for ${ability.effect.duration} turns!`);
        }

        break;

      case 'defense':
        action = ability.name;
        damage = 0;
        statusEffects.push(`${legendary.name} uses ${ability.name}!`);
        break;

      case 'buff':
        action = ability.name;
        damage = 0;
        statusEffects.push(`${legendary.name} is empowered!`);
        break;

      case 'debuff':
        action = ability.name;
        damage = ability.damage || 0;
        statusEffects.push(`You are weakened by ${ability.name}!`);
        break;

      case 'summon':
        action = ability.name;
        damage = 0;
        if (currentPhase.summonMinions) {
          const minions = currentPhase.summonMinions;
          statusEffects.push(`${legendary.name} summons ${minions.count} ${minions.type}!`);
          // Would spawn minions
        }
        break;

      case 'environmental':
        action = ability.name;
        damage = ability.damage || 0;
        statusEffects.push(currentPhase.environmentalHazard || 'Environmental damage!');
        break;
    }

    // Record ability use and set cooldown
    session.abilitiesUsed.push(ability.id);
    session.currentCooldowns.set(ability.id, ability.cooldown);
  } else {
    // Basic attack
    action = 'Attack';
    const baseDamage = legendary.attackPower * currentPhase.attackPowerMultiplier;
    damage = Math.floor(baseDamage);
  }

  // Tick down cooldowns
  tickCooldowns(session);

  // Handle minions if any
  if (session.activeMinions && session.activeMinions.length > 0) {
    session.activeMinions.forEach(minion => {
      const minionDamage = SecureRNG.range(20, 70);
      minionActions.push(`${minion.type} attacks for ${minionDamage} damage!`);
      damage += minionDamage;
    });
  }

  // Apply environmental hazard damage
  if (currentPhase.environmentalHazard && session.turnCount % 2 === 0) {
    const hazardDamage = 50; // Would parse from hazard description
    damage += hazardDamage;
    statusEffects.push(currentPhase.environmentalHazard);
  }

  return { action, damage, statusEffects, minionActions };
}

/**
 * Choose which ability legendary should use
 */
function chooseLegendaryAbility(
  session: LegendaryHuntSession,
  phase: CombatPhase
): LegendaryAbility | null {
  const legendary = session.legendary;
  const availableAbilities: LegendaryAbility[] = [];

  // Filter abilities available in this phase and not on cooldown
  phase.specialAbilities.forEach(abilityId => {
    const ability = legendary.specialAbilities.find(a => a.id === abilityId);
    if (ability) {
      const cooldown = session.currentCooldowns.get(ability.id) || 0;
      if (cooldown === 0) {
        availableAbilities.push(ability);
      }
    }
  });

  if (availableAbilities.length === 0) {
    return null;
  }

  // Weight abilities by priority
  const totalPriority = availableAbilities.reduce((sum, a) => sum + a.priority, 0);
  let roll = SecureRNG.float(0, 1) * totalPriority;

  for (const ability of availableAbilities) {
    roll -= ability.priority;
    if (roll <= 0) {
      return ability;
    }
  }

  return availableAbilities[0];
}

/**
 * Get current combat phase
 */
function getCurrentPhase(session: LegendaryHuntSession): CombatPhase {
  const legendary = session.legendary;
  const healthPercent = (session.legendaryHealth / session.legendaryMaxHealth) * 100;

  // Find appropriate phase
  let currentPhase = legendary.phases[0];

  for (const phase of legendary.phases) {
    if (healthPercent <= phase.healthThreshold) {
      currentPhase = phase;
    }
  }

  return currentPhase;
}

/**
 * Check if phase should change
 */
function checkPhaseChange(session: LegendaryHuntSession, healthPercent: number): number | undefined {
  const legendary = session.legendary;
  const currentPhase = session.currentPhase;

  for (const phase of legendary.phases) {
    if (phase.phase > currentPhase && healthPercent <= phase.healthThreshold) {
      session.currentPhase = phase.phase;
      return phase.phase;
    }
  }

  return undefined;
}

/**
 * Tick down ability cooldowns
 */
function tickCooldowns(session: LegendaryHuntSession): void {
  const newCooldowns = new Map<string, number>();

  session.currentCooldowns.forEach((cooldown, abilityId) => {
    const newCooldown = Math.max(0, cooldown - 1);
    if (newCooldown > 0) {
      newCooldowns.set(abilityId, newCooldown);
    }
  });

  session.currentCooldowns = newCooldowns;
}

/**
 * Complete legendary hunt
 */
async function completeLegendaryHunt(
  session: LegendaryHuntSession,
  character: any,
  defeated: boolean,
  lastTurnResult: any
): Promise<LegendaryHuntAttackResponse> {
  const legendary = session.legendary;
  const characterId = new mongoose.Types.ObjectId(session.characterId);

  // Get hunt record
  const hunt = await LegendaryHunt.findOne({
    characterId,
    legendaryId: session.legendaryId,
  });

  if (!hunt) {
    throw new Error('Hunt record not found');
  }

  // Update best attempt
  (hunt as any).updateBestAttempt(
    session.totalDamageDone,
    session.legendaryHealth,
    session.turnCount
  );

  let rewards;
  let newspaperHeadline;

  if (defeated) {
    // Record defeat
    (hunt as any).recordDefeat();

    // Award rewards
    rewards = await awardLegendaryRewards(characterId, session.legendaryId, session);

    // Get newspaper headline
    newspaperHeadline = legendary.newspaperHeadline;
  }

  await hunt.save();

  // Remove session from database
  await LegendaryCombatSession.deleteOne({ sessionId: session.sessionId });

  const completeResponse: LegendaryHuntCompleteResponse = {
    success: true,
    defeated,
    rewards,
    stats: {
      turnsSurvived: session.turnCount,
      damageDone: session.totalDamageDone,
      timeElapsed: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    },
    newspaperHeadline,
    message: defeated
      ? `You have defeated ${legendary.name}!`
      : `You have been defeated by ${legendary.name}.`,
  };

  // Build final turn result
  const turnResult = {
    ...lastTurnResult,
    defeated,
    playerDefeated: !defeated,
  };

  return {
    success: true,
    turnResult,
    message: completeResponse.message,
  };
}

/**
 * Build turn message
 */
function buildTurnMessage(turnResult: any): string {
  let message = `${turnResult.playerAction}: ${turnResult.playerDamage} damage. `;
  message += `${turnResult.legendaryAction}: ${turnResult.legendaryDamage} damage.`;

  if (turnResult.phaseChange) {
    message += ` Phase ${turnResult.phaseChange} begins!`;
  }

  return message;
}

/**
 * Store session for retrieval
 */
export async function storeSession(session: LegendaryHuntSession): Promise<void> {
  await LegendaryCombatSession.findOneAndUpdate(
    { sessionId: session.sessionId },
    {
      sessionId: session.sessionId,
      characterId: new mongoose.Types.ObjectId(session.characterId),
      legendaryId: session.legendaryId,
      legendary: session.legendary,
      currentPhase: session.currentPhase,
      legendaryHealth: session.legendaryHealth,
      legendaryMaxHealth: session.legendaryMaxHealth,
      turnCount: session.turnCount,
      totalDamageDone: session.totalDamageDone,
      abilitiesUsed: session.abilitiesUsed,
      currentCooldowns: session.currentCooldowns,
      activeMinions: session.activeMinions,
      startedAt: session.startedAt,
      location: session.location,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
    { upsert: true, new: true }
  );
}

/**
 * Get session
 */
export async function getSession(sessionId: string): Promise<LegendaryHuntSession | null> {
  const sessionDoc = await LegendaryCombatSession.findOne({ sessionId });
  if (!sessionDoc) {
    return null;
  }

  return {
    sessionId: sessionDoc.sessionId,
    characterId: sessionDoc.characterId.toString(),
    legendaryId: sessionDoc.legendaryId,
    legendary: sessionDoc.legendary,
    currentPhase: sessionDoc.currentPhase,
    legendaryHealth: sessionDoc.legendaryHealth,
    legendaryMaxHealth: sessionDoc.legendaryMaxHealth,
    turnCount: sessionDoc.turnCount,
    totalDamageDone: sessionDoc.totalDamageDone,
    abilitiesUsed: sessionDoc.abilitiesUsed,
    currentCooldowns: sessionDoc.currentCooldowns,
    activeMinions: sessionDoc.activeMinions,
    startedAt: sessionDoc.startedAt,
    location: sessionDoc.location,
  };
}

/**
 * Remove session
 */
export async function removeSession(sessionId: string): Promise<void> {
  await LegendaryCombatSession.deleteOne({ sessionId });
}

/**
 * Calculate legendary hunt difficulty rating
 */
export function calculateDifficultyRating(
  legendaryId: string,
  characterLevel: number
): {
  rating: number;
  description: string;
  recommendation: string;
} {
  const legendary = getLegendaryById(legendaryId);
  if (!legendary) {
    return {
      rating: 0,
      description: 'Unknown',
      recommendation: 'Not found',
    };
  }

  // Base difficulty from legendary
  let difficulty = legendary.difficulty;

  // Adjust for character level difference
  const levelDiff = legendary.levelRequirement - characterLevel;
  difficulty += levelDiff * 0.5;

  // Clamp between 1-10
  difficulty = Math.max(1, Math.min(10, difficulty));

  let description = '';
  let recommendation = '';

  if (difficulty <= 2) {
    description = 'Easy';
    recommendation = 'Should be manageable';
  } else if (difficulty <= 4) {
    description = 'Moderate';
    recommendation = 'Prepare well';
  } else if (difficulty <= 6) {
    description = 'Challenging';
    recommendation = 'Bring best gear';
  } else if (difficulty <= 8) {
    description = 'Very Hard';
    recommendation = 'Requires preparation and skill';
  } else {
    description = 'Extreme';
    recommendation = 'Only for the most skilled hunters';
  }

  return {
    rating: difficulty,
    description,
    recommendation,
  };
}

export default {
  executeHuntTurn,
  storeSession,
  getSession,
  removeSession,
  calculateDifficultyRating,
};
