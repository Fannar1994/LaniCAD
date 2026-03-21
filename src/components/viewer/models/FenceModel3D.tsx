import { useRef } from 'react'

import * as THREE from 'three'

interface FenceModel3DProps {
  panels: number
  panelWidth: number  // meters
  panelHeight: number // meters
  includeGate?: boolean
}

function Tube({ start, end, radius = 0.02, color = '#666' }: {
  start: [number, number, number]
  end: [number, number, number]
  radius?: number
  color?: string
}) {
  const dir = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2])
  const length = dir.length()
  dir.normalize()
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ]
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir,
  )

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
  )
}

function Stone({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.35, 0.15, 0.22]} />
      <meshStandardMaterial color="#999" roughness={0.8} />
    </mesh>
  )
}

export function FenceModel3D({ panels, panelWidth, panelHeight, includeGate }: FenceModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Center the fence
  const totalWidth = panels * panelWidth
  const offsetX = -totalWidth / 2

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {Array.from({ length: panels }, (_, i) => {
        const x = offsetX + i * panelWidth
        const isGate = includeGate && i === panels - 1

        return (
          <group key={i}>
            {/* Panel mesh (grid pattern) */}
            {!isGate && (
              <mesh position={[x + panelWidth / 2, panelHeight / 2, 0]}>
                <planeGeometry args={[panelWidth - 0.05, panelHeight - 0.05]} />
                <meshStandardMaterial
                  color="#b0b0b0"
                  metalness={0.4}
                  roughness={0.5}
                  side={THREE.DoubleSide}
                  wireframe
                />
              </mesh>
            )}

            {/* Panel frame */}
            <Tube start={[x, 0, 0]} end={[x, panelHeight, 0]} radius={0.024} color="#777" />
            <Tube start={[x + panelWidth, 0, 0]} end={[x + panelWidth, panelHeight, 0]} radius={0.024} color="#777" />
            <Tube start={[x, panelHeight, 0]} end={[x + panelWidth, panelHeight, 0]} radius={0.024} color="#777" />
            <Tube start={[x, 0, 0]} end={[x + panelWidth, 0, 0]} radius={0.024} color="#777" />

            {/* Mid horizontal bar */}
            <Tube start={[x, panelHeight / 2, 0]} end={[x + panelWidth, panelHeight / 2, 0]} radius={0.015} color="#888" />

            {/* Gate arc indicator */}
            {isGate && (
              <mesh position={[x + panelWidth / 2, panelHeight / 2, 0]}>
                <planeGeometry args={[panelWidth * 0.9, panelHeight * 0.9]} />
                <meshStandardMaterial color="#f5c800" transparent opacity={0.3} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Stones at bases */}
      {Array.from({ length: panels + 1 }, (_, i) => (
        <Stone key={`stone_${i}`} position={[offsetX + i * panelWidth, 0.075, 0]} />
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[totalWidth + 4, 4]} />
        <meshStandardMaterial color="#e8e8e8" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
