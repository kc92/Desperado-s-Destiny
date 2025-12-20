/**
 * Message Component
 *
 * Displays individual chat messages with faction styling and context menu.
 * Supports optimistic updates with pending/failed status indicators.
 */

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@desperados/shared';
import type { ClientChatMessage } from '@/store/useChatStore';
import { formatRelativeTime, formatAbsoluteTime, getFactionBgClass, getUserInitials } from '@/utils/chat.utils';

interface MessageProps {
  message: ChatMessage | ClientChatMessage;
  isGrouped: boolean;
  currentUsername?: string;
  timestampFormat: 'relative' | 'absolute';
  onReport: (messageId: string) => void;
  onWhisper: (userId: string, username: string, faction?: string) => void;
  onRetry?: (clientId: string) => void;
}

export function Message({
  message,
  isGrouped,
  currentUsername,
  timestampFormat,
  onReport,
  onWhisper,
  onRetry,
}: MessageProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = message.senderName === currentUsername;

  // Check for optimistic update status
  const clientMessage = message as ClientChatMessage;
  const isPending = clientMessage._status === 'pending';
  const isFailed = clientMessage._status === 'failed';
  const clientId = clientMessage._clientId;
  const errorMessage = clientMessage._error;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setShowContextMenu(false);
  };

  const handleReportMessage = () => {
    onReport(message._id);
    setShowContextMenu(false);
  };

  const handleWhisperUser = () => {
    onWhisper(message.senderId, message.senderName);
    setShowContextMenu(false);
  };

  const highlightMentions = (content: string): React.ReactNode => {
    const parts = content.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        const isCurrentUser = username === currentUsername;

        return (
          <span
            key={index}
            className={`font-bold ${
              isCurrentUser ? 'bg-gold-light text-wood-dark px-1 rounded' : 'text-gold-medium'
            }`}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (message.type === 'system') {
    return (
      <div
        className="px-4 py-2 text-center text-sm text-wood-grain italic"
        role="status"
        aria-label={message.content}
      >
        {message.content}
      </div>
    );
  }

  // Handle retry for failed messages
  const handleRetry = () => {
    if (clientId && onRetry) {
      onRetry(clientId);
    }
  };

  return (
    <div
      className={`px-4 py-2 hover:bg-wood-darker hover:bg-opacity-10 transition-colors ${
        isGrouped ? 'pt-1' : 'pt-3'
      } ${isPending ? 'opacity-60' : ''} ${isFailed ? 'bg-blood-red/5' : ''}`}
      onContextMenu={handleContextMenu}
      role="article"
      aria-label={`Message from ${message.senderName}${isPending ? ', sending' : ''}${isFailed ? ', failed to send' : ''}`}
    >
      <div className="flex gap-3">
        {!isGrouped && (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getFactionBgClass(
              message.senderFaction
            )}`}
            aria-label={`${message.senderName}'s avatar`}
          >
            {getUserInitials(message.senderName)}
          </div>
        )}

        {isGrouped && <div className="w-10 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-bold text-sm"
                style={{ color: getFactionColor(message.senderFaction) }}
              >
                {message.senderName}
              </span>
              <span
                className="text-xs text-wood-grain"
                title={formatAbsoluteTime(message.createdAt)}
              >
                {timestampFormat === 'relative'
                  ? formatRelativeTime(message.createdAt)
                  : formatAbsoluteTime(message.createdAt)}
              </span>
              {message.edited && (
                <span className="text-xs text-wood-grain italic">(edited)</span>
              )}
            </div>
          )}

          <div className="text-sm text-wood-dark break-words whitespace-pre-wrap">
            {highlightMentions(message.content)}
          </div>

          {/* Optimistic update status indicators */}
          {isPending && (
            <div className="flex items-center gap-1 mt-1 text-xs text-wood-grain">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sending...</span>
            </div>
          )}

          {isFailed && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-blood-red">
                Failed to send{errorMessage ? `: ${errorMessage}` : ''}
              </span>
              {onRetry && clientId && (
                <button
                  onClick={handleRetry}
                  className="text-xs text-gold-medium hover:text-gold-light underline"
                  aria-label="Retry sending message"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showContextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-wood-dark rounded-lg shadow-wood overflow-hidden border border-wood-grain"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
          }}
          role="menu"
          aria-label="Message options"
        >
          <button
            className="w-full px-4 py-2 text-left text-sm text-western-text-light hover:bg-wood-medium transition-colors"
            onClick={handleCopyMessage}
            role="menuitem"
          >
            Copy Message
          </button>

          {!isOwnMessage && (
            <>
              <button
                className="w-full px-4 py-2 text-left text-sm text-western-text-light hover:bg-wood-medium transition-colors"
                onClick={handleWhisperUser}
                role="menuitem"
              >
                Send Whisper
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-blood-crimson hover:bg-wood-medium transition-colors"
                onClick={handleReportMessage}
                role="menuitem"
              >
                Report Message
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function getFactionColor(faction: 'settler' | 'nahi' | 'frontera'): string {
  const colors = {
    settler: '#8B4513',
    nahi: '#228B22',
    frontera: '#DC143C',
  };
  return colors[faction];
}
