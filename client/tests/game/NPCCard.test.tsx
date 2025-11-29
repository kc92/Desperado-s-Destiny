/**
 * NPCCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NPCCard } from '@/components/game/NPCCard';
import { NPC, NPCType } from '@desperados/shared';

const mockNPC: NPC = {
  _id: 'npc1',
  name: 'Desert Wolf',
  type: NPCType.WILDLIFE,
  level: 5,
  maxHP: 50,
  difficulty: 3,
  location: 'Desert Plains',
  lootTable: {
    goldMin: 10,
    goldMax: 25,
    xpMin: 50,
    xpMax: 100,
    itemChance: 25,
    itemRarities: {
      common: 70,
      uncommon: 20,
      rare: 8,
      epic: 2,
      legendary: 0,
    },
  },
  isBoss: false,
  description: 'A fierce desert predator',
};

const mockBossNPC: NPC = {
  ...mockNPC,
  _id: 'boss1',
  name: 'Bandit King',
  type: NPCType.BOSS,
  level: 10,
  maxHP: 150,
  difficulty: 5,
  isBoss: true,
};

describe('NPCCard', () => {
  it('renders NPC information', () => {
    const onChallenge = vi.fn();
    render(<NPCCard npc={mockNPC} canChallenge={true} onChallenge={onChallenge} />);

    expect(screen.getByText('Desert Wolf')).toBeInTheDocument();
    expect(screen.getByText('Desert Plains')).toBeInTheDocument();
    expect(screen.getByText(/Level:/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('displays difficulty as skulls', () => {
    const onChallenge = vi.fn();
    const { container } = render(<NPCCard npc={mockNPC} canChallenge={true} onChallenge={onChallenge} />);

    // Should have 5 skull emojis (3 red, 2 gray)
    const skulls = container.querySelectorAll('span');
    const skullText = Array.from(skulls).filter(s => s.textContent === '💀');
    expect(skullText.length).toBeGreaterThan(0);
  });

  it('shows loot information', () => {
    const onChallenge = vi.fn();
    render(<NPCCard npc={mockNPC} canChallenge={true} onChallenge={onChallenge} />);

    expect(screen.getByText(/10-25/)).toBeInTheDocument(); // Gold
    expect(screen.getByText(/50-100 XP/)).toBeInTheDocument(); // XP
    expect(screen.getByText(/25%/)).toBeInTheDocument(); // Item chance
  });

  it('calls onChallenge when Challenge button clicked', () => {
    const onChallenge = vi.fn();
    render(<NPCCard npc={mockNPC} canChallenge={true} onChallenge={onChallenge} />);

    const button = screen.getByRole('button', { name: /Challenge/i });
    fireEvent.click(button);

    expect(onChallenge).toHaveBeenCalledWith('npc1');
  });

  it('disables Challenge button when canChallenge is false', () => {
    const onChallenge = vi.fn();
    render(<NPCCard npc={mockNPC} canChallenge={false} onChallenge={onChallenge} />);

    const button = screen.getByRole('button', { name: /Challenge/i });
    expect(button).toBeDisabled();
  });

  it('displays special styling for boss NPCs', () => {
    const onChallenge = vi.fn();
    const { container } = render(<NPCCard npc={mockBossNPC} canChallenge={true} onChallenge={onChallenge} />);

    // Boss should have gold border
    const card = container.querySelector('.border-gold-dark');
    expect(card).toBeInTheDocument();
  });

  it('shows boss challenge button for boss NPCs', () => {
    const onChallenge = vi.fn();
    render(<NPCCard npc={mockBossNPC} canChallenge={true} onChallenge={onChallenge} />);

    expect(screen.getByRole('button', { name: /Challenge Boss/i })).toBeInTheDocument();
  });

  it('displays NPC description when provided', () => {
    const onChallenge = vi.fn();
    render(<NPCCard npc={mockNPC} canChallenge={true} onChallenge={onChallenge} />);

    expect(screen.getByText(/A fierce desert predator/i)).toBeInTheDocument();
  });
});
