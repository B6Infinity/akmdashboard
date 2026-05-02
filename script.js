/* ============================================================
   ARCHITECTURE OVERVIEW
   ─────────────────────────────────────────────────────────────
   The application is split into four logical modules, each
   an IIFE-based object to simulate ES-module encapsulation:

   1. DataModule   — raw ward data + GeoJSON + density maths
   2. MapModule    — Leaflet initialisation, tile layer, zoom
   3. LayerModule  — choropleth rendering, styling, events
   4. UIModule     — panel, toggle, stats cards, ward list

   Boot sequence:
     DataModule.init()
     → MapModule.init()
     → LayerModule.init()
     → UIModule.init()

   Modules communicate only through clearly defined method
   calls; no globals outside the module references.
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────
   1. DATA MODULE
   Stores ward records, generates mock GeoJSON,
   and exposes derived density metrics.
───────────────────────────────────────────── */
const DataModule = (() => {

  /* ---------------------------------------------------
     Raw ward data (Census 2011 approximate values).
     area_ha: approximate area in hectares (mock).
  --------------------------------------------------- */
  const RAW_WARDS = [
    { id: 1, name: 'Ward 1', population: 11200, area_ha: 28 },
    { id: 2, name: 'Ward 2', population: 14800, area_ha: 22 },
    { id: 3, name: 'Ward 3', population: 9600, area_ha: 30 },
    { id: 4, name: 'Ward 4', population: 18400, area_ha: 18 },
    { id: 5, name: 'Ward 5', population: 22100, area_ha: 14 },
    { id: 6, name: 'Ward 6', population: 7500, area_ha: 35 },
    { id: 7, name: 'Ward 7', population: 27300, area_ha: 12 },
    { id: 8, name: 'Ward 8', population: 15600, area_ha: 20 },
    { id: 9, name: 'Ward 9', population: 19900, area_ha: 16 },
    { id: 10, name: 'Ward 10', population: 12400, area_ha: 26 },
    { id: 11, name: 'Ward 11', population: 20800, area_ha: 17 },
    { id: 12, name: 'Ward 12', population: 13200, area_ha: 24 },
    { id: 13, name: 'Ward 13', population: 16700, area_ha: 19 },
    { id: 14, name: 'Ward 14', population: 24500, area_ha: 13 },
    { id: 15, name: 'Ward 15', population: 10300, area_ha: 32 },
    { id: 16, name: 'Ward 16', population: 18900, area_ha: 21 },
    { id: 17, name: 'Ward 17', population: 25600, area_ha: 15 },
    { id: 18, name: 'Ward 18', population: 14100, area_ha: 23 },
    { id: 19, name: 'Ward 19', population: 8900, area_ha: 33 },
    { id: 20, name: 'Ward 20', population: 21400, area_ha: 16 },
    { id: 21, name: 'Ward 21', population: 17300, area_ha: 18 },
    { id: 22, name: 'Ward 22', population: 12700, area_ha: 27 },
  ];

  /* ---------------------------------------------------
     Generate a simple rectangular GeoJSON polygon for
     each ward, arranged in a 2-column grid centred on
     Ashoknagar Kalyangarh (22.83°N, 88.63°E).

     Grid cell size ≈ 0.018° lat × 0.022° lon
     (roughly matches the mock hectare figures).
  --------------------------------------------------- */
  const ORIGIN_LAT = 22.855;  // top-left of grid
  const ORIGIN_LON = 88.615;
  const CELL_H = 0.018;   // degrees lat per row
  const CELL_W = 0.022;   // degrees lon per column
  const COLS = 2;

  // Actual GIS data
  let akmGeoJSON = null;

  // Load once during app startup
  async function _loadWardData() {
    const response = await fetch('./AKM_Wards.geojson');
    akmGeoJSON = await response.json();

    console.log('GeoJSON loaded:', akmGeoJSON);
  }


  function buildPolygon(wardNo) {
    if (!akmGeoJSON) {
      console.error('GeoJSON not loaded yet');
      return null;
    }

    wardNo++;

    const feature = akmGeoJSON.features.find(
      f => f.properties.ward_no === wardNo
    );

    if (!feature) {
      console.warn(`Ward ${wardNo} not found`);
      return null;
    }

    return feature.geometry;
  }

  /* ---------------------------------------------------
     Build enriched ward records with density + GeoJSON.
  --------------------------------------------------- */
  let _wards = null;
  let _geojson = null;

  function _buildWards() {
    _wards = RAW_WARDS.map((w, i) => {
      const density = Math.round(w.population / w.area_ha); // persons / hectare
      return { ...w, density, index: i };
    });
  }

  function _buildGeoJSON() {

    _geojson = {
      type: 'FeatureCollection',
      features: _wards.map(w => ({
        type: 'Feature',
        properties: {
          ward_id: w.id,
          ward_name: w.name,
          population: w.population,
          area_ha: w.area_ha,
          density: w.density,
        },
        geometry: buildPolygon(w.index),
      })),
    };
  }

  async function init() {
    await _loadWardData();
    _buildWards();
    _buildGeoJSON();

  }

  /* Public accessors */
  function getWards() { return _wards; }
  function getGeoJSON() { return _geojson; }

  function getSummary() {
    const total = _wards.reduce((s, w) => s + w.population, 0);
    const maxD = Math.max(..._wards.map(w => w.density));
    const avgD = Math.round(_wards.reduce((s, w) => s + w.density, 0) / _wards.length);
    return { total, wards: _wards.length, maxD, avgD };
  }

  function getDensityRange() {
    const densities = _wards.map(w => w.density);
    return { min: Math.min(...densities), max: Math.max(...densities) };
  }

  return { init, getWards, getGeoJSON, getSummary, getDensityRange };

})();


