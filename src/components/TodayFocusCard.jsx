import React, { useState, useEffect } from 'react';
import { Check, Edit2, Trash2, Plus } from 'lucide-react';
import './TodayFocusCard.css';

export default function TodayFocusCard() {
  const [focusItem, setFocusItem] = useState(() => {
    return localStorage.getItem('today_focus') || '';
  });
  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem('today_focus_completed') === 'true';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(focusItem);

  useEffect(() => {
    localStorage.setItem('today_focus', focusItem);
  }, [focusItem]);

  useEffect(() => {
    localStorage.setItem('today_focus_completed', isCompleted);
  }, [isCompleted]);

  const handleSave = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setFocusItem(inputValue.trim());
      setIsCompleted(false);
      setIsEditing(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    setInputValue(focusItem);
    setIsEditing(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    setFocusItem('');
    setIsCompleted(false);
    setInputValue('');
  };

  const toggleComplete = () => {
    if (!isEditing && focusItem) {
      setIsCompleted(!isCompleted);
    }
  };

  return (
    <div className={`today-focus-card glass-card ${isCompleted ? 'completed' : ''} ${!focusItem ? 'empty' : ''}`} onClick={toggleComplete}>
      {/* Absolute Badge */}
      <div className="focus-badge">TODAY FOCUS</div>

      {isEditing ? (
        <form className="focus-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
          <input
            type="text"
            className="focus-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="오늘의 핵심 과제를 입력하세요..."
            autoFocus
            maxLength={40}
          />
          <button type="submit" className="focus-save-btn">저장</button>
        </form>
      ) : (
        <div className="focus-content">
          {focusItem ? (
            <div className="focus-task-row">
              <div className={`focus-checkbox ${isCompleted ? 'checked' : ''}`}>
                {isCompleted && <Check size={14} className="check-icon" />}
              </div>
              <span className={`focus-task-text ${isCompleted ? 'line-through' : ''}`}>
                {focusItem}
              </span>
              <div className="focus-actions">
                <button className="focus-action-btn edit" onClick={handleEdit} title="수정">
                  <Edit2 size={14} />
                </button>
                <button className="focus-action-btn delete" onClick={handleDelete} title="삭제">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="focus-empty-state" onClick={() => setIsEditing(true)}>
              <p className="focus-empty-text">
                오늘 집중할 핵심 일과가 없습니다.<br />
                <span>이곳을 클릭해 추가해 보세요.</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
