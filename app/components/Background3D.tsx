import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Box, MeshDistortMaterial } from '@react-three/drei'

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
      meshRef.current.rotation.x = Math.cos(t / 4) / 2
      meshRef.current.rotation.y = Math.sin(t / 4) / 2
      meshRef.current.rotation.z = Math.sin(t / 1.5) / 2
      meshRef.current.position.x = Math.sin(t / 1) / 2
      meshRef.current.position.y = Math.cos(t / 1) / 2
    }
  })

  return (
    <Sphere args={[1, 100, 200]} scale={1.5} ref={meshRef}>
      <MeshDistortMaterial
        color="#E6F3FF"
        attach="material"
        distort={0.3}
        speed={4}
        roughness={0}
      />
    </Sphere>
  )
}

function AnimatedBox() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
      meshRef.current.rotation.x = Math.cos(t / 2) / 2
      meshRef.current.rotation.y = Math.sin(t / 2) / 2
      meshRef.current.scale.x = Math.cos(t) * 0.2 + 0.8
      meshRef.current.scale.y = Math.sin(t) * 0.2 + 0.8
      meshRef.current.scale.z = Math.sin(t) * 0.2 + 0.8
    }
  })

  return (
    <Box ref={meshRef} args={[1, 1, 1]} scale={0.5}>
      <meshStandardMaterial color="#999999" />
    </Box>
  )
}

export default function Background3D() {
  return (
    <Canvas className="absolute top-0 left-0 w-full h-full -z-10">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <AnimatedSphere />
      <AnimatedBox />
    </Canvas>
  )
}
