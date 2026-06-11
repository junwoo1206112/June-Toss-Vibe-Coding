## Why

현재 추천은 요일 패턴과 최근 기록만 기반으로 합니다. 하지만 실제 식사 선택은 날씨와 시간대의 영향을 크게 받습니다. 비 오는 날 뜨끈한 국물 요리, 더운 날 시원한 냉면처럼 "지금 이 날씨에 어울리는 음식"을 추천하면 더 실용적이고 직관적인 제안이 가능합니다.

## What Changes

- 날씨 API(Open-Meteo, 무료) 연동하여 현재 기온, 날씨 상태(맑음/비/흐림) 조회
- 시간대(아침/점심/저녁/간식) + 날씨 조건 조합으로 추천 강화
  - 비/흐림 → 찌개, 국밥, 칼국수 등 따뜻한 메뉴
  - 더움(28도↑) → 냉면, 초밥, 샐러드 등 시원한 메뉴
  - 추움(5도↓) → 국물 요리, 탕 등 따뜻한 메뉴
  - 맑음/보통 → 기존 패턴 기반 추천
- 홈 화면 상단에 현재 날씨 + 시간대 표시

## Capabilities

### New Capabilities
- `weather-integration`: Open-Meteo API로 현재 위치 기반 날씨(기온, 상태, 강수) 조회 및 표시

### Modified Capabilities
- `meal-recommendation`: 날씨 조건과 시간대를 추천 로직에 통합. 기존 요일 패턴, 최근 기록과 병합하여 우선순위 결정.

## Impact

- `src/lib/recommendation.ts` 추천 로직 수정
- `src/lib/` 에 날씨 API 모듈 추가
- `src/pages/HomePage.tsx` 날씨 정보 표시 추가
- 신규 의존성 없음 (fetch API로 직접 호출)
