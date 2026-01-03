/**
 * Boss Mechanics Service
 *
 * All boss-specific fight mechanics including:
 * - Tombstone Specter (Spirit Rotation)
 * - Wendigo (Cold Stacks)
 * - Conquistador (Gold Corruption)
 * - Mine Foreman Ghost (Oxygen Depletion)
 * - Wild Bill's Echo (Eternal Poker Game)
 * - The Avenger (Guilt Mirror)
 * - Undead Priest (Corrupted Sacraments)
 * - Jesse James (Bluff Rounds)
 * - Doc Holliday (Poker Showdown)
 * - Ghost Rider (Spirit Trail)
 *
 * REFACTOR: Extracted from combat.service.ts to follow single responsibility principle
 */

import {
  Card,
  HandRank,
  Suit,
  Rank,
  evaluateHand
} from '@desperados/shared';
import { SecureRNG } from '../base/SecureRNG';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PreCombatChallenge {
  type: 'quick_draw' | 'dialogue' | 'puzzle' | 'skill_check';
  timeLimit?: number;
  skillCheck?: { skill: string; difficulty: number };
  successEffect: { bossHpPenalty?: number; playerBonus?: string };
  failureEffect: { playerHpPenalty?: number; bossBonus?: string };
}

export interface PreCombatChallengeResult {
  success: boolean;
  bossHpModifier: number;
  playerHpModifier: number;
  narrative: string;
  bonusApplied?: string;
}

export interface DialogueChoice {
  id: string;
  skillCheck?: { skill: string; difficulty: number };
  successEffect?: { bossHpReduction?: number; playerBuff?: string };
  failureEffect?: { playerDebuff?: string; bossHeal?: number };
  effect?: { skipToPhase?: number; endDialogue?: boolean };
}

export interface DialogueChoiceResult {
  success: boolean;
  bossHpModifier: number;
  playerDebuff?: string;
  playerBuff?: string;
  skipToPhase?: number;
  narrative: string;
}

export interface SpiritRotationResult {
  damageMultiplier: number;
  healsInstead: boolean;
  narrative: string;
}

export interface ColdStacksResult {
  newStacks: number;
  coldDamage: number;
  narrative: string;
}

export interface CorruptionStacksResult {
  newStacks: number;
  damageReduction: number;
  isFullyCorrupted: boolean;
  narrative: string;
}

export interface OxygenDepletionResult {
  newOxygen: number;
  handSizeModifier: number;
  suffocationDamage: number;
  isDefeated: boolean;
  narrative: string;
}

export interface PokerRoundResult {
  isPokerRound: boolean;
  result?: 'player_win_1' | 'player_win_2' | 'tie' | 'bill_win_1' | 'bill_win_2';
  damageModifier?: number;
  skipBossAttack?: boolean;
  forcedNextHand?: 'high_card';
  psychicDamage?: number;
  isDeadMansHand?: boolean;
  narrative: string;
}

export interface GuiltVisionResult {
  isVisionRound: boolean;
  newGuilt: number;
  powerModifier: number;
  guiltTier: 'innocent' | 'questionable' | 'guilty' | 'damned';
  peacefulResolution: boolean;
  narrative: string;
}

export interface AltarActivationResult {
  dominantSuit: 'spades' | 'hearts' | 'clubs' | 'diamonds';
  effect: 'root' | 'boss_heal' | 'double_damage' | 'corruption_dot' | 'none';
  isPurified: boolean;
  isMonochrome: boolean;
  damageModifier: number;
  bossHealPercent: number;
  rootDuration: number;
  corruptionDamage: number;
  narrative: string;
}

export interface AltarPurificationResult {
  success: boolean;
  newAltars: { id: 'spades' | 'hearts' | 'clubs' | 'diamonds'; purified: boolean }[];
  purifiedCount: number;
  trueFormWeakened: boolean;
  narrative: string;
}

export interface BluffRoundResult {
  bluffClaim: { claimedAttack: string; actualAttack: string; isBluff: boolean };
  result: 'correct_call' | 'incorrect_call' | 'fold';
  jesseVulnerable: boolean;
  playerVulnerable: boolean;
  surrendered: boolean;
  narrative: string;
}

export interface PokerShowdownResult {
  playerHandRank: HandRank;
  docHandRank: HandRank;
  winner: 'player' | 'doc' | 'tie';
  margin: number;
  playerDamageBonus: number;
  docDamageBonus: number;
  docSkipsAttack: boolean;
  playerHandCapped: boolean;
  deadMansHand: boolean;
  fourAces: boolean;
  royalFlush: boolean;
  narrative: string;
}

export interface SpiritTrailResult {
  matched: number;
  damageMultiplier: number;
  vengeanceAttack: boolean;
  spiritEscaped: boolean;
  escapeBlocked: boolean;
  flushBonus: boolean;
  straightBonus: boolean;
  suitDamageBonus: 'hearts' | 'diamonds' | null;
  narrative: string;
}

export type Altar = { id: 'spades' | 'hearts' | 'clubs' | 'diamonds'; purified: boolean };

