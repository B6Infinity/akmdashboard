"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const COLOR_STOPS = {
  light: ["#d9f0ff", "#9fd2ff", "#6ab8ff", "#3f8ef7", "#1d6cf2", "#123f9a"],
  dark: ["#d2f2ff", "#8fe0ff", "#56c8ff", "#33a6ff", "#2282f3", "#1657ca"],
};

function densityToColor(density, range, theme) {
  const stops = COLOR_STOPS[theme];
  const normalized = (density - range.min) / ((range.max - range.min) || 1);
  const index = Math.min(Math.floor(normalized * stops.length), stops.length - 1);
  return stops[index];
}

function buildTooltipHTML(props) {
  return `
    <div class="tt-title">${props.ward_name}</div>
    <div class="tt-row"><span>Population</span><strong>${props.population.toLocaleString()}</strong></div>
    <div class="tt-row"><span>Area</span><strong>${props.area_ha} ha</strong></div>
    <div class="tt-row"><span>Density</span><strong>${props.density} p/ha</strong></div>
  `;
}

function buildPopupHTML(props, maxDensity) {
  const fill = Math.round((props.density / maxDensity) * 100);

  return `
    <div class="popup-inner">
      <div class="popup-label">Ward ${props.ward_id}</div>
      <div class="popup-title">${props.ward_name}</div>
      <table class="popup-table">
        <tr><td class="key">Population</td><td class="val">${props.population.toLocaleString()}</td></tr>
        <tr><td class="key">Area</td><td class="val">${props.area_ha} hectares</td></tr>
        <tr><td class="key">Density</td><td class="val">${props.density} persons/ha</td></tr>
      </table>
      <div class="density-bar"><div class="density-fill" style="width:${fill}%"></div></div>
    </div>
  `;
}

function createLegend(L, range, theme) {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = () => {
    const element = L.DomUtil.create("div", "legend-box");
    const colors = COLOR_STOPS[theme];
    element.innerHTML = `
      <div class="legend-title">Density (persons / ha)</div>
      <div class="legend-gradient" style="background: linear-gradient(90deg, ${colors.join(", ")});"></div>
      <div class="legend-labels">
        <span>${range.min}</span>
        <span>${Math.round((range.min + range.max) / 2)}</span>
        <span>${range.max}</span>
      </div>
    `;
    return element;
  };

  return legend;
}

const WardMap = forwardRef(function WardMap({ theme, densityRange, visible, onWardSelected, geojson }, ref) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const geoLayerRef = useRef(null);
  const legendRef = useRef(null);
  const leafletRef = useRef(null);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({
    focusWard(wardId) {
      if (!geoLayerRef.current || !mapInstanceRef.current) {
        return;
      }

      geoLayerRef.current.eachLayer((layer) => {
        if (layer.feature?.properties?.ward_id === wardId) {
          const center = layer.getBounds().getCenter();
          mapInstanceRef.current.flyTo([center.lat, center.lng], 15, { duration: 0.7 });
          layer.openPopup();
        }
      });
    },
  }));

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      const leaflet = await import("leaflet");
      if (cancelled || !mapElementRef.current) {
        return;
      }

      leafletRef.current = leaflet;

      const map = leaflet.map(mapElementRef.current, {
        center: [22.83, 88.63],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      map.attributionControl.setPrefix("");
      mapInstanceRef.current = map;

      const baseLayer = leaflet.tileLayer(TILE_URLS[theme], {
        maxZoom: 19,
        // attribution: '&copy; <a href="https://carto.com/">CARTO</a> | OpenStreetMap contributors',
      });

      tileLayerRef.current = baseLayer;
      baseLayer.addTo(map);

      if (!geojson) {
        setReady(true);
        return;
      }

      const layer = leaflet.geoJSON(geojson, {
        style: (feature) => ({
          fillColor: densityToColor(feature.properties.density, densityRange, theme),
          fillOpacity: 0.72,
          color: theme === "dark" ? "#f2f7ff" : "#ffffff",
          weight: 1.5,
          opacity: 0.95,
        }),
        onEachFeature(feature, leafletLayer) {
          const props = feature.properties;
          leafletLayer.bindTooltip(buildTooltipHTML(props), {
            className: "ward-tooltip",
            sticky: true,
            offset: [12, 0],
          });

          leafletLayer.bindPopup(buildPopupHTML(props, densityRange.max), {
            className: "ward-popup",
            maxWidth: 280,
          });

          leafletLayer.on("mouseover", () => {
            leafletLayer.setStyle({
              weight: 2.5,
              fillOpacity: 0.88,
            });
            leafletLayer.bringToFront();
          });

          leafletLayer.on("mouseout", () => {
            layer.resetStyle(leafletLayer);
          });

          leafletLayer.on("click", () => {
            onWardSelected(props.ward_id);
          });
        },
      });

      layer.addTo(map);
      geoLayerRef.current = layer;

      const legend = createLegend(leaflet, densityRange, theme);
      legendRef.current = legend;
      legend.addTo(map);

      setReady(true);
    }

    initializeMap();

    return () => {
      cancelled = true;
      if (legendRef.current && mapInstanceRef.current) {
        legendRef.current.remove();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
      geoLayerRef.current = null;
      tileLayerRef.current = null;
      leafletRef.current = null;
    };
  }, [geojson, densityRange, theme, onWardSelected]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const leaflet = leafletRef.current;

    if (!map || !leaflet || !tileLayerRef.current) {
      return;
    }

    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = leaflet.tileLayer(TILE_URLS[theme], {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | OpenStreetMap contributors',
    }).addTo(map);

    if (legendRef.current) {
      legendRef.current.remove();
    }
    legendRef.current = createLegend(leaflet, densityRange, theme).addTo(map);

    if (geoLayerRef.current) {
      geoLayerRef.current.eachLayer((layer) => {
        layer.setStyle({
          fillColor: densityToColor(layer.feature.properties.density, densityRange, theme),
          color: theme === "dark" ? "#f2f7ff" : "#ffffff",
          fillOpacity: 0.72,
          weight: 1.5,
          opacity: 0.95,
        });
      });
    }
  }, [densityRange, theme]);

  useEffect(() => {
    if (!geoLayerRef.current || !mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;

    if (visible) {
      if (!map.hasLayer(geoLayerRef.current)) {
        geoLayerRef.current.addTo(map);
      }
    } else if (map.hasLayer(geoLayerRef.current)) {
      map.removeLayer(geoLayerRef.current);
    }
  }, [visible]);

  return (
    <div className="map-root">
      {!ready && <div className="loading-state">Loading map…</div>}
      <div ref={mapElementRef} className="map-root" />
    </div>
  );
});

export default WardMap;
