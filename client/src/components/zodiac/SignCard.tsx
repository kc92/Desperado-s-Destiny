/**
 * SignCard Component
 * Displays a zodiac sign with icon, name, dates, and theme
 */

import React from 'react';
import type { FrontierSign, ZodiacSignId } from '@/types/zodiac.types';
import { SIGN_COLORS } from '@/constants/zodiac.constants';
import { Card } from '@/components/ui';

interface SignCardProps {
  sign: FrontierSign;
  isActive?: boolean;
  isSelected?: boolean;
  isBirthSign?: boolean;
  showDates?: boolean;
  showBonuses?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (sign: FrontierSign) => void;
  className?: string;
}

/**
 * Format date range display
 */
function formatDateRange(sign: FrontierSign): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[sign.startMonth - 1]} ${sign.startDay} - ${months[sign.endMonth - 1]} ${sign.endDay}`;
}

/**
 * Sign card component for displaying zodiac signs
 */
export const SignCard: React.FC<SignCardProps> = ({
  sign,
  isActive = false,
  isSelected = false,
  isBirthSign = false,
  showDates = true,
  showBonuses = false,
  size = 'md',
  onClick,
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id as ZodiacSignId];

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const handleClick = () => {
    if (onClick) {
      onClick(sign);
    }
  };

  return (
    <Card
      variant="leather"
      padding="none"
      hover={!!onClick}
      onClick={onClick ? handleClick : undefined}
      className={`
        relative overflow-hidden transition-all duration-300
        ${sizeClasses[size]}
        ${isActive ? 'ring-2 ring-gold-light shadow-lg shadow-gold-dark/30' : ''}
        ${isSelected ? 'ring-2 ring-gold-medium scale-105' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 opacity-20 bg-gradient-to-br ${colors?.gradient || 'from-amber-500 to-orange-600'}`}
      />

      {/* Glow effect for active sign */}
      {isActive && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(circle at center, ${colors?.glow || 'rgba(245, 158, 11, 0.3)'} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Birth Sign Badge */}
        {isBirthSign && (
          <div className="absolute -top-2 -right-2 bg-gold-medium text-wood-dark text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
            Birth Sign
          </div>
        )}

        {/* Active Indicator */}
        {isActive && !isBirthSign && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
            Current
          </div>
        )}

        {/* Sign Icon */}
        <div
          className={`
            ${iconSizes[size]} mb-2
            transition-transform duration-300
            ${isActive ? 'animate-bounce' : ''}
            ${onClick ? 'group-hover:scale-110' : ''}
          `}
          style={{
            textShadow: isActive ? `0 0 20px ${colors?.glow || 'rgba(255,255,255,0.5)'}` : 'none',
          }}
        >
          {sign.iconEmoji}
        </div>

        {/* Sign Name */}
        <h3
          className={`
            font-western tracking-wide
            ${titleSizes[size]}
            ${colors?.textClass || 'text-gold-light'}
            ${isActive ? 'animate-pulse' : ''}
          `}
        >
          {sign.name}
        </h3>

        {/* Theme */}
        <p className="text-desert-stone text-sm italic mt-1">{sign.theme}</p>

        {/* Date Range */}
        {showDates && (
          <p className="text-desert-sand/70 text-xs mt-2 font-serif">
            {formatDateRange(sign)}
          </p>
        )}

        {/* Description (for larger sizes) */}
        {size === 'lg' && (
          <p className="text-desert-sand text-sm mt-3 font-serif line-clamp-2">
            {sign.description}
          </p>
        )}

        {/* Bonuses preview */}
        {showBonuses && sign.bonuses.length > 0 && (
          <div className="mt-3 space-y-1 w-full">
            <div className="text-xs text-desert-stone uppercase tracking-wider">Bonuses</div>
            {sign.bonuses.slice(0, 2).map(bonus => (
              <div
                key={bonus.id}
                className={`
                  text-xs px-2 py-1 rounded
                  ${colors?.bgClass || 'bg-amber-500/20'}
                  ${colors?.textClass || 'text-amber-400'}
                `}
              >
                {bonus.name}: +{bonus.value}%
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom border accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors?.gradient || 'from-amber-500 to-orange-600'}`}
        style={{ opacity: isActive ? 1 : 0.5 }}
      />
    </Card>
  );
};

export default SignCard;
