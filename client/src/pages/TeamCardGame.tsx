/**
 * Team Card Game Page
 *
 * Main page for team-based trick-taking card games (Hard Raids).
 * Supports Euchre, Spades, Hearts, Bridge, and Pinochle.
 */

import { useState, useEffect } from 'react';
import { useTeamCardGame } from '@/hooks/useTeamCardGame';
import {
  teamCardGameService,
  type TeamCardGameType,
  type RaidBoss,
  type GameTypeConfig,
} from '@/services/teamCardGame.service';
import type { LocationWithAccess, LobbySession } from '@/services/teamCardGame.service';
import './TeamCardGame.css';

// Local game type configs (fallback if API fails)
const GAME_TYPE_CONFIGS: Record<TeamCardGameType, GameTypeConfig> = {
  euchre: {
    gameType: 'euchre',
    displayName: 'Euchre',
    description: 'Fast-paced trick-taking with trump calling and going alone.',
    cardsPerPlayer: 5,
    winningScore: 10,
    hasBidding: false,
    hasTrump: true,
    hasMelding: false,
    minimumGamblingSkill: 1,
  },
  spades: {
    gameType: 'spades',
    displayName: 'Spades',
    description: 'Strategic bidding with nil bids and bag penalties.',
    cardsPerPlayer: 13,
    winningScore: 500,
    hasBidding: true,
    hasTrump: true,
    hasMelding: false,
    minimumGamblingSkill: 5,
  },
  hearts: {
    gameType: 'hearts',
    displayName: 'Hearts',
    description: 'Avoid points or shoot the moon. Queen of Spades is deadly.',
    cardsPerPlayer: 13,
    winningScore: 100,
    hasBidding: false,
    hasTrump: false,
    hasMelding: false,
    minimumGamblingSkill: 5,
  },
  bridge: {
    gameType: 'bridge',
    displayName: 'Bridge',
    description: 'Complex bidding and declarer play. The ultimate card game.',
    cardsPerPlayer: 13,
    winningScore: 100,
    hasBidding: true,
    hasTrump: true,
    hasMelding: false,
    minimumGamblingSkill: 15,
  },
  pinochle: {
    gameType: 'pinochle',
    displayName: 'Pinochle',
    description: 'Melding combinations plus trick-taking with a double deck.',
    cardsPerPlayer: 12,
    winningScore: 150,
    hasBidding: true,
    hasTrump: true,
    hasMelding: true,
    minimumGamblingSkill: 10,
  },
};

const getGameIcon = (gameType: TeamCardGameType) => {
  switch (gameType) {
    case 'euchre': return '♠';
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'bridge': return '♦';
    case 'pinochle': return '♣';
    default: return '🃏';
  }
};

