import { useState, useEffect } from 'react'
import { Calculator, FolderOpen, FileText, Box, Ruler, Building2, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchProjects, isApiConfigured } from '@/lib/db'
import type { Project } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  fence: 'Girðingar',
  scaffolding: 'Vinnupallar',
  formwork: 'Steypumót',
  rolling: 'Hjólapallar',
  ceiling: 'Loftastoðir',
}

const calculatorLinks = [
  { to: '/calculator/fence', icon: Calculator, label: 'Girðingar', desc: 'Vinnustaðagirðingar og aðgangsstýringar' },
  { to: '/calculator/scaffolding', icon: Box, label: 'Vinnupallar', desc: 'Layher Allround' },
  { to: '/calculator/formwork', icon: FileText, label: 'Steypumót', desc: 'Rasto/Takko, Manto, Alufort' },
  { to: '/calculator/rolling', icon: Wrench, label: 'Hjólapallar', desc: '1,35 mtr, 0,75 mtr. og quickly' },
  { to: '/calculator/ceiling', icon: Building2, label: 'Loftastoðir', desc: 'Stoðir og HT-20 bitar' },
]

const otherLinks = [
  { to: '/drawing', icon: Ruler, label: 'Teikningar', desc: '2D/3D teiknivél' },
  { to: '/projects', icon: FolderOpen, label: 'Verkefni', desc: 'Vistuð verkefni' },
]

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoadingProjects(false)
      return
    }
    fetchProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoadingProjects(false))
  }, [])

  const recentProjects = projects
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const typeCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">
          Velkomin í LániCAD
        </h1>
        <p className="mt-1 text-sm text-gray-500">
        Reiknivélar og teikningar fyrir grófvöru
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Verkefni samtals</div>
          <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">
            {loadingProjects ? '...' : projects.length}
          </div>
        </div>
        {Object.entries(typeCounts).slice(0, 3).map(([type, count]) => (
          <div key={type} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">{TYPE_LABELS[type] ?? type}</div>
            <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">{count}</div>
          </div>
        ))}
      </div>

      {/* Calculator quick links */}
      <h2 className="mb-4 font-condensed text-lg font-bold text-brand-dark">Reiknivélar</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {calculatorLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-brand-accent hover:shadow-md"
          >
            <link.icon className="mb-2 h-7 w-7 text-gray-400 group-hover:text-brand-accent" />
            <h3 className="font-condensed text-base font-semibold text-brand-dark">{link.label}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Other tools */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {otherLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-brand-accent hover:shadow-md"
          >
            <link.icon className="mb-2 h-7 w-7 text-gray-400 group-hover:text-brand-accent" />
            <h3 className="font-condensed text-base font-semibold text-brand-dark">{link.label}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="font-condensed text-lg font-bold text-brand-dark">Nýleg verkefni</h2>
        </div>
        {loadingProjects ? (
          <p className="p-5 text-sm text-gray-400">Hleð...</p>
        ) : recentProjects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">Engin verkefni enn</p>
            <p className="mt-1 text-xs text-gray-300">Vistaðu útreikning í reiknivél til að búa til verkefni</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentProjects.map(p => (
              <Link
                key={p.id}
                to={`/calculator/${p.type}`}
                state={{ project: { id: p.id, name: p.name, data: p.data, client: p.client } }}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
              >
                <div>
                  <div className="text-sm font-medium text-brand-dark">{p.name}</div>
                  <div className="text-xs text-gray-400">
                    {TYPE_LABELS[p.type] ?? p.type}
                    {p.client?.name ? ` · ${p.client.name}` : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(p.updated_at).toLocaleDateString('is-IS')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
