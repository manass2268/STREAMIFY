import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Sparkles, RoundedBox, Html } from '@react-three/drei';
import { Shield, Activity } from 'lucide-react';

// 🔥 Mouse tracking rig (Rotates camera based on mouse movement)
function CameraRig({ children }) {
  const group = useRef();
  useFrame((state) => {
    // Smooth interpolation for premium feel
    const targetX = (state.pointer.x * Math.PI) / 8;
    const targetY = (state.pointer.y * Math.PI) / 8;
    group.current.rotation.y += 0.05 * (targetX - group.current.rotation.y);
    group.current.rotation.x += 0.05 * (-targetY - group.current.rotation.x);
  });
  return <group ref={group}>{children}</group>;
}

// 🔥 The 3D Object
function HolographicDevice() {
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state, delta) => {
    if(ringRef1.current) ringRef1.current.rotation.z += delta * 0.5;
    if(ringRef2.current) ringRef2.current.rotation.z -= delta * 0.3;
  });

  return (
    <group>
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5}>
        
        {/* Main Camera Body (Glassmorphism look in 3D) */}
        <RoundedBox args={[2.5, 1.8, 1.2]} radius={0.2} smoothness={4}>
          <meshPhysicalMaterial 
            color="#0d1117" 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={1} 
            clearcoat={1} 
            transparent 
            opacity={0.8}
          />
        </RoundedBox>

        {/* Lens Base */}
        <mesh position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.4, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Glowing Lens Glass (Neon Blue) */}
        <mesh position={[0, 0, 0.92]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshPhysicalMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} toneMapped={false} />
        </mesh>

        {/* Orbiting Neon Rings */}
        <group position={[0, 0, 0.8]}>
          <mesh ref={ringRef1} rotation={[0, 0, 0]}>
            <torusGeometry args={[1.2, 0.02, 16, 100]} />
            <meshBasicMaterial color="#8b5cf6" toneMapped={false} />
          </mesh>
          <mesh ref={ringRef2} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[1.4, 0.01, 16, 100]} />
            <meshBasicMaterial color="#06b6d4" toneMapped={false} />
          </mesh>
        </group>

        {/* 3D Floating HTML Badges (Attached to the 3D model) */}
        <Html position={[1.5, 1.2, 0]} center transform distanceFactor={5}>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex flex-col items-center shadow-2xl pointer-events-none select-none">
             <span className="text-[10px] text-gray-400">HD</span>
             <span className="text-xs font-bold text-white">1080p</span>
          </div>
        </Html>
        <Html position={[-1.8, 0.5, 0.5]} center transform distanceFactor={5}>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xl pointer-events-none select-none">
             <Shield className="w-4 h-4 text-emerald-400" />
             <div className="flex flex-col"><span className="text-[11px] font-bold text-emerald-400">Secure</span></div>
          </div>
        </Html>
        <Html position={[1.2, -1, 0.5]} center transform distanceFactor={5}>
          <div className="bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xl pointer-events-none select-none">
             <Activity className="w-4 h-4 text-pink-400" />
             <div className="flex flex-col"><span className="text-[11px] font-bold text-pink-400">Live</span></div>
          </div>
        </Html>

        {/* Orbiting Particles around the camera */}
        <Sparkles count={50} scale={4} size={3} speed={0.4} opacity={0.5} color="#8b5cf6" />
        <Sparkles count={30} scale={5} size={2} speed={0.2} opacity={0.3} color="#06b6d4" />

      </Float>
    </group>
  );
}

// 🔥 The Main Canvas Wrapper
export default function HologramScene() {
  return (
    <div className="w-full h-full min-h-[450px] relative z-20 cursor-crosshair">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
        
        <CameraRig>
          <HolographicDevice />
        </CameraRig>

        <Environment preset="city" />
        {/* Soft ground reflection shadow */}
        <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#8b5cf6" />
      </Canvas>
    </div>
  );
}