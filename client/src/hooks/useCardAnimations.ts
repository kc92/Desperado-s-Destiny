/**
 * useCardAnimations Hook
 * Orchestrates card deal/discard/flip animation sequences
 */

import { useState, useCallback } from 'react';
import { Card as CardType } from '@desperados/shared';
import {
  CardAnimationState,
  TIMING,
  calculateFanPositions,
  prefersReducedMotion,
} from '../components/game/card/cardAnimations';

interface CardAnimationData {
  card: CardType;
  state: CardAnimationState;
  position: { x: number; y: number; rotation: number };
}

interface UseCardAnimationsOptions {
  /** Card size for position calculations */
  cardWidth?: number;
  /** Callback when deal animation completes */
  onDealComplete?: () => void;
  /** Callback when flip animation completes */
  onFlipComplete?: () => void;
  /** Callback when discard animation completes */
  onDiscardComplete?: () => void;
  /** Callback for sound effects */
  onSoundEffect?: (effect: 'deal' | 'flip' | 'discard' | 'victory') => void;
}

interface UseCardAnimationsReturn {
  /** Current state of each card */
  cardStates: CardAnimationData[];
  /** Whether any animation is in progress */
  isAnimating: boolean;
  /** Current animation phase */
  phase: 'idle' | 'dealing' | 'revealing' | 'waiting' | 'discarding' | 'drawing' | 'complete';
  /** Indices of discarded cards */
  discardedIndices: number[];
  /** Start initial deal animation */
  dealCards: (cards: CardType[]) => Promise<void>;
  /** Discard selected cards and draw new ones */
  discardAndDraw: (selectedIndices: number[], newCards: CardType[]) => Promise<void>;
  /** Flip all cards face-up */
  revealHand: () => Promise<void>;
  /** Highlight winning cards */
  highlightWinners: (indices: number[]) => void;
  /** Reset to initial state */
  reset: () => void;
}

