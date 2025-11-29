/**
 * CombatResultModal Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CombatResultModal } from '@/components/game/CombatResultModal';
import { CombatResult } from '@desperados/shared';

const mockVictoryResult: CombatResult = {
  victory: true,
  xpGained: 100,
  goldGained: 50,
  goldLost: 0,
  itemsLooted: [
    { name: 'Rare Sword', rarity: 'rare', type: 'weapon', description: 'A valuable blade' },
    { name: 'Common Potion', rarity: 'common', type: 'consumable' },
  ],
  finalPlayerHP: 75,
  finalNPCHP: 0,
  totalRounds: 5,
  totalDamageDealt: 150,
  totalDamageTaken: 25,
};

const mockDefeatResult: CombatResult = {
  victory: false,
  xpGained: 0,
  goldGained: 0,
  goldLost: 25,
  itemsLooted: [],
  finalPlayerHP: 0,
  finalNPCHP: 30,
  totalRounds: 3,
  totalDamageDealt: 80,
  totalDamageTaken: 100,
};

describe('CombatResultModal', () => {
  describe('Victory Mode', () => {
    it('displays victory header', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockVictoryResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText('VICTORY!')).toBeInTheDocument();
    });

    it('shows XP gained', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockVictoryResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText(/100 XP/i)).toBeInTheDocument();
    });

    it('shows gold gained', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockVictoryResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText(/50/)).toBeInTheDocument();
    });

    it('displays looted items', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockVictoryResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText('Rare Sword')).toBeInTheDocument();
      expect(screen.getByText('Common Potion')).toBeInTheDocument();
    });

    it('shows combat stats', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockVictoryResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument(); // Rounds
      expect(screen.getByText('150')).toBeInTheDocument(); // Damage dealt
      expect(screen.getByText('25')).toBeInTheDocument(); // Damage taken
    });

    it('calls onContinue when Continue button clicked', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockVictoryResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      const button = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(button);

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Defeat Mode', () => {
    it('displays defeat header', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockDefeatResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText('DEFEATED')).toBeInTheDocument();
    });

    it('shows gold lost', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockDefeatResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText(/25/)).toBeInTheDocument();
    });

    it('displays defeat message', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockDefeatResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText(/defeated/i)).toBeInTheDocument();
    });

    it('shows respawn button', () => {
      const onContinue = vi.fn();
      render(
        <CombatResultModal
          result={mockDefeatResult}
          isOpen={true}
          onContinue={onContinue}
        />
      );

      expect(screen.getByRole('button', { name: /Respawn/i })).toBeInTheDocument();
    });
  });

  it('does not render when isOpen is false', () => {
    const onContinue = vi.fn();
    const { container } = render(
      <CombatResultModal
        result={mockVictoryResult}
        isOpen={false}
        onContinue={onContinue}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
