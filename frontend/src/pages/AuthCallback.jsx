import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/home', { replace: true });
      } else if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,#0d0b1e_0%,#050508_100%)] flex items-center justify-center">
      <p className="text-[#8b5cf6] text-lg font-semibold animate-pulse">Signing you in...</p>
    </div>
  );
}
