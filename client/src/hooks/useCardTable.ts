/**
 * useCardTable Hook
 *
 * Manages card table socket events and state for tavern/saloon card games.
 * Handles real-time updates for table creation, joining, and game start.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '@/services/socket.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

/**
 * Seat interface for card table
 */
export interface TableSeat {
  seatIndex: number;
  characterId: string | null;
  characterName: string | null;
  isReady: boolean;
  isNPC: boolean;
}

/**
 * Stakes configuration
 */
export interface TableStakes {
  enabled: boolean;
  buyIn: number;
  potTotal: number;
}

/**
 * Card table interface
 */
export interface CardTable {
  tableId: string;
  locationId: string;
  locationName: string;
  hostId: string;
  hostName: string;
  gameType: string;
  seats: TableSeat[];
  status: 'waiting' | 'in_progress' | 'finished';
  stakes: TableStakes;
  playerCount: number;
  canStart: boolean;
  createdAt: string;
}

/**
 * Game type display names
 */
export const GAME_TYPE_NAMES: Record<string, string> = {
  euchre: 'Euchre',
  spades: 'Spades',
  hearts: 'Hearts',
  bridge: 'Bridge',
  pinochle: 'Pinochle',
};

/**
 * Hook return type
 */
export interface UseCardTableReturn {
  tables: CardTable[];
  currentTable: CardTable | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;

  // Actions
  joinLocation: (locationId: string) => void;
  leaveLocation: (locationId: string) => void;
  createTable: (gameType: string, stakes?: { enabled: boolean; buyIn: number }) => Promise<boolean>;
  joinTable: (tableId: string, seatIndex: number) => Promise<boolean>;
  leaveTable: () => Promise<boolean>;
  setReady: (isReady: boolean) => Promise<boolean>;
  addNPC: (seatIndex: number) => Promise<boolean>;
  kickPlayer: (seatIndex: number) => Promise<boolean>;
  refreshTables: () => void;

  // Computed
  isHost: boolean;
  mySeat: TableSeat | null;
  mySeatIndex: number | null;
  canStartGame: boolean;
  gameStarting: boolean;
}

/**
 * Card Table Hook
 */
