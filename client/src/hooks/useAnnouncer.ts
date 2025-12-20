/**
 * useAnnouncer Hook
 * Provides screen reader announcements for dynamic content changes
 * Uses ARIA live regions to announce changes to assistive technology users
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { logger } from '@/services/logger.service';

type Politeness = 'polite' | 'assertive';

interface AnnouncerOptions {
  /** How urgent the announcement is. 'assertive' interrupts, 'polite' waits */
  politeness?: Politeness;
  /** Delay in ms before announcing (useful for debouncing rapid changes) */
  delay?: number;
  /** Clear the announcement after this many ms (0 = don't clear) */
  clearAfter?: number;
}

// Global announcer elements (created once, shared across all uses)
let politeAnnouncer: HTMLDivElement | null = null;
let assertiveAnnouncer: HTMLDivElement | null = null;
let isInitialized = false;

/**
 * Create the announcer elements if they don't exist
 */
function initializeAnnouncers(): void {
  if (isInitialized || typeof document === 'undefined') return;

  // Create polite announcer
  politeAnnouncer = document.createElement('div');
  politeAnnouncer.id = 'aria-announcer-polite';
  politeAnnouncer.setAttribute('role', 'status');
  politeAnnouncer.setAttribute('aria-live', 'polite');
  politeAnnouncer.setAttribute('aria-atomic', 'true');
  politeAnnouncer.className = 'sr-only';
  politeAnnouncer.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;

  // Create assertive announcer
  assertiveAnnouncer = document.createElement('div');
  assertiveAnnouncer.id = 'aria-announcer-assertive';
  assertiveAnnouncer.setAttribute('role', 'alert');
  assertiveAnnouncer.setAttribute('aria-live', 'assertive');
  assertiveAnnouncer.setAttribute('aria-atomic', 'true');
  assertiveAnnouncer.className = 'sr-only';
  assertiveAnnouncer.style.cssText = politeAnnouncer.style.cssText;

  document.body.appendChild(politeAnnouncer);
  document.body.appendChild(assertiveAnnouncer);

  isInitialized = true;
}

/**
 * Hook for announcing messages to screen readers
 *
 * @example
 * ```tsx
 * const { announce } = useAnnouncer();
 *
 * // Announce a polite message (default)
 * announce('Your character gained 50 gold');
 *
 * // Announce an urgent message
 * announce('Combat started!', { politeness: 'assertive' });
 *
 * // Announce with delay (useful for rapid state changes)
 * announce('Loading complete', { delay: 100 });
 * ```
 */
