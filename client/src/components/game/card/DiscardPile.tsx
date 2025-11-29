/**
 * DiscardPile Component
 * Visual discard pile that cards animate to
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@desperados/shared';

interface DiscardPileProps {
  /** Cards in the discard pile */
  discardedCards?: CardType[];
  /** Whether pile is receiving cards */
  isReceiving?: boolean;
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

export const DiscardPile: React.FC<DiscardPileProps> = ({
  discardedCards = [],
  isReceiving = false,
  position,
  size = 'md',
  className = '',
}) => {
  const sizeStyle = SIZE_STYLES[size];
  const hasCards = discardedCards.length > 0;

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        width: sizeStyle.width,
        height: sizeStyle.height,
      }}
    >
      {/* Empty pile indicator */}
      {!hasCards && (
        <div
          className="absolute rounded-lg border-2 border-dashed border-wood-light/30"
          style={{
            width: sizeStyle.width,
            height: sizeStyle.height,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-wood-light/30 text-xs font-western">DISCARD</span>
          </div>
        </div>
      )}

      {/* Messy pile of discarded cards */}
      <AnimatePresence>
        {discardedCards.slice(-4).map((card, index) => (
          <motion.div
            key={`${card.suit}-${card.rank}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 0.6,
              scale: 1,
              rotate: (Math.random() - 0.5) * 30,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-lg border-4 border-leather-saddle shadow-md overflow-hidden"
            style={{
              width: sizeStyle.width,
              height: sizeStyle.height,
              transform: `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`,
              zIndex: index,
            }}
          >
            {/* Card back - discards shown face-down */}
            <div className="w-full h-full bg-gradient-to-br from-leather-brown via-leather-tan to-leather-brown p-1">
              <div className="w-full h-full border-2 border-gold-dark/50 rounded flex items-center justify-center">
                <div className="text-gold-light/50 text-xl font-western">DD</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Glow when receiving */}
      {isReceiving && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: [
              '0 0 10px rgba(255, 100, 100, 0.3)',
              '0 0 20px rgba(255, 100, 100, 0.5)',
              '0 0 10px rgba(255, 100, 100, 0.3)',
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

export default DiscardPile;