// ============================================================================
// BOSS MECHANICS SERVICE
// ============================================================================

export class BossMechanicsService {
  // ==========================================================================
  // PRE-COMBAT CHALLENGES
  // ==========================================================================

  /**
   * Handle pre-combat challenge (e.g., Billy's quick-draw)
   * Returns modifiers to apply before combat starts
   */
  static handlePreCombatChallenge(
    _characterId: string,
    _bossId: string,
    challenge: PreCombatChallenge,
    playerResponse: { timeTaken?: number; skillResult?: number; choice?: string }
  ): PreCombatChallengeResult {
    let success = false;

    switch (challenge.type) {
      case 'quick_draw':
        // Success if player reacted within time limit
        success = (playerResponse.timeTaken || Infinity) <= (challenge.timeLimit || 2) * 1000;
        break;

      case 'skill_check':
        // Success if player's skill roll beats difficulty
        if (challenge.skillCheck && playerResponse.skillResult !== undefined) {
          success = playerResponse.skillResult >= challenge.skillCheck.difficulty;
        }
        break;

      case 'dialogue':
      case 'puzzle':
        // These are handled by processDialogueChoice
        success = playerResponse.choice === 'correct';
        break;
    }

    if (success) {
      return {
        success: true,
        bossHpModifier: -(challenge.successEffect.bossHpPenalty || 0),
        playerHpModifier: 0,
        narrative: 'Your quick reflexes give you the advantage!',
        bonusApplied: challenge.successEffect.playerBonus
      };
    } else {
      return {
        success: false,
        bossHpModifier: 0,
        playerHpModifier: -(challenge.failureEffect.playerHpPenalty || 0),
        narrative: 'Your opponent was faster...',
        bonusApplied: challenge.failureEffect.bossBonus
      };
    }
  }

  /**
   * Process dialogue choice during boss phase (e.g., Judge Bean's trial)
   */
  static processDialogueChoice(
    _characterId: string,
    choice: DialogueChoice,
    characterSkills: { skillId: string; level: number }[]
  ): DialogueChoiceResult {
    // If no skill check, just apply the direct effect
    if (!choice.skillCheck) {
      return {
        success: true,
        bossHpModifier: 0,
        skipToPhase: choice.effect?.skipToPhase,
        narrative: 'You make your choice...'
      };
    }

    // Find relevant skill
    const relevantSkill = characterSkills.find(
      s => s.skillId.toLowerCase().includes(choice.skillCheck!.skill.toLowerCase())
    );
    const skillLevel = relevantSkill?.level || 0;

    // Roll skill check: skill level + random(1-20) vs difficulty
    const roll = SecureRNG.range(1, 20) + skillLevel;
    const success = roll >= choice.skillCheck.difficulty;

    if (success) {
      return {
        success: true,
        bossHpModifier: -(choice.successEffect?.bossHpReduction || 0),
        playerBuff: choice.successEffect?.playerBuff,
        narrative: `Your ${choice.skillCheck.skill} succeeds!`
      };
    } else {
      return {
        success: false,
        bossHpModifier: choice.failureEffect?.bossHeal || 0,
        playerDebuff: choice.failureEffect?.playerDebuff,
        narrative: `Your ${choice.skillCheck.skill} fails...`
      };
    }
  }

  // ==========================================================================
  // TOMBSTONE SPECTER - Spirit Rotation
  // ==========================================================================

  /**
   * Check spirit rotation for Tombstone Specter
   * Returns damage multiplier based on weapon match
   */
  static checkSpiritRotation(
    currentForm: 'wyatt' | 'doc' | 'clanton',
    playerWeaponType: string
  ): SpiritRotationResult {
    // Form-to-weapon mapping
    const validWeapons: Record<string, string[]> = {
      wyatt: ['revolver', 'pistol', 'handgun'],
      doc: ['cards', 'throwing', 'gambler'],
      clanton: ['shotgun', 'scatter', 'rifle']
    };

    const weaponLower = playerWeaponType.toLowerCase();
    const isValid = validWeapons[currentForm]?.some(w => weaponLower.includes(w)) || false;

    if (isValid) {
      return {
        damageMultiplier: 1.0,
        healsInstead: false,
        narrative: `Your ${playerWeaponType} strikes true against ${currentForm}'s spirit!`
      };
    } else {
      return {
        damageMultiplier: -0.5, // Negative = heals
        healsInstead: true,
        narrative: `The wrong weapon against ${currentForm}'s spirit - your attack heals the Specter!`
      };
    }
  }

  // ==========================================================================
  // WENDIGO - Cold Stacks
  // ==========================================================================

