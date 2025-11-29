/**
 * Whisper Modal Component
 *
 * Dedicated modal for private 1-on-1 whisper conversations
 */

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@desperados/shared';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { getFactionBgClass, getUserInitials } from '@/utils/chat.utils';

interface WhisperModalProps {
  recipientId: string;
  recipientName: string;
  recipientFaction: 'settler' | 'nahi' | 'frontera';
  isOnline: boolean;
  messages: ChatMessage[];
  typingUsers: string[];
  currentUsername: string;
  timestampFormat: 'relative' | 'absolute';
  onClose: () => void;
  onSendMessage: (content: string, recipientId: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  onReport: (messageId: string) => void;
  isSending: boolean;
  mutedUntil: Date | null;
}

export function WhisperModal({
  recipientId,
  recipientName,
  recipientFaction,
  isOnline,
  messages,
  typingUsers,
  currentUsername,
  timestampFormat,
  onClose,
  onSendMessage,
  onTyping,
  onReport,
  isSending,
  mutedUntil,
}: WhisperModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSendMessage = async (content: string) => {
    await onSendMessage(content, recipientId);
    scrollToBottom();
  };

  const isGrouped = (index: number): boolean => {
    if (index === 0) return false;

    const current = messages[index];
    const previous = messages[index - 1];

    if (current.type === 'system' || previous.type === 'system') return false;
    if (current.senderId !== previous.senderId) return false;

    const timeDiff =
      new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
    return timeDiff < 60000;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whisper-title"
    >
      <div
        className="bg-desert-sand rounded-lg shadow-wood w-full max-w-2xl h-[600px] md:h-[500px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-wood-grain bg-wood-dark">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getFactionBgClass(
                  recipientFaction
                )}`}
              >
                {getUserInitials(recipientName)}
              </div>
              {isOnline && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-wood-dark rounded-full"
                  aria-label="Online"
                />
              )}
            </div>
            <div>
              <h2 id="whisper-title" className="text-lg font-western text-western-text-light">
                {recipientName}
              </h2>
              <p className="text-xs text-wood-grain">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-western-text-light hover:text-gold-light transition-colors"
            aria-label="Close whisper"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-white relative"
        >
          {messages.length === 0 ? (
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
                <p className="text-sm">Start a conversation with {recipientName}!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="py-4">
                {messages.map((message, index) => (
                  <Message
                    key={message._id}
                    message={message}
                    isGrouped={isGrouped(index)}
                    currentUsername={currentUsername}
                    timestampFormat={timestampFormat}
                    onReport={onReport}
                    onWhisper={() => {}}
                  />
                ))}
              </div>

              {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

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

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={onTyping}
          onlineUsers={[]}
          isSending={isSending}
          mutedUntil={mutedUntil}
        />
      </div>
    </div>
  );
}
