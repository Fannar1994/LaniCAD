export function ProjectsPage() {
  return (
    <div>
      <h1 className="font-condensed text-2xl font-bold text-brand-dark">Verkefni</h1>
      <p className="mt-2 text-sm text-gray-500">
        Hér birtast vistuð verkefni. Tengingu við Supabase gagnagrunn þarf að setja upp til að vista og sækja verkefni.
      </p>

      <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-sm text-gray-400">Engin verkefni enn</p>
        <p className="mt-1 text-xs text-gray-300">Byrjaðu nýtt verkefni í reiknivélum</p>
      </div>
    </div>
  )
}