  /**
   * Process cold stacks for Wendigo fight
   * Returns damage to apply and updated stack count
   */
  static processColdStacks(
    currentStacks: number,
    usedFire: boolean,
    reachedTorch: boolean
  ): ColdStacksResult {
    let newStacks = currentStacks;

    // Fire reduces stacks by 2
    if (usedFire) {
      newStacks = Math.max(0, newStacks - 2);
    }

    // Torch resets to 0
    if (reachedTorch) {
      newStacks = 0;
      return {
        newStacks: 0,
        coldDamage: 0,
        narrative: 'The torch\'s warmth drives away the supernatural cold!'
      };
    }

    // Otherwise, add 1 stack
    if (!usedFire) {
      newStacks = Math.min(10, newStacks + 1);
    }

    // Calculate damage: 5 per stack
    const coldDamage = newStacks * 5;

    let narrative = '';
    if (newStacks >= 8) {
      narrative = 'The cold is unbearable! Find warmth immediately!';
    } else if (newStacks >= 5) {
      narrative = 'The supernatural cold seeps into your bones...';
    } else if (newStacks > 0) {
      narrative = 'The Wendigo\'s presence chills you.';
    } else {
      narrative = 'You maintain your warmth against the cold.';
    }

    return { newStacks, coldDamage, narrative };
  }

  // ==========================================================================
  // CONQUISTADOR - Gold Corruption
  // ==========================================================================

  /**
   * Process gold corruption stacks for Conquistador fight
   * Returns effects and whether player is corrupted
   */
  static processCorruptionStacks(
    currentStacks: number,
    pickedUpGold: boolean
  ): CorruptionStacksResult {
    let newStacks = currentStacks;

    if (pickedUpGold) {
      newStacks = Math.min(10, newStacks + 1);
    }

    // 5% damage reduction per stack
    const damageReduction = newStacks * 0.05;

    // At 10 stacks, player joins the Conquistador's army (instant death)
    const isFullyCorrupted = newStacks >= 10;

    let narrative = '';
    if (isFullyCorrupted) {
      narrative = 'The curse consumes you! Your soul belongs to the Conquistador now...';
    } else if (newStacks >= 7) {
      narrative = 'The cursed gold\'s power overwhelms your will!';
    } else if (newStacks >= 4) {
      narrative = 'The gold whispers promises of power...';
    } else if (newStacks > 0) {
      narrative = 'The cursed gold taints your spirit.';
    } else {
      narrative = 'You resist the gold\'s temptation.';
    }

    return { newStacks, damageReduction, isFullyCorrupted, narrative };
  }

  /**
   * Apply boss mechanic modifiers to damage calculation
   * Call this before finalizing damage in boss fights
   */
  static applyBossMechanicModifiers(
    baseDamage: number,
    mechanicId: string,
    mechanicState: Record<string, unknown>
  ): { finalDamage: number; narrative?: string } {
    switch (mechanicId) {
      case 'spirit_rotation': {
        const result = this.checkSpiritRotation(
          mechanicState.currentForm as 'wyatt' | 'doc' | 'clanton',
          mechanicState.weaponType as string
        );
        if (result.healsInstead) {
          return {
            finalDamage: -Math.floor(baseDamage * 0.5),
            narrative: result.narrative
          };
        }
        return { finalDamage: baseDamage, narrative: result.narrative };
      }

      case 'gold_corruption': {
        const stacks = (mechanicState.corruptionStacks as number) || 0;
        const reduction = stacks * 0.05;
        return {
          finalDamage: Math.floor(baseDamage * (1 - reduction)),
          narrative: stacks > 0 ? `Corruption reduces your damage by ${Math.floor(reduction * 100)}%` : undefined
        };
      }

      default:
        return { finalDamage: baseDamage };
    }
  }

  // ==========================================================================
  // MINE FOREMAN GHOST - Oxygen Depletion
  // ==========================================================================

  /**
   * Process oxygen depletion for Mine Foreman Ghost (Fading Breath)
   * Returns hand size modifier, damage, and updated oxygen level
   */
  static processOxygenDepletion(
    currentOxygen: number,
    foundAirPocket: boolean,
    handRank: HandRank
  ): OxygenDepletionResult {
    let newOxygen = currentOxygen;

    // Air pocket restores 20% if player drew Pair or better
    if (foundAirPocket && handRank >= HandRank.PAIR) {
      newOxygen = Math.min(100, newOxygen + 20);
      return {
        newOxygen,
        handSizeModifier: this.getHandSizeModifierForOxygen(newOxygen),
        suffocationDamage: 0,
        isDefeated: false,
        narrative: 'You find a pocket of fresh air and catch your breath!'
      };
    }

    // Oxygen decreases 10% per round
    newOxygen = Math.max(0, newOxygen - 10);

    const handSizeModifier = this.getHandSizeModifierForOxygen(newOxygen);
    const suffocationDamage = newOxygen <= 30 ? 20 : 0;
    const isDefeated = newOxygen <= 0;

    let narrative = '';
    if (isDefeated) {
      narrative = 'You collapse from lack of air... the mine claims another victim.';
    } else if (newOxygen <= 30) {
      narrative = `Oxygen critical (${newOxygen}%)! You gasp for air, taking 20 damage!`;
    } else if (newOxygen <= 50) {
      narrative = `The air grows thin (${newOxygen}%). You can only draw 3 cards.`;
    } else if (newOxygen <= 70) {
      narrative = `The bad air affects you (${newOxygen}%). You can only draw 4 cards.`;
    } else {
      narrative = `Oxygen at ${newOxygen}%. The mine air is stale but breathable.`;
    }

    return { newOxygen, handSizeModifier, suffocationDamage, isDefeated, narrative };
  }

