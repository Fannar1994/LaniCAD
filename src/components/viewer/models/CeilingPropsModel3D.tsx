import { useRef } from 'react'
import * as THREE from 'three'

interface CeilingPropsModel3DProps {
  propCount: number
  propHeight: number  // meters
  beamCount: number
  roomWidth: number   // meters
  roomDepth?: number  // meters (default 4)
}

export function CeilingPropsModel3D({ propCount, propHeight, beamCount, roomWidth, roomDepth = 4 }: CeilingPropsModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hw = roomWidth / 2
  const hd = roomDepth / 2

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[roomWidth + 2, roomDepth + 2]} />
        <meshStandardMaterial color="#d0d0d0" side={THREE.DoubleSide} />
      </mesh>

      {/* Ceiling slab */}
      <mesh position={[0, propHeight + 0.1, 0]}>
        <boxGeometry args={[roomWidth + 1, 0.2, roomDepth + 1]} />
        <meshStandardMaterial color="#bbb" transparent opacity={0.6} roughness={0.9} />
      </mesh>

      {/* Props in a grid */}
      {Array.from({ length: propCount }, (_, i) => {
        const cols = Math.ceil(Math.sqrt(propCount))
        const rows = Math.ceil(propCount / cols)
        const col = i % cols
        const row = Math.floor(i / cols)
        const spacingX = roomWidth / (cols + 1)
        const spacingZ = roomDepth / (rows + 1)
        const x = -hw + (col + 1) * spacingX
        const z = -hd + (row + 1) * spacingZ

        return (
          <group key={`prop_${i}`} position={[x, 0, z]}>
            {/* Outer tube (bottom half) */}
            <mesh position={[0, propHeight * 0.25, 0]}>
              <cylinderGeometry args={[0.03, 0.03, propHeight * 0.5, 8]} />
              <meshStandardMaterial color="#888" metalness={0.6} />
            </mesh>
            {/* Inner tube (top half — telescopic) */}
            <mesh position={[0, propHeight * 0.7, 0]}>
              <cylinderGeometry args={[0.025, 0.025, propHeight * 0.6, 8]} />
              <meshStandardMaterial color="#aaa" metalness={0.6} />
            </mesh>
            {/* Base plate */}
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.15, 0.02, 0.15]} />
              <meshStandardMaterial color="#555" metalness={0.5} />
            </mesh>
            {/* Head plate */}
            <mesh position={[0, propHeight, 0]}>
              <boxGeometry args={[0.12, 0.02, 0.12]} />
              <meshStandardMaterial color="#555" metalness={0.5} />
            </mesh>
            {/* Adjustment handle */}
            <mesh position={[0.05, propHeight * 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.1, 6]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        )
      })}

      {/* HT-20 Beams (placed horizontally under ceiling) */}
      {Array.from({ length: beamCount }, (_, i) => {
        const spacing = roomWidth / (beamCount + 1)
        const x = -hw + (i + 1) * spacing

        return (
          <mesh key={`beam_${i}`} position={[x, propHeight - 0.1, 0]}>
            <boxGeometry args={[0.08, 0.2, roomDepth * 0.8]} />
            <meshStandardMaterial color="#f5c800" roughness={0.5} />
          </mesh>
        )
      })}

      {/* Room walls (transparent outlines) */}
      {/* Back wall */}
      <mesh position={[0, propHeight / 2, -hd]}>
        <planeGeometry args={[roomWidth, propHeight + 0.3]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-hw, propHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomDepth, propHeight + 0.3]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
