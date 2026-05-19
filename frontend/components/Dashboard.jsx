"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchBoundary, fetchRoads, fetchWards } from "../services/mapService";
import WardMap from "./WardMap";
import PotholeReportWorkflow from "./PotholeReportWorkflow";

// ─── Real-time clock ──────────────────────────────────────────────────────────
function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(new Date());
    setMounted(true);
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Server render + first paint: neutral placeholder (same size, no flicker)
  if (!mounted || !time) {
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid currentColor", opacity: 0.2 }} />
        <div className="font-mono text-sm font-bold tabular-nums opacity-30">--:--</div>
      </div>
    );
  }

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const secDeg = time.getSeconds() * 6;
  const minDeg = time.getMinutes() * 6 + time.getSeconds() * 0.1;
  const hrDeg = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;

  return (
    <div className="flex items-center gap-2">
      {/* Analog mini-clock */}
      <div className="relative flex-none" style={{ width: 32, height: 32 }} aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
          {/* hour */}
          <line x1="16" y1="16"
            x2={16 + 7 * Math.sin((hrDeg * Math.PI) / 180)}
            y2={16 - 7 * Math.cos((hrDeg * Math.PI) / 180)}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* minute */}
          <line x1="16" y1="16"
            x2={16 + 10 * Math.sin((minDeg * Math.PI) / 180)}
            y2={16 - 10 * Math.cos((minDeg * Math.PI) / 180)}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* second — orange */}
          <line x1="16" y1="16"
            x2={16 + 11 * Math.sin((secDeg * Math.PI) / 180)}
            y2={16 - 11 * Math.cos((secDeg * Math.PI) / 180)}
            stroke="#f97316" strokeWidth="1" strokeLinecap="round" />
          <circle cx="16" cy="16" r="1.5" fill="#f97316" />
        </svg>
      </div>
      {/* Digital */}
      <div className="font-mono text-sm font-bold tabular-nums leading-none">
        <span>{hh}:{mm}</span>
        <span className="text-[10px] text-orange-400 ml-0.5">:{ss}</span>
      </div>
    </div>
  );
}

// ─── Weather widget ───────────────────────────────────────────────────────────
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=22.83&longitude=88.63&current_weather=true";
const WEATHER_CACHE_KEY = "akm_weather_cache";
const WEATHER_TTL = 10 * 60 * 1000; // 10 minutes

function weatherIcon(wc) {
  if (wc === 0) return "☀️";
  if (wc <= 3) return "⛅";
  if (wc <= 48) return "🌫️";
  if (wc <= 67) return "🌧️";
  return "🌩️";
}

