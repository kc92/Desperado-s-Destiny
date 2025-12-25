/**
 * CollectionPanel Component
 * Phase R4: Collection UI
 *
 * Displays accumulated income for all properties and allows collection.
 * Implements the visit-to-collect mechanic with visual feedback.
 */

import React, { useState } from 'react';
import { Card, Button, ProgressBar } from '@/components/ui';
import { formatDollars } from '@/utils/format';
import type { PropertyWithIncome } from '@/services/property.service';

interface CollectionPanelProps {
  properties: PropertyWithIncome[];
  totalPendingIncome: number;
  maxAccumulationHours: number;
  currentLocation: string;
  onCollect: (propertyId: string) => Promise<{
    success: boolean;
    collected: number;
    message: string;
  }>;
  onCollectAll: () => Promise<{
    success: boolean;
    totalCollected: number;
    propertiesCollected: number;
    message: string;
  }>;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * Get property type icon
 */
function getPropertyIcon(type: string): string {
  const icons: Record<string, string> = {
    saloon: '🍺',
    ranch: '🐴',
    mine: '⛏️',
    shop: '🏪',
    hotel: '🏨',
    warehouse: '📦',
    office: '🏢',
    workshop: '🔧',
    homestead: '🏠',
    stable: '🐎',
  };
  return icons[type] || '🏠';
}

/**
 * Get condition tier color
 */
function getConditionColor(tier: string): string {
  switch (tier) {
    case 'excellent':
      return 'text-green-400';
    case 'good':
      return 'text-lime-400';
    case 'fair':
      return 'text-yellow-400';
    case 'worn':
      return 'text-orange-400';
    case 'dilapidated':
      return 'text-red-400';
    default:
      return 'text-desert-stone';
  }
}

/**
 * CollectionPanel component
 */
export const CollectionPanel: React.FC<CollectionPanelProps> = ({
  properties,
  totalPendingIncome,
  maxAccumulationHours,
  currentLocation,
  onCollect,
  onCollectAll,
  onClose,
  isLoading = false,
}) => {
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [isCollectingAll, setIsCollectingAll] = useState(false);
  const [collectedProperties, setCollectedProperties] = useState<Set<string>>(new Set());

  // Filter properties at current location
  const propertiesHere = properties.filter((p) => p.location === currentLocation);
  const propertiesElsewhere = properties.filter((p) => p.location !== currentLocation);

  // Calculate totals
  const incomeHere = propertiesHere.reduce((sum, p) => sum + p.pendingIncome, 0);
  const incomeElsewhere = propertiesElsewhere.reduce((sum, p) => sum + p.pendingIncome, 0);

  const handleCollect = async (propertyId: string) => {
    setCollectingId(propertyId);
    try {
      const result = await onCollect(propertyId);
      if (result.success) {
        setCollectedProperties((prev) => new Set([...prev, propertyId]));
      }
    } finally {
      setCollectingId(null);
    }
  };

  const handleCollectAll = async () => {
    setIsCollectingAll(true);
    try {
      const result = await onCollectAll();
      if (result.success) {
        // Mark all properties at this location as collected
        propertiesHere.forEach((p) => {
          setCollectedProperties((prev) => new Set([...prev, p.propertyId]));
        });
      }
    } finally {
      setIsCollectingAll(false);
    }
  };

  return (
    <Card variant="parchment" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-western text-wood-dark">Income Collection</h2>
          <p className="text-sm text-desert-stone">Visit your properties to collect accumulated income</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card variant="leather" className="p-4 text-center">
          <p className="text-xs text-desert-stone uppercase">Total Pending</p>
          <p className="text-2xl font-western text-gold-light">
            {formatDollars(totalPendingIncome)}
          </p>
        </Card>
        <Card variant="leather" className="p-4 text-center">
          <p className="text-xs text-desert-stone uppercase">Collectible Here</p>
          <p className="text-2xl font-western text-green-400">
            {formatDollars(incomeHere)}
          </p>
        </Card>
        <Card variant="leather" className="p-4 text-center">
          <p className="text-xs text-desert-stone uppercase">Visit Required</p>
          <p className="text-2xl font-western text-orange-400">
            {formatDollars(incomeElsewhere)}
          </p>
        </Card>
      </div>

      {/* Collect All Button */}
      {propertiesHere.length > 0 && incomeHere > 0 && (
        <div className="mb-6">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleCollectAll}
            disabled={isCollectingAll || isLoading}
            isLoading={isCollectingAll}
            loadingText="Collecting..."
          >
            Collect All Here ({formatDollars(incomeHere)})
          </Button>
        </div>
      )}

      {/* Properties at Current Location */}
      {propertiesHere.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-western text-desert-sand mb-3 flex items-center gap-2">
            <span className="text-green-400">●</span>
            Properties Here
          </h3>
          <div className="space-y-3">
            {propertiesHere.map((property) => {
              const isCollected = collectedProperties.has(property.propertyId);
              const accumPercent = (property.hoursAccumulated / maxAccumulationHours) * 100;

              return (
                <Card
                  key={property.propertyId}
                  variant="leather"
                  className={`p-4 ${isCollected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPropertyIcon(property.propertyType)}</span>
                      <div>
                        <p className="font-medium text-desert-sand">{property.propertyName}</p>
                        <div className="flex items-center gap-2 text-xs text-desert-stone">
                          <span>{property.hoursAccumulated}h accumulated</span>
                          {property.needsWarning && (
                            <span className={getConditionColor(property.conditionTier)}>
                              ⚠️ {property.conditionTier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-western text-gold-light">
                          {formatDollars(property.pendingIncome)}
                        </p>
                        {property.incomeMultiplier < 1 && (
                          <p className="text-xs text-orange-400">
                            {Math.round(property.incomeMultiplier * 100)}% capacity
                          </p>
                        )}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCollect(property.propertyId)}
                        disabled={
                          collectingId === property.propertyId ||
                          isLoading ||
                          isCollected ||
                          property.pendingIncome === 0
                        }
                        isLoading={collectingId === property.propertyId}
                      >
                        {isCollected ? 'Collected' : 'Collect'}
                      </Button>
                    </div>
                  </div>

                  {/* Accumulation progress bar */}
                  <div className="mt-3">
                    <ProgressBar
                      value={accumPercent}
                      max={100}
                      color={accumPercent >= 100 ? 'yellow' : 'green'}
                      showLabel={false}
                    />
                    {accumPercent >= 100 && (
                      <p className="text-xs text-orange-400 mt-1">
                        7-day cap reached - collect soon to avoid losing income!
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Properties Elsewhere */}
      {propertiesElsewhere.length > 0 && (
        <div>
          <h3 className="text-lg font-western text-desert-sand mb-3 flex items-center gap-2">
            <span className="text-orange-400">●</span>
            Visit Required
          </h3>
          <div className="space-y-3">
            {propertiesElsewhere.map((property) => {
              const accumPercent = (property.hoursAccumulated / maxAccumulationHours) * 100;

              return (
                <Card
                  key={property.propertyId}
                  variant="leather"
                  className="p-4 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPropertyIcon(property.propertyType)}</span>
                      <div>
                        <p className="font-medium text-desert-sand">{property.propertyName}</p>
                        <div className="flex items-center gap-2 text-xs text-desert-stone">
                          <span>📍 {property.location}</span>
                          <span>• {property.hoursAccumulated}h</span>
                          {property.isCritical && (
                            <span className="text-red-400">⚠️ Critical condition!</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-western text-gold-light/70">
                        {formatDollars(property.pendingIncome)}
                      </p>
                      <p className="text-xs text-desert-stone">Travel to collect</p>
                    </div>
                  </div>

                  {/* Warning for capped properties */}
                  {accumPercent >= 90 && (
                    <div className="mt-2 p-2 bg-orange-900/30 border border-orange-500/30 rounded text-xs text-orange-400">
                      {accumPercent >= 100
                        ? '⚠️ This property has hit the 7-day cap! Visit soon!'
                        : `⚠️ Nearing 7-day cap (${Math.round(accumPercent)}%)`}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="text-center py-8">
          <p className="text-desert-stone">No properties with pending income.</p>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-6 p-4 bg-wood-dark/50 rounded-lg">
        <p className="text-xs text-desert-stone text-center">
          Income accumulates hourly for up to 7 days ({maxAccumulationHours} hours).
          Visit each property to collect your earnings.
        </p>
      </div>
    </Card>
  );
};

export default CollectionPanel;
