/**
 * Room Tabs Component
 *
 * Tab navigation for switching between different chat rooms
 */

import { useState, useRef, useEffect } from 'react';
import { RoomType, type WhisperConversation } from '@desperados/shared';

interface RoomTabsProps {
  activeRoom: { type: RoomType; id: string } | null;
  unreadCounts: Map<string, number>;
  whispers: Map<string, WhisperConversation>;
  userFaction: string;
  gangName: string | null;
  onSelectRoom: (type: RoomType, id: string) => void;
  onCloseWhisper: (userId: string) => void;
}

export function RoomTabs({
  activeRoom,
  unreadCounts,
  whispers,
  userFaction,
  gangName,
  onSelectRoom,
  onCloseWhisper,
}: RoomTabsProps) {
  const [showWhisperDropdown, setShowWhisperDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWhisperDropdown(false);
      }
    };

    if (showWhisperDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showWhisperDropdown]);

  const getRoomKey = (type: RoomType, id: string): string => `${type}-${id}`;

  const getUnreadCount = (type: RoomType, id: string): number => {
    return unreadCounts.get(getRoomKey(type, id)) || 0;
  };

  const isActiveRoom = (type: RoomType, id: string): boolean => {
    return activeRoom?.type === type && activeRoom?.id === id;
  };

  const totalWhisperUnread = Array.from(whispers.values()).reduce(
    (sum, w) => sum + w.unreadCount,
    0
  );

  const whisperArray = Array.from(whispers.values()).sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );

  const tabs = [
    {
      type: RoomType.GLOBAL,
      id: 'global',
      label: 'Global',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      disabled: false,
      tooltip: 'Chat with all players',
    },
    {
      type: RoomType.FACTION,
      id: userFaction.toLowerCase(),
      label: userFaction.charAt(0).toUpperCase() + userFaction.slice(1),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
      ),
      disabled: false,
      tooltip: `Chat with your ${userFaction} faction`,
    },
    {
      type: RoomType.GANG,
      id: gangName || 'none',
      label: gangName || 'No Gang',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      disabled: !gangName,
      tooltip: gangName ? `Chat with your gang: ${gangName}` : 'Join a gang to access gang chat',
    },
  ];

  return (
    <div className="border-b border-wood-grain bg-wood-dark">
      <div className="flex items-center">
        {/* Main Tabs */}
        <div className="flex-1 flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const unread = getUnreadCount(tab.type, tab.id);
            const isActive = isActiveRoom(tab.type, tab.id);

            return (
              <button
                key={`${tab.type}-${tab.id}`}
                onClick={() => !tab.disabled && onSelectRoom(tab.type, tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors relative
                  ${
                    isActive
                      ? 'border-gold-medium text-gold-light bg-wood-darker bg-opacity-30'
                      : 'border-transparent text-western-text-light hover:bg-wood-darker hover:bg-opacity-20'
                  }
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={tab.tooltip}
                aria-label={tab.label}
                aria-selected={isActive}
                role="tab"
              >
                {tab.icon}
                <span className="text-sm font-semibold whitespace-nowrap">{tab.label}</span>
                {unread > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-blood-crimson text-white text-xs font-bold rounded-full flex items-center justify-center"
                    aria-label={`${unread} unread messages`}
                  >
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Whispers Tab with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowWhisperDropdown(!showWhisperDropdown)}
            className={`
              flex items-center gap-2 px-4 py-3 border-b-2 transition-colors relative
              ${
                activeRoom?.type === RoomType.WHISPER
                  ? 'border-gold-medium text-gold-light bg-wood-darker bg-opacity-30'
                  : 'border-transparent text-western-text-light hover:bg-wood-darker hover:bg-opacity-20'
              }
            `}
            aria-label="Whispers"
            aria-expanded={showWhisperDropdown}
            aria-haspopup="true"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-semibold whitespace-nowrap">
              Whispers ({whisperArray.length})
            </span>
            {totalWhisperUnread > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-blood-crimson text-white text-xs font-bold rounded-full flex items-center justify-center"
                aria-label={`${totalWhisperUnread} unread whispers`}
              >
                {totalWhisperUnread > 99 ? '99+' : totalWhisperUnread}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${
                showWhisperDropdown ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Whisper Dropdown */}
          {showWhisperDropdown && (
            <div
              className="absolute top-full right-0 mt-1 w-80 bg-wood-dark rounded-lg shadow-wood border border-wood-grain overflow-hidden z-50"
              role="menu"
              aria-label="Whisper conversations"
            >
              {whisperArray.length === 0 ? (
                <div className="px-4 py-8 text-center text-western-text-light">
                  <p className="text-sm">No whisper conversations yet</p>
                  <p className="text-xs text-wood-grain mt-1">
                    Click on a user to start a whisper
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {whisperArray.map((whisper) => (
                    <div
                      key={whisper.userId}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-wood-grain hover:bg-wood-medium transition-colors ${
                        isActiveRoom(RoomType.WHISPER, whisper.userId) ? 'bg-wood-medium' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectRoom(RoomType.WHISPER, whisper.userId);
                          setShowWhisperDropdown(false);
                        }}
                        className="flex-1 flex items-center gap-3 min-w-0"
                        role="menuitem"
                      >
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              whisper.faction === 'settler'
                                ? 'bg-faction-settler'
                                : whisper.faction === 'nahi'
                                ? 'bg-faction-nahi'
                                : 'bg-faction-frontera'
                            }`}
                          >
                            {whisper.username[0].toUpperCase()}
                          </div>
                          {whisper.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-wood-dark rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-semibold text-sm text-western-text-light">
                            {whisper.username}
                          </div>
                          {whisper.lastMessage && (
                            <div className="text-xs text-wood-grain truncate">
                              {whisper.lastMessage.content}
                            </div>
                          )}
                        </div>

                        {whisper.unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-blood-crimson text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {whisper.unreadCount > 99 ? '99+' : whisper.unreadCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseWhisper(whisper.userId);
                        }}
                        className="flex-shrink-0 p-1 text-wood-grain hover:text-blood-crimson transition-colors"
                        aria-label={`Close whisper with ${whisper.username}`}
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
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
