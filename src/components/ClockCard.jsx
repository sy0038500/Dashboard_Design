import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ClockCard.css';

export default function ClockCard() {
  const [time, setTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date()); // 달력 이동용 상태
  const calendarRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 달력 외의 영역을 클릭했을 때 달력을 위로 접으며 닫는 이벤트 리스너
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        !event.target.closest('.clock-date')
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showCalendar]);

  const formatAmPm = (date) => {
    let hours = date.getHours();
    return hours >= 12 ? '오후' : '오전';
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? '0' + hours : hours;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${strHours}:${strMinutes}`;
  };

  const formatSeconds = (date) => {
    const seconds = date.getSeconds();
    return seconds < 10 ? '0' + seconds : seconds;
  };

  const formatDate = (date) => {
    const years = date.getFullYear();
    const months = date.getMonth() + 1;
    const days = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${years}년 ${months}월 ${days}일 (${weekday})`;
  };

  // 달력 계산 로직
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (e, offset) => {
    e.stopPropagation(); // 클릭 이벤트 카드 전파 차단
    const nextDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1);
    setCalendarDate(nextDate);
  };

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // 빈 칸 채우기 (첫 주 시작 전 요일 공백)
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // 일자 채우기
    const today = new Date();
    for (let d = 1; d <= totalDays; d++) {
      const isToday = 
        today.getDate() === d && 
        today.getMonth() === month && 
        today.getFullYear() === year;
        
      days.push(
        <div key={`day-${d}`} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <span>{d}</span>
        </div>
      );
    }
    
    return days;
  };

  const handleDateClick = () => {
    // 달력을 열 때 현재 시간 기준으로 달력 이동용 상태 동기화
    if (!showCalendar) {
      setCalendarDate(new Date(time));
    }
    setShowCalendar(!showCalendar);
  };

  return (
    <div className="clock-card-wrapper">
      <div className="clock-card glass-card">
        <div className="clock-date clickable" onClick={handleDateClick} title="클릭하여 달력 열기/닫기">
          {formatDate(time)}
        </div>
        <div className="clock-time-container">
          <span className="clock-ampm">{formatAmPm(time)}</span>
          <span className="clock-time">{formatTime(time)}</span>
          <span className="clock-seconds">{formatSeconds(time)}</span>
        </div>
      </div>

      {/* 애니메이션 대응을 위해 렌더링을 유지하고 클래스로 토글 처리 */}
      <div 
        ref={calendarRef}
        className={`calendar-dropdown glass-card ${showCalendar ? 'show' : ''}`}
      >
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={(e) => changeMonth(e, -1)}>
            <ChevronLeft size={16} />
          </button>
          <div className="calendar-current-month">
            {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
          </div>
          <button className="calendar-nav-btn" onClick={(e) => changeMonth(e, 1)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="calendar-weekdays">
          {['일', '월', '화', '수', '목', '금', '토'].map((w, idx) => (
            <div key={w} className={`weekday-label ${idx === 0 ? 'sun' : idx === 6 ? 'sat' : ''}`}>{w}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}
