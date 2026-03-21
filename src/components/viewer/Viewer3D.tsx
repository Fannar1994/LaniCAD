import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

interface Viewer3DProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  className?: string
}

/**
 * Generic 3D viewer canvas with orbit controls, grid, and lighting
 */
export function Viewer3D({ children, cameraPosition = [8, 6, 8], className = '' }: Viewer3DProps) {
  return (
    <div className={`h-[500px] border rounded-lg bg-gray-50 ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2}
            maxDistance={50}
          />

          <Grid
            infiniteGrid
            fadeDistance={30}
            fadeStrength={3}
            cellSize={1}
            sectionSize={5}
            cellColor="#ddd"
            sectionColor="#bbb"
          />

          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}
