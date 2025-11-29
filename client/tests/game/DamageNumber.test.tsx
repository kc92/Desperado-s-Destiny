/**
 * DamageNumber Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DamageNumber } from '@/components/game/DamageNumber';

describe('DamageNumber', () => {
  it('renders damage number', () => {
    const { container } = render(<DamageNumber damage={25} />);

    expect(container.textContent).toContain('25');
  });

  it('displays critical hit indicator for critical damage', () => {
    const { container } = render(<DamageNumber damage={50} isCritical={true} />);

    expect(container.textContent).toContain('!');
  });

  it('applies correct color class for gold damage', () => {
    const { container } = render(<DamageNumber damage={25} color="gold" />);

    const damageText = container.querySelector('.text-gold-light');
    expect(damageText).toBeInTheDocument();
  });

  it('applies correct color class for red damage', () => {
    const { container } = render(<DamageNumber damage={25} color="red" />);

    const damageText = container.querySelector('.text-red-500');
    expect(damageText).toBeInTheDocument();
  });

  it('calls onComplete callback after animation', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(<DamageNumber damage={25} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(onComplete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('applies larger size for high damage', () => {
    const { container } = render(<DamageNumber damage={60} />);

    const damageText = container.querySelector('.text-6xl');
    expect(damageText).toBeInTheDocument();
  });

  it('applies medium size for medium damage', () => {
    const { container } = render(<DamageNumber damage={35} />);

    const damageText = container.querySelector('.text-5xl');
    expect(damageText).toBeInTheDocument();
  });

  it('applies small size for low damage', () => {
    const { container } = render(<DamageNumber damage={10} />);

    const damageText = container.querySelector('.text-3xl');
    expect(damageText).toBeInTheDocument();
  });
});
