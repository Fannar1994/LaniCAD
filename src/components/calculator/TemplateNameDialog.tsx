import { useState, useRef, useEffect } from 'react'

interface Props {
  open: boolean
  defaultName: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function TemplateNameDialog({ open, defaultName, onConfirm, onCancel }: Props) {
  const [name, setName] = useState(defaultName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(defaultName)
      // Focus after render
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [open, defaultName])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-condensed text-lg font-semibold text-brand-dark">Vista sniðmát</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block text-sm font-medium text-gray-600">Heiti sniðmáts</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Hætta við
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover transition disabled:opacity-50"
            >
              Vista
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
