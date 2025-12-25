/**
 * IncomeSummary Component
 * Phase R4: Collection UI
 *
 * A compact widget showing quick income stats and collection summary.
 * Can be displayed in the property grid view or sidebar.
 */

import React from 'react';
import { Card, Button, ProgressBar } from '@/components/ui';
import { formatDollars } from '@/utils/format';
import type { PropertyWithIncome } from '@/services/property.service';

interface IncomeSummaryProps {
  properties: PropertyWithIncome[];
  totalPendingIncome: number;
  maxAccumulationHours: number;
  currentLocation: string;
  onViewDetails: () => void;
  compact?: boolean;
}

/**
 * Calculate overall accumulation status
 */
function getOverallStatus(
  properties: PropertyWithIncome[],
  maxHours: number
): {
  color: string;
  label: string;
  urgency: 'none' | 'low' | 'medium' | 'high';
} {
  if (properties.length === 0) {
    return { color: 'text-desert-stone', label: 'No income', urgency: 'none' };
  }

  const maxAccum = Math.max(...properties.map((p) => p.hoursAccumulated));
  const percent = (maxAccum / maxHours) * 100;

  if (percent >= 100) {
    return { color: 'text-red-400', label: 'Cap reached!', urgency: 'high' };
  }
  if (percent >= 80) {
    return { color: 'text-orange-400', label: 'Near cap', urgency: 'medium' };
  }
  if (percent >= 50) {
    return { color: 'text-yellow-400', label: 'Accumulating', urgency: 'low' };
  }
  return { color: 'text-green-400', label: 'Healthy', urgency: 'none' };
}

/**
 * Format hours to days/hours
 */
function formatAccumulationTime(hours: number): string {
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return `${days}d`;
  }
  return `${days}d ${remainingHours}h`;
}

/**
 * IncomeSummary component
 */
export const IncomeSummary: React.FC<IncomeSummaryProps> = ({
  properties,
  totalPendingIncome,
  maxAccumulationHours,
  currentLocation,
  onViewDetails,
  compact = false,
}) => {
  // Calculate stats
  const propertiesHere = properties.filter((p) => p.location === currentLocation);
  const incomeHere = propertiesHere.reduce((sum, p) => sum + p.pendingIncome, 0);
  const avgAccumulation =
    properties.length > 0
      ? properties.reduce((sum, p) => sum + p.hoursAccumulated, 0) / properties.length
      : 0;
  const status = getOverallStatus(properties, maxAccumulationHours);

  // Count properties with warnings
  const propertiesNeedingAttention = properties.filter((p) => p.needsWarning || p.isCritical);
  const propertiesAtCap = properties.filter(
    (p) => p.hoursAccumulated >= maxAccumulationHours
  );

  if (compact) {
    // Compact version for sidebar or quick view
    return (
      <Card
        variant="leather"
        className="p-4 cursor-pointer hover:bg-wood-dark/70 transition-colors"
        onClick={onViewDetails}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-desert-stone">Pending Income</p>
              <p className="text-lg font-western text-gold-light">
                {formatDollars(totalPendingIncome)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs ${status.color}`}>{status.label}</span>
            {propertiesAtCap.length > 0 && (
              <p className="text-xs text-red-400">{propertiesAtCap.length} at cap!</p>
            )}
          </div>
        </div>
        {incomeHere > 0 && (
          <div className="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded text-xs text-green-400">
            {formatDollars(incomeHere)} collectible here
          </div>
        )}
      </Card>
    );
  }

  // Full version
  return (
    <Card variant="parchment" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-western text-wood-dark">Income Overview</h3>
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          View All
        </Button>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-wood-dark/30 rounded-lg">
          <p className="text-xs text-desert-stone uppercase">Total Pending</p>
          <p className="text-2xl font-western text-gold-light">
            {formatDollars(totalPendingIncome)}
          </p>
        </div>
        <div className="text-center p-3 bg-wood-dark/30 rounded-lg">
          <p className="text-xs text-desert-stone uppercase">Properties</p>
          <p className="text-2xl font-western text-desert-sand">{properties.length}</p>
        </div>
      </div>

      {/* Accumulation status */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-desert-stone">Avg. Accumulation</span>
          <span className={status.color}>
            {formatAccumulationTime(avgAccumulation)} / {formatAccumulationTime(maxAccumulationHours)}
          </span>
        </div>
        <ProgressBar
          value={(avgAccumulation / maxAccumulationHours) * 100}
          max={100}
          color={status.urgency === 'high' ? 'red' : status.urgency === 'medium' ? 'yellow' : 'green'}
          showLabel={false}
        />
      </div>

      {/* Collectible here */}
      {incomeHere > 0 && (
        <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-400 font-medium">Collectible Here</p>
              <p className="text-xs text-green-400/70">
                {propertiesHere.length} {propertiesHere.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <p className="text-xl font-western text-green-400">{formatDollars(incomeHere)}</p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {propertiesNeedingAttention.length > 0 && (
        <div className="p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-sm text-orange-400">
            <span>⚠️</span>
            <span>
              {propertiesNeedingAttention.length}{' '}
              {propertiesNeedingAttention.length === 1 ? 'property needs' : 'properties need'}{' '}
              attention
            </span>
          </div>
        </div>
      )}

      {/* At cap warning */}
      {propertiesAtCap.length > 0 && (
        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <span>🔴</span>
            <span>
              {propertiesAtCap.length} {propertiesAtCap.length === 1 ? 'property has' : 'properties have'}{' '}
              hit the 7-day cap!
            </span>
          </div>
        </div>
      )}

      {/* Monthly estimate */}
      <div className="pt-3 border-t border-wood-grain/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-desert-stone">Est. Monthly Income</span>
          <span className="text-gold-light font-medium">
            ~{formatDollars(Math.round((totalPendingIncome / Math.max(avgAccumulation, 1)) * 24 * 30))}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default IncomeSummary;
