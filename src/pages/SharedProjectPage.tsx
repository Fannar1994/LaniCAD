import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, Package, DollarSign, User, Building2, Calendar } from 'lucide-react'
import { fetchSharedProject } from '@/lib/db'
import { formatKr, formatNumber, formatDate } from '@/lib/format'
import type { ClientInfo, LineItem, CalculatorType } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  fence: 'Girðingar',
  scaffolding: 'Vinnupallar',
  formwork: 'Steypumót',
  rolling: 'Hjólapallar',
  ceiling: 'Loftastoðir',
}

export function SharedProjectPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<{
    name: string
    type: CalculatorType
    client: ClientInfo
    line_items: LineItem[]
    created_at: string
    updated_at: string
    owner_name: string
  } | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Enginn hlekkur gefinn')
      setLoading(false)
      return
    }
    fetchSharedProject(token)
      .then(data => {
        setProject({
          name: data.name,
          type: data.type as CalculatorType,
          client: typeof data.client === 'string' ? JSON.parse(data.client) : data.client,
          line_items: typeof data.line_items === 'string' ? JSON.parse(data.line_items) : data.line_items,
          created_at: data.created_at,
          updated_at: data.updated_at,
          owner_name: data.owner_name,
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const totalCost = useMemo(() => {
    if (!project?.line_items) return 0
    return project.line_items.reduce((s, item) => s + (item.rentalCost || 0), 0)
  }, [project])

  const totalSaleCost = useMemo(() => {
    if (!project?.line_items) return 0
    return project.line_items.reduce((s, item) => s + (item.saleCost || 0), 0)
  }, [project])

  const totalWeight = useMemo(() => {
    if (!project?.line_items) return 0
    return project.line_items.reduce((s, item) => s + (item.weight || 0) * (item.quantity || 0), 0)
  }, [project])

  const totalItems = useMemo(() => {
    if (!project?.line_items) return 0
    return project.line_items.reduce((s, item) => s + (item.quantity || 0), 0)
  }, [project])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f5c800] border-t-transparent" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h1 className="text-lg font-bold text-[#404042]">Verkefni fannst ekki</h1>
          <p className="mt-2 text-sm text-gray-500">{error || 'Hlekkurinn er ógildur eða útrunninn.'}</p>
        </div>
      </div>
    )
  }

  const client = project.client

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-[#404042]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-condensed text-xl font-bold text-white">
              Láni<span className="text-[#f5c800]">CAD</span>
            </span>
            <span className="rounded bg-[#f5c800]/20 px-2 py-0.5 text-xs font-medium text-[#f5c800]">
              Deilt verkefni
            </span>
          </div>
          <span className="text-xs text-gray-400">Skrifvarið yfirlit</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Project title */}
        <div className="mb-6">
          <h1 className="font-condensed text-2xl font-bold text-[#404042]">{project.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              {TYPE_LABELS[project.type] ?? project.type}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {project.owner_name}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(new Date(project.updated_at))}
            </span>
          </div>
        </div>

        {/* Client info + Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {/* Client */}
          {(client.name || client.company) && (
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-condensed text-sm font-bold text-[#404042]">
                <Building2 className="h-4 w-4" /> Viðskiptavinur
              </h2>
              <dl className="space-y-1 text-sm">
                {client.name && <div><dt className="text-gray-400 inline">Nafn:</dt> <dd className="text-[#404042] inline">{client.name}</dd></div>}
                {client.company && <div><dt className="text-gray-400 inline">Fyrirtæki:</dt> <dd className="text-[#404042] inline">{client.company}</dd></div>}
                {client.kennitala && <div><dt className="text-gray-400 inline">Kennitala:</dt> <dd className="text-[#404042] inline">{client.kennitala}</dd></div>}
                {client.phone && <div><dt className="text-gray-400 inline">Sími:</dt> <dd className="text-[#404042] inline">{client.phone}</dd></div>}
                {client.email && <div><dt className="text-gray-400 inline">Netfang:</dt> <dd className="text-[#404042] inline">{client.email}</dd></div>}
                {client.address && <div><dt className="text-gray-400 inline">Heimilisfang:</dt> <dd className="text-[#404042] inline">{client.address}</dd></div>}
              </dl>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <DollarSign className="h-3.5 w-3.5" /> Leigukostnaður
              </div>
              <div className="mt-1 font-condensed text-2xl font-bold text-[#404042]">
                {totalCost > 0 ? formatKr(totalCost) : '—'}
              </div>
            </div>
            {totalSaleCost > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <DollarSign className="h-3.5 w-3.5" /> Söluverð
                </div>
                <div className="mt-1 font-condensed text-2xl font-bold text-[#404042]">
                  {formatKr(totalSaleCost)}
                </div>
              </div>
            )}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Package className="h-3.5 w-3.5" /> Hlutir
              </div>
              <div className="mt-1 font-condensed text-2xl font-bold text-[#404042]">
                {formatNumber(totalItems)}
              </div>
            </div>
            {totalWeight > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Package className="h-3.5 w-3.5" /> Þyngd
                </div>
                <div className="mt-1 font-condensed text-2xl font-bold text-[#404042]">
                  {formatNumber(totalWeight)} kg
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Line items table */}
        {project.line_items.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="font-condensed text-sm font-bold text-[#404042]">Efnislisti</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                    <th className="px-5 py-2 font-medium">Vörunr.</th>
                    <th className="px-3 py-2 font-medium">Lýsing</th>
                    <th className="px-3 py-2 font-medium text-right">Magn</th>
                    {project.line_items.some(i => i.weight) && (
                      <th className="px-3 py-2 font-medium text-right">Þyngd</th>
                    )}
                    <th className="px-3 py-2 font-medium text-right">Leigukostnaður</th>
                    {totalSaleCost > 0 && (
                      <th className="px-3 py-2 font-medium text-right">Söluverð</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {project.line_items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-2 font-mono text-xs text-gray-500">{item.rentalNo}</td>
                      <td className="px-3 py-2 text-[#404042]">{item.description}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
                      {project.line_items.some(i => i.weight) && (
                        <td className="px-3 py-2 text-right text-gray-600">
                          {item.weight ? `${formatNumber(item.weight * item.quantity)} kg` : '—'}
                        </td>
                      )}
                      <td className="px-3 py-2 text-right font-medium text-[#404042]">
                        {item.rentalCost > 0 ? formatKr(item.rentalCost) : '—'}
                      </td>
                      {totalSaleCost > 0 && (
                        <td className="px-3 py-2 text-right text-gray-600">
                          {item.saleCost ? formatKr(item.saleCost) : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50 font-medium">
                    <td className="px-5 py-2 text-[#404042]">Samtals</td>
                    <td className="px-3 py-2" />
                    <td className="px-3 py-2 text-right text-[#404042]">{formatNumber(totalItems)}</td>
                    {project.line_items.some(i => i.weight) && (
                      <td className="px-3 py-2 text-right text-[#404042]">{formatNumber(totalWeight)} kg</td>
                    )}
                    <td className="px-3 py-2 text-right text-[#404042]">{formatKr(totalCost)}</td>
                    {totalSaleCost > 0 && (
                      <td className="px-3 py-2 text-right text-[#404042]">{formatKr(totalSaleCost)}</td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Búið til með LániCAD — Reiknivélar og teikningar fyrir grófvöru</p>
          <p className="mt-1">BYKO Leiga · Dalvegi 10-14, 201 Kópavogi</p>
        </div>
      </main>
    </div>
  )
}
