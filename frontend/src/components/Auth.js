import { useState, useEffect } from 'react';
import { getSupabase, initializeSupabase } from '../supabaseClient';
import logo from '../logo.svg';
import TodoCard from './TodoCard';
import AICard from './AICard';

export default function Auth() {
  const [session, setSession] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [refreshTodos, setRefreshTodos] = useState(0);
  const handleTodoAdded = () => setRefreshTodos(prev => prev + 1);

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
        
        {/* Google-style user info card with sign out */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px auto',
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e8eaed',
          maxWidth: '280px',
          fontSize: '13px'
        }}>
          {session.user.user_metadata?.picture && (
            <img 
              src={session.user.user_metadata.picture} 
              alt="Profile" 
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid #e8eaed',
                flexShrink: 0
              }}
            />
          )}
          <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '500', 
              color: '#202124',
              marginBottom: '1px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {session.user.user_metadata?.full_name || session.user.email}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#5f6368',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {session.user.email}
            </div>
          </div>
          <button 
            onClick={signOut}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #dadce0',
              borderRadius: '3px',
              padding: '4px 8px',
              fontSize: '10px',
              color: '#3c4043',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            Sign Out
          </button>
        </div>
        <div style={{margin: '20px 0'}} />
        
        {/* CodeWallet Link */}
        <div style={{margin: '20px 0'}}>
          <a 
            href="/codewallet" 
            style={{
              display: 'inline-block',
              backgroundColor: '#4285f4',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            🏨 Open CodeWallet Hotel Rate Finder
          </a>
        </div>
        
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
          <TodoCard key={refreshTodos} />
          <AICard onTodoAdded={handleTodoAdded} />
        </div>
      </>
    );
  }

  return (
    <>
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Welcome to <code>bakery</code> - Supabase OAuth Demo
      </p>
      <button 
        onClick={signInWithGoogle} 
        disabled={!supabase}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
      {!config && <p style={{color: 'red', fontSize: '12px'}}>Config not loaded</p>}
      <div style={{margin: '20px 0'}} />
      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        <TodoCard key={refreshTodos} />
        <AICard onTodoAdded={handleTodoAdded} />
      </div>
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