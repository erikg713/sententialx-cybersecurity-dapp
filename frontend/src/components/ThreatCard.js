import React, { memo, useMemo, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * ThreatCard
 *
 * Presents a compact, accessible card for a single threat.
 * - Adds PropTypes and sensible defaults
 * - Memoized for render performance
 * - Accessible: keyboard actionable when onSelect is provided
 * - Displays title, truncated description, severity badge, and optional timestamp
 */

const MAX_DESCRIPTION_LENGTH = 160;

const severityClass = (severity) => {
  if (!severity) return "unknown";
  return String(severity).trim().toLowerCase();
};

const severityLabel = (severity) => {
  const s = (severity || "").toLowerCase();
  switch (s) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "Unknown";
  }
};

const formatTimestamp = (iso) => {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    // Use locale-aware short date + time
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return iso;
  }
};

function ThreatCardComponent({ threat, onSelect }) {
  const sevClass = useMemo(() => severityClass(threat?.severity), [threat]);
  const label = useMemo(() => severityLabel(threat?.severity), [threat]);
  const timestamp = useMemo(() => formatTimestamp(threat?.timestamp), [threat]);

  const description = useMemo(() => {
    const desc = threat?.description ?? "";
    if (desc.length <= MAX_DESCRIPTION_LENGTH) return desc;
    return `${desc.slice(0, MAX_DESCRIPTION_LENGTH - 1).trim()}…`;
  }, [threat]);

  const handleClick = useCallback(
    (e) => {
      if (typeof onSelect === "function") onSelect(threat);
    },
    [onSelect, threat]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (!onSelect) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(threat);
      }
    },
    [onSelect, threat]
  );

  return (
    <div
      className={`threat-card ${sevClass}`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleClick : undefined}
      onKeyPress={onSelect ? handleKeyPress : undefined}
      aria-label={`Threat: ${threat?.title || "Untitled"}, severity ${label}`}
    >
      <header className="threat-card__header">
        <h3 className="threat-card__title">{threat?.title || "Untitled threat"}</h3>
        <span
          className={`threat-card__severity-badge ${sevClass}`}
          aria-hidden="false"
          role="status"
          aria-label={`Severity: ${label}`}
          title={`Severity: ${label}`}
        >
          {label}
        </span>
      </header>

      {description ? (
        <p className="threat-card__description">{description}</p>
      ) : (
        <p className="threat-card__description threat-card__description--muted">
          No description provided.
        </p>
      )}

      {timestamp && (
        <div className="threat-card__meta">
          <time dateTime={threat.timestamp}>{timestamp}</time>
        </div>
      )}
    </div>
  );
}

ThreatCardComponent.propTypes = {
  threat: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    severity: PropTypes.string,
    timestamp: PropTypes.string, // ISO timestamp
  }),
  // Optional: called when the card is clicked or activated via keyboard
  onSelect: PropTypes.func,
};

ThreatCardComponent.defaultProps = {
  threat: {
    id: null,
    title: "Untitled threat",
    description: "",
    severity: "unknown",
    timestamp: "",
  },
  onSelect: undefined,
};

// Custom memo to avoid re-render if threat shallow-equals previous
function areEqual(prev, next) {
  const a = prev.threat || {};
  const b = next.threat || {};

  return (
    a.id === b.id &&
    a.title === b.title &&
    a.description === b.description &&
    a.severity === b.severity &&
    a.timestamp === b.timestamp &&
    prev.onSelect === next.onSelect
  );
}

export default memo(ThreatCardComponent, areEqual);
