import { useRef } from 'react'
import * as THREE from 'three'

interface FormworkModel3DProps {
  wallLength: number  // meters
  wallHeight: number  // meters
  system: 'Rasto' | 'Takko' | 'Manto'
}

export function FormworkModel3D({ wallLength, wallHeight, system }: FormworkModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const offsetX = -wallLength / 2
  const panelThickness = 0.12

  // Panel colors by system
  const panelColor = system === 'Manto' ? '#4a6fa5' : '#c06030'

  // Available panel widths (cm)
  const available = system === 'Manto'
    ? [240, 120, 90, 60, 50, 30]
    : [240, 120, 90, 60, 45, 30]

  // Pack panels
  const panelWidths: number[] = []
  let remaining = wallLength * 100
  while (remaining > 0) {
    const pw = available.find(p => p <= remaining + 1) || available[available.length - 1]
    panelWidths.push(pw)
    remaining -= pw
  }

  return (
    <group ref={groupRef}>
      {/* Panels */}
      {panelWidths.map((pw, i) => {
        let x = offsetX
        for (let j = 0; j < i; j++) x += panelWidths[j] / 100
        const panelW = pw / 100

        return (
          <group key={`panel_${i}`}>
            {/* Panel face */}
            <mesh position={[x + panelW / 2, wallHeight / 2, 0]}>
              <boxGeometry args={[panelW - 0.01, wallHeight, panelThickness]} />
              <meshStandardMaterial color={panelColor} roughness={0.7} />
            </mesh>
            {/* Panel edge separator */}
            <mesh position={[x, wallHeight / 2, 0]}>
              <boxGeometry args={[0.01, wallHeight, panelThickness + 0.02]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        )
      })}

      {/* Last edge */}
      <mesh position={[offsetX + wallLength, wallHeight / 2, 0]}>
        <boxGeometry args={[0.01, wallHeight, panelThickness + 0.02]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Props/struts */}
      {Array.from({ length: Math.ceil(wallLength / 1.2) }, (_, i) => {
        const px = offsetX + 0.6 + i * 1.2
        if (px > offsetX + wallLength) return null
        const propAngle = Math.PI / 6 // 30 degrees
        const propLen = wallHeight * 0.7 / Math.cos(propAngle)

        return (
          <group key={`prop_${i}`}>
            {/* Prop tube (angled away from wall) */}
            <mesh
              position={[px, wallHeight * 0.35, -propLen / 2 * Math.sin(propAngle) - panelThickness / 2]}
              rotation={[propAngle, 0, 0]}
            >
              <cylinderGeometry args={[0.03, 0.03, propLen, 8]} />
              <meshStandardMaterial color="#666" metalness={0.5} />
            </mesh>
            {/* Foot plate */}
            <mesh position={[px, 0, -propLen * Math.sin(propAngle) - panelThickness / 2]}>
              <boxGeometry args={[0.2, 0.02, 0.2]} />
              <meshStandardMaterial color="#555" />
            </mesh>
          </group>
        )
      })}

      {/* Tie bar indicators (small cylinders through the wall) */}
      {Array.from({ length: Math.ceil(wallLength / 0.6) }, (_, i) => {
        const tx = offsetX + 0.3 + i * 0.6
        return Array.from({ length: Math.floor(wallHeight / 0.6) }, (_, j) => {
          const ty = 0.5 + j * 0.6
          if (ty > wallHeight - 0.3) return null
          return (
            <mesh key={`tie_${i}_${j}`} position={[tx, ty, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, panelThickness + 0.1, 6]} />
              <meshStandardMaterial color="#333" metalness={0.8} />
            </mesh>
          )
        })
      })}

      {/* System label */}
      <mesh position={[0, wallHeight + 0.3, 0]}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshStandardMaterial color="transparent" transparent opacity={0} />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -1]}>
        <planeGeometry args={[wallLength + 4, 6]} />
        <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