  private static getHandSizeModifierForOxygen(oxygen: number): number {
    if (oxygen <= 50) return -2; // Draw 3 cards
    if (oxygen <= 70) return -1; // Draw 4 cards
    return 0; // Draw 5 cards
  }

  // ==========================================================================
  // WILD BILL'S ECHO - Eternal Poker Game
  // ==========================================================================

  /**
   * Process poker round for Wild Bill's Echo (Eternal Game)
   * Alternates between combat and poker every 2 rounds
   */
  static processPokerRound(
    roundNumber: number,
    playerHand: Card[],
    billHand: Card[]
  ): PokerRoundResult {
    // Only every 2nd round is a poker round
    if (roundNumber % 2 !== 0) {
      return {
        isPokerRound: false,
        narrative: 'Combat round - the cards wait...'
      };
    }

    const playerEval = evaluateHand(playerHand);
    const billEval = evaluateHand(billHand);

    // Check for Dead Man's Hand (Aces and Eights)
    const isPlayerDeadMansHand = this.isDeadMansHand(playerHand);
    const isBillDeadMansHand = this.isDeadMansHand(billHand);

    if (isPlayerDeadMansHand) {
      return {
        isPokerRound: true,
        result: 'player_win_2',
        damageModifier: 1.25, // Instant 25% damage to boss
        psychicDamage: 100, // But take psychic damage
        isDeadMansHand: true,
        narrative: 'Dead Man\'s Hand! The legendary cards strike Wild Bill, but the curse touches you too!'
      };
    }

    if (isBillDeadMansHand) {
      return {
        isPokerRound: true,
        result: 'bill_win_2',
        psychicDamage: 150,
        isDeadMansHand: true,
        narrative: 'Wild Bill draws his famous hand... Aces and Eights! The curse empowers him!'
      };
    }

    const rankDiff = playerEval.score - billEval.score;

    if (rankDiff > 100) {
      return {
        isPokerRound: true,
        result: 'player_win_2',
        skipBossAttack: true,
        narrative: 'You dominate the poker hand! Wild Bill is stunned and skips his attack!'
      };
    } else if (rankDiff > 0) {
      return {
        isPokerRound: true,
        result: 'player_win_1',
        damageModifier: 1.2,
        narrative: 'You win the poker round! +20% damage next combat round.'
      };
    } else if (rankDiff === 0) {
      return {
        isPokerRound: true,
        result: 'tie',
        psychicDamage: 50,
        narrative: 'A tie! The supernatural tension damages both of you.'
      };
    } else if (rankDiff > -100) {
      return {
        isPokerRound: true,
        result: 'bill_win_1',
        psychicDamage: 80,
        narrative: 'Wild Bill wins the hand. The cards cut deep - you take 80 damage.'
      };
    } else {
      return {
        isPokerRound: true,
        result: 'bill_win_2',
        forcedNextHand: 'high_card',
        psychicDamage: 80,
        narrative: 'Wild Bill crushes you at poker! Your next hand is forced to High Card.'
      };
    }
  }

  /**
   * Check if a hand is the Dead Man's Hand (Aces and Eights)
   */
  static isDeadMansHand(hand: Card[]): boolean {
    const ranks = hand.map(c => c.rank);
    const aceCount = ranks.filter((r: number) => r === Rank.ACE).length;
    const eightCount = ranks.filter((r: number) => r === Rank.EIGHT).length;
    return aceCount >= 2 && eightCount >= 2;
  }

  // ==========================================================================
  // THE AVENGER - Guilt Mirror
  // ==========================================================================

  /**
   * Process guilt vision for The Avenger (Guilt Mirror)
   * Every 3 rounds, player must confront their guilt
   */
  static processGuiltVision(
    currentGuilt: number,
    roundNumber: number,
    playerHand: Card[],
    handRank: HandRank
  ): GuiltVisionResult {
    // Vision every 3 rounds
    if (roundNumber % 3 !== 0) {
      return {
        isVisionRound: false,
        newGuilt: currentGuilt,
        powerModifier: this.getGuiltPowerModifier(currentGuilt),
        guiltTier: this.getGuiltTier(currentGuilt),
        peacefulResolution: false,
        narrative: ''
      };
    }

    let guiltReduction = 0;

    // Base reduction from hand strength
    if (handRank >= HandRank.FOUR_OF_A_KIND) {
      // Four of a Kind+ skips the vision entirely
      return {
        isVisionRound: true,
        newGuilt: currentGuilt,
        powerModifier: this.getGuiltPowerModifier(currentGuilt),
        guiltTier: this.getGuiltTier(currentGuilt),
        peacefulResolution: currentGuilt <= 0,
        narrative: 'Your unwavering resolve repels the vision!'
      };
    } else if (handRank >= HandRank.FULL_HOUSE) {
      guiltReduction = 15;
    } else if (handRank >= HandRank.FLUSH) {
      guiltReduction = 10;
    } else if (handRank >= HandRank.STRAIGHT) {
      guiltReduction = 8;
    } else if (handRank >= HandRank.THREE_OF_A_KIND) {
      guiltReduction = 5;
    } else if (handRank >= HandRank.TWO_PAIR) {
      guiltReduction = 3;
    } else if (handRank >= HandRank.PAIR) {
      guiltReduction = 1;
    }

    // HEARTS hands double the reduction
    const heartsCount = playerHand.filter(c => c.suit === Suit.HEARTS).length;
    if (heartsCount >= 3) {
      guiltReduction *= 2;
    }

    const newGuilt = Math.max(0, currentGuilt - guiltReduction);
    const peacefulResolution = newGuilt <= 0;

    let narrative = '';
    if (peacefulResolution) {
      narrative = 'Your guilt dissolves completely. The Avenger sees your redemption and releases you peacefully.';
    } else if (guiltReduction > 0) {
      narrative = `You confront your past. Guilt reduced by ${guiltReduction} to ${newGuilt}.`;
    } else {
      narrative = 'The vision overwhelms you. Your guilt remains unchanged.';
    }

    return {
      isVisionRound: true,
      newGuilt,
      powerModifier: this.getGuiltPowerModifier(newGuilt),
      guiltTier: this.getGuiltTier(newGuilt),
      peacefulResolution,
      narrative
    };
  }

