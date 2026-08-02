//import React from 'react';
import { Link } from 'react-router-dom';
// 🔥 Import custom brand logo properly
import logo from '../../assets/logo1.png';

export default function Navbar() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-50">
      
      {/* 🔥 MAIN NAVBAR WRAPPER: Continuous Rotating Gradient Border */}
      <div className="w-full p-[2px] rounded-2xl bg-gradient-to-r from-[#8b5cf6] via-[#06b6d4] to-[#8b5cf6] animate-border-glow shadow-[0_0_30px_rgba(139,92,246,0.25)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]">
        
        {/* INNER DARK BOX: Keeps background dark & sleek */}
        <nav className="w-full h-16 bg-[#080911]/95 backdrop-blur-2xl rounded-[14px] px-6 flex items-center justify-between">
          
          {/* 1. LEFT: Brand Logo + Name */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer decoration-none">
            <div className="relative flex items-center justify-center">
              {/* Subtle back glow behind logo */}
              <div className="absolute w-8 h-8 bg-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src={logo} 
                alt="Streamify Logo" 
                className="w-9 h-9 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
            <strong className="text-sm sm:text-base font-extrabold text-white tracking-widest uppercase">
              STREAMIFY <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">MEET</span>
            </strong>
          </Link>

          {/* 2. CENTER: Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#mesh-core" className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-purple-400 transition-colors">
              Mesh Core
            </a>
            <a href="#enterprise" className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors">
              Enterprise
            </a>
          </div>

          {/* 3. RIGHT: Version Tag / Action Button */}
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-cyan-400 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              V2.0.0-PROD
            </div>
          </div>

        </nav>
      </div>

    </div>
  );
}