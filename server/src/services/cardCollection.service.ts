/**
 * Card Collection Service
 * Manages player card collections and deck building
 */

import mongoose from 'mongoose';
import { CardDefinition, CharacterDeck, ICardDefinition, ICharacterDeck } from '../models/Card.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

export class CardCollectionService {
  /**
   * Get character's card collection
   */
  static async getCollection(characterId: string): Promise<ICharacterDeck | null> {
    let deck = await CharacterDeck.findOne({ characterId });

    if (!deck) {
      // Create default collection
      deck = await CharacterDeck.create({
        characterId,
        cards: [],
        activeDeck: [],
        deckName: 'Default Deck'
      });
    }

    return deck;
  }

  /**
   * Add card(s) to collection
   */
  static async addCard(
    characterId: string,
    cardId: string,
    quantity: number = 1
  ): Promise<ICharacterDeck> {
    const card = await CardDefinition.findOne({ cardId, isActive: true });
    if (!card) {
      throw new AppError('Card not found', 404);
    }

    let deck = await this.getCollection(characterId);
    if (!deck) {
      throw new AppError('Failed to get deck', 500);
    }

    const existingCard = deck.cards.find(c => c.cardId === cardId);
    if (existingCard) {
      existingCard.quantity += quantity;
    } else {
      deck.cards.push({
        cardId,
        quantity,
        acquiredAt: new Date()
      });
    }

    await deck.save();
    logger.info(`Added ${quantity}x ${cardId} to character ${characterId}'s collection`);

    return deck;
  }

  /**
   * Build/update active deck
   */
  static async buildDeck(
    characterId: string,
    cardIds: string[],
    deckName?: string
  ): Promise<ICharacterDeck> {
    if (cardIds.length !== 52) {
      throw new AppError('Deck must contain exactly 52 cards', 400);
    }

    const deck = await this.getCollection(characterId);
    if (!deck) {
      throw new AppError('Collection not found', 404);
    }

    // Verify player owns all cards
    for (const cardId of cardIds) {
      const owned = deck.cards.find(c => c.cardId === cardId);
      const count = cardIds.filter(id => id === cardId).length;

      if (!owned || owned.quantity < count) {
        throw new AppError(`Insufficient copies of ${cardId}`, 400);
      }
    }

    deck.activeDeck = cardIds;
    if (deckName) {
      deck.deckName = deckName;
    }

    await deck.save();
    return deck;
  }

  /**
   * Get all available card definitions
   */
  static async getAllCards(): Promise<ICardDefinition[]> {
    return CardDefinition.find({ isActive: true }).sort({ suit: 1, rank: 1 });
  }

  /**
   * Get cards by rarity
   */
  static async getCardsByRarity(rarity: string): Promise<ICardDefinition[]> {
    return CardDefinition.find({ rarity, isActive: true });
  }

  /**
   * Award random card from pool
   */
  static async awardRandomCard(
    characterId: string,
    minRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
  ): Promise<ICardDefinition> {
    const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
    const minIndex = rarityOrder.indexOf(minRarity);
    const validRarities = rarityOrder.slice(minIndex);

    const cards = await CardDefinition.find({
      rarity: { $in: validRarities },
      isActive: true
    });

    if (cards.length === 0) {
      throw new AppError('No cards available', 500);
    }

    // Weighted random selection
    const weights = cards.map(card => {
      switch (card.rarity) {
        case 'legendary': return 1;
        case 'epic': return 5;
        case 'rare': return 15;
        default: return 79;
      }
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = SecureRNG.float(0, 1) * totalWeight;

    let selectedCard = cards[0];
    for (let i = 0; i < cards.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedCard = cards[i];
        break;
      }
    }

    await this.addCard(characterId, selectedCard.cardId, 1);
    return selectedCard;
  }
}
