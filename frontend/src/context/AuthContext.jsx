import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'

import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [token, setToken] = useState(
    localStorage.getItem('dh_token')
  )

  useEffect(() => {
    if (token) {
      api.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`

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
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    })

    localStorage.setItem(
      'dh_token',
      res.data.token
    )

    setToken(res.data.token)
    setUser(res.data.user)

    return res.data
  }

  const register = async (data) => {
    const res = await api.post(
      '/auth/register',
      data
    )

    localStorage.setItem(
      'dh_token',
      res.data.token
    )

    setToken(res.data.token)
    setUser(res.data.user)

    return res.data
  }

  const logout = () => {
    localStorage.removeItem('dh_token')

    setToken(null)
    setUser(null)

    delete api.defaults.headers.common[
      'Authorization'
    ]
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

export const useAuth = () =>
  useContext(AuthContext)