/**
 * LegendaryBattle Component
 * Combat interface for legendary animal encounters
 * Phase 3: Missing Frontend Pages
 */

import { useState, useCallback, useEffect } from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import type {
  LegendaryHuntSession,
  HuntTurnResult,
  HuntAction,
  LegendaryAnimal,
  LegendaryReward,
} from '@/hooks/useLegendaryHunt';

interface LegendaryBattleProps {
  session: LegendaryHuntSession;
  legendary: LegendaryAnimal;
  onExecuteTurn: (sessionId: string, action: HuntAction, itemId?: string) => Promise<HuntTurnResult>;
  onAbandonHunt: (sessionId: string) => Promise<{ success: boolean; message: string }>;
  onClaimRewards?: (legendaryId: string, sessionId?: string) => Promise<{ success: boolean; message: string; rewards?: LegendaryReward[] }>;
  onClose?: () => void;
  isLoading?: boolean;
}

interface CombatLogEntry {
  id: number;
  round: number;
  message: string;
  type: 'player' | 'enemy' | 'system' | 'critical';
}

// Action display info
const ACTION_INFO: Record<HuntAction, { icon: string; name: string; color: string; description: string }> = {
  attack: { icon: '⚔️', name: 'Attack', color: 'text-red-400', description: 'Deal damage to the legendary' },
  special: { icon: '✨', name: 'Special', color: 'text-purple-400', description: 'Use a powerful special attack' },
  defend: { icon: '🛡️', name: 'Defend', color: 'text-blue-400', description: 'Reduce incoming damage' },
  item: { icon: '🎒', name: 'Item', color: 'text-green-400', description: 'Use an item from inventory' },
  flee: { icon: '🏃', name: 'Flee', color: 'text-gray-400', description: 'Attempt to escape combat' },
};

