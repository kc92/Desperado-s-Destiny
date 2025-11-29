/**
 * WantedLevelDisplay Component Tests
 * Tests for wanted level display, stars, and click interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WantedLevelDisplay } from '@/components/game/WantedLevelDisplay';

describe('WantedLevelDisplay', () => {
  it('should not render when wanted level is 0', () => {
    const { container } = render(
      <WantedLevelDisplay wantedLevel={0} bountyAmount={0} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when wanted level is greater than 0', () => {
    render(
      <WantedLevelDisplay wantedLevel={3} bountyAmount={300} />
    );

    expect(screen.getByText('Wanted')).toBeInTheDocument();
    expect(screen.getByText('Level 3/5')).toBeInTheDocument();
  });

  it('should display correct number of filled stars', () => {
    const { container } = render(
      <WantedLevelDisplay wantedLevel={3} bountyAmount={300} />
    );

    const stars = container.querySelectorAll('.text-2xl');
    const filledStars = Array.from(stars).filter((star) =>
      star.className.includes('text-blood-red') || star.className.includes('text-yellow-500')
    );

    expect(filledStars.length).toBeGreaterThanOrEqual(3);
  });

  it('should display bounty amount', () => {
    render(
      <WantedLevelDisplay wantedLevel={2} bountyAmount={500} />
    );

    expect(screen.getByText('500g')).toBeInTheDocument();
  });

  it('should show yellow color for low wanted levels (1-2)', () => {
    const { container } = render(
      <WantedLevelDisplay wantedLevel={2} bountyAmount={200} />
    );

    const stars = container.querySelectorAll('.text-yellow-500');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('should show red color for high wanted levels (3+)', () => {
    const { container } = render(
      <WantedLevelDisplay wantedLevel={3} bountyAmount={300} />
    );

    const stars = container.querySelectorAll('.text-blood-red');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('should pulse animation for wanted level 3+', () => {
    const { container } = render(
      <WantedLevelDisplay wantedLevel={3} bountyAmount={300} />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).toContain('animate-pulse');
  });

  it('should not pulse for wanted level < 3', () => {
    const { container } = render(
      <WantedLevelDisplay wantedLevel={2} bountyAmount={200} />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.className).not.toContain('animate-pulse');
  });

  it('should show arrest warning for wanted level 3+', () => {
    render(
      <WantedLevelDisplay wantedLevel={3} bountyAmount={300} />
    );

    expect(screen.getByText('Can Be Arrested!')).toBeInTheDocument();
  });

  it('should not show arrest warning for wanted level < 3', () => {
    render(
      <WantedLevelDisplay wantedLevel={2} bountyAmount={200} />
    );

    expect(screen.queryByText('Can Be Arrested!')).not.toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();

    render(
      <WantedLevelDisplay wantedLevel={2} bountyAmount={200} onClick={onClick} />
    );

    const displayElement = screen.getByText('Wanted').closest('div');
    if (displayElement) {
      fireEvent.click(displayElement);
    }

    expect(onClick).toHaveBeenCalled();
  });

  it('should show click hint', () => {
    render(
      <WantedLevelDisplay wantedLevel={2} bountyAmount={200} />
    );

    expect(screen.getByText('Click for details')).toBeInTheDocument();
  });
});
