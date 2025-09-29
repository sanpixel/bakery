import React, { useState } from 'react';
import './TodoCard.css'; // Reuse the same styles

const AICard = ({ onTodoAdded }) => {
  const [aiInput, setAiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAISubmit(e);
    }
  };

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: aiInput }),
      });

      if (response.ok) {
        setAiInput('');
        if (onTodoAdded) onTodoAdded(); // Refresh todo list
      }
    } catch (error) {
      console.error('AI request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="todo-card">
      <div className="card-header">
        <div className="todo-title">🤖 AI Assistant</div>
        <div className="todo-count">Shakespeare</div>
      </div>

      <div className="todo-body">
        <form onSubmit={handleAISubmit} className="add-todo-form" style={{flexDirection: 'column', gap: '8px'}}>
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell AI what you need to do... (Ctrl+Enter to submit)"
            className="todo-input"
            disabled={isLoading}
            rows={6}
            style={{
              resize: 'vertical',
              minHeight: '60px',
              fontFamily: 'inherit'
            }}
          />
          <button 
            type="submit" 
            className="add-btn"
            disabled={isLoading || !aiInput.trim()}
            style={{
              backgroundColor: isLoading ? '#6c757d' : '#28a745',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        <div className="empty-todos">
          Ask AI to create todos for you in Shakespeare style!
        </div>
      </div>
    </div>
  );
};

export default AICard;