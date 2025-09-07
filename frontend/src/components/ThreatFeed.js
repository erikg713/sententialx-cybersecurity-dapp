// frontend/src/components/ThreatFeed.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import ThreatCard from "./ThreatCard";

/**
 * ThreatFeed
 *
 * - Fetches threat list from backend API (/api/threats).
 * - Polls periodically (configurable).
 * - Provides manual refresh, retry on error, and shows last updated timestamp.
 * - Uses AbortController to cancel inflight requests when unmounting or refetching.
 *
 * Small, deliberate improvements for robustness and UX:
 * - Avoids setting state on unmounted component.
 * - Cancels previous request before starting a new one.
 * - Limits loading UI to first-load or manual refresh.
 * - Exposes pollingInterval prop for easier testing/customization.
 */
const ThreatFeed = ({ pollingInterval }) => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true); // true for initial load
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Keep refs for mounted state and the current AbortController
  const isMountedRef = useRef(true);
  const controllerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Abort any in-flight request on unmount
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const fetchThreats = useCallback(
    async (options = { showLoading: false }) => {
      // Cancel previous request if any
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      if (options.showLoading) setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/threats", {
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        });

        // Defensive: normalize incoming payload
        const incoming = response?.data;
        const list = Array.isArray(incoming?.threats)
          ? incoming.threats
          : incoming?.threats ?? [];

        if (!isMountedRef.current) return; // component unmounted while awaiting

        setThreats(list);
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        // If request was aborted, quietly ignore
        if (axios.isCancel && axios.isCancel(err)) {
          // cancelled - nothing to do
          return;
        }

        // AbortController throws a DOMException with name "AbortError"
        if (err.name === "AbortError") return;

        // More robust error message extraction
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred while fetching threats.";

        if (isMountedRef.current) setError(message);

        // Keep existing threats displayed on error (don't clear)
        console.error("ThreatFeed: fetch error:", err);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchThreats({ showLoading: true });

    // Polling interval
    const interval = setInterval(() => {
      // For polls we don't show the global loader to avoid flashing UI
      fetchThreats({ showLoading: false });
    }, pollingInterval);

    return () => {
      clearInterval(interval);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [fetchThreats, pollingInterval]);

  const handleRefresh = () => fetchThreats({ showLoading: true });
  const handleRetry = () => fetchThreats({ showLoading: true });

  // Helper format for last updated
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString()
    : "—";

  return (
    <section className="threat-feed" aria-live="polite">
      <header className="threat-feed__header" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Threat Feed</h2>
          <small className="muted">Last updated: {formattedLastUpdated}</small>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            aria-disabled={loading}
            title="Refresh threat feed"
            className="btn btn--small"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <main style={{ marginTop: 12 }}>
        {loading && threats.length === 0 ? (
          <p className="status-message" aria-live="assertive">
            Loading threats…
          </p>
        ) : error ? (
          <div className="status-message error" role="status">
            <p style={{ margin: 0 }}>{error}</p>
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={handleRetry} className="btn">
                Retry
              </button>
            </div>
          </div>
        ) : threats.length === 0 ? (
          <p className="status-message">No threats detected.</p>
        ) : (
          <ul className="threat-feed__list" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {threats.map((threat, idx) => (
              <li key={threat.id ?? `${threat.type ?? "threat"}-${idx}`}>
                <ThreatCard threat={threat} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </section>
  );
};

ThreatFeed.propTypes = {
  // Polling interval in milliseconds
  pollingInterval: PropTypes.number,
};

ThreatFeed.defaultProps = {
  pollingInterval: 30000, // 30s
};

export default React.memo(ThreatFeed);
