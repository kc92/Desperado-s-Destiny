/**
 * TavernTables Component
 *
 * Displays card game tables at a tavern/saloon location.
 * Allows players to create, join, and manage casual card games.
 */

import React, { useState } from 'react';
import { Card, Button, Modal, LoadingSpinner } from '@/components/ui';
import { useCardTable, TableSeat, GAME_TYPE_NAMES } from '@/hooks/useCardTable';
import { useCharacterStore } from '@/store/useCharacterStore';

interface TavernTablesProps {
  locationId: string;
  locationName: string;
}

/**
 * Game type options for table creation
 */
const GAME_TYPES = [
  { value: 'euchre', label: 'Euchre', description: 'Fast-paced trick-taking with trump calling' },
  { value: 'spades', label: 'Spades', description: 'Strategic bidding with nil bids and bag penalties' },
  { value: 'hearts', label: 'Hearts', description: 'Avoid points or shoot the moon' },
  { value: 'bridge', label: 'Bridge', description: 'Complex bidding and declarer play' },
  { value: 'pinochle', label: 'Pinochle', description: 'Melding combinations plus trick-taking' },
];

export const TavernTables: React.FC<TavernTablesProps> = ({
  locationId,
  locationName,
}) => {
  const { currentCharacter } = useCharacterStore();

  const {
    tables,
    currentTable,
    isLoading,
    error,
    isConnected,
    createTable,
    joinTable,
    leaveTable,
    setReady,
    addNPC,
    kickPlayer,
    isHost,
    mySeat,
    // mySeatIndex, // Available but unused - kept in hook for future use
    canStartGame,
    gameStarting,
  } = useCardTable(locationId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState('euchre');
  const [stakesEnabled, setStakesEnabled] = useState(false);
  const [buyIn, setBuyIn] = useState(10);

  // Handle table creation
  const handleCreateTable = async () => {
    const success = await createTable(selectedGameType, {
      enabled: stakesEnabled,
      buyIn: stakesEnabled ? buyIn : 0,
    });

    if (success) {
      setShowCreateModal(false);
    }
  };

  // Handle joining a table
  const handleJoinSeat = async (tableId: string, seatIndex: number) => {
    await joinTable(tableId, seatIndex);
  };

  // Render seat
  const renderSeat = (seat: TableSeat, tableId: string, isMyTable: boolean) => {
    const isEmpty = !seat.characterId && !seat.isNPC;
    const isMe = seat.characterId === currentCharacter?._id;
    const teamLabel = seat.seatIndex % 2 === 0 ? 'Team A' : 'Team B';

    return (
      <div
        key={seat.seatIndex}
        className={`
          p-3 rounded-lg border-2 transition-all
          ${isEmpty ? 'border-dashed border-gray-600 bg-gray-800/30' : 'border-solid'}
          ${isMe ? 'border-gold-light bg-gold-light/10' : isEmpty ? '' : 'border-gray-500 bg-gray-700/50'}
          ${seat.isReady ? 'ring-2 ring-green-500' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">{teamLabel}</span>
          {seat.isNPC && <span className="text-xs text-purple-400">AI</span>}
          {seat.isReady && <span className="text-xs text-green-400">Ready</span>}
        </div>

        {isEmpty ? (
          <div className="text-center py-2">
            {isMyTable && isHost ? (
              <div className="space-y-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={() => addNPC(seat.seatIndex)}
                >
                  + Add AI
                </Button>
              </div>
            ) : !currentTable ? (
              <Button
                size="sm"
                variant="primary"
                className="w-full text-xs"
                onClick={() => handleJoinSeat(tableId, seat.seatIndex)}
              >
                Sit Here
              </Button>
            ) : (
              <span className="text-gray-500 text-sm">Empty</span>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className={`font-medium ${isMe ? 'text-gold-light' : 'text-white'}`}>
              {seat.characterName}
            </div>
            {isMyTable && isHost && !isMe && (
              <Button
                size="sm"
                variant="danger"
                className="mt-1 text-xs"
                onClick={() => kickPlayer(seat.seatIndex)}
              >
                Kick
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render current table (when seated)
  const renderCurrentTable = () => {
    if (!currentTable) return null;

    return (
      <Card className="p-4 border-2 border-gold-light bg-gradient-to-br from-wood-dark to-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gold-light">
              {GAME_TYPE_NAMES[currentTable.gameType] || currentTable.gameType}
            </h3>
            <p className="text-sm text-gray-400">
              Hosted by {currentTable.hostName}
            </p>
          </div>
          <div className="text-right">
            {currentTable.stakes.enabled && (
              <div className="text-yellow-400 text-sm">
                Pot: ${currentTable.stakes.potTotal}
              </div>
            )}
            <div className="text-xs text-gray-500">
              {currentTable.playerCount}/4 players
            </div>
          </div>
        </div>

        {/* Seats grid - 2x2 for team layout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentTable.seats.map(seat =>
            renderSeat(seat, currentTable.tableId, true)
          )}
        </div>

        {/* Game controls */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          {mySeat && !mySeat.isReady ? (
            <Button
              variant="primary"
              onClick={() => setReady(true)}
              disabled={isLoading}
            >
              Ready Up
            </Button>
          ) : mySeat?.isReady ? (
            <Button
              variant="secondary"
              onClick={() => setReady(false)}
              disabled={isLoading}
            >
              Not Ready
            </Button>
          ) : null}

          <Button
            variant="danger"
            onClick={leaveTable}
            disabled={isLoading}
          >
            Leave Table
          </Button>
        </div>

        {canStartGame && (
          <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-700 text-center">
            <p className="text-green-400 font-medium">
              All players ready! Game starting...
            </p>
          </div>
        )}

        {gameStarting && (
          <div className="mt-4 p-4 bg-gold-light/20 rounded-lg border border-gold-light text-center">
            <LoadingSpinner size="sm" className="mx-auto mb-2" />
            <p className="text-gold-light font-medium">
              Starting game...
            </p>
          </div>
        )}
      </Card>
    );
  };

  // Render table list (when not seated)
  const renderTableList = () => {
    if (currentTable) return null;

    const waitingTables = tables.filter(t => t.status === 'waiting');

    return (
      <div className="space-y-4">
        {/* Create table button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gold-light">Card Tables</h3>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            + Create Table
          </Button>
        </div>

        {!isConnected && (
          <div className="p-3 bg-red-900/30 rounded-lg border border-red-700 text-center">
            <p className="text-red-400 text-sm">
              Connecting to server...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/30 rounded-lg border border-red-700">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tables list */}
        {waitingTables.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🃏</div>
            <p>No active tables at {locationName}</p>
            <p className="text-sm mt-1">Be the first to create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitingTables.map(table => (
              <Card
                key={table.tableId}
                className="p-4 hover:border-gold-light/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {GAME_TYPE_NAMES[table.gameType] || table.gameType}
                      </span>
                      {table.stakes.enabled && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded">
                          ${table.stakes.buyIn} buy-in
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      Hosted by {table.hostName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {table.playerCount}/4
                    </div>
                    <p className="text-xs text-gray-500">players</p>
                  </div>
                </div>

                {/* Available seats preview */}
                <div className="mt-3 flex gap-2">
                  {table.seats.map(seat => {
                    const isEmpty = !seat.characterId && !seat.isNPC;
                    return (
                      <div
                        key={seat.seatIndex}
                        className={`
                          flex-1 p-2 rounded text-center text-xs
                          ${isEmpty
                            ? 'bg-green-900/30 border border-green-700 text-green-400 cursor-pointer hover:bg-green-900/50'
                            : 'bg-gray-700/50 border border-gray-600 text-gray-400'
                          }
                        `}
                        onClick={() => isEmpty && handleJoinSeat(table.tableId, seat.seatIndex)}
                      >
                        {isEmpty ? 'Open' : seat.isNPC ? 'AI' : seat.characterName?.split(' ')[0]}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Create table modal
  const renderCreateModal = () => (
    <Modal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      title="Create Card Table"
    >
      <div className="space-y-4 p-4">
        {/* Game type selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Game Type
          </label>
          <div className="space-y-2">
            {GAME_TYPES.map(game => (
              <label
                key={game.value}
                className={`
                  flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors
                  ${selectedGameType === game.value
                    ? 'border-gold-light bg-gold-light/10'
                    : 'border-gray-600 hover:border-gray-500'
                  }
                `}
              >
                <input
                  type="radio"
                  name="gameType"
                  value={game.value}
                  checked={selectedGameType === game.value}
                  onChange={(e) => setSelectedGameType(e.target.value)}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium text-white">{game.label}</div>
                  <div className="text-sm text-gray-400">{game.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Stakes toggle */}
        <div className="border-t border-gray-700 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={stakesEnabled}
              onChange={(e) => setStakesEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-gold-light focus:ring-gold-light"
            />
            <span className="text-white">Enable stakes (gold wagering)</span>
          </label>

          {stakesEnabled && (
            <div className="mt-3 pl-7">
              <label className="block text-sm text-gray-400 mb-1">
                Buy-in amount
              </label>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">$</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={buyIn}
                  onChange={(e) => setBuyIn(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Each player pays this to join. Winner takes the pot.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleCreateTable}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Table'}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="space-y-4">
      {currentTable ? renderCurrentTable() : renderTableList()}
      {renderCreateModal()}
    </div>
  );
};

export default TavernTables;
