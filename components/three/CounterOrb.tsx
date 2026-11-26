"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbProps {
  color: string;
  value: number;
}

function ReactiveOrbMesh({ color, value }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetRotation = value * 0.15;
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y,
        targetRotation,
        4,
        delta
      );
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.85}
          wireframe={false}
        />
      </mesh>
    </>
  );
}

export function CounterOrb({ color, value }: OrbProps) {
  return (
    <div className="w-16 h-16 pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ReactiveOrbMesh color={color} value={value} />
      </Canvas>
    </div>
  );
}
