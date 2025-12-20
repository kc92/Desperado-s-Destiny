/**
 * Status Dashboard
 * Public page showing server status and game health
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import statusService, { ServerStatus } from '@/services/status.service';

// Status color/icon mappings
const STATUS_CONFIG = {
  online: { color: 'bg-green-500', text: 'text-green-400', label: 'Online', icon: '✓' },
  degraded: { color: 'bg-yellow-500', text: 'text-yellow-400', label: 'Degraded', icon: '!' },
  offline: { color: 'bg-red-500', text: 'text-red-400', label: 'Offline', icon: '✗' },
  connected: { color: 'bg-green-500', text: 'text-green-400', label: 'Connected', icon: '✓' },
  disconnected: { color: 'bg-red-500', text: 'text-red-400', label: 'Disconnected', icon: '✗' },
  healthy: { color: 'bg-green-500', text: 'text-green-400', label: 'Healthy', icon: '✓' },
  unhealthy: { color: 'bg-red-500', text: 'text-red-400', label: 'Unhealthy', icon: '✗' },
};

export const StatusDashboard: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await statusService.getServerStatus();
      setStatus(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch server status');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getStatusConfig = (statusKey: string) => {
    return STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.offline;
  };

  if (isLoading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-frontier-dark to-frontier-wood flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-frontier-gold border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-frontier-silver text-lg">Checking server status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-frontier-dark to-frontier-wood p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-western text-frontier-gold flex items-center gap-3">
              Desperados Destiny
              <span className="text-lg text-frontier-silver-dark">Status</span>
            </h1>
            <p className="text-frontier-silver-dark text-sm mt-1">
              Real-time server health monitoring
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-frontier-wood hover:bg-frontier-wood-light text-frontier-silver rounded-lg transition-colors border border-frontier-gold/30"
          >
            Back to Game
          </Link>
        </div>

        {/* Error state */}
        {error && !status && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <div>
                <h2 className="text-xl font-western text-red-400">Server Unreachable</h2>
                <p className="text-frontier-silver-dark">{error}</p>
              </div>
            </div>
          </div>
        )}

        {status && (
          <>
            {/* Overall Status Banner */}
            <div className={`rounded-lg p-6 mb-6 ${
              status.status === 'online' ? 'bg-green-900/30 border border-green-500/50' :
              status.status === 'degraded' ? 'bg-yellow-900/30 border border-yellow-500/50' :
              'bg-red-900/30 border border-red-500/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full ${getStatusConfig(status.status).color} ${
                    status.status === 'online' ? '' : 'animate-pulse'
                  }`} />
                  <div>
                    <h2 className={`text-2xl font-western ${getStatusConfig(status.status).text}`}>
                      Server {getStatusConfig(status.status).label}
                    </h2>
                    <p className="text-frontier-silver-dark text-sm">
                      Version {status.version} | {status.environment}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-frontier-silver text-sm">Response Time</div>
                  <div className={`text-lg font-mono ${
                    status.responseTimeMs < 100 ? 'text-green-400' :
                    status.responseTimeMs < 300 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {status.responseTimeMs}ms
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Active Players"
                value={status.connections.activePlayers.toString()}
                icon="👤"
              />
              <StatCard
                label="Uptime"
                value={status.uptimeFormatted}
                icon="⏱"
              />
              <StatCard
                label="Pending Jobs"
                value={status.services.jobQueue.pendingJobs.toString()}
                icon="📋"
              />
              <StatCard
                label="Failed Jobs"
                value={status.services.jobQueue.failedJobs.toString()}
                icon="⚠"
                alert={status.services.jobQueue.failedJobs > 0}
              />
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Database */}
              <ServiceCard
                name="Database"
                description="MongoDB connection"
                status={status.services.database.status}
                detail={status.services.database.state}
              />

              {/* Redis */}
              <ServiceCard
                name="Cache"
                description="Redis connection"
                status={status.services.redis.status}
              />

              {/* Socket Server */}
              <ServiceCard
                name="Real-time Server"
                description="WebSocket connections"
                status={status.connections.socketServer}
                detail={`${status.connections.activePlayers} connected`}
              />

              {/* Job Queue */}
              <ServiceCard
                name="Job Queue"
                description="Background task processor"
                status={status.services.jobQueue.status}
                detail={`${status.services.jobQueue.pendingJobs} pending, ${status.services.jobQueue.failedJobs} failed`}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-frontier-silver-dark border-t border-frontier-gold/20 pt-4">
              <div>
                Last updated: {lastUpdate?.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchStatus}
                className="flex items-center gap-2 px-3 py-1 bg-frontier-wood hover:bg-frontier-wood-light rounded transition-colors"
              >
                <span className={isLoading ? 'animate-spin' : ''}>↻</span>
                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  alert?: boolean;
}> = ({ label, value, icon, alert }) => (
  <div className="bg-frontier-wood/50 rounded-lg p-4 border border-frontier-gold/20">
    <div className="flex items-center gap-2 text-frontier-silver-dark text-sm mb-1">
      <span>{icon}</span>
      {label}
    </div>
    <div className={`text-2xl font-western ${alert ? 'text-red-400' : 'text-frontier-silver'}`}>
      {value}
    </div>
  </div>
);

/**
 * Service Card Component
 */
const ServiceCard: React.FC<{
  name: string;
  description: string;
  status: string;
  detail?: string;
}> = ({ name, description, status, detail }) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.offline;

  return (
    <div className="bg-frontier-wood/50 rounded-lg p-4 border border-frontier-gold/20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-western text-frontier-silver">{name}</h3>
          <p className="text-sm text-frontier-silver-dark">{description}</p>
          {detail && (
            <p className="text-xs text-frontier-silver-dark mt-1">{detail}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <span className={`text-sm font-medium ${config.text}`}>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboard;
