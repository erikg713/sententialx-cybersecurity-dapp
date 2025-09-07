import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";

const Navbar = lazy(() => import("../components/Navbar"));
const Sidebar = lazy(() => import("../components/Sidebar"));

/**
 * Small presentational card for showing a single stat.
 * Kept locally so the page is self-contained and easy to iterate on.
 */
function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card" role="group" aria-label={label}>
      <div className="stat-card__value" aria-hidden={false}>
        {value}
      </div>
      <div className="stat-card__label">{label}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  );
}

/**
 * DashboardPage
 *
 * - Lazily loads Navbar and Sidebar to improve initial bundle performance.
 * - Fetches dashboard metrics from /api/dashboard (graceful fallback to local placeholder).
 * - Uses memoization for computed values and cleans up fetch timers/abort controllers.
 * - Accessible semantics and small presentational improvements.
 */
function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  // Fetch function encapsulated so we can call it on mount and when retrying
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadMetrics() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", { signal: controller.signal });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setMetrics(data);
        setLastUpdatedAt(new Date().toISOString());
      } catch (err) {
        if (err.name === "AbortError") return;
        // If there is a network error or backend not available, fall back to safe local defaults
        console.warn("Fetching dashboard metrics failed, using fallback data:", err);
        if (!mounted) return;
        setMetrics({
          monitoredAssets: 12,
          activeAlerts: 3,
          incidentsToday: 0,
          avgResponseTimeMs: 124,
          systemStatus: "degraded",
        });
        setError(err.message || "Failed to load live data");
        setLastUpdatedAt(new Date().toISOString());
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMetrics();

    // Refresh metrics periodically
    const interval = setInterval(loadMetrics, 30_000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const formattedStatus = useMemo(() => {
    if (!metrics) return "unknown";
    switch (metrics.systemStatus) {
      case "ok":
      case "healthy":
        return "Operational";
      case "degraded":
        return "Degraded performance";
      case "down":
        return "Service disruption";
      default:
        return String(metrics.systemStatus);
    }
  }, [metrics]);

  return (
    <div className="dashboard-layout">
      <Suspense fallback={<header className="navbar-placeholder">Loading navigation…</header>}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<aside className="sidebar-placeholder">Loading menu…</aside>}>
        <Sidebar />
      </Suspense>

      <main className="content" id="main" tabIndex="-1" aria-live="polite">
        <header className="content__header">
          <h1>Dashboard</h1>
          <p className="muted">Monitor, analyze, and defend your environment</p>
          <div className="content__meta">
            {loading ? (
              <span className="badge badge--loading">Loading metrics…</span>
            ) : error ? (
              <span className="badge badge--warn" title={error}>
                Live data unavailable
              </span>
            ) : (
              <span className="badge badge--ok">Live</span>
            )}
            <small className="last-updated">
              {lastUpdatedAt ? `Updated ${new Date(lastUpdatedAt).toLocaleTimeString()}` : ""}
            </small>
          </div>
        </header>

        <section className="dashboard-grid" aria-label="Key metrics">
          <StatCard
            label="Monitored assets"
            value={metrics ? metrics.monitoredAssets : "—"}
            hint="Devices & services under observation"
          />
          <StatCard
            label="Active alerts"
            value={metrics ? metrics.activeAlerts : "—"}
            hint="Alerts that need attention"
          />
          <StatCard
            label="Incidents (today)"
            value={metrics ? metrics.incidentsToday : "—"}
            hint="Investigations opened today"
          />
          <StatCard
            label="Avg response time"
            value={metrics ? `${metrics.avgResponseTimeMs} ms` : "—"}
            hint="Average response across checks"
          />
          <StatCard label="System status" value={formattedStatus} hint={metrics?.systemStatus} />
        </section>

        <section className="dashboard-actions" aria-label="Actions and tools">
          <div className="action-row">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                // Using a simple navigation approach — keep behaviour explicit and testable.
                window.location.href = "/alerts";
              }}
            >
              View alerts
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => {
                // Manual refresh
                setLoading(true);
                // Re-run the effect by toggling metrics to null briefly; the effect itself fetches periodically
                setMetrics(null);
                // Trigger fetch by creating a synthetic fetch using fetch to the same endpoint.
                fetch("/api/dashboard").finally(() => setLoading(false));
              }}
            >
              Refresh
            </button>
          </div>
          {error && (
            <div className="callout callout--warning" role="alert">
              <strong>Warning:</strong> {error}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default React.memo(DashboardPage);
