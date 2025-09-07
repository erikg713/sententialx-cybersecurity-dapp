import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  defs,
  Label
} from 'recharts';

/**
 * A compact, accessible, and optimized threat dashboard chart.
 *
 * Accepts `data` as an array of { time, attacks, defenses } objects.
 * Uses useMemo to avoid unnecessary recalculation and React.memo to
 * prevent needless re-renders.
 *
 * The component intentionally:
 * - Provides sensible defaults so it can be used without props.
 * - Exposes a small API (height, showLegend) to adjust rendering.
 * - Includes accessible attributes for screen readers.
 */

/* Default fallback data so the component renders out-of-the-box */
const DEFAULT_DATA = [
  { time: '10:00', attacks: 3, defenses: 3 },
  { time: '11:00', attacks: 5, defenses: 5 },
  { time: '12:00', attacks: 2, defenses: 2 },
  { time: '13:00', attacks: 8, defenses: 7 },
  { time: '14:00', attacks: 4, defenses: 4 },
];

function formatCount(value, name) {
  if (value == null) return ['—', name];
  return [`${value}`, name];
}

function TooltipContent({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  // payload is ordered according to the chart, we render both if available
  const attacks = payload.find((p) => p.dataKey === 'attacks');
  const defenses = payload.find((p) => p.dataKey === 'defenses');

  return (
    <div
      className="dashboard-tooltip"
      style={{
        background: '#0b1220',
        color: '#e6eef8',
        padding: 10,
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        fontSize: 13,
      }}
      role="tooltip"
      aria-live="polite"
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {attacks && (
        <div style={{ color: '#ffb3b3', marginBottom: 4 }}>
          <strong style={{ color: '#ffdddd' }}>{attacks.value}</strong> attack
          {attacks.value !== 1 ? 's' : ''}
        </div>
      )}
      {defenses && (
        <div style={{ color: '#bfe9ff' }}>
          <strong style={{ color: '#e6f9ff' }}>{defenses.value}</strong> defense
          {defenses.value !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

TooltipContent.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function Dashboard({
  data = DEFAULT_DATA,
  height = 320,
  showLegend = true,
  className = '',
}) {
  // ensure stable reference and small transformation if needed later
  const chartData = useMemo(() => {
    // Defensive copy and normalization (time as string)
    return (Array.isArray(data) ? data : DEFAULT_DATA).map((d, i) => ({
      time: d.time != null ? String(d.time) : `#${i}`,
      attacks: Number.isFinite(d.attacks) ? d.attacks : 0,
      defenses: Number.isFinite(d.defenses) ? d.defenses : 0,
    }));
  }, [data]);

  const hasData = chartData.length > 0 && chartData.some((d) => d.attacks || d.defenses);

  return (
    <section
      className={`dashboard ${className}`}
      aria-label="Threat dashboard"
      style={{
        background: 'var(--card-bg, #071029)',
        color: 'var(--muted-text, #cfe8ff)',
        padding: 16,
        borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Threat Dashboard</h2>
        <div style={{ fontSize: 12, color: 'var(--muted, #9fbadf)' }}>
          {hasData ? 'Live summary' : 'No data available'}
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            {/* Gradient definitions for nicer strokes/fills */}
            <defs>
              <linearGradient id="gAttacks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0.15} />
              </linearGradient>
              <linearGradient id="gDefenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60aefc" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#60aefc" stopOpacity={0.12} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#0f1a2a" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#9fbadf', fontSize: 12 }}
              axisLine={{ stroke: '#122031' }}
              tickLine={false}
              interval="preserveStartEnd"
              padding={{ left: 6, right: 6 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#9fbadf', fontSize: 12 }}
              axisLine={{ stroke: '#122031' }}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: '#ffffff10' }} />
            {showLegend && (
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ color: '#9fbadf', fontSize: 12, paddingBottom: 8 }}
              />
            )}

            {/* Attacks line */}
            <Line
              name="Attacks"
              type="monotone"
              dataKey="attacks"
              stroke="#ff4d4d"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#fff' }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={600}
              connectNulls={true}
            />

            {/* Defenses line */}
            <Line
              name="Defenses"
              type="monotone"
              dataKey="defenses"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#fff' }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={600}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Simple legend for assistive tech / alternate display */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#cfe8ff', fontSize: 13 }}>
          <span
            aria-hidden
            style={{ width: 12, height: 8, background: '#ff4d4d', display: 'inline-block', borderRadius: 2 }}
          />
          Attacks
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#cfe8ff', fontSize: 13 }}>
          <span
            aria-hidden
            style={{ width: 12, height: 8, background: '#38bdf8', display: 'inline-block', borderRadius: 2 }}
          />
          Defenses
        </span>
      </div>
    </section>
  );
}

Dashboard.propTypes = {
  // array of { time: string|number, attacks: number, defenses: number }
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      attacks: PropTypes.number,
      defenses: PropTypes.number,
    })
  ),
  // chart height in pixels
  height: PropTypes.number,
  // whether to show the chart legend inside the chart
  showLegend: PropTypes.bool,
  // optional extra class names
  className: PropTypes.string,
};

export default React.memo(Dashboard);
