import axios from 'axios'

// Prefer environment variable VITE_API_URL, fallback to Render backend
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`
  }
  return 'https://hireai-backend-u87f.onrender.com/api'
}

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30-second timeout to accommodate free tier cold starts
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export default API