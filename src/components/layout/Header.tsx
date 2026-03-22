import { Menu } from 'lucide-react'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-dark"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent font-condensed font-bold text-brand-dark">
          LC
        </div>
        <span className="font-condensed text-lg font-bold text-brand-dark">
          LániCAD
        </span>
      </div>
    </header>
  )
}
