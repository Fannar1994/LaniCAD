import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getApiUrl } from '@/lib/api-config'
import { useTranslation } from '@/lib/i18n'
import { ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface AuditEntry {
  id: string
  user_id: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown>
  ip_address: string
  created_at: string
}

const ACTION_LABELS: Record<string, { is: string; en: string; color: string }> = {
  login:  { is: 'Innskráning', en: 'Login', color: 'bg-blue-100 text-blue-700' },
  create: { is: 'Búa til',     en: 'Create', color: 'bg-green-100 text-green-700' },
  update: { is: 'Uppfæra',     en: 'Update', color: 'bg-yellow-100 text-yellow-700' },
  delete: { is: 'Eyða',        en: 'Delete', color: 'bg-red-100 text-red-700' },
}

const ENTITY_LABELS: Record<string, { is: string; en: string }> = {
  user:     { is: 'Notandi',  en: 'User' },
  project:  { is: 'Verkefni', en: 'Project' },
  template: { is: 'Sniðmát',  en: 'Template' },
  product:  { is: 'Vara',     en: 'Product' },
}

const PAGE_SIZE = 25

export function AuditLogPage() {
  const { token } = useAuth()
  const { locale } = useTranslation()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [filterEntity, setFilterEntity] = useState('')
  const [exporting, setExporting] = useState(false)

  const fetchLog = useCallback(async () => {
    const apiUrl = getApiUrl()
    if (!apiUrl || !token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
      if (filterAction) params.set('action', filterAction)
      if (filterEntity) params.set('entity_type', filterEntity)
      const res = await fetch(`${apiUrl}/audit-log?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      setEntries(data.entries)
      setTotal(data.total)
    } catch (err) {
      console.error('Audit fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [token, offset, filterAction, filterEntity])

  useEffect(() => { fetchLog() }, [fetchLog])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  const lang = (labels: { is: string; en: string }) => locale === 'en' ? labels.en : labels.is

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const apiUrl = getApiUrl()
    if (!apiUrl || !token) return
    setExporting(true)
    try {
      // Fetch all entries matching current filters (up to 10000)
      const params = new URLSearchParams({ limit: '10000', offset: '0' })
      if (filterAction) params.set('action', filterAction)
      if (filterEntity) params.set('entity_type', filterEntity)
      const res = await fetch(`${apiUrl}/audit-log?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Export fetch failed')
      const data = await res.json()
      const allEntries: AuditEntry[] = data.entries

      const headers = [
        locale === 'en' ? 'Time' : 'Tími',
        locale === 'en' ? 'User' : 'Notandi',
        locale === 'en' ? 'Action' : 'Aðgerð',
        locale === 'en' ? 'Type' : 'Tegund',
        locale === 'en' ? 'Entity ID' : 'Auðkenni',
        locale === 'en' ? 'Details' : 'Upplýsingar',
        'IP',
      ]

      const rows = allEntries.map(entry => {
        const actionInfo = ACTION_LABELS[entry.action] || { is: entry.action, en: entry.action }
        const entityInfo = ENTITY_LABELS[entry.entity_type] || { is: entry.entity_type, en: entry.entity_type }
        const detailStr = entry.details && Object.keys(entry.details).length > 0
          ? Object.entries(entry.details)
              .filter(([, v]) => v !== undefined && v !== null)
              .map(([k, v]) => `${k}: ${v}`)
              .join('; ')
          : ''
        return [
          new Date(entry.created_at).toLocaleString(locale === 'en' ? 'en-GB' : 'is-IS', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
          entry.user_email,
          lang(actionInfo),
          lang(entityInfo),
          entry.entity_id || '',
          detailStr,
          entry.ip_address || '',
        ]
      })

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
      ws['!cols'] = [{ wch: 18 }, { wch: 25 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 40 }, { wch: 16 }]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Audit Log')

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      if (format === 'csv') {
        XLSX.writeFile(wb, `lanicad-audit-${dateStr}.csv`, { bookType: 'csv' })
      } else {
        XLSX.writeFile(wb, `lanicad-audit-${dateStr}.xlsx`)
      }
    } catch (err) {
      console.error('Audit export error:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">
          {locale === 'en' ? 'Audit Log' : 'Aðgerðaskrá'}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {total} {locale === 'en' ? 'entries' : 'færslur'}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || entries.length === 0}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              title={locale === 'en' ? 'Export CSV' : 'Flytja út CSV'}
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={exporting || entries.length === 0}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              title={locale === 'en' ? 'Export Excel' : 'Flytja út Excel'}
            >
              <Download className="h-3.5 w-3.5" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setOffset(0) }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          title="Sía eftir aðgerð"
        >
          <option value="">{locale === 'en' ? 'All actions' : 'Allar aðgerðir'}</option>
          {Object.entries(ACTION_LABELS).map(([key, l]) => (
            <option key={key} value={key}>{lang(l)}</option>
          ))}
        </select>
        <select
          value={filterEntity}
          onChange={e => { setFilterEntity(e.target.value); setOffset(0) }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          title="Sía eftir tegund"
        >
          <option value="">{locale === 'en' ? 'All types' : 'Allar tegundir'}</option>
          {Object.entries(ENTITY_LABELS).map(([key, l]) => (
            <option key={key} value={key}>{lang(l)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                {locale === 'en' ? 'Time' : 'Tími'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                {locale === 'en' ? 'User' : 'Notandi'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                {locale === 'en' ? 'Action' : 'Aðgerð'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                {locale === 'en' ? 'Type' : 'Tegund'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                {locale === 'en' ? 'Details' : 'Upplýsingar'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {locale === 'en' ? 'Loading...' : 'Hleð...'}
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {locale === 'en' ? 'No entries found' : 'Engar færslur fundust'}
                </td>
              </tr>
            ) : (
              entries.map(entry => {
                const actionInfo = ACTION_LABELS[entry.action] || { is: entry.action, en: entry.action, color: 'bg-gray-100 text-gray-700' }
                const entityInfo = ENTITY_LABELS[entry.entity_type] || { is: entry.entity_type, en: entry.entity_type }
                const detailStr = entry.details && Object.keys(entry.details).length > 0
                  ? Object.entries(entry.details)
                      .filter(([, v]) => v !== undefined && v !== null)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')
                  : '—'

                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {new Date(entry.created_at).toLocaleString(locale === 'en' ? 'en-GB' : 'is-IS', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{entry.user_email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${actionInfo.color}`}>
                        {lang(actionInfo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lang(entityInfo)}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-500" title={detailStr}>
                      {detailStr}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-400">
                      {entry.ip_address || '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            {locale === 'en' ? 'Previous' : 'Fyrri'}
          </button>
          <span className="text-sm text-gray-500">
            {locale === 'en' ? `Page ${currentPage} of ${totalPages}` : `Síða ${currentPage} af ${totalPages}`}
          </span>
          <button
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {locale === 'en' ? 'Next' : 'Næsta'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
