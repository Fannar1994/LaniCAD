/**
 * Scene object list panel for the 3D scene builder right sidebar.
 * Shows all placed objects with selection, visibility, and quick actions.
 */
import type { Scene3DState } from '@/hooks/useScene3D'
import { Trash2, Copy, PackageOpen } from 'lucide-react'

const KIND_ICONS: Record<string, string> = {
  fence: '🚧',
  scaffold: '🏗️',
  rolling: '🛞',
  formwork: '🧱',
  ceiling: '📐',
}

interface Scene3DObjectListProps {
  scene: Scene3DState
}

export function Scene3DObjectList({ scene }: Scene3DObjectListProps) {
  if (scene.objects.length === 0) {
    return (
      <div className="px-3 py-4">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Hlutir</h3>
        <div className="flex flex-col items-center text-center py-6 text-gray-400">
          <PackageOpen className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs">Engin hlutir á verksvæði</p>
          <p className="text-xs mt-1">
            Veldu <strong>Setja</strong> ham og smelltu á flötina
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-3">
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
        Hlutir ({scene.objects.length})
      </h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {scene.objects.map(obj => {
          const selected = obj.id === scene.selectedId
          return (
            <div
              key={obj.id}
              onClick={() => scene.selectObject(obj.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors group
                ${selected ? 'bg-brand-accent/20 border border-brand-accent' : 'hover:bg-gray-100 border border-transparent'}`}
            >
              <span className="text-sm">{KIND_ICONS[obj.kind] || '📦'}</span>
              <span className={`flex-1 truncate ${selected ? 'font-semibold text-brand-dark' : 'text-gray-700'}`}>
                {obj.label}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); scene.duplicateObject(obj.id) }}
                  title="Afrita"
                  className="p-0.5 text-gray-400 hover:text-gray-700 rounded"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); scene.removeObject(obj.id) }}
                  title="Eyða"
                  className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected object position info */}
      {scene.selectedId && (() => {
        const obj = scene.objects.find(o => o.id === scene.selectedId)
        if (!obj) return null
        return (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Staðsetning</span>
              <span className="font-mono">{obj.position.map(v => v.toFixed(1)).join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Snúningur</span>
              <span className="font-mono">{obj.rotation.map(v => (v * 180 / Math.PI).toFixed(0) + '°').join(', ')}</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
