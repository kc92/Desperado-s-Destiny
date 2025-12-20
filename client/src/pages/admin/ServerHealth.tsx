/**
 * Server Health Component
 * Server monitoring and system health metrics
 */

import React, { useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Card } from '@/components/ui';
import { logger } from '@/services/logger.service';

export const ServerHealth: React.FC = () => {
  const { serverHealth, fetchServerHealth, isLoading } = useAdminStore();

  useEffect(() => {
    fetchServerHealth().catch((err) => logger.error('Failed to fetch server health on mount', err as Error, { context: 'ServerHealth.fetchServerHealth.initial' }));

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchServerHealth().catch((err) => logger.error('Failed to fetch server health on auto-refresh', err as Error, { context: 'ServerHealth.fetchServerHealth.autoRefresh' }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading && !serverHealth) {
    return (
      <Card className="p-6">
        <div className="text-frontier-silver">Loading server health metrics...</div>
      </Card>
    );
  }

  if (!serverHealth) {
    return (
      <Card className="p-6">
        <div className="text-frontier-silver">Failed to load server health data.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Info */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-western text-frontier-gold">Server Information</h2>
          <button
            onClick={() => fetchServerHealth()}
            className="px-4 py-2 bg-frontier-gold text-frontier-dark rounded-lg hover:bg-frontier-gold-dark transition-colors font-western"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard label="Uptime" value={serverHealth.server.uptimeFormatted} />
          <InfoCard label="Platform" value={serverHealth.server.platform} />
          <InfoCard label="Node Version" value={serverHealth.server.nodeVersion} />
          <InfoCard
            label="Database"
            value={serverHealth.database.status}
            color={serverHealth.database.connected ? 'green' : 'red'}
          />
        </div>
      </Card>

      {/* Memory Usage */}
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">Memory Usage</h2>

        <div className="space-y-6">
          {/* Process Memory */}
          <div>
            <h3 className="text-sm text-frontier-silver mb-3">Process Memory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Heap Used"
                value={`${serverHealth.memory.used} MB`}
                max={serverHealth.memory.total}
                current={serverHealth.memory.used}
              />
              <MetricCard
                label="Heap Total"
                value={`${serverHealth.memory.total} MB`}
              />
              <MetricCard
                label="RSS"
                value={`${serverHealth.memory.rss} MB`}
                subtitle="Resident Set Size"
              />
            </div>
          </div>

          {/* System Memory */}
          <div>
            <h3 className="text-sm text-frontier-silver mb-3">System Memory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Total"
                value={`${serverHealth.memory.system.total} MB`}
              />
              <MetricCard
                label="Free"
                value={`${serverHealth.memory.system.free} MB`}
              />
              <MetricCard
                label="Usage"
                value={`${serverHealth.memory.system.usagePercent}%`}
                max={100}
                current={serverHealth.memory.system.usagePercent}
                showBar
              />
            </div>
          </div>
        </div>
      </Card>

      {/* CPU Information */}
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">CPU Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoCard label="CPU Cores" value={serverHealth.cpu.count.toString()} />
          <InfoCard
            label="Load Average (1m)"
            value={serverHealth.cpu.loadAverage[0]?.toFixed(2) || 'N/A'}
          />
          <InfoCard
            label="Load Average (5m)"
            value={serverHealth.cpu.loadAverage[1]?.toFixed(2) || 'N/A'}
          />
          <InfoCard
            label="Load Average (15m)"
            value={serverHealth.cpu.loadAverage[2]?.toFixed(2) || 'N/A'}
          />
        </div>
      </Card>

      {/* Health Status */}
      <Card className="p-6">
        <h2 className="text-2xl font-western text-frontier-gold mb-4">System Health</h2>

        <div className="space-y-3">
          <HealthIndicator
            label="Database Connection"
            status={serverHealth.database.connected ? 'healthy' : 'unhealthy'}
            detail={serverHealth.database.status}
          />
          <HealthIndicator
            label="Memory Usage"
            status={serverHealth.memory.system.usagePercent < 80 ? 'healthy' : serverHealth.memory.system.usagePercent < 90 ? 'warning' : 'unhealthy'}
            detail={`${serverHealth.memory.system.usagePercent}% used`}
          />
          <HealthIndicator
            label="Heap Memory"
            status={
              serverHealth.memory.used / serverHealth.memory.total < 0.8 ? 'healthy' :
              serverHealth.memory.used / serverHealth.memory.total < 0.9 ? 'warning' : 'unhealthy'
            }
            detail={`${serverHealth.memory.used} / ${serverHealth.memory.total} MB`}
          />
        </div>
      </Card>
    </div>
  );
};

/**
 * Info Card Component
 */
const InfoCard: React.FC<{
  label: string;
  value: string;
  color?: 'default' | 'green' | 'red';
}> = ({ label, value, color = 'default' }) => {
  const colors = {
    default: 'text-frontier-silver',
    green: 'text-green-400',
    red: 'text-red-400'
  };

  return (
    <div className="bg-frontier-wood p-4 rounded-lg">
      <div className="text-sm text-frontier-silver-dark mb-1">{label}</div>
      <div className={`text-xl font-western ${colors[color]}`}>{value}</div>
    </div>
  );
};

/**
 * Metric Card Component
 */
const MetricCard: React.FC<{
  label: string;
  value: string;
  subtitle?: string;
  max?: number;
  current?: number;
  showBar?: boolean;
}> = ({ label, value, subtitle, max, current, showBar = false }) => {
  const percentage = max && current ? (current / max) * 100 : 0;
  const getColor = () => {
    if (percentage < 60) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-frontier-wood p-4 rounded-lg">
      <div className="text-sm text-frontier-silver-dark mb-1">{label}</div>
      <div className="text-xl font-western text-frontier-silver mb-2">{value}</div>
      {subtitle && <div className="text-xs text-frontier-silver-dark">{subtitle}</div>}
      {showBar && max && current && (
        <div className="mt-3">
          <div className="w-full h-2 bg-frontier-dark rounded-full overflow-hidden">
            <div
              className={`h-full ${getColor()} transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-frontier-silver-dark mt-1">
            {percentage.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Health Indicator Component
 */
const HealthIndicator: React.FC<{
  label: string;
  status: 'healthy' | 'warning' | 'unhealthy';
  detail: string;
}> = ({ label, status, detail }) => {
  const statusConfig = {
    healthy: {
      color: 'bg-green-500',
      text: 'Healthy',
      textColor: 'text-green-400'
    },
    warning: {
      color: 'bg-yellow-500',
      text: 'Warning',
      textColor: 'text-yellow-400'
    },
    unhealthy: {
      color: 'bg-red-500',
      text: 'Unhealthy',
      textColor: 'text-red-400'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 bg-frontier-wood rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <div>
          <div className="text-frontier-silver">{label}</div>
          <div className="text-sm text-frontier-silver-dark">{detail}</div>
        </div>
      </div>
      <div className={`font-semibold ${config.textColor}`}>{config.text}</div>
    </div>
  );
};

export default ServerHealth;
