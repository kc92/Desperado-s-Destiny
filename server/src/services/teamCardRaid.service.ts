/**
 * Team Card Raid Service
 *
 * Handles raid boss mechanics for team card games:
 * - Boss initialization
 * - Damage calculation
 * - Phase transitions
 * - Mechanic application
 * - Counter-play system
 * - Reward distribution
 */

import {
  TeamCardGameType,
  RaidDifficulty,
  BossMechanicType,
  TrickCard,
  TeamCardRoundScore,
  RaidBoss,
  TeamCardBossPhase,
  BossMechanic
} from '@desperados/shared';
import {
  RAID_BOSSES,
  getBossById
} from '../data/teamCardBosses';
import { ITeamCardGameSession, ITeamCardPlayer } from '../models/TeamCardGameSession.model';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

// =============================================================================
// TYPES
// =============================================================================

export interface RaidState {
  bossId: string;
  bossHealth: number;
  bossMaxHealth: number;
  currentPhase: number;
  activeMechanics: ActiveMechanic[];
  damageDealt: number;
  playersContribution: Record<string, PlayerContribution>;
}

export interface ActiveMechanic {
  mechanic: BossMechanic;
  activatedAt: number;
  duration?: number;
  countered: boolean;
  counteredBy?: string;
}

export interface PlayerContribution {
  damageDealt: number;
  mechanicsCountered: number;
  tricksTaken: number;
  perfectPlays: number;
  clutchMoments: number;
}

export interface DamageResult {
  baseDamage: number;
  skillMultiplier: number;
  mechanicMultiplier: number;
  finalDamage: number;
  breakdown: string[];
}

export interface PhaseTransition {
  oldPhase: number;
  newPhase: number;
  newMechanic: BossMechanic;
  narrative: string;
}

export interface RaidRewards {
  gold: number;
  experience: number;
  items: RaidItem[];
  bonuses: RewardBonus[];
}

export interface RaidItem {
  itemId: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type: 'card_back' | 'equipment' | 'consumable' | 'cosmetic';
}

