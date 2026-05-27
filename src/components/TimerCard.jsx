import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import './TimerCard.css';

export default function TimerCard() {
  const DEFAULT_TIME = 25 * 60; // 25분 (초 단위)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playAlertSound();
            alert('집중 시간이 끝났습니다! 휴식을 취하세요.');
            return DEFAULT_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Web Audio API를 이용해 무손설 알림 비프음 생성
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // 1번째 신호음 (도)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc1.start();
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc1.stop(audioCtx.currentTime + 0.3);

      // 2번째 신호음 (솔 - 0.3초 뒤)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc2.start();
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc2.stop(audioCtx.currentTime + 0.4);
      }, 300);
    } catch (e) {
      console.warn('AudioContext is not supported or blocked by browser policy:', e);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_TIME);
  };

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strSeconds = seconds < 10 ? '0' + seconds : seconds;
    return `${strMinutes}:${strSeconds}`;
  };

  // 타이머 진행도 비율 계산 (배경 애니메이션용)
  const progressPercent = ((DEFAULT_TIME - timeLeft) / DEFAULT_TIME) * 100;

  return (
    <div className={`timer-card glass-card ${isRunning ? 'running' : ''}`}>
      <div className="timer-progress-bar" style={{ width: `${progressPercent}%` }}></div>
      <div className="timer-info">
        <div className="timer-label">FOCUS TIMER</div>
        <div className="timer-display-row">
          <div className="timer-time">{formatTimeLeft()}</div>
          <div className="timer-controls">
            {timeLeft !== DEFAULT_TIME && (
              <button className="timer-btn reset-btn" onClick={resetTimer} title="타이머 초기화">
                <RotateCcw size={18} />
              </button>
            )}
            <button className={`timer-btn toggle-btn ${isRunning ? 'active' : ''}`} onClick={toggleTimer} title={isRunning ? '일시정지' : '시작'}>
              {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
