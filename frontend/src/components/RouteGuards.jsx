import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only accessible when logged in — otherwise redirect to /auth
export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return null; // Wait for session check to finish
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

// Only accessible when NOT logged in — otherwise redirect to /home
export function GuestRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/home" replace />;
  return children;
}
