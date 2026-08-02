import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email to reset password." })
});

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(resetSchema),
    mode: "onChange"
  });

  const onSubmit = (data) => {
    console.log("Reset link requested for:", data.email);
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md mx-auto bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative">
        
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <KeyRound className="w-6 h-6 text-purple-400" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Reset Password</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <AuthInput label="Email Address" type="email" name="email" register={register} error={errors.email} isSuccess={touchedFields.email && !errors.email} />
          
          <button type="submit" className="mt-4 h-12 w-full rounded-xl font-bold text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-95" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}>
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <Link to="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}