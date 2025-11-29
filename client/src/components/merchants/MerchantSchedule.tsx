/**
 * MerchantSchedule Component
 * Displays a merchant's travel route and schedule
 */

import React from 'react';
import { Card } from '@/components/ui';
import type { RouteStop, UpcomingMerchant } from '@/hooks/useMerchants';

interface MerchantScheduleProps {
  route: RouteStop[];
  currentStop?: RouteStop;
  nextStop?: RouteStop;
}

const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MerchantSchedule: React.FC<MerchantScheduleProps> = ({
  route,
  currentStop,
  nextStop,
}) => {
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="space-y-4">
      <h4 className="font-western text-lg text-gold-light flex items-center gap-2">
        <span>📅</span>
        Weekly Route
      </h4>

      <div className="space-y-3">
        {route.map((stop, index) => {
          const isCurrent = currentStop?.locationId === stop.locationId;
          const isNext = nextStop?.locationId === stop.locationId && !isCurrent;

          return (
            <div
              key={index}
              className={`relative pl-8 pb-4 ${
                index < route.length - 1 ? 'border-l-2 border-wood-grain/30' : ''
              }`}
            >
              {/* Timeline Dot */}
              <div
                className={`absolute left-0 top-0 w-4 h-4 rounded-full -translate-x-1/2 ${
                  isCurrent
                    ? 'bg-green-500 ring-2 ring-green-400/50'
                    : isNext
                    ? 'bg-gold-light ring-2 ring-gold-light/50'
                    : 'bg-wood-grain'
                }`}
              />

              <div
                className={`p-3 rounded-lg ${
                  isCurrent
                    ? 'bg-green-900/30 border border-green-500/50'
                    : isNext
                    ? 'bg-gold-dark/20 border border-gold-dark/50'
                    : 'bg-wood-dark/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-western text-desert-sand">{stop.locationName}</p>
                    <p className="text-sm text-desert-stone">
                      {dayNames[stop.arrivalDay]} - {dayNames[stop.departureDay]}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-xs bg-green-600/80 text-white rounded-full">
                      Here Now
                    </span>
                  )}
                  {isNext && (
                    <span className="px-2 py-0.5 text-xs bg-gold-dark/80 text-white rounded-full">
                      Next Stop
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-desert-stone flex items-center gap-4">
                  <span>Arrives: {formatTime(stop.arrivalHour)}</span>
                  <span>Departs: {formatTime(stop.departureHour)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface UpcomingMerchantsListProps {
  upcoming: UpcomingMerchant[];
  locationName?: string;
}

export const UpcomingMerchantsList: React.FC<UpcomingMerchantsListProps> = ({
  upcoming,
  locationName = 'this location',
}) => {
  const formatHours = (hours: number) => {
    if (hours < 1) return 'Arriving soon';
    if (hours < 24) return `In ${Math.round(hours)} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (remainingHours === 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    return `In ${days}d ${remainingHours}h`;
  };

  if (upcoming.length === 0) {
    return (
      <Card variant="wood" padding="md">
        <div className="text-center py-4">
          <span className="text-3xl">🏜️</span>
          <p className="text-desert-sand mt-2">No merchants expected soon</p>
          <p className="text-sm text-desert-stone">Check back later for traveling traders</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-western text-lg text-gold-light flex items-center gap-2">
        <span>🚗</span>
        Coming to {locationName}
      </h4>

      <div className="space-y-2">
        {upcoming.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-wood-dark/50 border border-wood-grain/30"
          >
            <div className="text-2xl">{item.merchant.barter ? '🔄' : '🛒'}</div>
            <div className="flex-1">
              <p className="font-western text-desert-sand">{item.merchant.name}</p>
              <p className="text-xs text-desert-stone">{item.merchant.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gold-light">{formatHours(item.hoursUntilArrival)}</p>
              <p className="text-xs text-desert-stone">
                {dayNames[item.stop.arrivalDay]} {item.stop.arrivalHour}:00
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MerchantSchedule;
