/**
 * SessionStats Component
 * Displays current gambling session statistics
 */

import React from 'react';
import { Card, Button } from '@/components/ui';
import { formatDollars } from '@/utils/format';
import type { GameSession } from '@/services/gambling.service';

interface SessionStatsProps {
  session: GameSession;
  gameName: string;
  onCashOut: () => void;
  isSubmitting?: boolean;
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  session,
  gameName,
  onCashOut,
  isSubmitting = false,
}) => {
  return (
    <Card variant="wood">
      <div className="p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="text-xs text-desert-stone">Game</span>
            <p className="font-bold text-desert-sand">{gameName}</p>
          </div>
          <div>
            <span className="text-xs text-desert-stone">Hands</span>
            <p className="font-bold text-desert-sand">{session.handsPlayed}</p>
          </div>
          <div>
            <span className="text-xs text-desert-stone">Wagered</span>
            <p className="font-bold text-desert-sand">{formatDollars(session.totalWagered)}</p>
          </div>
          <div>
            <span className="text-xs text-desert-stone">Won</span>
            <p className="font-bold text-green-400">{formatDollars(session.totalWon)}</p>
          </div>
          <div>
            <span className="text-xs text-desert-stone">Net</span>
            <p className={`font-bold ${session.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {session.netResult >= 0 ? '+' : ''}{formatDollars(session.netResult)}
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={onCashOut}
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Cash Out
        </Button>
      </div>
    </Card>
  );
};

export default SessionStats;
