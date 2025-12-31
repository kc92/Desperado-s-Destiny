/**
 * Card Table Component
 *
 * Main game table for trick-taking card games.
 * Displays hands, current trick, scores, and game controls.
 */

import { useState } from 'react';
import type {
  TeamCardGameType,
  TeamCardGamePhase,
  TeamCardPlayer,
  TrickCard,
  PlayedCard,
  GameHint,
  BossMechanic,
  Suit,
} from '@desperados/shared';

interface CardTableProps {
  gameType: TeamCardGameType;
  phase: TeamCardGamePhase;
  me: TeamCardPlayer;
  myHand: TrickCard[];
  playableCardIndices: number[];
  currentTrick: PlayedCard[];
  trickNumber: number;
  tricksWon: [number, number];
  teamScores: [number, number];
  trump: Suit | null;
  isMyTurn: boolean;
  turnTimeRemaining: number;
  hints: GameHint[];
  announcements: string[];
  bossHealth: number | null;
  bossMaxHealth: number | null;
  bossPhase: number | null;
  activeMechanics: BossMechanic[];
  onPlayCard: (index: number) => void;
  onCallTrump: (action: 'pass' | 'order_up' | 'call', suit?: Suit, goingAlone?: boolean) => void;
  onMakeBid: (bid: number, options?: { isNil?: boolean; suit?: Suit }) => void;
  onLeave: () => void;
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
};

