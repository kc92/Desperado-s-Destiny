/**
 * DefeatEffect Component
 * Displays subdued effects when an action fails
 * Includes desaturation, dust particles, and subtle animations
 * Designed to be dramatic but NOT punishing
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../card/cardAnimations';
import { DustCloud } from './ParticleEmitter';

interface DefeatEffectProps {
  /** Whether the effect is active */
  isActive: boolean;
  /** Callback when effect completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const DefeatEffect: React.FC<DefeatEffectProps> = ({
  isActive,
  onComplete,
  className = '',
}) => {
  const reducedMotion = prefersReducedMotion();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showDust, setShowDust] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowOverlay(false);
      setShowDust(false);
      return;
    }

    // Trigger effects
    setShowOverlay(true);
    setShowDust(true);

    // Overlay fades after 500ms
    const overlayTimer = setTimeout(() => setShowOverlay(false), 500);

    // Dust fades after 1.5s, then complete
    const dustTimer = setTimeout(() => {
      setShowDust(false);
      onComplete?.();
    }, 1500);

    return () => {
      clearTimeout(overlayTimer);
      clearTimeout(dustTimer);
    };
  }, [isActive, onComplete]);

  // Reduced motion: simple desaturation pulse
  if (reducedMotion) {
    return (
      <AnimatePresence>
        {isActive && showOverlay && (
          <div
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              transition: 'opacity 0.3s ease-out',
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
      {/* Desaturation overlay - subtle, not harsh */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'saturate(70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Dust particles rising */}
      <DustCloud isActive={showDust} />

      {/* Subtle vignette darkening at edges */}
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.3) 100%)',
          }}
        />
      )}

      {/* "Better luck next time" message - subtle, not condescending */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-desert-sand/60 text-sm font-western tracking-wider">
              Not this time, partner...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DefeatEffect;
