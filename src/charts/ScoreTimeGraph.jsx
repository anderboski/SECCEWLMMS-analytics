import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import FilterControls from '../components/FilterControls.jsx';
import { METRICS, METRIC_COLORS } from '../lib/metrics';
import { applyFilters, buildTimeSeries } from '../lib/transform';

const SCALES = ['day', 'week', 'month', 'year'];

export default function ScoreTimeGraph({ rows }) {
  const [filters, setFilters] = useState({ dayType: 'both', start: '', end: '' });
  const [scale, setScale] = useState('week');
  const [active, setActive] = useState(() => new Set()); // metric lines off by default

  const data = useMemo(
    () => buildTimeSeries(applyFilters(rows, filters), scale),
    [rows, filters, scale]
  );

  const toggle = (key) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const lastIndex = data.length - 1;
  const makeLabel = (text, color) => (props) => {
    if (props.index !== lastIndex || props.value == null) return null;
    return (
      <text x={props.x + 6} y={props.y} dy={3} fontSize={11} fill={color} fontWeight={700}>
        {text}
      </text>
    );
  };

  return (
    <div className="card">
      <h2>Score timegraph</h2>
      <FilterControls value={filters} onChange={setFilters}>
        <div className="field">
          <label>Scale</label>
          <select value={scale} onChange={(e) => setScale(e.target.value)}>
            {SCALES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </FilterControls>

      <div className="metric-toggles">
        {METRICS.map((m) => {
          const on = active.has(m.key);
          return (
            <span
              key={m.key}
              className={`chip ${on ? 'on' : ''}`}
              style={{ color: on ? METRIC_COLORS[m.key] : 'var(--ink-soft)' }}
              onClick={() => toggle(m.key)}
            >
              <span className="dot" />
              {m.name}
            </span>
          );
        })}
      </div>

      {data.length === 0 ? (
        <div className="muted">No data for the selected filters.</div>
      ) : (
        <ResponsiveContainer width="100%" height={440}>
          <LineChart data={data} margin={{ top: 10, right: 90, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="#eee5d2" strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#8a7d6b' }} minTickGap={20} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: '#8a7d6b' }} />
            <Tooltip
              contentStyle={{
                background: '#fffdf7',
                border: '2px solid #e3d9c6',
                borderRadius: 10,
                fontFamily: 'inherit',
              }}
              formatter={(v, name) => [v == null ? '—' : v, name]}
            />
            {METRICS.filter((m) => active.has(m.key)).map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.name}
                stroke={METRIC_COLORS[m.key]}
                strokeWidth={2}
                strokeDasharray="5 3"
                strokeOpacity={0.9}
                dot={false}
                connectNulls
                isAnimationActive={false}
                label={makeLabel(m.name, METRIC_COLORS[m.key])}
              />
            ))}
            {/* Main score: thick black smooth line, drawn last so it sits on top. */}
            <Line
              type="monotone"
              dataKey="score"
              name="Score"
              stroke="#2b2b2b"
              strokeWidth={3}
              dot={false}
              connectNulls
              isAnimationActive={false}
              label={makeLabel('Score', '#2b2b2b')}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <p className="muted" style={{ fontSize: 12 }}>
        Main score (%) shown on a 0–10 scale (value ÷ 10). Metric toggles don’t affect it.
      </p>
    </div>
  );
}
