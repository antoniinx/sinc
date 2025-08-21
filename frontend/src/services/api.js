import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api'
    : 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if user is not already on login, register, or landing page
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register') && 
          window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
