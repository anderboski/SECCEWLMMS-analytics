import { useCallback, useEffect, useState } from 'react';
import { parseScores, parseSelector } from './transform';

async function fetchJson(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export function useData() {
  const [state, setState] = useState({ loading: true, error: null, rows: [], selector: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [scores, selector] = await Promise.all([
        fetchJson('/api/scores'),
        fetchJson('/api/selector'),
      ]);
      setState({
        loading: false,
        error: null,
        rows: parseScores(scores.values),
        selector: parseSelector(selector.values),
      });
    } catch (e) {
      setState({ loading: false, error: String(e.message || e), rows: [], selector: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
