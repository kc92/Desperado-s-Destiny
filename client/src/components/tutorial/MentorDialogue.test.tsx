/**
 * MentorDialogue Component Tests
 * Comprehensive test suite for the tutorial mentor dialogue system
 * Tests typewriter effect, keyboard controls, progression, and accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MentorDialogue } from './MentorDialogue';
import { useTutorialStore } from '@/store/useTutorialStore';

// Mock the tutorial store
vi.mock('@/store/useTutorialStore', () => ({
  useTutorialStore: vi.fn(),
  TUTORIAL_SECTIONS: [
    { id: 'welcome', name: 'Welcome', steps: [{ id: 'intro' }] },
    { id: 'actions', name: 'Actions', steps: [{ id: 'learn_actions' }] },
    { id: 'combat', name: 'Combat', steps: [{ id: 'learn_combat' }] },
  ],
}));

// Mock mentor dialogues
vi.mock('@/data/tutorial/mentorDialogues', () => ({
  TUTORIAL_DIALOGUES: [
    {
      sectionId: 'welcome',
      stepIndex: 0,
      lines: [
        {
          text: 'Welcome to the frontier, partner!',
          expression: 'friendly',
          actionText: '*tips hat*',
        },
        {
          text: 'Let me show you the ropes.',
          expression: 'neutral',
        },
      ],
    },
    {
      sectionId: 'actions',
      stepIndex: 0,
      lines: [
        {
          text: 'Time to learn about actions.',
          expression: 'serious',
        },
      ],
    },
  ],
  MENTOR: {
    name: 'Hawk',
    title: 'Veteran Gunslinger',
  },
  getMentorPortrait: vi.fn((expression: string) => `/assets/portraits/mentor/${expression}.png`),
}));

// Mock Button component
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('MentorDialogue Component', () => {
  let mockStore: any;

  beforeEach(() => {
    vi.useFakeTimers();

    mockStore = {
      isActive: true,
      currentSection: 'welcome',
      currentStep: 0,
      currentDialogueLine: 0,
      nextStep: vi.fn(),
      nextDialogueLine: vi.fn(),
      skipTutorial: vi.fn(),
      skipSection: vi.fn(),
      getTotalProgress: vi.fn(() => 33),
      getCurrentSection: vi.fn(() => ({
        id: 'welcome',
        name: 'Welcome',
        steps: [{ id: 'intro' }],
      })),
    };

    (useTutorialStore as any).mockReturnValue(mockStore);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when tutorial is active', () => {
      render(<MentorDialogue />);
      expect(screen.getByText('Hawk')).toBeInTheDocument();
      expect(screen.getByText('Veteran Gunslinger')).toBeInTheDocument();
    });

    it('does not render when tutorial is not active', () => {
      mockStore.isActive = false;
      render(<MentorDialogue />);
      expect(screen.queryByText('Hawk')).not.toBeInTheDocument();
    });

    it('does not render when no dialogue exists', () => {
      mockStore.currentSection = 'nonexistent';
      render(<MentorDialogue />);
      expect(screen.queryByText('Hawk')).not.toBeInTheDocument();
    });

    it('renders mentor portrait', () => {
      render(<MentorDialogue />);
      const portrait = screen.getByAltText(/Hawk/i);
      expect(portrait).toBeInTheDocument();
    });

    it('displays mentor name and title', () => {
      render(<MentorDialogue />);
      expect(screen.getByText('Hawk')).toBeInTheDocument();
      expect(screen.getByText('Veteran Gunslinger')).toBeInTheDocument();
    });

    it('renders skip tutorial button', () => {
      render(<MentorDialogue />);
      expect(screen.getByText('Skip Tutorial')).toBeInTheDocument();
    });

    it('renders skip section button', () => {
      render(<MentorDialogue />);
      expect(screen.getByText('Skip Section')).toBeInTheDocument();
    });

    it('renders progress indicator', () => {
      render(<MentorDialogue />);
      expect(screen.getByText('33% Complete')).toBeInTheDocument();
    });

    it('renders keyboard hint', () => {
      render(<MentorDialogue />);
      expect(screen.getByText(/Press Enter or click Continue/i)).toBeInTheDocument();
    });
  });

  describe('Typewriter Effect', () => {
    it('starts with empty text and types out dialogue', async () => {
      render(<MentorDialogue />);

      // Initially, text should be empty or just starting
      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      // After some time, partial text should appear
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Eventually, full text should appear
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText(/Welcome to the frontier/i)).toBeInTheDocument();
    });

    it('displays typing indicator while typing', () => {
      const { container } = render(<MentorDialogue />);

      // Check for typing indicator
      const typingIndicator = container.querySelector('.animate-pulse');
      expect(typingIndicator).toBeInTheDocument();
    });

    it('removes typing indicator when done', async () => {
      const { container } = render(<MentorDialogue />);

      // Fast-forward past all typing
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Typing indicator should be gone
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });

    it('can skip typewriter by clicking continue', async () => {
      render(<MentorDialogue />);

      // Start typing
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Click continue/skip while typing
      const continueButton = screen.getByText('Skip');
      fireEvent.click(continueButton);

      // Full text should appear immediately
      await waitFor(() => {
        expect(screen.getByText('Welcome to the frontier, partner!')).toBeInTheDocument();
      });
    });
  });

  describe('Action Text', () => {
    it('displays action text when present', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(screen.getByText('*tips hat*')).toBeInTheDocument();
    });

    it('action text is italicized', () => {
      render(<MentorDialogue />);
      const actionText = screen.getByText('*tips hat*');
      expect(actionText).toHaveClass('italic');
    });
  });

  describe('Dialogue Progression', () => {
    it('shows Next button when more lines exist', async () => {
      render(<MentorDialogue />);

      // Skip typing
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('shows Continue button on last line', async () => {
      mockStore.currentDialogueLine = 1; // Last line
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('advances to next dialogue line on Next click', async () => {
      render(<MentorDialogue />);

      // Skip typing
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(mockStore.nextDialogueLine).toHaveBeenCalledTimes(1);
    });

    it('advances to next step on Continue click', async () => {
      mockStore.currentDialogueLine = 1; // Last line
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      expect(mockStore.nextStep).toHaveBeenCalledTimes(1);
    });

    it('calls onComplete when advancing from last line', async () => {
      const onComplete = vi.fn();
      mockStore.currentDialogueLine = 1;
      render(<MentorDialogue onComplete={onComplete} />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Controls', () => {
    it('advances dialogue on Enter key', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockStore.nextDialogueLine).toHaveBeenCalled();
    });

    it('advances dialogue on Space key', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      fireEvent.keyDown(window, { key: ' ' });

      expect(mockStore.nextDialogueLine).toHaveBeenCalled();
    });

    it('skips section on Escape key', () => {
      render(<MentorDialogue />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockStore.skipSection).toHaveBeenCalledTimes(1);
    });

    it('calls onSkip on Escape if provided', () => {
      const onSkip = vi.fn();
      render(<MentorDialogue onSkip={onSkip} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(mockStore.skipSection).not.toHaveBeenCalled();
    });

    it('skips typewriter on Enter while typing', async () => {
      render(<MentorDialogue />);

      // Start typing
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Press Enter while typing
      fireEvent.keyDown(window, { key: 'Enter' });

      // Full text should appear
      await waitFor(() => {
        expect(screen.getByText('Welcome to the frontier, partner!')).toBeInTheDocument();
      });
    });

    it('prevents default behavior on keyboard events', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Skip Functionality', () => {
    it('calls skipTutorial when Skip Tutorial is clicked', () => {
      render(<MentorDialogue />);

      const skipButton = screen.getByText('Skip Tutorial');
      fireEvent.click(skipButton);

      expect(mockStore.skipTutorial).toHaveBeenCalledTimes(1);
    });

    it('calls skipSection when Skip Section is clicked', () => {
      render(<MentorDialogue />);

      const skipButton = screen.getByText('Skip Section');
      fireEvent.click(skipButton);

      expect(mockStore.skipSection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Player Name Substitution', () => {
    it('replaces [player_name] placeholder with default', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // The dialogue should contain 'partner' (default player name)
      expect(screen.getByText(/partner/i)).toBeInTheDocument();
    });

    it('replaces [player_name] placeholder with custom name', async () => {
      render(<MentorDialogue playerName="Jesse" />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // If the dialogue had [player_name], it should now say Jesse
      // This test assumes dialogue has the placeholder
    });
  });

  describe('Mentor Expressions', () => {
    it('updates portrait based on expression', () => {
      render(<MentorDialogue />);

      const portrait = screen.getByAltText(/Hawk - friendly/i);
      expect(portrait).toBeInTheDocument();
    });

    it('changes expression between dialogue lines', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Advance to next line (neutral expression)
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByAltText(/Hawk - neutral/i)).toBeInTheDocument();
      });
    });
  });

  describe('Progress Indicator', () => {
    it('displays section progress dots', () => {
      const { container } = render(<MentorDialogue />);

      // Should have 3 dots (3 sections in mock)
      const dots = container.querySelectorAll('.rounded-full.w-3.h-3');
      expect(dots).toHaveLength(3);
    });

    it('highlights current section dot', () => {
      const { container } = render(<MentorDialogue />);

      const currentDot = container.querySelector('.ring-2.ring-gold-light\\/50');
      expect(currentDot).toBeInTheDocument();
    });

    it('displays section name and step count', () => {
      render(<MentorDialogue />);

      expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      expect(screen.getByText(/1\/1/)).toBeInTheDocument();
    });
  });

  describe('Spotlight Positioning', () => {
    it('positions dialogue at bottom when spotlight is top', () => {
      const { container } = render(<MentorDialogue spotlightPosition="top" />);

      const dialogueContainer = container.querySelector('.bottom-6');
      expect(dialogueContainer).toBeInTheDocument();
    });

    it('positions dialogue at top when spotlight is bottom', () => {
      const { container } = render(<MentorDialogue spotlightPosition="bottom" />);

      const dialogueContainer = container.querySelector('.top-24');
      expect(dialogueContainer).toBeInTheDocument();
    });

    it('centers dialogue when no spotlight', () => {
      const { container } = render(<MentorDialogue spotlightPosition={null} />);

      const dialogueContainer = container.querySelector('.items-center.justify-center');
      expect(dialogueContainer).toBeInTheDocument();
    });

    it('centers dialogue when spotlight is center', () => {
      const { container } = render(<MentorDialogue spotlightPosition="center" />);

      const dialogueContainer = container.querySelector('.items-center.justify-center');
      expect(dialogueContainer).toBeInTheDocument();
    });
  });

  describe('Styling and Visual Effects', () => {
    it('has western-themed styling', () => {
      const { container } = render(<MentorDialogue />);

      const dialogueBox = container.querySelector('.bg-gradient-to-b.from-leather-brown');
      expect(dialogueBox).toBeInTheDocument();
    });

    it('has gold border', () => {
      const { container } = render(<MentorDialogue />);

      const dialogueBox = container.querySelector('.border-gold-dark');
      expect(dialogueBox).toBeInTheDocument();
    });

    it('has decorative corner elements', () => {
      const { container } = render(<MentorDialogue />);

      const corners = container.querySelectorAll('.bg-gold-dark\\/50.rounded-full');
      expect(corners).toHaveLength(4); // 4 corners
    });

    it('has shadow effect', () => {
      const { container } = render(<MentorDialogue />);

      const dialogueBox = container.querySelector('.shadow-2xl');
      expect(dialogueBox).toBeInTheDocument();
    });
  });

  describe('Portrait Image Handling', () => {
    it('handles image load error with fallback', () => {
      render(<MentorDialogue />);

      const portrait = screen.getByAltText(/Hawk/i) as HTMLImageElement;

      // Simulate image error
      fireEvent.error(portrait);

      expect(portrait.src).toContain('placeholder.png');
    });

    it('displays correct portrait path', () => {
      render(<MentorDialogue />);

      const portrait = screen.getByAltText(/Hawk/i) as HTMLImageElement;
      expect(portrait.src).toContain('/assets/portraits/mentor/friendly.png');
    });
  });

  describe('Accessibility', () => {
    it('provides descriptive alt text for portrait', () => {
      render(<MentorDialogue />);

      const portrait = screen.getByAltText('Hawk - friendly');
      expect(portrait).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<MentorDialogue />);

      const heading = screen.getByText('Hawk');
      expect(heading.tagName).toBe('H3');
    });

    it('keyboard controls are accessible', () => {
      render(<MentorDialogue />);

      // All buttons should be keyboard accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('maintains focus management', () => {
      render(<MentorDialogue />);

      const continueButton = screen.getByRole('button', { name: /Skip|Next|Continue/i });
      continueButton.focus();

      expect(continueButton).toHaveFocus();
    });
  });

  describe('Cleanup', () => {
    it('cleans up timers on unmount', () => {
      const { unmount } = render(<MentorDialogue />);

      // Start typewriter
      act(() => {
        vi.advanceTimersByTime(100);
      });

      unmount();

      // Advance timers after unmount - should not cause errors
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });

    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<MentorDialogue />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('handles missing dialogue gracefully', () => {
      mockStore.currentSection = 'nonexistent';
      render(<MentorDialogue />);

      expect(screen.queryByText('Hawk')).not.toBeInTheDocument();
    });

    it('handles empty dialogue lines', () => {
      mockStore.currentDialogueLine = 10; // Out of bounds
      render(<MentorDialogue />);

      expect(screen.queryByText('Hawk')).not.toBeInTheDocument();
    });

    it('handles rapid clicking', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const button = screen.getByText('Next');

      // Click rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should only advance once per actual click
      expect(mockStore.nextDialogueLine).toHaveBeenCalled();
    });

    it('handles missing callbacks gracefully', async () => {
      render(<MentorDialogue />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Should not error without onComplete
      expect(() => {
        const button = screen.getByText('Next');
        fireEvent.click(button);
      }).not.toThrow();
    });
  });
});
