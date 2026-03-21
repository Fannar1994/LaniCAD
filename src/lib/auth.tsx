import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => boolean
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'lanicad_users'
const SESSION_KEY = 'lanicad_session'

// Default admin user (created on first run)
const DEFAULT_ADMIN: UserProfile & { password: string } = {
  id: '1',
  email: 'admin@byko.is',
  name: 'Kerfisstjóri',
  role: 'admin',
  password: 'admin123', // User should change this in settings
  created_at: new Date().toISOString(),
}

function getStoredUsers(): Array<UserProfile & { password: string }> {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]))
    return [DEFAULT_ADMIN]
  }
  return JSON.parse(raw)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const sessionEmail = localStorage.getItem(SESSION_KEY)
    if (sessionEmail) {
      const users = getStoredUsers()
      const found = users.find(u => u.email === sessionEmail)
      if (found) {
        const { password: _, ...profile } = found
        setUser(profile)
      }
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    const users = getStoredUsers()
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...profile } = found
      setUser(profile)
      localStorage.setItem(SESSION_KEY, email)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// User management functions (for Settings page)
export function getAllUsers(): UserProfile[] {
  return getStoredUsers().map(({ password: _, ...profile }) => profile)
}

export function createUser(email: string, name: string, password: string, role: 'admin' | 'user'): boolean {
  const users = getStoredUsers()
  if (users.some(u => u.email === email)) return false
  users.push({
    id: crypto.randomUUID(),
    email,
    name,
    role,
    password,
    created_at: new Date().toISOString(),
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  return true
}

export function deleteUser(id: string): boolean {
  const users = getStoredUsers()
  const filtered = users.filter(u => u.id !== id)
  if (filtered.length === users.length) return false
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function updateUserPassword(id: string, newPassword: string): boolean {
  const users = getStoredUsers()
  const user = users.find(u => u.id === id)
  if (!user) return false
  user.password = newPassword
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  return true
}
