/**
 * CharacterCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterCard } from '@/components/CharacterCard';
import { Faction } from '@desperados/shared';

describe('CharacterCard', () => {
  const mockCharacter = {
    _id: '1',
    name: 'Test Character',
    faction: Faction.SETTLER_ALLIANCE,
    level: 5,
    experience: 250,
    experienceToNextLevel: 500,
    energy: 100,
    maxEnergy: 150,
    locationId: 'red-gulch',
    createdAt: new Date(),
  };

  it('should render character information correctly', () => {
    render(<CharacterCard character={mockCharacter} />);

    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('Settler Alliance')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.getByText('100 / 150')).toBeInTheDocument();
  });

  it('should call onSelect when Play button clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <CharacterCard
        character={mockCharacter}
        onSelect={onSelect}
        showActions={true}
      />
    );

    const playButton = screen.getByRole('button', { name: /play/i });
    await user.click(playButton);

    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when Delete button clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <CharacterCard
        character={mockCharacter}
        onDelete={onDelete}
        showActions={true}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('should not show action buttons when showActions is false', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        showActions={false}
      />
    );

    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('should display experience progress', () => {
    render(<CharacterCard character={mockCharacter} />);

    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('250 / 500')).toBeInTheDocument();
  });

  it('should render with different factions', () => {
    const nahiCharacter = {
      ...mockCharacter,
      faction: Faction.NAHI_COALITION,
    };

    const { rerender } = render(<CharacterCard character={nahiCharacter} />);
    expect(screen.getByText('Nahi Coalition')).toBeInTheDocument();

    const fronteraCharacter = {
      ...mockCharacter,
      faction: Faction.FRONTERA,
    };

    rerender(<CharacterCard character={fronteraCharacter} />);
    expect(screen.getByText('Frontera')).toBeInTheDocument();
  });
});
