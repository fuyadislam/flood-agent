import { lazy, Suspense, useEffect, useState } from 'react';
import DistrictExplorer from './components/DistrictExplorer';
const FloodReliefScene = lazy(() => import('./components/FloodReliefScene'));
import { household, riskLabel, stageNames, text } from './content';
import { ui } from './extra';
import { useLiveForecast } from './live';
import type { Language, RiskLevel } from './types';

const REPO = 'https://github.com/fuyadislam/flood-agent';
const VIDEO_EMBED = 'https://www.youtube.com/embed/KjZoYMzo4Kk'; // paste your YouTube embed link here, e.g. https://www.youtube.com/embed/VIDEO_ID
type DrillLevel = 'WARNING' | 'DANGER' | null;
const stages: RiskLevel[] = ['NORMAL', 'WATCH', 'WARNING', 'DANGER'];

function RiverMark() {
  return <svg className="brand-mark" viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="15" fill="currentColor"/><path d="M8 25c5-9 9 9 14 0s9 9 14 0M10 18c4-6 8 6 12 0s8 6 12 0" fill="none" stroke="#84f3cf" strokeLinecap="round" strokeWidth="2.6"/><circle cx="22" cy="11" r="2.2" fill="#e7ffb9"/></svg>;
}

function Arrow() { return <span className="arrow-mark" aria-hidden="true">↗</span>; }

