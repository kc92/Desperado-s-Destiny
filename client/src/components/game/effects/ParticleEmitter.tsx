/**
 * ParticleEmitter Component
 * CSS-based particle system for celebrations and effects
 * Uses useMemo for performance - particles are calculated once
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../card/cardAnimations';

export type ParticleType = 'gold_sparkle' | 'confetti' | 'dust' | 'coin' | 'star';
export type ParticleIntensity = 'low' | 'medium' | 'high' | 'explosion';

interface ParticleEmitterProps {
  /** Type of particles to emit */
  type: ParticleType;
  /** Number of particles (based on intensity) */
  intensity?: ParticleIntensity;
  /** Whether particles are active */
  isActive: boolean;
  /** Duration of particle animation in ms */
  duration?: number;
  /** Color override */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

// Particle count by intensity
const INTENSITY_COUNT: Record<ParticleIntensity, number> = {
  low: 8,
  medium: 15,
  high: 25,
  explosion: 40,
};

// Particle configuration by type
const PARTICLE_CONFIG: Record<ParticleType, {
  symbol: string;
  colors: string[];
  size: { min: number; max: number };
  duration: { min: number; max: number };
}> = {
  gold_sparkle: {
    symbol: '✦',
    colors: ['#FFD700', '#FFC107', '#FFE55C', '#FFFFFF'],
    size: { min: 8, max: 16 },
    duration: { min: 800, max: 1500 },
  },
  confetti: {
    symbol: '■',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'],
    size: { min: 6, max: 12 },
    duration: { min: 1000, max: 2000 },
  },
  dust: {
    symbol: '•',
    colors: ['#8B7355', '#A0522D', '#6B4423', '#D2B48C'],
    size: { min: 4, max: 10 },
    duration: { min: 1200, max: 2000 },
  },
  coin: {
    symbol: '●',
    colors: ['#FFD700', '#FFC107', '#DAA520'],
    size: { min: 10, max: 18 },
    duration: { min: 1000, max: 1800 },
  },
  star: {
    symbol: '★',
    colors: ['#FFD700', '#FFFFFF', '#FFC107'],
    size: { min: 12, max: 20 },
    duration: { min: 800, max: 1400 },
  },
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  symbol: string;
  duration: number;
  delay: number;
  angle: number; // Direction of movement
  distance: number; // How far to travel
  rotation: number;
}

function generateParticles(
  type: ParticleType,
  count: number,
  colorOverride?: string
): Particle[] {
  const config = PARTICLE_CONFIG[type];
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const colors = colorOverride ? [colorOverride] : config.colors;
    particles.push({
      id: i,
      x: 50 + (Math.random() - 0.5) * 30, // Spread around center
      y: 50 + (Math.random() - 0.5) * 20,
      size: config.size.min + Math.random() * (config.size.max - config.size.min),
      color: colors[Math.floor(Math.random() * colors.length)],
      symbol: config.symbol,
      duration: config.duration.min + Math.random() * (config.duration.max - config.duration.min),
      delay: Math.random() * 300, // Stagger start
      angle: Math.random() * 360, // Random direction
      distance: 50 + Math.random() * 100, // Random distance
      rotation: Math.random() * 720 - 360, // Random rotation
    });
  }

  return particles;
}

export const ParticleEmitter: React.FC<ParticleEmitterProps> = ({
  type,
  intensity = 'medium',
  isActive,
  duration: _duration = 2000,
  color,
  className = '',
}) => {
  const reducedMotion = prefersReducedMotion();

  // Generate particles once using useMemo
  const particles = useMemo(
    () => generateParticles(type, INTENSITY_COUNT[intensity], color),
    [type, intensity, color]
  );

  // Skip animations for reduced motion
  if (reducedMotion || !isActive) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {isActive && particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: 0,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              left: `${particle.x + Math.cos(particle.angle * Math.PI / 180) * particle.distance}%`,
              top: `${particle.y + Math.sin(particle.angle * Math.PI / 180) * particle.distance - 30}%`,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.5],
              rotate: particle.rotation,
            }}
            transition={{
              duration: particle.duration / 1000,
              delay: particle.delay / 1000,
              ease: 'easeOut',
              times: [0, 0.2, 0.7, 1],
            }}
            style={{
              position: 'absolute',
              fontSize: particle.size,
              color: particle.color,
              textShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
              willChange: 'transform, opacity',
            }}
          >
            {particle.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * GoldBurst - Pre-configured gold particle explosion for victories
 */
export const GoldBurst: React.FC<{ isActive: boolean; className?: string }> = ({
  isActive,
  className,
}) => (
  <ParticleEmitter
    type="gold_sparkle"
    intensity="high"
    isActive={isActive}
    className={className}
  />
);

/**
 * CoinShower - Falling coins for gold rewards
 */
export const CoinShower: React.FC<{ isActive: boolean; className?: string }> = ({
  isActive,
  className,
}) => (
  <ParticleEmitter
    type="coin"
    intensity="medium"
    isActive={isActive}
    className={className}
  />
);

/**
 * DustCloud - Subtle dust for defeats
 */
export const DustCloud: React.FC<{ isActive: boolean; className?: string }> = ({
  isActive,
  className,
}) => (
  <ParticleEmitter
    type="dust"
    intensity="low"
    isActive={isActive}
    className={className}
  />
);

export default ParticleEmitter;