export function useAnnouncer() {
  const timeoutRef = useRef<number | null>(null);
  const clearTimeoutRef = useRef<number | null>(null);

  // Initialize announcers on mount
  useEffect(() => {
    initializeAnnouncers();

    return () => {
      // Clean up timeouts on unmount
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (clearTimeoutRef.current) {
        window.clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Announce a message to screen readers
   */
  const announce = useCallback((message: string, options: AnnouncerOptions = {}) => {
    const { politeness = 'polite', delay = 0, clearAfter = 5000 } = options;

    // Clear any pending announcements
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    if (clearTimeoutRef.current) {
      window.clearTimeout(clearTimeoutRef.current);
    }

    const doAnnounce = () => {
      const announcer = politeness === 'assertive' ? assertiveAnnouncer : politeAnnouncer;

      if (!announcer) {
        logger.warn('[useAnnouncer] Announcer not initialized', { context: 'announce', politeness });
        return;
      }

      // Clear first to ensure the announcement is read even if it's the same text
      announcer.textContent = '';

      // Small delay to ensure the clear is processed
      requestAnimationFrame(() => {
        if (announcer) {
          announcer.textContent = message;
        }
      });

      // Auto-clear after specified time
      if (clearAfter > 0) {
        clearTimeoutRef.current = window.setTimeout(() => {
          if (announcer) {
            announcer.textContent = '';
          }
        }, clearAfter);
      }
    };

    if (delay > 0) {
      timeoutRef.current = window.setTimeout(doAnnounce, delay);
    } else {
      doAnnounce();
    }
  }, []);

  /**
   * Clear all announcements
   */
  const clearAnnouncements = useCallback(() => {
    if (politeAnnouncer) {
      politeAnnouncer.textContent = '';
    }
    if (assertiveAnnouncer) {
      assertiveAnnouncer.textContent = '';
    }
  }, []);

  return {
    announce,
    clearAnnouncements,
  };
}

/**
 * Pre-built announcement helpers for common game events
 */
export const gameAnnouncements = {
  /** Announce gold change */
  goldChange: (amount: number, isGain: boolean) =>
    `${isGain ? 'Gained' : 'Lost'} ${Math.abs(amount)} gold`,

  /** Announce experience gain */
  experienceGain: (amount: number) =>
    `Gained ${amount} experience points`,

  /** Announce level up */
  levelUp: (newLevel: number) =>
    `Congratulations! You reached level ${newLevel}`,

  /** Announce energy change */
  energyChange: (current: number, max: number) =>
    `Energy: ${current} of ${max}`,

  /** Announce action result */
  actionComplete: (actionName: string, success: boolean) =>
    `${actionName} ${success ? 'succeeded' : 'failed'}`,

  /** Announce combat result */
  combatResult: (victory: boolean, enemyName?: string) =>
    victory
      ? `Victory${enemyName ? ` against ${enemyName}` : ''}!`
      : `Defeated${enemyName ? ` by ${enemyName}` : ''}`,

  /** Announce item acquired */
  itemAcquired: (itemName: string, quantity?: number) =>
    quantity && quantity > 1
      ? `Acquired ${quantity} ${itemName}`
      : `Acquired ${itemName}`,

  /** Announce skill training */
  skillTraining: (skillName: string, started: boolean) =>
    started
      ? `Started training ${skillName}`
      : `Completed training ${skillName}`,

  /** Announce navigation */
  pageNavigation: (pageName: string) =>
    `Navigated to ${pageName}`,

  /** Announce error */
  error: (message: string) =>
    `Error: ${message}`,

  /** Announce card reveal */
  cardReveal: (cardName: string, position: number) =>
    `Card ${position}: ${cardName}`,

  /** Announce poker hand result */
  pokerHandResult: (handName: string, isWinner: boolean) =>
    isWinner
      ? `You won with a ${handName}!`
      : `You have a ${handName}`,

  /** Announce card selection */
  cardSelection: (cardName: string, isHeld: boolean) =>
    isHeld
      ? `Holding ${cardName}`
      : `Released ${cardName}`,
};

// ===== Focus Management Utilities =====

/**
 * Focus an element by selector or reference
 * Returns true if focus was successful
 */
export function focusElement(
  elementOrSelector: HTMLElement | string,
  options: { preventScroll?: boolean; scrollBehavior?: ScrollBehavior } = {}
): boolean {
  const { preventScroll = false, scrollBehavior = 'smooth' } = options;

  let element: HTMLElement | null = null;

  if (typeof elementOrSelector === 'string') {
    element = document.querySelector(elementOrSelector);
  } else {
    element = elementOrSelector;
  }

  if (!element) return false;

  // Ensure element is focusable
  if (!element.hasAttribute('tabindex') && !isFocusable(element)) {
    element.setAttribute('tabindex', '-1');
  }

  element.focus({ preventScroll });

  if (!preventScroll) {
    element.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' });
  }

  return document.activeElement === element;
}

/**
 * Check if an element is naturally focusable
 */
function isFocusable(element: HTMLElement): boolean {
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  return (
    focusableTags.includes(element.tagName) &&
    !element.hasAttribute('disabled') &&
    element.getAttribute('tabindex') !== '-1'
  );
}

/**
 * Trap focus within a container (for modals/dialogs)
 * Returns a cleanup function to remove the trap
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeydown);
  firstFocusable?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeydown);
  };
}

/**
 * Generate a unique ID for accessibility attributes
 */
let idCounter = 0;
export function generateAccessibleId(prefix = 'accessible'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Combine multiple aria-describedby IDs into a single string
 */
export function combineDescribedBy(...ids: (string | undefined | null)[]): string | undefined {
  const validIds = ids.filter(Boolean) as string[];
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Hook for managing roving tabindex in a group of elements
 * Useful for custom listboxes, toolbars, etc.
 */
export function useRovingTabindex<T extends HTMLElement>(
  containerRef: React.RefObject<HTMLElement | null>,
  itemSelector: string,
  options: { orientation?: 'horizontal' | 'vertical' | 'both'; wrap?: boolean } = {}
) {
  const { orientation = 'both', wrap = true } = options;

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = Array.from(
        containerRef.current.querySelectorAll<T>(itemSelector)
      ).filter((item) => !item.hasAttribute('disabled'));

      const currentIndex = items.findIndex((item) => item === document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      if (e.key === 'ArrowRight' && isHorizontal) {
        nextIndex = currentIndex + 1;
      } else if (e.key === 'ArrowLeft' && isHorizontal) {
        nextIndex = currentIndex - 1;
      } else if (e.key === 'ArrowDown' && isVertical) {
        nextIndex = currentIndex + 1;
      } else if (e.key === 'ArrowUp' && isVertical) {
        nextIndex = currentIndex - 1;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = items.length - 1;
      } else {
        return;
      }

      e.preventDefault();

      if (wrap) {
        nextIndex = (nextIndex + items.length) % items.length;
      } else {
        nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
      }

      items.forEach((item, i) => {
        item.setAttribute('tabindex', i === nextIndex ? '0' : '-1');
      });

      items[nextIndex]?.focus();
    },
    [containerRef, itemSelector, orientation, wrap]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeydown);
    return () => container.removeEventListener('keydown', handleKeydown);
  }, [containerRef, handleKeydown]);
}

export default useAnnouncer;
