/**
 * PlayingCard Component
 * Visual playing card display for card games
 */

import React from 'react';

interface CardData {
  value: string;
  suit: string;
  numericValue?: number;
}

interface PlayingCardProps {
  card: CardData;
  hidden?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-16 text-lg',
  md: 'w-16 h-24 text-2xl',
  lg: 'w-20 h-28 text-3xl',
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  hidden = false,
  size = 'md',
  className = '',
}) => {
  const isRed = card.suit === '♥' || card.suit === '♦';

  if (hidden) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          rounded-lg border-2 flex items-center justify-center font-bold
          bg-blue-900 border-blue-700 text-blue-700
          ${className}
        `}
      >
        ?
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-lg border-2 bg-white border-gray-300
        flex items-center justify-center font-bold
        ${isRed ? 'text-red-500' : 'text-black'}
        ${className}
      `}
    >
      {card.value}{card.suit}
    </div>
  );
};

export default PlayingCard;
