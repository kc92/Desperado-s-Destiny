/**
 * PriceChart Component
 * Historical price graph using pure CSS/SVG (no external dependencies)
 */

import React, { useMemo } from 'react';
import { PriceHistory, PriceDataPoint } from '@/hooks/useMarketplace';
import { formatDollars } from '@/utils/format';

interface PriceChartProps {
  priceHistory: PriceHistory;
  height?: number;
  showVolume?: boolean;
}

// Chart colors
const COLORS = {
  line: '#D4AF37', // gold-light
  lineStroke: '#B8860B', // gold-dark
  avgLine: '#8B4513', // leather-brown
  fill: 'rgba(212, 175, 55, 0.2)',
  volumeBar: 'rgba(139, 69, 19, 0.5)',
  grid: 'rgba(139, 90, 43, 0.2)',
  text: '#C2B280', // desert-sand
  textMuted: '#8B7355', // desert-stone
};

/**
 * Format date for display
 */
function formatChartDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const PriceChart: React.FC<PriceChartProps> = ({
  priceHistory,
  height = 200,
  showVolume = true,
}) => {
  const chartData = useMemo(() => {
    if (!priceHistory.priceData || priceHistory.priceData.length === 0) {
      return null;
    }

    const data = [...priceHistory.priceData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Chart dimensions
    const padding = { top: 20, right: 60, bottom: 40, left: 10 };
    const chartHeight = height - padding.top - padding.bottom;
    const volumeHeight = showVolume ? 40 : 0;
    const priceChartHeight = chartHeight - volumeHeight;

    // Calculate scales
    const prices = data.map((d) => d.price);
    const volumes = data.map((d) => d.volume);
    const minPrice = Math.min(...prices) * 0.9;
    const maxPrice = Math.max(...prices) * 1.1;
    const maxVolume = Math.max(...volumes, 1);

    // Generate points for the line
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * 100;
      const y = ((maxPrice - d.price) / (maxPrice - minPrice)) * priceChartHeight + padding.top;
      return { x, y, data: d };
    });

    // Generate path for the line
    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`)
      .join(' ');

    // Generate path for the fill area
    const fillPath = `
      ${linePath}
      L ${points[points.length - 1].x}% ${priceChartHeight + padding.top}
      L ${points[0].x}% ${priceChartHeight + padding.top}
      Z
    `;

    // Generate volume bars
    const volumeBars = showVolume
      ? data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * 100;
          const barHeight = (d.volume / maxVolume) * volumeHeight;
          const y = height - padding.bottom - barHeight;
          return { x, y, height: barHeight, data: d };
        })
      : [];

    // Y-axis labels (prices)
    const priceLabels = [
      { value: maxPrice, y: padding.top },
      { value: (maxPrice + minPrice) / 2, y: padding.top + priceChartHeight / 2 },
      { value: minPrice, y: padding.top + priceChartHeight },
    ];

    return {
      points,
      linePath,
      fillPath,
      volumeBars,
      priceLabels,
      data,
      avgPrice: priceHistory.averagePrice,
      avgY: ((maxPrice - priceHistory.averagePrice) / (maxPrice - minPrice)) * priceChartHeight + padding.top,
      chartHeight,
      padding,
    };
  }, [priceHistory, height, showVolume]);

  if (!chartData || chartData.data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-wood-darker/50 rounded-lg"
        style={{ height }}
      >
        <p className="text-desert-stone text-sm">No price data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {chartData.priceLabels.map((label, i) => (
          <line
            key={`grid-${i}`}
            x1="0%"
            y1={label.y}
            x2="100%"
            y2={label.y}
            stroke={COLORS.grid}
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Average price line */}
        <line
          x1="0%"
          y1={chartData.avgY}
          x2="100%"
          y2={chartData.avgY}
          stroke={COLORS.avgLine}
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* Fill area under the line */}
        <path
          d={chartData.fillPath}
          fill={COLORS.fill}
        />

        {/* Price line */}
        <path
          d={chartData.linePath}
          fill="none"
          stroke={COLORS.line}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {chartData.points.map((point, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={`${point.x}%`}
              cy={point.y}
              r="3"
              fill={COLORS.line}
              stroke={COLORS.lineStroke}
              strokeWidth="1"
              className="hover:r-4 transition-all cursor-pointer"
            >
              <title>
                {formatChartDate(point.data.date)}: {formatDollars(point.data.price)} ({point.data.volume} sold)
              </title>
            </circle>
          </g>
        ))}

        {/* Volume bars */}
        {showVolume && chartData.volumeBars.map((bar, i) => (
          <rect
            key={`vol-${i}`}
            x={`${bar.x - 2}%`}
            y={bar.y}
            width="4%"
            height={bar.height}
            fill={COLORS.volumeBar}
            rx="1"
          >
            <title>
              {formatChartDate(bar.data.date)}: {bar.data.volume} sold
            </title>
          </rect>
        ))}
      </svg>

      {/* Y-axis labels (positioned absolutely) */}
      <div className="absolute top-0 right-0 h-full flex flex-col justify-between py-2 pr-1 text-right">
        {chartData.priceLabels.map((label, i) => (
          <span
            key={`label-${i}`}
            className="text-xs"
            style={{ color: COLORS.textMuted }}
          >
            {formatDollars(Math.round(label.value))}
          </span>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-1">
        {chartData.data.length >= 2 && (
          <>
            <span className="text-xs" style={{ color: COLORS.textMuted }}>
              {formatChartDate(chartData.data[0].date)}
            </span>
            <span className="text-xs" style={{ color: COLORS.textMuted }}>
              {formatChartDate(chartData.data[chartData.data.length - 1].date)}
            </span>
          </>
        )}
      </div>

      {/* Average price indicator */}
      <div
        className="absolute right-0 transform -translate-y-1/2 bg-leather-brown px-2 py-0.5 rounded text-xs"
        style={{ top: chartData.avgY, color: COLORS.text }}
      >
        Avg
      </div>
    </div>
  );
};

/**
 * Mini sparkline version for compact display
 */
export const PriceSparkline: React.FC<{
  data: PriceDataPoint[];
  width?: number;
  height?: number;
}> = ({ data, width = 80, height = 24 }) => {
  const path = useMemo(() => {
    if (!data || data.length < 2) return '';

    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const prices = sortedData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    return sortedData
      .map((d, i) => {
        const x = (i / (sortedData.length - 1)) * width;
        const y = height - ((d.price - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return <div className="w-20 h-6 bg-wood-darker/30 rounded" />;
  }

  // Determine trend color
  const trend = data[data.length - 1].price >= data[0].price;

  return (
    <svg width={width} height={height} className="inline-block">
      <path
        d={path}
        fill="none"
        stroke={trend ? '#22C55E' : '#EF4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PriceChart;
