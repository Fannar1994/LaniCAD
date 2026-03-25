import { useState, useEffect, useMemo } from 'react'
import {
  BarChart3,
  Download,
  Filter,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts'
import { fetchProjects, isApiConfigured } from '@/lib/db'
import { formatKr, formatNumber, formatDate } from '@/lib/format'
import type { Project, CalculatorType } from '@/types'
import * as XLSX from 'xlsx'

const TYPE_LABELS: Record<string, string> = {
  fence: 'Girðingar',
  scaffolding: 'Vinnupallar',
  formwork: 'Steypumót',
  rolling: 'Hjólapallar',
  ceiling: 'Loftastoðir',
}

const COLORS = ['#f5c800', '#404042', '#6b7280', '#3b82f6', '#10b981']

const CALC_TYPES: CalculatorType[] = ['fence', 'scaffolding', 'formwork', 'rolling', 'ceiling']

function getProjectCost(p: Project): number {
  if (!p.line_items || !Array.isArray(p.line_items)) return 0
  return p.line_items.reduce((s, item) => s + (item.rentalCost || 0), 0)
}

function getProjectWeight(p: Project): number {
  if (!p.line_items || !Array.isArray(p.line_items)) return 0
  return p.line_items.reduce((s, item) => s + (item.weight || 0) * (item.quantity || 0), 0)
}

function getProjectItemCount(p: Project): number {
  if (!p.line_items || !Array.isArray(p.line_items)) return 0
  return p.line_items.reduce((s, item) => s + (item.quantity || 0), 0)
}

export function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<CalculatorType | 'all'>('all')
  const [showProjectPicker, setShowProjectPicker] = useState(false)

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false)
      return
    }
    fetchProjects()
      .then(data => {
        setProjects(data)
        // Auto-select all projects initially
        setSelectedIds(new Set(data.map(p => p.id)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filtered projects by type
  const filteredProjects = useMemo(
    () => (typeFilter === 'all' ? projects : projects.filter(p => p.type === typeFilter)),
    [projects, typeFilter]
  )

  // Selected projects from filtered set
  const selected = useMemo(
    () => filteredProjects.filter(p => selectedIds.has(p.id)),
    [filteredProjects, selectedIds]
  )

  // ── Aggregations ──

  // Cost by type (for the selected projects)
  const costByType = useMemo(() => {
    const map: Record<string, number> = {}
    selected.forEach(p => {
      map[p.type] = (map[p.type] || 0) + getProjectCost(p)
    })
    return CALC_TYPES.filter(t => map[t]).map(t => ({
      name: TYPE_LABELS[t],
      kostnaður: Math.round(map[t]),
    }))
  }, [selected])

  // Cost by type pie
  const costByTypePie = useMemo(() => {
    const map: Record<string, number> = {}
    selected.forEach(p => {
      map[p.type] = (map[p.type] || 0) + getProjectCost(p)
    })
    return CALC_TYPES.filter(t => map[t]).map(t => ({
      name: TYPE_LABELS[t],
      value: Math.round(map[t]),
    }))
  }, [selected])

  // Client revenue table
  const clientRevenue = useMemo(() => {
    const map = new Map<string, { name: string; company: string; projects: number; cost: number }>()
    selected.forEach(p => {
      const key = p.client?.company || p.client?.name || 'Óþekktur'
      const existing = map.get(key)
      if (existing) {
        existing.projects++
        existing.cost += getProjectCost(p)
      } else {
        map.set(key, {
          name: p.client?.name || '',
          company: p.client?.company || key,
          projects: 1,
          cost: getProjectCost(p),
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => b.cost - a.cost)
  }, [selected])

  // Monthly cost trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const now = new Date()
    const months: { name: string; kostnaður: number; verkefni: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthProjects = selected.filter(p => {
        const d = new Date(p.created_at)
        return d >= month && d <= monthEnd
      })
      const cost = monthProjects.reduce((s, p) => s + getProjectCost(p), 0)
      months.push({
        name: month.toLocaleDateString('is-IS', { month: 'short' }),
        kostnaður: Math.round(cost),
        verkefni: monthProjects.length,
      })
    }
    return months
  }, [selected])

  // Summary stats
  const totalCost = useMemo(() => selected.reduce((s, p) => s + getProjectCost(p), 0), [selected])
  const totalItems = useMemo(() => selected.reduce((s, p) => s + getProjectItemCount(p), 0), [selected])
  const totalWeight = useMemo(() => selected.reduce((s, p) => s + getProjectWeight(p), 0), [selected])
  const uniqueClients = useMemo(() => {
    const names = new Set<string>()
    selected.forEach(p => {
      if (p.client?.company) names.add(p.client.company)
      else if (p.client?.name) names.add(p.client.name)
    })
    return names.size
  }, [selected])

  // ── Project comparison table ──
  const comparisonData = useMemo(
    () =>
      selected
        .slice()
        .sort((a, b) => getProjectCost(b) - getProjectCost(a))
        .map(p => ({
          id: p.id,
          name: p.name,
          type: TYPE_LABELS[p.type] ?? p.type,
          client: p.client?.company || p.client?.name || '—',
          items: getProjectItemCount(p),
          cost: getProjectCost(p),
          weight: getProjectWeight(p),
          date: p.created_at,
        })),
    [selected]
  )

  // ── Toggle selection ──
  function toggleProject(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(filteredProjects.map(p => p.id)))
  }

  function selectNone() {
    setSelectedIds(new Set())
  }

  // ── Export ──
  function exportReportExcel() {
    const rows: (string | number)[][] = []
    rows.push(['LániCAD — Samanburðarskýrsla'])
    rows.push([`Dagsetning: ${formatDate(new Date())}`])
    rows.push([`Valin verkefni: ${selected.length}`])
    rows.push([])

    // Summary
    rows.push(['Samantekt'])
    rows.push(['Heildarkostnaður', formatKr(totalCost)])
    rows.push(['Verkefni', selected.length])
    rows.push(['Viðskiptavinir', uniqueClients])
    rows.push(['Hlutir samtals', totalItems])
    if (totalWeight > 0) rows.push(['Þyngd samtals', `${formatNumber(totalWeight)} kg`])
    rows.push([])

    // Comparison table
    rows.push(['Verkefni', 'Tegund', 'Viðskiptavinur', 'Hlutir', 'Þyngd (kg)', 'Kostnaður'])
    comparisonData.forEach(row => {
      rows.push([row.name, row.type, row.client, row.items, Math.round(row.weight), Math.round(row.cost)])
    })
    rows.push([])

    // Client revenue
    rows.push(['Viðskiptavinur', 'Verkefni', 'Heildarkostnaður'])
    clientRevenue.forEach(c => {
      rows.push([c.company, c.projects, Math.round(c.cost)])
    })

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 25 }, { wch: 10 }, { wch: 14 }, { wch: 18 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Skýrsla')
    XLSX.writeFile(wb, `lanicad-skyrsla-${formatDate(new Date()).replace(/\./g, '')}.xlsx`)
  }

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="font-condensed text-lg font-bold text-brand-dark">Engin verkefni til samanburðar</h2>
        <p className="mt-1 text-sm text-gray-400">Vistaðu útreikninga í reiknivélum til að sjá skýrslur hér.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-condensed text-2xl font-bold text-brand-dark">Skýrslur og samanburður</h1>
          <p className="mt-1 text-sm text-gray-500">
            {selected.length} af {filteredProjects.length} verkefnum valin
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReportExcel}
            disabled={selected.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm transition hover:border-brand-accent disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Flytja út Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" /> Tegund:
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              typeFilter === 'all'
                ? 'bg-brand-accent text-brand-dark'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Allt
          </button>
          {CALC_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                typeFilter === t
                  ? 'bg-brand-accent text-brand-dark'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Project picker toggle */}
        <button
          onClick={() => setShowProjectPicker(!showProjectPicker)}
          className="ml-auto inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-dark"
        >
          Velja verkefni {showProjectPicker ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Project picker */}
      {showProjectPicker && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-dark">Velja verkefni til samanburðar</span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">Velja öll</button>
              <button onClick={selectNone} className="text-xs text-blue-600 hover:underline">Afvelja öll</button>
            </div>
          </div>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(p => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    selectedIds.has(p.id) ? 'border-brand-accent bg-brand-accent' : 'border-gray-300'
                  }`}
                  onClick={() => toggleProject(p.id)}
                >
                  {selectedIds.has(p.id) && <Check className="h-3 w-3 text-brand-dark" />}
                </span>
                <span
                  className="flex-1 truncate text-brand-dark"
                  onClick={() => toggleProject(p.id)}
                >
                  {p.name}
                </span>
                <span className="text-xs text-gray-400">{TYPE_LABELS[p.type]}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">Veldu a.m.k. eitt verkefni til að sjá skýrslur</p>
        </div>
      ) : (
        <>
          {/* KPI stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={DollarSign} label="Heildarkostnaður" value={formatKr(totalCost)} />
            <StatCard icon={Users} label="Viðskiptavinir" value={String(uniqueClients)} />
            <StatCard icon={Package} label="Hlutir samtals" value={formatNumber(totalItems)} />
            <StatCard icon={TrendingUp} label="Meðalkostnaður" value={formatKr(totalCost / selected.length)} />
          </div>

          {/* Charts row */}
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            {/* Cost by type bar */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-condensed text-sm font-bold text-brand-dark">Kostnaður eftir tegund</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={costByType}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}þ`} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(v: any) => formatKr(Number(v))} />
                  <Bar dataKey="kostnaður" fill="#f5c800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cost distribution pie */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-condensed text-sm font-bold text-brand-dark">Hlutföll kostnaðar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={costByTypePie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name} (${formatKr(value)})`}
                  >
                    {costByTypePie.map((_e, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(v: any) => formatKr(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly trend */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-condensed text-sm font-bold text-brand-dark">
              Kostnaðarþróun (síðustu 6 mánuðir)
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="cost" tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}þ`} />
                <YAxis yAxisId="count" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip formatter={(v: any, name: any) => name === 'kostnaður' ? formatKr(Number(v)) : v} />
                <Legend />
                <Line yAxisId="cost" type="monotone" dataKey="kostnaður" stroke="#f5c800" strokeWidth={2} dot={{ fill: '#f5c800' }} />
                <Line yAxisId="count" type="monotone" dataKey="verkefni" stroke="#404042" strokeWidth={2} dot={{ fill: '#404042' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Project comparison table */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-3">
              <h3 className="font-condensed text-sm font-bold text-brand-dark">Verkefnasamanburður</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-5 py-2 font-medium">Verkefni</th>
                    <th className="px-3 py-2 font-medium">Tegund</th>
                    <th className="px-3 py-2 font-medium">Viðskiptavinur</th>
                    <th className="px-3 py-2 font-medium text-right">Hlutir</th>
                    <th className="px-3 py-2 font-medium text-right">Þyngd</th>
                    <th className="px-3 py-2 font-medium text-right">Kostnaður</th>
                    <th className="px-3 py-2 font-medium text-right">Dags.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {comparisonData.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2 font-medium text-brand-dark">{row.name}</td>
                      <td className="px-3 py-2 text-gray-600">{row.type}</td>
                      <td className="px-3 py-2 text-gray-600">{row.client}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{row.items}</td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {row.weight > 0 ? `${formatNumber(row.weight)} kg` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-brand-dark">{formatKr(row.cost)}</td>
                      <td className="px-3 py-2 text-right text-gray-400">
                        {new Date(row.date).toLocaleDateString('is-IS')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {comparisonData.length > 1 && (
                  <tfoot>
                    <tr className="border-t border-gray-200 bg-gray-50 font-medium">
                      <td className="px-5 py-2 text-brand-dark">Samtals</td>
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2 text-right text-brand-dark">{formatNumber(totalItems)}</td>
                      <td className="px-3 py-2 text-right text-brand-dark">
                        {totalWeight > 0 ? `${formatNumber(totalWeight)} kg` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-brand-dark">{formatKr(totalCost)}</td>
                      <td className="px-3 py-2" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Client revenue table */}
          {clientRevenue.length > 0 && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-3">
                <h3 className="font-condensed text-sm font-bold text-brand-dark">Tekjur eftir viðskiptavini</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                      <th className="px-5 py-2 font-medium">Fyrirtæki</th>
                      <th className="px-3 py-2 font-medium">Tengiliður</th>
                      <th className="px-3 py-2 font-medium text-right">Verkefni</th>
                      <th className="px-3 py-2 font-medium text-right">Heildarkostnaður</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {clientRevenue.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-2 font-medium text-brand-dark">{c.company}</td>
                        <td className="px-3 py-2 text-gray-600">{c.name}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{c.projects}</td>
                        <td className="px-3 py-2 text-right font-medium text-brand-dark">{formatKr(c.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── StatCard ──
function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">{value}</div>
    </div>
  )
}
