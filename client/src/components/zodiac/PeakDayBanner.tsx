/**
 * PeakDayBanner Component
 * Special banner displayed during zodiac peak day events
 */

import React, { useState, useEffect } from 'react';
import type { FrontierSign, PeakDayEvent, SignBonus } from '@/types/zodiac.types';
import { SIGN_COLORS } from '@/constants/zodiac.constants';
import { Card } from '@/components/ui';
import { SignBonusDisplay } from './SignBonusDisplay';

interface PeakDayBannerProps {
  sign: FrontierSign;
  event?: PeakDayEvent | null;
  hoursRemaining?: number;
  onViewDetails?: () => void;
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

/**
 * Format hours remaining display
 */
function formatTimeRemaining(hours: number): string {
  if (hours <= 0) return 'Ending soon';
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 24) return `${Math.round(hours)} hours`;
  return `${Math.round(hours / 24)} days`;
}

/**
 * Peak day banner component
 */
export const PeakDayBanner: React.FC<PeakDayBannerProps> = ({
  sign,
  event,
  hoursRemaining = 24,
  onViewDetails,
  variant = 'full',
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id];
  const [pulsePhase, setPulsePhase] = useState(0);

  // Animate pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Get active peak bonuses
  const peakBonuses: SignBonus[] = event?.activeBonuses || sign.peakBonuses.map(b => ({
    ...b,
    isActive: true,
  }));

  if (variant === 'minimal') {
    return (
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-gradient-to-r ${colors?.gradient || 'from-amber-500 to-orange-600'}
          text-wood-dark font-western animate-pulse
          ${className}
        `}
      >
        <span className="text-xl">{sign.iconEmoji}</span>
        <span className="font-bold">PEAK DAY</span>
        <span className="text-sm opacity-80">
          {formatTimeRemaining(hoursRemaining)} remaining
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        variant="leather"
        padding="sm"
        className={`
          relative overflow-hidden
          ${className}
        `}
      >
        {/* Animated border */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `conic-gradient(from ${pulsePhase}deg, transparent, ${colors?.glow || 'rgba(255,215,0,0.5)'}, transparent)`,
            padding: 2,
          }}
        />

        <div className="relative bg-leather-dark rounded-lg p-3">
          <div className="flex items-center gap-3">
            {/* Sign icon */}
            <div
              className="text-4xl animate-bounce"
              style={{
                textShadow: `0 0 20px ${colors?.glow || 'rgba(255,215,0,0.6)'}`,
              }}
            >
              {sign.iconEmoji}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-western text-lg ${colors?.textClass || 'text-gold-light'}`}
                >
                  {sign.name}
                </span>
                <span className="bg-gold-medium text-wood-dark text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                  PEAK DAY
                </span>
              </div>
              <div className="text-xs text-desert-stone">
                {formatTimeRemaining(hoursRemaining)} remaining
              </div>
            </div>

            {/* View button */}
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="px-3 py-1 bg-gold-dark hover:bg-gold-medium text-wood-dark rounded font-western text-sm transition-colors"
              >
                Details
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Full variant
  return (
    <Card
      variant="leather"
      padding="none"
      className={`
        relative overflow-hidden
        ${className}
      `}
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 opacity-30 bg-gradient-to-r ${colors?.gradient || 'from-amber-500 to-orange-600'}`}
        />

        {/* Animated stars */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Radial glow */}
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(ellipse at center, ${colors?.glow || 'rgba(255,215,0,0.3)'} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `linear-gradient(${pulsePhase}deg, ${colors?.glow || 'rgba(255,215,0,0.6)'}, transparent, ${colors?.glow || 'rgba(255,215,0,0.6)'})`,
          padding: 3,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Left decoration */}
          <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-current ${colors?.textClass || 'text-gold-light'}`} />

          {/* Title */}
          <div className="text-center">
            <div
              className="text-6xl mb-2 animate-bounce"
              style={{
                textShadow: `0 0 30px ${colors?.glow || 'rgba(255,215,0,0.8)'}`,
              }}
            >
              {sign.iconEmoji}
            </div>
            <h2 className={`font-western text-3xl ${colors?.textClass || 'text-gold-light'}`}>
              {sign.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="bg-gold-medium text-wood-dark text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                PEAK DAY CELEBRATION
              </span>
            </div>
          </div>

          {/* Right decoration */}
          <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-current ${colors?.textClass || 'text-gold-light'}`} />
        </div>

        {/* Theme */}
        <p className="text-center text-desert-sand font-serif italic mb-4">
          "{sign.theme}"
        </p>

        {/* Time remaining */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-wood-dark/50 px-4 py-2 rounded-full">
            <span className="text-desert-stone text-sm">Time Remaining:</span>
            <span className={`font-western ${colors?.textClass || 'text-gold-light'}`}>
              {formatTimeRemaining(hoursRemaining)}
            </span>
          </div>
        </div>

        {/* Peak bonuses */}
        {peakBonuses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-center font-western text-desert-sand mb-3">
              Active Peak Bonuses
            </h3>
            <SignBonusDisplay
              bonuses={peakBonuses}
              isPeakDay={true}
              layout="grid"
              size="md"
            />
          </div>
        )}

        {/* Special content preview */}
        {event?.specialContent && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {event.specialContent.npcs.length > 0 && (
              <div className="text-center p-3 bg-wood-dark/30 rounded-lg">
                <div className="text-2xl mb-1">👤</div>
                <div className="text-xs text-desert-stone">Special NPCs</div>
                <div className={`font-bold ${colors?.textClass || 'text-gold-light'}`}>
                  {event.specialContent.npcs.length}
                </div>
              </div>
            )}
            {event.specialContent.bounties.length > 0 && (
              <div className="text-center p-3 bg-wood-dark/30 rounded-lg">
                <div className="text-2xl mb-1">📜</div>
                <div className="text-xs text-desert-stone">Bounties</div>
                <div className={`font-bold ${colors?.textClass || 'text-gold-light'}`}>
                  {event.specialContent.bounties.length}
                </div>
              </div>
            )}
            {event.specialContent.events.length > 0 && (
              <div className="text-center p-3 bg-wood-dark/30 rounded-lg">
                <div className="text-2xl mb-1">🎉</div>
                <div className="text-xs text-desert-stone">Events</div>
                <div className={`font-bold ${colors?.textClass || 'text-gold-light'}`}>
                  {event.specialContent.events.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        {onViewDetails && (
          <div className="text-center">
            <button
              onClick={onViewDetails}
              className={`
                px-6 py-3 rounded-lg font-western text-lg
                bg-gradient-to-r ${colors?.gradient || 'from-amber-500 to-orange-600'}
                text-wood-dark shadow-lg
                hover:scale-105 hover:shadow-xl
                transition-all duration-300
              `}
            >
              View Peak Day Details
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Countdown component for upcoming peak days
 */
interface PeakDayCountdownProps {
  sign: FrontierSign;
  daysUntil: number;
  className?: string;
}

export const PeakDayCountdown: React.FC<PeakDayCountdownProps> = ({
  sign,
  daysUntil,
  className = '',
}) => {
  const colors = SIGN_COLORS[sign.id];

  if (daysUntil <= 0) return null;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        ${colors?.bgClass || 'bg-amber-500/20'}
        border ${colors?.borderClass || 'border-amber-500/30'}
        ${className}
      `}
    >
      <span className="text-xl">{sign.iconEmoji}</span>
      <div className="flex-1">
        <div className={`text-sm font-western ${colors?.textClass || 'text-amber-400'}`}>
          {sign.name} Peak Day
        </div>
        <div className="text-xs text-desert-stone">
          {daysUntil === 1 ? 'Tomorrow!' : `In ${daysUntil} days`}
        </div>
      </div>
      {daysUntil <= 3 && (
        <span className="text-xs bg-gold-dark text-wood-dark px-2 py-0.5 rounded font-bold">
          SOON
        </span>
      )}
    </div>
  );
};

export default PeakDayBanner;
