/**
 * WarHistoryTable Component
 * Displays past gang wars with results
 */

import React from 'react';
import type { GangWar } from '@/hooks/useGangWars';

interface WarHistoryTableProps {
  wars: GangWar[];
  currentGangId?: string;
}

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export const WarHistoryTable: React.FC<WarHistoryTableProps> = ({ wars, currentGangId }) => {
  if (wars.length === 0) {
    return (
      <div className="text-center py-8 text-desert-stone">
        <p>No war history yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-wood-grain/30">
            <th className="text-left py-2 px-3 text-desert-stone font-western">Territory</th>
            <th className="text-left py-2 px-3 text-desert-stone font-western">Opponent</th>
            <th className="text-center py-2 px-3 text-desert-stone font-western">Result</th>
            <th className="text-right py-2 px-3 text-desert-stone font-western">Date</th>
          </tr>
        </thead>
        <tbody>
          {wars.map((war) => {
            const isAttacker = war.attackerGangId === currentGangId;
            const won = (isAttacker && war.status === 'ATTACKER_WON') || (!isAttacker && war.status === 'DEFENDER_WON');
            const opponent = isAttacker ? war.defenderGangName : war.attackerGangName;
            const territoryName = war.territoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            return (
              <tr key={war._id} className="border-b border-wood-grain/10 hover:bg-wood-dark/30">
                <td className="py-2 px-3 text-desert-sand">{territoryName}</td>
                <td className="py-2 px-3 text-desert-sand">{opponent || 'Unclaimed'}</td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      won
                        ? 'bg-green-600/20 text-green-500'
                        : 'bg-red-600/20 text-red-500'
                    }`}
                  >
                    {won ? 'Victory' : 'Defeat'}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-desert-stone">
                  {formatDate(war.resolvedAt || war.declaredAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WarHistoryTable;
