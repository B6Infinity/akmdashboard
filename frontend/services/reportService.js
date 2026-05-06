import api from "../lib/api";

/**
 * Submit a new incident report.
 * @param {{ type: string, photo: string, location: { lat: number, lng: number }, remarks: string, ward_no?: number }} payload
 * @returns {Promise<object>} Created report document
 */
export const createReport = async (payload) => {
  const { data } = await api.post("/reports", payload);
  return data.data;
};

/**
 * Fetch all reports with optional filters.
 * @param {{ status?: string, ward_no?: number, type?: string, page?: number, limit?: number }} params
 */
export const fetchReports = async (params = {}) => {
  const { data } = await api.get("/reports", { params });
  return data; // includes { data, pagination }
};

/**
 * Fetch a single report by id.
 * @param {string} id
 */
export const fetchReportById = async (id) => {
  const { data } = await api.get(`/reports/${id}`);
  return data.data;
};

/**
 * Update the status of a report.
 * @param {string} id
 * @param {'pending'|'in_progress'|'resolved'} status
 */
export const updateReportStatus = async (id, status) => {
  const { data } = await api.patch(`/reports/${id}/status`, { status });
  return data.data;
};
