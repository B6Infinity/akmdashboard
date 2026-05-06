"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchBoundary, fetchRoads, fetchWards } from "../services/mapService";
import WardMap from "./WardMap";
import PotholeReportWorkflow from "./PotholeReportWorkflow";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNum(n) {
  return new Intl.NumberFormat("en-IN").format(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const mapRef = useRef(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState("light");
  const [wardsVisible, setWardsVisible] = useState(false); // off by default per spec
  const [isReporting, setIsReporting] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  // ── Data state ────────────────────────────────────────────────────────────
  const [wardsGeoJSON, setWardsGeoJSON]     = useState(null);
  const [boundaryGeoJSON, setBoundaryGeoJSON] = useState(null);
  const [roadsGeoJSON, setRoadsGeoJSON]     = useState(null);
  const [activeWardId, setActiveWardId]     = useState("");
  const [loading, setLoading]               = useState(true);
  const [loadError, setLoadError]           = useState("");

  // ── Theme persist ─────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = window.localStorage.getItem("akm-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(saved || preferred);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("akm-theme", theme);
  }, [theme]);

  // ── Load all GeoJSON layers in parallel ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [wards, boundary, roads] = await Promise.all([
          fetchWards(),
          fetchBoundary(),
          fetchRoads(),
        ]);
        if (cancelled) return;
        setWardsGeoJSON(wards);
        setBoundaryGeoJSON(boundary);
        setRoadsGeoJSON(roads);
      } catch (err) {
        if (!cancelled) {
          console.error("[Dashboard] Load error:", err);
          setLoadError(err.message || "Failed to load map data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ── Derived ward list (sorted by ward_id) ─────────────────────────────────
  const wards = useMemo(
    () =>
      (wardsGeoJSON?.features || [])
        .map((f) => f.properties)
        .filter(Boolean)
        .sort((a, b) => (a.ward_id ?? 0) - (b.ward_id ?? 0)),
    [wardsGeoJSON]
  );

  // ── Ward count stat ───────────────────────────────────────────────────────
  const wardCount = wards.length;

  // ── Navigate map to selected ward ─────────────────────────────────────────
  const handleWardSelect = useCallback((wardId) => {
    setActiveWardId(wardId);
    if (wardId) {
      mapRef.current?.focusWard(Number(wardId));
    }
  }, []);

  // ── Error screen ──────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="h-screen grid place-items-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-lg font-bold">Could not load map data</h1>
          <p className="text-muted text-sm">{loadError}</p>
          <p className="text-muted text-xs">
            Make sure the backend is running at{" "}
            <code className="bg-panel-soft px-1 rounded">http://localhost:4000</code>
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LAYOUT:
  //   Mobile  → h-screen flex-col: Map (48%) | HUD panel (52%)
  //   Desktop → grid: sidebar (320px) | Map (fill)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={[
        // Mobile: full-height column
        "h-[100dvh] flex flex-col",
        // Desktop: side-by-side
        "min-[900px]:grid min-[900px]:grid-cols-[300px_1fr] min-[900px]:flex-none",
      ].join(" ")}
    >
      {/* ════════════════════════════════════════════════
          DESKTOP SIDEBAR  (hidden on mobile, col 1)
         ════════════════════════════════════════════════ */}
      <aside
        className="hidden min-[900px]:flex flex-col gap-3 p-4 bg-panel border-r border-line overflow-y-auto"
        aria-label="Dashboard sidebar"
      >
        {/* Brand */}
        <header className="bg-panel-soft border border-line rounded-xl p-4 flex-none">
          <div className="text-accent text-[0.6rem] uppercase tracking-[0.18em] font-bold mb-1">
            AKM Civic Platform
          </div>
          <h1 className="font-syne text-xl font-extrabold leading-tight tracking-tight">
            Ashoknagar Kalyangarh
          </h1>
          <p className="mt-1 text-muted text-xs">Municipal Ward Map · Issue Reporting</p>
        </header>

        {/* Ward count chip */}
        {!loading && (
          <div className="bg-panel-soft border border-line rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-extrabold text-sm flex-none">
              {wardCount}
            </div>
            <div>
              <div className="text-xs font-semibold">Total Wards</div>
              <div className="text-muted text-[0.65rem]">Ashoknagar Kalyangarh Municipality</div>
            </div>
          </div>
        )}

        {/* View options */}
        <section className="bg-panel-soft border border-line rounded-xl p-3 flex-none">
          <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-2">Map Layers</div>

          {/* Theme */}
          <div className="flex gap-1.5 mb-2">
            {["light", "dark"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  theme === t
                    ? "bg-accent border-accent text-white"
                    : "border-line text-muted hover:text-text-default"
                }`}
              >
                {t === "light" ? "☀️ Light" : "🌙 Dark"}
              </button>
            ))}
          </div>

          {/* Ward layer toggle */}
          <button
            type="button"
            onClick={() => setWardsVisible((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-line hover:bg-panel-solid transition-colors text-xs"
          >
            <span className="text-muted">Ward Divisions</span>
            <span className={`w-8 h-4 rounded-full relative transition-colors ${wardsVisible ? "bg-accent" : "bg-line"}`}>
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${
                  wardsVisible ? "translate-x-[17px]" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>
        </section>

        {/* Ward dropdown */}
        {!loading && wards.length > 0 && (
          <section className="bg-panel-soft border border-line rounded-xl p-3 flex-none">
            <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-2">Navigate to Ward</div>
            <select
              value={activeWardId}
              onChange={(e) => handleWardSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-line bg-panel-solid text-text-default text-xs appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">— Select a ward —</option>
              {wards.map((w) => (
                <option key={w.ward_id} value={w.ward_id}>
                  {w.ward_name} {w.councillor ? `· ${w.councillor}` : ""}
                </option>
              ))}
            </select>

            {/* Selected ward info card */}
            {activeWardId && (() => {
              const w = wards.find((x) => String(x.ward_id) === String(activeWardId));
              if (!w) return null;
              return (
                <div className="mt-2 p-3 rounded-lg border border-accent/20 bg-accent/5 space-y-1.5">
                  <div className="font-bold text-sm">{w.ward_name}</div>
                  {w.councillor && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>👤</span>
                      <span>{w.councillor}</span>
                      {w.party && (
                        <span className="ml-auto bg-panel-solid border border-line px-2 py-0.5 rounded-full font-semibold text-[0.6rem]">
                          {w.party}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-muted">🏛 {w.municipality}</div>
                </div>
              );
            })()}
          </section>
        )}

        <footer className="text-muted text-[0.6rem] text-center mt-auto pb-1">
          Census of India 2011 · OSM Roads · AKM Municipality
        </footer>
      </aside>

      {/* ════════════════════════════════════════════════
          MAP PANEL
          Mobile: top 48% of screen
          Desktop: fills the right column
         ════════════════════════════════════════════════ */}
      <div
        className={[
          // Mobile: fixed 48% of screen height
          "relative flex-none h-[48dvh]",
          // Desktop: full height
          "min-[900px]:h-full min-[900px]:flex-1",
          "bg-panel-solid overflow-hidden",
        ].join(" ")}
      >
        {/* Mobile header bar */}
        <div className="absolute top-0 left-0 right-0 z-[920] flex items-center justify-between px-3 py-2 min-[900px]:hidden bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-white text-xs font-bold tracking-wide">AKM</span>
          </div>
          <div className="pointer-events-auto flex gap-1.5">
            <button
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-sm"
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-panel-solid">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-muted text-xs">Loading layers…</span>
            </div>
          </div>
        )}

        <WardMap
          ref={mapRef}
          theme={theme}
          wardsVisible={wardsVisible}
          wardsGeoJSON={wardsGeoJSON}
          boundaryGeoJSON={boundaryGeoJSON}
          roadsGeoJSON={roadsGeoJSON}
          onWardSelected={(id) => setActiveWardId(String(id))}
        />
      </div>

      {/* ════════════════════════════════════════════════
          MOBILE HUD PANEL  (bottom 52% on mobile, hidden on desktop)
         ════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col min-[900px]:hidden bg-panel overflow-y-auto border-t border-line"
        style={{ minHeight: 0 }}
      >
        {/* Inner scroll container */}
        <div className="flex flex-col gap-3 p-4 pb-24">
          {/* App title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-base font-extrabold leading-tight">Ashoknagar Kalyangarh</h1>
              <p className="text-muted text-[0.65rem]">AKM Civic Platform</p>
            </div>
            {!loading && (
              <div className="bg-accent/10 border border-accent/20 rounded-full px-3 py-1 text-accent text-xs font-bold">
                {wardCount} Wards
              </div>
            )}
          </div>

          {/* Layer toggles row */}
          <div className="flex items-center gap-2">
            {["light", "dark"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={`flex-1 py-2 rounded-full text-xs font-semibold border transition-all ${
                  theme === t
                    ? "bg-accent border-accent text-white"
                    : "border-line text-muted"
                }`}
              >
                {t === "light" ? "☀️ Light" : "🌙 Dark"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setWardsVisible((v) => !v)}
              className={`flex-none px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
                wardsVisible ? "bg-accent/10 border-accent/40 text-accent" : "border-line text-muted"
              }`}
            >
              🗺 Wards {wardsVisible ? "On" : "Off"}
            </button>
          </div>

          {/* Ward dropdown */}
          {!loading && wards.length > 0 && (
            <div>
              <div className="text-subtle text-[0.6rem] uppercase tracking-widest mb-1.5">Navigate to Ward</div>
              <select
                value={activeWardId}
                onChange={(e) => handleWardSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-line bg-panel-soft text-text-default text-sm appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">— Select a ward —</option>
                {wards.map((w) => (
                  <option key={w.ward_id} value={w.ward_id}>
                    Ward {w.ward_id} — {w.ward_name}
                  </option>
                ))}
              </select>

              {/* Selected ward card */}
              {activeWardId && (() => {
                const w = wards.find((x) => String(x.ward_id) === String(activeWardId));
                if (!w) return null;
                return (
                  <div className="mt-2 p-3 rounded-xl border border-accent/25 bg-accent/5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-sm leading-tight">{w.ward_name}</div>
                      {w.party && (
                        <span className="flex-none text-[0.6rem] font-bold border border-line bg-panel-solid px-2 py-0.5 rounded-full">
                          {w.party}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {w.councillor && (
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span className="text-sm">👤</span>
                          <span className="font-medium text-text-default">{w.councillor}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="text-sm">🏛</span>
                        <span>{w.municipality ?? "AKM Municipality"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="text-sm">📐</span>
                        <span>Area: {w.area_ha} ha</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Info footer */}
          <p className="text-muted text-[0.6rem] text-center">
            Census of India 2011 · OSM Roads · AKM Municipality
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          FLOATING REPORT BUTTON  (fixed, above all panels)
         ════════════════════════════════════════════════ */}
      <div className="fixed bottom-5 right-4 z-[970] flex flex-col items-end gap-2">
        {/* Expanded menu */}
        <div
          className={`flex flex-col gap-2 items-end transition-all duration-200 origin-bottom-right ${
            showFabMenu
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          {[
            {
              label: "Report Pothole",
              dot: "bg-orange-400",
              action: () => { setShowFabMenu(false); setIsReporting(true); },
            },
            {
              label: "Broken Lamp",
              dot: "bg-yellow-400",
              action: () => { setShowFabMenu(false); setIsReporting(true); },
            },
            {
              label: "Other Issue",
              dot: "bg-blue-400",
              action: () => { setShowFabMenu(false); setIsReporting(true); },
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="flex items-center gap-2.5 bg-panel border border-line rounded-full pl-3 pr-4 py-2 shadow-custom text-xs font-semibold text-text-default hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <span className={`w-2 h-2 rounded-full flex-none ${item.dot}`} />
              {item.label}
            </button>
          ))}
        </div>

        {/* FAB */}
        <button
          type="button"
          onClick={() => setShowFabMenu((o) => !o)}
          className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-2xl font-light transition-all duration-300 hover:scale-105 active:scale-95 ${
            showFabMenu ? "bg-red-500 rotate-45" : "bg-orange-500"
          }`}
          aria-label="Report an issue"
        >
          +
        </button>
      </div>

      {/* ════════════════════════════════════════════════
          REPORT WORKFLOW OVERLAY
         ════════════════════════════════════════════════ */}
      {isReporting && (
        <PotholeReportWorkflow theme={theme} onClose={() => setIsReporting(false)} />
      )}
    </div>
  );
}
