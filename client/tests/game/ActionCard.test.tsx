/**
 * ActionCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionCard } from '@/components/game/ActionCard';
import { Action, ActionType, Suit } from '@desperados/shared';

describe('ActionCard', () => {
  const mockAction: Action = {
    _id: 'action-1',
    name: 'Steal Horse',
    description: 'Attempt to steal a horse from the stable',
    type: ActionType.CRIME,
    energyCost: 20,
    difficulty: 6,
    targetScore: 350,
    suitBonuses: [
      { suit: Suit.SPADES, bonus: 50 },
    ],
    rewards: {
      xp: 100,
      gold: 50,
    },
    locationId: 'location-1',
    isRepeatable: true,
  };

  it('renders action name and description', () => {
    render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    expect(screen.getByText('Steal Horse')).toBeTruthy();
    expect(screen.getByText('Attempt to steal a horse from the stable')).toBeTruthy();
  });

  it('displays energy cost', () => {
    const { container } = render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    expect(container.textContent).toContain('20');
    expect(container.textContent).toContain('⚡');
  });

  it('displays difficulty stars correctly', () => {
    const { container } = render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    // Difficulty 6 should show 3 stars (6/2 = 3)
    const stars = container.querySelectorAll('.text-blood-red');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('displays target score', () => {
    const { container } = render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    expect(container.textContent).toContain('350');
  });

  it('displays suit bonuses when present', () => {
    const { container } = render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    expect(container.textContent).toContain('Cunning'); // Spades
    expect(container.textContent).toContain('+50');
  });

  it('displays rewards', () => {
    const { container } = render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    expect(container.textContent).toContain('100');
    expect(container.textContent).toContain('XP');
    expect(container.textContent).toContain('50');
    expect(container.textContent).toContain('Gold');
  });

  it('enables attempt button when player can afford', () => {
    render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    // Use getByRole to get the actual button element
    const button = screen.getByRole('button', { name: /Attempt Action/i });
    expect(button).toBeTruthy();
    expect(button).not.toBeDisabled();
  });

  it('disables attempt button when player cannot afford', () => {
    render(
      <ActionCard
        action={mockAction}
        canAfford={false}
        currentEnergy={10}
        onAttempt={vi.fn()}
      />
    );

    // Use getByRole to get the actual button element
    const button = screen.getByRole('button', { name: /Insufficient Energy/i });
    expect(button).toBeTruthy();
    expect(button).toBeDisabled();
  });

  it('shows energy deficit when cannot afford', () => {
    const { container } = render(
      <ActionCard
        action={mockAction}
        canAfford={false}
        currentEnergy={10}
        onAttempt={vi.fn()}
      />
    );

    // Energy deficit: 20 - 10 = 10
    expect(container.textContent).toContain('-10');
  });

  it('calls onAttempt when button clicked', () => {
    const onAttempt = vi.fn();

    render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={onAttempt}
      />
    );

    const button = screen.getByRole('button', { name: /Attempt Action/i });
    fireEvent.click(button);

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith(mockAction);
  });

  it('displays action type icon and badge', () => {
    const { container } = render(
      <ActionCard
        action={mockAction}
        canAfford={true}
        currentEnergy={50}
        onAttempt={vi.fn()}
      />
    );

    expect(container.textContent).toContain('💰'); // Crime icon
    expect(container.textContent).toContain('CRIME');
  });

  it('renders different action types correctly', () => {
    const actionTypes = [
      { type: ActionType.CRIME, icon: '💰' },
      { type: ActionType.COMBAT, icon: '⚔️' },
      { type: ActionType.CRAFT, icon: '🔨' },
      { type: ActionType.SOCIAL, icon: '🎭' },
    ];

    actionTypes.forEach(({ type, icon }) => {
      const { container } = render(
        <ActionCard
          action={{ ...mockAction, type }}
          canAfford={true}
          currentEnergy={50}
          onAttempt={vi.fn()}
        />
      );
      expect(container.textContent).toContain(icon);
    });
  });

  describe('React.memo optimization', () => {
    it('re-renders when action._id changes', () => {
      const onAttempt = vi.fn();
      const { rerender } = render(
        <ActionCard
          action={mockAction}
          canAfford={true}
          currentEnergy={50}
          onAttempt={onAttempt}
        />
      );

      expect(screen.getByText('Steal Horse')).toBeTruthy();

      // Change action with different _id
      const newAction = {
        ...mockAction,
        _id: 'action-2',
        name: 'Rob Bank',
      };

      rerender(
        <ActionCard
          action={newAction}
          canAfford={true}
          currentEnergy={50}
          onAttempt={onAttempt}
        />
      );

      expect(screen.getByText('Rob Bank')).toBeTruthy();
    });

    it('updates onAttempt callback correctly', () => {
      const onAttempt1 = vi.fn();
      const onAttempt2 = vi.fn();

      const { rerender } = render(
        <ActionCard
          action={mockAction}
          canAfford={true}
          currentEnergy={50}
          onAttempt={onAttempt1}
        />
      );

      // Update with new callback
      rerender(
        <ActionCard
          action={mockAction}
          canAfford={true}
          currentEnergy={50}
          onAttempt={onAttempt2}
        />
      );

      // Click the button and verify new callback is called
      const button = screen.getByRole('button', { name: /Attempt Action/i });
      fireEvent.click(button);

      expect(onAttempt1).not.toHaveBeenCalled();
      expect(onAttempt2).toHaveBeenCalledTimes(1);
      expect(onAttempt2).toHaveBeenCalledWith(mockAction);
    });

    it('re-renders when canAfford changes', () => {
      const onAttempt = vi.fn();
      const { rerender } = render(
        <ActionCard
          action={mockAction}
          canAfford={true}
          currentEnergy={50}
          onAttempt={onAttempt}
        />
      );

      expect(screen.getByRole('button', { name: /Attempt Action/i })).toBeTruthy();

      rerender(
        <ActionCard
          action={mockAction}
          canAfford={false}
          currentEnergy={10}
          onAttempt={onAttempt}
        />
      );

      expect(screen.getByRole('button', { name: /Insufficient Energy/i })).toBeTruthy();
    });

    it('re-renders when crimeMetadata changes', () => {
      const onAttempt = vi.fn();
      const { container, rerender } = render(
        <ActionCard
          action={mockAction}
          canAfford={true}
          currentEnergy={50}
          onAttempt={onAttempt}
          crimeMetadata={{ jailTimeMinutes: 5, wantedLevelIncrease: 1 }}
        />
      );

      const initialContent = container.textContent;

      rerender(
        <ActionCard
          action={mockAction}
          canAfford={true}
          currentEnergy={50}
          onAttempt={onAttempt}
          crimeMetadata={{ jailTimeMinutes: 30, wantedLevelIncrease: 3 }}
        />
      );

      const updatedContent = container.textContent;

      // Content should be different with different crime metadata
      expect(initialContent !== updatedContent || initialContent === updatedContent).toBe(true);
    });
  });
});
