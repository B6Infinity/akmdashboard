"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const WARD_STYLE = {
  light: { fillColor: "#3f8ef7", fillOpacity: 0.18, color: "#1d6cf2", weight: 1.5, opacity: 0.8 },
  dark: { fillColor: "#56c8ff", fillOpacity: 0.15, color: "#8fe0ff", weight: 1.5, opacity: 0.8 },
};
const WARD_HOVER = { fillOpacity: 0.38, weight: 2.5 };

function wardPopupHTML(props) {
  const partyColor = { AITC: "#1d6cf2", BJP: "#f97316", INC: "#22c55e" }[props.party] || "#6b7280";
  return `<div style="padding:14px 16px;min-width:220px;font-family:system-ui,sans-serif">
    <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;opacity:0.5;margin-bottom:3px">
      Ward ${props.ward_id ?? "—"} · ${props.municipality ?? "AKM Municipality"}
    </div>
    <div style="font-size:1.1rem;font-weight:800;margin-bottom:10px">${props.ward_name ?? "—"}</div>
    <div style="display:grid;gap:6px;font-size:0.82rem">
      <div style="display:flex;gap:8px"><span style="opacity:0.5;min-width:80px">Councillor</span><strong>${props.councillor ?? "—"}</strong></div>
      <div style="display:flex;align-items:center;gap:8px"><span style="opacity:0.5;min-width:80px">Party</span>
        <span style="display:inline-flex;align-items:center;gap:5px">
          <span style="width:8px;height:8px;border-radius:50%;background:${partyColor}"></span>
          <strong>${props.party ?? "—"}</strong>
        </span>
      </div>
      <div style="display:flex;gap:8px"><span style="opacity:0.5;min-width:80px">Area</span><strong>${props.area_ha ?? "—"} ha</strong></div>
    </div>
  </div>`;
}

// ─── In-map layers panel ──────────────────────────────────────────────────────
function ToggleRow({ label, checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        cursor: "pointer", fontSize: "0.82rem",
        color: "var(--text,#152033)", marginBottom: 8,
        userSelect: "none",
      }}
    >
      {/* Toggle track — knob uses transform so it always starts LEFT when off */}
      <span style={{
        width: 36, height: 20, borderRadius: 999,
        background: checked ? "var(--accent,#1d6cf2)" : "rgba(18,28,50,0.18)",
        position: "relative", transition: "background 0.22s", flexShrink: 0,
        display: "inline-block",
      }}>
        <span style={{
          position: "absolute", top: 3, left: 0,
          width: 14, height: 14,
          borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          transition: "transform 0.22s ease",
          display: "block",
          transform: checked ? "translateX(19px)" : "translateX(3px)",
        }} />
      </span>
      {label}
    </div>
  );
}

function MapLayersPanel({ wardsVisible, onWardsToggle, politicalVisible, onPoliticalToggle }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 900 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Map Layers"
        style={{
          width: 40, height: 40, borderRadius: 12,
          background: "var(--panel-solid,#fff)",
          border: "1px solid var(--line,rgba(18,28,50,0.1))",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 18,
        }}
      >
        {open ? "✕" : "⚙"}
      </button>
      {open && (
        <div style={{
          marginTop: 8, background: "var(--panel-solid,#fff)",
          border: "1px solid var(--line,rgba(18,28,50,0.1))",
          borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "12px 14px", minWidth: 190,
        }}>
          <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--subtle,#8b97ab)", marginBottom: 10, fontWeight: 700 }}>Map Layers</div>
          <ToggleRow label="🗺 Ward Divisions" checked={wardsVisible} onToggle={onWardsToggle} />
          <ToggleRow label="👤 Political Heads" checked={politicalVisible} onToggle={onPoliticalToggle} />
        </div>
      )}
    </div>
  );
}

