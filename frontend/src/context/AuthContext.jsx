import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setUserRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch the user's role from the backend whenever session changes
  useEffect(() => {
    async function fetchRole() {
      if (!session) {
        setUserRole(null);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/v1/users/${session.user.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const user = await res.json();
          setUserRole(user.role || 'User');
        }
      } catch {
        // silent — default to no role
      }
    }
    if (session) fetchRole();
  }, [session]);

  const isAdmin = userRole === 'Admin';
  const isContributor = userRole === 'Collaborator' || userRole === 'Admin';

  return (
    <AuthContext.Provider value={{ session, loading: session === undefined, userRole, isAdmin, isContributor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
