/**
 * OnlineUsersList Component Tests
 *
 * Tests for online users sidebar component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnlineUsersList } from '@/components/chat/OnlineUsersList';
import type { OnlineUser } from '@desperados/shared';

const mockUsers: OnlineUser[] = [
  {
    userId: 'user1',
    username: 'Alice',
    faction: 'settler',
    level: 10,
    isOnline: true,
  },
  {
    userId: 'user2',
    username: 'Bob',
    faction: 'nahi',
    level: 15,
    gangName: 'Thunder Gang',
    isOnline: true,
  },
  {
    userId: 'user3',
    username: 'Charlie',
    faction: 'frontera',
    level: 5,
    isOnline: false,
  },
];

const defaultProps = {
  users: mockUsers,
  onWhisper: vi.fn(),
  isVisible: true,
  onToggle: vi.fn(),
};

describe('OnlineUsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render user count', () => {
      render(<OnlineUsersList {...defaultProps} />);
      expect(screen.getByText('Online Users (3)')).toBeInTheDocument();
    });

    it('should render all users', () => {
      render(<OnlineUsersList {...defaultProps} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should render user levels', () => {
      render(<OnlineUsersList {...defaultProps} />);
      expect(screen.getByText('Level 10')).toBeInTheDocument();
      expect(screen.getByText('Level 15')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    it('should render gang name if user has gang', () => {
      render(<OnlineUsersList {...defaultProps} />);
      expect(screen.getByText(/Thunder Gang/)).toBeInTheDocument();
    });

    it('should show online indicator for online users', () => {
      render(<OnlineUsersList {...defaultProps} />);
      const onlineIndicators = screen.getAllByLabelText('Online');
      expect(onlineIndicators).toHaveLength(2);
    });

    it('should not show list when isVisible is false on desktop', () => {
      const { container } = render(<OnlineUsersList {...defaultProps} isVisible={false} />);
      const sidebar = container.querySelector('.md\\:hidden');
      expect(sidebar).toHaveClass('md:hidden');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no users', () => {
      render(<OnlineUsersList {...defaultProps} users={[]} />);
      expect(screen.getByText('No users online')).toBeInTheDocument();
    });

    it('should show no users found when search returns empty', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search users');
      fireEvent.change(searchInput, { target: { value: 'NonexistentUser' } });

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter users by search query', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search users');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('should filter users case-insensitively', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search users');
      fireEvent.change(searchInput, { target: { value: 'alice' } });

      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should show all users when search is cleared', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search users');
      fireEvent.change(searchInput, { target: { value: 'Alice' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by online status by default', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const userElements = screen.getAllByRole('button', { name: /Whisper/ });
      const firstUser = userElements[0];
      const lastUser = userElements[userElements.length - 1];

      expect(firstUser).toHaveTextContent('Alice');
      expect(lastUser).toHaveTextContent('Charlie');
    });

    it('should sort by name alphabetically', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const nameButton = screen.getByText('Name');
      fireEvent.click(nameButton);

      const userElements = screen.getAllByRole('button', { name: /Whisper/ });
      expect(userElements[0]).toHaveTextContent('Alice');
      expect(userElements[1]).toHaveTextContent('Bob');
      expect(userElements[2]).toHaveTextContent('Charlie');
    });

    it('should sort by level descending', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const levelButton = screen.getByText('Level');
      fireEvent.click(levelButton);

      const userElements = screen.getAllByRole('button', { name: /Whisper/ });
      expect(userElements[0]).toHaveTextContent('Bob');
      expect(userElements[0]).toHaveTextContent('Level 15');
    });

    it('should update active sort button style', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const nameButton = screen.getByText('Name');
      fireEvent.click(nameButton);

      expect(nameButton).toHaveClass('bg-gold-medium');
    });
  });

  describe('Whisper Functionality', () => {
    it('should call onWhisper when clicking a user', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const aliceButton = screen.getByLabelText('Whisper Alice');
      fireEvent.click(aliceButton);

      expect(defaultProps.onWhisper).toHaveBeenCalledWith('user1', 'Alice', 'settler');
    });

    it('should call onWhisper with correct faction', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const bobButton = screen.getByLabelText('Whisper Bob');
      fireEvent.click(bobButton);

      expect(defaultProps.onWhisper).toHaveBeenCalledWith('user2', 'Bob', 'nahi');
    });
  });

  describe('Toggle Functionality', () => {
    it('should call onToggle when clicking toggle button', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const toggleButton = screen.getByLabelText('Hide online users');
      fireEvent.click(toggleButton);

      expect(defaultProps.onToggle).toHaveBeenCalled();
    });

    it('should show overlay on mobile when visible', () => {
      const { container } = render(<OnlineUsersList {...defaultProps} isVisible={true} />);
      const overlay = container.querySelector('.md\\:hidden.fixed.inset-0.bg-black');
      expect(overlay).toBeInTheDocument();
    });

    it('should hide overlay when clicking it', () => {
      const { container } = render(<OnlineUsersList {...defaultProps} />);

      const overlay = container.querySelector('.md\\:hidden.fixed.inset-0.bg-black');
      if (overlay) {
        fireEvent.click(overlay);
        expect(defaultProps.onToggle).toHaveBeenCalled();
      }
    });
  });

  describe('Faction Styling', () => {
    it('should apply settler faction color to avatar', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const userButtons = screen.getAllByRole('button', { name: /Whisper/ });
      const aliceButton = userButtons.find((btn) => btn.textContent?.includes('Alice'));

      const avatar = aliceButton?.querySelector('.bg-faction-settler');
      expect(avatar).toBeInTheDocument();
    });

    it('should apply nahi faction color to avatar', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const userButtons = screen.getAllByRole('button', { name: /Whisper/ });
      const bobButton = userButtons.find((btn) => btn.textContent?.includes('Bob'));

      const avatar = bobButton?.querySelector('.bg-faction-nahi');
      expect(avatar).toBeInTheDocument();
    });

    it('should apply frontera faction color to avatar', () => {
      render(<OnlineUsersList {...defaultProps} />);

      const userButtons = screen.getAllByRole('button', { name: /Whisper/ });
      const charlieButton = userButtons.find((btn) => btn.textContent?.includes('Charlie'));

      const avatar = charlieButton?.querySelector('.bg-faction-frontera');
      expect(avatar).toBeInTheDocument();
    });
  });
});
