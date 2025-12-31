/**
 * DuelArena Page
 * Real-time PvP duel interface with High Noon cinematic theme
 *
 * Features:
 * - Cinematic dusty street showdown atmosphere
 * - Real-time card selection and reveals
 * - Betting rounds with bluffing
 * - Perception hints and abilities
 * - Victory celebrations with rewards
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDuelStore } from '@/store/useDuelStore';
import { useDuelSocket } from '@/hooks/useDuelSocket';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Button, LoadingSpinner, Modal } from '@/components/ui';
import { VictoryCelebration } from '@/components/game/effects/VictoryCelebration';
import { DuelAnimatedHand, PerceptionHUD, AbilityBar, ABILITY_DEFINITIONS } from '@/components/duel';
import { DuelPhase, BettingAction } from '@desperados/shared';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * High Noon background with parallax dusty street
 */
const HighNoonBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Sky gradient - sunset orange */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-500 via-orange-400 to-amber-200 opacity-30" />

    {/* Sun/Moon */}
    <motion.div
      className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 opacity-60 blur-sm"
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.6, 0.7, 0.6],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />

    {/* Dust particles */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-amber-700/30 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 10,
        }}
        animate={{
          x: [null, Math.random() * window.innerWidth],
          y: [-10],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 8 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'linear',
        }}
      />
    ))}

    {/* Ground/Street */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/50 to-transparent" />
  </div>
);

/**
 * VS indicator in the center
 */
