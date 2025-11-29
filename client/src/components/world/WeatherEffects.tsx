/**
 * Weather Effects Component
 * Renders visual weather effects as an overlay
 */

import React, { useMemo } from 'react';
import { useWorldStore } from '../../store/useWorldStore';

interface WeatherEffectsProps {
  enabled?: boolean;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ enabled = true }) => {
  const { worldState } = useWorldStore();

  if (!enabled || !worldState) return null;

  const weather = worldState.currentWeather;
  const timeOfDay = worldState.timeOfDay;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Time of day overlay */}
      <TimeOverlay timeOfDay={timeOfDay} />

      {/* Weather particles */}
      {weather === 'RAIN' && <RainEffect />}
      {weather === 'DUST_STORM' && <DustStormEffect />}
      {weather === 'FOG' && <FogEffect />}
      {weather === 'THUNDERSTORM' && <ThunderstormEffect />}
      {weather === 'HEAT_WAVE' && <HeatWaveEffect />}
    </div>
  );
};

// Time of day color overlay
const TimeOverlay: React.FC<{ timeOfDay: string }> = ({ timeOfDay }) => {
  const overlayClass = useMemo(() => {
    switch (timeOfDay) {
      case 'DAWN':
        return 'bg-gradient-to-b from-orange-500/10 to-transparent';
      case 'DUSK':
        return 'bg-gradient-to-b from-orange-600/15 to-purple-900/10';
      case 'EVENING':
        return 'bg-blue-900/20';
      case 'NIGHT':
        return 'bg-indigo-950/30';
      default:
        return '';
    }
  }, [timeOfDay]);

  if (!overlayClass) return null;

  return <div className={`absolute inset-0 ${overlayClass} transition-colors duration-1000`} />;
};

// Rain effect
const RainEffect: React.FC = () => {
  const drops = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.5 + Math.random() * 0.5}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-0.5 h-4 bg-blue-400/40 animate-rain"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        />
      ))}
    </div>
  );
};

// Dust storm effect
const DustStormEffect: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      size: 2 + Math.random() * 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 bg-amber-900/20">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-amber-600/50 animate-dust"
          style={{
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

// Fog effect
const FogEffect: React.FC = () => {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gray-300/30 animate-fog-drift" />
      <div
        className="absolute inset-0 bg-gray-200/20 animate-fog-drift"
        style={{ animationDelay: '-5s' }}
      />
    </div>
  );
};

// Thunderstorm effect
const ThunderstormEffect: React.FC = () => {
  const drops = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1}s`,
      duration: `${0.3 + Math.random() * 0.3}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Heavy rain */}
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-0.5 h-6 bg-blue-300/50 animate-rain"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }}
        />
      ))}
      {/* Lightning flash */}
      <div className="absolute inset-0 animate-lightning bg-white/0" />
    </div>
  );
};

// Heat wave effect
const HeatWaveEffect: React.FC = () => {
  return (
    <div className="absolute inset-0">
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-500/10 to-transparent animate-heat-shimmer" />
    </div>
  );
};

export default WeatherEffects;
