/**
 * Inheritance Service
 *
 * Handles the Destiny Deck game played at a gravestone to determine inheritance.
 * The hand you draw determines how much of your ancestor's legacy you receive.
 */

import mongoose from 'mongoose';
import { Gravestone, IGravestone } from '../models/Gravestone.model';
import { Character, ICharacter, CharacterSkill } from '../models/Character.model';
import { GravestoneService } from './gravestone.service';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';
import {
  InheritanceTier,
  INHERITANCE_TIERS,
  InheritanceClaimResult,
  HeirloomItem,
  PRESTIGE_INHERITANCE_BONUS,
  HEIRLOOM_DEGRADATION,
  SKILL_MEMORY_MINIMUM,
  DivineSalvationEffect
} from '@desperados/shared';

/**
 * Standard playing card
 */
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number;  // 2-14 (11=Jack, 12=Queen, 13=King, 14=Ace)
  display: string;  // "A♠", "K♥", etc
}

/**
 * Poker hand result
 */
interface HandResult {
  tier: InheritanceTier;
  handName: string;
  cards: Card[];
  score: number;
}

export class InheritanceService {
  /**
   * Claim inheritance from a gravestone
   * This plays the Destiny Deck game and applies rewards
   */
  static async claimInheritance(
    characterId: string,
    gravestoneId: string,
    session?: mongoose.ClientSession
  ): Promise<InheritanceClaimResult> {
    // Validate claim
    const canClaim = await GravestoneService.canClaimGravestone(characterId, gravestoneId);
    if (!canClaim.canClaim) {
      return {
        success: false,
        tier: InheritanceTier.MEAGER,
        goldReceived: 0,
        heirlooms: [],
        skillBoosts: {},
        destinyHand: [],
        message: canClaim.reason || 'Cannot claim inheritance.'
      };
    }

    const gravestone = await Gravestone.findById(gravestoneId);
    if (!gravestone) {
      return {
        success: false,
        tier: InheritanceTier.MEAGER,
        goldReceived: 0,
        heirlooms: [],
        skillBoosts: {},
        destinyHand: [],
        message: 'Gravestone not found.'
      };
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return {
        success: false,
        tier: InheritanceTier.MEAGER,
        goldReceived: 0,
        heirlooms: [],
        skillBoosts: {},
        destinyHand: [],
        message: 'Character not found.'
      };
    }

    // Start transaction if not provided
    const useSession = session || await mongoose.startSession();
    const isOwnSession = !session;

    try {
      if (isOwnSession) {
        await useSession.startTransaction();
      }

      // Play the Destiny Deck game
      const handResult = this.playDestinyDeck();

      // Calculate inheritance with prestige bonus
      const prestigeBonus = gravestone.prestigeTier * PRESTIGE_INHERITANCE_BONUS;
      const tierConfig = INHERITANCE_TIERS[handResult.tier];

      // Calculate gold received
      const goldPercent = tierConfig.goldPercent + prestigeBonus;
      const goldReceived = Math.floor(gravestone.goldPool * (goldPercent / 100));

      // Select heirlooms
      const heirloomCount = tierConfig.heirloomCount === -1
        ? gravestone.heirloomItems.length  // Blessed tier: all items
        : tierConfig.heirloomCount;
      const heirlooms = this.selectHeirlooms(gravestone, heirloomCount);

      // Calculate skill boosts
      const skillMemoryPercent = tierConfig.skillMemoryPercent + prestigeBonus;
      const skillBoosts = this.calculateSkillBoosts(gravestone, skillMemoryPercent);

      // Apply rewards to character
      await this.applyInheritance(character, {
        goldReceived,
        heirlooms,
        skillBoosts
      }, useSession);

      // Check for divine blessing (Blessed tier only)
      let divineBlessing: DivineSalvationEffect | undefined;
      if (tierConfig.divineBlessing) {
        divineBlessing = {
          name: "Ancestor's Blessing",
          description: 'Your ancestor smiles upon you from beyond. Fortune favors your endeavors.',
          durationHours: 168, // 1 week
          bonuses: {
            destinyDeckBonus: 0.05,
            deathRiskReduction: 0.1
          }
        };
      }

      // Mark gravestone as claimed
      await GravestoneService.markClaimed(
        gravestoneId,
        characterId,
        handResult.tier,
        {
          goldReceived,
          heirloomsReceived: heirlooms.map(h => h.originalItemId),
          skillBoosts,
          destinyHand: handResult.cards.map(c => c.display)
        },
        useSession
      );

      if (isOwnSession) {
        await useSession.commitTransaction();
      }

      logger.info(
        `Inheritance claimed: ${character.name} received ${goldReceived} gold, ` +
        `${heirlooms.length} heirlooms, ${Object.keys(skillBoosts).length} skill boosts ` +
        `from ${gravestone.characterName}'s grave (${handResult.handName})`
      );

      return {
        success: true,
        tier: handResult.tier,
        goldReceived,
        heirlooms,
        skillBoosts,
        divineBlessing,
        destinyHand: handResult.cards.map(c => c.display),
        message: this.getInheritanceMessage(handResult.tier, gravestone.characterName)
      };
    } catch (error) {
      if (isOwnSession) {
        await useSession.abortTransaction();
      }
      logger.error('Error claiming inheritance:', error);
      throw error;
    } finally {
      if (isOwnSession) {
        useSession.endSession();
      }
    }
  }

