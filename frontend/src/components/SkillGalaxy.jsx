import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const SkillNode = ({ position, label, color, size, type }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.005;
    if (hovered) {
      meshRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef} 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={hovered ? 2 : 0.5} 
          wireframe={type === 'missing'}
          transparent
          opacity={type === 'missing' ? 0.3 : 0.9}
        />
        {hovered && (
          <Html distanceFactor={10} center>
            <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap pointer-events-none">
              <span className="font-bold">{label}</span>
              <br/>
              <span className="text-[10px] text-gray-400 capitalize">{type} Skill</span>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

const SkillGalaxyScene = ({ extracted, missing, recommended }) => {
  const groupRef = useRef();

  useFrame(() => {
    groupRef.current.rotation.y += 0.001;
  });

  const nodes = useMemo(() => {
    const allNodes = [];
    
    // Core extracted skills (Green/Blue, Large)
    extracted?.forEach((skill, i) => {
      const radius = 2 + Math.random() * 2;
      const angle = (i / extracted.length) * Math.PI * 2;
      allNodes.push({
        id: `ext-${i}`,
        label: skill,
        type: 'present',
        color: '#00f0ff',
        size: 0.3 + Math.random() * 0.2,
        pos: [Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius]
      });
    });

    // Missing skills (Red, wireframe, medium)
    missing?.forEach((skill, i) => {
      const radius = 4 + Math.random() * 2;
      const angle = (i / missing.length) * Math.PI * 2;
      allNodes.push({
        id: `mis-${i}`,
        label: skill,
        type: 'missing',
        color: '#ff3366',
        size: 0.25,
        pos: [Math.cos(angle) * radius, (Math.random() - 0.5) * 3, Math.sin(angle) * radius]
      });
    });

    // Recommended Tech (Purple, orbiting far)
    recommended?.forEach((skill, i) => {
      const radius = 6 + Math.random() * 2;
      const angle = (i / recommended.length) * Math.PI * 2;
      allNodes.push({
        id: `rec-${i}`,
        label: skill,
        type: 'recommended',
        color: '#8a2be2',
        size: 0.2,
        pos: [Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius]
      });
    });

    return allNodes;
  }, [extracted, missing, recommended]);

  // Generate lines between present skills
  const lines = useMemo(() => {
    const presentNodes = nodes.filter(n => n.type === 'present');
    const lineArr = [];
    for(let i=0; i<presentNodes.length; i++) {
      for(let j=i+1; j<presentNodes.length; j++) {
        if(Math.random() > 0.7) {
          lineArr.push([new THREE.Vector3(...presentNodes[i].pos), new THREE.Vector3(...presentNodes[j].pos)]);
        }
      }
    }
    return lineArr;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {nodes.map(node => (
        <SkillNode key={node.id} position={node.pos} label={node.label} color={node.color} size={node.size} type={node.type} />
      ))}
      {/* Constellation Lines */}
      {lines.map((pts, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial color="#00f0ff" transparent opacity={0.15} />
          </line>
        );
      })}
    </group>
  );
};

const SkillGalaxy = ({ extracted = [], missing = [], recommended = [] }) => {
  return (
    <div className="w-full h-full bg-slate-950/50 rounded-2xl relative">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8a2be2" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <SkillGalaxyScene extracted={extracted} missing={missing} recommended={recommended} />
        
        <OrbitControls enablePan={false} maxDistance={20} minDistance={2} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10 flex gap-4 text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00f0ff]"></div> Present</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-[#ff3366]"></div> Missing</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8a2be2]"></div> Recommended</div>
      </div>
    </div>
  );
};

export default SkillGalaxy;
