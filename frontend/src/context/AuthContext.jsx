import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('dh_token'))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user)
      })
      .catch(() => {
        localStorage.removeItem('dh_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const t = res.data.token
    localStorage.setItem('dh_token', t)
    setToken(t)
    setUser(res.data.user)
    return res.data
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const t = res.data.token
    localStorage.setItem('dh_token', t)
    setToken(t)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('dh_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)