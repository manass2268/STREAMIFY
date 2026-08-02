import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, XCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/cn'; 

export default function AuthInput({ label, type = 'text', register, name, error, isSuccess, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  return (
    <div className="relative w-full mb-6 group">
      <div
        className={cn(
          "w-full h-14 bg-white/[0.01] border border-white/5 rounded-xl flex items-center px-4 relative transition-all duration-300 overflow-hidden",
          isFocused && "border-cyan-500/50 bg-white/[0.03] shadow-[0_0_20px_rgba(6,182,212,0.15)]",
          error && "border-red-500/50 bg-red-500/[0.02]",
          isSuccess && "border-emerald-500/50 bg-emerald-500/[0.02]"
        )}
      >
        {isFocused && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
        )}

        <motion.label
          initial={false}
          animate={{
            y: (isFocused || props.value) ? -16 : 0, 
            x: (isFocused || props.value) ? -10 : 0, 
            scale: (isFocused || props.value) ? 0.8 : 1, 
            color: error ? '#ef4444' : isFocused ? '#22d3ee' : '#9ca3af',
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-12 text-sm font-medium tracking-wide z-10 pointer-events-none origin-left"
        >
          {label}
        </motion.label>

        <input
          type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => setIsFocused(!!e.target.value)} 
          {...register(name)} 
          {...props}
          className="w-full bg-transparent border-none outline-none text-white text-sm pt-4 font-medium relative z-20 placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:text-gray-600 transition-opacity"
        />

        <div className="flex items-center gap-2 relative z-20 ml-2">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <XCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              </motion.div>
            )}
            {isSuccess && !error && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <CheckCircle className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -5, height: 0, filter: 'blur(5px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs text-red-400 mt-2 font-medium tracking-wide flex items-center gap-1.5 overflow-hidden pl-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}