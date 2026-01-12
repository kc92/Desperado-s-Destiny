/**
 * ExpeditionHistory Component
 * Shows past expeditions in a table/list format
 */

import { Card, Button } from '@/components/ui';
import {
  expeditionService,
  ExpeditionType,
  ExpeditionStatus,
  ExpeditionOutcome,
  IExpeditionDTO,
} from '@/services/expedition.service';

interface ExpeditionHistoryProps {
  expeditions: IExpeditionDTO[];
  isLoading?: boolean;
  onRefresh: () => void;
  onSelectExpedition?: (expedition: IExpeditionDTO) => void;
}

export function ExpeditionHistory({
  expeditions,
  isLoading,
  onRefresh,
  onSelectExpedition,
}: ExpeditionHistoryProps) {
  if (expeditions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl mb-2">📜</div>
        <h3 className="text-lg font-bold text-gray-400 mb-2">No Expedition History</h3>
        <p className="text-gray-500 text-sm">
          Your completed expeditions will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-300">Recent Expeditions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="space-y-3">
        {expeditions.map(expedition => {
          const typeInfo = expeditionService.getTypeInfo(expedition.type as ExpeditionType);
          const statusInfo = expeditionService.getStatusInfo(expedition.status as ExpeditionStatus);
          const outcomeInfo = expedition.result
            ? expeditionService.getOutcomeInfo(expedition.result.outcome as ExpeditionOutcome)
            : null;

          const isCompleted = expedition.status === ExpeditionStatus.COMPLETED;
          const isFailed = expedition.status === ExpeditionStatus.FAILED;
          const isCancelled = expedition.status === ExpeditionStatus.CANCELLED;

          return (
            <Card
              key={expedition.expeditionId}
              className={`p-4 cursor-pointer transition-all hover:bg-gray-800/50 ${
                isCompleted ? 'border-gray-700' :
                isFailed ? 'border-red-900/50' :
                isCancelled ? 'border-gray-600' : ''
              }`}
              onClick={() => onSelectExpedition?.(expedition)}
            >
              <div className="flex items-start justify-between">
                {/* Left Side - Expedition Info */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeInfo.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${typeInfo.color}`}>
                        {expedition.typeName || typeInfo.name}
                      </span>
                      {outcomeInfo && (
                        <span className={`text-sm ${outcomeInfo.color}`}>
                          {outcomeInfo.icon}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {expedition.startLocationName || expedition.startLocationId}
                    </div>
                  </div>
                </div>

                {/* Right Side - Results */}
                <div className="text-right">
                  {expedition.result && isCompleted ? (
                    <>
                      <div className="text-green-400 font-bold">
                        +${expedition.result.totalGold}
                      </div>
                      <div className="text-purple-400 text-sm">
                        +{expedition.result.totalXp} XP
                      </div>
                    </>
                  ) : isCancelled ? (
                    <div className={statusInfo.color}>{statusInfo.name}</div>
                  ) : isFailed ? (
                    <div className={statusInfo.color}>{statusInfo.name}</div>
                  ) : null}
                </div>
              </div>

              {/* Footer - Timing */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
                <span>
                  {new Date(expedition.startedAt).toLocaleDateString()} at{' '}
                  {new Date(expedition.startedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span>
                  Duration: {expeditionService.getDurationInfo(expedition.durationTier).name}
                </span>
              </div>

              {/* Resources if available */}
              {expedition.result?.resources && expedition.result.resources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {expedition.result.resources.slice(0, 4).map((resource, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-300 capitalize"
                    >
                      {resource.itemName || resource.type.replace(/_/g, ' ')} x{resource.quantity}
                    </span>
                  ))}
                  {expedition.result.resources.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{expedition.result.resources.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ExpeditionHistory;
