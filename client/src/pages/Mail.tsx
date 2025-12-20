/**
 * Mail Page
 * Player-to-player mail system with gold attachments
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useMailStore } from '@/store/useMailStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Mail as MailType } from '@desperados/shared';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '@/services/logger.service';
import { profileService, CharacterSearchResult } from '@/services/profile.service';

export const Mail: React.FC = () => {
  const {
    inbox,
    sent,
    unreadCount,
    isLoading,
    error,
    fetchInbox,
    fetchSent,
    sendMail,
    claimAttachment,
    deleteMail,
    clearError
  } = useMailStore();

  const { currentCharacter } = useCharacterStore();

  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMail, setSelectedMail] = useState<MailType | null>(null);

  const [recipientName, setRecipientName] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [goldAttachment, setGoldAttachment] = useState(0);
  const [searchResults, setSearchResults] = useState<CharacterSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [deleteMailConfirm, setDeleteMailConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [goldClaimedMessage, setGoldClaimedMessage] = useState<number | null>(null);

  useEffect(() => {
    const loadMail = async () => {
      try {
        await fetchInbox();
        await fetchSent();
      } catch (error) {
        logger.error('Failed to load mail', error as Error, { context: 'Mail' });
      }
    };
    loadMail();
  }, [fetchInbox, fetchSent]);

  // Debounced character search
  const searchCharacters = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await profileService.searchCharacters(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      logger.error('Failed to search characters', error as Error, { context: 'Mail' });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle recipient input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipientName && !recipientId) {
        searchCharacters(recipientName);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [recipientName, recipientId, searchCharacters]);

  const handleRecipientSelect = (character: CharacterSearchResult) => {
    setRecipientName(character.name);
    setRecipientId(character._id);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleRecipientInputChange = (value: string) => {
    setRecipientName(value);
    setRecipientId(''); // Clear ID when user types (need to select from dropdown)
  };

  const handleComposeMail = async () => {
    if (!recipientId || !subject || !body) {
      return;
    }

    // Validate gold attachment
    const validGold = Math.max(0, Math.min(goldAttachment, currentCharacter?.gold || 0));

    try {
      await sendMail({
        recipientId: recipientId,
        subject,
        body,
        goldAttachment: validGold > 0 ? validGold : undefined
      });

      setShowComposeModal(false);
      setRecipientName('');
      setRecipientId('');
      setSubject('');
      setBody('');
      setGoldAttachment(0);
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (err) {
      logger.error('Failed to send mail', err as Error, { context: 'Mail' });
    }
  };

  const handleClaimAttachment = useCallback(async (mailId: string) => {
    try {
      const goldClaimed = await claimAttachment(mailId);
      setGoldClaimedMessage(goldClaimed);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setGoldClaimedMessage(null), 3000);

      if (selectedMail?._id === mailId) {
        const updatedMail = inbox.find(m => m._id === mailId);
        if (updatedMail) {
          setSelectedMail(updatedMail);
        }
      }
    } catch (err) {
      logger.error('Failed to claim attachment', err as Error, { context: 'Mail' });
    }
  }, [claimAttachment, selectedMail, inbox]);

  const handleDeleteMail = useCallback((mailId: string) => {
    setDeleteMailConfirm(mailId);
  }, []);

  const confirmDeleteMail = useCallback(async () => {
    if (!deleteMailConfirm) return;
    setIsDeleting(true);
    try {
      await deleteMail(deleteMailConfirm);
      setShowDetailModal(false);
      setSelectedMail(null);
      setDeleteMailConfirm(null);
    } catch (err) {
      logger.error('Failed to delete mail', err as Error, { context: 'Mail' });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteMailConfirm, deleteMail]);

  const openMailDetail = (mail: MailType) => {
    setSelectedMail(mail);
    setShowDetailModal(true);
  };

  if (!currentCharacter) {
    return <div className="p-6 text-center">Please select a character</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-brown-800 border-2 border-brown-600 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gold-400">Mail</h1>
          <Button onClick={() => setShowComposeModal(true)}>
            Compose Mail
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
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded ${
              activeTab === 'inbox'
                ? 'bg-gold-600 text-brown-900'
                : 'bg-brown-700 text-gray-300'
            }`}
          >
            Inbox ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded ${
              activeTab === 'sent'
                ? 'bg-gold-600 text-brown-900'
                : 'bg-brown-700 text-gray-300'
            }`}
          >
            Sent
          </button>
        </div>

        {isLoading ? (
          <div aria-busy="true" aria-live="polite">
            <ListItemSkeleton count={5} />
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === 'inbox' && inbox.length === 0 && (
              <EmptyState
                icon="📬"
                title="No Telegrams"
                description="Your mailbox is empty, partner. Messages from other outlaws will appear here."
                actionText="Compose Mail"
                onAction={() => setShowComposeModal(true)}
                size="md"
              />
            )}

            {activeTab === 'sent' && sent.length === 0 && (
              <EmptyState
                icon="📬"
                title="No Sent Telegrams"
                description="You haven't sent any messages yet. Reach out to your fellow outlaws!"
                actionText="Compose Mail"
                onAction={() => setShowComposeModal(true)}
                size="sm"
              />
            )}

            {activeTab === 'inbox' &&
              inbox.map((mail) => (
                <div
                  key={mail._id}
                  onClick={() => openMailDetail(mail)}
                  className={`p-4 rounded border cursor-pointer hover:bg-brown-700 ${
                    mail.isRead
                      ? 'bg-brown-900 border-brown-700'
                      : 'bg-brown-800 border-gold-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gold-400">
                          {mail.senderName}
                        </span>
                        {mail.goldAttachment > 0 && !mail.goldClaimed && (
                          <span className="bg-gold-600 text-brown-900 px-2 py-0.5 rounded text-sm">
                            {mail.goldAttachment} gold
                          </span>
                        )}
                        {!mail.isRead && (
                          <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {mail.subject}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(mail.sentAt), {
                        addSuffix: true
                      })}
                    </div>
                  </div>
                </div>
              ))}

            {activeTab === 'sent' &&
              sent.map((mail) => (
                <div
                  key={mail._id}
                  onClick={() => openMailDetail(mail)}
                  className="p-4 rounded border bg-brown-900 border-brown-700 cursor-pointer hover:bg-brown-800"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gold-400">
                          To: {mail.recipientName}
                        </span>
                        {mail.goldAttachment > 0 && (
                          <span className="bg-gold-600 text-brown-900 px-2 py-0.5 rounded text-sm">
                            {mail.goldAttachment} gold
                            {mail.goldClaimed && ' (claimed)'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {mail.subject}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(mail.sentAt), {
                        addSuffix: true
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        title="Compose Mail"
      >
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Recipient Character Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => handleRecipientInputChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-full px-3 py-2 bg-brown-900 border border-brown-600 rounded"
              placeholder="Type to search characters..."
            />
            {isSearching && (
              <div className="absolute right-3 top-9 text-gray-400 text-sm">
                Searching...
              </div>
            )}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-brown-800 border border-brown-600 rounded shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((char) => (
                  <button
                    key={char._id}
                    type="button"
                    onClick={() => handleRecipientSelect(char)}
                    className="w-full px-3 py-2 text-left hover:bg-brown-700 flex justify-between items-center"
                  >
                    <span className="text-gold-400">{char.name}</span>
                    <span className="text-sm text-gray-400">
                      Lvl {char.level} {char.faction}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {showSearchResults && searchResults.length === 0 && recipientName.length >= 2 && !isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-brown-800 border border-brown-600 rounded shadow-lg p-3 text-gray-400">
                No characters found
              </div>
            )}
            {recipientId && (
              <p className="text-sm text-green-400 mt-1">
                Selected: {recipientName}
              </p>
            )}
            {!recipientId && recipientName && (
              <p className="text-sm text-yellow-400 mt-1">
                Please select a character from the dropdown
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Subject (max 100 chars)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 bg-brown-900 border border-brown-600 rounded"
              placeholder="Subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Message (max 2000 chars)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              rows={6}
              className="w-full px-3 py-2 bg-brown-900 border border-brown-600 rounded"
              placeholder="Your message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Gold Attachment (optional)
            </label>
            <input
              type="number"
              value={goldAttachment}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                // Prevent negative values and values exceeding available gold
                setGoldAttachment(Math.max(0, Math.min(value, currentCharacter.gold)));
              }}
              min={0}
              max={currentCharacter.gold}
              className="w-full px-3 py-2 bg-brown-900 border border-brown-600 rounded"
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your gold: {currentCharacter.gold}
            </p>
            {goldAttachment > currentCharacter.gold && (
              <p className="text-sm text-red-400 mt-1">
                Cannot exceed available gold
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleComposeMail} disabled={!recipientId || !subject || !body}>
              Send Mail
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowComposeModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedMail?.subject || ''}
      >
        {selectedMail && (
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">From:</span>{' '}
              <span className="text-gold-400">{selectedMail.senderName}</span>
            </div>

            <div className="bg-brown-900 p-4 rounded border border-brown-600">
              <p className="whitespace-pre-wrap">{selectedMail.body}</p>
            </div>

            {selectedMail.goldAttachment > 0 && !selectedMail.goldClaimed && (
              <div className="bg-gold-900 border border-gold-600 p-4 rounded">
                <p className="mb-2">
                  This mail has {selectedMail.goldAttachment} gold attached.
                </p>
                <Button onClick={() => handleClaimAttachment(selectedMail._id)}>
                  Claim {selectedMail.goldAttachment} Gold
                </Button>
              </div>
            )}

            {selectedMail.goldAttachment > 0 && selectedMail.goldClaimed && (
              <div className="bg-brown-900 border border-brown-600 p-4 rounded">
                <p className="text-gray-400">
                  Gold attachment ({selectedMail.goldAttachment}) already claimed.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleDeleteMail(selectedMail._id)}
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteMailConfirm !== null}
        title="Delete Mail"
        message="Are you sure you want to delete this mail? This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep"
        confirmVariant="danger"
        onConfirm={confirmDeleteMail}
        onCancel={() => setDeleteMailConfirm(null)}
        isLoading={isDeleting}
        icon="📧"
      />

      {/* Gold Claimed Toast */}
      {goldClaimedMessage !== null && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-gold-600 text-brown-900 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <div className="font-bold">Gold Claimed!</div>
              <div className="text-sm">You received {goldClaimedMessage} gold</div>
            </div>
            <button
              onClick={() => setGoldClaimedMessage(null)}
              className="ml-4 text-brown-700 hover:text-brown-900"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
