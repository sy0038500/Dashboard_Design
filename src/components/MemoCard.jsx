import React, { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import './MemoCard.css';

export default function MemoCard() {
  const [memoText, setMemoText] = useState(() => {
    return localStorage.getItem('user_memo') || '';
  });
  const [saveStatus, setSaveStatus] = useState('저장 완료');
  const timeoutRef = useRef(null);

  // 디바운스 저장 기법
  const handleChange = (e) => {
    const newText = e.target.value;
    setMemoText(newText);
    setSaveStatus('자동 저장 중...');

    // 이전 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 600ms 뒤에 저장 완료로 전환하며 localStorage에 기록
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem('user_memo', newText);
      setSaveStatus('저장 완료');
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="memo-card glass-card">
      <div className="memo-header">
        <div className="memo-title-row">
          <FileText className="memo-title-icon" size={18} />
          {/* 피그마 타이틀 그대로 '오늘 할 일' 사용 */}
          <h3 className="memo-title">메모</h3>
        </div>
        <div className={`memo-status ${saveStatus === '자동 저장 중...' ? 'saving' : 'saved'}`}>
          {saveStatus}
        </div>
      </div>
      <div className="memo-body">
        <textarea
          className="memo-textarea"
          value={memoText}
          onChange={handleChange}
          placeholder="자유로운 생각이나 임시 텍스트 조각을 모아두는 공간입니다."
        />
      </div>
    </div>
  );
}
