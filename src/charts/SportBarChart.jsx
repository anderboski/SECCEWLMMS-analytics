import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import FilterControls from '../components/FilterControls.jsx';
import { SPORT_PALETTE } from '../lib/metrics';
import { applyFilters, buildSportCounts, WEEKDAYS } from '../lib/transform';

export default function SportBarChart({ rows, selector }) {
  // weekdays: [] means "all". Toggle individual days to narrow down.
  const [filters, setFilters] = useState({ dayType: 'both', start: '', end: '', weekdays: [] });

  const data = useMemo(
    () => buildSportCounts(applyFilters(rows, filters), selector),
    [rows, selector, filters]
  );

  const toggleDay = (day) =>
    setFilters((f) => {
      const set = new Set(f.weekdays);
      set.has(day) ? set.delete(day) : set.add(day);
      return { ...f, weekdays: WEEKDAYS.filter((d) => set.has(d)) };
    });

  return (
    <div className="card">
      <h2>Sport barchart</h2>
      <FilterControls value={filters} onChange={setFilters} showDayType={false} />

      <div className="metric-toggles">
        {WEEKDAYS.map((d) => {
          const on = filters.weekdays.length === 0 || filters.weekdays.includes(d);
          return (
            <span
              key={d}
              className={`chip ${on ? 'on' : ''}`}
              style={{ color: on ? 'var(--accent)' : 'var(--ink-soft)' }}
              onClick={() => toggleDay(d)}
            >
              <span className="dot" />
              {d}
            </span>
          );
        })}
        {filters.weekdays.length > 0 && (
          <button
            className="btn ghost"
            onClick={() => setFilters((f) => ({ ...f, weekdays: [] }))}
          >
            all days
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="muted">No sport data for the selected filters.</div>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 60, left: 0 }}>
            <CartesianGrid stroke="#eee5d2" strokeDasharray="3 3" />
            <XAxis
              dataKey="sport"
              tick={{ fontSize: 12, fill: '#8a7d6b' }}
              angle={-40}
              textAnchor="end"
              interval={0}
              height={70}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8a7d6b' }} />
            <Tooltip
              cursor={{ fill: 'rgba(91,141,239,0.08)' }}
              contentStyle={{
                background: '#fffdf7',
                border: '2px solid #e3d9c6',
                borderRadius: 10,
                fontFamily: 'inherit',
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.sport} fill={SPORT_PALETTE[i % SPORT_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
