/**
 * Gang Members Component
 * Displays the gang member roster with leader and members
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { useGangStore } from '@/store/useGangStore';
import type { Gang } from '@desperados/shared';

interface GangMembersProps {
  gang: Gang;
  onLeaveGang: () => void;
}

export const GangMembers: React.FC<GangMembersProps> = ({ gang, onLeaveGang }) => {
  const { isLoading } = useGangStore();

  // Find the leader in members array
  const leader = gang.members?.find(m => m.role === 'leader');
  const otherMembers = gang.members?.filter(m => m.role !== 'leader') || [];

  return (
    <Card variant="wood">
      <div className="p-6">
        <h2 className="text-xl font-western text-desert-sand mb-4">
          Gang Members
        </h2>

        <div className="space-y-3">
          {/* Leader */}
          {leader && (
            <div className="p-3 bg-leather/10 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="font-bold text-gold-light">
                      {leader.characterName}
                    </div>
                    <div className="text-xs text-desert-stone">
                      Leader • Level {leader.level}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gold-light">
                    ${(leader.contribution || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-desert-stone">
                    contribution
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other members */}
          {isLoading ? (
            <div className="text-center py-8">
              <ListItemSkeleton count={3} />
            </div>
          ) : otherMembers.length === 0 ? (
            <div className="text-center py-4 text-desert-stone">
              No other members yet. Recruit some outlaws!
            </div>
          ) : (
            otherMembers.map(member => (
              <div key={member.characterId} className="p-3 bg-leather/10 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {member.role === 'officer' ? '⭐' : '👤'}
                    </span>
                    <div>
                      <div className="font-bold text-desert-sand">{member.characterName}</div>
                      <div className="text-xs text-desert-stone capitalize">
                        {member.role} • Level {member.level}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gold-light">
                      ${(member.contribution || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-desert-stone">contribution</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="secondary" size="sm">
            View Roster
          </Button>
          <Button variant="secondary" size="sm">
            Manage Ranks
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onLeaveGang}
          >
            Leave Gang
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GangMembers;
