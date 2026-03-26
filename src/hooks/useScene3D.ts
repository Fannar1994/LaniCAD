/**
 * State management for interactive 3D scene builder.
 * Manages placed equipment objects with position, rotation, and parameters.
 */
import { useState, useCallback, useRef } from 'react'

export type EquipmentKind = 'fence' | 'scaffold' | 'rolling' | 'formwork' | 'ceiling' | 'protecto'

export interface SceneObject {
  id: string
  kind: EquipmentKind
  label: string
  position: [number, number, number]
  rotation: [number, number, number]  // euler angles in radians
  params: Record<string, unknown>
}

export type SceneMode = 'select' | 'place' | 'move' | 'rotate' | 'measure'

export interface Measurement {
  id: string
  start: [number, number, number]
  end: [number, number, number]
  distance: number
}

export interface Scene3DState {
  objects: SceneObject[]
  selectedId: string | null
  mode: SceneMode
  placeKind: EquipmentKind
  placeParams: Record<string, unknown>
  // Measurements
  measurements: Measurement[]
  measureStart: [number, number, number] | null
  // Ground & site
  showGround: boolean
  groundSize: number
  // Actions
  addObject: (kind: EquipmentKind, position: [number, number, number], params: Record<string, unknown>) => string
  removeObject: (id: string) => void
  updatePosition: (id: string, position: [number, number, number]) => void
  updateRotation: (id: string, rotation: [number, number, number]) => void
  updateParams: (id: string, params: Record<string, unknown>) => void
  selectObject: (id: string | null) => void
  setMode: (mode: SceneMode) => void
  setPlaceKind: (kind: EquipmentKind) => void
  setPlaceParams: (params: Record<string, unknown>) => void
  duplicateObject: (id: string) => void
  clearAll: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  // Measurement actions
  addMeasurePoint: (point: [number, number, number]) => void
  clearMeasurements: () => void
  removeMeasurement: (id: string) => void
  // Ground toggle
  toggleGround: () => void
}

let nextId = 1
function sceneId(): string {
  return `s3d_${nextId++}_${Date.now().toString(36)}`
}

const EQUIPMENT_LABELS: Record<EquipmentKind, string> = {
  fence: 'Girðing',
  scaffold: 'Vinnupallur',
  rolling: 'Hjólapallur',
  formwork: 'Steypumót',
  ceiling: 'Loftastoðir',
  protecto: 'Protecto öryggisgrind',
}

const DEFAULT_PARAMS: Record<EquipmentKind, Record<string, unknown>> = {
  fence: { panels: 4, panelWidth: 3.5, panelHeight: 2.0, includeGate: false },
  scaffold: { length: 7.2, levels2m: 2, levels07m: 0, legType: '50cm' },
  rolling: { height: 6, width: 'wide' },
  formwork: { wallLength: 4, wallHeight: 3, system: 'Rasto' },
  ceiling: { propCount: 3, propHeight: 3, beamCount: 2, roomWidth: 4 },
  protecto: { length: 8, height: 1.1, postSpacing: 2.0 },
}

const MAX_HISTORY = 30

export function useScene3D(): Scene3DState {
  const [objects, setObjects] = useState<SceneObject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<SceneMode>('select')
  const [placeKind, setPlaceKind] = useState<EquipmentKind>('scaffold')
  const [placeParams, setPlaceParams] = useState<Record<string, unknown>>(DEFAULT_PARAMS.scaffold)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [measureStart, setMeasureStart] = useState<[number, number, number] | null>(null)
  const [showGround, setShowGround] = useState(true)
  const [groundSize] = useState(40)

  // Undo/redo
  const historyRef = useRef<SceneObject[][]>([])
  const futureRef = useRef<SceneObject[][]>([])

  const pushHistory = useCallback((prev: SceneObject[]) => {
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), prev]
    futureRef.current = []
  }, [])

  const addObject = useCallback((kind: EquipmentKind, position: [number, number, number], params: Record<string, unknown>) => {
    const id = sceneId()
    const obj: SceneObject = {
      id,
      kind,
      label: `${EQUIPMENT_LABELS[kind]} ${nextId - 1}`,
      position,
      rotation: [0, 0, 0],
      params: { ...DEFAULT_PARAMS[kind], ...params },
    }
    setObjects(prev => {
      pushHistory(prev)
      return [...prev, obj]
    })
    setSelectedId(id)
    return id
  }, [pushHistory])

  const removeObject = useCallback((id: string) => {
    setObjects(prev => {
      pushHistory(prev)
      return prev.filter(o => o.id !== id)
    })
    setSelectedId(prev => prev === id ? null : prev)
  }, [pushHistory])

  const updatePosition = useCallback((id: string, position: [number, number, number]) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, position } : o))
  }, [])

  const updateRotation = useCallback((id: string, rotation: [number, number, number]) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, rotation } : o))
  }, [])

  const updateParams = useCallback((id: string, params: Record<string, unknown>) => {
    setObjects(prev => {
      pushHistory(prev)
      return prev.map(o => o.id === id ? { ...o, params: { ...o.params, ...params } } : o)
    })
  }, [pushHistory])

  const selectObject = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const duplicateObject = useCallback((id: string) => {
    setObjects(prev => {
      const src = prev.find(o => o.id === id)
      if (!src) return prev
      pushHistory(prev)
      const newId = sceneId()
      const dup: SceneObject = {
        ...src,
        id: newId,
        label: `${src.label} (afrit)`,
        position: [src.position[0] + 2, src.position[1], src.position[2] + 2],
      }
      setSelectedId(newId)
      return [...prev, dup]
    })
  }, [pushHistory])

  const clearAll = useCallback(() => {
    setObjects(prev => {
      pushHistory(prev)
      return []
    })
    setSelectedId(null)
  }, [pushHistory])

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setObjects(current => {
      futureRef.current = [...futureRef.current, current]
      return prev
    })
  }, [])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return
    const next = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)
    setObjects(current => {
      historyRef.current = [...historyRef.current, current]
      return next
    })
  }, [])

  const handleSetPlaceKind = useCallback((kind: EquipmentKind) => {
    setPlaceKind(kind)
    setPlaceParams(DEFAULT_PARAMS[kind])
  }, [])

  const addMeasurePoint = useCallback((point: [number, number, number]) => {
    if (!measureStart) {
      setMeasureStart(point)
    } else {
      const dx = point[0] - measureStart[0]
      const dy = point[1] - measureStart[1]
      const dz = point[2] - measureStart[2]
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      setMeasurements(prev => [...prev, {
        id: sceneId(),
        start: measureStart,
        end: point,
        distance,
      }])
      setMeasureStart(null)
    }
  }, [measureStart])

  const clearMeasurements = useCallback(() => {
    setMeasurements([])
    setMeasureStart(null)
  }, [])

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id))
  }, [])

  const toggleGround = useCallback(() => {
    setShowGround(prev => !prev)
  }, [])

  return {
    objects,
    selectedId,
    mode,
    placeKind,
    placeParams,
    addObject,
    removeObject,
    updatePosition,
    updateRotation,
    updateParams,
    selectObject,
    setMode,
    setPlaceKind: handleSetPlaceKind,
    setPlaceParams,
    duplicateObject,
    clearAll,
    undo,
    redo,
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    // Measurements
    measurements,
    measureStart,
    addMeasurePoint,
    clearMeasurements,
    removeMeasurement,
    // Ground
    showGround,
    groundSize,
    toggleGround,
  }
}
