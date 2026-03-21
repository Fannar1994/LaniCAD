import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ExternalLink } from 'lucide-react'
import { isApiConfigured, fetchProjects, deleteProject } from '@/lib/db'
import type { Project } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  fence: 'Girðingar',
  scaffolding: 'Vinnupallar',
  formwork: 'Steypumót',
  rolling: 'Hjólapallar',
  ceiling: 'Loftastoðir',
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProjects()
      setProjects(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Villa við að sækja verkefni')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eyða verkefni „${name}"?`)) return
    try {
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Villa við að eyða')
    }
  }

  if (!isApiConfigured) {
    return (
      <div>
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Verkefni</h1>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-medium text-amber-800">Gagnagrunnur ekki tengdur</h2>
          <p className="mt-1 text-sm text-amber-700">
            Settu upp PostgreSQL og Express þjón til að vista verkefni. Sjá <code className="rounded bg-amber-100 px-1">server/</code> möppu.
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-amber-700">
            <li>Settu upp PostgreSQL gagnagrunn</li>
            <li>Keyrðu <code className="rounded bg-amber-100 px-1">server/schema.sql</code> á gagnagrunninn</li>
            <li>Afritaðu <code className="rounded bg-amber-100 px-1">server/.env.example</code> → <code className="rounded bg-amber-100 px-1">server/.env</code></li>
            <li>Keyrðu <code className="rounded bg-amber-100 px-1">cd server && npm install && npm run dev</code></li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Verkefni</h1>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-gray-400">Hleð verkefnum...</p>
      ) : projects.length === 0 ? (
        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-400">Engin verkefni enn</p>
          <p className="mt-1 text-xs text-gray-300">Byrjaðu nýtt verkefni í reiknivélum</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Heiti</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Tegund</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Viðskiptavinur</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Uppfært</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">{TYPE_LABELS[p.type] ?? p.type}</td>
                  <td className="px-5 py-3 text-gray-500">{p.client?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(p.updated_at).toLocaleDateString('is-IS')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/calculator/${p.type}`}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-dark"
                        title="Opna"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
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
