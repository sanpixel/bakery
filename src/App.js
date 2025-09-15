import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TodoApp from './components/TodoApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/todos" />} />
        <Route path="/todos" element={<TodoApp />} />
      </Routes>
    </Router>
  );
}

export default App;