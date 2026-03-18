import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only accessible when logged in — otherwise redirect to /auth with redirect param
export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!session) return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}

// Only accessible when NOT logged in — otherwise redirect to /home
export function GuestRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/home" replace />;
  return children;
}
