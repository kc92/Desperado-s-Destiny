/**
 * CardHand Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CardHand } from '@/components/game/CardHand';
import { Suit, Rank, Card } from '@desperados/shared';

describe('CardHand', () => {
  const mockHand: Card[] = [
    { suit: Suit.SPADES, rank: Rank.ACE },
    { suit: Suit.HEARTS, rank: Rank.KING },
    { suit: Suit.CLUBS, rank: Rank.QUEEN },
    { suit: Suit.DIAMONDS, rank: Rank.JACK },
    { suit: Suit.SPADES, rank: Rank.TEN },
  ];

  it('renders 5 cards when provided', () => {
    const { container } = render(
      <CardHand cards={mockHand} isRevealing={false} />
    );

    // Should render 5 cards
    const cards = container.querySelectorAll('[style*="perspective"]');
    expect(cards.length).toBe(5);
  });

  it('shows empty state when no cards provided', () => {
    const { container } = render(
      <CardHand cards={[]} isRevealing={false} />
    );

    // Should show 5 face-down placeholders
    const placeholders = container.querySelectorAll('.opacity-50');
    expect(placeholders.length).toBe(5);
  });

  it('returns null when incorrect number of cards provided', () => {
    const { container } = render(
      <CardHand cards={mockHand.slice(0, 3)} isRevealing={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('reveals cards sequentially when isRevealing is true', async () => {
    vi.useFakeTimers();
    const onRevealComplete = vi.fn();

    render(
      <CardHand
        cards={mockHand}
        isRevealing={true}
        onRevealComplete={onRevealComplete}
      />
    );

    // Should not be complete immediately
    expect(onRevealComplete).not.toHaveBeenCalled();

    // Fast-forward through all card reveals
    // 5 cards * 200ms delay + 600ms final flip = 1600ms
    vi.advanceTimersByTime(1600);

    await waitFor(() => {
      expect(onRevealComplete).toHaveBeenCalledTimes(1);
    });

    vi.useRealTimers();
  });

  it('highlights specified cards', () => {
    const { container } = render(
      <CardHand
        cards={mockHand}
        isRevealing={false}
        highlightedIndices={[0, 2, 4]}
      />
    );

    // Should have highlighted cards (with ring styling)
    const highlightedCards = container.querySelectorAll('.ring-4');
    expect(highlightedCards.length).toBeGreaterThan(0);
  });

  it('applies fan arrangement to cards', () => {
    const { container } = render(
      <CardHand cards={mockHand} isRevealing={false} />
    );

    const cardWrappers = container.querySelectorAll('[style*="rotate"]');
    expect(cardWrappers.length).toBe(5);

    // Each card should have rotation applied
    cardWrappers.forEach((card) => {
      const style = (card as HTMLElement).style.transform;
      expect(style).toContain('rotate');
    });
  });

  it('renders different card sizes', () => {
    const { container: smallContainer } = render(
      <CardHand cards={mockHand} isRevealing={false} size="sm" />
    );
    const { container: mediumContainer } = render(
      <CardHand cards={mockHand} isRevealing={false} size="md" />
    );
    const { container: largeContainer } = render(
      <CardHand cards={mockHand} isRevealing={false} size="lg" />
    );

    expect(smallContainer.querySelector('.w-16')).toBeTruthy();
    expect(mediumContainer.querySelector('.w-24')).toBeTruthy();
    expect(largeContainer.querySelector('.w-32')).toBeTruthy();
  });
});
