import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Eye, X, Loader2 } from 'lucide-react'
import { loadPdf, renderPdfPage, type PdfPage, type PdfImportResult } from '@/lib/pdf-import'

interface PdfImportDialogProps {
  open: boolean
  onClose: () => void
  onImport: (result: PdfImportResult) => void
}

export function PdfImportDialog({ open, onClose, onImport }: PdfImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PdfPage[]>([])
  const [selectedPage, setSelectedPage] = useState(1)
  const [runOcr, setRunOcr] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !f.name.toLowerCase().endsWith('.pdf')) return
    setFile(f)
    setStatus('Hleð inn PDF...')
    setLoading(true)
    try {
      const info = await loadPdf(f)
      setPages(info.pages)
      setSelectedPage(1)
      setStatus(`${info.pageCount} síður fundnar`)
    } catch {
      setStatus('Villa við lestur PDF')
    }
    setLoading(false)
  }, [])

  const handlePreview = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setStatus('Teikna forskoðun...')
    try {
      const result = await renderPdfPage(file, selectedPage, { scale: 1, runOcr: false })
      setPreview(result.imageDataUrl)
      setStatus('Forskoðun tilbúin')
    } catch {
      setStatus('Villa við forskoðun')
    }
    setLoading(false)
  }, [file, selectedPage])

  const handleImport = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setStatus(runOcr ? 'Flyt inn og keyri OCR...' : 'Flyt inn síðu...')
    try {
      const result = await renderPdfPage(file, selectedPage, { scale: 2, runOcr })
      onImport(result)
      onClose()
    } catch {
      setStatus('Villa við innflutning')
    }
    setLoading(false)
  }, [file, selectedPage, runOcr, onImport, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-bold text-brand-dark flex items-center gap-2">
            <FileText size={16} /> Flytja inn PDF
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded"><X size={16} /></button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* File picker */}
          <div>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded text-sm hover:bg-gray-700 transition-colors">
              <Upload size={14} /> Veldu PDF skrá
            </button>
            {file && <span className="ml-3 text-xs text-gray-600">{file.name}</span>}
          </div>

          {/* Page selector */}
          {pages.length > 0 && (
            <div className="flex items-center gap-4">
              <label className="text-xs text-gray-600">
                Síða:
                <select value={selectedPage} onChange={e => { setSelectedPage(Number(e.target.value)); setPreview(null) }}
                  className="ml-2 rounded border px-2 py-1 text-xs">
                  {pages.map(p => (
                    <option key={p.pageNum} value={p.pageNum}>
                      {p.pageNum} ({Math.round(p.width)}×{Math.round(p.height)})
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={handlePreview} disabled={loading}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                <Eye size={12} /> Forskoðun
              </button>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="border rounded bg-gray-50 p-2 max-h-[300px] overflow-auto">
              <img src={preview} alt="PDF forskoðun" className="max-w-full" />
            </div>
          )}

          {/* OCR toggle */}
          {pages.length > 0 && (
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input type="checkbox" checked={runOcr} onChange={e => setRunOcr(e.target.checked)}
                className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent" />
              Keyra OCR textalestur (Tesseract.js — íslenska + enska)
            </label>
          )}

          {/* Status */}
          {status && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {loading && <Loader2 size={12} className="animate-spin" />}
              {status}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded">
            Hætta við
          </button>
          <button onClick={handleImport} disabled={!file || pages.length === 0 || loading}
            className="px-4 py-1.5 text-xs bg-brand-accent text-brand-dark font-medium rounded hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Hleð...' : 'Flytja inn'}
          </button>
        </div>
      </div>
    </div>
  )
}
