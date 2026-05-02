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
      <div className="dashboard" style={{ placeItems: "center" }}>
        <div className="sidebar-header" style={{ maxWidth: 640, margin: 24 }}>
          <div className="eyebrow">Backend unavailable</div>
          <h1>Could not load ward data</h1>
          <div className="subtitle">{loadError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="sidebar" aria-label="Ward dashboard sidebar">
        <header className="sidebar-header">
          <div className="eyebrow">Census 2011 | West Bengal</div>
          <h1>
            Ashoknagar
            <br />
            Kalyangarh
          </h1>
          <div className="subtitle">Ward-wise population density on a clean map canvas</div>
        </header>

        <section className="section">
          <h2 className="section-title">View Options</h2>
          <div className="toolbar">
            <div className="mode-group" role="group" aria-label="Map theme">
              <button
                type="button"
                className={`mode-button ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
              >
                Light mode
              </button>
              <button
                type="button"
                className={`mode-button ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                Dark mode
              </button>
            </div>

            <button
              type="button"
              className="toggle-pill"
              onClick={() => setLayerVisible((current) => !current)}
              aria-pressed={layerVisible}
              data-checked={layerVisible ? "true" : "false"}
            >
              <span className="theme-label">{layerVisible ? "Layer on" : "Layer off"}</span>
              <span className="toggle-rail" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Municipality Summary</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{formatThousands(summary.total)}</div>
              <div className="stat-label">Total Population</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.wardCount}</div>
              <div className="stat-label">Wards</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.maxDensity}</div>
              <div className="stat-label">Max Density</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.avgDensity}</div>
              <div className="stat-label">Average Density</div>
            </div>
          </div>
        </section>

        <section className="section" style={{ flex: 1 }}>
          <h2 className="section-title">Wards</h2>
          <div className="ward-list">
            {sortedWards.map((ward) => (
              <button
                key={ward.id}
                type="button"
                className={`ward-item ${activeWardId === ward.id ? "active" : ""}`}
                onClick={() => handleWardSelect(ward.id)}
              >
                <span
                  className="ward-dot"
                  style={{ background: getDensityColor(ward.density, densityRange, theme) }}
                />
                <span className="ward-name">{ward.name}</span>
                <span className="ward-meta">{formatThousands(ward.population)}</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="footer-note">Source: Census of India 2011 and the ward GeoJSON served by the backend.</footer>
      </aside>

      <main className="map-shell">
        <div className="map-card">
          <div className="map-topbar">
            <button
              type="button"
              className="panel-toggle"
              onClick={() => setSidebarOpen((current) => !current)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <div className="map-badge">
              <div>
                <strong>Ward Density Map</strong>
                <span>Frontend renders the map, backend owns the data</span>
              </div>
            </div>
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
