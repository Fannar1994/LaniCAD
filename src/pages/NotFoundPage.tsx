import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="font-condensed text-8xl font-bold text-gray-200">404</div>
      <h1 className="mt-4 font-condensed text-2xl font-bold text-brand-dark">
        Síða fannst ekki
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Þessi síða er ekki til eða hefur verið fjarlægð.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Til baka
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-brand-dark hover:bg-yellow-400"
        >
          <Home className="h-4 w-4" />
          Upphafssíða
        </Link>
      </div>
    </div>
  )
}
