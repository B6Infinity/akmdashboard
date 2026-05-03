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
    <div class="font-syne text-[1rem] font-extrabold mb-[8px]">${props.ward_name}</div>
    <div class="flex justify-between gap-[24px] text-[0.88rem] text-muted"><span>Population</span><strong class="text-text-default">${props.population.toLocaleString()}</strong></div>
    <div class="flex justify-between gap-[24px] text-[0.88rem] text-muted"><span>Area</span><strong class="text-text-default">${props.area_ha} ha</strong></div>
    <div class="flex justify-between gap-[24px] text-[0.88rem] text-muted"><span>Density</span><strong class="text-text-default">${props.density} p/ha</strong></div>
  `;
}

function buildPopupHTML(props, maxDensity) {
  const fill = Math.round((props.density / maxDensity) * 100);

  return `
    <div class="p-[16px_18px] min-w-[220px]">
      <div class="text-accent uppercase text-[0.72rem] tracking-[0.16em] font-bold mb-[6px]">Ward ${props.ward_id}</div>
      <div class="font-syne text-[1.3rem] font-extrabold mb-[12px]">${props.ward_name}</div>
      <table class="w-full border-collapse">
        <tr><td class="py-[7px] border-t border-line text-[0.92rem] text-muted">Population</td><td class="py-[7px] border-t border-line text-[0.92rem] text-right font-bold">${props.population.toLocaleString()}</td></tr>
        <tr><td class="py-[7px] border-t border-line text-[0.92rem] text-muted">Area</td><td class="py-[7px] border-t border-line text-[0.92rem] text-right font-bold">${props.area_ha} hectares</td></tr>
        <tr><td class="py-[7px] border-t border-line text-[0.92rem] text-muted">Density</td><td class="py-[7px] border-t border-line text-[0.92rem] text-right font-bold">${props.density} persons/ha</td></tr>
      </table>
      <div class="mt-[14px] h-[8px] rounded-full overflow-hidden bg-[rgba(29,108,242,0.12)]"><div class="h-full rounded-[inherit] bg-gradient-to-r from-accent-2 to-accent" style="width:${fill}%"></div></div>
    </div>
  `;
}

function createLegend(L, range, theme) {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = () => {
    const element = L.DomUtil.create("div", "bg-panel-solid border border-line rounded-[16px] p-[12px_14px] shadow-legend");
    const colors = COLOR_STOPS[theme];
    element.innerHTML = `
      <div class="uppercase tracking-[0.14em] text-subtle text-[0.7rem] mb-[10px]">Density (persons / ha)</div>
      <div class="h-[10px] rounded-full mb-[6px]" style="background: linear-gradient(90deg, ${colors.join(", ")});"></div>
      <div class="flex justify-between text-muted text-[0.78rem]">
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
        zoomControl: false,
        attributionControl: true,
      });
      leaflet.control.zoom({ position: 'bottomleft' }).addTo(map);

      map.attributionControl.setPrefix("");
      mapInstanceRef.current = map;

      const baseLayer = leaflet.tileLayer(TILE_URLS[theme], {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | OpenStreetMap contributors',
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
    <div className="h-full min-h-[620px]">
      {!ready && <div className="grid place-items-center h-full text-muted">Loading map…</div>}
      <div ref={mapElementRef} className="h-full min-h-[620px]" />
    </div>
  );
});

export default WardMap;
