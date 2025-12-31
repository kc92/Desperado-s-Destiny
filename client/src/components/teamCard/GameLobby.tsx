/**
 * Game Lobby Component
 *
 * Shows available sessions and allows creating new ones
 */

import { useState } from 'react';
import type { LobbySession } from '@/services/teamCardGame.service';

// Local types to avoid shared package runtime issues
type TeamCardGameType = 'euchre' | 'spades' | 'hearts' | 'bridge' | 'pinochle';

interface RaidBoss {
  id: string;
  name: string;
  title: string;
  difficulty: string;
  gameTypes: TeamCardGameType[];
}

// Local game type configs
const GAME_TYPE_CONFIGS: Record<TeamCardGameType, { displayName: string }> = {
  euchre: { displayName: 'Euchre' },
  spades: { displayName: 'Spades' },
  hearts: { displayName: 'Hearts' },
  bridge: { displayName: 'Bridge' },
  pinochle: { displayName: 'Pinochle' },
};

interface GameLobbyProps {
  gameType: TeamCardGameType;
  lobbies: LobbySession[];
  isLoading: boolean;
  onCreateSession: (gameType: TeamCardGameType, bossId?: string) => void;
  onJoinSession: (sessionId: string) => void;
  onBack: () => void;
  onRefresh: () => void;
  bosses: RaidBoss[];
}

export function GameLobby({
  gameType,
  lobbies,
  isLoading,
  onCreateSession,
  onJoinSession,
  onBack,
  onRefresh,
  bosses,
}: GameLobbyProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<string | undefined>();
  const [isRaidMode, setIsRaidMode] = useState(false);

  const config = GAME_TYPE_CONFIGS[gameType];

  const handleCreate = () => {
    onCreateSession(gameType, isRaidMode ? selectedBoss : undefined);
    setShowCreateModal(false);
  };

  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>{config.displayName} Lobby</h2>
        <button className="btn-refresh" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? '...' : '↻'}
        </button>
      </div>

      <div className="lobby-actions">
        <button
          className="btn-create"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Game
        </button>
      </div>

      {lobbies.length === 0 ? (
        <div className="no-lobbies">
          <p>No active games found.</p>
          <p>Create a new game to get started!</p>
        </div>
      ) : (
        <div className="lobby-list">
          {lobbies.map((lobby) => (
            <div key={lobby.sessionId} className="lobby-item">
              <div className="lobby-info">
                <span className="host-name">{lobby.hostName}'s Game</span>
                <span className="player-count">
                  {lobby.playerCount}/{lobby.maxPlayers} players
                </span>
                {lobby.raidMode && (
                  <span className="raid-badge">💀 Raid</span>
                )}
                {lobby.isPrivate && (
                  <span className="private-badge">🔒 Private</span>
                )}
              </div>
              <button
                className="btn-join"
                onClick={() => onJoinSession(lobby.sessionId)}
                disabled={lobby.playerCount >= lobby.maxPlayers}
              >
                {lobby.playerCount >= lobby.maxPlayers ? 'Full' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal create-game-modal">
            <h3>Create {config.displayName} Game</h3>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isRaidMode}
                  onChange={(e) => setIsRaidMode(e.target.checked)}
                />
                Raid Mode (Challenge a Boss)
              </label>
            </div>

            {isRaidMode && bosses.length > 0 && (
              <div className="form-group">
                <label>Select Boss:</label>
                <div className="boss-selection">
                  {bosses.map((boss) => (
                    <button
                      key={boss.id}
                      className={`boss-option ${selectedBoss === boss.id ? 'selected' : ''}`}
                      onClick={() => setSelectedBoss(boss.id)}
                    >
                      <span className="boss-name">{boss.name}</span>
                      <span className="boss-title">{boss.title}</span>
                      <span className="boss-difficulty">{boss.difficulty}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreate}
                disabled={isRaidMode && !selectedBoss && bosses.length > 0}
              >
                Create Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameLobby;
