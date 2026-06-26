import React, { useState, useEffect } from 'react';
import { MapPin, Sun, User, LogOut, CloudSun } from 'lucide-react';
import './Header.css';

// 영문 도시명 한글 매핑 딕셔너리
const CITY_TRANSLATIONS = {
  'Seoul': '서울특별시',
  'Seoul-si': '서울특별시',
  'Suwon': '경기도 수원시',
  'Suwon-si': '경기도 수원시',
  'Incheon': '인천광역시',
  'Incheon-gwangyeoksi': '인천광역시',
  'Busan': '부산광역시',
  'Busan-gwangyeoksi': '부산광역시',
  'Daegu': '대구광역시',
  'Daejeon': '대전광역시',
  'Gwangju': '광주광역시',
  'Ulsan': '울산광역시',
  'Jeju-do': '제주특별자치도',
  'Jeju': '제주특별자치도',
  'Jeju-si': '제주시',
  'Seongnam-si': '성남시',
  'Seongnam': '성남시',
  'Goyang-si': '고양시',
  'Goyang': '고양시',
  'Yongin-si': '용인시',
  'Yongin': '용인시',
  'Bucheon-si': '부천시',
  'Bucheon': '부천시',
  'Ansan-si': '안산시',
  'Ansan': '안산시',
  'Cheongju-si': '청주시',
  'Cheongju': '청주시',
  'Jeonju-si': '전주시',
  'Jeonju': '전주시',
  'Chuncheon-si': '춘천시',
  'Chuncheon': '춘천시',
  'Changwon-si': '창원시',
  'Changwon': '창원시'
};

const translateCityName = (engName) => {
  return CITY_TRANSLATIONS[engName] || engName;
};

// GPS 위도/경도 기반 가까운 국내 주요 도시 매칭 (API 키가 없거나 실패한 경우의 Fallback)
const getKoreanCityByCoords = (lat, lon) => {
  const cities = [
    { name: '서울특별시', lat: 37.5665, lon: 126.9780 },
    { name: '경기도 수원시', lat: 37.2636, lon: 127.0286 },
    { name: '인천광역시', lat: 37.4563, lon: 126.7052 },
    { name: '부산광역시', lat: 35.1796, lon: 129.0756 },
    { name: '대구광역시', lat: 35.8714, lon: 128.6014 },
    { name: '대전광역시', lat: 36.3504, lon: 127.3845 },
    { name: '광주광역시', lat: 35.1595, lon: 126.8526 },
    { name: '울산광역시', lat: 35.5389, lon: 129.3114 },
    { name: '제주특별자치도', lat: 33.4996, lon: 126.5312 },
    { name: '강원도 춘천시', lat: 37.8813, lon: 127.7298 },
    { name: '충청북도 청주시', lat: 36.6372, lon: 127.4897 },
    { name: '전라북도 전주시', lat: 35.8242, lon: 127.1480 },
    { name: '경상남도 창원시', lat: 35.2280, lon: 128.6811 }
  ];

  let closestCity = cities[0];
  let minDistance = Infinity;

  cities.forEach(city => {
    const dist = Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  });

  return closestCity.name;
};

// 현재 계절에 맞춰 그럴듯한 날씨 모의 데이터를 생성 (Fallback)
const getMockWeatherBySeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '21°C 맑고 포근함';
  if (month >= 6 && month <= 8) return '27°C 초여름 맑음';
  if (month >= 9 && month <= 11) return '16°C 선선한 가을 하늘';
  return '3°C 구름 조금 쌀쌀함';
};