export function TeamCardGame() {
  const gameHook = useTeamCardGame();

  // Local UI state
  const [selectedGameType, setSelectedGameType] = useState<TeamCardGameType | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRaidMode, setIsRaidMode] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<string | undefined>();

  // Data from API
  const [locations, setLocations] = useState<LocationWithAccess[]>([]);
  const [bosses, setBosses] = useState<RaidBoss[]>([]);
  const [lobbiesLoading, setLobbiesLoading] = useState(false);
  const [lobbies, setLobbies] = useState<LobbySession[]>([]);

  const gameTypes = Object.values(GAME_TYPE_CONFIGS);

  // Fetch locations and bosses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locData, bossData] = await Promise.all([
          teamCardGameService.getLocations(),
          teamCardGameService.getBosses(),
        ]);
        setLocations(locData);
        setBosses(bossData);
      } catch (err) {
        console.error('Failed to fetch team card game data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch lobbies when game type changes
  useEffect(() => {
    if (selectedGameType) {
      setLobbiesLoading(true);
      teamCardGameService.getLobbies({ gameType: selectedGameType })
        .then(setLobbies)
        .catch(console.error)
        .finally(() => setLobbiesLoading(false));
    }
  }, [selectedGameType]);

  const handleSelectGameType = (gameType: TeamCardGameType) => {
    setSelectedGameType(gameType);
  };

  const handleBack = () => {
    setSelectedGameType(null);
    setShowCreateModal(false);
    setIsRaidMode(false);
    setSelectedBoss(undefined);
  };

  const handleCreateSession = () => {
    if (selectedGameType) {
      gameHook.createSession(selectedGameType, isRaidMode ? selectedBoss : undefined);
      setShowCreateModal(false);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    gameHook.joinSession(sessionId);
  };

  const handleRefreshLobbies = () => {
    if (selectedGameType) {
      setLobbiesLoading(true);
      teamCardGameService.getLobbies({ gameType: selectedGameType })
        .then(setLobbies)
        .catch(console.error)
        .finally(() => setLobbiesLoading(false));
    }
  };

  const gameBosses = selectedGameType
    ? bosses.filter((b) => b.gameTypes.includes(selectedGameType))
    : [];

  // If in an active session, show the game view
  if (gameHook.sessionId && gameHook.phase && gameHook.phase !== 'waiting') {
    return (
      <div className="team-card-game-page">
        <header className="team-card-header">
          <h1>♠ {GAME_TYPE_CONFIGS[gameHook.gameType!]?.displayName || 'Card Game'} ♥</h1>
          <p className="subtitle">In Progress - Round {gameHook.currentRound}</p>
        </header>

        <div className="game-active">
          <div className="game-info">
            <div className="scores">
              <span>Team 1: {gameHook.teamScores[0]}</span>
              <span>Team 2: {gameHook.teamScores[1]}</span>
            </div>
            {gameHook.trump && (
              <div className="trump-indicator">
                Trump: {gameHook.trump}
              </div>
            )}
          </div>

          {gameHook.bossHealth !== null && (
            <div className="boss-status">
              <div className="boss-health">
                Boss HP: {gameHook.bossHealth} / {gameHook.bossMaxHealth}
              </div>
              {gameHook.activeMechanics.length > 0 && (
                <div className="active-mechanics">
                  {gameHook.activeMechanics.map((m) => (
                    <span key={m.id} className="mechanic-badge">{m.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="current-trick">
            <h3>Current Trick</h3>
            <div className="trick-cards">
              {gameHook.currentTrick.map((played, i) => (
                <div key={i} className="played-card">
                  {played.card.rank} of {played.card.suit}
                </div>
              ))}
            </div>
          </div>

          <div className="my-hand">
            <h3>Your Hand {gameHook.isMyTurn && `(Your Turn - ${gameHook.turnTimeRemaining}s)`}</h3>
            <div className="hand-cards">
              {gameHook.myHand.map((card, index) => (
                <button
                  key={index}
                  className={`card ${gameHook.playableCardIndices.includes(index) ? 'playable' : 'disabled'}`}
                  onClick={() => gameHook.playCard(index)}
                  disabled={!gameHook.isMyTurn || !gameHook.playableCardIndices.includes(index)}
                >
                  {card.rank} of {card.suit}
                </button>
              ))}
            </div>
          </div>

          <div className="announcements">
            {gameHook.announcements.slice(-5).map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>

          <button className="btn-leave" onClick={gameHook.leaveSession}>
            Leave Game
          </button>
        </div>
      </div>
    );
  }

  // If in a waiting lobby
  if (gameHook.sessionId && gameHook.phase === 'waiting') {
    return (
      <div className="team-card-game-page">
        <header className="team-card-header">
          <h1>♠ {GAME_TYPE_CONFIGS[gameHook.gameType!]?.displayName || 'Card Game'} Lobby ♥</h1>
          <p className="subtitle">Waiting for players...</p>
        </header>

        <div className="waiting-lobby">
          <div className="player-slots">
            {[0, 1, 2, 3].map((seatIndex) => {
              const player = gameHook.players.find((p) => p.seatIndex === seatIndex);
              return (
                <div key={seatIndex} className={`player-slot team-${seatIndex % 2}`}>
                  {player ? (
                    <>
                      <span className="player-name">{player.name}</span>
                      {player.isNPC && <span className="npc-badge">NPC</span>}
                      {player.isReady && <span className="ready-badge">Ready</span>}
                    </>
                  ) : (
                    <span className="empty-slot">Empty</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lobby-controls">
            <button className="btn-ready" onClick={gameHook.setReady}>
              Ready
            </button>
            <button className="btn-leave" onClick={gameHook.leaveSession}>
              Leave Lobby
            </button>
          </div>

          {gameHook.error && (
            <div className="error-message">
              {gameHook.error}
              <button onClick={gameHook.clearError}>Dismiss</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="team-card-game-page">
      <header className="team-card-header">
        <h1>♠ Hard Raids - Card Games ♥</h1>
        <p className="subtitle">Team-based trick-taking challenges</p>
        {!gameHook.isConnected && (
          <p className="connection-status">⚠️ Connecting to server...</p>
        )}
      </header>

      {gameHook.error && (
        <div className="error-banner">
          {gameHook.error}
          <button onClick={gameHook.clearError}>×</button>
        </div>
      )}

      {!selectedGameType ? (
        <div className="game-type-selector">
          <h2>Choose Your Game</h2>
          <p className="section-description">
            Team up with partners (real or NPC) to challenge dangerous card sharks
            and raid bosses in classic trick-taking games.
          </p>

          <div className="game-type-grid">
            {gameTypes.map((config) => {
              const gameBossCount = bosses.filter((b) => b.gameTypes.includes(config.gameType)).length;
              return (
                <button
                  key={config.gameType}
                  className="game-type-card"
                  onClick={() => handleSelectGameType(config.gameType)}
                >
                  <div className="game-icon">{getGameIcon(config.gameType)}</div>
                  <h3>{config.displayName}</h3>
                  <p className="game-description">{config.description}</p>
                  <div className="game-details">
                    <span className="detail">
                      <strong>{config.cardsPerPlayer}</strong> cards per player
                    </span>
                    <span className="detail">
                      Win at <strong>{config.winningScore}</strong> points
                    </span>
                    {config.hasBidding && <span className="tag">Bidding</span>}
                    {config.hasTrump && <span className="tag">Trump</span>}
                    {config.hasMelding && <span className="tag">Melding</span>}
                  </div>
                  {gameBossCount > 0 && (
                    <div className="boss-count">
                      <span className="skull">💀</span>
                      {gameBossCount} Raid Boss{gameBossCount > 1 ? 'es' : ''}
                    </div>
                  )}
                  <div className="skill-requirement">
                    Requires Gambling {config.minimumGamblingSkill}+
                  </div>
                </button>
              );
            })}
          </div>

          {locations.length > 0 && (
            <div className="locations-section">
              <h3>Card Game Locations</h3>
              <div className="locations-grid">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className={`location-card ${loc.hasAccess ? 'accessible' : 'locked'}`}
                  >
                    <div className="location-theme">{loc.atmosphere.theme}</div>
                    <h4>{loc.name}</h4>
                    <p>{loc.description}</p>
                    <div className="available-games">
                      {loc.availableGames.map((gt) => (
                        <span key={gt} className="game-badge">
                          {getGameIcon(gt)}
                        </span>
                      ))}
                    </div>
                    {!loc.hasAccess && loc.missingRequirements && (
                      <div className="requirements">
                        {loc.missingRequirements.map((req, i) => (
                          <span key={i} className="requirement">🔒 {req}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="game-lobby">
          <div className="lobby-header">
            <button className="btn-back" onClick={handleBack}>
              ← Back
            </button>
            <h2>{GAME_TYPE_CONFIGS[selectedGameType].displayName} Lobby</h2>
            <button
              className="btn-refresh"
              onClick={handleRefreshLobbies}
              disabled={lobbiesLoading}
            >
              {lobbiesLoading ? '...' : '↻'}
            </button>
          </div>

          <div className="lobby-actions">
            <button
              className="btn-create"
              onClick={() => setShowCreateModal(true)}
              disabled={gameHook.isLoading}
            >
              {gameHook.isLoading ? 'Creating...' : 'Create New Game'}
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
                    onClick={() => handleJoinSession(lobby.sessionId)}
                    disabled={lobby.playerCount >= lobby.maxPlayers}
                  >
                    {lobby.playerCount >= lobby.maxPlayers ? 'Full' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal create-game-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create {GAME_TYPE_CONFIGS[selectedGameType!].displayName} Game</h3>

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

            {isRaidMode && gameBosses.length > 0 && (
              <div className="form-group">
                <label>Select Boss:</label>
                <div className="boss-selection">
                  {gameBosses.map((boss) => (
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
                onClick={handleCreateSession}
                disabled={gameHook.isLoading || (isRaidMode && !selectedBoss && gameBosses.length > 0)}
              >
                {gameHook.isLoading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamCardGame;
