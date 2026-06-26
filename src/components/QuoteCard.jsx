import React, { useState, useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';
import './QuoteCard.css';

const LOCAL_QUOTES = [
  {
    text: '가장 좋은 프롬프트는 당신이 무엇을 원하는지 명확히 아는 지성에서 출발한다.',
    author: 'AI WORKSPACES'
  },
  {
    text: '단순함이 궁극의 정교함이다.',
    author: '레오나르도 다 빈치'
  },
  {
    text: '미래를 예측하는 가장 좋은 방법은 미래를 창조하는 것이다.',
    author: '피터 드러커'
  },
  {
    text: '어제보다 나은 오늘을 만드는 것은 오직 우리의 몰입에 달려있다.',
    author: '성장 대시보드'
  }
];

export default function QuoteCard({
  activeMood,
  globalWeather,
  todayFocus,
  onAiThemeDetermined
}) {
  const [currentQuote, setCurrentQuote] = useState(LOCAL_QUOTES[0]);
  const [localIndex, setLocalIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const lastRequestTimeRef = useRef(0);
  const isRequestingRef = useRef(false);

  const [quoteHistory, setQuoteHistory] = useState(() => {
    try {
      const history = localStorage.getItem('quote_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('quote_history', JSON.stringify(quoteHistory));
  }, [quoteHistory]);

  const getQuickThemeFromMood = (text = '') => {
    const value = text
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/[.,!?~ㅠㅜ…]/g, '');

    if (!value) return 'yellow';

    const themeRules = [
      {
        theme: 'tired',
        words: ['힘', '힘들', '힘듦', '힘든', '지침', '지쳐', '지친', '피곤', '버겁', '멘탈', '녹초', '고단', '탈진']
      },
      {
        theme: 'anxious',
        words: ['불안', '걱정', '초조', '긴장', '무섭', '떨림', '떨려', '압박', '스트레스']
      },
      {
        theme: 'happy',
        words: ['기쁨', '행복', '좋', '신남', '신나', '즐거', '뿌듯', '상쾌', '개운']
      },
      {
        theme: 'focus',
        words: ['집중', '공부', '몰입', '과제', '시험', '작업', '마감', '해야', '할일', '코딩']
      },
      {
        theme: 'lethargic',
        words: ['무기력', '우울', '아무것도', '하기싫', '귀찮', '현타', '울적', '무너짐']
      },
      {
        theme: 'creative',
        words: ['설렘', '설레', '기대', '창의', '아이디어', '두근', '새로운']
      }
    ];

    const matched = themeRules.find((rule) =>
      rule.words.some((word) => value.includes(word))
    );

    return matched ? matched.theme : 'yellow';
  };

  const applyQuickTheme = () => {
    if (!onAiThemeDetermined) return;

    const quickTheme = getQuickThemeFromMood(activeMood);
    onAiThemeDetermined(quickTheme);
  };

  const triggerNextLocalQuote = () => {
    setFade(false);

    setTimeout(() => {
      setLocalIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % LOCAL_QUOTES.length;
        setCurrentQuote(LOCAL_QUOTES[nextIndex]);
        return nextIndex;
      });

      setFade(true);
    }, 300);
  };

  const fetchGeminiQuote = async ({ force = false } = {}) => {
    const now = Date.now();

    if (isRequestingRef.current) {
      console.warn('⚠️ 이미 Gemini 요청 중이라 중복 호출을 막았습니다.');
      return;
    }

    if (!force && now - lastRequestTimeRef.current < 8000) {
      console.warn('⚠️ Gemini 요청 간격이 너무 짧아 호출을 막았습니다.');
      return;
    }

    isRequestingRef.current = true;
    lastRequestTimeRef.current = now;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    console.group('🤖 [Gemini API] 명언 생성 상세 정보');
    console.log(
      `🔑 Gemini API Key 등록 상태: ${
        apiKey ? `등록됨 (앞 5자리: ${apiKey.substring(0, 5)}...)` : '미등록'
      }`
    );

    applyQuickTheme();

    if (!apiKey) {
      console.warn('⚠️ Gemini API Key가 없어 로컬 명언 순환(Fallback)을 적용합니다.');
      triggerNextLocalQuote();
      isRequestingRef.current = false;
      console.groupEnd();
      return;
    }

    setIsAiLoading(true);
    setFade(false);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const timeNow = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const moodText = activeMood?.trim()
        ? activeMood.trim()
        : '특별히 입력된 감정/상황 없음';

      const weatherText = globalWeather?.trim()
        ? `현재 날씨: ${globalWeather.trim()}`
        : '날씨 정보 없음';

      const focusText = todayFocus?.trim()
        ? `오늘의 집중 과제: ${todayFocus.trim()}`
        : '집중 과제 없음';

      let todoSummary = '할 일 정보 없음';

      try {
        const savedTodos = localStorage.getItem('user_todos');

        if (savedTodos) {
          const todos = JSON.parse(savedTodos);
          const total = todos.length;
          const completed = todos.filter((todo) => todo.completed).length;
          const uncompletedList = todos
            .filter((todo) => !todo.completed)
            .map((todo) => todo.text)
            .join(', ');

          todoSummary =
            total > 0
              ? `총 ${total}개 중 ${completed}개 완료. 남은 할 일: ${
                  uncompletedList || '없음'
                }`
              : '할 일 없음';
        }
      } catch (error) {
        console.warn('Todo 리스트를 읽어오는 데 실패했습니다.', error);
      }

      const recentQuotesText =
        quoteHistory.length > 0
          ? quoteHistory.map((quote, index) => `${index + 1}. "${quote.text}"`).join('\n')
          : '없음';

      const randomSeed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const prompt = `
당신은 사용자의 감정과 하루 맥락을 읽고, 짧고 현실적인 응원 메시지를 작성하는 AI 멘토입니다.

[사용자 상태 정보]
- 사용자가 입력한 감정/상황 원문: ${moodText}
- 현재 시간: ${timeNow}
- ${weatherText}
- ${focusText}
- Todo 요약: ${todoSummary}
- Random Seed: ${randomSeed}

[최근 생성된 명언]
${recentQuotesText}

[작성 조건]
1. 사용자의 감정/상황 원문을 단어 그대로만 보지 말고, 문장의 의미와 뉘앙스를 해석하세요.
2. 사용자가 감정을 직접 쓰지 않았다면 시간, 날씨, Today Focus, Todo 맥락을 바탕으로 메시지를 작성하세요.
3. 최근 생성된 명언과 비슷한 문장은 반복하지 마세요.
4. 너무 거창한 명언체보다, 지금 사용자에게 실제로 건네는 짧은 응원 메시지처럼 작성하세요.
5. quote는 반드시 한국어 1~2문장으로 작성하세요.
6. 출력은 반드시 아래 JSON 형식만 반환하세요. 마크다운, 설명문, 코드블록은 절대 포함하지 마세요.

{
  "emotionCategory": "tired | anxious | happy | focused | depressed | excited | neutral",
  "tone": "comforting | calm | energetic | focused | encouraging",
  "themeKey": "calmBlue | lavender | sunnyOrange | deepGreen | midnight | pinkPop | lemonYellow",
  "quote": "사용자의 감정과 상황에 맞는 1~2문장의 한국어 AI 명언 또는 응원 메시지"
}
`;

      console.log('📝 Prompt 송신:', prompt);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.9,
            topP: 0.95,
            candidateCount: 1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP 에러! 상태코드: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Gemini API 수신 데이터:', data);

      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini 응답에서 text 값을 찾을 수 없습니다.');
      }

      const cleanedText = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      if (!parsed?.quote) {
        throw new Error('Gemini JSON 응답에 quote 값이 없습니다.');
      }

      const themeKeyMap = {
        calmblue: 'tired',
        lavender: 'anxious',
        sunnyorange: 'happy',
        deepgreen: 'focus',
        midnight: 'lethargic',
        pinkpop: 'creative',
        lemonyellow: 'yellow',

        tired: 'tired',
        anxious: 'anxious',
        happy: 'happy',
        focused: 'focus',
        focus: 'focus',
        depressed: 'lethargic',
        lethargic: 'lethargic',
        excited: 'creative',
        creative: 'creative',
        neutral: 'yellow',
        yellow: 'yellow'
      };

      const rawThemeKey = String(parsed.themeKey || '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');

      const mappedThemeKey = themeKeyMap[rawThemeKey] || 'yellow';

      console.log('✅ AI 감정 분석 및 명언 파싱 성공:', parsed);
      console.log('🎨 적용 테마:', mappedThemeKey);

      setTimeout(() => {
        setCurrentQuote({
          text: parsed.quote,
          author: 'AI 멘토'
        });

        setQuoteHistory((prev) => {
          return [{ text: parsed.quote }, ...prev].slice(0, 5);
        });

        if (onAiThemeDetermined) {
          onAiThemeDetermined(mappedThemeKey);
        }

        setFade(true);
        setIsAiLoading(false);
      }, 300);
    } catch (error) {
      console.error('❌ Gemini API 호출 및 파싱 실패:', error);
      console.warn('⚠️ Gemini 실패로 로컬 명언(Fallback)을 표시합니다.');

      triggerNextLocalQuote();
      setIsAiLoading(false);
    } finally {
      isRequestingRef.current = false;
      console.groupEnd();
    }
  };

  const handleCardClick = () => {
    fetchGeminiQuote({ force: true });
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchGeminiQuote();
    }, 1500);

    return () => clearTimeout(timerId);
  }, [activeMood, todayFocus, globalWeather]);

  return (
    <div
      className={`quote-card glass-card clickable ${isAiLoading ? 'loading-state' : ''}`}
      onClick={handleCardClick}
      title="클릭하여 새로운 명언 가져오기"
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