function StaticRelief() {
  return <div className="relief-canvas relief-fallback" aria-hidden="true"><div className="scene-fallback"><span>বাংলাদেশ</span><i /><b /><em /></div><div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" /></div>;
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [selectedKey, setSelectedKey] = useState('pirojpur');
  const [simulation, setSimulation] = useState<DrillLevel>(null);
  const [prepLevel, setPrepLevel] = useState<RiskLevel>('WATCH');
  const [enable3D] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const constrainedNetwork = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType ?? '');
    return !constrainedNetwork && (navigator.hardwareConcurrency ?? 8) > 2;
  });
  const t = text[lang];
  const u = ui[lang];
  const live = useLiveForecast();
  const heroLevels = Object.fromEntries(Object.entries(live.levels).map(([k, v]) => [k, v.level])) as Record<string, RiskLevel>;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className={`site-shell lang-${lang}`}>
      <header className="topnav">
        <a className="brand" href="#top" aria-label="Bonnasaathi home"><RiverMark /><span>Bonna<span className="brand-light">saathi</span></span><small>বন্যাসাথী</small></a>
        <nav className="primary-nav" aria-label={lang === 'en' ? 'Main navigation' : 'প্রধান নেভিগেশন'}>
          <a href="#outlook">{t.navMap}</a>
          <a href="#prepare">{t.navPrep}</a>
          <a href="#how-it-works">{t.navAbout}</a>
          <a href="#demo">{lang === 'en' ? 'Demo' : '\u09a1\u09c7\u09ae\u09cb'}</a>
        </nav>
        <div className="nav-actions">
          <div className="language-switch" role="group" aria-label={lang === 'en' ? 'Choose language' : 'ভাষা বেছে নিন'}>
            <button type="button" className={lang === 'en' ? 'selected' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
            <button type="button" className={lang === 'bn' ? 'selected' : ''} onClick={() => setLang('bn')} aria-pressed={lang === 'bn'}>বাংলা</button>
          </div>
          <a className="nav-cta" href="#outlook">{t.navCta}<Arrow /></a>
        </div>
      </header>

      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</p>
            <h1 id="hero-title">{t.heroLead}<br /><span>{t.heroAccent}</span></h1>
            <p className="hero-description">{t.heroBody}</p>
            <div className="hero-actions">
              <a className="button button-lime" href="#outlook">{t.heroPrimary}<Arrow /></a>
              <a className="text-link" href="#how-it-works">{t.heroSecondary}<span aria-hidden="true">↓</span></a>
            </div>
            <a className="hero-emergency" href="tel:999"><strong>999</strong><span>{lang === 'en' ? 'Call for emergencies in Bangladesh' : 'বাংলাদেশে জরুরি প্রয়োজনে ফোন করুন'}</span><Arrow /></a>
            <p className="hero-safety"><span aria-hidden="true">✳</span>{t.heroNote}</p>
          </div>
          <div className="hero-visual">
            <div className="hero-scene-label"><span className="scene-live-dot" />{t.sceneLabel}</div>
            {enable3D ? <Suspense fallback={<StaticRelief />}><FloodReliefScene levels={heroLevels} /></Suspense> : <StaticRelief />}
            <div className="scene-glass-card scene-top-card"><span className="glass-label">{live.mode === 'live' ? 'GLOFAS \u00b7 LIVE' : 'GLOFAS \u00b7 RIVER DISCHARGE'}</span><b>16 <small>{lang === 'en' ? 'day outlook' : 'দিনের পূর্বাভাস'}</small></b><i className="mini-wave" aria-hidden="true"><em /><em /><em /><em /><em /><em /><em /></i></div>
            <div className="scene-glass-card scene-bottom-card"><span className="scene-pulse" /><div><b>{lang === 'en' ? '64 districts' : '৬৪ জেলা'}</b><small>{lang === 'en' ? 'across Bangladesh' : 'সারা বাংলাদেশে'}</small></div><span className="card-chevron" aria-hidden="true">↗</span></div>
            <p className="scene-caption">{t.sceneCaption}</p>
            <span className="orbit-coordinate coordinate-one">24°N</span><span className="orbit-coordinate coordinate-two">90°E</span>
          </div>
          <div className="hero-scroll-hint"><span /><small>{lang === 'en' ? 'SCROLL TO EXPLORE' : 'দেখতে স্ক্রল করুন'}</small></div>
        </section>

        <div className="trust-strip" aria-label={lang === 'en' ? 'Project principles' : 'প্রকল্পের বৈশিষ্ট্য'}>
          <div><span className="trust-num">01</span><b>{t.stripA}</b></div><i />
          <div><span className="trust-num">02</span><b>{t.stripB}</b></div><i />
          <div><span className="trust-num">03</span><b>{t.stripC}</b></div>
          <span className="strip-mark" aria-hidden="true">∿</span>
        </div>

        <DistrictExplorer lang={lang} selectedKey={selectedKey} onSelect={setSelectedKey} simulation={simulation} setSimulation={setSimulation} live={live} />

        <section className="preparedness section-shell" id="prepare" aria-labelledby="prep-title">
          <div className="section-heading prep-heading">
            <div><p className="eyebrow eyebrow-dark"><span className="eyebrow-dot" />{t.prepKicker}</p><h2 id="prep-title">{t.prepTitle}</h2><p className="section-lede">{t.prepBody}</p></div>
            <div className="prep-stamp"><span className="prep-symbol">↗</span><span>{lang === 'en' ? 'SIMPLE ADVICE. READY WHEN IT MATTERS.' : 'সহজ পরামর্শ। প্রয়োজনের সময় পাশে।'}</span></div>
          </div>
          <div className="prep-panel">
            <div className="prep-tabs" role="tablist" aria-label={lang === 'en' ? 'Preparedness stage' : 'প্রস্তুতির ধাপ'}>
              {stages.map((stage, index) => <button type="button" key={stage} role="tab" aria-selected={prepLevel === stage} className={`prep-tab risk-${stage.toLowerCase()}${prepLevel === stage ? ' active' : ''}`} onClick={() => setPrepLevel(stage)}><span className="stage-count">0{index + 1}</span><span>{stageNames[lang][stage]}</span><i aria-hidden="true">{prepLevel === stage ? '↗' : '→'}</i></button>)}
            </div>
            <div className={`prep-content risk-${prepLevel.toLowerCase()}`} role="tabpanel">
              <div className="prep-content-top"><span className="risk-pill"><i />{riskLabel[prepLevel][lang]}</span><span>{lang === 'en' ? 'HOUSEHOLD CHECKLIST' : 'পরিবারের প্রস্তুতি তালিকা'}</span></div>
              <h3>{stageNames[lang][prepLevel]}</h3>
              <ol className="prep-checklist">{household[prepLevel][lang].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p><b aria-hidden="true">✓</b></li>)}</ol>
              <p className="prep-note"><span>i</span>{t.simulationNote}</p>
            </div>
          </div>
          <div className="emergency-line"><span className="emergency-mark">!</span><p>{t.emergency}<a href="tel:999">999</a><small>{lang === 'en' ? 'Bangladesh national emergency service' : 'বাংলাদেশের জাতীয় জরুরি সেবা'}</small></p><span className="emergency-arrow">↗</span></div>
        </section>

        <section className="agent-story" id="how-it-works" aria-labelledby="agent-title">
          <div className="story-inner">
            <div className="story-head">
              <div><p className="eyebrow"><span className="eyebrow-dot" />{t.agentKicker}</p><h2 id="agent-title">{t.agentTitle}</h2><p className="story-lede">{t.agentBody}</p></div>
              <div className="model-badge"><span className="model-glyph">✳</span><div><small>STRANDS AGENTS SDK</small><b>Amazon Nova 2 Lite</b><span>Amazon Bedrock</span></div></div>
            </div>
            <div className="flow-track">
              <article className="flow-step"><span className="flow-number">01</span><div className="flow-icon flow-river" aria-hidden="true">∿</div><h3>{t.flowForecast}</h3><p>{t.flowForecastSub}</p></article>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <article className="flow-step"><span className="flow-number">02</span><div className="flow-icon flow-rules" aria-hidden="true">⌘</div><h3>{t.flowRules}</h3><p>{t.flowRulesSub}</p></article>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <article className="flow-step"><span className="flow-number">03</span><div className="flow-icon flow-words" aria-hidden="true">ব</div><h3>{t.flowWords}</h3><p>{t.flowWordsSub}</p></article>
              <span className="flow-arrow" aria-hidden="true">→</span>
              <article className="flow-step flow-step-last"><span className="flow-number">04</span><div className="flow-icon flow-people" aria-hidden="true">↗</div><h3>{t.flowPeople}</h3><p>{t.flowPeopleSub}</p></article>
            </div>
            <div className="safety-band">
              <div className="safety-band-title"><span>01 / 03</span><h3>{t.safetyTitle}</h3></div>
              <p><span>01</span>{t.safety1}</p><p><span>02</span>{t.safety2}</p><p><span>03</span>{t.safety3}</p>
            </div>
          </div>
        </section>

        <section className="proof section-shell" aria-labelledby="proof-title">
          <div className="proof-head"><p className="eyebrow eyebrow-dark"><span className="eyebrow-dot" />{t.proofKicker}</p><h2 id="proof-title">{t.proofTitle}</h2><p className="section-lede">{t.proofBody}</p></div>
          <div className="proof-grid">
            <article className="proof-stat proof-primary"><span className="proof-index">01 — LARGE RIVER FLOODS</span><strong>7<span>/7</span></strong><p>{t.metricYears}</p><div className="proof-spark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="proof-stat proof-secondary"><span className="proof-index">02 — DANGER DAYS</span><strong>3.5<span>×</span></strong><p>{t.metricDanger}</p><div className="proof-minibar" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
            <article className="proof-stat proof-years"><span className="proof-index">03 — SUNAMGANJ</span><strong>4</strong><p>{t.metricSunamganj}</p><span className="year-list">1998 · 2004 · 2007 · 2017</span></article>
          </div>
          <p className="backtest-caveat"><span>i</span>{t.backtestCaveat}</p>
          <div className="limitation-card"><span className="limit-icon" aria-hidden="true">!</span><div><h3>{t.limitationTitle}</h3><p>{t.limitationBody}</p><small>{lang === 'en' ? 'For coastal cyclone and storm-surge signals, follow the Bangladesh Meteorological Department.' : 'উপকূলীয় ঘূর্ণিঝড় ও জলোচ্ছ্বাসের সংকেতের জন্য বাংলাদেশ আবহাওয়া অধিদপ্তরের নির্দেশনা শুনুন।'}</small></div><span className="limit-watermark" aria-hidden="true">∿</span></div>
          <p className="data-credit">{lang === 'en' ? 'Forecast source: GloFAS via Open-Meteo · Copernicus Emergency Management Service · CC BY 4.0' : 'পূর্বাভাসের উৎস: Open-Meteo-এর মাধ্যমে GloFAS · Copernicus Emergency Management Service · CC BY 4.0'}</p>
        </section>

        <section className="demo-section section-shell" id="demo" aria-labelledby="demo-title">
          <div className="section-heading"><div><p className="eyebrow eyebrow-dark"><span className="eyebrow-dot" />{u.videoKicker}</p><h2 id="demo-title">{u.videoTitle}</h2><p className="section-lede">{u.videoBody}</p></div>
            <a className="button button-dark" href={REPO}>{u.code}<span className="arrow-mark" aria-hidden="true">{'\u2197'}</span></a></div>
          <div className="video-frame">{VIDEO_EMBED ? <iframe src={VIDEO_EMBED} title={u.videoTitle} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /> : <p>{u.videoSoon}</p>}</div>
        </section>

        <section className="closing-cta">
          <div className="closing-orb" aria-hidden="true"><i /><i /><i /></div>
          <div className="closing-content"><p className="eyebrow"><span className="eyebrow-dot" />BONNASAATHI · BANGLADESH</p><h2>{t.finalTitle}</h2><p>{t.finalBody}</p><a href="#outlook" className="button button-lime">{t.ctaDistrict}<Arrow /></a></div>
          <div className="closing-coordinate">22° 21′ N<br />90° 21′ E</div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top"><RiverMark /><span>Bonna<span className="brand-light">saathi</span></span></a>
        <p>{t.footerNote}</p>
        <div className="footer-meta"><span>{t.footer}</span><span>{'\u00a9'} 2026 HKM Fuyad Islam</span><a href={REPO}>GitHub {'\u2197'}</a><a href="#outlook">{lang === 'en' ? 'Explore outlook' : 'পূর্বাভাস দেখুন'} ↑</a></div>
      </footer>
    </div>
  );
}
