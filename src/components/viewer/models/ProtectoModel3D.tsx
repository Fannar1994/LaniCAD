/**
 * Protecto edge protection 3D model
 * Guardrail system with posts, top rail, mid rail, toe board, and safety mesh
 */

function Post({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Vertical tube */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 1.1, 8]} />
        <meshStandardMaterial color="#cc6600" />
      </mesh>
      {/* Base clamp bracket */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.15, 0.06, 0.08]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  )
}

function ToeBoard({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const dx = end[0] - start[0]
  const cx = (start[0] + end[0]) / 2
  return (
    <mesh position={[cx, 0.075, start[2]]}>
      <boxGeometry args={[dx, 0.15, 0.025]} />
      <meshStandardMaterial color="#d4a850" />
    </mesh>
  )
}

function Rail({ start, end, y }: { start: [number, number, number]; end: [number, number, number]; y: number }) {
  const dx = end[0] - start[0]
  const cx = (start[0] + end[0]) / 2
  return (
    <mesh position={[cx, y, start[2]]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.02, 0.02, dx, 8]} />
      <meshStandardMaterial color="#cc6600" />
    </mesh>
  )
}

function MeshNet({ x1, x2, y1, y2 }: { x1: number; x2: number; y1: number; y2: number }) {
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  return (
    <mesh position={[cx, cy, 0]}>
      <planeGeometry args={[x2 - x1, y2 - y1]} />
      <meshStandardMaterial color="#88aa44" transparent opacity={0.3} side={2} />
    </mesh>
  )
}

interface ProtectoModel3DProps {
  length?: number     // meters
  height?: number     // meters
  postSpacing?: number // meters
}

export default function ProtectoModel3D({
  length = 6,
  height = 1.1,
  postSpacing = 2.0,
}: ProtectoModel3DProps) {
  const posts = Math.max(2, Math.floor(length / postSpacing) + 1)
  const actualSpacing = length / (posts - 1)
  const offsetX = -length / 2

  return (
    <group>
      {/* Posts */}
      {Array.from({ length: posts }, (_, i) => (
        <Post key={`post-${i}`} position={[offsetX + i * actualSpacing, 0, 0]} />
      ))}

      {/* Top rail */}
      <Rail
        start={[offsetX, 0, 0]}
        end={[offsetX + length, 0, 0]}
        y={height}
      />

      {/* Mid rail */}
      <Rail
        start={[offsetX, 0, 0]}
        end={[offsetX + length, 0, 0]}
        y={height * 0.5}
      />

      {/* Toe boards per bay */}
      {Array.from({ length: posts - 1 }, (_, i) => (
        <ToeBoard
          key={`toe-${i}`}
          start={[offsetX + i * actualSpacing, 0, 0]}
          end={[offsetX + (i + 1) * actualSpacing, 0, 0]}
        />
      ))}

      {/* Safety mesh net per bay */}
      {Array.from({ length: posts - 1 }, (_, i) => (
        <MeshNet
          key={`net-${i}`}
          x1={offsetX + i * actualSpacing}
          x2={offsetX + (i + 1) * actualSpacing}
          y1={0.15}
          y2={height * 0.5}
        />
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[length + 2, 3]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    </group>
  )
}
