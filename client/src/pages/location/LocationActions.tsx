/**
 * Location Actions Component
 * Displays categorized actions (crimes, combat, craft, social) available at current location
 */

import React from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { DeathRiskIndicator } from '@/components/danger/DeathRiskIndicator';
import { useLocationStore } from '@/store/useLocationStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import type { Action } from '@desperados/shared';

/**
 * Calculate action danger rating (0.0-1.0) from action properties
 */
const getActionDanger = (action: any): number => {
  const baseDanger = (action.difficulty || 1) / 10;
  const typeMultiplier = action.type === 'CRIME' ? 1.3 : action.type === 'COMBAT' ? 1.2 : 1.0;
  const wantedMultiplier = action.crimeProperties?.wantedLevelIncrease
    ? 1 + (action.crimeProperties.wantedLevelIncrease * 0.1)
    : 1.0;
  return Math.min(baseDanger * typeMultiplier * wantedMultiplier, 0.95);
};

interface ActionSectionProps {
  title: string;
  icon: string;
  actions: Action[];
  colorScheme: {
    header: string;
    border: string;
    button: string;
    text: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onSelectAction: (action: Action) => void;
  playerEnergy: number;
  showDeathRisk?: boolean;
  characterCombat?: number;
}

const ActionSection: React.FC<ActionSectionProps> = ({
  title,
  icon,
  actions,
  colorScheme,
  isExpanded,
  onToggle,
  onSelectAction,
  playerEnergy,
  showDeathRisk = false,
  characterCombat = 10,
}) => {
  if (actions.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        className={`w-full flex items-center justify-between p-2 ${colorScheme.header} rounded-t border ${colorScheme.border} hover:opacity-90 transition-colors`}
        onClick={onToggle}
      >
        <span className={`font-semibold ${colorScheme.text} flex items-center gap-2`}>
          <span className="text-lg">{icon}</span>
          {title} ({actions.length})
        </span>
        <span className={colorScheme.text}>{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className={`grid gap-3 md:grid-cols-2 p-3 ${colorScheme.header.replace('/30', '/10')} border-x border-b ${colorScheme.border} rounded-b`}>
          {actions.map((action: any) => {
            const actionCard = (
              <div key={action.id} className={`p-3 bg-gray-800/50 rounded-lg border ${colorScheme.border.replace('/50', '/30')}`}>
                <h4 className={`font-semibold ${colorScheme.text.replace('-300', '-200')}`}>{action.name}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{action.description}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">⚡ {action.energyCost}</span>
                    {action.rewards?.gold > 0 && (
                      <span className="text-yellow-400">💰 {action.rewards.gold}</span>
                    )}
                    {action.rewards?.xp > 0 && (
                      <span className="text-purple-400">⭐ {action.rewards.xp} XP</span>
                    )}
                  </div>
                  {action.crimeProperties?.wantedLevelIncrease && (
                    <span className="text-red-400">⚠️ +{action.crimeProperties.wantedLevelIncrease}</span>
                  )}
                  {action.difficulty && !action.crimeProperties && (
                    <span className="text-gray-400">Diff: {action.difficulty}</span>
                  )}
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    className={colorScheme.button}
                    onClick={() => onSelectAction(action)}
                    disabled={playerEnergy < action.energyCost}
                  >
                    {action.type === 'CRIME' ? 'Attempt Crime' :
                     action.type === 'COMBAT' ? 'Fight' :
                     action.type === 'CRAFT' ? 'Craft' : 'Attempt'}
                  </Button>
                </div>
              </div>
            );

            if (showDeathRisk) {
              return (
                <DeathRiskIndicator
                  key={action.id}
                  actionDanger={getActionDanger(action)}
                  requiredSkill={action.difficulty * 10}
                  characterSkill={characterCombat}
                >
                  {actionCard}
                </DeathRiskIndicator>
              );
            }
            return actionCard;
          })}
        </div>
      )}
    </div>
  );
};

