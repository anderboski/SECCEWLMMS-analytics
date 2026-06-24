import { METRICS } from '../lib/metrics';

export default function Definitions({ selector }) {
  return (
    <div>
      <h1>Definitions</h1>

      <div className="card">
        <h2>Sport categories (Selector)</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Valid values for the X1–X3 columns. {selector.length} categories.
        </p>
        <div className="sports-grid">
          {selector.map((s) => (
            <span key={s} className="sport-tag">{s}</span>
          ))}
          {selector.length === 0 && <span className="muted">No categories loaded.</span>}
        </div>
      </div>

      <div className="card">
        <h2>Scoring metrics</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          The 10 SECCEWLMMS metrics and their weights (total possible weighted score = 105).
        </p>
        <div className="def-list">
          {METRICS.map((m) => (
            <div className="def-row" key={m.key}>
              <span className="nm">{m.name}</span>
              <span className="wt">wt {m.weight.toFixed(1)}</span>
              <span className="muted">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
