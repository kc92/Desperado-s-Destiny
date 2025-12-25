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
import { StateView } from '@/components/ui/StateView';
import { TabNavigation } from '@/components/ui/TabNavigation';
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
    removeFriend
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
      <div className="bg-wood-dark border-2 border-wood-grain rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gold-light">Friends</h1>
          <Button onClick={() => setShowAddFriendModal(true)}>
            Add Friend
          </Button>
        </div>

        <TabNavigation
          tabs={[
            { id: 'friends', label: 'Friends', count: friends.length },
            { id: 'requests', label: 'Requests', count: requests.length }
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as 'friends' | 'requests')}
          className="mb-6"
        />

        {activeTab === 'friends' && (
          <StateView
            isLoading={isLoading}
            loadingComponent={
              <div aria-busy="true" aria-live="polite">
                <ListItemSkeleton count={5} />
              </div>
            }
            error={error}
            onRetry={() => fetchFriends()}
            isEmpty={friends.length === 0}
            emptyProps={{
              icon: '🤝',
              title: 'Lone Rider',
              description: "You're riding solo. Find allies in the Town Square to survive these harsh lands.",
              actionText: 'Add Friend',
              onAction: () => setShowAddFriendModal(true)
            }}
            size="md"
          >
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="p-4 rounded border bg-wood-darker border-wood-medium flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        friend.online ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                      title={friend.online ? 'Online' : 'Offline'}
                    />
                    <div>
                      <div className="font-semibold text-gold-light">
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
            </div>
          </StateView>
        )}

        {activeTab === 'requests' && (
          <StateView
            isLoading={isLoading}
            loadingComponent={
              <div aria-busy="true" aria-live="polite">
                <ListItemSkeleton count={5} />
              </div>
            }
            error={error}
            onRetry={() => fetchRequests()}
            isEmpty={requests.length === 0}
            emptyProps={{
              icon: '🤝',
              title: 'No Pending Requests',
              description: 'No partner requests waiting. Your reputation must precede you!'
            }}
            size="sm"
          >
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 rounded border bg-wood-darker border-gold-medium flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-gold-light">
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
          </StateView>
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
              className="w-full px-3 py-2 bg-wood-darker border border-wood-grain rounded"
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
