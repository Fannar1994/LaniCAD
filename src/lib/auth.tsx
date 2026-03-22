import { createContext, useContext, type ReactNode } from 'react'
import type { UserProfile } from '@/types'

const defaultUser: UserProfile = {
  id: 'default-admin',
  email: 'admin@lanicad.is',
  name: 'Stjórnandi',
  role: 'admin',
  created_at: new Date().toISOString(),
}

interface AuthContextType {
  user: UserProfile
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: defaultUser, login: async () => true, logout: () => {}, isAdmin: true, token: null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
