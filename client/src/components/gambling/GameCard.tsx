/**
 * GameCard Component
 * Game selection card for the gambling hub
 */

import React from 'react';
import type { GameType } from '@/services/gambling.service';

interface GameCardProps {
  game: GameType;
  onClick: () => void;
  disabled?: boolean;
}

const GAME_INFO: Record<GameType, { name: string; icon: string; description: string }> = {
  blackjack: {
    name: 'Blackjack',
    icon: '🃏',
    description: 'Beat the dealer by getting closer to 21',
  },
  roulette: {
    name: 'Roulette',
    icon: '🎰',
    description: 'Bet on where the ball lands',
  },
  craps: {
    name: 'Craps',
    icon: '🎲',
    description: 'Roll the dice and beat the house',
  },
  faro: {
    name: 'Faro',
    icon: '♠️',
    description: 'Bet on cards to win or lose',
  },
  three_card_monte: {
    name: 'Three-Card Monte',
    icon: '🎴',
    description: 'Find the Queen among three cards',
  },
  wheel_of_fortune: {
    name: 'Wheel of Fortune',
    icon: '🎡',
    description: 'Spin the wheel for big prizes',
  },
};

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onClick,
  disabled = false,
}) => {
  const info = GAME_INFO[game];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-wood-grain/10 rounded-lg p-6 border-2 border-wood-grain/30
        hover:border-gold-light transition-all hover:scale-105 text-left
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      `}
    >
      <div className="text-4xl mb-3">{info.icon}</div>
      <h3 className="font-western text-lg text-wood-dark">{info.name}</h3>
      <p className="text-sm text-wood-grain mt-1">{info.description}</p>
    </button>
  );
};

export const getGameName = (game: GameType): string => GAME_INFO[game].name;
export const getGameIcon = (game: GameType): string => GAME_INFO[game].icon;
export const getGameDescription = (game: GameType): string => GAME_INFO[game].description;

export default GameCard;
