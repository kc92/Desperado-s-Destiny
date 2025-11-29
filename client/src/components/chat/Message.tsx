/**
 * Message Component
 *
 * Displays individual chat messages with faction styling and context menu
 */

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@desperados/shared';
import { formatRelativeTime, formatAbsoluteTime, getFactionBgClass, getUserInitials } from '@/utils/chat.utils';

interface MessageProps {
  message: ChatMessage;
  isGrouped: boolean;
  currentUsername?: string;
  timestampFormat: 'relative' | 'absolute';
  onReport: (messageId: string) => void;
  onWhisper: (userId: string, username: string, faction?: string) => void;
}

export function Message({
  message,
  isGrouped,
  currentUsername,
  timestampFormat,
  onReport,
  onWhisper,
}: MessageProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = message.senderName === currentUsername;

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

  return (
    <div
      className={`px-4 py-2 hover:bg-wood-darker hover:bg-opacity-10 transition-colors ${
        isGrouped ? 'pt-1' : 'pt-3'
      }`}
      onContextMenu={handleContextMenu}
      role="article"
      aria-label={`Message from ${message.senderName}`}
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
