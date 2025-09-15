import React, { useState, useEffect } from 'react';
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setAiResponse('');

    try {
      // Call OpenAI endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const result = await response.json();
      setAiResponse(result.aiResponse || 'No response received');

      // Refresh todos after potential creation
      await fetchTodos();
      setInputText('');
    } catch (error) {
      console.error('Error processing request:', error);
      setAiResponse('Error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });
      await fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      await fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="todo-app">
      <header className="todo-header">
        <h1>Todo App</h1>
        <p>AI-powered task management with intelligent text parsing</p>
      </header>

      <main className="todo-main">
        {/* Text Input Section - Like SurveyDisco */}
        <div className="text-input-container">
          <form onSubmit={handleSubmit} className="text-input-form">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Copy and paste your tasks or just type what you need to do and I'll help organize it into tasks... (Ctrl+Enter to process)"
              className="text-input"
              rows={6}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
            <div className="text-input-actions">
              <button 
                type="submit" 
                disabled={!inputText.trim() || loading}
                className="process-btn"
              >
                {loading ? 'Processing...' : 'Add Tasks'}
              </button>
              <button 
                type="button" 
                onClick={() => setInputText('')}
                disabled={!inputText || loading}
                className="clear-btn"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* AI Response Section */}
        {aiResponse && (
          <div className="ai-response-container">
            <h3>AI Response:</h3>
            <div className="ai-response">{aiResponse}</div>
          </div>
        )}

        {/* Todo Cards Grid - Like SurveyDisco ProjectCards */}
        <div className="todos-grid">
          {todos.length === 0 ? (
            <div className="empty-state">
              No tasks yet. Add some using the text input above!
            </div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-card-header">
                  <div className="todo-number">#{todo.item_number}</div>
                  <div className="todo-status">{todo.completed ? '✅ Done' : '🔘 Active'}</div>
                </div>
                
                <div className="todo-card-body">
                  <div className="todo-description">{todo.description}</div>
                </div>
                
                <div className="todo-card-actions">
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`btn-action ${todo.completed ? 'btn-undo' : 'btn-done'}`}
                  >
                    {todo.completed ? 'Undo' : 'Mark Done'}
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="btn-action btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="back-link">
          <a href="/">← Back to Auth</a>
        </div>
      </main>
    </div>
  );
}

export default TodoApp;