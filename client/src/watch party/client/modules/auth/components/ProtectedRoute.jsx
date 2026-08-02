import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // 🔥 URL se token check karo (jo main website se aaya hai)
  const externalToken = searchParams.get('token');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🔥 AGAR USER LOGGED IN HAI YA MAIN WEBSITE SE AUTHENTICATED HOKAR AAYA HAI
  if (isAuthenticated || externalToken) {
    return children; // Seedha Room dikhao!
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
}