/**
 * ExpeditionResults Component
 * Modal/card showing expedition results after completion
 */

import { Card, Button } from '@/components/ui';
import {
  expeditionService,
  ExpeditionType,
  ExpeditionOutcome,
  IExpeditionDTO,
} from '@/services/expedition.service';

interface ExpeditionResultsProps {
  expedition: IExpeditionDTO;
  onDismiss: () => void;
}

export function ExpeditionResults({ expedition, onDismiss }: ExpeditionResultsProps) {
  const result = expedition.result;
  if (!result) return null;

  const typeInfo = expeditionService.getTypeInfo(expedition.type as ExpeditionType);
  const outcomeInfo = expeditionService.getOutcomeInfo(result.outcome as ExpeditionOutcome);

  const isSuccess = result.outcome === ExpeditionOutcome.SUCCESS ||
                   result.outcome === ExpeditionOutcome.CRITICAL_SUCCESS ||
                   result.outcome === ExpeditionOutcome.PARTIAL_SUCCESS;

  return (
    <Card className={`p-6 ${
      isSuccess
        ? 'border-green-500/50 bg-gradient-to-b from-green-900/20 to-transparent'
        : 'border-red-500/50 bg-gradient-to-b from-red-900/20 to-transparent'
    }`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{outcomeInfo.icon}</div>
        <h2 className={`text-2xl font-bold ${outcomeInfo.color}`}>
          {outcomeInfo.name}!
        </h2>
        <p className="text-gray-400">
          {expedition.typeName || typeInfo.name} from {expedition.startLocationName}
        </p>
      </div>

      {/* Rewards Summary */}
      {isSuccess && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              ${result.totalGold}
            </div>
            <div className="text-gray-500 text-sm">Gold Earned</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {result.totalXp}
            </div>
            <div className="text-gray-500 text-sm">XP Earned</div>
          </div>
        </div>
      )}

      {/* Resources Gathered */}
      {result.resources && result.resources.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-300 mb-3">Resources Gathered</h3>
          <div className="grid gap-2">
            {result.resources.map((resource, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-800/50 rounded p-2"
              >
                <span className="text-gray-200 capitalize">
                  {resource.itemName || resource.type.replace(/_/g, ' ')}
                </span>
                <span className="text-green-400 font-bold">
                  x{resource.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill XP */}
      {result.skillXp && result.skillXp.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-300 mb-3">Skill Experience</h3>
          <div className="space-y-2">
            {result.skillXp.map((skill, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-purple-900/30 rounded p-2"
              >
                <span className="text-purple-300 capitalize">
                  {skill.skillId.replace(/_/g, ' ')}
                </span>
                <span className="text-purple-400 font-bold">
                  +{skill.amount} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Log */}
      {result.events && result.events.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-300 mb-3">Journey Events</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {result.events.map((event, idx) => (
              <div
                key={idx}
                className={`p-3 rounded text-sm ${
                  event.outcome === 'positive'
                    ? 'bg-green-900/30 border border-green-700/30'
                    : event.outcome === 'negative'
                    ? 'bg-red-900/30 border border-red-700/30'
                    : 'bg-gray-800/50 border border-gray-700/30'
                }`}
              >
                <div className="font-bold mb-1">{event.title}</div>
                <p className="text-gray-400">{event.description}</p>
                {event.goldGained && (
                  <span className="text-green-400 text-xs block mt-1">
                    +${event.goldGained} gold
                  </span>
                )}
                {event.xpGained && (
                  <span className="text-purple-400 text-xs block">
                    +{event.xpGained} XP
                  </span>
                )}
                {event.goldLost && (
                  <span className="text-red-400 text-xs block mt-1">
                    -${event.goldLost} gold
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Discoveries */}
      {result.locationDiscovered && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-center">
          <span className="text-2xl">🗺️</span>
          <div className="text-yellow-400 font-bold mt-1">New Location Discovered!</div>
          <div className="text-yellow-300 capitalize">
            {result.locationDiscovered.replace(/-/g, ' ')}
          </div>
        </div>
      )}

      {result.tradeRouteUnlocked && (
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg text-center">
          <span className="text-2xl">🛤️</span>
          <div className="text-blue-400 font-bold mt-1">Trade Route Unlocked!</div>
          <div className="text-blue-300 capitalize">
            {result.tradeRouteUnlocked.replace(/-/g, ' ')}
          </div>
        </div>
      )}

      {/* Penalties */}
      {(result.energyLost || result.healthLost) && (
        <div className="mb-6 p-3 bg-red-900/30 rounded">
          <h3 className="font-bold text-red-400 mb-2">Expedition Losses</h3>
          <div className="flex gap-4">
            {result.energyLost && (
              <span className="text-red-300">
                -{result.energyLost} Energy
              </span>
            )}
            {result.healthLost && (
              <span className="text-red-300">
                -{result.healthLost} Health
              </span>
            )}
          </div>
        </div>
      )}

      {/* Items Lost */}
      {result.itemsLost && result.itemsLost.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-red-400 mb-2">Items Lost</h3>
          <div className="space-y-1">
            {result.itemsLost.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-red-300 text-sm"
              >
                <span className="capitalize">{item.itemName || item.type}</span>
                <span>x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dismiss Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onDismiss}
      >
        Continue
      </Button>
    </Card>
  );
}

export default ExpeditionResults;
