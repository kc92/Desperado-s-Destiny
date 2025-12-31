/**
 * PermadeathScreen Component
 * Final death screen shown after permadeath occurs
 *
 * Features:
 * - Dramatic death animation
 * - Epitaph display
 * - Character stats summary
 * - Gravestone placement cinematic
 * - Legacy stats update
 * - Options: Create New Character, Visit Grave
 */

import React, { useState, useEffect } from 'react';
// Navigation handled by parent via callbacks
import { PermadeathOutcome } from '@desperados/shared';

interface PermadeathScreenProps {
  /** Permadeath outcome data */
  outcome: PermadeathOutcome;
  /** Character stats at death */
  characterStats?: {
    level: number;
    totalPlayTime: number;
    totalKills: number;
    totalDeaths: number;
    highestBounty: number;
    goldAtDeath: number;
  };
  /** Called when player chooses to create new character */
  onCreateNewCharacter: () => void;
  /** Called when player wants to visit the grave */
  onVisitGrave?: () => void;
}

/**
 * Animated gravestone component
 */
const AnimatedGravestone: React.FC<{
  characterName: string;
  epitaph: string;
}> = ({ characterName, epitaph }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        relative mx-auto transition-all duration-1000
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}
    >
      {/* Gravestone shape */}
      <div className="relative">
        {/* Stone texture background */}
        <div
          className="w-64 h-80 mx-auto rounded-t-full bg-gradient-to-b from-gray-600 to-gray-800 border-4 border-gray-500 shadow-2xl"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
          }}
        >
          {/* Cross */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <div className="text-4xl text-gray-400 drop-shadow-lg">✟</div>
          </div>

          {/* RIP header */}
          <div className="absolute top-16 left-0 right-0 text-center">
            <div className="font-western text-2xl text-gray-300 tracking-widest">R.I.P.</div>
          </div>

          {/* Name */}
          <div className="absolute top-28 left-0 right-0 text-center px-4">
            <div className="font-western text-xl text-gray-200 leading-tight">
              {characterName}
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-44 left-8 right-8">
            <div className="h-0.5 bg-gray-500" />
          </div>

          {/* Epitaph */}
          <div className="absolute top-48 left-0 right-0 text-center px-6">
            <p className="text-sm italic text-gray-400 leading-relaxed">
              "{epitaph}"
            </p>
          </div>
        </div>

        {/* Ground/dirt base */}
        <div className="w-72 h-8 mx-auto bg-gradient-to-t from-amber-900 to-amber-800 rounded-b-lg -mt-2 relative overflow-hidden">
          {/* Grass tufts */}
          <div className="absolute -top-2 left-4 text-green-700 text-xl">🌿</div>
          <div className="absolute -top-2 right-6 text-green-700 text-xl">🌾</div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="w-full h-full bg-gradient-radial from-red-900/50 to-transparent" />
      </div>
    </div>
  );
};

/**
 * Stat display row
 */
const StatRow: React.FC<{ label: string; value: string | number; icon?: string }> = ({
  label,
  value,
  icon,
}) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
    <span className="text-desert-sand/70 flex items-center gap-2">
      {icon && <span>{icon}</span>}
      {label}
    </span>
    <span className="text-gold-light font-bold">{value}</span>
  </div>
);

export const PermadeathScreen: React.FC<PermadeathScreenProps> = ({
  outcome,
  characterStats,
  onCreateNewCharacter,
  onVisitGrave,
}) => {
  // Navigation handled by callbacks (onCreateNewCharacter, onVisitGrave)
  const [phase, setPhase] = useState<'fade' | 'gravestone' | 'stats' | 'options'>('fade');

  // Animate through phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('gravestone'), 1000),
      setTimeout(() => setPhase('stats'), 3000),
      setTimeout(() => setPhase('options'), 4500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Format playtime
  const formatPlayTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    return `${Math.floor(hours / 24)} days, ${Math.round(hours % 24)} hours`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-red-950/20 via-black to-black" />

        {/* Particle effects - falling ash */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gray-500/30 rounded-full animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        {/* Title - appears during fade phase */}
        <div
          className={`
            text-center mb-8 transition-all duration-1000
            ${phase !== 'fade' ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <h1 className="font-western text-5xl text-red-500 mb-2 tracking-wider">
            PERMADEATH
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-red-700 to-transparent" />
        </div>

        {/* Gravestone - appears in gravestone phase */}
        <div
          className={`
            transition-all duration-1000 mb-8
            ${phase !== 'fade' ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <AnimatedGravestone
            characterName={outcome.characterName}
            epitaph={outcome.epitaph}
          />
        </div>

        {/* Stats and details - appear in stats phase */}
        <div
          className={`
            transition-all duration-1000
            ${phase === 'stats' || phase === 'options' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Death details */}
            <div className="bg-gray-900/80 rounded-lg p-6 border border-red-900/30">
              <h3 className="font-western text-xl text-red-400 mb-4">Death Details</h3>
              <StatRow label="Cause of Death" value={outcome.deathType} icon="💀" />
              <StatRow label="Location" value={outcome.deathLocation} icon="📍" />
              {outcome.killerName && (
                <StatRow label="Killed By" value={outcome.killerName} icon="⚔️" />
              )}
              <StatRow
                label="Time of Death"
                value={new Date(outcome.diedAt).toLocaleString()}
                icon="🕐"
              />
            </div>

            {/* Character stats */}
            {characterStats && (
              <div className="bg-gray-900/80 rounded-lg p-6 border border-gold-dark/30">
                <h3 className="font-western text-xl text-gold-light mb-4">Final Stats</h3>
                <StatRow label="Level Reached" value={characterStats.level} icon="⭐" />
                <StatRow
                  label="Time Played"
                  value={formatPlayTime(characterStats.totalPlayTime)}
                  icon="⏱️"
                />
                <StatRow label="Total Kills" value={characterStats.totalKills} icon="🎯" />
                <StatRow
                  label="Highest Bounty"
                  value={`$${characterStats.highestBounty.toLocaleString()}`}
                  icon="💰"
                />
              </div>
            )}
          </div>

          {/* Inheritance note */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gold-dark/20 border border-gold-dark/30 rounded-lg px-6 py-3">
              <p className="text-desert-sand text-sm">
                <span className="text-gold-light font-bold">A gravestone has been placed.</span>
                <br />
                Your next character can visit to claim inheritance.
              </p>
            </div>
          </div>
        </div>

        {/* Options - appear in options phase */}
        <div
          className={`
            flex justify-center gap-4 transition-all duration-1000
            ${phase === 'options' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          <button
            onClick={onCreateNewCharacter}
            className="px-8 py-4 bg-gold-dark hover:bg-gold-medium text-wood-dark font-western text-xl rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Create New Character
          </button>

          {onVisitGrave && (
            <button
              onClick={onVisitGrave}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-western text-xl rounded-lg border border-gray-600 transition-all duration-300"
            >
              Visit Grave
            </button>
          )}
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PermadeathScreen;
