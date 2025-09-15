import React, { useState, useEffect } from 'react';
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTodo, setNewTodo] = useState('');

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
      // Refresh todos after potential creation
      await fetchTodos();
      setInputText('');
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newTodo }),
      });
      if (response.ok) {
        await fetchTodos();
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
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
    <div className="App">
      <main className="App-main">
        <div className="text-input-container">
          <form onSubmit={handleSubmit} className="text-input-form">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type what you need to do..."
              className="text-input"
              rows={4}
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
                {loading ? 'Processing...' : 'Add'}
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

        <div className="todo-card">
          <div className="card-header">
            <div className="todo-count">{todos.length} items</div>
          </div>

          <div className="todo-body">
            <form onSubmit={addTodo} className="add-todo-form">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add item..."
                className="todo-input"
              />
              <button type="submit" className="add-btn">Add</button>
            </form>

            <div className="todo-list">
              {todos.map((todo) => (
                <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <span className="todo-number">{todo.item_number}.</span>
                  <span className="todo-text">{todo.description}</span>
                  <div className="todo-actions">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="todo-checkbox"
                    />
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="delete-todo-btn"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {todos.length === 0 && (
              <div className="empty-todos">
                No items yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TodoApp;