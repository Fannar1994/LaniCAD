import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, User, Settings, ChevronDown, Search, Wifi, WifiOff } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { getApiUrl } from '@/lib/api-config'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Yfirlit',
  '/projects': 'Verkefni',
  '/templates': 'Sniðmát',
  '/calculator/fence': 'Girðingar',
  '/calculator/scaffolding': 'Vinnupallar',
  '/calculator/formwork': 'Steypumót',
  '/calculator/rolling': 'Hjólapallar',
  '/calculator/ceiling': 'Loftastoðir',
  '/drawing': 'Teikningar',
  '/schematics': 'Skýringarmyndir',
  '/settings': 'Stillingar',
  '/audit-log': 'Aðgerðaskrá',
}

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // API connection status
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  useEffect(() => {
    let cancelled = false
    async function checkApi() {
      const url = getApiUrl()
      if (!url) {
        setApiStatus('disconnected')
        return
      }
      try {
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) })
        if (!cancelled) {
          const data = await res.json().catch(() => ({}))
          setApiStatus(res.ok && data.status === 'ok' ? 'connected' : 'disconnected')
        }
      } catch {
        if (!cancelled) setApiStatus('disconnected')
      }
    }
    checkApi()
    const interval = setInterval(checkApi, 30000) // re-check every 30s
    return () => { cancelled = true; clearInterval(interval) }
  }, [location.pathname]) // re-check on navigation

  const pageTitle = PAGE_TITLES[location.pathname] || ''

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-dark"
          title="Valmynd"
        >
          <Menu className="h-5 w-5" />
        </button>
        {pageTitle && (
          <span className="hidden font-condensed text-sm font-semibold text-gray-500 sm:block">
            {pageTitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent font-condensed font-bold text-brand-dark">
          LC
        </div>
        <span className="font-condensed text-lg font-bold text-brand-dark">
          LániCAD
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* API connection status */}
        <Link
          to="/settings"
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition ${
            apiStatus === 'connected'
              ? 'border-green-200 bg-green-50 text-green-700'
              : apiStatus === 'disconnected'
              ? 'border-red-200 bg-red-50 text-red-600'
              : 'border-gray-200 bg-gray-50 text-gray-400'
          }`}
          title={apiStatus === 'connected' ? 'API tengd' : apiStatus === 'disconnected' ? 'API ekki tengd — smelltu til að stilla' : 'Athuga tengingu...'}
        >
          {apiStatus === 'connected' ? (
            <Wifi className="h-3.5 w-3.5" />
          ) : (
            <WifiOff className="h-3.5 w-3.5" />
          )}
          <span className="hidden md:inline">
            {apiStatus === 'connected' ? 'Tengd' : apiStatus === 'disconnected' ? 'Ótengd' : '...'}
          </span>
        </Link>

        {/* Global search trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
          className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500"
          title="Leita (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Leita...</span>
          <kbd className="hidden rounded border border-gray-200 px-1 py-0.5 text-xs sm:inline">⌘K</kbd>
        </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          {user && <span className="hidden text-xs sm:block">{user.name}</span>}
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {user && (
              <div className="border-b border-gray-100 px-4 py-2">
                <div className="text-sm font-medium text-brand-dark">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            )}
            <Link
              to="/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              Stillingar
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Útskrá
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  )
}
