/**
 * ActionChallenge Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionChallenge } from '@/pages/ActionChallenge';
import { useGameStore } from '@/store/useGameStore';
import { Action, ActionType, ActionResult, Suit, Rank, HandRank } from '@desperados/shared';

// Mock the game store
vi.mock('@/store/useGameStore');

describe('ActionChallenge', () => {
  const mockCharacter = {
    _id: 'char-1',
    name: 'Test Character',
    locationId: 'location-1',
    energy: { current: 50, max: 100, regenRate: 1, lastRegen: new Date() },
    experience: 0,
    level: 1,
    faction: 'settler' as const,
    suitBonuses: {},
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockActions: Action[] = [
    {
      _id: 'action-1',
      name: 'Steal Horse',
      description: 'Steal a horse',
      type: ActionType.CRIME,
      energyCost: 20,
      difficulty: 5,
      targetScore: 300,
      rewards: { xp: 100, gold: 50 },
      locationId: 'location-1',
      isRepeatable: true,
    },
    {
      _id: 'action-2',
      name: 'Fight Bandit',
      description: 'Fight a bandit',
      type: ActionType.COMBAT,
      energyCost: 30,
      difficulty: 7,
      targetScore: 400,
      rewards: { xp: 150 },
      locationId: 'location-1',
      isRepeatable: true,
    },
  ];

  const mockChallenge: ActionResult = {
    action: mockActions[0],
    characterId: 'char-1',
    hand: [
      { suit: Suit.SPADES, rank: Rank.ACE },
      { suit: Suit.SPADES, rank: Rank.KING },
      { suit: Suit.HEARTS, rank: Rank.QUEEN },
      { suit: Suit.CLUBS, rank: Rank.JACK },
      { suit: Suit.DIAMONDS, rank: Rank.TEN },
    ],
    handEvaluation: {
      rank: HandRank.HIGH_CARD,
      score: 300,
      description: 'High Card',
      primaryCards: [],
      kickers: [],
    },
    suitBonuses: [{ suit: Suit.SPADES, bonus: 50 }],
    totalScore: 350,
    success: true,
    margin: 50,
    rewards: { xp: 100, gold: 50 },
    energySpent: 20,
    timestamp: new Date(),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementation
    (useGameStore as any).mockReturnValue({
      currentCharacter: mockCharacter,
      actions: mockActions,
      currentChallenge: null,
      isChallengingAction: false,
      isLoading: false,
      error: null,
      fetchActions: vi.fn(),
      attemptAction: vi.fn(),
      clearChallenge: vi.fn(),
    });
  });

  it('renders character info in header', () => {
    render(<ActionChallenge />);

    expect(screen.getByText('Test Character')).toBeTruthy();
    expect(screen.getByText(/50.*\/.*100/)).toBeTruthy(); // Energy display
  });

  it('shows message when no character selected', () => {
    (useGameStore as any).mockReturnValue({
      currentCharacter: null,
      actions: [],
      currentChallenge: null,
      isChallengingAction: false,
      isLoading: false,
      error: null,
      fetchActions: vi.fn(),
      attemptAction: vi.fn(),
      clearChallenge: vi.fn(),
    });

    render(<ActionChallenge />);
    expect(screen.getByText('No Character Selected')).toBeTruthy();
  });

  it('displays all available actions', () => {
    render(<ActionChallenge />);

    expect(screen.getByText('Steal Horse')).toBeTruthy();
    expect(screen.getByText('Fight Bandit')).toBeTruthy();
  });

  it('filters actions by type', () => {
    render(<ActionChallenge />);

    // Click CRIME filter
    const crimeButton = screen.getByText(/Crime/);
    fireEvent.click(crimeButton);

    // Should show crime action
    expect(screen.getByText('Steal Horse')).toBeTruthy();
    // Combat action should still be in DOM but might be filtered
  });

  it('displays error message when present', () => {
    (useGameStore as any).mockReturnValue({
      currentCharacter: mockCharacter,
      actions: mockActions,
      currentChallenge: null,
      isChallengingAction: false,
      isLoading: false,
      error: 'Test error message',
      fetchActions: vi.fn(),
      attemptAction: vi.fn(),
      clearChallenge: vi.fn(),
    });

    render(<ActionChallenge />);
    expect(screen.getByText('Test error message')).toBeTruthy();
  });

  it('calls fetchActions on mount', () => {
    const fetchActions = vi.fn();

    (useGameStore as any).mockReturnValue({
      currentCharacter: mockCharacter,
      actions: mockActions,
      currentChallenge: null,
      isChallengingAction: false,
      isLoading: false,
      error: null,
      fetchActions,
      attemptAction: vi.fn(),
      clearChallenge: vi.fn(),
    });

    render(<ActionChallenge />);

    expect(fetchActions).toHaveBeenCalledWith('location-1');
  });

  it('opens confirmation modal when action is selected', async () => {
    render(<ActionChallenge />);

    // Click "Attempt Action" button on first action
    const attemptButtons = screen.getAllByText('Attempt Action');
    fireEvent.click(attemptButtons[0]);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to attempt/)).toBeTruthy();
    });
  });

  it('calls attemptAction when confirmed', async () => {
    const attemptAction = vi.fn();

    (useGameStore as any).mockReturnValue({
      currentCharacter: mockCharacter,
      actions: mockActions,
      currentChallenge: null,
      isChallengingAction: false,
      isLoading: false,
      error: null,
      fetchActions: vi.fn(),
      attemptAction,
      clearChallenge: vi.fn(),
    });

    render(<ActionChallenge />);

    // Click attempt button
    const attemptButtons = screen.getAllByText('Attempt Action');
    fireEvent.click(attemptButtons[0]);

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText(/Are you sure/)).toBeTruthy();
    });

    // Click confirm in modal
    const confirmButton = screen.getByText('Attempt');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(attemptAction).toHaveBeenCalledWith('action-1');
    });
  });

  it('shows result modal when challenge completes', () => {
    (useGameStore as any).mockReturnValue({
      currentCharacter: mockCharacter,
      actions: mockActions,
      currentChallenge: mockChallenge,
      isChallengingAction: false,
      isLoading: false,
      error: null,
      fetchActions: vi.fn(),
      attemptAction: vi.fn(),
      clearChallenge: vi.fn(),
    });

    render(<ActionChallenge />);

    expect(screen.getByText('Success!')).toBeTruthy();
    expect(screen.getByText('Action Succeeded!')).toBeTruthy();
  });

  it('displays challenge results correctly', () => {
    (useGameStore as any).mockReturnValue({
      currentCharacter: mockCharacter,
      actions: mockActions,
      currentChallenge: mockChallenge,
      isChallengingAction: false,
      isLoading: false,
      error: null,
      fetchActions: vi.fn(),
      attemptAction: vi.fn(),
      clearChallenge: vi.fn(),
    });

    const { container } = render(<ActionChallenge />);

    // Should show scores
    expect(container.textContent).toContain('350'); // Total score
    expect(container.textContent).toContain('300'); // Target score
    expect(container.textContent).toContain('+50'); // Margin
  });

  it('calls clearChallenge when result modal is closed', async () => {
    const clearChallenge = vi.fn();

    (useGameStore as any).mockReturnValue({
      currentCharacter: mockCharacter,
      actions: mockActions,
      currentChallenge: mockChallenge,
      isChallengingAction: false,
      isLoading: false,
      error: null,
      fetchActions: vi.fn(),
      attemptAction: vi.fn(),
      clearChallenge,
    });

    render(<ActionChallenge />);

    // Click continue button
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(clearChallenge).toHaveBeenCalled();
    });
  });
});
