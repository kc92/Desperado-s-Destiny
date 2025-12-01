import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutorialStore } from '@/store/useTutorialStore';
import { completeTutorialAction } from '@/utils/tutorialActionHandlers';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialSpotlightProps {
  targetSelector?: string;
  padding?: number;
  shape?: 'rect' | 'circle';
  allowClick?: boolean;
  onTargetClick?: () => void;
  children?: React.ReactNode;
}

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  targetSelector,
  padding = 8,
  shape = 'rect',
  allowClick = true,
  onTargetClick,
  children,
}) => {
  const { isActive, getCurrentStep } = useTutorialStore(); // Removed completeAction from here
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Get current step's target selector
  const currentStep = getCurrentStep();
  const effectiveSelector = targetSelector || currentStep?.target;
  const highlights = currentStep?.highlight || [];

  // Calculate spotlight position
  const updateSpotlightPosition = useCallback(() => {
    if (!effectiveSelector) {
      setSpotlightRect(null);
      setIsVisible(false);
      return;
    }

    const element = document.querySelector(effectiveSelector);
    if (!element) {
      setSpotlightRect(null);
      setIsVisible(false);
      return;
    }

    const rect = element.getBoundingClientRect();
    setSpotlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
    setIsVisible(true);
  }, [effectiveSelector, padding]);

  // Update position on scroll, resize, and DOM changes
  useEffect(() => {
    if (!isActive || !effectiveSelector) {
      setIsVisible(false);
      return;
    }

    // Initial position
    updateSpotlightPosition();

    // Debounced update
    let rafId: number;
    const debouncedUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSpotlightPosition);
    };

    // Listen for scroll and resize
    window.addEventListener('scroll', debouncedUpdate, true);
    window.addEventListener('resize', debouncedUpdate);

    // Observe DOM changes
    observerRef.current = new MutationObserver(debouncedUpdate);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Observe element size changes
    const element = document.querySelector(effectiveSelector);
    if (element) {
      resizeObserverRef.current = new ResizeObserver(debouncedUpdate);
      resizeObserverRef.current.observe(element);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', debouncedUpdate, true);
      window.removeEventListener('resize', debouncedUpdate);
      observerRef.current?.disconnect();
      resizeObserverRef.current?.disconnect();
    };
  }, [isActive, effectiveSelector, updateSpotlightPosition]);

  // Handle click on spotlight area
  const handleSpotlightClick = useCallback((e: React.MouseEvent) => {
    if (!spotlightRect || !allowClick) return;

    const { clientX, clientY } = e;
    const inSpotlight =
      clientX >= spotlightRect.left &&
      clientX <= spotlightRect.left + spotlightRect.width &&
      clientY >= spotlightRect.top &&
      clientY <= spotlightRect.top + spotlightRect.height;

    if (inSpotlight) {
      if (onTargetClick) {
        onTargetClick();
      }
      // Check if this completes a required action (now generalized)
      if (currentStep?.requiresAction) {
        completeTutorialAction(currentStep.requiresAction);
      }
    }
  }, [spotlightRect, allowClick, onTargetClick, currentStep]); // Removed completeAction from dependencies

  // Add highlight classes to multiple elements
  useEffect(() => {
    if (!isActive || highlights.length === 0) return;

    const highlightedElements: Element[] = [];

    highlights.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('tutorial-highlighted');
        highlightedElements.push(el);
      });
    });

    return () => {
      highlightedElements.forEach(el => {
        el.classList.remove('tutorial-highlighted');
      });
    };
  }, [isActive, highlights]);

  if (!isActive || !isVisible || !spotlightRect) {
    return null;
  }

  // Calculate clip path for spotlight cutout
  const getClipPath = () => {
    const { top, left, width, height } = spotlightRect;

    if (shape === 'circle') {
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const radius = Math.max(width, height) / 2;
      return `
        polygon(
          0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
          ${centerX}px ${centerY - radius}px,
          ${centerX + radius}px ${centerY}px,
          ${centerX}px ${centerY + radius}px,
          ${centerX - radius}px ${centerY}px,
          ${centerX}px ${centerY - radius}px
        )
      `;
    }

    // Rectangle cutout using box-shadow instead
    return undefined;
  };

  return (
    <>
      {/* Dark overlay with cutout - blocks all interaction except spotlight area */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={handleSpotlightClick}
      >
        {/* Use box-shadow technique for rectangular spotlight */}
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)',
            borderRadius: shape === 'circle'
              ? '50%'
              : '8px',
            pointerEvents: allowClick ? 'auto' : 'none',
          }}
        />
      </div>

      {/* Spotlight border with pulse animation */}
      <div
        className="fixed z-[9998] pointer-events-none transition-all duration-300 ease-out"
        style={{
          top: spotlightRect.top,
          left: spotlightRect.left,
          width: spotlightRect.width,
          height: spotlightRect.height,
          borderRadius: shape === 'circle' ? '50%' : '8px',
        }}
      >
        <div
          className="w-full h-full border-2 border-gold-light animate-pulse"
          style={{
            borderRadius: 'inherit',
            boxShadow: '0 0 20px rgba(212, 165, 116, 0.5), inset 0 0 20px rgba(212, 165, 116, 0.1)',
          }}
        />
      </div>

      {/* "Try it now" prompt */}
      {currentStep?.actionPrompt && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: spotlightRect.top + spotlightRect.height + 12,
            left: spotlightRect.left + spotlightRect.width / 2,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-2 bg-frontier-red text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
            <span className="text-lg">👆</span>
            <span className="font-semibold text-sm uppercase tracking-wide">
              {currentStep.actionPrompt}
            </span>
          </div>
        </div>
      )}

      {/* Additional children content */}
      {children}

      {/* Global styles for highlighted elements */}
      <style>{`
        .tutorial-highlighted {
          position: relative;
          z-index: 9999 !important;
        }

        .tutorial-highlighted::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid #D4A574;
          border-radius: 8px;
          pointer-events: none;
          animation: spotlight-pulse 2s ease-in-out infinite;
        }

        @keyframes spotlight-pulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(212, 165, 116, 0.5);
          }
          50% {
            box-shadow: 0 0 25px rgba(212, 165, 116, 0.8);
          }
        }
      `}</style>
    </>
  );
};

// Display name for React DevTools
TutorialSpotlight.displayName = 'TutorialSpotlight';

export default TutorialSpotlight;
