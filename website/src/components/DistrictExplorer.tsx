import { useEffect, useMemo, useRef, useState } from 'react';
import districts from '../data/districts.json';
import { announcements, household, riskLabel, text } from '../content';
import { COASTAL, FLASH, notes, problem, ui } from '../extra';
import { districtShapes, mapHeight, mapWidth, riverPaths } from '../mapGeometry';
import { MIN_RIVER_DANGER, type DistrictForecast, type LiveState, type Threshold } from '../live';
import type { District, Language, RiskLevel } from '../types';

const districtList = districts as District[];
type DrillLevel = 'WARNING' | 'DANGER' | null;
type Box = [number, number, number, number];

type Props = {
  lang: Language;
  selectedKey: string;
  onSelect: (key: string) => void;
  simulation: DrillLevel;
  setSimulation: (level: DrillLevel) => void;
  live: LiveState;
};

const fill: Record<RiskLevel, string> = { NORMAL: '#bfe6d8', WATCH: '#f4d27d', WARNING: '#ffaa73', DANGER: '#fb6f6f', UNKNOWN: '#d5dcda' };
const ink: Record<RiskLevel, string> = { NORMAL: '#52d7b5', WATCH: '#e2ad35', WARNING: '#ff9a57', DANGER: '#fb6868', UNKNOWN: '#9baead' };
const FULL: Box = [0, 0, mapWidth, mapHeight];
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function dateLabel(date: string | null | undefined, lang: Language, simulation: boolean) {
  if (simulation) return lang === 'bn' ? '\u0986\u0997\u09be\u09ae\u09c0 \u0995\u09af\u09bc\u09c7\u0995 \u09a6\u09bf\u09a8' : 'the coming days';
  if (!date) return lang === 'bn' ? '\u09a4\u09be\u09b0\u09bf\u0996 \u09a8\u09c7\u0987' : 'Not available';
  return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
const norm = (s: string) => s.toLowerCase().replace(/[^a-z\u0980-\u09ff]/g, '');

function zoomBox(key: string): Box {
  const s = districtShapes.find((item) => item.key === key);
  if (!s) return FULL;
  const [x, y, w, h] = s.box;
  const size = Math.max(w, h * (mapWidth / mapHeight), 70) * 2.6;
  const width = Math.min(mapWidth, size);
  const height = width * (mapHeight / mapWidth);
  return [x + w / 2 - width / 2, y + h / 2 - height / 2, width, height];
}

function Chart({ forecast, t, lang }: { forecast: DistrictForecast; t: Threshold; lang: Language }) {
  const rows = forecast.rows ?? [];
  if (!rows.length) return null;
  const W = 360; const H = 150; const pad = 8; const bottom = 22; const top = 16;
  const max = Math.max(...rows.flatMap((r) => [r.mid, r.worst]), t.watch) * 1.1;
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, rows.length - 1);
  const y = (v: number) => H - bottom - (v / max) * (H - bottom - top);
  const line = (k: 'mid' | 'worst') => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(r[k]).toFixed(1)}`).join(' ');
  const levels: Array<[keyof Threshold, RiskLevel]> = [['watch', 'WATCH'], ['warning', 'WARNING'], ['danger', 'DANGER']];
  return (
    <svg className="forecast-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ui[lang].liveStamp}>
      {levels.filter(([k]) => t[k] <= max).map(([k, lvl]) => (
        <g key={k}>
          <line x1={pad} x2={W - pad} y1={y(t[k])} y2={y(t[k])} stroke={ink[lvl]} strokeDasharray="4 4" />
          <text x={W - pad} y={y(t[k]) - 4} textAnchor="end" fill={ink[lvl]}>{riskLabel[lvl][lang]}</text>
        </g>
      ))}
      <path d={line('worst')} fill="none" stroke="#8aa39e" strokeWidth="1.4" strokeDasharray="3 3" />
      <path d={line('mid')} fill="none" stroke="#0f8f7a" strokeWidth="2.6" />
      {[0, rows.length - 1].map((i) => <text key={i} x={x(i)} y={H - 6} textAnchor={i ? 'end' : 'start'}>{dateLabel(rows[i].day, lang, false)}</text>)}
      <text x={pad} y={11} fill="#0f8f7a">{'\u2014'} {ui[lang].chartMain}</text>
      <text x={pad + 110} y={11}>- - {ui[lang].chartWorst}</text>
    </svg>
  );
}

export default function DistrictExplorer({ lang, selectedKey, onSelect, simulation, setSimulation, live }: Props) {
  const t = text[lang];
  const u = ui[lang];
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<Box>(FULL);
  const [zoomed, setZoomed] = useState(false);
  const anim = useRef(0);
  const viewRef = useRef<Box>(FULL);

  const levelOf = (key: string): RiskLevel => live.levels[key]?.level ?? 'UNKNOWN';
  const selected = districtList.find((item) => item.key === selectedKey) ?? districtList[0];
  const forecast = live.levels[selected.key] ?? { level: 'UNKNOWN' as RiskLevel, peak_day: null, live: false };
  const level: RiskLevel = simulation ?? forecast.level;
  const isSimulation = simulation !== null || Boolean(forecast.simulated);
  const threshold = live.thresholds[selected.key];

  function animateTo(target: Box) {
    cancelAnimationFrame(anim.current);
    const from = viewRef.current;
    if (reduceMotion) { viewRef.current = target; setView(target); return; }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 750);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const next = from.map((v, i) => v + (target[i] - v) * e) as Box;
      viewRef.current = next; setView(next);
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }
  function choose(key: string) {
    onSelect(key); setSimulation(null); setZoomed(true); animateTo(zoomBox(key)); setQuery('');
    history.replaceState(null, '', `#${key}`);
  }
  function showAll() { setZoomed(false); animateTo(FULL); }

  useEffect(() => {
    const key = location.hash.slice(1);
    if (districtList.some((d) => d.key === key)) {
      const timer = setTimeout(() => choose(key), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const value: Record<RiskLevel, number> = { NORMAL: 0, WATCH: 0, WARNING: 0, DANGER: 0, UNKNOWN: 0 };
    for (const d of districtList) value[levelOf(d.key)] += 1;
    if (simulation) { value[levelOf(selectedKey)] -= 1; value[simulation] += 1; }
    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.levels, selectedKey, simulation]);

  const elevated = districtList.filter((d) => ['WATCH', 'WARNING', 'DANGER'].includes(levelOf(d.key)))
    .sort((a, b) => ['DANGER', 'WARNING', 'WATCH'].indexOf(levelOf(a.key)) - ['DANGER', 'WARNING', 'WATCH'].indexOf(levelOf(b.key)));

  const results = useMemo(() => {
    const n = norm(query);
    if (!n) return [];
    return districtList.map((d) => {
      const names = [d.en, d.bn, d.key, ...d.aliases].map(norm);
      return { d, score: names.some((x) => x.startsWith(n)) ? 0 : names.some((x) => x.includes(n)) ? 1 : 9 };
    }).filter((m) => m.score < 9).sort((a, b) => a.score - b.score || a.d.en.localeCompare(b.d.en)).slice(0, 6).map((m) => m.d);
  }, [query]);

  const steps = household[level][lang];
  const announcement = level === 'WARNING' || level === 'DANGER'
    ? announcements[level]?.[lang](selected[lang], dateLabel(forecast.peak_day, lang, isSimulation)) : null;
  const districtNotes = [
    FLASH.includes(selected.key) ? notes.flash[lang] : null,
    COASTAL.includes(selected.key) ? notes.coastal[lang] : null,
    (threshold?.danger ?? Infinity) < MIN_RIVER_DANGER ? notes.small[lang] : null,
  ].filter(Boolean) as string[];

  const zoomFactor = mapWidth / view[2];
  const labelSize = 10.5 / zoomFactor;
  const stamp = live.mode === 'live' ? u.liveStamp : live.mode === 'loading' ? u.loadingStamp : u.snapStamp;

  async function copyScript() {
    if (!announcement) return;
    try { await navigator.clipboard.writeText(announcement); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  }

  return (
    <section className="outlook section-shell" id="outlook" aria-labelledby="outlook-title">
      <div className="section-heading outlook-heading">
        <div>
          <p className="eyebrow eyebrow-dark"><span className="eyebrow-dot" />{t.mapKicker}</p>
          <h2 id="outlook-title">{t.mapTitle}</h2>
          <p className="section-lede">{u.mapBody}</p>
        </div>
        <div className={`snapshot-stamp stamp-${live.mode}`}>
          <span className="stamp-dot" />
          <div><b>{stamp}</b><small>{live.mode === 'loading' ? `${live.progress} / 64` : live.mode === 'live' ? (lang === 'en' ? 'Updated just now' : '\u098f\u0987\u09ae\u09be\u09a4\u09cd\u09b0 \u09b9\u09be\u09b2\u09a8\u09be\u0997\u09be\u09a6') : live.generated}</small></div>
        </div>
      </div>

      <div className="outlook-grid">
        <div className="map-card" aria-label={t.mapAlt}>
          <div className="map-card-top">
            <div className="map-count"><strong>64</strong><span>{live.mode === 'live' ? u.countsLabel : u.countsSnap}</span></div>
            <div className="district-search">
              <span aria-hidden="true">{'\u2315'}</span>
              <input value={query} placeholder={t.searchDistrict} aria-label={t.searchDistrict} aria-expanded={results.length > 0}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && results.length) { setActive((active + 1) % results.length); e.preventDefault(); }
                  else if (e.key === 'ArrowUp' && results.length) { setActive((active - 1 + results.length) % results.length); e.preventDefault(); }
                  else if (e.key === 'Enter' && results[active]) choose(results[active].key);
                  else if (e.key === 'Escape') setQuery('');
                }} />
              {query.trim() && <span className="search-results" role="listbox">
                {results.length ? results.map((r, i) => (
                  <button type="button" key={r.key} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''} onMouseDown={(e) => { e.preventDefault(); choose(r.key); }}>
                    <span><i style={{ background: ink[levelOf(r.key)] }} />{r[lang]} <em>{lang === 'en' ? r.bn : r.en}</em></span>
                    <small>{riskLabel[levelOf(r.key)][lang]}</small>
                  </button>
                )) : <span className="no-match">{u.noMatch}</span>}
              </span>}
            </div>
          </div>
          <div className="district-map-wrap">
            <svg className="district-map" viewBox={view.map((v) => v.toFixed(2)).join(' ')} role="img" aria-label={t.mapAlt}>
              <g className="country-shadow-group" transform="translate(3 7)">{districtShapes.map((s) => <path key={s.key} d={s.d} className="country-shadow" />)}</g>
              {districtShapes.map((s) => {
                const lvl = isSimulation && s.key === selectedKey ? level : levelOf(s.key);
                const chosen = s.key === selectedKey;
                const d = districtList.find((item) => item.key === s.key)!;
                return (
                  <path key={s.key} d={s.d} className={`district-shape${chosen ? ' is-selected' : ''}${zoomed && !chosen ? ' is-dim' : ''}`}
                    fill={fill[lvl]} role="button" tabIndex={0} aria-pressed={chosen} aria-label={`${d[lang]}: ${riskLabel[lvl][lang]}`}
                    onClick={() => choose(s.key)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(s.key); } }}>
                    <title>{d[lang]} {'\u00b7'} {riskLabel[lvl][lang]}</title>
                  </path>
                );
              })}
              {riverPaths.map((r) => <path key={r.name} d={r.d} className={`river-line${r.main ? ' river-main' : ''}`} />)}
              {zoomFactor > 1.6 && districtShapes.map((s) => {
                const d = districtList.find((item) => item.key === s.key)!;
                return <text key={s.key} x={s.cx} y={s.cy} className={`district-label${s.key === selectedKey ? ' is-selected' : ''}`} style={{ fontSize: s.key === selectedKey ? labelSize * 1.5 : labelSize }}>{d[lang]}</text>;
              })}
            </svg>
            <div className="map-compass" aria-hidden="true"><span>N</span><i>{'\u2191'}</i></div>
            {zoomed && <button type="button" className="map-reset" onClick={showAll}>{'\u2190'} {u.allBangladesh}</button>}
            <div className="map-caption">GANGES {'\u00b7'} BRAHMAPUTRA {'\u00b7'} MEGHNA</div>
          </div>
          <div className="map-legend" aria-label={t.latest}>
            {(['NORMAL', 'WATCH', 'WARNING', 'DANGER'] as RiskLevel[]).map((item) => <span key={item}><i style={{ backgroundColor: ink[item] }} />{riskLabel[item][lang]} <b>{counts[item]}</b></span>)}
          </div>
          <div className="watch-chips" aria-live="polite">
            {elevated.length ? elevated.map((d) => (
              <button type="button" key={d.key} onClick={() => choose(d.key)}><i style={{ background: ink[levelOf(d.key)] }} />{d[lang]} {'\u00b7'} {riskLabel[levelOf(d.key)][lang]}</button>
            )) : <span>{lang === 'en' ? 'All 64 districts are normal right now.' : '\u098f\u0996\u09a8 \u09ec\u09ea\u099f\u09bf \u099c\u09c7\u09b2\u09be\u0987 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964'}</span>}
          </div>
          <p className="map-source">{u.mapSource}</p>
        </div>

        <aside className={`district-card risk-${level.toLowerCase()}`} aria-live="polite">
          <div className="district-card-head">
            <div className="district-place"><span className="place-pin" aria-hidden="true">{'\u2316'}</span><div><p>{selected.division} {lang === 'en' ? 'division' : '\u09ac\u09bf\u09ad\u09be\u0997'}</p><h3>{selected[lang]}</h3></div></div>
            <span className={`risk-pill risk-${level.toLowerCase()}`}><i />{riskLabel[level][lang]}</span>
          </div>
          {isSimulation && <div className="simulation-banner"><span>!</span>{t.simulated}</div>}
          <div className="forecast-block">
            <span>{t.riverContext}</span>
            <div className="forecast-metric"><strong>{riskLabel[level][lang]}</strong><small>{t.riskLevel}</small></div>
            <div className="peak-row"><span>{t.peak}</span><b>{dateLabel(forecast.peak_day, lang, isSimulation)}</b></div>
            {forecast.live && threshold && !simulation ? <Chart forecast={forecast} t={threshold} lang={lang} /> : null}
            <p className="no-numbers">{forecast.live ? u.liveNote : u.snapNote}</p>
          </div>
          <div className="problem-block">
            <h4>{u.problem}</h4>
            <p>{problem[level][lang]}</p>
            {districtNotes.map((n) => <p key={n} className="problem-note">{n}</p>)}
          </div>
          <div className="next-steps">
            <h4>{t.whatNow}</h4>
            <ol>{steps.map((step, index) => <li key={`${index}-${step}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
          </div>
          {announcement && <div className="announcement-card">
            <div className="announcement-top"><span className="speaker-icon" aria-hidden="true">{'\u25d6'}</span><div><b>{t.alertFor}</b><small>{selected[lang]} {'\u00b7'} {riskLabel[level][lang]}</small></div></div>
            <p lang={lang}>{announcement}</p>
            <button type="button" className="copy-button" onClick={copyScript}>{copied ? t.copied : t.copyAlert}<span aria-hidden="true">{'\u2197'}</span></button>
          </div>}
          <div className="rehearsal">
            <div><b>{t.drill}</b><p>{t.drillHelp}</p></div>
            <div className="rehearsal-buttons">
              <button type="button" className={simulation === 'WARNING' ? 'active' : ''} onClick={() => setSimulation(simulation === 'WARNING' ? null : 'WARNING')}>{t.warning}</button>
              <button type="button" className={simulation === 'DANGER' ? 'active danger-active' : ''} onClick={() => setSimulation(simulation === 'DANGER' ? null : 'DANGER')}>{t.danger}</button>
              {simulation && <button type="button" className="clear-drill" onClick={() => setSimulation(null)}>{t.clearDrill}</button>}
            </div>
          </div>
        </aside>
      </div>
      <p className="snapshot-disclaimer"><span>i</span>{t.simulationNote}</p>
    </section>
  );
}
