/**
 * HandEvaluation Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HandEvaluation } from '@/components/game/HandEvaluation';
import { HandRank, Suit } from '@desperados/shared';

describe('HandEvaluation', () => {
  it('renders hand rank name correctly', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.FULL_HOUSE}
        handScore={700}
        suitBonuses={[]}
        totalScore={700}
      />
    );

    expect(container.textContent).toContain('Full House');
  });

  it('displays all hand ranks correctly', () => {
    const handRanks = [
      { rank: HandRank.HIGH_CARD, name: 'High Card' },
      { rank: HandRank.PAIR, name: 'Pair' },
      { rank: HandRank.TWO_PAIR, name: 'Two Pair' },
      { rank: HandRank.THREE_OF_A_KIND, name: 'Three of a Kind' },
      { rank: HandRank.STRAIGHT, name: 'Straight' },
      { rank: HandRank.FLUSH, name: 'Flush' },
      { rank: HandRank.FULL_HOUSE, name: 'Full House' },
      { rank: HandRank.FOUR_OF_A_KIND, name: 'Four of a Kind' },
      { rank: HandRank.STRAIGHT_FLUSH, name: 'Straight Flush' },
      { rank: HandRank.ROYAL_FLUSH, name: 'Royal Flush' },
    ];

    handRanks.forEach(({ rank, name }) => {
      const { container } = render(
        <HandEvaluation
          handRank={rank}
          handScore={100}
          suitBonuses={[]}
          totalScore={100}
        />
      );
      expect(container.textContent).toContain(name);
    });
  });

  it('displays base hand score', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.PAIR}
        handScore={250}
        suitBonuses={[]}
        totalScore={250}
      />
    );

    expect(container.textContent).toContain('250');
  });

  it('displays suit bonuses when present', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.FLUSH}
        handScore={600}
        suitBonuses={[
          { suit: Suit.SPADES, bonus: 50 },
          { suit: Suit.HEARTS, bonus: 30 },
        ]}
        totalScore={680}
      />
    );

    expect(container.textContent).toContain('Suit Bonuses');
    expect(container.textContent).toContain('Cunning'); // Spades
    expect(container.textContent).toContain('Spirit'); // Hearts
    expect(container.textContent).toContain('+50');
    expect(container.textContent).toContain('+30');
  });

  it('does not show suit bonuses section when empty', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.PAIR}
        handScore={250}
        suitBonuses={[]}
        totalScore={250}
      />
    );

    expect(container.textContent).not.toContain('Suit Bonuses');
  });

  it('displays total score', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.STRAIGHT}
        handScore={500}
        suitBonuses={[{ suit: Suit.DIAMONDS, bonus: 75 }]}
        totalScore={575}
      />
    );

    expect(container.textContent).toContain('575');
  });

  it('applies gold styling for strong hands (flush or better)', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.FLUSH}
        handScore={600}
        suitBonuses={[]}
        totalScore={600}
      />
    );

    // Should have exceptional hand indicator
    expect(container.textContent).toContain('Exceptional Hand!');

    // Should have gold ring styling
    expect(container.querySelector('.ring-4')).toBeTruthy();
  });

  it('does not apply gold styling for weak hands', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.PAIR}
        handScore={250}
        suitBonuses={[]}
        totalScore={250}
      />
    );

    // Should not have exceptional hand indicator
    expect(container.textContent).not.toContain('Exceptional Hand!');
  });

  it('displays visual hand rank indicator', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.THREE_OF_A_KIND}
        handScore={400}
        suitBonuses={[]}
        totalScore={400}
      />
    );

    // Should have 10 indicator bars (representing ranks 1-10)
    const indicators = container.querySelectorAll('.h-8');
    expect(indicators.length).toBe(10);
  });

  it('highlights correct number of rank indicators', () => {
    const { container } = render(
      <HandEvaluation
        handRank={HandRank.STRAIGHT} // Rank 5
        handScore={500}
        suitBonuses={[]}
        totalScore={500}
      />
    );

    const indicators = container.querySelectorAll('.h-8');
    let highlightedCount = 0;

    indicators.forEach((indicator) => {
      if (indicator.classList.contains('bg-gold-medium') || indicator.classList.contains('bg-gold-light')) {
        highlightedCount++;
      }
    });

    expect(highlightedCount).toBe(5); // Straight is rank 5
  });
});
