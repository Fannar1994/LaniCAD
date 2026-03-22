import { useRef } from 'react'
import * as THREE from 'three'

interface FenceModel3DProps {
  panels: number
  panelWidth: number  // meters
  panelHeight: number // meters
  includeGate?: boolean
}

const FRAME_R = 0.021   // 42mm OD frame tube
const WIRE_R = 0.002    // 4mm wire diameter
const FRAME_COLOR = '#888'
const WIRE_COLOR = '#aaa'

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

export function FenceModel3D({ panels, panelWidth, panelHeight, includeGate }: FenceModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const totalWidth = panels * panelWidth
  const offsetX = -totalWidth / 2

  return (
    <group ref={groupRef}>
      {/* Fence panels */}
      {Array.from({ length: panels }, (_, i) => {
        const x = offsetX + i * panelWidth
        const isGate = !!includeGate && i === panels - 1
        return <FencePanel key={i} x={x} panelWidth={panelWidth} panelHeight={panelHeight} isGate={isGate} />
      })}

      {/* Concrete base stones — N+1 for N panels */}
      {Array.from({ length: panels + 1 }, (_, i) => (
        <ConcreteBlock key={`stone_${i}`} position={[offsetX + i * panelWidth, 0, 0]} />
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[totalWidth + 4, 4]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
