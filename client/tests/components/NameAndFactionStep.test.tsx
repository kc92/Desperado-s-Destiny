/**
 * NameAndFactionStep Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameAndFactionStep } from '@/components/CharacterCreator/NameAndFactionStep';
import { Faction } from '@desperados/shared';

describe('NameAndFactionStep', () => {
  const defaultProps = {
    name: '',
    faction: null,
    onNameChange: vi.fn(),
    onFactionChange: vi.fn(),
    onNext: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render name input and faction cards', () => {
    render(<NameAndFactionStep {...defaultProps} />);

    expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
    expect(screen.getByText('Settler Alliance')).toBeInTheDocument();
    expect(screen.getByText('Nahi Coalition')).toBeInTheDocument();
    expect(screen.getByText('Frontera')).toBeInTheDocument();
  });

  it('should call onNameChange when typing', async () => {
    const user = userEvent.setup();
    const onNameChange = vi.fn();

    render(<NameAndFactionStep {...defaultProps} onNameChange={onNameChange} />);

    const input = screen.getByLabelText(/character name/i);
    await user.type(input, 'TestName');

    expect(onNameChange).toHaveBeenCalled();
  });

  it('should call onFactionChange when faction selected', async () => {
    const user = userEvent.setup();
    const onFactionChange = vi.fn();

    render(<NameAndFactionStep {...defaultProps} onFactionChange={onFactionChange} />);

    const settlerButton = screen.getByText('Settler Alliance').closest('button');
    if (settlerButton) {
      await user.click(settlerButton);
      expect(onFactionChange).toHaveBeenCalledWith(Faction.SETTLER_ALLIANCE);
    }
  });

  it('should show validation error for invalid name', async () => {
    const user = userEvent.setup();

    render(<NameAndFactionStep {...defaultProps} name="ab" />);

    const input = screen.getByLabelText(/character name/i);
    await user.click(input);
    await user.tab(); // Blur the input

    await waitFor(() => {
      expect(screen.getByText(/must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('should disable Next button when name is invalid', () => {
    render(<NameAndFactionStep {...defaultProps} name="ab" faction={Faction.SETTLER_ALLIANCE} />);

    const nextButton = screen.getByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();
  });

  it('should disable Next button when faction not selected', () => {
    render(<NameAndFactionStep {...defaultProps} name="ValidName" faction={null} />);

    const nextButton = screen.getByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();
  });

  it('should enable Next button when name and faction are valid', () => {
    render(
      <NameAndFactionStep
        {...defaultProps}
        name="ValidName"
        faction={Faction.NAHI_COALITION}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next step/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onNext when Next button clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(
      <NameAndFactionStep
        {...defaultProps}
        name="ValidName"
        faction={Faction.FRONTERA}
        onNext={onNext}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next step/i });
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalled();
  });

  it('should show character count', () => {
    render(<NameAndFactionStep {...defaultProps} name="Test" />);

    expect(screen.getByText('4/20 characters')).toBeInTheDocument();
  });
});
