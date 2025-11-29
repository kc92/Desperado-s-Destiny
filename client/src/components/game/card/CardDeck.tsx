/**
 * CardDeck Component
 * Visual deck pile that cards animate from
 */

import React from 'react';
import { motion } from 'framer-motion';

interface CardDeckProps {
  /** Whether deck is currently dealing */
  isDealing?: boolean;
  /** Number of cards remaining (for display) */
  cardsRemaining?: number;
  /** Position override */
  position?: { x: number; y: number };
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const SIZE_STYLES = {
  sm: { width: 64, height: 96 },
  md: { width: 96, height: 144 },
  lg: { width: 128, height: 192 },
};

export const CardDeck: React.FC<CardDeckProps> = ({
  isDealing = false,
  cardsRemaining,
  position,
  size = 'md',
  className = '',
}) => {
  const sizeStyle = SIZE_STYLES[size];

  // Stack layers for depth effect
  const stackLayers = [
    { offset: 0, opacity: 1 },
    { offset: 2, opacity: 0.9 },
    { offset: 4, opacity: 0.8 },
    { offset: 6, opacity: 0.7 },
  ];

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: sizeStyle.width,
        height: sizeStyle.height,
      }}
      animate={isDealing ? { scale: 0.95 } : { scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      {/* Stacked card backs for depth */}
      {stackLayers.map((layer, i) => (
        <div
          key={i}
          className="absolute rounded-lg border-4 border-leather-saddle shadow-wood overflow-hidden"
          style={{
            width: sizeStyle.width,
            height: sizeStyle.height,
            transform: `translate(${layer.offset}px, ${layer.offset}px)`,
            opacity: layer.opacity,
            zIndex: stackLayers.length - i,
          }}
        >
          {/* Leather texture background */}
          <div className="w-full h-full bg-gradient-to-br from-leather-brown via-leather-tan to-leather-brown p-2">
            {/* Gold border pattern */}
            <div className="w-full h-full border-4 border-gold-dark rounded flex items-center justify-center relative overflow-hidden">
              {/* Western pattern */}
              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute inset-0 bg-repeat"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,69,19,0.3) 10px, rgba(139,69,19,0.3) 20px)`,
                  }}
                />
              </div>

              {/* Center emblem - only on top card */}
              {i === 0 && (
                <div className="text-gold-light text-3xl font-western z-10">DD</div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Card count indicator */}
      {cardsRemaining !== undefined && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-wood-dark text-gold-light text-xs font-bold px-2 py-1 rounded">
          {cardsRemaining}
        </div>
      )}

      {/* Subtle glow when dealing */}
      {isDealing && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: [
              '0 0 10px rgba(255, 215, 0, 0.3)',
              '0 0 20px rgba(255, 215, 0, 0.5)',
              '0 0 10px rgba(255, 215, 0, 0.3)',
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
};

export default CardDeck;
