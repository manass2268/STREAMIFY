import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Isey replace kar de
import { Globe } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';

// 1. Setup Zod Validation Schema (To test error animations)
const testSchema = z.object({
  email: z.string().email({ message: "Invalid email address! Try again." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." })
});

export default function TestAuth() {
  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(testSchema),
    mode: "onChange" // Live validation on typing
  });

  const onSubmit = (data) => {
    console.log("Form Data Valid!", data);
    alert("Validation Passed! Check console.");
  };

  return (
    <AuthLayout>
      {/* Glass Card Container */}
      <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Component Test</h2>
        <p className="text-sm text-gray-400 mb-8">Test your floating labels, validation glow, and buttons here.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          
          {/* Test AuthInput (Email) */}
          <AuthInput 
            label="Email Address" 
            type="email" 
            name="email"
            register={register}
            error={errors.email}
            isSuccess={touchedFields.email && !errors.email}
            placeholder="name@example.com"
          />

          {/* Test AuthInput (Password) */}
          <AuthInput 
            label="Password" 
            type="password" 
            name="password"
            register={register}
            error={errors.password}
            isSuccess={touchedFields.password && !errors.password}
            placeholder="Enter your password"
          />

          {/* Normal Submit Button to trigger validation */}
          <button 
            type="submit" 
            className="mt-4 h-12 w-full rounded-xl font-bold text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}
          >
            Test Validation
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-white/10 flex-grow"></div>
          <span className="text-xs text-gray-500 font-medium">OR</span>
          <div className="h-px bg-white/10 flex-grow"></div>
        </div>

        {/* Test Social Button */}
        <SocialButton 
          provider="globe" 
          icon={<Globe className="w-5 h-5" />} 
          onClick={() => console.log("Social Button Clicked")} 
        />
        
      </div>
    </AuthLayout>
  );
}