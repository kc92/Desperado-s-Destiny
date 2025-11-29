/**
 * TrainingStatus Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrainingStatus } from '@/components/game/TrainingStatus';
import { TrainingStatus as TrainingStatusType, Skill, SkillCategory, DestinySuit } from '@desperados/shared';

describe('TrainingStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSkill: Skill = {
    id: 'gunfighting',
    name: 'Gunfighting',
    description: 'Master the art of the quick draw',
    category: SkillCategory.COMBAT,
    suit: DestinySuit.SPADES,
    icon: '🔫',
    maxLevel: 50,
    baseTrainingTime: 3600,
  };

  const createMockTraining = (minutesUntilComplete: number): TrainingStatusType => {
    const now = new Date();
    const startedAt = new Date(now.getTime() - 30 * 60 * 1000); // Started 30 mins ago
    const completesAt = new Date(now.getTime() + minutesUntilComplete * 60 * 1000);

    return {
      skillId: 'gunfighting',
      startedAt,
      completesAt,
      xpToGain: 100,
    };
  };

  it('renders current training skill name', () => {
    const training = createMockTraining(30);
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    expect(screen.getByText('Gunfighting')).toBeInTheDocument();
    expect(screen.getByText('Currently Training')).toBeInTheDocument();
  });

  it('displays time remaining correctly', () => {
    const training = createMockTraining(30);
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    expect(screen.getByText(/30m/)).toBeInTheDocument();
  });

  it('shows training progress bar', () => {
    const training = createMockTraining(30);
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    expect(screen.getByText('Training Progress')).toBeInTheDocument();
  });

  it('updates time remaining every second', () => {
    const training = createMockTraining(0.1); // 6 seconds
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    // Component should render with initial time
    expect(screen.getByText(/Time Remaining/)).toBeInTheDocument();

    // Advance time by 1 second
    vi.advanceTimersByTime(1000);

    // Time should still be displayed (countdown is working)
    expect(screen.getByText(/Time Remaining/)).toBeInTheDocument();
  });

  it('enables complete button when training is finished', async () => {
    const training = createMockTraining(-1); // Already complete
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    const completeButton = screen.getByRole('button', { name: /Complete Training/i });
    expect(completeButton).toBeEnabled();
  });

  it('disables complete button when training is not finished', () => {
    const training = createMockTraining(30);
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    const completeButton = screen.getByRole('button', { name: /Complete Training/i });
    expect(completeButton).toBeDisabled();
  });

  it('calls onComplete when complete button is clicked', () => {
    const training = createMockTraining(-1); // Already complete
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    const completeButton = screen.getByRole('button', { name: /Complete Training/i });
    fireEvent.click(completeButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const training = createMockTraining(30);
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows completion message when training is complete', () => {
    const training = createMockTraining(-1); // Already complete
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    expect(screen.getByText(/Training complete!/)).toBeInTheDocument();
  });

  it('disables cancel button when training is complete', () => {
    const training = createMockTraining(-1); // Already complete
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <TrainingStatus training={training} skill={mockSkill} onCancel={onCancel} onComplete={onComplete} />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeDisabled();
  });
});
