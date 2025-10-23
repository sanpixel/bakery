import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import Auth from './components/Auth';
import AuthCallback from './components/AuthCallback';
import CodeWalletApp from './components/CodeWalletApp';
import './App.css';

// Newspaper-style theme for CodeWallet
const theme = createTheme({
  fontFamily: 'Georgia, serif',
  headings: {
    fontFamily: 'Times New Roman, serif',
    fontWeight: 700,
  },
  colors: {
    newspaper: [
      '#f8f9fa',
      '#e9ecef', 
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529',
      '#000000'
    ]
  },
  primaryColor: 'newspaper',
  defaultRadius: 'sm',
});

function App() {
  const DEBUG = true; // Set to false to hide debug info
  
  return (
    <MantineProvider theme={theme}>
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
              <Route path="/codewallet" element={<CodeWalletApp />} />
            </Routes>
            <div style={{fontSize: '10px', textAlign: 'center', margin: '20px'}}>
              <a href="/files" target="_blank" style={{color: '#61dafb', textDecoration: 'none'}}>
                Browse container files
              </a>
            </div>
          </header>
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;
