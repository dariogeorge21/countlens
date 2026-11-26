"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface StructureProps {
  position: [number, number, number];
  rotationSpeed?: [number, number, number];
  scale?: number;
  geometry: "torus" | "octahedron" | "icosahedron" | "dodecahedron" | "ring";
  color: string;
  floatSpeed?: number;
  floatIntensity?: number;
  wireframeLinewidth?: number;
}

function WireframeStructure({
  position,
  rotationSpeed = [0.1, 0.15, 0.05],
  scale = 1,
  geometry,
  color,
  floatSpeed = 1.5,
  floatIntensity = 0.8,
}: StructureProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed[0];
      meshRef.current.rotation.y += delta * rotationSpeed[1];
      meshRef.current.rotation.z += delta * rotationSpeed[2];
    }
  });

  const geom = useMemo(() => {
    switch (geometry) {
      case "torus":
        // Fine triangulated wireframe mesh like the reference image
        return new THREE.TorusGeometry(1.4, 0.42, 28, 56);
      case "ring":
        return new THREE.TorusGeometry(1.9, 0.22, 24, 64);
      case "octahedron":
        return new THREE.OctahedronGeometry(1.2, 0);
      case "icosahedron":
        return new THREE.IcosahedronGeometry(1.1, 1);
      case "dodecahedron":
        return new THREE.DodecahedronGeometry(1.1, 0);
      default:
        return new THREE.OctahedronGeometry(1, 0);
    }
  }, [geometry]);

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.6}
      floatIntensity={floatIntensity}
      position={position}
    >
      <mesh ref={meshRef} geometry={geom} scale={scale}>
        <meshStandardMaterial
          color={color}
          roughness={0.12}
          metalness={0.88}
          wireframe={true}
          transparent={true}
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function SceneComposition() {
  const lightRef = useRef<THREE.PointLight>(null);

  // Parallax camera movement and specular cursor tracking
  useFrame(({ pointer, camera }, delta) => {
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      pointer.x * 1.2,
      2.5,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      pointer.y * 0.9,
      2.5,
      delta
    );
    camera.lookAt(0, 0, 0);

    if (lightRef.current) {
      lightRef.current.position.x = pointer.x * 6;
      lightRef.current.position.y = pointer.y * 6;
    }
  });

  const structures: StructureProps[] = useMemo(
    () => [
      // Primary Hero Trio (as in reference image)
      {
        position: [-4.2, 1.2, -1.5],
        geometry: "octahedron",
        color: "#94a3b8", // Crisp slate wireframe
        scale: 1.35,
        rotationSpeed: [0.08, 0.14, 0.04],
        floatSpeed: 1.4,
      },
      {
        position: [-0.6, 2.6, -2.5],
        geometry: "icosahedron",
        color: "#a5b4fc", // Soft lavender / indigo
        scale: 1.2,
        rotationSpeed: [0.12, 0.16, 0.08],
        floatSpeed: 1.8,
      },
      {
        position: [4.4, 1.4, -1.0],
        geometry: "torus",
        color: "#c7d2fe", // Meshed high-poly torus ring with specular gleam
        scale: 1.25,
        rotationSpeed: [0.15, 0.22, 0.06],
        floatSpeed: 1.6,
      },

      // Midground & Lower Viewport Structures
      {
        position: [-5.0, -2.6, -3.0],
        geometry: "ring",
        color: "#818cf8",
        scale: 1.1,
        rotationSpeed: [0.1, -0.15, 0.06],
        floatSpeed: 1.3,
      },
      {
        position: [5.2, -2.2, -2.8],
        geometry: "octahedron",
        color: "#67e8f9", // Cyan crystal
        scale: 1.4,
        rotationSpeed: [-0.14, 0.18, 0.05],
        floatSpeed: 1.7,
      },
      {
        position: [0.8, -3.5, -4.0],
        geometry: "dodecahedron",
        color: "#c084fc", // Purple geometric polyhedra
        scale: 1.5,
        rotationSpeed: [0.09, -0.12, 0.1],
        floatSpeed: 1.2,
      },

      // Deep Space Ambient Floating Wireframes
      {
        position: [-2.2, -0.8, -5.5],
        geometry: "icosahedron",
        color: "#cbd5e1",
        scale: 1.6,
        rotationSpeed: [0.06, 0.09, 0.03],
        floatSpeed: 0.9,
      },
      {
        position: [2.5, 3.8, -5.0],
        geometry: "octahedron",
        color: "#a7f3d0", // Soft emerald tint
        scale: 1.3,
        rotationSpeed: [-0.08, 0.11, 0.07],
        floatSpeed: 1.1,
      },
      {
        position: [-6.5, 0.2, -4.5],
        geometry: "torus",
        color: "#e2e8f0",
        scale: 1.0,
        rotationSpeed: [0.18, 0.12, 0.08],
        floatSpeed: 1.4,
      },
      {
        position: [6.8, 3.2, -4.2],
        geometry: "icosahedron",
        color: "#ddd6fe",
        scale: 1.1,
        rotationSpeed: [0.1, 0.14, -0.06],
        floatSpeed: 1.5,
      },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 15, 10]} intensity={1.4} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#818cf8" />
      <pointLight
        ref={lightRef}
        position={[0, 0, 4]}
        intensity={2.2}
        distance={15}
        color="#ffffff"
      />

      {structures.map((s, idx) => (
        <WireframeStructure key={idx} {...s} />
      ))}
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none opacity-65 dark:opacity-40 transition-opacity duration-500">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneComposition />
      </Canvas>
    </div>
  );
}
