import { useState } from 'react'
import { FileText, ExternalLink, ChevronLeft } from 'lucide-react'

interface SchematicFile {
  name: string
  file: string
  type: string
  date: string
  code: string
}

const schematics: SchematicFile[] = [
  { name: 'BUR AD-0373', file: 'BUR_2000-06-29_AD-0373.pdf', type: 'BUR', date: '29.06.2000', code: 'AD-0373' },
  { name: 'SER AB-1304', file: 'SER_1996-01-23_AB-1304.pdf', type: 'SER', date: '23.01.1996', code: 'AB-1304' },
  { name: 'SER AB-1305', file: 'SER_1996-01-23_AB-1305.pdf', type: 'SER', date: '23.01.1996', code: 'AB-1305' },
  { name: 'SER AB-4311', file: 'SER_2000-06-29_AB-4311.pdf', type: 'SER', date: '29.06.2000', code: 'AB-4311' },
  { name: 'SER AB-4312', file: 'SER_2000-06-29_AB-4312.pdf', type: 'SER', date: '29.06.2000', code: 'AB-4312' },
  { name: 'SER AB-7723', file: 'SER_2000-09-12_AB-7723.pdf', type: 'SER', date: '12.09.2000', code: 'AB-7723' },
]

export function SchematicsPage() {
  const [selected, setSelected] = useState<SchematicFile | null>(null)

  if (selected) {
    const pdfUrl = `${import.meta.env.BASE_URL}schematics/${selected.file}`
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-dark transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Til baka
          </button>
          <h2 className="text-lg font-condensed font-bold text-brand-dark">{selected.name}</h2>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-sm text-brand-dark hover:text-brand-accent transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Opna í nýjum flipa
          </a>
        </div>
        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100 min-h-[600px]">
          <iframe
            src={pdfUrl}
            title={selected.name}
            className="w-full h-full min-h-[600px]"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-condensed font-bold text-brand-dark">Teikningar / Skýringar</h1>
        <p className="text-sm text-gray-500 mt-1">Upprunaleg BUR/SER byggingarskjöl</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {schematics.map(s => (
          <button
            key={s.code}
            onClick={() => setSelected(s)}
            className="flex items-start gap-4 rounded-lg border bg-white p-4 text-left transition-colors hover:border-brand-accent hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-500 flex-shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-brand-dark truncate">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{s.type} — {s.date}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.file}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
