/**
 * EnergyDisplay Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EnergyDisplay } from '@/components/game/EnergyDisplay';
import { ENERGY } from '@desperados/shared';

describe('EnergyDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders current and max energy', () => {
    render(
      <EnergyDisplay
        current={100}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    expect(screen.getByText(/100 \/ 150/)).toBeTruthy();
  });

  it('displays premium indicator for premium players', () => {
    render(
      <EnergyDisplay
        current={200}
        max={ENERGY.PREMIUM_MAX}
        regenRate={ENERGY.PREMIUM_REGEN_PER_HOUR}
        isPremium={true}
      />
    );

    expect(screen.getByText('PREMIUM')).toBeTruthy();
  });

  it('does not display premium indicator for free players', () => {
    render(
      <EnergyDisplay
        current={100}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
        isPremium={false}
      />
    );

    expect(screen.queryByText('PREMIUM')).toBeFalsy();
  });

  it('shows regeneration rate', () => {
    render(
      <EnergyDisplay
        current={50}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    expect(screen.getByText(/Regenerates at 30\/hour/)).toBeTruthy();
  });

  it('displays "Full Energy" when at max', () => {
    render(
      <EnergyDisplay
        current={ENERGY.FREE_MAX}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    expect(screen.getByText('Full Energy')).toBeTruthy();
  });

  it('displays time until full when not at max', () => {
    render(
      <EnergyDisplay
        current={50}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // Should show time estimate (multiple instances due to accessibility text)
    const fullInTexts = screen.getAllByText(/Full in/);
    expect(fullInTexts.length).toBeGreaterThan(0);
  });

  it('applies correct color for high energy (>66%)', () => {
    const { container } = render(
      <EnergyDisplay
        current={120}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // 120/150 = 80% (high energy)
    const energyBar = container.querySelector('.from-gold-dark');
    expect(energyBar).toBeTruthy();
  });

  it('applies correct color for medium energy (33-66%)', () => {
    const { container } = render(
      <EnergyDisplay
        current={75}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // 75/150 = 50% (medium energy)
    const energyBar = container.querySelector('.from-yellow-600');
    expect(energyBar).toBeTruthy();
  });

  it('applies correct color for low energy (<33%)', () => {
    const { container } = render(
      <EnergyDisplay
        current={30}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // 30/150 = 20% (low energy)
    const energyBar = container.querySelector('.from-orange-600');
    expect(energyBar).toBeTruthy();
  });

  it('applies correct color for empty energy', () => {
    const { container } = render(
      <EnergyDisplay
        current={0}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // 0/150 = 0% (empty)
    const energyBar = container.querySelector('.from-red-800');
    expect(energyBar).toBeTruthy();
  });

  it('renders with regeneration timer active', () => {
    render(
      <EnergyDisplay
        current={50}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // Initial render shows 50
    expect(screen.getByText(/50 \/ 150/)).toBeTruthy();

    // Component should have regeneration active (pulse animation present)
    const { container } = render(
      <EnergyDisplay
        current={50}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    const pulseElement = container.querySelector('.animate-pulse');
    expect(pulseElement).toBeTruthy();
  });

  it('has accessible aria labels', () => {
    render(
      <EnergyDisplay
        current={100}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    const status = screen.getByRole('status', { name: /Energy status/ });
    expect(status).toBeTruthy();
  });

  it('includes screen reader text', () => {
    render(
      <EnergyDisplay
        current={100}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // Check for sr-only content
    const srText = screen.getByText(/Energy: 100 out of 150/);
    expect(srText).toBeTruthy();
  });

  it('handles premium energy correctly', () => {
    render(
      <EnergyDisplay
        current={200}
        max={ENERGY.PREMIUM_MAX}
        regenRate={ENERGY.PREMIUM_REGEN_PER_HOUR}
        isPremium={true}
      />
    );

    expect(screen.getByText(/200 \/ 250/)).toBeTruthy();
    expect(screen.getByText(/Regenerates at 31.25\/hour/)).toBeTruthy();
  });

  it('caps percentage at 100%', () => {
    const { container } = render(
      <EnergyDisplay
        current={200}
        max={ENERGY.FREE_MAX}
        regenRate={ENERGY.FREE_REGEN_PER_HOUR}
      />
    );

    // Even though current > max, bar should be 100%
    const energyBar = container.querySelector('[style*="width: 100%"]');
    expect(energyBar).toBeTruthy();
  });
});
