import { createContext, useState, useContext, useCallback, useEffect } from 'react'
import API, { resetSessionExpiryNotification, SESSION_EXPIRED_EVENT } from '../utils/api'

const AuthContext = createContext()

const readStoredSession = () => {
  const storedToken = localStorage.getItem('token')
  let storedUser = null

  try {
    storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    localStorage.removeItem('user')
  }

  if (!storedToken || !storedUser || typeof storedUser !== 'object' || Array.isArray(storedUser)) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }

  return { token: storedToken, user: storedUser }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession)

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    resetSessionExpiryNotification()
    setSession({ token: res.data.token, user: res.data.user })
    return res.data
  }

  const login = async (formData) => {
    const res = await API.post('/auth/login', formData)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    resetSessionExpiryNotification()
    setSession({ token: res.data.token, user: res.data.user })
    return res.data
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    resetSessionExpiryNotification()
    setSession(null)
  }, [])

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout)
  }, [logout])

  const user = session?.user || null
  const token = session?.token || null

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
