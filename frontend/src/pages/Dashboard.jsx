import React, { useCallback, useEffect, useRef, useState } from 'react';
import AlertCard from '../components/AlertCard';
import { fetchAlerts } from '../services/api';

/**
 * Dashboard - shows the live threat feed.
 *
 * Improvements:
 * - Loading and error states.
 * - Manual refresh button and automatic polling.
 * - Cleanup on unmount to avoid state updates after unmount.
 * - Small accessibility enhancements and clear empty state.
 */

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);
  const pollingRef = useRef(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAlerts();
      // Ignore results if component unmounted in the meantime
      if (!mountedRef.current) return;
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err && err.message
          ? `Failed to load alerts: ${err.message}`
          : 'Failed to load alerts'
      );
      setAlerts([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // initial load
    loadAlerts();

    // start polling
    pollingRef.current = setInterval(loadAlerts, REFRESH_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [loadAlerts]);

  const handleRefresh = async () => {
    // immediate manual refresh
    await loadAlerts();
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Live Threat Feed</h1>
          <p className="text-sm text-gray-500">
            Latest alerts from monitored sources. Auto-refresh every 30s.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600" aria-live="polite">
            {loading ? 'Refreshing…' : `${alerts.length} alert${alerts.length !== 1 ? 's' : ''}`}
          </span>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className={`inline-flex items-center px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring
              ${loading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
            aria-label="Refresh alerts"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 mr-2 text-gray-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 100 24 12 12 0 01-12-12z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 12l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}

            <span>{loading ? 'Refreshing' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && alerts.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          No alerts to show right now.
        </div>
      )}

      <main className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-live="polite">
        {alerts.map((alert, idx) => (
          <AlertCard key={alert?.id ?? idx} alert={alert} />
        ))}
      </main>
    </div>
  );
};

export default Dashboard;