const VSIndicator: React.FC<{ pot: number; roundNumber: number }> = ({ pot, roundNumber }) => (
  <div className="flex flex-col items-center">
    <motion.div
      className="text-5xl font-western text-blood-red drop-shadow-lg"
      animate={{
        scale: [1, 1.05, 1],
        textShadow: [
          '0 0 10px rgba(185, 28, 28, 0.5)',
          '0 0 20px rgba(185, 28, 28, 0.8)',
          '0 0 10px rgba(185, 28, 28, 0.5)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      VS
    </motion.div>
    <div className="mt-2 text-center">
      <div className="text-sm text-wood-medium">Round {roundNumber}</div>
      {pot > 0 && (
        <div className="text-lg font-bold text-gold-primary">
          Pot: {pot} Gold
        </div>
      )}
    </div>
  </div>
);

/**
 * Turn timer with escalating urgency
 */
const TurnTimer: React.FC<{ timeRemaining: number; isMyTurn: boolean }> = ({
  timeRemaining,
  isMyTurn,
}) => {
  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <motion.div
      className={`
        px-4 py-2 rounded-lg font-bold text-xl
        ${isCritical ? 'bg-blood-red text-white' : isUrgent ? 'bg-amber-500 text-white' : 'bg-wood-light text-wood-dark'}
      `}
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
    >
      {isMyTurn ? (
        <>Your Turn: {Math.ceil(timeRemaining)}s</>
      ) : (
        <>Waiting... {Math.ceil(timeRemaining)}s</>
      )}
    </motion.div>
  );
};

/**
 * Opponent display (top of screen)
 */
const OpponentDisplay: React.FC<{
  name: string;
  level: number;
  roundsWon: number;
  isConnected: boolean;
  hasSubmittedAction: boolean;
  cardCount: number;
  perceptionHints: any[];
}> = ({ name, level, roundsWon, isConnected, hasSubmittedAction, cardCount, perceptionHints }) => (
  <div className="bg-wood-dark/80 backdrop-blur-sm rounded-b-xl p-4 border-b-4 border-blood-red">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div className="w-16 h-16 rounded-full bg-wood-medium border-2 border-blood-red flex items-center justify-center">
          <span className="text-2xl">&#x1F920;</span>
        </div>
        <div>
          <h3 className="text-xl font-western text-parchment">{name}</h3>
          <p className="text-sm text-wood-light">Level {level}</p>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />

        {/* Action submitted indicator */}
        {hasSubmittedAction && (
          <div className="text-green-400 text-sm">Ready</div>
        )}

        {/* Rounds won */}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 ${
                i < roundsWon ? 'bg-gold-primary border-gold-primary' : 'border-wood-light'
              }`}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Hidden cards representation */}
    <div className="mt-3 flex justify-center gap-1">
      {[...Array(cardCount)].map((_, i) => (
        <motion.div
          key={i}
          className="w-12 h-16 rounded bg-blood-red border-2 border-wood-dark shadow-lg"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: 180 }}
          style={{ transformStyle: 'preserve-3d' }}
        />
      ))}
    </div>

    {/* Perception hints */}
    {perceptionHints.length > 0 && (
      <div className="mt-3 space-y-1">
        {perceptionHints.map((hint, i) => (
          <motion.div
            key={i}
            className="text-sm text-amber-300 italic"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            "{hint.message}"
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Player display (bottom of screen)
 */
const PlayerDisplay: React.FC<{
  name: string;
  roundsWon: number;
  hand: any[];
  selectedIndices: number[];
  onSelectCard: (index: number) => void;
  canSelect: boolean;
  triggerDeal: boolean;
  triggerReveal: boolean;
  onDealComplete?: () => void;
  onRevealComplete?: () => void;
}> = ({
  name,
  roundsWon,
  hand,
  selectedIndices,
  onSelectCard,
  canSelect,
  triggerDeal,
  triggerReveal,
  onDealComplete,
  onRevealComplete
}) => (
  <div className="bg-wood-dark/80 backdrop-blur-sm rounded-t-xl p-4 border-t-4 border-gold-primary">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gold-primary/20 border-2 border-gold-primary flex items-center justify-center">
          <span className="text-xl">&#x1F920;</span>
        </div>
        <div>
          <h3 className="text-lg font-western text-parchment">{name}</h3>
          <p className="text-xs text-wood-light">You</p>
        </div>
      </div>

      {/* Rounds won */}
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i < roundsWon ? 'bg-gold-primary border-gold-primary' : 'border-wood-light'
            }`}
          />
        ))}
      </div>
    </div>

    {/* Player's animated cards */}
    {hand.length > 0 && (
      <DuelAnimatedHand
        cards={hand}
        selectedIndices={selectedIndices}
        onCardClick={onSelectCard}
        canSelect={canSelect}
        triggerDeal={triggerDeal}
        triggerReveal={triggerReveal}
        onDealComplete={onDealComplete}
        onRevealComplete={onRevealComplete}
        size="md"
        faceUp={true}
      />
    )}
  </div>
);

/**
 * Action bar with available actions
 */
const ActionBar: React.FC<{
  phase: DuelPhase;
  availableActions: string[];
  selectedCardCount: number;
  onHold: () => void;
  onDraw: () => void;
  onBet: (action: BettingAction, amount?: number) => void;
  onForfeit: () => void;
  isProcessing: boolean;
  currentBet: number;
}> = ({
  phase,
  availableActions: _availableActions,
  selectedCardCount,
  onHold,
  onDraw,
  onBet,
  onForfeit,
  isProcessing,
  currentBet,
}) => {
  const [betAmount, setBetAmount] = useState(10);

  if (phase === DuelPhase.WAITING || phase === DuelPhase.READY_CHECK) {
    return null;
  }

  return (
    <motion.div
      className="bg-wood-dark/90 backdrop-blur-sm rounded-xl p-4 border-2 border-gold-primary"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {phase === DuelPhase.SELECTION && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            onClick={onHold}
            disabled={isProcessing || selectedCardCount === 0}
          >
            Hold Selected ({selectedCardCount})
          </Button>
          <Button
            variant="primary"
            onClick={onDraw}
            disabled={isProcessing}
          >
            Draw New Cards
          </Button>
        </div>
      )}

      {phase === DuelPhase.BETTING && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            {currentBet === 0 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onBet(BettingAction.CHECK)}
                  disabled={isProcessing}
                >
                  Check
                </Button>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1 rounded border border-wood-medium bg-parchment text-center"
                    min={1}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => onBet(BettingAction.BET, betAmount)}
                    disabled={isProcessing}
                  >
                    Bet
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => onBet(BettingAction.CALL)}
                  disabled={isProcessing}
                >
                  Call ({currentBet})
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onBet(BettingAction.RAISE, currentBet * 2)}
                  disabled={isProcessing}
                >
                  Raise ({currentBet * 2})
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onBet(BettingAction.FOLD)}
                  disabled={isProcessing}
                >
                  Fold
                </Button>
              </>
            )}
          </div>
          <Button
            variant="primary"
            onClick={() => onBet(BettingAction.ALL_IN)}
            disabled={isProcessing}
            className="bg-blood-red hover:bg-blood-red/80"
          >
            ALL IN
          </Button>
        </div>
      )}

      {/* Forfeit button always available */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onForfeit}
          disabled={isProcessing}
          className="text-blood-red hover:text-blood-red/80"
        >
          Forfeit Duel
        </Button>
      </div>
    </motion.div>
  );
};

