/**
 * Toolbar for the 3D scene builder mode.
 * Provides mode switching, object manipulation, and scene controls.
 */
import type { Scene3DState, EquipmentKind } from '@/hooks/useScene3D'
import {
  Pointer, Box, Move3d, RotateCw,
  Trash2, Copy, Undo2, Redo, XCircle,
} from 'lucide-react'

const MODES = [
  { key: 'select' as const, icon: Pointer, label: 'Velja (V)', shortcut: 'V' },
  { key: 'place' as const, icon: Box, label: 'Setja (P)', shortcut: 'P' },
  { key: 'move' as const, icon: Move3d, label: 'Færa (G)', shortcut: 'G' },
  { key: 'rotate' as const, icon: RotateCw, label: 'Snúa (R)', shortcut: 'R' },
]

const EQUIPMENT_OPTIONS: { value: EquipmentKind; label: string }[] = [
  { value: 'fence', label: 'Girðing' },
  { value: 'scaffold', label: 'Vinnupallur' },
  { value: 'rolling', label: 'Hjólapallur' },
  { value: 'formwork', label: 'Steypumót' },
  { value: 'ceiling', label: 'Loftastoðir' },
]

interface Scene3DToolbarProps {
  scene: Scene3DState
}

export function Scene3DToolbar({ scene }: Scene3DToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white border-b">
      {/* Mode buttons */}
      <div className="flex items-center rounded border border-gray-200 overflow-hidden">
        {MODES.map(m => {
          const Icon = m.icon
          const active = scene.mode === m.key
          return (
            <button
              key={m.key}
              onClick={() => scene.setMode(m.key)}
              title={m.label}
              className={`p-1.5 transition-colors ${active ? 'bg-[#404042] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Equipment type selector (for place mode) */}
      <select
        value={scene.placeKind}
        onChange={e => scene.setPlaceKind(e.target.value as EquipmentKind)}
        title="Tegund búnaðar til að setja"
        className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
      >
        {EQUIPMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Object actions */}
      <button
        onClick={() => scene.selectedId && scene.duplicateObject(scene.selectedId)}
        disabled={!scene.selectedId}
        title="Afrita (Ctrl+D)"
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        onClick={() => scene.selectedId && scene.removeObject(scene.selectedId)}
        disabled={!scene.selectedId}
        title="Eyða (Delete)"
        className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Undo / redo */}
      <button onClick={scene.undo} disabled={!scene.canUndo} title="Afturkalla (Ctrl+Z)"
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed">
        <Undo2 className="h-4 w-4" />
      </button>
      <button onClick={scene.redo} disabled={!scene.canRedo} title="Endurgera (Ctrl+Y)"
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed">
        <Redo className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Clear scene */}
      <button
        onClick={() => { if (scene.objects.length > 0) scene.clearAll() }}
        disabled={scene.objects.length === 0}
        title="Hreinsa allt"
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <XCircle className="h-4 w-4" />
      </button>

      {/* Status */}
      <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
        <span>{scene.objects.length} hlut{scene.objects.length !== 1 ? 'ir' : 'ur'}</span>
        {scene.selectedId && (
          <span className="text-brand-accent font-medium">
            {scene.objects.find(o => o.id === scene.selectedId)?.label}
          </span>
        )}
      </div>
    </div>
  )
}
