import React, { useCallback, useEffect, useMemo, useState } from "react";
import ThreatCard from "../components/ThreatCard";

/*
  Clean, production-minded ThreatFeedPage

  Key improvements:
  - Uses configurable endpoint (REACT_APP_THREAT_FEED) with a safe fallback.
  - Proper loading / error / empty states with a small refresh control.
  - Debounced search input (simple, lightweight approach) to avoid excessive re-filtering.
  - Derived severity options from data; stable ordering with "All" first.
  - Memoized list rendering via React.memo (ThreatList) to reduce re-renders.
  - Defensive data handling and clear, minimal in-component helpers.
  - Minimal inline styles kept intentionally small so existing CSS can override them.
*/

const DEFAULT_ENDPOINT = process.env.REACT_APP_THREAT_FEED || "/api/threats";

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

/* Simple small visual skeleton shown while loading */
function LoadingSkeleton() {
  return (
    <div aria-hidden style={{ display: "grid", gap: 12 }}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            height: 76,
            background: "rgba(0,0,0,0.05)",
            borderRadius: 8,
          }}
        />
      ))}
    </div>
  );
}

/* Memoized list so the parent re-render doesn't force children re-evaluation unnecessarily */
const ThreatList = React.memo(function ThreatList({ items }) {
  return (
    <div className="threat-list" style={{ display: "grid", gap: 12 }}>
      {items.map((t, i) => (
        // Use id when available, otherwise fall back to index to keep keys stable
        <ThreatCard key={t.id ?? `idx-${i}`} threat={t} />
      ))}
    </div>
  );
});

export default function ThreatFeedPage() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  // local debounced query used for filtering so typing isn't instantaneously filtering on every keystroke
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  // debounce effect: update debouncedQuery 250ms after typing stops
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const fetchThreats = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(DEFAULT_ENDPOINT, { signal });
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        // Accept either an array at the top-level or an object with `items`
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        setThreats(list);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn("Threat feed fetch error:", err);
        setError("Unable to load live threat feed.");
        // graceful fallback: keep whatever threats we already had; if none, provide small useful mocks
        if (threats.length === 0) {
          setThreats([
            {
              id: "mock-1",
              title: "WormGPT Attack Attempt",
              severity: "High",
              description: "Payload attempt targeting exposed RCE vector.",
              firstSeen: new Date().toISOString(),
            },
            {
              id: "mock-2",
              title: "Phishing Domain Detected",
              severity: "Medium",
              description: "New domain mimicking corporate login.",
              firstSeen: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchThreats(controller.signal);
    return () => controller.abort();
  }, [fetchThreats]);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    // fire-and-forget refresh; will be aborted if component unmounts
    fetchThreats(controller.signal);
  }, [fetchThreats]);

  // Build severity options deterministically and memoized
  const severityOptions = useMemo(() => {
    const set = new Set((threats || []).map((t) => (t.severity ? String(t.severity) : null)).filter(Boolean));
    const ordered = Array.from(set).sort((a, b) => {
      const priority = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (priority[a] ?? 99) - (priority[b] ?? 99) || a.localeCompare(b);
    });
    return ["All", ...ordered];
  }, [threats]);

  // Filtered list depends on debounced query for smoother typing UX
  const filteredThreats = useMemo(() => {
    const q = debouncedQuery;
    if (!threats || threats.length === 0) return [];
    return threats.filter((t) => {
      if (severityFilter !== "All" && String(t.severity) !== String(severityFilter)) return false;
      if (!q) return true;
      const inTitle = String(t.title || "").toLowerCase().includes(q);
      const inDesc = String(t.description || "").toLowerCase().includes(q);
      const inMeta = String(t.tags || "").toLowerCase().includes(q);
      return inTitle || inDesc || inMeta;
    });
  }, [threats, debouncedQuery, severityFilter]);

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>⚠️ Threat Feed</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={refresh}
            aria-label="Refresh threat feed"
            title="Refresh"
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "white",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="threat-controls" style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <input
          aria-label="Search threats"
          type="search"
          placeholder="Search title, description, or tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        />

        <select
          aria-label="Filter by severity"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.12)" }}
        >
          {severityOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingSkeleton />}

      {error && (
        <div role="alert" style={{ color: "#b35", marginBottom: 12 }}>
          {error} — showing cached examples.
        </div>
      )}

      {!loading && filteredThreats.length === 0 && (
        <div aria-live="polite" style={{ color: "rgba(0,0,0,0.6)" }}>
          No threats match your filters.
        </div>
      )}

      <ThreatList items={filteredThreats} />

      {/* footer summary */}
      <div style={{ marginTop: 12, color: "rgba(0,0,0,0.6)", fontSize: 13 }}>
        Showing {filteredThreats.length} of {threats.length} total {threats.length === 1 ? "item" : "items"}
        {threats.length > 0 && (
          <>
            {" — last item: "}
            {formatDate(threats[0]?.firstSeen || threats[0]?.timestamp)}
          </>
        )}
      </div>
    </div>
  );
    }
