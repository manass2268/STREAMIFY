import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Globe } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';
// 🔥 Import Firebase Services
import { registerWithEmail, loginWithGoogle, loginWithGithub } from '../services/firebase';

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  terms: z.boolean().refine(val => val === true, { message: "You must accept the terms." })
});

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 DIRECT-LINK CATCHER: Fetch exact path where the user wanted to go
  const fromRoom = location.state?.from?.pathname + (location.state?.from?.search || '') || '/';

  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  // 1. Create Account in Firebase & Auto-Redirect
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setAuthError('');
    try {
      // Firebase creates user and automatically logs them in
      await registerWithEmail(data.email, data.password, data.fullName);
      console.log("Account Created & Logged in successfully!");
      
      // 🔥 DIRECT ROOM ROUTING: Send directly to the Room URL
      navigate(fromRoom, { replace: true });
    } catch (error) {
      setAuthError(error.message.replace('Firebase: ', ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Google OAuth Login & Fetch Room
  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      navigate(fromRoom, { replace: true });
    } catch (err) {
      console.error("Google Auth Error:", err);
      setAuthError("Google Sign-In failed. Please try again.");
    }
  };

  // 3. GitHub OAuth Login & Fetch Room
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-400 mb-6 tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              Live Sync Experience
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Never Watch <br/>
              <span className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] bg-clip-text text-transparent">Alone Again.</span>
            </h1>
            <p className="text-gray-400 mt-6 text-lg max-w-md leading-relaxed">
              Create your account to host watch parties, sync streams with zero delay, and chat with up to 100 people.
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Non-Stop Rotating Glowing Gradient Border Wrapper */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} 
          className="w-full max-w-md mx-auto p-[2.5px] rounded-[30px] bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#06b6d4] animate-border-glow shadow-[0_0_40px_rgba(6,182,212,0.35)]"
        >
          {/* Inner Card Background */}
          <div className="w-full bg-[#080911]/95 backdrop-blur-2xl p-8 rounded-[28px]">
            
            <h2 className="text-2xl font-bold text-white mb-6 lg:hidden">Create Account</h2>
            
            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
              <AuthInput label="Full Name" type="text" name="fullName" register={register} error={errors.fullName} isSuccess={touchedFields.fullName && !errors.fullName} />
              <AuthInput label="Email Address" type="email" name="email" register={register} error={errors.email} isSuccess={touchedFields.email && !errors.email} />
              <AuthInput label="Password" type="password" name="password" register={register} error={errors.password} isSuccess={touchedFields.password && !errors.password} />
              
              <div className="flex items-start gap-2 mt-2 px-1">
                <input type="checkbox" {...register("terms")} className="w-4 h-4 mt-0.5 rounded border border-white/20 bg-white/5 text-cyan-500 focus:ring-0 checked:bg-cyan-500 transition-colors" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 leading-snug">
                    I agree to the <Link to="/terms" className="text-cyan-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
                  </span>
                  {errors.terms && <span className="text-red-400 text-xs mt-1">{errors.terms.message}</span>}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="mt-4 h-12 w-full rounded-xl font-bold text-white transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}>
                <UserPlus className="w-5 h-5" /> {isSubmitting ? "Creating..." : "Create Account"}
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

            {/* 🔥 Links preserve state so direct links aren't lost if they switch between Login/Signup */}
            <p className="text-center text-sm text-gray-400 mt-8">
              Already have an account? <Link to="/login" state={{ from: location.state?.from }} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
            </p>

          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}