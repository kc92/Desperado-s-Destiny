/**
 * CrimesList Component Tests
 * Tests for crime filtering, sorting, and display
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CrimesList } from '@/components/game/CrimesList';
import { ActionType } from '@desperados/shared';

const mockCrimeActions = [
  {
    _id: '1',
    name: 'Pickpocket',
    description: 'Steal from unsuspecting targets',
    type: ActionType.CRIME,
    energyCost: 10,
    difficulty: 3,
    targetScore: 15,
    rewards: { xp: 50, gold: 25 },
    locationId: 'town',
    isRepeatable: true,
  },
  {
    _id: '2',
    name: 'Bank Heist',
    description: 'Rob the local bank',
    type: ActionType.CRIME,
    energyCost: 30,
    difficulty: 8,
    targetScore: 45,
    rewards: { xp: 200, gold: 500 },
    locationId: 'town',
    isRepeatable: false,
  },
  {
    _id: '3',
    name: 'Horse Theft',
    description: 'Steal a valuable horse',
    type: ActionType.CRIME,
    energyCost: 15,
    difficulty: 5,
    targetScore: 25,
    rewards: { xp: 100, gold: 150 },
    locationId: 'ranch',
    isRepeatable: true,
  },
];

const mockCrimeMetadata = {
  '1': { jailTimeMinutes: 10, wantedLevelIncrease: 1, witnessChance: 20, bailCost: 50 },
  '2': { jailTimeMinutes: 120, wantedLevelIncrease: 3, witnessChance: 85, bailCost: 500 },
  '3': { jailTimeMinutes: 45, wantedLevelIncrease: 2, witnessChance: 50, bailCost: 200 },
};

describe('CrimesList', () => {
  it('should render crime actions', () => {
    render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    expect(screen.getByText('Pickpocket')).toBeInTheDocument();
    expect(screen.getByText('Bank Heist')).toBeInTheDocument();
    expect(screen.getByText('Horse Theft')).toBeInTheDocument();
  });

  it('should show warning banner when wanted level >= 3', () => {
    render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={3}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    expect(screen.getByText('YOU ARE WANTED!')).toBeInTheDocument();
    expect(screen.getByText(/Other players can arrest you/i)).toBeInTheDocument();
  });

  it('should not show warning banner when wanted level < 3', () => {
    render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={2}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    expect(screen.queryByText('YOU ARE WANTED!')).not.toBeInTheDocument();
  });

  it('should filter by risk level', () => {
    render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    const extremeRiskButton = screen.getByRole('button', { name: 'Extreme Risk' });
    fireEvent.click(extremeRiskButton);

    // Only Bank Heist should remain (extreme risk)
    expect(screen.getByText('Bank Heist')).toBeInTheDocument();
    expect(screen.queryByText('Pickpocket')).not.toBeInTheDocument();
  });

  it('should filter by reward type - gold', () => {
    render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    const goldButton = screen.getByRole('button', { name: 'Gold' });
    fireEvent.click(goldButton);

    // All crimes have gold rewards, so all should be visible
    expect(screen.getByText('Pickpocket')).toBeInTheDocument();
    expect(screen.getByText('Bank Heist')).toBeInTheDocument();
  });

  it('should sort by risk level', () => {
    const { container } = render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    const riskButton = screen.getByRole('button', { name: 'Risk Level' });
    fireEvent.click(riskButton);

    // Bank Heist should be first (highest risk)
    const cards = container.querySelectorAll('.parchment');
    expect(cards[0]).toHaveTextContent('Bank Heist');
  });

  it('should sort by total reward', () => {
    const { container } = render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    const rewardButton = screen.getByRole('button', { name: 'Total Reward' });
    fireEvent.click(rewardButton);

    // Bank Heist should be first (highest reward)
    const cards = container.querySelectorAll('.parchment');
    expect(cards[0]).toHaveTextContent('Bank Heist');
  });

  it('should display results count', () => {
    render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={vi.fn()}
      />
    );

    expect(screen.getByText(/Showing 3 of 3 crimes/i)).toBeInTheDocument();
  });

  it('should show empty state when no crimes match filters', () => {
    render(
      <CrimesList
        actions={[]}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={{}}
        onAttempt={vi.fn()}
      />
    );

    expect(screen.getByText(/No crimes match your filters/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <CrimesList
        actions={[]}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={{}}
        onAttempt={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText(/Loading crimes/i)).toBeInTheDocument();
  });

  it('should call onAttempt when crime is attempted', () => {
    const onAttempt = vi.fn();

    render(
      <CrimesList
        actions={mockCrimeActions}
        currentEnergy={100}
        wantedLevel={0}
        crimeMetadata={mockCrimeMetadata}
        onAttempt={onAttempt}
      />
    );

    const attemptButtons = screen.getAllByRole('button', { name: /Attempt Action/i });
    fireEvent.click(attemptButtons[0]);

    expect(onAttempt).toHaveBeenCalled();
  });
});
