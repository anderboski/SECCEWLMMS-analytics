import { useMemo, useState } from 'react';
import { METRICS } from '../lib/metrics';

// Column definitions for the raw SCORES table.
const COLUMNS = [
  { key: 'date', label: 'Date', type: 'text', get: (r) => r.date },
  { key: 'wkd', label: 'Wkd', type: 'text', get: (r) => r.wkd },
  ...METRICS.map((m) => ({ key: m.key, label: m.letter, type: 'num', get: (r) => r[m.key] })),
  { key: 'scorePct', label: '%', type: 'num', get: (r) => r.scorePct },
  { key: 'x1', label: 'X1', type: 'text', get: (r) => r.sports[0] || '' },
  { key: 'x2', label: 'X2', type: 'text', get: (r) => r.sports[1] || '' },
  { key: 'x3', label: 'X3', type: 'text', get: (r) => r.sports[2] || '' },
  { key: 'comment', label: 'Comment', type: 'text', get: (r) => r.comment },
];

export default function RawData({ rows }) {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });

  const view = useMemo(() => {
    let out = rows.filter((r) =>
      COLUMNS.every((c) => {
        const f = (filters[c.key] || '').trim().toLowerCase();
        if (!f) return true;
        const v = c.get(r);
        return String(v ?? '').toLowerCase().includes(f);
      })
    );
    if (sort.key) {
      const col = COLUMNS.find((c) => c.key === sort.key);
      const mul = sort.dir === 'asc' ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = col.get(a);
        const bv = col.get(b);
        if (col.type === 'num') return ((av ?? -Infinity) - (bv ?? -Infinity)) * mul;
        return String(av ?? '').localeCompare(String(bv ?? '')) * mul;
      });
    }
    return out;
  }, [rows, filters, sort]);

  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );

  return (
    <div>
      <h1>Raw data</h1>
      <div className="card">
        <div className="muted" style={{ marginBottom: 10 }}>
          {view.length} of {rows.length} rows
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key}>
                    <span className="th-label" onClick={() => toggleSort(c.key)}>
                      {c.label}
                      {sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                    </span>
                    {c.type === 'text' && (
                      <div className="filter">
                        <input
                          placeholder="filter"
                          value={filters[c.key] || ''}
                          onChange={(e) =>
                            setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                          }
                        />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.map((r, i) => (
                <tr key={r.date + i}>
                  {COLUMNS.map((c) => (
                    <td key={c.key}>{fmt(c.get(r))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function fmt(v) {
  if (v == null || v === '') return '';
  return String(v);
}
