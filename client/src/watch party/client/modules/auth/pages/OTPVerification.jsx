import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmit = () => {
    const code = otp.join('');
    console.log("Verifying OTP Code:", code);
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring" }} className="w-full max-w-md mx-auto bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative flex flex-col items-center text-center">
        
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Verify Identity</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-[280px]">
          We've sent a 6-digit verification code to your email. Enter it below to continue.
        </p>

        <div className="flex gap-2 sm:gap-3 mb-8 w-full justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:bg-white/10 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] outline-none transition-all"
            />
          ))}
        </div>

        <button 
          onClick={onSubmit}
          disabled={otp.join('').length !== 6}
          className="h-12 w-full rounded-xl font-bold text-white transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2" 
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
        >
          Verify Code <ArrowRight className="w-4 h-4" />
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Didn't receive the code? <button className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Resend</button>
        </p>
      </motion.div>
    </AuthLayout>
  );
}