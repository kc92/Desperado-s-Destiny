/**
 * ProgressBar Component
 * Simple progress bar with color variants
 */

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'amber' | 'purple' | 'gray';
  className?: string;
  showLabel?: boolean;
}

const COLOR_CLASSES: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
};

export function ProgressBar({
  value,
  max,
  color = 'green',
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.green;

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {value}/{max} ({Math.round(percentage)}%)
        </div>
      )}
    </div>
  );
}
