/**
 * Interactive 3D scene builder for placing equipment on a construction site.
 * Users can place, select, move, rotate, and delete equipment objects.
 */
import { useRef, useCallback, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import * as THREE from 'three'
import type { Scene3DState, SceneObject, EquipmentKind } from '@/hooks/useScene3D'
import { FenceModel3D } from '@/components/viewer/models/FenceModel3D'
import { ScaffoldModel3D } from '@/components/viewer/models/ScaffoldModel3D'
import { RollingScaffoldModel3D } from '@/components/viewer/models/RollingScaffoldModel3D'
import { FormworkModel3D } from '@/components/viewer/models/FormworkModel3D'
import { CeilingPropsModel3D } from '@/components/viewer/models/CeilingPropsModel3D'
import { Box, Move3d, RotateCw, ZoomIn } from 'lucide-react'

/* ── Equipment renderer ── */
function EquipmentMesh({ kind, params }: { kind: EquipmentKind; params: Record<string, unknown> }) {
  switch (kind) {
    case 'fence':
      return <FenceModel3D
        panels={params.panels as number ?? 4}
        panelWidth={params.panelWidth as number ?? 3.5}
        panelHeight={params.panelHeight as number ?? 2.0}
        includeGate={params.includeGate as boolean ?? false}
      />
    case 'scaffold':
      return <ScaffoldModel3D
        length={params.length as number ?? 7.2}
        levels2m={params.levels2m as number ?? 2}
        levels07m={params.levels07m as number ?? 0}
        legType={params.legType as '50cm' | '100cm' ?? '50cm'}
      />
    case 'rolling':
      return <RollingScaffoldModel3D
        height={params.height as number ?? 6}
        width={params.width as 'narrow' | 'wide' ?? 'wide'}
      />
    case 'formwork':
      return <FormworkModel3D
        wallLength={params.wallLength as number ?? 4}
        wallHeight={params.wallHeight as number ?? 3}
        system={params.system as 'Rasto' | 'Takko' | 'Manto' ?? 'Rasto'}
      />
    case 'ceiling':
      return <CeilingPropsModel3D
        propCount={params.propCount as number ?? 3}
        propHeight={params.propHeight as number ?? 3}
        beamCount={params.beamCount as number ?? 2}
        roomWidth={params.roomWidth as number ?? 4}
      />
  }
}

/* ── Ground hitbox for click-to-place ── */
function GroundPlane({ onPlace }: { onPlace: (pos: [number, number, number]) => void }) {
  const mesh = useRef<THREE.Mesh>(null)
  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onClick={(e) => {
        e.stopPropagation()
        const p = e.point
        // Snap to 0.5m grid
        const x = Math.round(p.x * 2) / 2
        const z = Math.round(p.z * 2) / 2
        onPlace([x, 0, z])
      }}
      visible={false}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

/* ── Selectable / transformable scene object wrapper ── */
function SceneItem({
  obj,
  isSelected,
  mode,
  onSelect,
  onPositionChange,
  onRotationChange,
  orbitRef,
}: {
  obj: SceneObject
  isSelected: boolean
  mode: 'select' | 'place' | 'move' | 'rotate'
  onSelect: (id: string) => void
  onPositionChange: (id: string, pos: [number, number, number]) => void
  onRotationChange: (id: string, rot: [number, number, number]) => void
  orbitRef: React.RefObject<any>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const transformRef = useRef<any>(null)

  // Sync TransformControls dragging state with OrbitControls
  useEffect(() => {
    const tc = transformRef.current
    if (!tc || !orbitRef.current) return
    const onDragging = (event: { value: boolean }) => {
      if (orbitRef.current) orbitRef.current.enabled = !event.value
    }
    tc.addEventListener('dragging-changed', onDragging)
    return () => tc.removeEventListener('dragging-changed', onDragging)
  }, [isSelected, orbitRef])

  // Commit position/rotation after transform ends
  useEffect(() => {
    const tc = transformRef.current
    if (!tc) return
    const onMouseUp = () => {
      if (!groupRef.current) return
      const p = groupRef.current.position
      const r = groupRef.current.rotation
      onPositionChange(obj.id, [p.x, p.y, p.z])
      onRotationChange(obj.id, [r.x, r.y, r.z])
    }
    tc.addEventListener('mouseUp', onMouseUp)
    return () => tc.removeEventListener('mouseUp', onMouseUp)
  }, [isSelected, obj.id, onPositionChange, onRotationChange])

  const transformMode = mode === 'rotate' ? 'rotate' : 'translate'

  return (
    <>
      <group
        ref={groupRef}
        position={obj.position}
        rotation={obj.rotation}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(obj.id)
        }}
      >
        {/* Selection highlight bounding box */}
        {isSelected && (
          <mesh visible={false}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
          </mesh>
        )}
        <EquipmentMesh kind={obj.kind} params={obj.params} />
      </group>

      {/* TransformControls wrapped around the group */}
      {isSelected && (mode === 'move' || mode === 'rotate') && groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          mode={transformMode}
          translationSnap={0.5}
          rotationSnap={Math.PI / 12}
          size={0.8}
        />
      )}
    </>
  )
}

