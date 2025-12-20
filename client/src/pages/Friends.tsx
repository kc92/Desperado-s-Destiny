/**
 * Friends Page
 * Friend management with online status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFriendStore } from '@/store/useFriendStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '@/services/logger.service';

export const Friends: React.FC = () => {
  const {
    friends,
    requests,
    isLoading,
    error,
    fetchFriends,
    fetchRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    clearError
  } = useFriendStore();

  const { currentCharacter } = useCharacterStore();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [removeFriendConfirm, setRemoveFriendConfirm] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        await fetchFriends();
        await fetchRequests();
      } catch (error) {
        logger.error('[Friends] Failed to load friends', error as Error, { context: 'Friends.loadFriends' });
      }
    };

    loadFriends();

    const interval = setInterval(() => {
      fetchFriends().catch(err => logger.error('[Friends] Refresh failed', err as Error, { context: 'Friends.refreshInterval' }));
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchFriends, fetchRequests]);

  const handleSendRequest = async () => {
    if (!friendName) return;

    try {
      await sendRequest(friendName);
      setShowAddFriendModal(false);
      setFriendName('');
    } catch (err) {
      logger.error('Failed to send friend request', err as Error, { context: 'Friends.handleSendRequest', friendName });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
    } catch (err) {
      logger.error('Failed to accept request', err as Error, { context: 'Friends.handleAcceptRequest', requestId });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
    } catch (err) {
      logger.error('Failed to reject request', err as Error, { context: 'Friends.handleRejectRequest', requestId });
    }
  };

  const handleRemoveFriend = useCallback((friendId: string) => {
    setRemoveFriendConfirm(friendId);
  }, []);

  const confirmRemoveFriend = useCallback(async () => {
    if (!removeFriendConfirm) return;
    setIsRemoving(true);
    try {
      await removeFriend(removeFriendConfirm);
      setRemoveFriendConfirm(null);
    } catch (err) {
      logger.error('Failed to remove friend', err as Error, { context: 'Friends.confirmRemoveFriend', friendId: removeFriendConfirm });
    } finally {
      setIsRemoving(false);
    }
  }, [removeFriendConfirm, removeFriend]);

  if (!currentCharacter) {
    return <div className="p-6 text-center">Please select a character</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-brown-800 border-2 border-brown-600 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gold-400">Friends</h1>
          <Button onClick={() => setShowAddFriendModal(true)}>
            Add Friend
          </Button>
        </div>

        {error && (
          <div className="bg-red-800 text-white p-3 rounded mb-4">
            {error}
            <button onClick={clearError} className="ml-4 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded ${
              activeTab === 'friends'
                ? 'bg-gold-600 text-brown-900'
                : 'bg-brown-700 text-gray-300'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded ${
              activeTab === 'requests'
                ? 'bg-gold-600 text-brown-900'
                : 'bg-brown-700 text-gray-300'
            }`}
          >
            Requests ({requests.length})
          </button>
        </div>

        {isLoading ? (
          <div aria-busy="true" aria-live="polite">
            <ListItemSkeleton count={5} />
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === 'friends' && friends.length === 0 && (
              <EmptyState
                icon="🤝"
                title="Lone Rider"
                description="You're riding solo. Find allies in the Town Square to survive these harsh lands."
                actionText="Add Friend"
                onAction={() => setShowAddFriendModal(true)}
                size="md"
              />
            )}

            {activeTab === 'requests' && requests.length === 0 && (
              <EmptyState
                icon="🤝"
                title="No Pending Requests"
                description="No partner requests waiting. Your reputation must precede you!"
                size="sm"
              />
            )}

            {activeTab === 'friends' &&
              friends.map((friend) => (
                <div
                  key={friend._id}
                  className="p-4 rounded border bg-brown-900 border-brown-700 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        friend.online ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                      title={friend.online ? 'Online' : 'Offline'}
                    />
                    <div>
                      <div className="font-semibold text-gold-400">
                        {friend.friendName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {friend.online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRemoveFriend(friend._id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

            {activeTab === 'requests' &&
              requests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 rounded border bg-brown-900 border-gold-600 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-gold-400">
                      {request.requesterName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(request.requestedAt), {
                        addSuffix: true
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        title="Add Friend"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Character Name
            </label>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="w-full px-3 py-2 bg-brown-900 border border-brown-600 rounded"
              placeholder="Enter character name"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSendRequest} disabled={!friendName}>
              Send Request
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAddFriendModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={removeFriendConfirm !== null}
        title="Remove Friend"
        message="Are you sure you want to remove this friend? You can always add them back later."
        confirmText="Remove"
        cancelText="Keep Friend"
        confirmVariant="danger"
        onConfirm={confirmRemoveFriend}
        onCancel={() => setRemoveFriendConfirm(null)}
        isLoading={isRemoving}
        icon="🤝"
      />
    </div>
  );
};