  private static getGuiltPowerModifier(guilt: number): number {
    if (guilt <= 20) return 0.7;
    if (guilt <= 50) return 1.0;
    if (guilt <= 80) return 1.3;
    return 1.5;
  }

  private static getGuiltTier(guilt: number): 'innocent' | 'questionable' | 'guilty' | 'damned' {
    if (guilt <= 20) return 'innocent';
    if (guilt <= 50) return 'questionable';
    if (guilt <= 80) return 'guilty';
    return 'damned';
  }

  // ==========================================================================
  // UNDEAD PRIEST - Corrupted Sacraments
  // ==========================================================================

  /**
   * Process altar activation for Undead Priest (Corrupted Sacraments)
   * Dominant suit in hand triggers corresponding altar effect
   */
  static processAltarActivation(
    playerHand: Card[],
    altars: Altar[]
  ): AltarActivationResult {
    // Map Suit enum to lowercase string for altar matching
    const suitToString: Record<string, 'spades' | 'hearts' | 'clubs' | 'diamonds'> = {
      [Suit.SPADES]: 'spades',
      [Suit.HEARTS]: 'hearts',
      [Suit.CLUBS]: 'clubs',
      [Suit.DIAMONDS]: 'diamonds'
    };

    // Count suits
    const suitCounts = { spades: 0, hearts: 0, clubs: 0, diamonds: 0 };
    playerHand.forEach(c => {
      const suitStr = suitToString[c.suit];
      if (suitStr && suitCounts[suitStr] !== undefined) {
        suitCounts[suitStr]++;
      }
    });

    // Check for monochrome hand (all black or all red)
    const blackCount = suitCounts.spades + suitCounts.clubs;
    const redCount = suitCounts.hearts + suitCounts.diamonds;
    const isMonochrome = blackCount === 5 || redCount === 5;

    // Find dominant suit
    let dominantSuit: 'spades' | 'hearts' | 'clubs' | 'diamonds' = 'spades';
    let maxCount = 0;
    for (const [suit, count] of Object.entries(suitCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantSuit = suit as 'spades' | 'hearts' | 'clubs' | 'diamonds';
      }
    }

    // Check if this altar is purified
    const altar = altars.find(a => a.id === dominantSuit);
    const isPurified = altar?.purified || false;

    // If purified, no negative effects
    if (isPurified) {
      return {
        dominantSuit,
        effect: 'none',
        isPurified: true,
        isMonochrome,
        damageModifier: isMonochrome ? 1.3 : 1.0,
        bossHealPercent: 0,
        rootDuration: 0,
        corruptionDamage: 0,
        narrative: `The purified Altar of ${dominantSuit.charAt(0).toUpperCase() + dominantSuit.slice(1)} provides no power to the priest.`
      };
    }

    // Apply altar effect
    let effect: 'root' | 'boss_heal' | 'double_damage' | 'corruption_dot' = 'root';
    let damageModifier = isMonochrome ? 1.3 : 1.0;
    let bossHealPercent = 0;
    let rootDuration = 0;
    let corruptionDamage = 0;
    let narrative = '';

    switch (dominantSuit) {
      case 'spades':
        effect = 'root';
        rootDuration = 1;
        narrative = 'The Altar of Confession binds you! Rooted for 1 turn.';
        break;
      case 'hearts':
        effect = 'boss_heal';
        bossHealPercent = 5;
        narrative = 'The Altar of Communion pulses! The priest heals 5%.';
        break;
      case 'clubs':
        effect = 'double_damage';
        damageModifier *= 2;
        narrative = 'The Altar of Unction empowers your strike! Double damage this round!';
        break;
      case 'diamonds':
        effect = 'corruption_dot';
        corruptionDamage = 15;
        narrative = 'The Altar of Baptism curses you! Corruption deals 15 damage.';
        break;
    }

    return {
      dominantSuit,
      effect,
      isPurified,
      isMonochrome,
      damageModifier,
      bossHealPercent,
      rootDuration,
      corruptionDamage,
      narrative
    };
  }