/* ── Camera setup ── */
function CameraSetup({ objectCount }: { objectCount: number }) {
  const { camera } = useThree()
  useEffect(() => {
    if (objectCount === 0) {
      camera.position.set(12, 8, 12)
      camera.lookAt(0, 0, 0)
    }
  }, [objectCount === 0]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/* ── Main canvas ── */
interface Scene3DCanvasProps {
  scene: Scene3DState
}

export function Scene3DCanvas({ scene }: Scene3DCanvasProps) {
  const orbitRef = useRef<any>(null)
  const [showHints, setShowHints] = useState(true)

  const handleGroundPlace = useCallback((pos: [number, number, number]) => {
    if (scene.mode === 'place') {
      scene.addObject(scene.placeKind, pos, scene.placeParams)
      // Stay in place mode for rapid placement
    } else if (scene.mode === 'select') {
      scene.selectObject(null)
    }
  }, [scene])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (scene.selectedId) scene.removeObject(scene.selectedId)
      }
      if (e.key === 'Escape') {
        scene.selectObject(null)
        scene.setMode('select')
      }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); scene.undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); scene.redo() }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        if (scene.selectedId) scene.duplicateObject(scene.selectedId)
      }
      // Mode shortcuts
      if (!e.ctrlKey && !e.altKey) {
        if (e.key === 'v') scene.setMode('select')
        if (e.key === 'g') scene.setMode('move')
        if (e.key === 'r') scene.setMode('rotate')
        if (e.key === 'p') scene.setMode('place')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [scene])

  return (
    <div className="relative w-full h-full">
      {/* Hints overlay */}
      {showHints && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 cursor-pointer rounded-lg"
          onClick={() => setShowHints(false)}
        >
          <div className="rounded-xl bg-white/95 px-6 py-4 shadow-lg text-center space-y-2 pointer-events-none">
            <p className="font-condensed text-sm font-semibold text-brand-dark">3D Verksvæði — smelltu til að byrja</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Box className="h-3.5 w-3.5" /> P = setja búnað</span>
              <span className="flex items-center gap-1"><Move3d className="h-3.5 w-3.5" /> G = færa</span>
              <span className="flex items-center gap-1"><RotateCw className="h-3.5 w-3.5" /> R = snúa</span>
              <span className="flex items-center gap-1"><ZoomIn className="h-3.5 w-3.5" /> Skrolla = aðdráttur</span>
            </div>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [12, 8, 12], fov: 50 }}
        shadows
        onPointerMissed={() => {
          if (scene.mode === 'select') scene.selectObject(null)
        }}
      >
        <CameraSetup objectCount={scene.objects.length} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

        <OrbitControls
          ref={orbitRef}
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.1}
          minDistance={2}
          maxDistance={80}
        />

        <Grid
          infiniteGrid
          fadeDistance={40}
          fadeStrength={3}
          cellSize={0.5}
          sectionSize={5}
          cellColor="#ddd"
          sectionColor="#bbb"
        />

        {/* Gizmo helper in corner */}
        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport />
        </GizmoHelper>

        {/* Invisible ground plane for click-to-place */}
        <GroundPlane onPlace={handleGroundPlace} />

        {/* Scene objects */}
        {scene.objects.map(obj => (
          <SceneItem
            key={obj.id}
            obj={obj}
            isSelected={obj.id === scene.selectedId}
            mode={scene.mode}
            onSelect={scene.selectObject}
            onPositionChange={scene.updatePosition}
            onRotationChange={scene.updateRotation}
            orbitRef={orbitRef}
          />
        ))}
      </Canvas>
    </div>
  )
}
