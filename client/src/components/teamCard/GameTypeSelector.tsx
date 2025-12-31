/**
 * Game Type Selector Component
 *
 * Displays available trick-taking games for selection
 */

import type { LocationWithAccess } from '@/services/teamCardGame.service';

// Local types to avoid shared package runtime issues
type TeamCardGameType = 'euchre' | 'spades' | 'hearts' | 'bridge' | 'pinochle';

interface GameTypeConfig {
  gameType: TeamCardGameType;
  displayName: string;
  description: string;
  cardsPerPlayer: number;
  winningScore: number;
  hasBidding: boolean;
  hasTrump: boolean;
  hasMelding: boolean;
  minimumGamblingSkill: number;
}

interface RaidBoss {
  id: string;
  name: string;
  title: string;
  difficulty: string;
  gameTypes: TeamCardGameType[];
}

interface GameTypeSelectorProps {
  gameTypes: GameTypeConfig[];
  onSelect: (gameType: TeamCardGameType) => void;
  locations: LocationWithAccess[];
  bosses: RaidBoss[];
}

export function GameTypeSelector({
  gameTypes,
  onSelect,
  locations,
  bosses,
}: GameTypeSelectorProps) {
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

  const getGameBosses = (gameType: TeamCardGameType) => {
    return bosses.filter((b) => b.gameTypes.includes(gameType));
  };

  return (
    <div className="game-type-selector">
      <h2>Choose Your Game</h2>
      <p className="section-description">
        Team up with partners (real or NPC) to challenge dangerous card sharks
        and raid bosses in classic trick-taking games.
      </p>

      <div className="game-type-grid">
        {gameTypes.map((config) => {
          const gameBosses = getGameBosses(config.gameType);
          return (
            <button
              key={config.gameType}
              className="game-type-card"
              onClick={() => onSelect(config.gameType)}
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
              {gameBosses.length > 0 && (
                <div className="boss-count">
                  <span className="skull">💀</span>
                  {gameBosses.length} Raid Boss{gameBosses.length > 1 ? 'es' : ''}
                </div>
              )}
              <div className="skill-requirement">
                Requires Gambling {config.minimumGamblingSkill}+
              </div>
            </button>
          );
        })}
      </div>

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
    </div>
  );
}

export default GameTypeSelector;
