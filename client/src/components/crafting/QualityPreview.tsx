/**
 * QualityPreview Component
 * Shows quality chance distribution based on skill level
 * Phase 4 - AAA Crafting UI
 */

import { useMemo } from 'react';
import { CraftingQuality, craftingService } from '@/services/crafting.service';

interface QualityPreviewProps {
  playerLevel: number;
  requiredLevel: number;
  stationBonus?: number;
}

interface QualityChance {
  quality: CraftingQuality;
  chance: number;
  color: string;
  bgColor: string;
}

export function QualityPreview({ playerLevel, requiredLevel, stationBonus = 0 }: QualityPreviewProps) {
  const qualityChances = useMemo(() => {
    // Base quality chances modified by skill level difference and station bonus
    const levelDiff = Math.max(0, playerLevel - requiredLevel);
    const totalBonus = levelDiff * 2 + stationBonus;

    // Base chances (should sum to 100)
    let poor = Math.max(0, 10 - levelDiff * 1.5);
    let common = 50 - totalBonus * 0.5;
    let good = 25 + totalBonus * 0.3;
    let excellent = 10 + totalBonus * 0.15;
    let masterwork = 4 + totalBonus * 0.04;
    let legendary = 1 + totalBonus * 0.01;

    // Normalize to 100%
    const total = poor + common + good + excellent + masterwork + legendary;
    const normalize = (val: number) => Math.round((val / total) * 100);

    // Clamp values
    poor = Math.max(0, normalize(poor));
    common = Math.max(0, normalize(common));
    good = Math.max(0, normalize(good));
    excellent = Math.max(0, normalize(excellent));
    masterwork = Math.max(0, normalize(masterwork));
    legendary = Math.max(0, normalize(legendary));

    // Ensure they sum to 100
    const sum = poor + common + good + excellent + masterwork + legendary;
    if (sum !== 100) {
      common += 100 - sum;
    }

    return [
      { quality: CraftingQuality.LEGENDARY, chance: legendary, color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
      { quality: CraftingQuality.MASTERWORK, chance: masterwork, color: 'text-purple-400', bgColor: 'bg-purple-500' },
      { quality: CraftingQuality.EXCELLENT, chance: excellent, color: 'text-blue-400', bgColor: 'bg-blue-500' },
      { quality: CraftingQuality.GOOD, chance: good, color: 'text-green-400', bgColor: 'bg-green-500' },
      { quality: CraftingQuality.COMMON, chance: common, color: 'text-gray-300', bgColor: 'bg-gray-400' },
      { quality: CraftingQuality.POOR, chance: poor, color: 'text-gray-500', bgColor: 'bg-gray-600' },
    ].filter(q => q.chance > 0) as QualityChance[];
  }, [playerLevel, requiredLevel, stationBonus]);

  return (
    <div className="space-y-3">
      {/* Quality Bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-gray-800">
        {qualityChances.map((q) => (
          <div
            key={q.quality}
            className={`${q.bgColor} transition-all`}
            style={{ width: `${q.chance}%` }}
            title={`${craftingService.getQualityInfo(q.quality).name}: ${q.chance}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {qualityChances.map(q => (
          <div key={q.quality} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${q.bgColor}`} />
              <span className={q.color}>{craftingService.getQualityInfo(q.quality).name}</span>
            </div>
            <span className="text-gray-400">{q.chance}%</span>
          </div>
        ))}
      </div>

      {/* Skill Bonus Info */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
        <div className="flex justify-between">
          <span>Your Level:</span>
          <span className={playerLevel >= requiredLevel ? 'text-blue-400' : 'text-red-400'}>
            {playerLevel}
          </span>
        </div>
        {playerLevel > requiredLevel && (
          <div className="flex justify-between mt-1">
            <span>Skill Bonus:</span>
            <span className="text-green-400">+{(playerLevel - requiredLevel) * 2}% quality</span>
          </div>
        )}
        {stationBonus > 0 && (
          <div className="flex justify-between mt-1">
            <span>Station Bonus:</span>
            <span className="text-amber-400">+{stationBonus}% quality</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default QualityPreview;