export const LocationActions: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    locationActions,
    actionsLoading,
    actionsExpanded,
    setActionsExpanded,
    setSelectedAction,
  } = useLocationStore();

  if (!locationActions) return null;

  const playerEnergy = currentCharacter?.energy || 0;
  const characterCombat = currentCharacter?.stats?.combat || 10;

  const hasAnyActions =
    locationActions.crimes.length > 0 ||
    locationActions.combat.length > 0 ||
    locationActions.craft.length > 0 ||
    locationActions.social.length > 0 ||
    locationActions.global.length > 0;

  if (!hasAnyActions) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-amber-400">Available Actions</h2>
        {actionsLoading && <LoadingSpinner size="sm" />}
      </div>

      {/* Global Social Actions */}
      <ActionSection
        title="Social"
        icon="❤️"
        actions={locationActions.global}
        colorScheme={{
          header: 'bg-pink-900/30',
          border: 'border-pink-700/50',
          button: 'bg-pink-900/50 hover:bg-pink-800/50 border-pink-700',
          text: 'text-pink-300',
        }}
        isExpanded={actionsExpanded.global || false}
        onToggle={() => setActionsExpanded('global', !actionsExpanded.global)}
        onSelectAction={setSelectedAction}
        playerEnergy={playerEnergy}
      />

      {/* Crimes */}
      <ActionSection
        title="Crimes"
        icon="♠️"
        actions={locationActions.crimes}
        colorScheme={{
          header: 'bg-red-900/30',
          border: 'border-red-700/50',
          button: 'bg-red-900/50 hover:bg-red-800/50 border-red-700',
          text: 'text-red-300',
        }}
        isExpanded={actionsExpanded.crimes || false}
        onToggle={() => setActionsExpanded('crimes', !actionsExpanded.crimes)}
        onSelectAction={setSelectedAction}
        playerEnergy={playerEnergy}
        showDeathRisk={true}
        characterCombat={characterCombat}
      />

      {/* Combat */}
      <ActionSection
        title="Combat"
        icon="♣️"
        actions={locationActions.combat}
        colorScheme={{
          header: 'bg-blue-900/30',
          border: 'border-blue-700/50',
          button: 'bg-blue-900/50 hover:bg-blue-800/50 border-blue-700',
          text: 'text-blue-300',
        }}
        isExpanded={actionsExpanded.combat || false}
        onToggle={() => setActionsExpanded('combat', !actionsExpanded.combat)}
        onSelectAction={setSelectedAction}
        playerEnergy={playerEnergy}
        showDeathRisk={true}
        characterCombat={characterCombat}
      />

      {/* Craft */}
      <ActionSection
        title="Crafting"
        icon="♦️"
        actions={locationActions.craft}
        colorScheme={{
          header: 'bg-amber-900/30',
          border: 'border-amber-700/50',
          button: 'bg-amber-900/50 hover:bg-amber-800/50 border-amber-700',
          text: 'text-amber-300',
        }}
        isExpanded={actionsExpanded.craft || false}
        onToggle={() => setActionsExpanded('craft', !actionsExpanded.craft)}
        onSelectAction={setSelectedAction}
        playerEnergy={playerEnergy}
      />

      {/* Location-Specific Social */}
      <ActionSection
        title="Special"
        icon="🤝"
        actions={locationActions.social}
        colorScheme={{
          header: 'bg-green-900/30',
          border: 'border-green-700/50',
          button: 'bg-green-900/50 hover:bg-green-800/50 border-green-700',
          text: 'text-green-300',
        }}
        isExpanded={actionsExpanded.social || false}
        onToggle={() => setActionsExpanded('social', !actionsExpanded.social)}
        onSelectAction={setSelectedAction}
        playerEnergy={playerEnergy}
      />

      {!hasAnyActions && (
        <p className="text-center text-gray-500 py-4">
          No special actions available at this location.
        </p>
      )}
    </Card>
  );
};

export default LocationActions;
