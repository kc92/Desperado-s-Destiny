/**
 * Skills Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Skills } from '@/pages/Skills';
import { useGameStore } from '@/store/useGameStore';
import { SkillCategory, DestinySuit } from '@desperados/shared';

// Mock the game store
vi.mock('@/store/useGameStore');

describe('Skills Page', () => {
  const mockSkills = [
    {
      id: 'gunfighting',
      name: 'Gunfighting',
      description: 'Master the quick draw',
      category: SkillCategory.COMBAT,
      suit: DestinySuit.SPADES,
      icon: '🔫',
      maxLevel: 50,
      baseTrainingTime: 3600,
    },
    {
      id: 'persuasion',
      name: 'Persuasion',
      description: 'Win people over',
      category: SkillCategory.SPIRIT,
      suit: DestinySuit.HEARTS,
      icon: '💬',
      maxLevel: 50,
      baseTrainingTime: 3600,
    },
  ];

  const mockSkillData = [
    {
      skillId: 'gunfighting',
      level: 10,
      xp: 150,
      xpToNextLevel: 300,
    },
    {
      skillId: 'persuasion',
      level: 5,
      xp: 50,
      xpToNextLevel: 150,
    },
  ];

  const mockBonuses = {
    SPADES: 10,
    HEARTS: 5,
    CLUBS: 0,
    DIAMONDS: 0,
  };

  const mockCurrentCharacter = {
    _id: 'char1',
    name: 'Test Character',
    level: 15,
    experience: 1000,
  };

  const defaultMockStore = {
    skills: mockSkills,
    skillData: mockSkillData,
    currentTraining: null,
    skillBonuses: mockBonuses,
    isTrainingSkill: false,
    currentCharacter: mockCurrentCharacter,
    isLoading: false,
    error: null,
    startTraining: vi.fn(),
    cancelTraining: vi.fn(),
    completeTraining: vi.fn(),
    startSkillsPolling: vi.fn(),
    stopSkillsPolling: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as any).mockReturnValue(defaultMockStore);
  });

  const renderSkillsPage = () => {
    return render(
      <BrowserRouter>
        <Skills />
      </BrowserRouter>
    );
  };

  it('renders the skills page title', () => {
    renderSkillsPage();
    expect(screen.getByText('Skill Training')).toBeInTheDocument();
  });

  it('displays character name and level', () => {
    renderSkillsPage();
    expect(screen.getByText(/Test Character/)).toBeInTheDocument();
    expect(screen.getByText(/Level 15/)).toBeInTheDocument();
  });

  it('renders all skill cards', () => {
    renderSkillsPage();
    expect(screen.getByText('Gunfighting')).toBeInTheDocument();
    expect(screen.getByText('Persuasion')).toBeInTheDocument();
  });

  it('starts skills polling on mount', () => {
    renderSkillsPage();
    expect(defaultMockStore.startSkillsPolling).toHaveBeenCalled();
  });

  it('stops skills polling on unmount', () => {
    const { unmount } = renderSkillsPage();
    unmount();
    expect(defaultMockStore.stopSkillsPolling).toHaveBeenCalled();
  });

  it('shows "How Skills Work" button', () => {
    renderSkillsPage();
    expect(screen.getByText('How Skills Work')).toBeInTheDocument();
  });

  it('opens How Skills Work modal when button is clicked', () => {
    renderSkillsPage();
    const button = screen.getByText('How Skills Work');
    fireEvent.click(button);

    expect(screen.getByText(/Master the Frontier/)).toBeInTheDocument();
  });

  it('renders skill bonus summary', () => {
    renderSkillsPage();
    expect(screen.getByText('Destiny Deck Bonuses')).toBeInTheDocument();
  });

  it('renders category filter', () => {
    renderSkillsPage();
    expect(screen.getByText('All Skills')).toBeInTheDocument();
    expect(screen.getAllByText('Combat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Spirit').length).toBeGreaterThan(0);
  });

  it('filters skills by category', async () => {
    renderSkillsPage();

    // Click Combat filter
    const combatButton = screen.getByRole('button', { name: /Filter by Combat/i });
    fireEvent.click(combatButton);

    // Should show Gunfighting but not Persuasion
    expect(screen.getByText('Gunfighting')).toBeInTheDocument();
    expect(screen.queryByText('Persuasion')).not.toBeInTheDocument();
  });

  it('shows empty state when no training active', () => {
    renderSkillsPage();
    expect(screen.getByText(/Select a skill to start training/)).toBeInTheDocument();
  });

  it('shows training status when training is active', () => {
    const now = new Date();
    const mockTraining = {
      skillId: 'gunfighting',
      startedAt: new Date(now.getTime() - 30 * 60 * 1000),
      completesAt: new Date(now.getTime() + 30 * 60 * 1000),
      xpToGain: 100,
    };

    (useGameStore as any).mockReturnValue({
      ...defaultMockStore,
      currentTraining: mockTraining,
      isTrainingSkill: true,
    });

    renderSkillsPage();
    expect(screen.getByText('Currently Training')).toBeInTheDocument();
  });

  it('opens train confirmation modal when train button is clicked', async () => {
    renderSkillsPage();

    // Find and click the first train button
    const trainButtons = screen.getAllByRole('button', { name: /Train/i });
    fireEvent.click(trainButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirm Training')).toBeInTheDocument();
    });
  });

  it('calls startTraining when confirming training', async () => {
    renderSkillsPage();

    // Click train button
    const trainButtons = screen.getAllByRole('button', { name: /Train/i });
    fireEvent.click(trainButtons[0]);

    // Confirm
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Start Training/i });
      fireEvent.click(confirmButton);
    });

    expect(defaultMockStore.startTraining).toHaveBeenCalled();
  });

  it('displays error message when error exists', () => {
    (useGameStore as any).mockReturnValue({
      ...defaultMockStore,
      error: 'Failed to load skills',
    });

    renderSkillsPage();
    expect(screen.getByText(/Failed to load skills/)).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    (useGameStore as any).mockReturnValue({
      ...defaultMockStore,
      isLoading: true,
      skills: [],
    });

    renderSkillsPage();
    // Loading spinner should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows celebration modal when training completes', async () => {
    const mockCompleteTraining = vi.fn().mockResolvedValue(undefined);

    const now = new Date();
    const mockTraining = {
      skillId: 'gunfighting',
      startedAt: new Date(now.getTime() - 60 * 60 * 1000),
      completesAt: new Date(now.getTime() - 1000), // Already complete
      xpToGain: 100,
    };

    (useGameStore as any).mockReturnValue({
      ...defaultMockStore,
      currentTraining: mockTraining,
      isTrainingSkill: true,
      completeTraining: mockCompleteTraining,
    });

    renderSkillsPage();

    // Click complete training
    const completeButton = screen.getByRole('button', { name: /Complete Training/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockCompleteTraining).toHaveBeenCalled();
    });
  });

  it('opens cancel confirmation modal when cancel is clicked', async () => {
    const now = new Date();
    const mockTraining = {
      skillId: 'gunfighting',
      startedAt: new Date(now.getTime() - 30 * 60 * 1000),
      completesAt: new Date(now.getTime() + 30 * 60 * 1000),
      xpToGain: 100,
    };

    (useGameStore as any).mockReturnValue({
      ...defaultMockStore,
      currentTraining: mockTraining,
      isTrainingSkill: true,
    });

    renderSkillsPage();

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel Training?')).toBeInTheDocument();
    });
  });

  it('calls cancelTraining when confirming cancel', async () => {
    const now = new Date();
    const mockTraining = {
      skillId: 'gunfighting',
      startedAt: new Date(now.getTime() - 30 * 60 * 1000),
      completesAt: new Date(now.getTime() + 30 * 60 * 1000),
      xpToGain: 100,
    };

    (useGameStore as any).mockReturnValue({
      ...defaultMockStore,
      currentTraining: mockTraining,
      isTrainingSkill: true,
    });

    renderSkillsPage();

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Confirm cancel
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Yes, Cancel Training/i });
      fireEvent.click(confirmButton);
    });

    expect(defaultMockStore.cancelTraining).toHaveBeenCalled();
  });

  it('shows all skills maxed message when all skills are maxed', () => {
    const maxedSkillData = mockSkillData.map((sd) => ({
      ...sd,
      level: 50,
    }));

    (useGameStore as any).mockReturnValue({
      ...defaultMockStore,
      skillData: maxedSkillData,
    });

    renderSkillsPage();
    expect(screen.getByText(/Frontier Legend!/)).toBeInTheDocument();
  });

  it('sorts skills by level (highest first)', () => {
    renderSkillsPage();

    const skillCards = screen.getAllByRole('article');
    // Gunfighting (level 10) should come before Persuasion (level 5)
    expect(skillCards[0]).toHaveTextContent('Gunfighting');
  });
});
