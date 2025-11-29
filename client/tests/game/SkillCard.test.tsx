/**
 * SkillCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillCard } from '@/components/game/SkillCard';
import { Skill, SkillData, SkillCategory, DestinySuit } from '@desperados/shared';

describe('SkillCard', () => {
  const mockSkill: Skill = {
    id: 'gunfighting',
    name: 'Gunfighting',
    description: 'Master the art of the quick draw and precision shooting',
    category: SkillCategory.COMBAT,
    suit: DestinySuit.SPADES,
    icon: '🔫',
    maxLevel: 50,
    baseTrainingTime: 3600, // 1 hour
  };

  const mockSkillData: SkillData = {
    skillId: 'gunfighting',
    level: 10,
    xp: 150,
    xpToNextLevel: 300,
  };

  it('renders skill information correctly', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText('Gunfighting')).toBeInTheDocument();
    expect(screen.getByText(/Master the art/)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('/ 50')).toBeInTheDocument();
  });

  it('displays correct category badge', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText('COMBAT')).toBeInTheDocument();
  });

  it('shows correct suit symbol and boost text', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText('♠')).toBeInTheDocument();
    expect(screen.getByText(/Boosts Spades cards/)).toBeInTheDocument();
  });

  it('displays current bonus value', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText(/Current Bonus: \+10 to ♠/)).toBeInTheDocument();
  });

  it('shows XP progress bar when not max level', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText(/150 \/ 300/)).toBeInTheDocument();
  });

  it('enables train button when canTrain is true', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    const trainButton = screen.getByRole('button', { name: /Train/i });
    expect(trainButton).toBeEnabled();
  });

  it('calls onTrain when train button is clicked', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    const trainButton = screen.getByRole('button', { name: /Train/i });
    fireEvent.click(trainButton);

    expect(onTrain).toHaveBeenCalledTimes(1);
  });

  it('shows "Training..." when isTraining is true', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={true}
        canTrain={false}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText('Training...')).toBeInTheDocument();
  });

  it('disables train button when isTraining is true', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={true}
        canTrain={false}
        onTrain={onTrain}
      />
    );

    const trainButton = screen.getByRole('button', { name: /Training/i });
    expect(trainButton).toBeDisabled();
  });

  it('shows "Max Level" when skill is at max level', () => {
    const maxedSkillData: SkillData = {
      ...mockSkillData,
      level: 50,
    };

    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={maxedSkillData}
        isTraining={false}
        canTrain={false}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText('Max Level')).toBeInTheDocument();
  });

  it('disables button when another skill is training', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={false}
        onTrain={onTrain}
      />
    );

    const trainButton = screen.getByRole('button');
    expect(trainButton).toBeDisabled();
  });

  it('hides XP progress bar when skill is max level', () => {
    const maxedSkillData: SkillData = {
      ...mockSkillData,
      level: 50,
    };

    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={maxedSkillData}
        isTraining={false}
        canTrain={false}
        onTrain={onTrain}
      />
    );

    expect(screen.queryByText('Experience')).not.toBeInTheDocument();
  });

  it('displays training time estimate', () => {
    const onTrain = vi.fn();
    render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    expect(screen.getByText(/Training time:/)).toBeInTheDocument();
  });

  it('applies correct border color based on category', () => {
    const onTrain = vi.fn();
    const { container } = render(
      <SkillCard
        skill={mockSkill}
        skillData={mockSkillData}
        isTraining={false}
        canTrain={true}
        onTrain={onTrain}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('border-blood-red');
  });
});
