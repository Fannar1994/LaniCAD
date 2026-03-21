import { Calculator, FolderOpen, FileText, Box } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

const quickLinks = [
  { to: '/calculator/fence', icon: Calculator, label: 'Girðingar', desc: 'Reiknivél fyrir girðingar' },
  { to: '/calculator/scaffolding', icon: Box, label: 'Vinnupallar', desc: 'Reiknivél fyrir vinnupalla' },
  { to: '/calculator/formwork', icon: FileText, label: 'Steypumót', desc: 'Rasto-Takko, Manto, Alufort' },
  { to: '/projects', icon: FolderOpen, label: 'Verkefni', desc: 'Vistuð verkefni' },
]

export function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">
          Velkomin, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          BYKO Leiga — LániCAD
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-accent hover:shadow-md"
          >
            <link.icon className="mb-3 h-8 w-8 text-gray-400 group-hover:text-brand-accent" />
            <h3 className="font-condensed text-lg font-semibold text-brand-dark">
              {link.label}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-condensed text-lg font-bold text-brand-dark">
          Nýlegar uppfærslur
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          LániCAD v0.1.0 — Grunnur settur upp. Reiknivélar fyrir girðingar, vinnupalla,
          steypumót, hjólapalla og loftastoðir eru í undirbúningi.
        </p>
      </div>
    </div>
  )
}
