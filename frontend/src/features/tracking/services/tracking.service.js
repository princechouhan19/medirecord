import api from "../../../hooks/useApi";

export const trackingService = {
  getTrackings: () => api.get("/tracking"),
  createTracking: (data) => api.post("/tracking", data),
  addVisit: (id, data) => api.patch(`/tracking/${id}/visit`, data),
  completeTracking: (id) => api.patch(`/tracking/${id}/complete`),
  deleteTracking: (id) => api.delete(`/tracking/${id}`),
};