export function useCardTable(locationId: string | null): UseCardTableReturn {
  const { currentCharacter } = useCharacterStore();

  const [tables, setTables] = useState<CardTable[]>([]);
  const [currentTable, setCurrentTable] = useState<CardTable | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarting, setGameStarting] = useState(false);
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  const locationIdRef = useRef<string | null>(null);

  // Track socket connection status
  useEffect(() => {
    const unsubscribe = socketService.onStatusChange((status) => {
      setIsConnected(status === 'connected');
    });
    return () => unsubscribe();
  }, []);

  // Join location room when locationId changes
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !isConnected || !locationId) {
      return;
    }

    // Leave previous location if different
    if (locationIdRef.current && locationIdRef.current !== locationId) {
      socket.emit('cardTable:leave_location', { locationId: locationIdRef.current });
    }

    // Join new location
    locationIdRef.current = locationId;
    socket.emit('cardTable:join_location', { locationId });

    logger.debug('[CardTable] Joined location room', { locationId });

    return () => {
      if (locationIdRef.current) {
        socket.emit('cardTable:leave_location', { locationId: locationIdRef.current });
        locationIdRef.current = null;
      }
    };
  }, [isConnected, locationId]);

  // Set up socket event listeners
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) {
      return;
    }

    // Tables update (list of tables at location)
    const handleTablesUpdate = (data: { locationId: string; tables: CardTable[] }) => {
      if (data.locationId === locationId) {
        setTables(data.tables);
        setIsLoading(false);

        // Update current table if we're at one
        if (currentTable) {
          const updatedTable = data.tables.find(t => t.tableId === currentTable.tableId);
          if (updatedTable) {
            setCurrentTable(updatedTable);
          } else if (currentTable.status === 'finished') {
            setCurrentTable(null);
          }
        }
      }
    };

    // Single table update
    const handleTableUpdate = (data: { table: CardTable }) => {
      if (currentTable?.tableId === data.table.tableId) {
        setCurrentTable(data.table);
      }

      // Update in list
      setTables(prev =>
        prev.map(t => (t.tableId === data.table.tableId ? data.table : t))
      );
    };

    // Table created (by us)
    const handleCreated = (data: { table: CardTable }) => {
      setCurrentTable(data.table);
      setIsLoading(false);
      setError(null);
    };

    // Joined table
    const handleJoined = (data: { table: CardTable; seatIndex: number }) => {
      setCurrentTable(data.table);
      setIsLoading(false);
      setError(null);
    };

    // Left table
    const handleLeft = (data: { tableId: string }) => {
      if (currentTable?.tableId === data.tableId) {
        setCurrentTable(null);
      }
      setIsLoading(false);
    };

    // Kicked from table
    const handleKicked = (data: { tableId: string }) => {
      if (currentTable?.tableId === data.tableId) {
        setCurrentTable(null);
        setError('You were removed from the table');
      }
    };

    // Game starting
    const handleGameStarting = (data: { tableId: string; table: CardTable }) => {
      if (currentTable?.tableId === data.tableId) {
        setCurrentTable(data.table);
        setGameStarting(true);
      }
    };

    // Error handling
    const handleError = (data: { error: string; code: string }) => {
      setError(data.error);
      setIsLoading(false);
      logger.error('[CardTable] Socket error', new Error(data.error), { code: data.code });
    };

    socket.on('cardTable:tables_update', handleTablesUpdate);
    socket.on('cardTable:table_update', handleTableUpdate);
    socket.on('cardTable:created', handleCreated);
    socket.on('cardTable:joined', handleJoined);
    socket.on('cardTable:left', handleLeft);
    socket.on('cardTable:kicked', handleKicked);
    socket.on('cardTable:game_starting', handleGameStarting);
    socket.on('cardTable:error', handleError);

    return () => {
      socket.off('cardTable:tables_update', handleTablesUpdate);
      socket.off('cardTable:table_update', handleTableUpdate);
      socket.off('cardTable:created', handleCreated);
      socket.off('cardTable:joined', handleJoined);
      socket.off('cardTable:left', handleLeft);
      socket.off('cardTable:kicked', handleKicked);
      socket.off('cardTable:game_starting', handleGameStarting);
      socket.off('cardTable:error', handleError);
    };
  }, [locationId, currentTable]);

  // Actions
  const joinLocation = useCallback((locId: string) => {
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.emit('cardTable:join_location', { locationId: locId });
  }, []);

  const leaveLocation = useCallback((locId: string) => {
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.emit('cardTable:leave_location', { locationId: locId });
  }, []);

  const createTable = useCallback(async (
    gameType: string,
    stakes?: { enabled: boolean; buyIn: number }
  ): Promise<boolean> => {
    const socket = socketService.getSocket();
    if (!socket || !locationId) return false;

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setError('Request timed out');
        resolve(false);
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        socket.off('cardTable:created', onSuccess);
        socket.off('cardTable:error', onError);
      };

      const onSuccess = () => {
        cleanup();
        resolve(true);
      };

      const onError = () => {
        cleanup();
        resolve(false);
      };

      socket.once('cardTable:created', onSuccess);
      socket.once('cardTable:error', onError);

      socket.emit('cardTable:create', {
        locationId,
        gameType,
        stakes,
      });
    });
  }, [locationId]);

  const joinTable = useCallback(async (tableId: string, seatIndex: number): Promise<boolean> => {
    const socket = socketService.getSocket();
    if (!socket) return false;

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setError('Request timed out');
        resolve(false);
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        socket.off('cardTable:joined', onSuccess);
        socket.off('cardTable:error', onError);
      };

      const onSuccess = () => {
        cleanup();
        resolve(true);
      };

      const onError = () => {
        cleanup();
        resolve(false);
      };

      socket.once('cardTable:joined', onSuccess);
      socket.once('cardTable:error', onError);

      socket.emit('cardTable:join', { tableId, seatIndex });
    });
  }, []);

  const leaveTable = useCallback(async (): Promise<boolean> => {
    const socket = socketService.getSocket();
    if (!socket || !currentTable) return false;

    setIsLoading(true);

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        resolve(false);
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        socket.off('cardTable:left', onSuccess);
        socket.off('cardTable:error', onError);
      };

      const onSuccess = () => {
        cleanup();
        resolve(true);
      };

      const onError = () => {
        cleanup();
        resolve(false);
      };

      socket.once('cardTable:left', onSuccess);
      socket.once('cardTable:error', onError);

      socket.emit('cardTable:leave', { tableId: currentTable.tableId });
    });
  }, [currentTable]);

  const setReady = useCallback(async (isReady: boolean): Promise<boolean> => {
    const socket = socketService.getSocket();
    if (!socket || !currentTable) return false;

    socket.emit('cardTable:ready', {
      tableId: currentTable.tableId,
      isReady,
    });

    return true;
  }, [currentTable]);

  const addNPC = useCallback(async (seatIndex: number): Promise<boolean> => {
    const socket = socketService.getSocket();
    if (!socket || !currentTable) return false;

    socket.emit('cardTable:add_npc', {
      tableId: currentTable.tableId,
      seatIndex,
    });

    return true;
  }, [currentTable]);

  const kickPlayer = useCallback(async (seatIndex: number): Promise<boolean> => {
    const socket = socketService.getSocket();
    if (!socket || !currentTable) return false;

    socket.emit('cardTable:kick', {
      tableId: currentTable.tableId,
      seatIndex,
    });

    return true;
  }, [currentTable]);

  const refreshTables = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket || !locationId) return;
    socket.emit('cardTable:get_tables', { locationId });
  }, [locationId]);

  // Computed values
  const characterId = currentCharacter?._id;

  const isHost = Boolean(
    currentTable && characterId && currentTable.hostId === characterId
  );

  const mySeat = currentTable?.seats.find(
    s => s.characterId === characterId
  ) || null;

  const mySeatIndex = mySeat?.seatIndex ?? null;

  const canStartGame = Boolean(currentTable?.canStart);

  return {
    tables,
    currentTable,
    isLoading,
    error,
    isConnected,

    joinLocation,
    leaveLocation,
    createTable,
    joinTable,
    leaveTable,
    setReady,
    addNPC,
    kickPlayer,
    refreshTables,

    isHost,
    mySeat,
    mySeatIndex,
    canStartGame,
    gameStarting,
  };
}

export default useCardTable;
