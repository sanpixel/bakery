import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import AuthCallback from './components/AuthCallback';
import './App.css';

function App() {
  const DEBUG = true; // Set to false to hide debug info
  
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {DEBUG && (
            <div style={{fontSize: '12px', textAlign: 'left', margin: '20px', border: '1px solid #61dafb', padding: '10px'}}>
              <h3>Environment Debug</h3>
              <p>REACT_APP_SUPABASE_URL: {process.env.REACT_APP_SUPABASE_URL || 'NOT SET'}</p>
              <p>REACT_APP_SUPABASE_ANON_KEY: {process.env.REACT_APP_SUPABASE_ANON_KEY || 'NOT SET'}</p>
              <p>REACT_APP_SITE_URL: {process.env.REACT_APP_SITE_URL || 'NOT SET'}</p>
              <p>
                <a href="/api/debug/env" target="_blank" style={{color: '#61dafb'}}>
                  Check .env file content
                </a>
              </p>
              <p>
                <a href="/api/config" target="_blank" style={{color: '#61dafb'}}>
                  Check runtime config
                </a>
              </p>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
          <div style={{fontSize: '10px', textAlign: 'center', margin: '20px'}}>
            <a href="/files" target="_blank" style={{color: '#61dafb', textDecoration: 'none'}}>
              Browse container files
            </a>
          </div>
        </header>
      </div>
    </Router>
  );
}

export default App;
