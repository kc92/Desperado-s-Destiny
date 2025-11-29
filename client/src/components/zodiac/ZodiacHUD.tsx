/**
 * ZodiacHUD Component
 * Small HUD element showing current zodiac sign for game interface
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FrontierSign, SignBonus } from '@/types/zodiac.types';
import { SIGN_COLORS } from '@/constants/zodiac.constants';
import { BonusSummary } from './SignBonusDisplay';

interface ZodiacHUDProps {
  currentSign: FrontierSign | null;
  birthSign?: FrontierSign | null;
  activeBonuses?: SignBonus[];
  isPeakDay?: boolean;
  daysUntilNextSign?: number;
  daysUntilPeakDay?: number;
  variant?: 'minimal' | 'compact' | 'expanded';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  className?: string;
}

/**
 * Zodiac HUD component for game interface
 */
export const ZodiacHUD: React.FC<ZodiacHUDProps> = ({
  currentSign,
  birthSign,
  activeBonuses = [],
  isPeakDay = false,
  daysUntilNextSign = 0,
  daysUntilPeakDay = 0,
  variant = 'compact',
  position = 'inline',
  className = '',
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!currentSign) {
    return null;
  }

  const colors = SIGN_COLORS[currentSign.id];
  const isBirthSignActive = birthSign && birthSign.id === currentSign.id;

  // Position classes
  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'inline': '',
  };

  const handleClick = () => {
    if (variant === 'minimal') {
      navigate('/game/zodiac-calendar');
    } else {
      setShowDetails(!showDetails);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowDetails(false);
  };

  // Minimal variant - just icon
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-2 rounded-lg transition-all duration-300
          ${colors?.bgClass || 'bg-amber-500/20'}
          border ${colors?.borderClass || 'border-amber-500/30'}
          hover:scale-110 hover:shadow-lg
          ${isPeakDay ? 'animate-pulse ring-2 ring-gold-light' : ''}
          ${positionClasses[position]}
          ${className}
        `}
        title={`${currentSign.name} - ${currentSign.theme}`}
      >
        <span
          className="text-2xl"
          style={{
            textShadow: isHovered || isPeakDay
              ? `0 0 15px ${colors?.glow || 'rgba(255,215,0,0.6)'}`
              : 'none',
          }}
        >
          {currentSign.iconEmoji}
        </span>

        {/* Peak day indicator */}
        {isPeakDay && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold-light rounded-full animate-ping" />
        )}

        {/* Birth sign indicator */}
        {isBirthSignActive && (
          <span className="absolute -bottom-1 -right-1 text-xs">⭐</span>
        )}
      </button>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`relative ${positionClasses[position]} ${className}`}>
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-300
            ${colors?.bgClass || 'bg-amber-500/20'}
            border ${colors?.borderClass || 'border-amber-500/30'}
            hover:scale-105 hover:shadow-lg
            ${isPeakDay ? 'ring-2 ring-gold-light' : ''}
          `}
        >
          {/* Sign icon */}
          <span
            className="text-2xl"
            style={{
              textShadow: isHovered || isPeakDay
                ? `0 0 15px ${colors?.glow || 'rgba(255,215,0,0.6)'}`
                : 'none',
            }}
          >
            {currentSign.iconEmoji}
          </span>

          {/* Sign info */}
          <div className="text-left">
            <div className={`text-sm font-western ${colors?.textClass || 'text-gold-light'}`}>
              {currentSign.name}
            </div>
            <div className="text-xs text-desert-stone">
              {isPeakDay ? (
                <span className="text-gold-light animate-pulse">Peak Day!</span>
              ) : (
                `${daysUntilNextSign}d remaining`
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-1">
            {isPeakDay && (
              <span className="text-xs bg-gold-medium text-wood-dark px-1.5 py-0.5 rounded font-bold animate-pulse">
                PEAK
              </span>
            )}
            {isBirthSignActive && (
              <span className="text-xs bg-purple-500/50 text-purple-200 px-1.5 py-0.5 rounded">
                Birth
              </span>
            )}
          </div>
        </button>

        {/* Dropdown details */}
        {showDetails && (
          <div
            className={`
              absolute top-full mt-2 right-0 w-64
              bg-leather-dark border border-wood-grain/30
              rounded-lg shadow-xl p-4 z-50
            `}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-wood-grain/20">
              <span className="text-3xl">{currentSign.iconEmoji}</span>
              <div>
                <div className={`font-western ${colors?.textClass || 'text-gold-light'}`}>
                  {currentSign.name}
                </div>
                <div className="text-xs text-desert-stone italic">
                  {currentSign.theme}
                </div>
              </div>
            </div>

            {/* Active bonuses */}
            {activeBonuses.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-desert-stone mb-1">Active Bonuses</div>
                <BonusSummary bonuses={activeBonuses} maxDisplay={4} />
              </div>
            )}

            {/* Timeline info */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="text-desert-stone">
                Next sign in:
                <span className={`block font-bold ${colors?.textClass || 'text-gold-light'}`}>
                  {daysUntilNextSign} days
                </span>
              </div>
              <div className="text-desert-stone">
                Peak day in:
                <span className={`block font-bold ${colors?.textClass || 'text-gold-light'}`}>
                  {daysUntilPeakDay === 0 ? 'Today!' : `${daysUntilPeakDay} days`}
                </span>
              </div>
            </div>

            {/* Birth sign info */}
            {birthSign && (
              <div className="text-xs text-desert-stone mb-3 p-2 bg-wood-dark/30 rounded">
                Your Birth Sign: <span className="text-purple-400">{birthSign.name}</span>
                {isBirthSignActive && (
                  <span className="text-gold-light ml-1">(+10% bonus!)</span>
                )}
              </div>
            )}

            {/* Quick links */}
            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate('/game/star-map')}
                className="flex-1 px-2 py-1.5 bg-wood-dark hover:bg-wood-medium text-desert-sand text-xs rounded transition-colors"
              >
                Star Map
              </button>
              <button
                onClick={() => handleNavigate('/game/zodiac-calendar')}
                className="flex-1 px-2 py-1.5 bg-wood-dark hover:bg-wood-medium text-desert-sand text-xs rounded transition-colors"
              >
                Calendar
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {showDetails && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
        )}
      </div>
    );
  }

  // Expanded variant
  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <div
        className={`
          p-4 rounded-xl
          ${colors?.bgClass || 'bg-amber-500/20'}
          border ${colors?.borderClass || 'border-amber-500/30'}
          ${isPeakDay ? 'ring-2 ring-gold-light shadow-lg shadow-gold-dark/30' : ''}
        `}
      >
        {/* Header row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="text-4xl"
            style={{
              textShadow: isPeakDay
                ? `0 0 20px ${colors?.glow || 'rgba(255,215,0,0.6)'}`
                : 'none',
            }}
          >
            {currentSign.iconEmoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-western text-lg ${colors?.textClass || 'text-gold-light'}`}>
                {currentSign.name}
              </span>
              {isPeakDay && (
                <span className="text-xs bg-gold-medium text-wood-dark px-2 py-0.5 rounded font-bold animate-pulse">
                  PEAK DAY
                </span>
              )}
            </div>
            <div className="text-sm text-desert-stone italic">
              {currentSign.theme}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex gap-4 mb-3 text-sm">
          <div className="text-desert-stone">
            Sign ends: <span className={colors?.textClass || 'text-gold-light'}>{daysUntilNextSign}d</span>
          </div>
          <div className="text-desert-stone">
            Peak: <span className={colors?.textClass || 'text-gold-light'}>
              {daysUntilPeakDay === 0 ? 'Today!' : `${daysUntilPeakDay}d`}
            </span>
          </div>
        </div>

        {/* Active bonuses */}
        {activeBonuses.length > 0 && (
          <div className="mb-3">
            <BonusSummary bonuses={activeBonuses} maxDisplay={4} />
          </div>
        )}

        {/* Birth sign badge */}
        {birthSign && (
          <div className="flex items-center gap-2 p-2 bg-purple-500/20 border border-purple-500/30 rounded text-sm">
            <span>{birthSign.iconEmoji}</span>
            <span className="text-purple-300">Birth Sign: {birthSign.name}</span>
            {isBirthSignActive && (
              <span className="text-gold-light text-xs">(Active!)</span>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-wood-grain/20">
          <button
            onClick={() => handleNavigate('/game/star-map')}
            className="flex-1 px-3 py-2 bg-wood-dark hover:bg-wood-medium text-desert-sand text-sm rounded transition-colors"
          >
            View Stars
          </button>
          <button
            onClick={() => handleNavigate('/game/zodiac-calendar')}
            className="flex-1 px-3 py-2 bg-wood-dark hover:bg-wood-medium text-desert-sand text-sm rounded transition-colors"
          >
            Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZodiacHUD;
