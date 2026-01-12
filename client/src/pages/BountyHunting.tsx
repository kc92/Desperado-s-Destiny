/**
 * BountyHunting Page
 * Main page for bounty hunting system
 * Phase 3: Missing Frontend Pages
 */

import { useEffect, useState } from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import {
  BountyBoard,
  WantedLevelDisplay,
  MostWantedList,
  PlaceBountyModal,
  BountyHunterAlert,
} from '@/components/bounty';
import { useBountyStore } from '@/store/useBountyStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';

type TabView = 'board' | 'most-wanted';

export function BountyHunting() {
  // Store state
  const {
    bounty,
    isLoading,
    error,
    fetchBounties,
    claimBounty,
    postBounty,
    loadBountyStatus,
  } = useBountyStore();

  const { currentCharacter } = useCharacterStore();
  const toast = useToast();

  // Local UI state
  const [activeTab, setActiveTab] = useState<TabView>('board');
  const [showPlaceBountyModal, setShowPlaceBountyModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadBountyStatus();
  }, [loadBountyStatus]);

  // Handle claiming a bounty
  const handleClaimBounty = async (bountyId: string) => {
    try {
      const result = await claimBounty(bountyId);
      toast.success('Bounty Claimed!', `You earned $${result.reward}!`);
    } catch (err: any) {
      toast.error('Failed to Claim', err.message || 'Could not claim bounty');
    }
  };

  // Handle placing a bounty
  const handlePlaceBounty = async (targetName: string, amount: number, reason?: string) => {
    try {
      // Note: The service expects targetId, but we have targetName
      // In a real implementation, you'd need to search for the player first
      // For now, we'll pass the name as the ID (backend would need to handle this)
      await postBounty(targetName, amount, reason);
      toast.success('Bounty Posted!', `$${amount} bounty placed on ${targetName}`);
      setShowPlaceBountyModal(false);
    } catch (err: any) {
      throw err; // Let the modal handle the error
    }
  };

  // Calculate player's gold
  const playerGold = currentCharacter?.dollars || 0;
  const characterId = currentCharacter?._id;

  // Loading state
  if (isLoading && !bounty.bountyBoard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Bounty Hunting</h1>
        <p className="text-gray-400">
          Hunt wanted criminals for gold rewards, or watch your back if you've made enemies.
        </p>
      </div>

      {/* Bounty Hunter Alert */}
      {bounty.hunterCheck?.shouldSpawn && (
        <div className="mb-6">
          <BountyHunterAlert hunterCheck={bounty.hunterCheck} />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'board' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('board')}
            >
              Bounty Board
            </Button>
            <Button
              variant={activeTab === 'most-wanted' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('most-wanted')}
            >
              Most Wanted
            </Button>
            <div className="flex-1" />
            <Button
              variant="secondary"
              onClick={() => setShowPlaceBountyModal(true)}
            >
              + Post Bounty
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'board' && (
            <BountyBoard
              bounties={bounty.activeBounties}
              totalBounties={bounty.bountyBoard?.totalBounties || 0}
              totalRewards={bounty.bountyBoard?.totalRewards || 0}
              isLoading={isLoading}
              onRefresh={() => fetchBounties()}
              onClaimBounty={handleClaimBounty}
              currentCharacterId={characterId}
            />
          )}

          {activeTab === 'most-wanted' && (
            <MostWantedList
              entries={bounty.mostWanted}
              isLoading={isLoading}
              currentCharacterId={characterId}
              onSelectTarget={(id) => {
                // Could navigate to their profile or show more details
                toast.info('Target Selected', `Tracking outlaw ${id}`);
              }}
            />
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Your Wanted Status */}
          <WantedLevelDisplay
            wantedLevel={bounty.myBounty}
            isLoading={isLoading}
          />

          {/* Quick Stats */}
          <Card className="p-4">
            <h3 className="font-bold text-gray-300 mb-3">Your Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Bounties Collected</span>
                <span className="text-green-400">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Earned</span>
                <span className="text-green-400">$0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bounties Posted</span>
                <span className="text-amber-400">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Times Caught</span>
                <span className="text-red-400">0</span>
              </div>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="p-4 bg-gray-800/30">
            <h3 className="font-bold text-gray-300 mb-2">How It Works</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex gap-2">
                <span>🎯</span>
                <span>Hunt wanted players for gold rewards</span>
              </li>
              <li className="flex gap-2">
                <span>💰</span>
                <span>Post bounties on your enemies</span>
              </li>
              <li className="flex gap-2">
                <span>⭐</span>
                <span>Committing crimes raises your wanted level</span>
              </li>
              <li className="flex gap-2">
                <span>🤠</span>
                <span>High bounty attracts NPC hunters</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Place Bounty Modal */}
      <PlaceBountyModal
        isOpen={showPlaceBountyModal}
        onClose={() => setShowPlaceBountyModal(false)}
        onSubmit={handlePlaceBounty}
        isLoading={isLoading}
        playerGold={playerGold}
        minBounty={100}
      />
    </div>
  );
}

export default BountyHunting;
