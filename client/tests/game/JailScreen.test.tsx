/**
 * JailScreen Component Tests
 * Tests for jail screen UI, countdown timer, and bail functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JailScreen } from '@/components/game/JailScreen';

describe('JailScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when not jailed', () => {
    const { container } = render(
      <JailScreen
        isJailed={false}
        jailedUntil={null}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render jail screen when jailed', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes from now

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        offense="Bank Robbery"
        onPayBail={vi.fn()}
      />
    );

    expect(screen.getByText("YOU'RE IN JAIL")).toBeInTheDocument();
    expect(screen.getByText("Bank Robbery")).toBeInTheDocument();
  });

  it('should display countdown timer', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes from now

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    expect(screen.getByText(/Time Remaining:/i)).toBeInTheDocument();
    expect(screen.getByText(/5m/)).toBeInTheDocument();
  });

  it('should update countdown every second', async () => {
    const jailedUntil = new Date(Date.now() + 1000 * 10); // 10 seconds from now

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    // Advance time by 1 second
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText(/9s/)).toBeInTheDocument();
    });
  });

  it('should show celebration when timer expires', async () => {
    const onJailExpired = vi.fn();
    const jailedUntil = new Date(Date.now() + 1000 * 2); // 2 seconds from now

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
        onJailExpired={onJailExpired}
      />
    );

    // Advance time past jail expiration
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText("You're Free!")).toBeInTheDocument();
      expect(onJailExpired).toHaveBeenCalled();
    });
  });

  it('should enable bail button when player has enough dollars', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    const bailButton = screen.getByRole('button', { name: /Pay Bail: \$100/i });
    expect(bailButton).toBeEnabled();
  });

  it('should disable bail button when player lacks dollars', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={50}
        onPayBail={vi.fn()}
      />
    );

    const bailButton = screen.getByRole('button', { name: /Pay Bail: \$100/i });
    expect(bailButton).toBeDisabled();
    expect(screen.getByText(/Insufficient dollars/i)).toBeInTheDocument();
  });

  it('should call onPayBail when bail button is clicked', () => {
    const onPayBail = vi.fn();
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={onPayBail}
      />
    );

    const bailButton = screen.getByRole('button', { name: /Pay Bail: \$100/i });
    fireEvent.click(bailButton);

    expect(onPayBail).toHaveBeenCalled();
  });

  it('should display prison bars overlay', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    const { container } = render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    // Check for prison bars (12 bars)
    const bars = container.querySelectorAll('.bg-gradient-to-b');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should display random flavor text', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    // Flavor text should be italic
    const flavorText = screen.getByText(/The|You|Somewhere|At least/i);
    expect(flavorText).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    expect(screen.getByText(/Time Served/i)).toBeInTheDocument();
  });

  it('should flash warning when less than 1 minute remaining', async () => {
    const jailedUntil = new Date(Date.now() + 1000 * 30); // 30 seconds

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Less than 1 minute remaining!/i)).toBeInTheDocument();
    });
  });

  it('should display offense type', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        offense="Horse Theft"
        onPayBail={vi.fn()}
      />
    );

    expect(screen.getByText("Horse Theft")).toBeInTheDocument();
  });

  it('should use default offense if none provided', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    expect(screen.getByText("Criminal Activities")).toBeInTheDocument();
  });

  it('should disable serve time button', () => {
    const jailedUntil = new Date(Date.now() + 1000 * 60 * 30);

    render(
      <JailScreen
        isJailed={true}
        jailedUntil={jailedUntil}
        bailCost={100}
        currentDollars={200}
        onPayBail={vi.fn()}
      />
    );

    const serveButton = screen.getByRole('button', { name: /Serve Time/i });
    expect(serveButton).toBeDisabled();
  });
});
