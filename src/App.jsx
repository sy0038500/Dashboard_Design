import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ClockCard from './components/ClockCard';
import QuoteCard from './components/QuoteCard';
import TimerCard from './components/TimerCard';
import DdayCard from './components/DdayCard';
import TodayFocusCard from './components/TodayFocusCard';
import MoodCard from './components/MoodCard';
import TodoCard from './components/TodoCard';
import MemoCard from './components/MemoCard';
import './App.css';

export default function App() {
  // 1. 위젯 활성화 상태 관리 (localStorage 동기화)
  const [activeWidgets, setActiveWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboard_active_widgets');
    return saved ? JSON.parse(saved) : {
      clock: true,
      timer: true,
      todayFocus: true,
      quote: true,
      dday: true,
      mood: true,
      todo: true,
      memo: true
    };
  });

  // 2. 위젯 크기(너비 span) 상태 관리 (localStorage 동기화)
  const [widgetSizes, setWidgetSizes] = useState(() => {
    const saved = localStorage.getItem('dashboard_widget_sizes');
    return saved ? JSON.parse(saved) : {
      clock: 1,
      timer: 1,
      todayFocus: 1,
      quote: 1,
      dday: 1,
      mood: 1,
      todo: 1,
      memo: 1
    };
  });

  // 3. 테마 상태 관리 (기본값: yellow)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dashboard_theme') || 'yellow';
  });

  // 4. 레이아웃 편집 모드 활성화 여부
  const [isEditMode, setIsEditMode] = useState(false);

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    localStorage.setItem('dashboard_active_widgets', JSON.stringify(activeWidgets));
  }, [activeWidgets]);

  useEffect(() => {
    localStorage.setItem('dashboard_widget_sizes', JSON.stringify(widgetSizes));
  }, [widgetSizes]);

  useEffect(() => {
    localStorage.setItem('dashboard_theme', theme);
    // body 태그 클래스에 테마 바인딩
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const toggleWidget = (key) => {
    setActiveWidgets((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const changeWidgetSize = (key, size) => {
    setWidgetSizes((prev) => ({
      ...prev,
      [key]: size
    }));
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // 위젯 래퍼 생성기 (편집 모드 오버레이 포함)
  const renderWidget = (key, Component) => {
    if (!activeWidgets[key]) return null;

    const spanSize = widgetSizes[key]; // 1, 2, 3
    const sizeClass = `span-${spanSize}`;

    return (
      <div className={`widget-container ${sizeClass} ${isEditMode ? 'edit-active' : ''}`}>
        {/* 레이아웃 편집용 오버레이 조작 바 */}
        {isEditMode && (
          <div className="widget-size-control">
            <span className="control-label">너비 조절</span>
            <div className="size-btn-group">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  className={`size-btn ${spanSize === s ? 'active' : ''}`}
                  onClick={() => changeWidgetSize(key, s)}
                >
                  {s}단
                </button>
              ))}
            </div>
          </div>
        )}
        <Component />
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* 상단 칩 헤더 */}
      <Header />

      {/* 대시보드 플랫 그리드 영역 */}
      <main className={`dashboard-grid ${isEditMode ? 'grid-editing' : ''}`}>
        {renderWidget('clock', ClockCard)}
        {renderWidget('quote', QuoteCard)}
        {renderWidget('timer', TimerCard)}
        {renderWidget('dday', DdayCard)}
        {renderWidget('todayFocus', TodayFocusCard)}
        {renderWidget('mood', MoodCard)}
        {renderWidget('todo', TodoCard)}
        {renderWidget('memo', MemoCard)}
      </main>

      {/* 🛠️ 위젯/레이아웃/설정 관리 패널 (하단 배치) */}
      <ControlPanel
        activeWidgets={activeWidgets}
        toggleWidget={toggleWidget}
        isEditMode={isEditMode}
        toggleEditMode={toggleEditMode}
        currentTheme={theme}
        changeTheme={changeTheme}
      />
    </div>
  );
}

