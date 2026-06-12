import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../api'
// import api from "./api";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      auth.me().then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem('token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const r = await auth.login(credentials)
    localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }

  const register = async (data) => {
    const r = await auth.register(data)
    localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
    return r.data.user
  }

  const logout = async () => {
    await auth.logout().catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
