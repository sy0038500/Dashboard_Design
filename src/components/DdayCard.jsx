import React, { useState, useEffect } from 'react';
import { Target, ChevronRight, Compass, Trophy } from 'lucide-react';
import './DdayCard.css';

const GOALS = [
  {
    id: 1,
    title: "저축 목표 달성 기한",
    targetDate: "2026-12-31",
    icon: Target,
    color: "#e88024"
  },
  {
    id: 2,
    title: "AI 개발 자격증 시험",
    targetDate: "2026-08-15",
    icon: Compass,
    color: "#0184c7"
  },
  {
    id: 3,
    title: "여름 휴가 출발",
    targetDate: "2026-07-25",
    icon: Trophy,
    color: "#0d9488"
  }
];

export default function DdayCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const calculateDday = (targetStr) => {
    const today = new Date();
    // 시간 부분을 제거하여 날짜 단위로 정확한 D-day 계산
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "D-Day";
    } else if (diffDays > 0) {
      return `D-${diffDays}`;
    } else {
      return `D+${Math.abs(diffDays)}`;
    }
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % GOALS.length);
      setFade(true);
    }, 300);
  };

  const currentGoal = GOALS[currentIndex];
  const IconComponent = currentGoal.icon;
  const formattedDateString = currentGoal.targetDate.replace(/-/g, '.');

  return (
    <div className="dday-card glass-card" onClick={handleNext} title="클릭하여 다음 목표 보기">
      <div className={`dday-content-wrapper ${fade ? 'fade-in' : 'fade-out'}`}>
        <div className="dday-main">
          <div className="dday-info-side">
            <div className="dday-title-row">
              <IconComponent className="dday-icon" size={18} style={{ color: currentGoal.color }} />
              <span className="dday-title">{currentGoal.title}</span>
            </div>
            <div className="dday-date">목표일: {formattedDateString}</div>
          </div>
          <div className="dday-badge">
            {calculateDday(currentGoal.targetDate)}
          </div>
        </div>
        <div className="dday-footer">
          <span className="dday-pagination">
            {currentIndex + 1}/{GOALS.length}
          </span>
          <ChevronRight className="dday-arrow" size={14} />
        </div>
      </div>
    </div>
  );
}
