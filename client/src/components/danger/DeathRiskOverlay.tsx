/**
 * DeathRiskOverlay Component
 * Screen-level overlay effects for death risk visualization
 *
 * Effects:
 * - Vignette effect on screen edges at high risk (76%+)
 * - Screen subtly desaturates at extreme risk (91%+)
 * - Ominous ambient effects during dangerous actions
 */

import React, { useEffect, useState } from 'react';
import { DangerLevel } from '@desperados/shared';

interface DeathRiskOverlayProps {
  /** Current danger level being tracked */
  dangerLevel: DangerLevel | null;
  /** Whether the overlay should be active */
  isActive: boolean;
  /** Whether to show desaturation effect */
  showDesaturation?: boolean;
  /** Custom z-index for layering */
  zIndex?: number;
}

/**
 * Get vignette gradient based on danger level
 * Note: CSS class approach (getVignetteClass) was replaced with inline gradients
 */
const getVignetteGradient = (level: DangerLevel | null): string => {
  if (!level) return 'transparent';

  switch (level) {
    case DangerLevel.PERILOUS:
      return 'radial-gradient(ellipse at center, transparent 50%, rgba(127, 29, 29, 0.15) 100%)';
    case DangerLevel.DEADLY:
      return 'radial-gradient(ellipse at center, transparent 40%, rgba(127, 29, 29, 0.3) 100%)';
    case DangerLevel.CERTAIN_DOOM:
      return 'radial-gradient(ellipse at center, transparent 30%, rgba(127, 29, 29, 0.5) 100%)';
    default:
      return 'transparent';
  }
};

export const DeathRiskOverlay: React.FC<DeathRiskOverlayProps> = ({
  dangerLevel,
  isActive,
  showDesaturation = false,
  zIndex = 40,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isActive && dangerLevel && dangerLevel !== DangerLevel.SAFE) {
      setIsVisible(true);
    } else {
      // Fade out
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isActive, dangerLevel]);

  // Determine if vignette should show
  const shouldShowVignette = dangerLevel && [
    DangerLevel.PERILOUS,
    DangerLevel.DEADLY,
    DangerLevel.CERTAIN_DOOM,
  ].includes(dangerLevel);

  // Determine if desaturation should show
  const shouldDesaturate = showDesaturation && dangerLevel === DangerLevel.CERTAIN_DOOM;

  if (!isVisible && !isActive) return null;

  return (
    <>
      {/* Vignette overlay */}
      {shouldShowVignette && (
        <div
          className={`
            fixed inset-0 pointer-events-none
            transition-opacity duration-500 ease-in-out
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            zIndex,
            background: getVignetteGradient(dangerLevel),
          }}
          aria-hidden="true"
        />
      )}

      {/* Desaturation filter (applied to entire screen) */}
      {shouldDesaturate && (
        <style>
          {`
            body {
              filter: saturate(0.7) brightness(0.95);
              transition: filter 0.5s ease-in-out;
            }
          `}
        </style>
      )}

      {/* Pulsing edge glow for CERTAIN_DOOM */}
      {dangerLevel === DangerLevel.CERTAIN_DOOM && isActive && (
        <div
          className={`
            fixed inset-0 pointer-events-none
            transition-opacity duration-500
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ zIndex: zIndex - 1 }}
          aria-hidden="true"
        >
          {/* Top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-2 animate-pulse"
            style={{
              background: 'linear-gradient(to bottom, rgba(127, 29, 29, 0.6), transparent)',
            }}
          />
          {/* Bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 animate-pulse"
            style={{
              background: 'linear-gradient(to top, rgba(127, 29, 29, 0.6), transparent)',
            }}
          />
          {/* Left edge */}
          <div
            className="absolute top-0 bottom-0 left-0 w-2 animate-pulse"
            style={{
              background: 'linear-gradient(to right, rgba(127, 29, 29, 0.6), transparent)',
            }}
          />
          {/* Right edge */}
          <div
            className="absolute top-0 bottom-0 right-0 w-2 animate-pulse"
            style={{
              background: 'linear-gradient(to left, rgba(127, 29, 29, 0.6), transparent)',
            }}
          />
        </div>
      )}
    </>
  );
};

/**
 * Context provider for global death risk overlay state
 */
import { createContext, useContext, useCallback } from 'react';

interface DeathRiskOverlayContextType {
  activateDanger: (level: DangerLevel) => void;
  deactivateDanger: () => void;
  currentLevel: DangerLevel | null;
  isActive: boolean;
}

const DeathRiskOverlayContext = createContext<DeathRiskOverlayContextType | null>(null);

export const DeathRiskOverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState<DangerLevel | null>(null);
  const [isActive, setIsActive] = useState(false);

  const activateDanger = useCallback((level: DangerLevel) => {
    setCurrentLevel(level);
    setIsActive(true);
  }, []);

  const deactivateDanger = useCallback(() => {
    setIsActive(false);
  }, []);

  return (
    <DeathRiskOverlayContext.Provider value={{ activateDanger, deactivateDanger, currentLevel, isActive }}>
      {children}
      <DeathRiskOverlay
        dangerLevel={currentLevel}
        isActive={isActive}
        showDesaturation={currentLevel === DangerLevel.CERTAIN_DOOM}
      />
    </DeathRiskOverlayContext.Provider>
  );
};

export const useDeathRiskOverlay = (): DeathRiskOverlayContextType => {
  const context = useContext(DeathRiskOverlayContext);
  if (!context) {
    // Return a no-op implementation if not wrapped in provider
    return {
      activateDanger: () => {},
      deactivateDanger: () => {},
      currentLevel: null,
      isActive: false,
    };
  }
  return context;
};

export default DeathRiskOverlay;
