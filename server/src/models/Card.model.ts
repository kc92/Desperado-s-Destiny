/**
 * Card Model
 * Destiny Deck card collection system
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICardDefinition extends Document {
  cardId: string;
  name: string;
  suit: 'SPADES' | 'HEARTS' | 'CLUBS' | 'DIAMONDS';
  rank: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string;
  effectValue: number;
  artwork: string;
  lore: string;
  isActive: boolean;
}

export interface ICharacterDeck extends Document {
  characterId: mongoose.Types.ObjectId;
  cards: Array<{
    cardId: string;
    quantity: number;
    acquiredAt: Date;
  }>;
  activeDeck: string[]; // 52 card IDs
  deckName: string;
  createdAt: Date;
  updatedAt: Date;
}

const CardDefinitionSchema = new Schema<ICardDefinition>(
  {
    cardId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    suit: {
      type: String,
      required: true,
      enum: ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS']
    },
    rank: {
      type: String,
      required: true
    },
    rarity: {
      type: String,
      required: true,
      enum: ['common', 'rare', 'epic', 'legendary']
    },
    effect: {
      type: String,
      required: true
    },
    effectValue: {
      type: Number,
      required: true
    },
    artwork: {
      type: String,
      default: ''
    },
    lore: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const CharacterDeckSchema = new Schema<ICharacterDeck>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    cards: [{
      cardId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      acquiredAt: { type: Date, default: Date.now }
    }],
    activeDeck: [{
      type: String
    }],
    deckName: {
      type: String,
      default: 'Default Deck'
    }
  },
  {
    timestamps: true
  }
);

CharacterDeckSchema.index({ characterId: 1 }, { unique: true });

export const CardDefinition = mongoose.model<ICardDefinition>('CardDefinition', CardDefinitionSchema);
export const CharacterDeck = mongoose.model<ICharacterDeck>('CharacterDeck', CharacterDeckSchema);
