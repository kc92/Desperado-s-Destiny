/**
 * PlayingCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayingCard } from '@/components/game/PlayingCard';
import { Suit, Rank } from '@desperados/shared';

describe('PlayingCard', () => {
  const mockCard = {
    suit: Suit.HEARTS,
    rank: Rank.ACE,
  };

  it('renders a card back when not flipped', () => {
    const { container } = render(
      <PlayingCard card={mockCard} isFlipped={false} />
    );

    // Should show card back (DD emblem)
    expect(container.textContent).toContain('DD');
  });

  it('renders card face when flipped', () => {
    const { container } = render(
      <PlayingCard card={mockCard} isFlipped={true} />
    );

    // Should show rank (A) and suit symbol (♥)
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('♥');
  });

  it('displays correct rank for all ranks', () => {
    const ranks = [
      { rank: Rank.TWO, display: '2' },
      { rank: Rank.JACK, display: 'J' },
      { rank: Rank.QUEEN, display: 'Q' },
      { rank: Rank.KING, display: 'K' },
      { rank: Rank.ACE, display: 'A' },
    ];

    ranks.forEach(({ rank, display }) => {
      const { container } = render(
        <PlayingCard card={{ suit: Suit.SPADES, rank }} isFlipped={true} />
      );
      expect(container.textContent).toContain(display);
    });
  });

  it('displays correct suit symbols', () => {
    const suits = [
      { suit: Suit.SPADES, symbol: '♠' },
      { suit: Suit.HEARTS, symbol: '♥' },
      { suit: Suit.CLUBS, symbol: '♣' },
      { suit: Suit.DIAMONDS, symbol: '♦' },
    ];

    suits.forEach(({ suit, symbol }) => {
      const { container } = render(
        <PlayingCard card={{ suit, rank: Rank.ACE }} isFlipped={true} />
      );
      expect(container.textContent).toContain(symbol);
    });
  });

  it('applies highlighted styling when isHighlighted is true', () => {
    const { container } = render(
      <PlayingCard card={mockCard} isFlipped={true} isHighlighted={true} />
    );

    const card = container.querySelector('.ring-4');
    expect(card).toBeTruthy();
  });

  it('calls onFlipComplete callback after flip animation', () => {
    vi.useFakeTimers();
    const onFlipComplete = vi.fn();

    render(
      <PlayingCard
        card={mockCard}
        isFlipped={false}
        onFlipComplete={onFlipComplete}
      />
    );

    // Should not be called immediately
    expect(onFlipComplete).not.toHaveBeenCalled();

    // Fast-forward time by 600ms (animation duration)
    vi.advanceTimersByTime(600);

    // Should be called after animation
    expect(onFlipComplete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('renders different sizes correctly', () => {
    const { container: smallContainer } = render(
      <PlayingCard card={mockCard} isFlipped={true} size="sm" />
    );
    const { container: mediumContainer } = render(
      <PlayingCard card={mockCard} isFlipped={true} size="md" />
    );
    const { container: largeContainer } = render(
      <PlayingCard card={mockCard} isFlipped={true} size="lg" />
    );

    expect(smallContainer.querySelector('.w-16')).toBeTruthy();
    expect(mediumContainer.querySelector('.w-24')).toBeTruthy();
    expect(largeContainer.querySelector('.w-32')).toBeTruthy();
  });
});
