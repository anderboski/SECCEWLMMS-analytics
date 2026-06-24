import { format, startOfISOWeek, parseISO, isValid } from 'date-fns';
import { METRICS } from './metrics';

const WEEKEND = new Set(['Sat', 'Sun']);

function num(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function parsePct(v) {
  if (!v) return null;
  const n = Number(String(v).replace('%', '').trim());
  return Number.isNaN(n) ? null : n;
}

// Column layout: 0 Date, 1 Wkd, 2..11 metrics, 12 %, 13..15 X1-X3, 16 Comment
export function parseScores(values) {
  if (!values || values.length < 2) return [];
  return values
    .slice(1)
    .filter((r) => r && r[0])
    .map((r) => {
      const o = { date: r[0], wkd: r[1] || '' };
      METRICS.forEach((m, i) => {
        o[m.key] = num(r[2 + i]);
      });
      o.scorePct = parsePct(r[12]);
      o.score = o.scorePct == null ? null : o.scorePct / 10; // 0–10 scale
      o.sports = [r[13], r[14], r[15]].map((s) => (s || '').trim()).filter(Boolean);
      o.comment = r[16] || '';
      const d = parseISO(r[0]);
      o.dateObj = isValid(d) ? d : null;
      o.isWeekend = WEEKEND.has(o.wkd);
      return o;
    })
    .filter((o) => o.dateObj);
}

export function parseSelector(values) {
  if (!values || values.length < 2) return [];
  return values
    .slice(1)
    .map((r) => (r[0] || '').trim())
    .filter(Boolean);
}

// dayType: 'both' | 'weekday' | 'weekend'
// weekdays: optional array of weekday abbreviations (e.g. ['Mon','Tue']); empty/undefined = all
export function applyFilters(rows, { dayType = 'both', start = '', end = '', weekdays } = {}) {
  const startD = start ? parseISO(start) : null;
  const endD = end ? parseISO(end) : null;
  const wkSet = weekdays && weekdays.length ? new Set(weekdays) : null;
  return rows.filter((r) => {
    if (dayType === 'weekday' && r.isWeekend) return false;
    if (dayType === 'weekend' && !r.isWeekend) return false;
    if (wkSet && !wkSet.has(r.wkd)) return false;
    if (startD && isValid(startD) && r.dateObj < startD) return false;
    if (endD && isValid(endD) && r.dateObj > endD) return false;
    return true;
  });
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function bucketKey(d, scale) {
  if (scale === 'year') return format(d, 'yyyy');
  if (scale === 'month') return format(d, 'yyyy-MM');
  if (scale === 'week') return format(startOfISOWeek(d), 'yyyy-MM-dd');
  return format(d, 'yyyy-MM-dd');
}

// Build aggregated time series. Averages score + each metric within each bucket.
export function buildTimeSeries(rows, scale) {
  const groups = new Map();
  for (const r of rows) {
    const key = bucketKey(r.dateObj, scale);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const keys = [...groups.keys()].sort();
  return keys.map((bucket) => {
    const items = groups.get(bucket);
    const point = { bucket };
    point.score = avg(items.map((x) => x.score));
    for (const m of METRICS) point[m.key] = avg(items.map((x) => x[m.key]));
    return point;
  });
}

function avg(arr) {
  const nums = arr.filter((n) => n != null && !Number.isNaN(n));
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

// Count sport frequency across X1-X3, ordered most -> least frequent.
export function buildSportCounts(rows, selector) {
  const counts = new Map(selector.map((s) => [s, 0]));
  for (const r of rows) {
    for (const s of r.sports) {
      counts.set(s, (counts.get(s) || 0) + 1); // include sports not in selector too
    }
  }
  return [...counts.entries()]
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count || a.sport.localeCompare(b.sport));
}
