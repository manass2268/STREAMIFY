import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden hidden md:block">
      {/* Inner Precision Dot */}
      <motion.div
        className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovered ? 2.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 50 }}
      />

      {/* Outer Elastic Neon Ring */}
      <motion.div
        className="absolute w-10 h-10 border border-purple-500/50 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovered ? 1.6 : 1,
          backgroundColor: isHovered ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
          borderColor: isHovered ? 'rgba(6, 182, 212, 0.8)' : 'rgba(139, 92, 246, 0.5)'
        }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
      />
    </div>
  );
}