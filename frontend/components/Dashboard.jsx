"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WardMap from "./WardMap";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function getDensityColor(density, range, theme) {
  const lightStops = ["#d9f0ff", "#9fd2ff", "#6ab8ff", "#3f8ef7", "#1d6cf2", "#123f9a"];
  const darkStops = ["#d2f2ff", "#8fe0ff", "#56c8ff", "#33a6ff", "#2282f3", "#1657ca"];
  const stops = theme === "dark" ? darkStops : lightStops;
  const t = (density - range.min) / ((range.max - range.min) || 1);
  const index = Math.min(Math.floor(t * stops.length), stops.length - 1);
  return stops[index];
}

function formatThousands(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const mapRef = useRef(null);
  const [theme, setTheme] = useState("light");
  const [layerVisible, setLayerVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [geojson, setGeojson] = useState(null);
  const [activeWardId, setActiveWardId] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("akm-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(savedTheme || preferred);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWardData() {
      try {
        setLoadError("");
        const response = await fetch(`${BACKEND_URL}/api/wards`);

        if (!response.ok) {
          throw new Error(`Ward API returned ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setGeojson(data);
        const firstWard = data.features.find((feature) => feature.properties?.ward_id);
        setActiveWardId(firstWard?.properties?.ward_id ?? null);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Failed to load ward data");
        }
      }
    }

    loadWardData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("akm-theme", theme);
  }, [theme]);

  const wards = useMemo(() => {
    return (geojson?.features || [])
      .map((feature) => feature.properties)
      .filter(Boolean)
      .map((props) => ({
        id: props.ward_id,
        name: props.ward_name,
        population: props.population,
        area_ha: props.area_ha,
        density: props.density,
      }));
  }, [geojson]);

  const densityRange = useMemo(() => {
    if (!wards.length) {
      return { min: 0, max: 0 };
    }

    const densities = wards.map((ward) => ward.density);
    return {
      min: Math.min(...densities),
      max: Math.max(...densities),
    };
  }, [wards]);

  const summary = useMemo(() => {
    if (!wards.length) {
      return {
        total: 0,
        wardCount: 0,
        maxDensity: 0,
        avgDensity: 0,
      };
    }

    const total = wards.reduce((sum, ward) => sum + ward.population, 0);
    const maxDensity = Math.max(...wards.map((ward) => ward.density));
    const avgDensity = Math.round(wards.reduce((sum, ward) => sum + ward.density, 0) / wards.length);

    return {
      total,
      wardCount: wards.length,
      maxDensity,
      avgDensity,
    };
  }, [wards]);

  const sortedWards = useMemo(() => {
    return [...wards].sort((a, b) => b.density - a.density);
  }, [wards]);

  function handleWardSelect(wardId) {
    setActiveWardId(wardId);
    setSidebarOpen(false);
    mapRef.current?.focusWard(wardId);
  }

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="bg-panel-soft border border-line rounded-lg p-[22px]" style={{ maxWidth: 640, margin: 24 }}>
          <div className="text-accent uppercase tracking-[0.18em] text-[0.72rem] font-bold mb-[12px]">Backend unavailable</div>
          <h1 className="m-0 font-syne text-[clamp(2rem,3vw,3rem)] leading-[0.95] tracking-[-0.04em]">Could not load ward data</h1>
          <div className="mt-[10px] text-muted text-[0.98rem]">{loadError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 min-[900px]:grid-cols-[320px_minmax(0,1fr)] min-[1100px]:grid-cols-[360px_minmax(0,1fr)]">
      <aside 
        className={`flex flex-col gap-[18px] p-[22px] bg-panel border-r border-line backdrop-blur-[20px] shadow-custom z-[900] min-[900px]:z-[2] fixed inset-y-4 left-4 w-[min(360px,calc(100vw-32px))] -translate-x-[calc(100%+20px)] transition-transform duration-250 ease min-[900px]:static min-[900px]:w-auto min-[900px]:translate-x-0 min-[900px]:inset-auto min-[900px]:transition-none ${sidebarOpen ? "translate-x-0" : ""}`} 
        aria-label="Ward dashboard sidebar"
      >
        <header className="bg-panel-soft border border-line rounded-lg p-[22px]">
          <div className="text-accent uppercase tracking-[0.18em] text-[0.72rem] font-bold mb-[12px]">Census 2011 | West Bengal</div>
          <h1 className="m-0 font-syne text-[clamp(2rem,3vw,3rem)] leading-[0.95] tracking-[-0.04em]">
            Ashoknagar
            <br />
            Kalyangarh
          </h1>
          <div className="mt-[10px] text-muted text-[0.98rem]">Ward-wise population density on a clean map canvas</div>
        </header>

        <section className="bg-panel-soft border border-line rounded-lg p-[18px]">
          <h2 className="m-0 mb-[14px] text-subtle text-[0.72rem] tracking-[0.16em] uppercase">View Options</h2>
          <div className="grid grid-cols-1 gap-[10px]">
            <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-[8px]" role="group" aria-label="Map theme">
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-[8px] border bg-panel-solid rounded-full py-[11px] px-[14px] shadow-mode-button cursor-pointer min-w-0 transition-all duration-[0.18s] ease w-full hover:-translate-y-[1px] ${theme === "light" ? "bg-chip border-line-strong text-chip-text" : "border-line text-text-default"}`}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
              >
                Light mode
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-[8px] border bg-panel-solid rounded-full py-[11px] px-[14px] shadow-mode-button cursor-pointer min-w-0 transition-all duration-[0.18s] ease w-full hover:-translate-y-[1px] ${theme === "dark" ? "bg-chip border-line-strong text-chip-text" : "border-line text-text-default"}`}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                Dark mode
              </button>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-[8px] border border-line bg-panel-solid text-text-default rounded-full py-[11px] px-[14px] shadow-mode-button cursor-pointer min-w-0 hover:-translate-y-[1px] w-full justify-between transition-transform duration-[0.18s] ease"
              onClick={() => setLayerVisible((current) => !current)}
              aria-pressed={layerVisible}
            >
              <span className="text-[0.9rem] text-muted">{layerVisible ? "Layer on" : "Layer off"}</span>
              <span className="w-[40px] h-[22px] rounded-full bg-[rgba(29,108,242,0.18)] relative flex-none">
                <span 
                  className={`absolute top-[3px] bottom-[3px] left-[3px] w-[16px] rounded-full bg-white transition-transform duration-[0.22s] ease shadow-toggle-rail ${layerVisible ? "translate-x-[18px]" : ""}`} 
                  aria-hidden="true" 
                />
              </span>
            </button>
          </div>
        </section>

        {/* <section className="bg-panel-soft border border-line rounded-lg p-[18px]">
          <h2 className="m-0 mb-[14px] text-subtle text-[0.72rem] tracking-[0.16em] uppercase">Municipality Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
            <div className="min-w-0 p-[14px] rounded-md border border-line bg-panel-solid">
              <div className="block max-w-full font-syne text-[clamp(1.2rem,2vw,1.6rem)] font-extrabold tracking-[-0.04em] leading-[1.05] break-words">{formatThousands(summary.total)}</div>
              <div className="mt-[6px] text-subtle text-[0.72rem] uppercase tracking-[0.12em]">Total Population</div>
            </div>
            <div className="min-w-0 p-[14px] rounded-md border border-line bg-panel-solid">
              <div className="block max-w-full font-syne text-[clamp(1.2rem,2vw,1.6rem)] font-extrabold tracking-[-0.04em] leading-[1.05] break-words">{summary.wardCount}</div>
              <div className="mt-[6px] text-subtle text-[0.72rem] uppercase tracking-[0.12em]">Wards</div>
            </div>
            <div className="min-w-0 p-[14px] rounded-md border border-line bg-panel-solid">
              <div className="block max-w-full font-syne text-[clamp(1.2rem,2vw,1.6rem)] font-extrabold tracking-[-0.04em] leading-[1.05] break-words">{summary.maxDensity}</div>
              <div className="mt-[6px] text-subtle text-[0.72rem] uppercase tracking-[0.12em]">Max Density</div>
            </div>
            <div className="min-w-0 p-[14px] rounded-md border border-line bg-panel-solid">
              <div className="block max-w-full font-syne text-[clamp(1.2rem,2vw,1.6rem)] font-extrabold tracking-[-0.04em] leading-[1.05] break-words">{summary.avgDensity}</div>
              <div className="mt-[6px] text-subtle text-[0.72rem] uppercase tracking-[0.12em]">Average Density</div>
            </div>
          </div>
        </section> */}

        {/* <section className="bg-panel-soft border border-line rounded-lg p-[18px] flex-1">
          <h2 className="m-0 mb-[14px] text-subtle text-[0.72rem] tracking-[0.16em] uppercase">Wards</h2>
          <div className="grid gap-[8px] max-h-[42vh] min-[600px]:max-h-[min(56vh,620px)] overflow-auto pr-[2px]">
            {sortedWards.map((ward) => (
              <button
                key={ward.id}
                type="button"
                className={`grid grid-cols-[12px_minmax(0,1fr)_auto] gap-[10px] items-center border rounded-md py-[11px] px-[12px] text-left cursor-pointer min-w-0 transition-all duration-[0.18s] ease hover:-translate-y-[1px] ${activeWardId === ward.id ? "bg-list-active border-line-strong text-text-default" : "bg-transparent border-transparent text-text-default hover:bg-list-hover"}`}
                onClick={() => handleWardSelect(ward.id)}
              >
                <span
                  className="w-[12px] h-[12px] rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
                  style={{ background: getDensityColor(ward.density, densityRange, theme) }}
                />
                <span className="font-bold min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{ward.name}</span>
                <span className="text-muted tabular-nums whitespace-nowrap">{formatThousands(ward.population)}</span>
              </button>
            ))}
          </div>
        </section> */}

        <footer className="bg-panel-soft border border-line rounded-lg mt-auto py-[14px] px-[16px] text-muted text-[0.9rem]">
          Source: Census of India 2011 and the ward GeoJSON served by the backend.
        </footer>
      </aside>

      <main className="relative min-w-0 p-[16px] min-[900px]:p-[22px]">
        <div className="relative h-[calc(100vh-32px)] min-h-[540px] min-[900px]:h-[calc(100vh-44px)] min-[900px]:min-h-[620px] rounded-[calc(var(--radius-xl)+6px)] overflow-hidden border border-map-border bg-panel-solid shadow-custom">
          <div className="absolute top-[10px] left-[10px] right-[10px] min-[600px]:top-[12px] min-[600px]:left-[12px] min-[600px]:right-[12px] min-[900px]:top-[18px] min-[900px]:left-[18px] min-[900px]:right-[18px] z-[950] flex flex-col min-[600px]:flex-row min-[600px]:flex-wrap min-[900px]:flex-nowrap items-stretch min-[600px]:items-start min-[600px]:justify-between gap-[12px] pointer-events-none">
            <button
              type="button"
              className="pointer-events-auto flex items-center justify-center w-[44px] h-[44px] min-[600px]:inline-flex min-[900px]:hidden rounded-[14px] border border-line bg-[rgba(255,255,255,0.82)] dark:bg-[rgba(17,24,37,0.82)] text-text-default shadow-panel-toggle self-start max-[599px]:mb-[8px]"
              onClick={() => setSidebarOpen((current) => !current)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>


          </div>

          <WardMap
            ref={mapRef}
            theme={theme}
            geojson={geojson}
            densityRange={densityRange}
            visible={layerVisible}
            onWardSelected={setActiveWardId}
          />
        </div>
      </main>
    </div>
  );
}
