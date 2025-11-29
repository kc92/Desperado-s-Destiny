/**
 * VictoryCelebration Component
 * Displays celebratory effects when an action succeeds
 * Includes gold particles, screen tint, and animated elements
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../card/cardAnimations';
import { ParticleEmitter, GoldBurst } from './ParticleEmitter';

interface VictoryCelebrationProps {
  /** Whether the celebration is active */
  isActive: boolean;
  /** Intensity based on hand strength (1-10) */
  intensity?: number;
  /** Callback when celebration completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Intensity tiers for different celebration levels
type CelebrationTier = 'minor' | 'standard' | 'major' | 'legendary';

function getCelebrationTier(intensity: number): CelebrationTier {
  if (intensity >= 9) return 'legendary'; // Royal/Straight Flush
  if (intensity >= 6) return 'major'; // Flush, Full House, Four of a Kind
  if (intensity >= 4) return 'standard'; // Three of a Kind, Straight
  return 'minor'; // Pair, Two Pair, High Card
}

// Screen flash colors by tier
const TIER_COLORS: Record<CelebrationTier, string> = {
  minor: 'rgba(255, 215, 0, 0.1)',
  standard: 'rgba(255, 215, 0, 0.15)',
  major: 'rgba(255, 215, 0, 0.25)',
  legendary: 'rgba(255, 215, 0, 0.4)',
};

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  isActive,
  intensity = 5,
  onComplete,
  className = '',
}) => {
  const reducedMotion = prefersReducedMotion();
  const [showFlash, setShowFlash] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const tier = getCelebrationTier(intensity);

  useEffect(() => {
    if (!isActive) {
      setShowFlash(false);
      setShowParticles(false);
      return;
    }

    // Trigger flash immediately
    setShowFlash(true);
    setShowParticles(true);

    // Flash fades after 300ms
    const flashTimer = setTimeout(() => setShowFlash(false), 300);

    // Particles fade after 2s, then complete
    const particleTimer = setTimeout(() => {
      setShowParticles(false);
      onComplete?.();
    }, 2000);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(particleTimer);
    };
  }, [isActive, onComplete]);

  // Reduced motion: simple flash only
  if (reducedMotion) {
    return (
      <AnimatePresence>
        {isActive && (
          <div
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{
              backgroundColor: TIER_COLORS[tier],
              transition: 'opacity 0.3s ease-out',
              opacity: showFlash ? 1 : 0,
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Screen flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            style={{ backgroundColor: TIER_COLORS[tier] }}
          />
        )}
      </AnimatePresence>

      {/* Gold particle burst */}
      <GoldBurst isActive={showParticles} />

      {/* Extra star particles for major/legendary */}
      {(tier === 'major' || tier === 'legendary') && (
        <ParticleEmitter
          type="star"
          intensity={tier === 'legendary' ? 'explosion' : 'high'}
          isActive={showParticles}
        />
      )}

      {/* Legendary: Extra confetti */}
      {tier === 'legendary' && (
        <ParticleEmitter
          type="confetti"
          intensity="high"
          isActive={showParticles}
        />
      )}

      {/* Corner sparkle animations for major+ */}
      {tier !== 'minor' && showParticles && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute top-4 left-4 text-4xl text-gold-light"
            style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}
          >
            ✦
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-4 right-4 text-4xl text-gold-light"
            style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}
          >
            ✦
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute bottom-4 left-4 text-4xl text-gold-light"
            style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}
          >
            ✦
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute bottom-4 right-4 text-4xl text-gold-light"
            style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}
          >
            ✦
          </motion.div>
        </>
      )}
    </div>
  );
};

export default VictoryCelebration;
