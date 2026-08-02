import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

export default function SocialButton({ provider, icon, onClick, ...props }) {
  const isGoogle = provider === 'google';
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full h-12 rounded-xl flex items-center justify-center gap-3 font-semibold text-sm transition-all duration-500 overflow-hidden group", 
        "bg-white/[0.03] border border-white/5",
        "hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
      )}
      {...props}
    >
      <div className={cn(
        "absolute w-10 h-10 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-60",
        isGoogle ? "bg-red-500/30" : "bg-purple-500/30"
      )}></div>

      <div className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:rotate-6">
        {icon}
      </div>

      <span className="relative z-10 text-gray-200 group-hover:text-white transition-colors tracking-wide font-medium">
        Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
      </span>
    </motion.button>
  );
}