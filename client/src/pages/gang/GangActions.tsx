/**
 * Gang Actions Component
 * Displays gang action buttons and controlled territories
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import type { Gang } from '@desperados/shared';

interface GangActionsProps {
  gang: Gang;
  onDeclareWar: () => void;
}

export const GangActions: React.FC<GangActionsProps> = ({ gang, onDeclareWar }) => {
  return (
    <div className="space-y-4">
      <Card variant="leather">
        <div className="p-6">
          <h3 className="text-lg font-western text-desert-sand mb-4">
            Gang Actions
          </h3>
          <div className="space-y-2">
            <Button variant="primary" className="w-full">
              🏦 Gang Vault
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={onDeclareWar}
            >
              ⚔️ Declare War
            </Button>
            <Button variant="primary" className="w-full">
              🏴 Claim Territory
            </Button>
            <Button variant="primary" className="w-full">
              📢 Recruit Members
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="parchment">
        <div className="p-6">
          <h3 className="text-lg font-western text-wood-dark mb-4">
            Controlled Territories
          </h3>
          <div className="space-y-2">
            {gang.territories && gang.territories.length > 0 ? (
              gang.territories.map((territory, index) => (
                <div
                  key={typeof territory === 'string' ? territory : index}
                  className="p-2 bg-wood-grain/10 rounded text-sm text-wood-dark"
                >
                  📍 {typeof territory === 'string' ? territory : 'Unknown Territory'}
                </div>
              ))
            ) : (
              <p className="text-wood-grain text-sm">
                No territories controlled. Declare war to expand!
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GangActions;
