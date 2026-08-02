import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 Sahi path se Logo import
import logo from '../../assets/logo1.png';

export default function CinematicLoader({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate short cinematic intro sequence (1.2 seconds)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[999999] bg-[#05060A] flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Pulsing Cinematic Logo/Core */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center space-y-4"
            >
              {/* 🔥 Custom Logo replaced here */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-ping"></div>
                <img 
                  src={logo} 
                  alt="Streamify Logo" 
                  className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(139,92,246,0.6)] animate-pulse" 
                />
              </div>

              {/* 🔥 New Watch Party Text */}
              <span className="text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase animate-pulse">
                PREPARING WATCH PARTY...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Appears smoothly after load */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}