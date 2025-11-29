/**
 * Time Debug Page
 * Development page to visualize and test Day/Night cycle
 */

import React from 'react';
import { GameClock, DayNightOverlay, Card } from '@/components/ui';
import { useGameTime } from '@/hooks/useGameTime';

/**
 * Debug page showing time system information
 * Useful for testing and visualizing the day/night cycle
 */
export const TimeDebug: React.FC = () => {
  const gameTime = useGameTime();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-western text-gold-light mb-2">
          Day/Night Cycle Debug
        </h1>
        <p className="text-desert-sand font-serif">
          Visual preview of game time system
        </p>
      </div>

      {/* Clock Display */}
      <div className="flex justify-center mb-8">
        <GameClock showIcon={true} compact={false} className="scale-150" />
      </div>

      {/* Time Details */}
      <Card className="bg-wood-medium/80 border-2 border-wood-light">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-western text-gold-light mb-4">
            Current Time Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-wood-dark/40 p-4 rounded-lg">
              <div className="text-desert-stone text-sm mb-1">Hour (24h format)</div>
              <div className="text-desert-sand text-2xl font-bold">{gameTime.hour}</div>
            </div>

            <div className="bg-wood-dark/40 p-4 rounded-lg">
              <div className="text-desert-stone text-sm mb-1">Time Period</div>
              <div className="text-desert-sand text-2xl font-bold">
                {gameTime.icon} {gameTime.period}
              </div>
            </div>

            <div className="bg-wood-dark/40 p-4 rounded-lg">
              <div className="text-desert-stone text-sm mb-1">Time Display</div>
              <div className="text-desert-sand text-2xl font-bold">{gameTime.timeString}</div>
            </div>

            <div className="bg-wood-dark/40 p-4 rounded-lg">
              <div className="text-desert-stone text-sm mb-1">Day/Night Status</div>
              <div className="text-desert-sand text-2xl font-bold">
                {gameTime.isDay ? '☀️ Day' : '🌙 Night'}
              </div>
            </div>

            <div className="bg-wood-dark/40 p-4 rounded-lg col-span-2">
              <div className="text-desert-stone text-sm mb-1">Next Period In</div>
              <div className="text-desert-sand text-2xl font-bold">
                ~{gameTime.nextPeriodIn} minutes
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Time Period Reference */}
      <Card className="bg-wood-medium/80 border-2 border-wood-light">
        <div className="p-6">
          <h2 className="text-2xl font-western text-gold-light mb-4">
            Time Periods Reference
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Midnight', hours: '12:00 AM - 1:00 AM', icon: '🌑', color: 'bg-blue-900/40' },
              { name: 'Night', hours: '1:00 AM - 5:00 AM', icon: '🌙', color: 'bg-blue-800/40' },
              { name: 'Dawn', hours: '5:00 AM - 7:00 AM', icon: '🌅', color: 'bg-orange-600/40' },
              { name: 'Morning', hours: '7:00 AM - 12:00 PM', icon: '☀️', color: 'bg-yellow-400/40' },
              { name: 'Noon', hours: '12:00 PM - 2:00 PM', icon: '☀️', color: 'bg-yellow-300/40' },
              { name: 'Afternoon', hours: '2:00 PM - 6:00 PM', icon: '☀️', color: 'bg-yellow-500/40' },
              { name: 'Dusk', hours: '6:00 PM - 8:00 PM', icon: '🌅', color: 'bg-orange-700/40' },
              { name: 'Evening', hours: '8:00 PM - 10:00 PM', icon: '🌙', color: 'bg-blue-700/40' },
            ].map((period) => (
              <div
                key={period.name}
                className={`p-4 rounded-lg ${period.color} border-2 ${
                  gameTime.period === period.name ? 'border-gold-light' : 'border-transparent'
                }`}
              >
                <div className="text-3xl mb-2">{period.icon}</div>
                <div className="text-desert-sand font-bold text-lg">{period.name}</div>
                <div className="text-desert-stone text-sm">{period.hours}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Visual Effects Preview */}
      <Card className="bg-wood-medium/80 border-2 border-wood-light">
        <div className="p-6">
          <h2 className="text-2xl font-western text-gold-light mb-4">
            Visual Overlay Preview
          </h2>
          <p className="text-desert-sand font-serif mb-4">
            The overlay applies a subtle tint to the entire page based on the time of day.
            Current period: <strong>{gameTime.period}</strong>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-24 bg-wood-dark rounded-lg mb-2 relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(10, 25, 47, 0.15), rgba(15, 35, 60, 0.12))',
                  }}
                />
              </div>
              <div className="text-desert-sand text-sm">Night</div>
            </div>

            <div className="text-center">
              <div className="w-full h-24 bg-wood-dark rounded-lg mb-2 relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255, 140, 100, 0.08), rgba(255, 180, 150, 0.05))',
                  }}
                />
              </div>
              <div className="text-desert-sand text-sm">Dawn</div>
            </div>

            <div className="text-center">
              <div className="w-full h-24 bg-wood-dark rounded-lg mb-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-transparent" />
              </div>
              <div className="text-desert-sand text-sm">Noon</div>
            </div>

            <div className="text-center">
              <div className="w-full h-24 bg-wood-dark rounded-lg mb-2 relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255, 130, 80, 0.08), rgba(160, 100, 180, 0.06))',
                  }}
                />
              </div>
              <div className="text-desert-sand text-sm">Dusk</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Implementation Notes */}
      <Card className="bg-wood-medium/80 border-2 border-wood-light">
        <div className="p-6">
          <h2 className="text-2xl font-western text-gold-light mb-4">
            Implementation Notes
          </h2>
          <div className="text-desert-sand font-serif space-y-2">
            <p>
              <strong className="text-gold-light">GameClock Component:</strong> Displays current time
              with icon and period name. Updates automatically via polling.
            </p>
            <p>
              <strong className="text-gold-light">DayNightOverlay Component:</strong> Full-screen overlay
              with subtle color tints. Non-interactive (pointer-events: none).
            </p>
            <p>
              <strong className="text-gold-light">useGameTime Hook:</strong> Provides computed time values.
              Polls world state every 30 seconds.
            </p>
            <p>
              <strong className="text-gold-light">API Endpoints:</strong> GET /api/world/state and
              GET /api/world/time for fetching game time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeDebug;