/* ─────────────────────────────────────────────
   2. MAP MODULE
   Initialises the Leaflet map, configures tiles,
   and exposes the map instance + helper methods.
───────────────────────────────────────────── */
const MapModule = (() => {

  let _map = null;

  const CENTER = [22.830, 88.630];
  const ZOOM = 14;

  /* Dark-styled tile layer via Stadia Maps (works without API key) */
  const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const TILE_ATTRIB = '&copy; <a href="https://carto.com/">CARTO</a> | OpenStreetMap contributors';

  function init() {
    _map = L.map('map', {
      center: CENTER,
      zoom: ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIB,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(_map);

    /* Style the attribution control to fit dark theme */
    _map.attributionControl.setPrefix('');
  }

  function getMap() { return _map; }
  function flyTo(latlng, zoom) { _map.flyTo(latlng, zoom || ZOOM, { duration: 0.8 }); }
  function resetView() { _map.flyTo(CENTER, ZOOM, { duration: 0.8 }); }

  return { init, getMap, flyTo, resetView };

})();


/* ─────────────────────────────────────────────
   3. LAYER MODULE
   Handles choropleth rendering, colour scale,
   hover highlight, tooltips, and popups.
───────────────────────────────────────────── */
const LayerModule = (() => {

  let _layer = null;
  let _activeId = null;   // currently selected ward_id

  /* ---------------------------------------------------
     Choropleth colour scale:
     Normalise density to [0,1] then map to 6-stop ramp.
  --------------------------------------------------- */
  const COLOR_STOPS = ['#d4f5e2', '#74d7b0', '#2eb8a0', '#1a8fa8', '#1460a8', '#0a2d6e'];

  function _densityToColor(density, range) {
    const t = (density - range.min) / (range.max - range.min || 1);
    const idx = Math.min(Math.floor(t * COLOR_STOPS.length), COLOR_STOPS.length - 1);
    return COLOR_STOPS[idx];
  }

  /* ---------------------------------------------------
     Style factory — returns Leaflet path options.
  --------------------------------------------------- */
  function _styleFeature(feature, range) {
    const density = feature.properties.density;
    return {
      fillColor: _densityToColor(density, range),
      fillOpacity: 0.72,
      color: '#0e1117',
      weight: 1.5,
      opacity: 1,
    };
  }

  function _highlightStyle() {
    return {
      weight: 2.5,
      color: '#f7c84f',
      fillOpacity: 0.88,
    };
  }

  /* ---------------------------------------------------
     Tooltip HTML builder.
  --------------------------------------------------- */
  function _tooltipHTML(props) {
    return `
      <div class="tt-ward">${props.ward_name}</div>
      <div class="tt-row">
        <span class="tt-key">Population</span>
        <span class="tt-val">${props.population.toLocaleString()}</span>
      </div>
      <div class="tt-row">
        <span class="tt-key">Area</span>
        <span class="tt-val">${props.area_ha} ha</span>
      </div>
      <div class="tt-row">
        <span class="tt-key">Density</span>
        <span class="tt-val">${props.density} p/ha</span>
      </div>`;
  }

  /* ---------------------------------------------------
     Popup HTML builder.
  --------------------------------------------------- */
  function _popupHTML(props, maxDensity) {
    const pct = Math.round((props.density / maxDensity) * 100);
    return `
      <div class="popup-inner">
        <div class="popup-ward-label">Ward ${props.ward_id}</div>
        <div class="popup-ward-name">${props.ward_name}</div>
        <table class="popup-table">
          <tr>
            <td class="pk">Population</td>
            <td class="pv">${props.population.toLocaleString()}</td>
          </tr>
          <tr>
            <td class="pk">Area</td>
            <td class="pv">${props.area_ha} hectares</td>
          </tr>
          <tr>
            <td class="pk">Density</td>
            <td class="pv">${props.density} persons/ha</td>
          </tr>
        </table>
        <div class="popup-density-bar">
          <div class="popup-density-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------
     Initialise the GeoJSON layer with all interactions.
  --------------------------------------------------- */
  function init(geojson, densityRange) {
    const map = MapModule.getMap();

    _layer = L.geoJSON(geojson, {

      style: feature => _styleFeature(feature, densityRange),

      onEachFeature(feature, leafletLayer) {
        const props = feature.properties;

        /* Tooltip */
        leafletLayer.bindTooltip(_tooltipHTML(props), {
          className: 'ward-tooltip',
          sticky: true,
          offset: [12, 0],
        });

        /* Popup */
        leafletLayer.bindPopup(_popupHTML(props, densityRange.max), {
          maxWidth: 260,
          className: 'ward-popup',
        });

        /* Hover */
        leafletLayer.on('mouseover', () => {
          leafletLayer.setStyle(_highlightStyle());
          leafletLayer.bringToFront();
        });

        leafletLayer.on('mouseout', () => {
          if (_activeId !== props.ward_id) {
            _layer.resetStyle(leafletLayer);
          }
        });

        /* Click → select ward, notify UIModule */
        leafletLayer.on('click', () => {
          _selectWard(props.ward_id, leafletLayer);
          UIModule.highlightWardItem(props.ward_id);
        });
      },

    }).addTo(map);

    _addLegend(densityRange);
  }

  /* ---------------------------------------------------
     Select a ward: reset previous, style new active.
  --------------------------------------------------- */
  function _selectWard(wardId, targetLayer) {
    /* Reset previously active layer */
    if (_activeId !== null) {
      _layer.eachLayer(l => {
        if (l.feature.properties.ward_id === _activeId) {
          _layer.resetStyle(l);
        }
      });
    }
    _activeId = wardId;
    targetLayer.setStyle(_highlightStyle());
    targetLayer.bringToFront();
  }

  /* ---------------------------------------------------
     Programmatically fly to and open a ward (called
     from UIModule when a list item is clicked).
  --------------------------------------------------- */
  function focusWard(wardId) {
    _layer.eachLayer(l => {
      if (l.feature.properties.ward_id === wardId) {
        const center = l.getBounds().getCenter();
        MapModule.flyTo([center.lat, center.lng], 15);
        _selectWard(wardId, l);
        setTimeout(() => l.openPopup(), 700);
      }
    });
  }

  /* ---------------------------------------------------
     Choropleth legend control (Leaflet custom control).
  --------------------------------------------------- */
  function _addLegend(range) {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend-box');
      div.innerHTML = `
        <div class="legend-title">Density (persons / ha)</div>
        <div class="legend-gradient"></div>
        <div class="legend-labels">
          <span>${range.min}</span>
          <span>${Math.round((range.min + range.max) / 2)}</span>
          <span>${range.max}</span>
        </div>`;
      return div;
    };

    legend.addTo(MapModule.getMap());
  }

  /* ---------------------------------------------------
     Toggle layer visibility with opacity transition.
  --------------------------------------------------- */
  function setVisible(visible) {
    if (!_layer) return;
    const map = MapModule.getMap();
    if (visible) {
      if (!map.hasLayer(_layer)) _layer.addTo(map);
      /* Fade in */
      _layer.eachLayer(l => {
        const style = l.options;
        l.setStyle({ fillOpacity: 0 });
        setTimeout(() => l.setStyle({ fillOpacity: 0.72 }), 10);
      });
    } else {
      /* Fade out then remove */
      _layer.eachLayer(l => l.setStyle({ fillOpacity: 0 }));
      setTimeout(() => { if (map.hasLayer(_layer)) map.removeLayer(_layer); }, 280);
    }
  }

  return { init, setVisible, focusWard };

})();


/* ─────────────────────────────────────────────
   4. UI MODULE
   Populates stats cards, builds the ward list,
   wires up the panel toggle and layer toggle.
───────────────────────────────────────────── */
const UIModule = (() => {

  /* Cache DOM references */
  const $ = id => document.getElementById(id);

  function init() {
    _populateStats();
    _buildWardList();
    _wireToggle();
    _wirePanelToggle();
  }

  /* ---------------------------------------------------
     Summary stats cards.
  --------------------------------------------------- */
  function _populateStats() {
    const s = DataModule.getSummary();
    $('stat-total').textContent = (s.total / 1000).toFixed(1) + 'k';
    $('stat-wards').textContent = s.wards;
    $('stat-maxd').textContent = s.maxD;
    $('stat-avgd').textContent = s.avgD;
  }

  /* ---------------------------------------------------
     Ward list items — colour dot + name + population.
  --------------------------------------------------- */
  function _buildWardList() {
    const container = $('ward-list');
    const range = DataModule.getDensityRange();
    const wards = DataModule.getWards();

    /* Sort by density descending for at-a-glance ranking */
    const sorted = [...wards].sort((a, b) => b.density - a.density);

    const COLOR_STOPS = ['#d4f5e2', '#74d7b0', '#2eb8a0', '#1a8fa8', '#1460a8', '#0a2d6e'];
    function densityColor(d) {
      const t = (d - range.min) / (range.max - range.min || 1);
      const idx = Math.min(Math.floor(t * COLOR_STOPS.length), COLOR_STOPS.length - 1);
      return COLOR_STOPS[idx];
    }

    sorted.forEach(ward => {
      const item = document.createElement('div');
      item.className = 'ward-item';
      item.dataset.wardId = ward.id;
      item.innerHTML = `
        <span class="ward-dot" style="background:${densityColor(ward.density)}"></span>
        <span class="ward-name">${ward.name}</span>
        <span class="ward-pop">${(ward.population / 1000).toFixed(1)}k</span>`;

      item.addEventListener('click', () => {
        LayerModule.focusWard(ward.id);
        highlightWardItem(ward.id);
      });

      container.appendChild(item);
    });
  }

  /* Highlight the active item in the list */
  function highlightWardItem(wardId) {
    document.querySelectorAll('.ward-item').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.wardId) === wardId);
    });
  }

  /* ---------------------------------------------------
     Layer visibility toggle.
  --------------------------------------------------- */
  function _wireToggle() {
    $('toggle-layer').addEventListener('change', e => {
      LayerModule.setVisible(e.target.checked);
    });
  }

  /* ---------------------------------------------------
     Mobile panel toggle.
  --------------------------------------------------- */
  function _wirePanelToggle() {
    $('panel-toggle').addEventListener('click', () => {
      $('panel').classList.toggle('open');
    });
  }

  return { init, highlightWardItem };

})();


/* ─────────────────────────────────────────────
   BOOT SEQUENCE
   Ordered initialisation of all modules.
───────────────────────────────────────────── */
(async function boot() {
  await DataModule.init();
  MapModule.init();
  LayerModule.init(DataModule.getGeoJSON(), DataModule.getDensityRange());
  UIModule.init();
})();