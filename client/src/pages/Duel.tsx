/**
 * Duel Page
 * PvP duel interface for challenging and fighting other players
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui';
import { CardHand } from '@/components/game/CardHand';
import { HandEvaluation } from '@/components/game/HandEvaluation';
import api from '@/services/api';

interface DuelOpponent {
  characterId: string;
  name: string;
  level: number;
  faction: string;
  wins: number;
  losses: number;
}

interface DuelRequest {
  _id: string;
  challenger: { characterId: string; name: string };
  challenged: { characterId: string; name: string };
  status: string;
  createdAt: string;
}

interface ActiveDuel {
  _id: string;
  challenger: { characterId: string; name: string; hp: number; maxHp: number };
  challenged: { characterId: string; name: string; hp: number; maxHp: number };
  currentTurn: string;
  round: number;
  status: string;
}

export const Duel: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const [opponents, setOpponents] = useState<DuelOpponent[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DuelRequest[]>([]);
  const [activeDuel, setActiveDuel] = useState<ActiveDuel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOpponent, setSelectedOpponent] = useState<DuelOpponent | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [duelResult, setDuelResult] = useState<any>(null);

  // Load opponents and pending requests
  useEffect(() => {
    if (currentCharacter) {
      loadDuelData();
    }
  }, [currentCharacter]);

  const loadDuelData = async () => {
    setIsLoading(true);
    try {
      const [opponentsRes, requestsRes, activeRes] = await Promise.all([
        api.get('/duels/opponents'),
        api.get('/duels/requests'),
        api.get('/duels/active')
      ]);

      setOpponents(opponentsRes.data.data || []);
      setPendingRequests(requestsRes.data.data || []);
      setActiveDuel(activeRes.data.data || null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load duel data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallenge = async () => {
    if (!selectedOpponent) return;

    try {
      await api.post('/duels/challenge', {
        targetCharacterId: selectedOpponent.characterId
      });
      setShowChallengeModal(false);
      setSelectedOpponent(null);
      loadDuelData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send challenge');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const response = await api.post(`/duels/${requestId}/accept`);
      setActiveDuel(response.data.data);
      loadDuelData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept challenge');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await api.post(`/duels/${requestId}/decline`);
      loadDuelData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to decline challenge');
    }
  };

  const handleAttack = async () => {
    if (!activeDuel) return;

    try {
      const response = await api.post(`/duels/${activeDuel._id}/attack`);
      const result = response.data.data;

      if (result.status === 'completed') {
        setDuelResult(result);
        setShowResultModal(true);
        setActiveDuel(null);
      } else {
        setActiveDuel(result.duel);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to attack');
    }
  };

  const handleFlee = async () => {
    if (!activeDuel) return;

    try {
      await api.post(`/duels/${activeDuel._id}/flee`);
      setActiveDuel(null);
      loadDuelData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to flee');
    }
  };

  if (!currentCharacter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-western text-wood-dark mb-4">No Character Selected</h2>
          <p className="text-wood-medium">Please select a character to duel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-western text-wood-dark mb-2">Dueling Arena</h1>
        <p className="text-wood-medium">Challenge other gunslingers to prove your worth</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-blood-red/20 border-2 border-blood-red rounded-lg">
          <p className="text-blood-red font-semibold">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Active Duel */}
          {activeDuel && (
            <div className="mb-8 parchment p-6">
              <h2 className="text-2xl font-western text-wood-dark mb-4">Active Duel</h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Your Stats */}
                <div className="text-center">
                  <h3 className="font-bold text-lg">{activeDuel.challenger.name}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div
                      className="bg-green-600 h-4 rounded-full transition-all"
                      style={{ width: `${(activeDuel.challenger.hp / activeDuel.challenger.maxHp) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm mt-1">{activeDuel.challenger.hp} / {activeDuel.challenger.maxHp}</p>
                </div>

                {/* VS */}
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-western text-blood-red">VS</span>
                </div>

                {/* Opponent Stats */}
                <div className="text-center">
                  <h3 className="font-bold text-lg">{activeDuel.challenged.name}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div
                      className="bg-red-600 h-4 rounded-full transition-all"
                      style={{ width: `${(activeDuel.challenged.hp / activeDuel.challenged.maxHp) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm mt-1">{activeDuel.challenged.hp} / {activeDuel.challenged.maxHp}</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-wood-medium">Round {activeDuel.round}</p>
                <p className="font-bold">
                  {activeDuel.currentTurn === currentCharacter._id
                    ? "Your Turn!"
                    : "Opponent's Turn..."}
                </p>
              </div>

              {activeDuel.currentTurn === currentCharacter._id && (
                <div className="flex gap-4 justify-center">
                  <Button variant="secondary" onClick={handleAttack}>
                    Attack
                  </Button>
                  {activeDuel.round <= 3 && (
                    <Button variant="ghost" onClick={handleFlee}>
                      Flee
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pending Challenges */}
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-western text-wood-dark mb-4">Pending Challenges</h2>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="parchment p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{request.challenger.name}</p>
                      <p className="text-sm text-wood-medium">
                        Challenged you {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleAccept(request._id)}>
                        Accept
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDecline(request._id)}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Opponents */}
          <div>
            <h2 className="text-2xl font-western text-wood-dark mb-4">Available Opponents</h2>

            {opponents.length === 0 ? (
              <div className="text-center py-8 parchment">
                <p className="text-wood-medium">No opponents available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opponents.map((opponent) => (
                  <div key={opponent.characterId} className="parchment p-4">
                    <h3 className="font-bold text-lg mb-2">{opponent.name}</h3>
                    <div className="space-y-1 text-sm mb-4">
                      <p>Level: <span className="font-bold">{opponent.level}</span></p>
                      <p>Faction: <span className="font-bold">{opponent.faction}</span></p>
                      <p>Record: <span className="text-green-600">{opponent.wins}W</span> / <span className="text-red-600">{opponent.losses}L</span></p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setSelectedOpponent(opponent);
                        setShowChallengeModal(true);
                      }}
                      disabled={!!activeDuel}
                    >
                      Challenge
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Challenge Confirmation Modal */}
      <Modal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        title="Challenge to Duel"
        size="md"
      >
        {selectedOpponent && (
          <div className="space-y-4">
            <p>Challenge <strong>{selectedOpponent.name}</strong> to a duel?</p>
            <div className="parchment p-4">
              <p>Level: {selectedOpponent.level}</p>
              <p>Faction: {selectedOpponent.faction}</p>
              <p>Win Rate: {selectedOpponent.wins + selectedOpponent.losses > 0
                ? Math.round((selectedOpponent.wins / (selectedOpponent.wins + selectedOpponent.losses)) * 100)
                : 0}%</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowChallengeModal(false)}>
                Cancel
              </Button>
              <Button variant="secondary" fullWidth onClick={handleChallenge}>
                Send Challenge
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setDuelResult(null);
          loadDuelData();
        }}
        title={duelResult?.winner === currentCharacter._id ? 'Victory!' : 'Defeat'}
        size="md"
      >
        {duelResult && (
          <div className="space-y-4 text-center">
            <p className={`text-2xl font-western ${duelResult.winner === currentCharacter._id ? 'text-green-600' : 'text-red-600'}`}>
              {duelResult.winner === currentCharacter._id ? 'You Won!' : 'You Lost'}
            </p>
            {duelResult.rewards && (
              <div className="parchment p-4">
                <p>Rewards: +{duelResult.rewards.xp} XP, +{duelResult.rewards.gold} Gold</p>
              </div>
            )}
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowResultModal(false);
                setDuelResult(null);
                loadDuelData();
              }}
            >
              Continue
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Duel;
