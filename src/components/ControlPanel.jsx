import React, { useState, useEffect } from 'react';
import { Plus, Move, Settings, X, Check } from 'lucide-react';
import './ControlPanel.css';

export default function ControlPanel({
  activeWidgets,
  toggleWidget,
  isEditMode,
  toggleEditMode,
  currentTheme,
  changeTheme
}) {
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // 모달 스크롤 락
  useEffect(() => {
    if (showWidgetModal || showSettingsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showWidgetModal, showSettingsModal]);

  const widgetLabels = {
    clock: '🕒 실시간 시계',
    timer: '⏱️ 포커스 타이머',
    todayFocus: '🎯 오늘의 집중 과제',
    quote: '💬 오늘의 한마디 (AI)',
    dday: '📅 디데이 목표 캐러셀',
    mood: '☀️ 오늘의 기분 입력',
    todo: '📝 오늘 할 일 리스트',
    memo: '✏️ 자유 메모장'
  };

  return (
    <div className="control-panel-wrapper">
      <div className="control-panel glass-card">
        <button 
          className="control-btn" 
          onClick={() => setShowWidgetModal(true)}
          title="대시보드에 위젯을 추가하거나 숨깁니다."
        >
          <Plus size={16} />
          <span>위젯 추가</span>
        </button>

        <button 
          className={`control-btn ${isEditMode ? 'active' : ''}`} 
          onClick={toggleEditMode}
          title="위젯의 크기(너비)를 조절하는 모드를 켭니다."
        >
          <Move size={16} />
          <span>{isEditMode ? '편집 완료' : '레이아웃 편집'}</span>
        </button>

        <button 
          className="control-btn" 
          onClick={() => setShowSettingsModal(true)}
          title="대시보드 그라디언트 테마를 변경합니다."
        >
          <Settings size={16} />
          <span>설정</span>
        </button>
      </div>

      {/* 📦 위젯 추가 모달 */}
      {showWidgetModal && (
        <div className="modal-overlay" onClick={() => setShowWidgetModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>대시보드 위젯 관리</h3>
              <button className="modal-close-btn" onClick={() => setShowWidgetModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">대시보드에 노출할 위젯들을 선택해 주세요.</p>
              <div className="widget-toggle-list">
                {Object.keys(activeWidgets).map((key) => (
                  <div 
                    key={key} 
                    className={`widget-toggle-item ${activeWidgets[key] ? 'checked' : ''}`}
                    onClick={() => toggleWidget(key)}
                  >
                    <div className="widget-checkbox">
                      {activeWidgets[key] && <Check size={14} />}
                    </div>
                    <span className="widget-label-text">{widgetLabels[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ 설정 (테마 체인저) 모달 */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>대시보드 설정</h3>
              <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <h4 className="setting-section-title">배경 그라디언트 테마</h4>
              <div className="theme-selector-grid">
                <button 
                  className={`theme-select-btn theme-auto ${currentTheme === 'auto' ? 'selected' : ''}`}
                  onClick={() => changeTheme('auto')}
                  style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))', marginBottom: '8px' }}
                >
                  <div className="theme-preview auto-preview"></div>
                  <span>✨ 감정 기반 자동 테마 (Auto)</span>
                </button>

                <button 
                  className={`theme-select-btn theme-yellow ${currentTheme === 'yellow' ? 'selected' : ''}`}
                  onClick={() => changeTheme('yellow')}
                >
                  <div className="theme-preview yellow-preview"></div>
                  <span>Lemon Yellow</span>
                </button>

                <button 
                  className={`theme-select-btn theme-purple ${currentTheme === 'purple' ? 'selected' : ''}`}
                  onClick={() => changeTheme('purple')}
                >
                  <div className="theme-preview purple-preview"></div>
                  <span>Aurora Purple</span>
                </button>

                <button 
                  className={`theme-select-btn theme-blue ${currentTheme === 'blue' ? 'selected' : ''}`}
                  onClick={() => changeTheme('blue')}
                >
                  <div className="theme-preview blue-preview"></div>
                  <span>Deep Ocean</span>
                </button>

                <button 
                  className={`theme-select-btn theme-tired ${currentTheme === 'tired' ? 'selected' : ''}`}
                  onClick={() => changeTheme('tired')}
                >
                  <div className="theme-preview tired-preview"></div>
                  <span>Calm Blue</span>
                </button>

                <button 
                  className={`theme-select-btn theme-anxious ${currentTheme === 'anxious' ? 'selected' : ''}`}
                  onClick={() => changeTheme('anxious')}
                >
                  <div className="theme-preview anxious-preview"></div>
                  <span>Lavender</span>
                </button>

                <button 
                  className={`theme-select-btn theme-happy ${currentTheme === 'happy' ? 'selected' : ''}`}
                  onClick={() => changeTheme('happy')}
                >
                  <div className="theme-preview happy-preview"></div>
                  <span>Sunny Orange</span>
                </button>

                <button 
                  className={`theme-select-btn theme-focus ${currentTheme === 'focus' ? 'selected' : ''}`}
                  onClick={() => changeTheme('focus')}
                >
                  <div className="theme-preview focus-preview"></div>
                  <span>Deep Green</span>
                </button>

                <button 
                  className={`theme-select-btn theme-lethargic ${currentTheme === 'lethargic' ? 'selected' : ''}`}
                  onClick={() => changeTheme('lethargic')}
                >
                  <div className="theme-preview lethargic-preview"></div>
                  <span>Midnight</span>
                </button>

                <button 
                  className={`theme-select-btn theme-creative ${currentTheme === 'creative' ? 'selected' : ''}`}
                  onClick={() => changeTheme('creative')}
                >
                  <div className="theme-preview creative-preview"></div>
                  <span>Pink Pop</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