  /**
   * Process altar purification for Undead Priest
   * Player uses "Target Altar" action and draws matching suit
   */
  static processAltarPurification(
    targetAltar: 'spades' | 'hearts' | 'clubs' | 'diamonds',
    playerHand: Card[],
    altars: Altar[]
  ): AltarPurificationResult {
    // Map altar string to Suit enum
    const stringToSuit: Record<string, string> = {
      spades: Suit.SPADES,
      hearts: Suit.HEARTS,
      clubs: Suit.CLUBS,
      diamonds: Suit.DIAMONDS
    };

    const targetSuitEnum = stringToSuit[targetAltar];

    // Check if hand has majority of target suit
    const targetSuitCount = playerHand.filter(
      c => c.suit === targetSuitEnum
    ).length;

    const success = targetSuitCount >= 3;

    const newAltars = altars.map(a => ({
      ...a,
      purified: a.id === targetAltar ? (a.purified || success) : a.purified
    }));

    const purifiedCount = newAltars.filter(a => a.purified).length;
    const trueFormWeakened = purifiedCount >= 4;

    let narrative = '';
    if (success) {
      if (trueFormWeakened) {
        narrative = `All 4 altars purified! Father Maldonado's True Form is weakened to 60% power!`;
      } else {
        narrative = `The Altar of ${targetAltar.charAt(0).toUpperCase() + targetAltar.slice(1)} is purified! (${purifiedCount}/4)`;
      }
    } else {
      narrative = `Not enough ${targetAltar} cards to purify the altar. Need 3+, you had ${targetSuitCount}.`;
    }

    return { success, newAltars, purifiedCount, trueFormWeakened, narrative };
  }

  // ==========================================================================
  // JESSE JAMES - Bluff Rounds
  // ==========================================================================

  /**
   * Process Jesse James bluff round
   * Every 2 rounds, Jesse claims an attack type - player must call or fold
   */
  static processBluffRound(
    _round: number,
    playerHand: Card[],
    playerAction: 'call' | 'fold'
  ): BluffRoundResult {
    // Generate Jesse's bluff
    const attacks = ['physical', 'special', 'ultimate'];
    const claimedAttack = SecureRNG.select(attacks);
    const actualAttack = SecureRNG.select(attacks);
    const isBluff = claimedAttack !== actualAttack;

    // Evaluate player's hand for detection bonuses
    const handRank = this.evaluateHandRank(playerHand);
    const hasPairOrBetter = handRank >= HandRank.PAIR;
    const hasRoyalFlush = handRank === HandRank.ROYAL_FLUSH;

    // Check for special hand conditions
    const spadeCount = playerHand.filter(c => c.suit === Suit.SPADES).length;
    const hasSpadesMajority = spadeCount >= 3;

    let result: 'correct_call' | 'incorrect_call' | 'fold' = 'fold';
    let jesseVulnerable = false;
    let playerVulnerable = false;
    let surrendered = false;
    let narrative = '';

    // Royal Flush = instant surrender
    if (hasRoyalFlush) {
      surrendered = true;
      narrative = 'You draw a Royal Flush! Jesse tips his hat. "You\'re better than me, partner. I surrender."';
      return {
        bluffClaim: { claimedAttack, actualAttack, isBluff },
        result: 'correct_call',
        jesseVulnerable: true,
        playerVulnerable: false,
        surrendered: true,
        narrative
      };
    }

    if (playerAction === 'fold') {
      narrative = `Jesse claimed a ${claimedAttack} attack. You fold - playing it safe. ${isBluff ? 'He was bluffing!' : 'He was telling the truth.'}`;
    } else {
      // Call - check if correct
      // Pair+ automatically beats bluff
      if (hasPairOrBetter && isBluff) {
        result = 'correct_call';
        jesseVulnerable = true;
        narrative = `Your ${HandRank[handRank]} sees through Jesse's bluff! He claimed ${claimedAttack} but was planning ${actualAttack}. Jesse takes 50% more damage next round!`;
      } else if (isBluff) {
        // Spades give accuracy bonus
        const detectChance = hasSpadesMajority ? 0.75 : 0.5;
        if (SecureRNG.chance(detectChance)) {
          result = 'correct_call';
          jesseVulnerable = true;
          narrative = `You read Jesse correctly! ${hasSpadesMajority ? 'Your spades revealed his intentions. ' : ''}He was bluffing - claimed ${claimedAttack} but planned ${actualAttack}. +50% damage!`;
        } else {
          result = 'incorrect_call';
          playerVulnerable = true;
          narrative = `Wrong call! Jesse was bluffing, but you guessed wrong. He claimed ${claimedAttack} but planned ${actualAttack}. You take 30% more damage!`;
        }
      } else {
        // Not a bluff - calling it is incorrect
        result = 'incorrect_call';
        playerVulnerable = true;
        narrative = `Jesse wasn't bluffing! He said ${claimedAttack} and meant it. Your wrong call costs you - take 30% more damage!`;
      }
    }

    return {
      bluffClaim: { claimedAttack, actualAttack, isBluff },
      result,
      jesseVulnerable,
      playerVulnerable,
      surrendered,
      narrative
    };
  }

