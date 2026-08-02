import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import CustomCursor from '../../../components/Cursor/CustomCursor';
import logo from '../../../assets/logo1.png';

export default function AuthLayout({ children }) {
  const location = useLocation();

  return (
    <div className="relative w-full min-h-screen bg-[#05060A] flex flex-col items-center justify-between overflow-hidden font-sans pt-8 pb-6">
      <CustomCursor />
      
      {/* Background Glow Matrix */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[130px] -top-20 -left-20" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute w-[60vw] h-[60vw] rounded-full bg-cyan-600/10 blur-[150px] bottom-0 right-0 translate-x-1/4" />
      </div>

      {/* Top Header Logo */}
      <header className="relative z-50 flex items-center gap-3 group cursor-pointer my-4">
        <img 
          src={logo} 
          alt="Streamify Logo" 
          className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-transform duration-300 group-hover:scale-105" 
        />
        <strong className="text-sm font-extrabold text-white tracking-widest">STREAMIFY MEET</strong>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -30, scale: 0.98, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-[92%] max-w-5xl flex flex-col items-center justify-center my-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* 🔥 NEW: Streamify Main Website Footer */}
      <footer className="relative z-20 flex flex-col items-center gap-2 text-xs text-gray-500 mt-8 font-medium">
        <div className="flex items-center gap-4">
          <span>Support: <a href="mailto:support.mstech4407@gmail.com" className="text-cyan-400 hover:underline font-semibold">support.mstech4407@gmail.com</a></span>
          <span className="text-gray-700">|</span>
          <a href="/about" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">About Us</a>
        </div>
        <p className="text-[11px] text-gray-600">© 2026 Streamify. All rights reserved.</p>
      </footer>
    </div>
  );
}