/**
 * Train Page
 * Railroad travel and ticket management
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useTransportStore } from '@/store/useTransportStore';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import { logger } from '@/services/logger.service';
import { trainService, TicketClass, type TrainRoute, type TrainSchedule, type TrainTicket } from '@/services/train.service';

type TabType = 'departures' | 'tickets' | 'cargo';

export const Train: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    trainRoutes,
    trainSchedules,
    myTrainTickets,
    activePursuit,
    isTrainLoading,
    error: storeError,
    loadTrainData,
    purchaseTrainTicket,
    boardTrain,
    refundTrainTicket,
    clearError,
  } = useTransportStore();
  const { success, error: showError, info } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('departures');
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Purchase form state
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<TicketClass>(TicketClass.COACH);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Current location
  const currentLocation = currentCharacter?.location || 'unknown';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (storeError) {
      setLocalError(storeError);
    }
  }, [storeError]);

  const loadData = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await loadTrainData();
    } catch (err: unknown) {
      logger.error('Failed to load train data', err as Error, { context: 'Train.loadData' });
      setLocalError('Failed to load train data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDestinations = (): string[] => {
    const destinations = new Set<string>();
    trainRoutes.forEach(route => {
      route.stops.forEach(stop => {
        if (stop.locationId !== currentLocation && stop.canDisembark) {
          destinations.add(stop.locationId);
        }
      });
    });
    return Array.from(destinations);
  };

  const getRoutesFromCurrentLocation = (): TrainRoute[] => {
    return trainRoutes.filter(route =>
      route.stops.some(stop => stop.locationId === currentLocation && stop.canBoard)
    );
  };

  const getTrainsForRoute = (routeId: string): TrainSchedule[] => {
    return trainSchedules.filter(schedule => schedule.routeId === routeId);
  };

  const calculateTicketPrice = (route: TrainRoute, ticketClass: TicketClass): number => {
    const basePrice = 50; // $50 per hour for coach
    const hours = route.totalDuration / 60;
    const multiplier = trainService.getTicketPriceMultiplier(ticketClass);
    return Math.ceil(basePrice * hours * multiplier);
  };

  const handlePurchaseTicket = async () => {
    if (!selectedDestination || !currentCharacter) return;

    const estimatedPrice = selectedRoute
      ? calculateTicketPrice(
          trainRoutes.find(r => r.routeId === selectedRoute)!,
          selectedClass
        )
      : 0;

    if (currentCharacter.gold < estimatedPrice) {
      showError('Insufficient Gold', 'You do not have enough gold for this ticket.');
      return;
    }

    setIsPurchasing(true);
    try {
      const ticket = await purchaseTrainTicket(
        currentLocation,
        selectedDestination,
        selectedClass
      );

      if (ticket) {
        success('Ticket Purchased!', `Your ${trainService.getTicketClassName(selectedClass)} ticket is ready.`);
        setShowPurchaseModal(false);
        setSelectedRoute(null);
        setSelectedDestination('');
        setSelectedClass(TicketClass.COACH);
      } else {
        showError('Purchase Failed', 'Unable to purchase ticket. Please try again.');
      }
    } catch (err: unknown) {
      logger.error('Ticket purchase failed', err as Error, { context: 'Train.handlePurchaseTicket' });
      showError('Purchase Failed', 'Unable to purchase ticket. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleBoardTrain = async (ticketId: string) => {
    try {
      const success = await boardTrain(ticketId);
      if (success) {
        info('All Aboard!', 'You have boarded the train. Have a safe journey!');
      } else {
        showError('Boarding Failed', 'Unable to board the train.');
      }
    } catch (err: unknown) {
      logger.error('Boarding failed', err as Error, { context: 'Train.handleBoardTrain' });
      showError('Boarding Failed', 'Unable to board the train.');
    }
  };

  const handleRefundTicket = async (ticketId: string) => {
    try {
      const result = await refundTrainTicket(ticketId);
      if (result.success) {
        success('Ticket Refunded', `You received ${formatDollars(result.refundAmount)} (80% refund).`);
      } else {
        showError('Refund Failed', 'Unable to refund ticket.');
      }
    } catch (err: unknown) {
      logger.error('Refund failed', err as Error, { context: 'Train.handleRefundTicket' });
      showError('Refund Failed', 'Unable to refund ticket.');
    }
  };

  const formatTime = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const canRefundTicket = (ticket: TrainTicket): boolean => {
    const departure = new Date(ticket.departureTime);
    const now = new Date();
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    return ticket.status === 'VALID' && hoursUntilDeparture >= 2;
  };

  const canBoardTicket = (ticket: TrainTicket): boolean => {
    const departure = new Date(ticket.departureTime);
    const now = new Date();
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    return ticket.status === 'VALID' && hoursUntilDeparture <= 1 && hoursUntilDeparture >= 0;
  };

  // Loading state
  if (isLoading || isTrainLoading) {
    return (
      <div className="space-y-6">
        <Card variant="parchment" className="p-6">
          <h1 className="text-2xl font-western text-amber-400 mb-2">Train Station</h1>
          <p className="text-gray-400">Loading train schedules...</p>
        </Card>
        <CardGridSkeleton count={3} columns={1} />
      </div>
    );
  }

  // Error state
  if (localError) {
    return (
      <div className="space-y-6">
        <Card variant="parchment" className="p-6">
          <h1 className="text-2xl font-western text-amber-400 mb-2">Train Station</h1>
        </Card>
        <EmptyState
          icon="alert"
          title="Error Loading Data"
          description={localError}
          action={{
            label: 'Try Again',
            onClick: () => {
              clearError();
              loadData();
            },
          }}
        />
      </div>
    );
  }

  const availableRoutes = getRoutesFromCurrentLocation();
  const validTickets = myTrainTickets.filter(t => t.status === 'VALID');

  return (
    <div className="space-y-6">
      {/* Station Header */}
      <Card variant="parchment" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-western text-amber-400 mb-1">Train Station</h1>
            <p className="text-gray-400 text-sm">
              {currentLocation} Station - Railroad Travel & Cargo
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Your Dollars</p>
            <p className="text-xl font-bold text-gold-light">{formatDollars(currentCharacter?.gold || 0)}</p>
          </div>
        </div>

        {/* Pinkerton Pursuit Warning */}
        {activePursuit && (
          <div className="mt-4 p-3 bg-blood-red/20 border border-blood-red rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blood-red">⚠️</span>
              <span className="text-blood-red font-bold">Pinkerton Pursuit Active!</span>
            </div>
            <p className="text-sm text-red-300 mt-1">
              The Pinkertons are on your trail. Travel carefully.
            </p>
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-amber-900/30 pb-2">
        {(['departures', 'tickets', 'cargo'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-western transition-colors ${
              activeTab === tab
                ? 'bg-amber-900/50 text-amber-400 border border-b-0 border-amber-700'
                : 'text-gray-400 hover:text-amber-400 hover:bg-amber-900/20'
            }`}
          >
            {tab === 'departures' && '🚂 Departures'}
            {tab === 'tickets' && `🎫 My Tickets ${validTickets.length > 0 ? `(${validTickets.length})` : ''}`}
            {tab === 'cargo' && '📦 Cargo'}
          </button>
        ))}
      </div>

      {/* Departures Tab */}
      {activeTab === 'departures' && (
        <div className="space-y-4">
          {/* Purchase Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-western text-amber-400">Available Departures</h2>
            <Button
              variant="secondary"
              onClick={() => setShowPurchaseModal(true)}
              disabled={availableRoutes.length === 0}
            >
              Purchase Ticket
            </Button>
          </div>

          {availableRoutes.length === 0 ? (
            <EmptyState
              icon="train"
              title="No Trains Available"
              description="There are no trains departing from this location."
            />
          ) : (
            <div className="grid gap-4">
              {availableRoutes.map((route) => {
                const trains = getTrainsForRoute(route.routeId);
                return (
                  <Card key={route.routeId} variant="wood" className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-western text-lg text-amber-400">{route.name}</h3>
                        <p className="text-sm text-gray-400">{route.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-400">Duration</span>
                        <p className="font-bold text-white">{trainService.formatDuration(route.totalDuration)}</p>
                      </div>
                    </div>

                    {/* Route Stops */}
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                      {route.stops.map((stop, idx) => (
                        <React.Fragment key={stop.locationId}>
                          <span
                            className={`text-sm whitespace-nowrap ${
                              stop.locationId === currentLocation
                                ? 'text-amber-400 font-bold'
                                : 'text-gray-400'
                            }`}
                          >
                            {stop.locationName}
                          </span>
                          {idx < route.stops.length - 1 && (
                            <span className="text-gray-600">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Schedules */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {trains.slice(0, 4).map((train) => (
                        <div
                          key={train.trainId}
                          className="bg-wood-darker/50 rounded p-2 text-center"
                        >
                          <p className={`text-sm font-bold ${trainService.getStatusColor(train.status)}`}>
                            {trainService.getTrainTypeName(train.trainType)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Guards: {train.guards} | Security: {train.securityLevel}/10
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Prices */}
                    <div className="mt-3 pt-3 border-t border-amber-900/30">
                      <p className="text-sm text-gray-400 mb-2">Ticket Prices:</p>
                      <div className="flex gap-4">
                        <span className="text-sm">
                          <span className="text-gray-400">Coach:</span>{' '}
                          <span className="text-gold-light">{formatDollars(calculateTicketPrice(route, TicketClass.COACH))}</span>
                        </span>
                        <span className="text-sm">
                          <span className="text-gray-400">First:</span>{' '}
                          <span className="text-gold-light">{formatDollars(calculateTicketPrice(route, TicketClass.FIRST_CLASS))}</span>
                        </span>
                        <span className="text-sm">
                          <span className="text-gray-400">Private:</span>{' '}
                          <span className="text-gold-light">{formatDollars(calculateTicketPrice(route, TicketClass.PRIVATE_CAR))}</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Train Robbery Link */}
          <Card variant="leather" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-western text-amber-400">Criminal Activities</h3>
                <p className="text-sm text-gray-400">Plan train robberies and heists</p>
              </div>
              <Link to="/game/train-robbery">
                <Button variant="danger">Plan Robbery</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-amber-400">My Tickets</h2>

          {validTickets.length === 0 ? (
            <EmptyState
              icon="ticket"
              title="No Active Tickets"
              description="Purchase a ticket to travel by train."
              action={{
                label: 'Purchase Ticket',
                onClick: () => setShowPurchaseModal(true),
              }}
            />
          ) : (
            <div className="grid gap-4">
              {validTickets.map((ticket) => (
                <Card key={ticket._id?.toString() || ticket.id} variant="wood" className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎫</span>
                        <h3 className="font-western text-amber-400">
                          {trainService.getTicketClassName(ticket.ticketClass)}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ticket.status === 'VALID' ? 'bg-green-900/50 text-green-400' :
                          ticket.status === 'USED' ? 'bg-gray-900/50 text-gray-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-white">
                        {ticket.origin} → {ticket.destination}
                      </p>
                      <p className="text-sm text-gray-400">
                        Departure: {formatTime(ticket.departureTime)} |
                        Arrival: {formatTime(ticket.arrivalTime)}
                      </p>
                      {ticket.perks && ticket.perks.length > 0 && (
                        <p className="text-xs text-purple-400 mt-1">
                          Perks: {ticket.perks.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gold-light font-bold">{formatDollars(ticket.price)}</p>
                      <div className="flex gap-2 mt-2">
                        {canBoardTicket(ticket) && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleBoardTrain(ticket._id?.toString() || ticket.id || '')}
                          >
                            Board
                          </Button>
                        )}
                        {canRefundTicket(ticket) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefundTicket(ticket._id?.toString() || ticket.id || '')}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cargo Tab */}
      {activeTab === 'cargo' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-amber-400">Cargo Shipping</h2>

          <Card variant="wood" className="p-4">
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📦</span>
              <h3 className="font-western text-lg text-amber-400 mb-2">Ship Your Cargo</h3>
              <p className="text-gray-400 mb-4">
                Send items via freight train. Rate: $0.10/lb + 5% insurance
              </p>
              <p className="text-sm text-gray-500">
                Cargo shipping interface coming soon...
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Purchase Ticket Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Purchase Train Ticket"
        size="md"
      >
        <div className="space-y-4">
          {/* Destination Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Destination</label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full bg-wood-darker border border-amber-900/50 rounded p-2 text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="">Select destination...</option>
              {getAvailableDestinations().map((dest) => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>

          {/* Ticket Class Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ticket Class</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TicketClass).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-3 rounded border transition-colors ${
                    selectedClass === cls
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-amber-900/50 hover:border-amber-600'
                  }`}
                >
                  <p className="font-western text-sm text-amber-400">
                    {trainService.getTicketClassName(cls)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {cls === TicketClass.COACH && 'Basic travel'}
                    {cls === TicketClass.FIRST_CLASS && 'Dining & comfort'}
                    {cls === TicketClass.PRIVATE_CAR && 'Full luxury'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Price Estimate */}
          {selectedDestination && (
            <div className="p-3 bg-wood-darker rounded">
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Price:</span>
                <span className="text-gold-light font-bold">
                  {formatDollars(
                    trainService.calculateTicketPrice(
                      availableRoutes[0]?.totalDuration || 60,
                      selectedClass
                    )
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowPurchaseModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handlePurchaseTicket}
              disabled={!selectedDestination || isPurchasing}
            >
              {isPurchasing ? 'Purchasing...' : 'Purchase Ticket'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Train;
