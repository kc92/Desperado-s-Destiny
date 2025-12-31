/**
 * Online Users List Component
 *
 * Sidebar showing online users in the current room
 */

import { useState, useMemo } from 'react';
import type { OnlineUser } from '@desperados/shared';
import { getFactionBgClass, getUserInitials } from '@/utils/chat.utils';

interface OnlineUsersListProps {
  users: OnlineUser[];
  onWhisper: (userId: string, username: string, faction: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

type SortOption = 'online' | 'name' | 'level';

export function OnlineUsersList({
  users,
  onWhisper,
  isVisible,
  onToggle,
}: OnlineUsersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('online');

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.username.localeCompare(b.username));
        break;
      case 'level':
        filtered.sort((a, b) => b.level - a.level);
        break;
      case 'online':
      default:
        filtered.sort((a, b) => {
          if (a.isOnline === b.isOnline) {
            return a.username.localeCompare(b.username);
          }
          return a.isOnline ? -1 : 1;
        });
        break;
    }

    return filtered;
  }, [users, searchQuery, sortBy]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed bottom-24 right-4 w-12 h-12 bg-wood-dark text-western-text-light rounded-full shadow-wood flex items-center justify-center z-40"
        aria-label={isVisible ? 'Hide online users' : 'Show online users'}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative
          top-0 md:top-auto
          right-0 md:right-auto
          h-full md:h-auto
          w-64
          bg-desert-sand
          border-l border-wood-grain
          transition-transform duration-300
          z-30
          flex flex-col
          ${isVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          ${isVisible ? 'md:block' : 'md:hidden'}
        `}
        role="complementary"
        aria-label="Online users"
      >
        {/* Header */}
        <div className="p-4 border-b border-wood-grain bg-wood-dark">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-western-text-light font-semibold">
              Online Users ({users.length})
            </h3>
            <button
              onClick={onToggle}
              className="md:hidden text-western-text-light hover:text-gold-light transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Search */}
          <input
            id="online-users-search"
            name="searchUsers"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full px-3 py-2 bg-white border border-wood-grain rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-medium"
            aria-label="Search users"
          />

          {/* Sort Options */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setSortBy('online')}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                sortBy === 'online'
                  ? 'bg-gold-medium text-wood-dark'
                  : 'bg-wood-medium text-western-text-light'
              } transition-colors`}
              aria-pressed={sortBy === 'online'}
            >
              Online
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                sortBy === 'name'
                  ? 'bg-gold-medium text-wood-dark'
                  : 'bg-wood-medium text-western-text-light'
              } transition-colors`}
              aria-pressed={sortBy === 'name'}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('level')}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                sortBy === 'level'
                  ? 'bg-gold-medium text-wood-dark'
                  : 'bg-wood-medium text-western-text-light'
              } transition-colors`}
              aria-pressed={sortBy === 'level'}
            >
              Level
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {sortedAndFilteredUsers.length === 0 ? (
            <div className="p-4 text-center text-wood-grain">
              {searchQuery ? 'No users found' : 'No users online'}
            </div>
          ) : (
            <div className="divide-y divide-wood-grain">
              {sortedAndFilteredUsers.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => onWhisper(user.userId, user.username, user.faction)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-wood-darker hover:bg-opacity-10 transition-colors text-left"
                  aria-label={`Whisper ${user.username}`}
                >
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getFactionBgClass(
                        user.faction
                      )}`}
                    >
                      {getUserInitials(user.username)}
                    </div>
                    {user.isOnline && (
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                        aria-label="Online"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-wood-dark truncate">
                      {user.username}
                    </div>
                    <div className="text-xs text-wood-grain">
                      Level {user.level}
                      {user.gangName && ` • ${user.gangName}`}
                    </div>
                  </div>

                  <svg
                    className="w-4 h-4 text-wood-grain flex-shrink-0"
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
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isVisible && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
}
