/**
 * SkillBonusSummary Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillBonusSummary } from '@/components/game/SkillBonusSummary';
import { SuitBonuses, Skill, SkillData, SkillCategory, DestinySuit } from '@desperados/shared';

describe('SkillBonusSummary', () => {
  const mockBonuses: SuitBonuses = {
    SPADES: 15,
    HEARTS: 10,
    CLUBS: 8,
    DIAMONDS: 12,
  };

  const mockSkills: Skill[] = [
    {
      id: 'gunfighting',
      name: 'Gunfighting',
      description: 'Combat skill',
      category: SkillCategory.COMBAT,
      suit: DestinySuit.SPADES,
      icon: '🔫',
      maxLevel: 50,
      baseTrainingTime: 3600,
    },
    {
      id: 'persuasion',
      name: 'Persuasion',
      description: 'Social skill',
      category: SkillCategory.SPIRIT,
      suit: DestinySuit.HEARTS,
      icon: '💬',
      maxLevel: 50,
      baseTrainingTime: 3600,
    },
  ];

  const mockSkillData: SkillData[] = [
    {
      skillId: 'gunfighting',
      level: 15,
      xp: 100,
      xpToNextLevel: 200,
    },
    {
      skillId: 'persuasion',
      level: 10,
      xp: 50,
      xpToNextLevel: 150,
    },
  ];

  it('renders all four suit cards', () => {
    render(<SkillBonusSummary bonuses={mockBonuses} skills={mockSkills} skillData={mockSkillData} />);

    expect(screen.getByText('Spades')).toBeInTheDocument();
    expect(screen.getByText('Hearts')).toBeInTheDocument();
    expect(screen.getByText('Clubs')).toBeInTheDocument();
    expect(screen.getByText('Diamonds')).toBeInTheDocument();
  });

  it('displays correct bonus values', () => {
    render(<SkillBonusSummary bonuses={mockBonuses} skills={mockSkills} skillData={mockSkillData} />);

    expect(screen.getByText('+15')).toBeInTheDocument(); // Spades
    expect(screen.getByText('+10')).toBeInTheDocument(); // Hearts
    expect(screen.getByText('+8')).toBeInTheDocument(); // Clubs
    expect(screen.getByText('+12')).toBeInTheDocument(); // Diamonds
  });

  it('shows suit symbols correctly', () => {
    render(<SkillBonusSummary bonuses={mockBonuses} skills={mockSkills} skillData={mockSkillData} />);

    expect(screen.getAllByText('♠').length).toBeGreaterThan(0);
    expect(screen.getAllByText('♥').length).toBeGreaterThan(0);
    expect(screen.getAllByText('♣').length).toBeGreaterThan(0);
    expect(screen.getAllByText('♦').length).toBeGreaterThan(0);
  });

  it('toggles expanded state when button is clicked', () => {
    render(<SkillBonusSummary bonuses={mockBonuses} skills={mockSkills} skillData={mockSkillData} />);

    const toggleButton = screen.getByText(/Show Details/i);
    fireEvent.click(toggleButton);

    expect(screen.getByText(/Hide Details/i)).toBeInTheDocument();
  });

  it('shows tooltip information', () => {
    render(<SkillBonusSummary bonuses={mockBonuses} skills={mockSkills} skillData={mockSkillData} />);

    expect(screen.getByText(/How it works:/i)).toBeInTheDocument();
    expect(screen.getByText(/These bonuses are added to your Destiny Deck/i)).toBeInTheDocument();
  });
});
