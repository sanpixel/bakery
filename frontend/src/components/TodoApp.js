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
        body: JSON.stringify({ text: inputText }),
      });

      const result = await response.json();
      setAiResponse(result.response || 'No response received');

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
        <div className="cards-container">
          
          {/* Text Input Card */}
          <div className="card input-card">
            <div className="card-header">
              <h2 className="card-title">📝 Add Tasks</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type what you need to do... I'll help organize it into tasks!"
                  disabled={loading}
                  className="text-input"
                  rows="4"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="submit-btn"
                >
                  {loading ? 'Processing...' : 'Add Tasks'}
                </button>
              </form>
            </div>
          </div>

          {/* AI Response Card */}
          {aiResponse && (
            <div className="card response-card">
              <div className="card-header">
                <h2 className="card-title">🤖 AI Response</h2>
              </div>
              <div className="card-body">
                <div className="ai-response">{aiResponse}</div>
              </div>
            </div>
          )}

          {/* Todo List Card */}
          <div className="card todos-card">
            <div className="card-header">
              <h2 className="card-title">✅ Tasks ({todos.length})</h2>
            </div>
            <div className="card-body">
              {todos.length === 0 ? (
                <div className="empty-state">
                  No tasks yet. Add some using the text input above!
                </div>
              ) : (
                <div className="todo-list">
                  {todos.map((todo) => (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                      <div className="todo-number">{todo.item_number}</div>
                      <div className="todo-content">
                        <span className="todo-text">{todo.description}</span>
                      </div>
                      <div className="todo-actions">
                        <button
                          onClick={() => toggleTodo(todo.id, todo.completed)}
                          className={`action-btn ${todo.completed ? 'undo-btn' : 'done-btn'}`}
                        >
                          {todo.completed ? 'Undo' : 'Done'}
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="back-link">
          <a href="/">← Back to Auth</a>
        </div>
      </main>
    </div>
  );
}

export default TodoApp;