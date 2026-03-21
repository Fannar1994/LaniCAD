import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserProfile } from '@/types'
import { getApiUrl } from '@/lib/api-config'

const TOKEN_KEY = 'lanicad_token'

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  // Restore session from stored token
  useEffect(() => {
    if (!token) return
    const apiUrl = getApiUrl()
    if (!apiUrl) return
    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((profile: UserProfile) => setUser(profile))
      .catch(() => {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
  }, [token])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const apiUrl = getApiUrl()
      if (!apiUrl) return false
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin', token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
