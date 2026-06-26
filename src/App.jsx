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

const getQuickThemeFromMood = (text = '') => {
  const value = text.toLowerCase().replace(/\s/g, '');

  if (!value) return 'yellow';

  const themeRules = [
    {
      theme: 'tired',
      words: ['힘', '지침', '지쳐', '지친', '피곤', '버겁', '멘탈', '녹초', '고단', '탈진']
    },
    {
      theme: 'anxious',
      words: ['불안', '걱정', '초조', '긴장', '무섭', '떨려', '압박', '스트레스']
    },
    {
      theme: 'happy',
      words: ['기쁨', '행복', '좋', '신나', '즐거', '뿌듯', '상쾌', '개운']
    },
    {
      theme: 'focus',
      words: ['집중', '공부', '몰입', '과제', '시험', '작업', '마감', '해야', '할일', '코딩']
    },
    {
      theme: 'lethargic',
      words: ['무기력', '우울', '아무것도', '하기싫', '귀찮', '현타', '울적']
    },
    {
      theme: 'creative',
      words: ['설렘', '기대', '창의', '아이디어', '두근', '새로운']
    }
  ];

  const matched = themeRules.find((rule) =>
    rule.words.some((word) => value.includes(word))
  );

  return matched ? matched.theme : 'yellow';
};

export default function App() {
  const [activeWidgets, setActiveWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboard_active_widgets');
    return saved
      ? JSON.parse(saved)
      : {
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

  const [widgetSizes, setWidgetSizes] = useState(() => {
    const saved = localStorage.getItem('dashboard_widget_sizes');
    return saved
      ? JSON.parse(saved)
      : {
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

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dashboard_theme') || 'auto';
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const [activeMood, setActiveMood] = useState(() => {
    return localStorage.getItem('user_mood') || '';
  });

  const [todayFocus, setTodayFocus] = useState(() => {
    return localStorage.getItem('today_focus') || '';
  });

  const [globalWeather, setGlobalWeather] = useState('');

  const [autoThemeKey, setAutoThemeKey] = useState(() => {
    const saved = localStorage.getItem('dashboard_auto_theme_key');

    if (!saved || saved === 'undefined' || saved === 'null' || saved === 'lemonYellow') {
      return 'yellow';
    }

    return saved;
  });

  useEffect(() => {
    localStorage.setItem('dashboard_active_widgets', JSON.stringify(activeWidgets));
  }, [activeWidgets]);

  useEffect(() => {
    localStorage.setItem('dashboard_widget_sizes', JSON.stringify(widgetSizes));
  }, [widgetSizes]);

  useEffect(() => {
    localStorage.setItem('user_mood', activeMood);
  }, [activeMood]);

  useEffect(() => {
    localStorage.setItem('today_focus', todayFocus);
  }, [todayFocus]);

  useEffect(() => {
    localStorage.setItem('dashboard_auto_theme_key', autoThemeKey);
  }, [autoThemeKey]);

  useEffect(() => {
    localStorage.setItem('dashboard_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'auto') return;

    const quickTheme = getQuickThemeFromMood(activeMood);
    setAutoThemeKey(quickTheme);
  }, [activeMood, theme]);

  useEffect(() => {
    const appliedTheme = theme === 'auto' ? autoThemeKey : theme;
    document.body.className = `theme-${appliedTheme}`;
  }, [theme, autoThemeKey]);

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
    setIsEditMode((prev) => !prev);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const renderWidget = (key, Component) => {
    if (!activeWidgets[key]) return null;

    const spanSize = widgetSizes[key];
    const sizeClass = `span-${spanSize}`;

    const getWidgetProps = () => {
      switch (key) {
        case 'mood':
          return { activeMood, setActiveMood };

        case 'quote':
          return {
            activeMood,
            globalWeather,
            todayFocus,
            onAiThemeDetermined: setAutoThemeKey
          };

        case 'todayFocus':
          return { todayFocus, setTodayFocus };

        default:
          return {};
      }
    };

    return (
      <div className={`widget-container ${sizeClass} ${isEditMode ? 'edit-active' : ''}`}>
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

        <Component {...getWidgetProps()} />
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Header setGlobalWeather={setGlobalWeather} />

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