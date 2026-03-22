import { Menu, LogOut } from 'lucide-react'
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
        title="Valmynd"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent font-condensed font-bold text-brand-dark">
          LC
        </div>
        <span className="font-condensed text-lg font-bold text-brand-dark">
          LániCAD
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-xs text-gray-500">{user.name}</span>
        )}
        <button
          onClick={logout}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
          title="Útskrá"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