export function CardTable({
  gameType,
  phase,
  me,
  myHand,
  playableCardIndices,
  currentTrick,
  trickNumber,
  tricksWon,
  teamScores,
  trump,
  isMyTurn,
  turnTimeRemaining,
  hints,
  announcements,
  bossHealth,
  bossMaxHealth,
  bossPhase,
  activeMechanics,
  onPlayCard,
  onCallTrump,
  onMakeBid,
  onLeave,
}: CardTableProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    if (!isMyTurn || phase !== 'playing') return;
    if (!playableCardIndices.includes(index)) return;

    if (selectedCard === index) {
      // Double-click to play
      onPlayCard(index);
      setSelectedCard(null);
    } else {
      setSelectedCard(index);
    }
  };

  const handlePlaySelected = () => {
    if (selectedCard !== null) {
      onPlayCard(selectedCard);
      setSelectedCard(null);
    }
  };

  const renderCard = (card: TrickCard, index: number, isPlayable: boolean) => {
    const isSelected = selectedCard === index;
    const suitSymbol = SUIT_SYMBOLS[card.suit] || card.suit;
    const suitColor = SUIT_COLORS[card.suit] || 'black';

    return (
      <button
        key={`${card.suit}-${card.rank}-${index}`}
        className={`playing-card ${suitColor} ${isPlayable ? 'playable' : 'disabled'} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleCardClick(index)}
        disabled={!isPlayable}
      >
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{suitSymbol}</span>
        {card.isBower && (
          <span className="bower-badge">{card.bowerType === 'right' ? 'R' : 'L'}</span>
        )}
      </button>
    );
  };

  const renderTrickCard = (played: PlayedCard, position: number) => {
    const { card, playerIndex } = played;
    const suitSymbol = SUIT_SYMBOLS[card.suit] || card.suit;
    const suitColor = SUIT_COLORS[card.suit] || 'black';
    const positions = ['bottom', 'left', 'top', 'right'];
    const posClass = positions[position % 4];

    return (
      <div key={`trick-${playerIndex}`} className={`trick-card ${posClass} ${suitColor}`}>
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{suitSymbol}</span>
      </div>
    );
  };

  return (
    <div className="card-table">
      {/* Boss Health Bar */}
      {bossHealth !== null && bossMaxHealth !== null && (
        <div className="boss-overlay">
          <div className="boss-header">
            <span className="boss-phase">Phase {bossPhase}</span>
            <div className="boss-health-bar">
              <div
                className="boss-health-fill"
                style={{ width: `${(bossHealth / bossMaxHealth) * 100}%` }}
              />
              <span className="boss-health-text">
                {bossHealth} / {bossMaxHealth}
              </span>
            </div>
          </div>
          {activeMechanics.length > 0 && (
            <div className="active-mechanics">
              {activeMechanics.map((m) => (
                <div key={m.id} className="mechanic-badge" title={m.description}>
                  {m.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Game Info */}
      <div className="game-info">
        <div className="score-display">
          <div className="team-score my-team">
            <span className="label">Your Team</span>
            <span className="score">{teamScores[me.teamIndex]}</span>
            <span className="tricks">Tricks: {tricksWon[me.teamIndex]}</span>
          </div>
          <div className="vs">vs</div>
          <div className="team-score opponent-team">
            <span className="label">Opponents</span>
            <span className="score">{teamScores[1 - me.teamIndex]}</span>
            <span className="tricks">Tricks: {tricksWon[1 - me.teamIndex]}</span>
          </div>
        </div>
        {trump && (
          <div className="trump-display">
            Trump: <span className={SUIT_COLORS[trump]}>{SUIT_SYMBOLS[trump]}</span>
          </div>
        )}
        <div className="trick-counter">Trick {trickNumber}</div>
      </div>

      {/* Turn Timer */}
      {isMyTurn && (
        <div className={`turn-timer ${turnTimeRemaining <= 10 ? 'urgent' : ''}`}>
          <span className="timer-label">Your Turn!</span>
          <span className="timer-value">{turnTimeRemaining}s</span>
        </div>
      )}

      {/* Current Trick Area */}
      <div className="trick-area">
        {currentTrick.map((played, idx) => renderTrickCard(played, idx))}
        {currentTrick.length === 0 && (
          <div className="trick-placeholder">
            {phase === 'playing' ? 'Lead a card' : 'Waiting...'}
          </div>
        )}
      </div>

      {/* Player Hand */}
      <div className="hand-area">
        <div className="hand-cards">
          {myHand.map((card, index) =>
            renderCard(card, index, playableCardIndices.includes(index) && isMyTurn)
          )}
        </div>
        {selectedCard !== null && isMyTurn && (
          <button className="btn-play-card" onClick={handlePlaySelected}>
            Play {myHand[selectedCard]?.rank} of {SUIT_SYMBOLS[myHand[selectedCard]?.suit]}
          </button>
        )}
      </div>

      {/* Hints */}
      {hints.length > 0 && (
        <div className="hints-panel">
          {hints.slice(0, 3).map((hint, idx) => (
            <div key={idx} className={`hint hint-${hint.type}`}>
              {hint.message}
            </div>
          ))}
        </div>
      )}

      {/* Announcements */}
      <div className="announcements">
        {announcements.slice(-5).map((msg, idx) => (
          <div key={idx} className="announcement">
            {msg}
          </div>
        ))}
      </div>

      {/* Trump Calling (Euchre) */}
      {phase === 'trump_selection' && gameType === 'euchre' && isMyTurn && (
        <div className="trump-calling-modal">
          <h3>Call Trump</h3>
          <div className="trump-options">
            <button onClick={() => onCallTrump('pass')}>Pass</button>
            <button onClick={() => onCallTrump('order_up')}>Order Up</button>
          </div>
        </div>
      )}

      {/* Bidding (Spades/Bridge) */}
      {phase === 'bidding' && (gameType === 'spades' || gameType === 'bridge') && isMyTurn && (
        <div className="bidding-modal">
          <h3>Make Your Bid</h3>
          <div className="bid-options">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
              .filter((b) => gameType === 'spades' || b > 0)
              .map((bid) => (
                <button key={bid} onClick={() => onMakeBid(bid)}>
                  {bid === 0 ? 'Nil' : bid}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Leave Button */}
      <button className="btn-leave" onClick={onLeave}>
        Leave Game
      </button>
    </div>
  );
}

export default CardTable;