export default function Header({ setGlobalWeather }) {
  const [locationName, setLocationName] = useState('경기도 수원시');
  const [weatherDescription, setWeatherDescription] = useState('25°C 맑음');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeatherData = async (lat, lon) => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    console.group('⛅ [Weather API] 날씨 데이터 수집 상세 정보');
    console.log(`📍 Geolocation 좌표: 위도(lat) = ${lat}, 경도(lon) = ${lon}`);
    console.log(`🔑 OpenWeather API Key 등록 상태: ${apiKey ? '등록됨 (앞 5자리: ' + apiKey.substring(0, 5) + '...)' : '미등록'}`);
    
    if (!apiKey) {
      console.warn('⚠️ API Key가 설정되지 않아 로컬 Fallback 모드를 실행합니다.');
      const mappedLocation = getKoreanCityByCoords(lat, lon);
      const mockWeather = getMockWeatherBySeason();
      
      console.log(`🔄 Fallback 처리 완료: 위치 = ${mappedLocation}, 날씨 = ${mockWeather}`);
      console.groupEnd();
      
      setLocationName(mappedLocation);
      setWeatherDescription(mockWeather);
      if (setGlobalWeather) setGlobalWeather(mockWeather);
      setIsLoading(false);
      return;
    }

    const requestUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
    // 보안을 위해 콘솔 출력용 URL에서는 API Key를 마스킹 처리
    const displayUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey.substring(0, 5)}...&units=metric&lang=kr`;
    console.log(`🌐 API 호출 URL: ${displayUrl}`);

    try {
      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error(`HTTP 에러! 상태코드: ${response.status}`);
      const data = await response.json();

      console.log('📦 OpenWeatherMap API 수신 데이터 (Raw JSON):', data);

      const rawCityName = data.name;
      const translated = translateCityName(rawCityName);
      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const resultWeather = `${temp}°C ${desc}`;

      console.log(`✅ 데이터 변환 성공: 도시명 = ${translated} (원문: ${rawCityName}), 날씨 = ${resultWeather}`);
      
      setLocationName(translated);
      setWeatherDescription(resultWeather);
      if (setGlobalWeather) setGlobalWeather(resultWeather);
    } catch (err) {
      console.error('❌ Real Weather API 호출 실패:', err);
      console.warn('⚠️ API 오류로 인해 Fallback 모드로 복구합니다.');
      
      const mappedLocation = getKoreanCityByCoords(lat, lon);
      const mockWeather = getMockWeatherBySeason();
      
      console.log(`🔄 Fallback 처리 완료: 위치 = ${mappedLocation}, 날씨 = ${mockWeather}`);
      
      setLocationName(mappedLocation);
      setWeatherDescription(mockWeather);
      if (setGlobalWeather) setGlobalWeather(mockWeather);
    } finally {
      console.groupEnd();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 [Header] 위치 및 날씨 데이터 연동 시작');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.info(`📌 [Geolocation] 브라우저 위치 정보 조회 성공: 위도 ${latitude}, 경도 ${longitude}`);
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.warn(`⚠️ [Geolocation] 위치 정보 획득 실패 (코드 ${error.code}): ${error.message}`);
          console.log('기본 셋팅값(경기도 수원시, 25°C 맑음)을 노출합니다.');
          setIsLoading(false);
        }
      );
    } else {
      console.warn('⚠️ [Geolocation] 브라우저가 위치 정보 API를 지원하지 않습니다.');
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    alert('로그아웃 되었습니다.');
  };

  return (
    <header className="dashboard-header">
      <div className="header-chip glass-card" title={isLoading ? "위치 조회 중..." : locationName}>
        <MapPin className="chip-icon icon-blue animate-pulse" size={16} />
        <span className="chip-text">{isLoading ? "조회 중..." : locationName}</span>
      </div>
      
      <div className="header-chip glass-card" title={isLoading ? "날씨 조회 중..." : weatherDescription}>
        {weatherDescription.includes('맑음') ? (
          <Sun className="chip-icon icon-orange" size={16} />
        ) : (
          <CloudSun className="chip-icon icon-orange" size={16} />
        )}
        <span className="chip-text">{isLoading ? "조회 중..." : weatherDescription}</span>
      </div>
      
      <div className="header-chip glass-card">
        <User className="chip-icon icon-blue" size={16} />
        <span className="chip-text">이수연 님</span>
      </div>
      
      <button className="header-chip glass-card clickable" onClick={handleLogout}>
        <LogOut className="chip-icon icon-dark" size={16} />
        <span className="chip-text">로그아웃</span>
      </button>
    </header>
  );
}
