import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './modules/auth/pages/Login';
import Signup from './modules/auth/pages/Signup';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import OTPVerification from './modules/auth/pages/OTPVerification';
import { AuthProvider } from './modules/auth/contexts/AuthContext';
// 🔥 Import Guard
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import logo from './assets/logo1.png';

const DummyRoom = () => (
  <div className="min-h-screen bg-[#05060A] text-white flex flex-col items-center justify-center p-4 text-center">
    <div className="relative flex items-center justify-center mb-6">
      <div className="absolute w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-ping"></div>
      <img src={logo} alt="Streamify Logo" className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(139,92,246,0.6)] animate-pulse" />
    </div>
    <h1 className="text-3xl font-bold text-cyan-400">Streamify Watch Party Room</h1>
    <p className="text-gray-400 mt-2 max-w-md">Room routing is working! You were automatically connected here.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp" element={<OTPVerification />} />
          
          {/* 🔥 Guarded Room Route: Will Auto-Redirect Direct Links via Login/Signup! */}
          <Route 
            path="/room/:roomId" 
            element={
              <ProtectedRoute>
                <DummyRoom />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}