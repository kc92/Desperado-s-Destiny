/**
 * Chat Store Tests
 *
 * Comprehensive tests for the chat Zustand store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatStore } from '@/store/useChatStore';
import { socketService } from '@/services/socket.service';
import { RoomType } from '@desperados/shared';

vi.mock('@/services/socket.service', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    isConnected: vi.fn(() => false),
    onStatusChange: vi.fn(() => () => {}),
  },
}));

describe('useChatStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.cleanup();
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useChatStore());

      expect(result.current.messages.size).toBe(0);
      expect(result.current.activeRoom).toBeNull();
      expect(result.current.connectionStatus).toBe('disconnected');
      expect(result.current.mutedUntil).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should connect to socket on initialize', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.initialize();
      });

      expect(socketService.connect).toHaveBeenCalled();
      expect(socketService.onStatusChange).toHaveBeenCalled();
    });

    it('should not reconnect if already connected', () => {
      vi.mocked(socketService.isConnected).mockReturnValue(true);
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.initialize();
      });

      expect(socketService.connect).not.toHaveBeenCalled();
    });

    it('should cleanup properly', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.initialize();
        result.current.cleanup();
      });

      expect(socketService.disconnect).toHaveBeenCalled();
      expect(result.current.messages.size).toBe(0);
      expect(result.current.activeRoom).toBeNull();
    });
  });

  describe('Room Management', () => {
    it('should join a room successfully', async () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.initialize();
      });

      vi.mocked(socketService.isConnected).mockReturnValue(true);

      await act(async () => {
        await result.current.joinRoom(RoomType.GLOBAL, 'global');
      });

      expect(socketService.emit).toHaveBeenCalledWith('chat:join_room', {
        roomType: RoomType.GLOBAL,
        roomId: 'global',
      });
      expect(result.current.activeRoom).toEqual({
        type: RoomType.GLOBAL,
        id: 'global',
      });
    });

    it('should leave previous room when joining new room', async () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.initialize();
      });

      vi.mocked(socketService.isConnected).mockReturnValue(true);

      await act(async () => {
        await result.current.joinRoom(RoomType.GLOBAL, 'global');
        await result.current.joinRoom(RoomType.FACTION, 'settler');
      });

      expect(socketService.emit).toHaveBeenCalledWith('chat:leave_room', {
        roomType: RoomType.GLOBAL,
        roomId: 'global',
      });
      expect(result.current.activeRoom).toEqual({
        type: RoomType.FACTION,
        id: 'settler',
      });
    });

    it('should not join room if not connected', async () => {
      const { result } = renderHook(() => useChatStore());

      vi.mocked(socketService.isConnected).mockReturnValue(false);

      await expect(async () => {
        await act(async () => {
          await result.current.joinRoom(RoomType.GLOBAL, 'global');
        });
      }).rejects.toThrow('Not connected to chat server');
    });

    it('should leave a room successfully', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.initialize();
        result.current.leaveRoom(RoomType.GLOBAL, 'global');
      });

      expect(socketService.emit).toHaveBeenCalledWith('chat:leave_room', {
        roomType: RoomType.GLOBAL,
        roomId: 'global',
      });
    });
  });

  describe('Message Sending', () => {
    beforeEach(() => {
      vi.mocked(socketService.isConnected).mockReturnValue(true);
    });

    it('should send message successfully', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.joinRoom(RoomType.GLOBAL, 'global');
        await result.current.sendMessage('Hello world');
      });

      expect(socketService.emit).toHaveBeenCalledWith('chat:send_message', {
        roomType: RoomType.GLOBAL,
        roomId: 'global',
        content: 'Hello world',
        recipientId: undefined,
      });
    });

    it('should fail to send empty message', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.joinRoom(RoomType.GLOBAL, 'global');
      });

      await expect(async () => {
        await act(async () => {
          await result.current.sendMessage('   ');
        });
      }).rejects.toThrow('Message cannot be empty');
    });

    it('should fail to send message over character limit', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.joinRoom(RoomType.GLOBAL, 'global');
      });

      const longMessage = 'a'.repeat(501);

      await expect(async () => {
        await act(async () => {
          await result.current.sendMessage(longMessage);
        });
      }).rejects.toThrow('Message too long');
    });

    it('should send whisper with recipient ID', async () => {
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Secret message', 'user123');
      });

      expect(socketService.emit).toHaveBeenCalledWith('chat:send_message', {
        roomType: 'whisper',
        roomId: 'user123',
        content: 'Secret message',
        recipientId: 'user123',
      });
    });

    it('should fail to send message when muted', async () => {
      const { result } = renderHook(() => useChatStore());

      const futureDate = new Date(Date.now() + 10000);

      await act(async () => {
        await result.current.joinRoom(RoomType.GLOBAL, 'global');
        result.current.mutedUntil = futureDate;
      });

      await expect(async () => {
        await act(async () => {
          await result.current.sendMessage('Test');
        });
      }).rejects.toThrow('User is muted');
    });
  });

  describe('Message Receiving', () => {
    it('should add received message to messages map', () => {
      const { result } = renderHook(() => useChatStore());
      const mockMessage = {
        _id: 'msg1',
        roomType: RoomType.GLOBAL,
        roomId: 'global',
        type: 'chat' as const,
        senderId: 'user1',
        senderName: 'TestUser',
        senderFaction: 'settler' as const,
        content: 'Hello',
        createdAt: new Date(),
      };

      act(() => {
        result.current.initialize();
      });

      const onCallback = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'chat:message'
      )?.[1];

      if (onCallback) {
        act(() => {
          onCallback(mockMessage);
        });
      }

      const messages = result.current.messages.get('global-global');
      expect(messages).toHaveLength(1);
      expect(messages?.[0]._id).toBe('msg1');
    });

    it('should not add duplicate messages', () => {
      const { result } = renderHook(() => useChatStore());
      const mockMessage = {
        _id: 'msg1',
        roomType: RoomType.GLOBAL,
        roomId: 'global',
        type: 'chat' as const,
        senderId: 'user1',
        senderName: 'TestUser',
        senderFaction: 'settler' as const,
        content: 'Hello',
        createdAt: new Date(),
      };

      act(() => {
        result.current.initialize();
      });

      const onCallback = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'chat:message'
      )?.[1];

      if (onCallback) {
        act(() => {
          onCallback(mockMessage);
          onCallback(mockMessage);
        });
      }

      const messages = result.current.messages.get('global-global');
      expect(messages).toHaveLength(1);
    });
  });

  describe('Unread Counts', () => {
    it('should increment unread count for inactive room', () => {
      const { result } = renderHook(() => useChatStore());
      const mockMessage = {
        _id: 'msg1',
        roomType: RoomType.FACTION,
        roomId: 'settler',
        type: 'chat' as const,
        senderId: 'user1',
        senderName: 'TestUser',
        senderFaction: 'settler' as const,
        content: 'Hello',
        createdAt: new Date(),
      };

      act(() => {
        result.current.initialize();
      });

      const onCallback = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'chat:message'
      )?.[1];

      if (onCallback) {
        act(() => {
          onCallback(mockMessage);
        });
      }

      expect(result.current.unreadCounts.get('faction-settler')).toBe(1);
    });

    it('should not increment unread count for active room', async () => {
      const { result } = renderHook(() => useChatStore());

      vi.mocked(socketService.isConnected).mockReturnValue(true);

      await act(async () => {
        await result.current.joinRoom(RoomType.GLOBAL, 'global');
      });

      const mockMessage = {
        _id: 'msg1',
        roomType: RoomType.GLOBAL,
        roomId: 'global',
        type: 'chat' as const,
        senderId: 'user1',
        senderName: 'TestUser',
        senderFaction: 'settler' as const,
        content: 'Hello',
        createdAt: new Date(),
      };

      const onCallback = vi.mocked(socketService.on).mock.calls.find(
        (call) => call[0] === 'chat:message'
      )?.[1];

      if (onCallback) {
        act(() => {
          onCallback(mockMessage);
        });
      }

      expect(result.current.unreadCounts.get('global-global')).toBeUndefined();
    });

    it('should mark room as read', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.unreadCounts.set('global-global', 5);
        result.current.markAsRead(RoomType.GLOBAL, 'global');
      });

      expect(result.current.unreadCounts.get('global-global')).toBe(0);
    });
  });

  describe('Settings Management', () => {
    it('should load settings from localStorage', () => {
      const mockSettings = {
        soundEnabled: false,
        browserNotificationsEnabled: true,
        notificationVolume: 75,
        showTypingIndicators: false,
        timestampFormat: 'absolute' as const,
        profanityFilterEnabled: true,
        showOnlineUsers: false,
        fontSize: 'large' as const,
      };

      localStorage.setItem('chat_settings', JSON.stringify(mockSettings));

      const { result } = renderHook(() => useChatStore());

      expect(result.current.settings.soundEnabled).toBe(false);
      expect(result.current.settings.notificationVolume).toBe(75);
      expect(result.current.settings.timestampFormat).toBe('absolute');
    });

    it('should save settings to localStorage', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.updateSettings({
          soundEnabled: false,
          notificationVolume: 80,
        });
      });

      const saved = JSON.parse(localStorage.getItem('chat_settings') || '{}');
      expect(saved.soundEnabled).toBe(false);
      expect(saved.notificationVolume).toBe(80);
    });

    it('should merge settings on update', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.updateSettings({
          soundEnabled: false,
        });
      });

      expect(result.current.settings.browserNotificationsEnabled).toBe(false);
      expect(result.current.settings.soundEnabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error on connection failure', async () => {
      const { result } = renderHook(() => useChatStore());

      vi.mocked(socketService.isConnected).mockReturnValue(false);

      await expect(async () => {
        await act(async () => {
          await result.current.joinRoom(RoomType.GLOBAL, 'global');
        });
      }).rejects.toThrow();

      expect(result.current.error).toBe('Not connected to chat server');
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.error = 'Test error';
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Whisper Management', () => {
    it('should open whisper conversation', () => {
      const { result } = renderHook(() => useChatStore());

      vi.mocked(socketService.isConnected).mockReturnValue(true);

      act(() => {
        result.current.openWhisper('user123', 'TestUser', 'settler');
      });

      expect(result.current.whispers.has('user123')).toBe(true);
      const whisper = result.current.whispers.get('user123');
      expect(whisper?.username).toBe('TestUser');
      expect(whisper?.faction).toBe('settler');
    });

    it('should close whisper conversation', () => {
      const { result } = renderHook(() => useChatStore());

      vi.mocked(socketService.isConnected).mockReturnValue(true);

      act(() => {
        result.current.openWhisper('user123', 'TestUser', 'settler');
        result.current.closeWhisper('user123');
      });

      expect(result.current.whispers.has('user123')).toBe(false);
    });
  });
});
