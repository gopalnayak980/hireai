import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    let parsedUrl
    try {
      parsedUrl = new URL(envUrl.trim())
    } catch {
      throw new Error('VITE_API_URL must be an absolute backend URL.')
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
      throw new Error('VITE_API_URL must be a safe HTTP or HTTPS backend URL.')
    }
    if (import.meta.env.PROD && parsedUrl.protocol !== 'https:') {
      throw new Error('VITE_API_URL must use HTTPS in production.')
    }
    const normalizedUrl = parsedUrl.href.replace(/\/$/, '')
    return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`
  }
  if (import.meta.env.DEV) return 'http://localhost:5000/api'
  throw new Error('VITE_API_URL must be configured for production builds.')
}

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30-second timeout to accommodate free tier cold starts
})

export const SESSION_EXPIRED_EVENT = 'hireai:session-expired'

let sessionExpiryNotified = false

export const resetSessionExpiryNotification = () => {
  sessionExpiryNotified = false
}

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

API.interceptors.response.use(
  (response) => {
    if (/\/auth\/(login|register)(?:\?|$)/.test(response.config?.url || '')) {
      resetSessionExpiryNotification()
    }
    return response
  },
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthRequest = /\/auth\/(login|register)(?:\?|$)/.test(requestUrl)
    const currentToken = localStorage.getItem('token')
    const authorization = error.config?.headers?.Authorization || error.config?.headers?.authorization
    const belongsToCurrentSession = currentToken && authorization === `Bearer ${currentToken}`

    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      belongsToCurrentSession &&
      !sessionExpiryNotified
    ) {
      sessionExpiryNotified = true
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }

    return Promise.reject(error)
  },
)

export default API