  // ==========================================================================
  // DOC HOLLIDAY - Poker Showdown
  // ==========================================================================

  /**
   * Process Doc Holliday poker showdown
   * Every 3 rounds, combat pauses for a poker hand
   */
  static processPokerShowdown(
    _round: number,
    playerHand: Card[],
    docHandRank: HandRank
  ): PokerShowdownResult {
    const playerHandRank = this.evaluateHandRank(playerHand);
    const margin = playerHandRank - docHandRank;
    const winner = margin > 0 ? 'player' : margin < 0 ? 'doc' : 'tie';

    // Check for special hands
    const isDeadMansHand = this.isDeadMansHand(playerHand);
    const hasFourAces = playerHandRank === HandRank.FOUR_OF_A_KIND &&
      playerHand.filter(c => c.rank === Rank.ACE).length >= 4;
    const hasRoyalFlush = playerHandRank === HandRank.ROYAL_FLUSH;

    let playerDamageBonus = 0;
    let docDamageBonus = 0;
    let docSkipsAttack = false;
    let playerHandCapped = false;
    let narrative = '';

    // Handle special hands first
    if (hasRoyalFlush) {
      narrative = 'ROYAL FLUSH! Doc tips his hat and walks away. "Well played, friend." Instant victory!';
      return {
        playerHandRank, docHandRank, winner: 'player', margin: 10,
        playerDamageBonus: 100, docDamageBonus: 0, docSkipsAttack: true,
        playerHandCapped: false, deadMansHand: false, fourAces: false, royalFlush: true, narrative
      };
    }

    if (hasFourAces) {
      narrative = 'Four Aces! Doc looks at your hand with respect. "I know when I\'m beat. Let me buy you a drink." Peaceful resolution offered.';
      return {
        playerHandRank, docHandRank, winner: 'player', margin: 5,
        playerDamageBonus: 50, docDamageBonus: 0, docSkipsAttack: true,
        playerHandCapped: false, deadMansHand: false, fourAces: true, royalFlush: false, narrative
      };
    }

    if (isDeadMansHand) {
      narrative = 'Dead Man\'s Hand - Aces and Eights! Both you and Doc take 100 damage as the spirits of Deadwood stir. Doc coughs blood.';
      return {
        playerHandRank, docHandRank, winner: 'tie', margin: 0,
        playerDamageBonus: 0, docDamageBonus: 0, docSkipsAttack: false,
        playerHandCapped: false, deadMansHand: true, fourAces: false, royalFlush: false, narrative
      };
    }

    // Regular poker results
    if (winner === 'player') {
      if (margin >= 2) {
        docSkipsAttack = true;
        playerDamageBonus = 0.15;
        narrative = `You win big with ${HandRank[playerHandRank]} vs Doc's ${HandRank[docHandRank]}! Doc skips his next attack and you gain +15% damage!`;
      } else {
        playerDamageBonus = 0.15;
        narrative = `You win with ${HandRank[playerHandRank]} vs Doc's ${HandRank[docHandRank]}! +15% damage for 2 rounds!`;
      }
    } else if (winner === 'doc') {
      if (Math.abs(margin) >= 2) {
        playerHandCapped = true;
        docDamageBonus = 0.15;
        narrative = `Doc wins big with ${HandRank[docHandRank]} vs your ${HandRank[playerHandRank]}! Your next hand is capped at Three of a Kind and Doc gains +15% damage!`;
      } else {
        docDamageBonus = 0.15;
        narrative = `Doc wins with ${HandRank[docHandRank]} vs your ${HandRank[playerHandRank]}. Doc gains +15% damage!`;
      }
    } else {
      narrative = `Push! Both hands are ${HandRank[playerHandRank]}. You and Doc both heal 5%.`;
    }

    return {
      playerHandRank, docHandRank, winner, margin,
      playerDamageBonus, docDamageBonus, docSkipsAttack, playerHandCapped,
      deadMansHand: false, fourAces: false, royalFlush: false, narrative
    };
  }

  /**
   * Generate Doc Holliday's hand rank for poker showdown
   * Doc is a skilled gambler - weighted toward better hands
   */
  static generateDocHand(): HandRank {
    // Weighted distribution favoring better hands
    const roll = SecureRNG.float(0, 1, 4);
    if (roll < 0.05) return HandRank.HIGH_CARD;
    if (roll < 0.20) return HandRank.PAIR;
    if (roll < 0.40) return HandRank.TWO_PAIR;
    if (roll < 0.60) return HandRank.THREE_OF_A_KIND;
    if (roll < 0.75) return HandRank.STRAIGHT;
    if (roll < 0.85) return HandRank.FLUSH;
    if (roll < 0.92) return HandRank.FULL_HOUSE;
    if (roll < 0.97) return HandRank.FOUR_OF_A_KIND;
    if (roll < 0.99) return HandRank.STRAIGHT_FLUSH;
    return HandRank.ROYAL_FLUSH; // 1% chance
  }

