/**
 * Tournament Page
 * Tournament bracket visualization and registration
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui';
import api from '@/services/api';

interface Tournament {
  _id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed';
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  startTime: string;
  endTime?: string;
  bracket: BracketMatch[];
  winner?: { characterId: string; name: string };
}

interface BracketMatch {
  matchId: string;
  round: number;
  position: number;
  player1?: { characterId: string; name: string; score?: number };
  player2?: { characterId: string; name: string; score?: number };
  winner?: string;
  status: 'pending' | 'active' | 'completed';
}

export const Tournament: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tournaments');
      setTournaments(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedTournament || !currentCharacter) return;

    try {
      await api.post(`/tournaments/${selectedTournament._id}/register`);
      setShowRegisterModal(false);
      loadTournaments();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    }
  };

  const filteredTournaments = tournaments.filter(t =>
    filter === 'all' || t.status === filter
  );

  const renderBracket = (tournament: Tournament) => {
    if (!tournament.bracket || tournament.bracket.length === 0) {
      return <p className="text-wood-medium text-center py-4">Bracket not yet generated</p>;
    }

    const rounds = Math.max(...tournament.bracket.map(m => m.round));
    const matchesByRound: Record<number, BracketMatch[]> = {};

    for (let i = 1; i <= rounds; i++) {
      matchesByRound[i] = tournament.bracket
        .filter(m => m.round === i)
        .sort((a, b) => a.position - b.position);
    }

    return (
      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-max p-4">
          {Object.entries(matchesByRound).map(([round, matches]) => (
            <div key={round} className="flex flex-col gap-4">
              <h4 className="text-center font-bold text-sm">
                {parseInt(round) === rounds ? 'Finals' :
                 parseInt(round) === rounds - 1 ? 'Semi-Finals' :
                 `Round ${round}`}
              </h4>
              <div className="flex flex-col gap-8 justify-around h-full">
                {matches.map((match) => (
                  <div
                    key={match.matchId}
                    className={`
                      border-2 rounded p-2 w-48
                      ${match.status === 'active' ? 'border-gold-dark bg-gold-light/20' :
                        match.status === 'completed' ? 'border-wood-medium' : 'border-gray-300'}
                    `}
                  >
                    <div className={`p-1 text-sm ${match.winner === match.player1?.characterId ? 'font-bold text-green-600' : ''}`}>
                      {match.player1?.name || 'TBD'}
                      {match.player1?.score !== undefined && ` (${match.player1.score})`}
                    </div>
                    <div className="border-t border-gray-300 my-1" />
                    <div className={`p-1 text-sm ${match.winner === match.player2?.characterId ? 'font-bold text-green-600' : ''}`}>
                      {match.player2?.name || 'TBD'}
                      {match.player2?.score !== undefined && ` (${match.player2.score})`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!currentCharacter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-western text-wood-dark mb-4">No Character Selected</h2>
          <p className="text-wood-medium">Please select a character to view tournaments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-western text-wood-dark mb-2">Tournaments</h1>
        <p className="text-wood-medium">Compete for glory and prizes</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-blood-red/20 border-2 border-blood-red rounded-lg">
          <p className="text-blood-red font-semibold">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['all', 'upcoming', 'active', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && filteredTournaments.length === 0 && (
        <div className="text-center py-12 parchment">
          <p className="text-wood-medium">No tournaments found.</p>
        </div>
      )}

      {!isLoading && filteredTournaments.length > 0 && (
        <div className="space-y-6">
          {filteredTournaments.map((tournament) => (
            <div key={tournament._id} className="parchment p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-western text-wood-dark">{tournament.name}</h3>
                  <p className="text-wood-medium text-sm">{tournament.description}</p>
                </div>
                <span className={`
                  px-3 py-1 rounded text-sm font-bold
                  ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    tournament.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}
                `}>
                  {tournament.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-wood-medium">Entry Fee:</span>
                  <p className="font-bold text-gold-dark">{tournament.entryFee} Gold</p>
                </div>
                <div>
                  <span className="text-wood-medium">Prize Pool:</span>
                  <p className="font-bold text-gold-dark">{tournament.prizePool} Gold</p>
                </div>
                <div>
                  <span className="text-wood-medium">Participants:</span>
                  <p className="font-bold">{tournament.currentParticipants}/{tournament.maxParticipants}</p>
                </div>
                <div>
                  <span className="text-wood-medium">Start:</span>
                  <p className="font-bold">{new Date(tournament.startTime).toLocaleDateString()}</p>
                </div>
              </div>

              {tournament.winner && (
                <div className="mb-4 p-3 bg-gold-light/30 rounded border border-gold-dark">
                  <span className="text-wood-medium">Winner: </span>
                  <span className="font-bold text-gold-dark">{tournament.winner.name}</span>
                </div>
              )}

              {tournament.status === 'upcoming' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedTournament(tournament);
                    setShowRegisterModal(true);
                  }}
                  disabled={tournament.currentParticipants >= tournament.maxParticipants}
                >
                  {tournament.currentParticipants >= tournament.maxParticipants ? 'Full' : 'Register'}
                </Button>
              )}

              {(tournament.status === 'active' || tournament.status === 'completed') && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Bracket</h4>
                  {renderBracket(tournament)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register for Tournament"
        size="md"
      >
        {selectedTournament && (
          <div className="space-y-4">
            <p>Register for <strong>{selectedTournament.name}</strong>?</p>
            <div className="parchment p-4 space-y-2">
              <p>Entry Fee: <span className="font-bold text-gold-dark">{selectedTournament.entryFee} Gold</span></p>
              <p>Prize Pool: <span className="font-bold text-gold-dark">{selectedTournament.prizePool} Gold</span></p>
              <p>Your Dollars: <span className="font-bold">{currentCharacter.gold}</span></p>
            </div>
            {currentCharacter.gold < selectedTournament.entryFee && (
              <p className="text-red-600 text-sm">Insufficient gold!</p>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowRegisterModal(false)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleRegister}
                disabled={currentCharacter.gold < selectedTournament.entryFee}
              >
                Register ({selectedTournament.entryFee} Gold)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tournament;
