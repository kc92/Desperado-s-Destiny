/**
 * Gang Wars Section Component
 * Displays active wars and war history
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { WarCard, WarHistoryTable } from '@/components/gang';
import { useGangWars, type GangWar } from '@/hooks/useGangWars';
import type { Gang } from '@desperados/shared';

interface GangWarsSectionProps {
  gang: Gang;
  onDeclareWar: () => void;
  onSelectWar: (war: GangWar) => void;
}

export const GangWarsSection: React.FC<GangWarsSectionProps> = ({
  gang,
  onDeclareWar,
  onSelectWar,
}) => {
  // Use the gang wars hook to get properly-typed war data
  const { activeWars, warHistory } = useGangWars(gang._id);

  // Filter wars where this gang is involved
  const gangWars = activeWars.filter(
    w => w.attackerGangId === gang._id || w.defenderGangId === gang._id
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Wars */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-western text-gold-light">
              Active Wars
            </h2>
            {gangWars.length === 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onDeclareWar}
              >
                Declare War
              </Button>
            )}
          </div>

          {gangWars.length === 0 ? (
            <EmptyState
              icon="🕊️"
              title="No Active Wars"
              description="Your gang is at peace. Declare war to claim new territories and expand your influence."
              actionText="Declare War"
              onAction={onDeclareWar}
              size="sm"
            />
          ) : (
            <div className="space-y-3">
              {gangWars.map(war => (
                <WarCard
                  key={war._id}
                  war={war}
                  currentGangId={gang._id}
                  onClick={() => onSelectWar(war)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* War History */}
      <Card variant="wood">
        <div className="p-6">
          <h2 className="text-xl font-western text-desert-sand mb-4">
            War History
          </h2>
          <WarHistoryTable wars={warHistory} currentGangId={gang._id} />
        </div>
      </Card>
    </div>
  );
};

export default GangWarsSection;
