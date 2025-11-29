/**
 * EnergyBar Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnergyBar } from '@/components/EnergyBar';

describe('EnergyBar', () => {
  it('should render energy values correctly', () => {
    render(<EnergyBar current={100} max={150} />);

    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.getByText('100 / 150')).toBeInTheDocument();
  });

  it('should calculate percentage correctly', () => {
    const { container } = render(<EnergyBar current={75} max={150} />);

    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should not exceed 100% width', () => {
    const { container } = render(<EnergyBar current={200} max={150} />);

    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('should hide label when showLabel is false', () => {
    render(<EnergyBar current={100} max={150} showLabel={false} />);

    expect(screen.queryByText('Energy')).not.toBeInTheDocument();
  });

  it('should show regeneration text', () => {
    render(<EnergyBar current={100} max={150} showLabel={true} size="md" />);

    // Should show "Regenerates fully in X hours Y minutes"
    expect(screen.getByText(/regenerates fully in/i)).toBeInTheDocument();
  });

  it('should show "Full energy" when at max', () => {
    render(<EnergyBar current={150} max={150} showLabel={true} size="md" />);

    expect(screen.getByText('Full energy')).toBeInTheDocument();
  });

  it('should render different sizes correctly', () => {
    const { rerender } = render(<EnergyBar current={100} max={150} size="sm" />);
    expect(screen.getByText('100 / 150')).toBeInTheDocument();

    rerender(<EnergyBar current={100} max={150} size="lg" />);
    expect(screen.getByText('100 / 150')).toBeInTheDocument();
  });
});
