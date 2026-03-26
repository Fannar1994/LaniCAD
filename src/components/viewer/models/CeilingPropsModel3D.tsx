import { useRef } from 'react'
import * as THREE from 'three'
import { CEILING } from '@/lib/geometry-config'

interface CeilingPropsModel3DProps {
  propCount: number
  propHeight: number  // meters
  beamCount: number
  roomWidth: number   // meters
  roomDepth?: number  // meters (default 4)
}

const PROP_OUTER_R = CEILING.propOuterRadius
const PROP_INNER_R = CEILING.propInnerRadius
const BEAM_W = CEILING.beamWebWidth
const BEAM_H = CEILING.beamHeight
const FLANGE_W = CEILING.flangeWidth
const FLANGE_T = CEILING.flangeThickness

function Tube({ start, end, radius, color }: {
  start: [number, number, number]
  end: [number, number, number]
  radius: number
  color: string
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

/** Telescopic prop with outer tube, inner tube, collar, pin, and tripod base */
function TelescopicProp({ position, height }: {
  position: [number, number, number]
  height: number
}) {
  const splitY = height * 0.45  // where outer meets inner
  const collarY = splitY + 0.02

  return (
    <group position={position}>
      {/* === OUTER TUBE (bottom section) === */}
      <mesh position={[0, splitY / 2, 0]}>
        <cylinderGeometry args={[PROP_OUTER_R, PROP_OUTER_R, splitY, 10]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* === INNER TUBE (top telescopic section) === */}
      <mesh position={[0, (splitY + height) / 2, 0]}>
        <cylinderGeometry args={[PROP_INNER_R, PROP_INNER_R, height - splitY, 10]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* === ADJUSTMENT COLLAR (ring at joint) === */}
      <mesh position={[0, collarY, 0]}>
        <cylinderGeometry args={[PROP_OUTER_R + 0.005, PROP_OUTER_R + 0.005, 0.06, 10]} />
        <meshStandardMaterial color="#666" metalness={0.7} />
      </mesh>

      {/* === PIN HOLES (visible dots on outer tube) === */}
      {[0.2, 0.3, 0.4].map((frac) => (
        <mesh key={`pin_${frac}`} position={[PROP_OUTER_R + 0.002, splitY * frac, 0]}>
          <sphereGeometry args={[0.004, 6, 6]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      ))}

      {/* === ADJUSTMENT HANDLE (thread nut) === */}
      <group position={[0, collarY, 0]}>
        <mesh position={[PROP_OUTER_R + 0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.06, 6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Handle grip */}
        <mesh position={[PROP_OUTER_R + 0.06, 0, 0]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {/* === BASE PLATE === */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.15, 0.02, 0.15]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>

      {/* === HEAD PLATE (U-shape fork) === */}
      <group position={[0, height, 0]}>
        {/* Base plate */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.12]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
        {/* Fork prongs */}
        <mesh position={[-0.04, 0.04, 0]}>
          <boxGeometry args={[0.008, 0.05, 0.08]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
        <mesh position={[0.04, 0.04, 0]}>
          <boxGeometry args={[0.008, 0.05, 0.08]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
      </group>

      {/* === TRIPOD LEGS (3 diagonal support legs at base) === */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => {
        const legLen = 0.35
        const legEndX = Math.cos(angle) * legLen
        const legEndZ = Math.sin(angle) * legLen
        return (
          <Tube
            key={`tripod_${i}`}
            start={[0, 0.15, 0]}
            end={[legEndX, 0.01, legEndZ]}
            radius={0.01}
            color="#777"
          />
        )
      })}
    </group>
  )
}

/** HT-20 Beam with I-section profile */
function HT20Beam({ position, length }: {
  position: [number, number, number]
  length: number
}) {
  return (
    <group position={position}>
      {/* Web (vertical plate) */}
      <mesh>
        <boxGeometry args={[BEAM_W * 0.4, BEAM_H, length]} />
        <meshStandardMaterial color="#f5c800" roughness={0.5} />
      </mesh>
      {/* Top flange */}
      <mesh position={[0, BEAM_H / 2 - FLANGE_T / 2, 0]}>
        <boxGeometry args={[FLANGE_W, FLANGE_T, length]} />
        <meshStandardMaterial color="#e0b000" roughness={0.5} />
      </mesh>
      {/* Bottom flange */}
      <mesh position={[0, -BEAM_H / 2 + FLANGE_T / 2, 0]}>
        <boxGeometry args={[FLANGE_W, FLANGE_T, length]} />
        <meshStandardMaterial color="#e0b000" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function CeilingPropsModel3D({ propCount, propHeight, beamCount, roomWidth, roomDepth = 4 }: CeilingPropsModel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const hw = roomWidth / 2
  const hd = roomDepth / 2
  const beamY = propHeight + 0.05  // beams sit on prop heads
  const plywoodY = beamY + BEAM_H / 2 + 0.01
  const slabY = plywoodY + 0.005

  return (
    <group ref={groupRef}>
      {/* === FLOOR === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[roomWidth + 2, roomDepth + 2]} />
        <meshStandardMaterial color="#d0d0d0" side={THREE.DoubleSide} />
      </mesh>

      {/* === PROPS in a grid === */}
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
          <TelescopicProp
            key={`prop_${i}`}
            position={[x, 0, z]}
            height={propHeight}
          />
        )
      })}

      {/* === HT-20 BEAMS (I-section, running along room depth) === */}
      {Array.from({ length: beamCount }, (_, i) => {
        const spacing = roomWidth / (beamCount + 1)
        const x = -hw + (i + 1) * spacing
        return (
          <HT20Beam
            key={`beam_${i}`}
            position={[x, beamY, 0]}
            length={roomDepth * 0.85}
          />
        )
      })}

      {/* === PLYWOOD DECKING (on top of beams) === */}
      <mesh position={[0, plywoodY, 0]}>
        <boxGeometry args={[roomWidth * 0.9, 0.021, roomDepth * 0.85]} />
        <meshStandardMaterial color="#c8a060" roughness={0.8} />
      </mesh>

      {/* === CEILING SLAB (transparent concrete above plywood) === */}
      <mesh position={[0, slabY + 0.1, 0]}>
        <boxGeometry args={[roomWidth + 1, 0.2, roomDepth + 1]} />
        <meshStandardMaterial color="#bbb" transparent opacity={0.5} roughness={0.9} />
      </mesh>

      {/* === ROOM WALLS (transparent context) === */}
      {/* Back wall */}
      <mesh position={[0, propHeight / 2, -hd]}>
        <planeGeometry args={[roomWidth, propHeight + 0.3]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-hw, propHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomDepth, propHeight + 0.3]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall */}
      <mesh position={[hw, propHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomDepth, propHeight + 0.3]} />
        <meshStandardMaterial color="#ccc" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
