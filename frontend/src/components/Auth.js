import { useState, useEffect } from 'react';
import { getSupabase, initializeSupabase } from '../supabaseClient';
import logo from '../logo.svg';

export default function Auth() {
  const [session, setSession] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { supabase: client, config: cfg } = await initializeSupabase();
        setSupabase(client);
        setConfig(cfg);
        
        // Get initial session
        const { data: { session } } = await client.auth.getSession();
        setSession(session);
        
        // Listen for auth changes
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });
        
        setLoading(false);
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth setup error:', error);
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) return;
    const siteUrl = config?.deployUrl || config?.siteUrl || window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`
      }
    });
    if (error) console.error('Error:', error);
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error:', error);
  };

  if (loading) {
    return (
      <>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Loading Supabase configuration...</p>
      </>
    );
  }

  if (session) {
    return (
      <>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome, {session.user.email}!</p>
        <button onClick={signOut}>Sign Out</button>
      </>
    );
  }

  return (
    <>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Welcome to <code>bakery</code> - Supabase OAuth Demo
      </p>
      
      {/* Todo App Button */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '15px',
        margin: '30px 0',
        maxWidth: '400px'
      }}>
        <a href="/todos" style={{
          display: 'block',
          padding: '12px 16px',
          backgroundColor: '#2ea043',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #1b7c32',
          transition: 'all 0.2s ease'
        }}>
          📝 Todo App (OpenAI Powered)
        </a>
      </div>
      
      <button onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      {!config && <p style={{color: 'red', fontSize: '12px'}}>Config not loaded</p>}
      <p>
        <a
          className="App-link"
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Supabase
        </a>
      </p>
    </>
  );
}