/**
 * Ready check overlay
 */
const ReadyCheckOverlay: React.FC<{
  isReady: boolean;
  opponentReady: boolean;
  onReady: () => void;
}> = ({ isReady, opponentReady, onReady }) => (
  <motion.div
    className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="bg-parchment rounded-xl p-8 max-w-md text-center">
      <h2 className="text-3xl font-western text-wood-dark mb-4">High Noon Showdown</h2>
      <p className="text-wood-medium mb-6">
        Both gunslingers must be ready to draw...
      </p>

      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isReady ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm">You</span>
        </div>
        <div className="text-center">
          <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${opponentReady ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm">Opponent</span>
        </div>
      </div>

      {!isReady ? (
        <Button variant="primary" onClick={onReady} size="lg">
          Ready to Draw!
        </Button>
      ) : (
        <p className="text-wood-medium italic">Waiting for opponent...</p>
      )}
    </div>
  </motion.div>
);

/**
 * Victory/Defeat modal
 */
const DuelResultModal: React.FC<{
  isOpen: boolean;
  isVictory: boolean;
  winnerName: string;
  rewards: any;
  onClose: () => void;
}> = ({ isOpen, isVictory, winnerName, rewards, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
    <div className="text-center py-8">
      <motion.h2
        className={`text-5xl font-western mb-4 ${isVictory ? 'text-gold-primary' : 'text-blood-red'}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {isVictory ? 'VICTORY!' : 'DEFEAT'}
      </motion.h2>

      <p className="text-xl text-wood-medium mb-6">
        {isVictory ? 'You have bested your opponent!' : `${winnerName} wins the duel.`}
      </p>

      {rewards && (
        <div className="bg-wood-light/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-wood-dark mb-2">Rewards</h3>
          <div className="flex justify-center gap-6">
            {rewards.gold > 0 && (
              <div className="text-center">
                <span className="text-2xl text-gold-primary">${rewards.gold}</span>
                <p className="text-sm text-wood-medium">Dollars</p>
              </div>
            )}
            {rewards.experience > 0 && (
              <div className="text-center">
                <span className="text-2xl text-blue-500">{rewards.experience}</span>
                <p className="text-sm text-wood-medium">XP</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Button variant="primary" onClick={onClose} size="lg">
        Return to Town
      </Button>
    </div>
  </Modal>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const DuelArena: React.FC = () => {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();

  const { currentCharacter } = useCharacterStore();
  const {
    activeDuel,
    isInDuel: _isInDuel,
    selectedCardIndices,
    isProcessingAction,
    showDealAnimation,
    showRevealAnimation,
    showVictoryAnimation,
    animationData,
    perceptionHints,
    availableAbilities,
    abilityCooldowns,
    abilityEnergy,
    maxAbilityEnergy,
    selectCard,
    deselectCard,
    setSelectedCards: _setSelectedCards,
    clearAnimations,
  } = useDuelStore();

  const {
    isConnected: _isConnected,
    connectionError,
    joinDuelRoom,
    leaveDuelRoom,
    sendReady,
    sendHoldCards,
    sendDraw,
    sendBet,
    sendUseAbility,
    sendForfeit,
  } = useDuelSocket();

  const [showResultModal, setShowResultModal] = useState(false);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Join duel room on mount
  useEffect(() => {
    if (duelId && currentCharacter) {
      joinDuelRoom(duelId);
    }

    return () => {
      if (duelId) {
        leaveDuelRoom(duelId);
      }
    };
  }, [duelId, currentCharacter, joinDuelRoom, leaveDuelRoom]);

  // Update timer
  useEffect(() => {
    if (!activeDuel) return;

    const updateTimer = () => {
      const elapsed = (Date.now() - activeDuel.round.turnStartedAt) / 1000;
      const remaining = Math.max(0, activeDuel.round.turnTimeLimit - elapsed);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [activeDuel]);

  // Show result modal when game completes
  useEffect(() => {
    if (showVictoryAnimation && animationData) {
      setTimeout(() => {
        setShowResultModal(true);
      }, 3000);
    }
  }, [showVictoryAnimation, animationData]);

  // Handle card selection toggle
  const handleCardSelect = (index: number) => {
    if (selectedCardIndices.includes(index)) {
      deselectCard(index);
    } else {
      selectCard(index);
    }
  };

  // Handle hold action
  const handleHold = () => {
    if (duelId) {
      sendHoldCards(duelId, selectedCardIndices);
    }
  };

  // Handle draw action
  const handleDraw = () => {
    if (duelId) {
      sendDraw(duelId);
    }
  };

  // Handle bet action
  const handleBet = (action: BettingAction, amount?: number) => {
    if (duelId) {
      sendBet(duelId, action, amount);
    }
  };

  // Handle forfeit
  const handleForfeitClick = () => {
    setShowForfeitConfirm(true);
  };

  const confirmForfeit = async () => {
    if (duelId) {
      sendForfeit(duelId);
    }
    setShowForfeitConfirm(false);
  };

  // Handle ability use
  const handleUseAbility = (abilityId: string) => {
    if (duelId) {
      sendUseAbility(duelId, abilityId);
    }
  };

  // Handle ready
  const handleReady = () => {
    if (duelId) {
      sendReady(duelId);
    }
  };

  // Handle result modal close
  const handleResultClose = () => {
    setShowResultModal(false);
    clearAnimations();
    navigate('/game/duel');
  };

  // Connection error state
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wood-dark">
        <div className="text-center text-parchment">
          <h2 className="text-2xl font-western mb-4">Connection Lost</h2>
          <p className="mb-4">{connectionError}</p>
          <Button variant="secondary" onClick={() => navigate('/game/duel')}>
            Return to Lobby
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!activeDuel && !connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wood-dark">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-parchment">Entering the arena...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = activeDuel?.isMyTurn ?? false;
  const currentPhase = activeDuel?.round.phase ?? DuelPhase.WAITING;
  const isVictory = animationData?.winnerName === currentCharacter?.name;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-800 to-wood-dark overflow-hidden">
      {/* Background */}
      <HighNoonBackground />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-4 flex flex-col h-screen">
        {/* Opponent section (top) */}
        <div className="flex-shrink-0">
          <OpponentDisplay
            name={activeDuel?.opponent.name ?? 'Opponent'}
            level={activeDuel?.opponent.level ?? 1}
            roundsWon={activeDuel?.opponent.roundsWon ?? 0}
            isConnected={activeDuel?.opponent.isConnected ?? false}
            hasSubmittedAction={activeDuel?.opponent.hasSubmittedAction ?? false}
            cardCount={activeDuel?.opponent.cardCount ?? 5}
            perceptionHints={perceptionHints}
          />
        </div>

        {/* Perception HUD - shows hints about opponent */}
        <PerceptionHUD
          hints={perceptionHints}
          perceptionLevel={currentCharacter?.skills?.find(s => s.skillId === 'perception')?.level ?? 1}
        />

        {/* Center section - VS indicator and timer */}
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <TurnTimer timeRemaining={timeRemaining} isMyTurn={isMyTurn} />
          <VSIndicator
            pot={activeDuel?.round.pot ?? 0}
            roundNumber={activeDuel?.round.roundNumber ?? 1}
          />
        </div>

        {/* Ability bar (perception abilities) */}
        <div className="flex-shrink-0 mb-2 flex justify-center">
          <AbilityBar
            abilities={Object.values(ABILITY_DEFINITIONS).filter(
              a => availableAbilities.length === 0 || availableAbilities.includes(a.id)
            )}
            energy={abilityEnergy}
            maxEnergy={maxAbilityEnergy}
            cooldowns={abilityCooldowns}
            onUseAbility={handleUseAbility}
            canUse={isMyTurn && !isProcessingAction && currentPhase !== DuelPhase.WAITING && currentPhase !== DuelPhase.READY_CHECK}
            isProcessing={isProcessingAction}
            className="max-w-lg"
          />
        </div>

        {/* Action bar (above player cards) */}
        <div className="flex-shrink-0 mb-4">
          <ActionBar
            phase={currentPhase}
            availableActions={activeDuel?.availableActions ?? []}
            selectedCardCount={selectedCardIndices.length}
            onHold={handleHold}
            onDraw={handleDraw}
            onBet={handleBet}
            onForfeit={handleForfeitClick}
            isProcessing={isProcessingAction}
            currentBet={activeDuel?.round.currentBet ?? 0}
          />
        </div>

        {/* Player section (bottom) */}
        <div className="flex-shrink-0">
          <PlayerDisplay
            name={currentCharacter?.name ?? 'You'}
            roundsWon={activeDuel?.player.roundsWon ?? 0}
            hand={activeDuel?.player.hand ?? []}
            selectedIndices={selectedCardIndices}
            onSelectCard={handleCardSelect}
            canSelect={currentPhase === DuelPhase.SELECTION && isMyTurn}
            triggerDeal={showDealAnimation}
            triggerReveal={showRevealAnimation}
          />
        </div>
      </div>

      {/* Ready check overlay */}
      <AnimatePresence>
        {(currentPhase === DuelPhase.WAITING || currentPhase === DuelPhase.READY_CHECK) && (
          <ReadyCheckOverlay
            isReady={activeDuel?.player.isReady ?? false}
            opponentReady={activeDuel?.opponent.isReady ?? false}
            onReady={handleReady}
          />
        )}
      </AnimatePresence>

      {/* Victory celebration */}
      <AnimatePresence>
        {showVictoryAnimation && (
          <VictoryCelebration
            isActive={showVictoryAnimation}
            intensity={isVictory ? 8 : 3}
            onComplete={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Result modal */}
      <DuelResultModal
        isOpen={showResultModal}
        isVictory={isVictory}
        winnerName={animationData?.winnerName ?? ''}
        rewards={animationData?.rewards}
        onClose={handleResultClose}
      />

      {/* Forfeit confirmation modal */}
      {showForfeitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-wood-dark border-2 border-blood-red p-6 rounded-lg max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h3 className="text-2xl font-western text-blood-red mb-4">Forfeit Duel?</h3>
            <p className="text-parchment mb-6">
              Are you sure you want to forfeit this duel? You will lose the match and any gold in the pot.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowForfeitConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmForfeit}
                className="bg-blood-red hover:bg-blood-red/80 border-blood-red"
              >
                Forfeit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DuelArena;
