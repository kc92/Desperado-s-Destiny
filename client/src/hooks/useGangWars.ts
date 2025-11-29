/**
 * useGangWars Hook
 * Manages gang war state, API calls, and Socket.io real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { socketService } from '@/services/socket.service';

export type WarStatus = 'ACTIVE' | 'ATTACKER_WON' | 'DEFENDER_WON' | 'CANCELLED';

export interface WarContribution {
  characterId: string;
  characterName: string;
  amount: number;
  contributedAt: string;
}

export interface WarLogEntry {
  timestamp: string;
  message: string;
  type: string;
}

export interface GangWar {
  _id: string;
  attackerGangId: string;
  attackerGangName: string;
  defenderGangId?: string;
  defenderGangName?: string;
  territoryId: string;
  status: WarStatus;
  declaredAt: string;
  resolveAt: string;
  attackerFunding: number;
  defenderFunding: number;
  attackerContributions: WarContribution[];
  defenderContributions: WarContribution[];
  capturePoints: number;
  warLog: WarLogEntry[];
  resolvedAt?: string;
}

export interface Territory {
  id: string;
  name: string;
  controllingGangId?: string;
  controllingGangName?: string;
}

interface UseGangWarsReturn {
  activeWars: GangWar[];
  warHistory: GangWar[];
  availableTerritories: Territory[];
  isLoading: boolean;
  error: string | null;
  fetchActiveWars: () => Promise<void>;
  fetchWarHistory: (gangId: string) => Promise<void>;
  fetchAvailableTerritories: () => Promise<void>;
  declareWar: (territoryId: string, fundingAmount: number) => Promise<boolean>;
  contributeToWar: (warId: string, amount: number) => Promise<boolean>;
  getWar: (warId: string) => Promise<GangWar | null>;
}

export const useGangWars = (gangId?: string): UseGangWarsReturn => {
  const [activeWars, setActiveWars] = useState<GangWar[]>([]);
  const [warHistory, setWarHistory] = useState<GangWar[]>([]);
  const [availableTerritories, setAvailableTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all active wars
  const fetchActiveWars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { wars: GangWar[] } }>('/wars');
      setActiveWars(response.data.data.wars || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active wars');
      console.error('[useGangWars] Fetch active wars error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch war history for a gang
  const fetchWarHistory = useCallback(async (gId: string) => {
    try {
      const response = await api.get<{ data: { wars: GangWar[] } }>(`/wars/gang/${gId}`);
      const allWars = response.data.data.wars || [];
      setWarHistory(allWars.filter(w => w.status !== 'ACTIVE'));
    } catch (err: any) {
      console.error('[useGangWars] Fetch war history error:', err);
    }
  }, []);

  // Fetch available territories for war
  const fetchAvailableTerritories = useCallback(async () => {
    try {
      const response = await api.get<{ data: { territories: Territory[] } }>('/territory');
      setAvailableTerritories(response.data.data.territories || []);
    } catch (err: any) {
      console.error('[useGangWars] Fetch territories error:', err);
    }
  }, []);

  // Declare war on a territory
  const declareWar = useCallback(async (territoryId: string, fundingAmount: number): Promise<boolean> => {
    try {
      await api.post('/wars', { territoryId, fundingAmount });
      await fetchActiveWars();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to declare war');
      console.error('[useGangWars] Declare war error:', err);
      return false;
    }
  }, [fetchActiveWars]);

  // Contribute gold to a war
  const contributeToWar = useCallback(async (warId: string, amount: number): Promise<boolean> => {
    try {
      const response = await api.post<{ data: { war: GangWar } }>(`/wars/${warId}/contribute`, { amount });
      // Update the war in active wars
      setActiveWars(prev =>
        prev.map(w => w._id === warId ? response.data.data.war : w)
      );
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to contribute to war');
      console.error('[useGangWars] Contribute error:', err);
      return false;
    }
  }, []);

  // Get single war details
  const getWar = useCallback(async (warId: string): Promise<GangWar | null> => {
    try {
      const response = await api.get<{ data: { war: GangWar } }>(`/wars/${warId}`);
      return response.data.data.war;
    } catch (err: any) {
      console.error('[useGangWars] Get war error:', err);
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchActiveWars();
    fetchAvailableTerritories();
    if (gangId) {
      fetchWarHistory(gangId);
    }
  }, [gangId, fetchActiveWars, fetchWarHistory, fetchAvailableTerritories]);

  // Socket.io listeners for real-time war updates
  useEffect(() => {
    const handleWarContributed = (data: {
      warId: string;
      territory: string;
      contributor: string;
      side: string;
      amount: number;
      newCapturePoints: number;
    }) => {
      setActiveWars(prev =>
        prev.map(w =>
          w._id === data.warId
            ? { ...w, capturePoints: data.newCapturePoints }
            : w
        )
      );
    };

    const handleWarDeclared = (data: {
      warId: string;
      territory: string;
      attacker: string;
      defender: string;
      funding: number;
    }) => {
      fetchActiveWars();
    };

    const handleTerritoryConquered = (data: {
      territory: string;
      winner: string;
      loser: string;
      capturePoints: number;
    }) => {
      fetchActiveWars();
      if (gangId) fetchWarHistory(gangId);
    };

    const handleTerritoryDefended = (data: {
      territory: string;
      defender: string;
      attacker: string;
      capturePoints: number;
    }) => {
      fetchActiveWars();
      if (gangId) fetchWarHistory(gangId);
    };

    socketService.on('territory:war_contributed' as any, handleWarContributed);
    socketService.on('territory:war_declared' as any, handleWarDeclared);
    socketService.on('territory:conquered' as any, handleTerritoryConquered);
    socketService.on('territory:defended' as any, handleTerritoryDefended);

    return () => {
      socketService.off('territory:war_contributed' as any, handleWarContributed);
      socketService.off('territory:war_declared' as any, handleWarDeclared);
      socketService.off('territory:conquered' as any, handleTerritoryConquered);
      socketService.off('territory:defended' as any, handleTerritoryDefended);
    };
  }, [gangId, fetchActiveWars, fetchWarHistory]);

  return {
    activeWars,
    warHistory,
    availableTerritories,
    isLoading,
    error,
    fetchActiveWars,
    fetchWarHistory,
    fetchAvailableTerritories,
    declareWar,
    contributeToWar,
    getWar,
  };
};

export default useGangWars;
