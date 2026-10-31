import { useEffect, useState } from 'react';
import bundled from './data/status.json';
import type { ForecastSnapshot, RiskLevel } from './types';

/* Live river forecasts, computed with the same rules as the Python agent.
   The site reads status.json (last export) and thresholds.json (per-district river point
   and WATCH/WARNING/DANGER levels) from its own folder, then asks the free Open-Meteo
   flood API for fresh 16-day forecasts. Without thresholds.json it stays on the snapshot. */

export type Threshold = { lat: number; lon: number; watch: number; warning: number; danger: number };
export type ForecastRow = { day: string; mid: number; worst: number };
export type DistrictForecast = { level: RiskLevel; peak_day: string | null; live: boolean; rows?: ForecastRow[]; small?: boolean; simulated?: boolean };

const API = 'https://flood-api.open-meteo.com/v1/flood';
const ORDER: RiskLevel[] = ['NORMAL', 'WATCH', 'WARNING', 'DANGER'];
export const MIN_RIVER_DANGER = 300;

function classify(v: number, t: Threshold) { return v >= t.danger ? 3 : v >= t.warning ? 2 : v >= t.watch ? 1 : 0; }

export function assess(t: Threshold, daily: { time: string[]; river_discharge: Array<number | null>; river_discharge_max?: Array<number | null> }): DistrictForecast {
  const small = t.danger < MIN_RIVER_DANGER;
  let best = 0; let peak: string | null = null; let peakV = -1;
  const rows: ForecastRow[] = [];
  daily.time.forEach((day, i) => {
    const mid = daily.river_discharge[i];
    if (mid == null) return;
    const hi = daily.river_discharge_max?.[i];
    const worst = hi == null ? mid : hi;
    const m = classify(mid, t); const w = classify(worst, t);
    // Main forecast sets the level; the worst ensemble member may raise it one step only.
    const lvl = small ? m : Math.max(m, Math.min(w, m + 1));
    if (lvl > best || (lvl === best && worst > peakV)) { best = lvl; peak = day; peakV = worst; }
    rows.push({ day, mid, worst });
  });
  if (small && best > 1) best = 1; // small streams are capped at WATCH
  return { level: ORDER[best], peak_day: peak, live: true, rows, small };
}

async function fetchForecast(t: Threshold): Promise<DistrictForecast> {
  const url = `${API}?latitude=${t.lat}&longitude=${t.lon}&daily=river_discharge,river_discharge_max&forecast_days=16`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(String(r.status));
  return assess(t, (await r.json()).daily);
}

export type LiveState = {
  generated: string | null;
  levels: Record<string, DistrictForecast>;
  thresholds: Record<string, Threshold>;
  mode: 'snapshot' | 'loading' | 'live';
  progress: number;
};

async function getJSON<T>(path: string): Promise<T | null> {
  try { const r = await fetch(path, { cache: 'no-store' }); return r.ok ? await r.json() as T : null; } catch { return null; }
}

function fromSnapshot(s: ForecastSnapshot): Record<string, DistrictForecast> {
  const out: Record<string, DistrictForecast> = {};
  for (const [k, v] of Object.entries(s.districts)) out[k] = { level: v.level, peak_day: v.peak_day, live: false, simulated: v.simulated };
  return out;
}

export function useLiveForecast(): LiveState {
  const start = bundled as ForecastSnapshot;
  const [state, setState] = useState<LiveState>({ generated: start.generated, levels: fromSnapshot(start), thresholds: {}, mode: 'snapshot', progress: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const latest = await getJSON<ForecastSnapshot>('./status.json');
      if (latest && !cancelled) setState((s) => ({ ...s, generated: latest.generated, levels: fromSnapshot(latest) }));
      const thresholds = await getJSON<Record<string, Threshold>>('./thresholds.json');
      if (!thresholds || cancelled) return;
      const keys = Object.keys(thresholds);
      setState((s) => ({ ...s, thresholds, mode: 'loading' }));
      let next = 0; let done = 0; let failed = 0;
      const worker = async () => {
        while (next < keys.length && failed < 3 && !cancelled) {
          const key = keys[next++];
          try {
            const result = await fetchForecast(thresholds[key]);
            done += 1;
            if (!cancelled) setState((s) => ({ ...s, levels: { ...s.levels, [key]: result }, progress: done }));
          } catch { failed += 1; }
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      if (!cancelled) setState((s) => ({ ...s, mode: done === keys.length ? 'live' : 'snapshot' }));
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}
