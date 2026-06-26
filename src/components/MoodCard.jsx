import React, { useState, useEffect } from 'react';
import { CloudSun, Sun } from 'lucide-react';
import './MoodCard.css';

// 몰입 아이콘은 피그마의 두 개의 마주보는/갈라진 반원 형태를 위해 커스텀 SVG로 구현합니다.
const FocusIcon = ({ size = 20, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10V2z" fill="currentColor" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10V2z" fill="currentColor" />
  </svg>
);

export default function MoodCard({ activeMood, setActiveMood }) {
  const selectMood = (moodName) => {
    if (activeMood === moodName) {
      setActiveMood(''); // 이미 선택된 것을 누르면 취소
    } else {
      setActiveMood(moodName);
    }
  };

  return (
    <div className="mood-card glass-card">
      <h3 className="mood-title">오늘의 기분/상황 입력</h3>
      <div className="mood-input-container">
        <input 
          type="text" 
          className="mood-input" 
          placeholder="예: 지침, 집중, 설렘..." 
          value={activeMood} 
          onChange={(e) => setActiveMood(e.target.value)}
        />
      </div>
      <div className="mood-options">
        <button
          className={`mood-btn glass-card ${activeMood === '평온' ? 'active-peace' : ''}`}
          onClick={() => selectMood('평온')}
          title="평온함"
        >
          <CloudSun className="mood-icon icon-peace" size={24} />
          <span className="mood-text">평온</span>
        </button>

        <button
          className={`mood-btn glass-card ${activeMood === '기쁨' ? 'active-joy' : ''}`}
          onClick={() => selectMood('기쁨')}
          title="기쁨"
        >
          <Sun className="mood-icon icon-joy" size={24} />
          <span className="mood-text">기쁨</span>
        </button>

        <button
          className={`mood-btn glass-card ${activeMood === '몰입' ? 'active-focus' : ''}`}
          onClick={() => selectMood('몰입')}
          title="몰입"
        >
          <FocusIcon className="mood-icon icon-focus" size={24} />
          <span className="mood-text">몰입</span>
        </button>
      </div>
    </div>
  );
}
