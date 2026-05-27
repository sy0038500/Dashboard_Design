import React, { useState, useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';
import './QuoteCard.css';

const LOCAL_QUOTES = [
  {
    text: "가장 좋은 프롬프트는 당신이 무엇을 원하는 지 명확히 아는 지성에서 출발한다.",
    author: "AI WORKSPACES"
  },
  {
    text: "단순함이 궁극의 정교함이다.",
    author: "레오나르도 다 빈치"
  },
  {
    text: "미래를 예측하는 가장 좋은 방법은 미래를 창조하는 것이다.",
    author: "피터 드러커"
  },
  {
    text: "어제보다 나은 오늘을 만드는 것은 오직 우리의 몰입에 달려있다.",
    author: "성장 대시보드"
  }
];

export default function QuoteCard() {
  const [currentQuote, setCurrentQuote] = useState(LOCAL_QUOTES[0]);
  const [localIndex, setLocalIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchGeminiQuote = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    console.group('🤖 [Gemini API] 명언 생성 상세 정보');
    console.log(`🔑 Gemini API Key 등록 상태: ${apiKey ? '등록됨 (앞 5자리: ' + apiKey.substring(0, 5) + '...)' : '미등록'}`);

    if (!apiKey) {
      console.warn('⚠️ Gemini API Key가 없어 로컬 명언 순환(Fallback)을 적용합니다.');
      console.groupEnd();
      triggerNextLocalQuote();
      return;
    }

    setIsAiLoading(true);
    setFade(false);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = "인생, 성장, 동기부여, 지성, 기술, 또는 창의성에 대해 짧고 깊은 감동이나 통찰을 주는 한국어 명언을 하나 추천 또는 창작해 주세요. 출력은 반드시 다음 JSON 형식을 엄격히 준수하여 응답해 주세요. 다른 설명 텍스트는 일절 포함하지 마십시오: { \"text\": \"명언 구절\", \"author\": \"저자 또는 출처\" }";

      console.log('📝 Prompt 송신:', prompt);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP 에러! 상태코드: ${response.status}`);
      const data = await response.json();

      console.log('📦 Gemini API 수신 데이터 (Raw JSON):', data);

      // JSON 파싱
      const rawText = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText);

      if (parsed && parsed.text && parsed.author) {
        console.log('✅ AI 명언 파싱 성공:', parsed);
        setTimeout(() => {
          setCurrentQuote(parsed);
          setFade(true);
          setIsAiLoading(false);
        }, 500); // fade out 애니메이션 완료 후 교체
      } else {
        throw new Error('JSON 구조가 명언 요구 사양과 맞지 않습니다.');
      }
    } catch (err) {
      console.error('❌ Gemini API 호출 및 파싱 실패:', err);
      console.warn('⚠️ 로컬 명언(Fallback)을 표시합니다.');
      triggerNextLocalQuote();
      setIsAiLoading(false);
    } finally {
      console.groupEnd();
    }
  };

  const triggerNextLocalQuote = () => {
    setFade(false);
    setTimeout(() => {
      const nextIndex = (localIndex + 1) % LOCAL_QUOTES.length;
      setLocalIndex(nextIndex);
      setCurrentQuote(LOCAL_QUOTES[nextIndex]);
      setFade(true);
    }, 500);
  };

  const handleCardClick = () => {
    // 사용자가 클릭하면 타이머를 리셋하고 새로 명언을 불러옴
    resetTimer();
    fetchGeminiQuote();
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      fetchGeminiQuote();
    }, 20000); // 실시간 AI 호출을 감안하여 순환 주기를 20초로 조정
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [localIndex]);

  return (
    <div 
      className={`quote-card glass-card clickable ${isAiLoading ? 'loading-state' : ''}`} 
      onClick={handleCardClick} 
      title="클릭하여 새로운 명언 가져오기 (AI 실시간 연동)"
    >
      <div className="quote-icon-container">
        <Quote className="quote-icon" size={24} />
      </div>
      <div className={`quote-content-wrapper ${fade ? 'fade-in' : 'fade-out'}`}>
        <p className="quote-text">{currentQuote.text}</p>
        <div className="quote-author">- {currentQuote.author}</div>
      </div>
      {isAiLoading && (
        <div className="quote-ai-loader">
          <div className="pulse-dot"></div>
          <span>Gemini가 명언을 생각하고 있어요...</span>
        </div>
      )}
    </div>
  );
}