export function useCardAnimations(
  options: UseCardAnimationsOptions = {}
): UseCardAnimationsReturn {
  const {
    cardWidth = 96,
    onDealComplete,
    onFlipComplete,
    onDiscardComplete,
    onSoundEffect,
  } = options;

  const [cardStates, setCardStates] = useState<CardAnimationData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState<UseCardAnimationsReturn['phase']>('idle');
  const [discardedIndices, setDiscardedIndices] = useState<number[]>([]);

  const fanPositions = calculateFanPositions(cardWidth);
  const reducedMotion = prefersReducedMotion();

  // Helper to wait for duration
  const wait = useCallback((ms: number) => {
    if (reducedMotion) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
  }, [reducedMotion]);

  /**
   * Deal initial 5 cards from deck
   */
  const dealCards = useCallback(async (cards: CardType[]) => {
    if (cards.length !== 5) {
      return;
    }

    setIsAnimating(true);
    setPhase('dealing');
    setDiscardedIndices([]);

    // Initialize cards in deck
    const initialStates: CardAnimationData[] = cards.map((card, index) => ({
      card,
      state: 'in_deck' as CardAnimationState,
      position: fanPositions[index],
    }));
    setCardStates(initialStates);

    // Small delay before dealing starts
    await wait(0.1);

    // Animate each card dealing with stagger
    for (let i = 0; i < 5; i++) {
      await wait(TIMING.DEAL_STAGGER);
      onSoundEffect?.('deal');

      setCardStates(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], state: 'dealing' };
        return updated;
      });
    }

    // Wait for last card's deal animation
    await wait(TIMING.DEAL_DURATION);

    // Move all to in_hand state
    setCardStates(prev => prev.map(card => ({ ...card, state: 'in_hand' })));

    await wait(TIMING.PAUSE_AFTER_DEAL);
    setPhase('waiting');
    setIsAnimating(false);
    onDealComplete?.();
  }, [fanPositions, wait, onDealComplete, onSoundEffect]);

  /**
   * Flip all cards to reveal their faces
   * Enhanced with sequential tension-building reveals
   */
  const revealHand = useCallback(async () => {
    setIsAnimating(true);
    setPhase('revealing');

    const cardCount = cardStates.length;

    // Flip cards with stagger - final card gets extra emphasis
    for (let i = 0; i < cardCount; i++) {
      const isFinalCard = i === cardCount - 1;

      // Wait before flip (slightly longer pause before final card)
      await wait(isFinalCard ? TIMING.FLIP_STAGGER * 1.5 : TIMING.FLIP_STAGGER);
      onSoundEffect?.('flip');

      setCardStates(prev => {
        const updated = [...prev];
        if (updated[i]) {
          updated[i] = { ...updated[i], state: 'flipping' };
        }
        return updated;
      });

      // Wait for individual flip animation before starting next
      // This creates more dramatic sequential reveals
      const flipDuration = isFinalCard ? TIMING.FINAL_CARD_FLIP_DURATION : TIMING.FLIP_DURATION;
      await wait(flipDuration * 0.6); // Overlap slightly for fluidity
    }

    // Wait for final flip to complete
    await wait(TIMING.FINAL_CARD_FLIP_DURATION * 0.5);

    // Update to revealed state
    setCardStates(prev => prev.map(card => ({ ...card, state: 'revealed' })));

    // Brief pause before showing results
    await wait(TIMING.PAUSE_BEFORE_BANNER);

    setPhase('complete');
    setIsAnimating(false);
    onFlipComplete?.();
  }, [cardStates.length, wait, onFlipComplete, onSoundEffect]);

  /**
   * Discard selected cards and draw new ones
   */
  const discardAndDraw = useCallback(async (
    selectedIndices: number[],
    newCards: CardType[]
  ) => {
    if (selectedIndices.length === 0) {
      return;
    }

    setIsAnimating(true);
    setPhase('discarding');
    setDiscardedIndices(selectedIndices);

    // Animate selected cards to discard pile
    for (const index of selectedIndices) {
      await wait(TIMING.DISCARD_STAGGER);
      onSoundEffect?.('discard');

      setCardStates(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], state: 'discarding' };
        }
        return updated;
      });
    }

    // Wait for discard animation
    await wait(TIMING.DISCARD_DURATION + TIMING.PAUSE_AFTER_DISCARD);

    // Replace discarded cards with new ones
    setPhase('drawing');

    let newCardIndex = 0;
    const updatedStates = cardStates.map((cardData, index) => {
      if (selectedIndices.includes(index) && newCards[newCardIndex]) {
        const newCard = newCards[newCardIndex];
        newCardIndex++;
        return {
          card: newCard,
          state: 'in_deck' as CardAnimationState,
          position: fanPositions[index],
        };
      }
      return cardData;
    });
    setCardStates(updatedStates);

    // Deal new cards
    for (const index of selectedIndices) {
      await wait(TIMING.DEAL_STAGGER);
      onSoundEffect?.('deal');

      setCardStates(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], state: 'dealing' };
        }
        return updated;
      });
    }

    // Wait for deal animation
    await wait(TIMING.DEAL_DURATION);

    // Flip new cards
    for (const index of selectedIndices) {
      await wait(TIMING.FLIP_STAGGER);
      onSoundEffect?.('flip');

      setCardStates(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], state: 'revealed' };
        }
        return updated;
      });
    }

    // Wait for flip
    await wait(TIMING.FLIP_DURATION);

    setPhase('complete');
    setIsAnimating(false);
    onDiscardComplete?.();
  }, [cardStates, fanPositions, wait, onDiscardComplete, onSoundEffect]);

  /**
   * Highlight winning cards
   */
  const highlightWinners = useCallback((indices: number[]) => {
    onSoundEffect?.('victory');

    setCardStates(prev => prev.map((cardData, index) => {
      if (indices.includes(index)) {
        // Highlighted cards get special treatment via isHighlighted prop
        // State remains 'revealed'
        return cardData;
      }
      return cardData;
    }));
  }, [onSoundEffect]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setCardStates([]);
    setIsAnimating(false);
    setPhase('idle');
    setDiscardedIndices([]);
  }, []);

  return {
    cardStates,
    isAnimating,
    phase,
    discardedIndices,
    dealCards,
    discardAndDraw,
    revealHand,
    highlightWinners,
    reset,
  };
}

export default useCardAnimations;
