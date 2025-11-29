/**
 * News Ticker Component
 * Displays scrolling headlines and gossip
 */

import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../../store/useWorldStore';

interface NewsTickerProps {
  speed?: 'slow' | 'normal' | 'fast';
  showGossip?: boolean;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({
  speed = 'normal',
  showGossip = true,
}) => {
  const { worldState } = useWorldStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const speedMs = {
    slow: 6000,
    normal: 4000,
    fast: 2500,
  };

  // Combine headlines and gossip
  const allNews = React.useMemo(() => {
    if (!worldState) return [];

    const headlines = worldState.currentHeadlines.map(h => ({
      text: h,
      type: 'headline' as const,
    }));

    const gossip = showGossip
      ? worldState.recentGossip.map(g => ({
          text: g.text,
          type: 'gossip' as const,
          location: g.location,
        }))
      : [];

    return [...headlines, ...gossip];
  }, [worldState, showGossip]);

  // Auto-rotate news
  useEffect(() => {
    if (allNews.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allNews.length);
    }, speedMs[speed]);

    return () => clearInterval(interval);
  }, [allNews.length, speed, isHovered]);

  if (!worldState || allNews.length === 0) {
    return null;
  }

  const currentNews = allNews[activeIndex];

  return (
    <div
      className="bg-stone-900 border-y border-amber-900/50 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        {/* Label */}
        <div className={`px-3 py-2 font-bold text-xs uppercase tracking-wider ${
          currentNews.type === 'headline'
            ? 'bg-red-700 text-white'
            : 'bg-amber-700 text-stone-100'
        }`}>
          {currentNews.type === 'headline' ? 'NEWS' : 'GOSSIP'}
        </div>

        {/* Ticker content */}
        <div className="flex-1 px-4 py-2 relative overflow-hidden">
          <div
            key={activeIndex}
            className="animate-fade-in text-sm"
          >
            <span className={
              currentNews.type === 'headline'
                ? 'text-stone-100 font-semibold'
                : 'text-stone-300 italic'
            }>
              {currentNews.type === 'gossip' && '"'}
              {currentNews.text}
              {currentNews.type === 'gossip' && '"'}
            </span>
            {currentNews.type === 'gossip' && currentNews.location && (
              <span className="text-stone-500 text-xs ml-2">
                — heard in {currentNews.location}
              </span>
            )}
          </div>
        </div>

        {/* Navigation dots */}
        {allNews.length > 1 && (
          <div className="flex items-center gap-1 px-3">
            {allNews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === activeIndex
                    ? 'bg-amber-500'
                    : 'bg-stone-600 hover:bg-stone-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * News Board Component
 * Full display of all headlines and gossip
 */
export const NewsBoard: React.FC = () => {
  const { worldState } = useWorldStore();
  const [tab, setTab] = useState<'headlines' | 'gossip'>('headlines');

  if (!worldState) {
    return (
      <div className="bg-stone-800 rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-stone-700 rounded w-32 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-stone-700 rounded" />
          <div className="h-4 bg-stone-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-stone-900 px-4 py-3 border-b border-stone-700">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          📰 Frontier Gazette
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-700">
        <button
          onClick={() => setTab('headlines')}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'headlines'
              ? 'bg-stone-700 text-red-400'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Headlines
        </button>
        <button
          onClick={() => setTab('gossip')}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'gossip'
              ? 'bg-stone-700 text-amber-400'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Gossip
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {tab === 'headlines' ? (
          <div className="space-y-3">
            {worldState.currentHeadlines.length === 0 ? (
              <p className="text-stone-500 text-sm text-center py-4">
                No news today
              </p>
            ) : (
              worldState.currentHeadlines.map((headline, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 pb-3 border-b border-stone-700/50 last:border-0"
                >
                  <span className="text-red-500">📌</span>
                  <p className="text-stone-200 text-sm font-medium">
                    {headline}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {worldState.recentGossip.length === 0 ? (
              <p className="text-stone-500 text-sm text-center py-4">
                No gossip to report
              </p>
            ) : (
              worldState.recentGossip.map((gossip, idx) => (
                <div
                  key={idx}
                  className="pb-3 border-b border-stone-700/50 last:border-0"
                >
                  <p className="text-stone-300 text-sm italic">
                    "{gossip.text}"
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                    {gossip.location && (
                      <span>📍 {gossip.location}</span>
                    )}
                    <span>
                      {gossip.age === 0 ? 'Just now' : `${gossip.age}h ago`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsTicker;
