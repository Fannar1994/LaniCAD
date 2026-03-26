import { useRef } from 'react'
import * as THREE from 'three'
import { FENCE } from '@/lib/geometry-config'

export type FenceStyle3D = 'standard' | 'plastic' | 'queue' | 'warning'

interface FenceModel3DProps {
  panels: number
  panelWidth: number  // meters
  panelHeight: number // meters
  includeGate?: boolean
  fenceStyle?: FenceStyle3D
}

const FRAME_R = FENCE.frameRadius
const WIRE_R = FENCE.wireRadius
const FRAME_COLOR = FENCE.colors.frame
const WIRE_COLOR = FENCE.colors.wire

function Tube({ start, end, radius = FRAME_R, color = FRAME_COLOR }: {
  start: [number, number, number]
  end: [number, number, number]
  radius?: number
  color?: string
}) {
  const dir = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2])
  const length = dir.length()
  if (length < 0.001) return null
  dir.normalize()
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ]
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
  )
}

function ConcreteBlock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main concrete block body */}
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[0.35, 0.15, 0.22]} />
        <meshStandardMaterial color="#999" roughness={0.9} />
      </mesh>
      {/* Slot for fence post (groove on top) */}
      <mesh position={[0, 0.155, 0]}>
        <boxGeometry args={[0.06, 0.01, 0.22]} />
        <meshStandardMaterial color="#777" roughness={0.9} />
      </mesh>
    </group>
  )
}

function FencePanel({ x, panelWidth, panelHeight, isGate }: {
  x: number; panelWidth: number; panelHeight: number; isGate: boolean
}) {
  // Mesh wire parameters
  const wireHSpacing = 0.05   // 50mm horizontal wire spacing
  const wireVSpacing = 0.20   // 200mm vertical wire spacing  
  const insetX = 0.03         // inset from frame edge
  const insetY = 0.05         // inset from top/bottom frames

  const innerW = panelWidth - 2 * insetX
  const innerH = panelHeight - 2 * insetY
  const hWires = Math.floor(innerH / wireHSpacing)
  const vWires = Math.floor(innerW / wireVSpacing)

  return (
    <group>
      {/* === FRAME TUBES === */}
      {/* Left vertical post */}
      <Tube start={[x, 0, 0]} end={[x, panelHeight, 0]} />
      {/* Right vertical post */}
      <Tube start={[x + panelWidth, 0, 0]} end={[x + panelWidth, panelHeight, 0]} />
      {/* Top horizontal rail */}
      <Tube start={[x, panelHeight, 0]} end={[x + panelWidth, panelHeight, 0]} />
      {/* Bottom horizontal rail */}
      <Tube start={[x, insetY * 0.5, 0]} end={[x + panelWidth, insetY * 0.5, 0]} />
      {/* Anti-climb return at top (bent inward tube) */}
      <Tube start={[x, panelHeight, 0]} end={[x, panelHeight - 0.03, -0.03]} radius={0.015} />
      <Tube start={[x + panelWidth, panelHeight, 0]} end={[x + panelWidth, panelHeight - 0.03, -0.03]} radius={0.015} />
      <Tube start={[x, panelHeight - 0.03, -0.03]} end={[x + panelWidth, panelHeight - 0.03, -0.03]} radius={0.015} />

      {/* Mid horizontal stiffener */}
      <Tube start={[x, panelHeight * 0.5, 0]} end={[x + panelWidth, panelHeight * 0.5, 0]} radius={0.015} color="#888" />

      {/* === WELDED MESH WIRES === */}
      {!isGate && (
        <>
          {/* Horizontal wires */}
          {Array.from({ length: hWires }, (_, i) => {
            const wy = insetY + i * wireHSpacing
            return (
              <Tube
                key={`hw_${i}`}
                start={[x + insetX, wy, 0]}
                end={[x + panelWidth - insetX, wy, 0]}
                radius={WIRE_R}
                color={WIRE_COLOR}
              />
            )
          })}
          {/* Vertical wires */}
          {Array.from({ length: vWires }, (_, i) => {
            const wx = x + insetX + (i + 1) * wireVSpacing
            if (wx >= x + panelWidth - insetX) return null
            return (
              <Tube
                key={`vw_${i}`}
                start={[wx, insetY, 0]}
                end={[wx, panelHeight - insetY, 0]}
                radius={WIRE_R}
                color={WIRE_COLOR}
              />
            )
          })}
        </>
      )}

      {/* === GATE indicator === */}
      {isGate && (
        <group>
          {/* Gate frame (slightly inset) */}
          <Tube start={[x + 0.1, 0.15, 0]} end={[x + 0.1, panelHeight - 0.1, 0]} color="#f5c800" />
          <Tube start={[x + panelWidth - 0.1, 0.15, 0]} end={[x + panelWidth - 0.1, panelHeight - 0.1, 0]} color="#f5c800" />
          <Tube start={[x + 0.1, panelHeight - 0.1, 0]} end={[x + panelWidth - 0.1, panelHeight - 0.1, 0]} color="#f5c800" />
          {/* Gate mesh (sparser) */}
          {Array.from({ length: Math.floor(hWires / 2) }, (_, i) => {
            const wy = insetY + i * wireHSpacing * 2
            return (
              <Tube key={`ghw_${i}`} start={[x + 0.15, wy, 0]} end={[x + panelWidth - 0.15, wy, 0]} radius={WIRE_R} color="#d4a800" />
            )
          })}
          {/* Hinge pins */}
          <mesh position={[x + 0.05, panelHeight * 0.3, 0.02]}>
            <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} />
            <meshStandardMaterial color="#555" metalness={0.7} />
          </mesh>
          <mesh position={[x + 0.05, panelHeight * 0.7, 0.02]}>
            <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} />
            <meshStandardMaterial color="#555" metalness={0.7} />
          </mesh>
        </group>
      )}

      {/* === CLAMP at top connecting to neighbor === */}
      <mesh position={[x + panelWidth, panelHeight * 0.75, 0]}>
        <boxGeometry args={[0.06, 0.04, 0.04]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>
    </group>
  )
}

