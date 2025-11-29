/**
 * ChatWindow Component Tests
 *
 * Comprehensive tests for the main ChatWindow component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useAuthStore } from '@/store/useAuthStore';
import { useGameStore } from '@/store/useGameStore';
import { useChatStore } from '@/store/useChatStore';
import { RoomType } from '@desperados/shared';

vi.mock('@/store/useAuthStore');
vi.mock('@/store/useGameStore');
vi.mock('@/store/useChatStore');

const mockUser = {
  id: 'user1',
  username: 'TestUser',
  email: 'test@example.com',
  createdAt: '2024-01-01',
  lastLogin: '2024-01-01',
};

const mockCharacter = {
  _id: 'char1',
  userId: 'user1',
  name: 'TestCharacter',
  faction: 'SETTLER_ALLIANCE' as const,
  level: 5,
  experience: 100,
  experienceToNextLevel: 500,
  energy: 50,
  maxEnergy: 100,
  locationId: 'town',
  createdAt: new Date(),
};

const mockChatStore = {
  messages: new Map(),
  activeRoom: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),
  unreadCounts: new Map(),
  whispers: new Map(),
  connectionStatus: 'connected' as const,
  mutedUntil: null,
  isSendingMessage: false,
  error: null,
  settings: {
    soundEnabled: true,
    browserNotificationsEnabled: false,
    notificationVolume: 50,
    showTypingIndicators: true,
    timestampFormat: 'relative' as const,
    profanityFilterEnabled: false,
    showOnlineUsers: true,
    fontSize: 'medium' as const,
  },
  initialize: vi.fn(),
  cleanup: vi.fn(),
  joinRoom: vi.fn(),
  leaveRoom: vi.fn(),
  sendMessage: vi.fn(),
  markAsRead: vi.fn(),
  setTyping: vi.fn(),
  reportMessage: vi.fn(),
  updateSettings: vi.fn(),
  openWhisper: vi.fn(),
  closeWhisper: vi.fn(),
  clearError: vi.fn(),
  fetchHistory: vi.fn(),
  getOnlineUsers: vi.fn(),
};

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useGameStore).mockReturnValue({
      currentCharacter: mockCharacter,
    } as any);

    vi.mocked(useChatStore).mockReturnValue(mockChatStore as any);
  });

  describe('Rendering', () => {
    it('should not render when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(<ChatWindow />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when no character is selected', () => {
      vi.mocked(useGameStore).mockReturnValue({
        currentCharacter: null,
      } as any);

      const { container } = render(<ChatWindow />);
      expect(container.firstChild).toBeNull();
    });

    it('should render chat window when authenticated and character selected', () => {
      render(<ChatWindow />);
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('should show connection status indicator', () => {
      render(<ChatWindow />);
      expect(screen.getByLabelText(/Connection status: connected/i)).toBeInTheDocument();
    });

    it('should render minimized button', () => {
      render(<ChatWindow />);
      const minimizeButton = screen.getByLabelText('Minimize chat');
      expect(minimizeButton).toBeInTheDocument();
    });

    it('should render settings button', () => {
      render(<ChatWindow />);
      const settingsButton = screen.getByLabelText('Chat settings');
      expect(settingsButton).toBeInTheDocument();
    });
  });

  describe('Initialization', () => {
    it('should initialize chat on mount', () => {
      render(<ChatWindow />);
      expect(mockChatStore.initialize).toHaveBeenCalled();
    });

    it('should join global room on mount', () => {
      render(<ChatWindow />);
      expect(mockChatStore.joinRoom).toHaveBeenCalledWith(RoomType.GLOBAL, 'global');
    });

    it('should cleanup on unmount', () => {
      const { unmount } = render(<ChatWindow />);
      unmount();
      expect(mockChatStore.cleanup).toHaveBeenCalled();
    });
  });

  describe('Minimize/Maximize', () => {
    it('should minimize chat window', () => {
      render(<ChatWindow />);
      const minimizeButton = screen.getByLabelText('Minimize chat');

      fireEvent.click(minimizeButton);

      expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
      expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    });

    it('should maximize chat window', () => {
      render(<ChatWindow />);

      fireEvent.click(screen.getByLabelText('Minimize chat'));
      fireEvent.click(screen.getByLabelText('Open chat'));

      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('should show unread count on minimized button', () => {
      vi.mocked(useChatStore).mockReturnValue({
        ...mockChatStore,
        unreadCounts: new Map([
          ['global-global', 5],
          ['faction-settler', 3],
        ]),
      } as any);

      render(<ChatWindow />);
      fireEvent.click(screen.getByLabelText('Minimize chat'));

      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error banner when error exists', () => {
      vi.mocked(useChatStore).mockReturnValue({
        ...mockChatStore,
        error: 'Connection failed',
      } as any);

      render(<ChatWindow />);
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('should clear error on dismiss', () => {
      vi.mocked(useChatStore).mockReturnValue({
        ...mockChatStore,
        error: 'Test error',
      } as any);

      render(<ChatWindow />);
      const dismissButton = screen.getByLabelText('Dismiss error');

      fireEvent.click(dismissButton);

      expect(mockChatStore.clearError).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no messages', () => {
      render(<ChatWindow />);
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByText('Be the first to start the conversation!')).toBeInTheDocument();
    });
  });

  describe('Messages Display', () => {
    const mockMessages = [
      {
        _id: 'msg1',
        roomType: RoomType.GLOBAL,
        roomId: 'global',
        type: 'chat' as const,
        senderId: 'user2',
        senderName: 'OtherUser',
        senderFaction: 'settler' as const,
        content: 'Hello!',
        createdAt: new Date(),
      },
      {
        _id: 'msg2',
        roomType: RoomType.GLOBAL,
        roomId: 'global',
        type: 'chat' as const,
        senderId: 'user1',
        senderName: 'TestUser',
        senderFaction: 'settler' as const,
        content: 'Hi there!',
        createdAt: new Date(),
      },
    ];

    it('should render messages when present', () => {
      const messagesMap = new Map([['global-global', mockMessages]]);

      vi.mocked(useChatStore).mockReturnValue({
        ...mockChatStore,
        messages: messagesMap,
        activeRoom: { type: RoomType.GLOBAL, id: 'global' },
      } as any);

      render(<ChatWindow />);
      expect(screen.getByText('Hello!')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });

  describe('Settings Modal', () => {
    it('should open settings modal', () => {
      render(<ChatWindow />);

      const settingsButton = screen.getByLabelText('Chat settings');
      fireEvent.click(settingsButton);

      expect(screen.getByText('Chat Settings')).toBeInTheDocument();
    });

    it('should close settings modal', async () => {
      render(<ChatWindow />);

      fireEvent.click(screen.getByLabelText('Chat settings'));

      const closeButton = screen.getByLabelText('Close settings');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Chat Settings')).not.toBeInTheDocument();
      });
    });
  });

  describe('Connection Status', () => {
    it('should show green indicator when connected', () => {
      render(<ChatWindow />);
      const indicator = screen.getByLabelText('Connection status: connected');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('should show yellow indicator when connecting', () => {
      vi.mocked(useChatStore).mockReturnValue({
        ...mockChatStore,
        connectionStatus: 'connecting',
      } as any);

      render(<ChatWindow />);
      const indicator = screen.getByLabelText('Connection status: connecting');
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('should show red indicator when disconnected', () => {
      vi.mocked(useChatStore).mockReturnValue({
        ...mockChatStore,
        connectionStatus: 'disconnected',
      } as any);

      render(<ChatWindow />);
      const indicator = screen.getByLabelText('Connection status: disconnected');
      expect(indicator).toHaveClass('bg-red-500');
    });
  });
});
