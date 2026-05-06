"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

// Ward fill is a single muted blue – not density-coded (density legend removed per spec)
const WARD_STYLE = {
  light: { fillColor: "#3f8ef7", fillOpacity: 0.18, color: "#1d6cf2", weight: 1.5, opacity: 0.8 },
  dark: { fillColor: "#56c8ff", fillOpacity: 0.15, color: "#8fe0ff", weight: 1.5, opacity: 0.8 },
};
const WARD_HOVER = { fillOpacity: 0.38, weight: 2.5 };

// ─── Popup HTML (ward click) – shows civic info, no density numbers ────────────
function wardPopupHTML(props) {
  const partyColor = {
    AITC: "#1d6cf2",
    BJP: "#f97316",
    INC: "#22c55e",
  }[props.party] || "#6b7280";

  return `
    <div style="padding:14px 16px;min-width:220px;font-family:system-ui,sans-serif">
      <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;opacity:0.5;margin-bottom:3px">
        Ward ${props.ward_id ?? "—"} · ${props.municipality ?? "AKM Municipality"}
      </div>
      <div style="font-size:1.15rem;font-weight:800;margin-bottom:12px;line-height:1.2">${props.ward_name ?? "—"}</div>
      <div style="display:grid;gap:7px">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem">
          <span style="opacity:0.55;min-width:90px">Councillor</span>
          <strong style="word-break:break-word">${props.councillor ?? "—"}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem">
          <span style="opacity:0.55;min-width:90px">Party</span>
          <span style="display:inline-flex;align-items:center;gap:5px">
            <span style="width:8px;height:8px;border-radius:50%;background:${partyColor};flex-shrink:0"></span>
            <strong>${props.party ?? "—"}</strong>
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem">
          <span style="opacity:0.55;min-width:90px">Municipality</span>
          <strong style="word-break:break-word">${props.municipality ?? "—"}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem">
          <span style="opacity:0.55;min-width:90px">Area</span>
          <strong>${props.area_ha ?? "—"} ha</strong>
        </div>
      </div>
    </div>`;
}

// ─── Component ─────────────────────────────────────────────────────────────────
const WardMap = forwardRef(function WardMap(
  { theme, wardsVisible, onWardSelected, wardsGeoJSON, boundaryGeoJSON, roadsGeoJSON },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const wardsLayerRef = useRef(null);
  const boundaryRef = useRef(null);
  const roadsRef = useRef(null);
  const leafletRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Expose focusWard(wardId) to parent
  useImperativeHandle(ref, () => ({
    focusWard(wardId) {
      if (!wardsLayerRef.current || !mapRef.current) return;
      wardsLayerRef.current.eachLayer((lyr) => {
        if (lyr.feature?.properties?.ward_id === wardId) {
          mapRef.current.flyTo(lyr.getBounds().getCenter(), 15, { duration: 0.65 });
          lyr.openPopup();
        }
      });
    },
  }));

  // ── Initialize map (once, when GeoJSON arrives) ───────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        center: [22.83, 88.63],
        zoom: 12,
        zoomControl: false,
        attributionControl: true,
      });
      L.control.zoom({ position: "bottomleft" }).addTo(map);
      map.attributionControl.setPrefix("");
      mapRef.current = map;

      // Base tiles
      tileRef.current = L.tileLayer(TILE_URLS[theme], { maxZoom: 19 }).addTo(map);

      // Roads (always visible, non-interactive)
      if (roadsGeoJSON) {
        roadsRef.current = L.geoJSON(roadsGeoJSON, {
          style: { color: theme === "dark" ? "#374151" : "#94a3b8", weight: 1, opacity: 0.5 },
          interactive: false,
        }).addTo(map);
      }

      // Wards (toggleable) — shown UNDER the boundary
      if (wardsGeoJSON) {
        const style = WARD_STYLE[theme];
        const wardsLayer = L.geoJSON(wardsGeoJSON, {
          style: () => ({ ...style }),
          onEachFeature(feature, lyr) {
            const props = feature.properties;

            lyr.bindPopup(wardPopupHTML(props), {
              className: "akm-ward-popup",
              maxWidth: 280,
              closeButton: true,
            });

            lyr.on("mouseover", () => {
              lyr.setStyle(WARD_HOVER);
              lyr.bringToFront();
            });
            lyr.on("mouseout", () => wardsLayer.resetStyle(lyr));
            lyr.on("click", () => {
              onWardSelected?.(props.ward_id);
              lyr.openPopup();
            });
          },
        });
        // Only add if wardsVisible at init
        if (wardsVisible) wardsLayer.addTo(map);
        wardsLayerRef.current = wardsLayer;
      }

      // Boundary (always on top, non-interactive, just the outline)
      if (boundaryGeoJSON) {
        boundaryRef.current = L.geoJSON(boundaryGeoJSON, {
          style: {
            color: theme === "dark" ? "#cbd5e1" : "#0f172a",
            weight: 3,
            fillOpacity: 0,
            opacity: 1,
          },
          interactive: false,
        }).addTo(map);
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      tileRef.current = null;
      wardsLayerRef.current = null;
      boundaryRef.current = null;
      roadsRef.current = null;
      leafletRef.current = null;
    };
    // Re-init only when GeoJSON data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardsGeoJSON, boundaryGeoJSON, roadsGeoJSON]);

  // ── Theme change ──────────────────────────────────────────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !tileRef.current) return;

    map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(TILE_URLS[theme], { maxZoom: 19 }).addTo(map);

    boundaryRef.current?.setStyle({
      color: theme === "dark" ? "#cbd5e1" : "#0f172a",
    });
    roadsRef.current?.setStyle({
      color: theme === "dark" ? "#374151" : "#94a3b8",
    });

    const style = WARD_STYLE[theme];
    wardsLayerRef.current?.eachLayer((lyr) => lyr.setStyle({ ...style }));
  }, [theme]);

  // ── Ward layer toggle ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const lyr = wardsLayerRef.current;
    if (!map || !lyr) return;

    if (wardsVisible && !map.hasLayer(lyr)) lyr.addTo(map);
    else if (!wardsVisible && map.hasLayer(lyr)) map.removeLayer(lyr);
  }, [wardsVisible]);

  return (
    <div className="relative h-full w-full">
      {!ready && (
        <div className="absolute inset-0 grid place-items-center z-10 bg-panel-solid/80">
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-muted text-xs">Loading map…</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
});

export default WardMap;
