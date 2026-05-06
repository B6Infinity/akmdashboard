import api from "../lib/api";

/**
 * Fetch the AKM boundary GeoJSON.
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export const fetchBoundary = async () => {
  const { data } = await api.get("/map/boundary");
  return data.data; // unwrap { success, data }
};

/**
 * Fetch the AKM roads GeoJSON.
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export const fetchRoads = async () => {
  const { data } = await api.get("/map/roads");
  return data.data;
};

/**
 * Fetch the AKM wards GeoJSON (enriched with ward data).
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export const fetchWards = async () => {
  const { data } = await api.get("/map/wards");
  return data.data;
};
