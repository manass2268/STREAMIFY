import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function TiltCard({ icon, title, desc }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coordinates relative to card center
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rX = ((mouseY / height) - 0.5) * -15; // Max 15deg tilt
    const rY = ((mouseX / width) - 0.5) * 15;

    setRotateX(rX);
    setRotateY(rY);
    setGlowPos({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className="relative bg-[#0d0e14]/80 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col items-start gap-3 group cursor-pointer overflow-hidden shadow-xl"
    >
      {/* Mouse Tracking Glow Border/Gradient */}
      {isHovered && (
        <div 
          className="absolute pointer-events-none -inset-px rounded-2xl opacity-50 transition-opacity duration-300"
          style={{
            background: `radial-gradient(300px circle at ${glowPos.x}px ${glowPos.y}px, rgba(139, 92, 246, 0.4), transparent 80%)`
          }}
        />
      )}

      {/* Card Content Layer */}
      <div className="relative z-10 p-2.5 bg-white/5 border border-white/10 rounded-xl group-hover:scale-110 group-hover:border-purple-500/50 transition-all duration-300">
        {icon}
      </div>

      <div className="relative z-10">
        <h4 className="text-[13px] font-semibold text-gray-200 tracking-wide group-hover:text-purple-400 transition-colors duration-300">{title}</h4>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}