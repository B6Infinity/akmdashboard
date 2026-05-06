import { readFile } from "node:fs/promises";
import path from "node:path";
import { WARD_RECORDS } from "../data/wardData.js";

// Helper: resolve geojson files relative to the project root
const GEO_ROOT = path.resolve(process.cwd(), "..");

async function readGeoJSON(filename) {
  const raw = await readFile(path.join(GEO_ROOT, filename), "utf8");
  return JSON.parse(raw);
}

// GET /api/map/boundary
export const getBoundary = async (req, res, next) => {
  try {
    const geojson = await readGeoJSON("AKM_Boundary.geojson");
    res.json({ success: true, data: geojson });
  } catch (error) {
    next(error);
  }
};

// GET /api/map/roads
export const getRoads = async (req, res, next) => {
  try {
    const geojson = await readGeoJSON("AKM_Roads.geojson");
    res.json({ success: true, data: geojson });
  } catch (error) {
    next(error);
  }
};

// GET /api/map/wards
export const getWards = async (req, res, next) => {
  try {
    const geojson = await readGeoJSON("AKM_Wards.geojson");

    const wardById = new Map(WARD_RECORDS.map((w) => [w.id, w]));

    const enrichedFeatures = geojson.features.map((feature) => {
      const wardId = Number(feature.properties.ward_no);
      const ward = wardById.get(wardId);
      if (!ward) return feature;

      return {
        ...feature,
        properties: {
          ...feature.properties,
          ward_id: ward.id,
          ward_name: ward.name,
          population: ward.population,
          area_ha: ward.area_ha,
          density: Math.round(ward.population / ward.area_ha),
          councillor: ward.councillor,
          party: ward.party,
          municipality: "Ashoknagar Kalyangarh Municipality",
        },
      };
    });

    res.json({ success: true, data: { ...geojson, features: enrichedFeatures } });
  } catch (error) {
    next(error);
  }
};
