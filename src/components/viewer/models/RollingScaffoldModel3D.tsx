import { useRef } from 'react'
import * as THREE from 'three'

interface RollingScaffoldModel3DProps {
  height: number  // platform height in meters
  width: 'narrow' | 'wide'
}

const TUBE_R = 0.024
const TUBE_COLOR = '#888'

function Tube({ start, end, color = TUBE_COLOR }: {
  start: [number, number, number]
  end: [number, number, number]
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
      <cylinderGeometry args={[TUBE_R, TUBE_R, length, 8]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      {/* Axle */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>
    </group>
  )
}

export function RollingScaffoldModel3D({ height, width }: RollingScaffoldModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const baseW = width === 'narrow' ? 0.75 : 1.35
  const baseL = 2.5 // length along Z axis
  const totalH = height + 1.0 // +1m for rails

  const hw = baseW / 2
  const hl = baseL / 2

  // Uprights at 4 corners
  const corners: [number, number][] = [[-hw, -hl], [hw, -hl], [hw, hl], [-hw, hl]]

  return (
    <group ref={groupRef}>
      {/* Wheels */}
      {corners.map(([x, z], i) => (
        <Wheel key={`wheel_${i}`} position={[x, 0.1, z]} />
      ))}

      {/* Vertical uprights */}
      {corners.map(([x, z], i) => (
        <Tube key={`up_${i}`} start={[x, 0.25, z]} end={[x, totalH, z]} />
      ))}

      {/* Horizontal braces every 2m */}
      {Array.from({ length: Math.ceil(height / 2) + 1 }, (_, l) => {
        const y = 0.25 + l * 2
        if (y > totalH) return null
        return (
          <group key={`level_${l}`}>
            {/* Short sides */}
            <Tube start={[-hw, y, -hl]} end={[hw, y, -hl]} />
            <Tube start={[-hw, y, hl]} end={[hw, y, hl]} />
            {/* Long sides */}
            <Tube start={[-hw, y, -hl]} end={[-hw, y, hl]} />
            <Tube start={[hw, y, -hl]} end={[hw, y, hl]} />
          </group>
        )
      })}

      {/* Diagonal braces on long sides */}
      {Array.from({ length: Math.min(Math.ceil(height / 2), 4) }, (_, l) => {
        const y1 = 0.25 + l * 2
        const y2 = Math.min(y1 + 2, totalH)
        return (
          <group key={`diag_${l}`}>
            {l % 2 === 0 ? (
              <>
                <Tube start={[-hw, y1, -hl]} end={[-hw, y2, hl]} color="#aaa" />
                <Tube start={[hw, y1, -hl]} end={[hw, y2, hl]} color="#aaa" />
              </>
            ) : (
              <>
                <Tube start={[-hw, y1, hl]} end={[-hw, y2, -hl]} color="#aaa" />
                <Tube start={[hw, y1, hl]} end={[hw, y2, -hl]} color="#aaa" />
              </>
            )}
          </group>
        )
      })}

      {/* Platform */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[baseW + 0.1, 0.04, baseL + 0.1]} />
        <meshStandardMaterial color="#f5c800" roughness={0.5} />
      </mesh>

      {/* Guardrails */}
      <Tube start={[-hw, totalH, -hl]} end={[hw, totalH, -hl]} color="#cc0000" />
      <Tube start={[-hw, totalH, hl]} end={[hw, totalH, hl]} color="#cc0000" />
      <Tube start={[-hw, totalH, -hl]} end={[-hw, totalH, hl]} color="#cc0000" />
      <Tube start={[hw, totalH, -hl]} end={[hw, totalH, hl]} color="#cc0000" />

      {/* Mid rails */}
      <Tube start={[-hw, height + 0.5, -hl]} end={[hw, height + 0.5, -hl]} color="#cc0000" />
      <Tube start={[-hw, height + 0.5, hl]} end={[hw, height + 0.5, hl]} color="#cc0000" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
