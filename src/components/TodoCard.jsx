import React, { useState, useEffect } from 'react';
import { ListTodo, Trash2, Check } from 'lucide-react';
import './TodoCard.css';

export default function TodoCard() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('user_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    localStorage.setItem('user_todos', JSON.stringify(todos));
  }, [todos]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const handleToggle = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDelete = (id, e) => {
    e.stopPropagation(); // 버블링 방지
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="todo-card glass-card">
      <div className="todo-header">
        <div className="todo-title-row">
          <ListTodo className="todo-title-icon" size={18} />
          <h3 className="todo-title">오늘 할 일</h3>
        </div>
        <div className="todo-stats">
          완료 {completedCount} / 전체 {totalCount}
        </div>
      </div>

      <div className="todo-list-container">
        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
                onClick={() => handleToggle(todo.id)}
              >
                <div className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}>
                  {todo.completed && <Check size={12} className="todo-check-icon" />}
                </div>
                <span className="todo-text">{todo.text}</span>
                <button
                  className="todo-delete-btn"
                  onClick={(e) => handleDelete(todo.id, e)}
                  title="삭제"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="todo-empty">등록된 할 일이 없습니다.</div>
        )}
      </div>

      <form className="todo-input-form" onSubmit={handleAdd}>
        <input
          type="text"
          className="todo-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="새로운 할 일을 입력하세요."
          maxLength={50}
        />
        <button type="submit" className="todo-add-btn">
          추가
        </button>
      </form>
    </div>
  );
}
