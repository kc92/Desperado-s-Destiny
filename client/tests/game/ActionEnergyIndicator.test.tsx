/**
 * ActionEnergyIndicator Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionEnergyIndicator } from '@/components/game/ActionEnergyIndicator';

describe('ActionEnergyIndicator', () => {
  it('renders energy cost', () => {
    render(<ActionEnergyIndicator cost={25} canAfford={true} />);

    expect(screen.getByText('25')).toBeTruthy();
  });

  it('shows green styling when can afford', () => {
    const { container } = render(
      <ActionEnergyIndicator cost={25} canAfford={true} />
    );

    const indicator = container.querySelector('.border-green-600');
    expect(indicator).toBeTruthy();
  });

  it('shows red styling when cannot afford', () => {
    const { container } = render(
      <ActionEnergyIndicator cost={25} canAfford={false} />
    );

    const indicator = container.querySelector('.border-red-600');
    expect(indicator).toBeTruthy();
  });

  it('shows warning icon when cannot afford', () => {
    const { container } = render(
      <ActionEnergyIndicator cost={25} canAfford={false} />
    );

    // Check for warning icon (circle with exclamation)
    const warningIcon = container.querySelector('path[d*="M12 8v4m0 4h.01"]');
    expect(warningIcon).toBeTruthy();
  });

  it('does not show warning icon when can afford', () => {
    const { container } = render(
      <ActionEnergyIndicator cost={25} canAfford={true} />
    );

    // Check for warning icon
    const warningIcon = container.querySelector('path[d*="M12 8v4m0 4h.01"]');
    expect(warningIcon).toBeFalsy();
  });

  it('displays tooltip with cost when can afford', () => {
    render(
      <ActionEnergyIndicator cost={25} canAfford={true} showTooltip={true} />
    );

    const indicator = screen.getByRole('status');
    expect(indicator.getAttribute('title')).toBe('Costs 25 energy');
  });

  it('displays tooltip with deficit when cannot afford', () => {
    render(
      <ActionEnergyIndicator
        cost={25}
        canAfford={false}
        currentEnergy={10}
        showTooltip={true}
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator.getAttribute('title')).toBe('Need 25 energy (15 short)');
  });

  it('does not show tooltip when showTooltip is false', () => {
    render(
      <ActionEnergyIndicator cost={25} canAfford={true} showTooltip={false} />
    );

    const indicator = screen.getByRole('status');
    expect(indicator.getAttribute('title')).toBeNull();
  });

  it('renders energy icon', () => {
    const { container } = render(
      <ActionEnergyIndicator cost={25} canAfford={true} />
    );

    // Check for lightning bolt icon
    const energyIcon = container.querySelector('path[fill-rule="evenodd"]');
    expect(energyIcon).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ActionEnergyIndicator
        cost={25}
        canAfford={true}
        className="custom-class"
      />
    );

    const indicator = container.querySelector('.custom-class');
    expect(indicator).toBeTruthy();
  });

  it('has accessible aria-label', () => {
    render(
      <ActionEnergyIndicator cost={25} canAfford={true} showTooltip={true} />
    );

    const indicator = screen.getByRole('status', { name: 'Costs 25 energy' });
    expect(indicator).toBeTruthy();
  });

  it('calculates deficit correctly', () => {
    render(
      <ActionEnergyIndicator
        cost={100}
        canAfford={false}
        currentEnergy={30}
        showTooltip={true}
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator.getAttribute('title')).toContain('70 short');
  });

  it('handles zero cost', () => {
    render(<ActionEnergyIndicator cost={0} canAfford={true} />);

    expect(screen.getByText('0')).toBeTruthy();
  });

  it('handles exact energy match', () => {
    render(
      <ActionEnergyIndicator
        cost={50}
        canAfford={true}
        currentEnergy={50}
        showTooltip={true}
      />
    );

    const indicator = screen.getByRole('status');
    expect(indicator.getAttribute('title')).toBe('Costs 50 energy');
  });

  it('handles high energy costs', () => {
    render(<ActionEnergyIndicator cost={999} canAfford={false} />);

    expect(screen.getByText('999')).toBeTruthy();
  });

  it('renders status role for accessibility', () => {
    render(<ActionEnergyIndicator cost={25} canAfford={true} />);

    const status = screen.getByRole('status');
    expect(status).toBeTruthy();
  });
});