  /**
   * Play the Destiny Deck game - draw 5 cards and evaluate hand
   */
  private static playDestinyDeck(): HandResult {
    // Create and shuffle deck
    const deck = this.createDeck();
    this.shuffleDeck(deck);

    // Draw 5 cards
    const hand = deck.slice(0, 5);

    // Evaluate hand
    return this.evaluateHand(hand);
  }

  /**
   * Create a standard 52-card deck
   */
  private static createDeck(): Card[] {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
    const rankNames = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const deck: Card[] = [];

    for (const suit of suits) {
      for (let rank = 2; rank <= 14; rank++) {
        deck.push({
          suit,
          rank,
          display: `${rankNames[rank]}${suitSymbols[suit]}`
        });
      }
    }

    return deck;
  }

  /**
   * Fisher-Yates shuffle using SecureRNG
   */
  private static shuffleDeck(deck: Card[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(SecureRNG.float(0, 1) * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * Evaluate a 5-card poker hand
   */
  private static evaluateHand(cards: Card[]): HandResult {
    // Sort by rank
    const sorted = [...cards].sort((a, b) => b.rank - a.rank);

    // Check for flush
    const isFlush = cards.every(c => c.suit === cards[0].suit);

    // Check for straight
    const ranks = sorted.map(c => c.rank);
    let isStraight = true;
    for (let i = 0; i < ranks.length - 1; i++) {
      if (ranks[i] - ranks[i + 1] !== 1) {
        isStraight = false;
        break;
      }
    }
    // Check for A-2-3-4-5 (wheel)
    if (!isStraight && ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
      isStraight = true;
    }

    // Count ranks
    const rankCounts = new Map<number, number>();
    for (const card of cards) {
      rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
    }
    const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

    // Determine hand
    if (isFlush && isStraight) {
      if (ranks[0] === 14 && ranks[1] === 13) {
        return { tier: InheritanceTier.BLESSED, handName: 'Royal Flush', cards, score: 10 };
      }
      return { tier: InheritanceTier.BLESSED, handName: 'Straight Flush', cards, score: 9 };
    }

    if (counts[0] === 4) {
      return { tier: InheritanceTier.MYTHIC, handName: 'Four of a Kind', cards, score: 8 };
    }

    if (counts[0] === 3 && counts[1] === 2) {
      return { tier: InheritanceTier.LEGENDARY, handName: 'Full House', cards, score: 7 };
    }

    if (isFlush) {
      return { tier: InheritanceTier.EXCELLENT, handName: 'Flush', cards, score: 6 };
    }

    if (isStraight) {
      return { tier: InheritanceTier.GREAT, handName: 'Straight', cards, score: 5 };
    }

    if (counts[0] === 3) {
      return { tier: InheritanceTier.GOOD, handName: 'Three of a Kind', cards, score: 4 };
    }

    if (counts[0] === 2 && counts[1] === 2) {
      return { tier: InheritanceTier.FAIR, handName: 'Two Pair', cards, score: 3 };
    }

    if (counts[0] === 2) {
      return { tier: InheritanceTier.MODEST, handName: 'Pair', cards, score: 2 };
    }

    return { tier: InheritanceTier.MEAGER, handName: 'High Card', cards, score: 1 };
  }

  /**
   * Select heirloom items from gravestone
   */
  private static selectHeirlooms(
    gravestone: IGravestone,
    count: number
  ): HeirloomItem[] {
    const heirlooms: HeirloomItem[] = [];
    const available = gravestone.heirloomItems.slice(0, count);

    for (const item of available) {
      // Calculate degradation
      const degradation = HEIRLOOM_DEGRADATION.min +
        SecureRNG.float(0, 1) * (HEIRLOOM_DEGRADATION.max - HEIRLOOM_DEGRADATION.min);

      heirlooms.push({
        originalItemId: item.itemId,
        name: `${gravestone.characterName}'s ${item.itemName}`,
        degradation,
        ancestorName: gravestone.characterName,
        flavorText: `This ${item.itemType} once belonged to ${gravestone.characterName}, who ${
          gravestone.epitaph.toLowerCase().includes('died') ? gravestone.epitaph.toLowerCase() : 'met their end in the frontier'
        }.`
      });
    }

    return heirlooms;
  }

  /**
   * Calculate skill boosts from ancestor's memory
   */
  private static calculateSkillBoosts(
    gravestone: IGravestone,
    percent: number
  ): Record<string, number> {
    const boosts: Record<string, number> = {};

    gravestone.skillMemory.forEach((level, skillId) => {
      const boost = Math.max(
        SKILL_MEMORY_MINIMUM,
        Math.floor(level * (percent / 100))
      );
      if (boost > 0) {
        boosts[skillId] = boost;
      }
    });

    return boosts;
  }

  /**
   * Apply inheritance rewards to character
   */
  private static async applyInheritance(
    character: ICharacter,
    rewards: {
      goldReceived: number;
      heirlooms: HeirloomItem[];
      skillBoosts: Record<string, number>;
    },
    session: mongoose.ClientSession
  ): Promise<void> {
    // Add gold
    if (character.dollars !== undefined) {
      character.dollars += rewards.goldReceived;
    } else {
      character.gold = (character.gold || 0) + rewards.goldReceived;
    }

    // Add heirloom items to inventory
    for (const heirloom of rewards.heirlooms) {
      character.inventory.push({
        itemId: `heirloom_${heirloom.originalItemId}`,
        quantity: 1,
        acquiredAt: new Date()
      });
    }

    // Apply skill boosts
    for (const [skillId, boost] of Object.entries(rewards.skillBoosts)) {
      const existingSkill = character.skills?.find(s => s.skillId === skillId);
      if (existingSkill) {
        // Boost existing skill (don't go below current level)
        existingSkill.level = Math.max(existingSkill.level, boost);
      } else {
        // Add new skill with inherited level
        if (!character.skills) {
          character.skills = [];
        }
        character.skills.push({
          skillId,
          level: boost,
          experience: 0
        });
      }
    }

    await character.save({ session });
  }

  /**
   * Get message for inheritance tier
   */
  private static getInheritanceMessage(tier: InheritanceTier, ancestorName: string): string {
    const messages: Record<InheritanceTier, string> = {
      [InheritanceTier.MEAGER]:
        `${ancestorName}'s spirit is distant. Only a meager portion of their legacy reaches you.`,
      [InheritanceTier.MODEST]:
        `A modest inheritance. ${ancestorName} nods from beyond.`,
      [InheritanceTier.FAIR]:
        `${ancestorName}'s memory stirs. A fair portion of their legacy is now yours.`,
      [InheritanceTier.GOOD]:
        `The cards favor you! ${ancestorName}'s spirit smiles as you receive a good inheritance.`,
      [InheritanceTier.GREAT]:
        `Excellent fortune! ${ancestorName}'s legacy flows to you in abundance.`,
      [InheritanceTier.EXCELLENT]:
        `${ancestorName}'s spirit embraces you! An excellent inheritance is bestowed.`,
      [InheritanceTier.LEGENDARY]:
        `A legendary draw! ${ancestorName}'s full legacy passes to you with their blessing.`,
      [InheritanceTier.MYTHIC]:
        `Four of a kind! ${ancestorName}'s spirit blazes with approval. Their wealth is yours!`,
      [InheritanceTier.BLESSED]:
        `THE PERFECT HAND! ${ancestorName}'s spirit and the gods themselves bless you! ` +
        `Every treasure, every memory, every blessing is now yours!`
    };
    return messages[tier];
  }

  /**
   * Get preview of possible inheritance tiers
   */
  static getInheritanceTierPreview(): Array<{
    tier: InheritanceTier;
    handName: string;
    goldPercent: number;
    heirloomCount: number | 'All';
    skillPercent: number;
  }> {
    const tiers: Array<{ tier: InheritanceTier; handName: string }> = [
      { tier: InheritanceTier.MEAGER, handName: 'High Card' },
      { tier: InheritanceTier.MODEST, handName: 'Pair' },
      { tier: InheritanceTier.FAIR, handName: 'Two Pair' },
      { tier: InheritanceTier.GOOD, handName: 'Three of a Kind' },
      { tier: InheritanceTier.GREAT, handName: 'Straight' },
      { tier: InheritanceTier.EXCELLENT, handName: 'Flush' },
      { tier: InheritanceTier.LEGENDARY, handName: 'Full House' },
      { tier: InheritanceTier.MYTHIC, handName: 'Four of a Kind' },
      { tier: InheritanceTier.BLESSED, handName: 'Straight/Royal Flush' }
    ];

    return tiers.map(t => {
      const config = INHERITANCE_TIERS[t.tier];
      return {
        tier: t.tier,
        handName: t.handName,
        goldPercent: config.goldPercent,
        heirloomCount: config.heirloomCount === -1 ? 'All' : config.heirloomCount,
        skillPercent: config.skillMemoryPercent
      };
    });
  }
}

export default InheritanceService;
