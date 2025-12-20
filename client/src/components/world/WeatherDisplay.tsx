/**
 * Weather Display Component
 * Shows current weather, effects, and forecast
 */

import React from 'react';
import { useWorldStore } from '../../store/useWorldStore';

// Weather icons and colors
const WEATHER_CONFIG: Record<string, { icon: string; color: string; bgClass: string }> = {
  CLEAR: { icon: '☀️', color: 'text-yellow-400', bgClass: 'bg-gradient-to-b from-blue-400 to-blue-200' },
  CLOUDY: { icon: '☁️', color: 'text-gray-400', bgClass: 'bg-gradient-to-b from-gray-400 to-gray-300' },
  RAIN: { icon: '🌧️', color: 'text-blue-400', bgClass: 'bg-gradient-to-b from-gray-500 to-blue-300' },
  DUST_STORM: { icon: '🌪️', color: 'text-amber-600', bgClass: 'bg-gradient-to-b from-amber-600 to-amber-400' },
  HEAT_WAVE: { icon: '🔥', color: 'text-orange-500', bgClass: 'bg-gradient-to-b from-orange-500 to-red-400' },
  FOG: { icon: '🌫️', color: 'text-gray-300', bgClass: 'bg-gradient-to-b from-gray-300 to-gray-200' },
  THUNDERSTORM: { icon: '⛈️', color: 'text-purple-500', bgClass: 'bg-gradient-to-b from-gray-700 to-purple-500' },
};

// Time of day colors
const TIME_CONFIG: Record<string, { icon: string; color: string }> = {
  DAWN: { icon: '🌅', color: 'text-orange-300' },
  MORNING: { icon: '🌤️', color: 'text-yellow-300' },
  NOON: { icon: '☀️', color: 'text-yellow-500' },
  AFTERNOON: { icon: '🌤️', color: 'text-yellow-400' },
  DUSK: { icon: '🌆', color: 'text-orange-500' },
  EVENING: { icon: '🌙', color: 'text-blue-400' },
  NIGHT: { icon: '🌑', color: 'text-indigo-500' },
};

interface WeatherDisplayProps {
  compact?: boolean;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ compact = false }) => {
  const { worldState } = useWorldStore();

  if (!worldState) {
    return (
      <div className="bg-stone-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-stone-700 rounded w-24 mb-2" />
        <div className="h-8 bg-stone-700 rounded w-16" />
      </div>
    );
  }

  const weatherConfig = WEATHER_CONFIG[worldState.currentWeather || 'CLEAR'] || WEATHER_CONFIG.CLEAR;
  const timeConfig = TIME_CONFIG[worldState.timeOfDay || 'NOON'] || TIME_CONFIG.NOON;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-stone-800/80 rounded-lg px-3 py-2">
        <span className="text-xl" title={worldState.currentWeather || 'CLEAR'}>
          {weatherConfig.icon}
        </span>
        <div className="text-sm">
          <div className={timeConfig.color}>{worldState.timeOfDay || 'NOON'}</div>
          <div className="text-stone-400 text-xs">
            {worldState.gameHour || 12}:00 • Day {worldState.gameDay || 1}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800 rounded-lg overflow-hidden">
      {/* Current Weather Header */}
      <div className={`${weatherConfig.bgClass} p-4 text-center`}>
        <span className="text-4xl block mb-2">{weatherConfig.icon}</span>
        <h3 className="text-lg font-bold text-stone-900">
          {(worldState.currentWeather || 'CLEAR').replace('_', ' ')}
        </h3>
      </div>

      {/* Time Display */}
      <div className="p-4 border-b border-stone-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{timeConfig.icon}</span>
            <span className={`font-semibold ${timeConfig.color}`}>
              {worldState.timeOfDay || 'NOON'}
            </span>
          </div>
          <div className="text-stone-400 text-sm">
            {worldState.gameHour || 12}:00
          </div>
        </div>
        <div className="text-stone-500 text-xs mt-1">
          {worldState.gameMonth || 1}/{worldState.gameDay || 1}/{worldState.gameYear || 1885}
        </div>
      </div>

      {/* Weather Effects */}
      <div className="p-4 space-y-2">
        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Current Effects
        </h4>

        {worldState.weatherEffects?.travelTimeModifier !== 1 && (
          <EffectRow
            label="Travel Time"
            value={worldState.weatherEffects?.travelTimeModifier || 1}
            icon="🚶"
          />
        )}
        {worldState.weatherEffects?.combatModifier !== 1 && (
          <EffectRow
            label="Combat"
            value={worldState.weatherEffects?.combatModifier || 1}
            icon="⚔️"
          />
        )}
        {worldState.weatherEffects?.energyCostModifier !== 1 && (
          <EffectRow
            label="Energy Cost"
            value={worldState.weatherEffects?.energyCostModifier || 1}
            icon="⚡"
          />
        )}
        {worldState.weatherEffects?.visibilityModifier !== 1 && (
          <EffectRow
            label="Visibility"
            value={worldState.weatherEffects?.visibilityModifier || 1}
            icon="👁️"
          />
        )}
        {worldState.weatherEffects?.encounterModifier !== 1 && (
          <EffectRow
            label="Encounters"
            value={worldState.weatherEffects?.encounterModifier || 1}
            icon="🎲"
          />
        )}

        {(!worldState.weatherEffects || Object.values(worldState.weatherEffects).every(v => v === 1)) && (
          <div className="text-stone-500 text-sm text-center py-2">
            No active weather effects
          </div>
        )}
      </div>

      {/* Forecast */}
      {worldState.weatherForecast && worldState.weatherForecast.length > 0 && (
        <div className="p-4 border-t border-stone-700">
          <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Forecast
          </h4>
          <div className="flex justify-around">
            {worldState.weatherForecast.map((forecast, idx) => {
              const config = WEATHER_CONFIG[forecast.weather] || WEATHER_CONFIG.CLEAR;
              return (
                <div key={idx} className="text-center">
                  <span className="text-lg">{config.icon}</span>
                  <div className="text-xs text-stone-500 mt-1">
                    +{Math.round((new Date(forecast.time).getTime() - Date.now()) / (60 * 60 * 1000))}h
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Effect row component
const EffectRow: React.FC<{ label: string; value: number; icon: string }> = ({
  label,
  value,
  icon,
}) => {
  const isPositive = value < 1;
  const percentage = Math.round((value - 1) * 100);
  const displayValue = percentage > 0 ? `+${percentage}%` : `${percentage}%`;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-stone-300">{label}</span>
      </div>
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {displayValue}
      </span>
    </div>
  );
};

export default WeatherDisplay;
