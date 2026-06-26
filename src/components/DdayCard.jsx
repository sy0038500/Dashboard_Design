import React, { useState, useEffect } from 'react';
import { Target, ChevronRight, Plus, Pencil, Trash2, X } from 'lucide-react';
import './DdayCard.css';

const DEFAULT_GOALS = [
  {
    id: 1,
    title: '저축 목표 달성 기한',
    targetDate: '2026-12-31',
    color: '#ff8a00'
  },
  {
    id: 2,
    title: 'AI 개발 자격증 시험',
    targetDate: '2026-08-15',
    color: '#00a3ff'
  },
  {
    id: 3,
    title: '여름 휴가 출발',
    targetDate: '2026-07-25',
    color: '#14b8a6'
  }
];

const COLOR_OPTIONS = [
  '#ff8a00',
  '#00a3ff',
  '#14b8a6',
  '#8b5cf6',
  '#f472b6',
  '#22c55e',
  '#facc15',
  '#ef4444'
];

export default function DdayCard() {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboard_dday_goals');
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftGoals, setDraftGoals] = useState(goals);

  useEffect(() => {
    localStorage.setItem('dashboard_dday_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (currentIndex >= goals.length) {
      setCurrentIndex(0);
    }
  }, [goals, currentIndex]);

  const calculateDday = (targetStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const handleNext = () => {
    if (goals.length <= 1) return;

    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % goals.length);
      setFade(true);
    }, 250);
  };

  const openEditor = (e) => {
    e.stopPropagation();
    setDraftGoals(goals);
    setIsModalOpen(true);
  };

  const closeEditor = () => {
    setIsModalOpen(false);
  };

  const handleDraftChange = (id, field, value) => {
    setDraftGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    );
  };

  const handleAddGoal = () => {
    const newGoal = {
      id: Date.now(),
      title: '새 목표',
      targetDate: '2026-12-31',
      color: '#14b8a6'
    };

    setDraftGoals((prev) => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id) => {
    setDraftGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const handleSaveGoals = () => {
    const cleanedGoals = draftGoals.filter(
      (goal) => goal.title.trim() && goal.targetDate
    );

    setGoals(cleanedGoals.length > 0 ? cleanedGoals : DEFAULT_GOALS);
    setIsModalOpen(false);
  };

  const currentGoal = goals[currentIndex] || DEFAULT_GOALS[0];
  const formattedDateString = currentGoal.targetDate.replace(/-/g, '.');

  return (
    <>
      <div
        className="dday-card glass-card"
        onClick={handleNext}
        title="클릭하여 다음 목표 보기"
      >
        <button
          className="dday-edit-btn"
          onClick={openEditor}
          title="D-day 편집"
        >
          <Pencil size={14} />
        </button>

        <div className={`dday-content-wrapper ${fade ? 'fade-in' : 'fade-out'}`}>
          <div className="dday-main">
            <div className="dday-info-side">
              <div className="dday-title-row">
                <Target
                  className="dday-icon"
                  size={18}
                  style={{ color: currentGoal.color }}
                />
                <span className="dday-title">{currentGoal.title}</span>
              </div>

              <div className="dday-date">목표일: {formattedDateString}</div>
            </div>

            <div
              className="dday-badge"
              style={{
                color: currentGoal.color,
                borderColor: currentGoal.color
              }}
            >
              {calculateDday(currentGoal.targetDate)}
            </div>
          </div>

          <div className="dday-footer">
            <span className="dday-pagination">
              {currentIndex + 1}/{goals.length}
            </span>
            <ChevronRight className="dday-arrow" size={14} />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="dday-modal-overlay" onClick={closeEditor}>
          <div className="dday-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="dday-modal-header">
              <h3>D-day 목표 관리</h3>
              <button className="dday-modal-close" onClick={closeEditor}>
                <X size={18} />
              </button>
            </div>

            <div className="dday-modal-body">
              {draftGoals.map((goal) => (
                <div className="dday-goal-form" key={goal.id}>
                  <div className="dday-form-top">
                    <input
                      type="text"
                      value={goal.title}
                      onChange={(e) =>
                        handleDraftChange(goal.id, 'title', e.target.value)
                      }
                      placeholder="목표 제목"
                      className="dday-input"
                    />

                    <input
                      type="date"
                      value={goal.targetDate}
                      onChange={(e) =>
                        handleDraftChange(goal.id, 'targetDate', e.target.value)
                      }
                      className="dday-input"
                    />

                    <button
                      className="dday-delete-btn"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="dday-color-list">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`dday-color-chip ${
                          goal.color === color ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleDraftChange(goal.id, 'color', color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <button className="dday-add-btn" onClick={handleAddGoal}>
                <Plus size={16} />
                목표 추가
              </button>
            </div>

            <div className="dday-modal-footer">
              <button className="dday-cancel-btn" onClick={closeEditor}>
                취소
              </button>
              <button className="dday-save-btn" onClick={handleSaveGoals}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}