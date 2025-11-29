/**
 * ActionEnergyIndicator Component
 *
 * Small component to display energy cost on action cards
 * Shows whether player can afford the action
 */

import React from 'react';

interface ActionEnergyIndicatorProps {
  cost: number;
  canAfford: boolean;
  currentEnergy?: number;
  className?: string;
  showTooltip?: boolean;
}

/**
 * Energy cost indicator for action cards
 */
export const ActionEnergyIndicator: React.FC<ActionEnergyIndicatorProps> = ({
  cost,
  canAfford,
  currentEnergy,
  className = '',
  showTooltip = true,
}) => {
  const deficit = currentEnergy !== undefined ? cost - Math.floor(currentEnergy) : 0;

  const tooltipText = canAfford
    ? `Costs ${cost} energy`
    : `Need ${cost} energy (${deficit} short)`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 transition-all ${
        canAfford
          ? 'bg-green-900/30 border-green-600 text-green-400'
          : 'bg-red-900/30 border-red-600 text-red-400'
      } ${className}`}
      title={showTooltip ? tooltipText : undefined}
      role="status"
      aria-label={tooltipText}
    >
      {/* Energy icon */}
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>

      {/* Cost number */}
      <span className="font-bold text-sm">{cost}</span>

      {/* Insufficient indicator */}
      {!canAfford && (
        <svg
          className="w-4 h-4 text-red-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </div>
  );
};

export default ActionEnergyIndicator;
