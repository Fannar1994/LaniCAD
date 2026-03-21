import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calculator,
  FolderOpen,
  Settings,
  Ruler,
  Fence,
  Box,
  Columns3,
  ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Yfirlit' },
  { to: '/projects', icon: FolderOpen, label: 'Verkefni' },
]

const calculatorItems = [
  { to: '/calculator/fence', icon: Fence, label: 'Girðingar' },
  { to: '/calculator/scaffolding', icon: Columns3, label: 'Vinnupallar' },
  { to: '/calculator/formwork', icon: Box, label: 'Steypumót' },
  { to: '/calculator/rolling', icon: ArrowUpDown, label: 'Hjólapallar' },
  { to: '/calculator/ceiling', icon: Ruler, label: 'Loftastoðir' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Stillingar' },
]

export function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
        open ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent font-condensed font-bold text-brand-dark">
          BL
        </div>
        {open && (
          <span className="font-condensed text-lg font-bold text-brand-dark">
            BYKO Leiga
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(item => (
          <SidebarLink key={item.to} {...item} open={open} />
        ))}

        {open && (
          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Reiknivélar
          </div>
        )}
        {!open && <div className="my-3 border-t border-gray-200" />}

        {calculatorItems.map(item => (
          <SidebarLink key={item.to} {...item} open={open} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-gray-200 p-2">
        {bottomItems.map(item => (
          <SidebarLink key={item.to} {...item} open={open} />
        ))}
      </div>
    </aside>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  open,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  open: boolean
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-accent/10 text-brand-dark'
            : 'text-gray-600 hover:bg-gray-100 hover:text-brand-dark'
        )
      }
      title={label}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {open && <span>{label}</span>}
    </NavLink>
  )
}
