import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

const token = localStorage.getItem('medi_token')
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medi_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
