import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const DocumentModel = () => {
  const group = useRef();
  
  useFrame((state) => {
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });

  return (
    <group ref={group}>
      {/* Resume Base Paper */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 4.2, 0.1]} />
        <meshStandardMaterial color="#111118" metalness={0.5} roughness={0.2} />
      </mesh>
      
      {/* Holographic Glowing Lines to simulate text */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[-0.8, 1.2 - i * 0.4, 0.06]}>
          <planeGeometry args={[1.5 + Math.random() * 0.5, 0.1]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      {/* Profile Pic block */}
      <mesh position={[0.8, 1.4, 0.06]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#8a2be2" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Scanner Line */}
      <ScannerLine />
    </group>
  );
};

const ScannerLine = () => {
  const lineRef = useRef();
  
  useFrame((state) => {
    // Move up and down
    lineRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 2;
  });

  return (
    <mesh ref={lineRef} position={[0, 2, 0.15]}>
      <boxGeometry args={[3.2, 0.05, 0.1]} />
      <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      <pointLight color="#00f0ff" intensity={2} distance={2} />
    </mesh>
  );
};

const Scanner3D = () => {
  return (
    <div className="w-full h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#8a2be2" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f0ff" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <DocumentModel />
        </Float>
        
        <Environment preset="city" />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#00f0ff" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
};

export default Scanner3D;
