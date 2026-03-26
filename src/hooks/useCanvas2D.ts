/**
 * State management for interactive 2D canvas.
 * Manages placed objects with position, size, rotation.
 * Supports undo/redo, snap-to-grid, and bidirectional sync with forms.
 */
import { useState, useCallback, useRef } from 'react'
import { GRID } from '@/lib/geometry-config'

export interface CanvasObject {
  id: string
  type: 'prop' | 'beam' | 'panel' | 'stone' | 'post' | 'custom'
  label: string
  x: number          // meters
  y: number          // meters
  width: number      // meters
  height: number     // meters
  rotation: number   // degrees
  color: string
  locked?: boolean
  data?: Record<string, unknown>
}

export interface Canvas2DState {
  objects: CanvasObject[]
  selectedId: string | null
  tool: CanvasTool
  zoom: number
  panX: number
  panY: number
  gridSnap: boolean
  // Actions
  addObject: (obj: Omit<CanvasObject, 'id'>) => string
  removeObject: (id: string) => void
  updateObject: (id: string, updates: Partial<CanvasObject>) => void
  moveObject: (id: string, x: number, y: number) => void
  selectObject: (id: string | null) => void
  setTool: (tool: CanvasTool) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  toggleSnap: () => void
  duplicateObject: (id: string) => void
  clearAll: () => void
  setObjects: (objects: CanvasObject[]) => void
  // Undo/redo
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  // Snap helper
  snapToGrid: (value: number) => number
}

export type CanvasTool = 'select' | 'place' | 'pan'

let nextCanvasId = 1
function canvasId(): string {
  return `c2d_${nextCanvasId++}_${Date.now().toString(36)}`
}

const MAX_HISTORY = 40

export function useCanvas2D(): Canvas2DState {
  const [objects, setObjectsRaw] = useState<CanvasObject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<CanvasTool>('select')
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [gridSnap, setGridSnap] = useState(true)

  const historyRef = useRef<CanvasObject[][]>([])
  const futureRef = useRef<CanvasObject[][]>([])

  const pushHistory = useCallback((prev: CanvasObject[]) => {
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev]
    futureRef.current = []
  }, [])

  const snapToGrid = useCallback((value: number): number => {
    if (!gridSnap) return value
    const snap = GRID.snapIncrement
    return Math.round(value / snap) * snap
  }, [gridSnap])

  const addObject = useCallback((obj: Omit<CanvasObject, 'id'>) => {
    const id = canvasId()
    const newObj: CanvasObject = { ...obj, id }
    setObjectsRaw(prev => {
      pushHistory(prev)
      return [...prev, newObj]
    })
    setSelectedId(id)
    return id
  }, [pushHistory])

  const removeObject = useCallback((id: string) => {
    setObjectsRaw(prev => {
      pushHistory(prev)
      return prev.filter(o => o.id !== id)
    })
    setSelectedId(prev => prev === id ? null : prev)
  }, [pushHistory])

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    setObjectsRaw(prev => {
      pushHistory(prev)
      return prev.map(o => o.id === id ? { ...o, ...updates } : o)
    })
  }, [pushHistory])

  const moveObject = useCallback((id: string, x: number, y: number) => {
    const sx = snapToGrid(x)
    const sy = snapToGrid(y)
    setObjectsRaw(prev => prev.map(o => o.id === id ? { ...o, x: sx, y: sy } : o))
  }, [snapToGrid])

  const selectObject = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const duplicateObject = useCallback((id: string) => {
    setObjectsRaw(prev => {
      const src = prev.find(o => o.id === id)
      if (!src) return prev
      pushHistory(prev)
      const newId = canvasId()
      const dup: CanvasObject = {
        ...src,
        id: newId,
        x: src.x + 0.5,
        y: src.y + 0.5,
        label: `${src.label} (afrit)`,
      }
      setSelectedId(newId)
      return [...prev, dup]
    })
  }, [pushHistory])

  const clearAll = useCallback(() => {
    setObjectsRaw(prev => {
      pushHistory(prev)
      return []
    })
    setSelectedId(null)
  }, [pushHistory])

  const setObjects = useCallback((newObjects: CanvasObject[]) => {
    setObjectsRaw(prev => {
      pushHistory(prev)
      return newObjects
    })
  }, [pushHistory])

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setObjectsRaw(current => {
      futureRef.current = [...futureRef.current, current]
      return prev
    })
  }, [])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return
    const next = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)
    setObjectsRaw(current => {
      historyRef.current = [...historyRef.current, current]
      return next
    })
  }, [])

  const handleSetPan = useCallback((x: number, y: number) => {
    setPanX(x)
    setPanY(y)
  }, [])

  const toggleSnap = useCallback(() => {
    setGridSnap(prev => !prev)
  }, [])

  return {
    objects,
    selectedId,
    tool,
    zoom,
    panX,
    panY,
    gridSnap,
    addObject,
    removeObject,
    updateObject,
    moveObject,
    selectObject,
    setTool,
    setZoom,
    setPan: handleSetPan,
    toggleSnap,
    duplicateObject,
    clearAll,
    setObjects,
    undo,
    redo,
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    snapToGrid,
  }
}
