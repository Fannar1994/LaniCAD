import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ExternalLink, Layers } from 'lucide-react'
import { isApiConfigured, fetchTemplates, deleteTemplate } from '@/lib/db'
import type { Template } from '@/lib/db'
import type { CalculatorType } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  fence: 'Girðingar',
  scaffolding: 'Vinnupallar',
  formwork: 'Steypumót',
  rolling: 'Hjólapallar',
  ceiling: 'Loftastoðir',
}

const CALCULATOR_TYPES: { value: CalculatorType; label: string }[] = [
  { value: 'fence', label: 'Girðingar' },
  { value: 'scaffolding', label: 'Vinnupallar' },
  { value: 'formwork', label: 'Steypumót' },
  { value: 'rolling', label: 'Hjólapallar' },
  { value: 'ceiling', label: 'Loftastoðir' },
]

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<CalculatorType | ''>('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTemplates(filterType || undefined)
      setTemplates(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Villa við að sækja sniðmát')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eyða sniðmáti „${name}"?`)) return
    try {
      await deleteTemplate(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Villa við að eyða')
    }
  }

  if (!isApiConfigured) {
    return (
      <div>
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Sniðmát</h1>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-medium text-amber-800">Gagnagrunnur ekki tengdur</h2>
          <p className="mt-1 text-sm text-amber-700">
            Settu upp PostgreSQL og Express þjón til að nota sniðmát.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Sniðmát</h1>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as CalculatorType | '')}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
        >
          <option value="">Allar tegundir</option>
          {CALCULATOR_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Hleð sniðmátum...</p>
      ) : templates.length === 0 ? (
        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">Engin sniðmát enn</p>
          <p className="mt-1 text-xs text-gray-300">
            Vistaðu sniðmát úr reiknivélum til að endurnýta stillingar
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Heiti</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Tegund</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Lýsing</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Opinbert</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Búið til</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{t.name}</td>
                  <td className="px-5 py-3 text-gray-500">{TYPE_LABELS[t.type] ?? t.type}</td>
                  <td className="px-5 py-3 text-gray-500">{t.description || '—'}</td>
                  <td className="px-5 py-3">
                    {t.is_public ? (
                      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Já</span>
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Nei</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {new Date(t.created_at).toLocaleDateString('is-IS')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/calculator/${t.type}`}
                        state={{ template: { id: t.id, name: t.name, config: t.config } }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-dark"
                        title="Hlaða inn"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Eyða"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
