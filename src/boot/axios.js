import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Configure Axios instance
const api = axios.create({
  // baseURL: 'http://10.0.2.81:8000/api',
  baseURL: 'http://192.168.8.220:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
})

// Ensure credentials are used globally
axios.defaults.withCredentials = true
// Add Authorization Token Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
export default defineBoot(({ app }) => {
  // Register Axios globally for Vue Options API
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
