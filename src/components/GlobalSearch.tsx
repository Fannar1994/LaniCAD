// ── Global Search (Ctrl+K / Cmd+K) ──
// Quick navigation to pages, calculators, and projects

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Calculator, FolderOpen, Ruler, Settings, FileText, Box,
  Building2, Wrench, LayoutDashboard, Layers, ClipboardList, Fence,
} from 'lucide-react'
import { fetchProjects, isApiConfigured } from '@/lib/db'
import type { Project } from '@/types'

interface SearchItem {
  id: string
  label: string
  description?: string
  icon: typeof Search
  path: string
  category: 'nav' | 'calculator' | 'project'
}

const NAV_ITEMS: SearchItem[] = [
  { id: 'nav-dashboard', label: 'Yfirlit', description: 'Forsíða', icon: LayoutDashboard, path: '/', category: 'nav' },
  { id: 'nav-projects', label: 'Verkefni', description: 'Öll verkefni', icon: FolderOpen, path: '/projects', category: 'nav' },
  { id: 'nav-templates', label: 'Sniðmát', description: 'Vistuð sniðmát', icon: Layers, path: '/templates', category: 'nav' },
  { id: 'nav-drawing', label: 'Teikningar', description: '2D/3D teiknivél', icon: Ruler, path: '/drawing', category: 'nav' },
  { id: 'nav-schematics', label: 'Skýringarmyndir', description: 'Búnaðarmyndir', icon: FileText, path: '/schematics', category: 'nav' },
  { id: 'nav-settings', label: 'Stillingar', description: 'Almennt, vörur, notendur', icon: Settings, path: '/settings', category: 'nav' },
  { id: 'nav-audit', label: 'Aðgerðaskrá', description: 'Audit log', icon: ClipboardList, path: '/audit-log', category: 'nav' },
]

const CALC_ITEMS: SearchItem[] = [
  { id: 'calc-fence', label: 'Girðingar', description: 'Vinnustaðagirðingar', icon: Fence, path: '/calculator/fence', category: 'calculator' },
  { id: 'calc-scaffolding', label: 'Vinnupallar', description: 'Layher Allround', icon: Box, path: '/calculator/scaffolding', category: 'calculator' },
  { id: 'calc-formwork', label: 'Steypumót', description: 'Rasto, Manto, Alufort', icon: FileText, path: '/calculator/formwork', category: 'calculator' },
  { id: 'calc-rolling', label: 'Hjólapallar', description: '0,75 / 1,35 mtr', icon: Wrench, path: '/calculator/rolling', category: 'calculator' },
  { id: 'calc-ceiling', label: 'Loftastoðir', description: 'Stoðir og HT-20 bitar', icon: Building2, path: '/calculator/ceiling', category: 'calculator' },
]

const CATEGORY_LABELS: Record<string, string> = {
  nav: 'Síður',
  calculator: 'Reiknivélar',
  project: 'Verkefni',
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Fetch projects once when opened
  useEffect(() => {
    if (open && isApiConfigured() && projects.length === 0) {
      fetchProjects().then(setProjects).catch(() => {})
    }
  }, [open, projects.length])

  // Ctrl+K / Cmd+K handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    function handleOpen() { setOpen(true) }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-global-search', handleOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-global-search', handleOpen)
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Build search items
  const projectItems: SearchItem[] = projects.map(p => ({
    id: `project-${p.id}`,
    label: p.name,
    description: p.client?.name || p.client?.company || undefined,
    icon: Calculator,
    path: `/calculator/${p.type}`,
    category: 'project' as const,
  }))

  const allItems = [...NAV_ITEMS, ...CALC_ITEMS, ...projectItems]

  const filtered = query.trim()
    ? allItems.filter(item => {
        const q = query.toLowerCase()
        return item.label.toLowerCase().includes(q) ||
          (item.description?.toLowerCase().includes(q))
      })
    : allItems.filter(item => item.category !== 'project') // Show pages + calculators by default

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = useCallback((item: SearchItem) => {
    setOpen(false)
    navigate(item.path)
  }, [navigate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex])
    }
  }

  if (!open) return null

  // Group by category
  const grouped = new Map<string, SearchItem[]>()
  for (const item of filtered) {
    const list = grouped.get(item.category) || []
    list.push(item)
    grouped.set(item.category, list)
  }

  let flatIndex = 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-gray-200 bg-white shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Leita að síðu, reiknivél eða verkefni..."
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
          <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-400 sm:inline">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Ekkert fannst fyrir &ldquo;{query}&rdquo;
            </div>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase">
                  {CATEGORY_LABELS[category] ?? category}
                </div>
                {items.map(item => {
                  const idx = flatIndex++
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                        idx === selectedIndex
                          ? 'bg-brand-accent/15 text-brand-dark'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{item.label}</div>
                        {item.description && (
                          <div className="truncate text-xs text-gray-400">{item.description}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-xs text-gray-400">
          <div className="flex gap-2">
            <span><kbd className="rounded border border-gray-200 px-1">↑↓</kbd> velja</span>
            <span><kbd className="rounded border border-gray-200 px-1">↵</kbd> opna</span>
          </div>
          <span><kbd className="rounded border border-gray-200 px-1">Ctrl+K</kbd> til að opna</span>
        </div>
      </div>
    </>
  )
}
