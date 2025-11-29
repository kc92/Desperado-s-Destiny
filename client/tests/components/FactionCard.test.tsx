/**
 * FactionCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FactionCard } from '@/components/CharacterCreator/FactionCard';
import { Faction } from '@desperados/shared';

describe('FactionCard', () => {
  it('should render faction information', () => {
    const onSelect = vi.fn();

    render(
      <FactionCard
        faction={Faction.SETTLER_ALLIANCE}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Settler Alliance')).toBeInTheDocument();
    expect(screen.getByText(/Progress through industry and innovation/i)).toBeInTheDocument();
    expect(screen.getByText('Red Gulch')).toBeInTheDocument();
    expect(screen.getByText('+5 Craft')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <FactionCard
        faction={Faction.NAHI_COALITION}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onSelect).toHaveBeenCalledWith(Faction.NAHI_COALITION);
  });

  it('should show selected indicator when selected', () => {
    const onSelect = vi.fn();

    render(
      <FactionCard
        faction={Faction.FRONTERA}
        isSelected={true}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('should not show selected indicator when not selected', () => {
    const onSelect = vi.fn();

    render(
      <FactionCard
        faction={Faction.SETTLER_ALLIANCE}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    expect(screen.queryByText('Selected')).not.toBeInTheDocument();
  });

  it('should render all three factions correctly', () => {
    const onSelect = vi.fn();

    const { rerender } = render(
      <FactionCard
        faction={Faction.SETTLER_ALLIANCE}
        isSelected={false}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('Settler Alliance')).toBeInTheDocument();

    rerender(
      <FactionCard
        faction={Faction.NAHI_COALITION}
        isSelected={false}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('Nahi Coalition')).toBeInTheDocument();

    rerender(
      <FactionCard
        faction={Faction.FRONTERA}
        isSelected={false}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('Frontera')).toBeInTheDocument();
  });
});
