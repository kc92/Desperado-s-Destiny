/**
 * Chat Window Component
 *
 * Main chat interface with rooms, messages, and real-time updates
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { RoomType } from '@desperados/shared';
import type { ChatSettings as ChatSettingsType } from '@desperados/shared';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToastStore } from '@/store/useToastStore';
import { useStorageSync, STORAGE_KEYS } from '@/hooks/useStorageSync';
import { logger } from '@/services/logger.service';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { RoomTabs } from './RoomTabs';
import { OnlineUsersList } from './OnlineUsersList';
import { TypingIndicator } from './TypingIndicator';
import { WhisperModal } from './WhisperModal';
import { ChatSettings } from './ChatSettings';

interface ChatWindowProps {
  /** Optional CSS class name for styling */
  className?: string;

  /** Default room to join on mount */
  defaultRoom?: string;

  /** Whether to auto-focus message input on mount */
  autoFocus?: boolean;
}

export const ChatWindow = React.memo(function ChatWindow({
  className,
  defaultRoom = 'global',
  autoFocus = false
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const { currentCharacter } = useCharacterStore();
  const {
    messages,
    activeRoom,
    onlineUsers,
    typingUsers,
    unreadCounts,
    whispers,
    connectionStatus,
    mutedUntil,
    isSendingMessage,
    error,
    settings,
    initialize,
    cleanup,
    joinRoom,
    sendMessage,
    retrySendMessage,
    setTyping,
    reportMessage,
    updateSettings,
    openWhisper,
    closeWhisper,
    clearError,
  } = useChatStore();

  const isMinimized = settings.isMinimized;
  const [isOnlineUsersVisible, setIsOnlineUsersVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWhisper, setSelectedWhisper] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Sync chat settings across tabs
  const handleSettingsSync = useCallback((newSettings: ChatSettingsType | null) => {
    if (newSettings) {
      // Update store with settings from another tab (without triggering another localStorage write)
      useChatStore.setState({ settings: newSettings });
    }
  }, []);

  useStorageSync<ChatSettingsType>(STORAGE_KEYS.CHAT_SETTINGS, handleSettingsSync);

  // Track initialization state to prevent StrictMode double-invocation issues
  const initializedRef = useRef(false);
  const mountIdRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup if this is still our mount (prevents StrictMode cleanup race)
      if (mountIdRef.current && initializedRef.current) {
        cleanup();
        initializedRef.current = false;
        mountIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize chat when user AND currentCharacter become available
  // This handles async loading where user/character aren't ready on first render
  useEffect(() => {
    // Skip if already initialized
    if (initializedRef.current) {
      return;
    }

    // Wait for both user and currentCharacter to be available
    if (user && currentCharacter) {
      mountIdRef.current = crypto.randomUUID();
      initializedRef.current = true;

      initialize();
      joinRoom(RoomType.GLOBAL, defaultRoom);
    }
  }, [user, currentCharacter, initialize, joinRoom, defaultRoom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      scrollToBottom();
    }
  }, [activeRoom, messages]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSelectRoom = useCallback(async (type: RoomType, id: string) => {
    try {
      await joinRoom(type, id);
      scrollToBottom(false);
    } catch (error) {
      logger.error('Failed to join chat room', error as Error, { roomType: type, roomId: id });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Chat Error',
        message: 'Could not join room. Please try again.',
        duration: 5000
      });
    }
  }, [joinRoom]);

  const handleSendMessage = useCallback(async (content: string, recipientId?: string) => {
    try {
      await sendMessage(content, recipientId);
      scrollToBottom();
    } catch (error) {
      logger.error('Failed to send chat message', error as Error, {
        messageLength: content.length,
        hasRecipient: !!recipientId
      });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Send Failed',
        message: 'Could not send message. Check your connection.',
        duration: 5000
      });
    }
  }, [sendMessage]);

  const handleReport = useCallback(async (messageId: string) => {
    setReportingMessageId(messageId);
  }, []);

  const handleConfirmReport = useCallback(async (reason: string) => {
    if (!reportingMessageId) return;

    try {
      await reportMessage(reportingMessageId, reason);
      setReportingMessageId(null);
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Message Reported',
        message: 'Thank you for reporting. We will review this message.',
        duration: 3000
      });
    } catch (error) {
      logger.error('Failed to report chat message', error as Error, { messageId: reportingMessageId });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Report Failed',
        message: 'Could not report message. Please try again.',
        duration: 5000
      });
    }
  }, [reportingMessageId, reportMessage]);

  const handleWhisper = useCallback((userId: string, username: string, faction?: string) => {
    openWhisper(userId, username, faction || 'settler');
    setSelectedWhisper(userId);
  }, [openWhisper]);

  const getRoomKey = useCallback(
    (type: RoomType, id: string): string => `${type}-${id}`,
    []
  );

  const activeRoomMessages = useMemo(() => {
    return activeRoom
      ? messages.get(getRoomKey(activeRoom.type, activeRoom.id)) || []
      : [];
  }, [activeRoom, messages, getRoomKey]);

  const activeRoomOnlineUsers = useMemo(() => {
    return activeRoom
      ? onlineUsers.get(getRoomKey(activeRoom.type, activeRoom.id)) || []
      : [];
  }, [activeRoom, onlineUsers, getRoomKey]);

  const activeRoomTypingUsers = useMemo(() => {
    return activeRoom
      ? (settings.showTypingIndicators
          ? typingUsers.get(getRoomKey(activeRoom.type, activeRoom.id)) || []
          : [])
      : [];
  }, [activeRoom, settings.showTypingIndicators, typingUsers, getRoomKey]);

  const isGrouped = (index: number): boolean => {
    if (index === 0) return false;

    const current = activeRoomMessages[index];
    const previous = activeRoomMessages[index - 1];

    if (current.type === 'system' || previous.type === 'system') return false;
    if (current.senderId !== previous.senderId) return false;

    const timeDiff =
      new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
    return timeDiff < 60000;
  };

  const selectedWhisperData = selectedWhisper ? whispers.get(selectedWhisper) : null;
  const whisperMessages = selectedWhisper
    ? messages.get(getRoomKey(RoomType.WHISPER, selectedWhisper)) || []
    : [];
  const whisperTypingUsers = selectedWhisper
    ? typingUsers.get(getRoomKey(RoomType.WHISPER, selectedWhisper)) || []
    : [];

  if (!user || !currentCharacter) return null;

  const userFaction = currentCharacter.faction.toLowerCase().replace('_alliance', '').replace('_coalition', '');
  const gangName = null;

  if (isMinimized) {
    return (
      <button
        onClick={() => updateSettings({ isMinimized: false })}
        className="fixed bottom-4 right-4 bg-wood-dark text-western-text-light px-4 py-3 rounded-lg shadow-wood hover:bg-wood-medium transition-colors z-40 flex items-center gap-2"
        aria-label="Open chat"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span className="font-semibold">Chat</span>
        {Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0) > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 bg-blood-crimson text-white text-xs font-bold rounded-full flex items-center justify-center">
            {Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0)}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 w-full md:w-[600px] h-[600px] bg-desert-sand rounded-lg shadow-wood overflow-hidden flex flex-col z-40 md:max-w-[calc(100vw-2rem)] ${className || ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-wood-dark border-b border-wood-grain">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }`}
              aria-label={`Connection status: ${connectionStatus}`}
              title={connectionStatus}
            />
            <h2 className="text-lg font-western text-western-text-light">Chat</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-western-text-light hover:text-gold-light transition-colors"
              aria-label="Chat settings"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            <button
              onClick={() => updateSettings({ isMinimized: true })}
              className="p-2 text-western-text-light hover:text-gold-light transition-colors"
              aria-label="Minimize chat"
              title="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-blood-red bg-opacity-10 border-b border-blood-red text-blood-red text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-blood-red hover:text-blood-dark transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Room Tabs */}
        <RoomTabs
          activeRoom={activeRoom}
          unreadCounts={unreadCounts}
          whispers={whispers}
          userFaction={userFaction}
          gangName={gangName}
          onSelectRoom={handleSelectRoom}
          onCloseWhisper={closeWhisper}
        />

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-white relative"
            >
              {activeRoomMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-wood-grain">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-wood-grain opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-lg font-semibold mb-2">No messages yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="py-4">
                    {activeRoomMessages.map((message, index) => (
                      <Message
                        key={message._id}
                        message={message}
                        isGrouped={isGrouped(index)}
                        currentUsername={currentCharacter?.name || ''}
                        timestampFormat={settings.timestampFormat}
                        onReport={handleReport}
                        onWhisper={handleWhisper}
                        onRetry={retrySendMessage}
                      />
                    ))}
                  </div>

                  {activeRoomTypingUsers.length > 0 && (
                    <TypingIndicator typingUsers={activeRoomTypingUsers} />
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}

              {showScrollButton && (
                <button
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-gold-medium text-wood-dark rounded-full shadow-wood flex items-center justify-center hover:bg-gold-light transition-colors"
                  aria-label="Scroll to bottom"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={(content) => handleSendMessage(content)}
              onTyping={setTyping}
              onlineUsers={activeRoomOnlineUsers}
              isSending={isSendingMessage}
              mutedUntil={mutedUntil}
              autoFocus={autoFocus}
            />
          </div>

          {/* Online Users Sidebar */}
          {settings.showOnlineUsers && (
            <OnlineUsersList
              users={activeRoomOnlineUsers}
              onWhisper={handleWhisper}
              isVisible={isOnlineUsersVisible}
              onToggle={() => setIsOnlineUsersVisible(!isOnlineUsersVisible)}
            />
          )}
        </div>
      </div>

      {/* Whisper Modal */}
      {selectedWhisper && selectedWhisperData && (
        <WhisperModal
          recipientId={selectedWhisper}
          recipientName={selectedWhisperData.username}
          recipientFaction={selectedWhisperData.faction}
          isOnline={selectedWhisperData.isOnline}
          messages={whisperMessages}
          typingUsers={whisperTypingUsers}
          currentUsername={currentCharacter?.name || ''}
          timestampFormat={settings.timestampFormat}
          onClose={() => setSelectedWhisper(null)}
          onSendMessage={handleSendMessage}
          onTyping={setTyping}
          onReport={handleReport}
          isSending={isSendingMessage}
          mutedUntil={mutedUntil}
        />
      )}

      {/* Settings Modal */}
      <ChatSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={updateSettings}
      />

      {/* Report Confirmation */}
      {reportingMessageId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setReportingMessageId(null)}
        >
          <div
            className="bg-desert-sand rounded-lg shadow-wood max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-western text-wood-dark mb-4">Report Message</h3>
            <p className="text-wood-dark mb-4">
              Are you sure you want to report this message? Our moderation team will review it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setReportingMessageId(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-wood-dark font-semibold rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReport('Inappropriate content')}
                className="flex-1 px-4 py-2 bg-blood-crimson text-white font-semibold rounded-lg hover:bg-blood-red transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
