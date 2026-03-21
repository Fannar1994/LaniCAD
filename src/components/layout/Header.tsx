import { Menu, LogOut, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-dark"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
              {user.role === 'admin' && (
                <span className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-medium text-brand-dark">
                  Stjórnandi
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Útskrá
            </button>
          </>
        )}
      </div>
    </header>
  )
}
