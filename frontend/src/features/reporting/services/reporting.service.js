import api from "../../../hooks/useApi";

export const reportingService = {
  getReports: () => api.get("/reports"),
  getReport: (id) => api.get(`/reports/${id}`),
  createReport: (formData) =>
    api.post("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};