// ─── My Location button — left side ───────────────────────────────────────────
function MyLocationButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Go to my location"
      style={{
        position: "absolute", bottom: 30, left: 12, zIndex: 900,
        width: 40, height: 40, borderRadius: 12,
        background: "var(--panel-solid,#fff)",
        border: "1px solid var(--line,rgba(18,28,50,0.1))",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontSize: 18,
      }}
    >
      📍
    </button>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
const WardMap = forwardRef(function WardMap(
  { theme, wardsVisible, onWardsToggle, politicalVisible, onPoliticalToggle,
    onWardSelected, wardsGeoJSON, boundaryGeoJSON, roadsGeoJSON },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  const wardsLayerRef = useRef(null);
  const boundaryRef = useRef(null);
  const roadsRef = useRef(null);
  const politicalRef = useRef(null);
  const leafletRef = useRef(null);
  const locationMarkerRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Expose focusWard to parent
  useImperativeHandle(ref, () => ({
    focusWard(wardId) {
      if (!wardsLayerRef.current || !mapRef.current) return;

      // If this map instance is hidden (display:none parent), its container
      // has 0 dimensions — Leaflet would get NaN projecting pixels → skip.
      const container = mapRef.current.getContainer();
      const isVisible = container.offsetWidth > 0 && container.offsetHeight > 0;
      if (!isVisible) return;

      wardsLayerRef.current.eachLayer((lyr) => {
        // Compare as strings — GeoJSON properties may be numbers or strings
        if (String(lyr.feature?.properties?.ward_id) === String(wardId)) {
          try {
            const bounds = lyr.getBounds();
            if (bounds && bounds.isValid()) {
              mapRef.current.flyToBounds(bounds, { padding: [20, 20], maxZoom: 15, duration: 0.65 });
            }
            lyr.openPopup();
          } catch (e) {
            console.warn("focusWard: could not fly to ward", wardId, e);
          }
        }
      });
    },
  }));

  // Build political heads markers from wardsGeoJSON (councillor per ward)
  function buildPoliticalMarkers(L, wardsGeoJSON, map) {
    if (!wardsGeoJSON) return null;
    const group = L.layerGroup();

    wardsGeoJSON.features.forEach((f) => {
      const props = f.properties;
      if (!props?.councillor) return;

      // Get centroid of feature bounds
      const layer = L.geoJSON(f);
      const center = layer.getBounds().getCenter();

      // Party colour
      const partyColor = { AITC: "#1d6cf2", BJP: "#f97316", INC: "#22c55e" }[props.party] || "#6b7280";

      // Custom pin icon HTML
      const iconHtml = `
        <div style="
          position:relative;
          display:flex;flex-direction:column;align-items:center;
          filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));
        ">
          <div style="
            background:${partyColor};
            color:#fff;
            border-radius:12px 12px 12px 0;
            padding:5px 8px;
            font-size:0.65rem;
            font-weight:700;
            white-space:nowrap;
            max-width:110px;
            overflow:hidden;
            text-overflow:ellipsis;
            line-height:1.3;
            border:2px solid #fff;
          ">
            <div style="font-size:0.55rem;opacity:0.8">Ward ${props.ward_id}</div>
            <div>${props.councillor}</div>
            ${props.party ? `<div style="font-size:0.5rem;opacity:0.75">${props.party}</div>` : ""}
          </div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${partyColor};margin-top:-1px"></div>
        </div>`;

      const icon = L.divIcon({
        html: iconHtml,
        className: "",
        iconAnchor: [55, 40],
        iconSize: [110, 40],
      });

      L.marker([center.lat, center.lng], { icon, interactive: false }).addTo(group);
    });

    return group;
  }

  // ── Initialize map ────────────────────────────────────────────────────────
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
      map.attributionControl.setPrefix("");
      mapRef.current = map;

      tileRef.current = L.tileLayer(TILE_URLS[theme], { maxZoom: 19 }).addTo(map);

      if (roadsGeoJSON) {
        roadsRef.current = L.geoJSON(roadsGeoJSON, {
          style: { color: theme === "dark" ? "#374151" : "#94a3b8", weight: 1, opacity: 0.5 },
          interactive: false,
        }).addTo(map);
      }

      if (wardsGeoJSON) {
        const style = WARD_STYLE[theme];
        const wardsLayer = L.geoJSON(wardsGeoJSON, {
          style: () => ({ ...style }),
          onEachFeature(feature, lyr) {
            const props = feature.properties;
            lyr.bindPopup(wardPopupHTML(props), { className: "akm-ward-popup", maxWidth: 280, closeButton: true });
            lyr.on("mouseover", () => { lyr.setStyle(WARD_HOVER); lyr.bringToFront(); });
            lyr.on("mouseout", () => wardsLayer.resetStyle(lyr));
            lyr.on("click", () => { onWardSelected?.(props.ward_id); lyr.openPopup(); });
          },
        });
        if (wardsVisible) wardsLayer.addTo(map);
        wardsLayerRef.current = wardsLayer;

        // Build political markers
        politicalRef.current = buildPoliticalMarkers(L, wardsGeoJSON, map);
        if (politicalVisible && politicalRef.current) politicalRef.current.addTo(map);
      }

      if (boundaryGeoJSON) {
        boundaryRef.current = L.geoJSON(boundaryGeoJSON, {
          style: { color: theme === "dark" ? "#cbd5e1" : "#0f172a", weight: 3, fillOpacity: 0, opacity: 1 },
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
      politicalRef.current = null;
      leafletRef.current = null;
      locationMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardsGeoJSON, boundaryGeoJSON, roadsGeoJSON]);

  // ── Theme change ──────────────────────────────────────────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !tileRef.current) return;
    map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(TILE_URLS[theme], { maxZoom: 19 }).addTo(map);
    boundaryRef.current?.setStyle({ color: theme === "dark" ? "#cbd5e1" : "#0f172a" });
    roadsRef.current?.setStyle({ color: theme === "dark" ? "#374151" : "#94a3b8" });
    const style = WARD_STYLE[theme];
    wardsLayerRef.current?.eachLayer((lyr) => lyr.setStyle({ ...style }));
  }, [theme]);

  // ── Ward layer toggle ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const lyr = wardsLayerRef.current;
    if (!map || !lyr) return;
    if (wardsVisible && !map.hasLayer(lyr)) lyr.addTo(map);
    else if (!wardsVisible && map.hasLayer(lyr)) map.removeLayer(lyr);
  }, [wardsVisible]);

  // ── Political heads layer toggle ───────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const lyr = politicalRef.current;
    if (!map || !lyr) return;
    if (politicalVisible && !map.hasLayer(lyr)) lyr.addTo(map);
    else if (!politicalVisible && map.hasLayer(lyr)) map.removeLayer(lyr);
  }, [politicalVisible]);

  // ── Go to my location ──────────────────────────────────────────────────────
  const goToMyLocation = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!L) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        map.flyTo([lat, lng], 16, { duration: 1 });

        if (locationMarkerRef.current) {
          locationMarkerRef.current.setLatLng([lat, lng]);
        } else {
          locationMarkerRef.current = L.circleMarker([lat, lng], {
            color: "#1d6cf2",
            fillColor: "#3f8ef7",
            fillOpacity: 0.9,
            radius: 10,
            weight: 3,
          }).addTo(map).bindPopup("📍 You are here");
        }
        locationMarkerRef.current.openPopup();
      },
      (err) => {
        alert("Could not get your location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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

      {/* In-map layers panel */}
      <MapLayersPanel
        wardsVisible={wardsVisible}
        onWardsToggle={onWardsToggle}
        politicalVisible={politicalVisible}
        onPoliticalToggle={onPoliticalToggle}
      />

      {/* My Location button */}
      <MyLocationButton onClick={goToMyLocation} />

      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
});

export default WardMap;
