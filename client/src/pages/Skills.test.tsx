/**
 * Skills Page Tests
 * Tests for the skill training confirmation flow
 *
 * CRITICAL TEST: Verifies fix for bug where training button showed no feedback
 * - Button should show loading state during API call
 * - Success toast should appear when training starts
 * - Error toast should appear on failure
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Skills } from './Skills';

// Mock stores
const mockStartTraining = vi.fn();
const mockShowToast = vi.fn();

vi.mock('@/store/useSkillStore', () => ({
  useSkillStore: () => ({
    skills: [
      {
        id: 'gunslinging',
        name: 'Gunslinging',
        category: 'COMBAT',
        description: 'Accuracy with firearms',
        icon: '🔫',
        suit: 'SPADES',
        maxLevel: 50,
      },
    ],
    skillData: [
      {
        skillId: 'gunslinging',
        level: 5,
        xp: 50,
        xpToNextLevel: 100,
      },
    ],
    currentTraining: null,
    skillBonuses: { SPADES: 5, HEARTS: 0, CLUBS: 0, DIAMONDS: 0 },
    isTrainingSkill: false,
    isLoading: false,
    error: null,
    startTraining: mockStartTraining,
    cancelTraining: vi.fn(),
    completeTraining: vi.fn(),
    startSkillsPolling: vi.fn(),
    stopSkillsPolling: vi.fn(),
  }),
}));

vi.mock('@/store/useCharacterStore', () => ({
  useCharacterStore: () => ({
    currentCharacter: {
      _id: 'test-char-id',
      name: 'Test Character',
      level: 10,
    },
  }),
}));

vi.mock('@/store/useNotificationStore', () => ({
  useNotificationStore: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock('@/utils/tutorialEvents', () => ({
  dispatchTrainingStarted: vi.fn(),
}));

// Mock shared module
vi.mock('@desperados/shared', () => ({
  SkillCategory: {
    COMBAT: 'COMBAT',
    CUNNING: 'CUNNING',
    SPIRIT: 'SPIRIT',
    CRAFT: 'CRAFT',
  },
  NotificationType: {
    SKILL_TRAINED: 'SKILL_TRAINED',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
  },
  DestinySuit: {
    SPADES: 'SPADES',
    HEARTS: 'HEARTS',
    CLUBS: 'CLUBS',
    DIAMONDS: 'DIAMONDS',
  },
  calculateTrainingTime: () => 3600000, // 1 hour in ms
}));

// Mock child components to simplify testing
vi.mock('@/components/game/SkillCard', () => ({
  SkillCard: ({ skill, onTrain }: any) => (
    <div data-testid={`skill-card-${skill.id}`}>
      <span>{skill.name}</span>
      <button onClick={onTrain}>Train</button>
    </div>
  ),
}));

vi.mock('@/components/game/SkillCategoryFilter', () => ({
  SkillCategoryFilter: () => <div data-testid="category-filter" />,
}));

vi.mock('@/components/game/TrainingStatus', () => ({
  TrainingStatus: () => <div data-testid="training-status" />,
}));

vi.mock('@/components/game/SkillBonusSummary', () => ({
  SkillBonusSummary: () => <div data-testid="skill-bonus-summary" />,
}));

vi.mock('@/components/game/HowSkillsWorkModal', () => ({
  HowSkillsWorkModal: () => null,
}));

vi.mock('@/components/mentor', () => ({
  MentorPanel: () => <div data-testid="mentor-panel" />,
}));

describe('Skills Page - Training Confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Training Button Feedback', () => {
    /**
     * CRITICAL TEST: Button should show loading state during API call
     * Root cause: confirmTrain had no local loading state for the button
     */
    it('should show loading state on Start Training button during API call', async () => {
      // Simulate slow API call that doesn't resolve immediately
      let resolveTraining: () => void;
      mockStartTraining.mockImplementation(
        () => new Promise<void>((resolve) => {
          resolveTraining = resolve;
        })
      );

      render(<Skills />);

      // Click Train button on skill card to open modal
      const trainButton = screen.getByRole('button', { name: /train/i });
      fireEvent.click(trainButton);

      // Wait for modal to appear and find Start Training button
      await waitFor(() => {
        expect(screen.getByText(/confirm training/i)).toBeInTheDocument();
      });

      // Find and click the Start Training button in modal
      const startTrainingButton = screen.getByRole('button', { name: /start training/i });
      fireEvent.click(startTrainingButton);

      // Button should show loading state while API is in progress
      await waitFor(() => {
        // The button text changes to "Starting..." when loading
        expect(screen.getByText('Starting...')).toBeInTheDocument();
      });

      // Clean up: resolve the promise
      resolveTraining!();
    });

    it('should disable Start Training button during API call', async () => {
      let resolveTraining: () => void;
      mockStartTraining.mockImplementation(
        () => new Promise<void>((resolve) => {
          resolveTraining = resolve;
        })
      );

      render(<Skills />);

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /train/i }));
      await waitFor(() => {
        expect(screen.getByText(/confirm training/i)).toBeInTheDocument();
      });

      // Find button before clicking
      const startTrainingButton = screen.getByRole('button', { name: /start training/i });

      // Click Start Training
      fireEvent.click(startTrainingButton);

      // Button should be disabled during API call
      await waitFor(() => {
        // Look for a disabled button in the modal
        const buttons = screen.getAllByRole('button');
        const loadingButton = buttons.find(btn => btn.textContent?.includes('Starting'));
        expect(loadingButton).toBeDisabled();
      });

      // Clean up
      resolveTraining!();
    });
  });

  describe('Success Feedback', () => {
    /**
     * CRITICAL TEST: Success toast should appear when training starts
     */
    it('should show success toast when training starts successfully', async () => {
      mockStartTraining.mockResolvedValue(undefined);

      render(<Skills />);

      // Open modal and start training
      fireEvent.click(screen.getByRole('button', { name: /train/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /confirm training/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /start training/i }));

      // Wait for API call to complete and check toast was called
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'SUCCESS',
            title: expect.stringMatching(/training started/i),
          })
        );
      });
    });
  });

  describe('Error Feedback', () => {
    /**
     * CRITICAL TEST: Error toast should appear when training fails
     */
    it('should show error toast when training fails', async () => {
      mockStartTraining.mockRejectedValue(new Error('Server error'));

      render(<Skills />);

      // Open modal and start training
      fireEvent.click(screen.getByRole('button', { name: /train/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /confirm training/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /start training/i }));

      // Wait for API call to fail and check error toast was called
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringMatching(/error/i),
            title: expect.stringMatching(/failed|error/i),
          })
        );
      });
    });

    it('should re-enable button after error', async () => {
      mockStartTraining.mockRejectedValue(new Error('Server error'));

      render(<Skills />);

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /train/i }));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /confirm training/i })).toBeInTheDocument();
      });

      const startTrainingButton = screen.getByRole('button', { name: /start training/i });
      fireEvent.click(startTrainingButton);

      // After error, button should be re-enabled
      await waitFor(() => {
        expect(startTrainingButton).not.toBeDisabled();
        expect(startTrainingButton).not.toHaveAttribute('aria-busy', 'true');
      });
    });
  });
});
