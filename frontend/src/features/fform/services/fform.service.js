import api from '../../../hooks/useApi'

export const fformService = {
  getFForms: () => api.get('/fforms'),
  getFForm: (id) => api.get(`/fforms/${id}`),
  createFForm: (data) => api.post('/fforms', data),
}
