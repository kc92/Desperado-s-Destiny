/**
 * CombatFeedback Component
 * Manages all combat visual feedback - damage numbers, flashes, shake effects
 * Integrates Western-Modern-Cinematic hybrid style
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DamageNumber, DamageNumberProps } from './DamageNumber';
import { DamageFlash, DamageFlashProps } from './DamageFlash';

interface DamageInstance extends DamageNumberProps {
  id: string;
  timestamp: number;
}

interface FlashInstance extends DamageFlashProps {
  id: string;
  timestamp: number;
}

export interface CombatFeedbackProps {
  /** Reference element for positioning (e.g., enemy sprite container) */
  targetRef?: React.RefObject<HTMLElement>;
  /** Whether combat is active */
  isActive?: boolean;
}

export interface CombatFeedbackHandle {
  /** Show damage number */
  showDamage: (amount: number, isCritical?: boolean) => void;
  /** Show miss */
  showMiss: () => void;
  /** Show healing */
  showHeal: (amount: number) => void;
  /** Show screen flash */
  showFlash: (type: 'damage' | 'critical' | 'heal' | 'death') => void;
  /** Trigger shake effect */
  shake: () => void;
}

let damageInstanceId = 0;
let flashInstanceId = 0;

export const CombatFeedback = React.forwardRef<CombatFeedbackHandle, CombatFeedbackProps>(
  ({ targetRef, isActive = true }, ref) => {
    const [damageNumbers, setDamageNumbers] = useState<DamageInstance[]>([]);
    const [flashes, setFlashes] = useState<FlashInstance[]>([]);
    const [isShaking, setIsShaking] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate spawn position for damage numbers
    const getSpawnPosition = useCallback((): { x: number; y: number } => {
      if (!targetRef?.current) {
        // Default to center of screen if no target
        return {
          x: window.innerWidth / 2 - 50,
          y: window.innerHeight / 2 - 100,
        };
      }

      const rect = targetRef.current.getBoundingClientRect();

      // Spawn from center-top of target with some randomness
      const randomOffsetX = (Math.random() - 0.5) * 60; // ±30px horizontal variance
      const randomOffsetY = (Math.random() - 0.5) * 40; // ±20px vertical variance

      return {
        x: rect.left + rect.width / 2 + randomOffsetX,
        y: rect.top + randomOffsetY,
      };
    }, [targetRef]);

    // Show damage number
    const showDamage = useCallback((amount: number, isCritical: boolean = false) => {
      if (!isActive) return;

      const id = `damage-${damageInstanceId++}`;
      const position = getSpawnPosition();

      const newDamage: DamageInstance = {
        id,
        amount,
        isCritical,
        position,
        timestamp: Date.now(),
        onComplete: () => {
          setDamageNumbers(prev => prev.filter(d => d.id !== id));
        },
      };

      setDamageNumbers(prev => [...prev, newDamage]);

      // Auto-trigger appropriate flash
      if (isCritical) {
        showFlash('critical');
      } else {
        showFlash('damage');
      }

      // Auto-trigger shake for big hits
      if (amount >= 20 || isCritical) {
        shake();
      }
    }, [isActive, getSpawnPosition]);

    // Show miss
    const showMiss = useCallback(() => {
      if (!isActive) return;

      const id = `miss-${damageInstanceId++}`;
      const position = getSpawnPosition();

      const newMiss: DamageInstance = {
        id,
        amount: 0,
        isMiss: true,
        position,
        timestamp: Date.now(),
        onComplete: () => {
          setDamageNumbers(prev => prev.filter(d => d.id !== id));
        },
      };

      setDamageNumbers(prev => [...prev, newMiss]);
    }, [isActive, getSpawnPosition]);

    // Show healing
    const showHeal = useCallback((amount: number) => {
      if (!isActive) return;

      const id = `heal-${damageInstanceId++}`;
      const position = getSpawnPosition();

      const newHeal: DamageInstance = {
        id,
        amount,
        isHealing: true,
        position,
        timestamp: Date.now(),
        onComplete: () => {
          setDamageNumbers(prev => prev.filter(d => d.id !== id));
        },
      };

      setDamageNumbers(prev => [...prev, newHeal]);
      showFlash('heal');
    }, [isActive, getSpawnPosition]);

    // Show flash effect
    const showFlash = useCallback((type: 'damage' | 'critical' | 'heal' | 'death') => {
      if (!isActive) return;

      const id = `flash-${flashInstanceId++}`;

      const newFlash: FlashInstance = {
        id,
        type,
        timestamp: Date.now(),
        onComplete: () => {
          setFlashes(prev => prev.filter(f => f.id !== id));
        },
      };

      setFlashes(prev => [...prev, newFlash]);
    }, [isActive]);

    // Trigger shake effect
    const shake = useCallback(() => {
      if (!isActive || isShaking) return;

      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }, [isActive, isShaking]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      showDamage,
      showMiss,
      showHeal,
      showFlash,
      shake,
    }), [showDamage, showMiss, showHeal, showFlash, shake]);

    // Clean up old instances periodically
    useEffect(() => {
      const cleanup = setInterval(() => {
        const now = Date.now();
        setDamageNumbers(prev => prev.filter(d => now - d.timestamp < 5000));
        setFlashes(prev => prev.filter(f => now - f.timestamp < 5000));
      }, 1000);

      return () => clearInterval(cleanup);
    }, []);

    if (!isActive) return null;

    return (
      <>
        {/* Damage Numbers Container */}
        <div
          ref={containerRef}
          className={`fixed inset-0 pointer-events-none z-50 ${isShaking ? 'animate-shake' : ''}`}
          aria-live="polite"
          aria-atomic="false"
        >
          {damageNumbers.map(damage => (
            <DamageNumber key={damage.id} {...damage} />
          ))}
        </div>

        {/* Flash Effects Container */}
        <div className="fixed inset-0 pointer-events-none z-40">
          {flashes.map(flash => (
            <DamageFlash key={flash.id} {...flash} />
          ))}
        </div>
      </>
    );
  }
);

CombatFeedback.displayName = 'CombatFeedback';

export default CombatFeedback;
