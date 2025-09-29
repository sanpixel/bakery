import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          navigate('/');
          return;
        }

        if (data.session) {
          console.log('User authenticated:', data.session.user);
          navigate('/'); // redirect back to home
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('AuthCallback error:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <div>Completing authentication...</div>;
}