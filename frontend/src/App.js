import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import AuthCallback from './components/AuthCallback';
import TodoApp from './components/TodoApp';
import './App.css';

function App() {
  const DEBUG = true; // Set to false to hide debug info
  
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {DEBUG && (
            <div style={{fontSize: '12px', textAlign: 'left', margin: '20px', border: '1px solid #61dafb', padding: '10px'}}>
              <h3>Configuration Debug</h3>
              <p><strong>Runtime Config Approach:</strong> Supabase configuration loaded from backend</p>
              <p>Config source: <code>/api/config</code> endpoint</p>
              <p>
                <a href="/api/config" target="_blank" style={{color: '#61dafb'}}>
                  View runtime configuration →
                </a>
              </p>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/todos" element={<TodoApp />} />
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
