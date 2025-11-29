/**
 * Message Input Component
 *
 * Input field for composing and sending chat messages
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { OnlineUser } from '@desperados/shared';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onlineUsers: OnlineUser[];
  isSending: boolean;
  mutedUntil: Date | null;
  disabled?: boolean;
}

// Simple profanity filter - checks for common inappropriate words
const profanityWords = ['damn', 'hell', 'bastard', 'shit', 'fuck', 'bitch', 'ass', 'crap'];

const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
};

export function MessageInput({
  onSendMessage,
  onTyping,
  onlineUsers,
  isSending,
  mutedUntil,
  disabled = false,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [showProfanityWarning, setShowProfanityWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const maxLength = 500;
  const isOverLimit = content.length > maxLength;
  const isEmpty = content.trim().length === 0;
  const isMuted = mutedUntil && new Date() < mutedUntil;
  const canSend = !isEmpty && !isOverLimit && !isSending && !isMuted && !disabled;

  const mutedSecondsRemaining = isMuted
    ? Math.ceil((mutedUntil.getTime() - Date.now()) / 1000)
    : 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 96);
      textarea.style.height = `${newHeight}px`;
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check for profanity
    if (containsProfanity(newContent)) {
      setShowProfanityWarning(true);
    } else {
      setShowProfanityWarning(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (newContent.trim()) {
      onTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 500);
    } else {
      onTyping(false);
    }

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentionDropdown(true);
      setSelectedMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          Math.min(prev + 1, filteredMentionUsers.length - 1)
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (filteredMentionUsers.length > 0) {
          insertMention(filteredMentionUsers[selectedMentionIndex].username);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionDropdown(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertMention = (username: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);

    const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
    const newContent = `${beforeMention}@${username} ${textAfterCursor}`;

    setContent(newContent);
    setShowMentionDropdown(false);

    setTimeout(() => {
      const newCursorPosition = beforeMention.length + username.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSend = () => {
    if (!canSend) return;

    onSendMessage(content);
    setContent('');
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const filteredMentionUsers = onlineUsers
    .filter((user) =>
      user.username.toLowerCase().includes(mentionSearch.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="border-t border-wood-grain bg-desert-sand p-4">
      {isMuted && (
        <div className="mb-2 px-3 py-2 bg-blood-red bg-opacity-10 border border-blood-red rounded-lg text-sm text-blood-red">
          Muted for {mutedSecondsRemaining} second{mutedSecondsRemaining !== 1 ? 's' : ''}
        </div>
      )}

      {showProfanityWarning && (
        <div className="mb-2 px-3 py-2 bg-yellow-100 border border-yellow-500 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span>Your message may contain inappropriate language. Messages with profanity may result in muting.</span>
        </div>
      )}

      <div className="relative">
        {showMentionDropdown && filteredMentionUsers.length > 0 && (
          <div
            className="absolute bottom-full left-0 mb-2 w-64 bg-wood-dark rounded-lg shadow-wood overflow-hidden border border-wood-grain z-10"
            role="listbox"
            aria-label="Mention suggestions"
          >
            {filteredMentionUsers.map((user, index) => (
              <button
                key={user.userId}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                  index === selectedMentionIndex
                    ? 'bg-wood-medium text-western-text-light'
                    : 'text-western-text-light hover:bg-wood-medium'
                }`}
                onClick={() => insertMention(user.username)}
                role="option"
                aria-selected={index === selectedMentionIndex}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    user.faction === 'settler'
                      ? 'bg-faction-settler'
                      : user.faction === 'nahi'
                      ? 'bg-faction-nahi'
                      : 'bg-faction-frontera'
                  }`}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-xs text-wood-grain">Level {user.level}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isMuted ? 'You are muted' : 'Type a message... (@ to mention)'}
            disabled={disabled || !!isMuted}
            className="flex-1 px-4 py-2 bg-white border border-wood-grain rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gold-medium disabled:bg-gray-100 disabled:cursor-not-allowed text-wood-dark"
            rows={1}
            maxLength={maxLength + 50}
            aria-label="Message input"
            aria-describedby="char-count"
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="px-6 py-2 bg-gold-medium text-wood-dark font-semibold rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gold-dark"
            aria-label="Send message"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className="mt-2 flex justify-between items-center text-xs">
          <div
            id="char-count"
            className={`${
              isOverLimit
                ? 'text-blood-red font-semibold'
                : content.length > maxLength * 0.9
                ? 'text-yellow-600 font-semibold'
                : content.length > maxLength * 0.75
                ? 'text-wood-dark'
                : 'text-wood-grain'
            }`}
            aria-live="polite"
          >
            {content.length} / {maxLength}
            {content.length > maxLength * 0.9 && content.length <= maxLength && (
              <span className="ml-1">({maxLength - content.length} remaining)</span>
            )}
            {isOverLimit && (
              <span className="ml-1">(over limit by {content.length - maxLength})</span>
            )}
          </div>

          <div className="text-wood-grain">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