async function fetchWeather(signal) {
  const res = await fetch(WEATHER_URL, { signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const d = await res.json();
  const wc   = d?.current_weather?.weathercode ?? 0;
  const temp = Math.round(d?.current_weather?.temperature ?? 28);
  return { temp, icon: weatherIcon(wc), ts: Date.now() };
}

function WeatherWidget() {
  // Seed from cache immediately so there's no blank flash on refresh
  // Always start null on both server and client — prevents hydration mismatch.
  // Cache is read client-side only inside useEffect.
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let retryTimer;

    async function load(attempt = 0) {
      // On first run, seed from localStorage cache immediately
      let cached = null;
      try {
        const raw = localStorage.getItem(WEATHER_CACHE_KEY);
        if (raw) cached = JSON.parse(raw);
      } catch {}

      if (cached) setWeather(cached);

      // Skip network fetch if cache is still fresh
      if (cached && Date.now() - (cached.ts ?? 0) < WEATHER_TTL) return;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const data = await fetchWeather(controller.signal);
        clearTimeout(timeout);
        setWeather(data);
        try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data)); } catch {}
      } catch {
        clearTimeout(timeout);
        if (attempt === 0) {
          retryTimer = setTimeout(() => load(1), 4000);
        } else {
          setWeather((prev) => prev ?? { temp: 28, icon: "🌤️", ts: 0 });
        }
      }
    }

    load();
    return () => clearTimeout(retryTimer);
  }, []);

  if (!weather) {
    return <div className="text-xs opacity-40 animate-pulse font-semibold">—°C</div>;
  }

  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold">
      <span>{weather.icon}</span>
      <span>{weather.temp}°C</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const mapRef = useRef(null); // mobile map
  const desktopMapRef = useRef(null); // desktop map

  const [theme, setTheme] = useState("light");
  const [wardsVisible, setWardsVisible] = useState(false);
  const [politicalVisible, setPoliticalVisible] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [wardsGeoJSON, setWardsGeoJSON] = useState(null);
  const [boundaryGeoJSON, setBoundaryGeoJSON] = useState(null);
  const [roadsGeoJSON, setRoadsGeoJSON] = useState(null);
  const [activeWardId, setActiveWardId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Theme persist
  useEffect(() => {
    const saved = window.localStorage.getItem("akm-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(saved || preferred);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("akm-theme", theme);
  }, [theme]);

  // Load GeoJSON
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [wards, boundary, roads] = await Promise.all([
          fetchWards(), fetchBoundary(), fetchRoads(),
        ]);
        if (cancelled) return;
        setWardsGeoJSON(wards);
        setBoundaryGeoJSON(boundary);
        setRoadsGeoJSON(roads);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Failed to load map data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const wards = useMemo(
    () =>
      (wardsGeoJSON?.features || [])
        .map((f) => f.properties)
        .filter(Boolean)
        .sort((a, b) => (a.ward_id ?? 0) - (b.ward_id ?? 0)),
    [wardsGeoJSON]
  );

  const handleWardSelect = useCallback((wardId) => {
    setActiveWardId(wardId);
    if (wardId) {
      mapRef.current?.focusWard(Number(wardId));
      desktopMapRef.current?.focusWard(Number(wardId));
    }
  }, []);

  const selectedWard = wards.find((x) => String(x.ward_id) === String(activeWardId));

  if (loadError) {
    return (
      <div className="h-screen grid place-items-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-lg font-bold">Could not load map data</h1>
          <p className="text-muted text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ══════════════════════════════════════════════
          ROOT — mobile: flex-col full screen
          Desktop: sidebar | map
         ══════════════════════════════════════════════ */}
      <div className="h-[100dvh] flex flex-col min-[900px]:grid min-[900px]:grid-cols-[300px_1fr] min-[900px]:flex-none">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden min-[900px]:flex flex-col gap-3 p-4 bg-panel border-r border-line overflow-y-auto" aria-label="Dashboard sidebar">
          <header className="bg-panel-soft border border-line rounded-xl p-4 flex-none">
            <div className="text-accent text-[0.6rem] uppercase tracking-[0.18em] font-bold mb-1">AKM Civic Platform</div>
            <h1 className="font-syne text-xl font-extrabold leading-tight tracking-tight">Ashoknagar Kalyangarh</h1>
            <p className="mt-1 text-muted text-xs">Municipal Ward Map · Issue Reporting</p>
          </header>

          {!loading && (
            <div className="bg-panel-soft border border-line rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-extrabold text-sm flex-none">{wards.length}</div>
              <div>
                <div className="text-xs font-semibold">Total Wards</div>
                <div className="text-muted text-[0.65rem]">Ashoknagar Kalyangarh Municipality</div>
              </div>
            </div>
          )}

          <section className="bg-panel-soft border border-line rounded-xl p-3 flex-none">
            <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-2">Map Layers</div>
            <div className="flex gap-1.5 mb-2">
              {["light", "dark"].map((t) => (
                <button key={t} type="button" onClick={() => setTheme(t)} aria-pressed={theme === t}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all ${theme === t ? "bg-accent border-accent text-white" : "border-line text-muted hover:text-text-default"}`}>
                  {t === "light" ? "☀️ Light" : "🌙 Dark"}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setWardsVisible((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-line hover:bg-panel-solid transition-colors text-xs mb-2">
              <span className="text-muted">Ward Divisions</span>
              <span style={{ width: 40, height: 22, borderRadius: 999, background: wardsVisible ? "var(--accent,#1d6cf2)" : "rgba(18,28,50,0.18)", display: "flex", alignItems: "center", padding: "0 3px", flexShrink: 0, transition: "background 0.22s", boxSizing: "border-box" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", marginLeft: wardsVisible ? "auto" : 0, marginRight: wardsVisible ? 0 : "auto", transition: "margin 0.22s ease", flexShrink: 0 }} />
              </span>
            </button>
            <button type="button" onClick={() => setPoliticalVisible((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-line hover:bg-panel-solid transition-colors text-xs">
              <span className="text-muted">Political Heads</span>
              <span style={{ width: 40, height: 22, borderRadius: 999, background: politicalVisible ? "var(--accent,#1d6cf2)" : "rgba(18,28,50,0.18)", display: "flex", alignItems: "center", padding: "0 3px", flexShrink: 0, transition: "background 0.22s", boxSizing: "border-box" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", marginLeft: politicalVisible ? "auto" : 0, marginRight: politicalVisible ? 0 : "auto", transition: "margin 0.22s ease", flexShrink: 0 }} />
              </span>
            </button>
          </section>

          {!loading && wards.length > 0 && (
            <section className="bg-panel-soft border border-line rounded-xl p-3 flex-none">
              <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-2">Navigate to Ward</div>
              <select value={activeWardId} onChange={(e) => handleWardSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-line bg-panel-solid text-text-default text-xs appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors">
                <option value="">— Select a ward —</option>
                {wards.map((w) => (
                  <option key={w.ward_id} value={w.ward_id}>{w.ward_name} {w.councillor ? `· ${w.councillor}` : ""}</option>
                ))}
              </select>
              {selectedWard && (
                <div className="mt-2 p-3 rounded-lg border border-accent/20 bg-accent/5 space-y-1.5">
                  <div className="font-bold text-sm">{selectedWard.ward_name}</div>
                  {selectedWard.councillor && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>👤</span><span>{selectedWard.councillor}</span>
                      {selectedWard.party && <span className="ml-auto bg-panel-solid border border-line px-2 py-0.5 rounded-full font-semibold text-[0.6rem]">{selectedWard.party}</span>}
                    </div>
                  )}
                  <div className="text-xs text-muted">🏛 {selectedWard.municipality}</div>
                </div>
              )}
            </section>
          )}

          <footer className="text-muted text-[0.6rem] text-center mt-auto pb-1">Census of India 2011 · OSM Roads · AKM Municipality</footer>
        </aside>

        {/* ══ MOBILE TOP HEADER BAR ══ */}
        <header className="min-[900px]:hidden flex-none flex items-center justify-between px-4 py-2.5 bg-panel border-b border-line" style={{ zIndex: 10 }}>
          {/* Hamburger + AKM */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen((v) => !v)} className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-panel-soft transition-colors" aria-label="Menu">
              <span className="w-5 h-0.5 bg-current rounded-full" />
              <span className="w-5 h-0.5 bg-current rounded-full" />
              <span className="w-5 h-0.5 bg-current rounded-full" />
            </button>
            <span className="font-syne font-extrabold text-lg text-accent tracking-tight">AKM</span>
          </div>

          {/* Live Clock */}
          <LiveClock />

          {/* Weather */}
          <WeatherWidget />
        </header>

        {/* ══ MOBILE SIDEBAR DRAWER ══ */}
        <div
          className={`min-[900px]:hidden fixed inset-0 z-[980] transition-all duration-300 ${sidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`} />
        </div>
        <div className={`min-[900px]:hidden fixed top-0 left-0 bottom-0 w-[280px] z-[990] flex flex-col bg-panel border-r border-line transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <span className="font-syne font-extrabold text-xl text-accent">AKM</span>
            <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-panel-soft transition-colors text-muted">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {/* Theme */}
            <section className="bg-panel-soft border border-line rounded-xl p-3">
              <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-2">Appearance</div>
              <div className="flex gap-1.5">
                {["light", "dark"].map((t) => (
                  <button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t}
                    className={`flex-1 py-2 rounded-full text-xs font-semibold border transition-all ${theme === t ? "bg-accent border-accent text-white" : "border-line text-muted"}`}>
                    {t === "light" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                ))}
              </div>
            </section>

            {/* Layers */}
            <section className="bg-panel-soft border border-line rounded-xl p-3">
              <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-2">Map Layers</div>
              <button type="button" onClick={() => setWardsVisible((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-line hover:bg-panel-solid transition-colors text-xs mb-2">
                <span className="text-muted">🗺 Ward Divisions</span>
                <span style={{ width: 40, height: 22, borderRadius: 999, background: wardsVisible ? "var(--accent,#1d6cf2)" : "rgba(18,28,50,0.18)", display: "flex", alignItems: "center", padding: "0 3px", flexShrink: 0, transition: "background 0.22s", boxSizing: "border-box" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", marginLeft: wardsVisible ? "auto" : 0, marginRight: wardsVisible ? 0 : "auto", transition: "margin 0.22s ease", flexShrink: 0 }} />
                </span>
              </button>
              <button type="button" onClick={() => setPoliticalVisible((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-line hover:bg-panel-solid transition-colors text-xs">
                <span className="text-muted">👤 Political Heads</span>
                <span style={{ width: 40, height: 22, borderRadius: 999, background: politicalVisible ? "var(--accent,#1d6cf2)" : "rgba(18,28,50,0.18)", display: "flex", alignItems: "center", padding: "0 3px", flexShrink: 0, transition: "background 0.22s", boxSizing: "border-box" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", marginLeft: politicalVisible ? "auto" : 0, marginRight: politicalVisible ? 0 : "auto", transition: "margin 0.22s ease", flexShrink: 0 }} />
                </span>
              </button>
            </section>

            {/* Ward Select */}
            {!loading && wards.length > 0 && (
              <section className="bg-panel-soft border border-line rounded-xl p-3">
                <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-2">Navigate to Ward</div>
                <select value={activeWardId} onChange={(e) => { handleWardSelect(e.target.value); setSidebarOpen(false); }}
                  className="w-full px-3 py-2 rounded-lg border border-line bg-panel-solid text-text-default text-xs appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors">
                  <option value="">— Select a ward —</option>
                  {wards.map((w) => (
                    <option key={w.ward_id} value={w.ward_id}>{w.ward_name} {w.councillor ? `· ${w.councillor}` : ""}</option>
                  ))}
                </select>
              </section>
            )}

            <div className="text-muted text-[0.6rem] text-center mt-auto pb-1">Census 2011 · OSM · AKM Municipality</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            MAP CARD — Mobile: 60dvh floating card with gap
            Desktop: fills right column
           ══════════════════════════════════════════════ */}
        {/* Mobile map card wrapper — adds the gap+rounded look */}
        <div className="min-[900px]:hidden flex-none px-3 pt-3" style={{ height: "60dvh" }}>
          <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.14)] border border-line">
            <WardMap
              ref={mapRef}
              theme={theme}
              wardsVisible={wardsVisible}
              onWardsToggle={() => setWardsVisible((v) => !v)}
              politicalVisible={politicalVisible}
              onPoliticalToggle={() => setPoliticalVisible((v) => !v)}
              wardsGeoJSON={wardsGeoJSON}
              boundaryGeoJSON={boundaryGeoJSON}
              roadsGeoJSON={roadsGeoJSON}
              onWardSelected={(id) => setActiveWardId(String(id))}
            />
          </div>
        </div>

        {/* Desktop map — fills right column, no card style needed */}
        <div className="hidden min-[900px]:block relative h-full bg-panel-solid overflow-hidden">
          <WardMap
            ref={desktopMapRef}
            theme={theme}
            wardsVisible={wardsVisible}
            onWardsToggle={() => setWardsVisible((v) => !v)}
            politicalVisible={politicalVisible}
            onPoliticalToggle={() => setPoliticalVisible((v) => !v)}
            wardsGeoJSON={wardsGeoJSON}
            boundaryGeoJSON={boundaryGeoJSON}
            roadsGeoJSON={roadsGeoJSON}
            onWardSelected={(id) => setActiveWardId(String(id))}
          />
        </div>

        {/* ══════════════════════════════════════════════
            MOBILE BOTTOM PANEL — Ward details
           ══════════════════════════════════════════════ */}
        <div className="min-[900px]:hidden flex-1 bg-panel border-t border-line" style={{ minHeight: 0, overflowY: "auto" }}>
          <div className="p-4 pb-6">
            {selectedWard ? (
              <div className="p-3 rounded-xl border border-accent/25 bg-accent/5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-[0.6rem] text-muted uppercase tracking-widest mb-0.5">Ward {selectedWard.ward_id}</div>
                    <div className="font-bold text-sm leading-tight">{selectedWard.ward_name}</div>
                  </div>
                  {selectedWard.party && (
                    <span className="flex-none text-[0.6rem] font-bold border border-line bg-panel-solid px-2 py-0.5 rounded-full mt-1">{selectedWard.party}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedWard.councillor && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <span>👤</span><span className="font-medium text-text-default truncate">{selectedWard.councillor}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span>🏛</span><span className="truncate">{selectedWard.municipality ?? "AKM Municipality"}</span>
                  </div>
                  {selectedWard.area_ha && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <span>📐</span><span>{selectedWard.area_ha} ha</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
                <div className="text-2xl">🗺️</div>
                <p className="text-muted text-xs">Tap a ward on the map or select one from the menu to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          REPORT FAB — fixed, always visible
         ══════════════════════════════════════════════ */}
      <div className="fixed bottom-5 right-4 z-[970] flex flex-col items-end gap-2">
        <div className={`flex flex-col gap-2 items-end transition-all duration-200 origin-bottom-right ${showFabMenu ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"}`}>
          {[
            { label: "Report Pothole", dot: "bg-orange-400" },
            { label: "Broken Lamp", dot: "bg-yellow-400" },
            { label: "Other Issue", dot: "bg-blue-400" },
          ].map((item) => (
            <button key={item.label} type="button"
              onClick={() => { setShowFabMenu(false); setIsReporting(true); }}
              className="flex items-center gap-2.5 bg-panel border border-line rounded-full pl-3 pr-4 py-2 shadow-custom text-xs font-semibold text-text-default hover:-translate-y-0.5 active:scale-95 transition-all">
              <span className={`w-2 h-2 rounded-full flex-none ${item.dot}`} />
              {item.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setShowFabMenu((o) => !o)}
          className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-2xl font-light transition-all duration-300 hover:scale-105 active:scale-95 ${showFabMenu ? "bg-red-500 rotate-45" : "bg-orange-500"}`}
          aria-label="Report an issue">
          +
        </button>
      </div>

      {isReporting && <PotholeReportWorkflow theme={theme} onClose={() => setIsReporting(false)} />}
    </>
  );
}
