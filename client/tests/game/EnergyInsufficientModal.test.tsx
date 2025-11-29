/**
 * EnergyInsufficientModal Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnergyInsufficientModal } from '@/components/game/EnergyInsufficientModal';

describe('EnergyInsufficientModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    energyNeeded: 50,
    energyCurrent: 20,
    timeUntilAvailable: '1h 30m',
    isPremium: false,
  };

  it('renders when open', () => {
    render(<EnergyInsufficientModal {...defaultProps} />);

    expect(screen.getByText('Not Enough Energy!')).toBeTruthy();
  });

  it('does not render when closed', () => {
    render(<EnergyInsufficientModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Not Enough Energy!')).toBeFalsy();
  });

  it('displays energy required and current', () => {
    render(<EnergyInsufficientModal {...defaultProps} />);

    expect(screen.getByText('50')).toBeTruthy(); // Required
    expect(screen.getByText('20')).toBeTruthy(); // Current
  });

  it('displays energy deficit', () => {
    render(<EnergyInsufficientModal {...defaultProps} />);

    // Deficit is 50 - 20 = 30
    expect(screen.getByText('-30')).toBeTruthy();
  });

  it('displays time until available', () => {
    render(<EnergyInsufficientModal {...defaultProps} />);

    expect(screen.getByText('1h 30m')).toBeTruthy();
  });

  it('shows premium upgrade CTA for free players', () => {
    render(<EnergyInsufficientModal {...defaultProps} isPremium={false} />);

    expect(screen.getByText('Upgrade to Premium')).toBeTruthy();
    expect(screen.getByText('Learn More About Premium')).toBeTruthy();
  });

  it('hides premium upgrade CTA for premium players', () => {
    render(<EnergyInsufficientModal {...defaultProps} isPremium={true} />);

    expect(screen.queryByText('Upgrade to Premium')).toBeFalsy();
    expect(screen.queryByText('Learn More About Premium')).toBeFalsy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<EnergyInsufficientModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByText("Okay, I'll Wait");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('lists premium benefits', () => {
    render(<EnergyInsufficientModal {...defaultProps} isPremium={false} />);

    expect(screen.getByText(/250 max energy/)).toBeTruthy();
    expect(screen.getByText(/Faster regeneration/)).toBeTruthy();
    expect(screen.getByText(/More actions per day/)).toBeTruthy();
  });

  it('displays wanted poster aesthetic header', () => {
    render(<EnergyInsufficientModal {...defaultProps} />);

    expect(screen.getByText('OUT OF ENERGY')).toBeTruthy();
    expect(screen.getByText(/Your character is too exhausted/)).toBeTruthy();
  });

  it('shows flavor text', () => {
    render(<EnergyInsufficientModal {...defaultProps} />);

    expect(screen.getByText(/Even the toughest desperado needs rest/)).toBeTruthy();
  });

  it('calculates deficit correctly', () => {
    render(
      <EnergyInsufficientModal
        {...defaultProps}
        energyNeeded={100}
        energyCurrent={25}
      />
    );

    // Deficit is 100 - 25 = 75
    expect(screen.getByText('-75')).toBeTruthy();
  });

  it('handles edge case where current is 0', () => {
    render(
      <EnergyInsufficientModal
        {...defaultProps}
        energyNeeded={50}
        energyCurrent={0}
      />
    );

    expect(screen.getByText('0')).toBeTruthy(); // Current
    expect(screen.getByText('-50')).toBeTruthy(); // Deficit
  });

  it('handles premium upgrade button click', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<EnergyInsufficientModal {...defaultProps} isPremium={false} />);

    const upgradeButton = screen.getByText('Learn More About Premium');
    fireEvent.click(upgradeButton);

    expect(consoleSpy).toHaveBeenCalledWith('Navigate to premium upgrade');

    consoleSpy.mockRestore();
  });

  it('displays all required sections', () => {
    render(<EnergyInsufficientModal {...defaultProps} />);

    // Check for key sections
    expect(screen.getByText('Required')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.getByText('Shortage')).toBeTruthy();
    expect(screen.getByText(/Energy regenerates in:/)).toBeTruthy();
  });
});
