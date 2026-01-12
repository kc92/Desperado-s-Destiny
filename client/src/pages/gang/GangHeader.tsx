/**
 * Gang Header Component
 * Displays gang name, stats, and treasury for the gang page
 */

import React from 'react';
import { Card } from '@/components/ui';
import { formatDollars } from '@/utils/format';
import type { Gang } from '@desperados/shared';

interface GangHeaderProps {
  gang: Gang;
}

export const GangHeader: React.FC<GangHeaderProps> = ({ gang }) => {
  return (
    <Card variant="leather" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-wood-dark/20 to-transparent"></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-western text-gold-light">
              {gang.name}
            </h1>
            <p className="text-desert-sand font-serif mt-1">
              [{gang.tag}] • Level {gang.level}
            </p>
            {gang.description && (
              <p className="text-desert-stone text-sm mt-2">
                {gang.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold-light">
              💰 {formatDollars(gang.bank || 0)}
            </div>
            <div className="text-sm text-desert-sand mt-1">
              Gang Treasury
            </div>
          </div>
        </div>

        {/* Gang Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-light">
              {gang.members?.length || 0}/{gang.maxMembers || 20}
            </div>
            <div className="text-xs text-desert-stone uppercase">Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-light">
              {(gang.reputation || 0).toLocaleString()}
            </div>
            <div className="text-xs text-desert-stone uppercase">Reputation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-light">
              {gang.territories?.length || 0}
            </div>
            <div className="text-xs text-desert-stone uppercase">Territories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-light">
              {gang.stats?.warsWon || 0}
            </div>
            <div className="text-xs text-desert-stone uppercase">Wars Won</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GangHeader;
