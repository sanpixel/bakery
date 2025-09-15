import React, { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Fetch todos on component mount
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
      // Send to OpenAI chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();
      setAiResponse(data.aiResponse);
      
      // Refresh todos list
      await fetchTodos();
      setInputText('');
    } catch (error) {
      console.error('Error processing input:', error);
    }
    setLoading(false);
  };

  const toggleTodo = async (id, completed) => {
    try {
      const todo = todos.find(t => t.id === id);
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: todo.description,
          completed: !completed
        }),
      });
      await fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Bakery Todo App</h1>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter tasks or describe what you need to do..."
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #61dafb',
              borderRadius: '8px',
              outline: 'none'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#61dafb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processing...' : 'Add Tasks'}
          </button>
        </div>
      </form>

      {/* AI Response */}
      {aiResponse && (
        <div style={{
          backgroundColor: '#f0f8ff',
          border: '1px solid #61dafb',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3>AI Response:</h3>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px' }}>
            {aiResponse}
          </p>
        </div>
      )}

      {/* Todo list */}
      <div>
        <h2>Todo Items ({todos.length})</h2>
        {todos.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No todos yet. Add some tasks above!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  backgroundColor: todo.completed ? '#f0f8f0' : '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  gap: '15px'
                }}
              >
                <span style={{
                  backgroundColor: '#61dafb',
                  color: 'white',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {todo.item_number}
                </span>
                
                <span style={{
                  flex: 1,
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#666' : '#000'
                }}>
                  {todo.description}
                </span>
                
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: todo.completed ? '#ffa500' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {todo.completed ? 'Undo' : 'Done'}
                </button>
                
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#61dafb' }}>← Back to Auth</a>
      </div>
    </div>
  );
}

export default TodoApp;