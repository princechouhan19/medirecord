import api from '../../../hooks/useApi'

export const dashboardService = {
  getPatientStats: () => api.get('/patients/stats'),
  getRecentPatients: () => api.get('/patients?limit=5'),
  getReportStats: () => api.get('/reports'),
  getTrackingStats: () => api.get('/tracking'),
}
