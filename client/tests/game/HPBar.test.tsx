/**
 * HPBar Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HPBar } from '@/components/game/HPBar';

describe('HPBar', () => {
  it('renders HP bar with correct values', () => {
    render(<HPBar current={75} max={100} label="HP" />);

    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('75 / 100')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    const { container } = render(<HPBar current={50} max={100} />);

    const fillBar = container.querySelector('[style*="width"]');
    expect(fillBar).toHaveStyle({ width: '50%' });
  });

  it('displays green color for high HP (>66%)', () => {
    const { container } = render(<HPBar current={80} max={100} />);

    const fillBar = container.querySelector('.bg-green-600');
    expect(fillBar).toBeInTheDocument();
  });

  it('displays yellow color for medium HP (33-66%)', () => {
    const { container } = render(<HPBar current={50} max={100} />);

    const fillBar = container.querySelector('.bg-yellow-500');
    expect(fillBar).toBeInTheDocument();
  });

  it('displays red color for low HP (<33%)', () => {
    const { container } = render(<HPBar current={20} max={100} />);

    const fillBar = container.querySelector('.bg-red-600');
    expect(fillBar).toBeInTheDocument();
  });

  it('respects color override', () => {
    const { container } = render(<HPBar current={80} max={100} color="red" />);

    const fillBar = container.querySelector('.bg-red-600');
    expect(fillBar).toBeInTheDocument();
  });

  it('handles zero max HP gracefully', () => {
    const { container } = render(<HPBar current={0} max={0} />);

    const fillBar = container.querySelector('[style*="width"]');
    expect(fillBar).toHaveStyle({ width: '0%' });
  });

  it('clamps percentage to 0-100 range', () => {
    const { container } = render(<HPBar current={150} max={100} />);

    const fillBar = container.querySelector('[style*="width"]');
    expect(fillBar).toHaveStyle({ width: '100%' });
  });
});