/** Plastic barrier panel — solid orange/yellow body */
function PlasticPanel({ x, panelWidth, panelHeight }: {
  x: number; panelWidth: number; panelHeight: number
}) {
  return (
    <group>
      {/* Solid plastic body */}
      <mesh position={[x + panelWidth / 2, panelHeight / 2, 0]}>
        <boxGeometry args={[panelWidth - 0.01, panelHeight - 0.02, 0.06]} />
        <meshStandardMaterial color="#e87020" roughness={0.8} />
      </mesh>
      {/* Top rail */}
      <mesh position={[x + panelWidth / 2, panelHeight - 0.025, 0]}>
        <boxGeometry args={[panelWidth, 0.05, 0.07]} />
        <meshStandardMaterial color="#cc5500" roughness={0.7} />
      </mesh>
      {/* Bottom rail */}
      <mesh position={[x + panelWidth / 2, 0.025, 0]}>
        <boxGeometry args={[panelWidth, 0.05, 0.07]} />
        <meshStandardMaterial color="#cc5500" roughness={0.7} />
      </mesh>
      {/* Left post */}
      <Tube start={[x + 0.02, 0, 0]} end={[x + 0.02, panelHeight, 0]} radius={0.02} color="#cc5500" />
      {/* Right post */}
      <Tube start={[x + panelWidth - 0.02, 0, 0]} end={[x + panelWidth - 0.02, panelHeight, 0]} radius={0.02} color="#cc5500" />
    </group>
  )
}

/** Queue barrier — two horizontal rails between posts */
function QueuePanel({ x, panelWidth, panelHeight }: {
  x: number; panelWidth: number; panelHeight: number
}) {
  return (
    <group>
      {/* Left post */}
      <Tube start={[x, 0, 0]} end={[x, panelHeight, 0]} radius={FRAME_R} />
      {/* Right post */}
      <Tube start={[x + panelWidth, 0, 0]} end={[x + panelWidth, panelHeight, 0]} radius={FRAME_R} />
      {/* Top rail */}
      <Tube start={[x, panelHeight * 0.9, 0]} end={[x + panelWidth, panelHeight * 0.9, 0]} radius={0.015} color="#f5c800" />
      {/* Mid rail */}
      <Tube start={[x, panelHeight * 0.5, 0]} end={[x + panelWidth, panelHeight * 0.5, 0]} radius={0.015} color="#f5c800" />
      {/* Bottom rail */}
      <Tube start={[x, panelHeight * 0.15, 0]} end={[x + panelWidth, panelHeight * 0.15, 0]} radius={0.012} color="#999" />
    </group>
  )
}

/** Warning sign panel — thin sign board */
function WarningPanel({ x, panelWidth, panelHeight }: {
  x: number; panelWidth: number; panelHeight: number
}) {
  return (
    <group>
      {/* Sign board — red/white */}
      <mesh position={[x + panelWidth / 2, panelHeight * 0.7, 0]}>
        <boxGeometry args={[panelWidth * 0.9, panelHeight * 0.4, 0.015]} />
        <meshStandardMaterial color="#cc2200" roughness={0.6} />
      </mesh>
      {/* White stripe on sign */}
      <mesh position={[x + panelWidth / 2, panelHeight * 0.7, 0.009]}>
        <boxGeometry args={[panelWidth * 0.8, panelHeight * 0.15, 0.002]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* Support post */}
      <Tube start={[x + panelWidth / 2, 0, 0]} end={[x + panelWidth / 2, panelHeight, 0]} radius={0.015} color="#666" />
    </group>
  )
}

/** Plastic/rubber weighted base */
function PlasticBase({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1] + 0.05, position[2]]}>
      <boxGeometry args={[0.4, 0.1, 0.3]} />
      <meshStandardMaterial color="#555" roughness={0.9} />
    </mesh>
  )
}

export function FenceModel3D({ panels, panelWidth, panelHeight, includeGate, fenceStyle = 'standard' }: FenceModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const totalWidth = panels * panelWidth
  const offsetX = -totalWidth / 2

  return (
    <group ref={groupRef}>
      {/* Fence panels */}
      {Array.from({ length: panels }, (_, i) => {
        const x = offsetX + i * panelWidth
        const isGate = !!includeGate && i === panels - 1 && fenceStyle === 'standard'
        switch (fenceStyle) {
          case 'plastic':
            return <PlasticPanel key={i} x={x} panelWidth={panelWidth} panelHeight={panelHeight} />
          case 'queue':
            return <QueuePanel key={i} x={x} panelWidth={panelWidth} panelHeight={panelHeight} />
          case 'warning':
            return <WarningPanel key={i} x={x} panelWidth={panelWidth} panelHeight={panelHeight} />
          default:
            return <FencePanel key={i} x={x} panelWidth={panelWidth} panelHeight={panelHeight} isGate={isGate} />
        }
      })}

      {/* Base stones/feet */}
      {fenceStyle !== 'warning' && Array.from({ length: panels + 1 }, (_, i) => {
        const pos: [number, number, number] = [offsetX + i * panelWidth, 0, 0]
        return fenceStyle === 'plastic' || fenceStyle === 'queue'
          ? <PlasticBase key={`base_${i}`} position={pos} />
          : <ConcreteBlock key={`stone_${i}`} position={pos} />
      })}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[totalWidth + 4, 4]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
