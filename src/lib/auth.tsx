import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { UserProfile } from '@/types'
import { getApiUrl } from '@/lib/api-config'

const TOKEN_KEY = 'lanicad_token'
const SESSION_KEY = 'lanicad_session'

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
  token: string | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function loadSession(): { user: UserProfile; token: string } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const raw = localStorage.getItem(SESSION_KEY)
    if (token && raw) {
      const user = JSON.parse(raw) as UserProfile
      return { user, token }
    }
  } catch { /* corrupted data */ }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadSession()
  const [user, setUser] = useState<UserProfile | null>(initial?.user ?? null)
  const [token, setToken] = useState<string | null>(initial?.token ?? null)

  // Verify token is still valid on mount (skip for offline sessions)
  useEffect(() => {
    if (!token || token === 'offline') return
    const apiUrl = getApiUrl()
    if (!apiUrl) return
    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('invalid')
        return res.json()
      })
      .then((u: UserProfile) => {
        setUser(u)
        localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(SESSION_KEY)
        setUser(null)
        setToken(null)
      })
  }, [token])

  // Auto-logout when any API call returns 401
  useEffect(() => {
    const handleExpired = () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(SESSION_KEY)
      setUser(null)
      setToken(null)
    }
    window.addEventListener('lanicad:auth-expired', handleExpired)
    return () => window.removeEventListener('lanicad:auth-expired', handleExpired)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const apiUrl = getApiUrl()

    // Try API login first when available
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Innskráning mistókst')
        }
        const data = await res.json()
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        return true
      } catch (err) {
        // If it's a credential error from the server, don't fall through
        if (err instanceof Error && (err.message.includes('Rangt') || err.message.includes('Innskráning mistókst'))) {
          throw err
        }
        // Network error — fall through to offline login
      }
    }

    // Offline fallback: allow default admin only on localhost (dev mode)
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    if (isLocalhost && email === 'admin@lanicad.is' && password === 'admin123') {
      const offlineUser: UserProfile = {
        id: 'offline',
        email: 'admin@lanicad.is',
        name: 'Stjórnandi',
        role: 'admin',
        created_at: new Date().toISOString(),
      }
      const offlineToken = 'offline'
      localStorage.setItem(TOKEN_KEY, offlineToken)
      localStorage.setItem(SESSION_KEY, JSON.stringify(offlineUser))
      setToken(offlineToken)
      setUser(offlineUser)
      return true
    }

    throw new Error('Rangt netfang eða lykilorð')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      token,
      isAuthenticated: Boolean(user && token),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
