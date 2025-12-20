/**
 * Stagecoach Page
 * Stagecoach travel booking and journey tracking
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
import { stagecoachService, type StagecoachRoute, type StagecoachTicket } from '@/services/stagecoach.service';

type TabType = 'routes' | 'booking' | 'journey' | 'history';

export const Stagecoach: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    stagecoachRoutes,
    wayStations,
    activeStagecoachTicket,
    travelHistory,
    isStagecoachLoading,
    error: storeError,
    loadStagecoachData,
    bookStagecoach,
    cancelStagecoachTicket,
    getJourneyProgress,
    clearError,
  } = useTransportStore();
  const { success, error: showError } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('routes');
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Booking form state
  const [selectedRoute, setSelectedRoute] = useState<StagecoachRoute | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [luggageWeight, setLuggageWeight] = useState<number>(0);
  const [weaponDeclared, setWeaponDeclared] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Journey tracking state
  const [journeyProgress, setJourneyProgress] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Current location
  const currentLocation = currentCharacter?.locationId || 'unknown';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (storeError) {
      setLocalError(storeError);
    }
  }, [storeError]);

  // Auto-refresh journey progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStagecoachTicket && activeStagecoachTicket.status === 'traveling') {
      interval = setInterval(() => {
        refreshJourneyProgress();
      }, 30000); // Every 30 seconds
    }
    return () => clearInterval(interval);
  }, [activeStagecoachTicket]);

  const loadData = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await loadStagecoachData();
    } catch (err: unknown) {
      logger.error('Failed to load stagecoach data', err as Error, { context: 'Stagecoach.loadData' });
      setLocalError('Failed to load stagecoach data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshJourneyProgress = async () => {
    if (!activeStagecoachTicket) return;

    setIsRefreshing(true);
    try {
      const progress = await getJourneyProgress(activeStagecoachTicket.id);
      setJourneyProgress(progress);
    } catch (err: unknown) {
      logger.error('Failed to refresh progress', err as Error, { context: 'Stagecoach.refreshJourneyProgress' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAvailableRoutes = (): StagecoachRoute[] => {
    return stagecoachRoutes.filter(route =>
      route.isActive && route.stops.some(stop =>
        stop.locationId === currentLocation && stop.canBoard
      )
    );
  };

  const getDestinationsForRoute = (route: StagecoachRoute): string[] => {
    const currentStopIdx = route.stops.findIndex(s => s.locationId === currentLocation);
    return route.stops
      .filter((stop, idx) => idx > currentStopIdx && stop.canDisembark)
      .map(stop => stop.locationId);
  };

  const calculateFare = (route: StagecoachRoute, destination: string): number => {
    const currentStopIdx = route.stops.findIndex(s => s.locationId === currentLocation);
    const destStopIdx = route.stops.findIndex(s => s.locationId === destination);

    if (currentStopIdx === -1 || destStopIdx === -1) return 0;

    // Calculate distance portion
    const totalStops = route.stops.length;
    const stopsToTravel = destStopIdx - currentStopIdx;
    const distanceRatio = stopsToTravel / (totalStops - 1);
    const estimatedDistance = route.totalDistance * distanceRatio;

    return stagecoachService.calculateFare(route, estimatedDistance);
  };

  const handleBookTicket = async () => {
    if (!selectedRoute || !selectedDestination || !currentCharacter) return;

    const fare = calculateFare(selectedRoute, selectedDestination);

    if (currentCharacter.gold < fare) {
      showError('Insufficient Gold', `You need ${formatDollars(fare)} to book this journey.`);
      return;
    }

    setIsBooking(true);
    try {
      const ticket = await bookStagecoach(
        selectedRoute.id,
        currentLocation,
        selectedDestination,
        undefined, // Next available departure
        luggageWeight,
        weaponDeclared
      );

      if (ticket) {
        success('Ticket Booked!', 'Your stagecoach journey is confirmed.');
        setShowBookingModal(false);
        setSelectedRoute(null);
        setSelectedDestination('');
        setLuggageWeight(0);
        setWeaponDeclared(false);
        setActiveTab('journey');
      } else {
        showError('Booking Failed', 'Unable to book stagecoach.');
      }
    } catch (err: unknown) {
      logger.error('Booking failed', err as Error, { context: 'Stagecoach.handleBookTicket' });
      showError('Booking Failed', 'Unable to book stagecoach.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!activeStagecoachTicket) return;

    try {
      const result = await cancelStagecoachTicket(activeStagecoachTicket.id);
      if (result.success) {
        success('Ticket Cancelled', `Refund: ${formatDollars(result.refundAmount)} (80%)`);
        setActiveTab('routes');
      } else {
        showError('Cancellation Failed', 'Unable to cancel ticket.');
      }
    } catch (err: unknown) {
      logger.error('Cancellation failed', err as Error, { context: 'Stagecoach.handleCancelTicket' });
      showError('Cancellation Failed', 'Unable to cancel ticket.');
    }
  };

  const formatTime = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const canCancelTicket = (ticket: StagecoachTicket): boolean => {
    const departure = new Date(ticket.departureTime);
    const now = new Date();
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    return (ticket.status === 'booked' || ticket.status === 'boarding') && hoursUntilDeparture >= 1;
  };

  // Loading state
  if (isLoading || isStagecoachLoading) {
    return (
      <div className="space-y-6">
        <Card variant="parchment" className="p-6">
          <h1 className="text-2xl font-western text-amber-400 mb-2">Stagecoach Depot</h1>
          <p className="text-gray-400">Loading routes...</p>
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
          <h1 className="text-2xl font-western text-amber-400 mb-2">Stagecoach Depot</h1>
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

  const availableRoutes = getAvailableRoutes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="parchment" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-western text-amber-400 mb-1">Stagecoach Depot</h1>
            <p className="text-gray-400 text-sm">
              {currentLocation} - Travel across the frontier
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Your Dollars</p>
            <p className="text-xl font-bold text-gold-light">{formatDollars(currentCharacter?.gold || 0)}</p>
          </div>
        </div>

        {/* Active Journey Alert */}
        {activeStagecoachTicket && activeStagecoachTicket.status === 'traveling' && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-400">🚌</span>
              <span className="text-green-400 font-bold">Journey in Progress!</span>
            </div>
            <p className="text-sm text-green-300 mt-1">
              Traveling to {activeStagecoachTicket.destinationLocation}
            </p>
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-amber-900/30 pb-2">
        {(['routes', 'booking', 'journey', 'history'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-western transition-colors ${
              activeTab === tab
                ? 'bg-amber-900/50 text-amber-400 border border-b-0 border-amber-700'
                : 'text-gray-400 hover:text-amber-400 hover:bg-amber-900/20'
            }`}
          >
            {tab === 'routes' && '🗺️ Routes'}
            {tab === 'booking' && '🎫 Book'}
            {tab === 'journey' && `🚌 Journey ${activeStagecoachTicket ? '!' : ''}`}
            {tab === 'history' && '📜 History'}
          </button>
        ))}
      </div>

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-western text-amber-400">Available Routes</h2>
            <Link to="/game/stagecoach-ambush">
              <Button variant="danger" size="sm">Plan Ambush</Button>
            </Link>
          </div>

          {availableRoutes.length === 0 ? (
            <EmptyState
              icon="map"
              title="No Routes Available"
              description="No stagecoaches depart from this location."
            />
          ) : (
            <div className="grid gap-4">
              {availableRoutes.map((route) => (
                <Card key={route.id} variant="wood" className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-western text-lg text-amber-400">{route.name}</h3>
                      <p className="text-sm text-gray-400">{route.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${stagecoachService.getDangerColor(route.dangerLevel)}`}>
                        {stagecoachService.getDangerName(route.dangerLevel)}
                      </span>
                      <p className="text-xs text-gray-400">Danger: {route.dangerLevel}/10</p>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-400">Distance:</span>{' '}
                      <span className="text-white">{stagecoachService.formatDistance(route.totalDistance)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>{' '}
                      <span className="text-white">{stagecoachService.formatDuration(route.baseDuration)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Schedule:</span>{' '}
                      <span className="text-white">{route.frequency}</span>
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

                  {/* Terrain Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {route.terrain.map((terrain, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded"
                      >
                        {stagecoachService.getTerrainName(terrain)}
                      </span>
                    ))}
                  </div>

                  {/* Fare & Book Button */}
                  <div className="flex justify-between items-center pt-3 border-t border-amber-900/30">
                    <div>
                      <span className="text-gray-400 text-sm">Base Fare:</span>{' '}
                      <span className="text-gold-light font-bold">{formatDollars(route.fare.base)}</span>
                      <span className="text-gray-400 text-xs ml-1">+ {formatDollars(route.fare.perMile)}/mi</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedRoute(route);
                        setShowBookingModal(true);
                      }}
                    >
                      Book Journey
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Way Stations Info */}
          {wayStations.length > 0 && (
            <Card variant="leather" className="p-4">
              <h3 className="font-western text-amber-400 mb-3">Way Stations Along Routes</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {wayStations.slice(0, 4).map((station) => (
                  <div key={station.id} className="bg-wood-darker p-3 rounded">
                    <p className="font-western text-amber-300">{station.name}</p>
                    <p className="text-xs text-gray-400">{station.description}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      {station.services.food && <span className="text-green-400">🍖 Food</span>}
                      {station.services.lodging && <span className="text-blue-400">🛏️ Lodging</span>}
                      {station.services.repairs && <span className="text-orange-400">🔧 Repairs</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Booking Tab */}
      {activeTab === 'booking' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-amber-400">Book Journey</h2>

          {activeStagecoachTicket ? (
            <EmptyState
              icon="ticket"
              title="Active Booking"
              description="You already have an active stagecoach booking."
              action={{
                label: 'View Journey',
                onClick: () => setActiveTab('journey'),
              }}
            />
          ) : availableRoutes.length === 0 ? (
            <EmptyState
              icon="map"
              title="No Routes Available"
              description="No stagecoaches depart from this location."
            />
          ) : (
            <Card variant="wood" className="p-4">
              <p className="text-gray-400 mb-4">Select a route from the Routes tab to book a journey.</p>
              <Button
                variant="secondary"
                onClick={() => setActiveTab('routes')}
              >
                View Routes
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Journey Tab */}
      {activeTab === 'journey' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-amber-400">Active Journey</h2>

          {!activeStagecoachTicket ? (
            <EmptyState
              icon="stagecoach"
              title="No Active Journey"
              description="Book a stagecoach to start traveling."
              action={{
                label: 'Book Journey',
                onClick: () => setActiveTab('routes'),
              }}
            />
          ) : (
            <Card variant="wood" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🚌</span>
                <div>
                  <h3 className="font-western text-amber-400 text-lg">
                    {activeStagecoachTicket.departureLocation} → {activeStagecoachTicket.destinationLocation}
                  </h3>
                  <span className={`text-sm px-2 py-0.5 rounded ${stagecoachService.getTicketStatusColor(activeStagecoachTicket.status)}`}>
                    {stagecoachService.getStatusName(activeStagecoachTicket.status as any)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Departure</p>
                  <p className="text-white font-bold">{formatTime(activeStagecoachTicket.departureTime)}</p>
                  <p className="text-xs text-gray-400">{formatDate(activeStagecoachTicket.departureTime)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Est. Arrival</p>
                  <p className="text-white font-bold">{formatTime(activeStagecoachTicket.estimatedArrival)}</p>
                  <p className="text-xs text-gray-400">{formatDate(activeStagecoachTicket.estimatedArrival)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Seat</p>
                  <p className="text-white">#{activeStagecoachTicket.seatNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Fare Paid</p>
                  <p className="text-gold-light font-bold">{formatDollars(activeStagecoachTicket.fare)}</p>
                </div>
              </div>

              {/* Progress Bar (if traveling) */}
              {activeStagecoachTicket.status === 'traveling' && journeyProgress && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-amber-400">{journeyProgress.currentPosition?.progressPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-wood-darker rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all"
                      style={{ width: `${journeyProgress.currentPosition?.progressPercent || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{activeStagecoachTicket.departureLocation}</span>
                    <span>{activeStagecoachTicket.destinationLocation}</span>
                  </div>
                </div>
              )}

              {/* Journey Events */}
              {journeyProgress?.events && journeyProgress.events.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Journey Events</p>
                  <div className="space-y-2">
                    {journeyProgress.events.map((event: any, idx: number) => (
                      <div key={idx} className="bg-wood-darker p-2 rounded text-sm">
                        <span className="text-amber-400">{event.type}:</span>{' '}
                        <span className="text-gray-300">{event.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {activeStagecoachTicket.status === 'traveling' && (
                  <Button
                    variant="ghost"
                    onClick={refreshJourneyProgress}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
                  </Button>
                )}
                {canCancelTicket(activeStagecoachTicket) && (
                  <Button
                    variant="danger"
                    onClick={handleCancelTicket}
                  >
                    Cancel Journey (80% Refund)
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-xl font-western text-amber-400">Travel History</h2>

          {travelHistory.length === 0 ? (
            <EmptyState
              icon="history"
              title="No Travel History"
              description="Your completed journeys will appear here."
            />
          ) : (
            <div className="grid gap-3">
              {travelHistory.slice(0, 10).map((ticket) => (
                <Card key={ticket.id} variant="wood" className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white">
                        {ticket.departureLocation} → {ticket.destinationLocation}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(ticket.departureTime)} at {formatTime(ticket.departureTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm px-2 py-0.5 rounded ${stagecoachService.getTicketStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <p className="text-xs text-gold-light mt-1">{formatDollars(ticket.fare)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Stagecoach"
        size="md"
      >
        {selectedRoute && (
          <div className="space-y-4">
            <div className="bg-wood-darker p-3 rounded">
              <h3 className="font-western text-amber-400">{selectedRoute.name}</h3>
              <p className="text-sm text-gray-400">{selectedRoute.description}</p>
            </div>

            {/* Destination Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Destination</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full bg-wood-darker border border-amber-900/50 rounded p-2 text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="">Select destination...</option>
                {getDestinationsForRoute(selectedRoute).map((dest) => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            {/* Luggage Weight */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Luggage Weight (lbs)</label>
              <input
                type="number"
                value={luggageWeight}
                onChange={(e) => setLuggageWeight(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-wood-darker border border-amber-900/50 rounded p-2 text-white focus:border-amber-400 focus:outline-none"
                min="0"
                max="100"
              />
            </div>

            {/* Weapon Declaration */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="weapon"
                checked={weaponDeclared}
                onChange={(e) => setWeaponDeclared(e.target.checked)}
                className="rounded border-amber-900/50 text-amber-400 focus:ring-amber-400"
              />
              <label htmlFor="weapon" className="text-sm text-gray-400">
                I am carrying a weapon (required for defense if ambushed)
              </label>
            </div>

            {/* Price Estimate */}
            {selectedDestination && (
              <div className="p-3 bg-wood-darker rounded">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Fare:</span>
                  <span className="text-gold-light font-bold">
                    {formatDollars(calculateFare(selectedRoute, selectedDestination))}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleBookTicket}
                disabled={!selectedDestination || isBooking}
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Stagecoach;
