/**
 * JailScreen Component
 * Full-screen overlay when character is jailed
 * Features: Real-time countdown, bail option, western prison aesthetic
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface JailScreenProps {
  /** Whether the character is currently jailed */
  isJailed: boolean;
  /** Timestamp when jail time ends */
  jailedUntil: Date | null;
  /** Cost to pay bail and get out early (in dollars) */
  bailCost: number;
  /** Character's current dollars */
  currentDollars: number;
  /** Offense that led to jail */
  offense?: string;
  /** Callback when player pays bail */
  onPayBail: () => void;
  /** Callback when jail time expires */
  onJailExpired?: () => void;
}

// Randomized jail flavor text (10+ variants)
const JAIL_FLAVOR_TEXTS = [
  "The iron bars are cold. Time moves slowly.",
  "You hear the sheriff laughing outside.",
  "A rat scurries across the floor.",
  "You contemplate your life choices.",
  "The cell smells of dust and regret.",
  "Sunlight filters through the barred window.",
  "You count the stones in the wall... again.",
  "Somewhere, a harmonica plays a lonesome tune.",
  "The cot is hard. Very hard.",
  "You wonder what your gang is doing without you.",
  "A deputy walks by, whistling cheerfully.",
  "The wanted poster on the wall looks familiar.",
  "Time to think about going straight... maybe.",
  "At least the beans were warm today.",
];

/**
 * Format time remaining as "Xh Ym Zs" or "Ym Zs" or "Zs"
 */
const formatTimeRemaining = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

/**
 * Calculate progress percentage (0-100)
 */
const calculateProgress = (jailedAt: Date, jailedUntil: Date, now: Date): number => {
  const totalTime = jailedUntil.getTime() - jailedAt.getTime();
  const elapsed = now.getTime() - jailedAt.getTime();
  return Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
};

/**
 * Jail screen with countdown timer and western prison aesthetic
 */
export const JailScreen: React.FC<JailScreenProps> = ({
  isJailed,
  jailedUntil,
  bailCost,
  currentDollars,
  offense = "Criminal Activities",
  onPayBail,
  onJailExpired,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [flavorText, setFlavorText] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  const canAffordBail = currentDollars >= bailCost;

  // Initialize flavor text
  useEffect(() => {
    if (isJailed) {
      const randomIndex = Math.floor(Math.random() * JAIL_FLAVOR_TEXTS.length);
      setFlavorText(JAIL_FLAVOR_TEXTS[randomIndex]);
    }
  }, [isJailed]);

  // Real-time countdown timer
  useEffect(() => {
    if (!isJailed || !jailedUntil) return;

    const updateTimer = () => {
      const now = new Date();
      const remaining = jailedUntil.getTime() - now.getTime();

      if (remaining <= 0) {
        setTimeRemaining(0);
        setProgress(100);
        setIsExpired(true);
        if (onJailExpired) {
          onJailExpired();
        }
      } else {
        setTimeRemaining(remaining);

        // Calculate progress (assuming jail started at some point in the past)
        // For simplicity, we'll estimate based on remaining time
        // In a real app, you'd want to track when jail started
        const estimatedStart = new Date(jailedUntil.getTime() - remaining * 2);
        setProgress(calculateProgress(estimatedStart, jailedUntil, now));
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [isJailed, jailedUntil, onJailExpired]);

  if (!isJailed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-wood-dark/95 backdrop-blur-sm">
      {/* Prison Bars Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full flex justify-around">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-full bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600 shadow-lg"
              style={{
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        {/* Wanted Poster on Wall */}
        <div className="absolute -top-32 -right-16 opacity-30 transform rotate-12 hidden md:block">
          <div className="parchment p-4 border-4 border-leather-brown shadow-xl">
            <div className="font-western text-3xl text-blood-red text-center mb-2">WANTED</div>
            <div className="text-xs text-center">DEAD OR ALIVE</div>
          </div>
        </div>

        {/* Jail Info Panel */}
        <div className="parchment p-8 rounded-lg border-4 border-leather-brown shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-western text-blood-red mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              YOU'RE IN JAIL
            </h1>
            <p className="text-wood-medium text-lg">The law has caught up with you</p>
          </div>

          {/* Offense */}
          <div className="mb-6 p-4 bg-wood-light/30 rounded border-2 border-wood-medium">
            <div className="text-sm text-wood-grain uppercase tracking-wide mb-1">Caught Committing:</div>
            <div className="text-xl font-bold text-blood-red">{offense}</div>
          </div>

          {/* Timer Display */}
          {!isExpired && (
            <div className="mb-6">
              <div className="text-center mb-3">
                <div className="text-sm text-wood-grain uppercase tracking-wide mb-2">Time Remaining:</div>
                <div className="text-4xl font-western text-gold-dark mb-4">
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-8 bg-wood-dark/30 rounded-lg border-2 border-wood-medium overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-gold-dark to-gold-medium transition-all duration-1000 ease-linear ${
                    timeRemaining < 60000 ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                  {Math.round(progress)}% Time Served
                </div>
              </div>

              {timeRemaining < 60000 && (
                <div className="text-center mt-2 text-sm text-blood-red font-bold animate-pulse">
                  Less than 1 minute remaining!
                </div>
              )}
            </div>
          )}

          {/* Celebration Message */}
          {isExpired && (
            <div className="mb-6 p-6 bg-green-100 border-4 border-green-600 rounded-lg text-center">
              <div className="text-3xl font-western text-green-800 mb-2">You're Free!</div>
              <p className="text-green-700">Your jail time has been served. Don't get caught again!</p>
            </div>
          )}

          {/* Flavor Text */}
          <div className="mb-6 p-4 bg-wood-dark/20 rounded border-l-4 border-desert-clay italic text-wood-medium">
            "{flavorText}"
          </div>

          {/* Action Buttons */}
          {!isExpired && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pay Bail */}
              <div>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  disabled={!canAffordBail}
                  onClick={onPayBail}
                >
                  Pay Bail: ${bailCost}
                </Button>
                {!canAffordBail && (
                  <p className="text-xs text-blood-red mt-2 text-center">
                    Insufficient dollars (need ${bailCost - currentDollars} more)
                  </p>
                )}
              </div>

              {/* Serve Time */}
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                disabled
              >
                Serve Time
              </Button>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="text-center mt-4 text-sm text-desert-clay">
          <p>All actions are blocked while jailed. Pay bail or wait it out.</p>
        </div>
      </div>
    </div>
  );
};

export default JailScreen;
