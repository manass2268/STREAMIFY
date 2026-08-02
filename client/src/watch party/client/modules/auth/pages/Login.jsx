import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Globe } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';
// 🔥 Import Firebase Services
import { loginWithEmail, loginWithGoogle, loginWithGithub } from '../services/firebase';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." })
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user came from a Watch Party Room link
  const fromRoom = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });

  // 1. Email + Password Login
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setAuthError('');
    try {
      await loginWithEmail(data.email, data.password);
      console.log("Logged In Successfully!");
      navigate(fromRoom, { replace: true });
    } catch (error) {
      setAuthError(error.message.replace('Firebase: ', ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Google OAuth Login
  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      navigate(fromRoom, { replace: true });
    } catch (err) {
      console.error("Google Auth Error:", err);
      setAuthError("Google Sign-In failed. Please try again.");
    }
  };

  // 3. GitHub OAuth Login
  const handleGithubAuth = async () => {
    try {
      await loginWithGithub();
      navigate(fromRoom, { replace: true });
    } catch (err) {
      console.error("GitHub Auth Error:", err);
      setAuthError("GitHub Sign-In failed. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* LEFT SIDE: Watch Party Copy */}
        <div className="hidden lg:flex flex-col space-y-6">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-purple-400 mb-6 tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Watch Party Portal
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Hop Back Into <br/>
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">The Watch Party.</span>
            </h1>
            <p className="text-gray-400 mt-6 text-lg max-w-md leading-relaxed">
              Your friends are waiting! Stream videos in perfect sync, talk on crystal-clear video, and enjoy the show together.
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Non-Stop Rotating Glowing Gradient Border Wrapper */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} 
          className="w-full max-w-md mx-auto p-[2.5px] rounded-[30px] bg-gradient-to-r from-[#8b5cf6] via-[#06b6d4] to-[#8b5cf6] animate-border-glow shadow-[0_0_40px_rgba(139,92,246,0.35)]"
        >
          {/* Inner Card Background */}
          <div className="w-full bg-[#080911]/95 backdrop-blur-2xl p-8 rounded-[28px]">
            
            <h2 className="text-2xl font-bold text-white mb-6 lg:hidden">Sign In</h2>
            
            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
                {authError}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
              <AuthInput label="Email Address" type="email" name="email" register={register} error={errors.email} isSuccess={touchedFields.email && !errors.email} />
              <AuthInput label="Password" type="password" name="password" register={register} error={errors.password} isSuccess={touchedFields.password && !errors.password} />
              
              <div className="flex items-center justify-between mt-2 mb-4 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border border-white/20 bg-white/5 text-purple-500 focus:ring-0 checked:bg-purple-500 transition-colors" />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Forgot Password?</Link>
              </div>

              <button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl font-bold text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}>
                <LogIn className="w-5 h-5" /> {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-white/10 flex-grow"></div>
              <span className="text-xs text-gray-500 font-medium tracking-widest">OR</span>
              <div className="h-px bg-white/10 flex-grow"></div>
            </div>

            <div className="flex flex-col gap-3">
              <SocialButton provider="google" icon={<span className="font-extrabold text-lg">G</span>} onClick={handleGoogleAuth} />
              <SocialButton provider="github" icon={<Globe className="w-5 h-5"/>} onClick={handleGithubAuth} />
            </div>

            <p className="text-center text-sm text-gray-400 mt-8">
              Don't have an account? <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Create one</Link>
            </p>

          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}