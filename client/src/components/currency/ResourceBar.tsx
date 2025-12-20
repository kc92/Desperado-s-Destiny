import React from 'react';
import { DollarsDisplay } from './DollarsDisplay';
import { GoldResourceDisplay } from './GoldResourceDisplay';
import { SilverDisplay } from './SilverDisplay';

interface ResourceBarProps {
  dollars: number;
  goldResource?: number;
  silverResource?: number;
  className?: string;
}

/**
 * ResourceBar Component
 * Combined resources display for sidebar - shows all currencies in a compact bar format
 */
export const ResourceBar: React.FC<ResourceBarProps> = ({
  dollars,
  goldResource,
  silverResource,
  className = ''
}) => {
  const hasResources = goldResource !== undefined || silverResource !== undefined;

  return (
    <div
      className={`flex flex-col gap-1.5 p-3 bg-gray-800 rounded-lg border border-gray-700 ${className}`}
      role="region"
      aria-label="Currency and resources"
    >
      {/* Primary currency - Dollars (prominent) */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide">Cash</span>
        <DollarsDisplay amount={dollars} size="md" showIcon={true} />
      </div>

      {/* Resources section - smaller text */}
      {hasResources && (
        <div className="pt-1.5 border-t border-gray-700 space-y-1">
          {goldResource !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Gold</span>
              <GoldResourceDisplay amount={goldResource} size="sm" showIcon={true} />
            </div>
          )}
          {silverResource !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Silver</span>
              <SilverDisplay amount={silverResource} size="sm" showIcon={true} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceBar;
