import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Ruler,
  Fence,
  Box,
  Columns3,
  ArrowUpDown,
  PenTool,
  FileText,
  Layers,
  ClipboardList,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, tKey: 'nav.dashboard' },
  { to: '/projects', icon: FolderOpen, tKey: 'nav.projects' },
  { to: '/templates', icon: Layers, tKey: 'nav.templates' },
  { to: '/reports', icon: BarChart3, tKey: 'nav.reports' },
] as const

const calculatorItems = [
  { to: '/calculator/fence', icon: Fence, tKey: 'nav.fence' },
  { to: '/calculator/scaffolding', icon: Columns3, tKey: 'nav.scaffolding' },
  { to: '/calculator/formwork', icon: Box, tKey: 'nav.formwork' },
  { to: '/calculator/rolling', icon: ArrowUpDown, tKey: 'nav.rolling' },
  { to: '/calculator/ceiling', icon: Ruler, tKey: 'nav.ceiling' },
] as const

const drawingItems = [
  { to: '/drawing', icon: PenTool, tKey: 'nav.drawing' },
  { to: '/schematics', icon: FileText, tKey: 'nav.schematics' },
] as const

const bottomItems = [
  { to: '/audit-log', icon: ClipboardList, tKey: 'nav.auditLog', adminOnly: true },
  { to: '/settings', icon: Settings, tKey: 'nav.settings' },
] as const

export function Sidebar({ open }: SidebarProps) {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
        // Mobile: fixed overlay sidebar
        'fixed inset-y-0 left-0 z-40 lg:static lg:z-auto',
        open ? 'w-60 translate-x-0' : '-translate-x-full w-60 lg:translate-x-0 lg:w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent font-condensed font-bold text-brand-dark">
          LC
        </div>
        {open && (
          <span className="font-condensed text-lg font-bold text-brand-dark">
            LániCAD
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(item => (
          <SidebarLink key={item.to} to={item.to} icon={item.icon} label={t(item.tKey)} open={open} />
        ))}

        {open && (
          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('nav.calculators')}
          </div>
        )}
        {!open && <div className="my-3 border-t border-gray-200" />}

        {calculatorItems.map(item => (
          <SidebarLink key={item.to} to={item.to} icon={item.icon} label={t(item.tKey)} open={open} />
        ))}

        {open && (
          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('nav.drawings')}
          </div>
        )}
        {!open && <div className="my-3 border-t border-gray-200" />}

        {drawingItems.map(item => (
          <SidebarLink key={item.to} to={item.to} icon={item.icon} label={t(item.tKey)} open={open} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-gray-200 p-2">
        {bottomItems
          .filter(item => !('adminOnly' in item) || !item.adminOnly || isAdmin)
          .map(item => (
            <SidebarLink key={item.to} to={item.to} icon={item.icon} label={t(item.tKey)} open={open} />
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