export interface RewardBonus {
  type: string;
  amount: number;
  reason: string;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize raid state for a session
 */
export function initializeRaid(
  session: ITeamCardGameSession,
  bossId: string
): ITeamCardGameSession {
  const boss = getBossById(bossId);
  if (!boss) {
    throw new Error(`Boss not found: ${bossId}`);
  }

  session.raidMode = true;
  session.raidBossId = bossId;
  session.bossHealth = boss.health;
  session.bossMaxHealth = boss.health;
  session.bossPhase = 1;
  session.activeBossMechanics = [];

  // Initialize with first phase mechanics (100% health threshold)
  const phase1 = boss.phases.find(p => p.healthThreshold === 100) || boss.phases[0];
  if (phase1 && phase1.mechanics.length > 0) {
    session.activeBossMechanics = [{
      mechanic: phase1.mechanics[0],
      activatedAt: Date.now(),
      countered: false
    }];
  }

  logger.info(`Raid initialized: ${boss.name} (${boss.health} HP)`);

  return session;
}

/**
 * Get current boss info
 */
export function getCurrentBossInfo(session: ITeamCardGameSession): {
  boss: RaidBoss | null;
  phase: TeamCardBossPhase | null;
  healthPercent: number;
} {
  if (!session.raidMode || !session.raidBossId) {
    return { boss: null, phase: null, healthPercent: 100 };
  }

  const boss = getBossById(session.raidBossId);
  if (!boss) {
    return { boss: null, phase: null, healthPercent: 100 };
  }

  const healthPercent = ((session.bossHealth || 0) / (session.bossMaxHealth || 1)) * 100;
  // bossPhase is 1-indexed, so subtract 1 for array index
  const phaseIndex = Math.max(0, (session.bossPhase || 1) - 1);
  const currentPhase = boss.phases[phaseIndex] || boss.phases[0];

  return { boss, phase: currentPhase, healthPercent };
}

// =============================================================================
// DAMAGE CALCULATION
// =============================================================================

/**
 * Calculate damage dealt to boss based on round performance
 */
export function calculateBossDamage(
  session: ITeamCardGameSession,
  roundScore: TeamCardRoundScore,
  players: ITeamCardPlayer[]
): DamageResult {
  const breakdown: string[] = [];
  const { boss } = getCurrentBossInfo(session);

  if (!boss) {
    return { baseDamage: 0, skillMultiplier: 1, mechanicMultiplier: 1, finalDamage: 0, breakdown: [] };
  }

  // Base damage from winning
  let baseDamage = 0;
  const winningTeam = roundScore.team0Score > roundScore.team1Score ? 0 : 1;
  const scoreDiff = Math.abs(roundScore.team0Score - roundScore.team1Score);

  // Human players are always team 0 vs boss team 1
  if (winningTeam === 0) {
    // Points-based damage (50 damage per point scored)
    baseDamage = scoreDiff * 50;
    breakdown.push(`Base damage: ${baseDamage} (${scoreDiff} pts × 50)`);

    // Bonus for special achievements
    if (roundScore.details?.euchre) {
      baseDamage *= 1.5;
      breakdown.push('Euchre bonus: ×1.5');
    }

    if (roundScore.details?.march) {
      baseDamage *= 1.5;
      breakdown.push('March bonus: ×1.5');
    }

    if (roundScore.details?.alone_march) {
      baseDamage *= 2;
      breakdown.push('Going Alone March: ×2');
    }

    if (roundScore.details?.shootTheMoon) {
      baseDamage *= 3;
      breakdown.push('Shoot the Moon: ×3');
    }

    if (roundScore.details?.slam) {
      baseDamage *= 2;
      breakdown.push('Slam bonus: ×2');
    }
  } else {
    // Still deal some damage even if losing, just less
    baseDamage = scoreDiff * 10;
    breakdown.push(`Defensive damage: ${baseDamage} (${scoreDiff} pts × 10)`);
  }

  // Calculate skill multiplier (average of human players' gambling skill)
  const humanPlayers = players.filter(p => !p.isNPC);
  const avgGamblingSkill = humanPlayers.reduce((sum, p) => sum + p.gamblingSkill, 0) / humanPlayers.length;
  const skillMultiplier = 1 + (avgGamblingSkill / 100);
  breakdown.push(`Skill multiplier: ×${skillMultiplier.toFixed(2)} (avg gambling: ${avgGamblingSkill.toFixed(0)})`);

  // Check for mechanic penalties
  let mechanicMultiplier = 1;
  const activeMechanics = session.activeBossMechanics || [];

  for (const active of activeMechanics) {
    if (!active.countered && active.mechanic.damageModifier) {
      mechanicMultiplier *= active.mechanic.damageModifier;
      breakdown.push(`${active.mechanic.name}: ×${active.mechanic.damageModifier}`);
    }
  }

  const finalDamage = Math.round(baseDamage * skillMultiplier * mechanicMultiplier);
  breakdown.push(`Final damage: ${finalDamage}`);

  return {
    baseDamage,
    skillMultiplier,
    mechanicMultiplier,
    finalDamage,
    breakdown
  };
}

/**
 * Apply damage to boss and check for phase transition
 */
export function applyBossDamage(
  session: ITeamCardGameSession,
  damage: number
): {
  session: ITeamCardGameSession;
  phaseTransition?: PhaseTransition;
  bossDefeated: boolean;
} {
  session.bossHealth = Math.max(0, (session.bossHealth || 0) - damage);

  const { boss, healthPercent } = getCurrentBossInfo(session);

  if (!boss) {
    return { session, bossDefeated: false };
  }

  // Check for boss defeat
  if (session.bossHealth <= 0) {
    logger.info(`Boss ${boss.name} defeated!`);
    return { session, bossDefeated: true };
  }

  // Check for phase transition based on health thresholds
  // Phases are sorted by healthThreshold (100, 75, 50, 25...)
  const currentPhaseIndex = (session.bossPhase || 1) - 1;

  // Find the next phase that should be active based on current health percentage
  const nextPhaseIndex = boss.phases.findIndex((p, idx) =>
    idx > currentPhaseIndex &&
    healthPercent <= p.healthThreshold
  );

  if (nextPhaseIndex !== -1) {
    const nextPhase = boss.phases[nextPhaseIndex];
    session.bossPhase = nextPhaseIndex + 1; // 1-indexed

    // Activate new phase mechanic
    const newMechanic = nextPhase.mechanics[0];
    session.activeBossMechanics = [
      ...(session.activeBossMechanics || []),
      {
        mechanic: newMechanic,
        activatedAt: Date.now(),
        countered: false
      }
    ];

    const transition: PhaseTransition = {
      oldPhase: currentPhaseIndex + 1,
      newPhase: nextPhaseIndex + 1,
      newMechanic,
      narrative: (nextPhase as any).narrative || nextPhase.description
    };

    logger.info(`Boss phase transition: ${currentPhaseIndex + 1} -> ${nextPhaseIndex + 1}`);

    return { session, phaseTransition: transition, bossDefeated: false };
  }

  return { session, bossDefeated: false };
}

// =============================================================================
// MECHANIC APPLICATION
// =============================================================================

/**
 * Apply a boss mechanic to the game state
 */
export function applyBossMechanic(
  session: ITeamCardGameSession,
  mechanic: BossMechanic
): {
  session: ITeamCardGameSession;
  effects: MechanicEffect[];
} {
  const effects: MechanicEffect[] = [];

  switch (mechanic.type) {
    case BossMechanicType.MARKED_DECK:
      // Boss can see one card from each player's hand
      session.players.forEach((player, idx) => {
        if (!player.isNPC && player.hand.length > 0) {
          const revealedIndex = SecureRNG.range(0, player.hand.length - 1);
          effects.push({
            type: 'reveal',
            target: player.characterId,
            data: { cardIndex: revealedIndex }
          });
        }
      });
      break;

    case BossMechanicType.COLD_DECK:
      // Swap one card between two opponents
      const humanPlayers = session.players.filter(p => !p.isNPC);
      if (humanPlayers.length >= 2) {
        const p1 = humanPlayers[0];
        const p2 = humanPlayers[1];
        if (p1.hand.length > 0 && p2.hand.length > 0) {
          const idx1 = SecureRNG.range(0, p1.hand.length - 1);
          const idx2 = SecureRNG.range(0, p2.hand.length - 1);

          // Swap cards
          const temp = p1.hand[idx1];
          p1.hand[idx1] = p2.hand[idx2];
          p2.hand[idx2] = temp;

          effects.push({
            type: 'card_swap',
            target: p1.characterId,
            data: { swappedWith: p2.characterId }
          });
        }
      }
      break;

    case BossMechanicType.TIME_PRESSURE:
      // Reduce turn timer
      session.turnTimeLimit = Math.max(10, (session.turnTimeLimit || 30) - 5);
      effects.push({
        type: 'timer_reduced',
        target: 'all',
        data: { newTimeLimit: session.turnTimeLimit }
      });
      break;

    case BossMechanicType.CURSED_HAND:
      // Force players to discard and redraw one card
      session.players.forEach(player => {
        if (!player.isNPC && player.hand.length > 0) {
          // Remove a random card
          const removeIdx = SecureRNG.range(0, player.hand.length - 1);
          player.hand.splice(removeIdx, 1);
          effects.push({
            type: 'card_removed',
            target: player.characterId,
            data: { cardIndex: removeIdx }
          });
        }
      });
      break;

    case BossMechanicType.FORCED_LEAD:
      // Mark that specific suit must be led if possible
      const suits = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
      const forcedSuit = SecureRNG.select(suits);
      session.contract = {
        ...session.contract,
        forcedLeadSuit: forcedSuit
      };
      effects.push({
        type: 'forced_lead',
        target: 'all',
        data: { suit: forcedSuit }
      });
      break;

    case BossMechanicType.HAND_CORRUPTION:
      // Change one card in each player's hand to a random card
      session.players.forEach(player => {
        if (!player.isNPC && player.hand.length > 0) {
          const corruptIdx = SecureRNG.range(0, player.hand.length - 1);
          const corruptSuits = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
          const ranks = ['9', '10', 'J', 'Q', 'K', 'A'];

          player.hand[corruptIdx] = {
            suit: SecureRNG.select(corruptSuits) as any,
            rank: SecureRNG.select(ranks) as any
          };

          effects.push({
            type: 'card_corrupted',
            target: player.characterId,
            data: { cardIndex: corruptIdx }
          });
        }
      });
      break;

    case BossMechanicType.TRUMP_OVERRIDE:
      // Boss changes trump suit mid-round
      const trumpSuits = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
      const currentTrump = session.trump;
      const availableTrumps = trumpSuits.filter(s => s !== currentTrump);
      const newTrump = SecureRNG.select(availableTrumps);
      session.trump = newTrump as any;
      effects.push({
        type: 'trump_changed',
        target: 'all',
        data: { oldTrump: currentTrump, newTrump }
      });
      break;

    case BossMechanicType.DOUBLE_OR_NOTHING:
      // Points are doubled for this round
      session.contract = {
        ...session.contract,
        pointsMultiplier: 2
      };
      effects.push({
        type: 'points_doubled',
        target: 'all',
        data: { multiplier: 2 }
      });
      break;
  }

  return { session, effects };
}

interface MechanicEffect {
  type: string;
  target: string;
  data: Record<string, any>;
}

// =============================================================================
// COUNTER-PLAY
// =============================================================================

/**
 * Check if players can counter a mechanic
 */
export function checkMechanicCounter(
  mechanic: BossMechanic,
  players: ITeamCardPlayer[]
): {
  canCounter: boolean;
  potentialCounterers: {
    characterId: string;
    skill: string;
    value: number;
  }[];
} {
  const counterplay = mechanic.counterplay;
  const potentialCounterers: { characterId: string; skill: string; value: number }[] = [];

  if (!counterplay || !counterplay.skill || !counterplay.threshold) {
    return { canCounter: false, potentialCounterers: [] };
  }

  for (const player of players) {
    if (player.isNPC) continue;

    // Get the relevant skill value based on counterplay requirement
    let skillValue = 0;
    switch (counterplay.skill) {
      case 'perception':
        skillValue = player.perceptionSkill;
        break;
      case 'sleight_of_hand':
        skillValue = player.sleightOfHandSkill;
        break;
      case 'deception':
        skillValue = player.deceptionSkill;
        break;
      case 'gambling':
        skillValue = player.gamblingSkill;
        break;
    }

    if (skillValue >= counterplay.threshold) {
      potentialCounterers.push({
        characterId: player.characterId,
        skill: counterplay.skill,
        value: skillValue
      });
    }
  }

  return {
    canCounter: potentialCounterers.length > 0,
    potentialCounterers
  };
}

/**
 * Apply counter to an active mechanic
 */
export function counterMechanic(
  session: ITeamCardGameSession,
  mechanicIndex: number,
  counteredBy: string
): ITeamCardGameSession {
  const activeMechanics = session.activeBossMechanics || [];

  if (mechanicIndex >= 0 && mechanicIndex < activeMechanics.length) {
    activeMechanics[mechanicIndex].countered = true;
    activeMechanics[mechanicIndex].counteredBy = counteredBy;

    // Update player contribution
    const player = session.players.find(p => p.characterId === counteredBy);
    if (player) {
      player.mechanicsCountered = (player.mechanicsCountered || 0) + 1;
    }

    logger.info(`Mechanic countered by ${counteredBy}`);
  }

  return session;
}

// =============================================================================
// REWARDS
// =============================================================================

export interface CalculatedRewards {
  gold: number;
  experience: number;
  items: RaidItem[];
  bonuses: RewardBonus[];
}

/**
 * Calculate rewards for raid completion
 */
export function calculateRaidRewards(
  session: ITeamCardGameSession,
  victory: boolean
): CalculatedRewards {
  const { boss } = getCurrentBossInfo(session);

  if (!boss) {
    return { gold: 0, experience: 0, items: [], bonuses: [] };
  }

  // Base rewards from boss
  let gold = boss.rewards.goldBase;
  let experience = boss.rewards.experienceBase;
  const items: RaidItem[] = [];
  const bonuses: RewardBonus[] = [];

  if (!victory) {
    // Defeat - reduced rewards
    gold = Math.floor(gold * 0.25);
    experience = Math.floor(experience * 0.5);
    bonuses.push({ type: 'defeat_penalty', amount: -75, reason: 'Boss not defeated' });
    return { gold, experience, items, bonuses };
  }

  // Victory bonuses
  bonuses.push({ type: 'victory', amount: 100, reason: 'Boss defeated' });

  // Calculate damage dealt for contribution bonus
  const totalDamage = session.bossMaxHealth || 1000;
  const healthLost = totalDamage - (session.bossHealth || 0);

  // Fast kill bonus (defeated in fewer rounds)
  if (session.currentRound <= 3) {
    gold = Math.floor(gold * 1.5);
    bonuses.push({ type: 'fast_kill', amount: 50, reason: 'Defeated in 3 rounds or less' });
  }

  // Flawless bonus (no rounds lost)
  const roundsLost = session.roundScores.filter(r => r.team1Score > r.team0Score).length;
  if (roundsLost === 0) {
    gold = Math.floor(gold * 1.25);
    bonuses.push({ type: 'flawless', amount: 25, reason: 'No rounds lost' });
  }

  // Roll for item drops
  const lootRolls = 1 + Math.floor(healthLost / (totalDamage / 3)); // 1-4 rolls based on contribution

  for (let i = 0; i < lootRolls; i++) {
    const roll = SecureRNG.range(1, 100);

    if (roll <= 5) {
      // Legendary drop (5%)
      items.push({
        itemId: `legendary_${boss.id}_${Date.now()}`,
        name: `${boss.name}'s ${getRandomLegendaryItem()}`,
        rarity: 'legendary',
        type: 'equipment'
      });
    } else if (roll <= 20) {
      // Rare drop (15%)
      items.push({
        itemId: `rare_${boss.id}_${Date.now()}`,
        name: getRandomRareItem(boss.id),
        rarity: 'rare',
        type: SecureRNG.chance(0.5) ? 'card_back' : 'equipment'
      });
    } else if (roll <= 50) {
      // Uncommon drop (30%)
      items.push({
        itemId: `uncommon_${Date.now()}`,
        name: getRandomUncommonItem(),
        rarity: 'uncommon',
        type: 'consumable'
      });
    }
  }

  return { gold, experience, items, bonuses };
}

function getRandomLegendaryItem(): string {
  const items = [
    'Marked Deck',
    'Loaded Dice',
    'Lucky Pocket Watch',
    'Cheater\'s Sleeve',
    'Devil\'s Contract'
  ];
  return SecureRNG.select(items);
}

function getRandomRareItem(bossId: string): string {
  const bossItems: Record<string, string[]> = {
    'black_hat_morgan': ['Morgan\'s Hatband', 'Mississippi Mud Chip', 'Cardsharp\'s Ring'],
    'lady_luck': ['Fortune\'s Coin', 'Lucky Clover Card Back', 'Chaos Deck'],
    'the_reaper': ['Death\'s Card Back', 'Soul Counter', 'Grim Chip'],
    'the_contractor': ['Contract Seal', 'Fine Print Glasses', 'Devil\'s Briefcase'],
    'the_alchemist': ['Philosopher\'s Chip', 'Transmuted Deck', 'Golden Card Back']
  };

  const items = bossItems[bossId] || ['Rare Card Back', 'Rare Chip', 'Rare Token'];
  return SecureRNG.select(items);
}

function getRandomUncommonItem(): string {
  const items = [
    'Skill Tonic',
    'Lucky Charm',
    'Focus Potion',
    'Perception Elixir',
    'Confidence Boost'
  ];
  return SecureRNG.select(items);
}

/**
 * Calculate individual player rewards based on contribution
 */
export function calculatePlayerRewards(
  session: ITeamCardGameSession,
  teamRewards: RaidRewards
): Record<string, RaidRewards> {
  const playerRewards: Record<string, RaidRewards> = {};
  const humanPlayers = session.players.filter(p => !p.isNPC);

  // Calculate total contribution
  let totalContribution = 0;
  const contributions: Record<string, number> = {};

  for (const player of humanPlayers) {
    const contribution = player.contributionScore +
      (player.mechanicsCountered * 50) +
      (player.perfectTricks * 25) +
      (player.clutchPlays * 100);

    contributions[player.characterId] = contribution;
    totalContribution += contribution;
  }

  // Distribute rewards based on contribution
  for (const player of humanPlayers) {
    const contributionPercent = totalContribution > 0
      ? contributions[player.characterId] / totalContribution
      : 1 / humanPlayers.length;

    // Minimum 50% of equal share, max 150%
    const shareFactor = Math.max(0.5, Math.min(1.5, contributionPercent * humanPlayers.length));

    const playerGold = Math.floor(teamRewards.gold * shareFactor / humanPlayers.length);
    const playerExp = Math.floor(teamRewards.experience * shareFactor / humanPlayers.length);

    // Distribute items based on contribution (higher contributors get first picks)
    const playerItems = [];
    const itemsPerPlayer = Math.ceil(teamRewards.items.length / humanPlayers.length);

    // This is simplified - in practice would need smarter distribution
    const startIdx = humanPlayers.indexOf(player) * itemsPerPlayer;
    playerItems.push(...teamRewards.items.slice(startIdx, startIdx + itemsPerPlayer));

    playerRewards[player.characterId] = {
      gold: playerGold,
      experience: playerExp,
      items: playerItems,
      bonuses: [{
        type: 'contribution',
        amount: Math.round(contributionPercent * 100),
        reason: `${Math.round(contributionPercent * 100)}% contribution`
      }]
    };
  }

  return playerRewards;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const TeamCardRaidService = {
  initializeRaid,
  getCurrentBossInfo,
  calculateBossDamage,
  applyBossDamage,
  applyBossMechanic,
  checkMechanicCounter,
  counterMechanic,
  calculateRaidRewards,
  calculatePlayerRewards
};