  // ==========================================================================
  // GHOST RIDER - Spirit Trail
  // ==========================================================================

  /**
   * Process Ghost Rider spirit trail matching
   * In spirit phase, player must match suit trail to deal damage
   */
  static processSpiritTrail(
    playerHand: Card[],
    spiritTrail: ('spades' | 'hearts' | 'clubs' | 'diamonds')[],
    currentRealm: 'physical' | 'spirit'
  ): SpiritTrailResult {
    // Count suits in player's hand
    const suitCounts: Record<string, number> = {
      spades: 0,
      hearts: 0,
      clubs: 0,
      diamonds: 0
    };

    for (const card of playerHand) {
      if (card.suit === Suit.SPADES) suitCounts.spades++;
      else if (card.suit === Suit.HEARTS) suitCounts.hearts++;
      else if (card.suit === Suit.CLUBS) suitCounts.clubs++;
      else if (card.suit === Suit.DIAMONDS) suitCounts.diamonds++;
    }

    // Check how many trail suits are matched (at least 1 card of that suit)
    let matched = 0;
    for (const trailSuit of spiritTrail) {
      if (suitCounts[trailSuit] > 0) {
        matched++;
        suitCounts[trailSuit]--; // Use up one card per match
      }
    }

    // Check for hand bonuses
    const handRank = this.evaluateHandRank(playerHand);
    const isFlush = handRank === HandRank.FLUSH || handRank === HandRank.STRAIGHT_FLUSH || handRank === HandRank.ROYAL_FLUSH;
    const isStraight = handRank === HandRank.STRAIGHT || handRank === HandRank.STRAIGHT_FLUSH;

    // Determine damage and effects based on matches
    let damageMultiplier = 0;
    let vengeanceAttack = false;
    let spiritEscaped = false;
    const escapeBlocked = isStraight;
    let narrative = '';

    // Realm-specific suit bonuses
    let suitDamageBonus: 'hearts' | 'diamonds' | null = null;
    const heartCount = playerHand.filter(c => c.suit === Suit.HEARTS).length;
    const diamondCount = playerHand.filter(c => c.suit === Suit.DIAMONDS).length;

    if (currentRealm === 'spirit' && heartCount >= 3) {
      suitDamageBonus = 'hearts';
    } else if (currentRealm === 'physical' && diamondCount >= 3) {
      suitDamageBonus = 'diamonds';
    }

    // Flush = double damage regardless of matching
    if (isFlush) {
      damageMultiplier = 2.0;
      narrative = `Perfect synchronization! Your Flush allows you to hit Rising Moon for DOUBLE damage!`;
    } else if (matched === 3) {
      damageMultiplier = 1.0;
      narrative = `You match all 3 trail suits (${spiritTrail.join('-')})! Full damage and the spirit is stunned!`;
    } else if (matched === 2) {
      damageMultiplier = 0.5;
      narrative = `You match 2 of 3 trail suits. Half damage, but the chase continues.`;
    } else if (matched === 1) {
      damageMultiplier = 0;
      vengeanceAttack = true;
      narrative = `Only 1 suit matched! No damage dealt. Rising Moon attacks with vengeance (+50% damage)!`;
    } else {
      damageMultiplier = 0;
      if (escapeBlocked) {
        narrative = `No suits matched, but your Straight cuts off his retreat! He cannot escape this round.`;
      } else {
        spiritEscaped = true;
        narrative = `No suits matched! The spirit escapes through the veil. You lose a round of progress.`;
      }
    }

    if (suitDamageBonus) {
      damageMultiplier += 0.25;
      narrative += ` Your ${suitDamageBonus === 'hearts' ? 'HEARTS connect to his pain' : 'DIAMONDS anchor you'} for +25% bonus damage!`;
    }

    return {
      matched,
      damageMultiplier,
      vengeanceAttack,
      spiritEscaped,
      escapeBlocked,
      flushBonus: isFlush,
      straightBonus: isStraight,
      suitDamageBonus,
      narrative
    };
  }

  /**
   * Generate a random spirit trail for Ghost Rider
   */
  static generateSpiritTrail(): ('spades' | 'hearts' | 'clubs' | 'diamonds')[] {
    const suits: ('spades' | 'hearts' | 'clubs' | 'diamonds')[] = ['spades', 'hearts', 'clubs', 'diamonds'];
    const trail: ('spades' | 'hearts' | 'clubs' | 'diamonds')[] = [];
    for (let i = 0; i < 3; i++) {
      trail.push(SecureRNG.select(suits));
    }
    return trail;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Helper to evaluate hand rank from cards
   */
  private static evaluateHandRank(hand: Card[]): HandRank {
    try {
      const result = evaluateHand(hand);
      return result.rank;
    } catch {
      return HandRank.HIGH_CARD;
    }
  }
}

export default BossMechanicsService;