export function LegendaryBattle({
  session: initialSession,
  legendary,
  onExecuteTurn,
  onAbandonHunt,
  onClaimRewards,
  onClose,
  isLoading: externalLoading = false,
}: LegendaryBattleProps) {
  const [session, setSession] = useState<LegendaryHuntSession>(initialSession);
  const [isActing, setIsActing] = useState(false);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [lastResult, setLastResult] = useState<HuntTurnResult | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<LegendaryReward[]>([]);
  const [selectedAction, setSelectedAction] = useState<HuntAction | null>(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // Update session when prop changes
  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  // Calculate health percentages
  const legendaryHealthPercent = (session.legendaryHealth / session.legendaryMaxHealth) * 100;
  const playerHealthPercent = (session.characterHealth / session.characterMaxHealth) * 100;

  // Determine phase colors and labels
  const getPhaseInfo = (phase: number, totalPhases: number) => {
    const phasePercent = ((phase - 1) / (totalPhases - 1)) * 100;
    if (phasePercent >= 75) return { color: 'text-red-500', label: 'Enraged', bgColor: 'bg-red-900/30' };
    if (phasePercent >= 50) return { color: 'text-orange-400', label: 'Aggressive', bgColor: 'bg-orange-900/30' };
    if (phasePercent >= 25) return { color: 'text-amber-400', label: 'Alert', bgColor: 'bg-amber-900/30' };
    return { color: 'text-green-400', label: 'Calm', bgColor: 'bg-green-900/30' };
  };

  const phaseInfo = getPhaseInfo(session.currentPhase, session.totalPhases);

  // Add combat log entry
  const addLogEntry = useCallback((message: string, type: CombatLogEntry['type'], round: number) => {
    setCombatLog(prev => [...prev, {
      id: Date.now() + Math.random(),
      round,
      message,
      type,
    }]);
  }, []);

  // Execute combat action
  const handleAction = useCallback(async (action: HuntAction, itemId?: string) => {
    if (isActing) return;

    setIsActing(true);
    setSelectedAction(action);

    try {
      const result = await onExecuteTurn(session.sessionId, action, itemId);
      setLastResult(result);

      if (result.success && result.session) {
        setSession(result.session);

        // Log player action
        const playerMsg = result.playerAction.critical
          ? `CRITICAL! ${result.playerAction.name} for ${result.playerDamageDealt} damage!`
          : `${result.playerAction.name} deals ${result.playerDamageDealt} damage`;
        addLogEntry(playerMsg, result.playerAction.critical ? 'critical' : 'player', session.roundNumber);

        // Log enemy action
        if (result.legendaryAction) {
          const enemyMsg = result.legendaryAction.critical
            ? `${legendary.name} CRITICAL ${result.legendaryAction.name}! You take ${result.playerDamageTaken} damage!`
            : `${legendary.name} uses ${result.legendaryAction.name}, dealing ${result.playerDamageTaken} damage`;
          addLogEntry(enemyMsg, result.legendaryAction.critical ? 'critical' : 'enemy', session.roundNumber);
        }

        // Log phase change
        if (result.phaseChanged && result.newPhase) {
          addLogEntry(`${legendary.name} enters phase ${result.newPhase}!`, 'system', session.roundNumber);
        }

        // Handle combat end
        if (result.combatEnded) {
          if (result.victory) {
            addLogEntry(`Victory! ${legendary.name} has been defeated!`, 'system', session.roundNumber);
            if (result.rewards) {
              setRewards(result.rewards);
              setShowRewards(true);
            }
          } else {
            addLogEntry(`Defeat... ${legendary.name} has bested you.`, 'system', session.roundNumber);
          }
        }
      } else {
        addLogEntry(result.message || 'Action failed', 'system', session.roundNumber);
      }
    } catch (error) {
      addLogEntry('Error executing action', 'system', session.roundNumber);
    } finally {
      setIsActing(false);
      setSelectedAction(null);
    }
  }, [session, onExecuteTurn, legendary.name, addLogEntry, isActing]);

  // Handle abandon hunt
  const handleAbandon = useCallback(async () => {
    setIsActing(true);
    try {
      const result = await onAbandonHunt(session.sessionId);
      if (result.success) {
        addLogEntry('You fled from combat!', 'system', session.roundNumber);
        onClose?.();
      } else {
        addLogEntry(result.message || 'Failed to flee', 'system', session.roundNumber);
      }
    } catch (error) {
      addLogEntry('Failed to abandon hunt', 'system', session.roundNumber);
    } finally {
      setIsActing(false);
      setShowAbandonConfirm(false);
    }
  }, [session.sessionId, session.roundNumber, onAbandonHunt, addLogEntry, onClose]);

  // Handle claim rewards
  const handleClaimRewards = useCallback(async () => {
    if (!onClaimRewards) return;

    setIsActing(true);
    try {
      const result = await onClaimRewards(session.legendaryId, session.sessionId);
      if (result.success) {
        addLogEntry('Rewards claimed!', 'system', session.roundNumber);
        onClose?.();
      }
    } catch (error) {
      addLogEntry('Failed to claim rewards', 'system', session.roundNumber);
    } finally {
      setIsActing(false);
    }
  }, [session.legendaryId, session.sessionId, session.roundNumber, onClaimRewards, addLogEntry, onClose]);

  // Check if combat has ended
  const combatEnded = lastResult?.combatEnded || false;
  const isVictory = lastResult?.victory || false;

  // Loading state
  const isLoading = externalLoading || isActing;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Combat Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚔️</span>
          <div>
            <h2 className="text-xl font-bold text-amber-400">Legendary Battle</h2>
            <p className="text-sm text-gray-400">Round {session.roundNumber}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded ${phaseInfo.bgColor}`}>
          <span className={phaseInfo.color}>
            Phase {session.currentPhase}/{session.totalPhases}: {phaseInfo.label}
          </span>
        </div>
      </div>

      {/* Combat Arena */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Player Side */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🤠</span>
            <div>
              <h3 className="font-bold text-green-400">You</h3>
              <p className="text-sm text-gray-400">Hunter</p>
            </div>
          </div>

          {/* Player Health Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Health</span>
              <span className={playerHealthPercent < 25 ? 'text-red-400' : 'text-green-400'}>
                {session.characterHealth}/{session.characterMaxHealth}
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  playerHealthPercent < 25 ? 'bg-red-500' :
                  playerHealthPercent < 50 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${playerHealthPercent}%` }}
              />
            </div>
          </div>

          {/* Player Effects */}
          {session.activeEffects.filter(e => e.type === 'BUFF').length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.activeEffects.filter(e => e.type === 'BUFF').map(effect => (
                <span
                  key={effect.id}
                  className="text-xs px-2 py-1 bg-green-900/30 border border-green-700/30 rounded"
                  title={effect.effect}
                >
                  {effect.name} ({effect.duration})
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* VS Divider */}
        <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
          <span className="text-4xl font-bold text-amber-400">VS</span>
          {isLoading && (
            <div className="mt-2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </Card>

        {/* Legendary Side */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🦁</span>
            <div>
              <h3 className="font-bold text-red-400">{legendary.name}</h3>
              <p className="text-sm text-gray-400">{legendary.category}</p>
            </div>
          </div>

          {/* Legendary Health Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Health</span>
              <span className={legendaryHealthPercent < 25 ? 'text-red-400' : 'text-red-300'}>
                {session.legendaryHealth}/{session.legendaryMaxHealth}
              </span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 bg-red-600"
                style={{ width: `${legendaryHealthPercent}%` }}
              />
            </div>
          </div>

          {/* Legendary Effects (debuffs on player) */}
          {session.activeEffects.filter(e => e.type === 'DEBUFF').length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.activeEffects.filter(e => e.type === 'DEBUFF').map(effect => (
                <span
                  key={effect.id}
                  className="text-xs px-2 py-1 bg-red-900/30 border border-red-700/30 rounded"
                  title={effect.effect}
                >
                  {effect.name} ({effect.duration})
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Combat Actions */}
      {!combatEnded && (
        <Card className="p-4 mb-4">
          <h3 className="font-bold text-gray-300 mb-3">Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(Object.entries(ACTION_INFO) as [HuntAction, typeof ACTION_INFO[HuntAction]][]).map(([action, info]) => (
              <Button
                key={action}
                variant={selectedAction === action ? 'primary' : 'secondary'}
                onClick={() => handleAction(action)}
                disabled={isLoading || combatEnded}
                className="flex flex-col items-center py-3"
                title={info.description}
              >
                <span className="text-2xl mb-1">{info.icon}</span>
                <span className={info.color}>{info.name}</span>
              </Button>
            ))}
          </div>

          {/* Abandon Button */}
          <div className="mt-4 border-t border-gray-700 pt-4">
            {!showAbandonConfirm ? (
              <Button
                variant="ghost"
                className="text-red-400"
                onClick={() => setShowAbandonConfirm(true)}
                disabled={isLoading}
              >
                Abandon Hunt
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-gray-400">Are you sure?</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleAbandon}
                  disabled={isLoading}
                >
                  Yes, Flee
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAbandonConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Victory/Defeat Screen */}
      {combatEnded && (
        <Card className={`p-6 mb-4 ${isVictory ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
          <div className="text-center">
            <span className="text-6xl mb-4 block">
              {isVictory ? '🏆' : '💀'}
            </span>
            <h2 className={`text-3xl font-bold mb-2 ${isVictory ? 'text-green-400' : 'text-red-400'}`}>
              {isVictory ? 'Victory!' : 'Defeat'}
            </h2>
            <p className="text-gray-400 mb-4">
              {isVictory
                ? `You have defeated ${legendary.name}!`
                : `${legendary.name} has defeated you...`
              }
            </p>

            {/* Rewards Display */}
            {isVictory && showRewards && rewards.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <h3 className="font-bold text-amber-400 mb-3">Rewards</h3>
                <div className="space-y-2">
                  {rewards.map((reward, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        {reward.type === 'GOLD' && '💰'}
                        {reward.type === 'XP' && '⭐'}
                        {reward.type === 'ITEM' && '📦'}
                        {reward.type === 'TROPHY' && '🏆'}
                        {reward.type === 'REPUTATION' && '🏅'}
                        {' '}{reward.name}
                      </span>
                      {reward.amount && (
                        <span className="text-amber-400">+{reward.amount}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              {isVictory && onClaimRewards && (
                <Button
                  variant="primary"
                  onClick={handleClaimRewards}
                  disabled={isLoading}
                >
                  Claim Rewards
                </Button>
              )}
              <Button
                variant={isVictory ? 'secondary' : 'primary'}
                onClick={onClose}
              >
                {isVictory ? 'Continue' : 'Return'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Combat Log */}
      <Card className="p-4">
        <h3 className="font-bold text-gray-300 mb-3 flex items-center gap-2">
          <span>📜</span> Combat Log
        </h3>
        <div className="h-40 overflow-y-auto bg-gray-900/50 rounded p-3 space-y-1 text-sm">
          {combatLog.length === 0 ? (
            <p className="text-gray-500 italic">Combat begins...</p>
          ) : (
            combatLog.map(entry => (
              <div
                key={entry.id}
                className={`${
                  entry.type === 'player' ? 'text-green-400' :
                  entry.type === 'enemy' ? 'text-red-400' :
                  entry.type === 'critical' ? 'text-yellow-400 font-bold' :
                  'text-gray-400 italic'
                }`}
              >
                <span className="text-gray-500">[R{entry.round}]</span> {entry.message}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Legendary Abilities Info */}
      {legendary.abilities && legendary.abilities.length > 0 && (
        <Card className="p-4 mt-4">
          <h3 className="font-bold text-gray-300 mb-3 flex items-center gap-2">
            <span>⚡</span> {legendary.name}'s Abilities
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {legendary.abilities.map((ability, idx) => (
              <div
                key={idx}
                className={`p-3 bg-gray-800/50 rounded border ${
                  session.abilitiesOnCooldown.includes(ability.id)
                    ? 'border-gray-600 opacity-50'
                    : 'border-red-700/30'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-red-400">{ability.name}</span>
                  {ability.damage && (
                    <span className="text-xs text-red-300">{ability.damage} DMG</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{ability.description}</p>
                {session.abilitiesOnCooldown.includes(ability.id) && (
                  <span className="text-xs text-gray-500 mt-1 block">On Cooldown</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default LegendaryBattle;
