## Why

현재 앱은 핵심 기능(추천, 기록)은 동작하지만 사용자 경험 측면에서 부족한 점이 있습니다. 로딩 중 빈 화면, 단일 추천만 제공, 식사 패턴을 파악할 수 없는 점 등이 완성도를 떨어뜨립니다. 출품 전 UX를 강화해 더 매력적인 앱으로 만듭니다.

## What Changes

- **식사 통계 탭**: 주간/월간 먹은 음식 TOP5, 요일별 패턴, 시간대별 통계 제공
- **여러 개 추천**: 기존 1개 → 3개 추천 중에서 고를 수 있게
- **로딩 상태 개선**: 데이터 로딩 중 스켈레톤 UI 표시
- **홈에서 로그아웃 접근성**: 설정까지 가지 않고도 로그아웃 가능

## Capabilities

### New Capabilities
- `meal-statistics`: 주간/월간 식사 통계 (TOP5 음식, 요일별 빈도, 시간대별 분포) 표시
- `multi-recommendation`: 한 번에 3개의 추천 옵션 제공

### Modified Capabilities
- `meal-logging`: 로딩 중 스켈레톤 UI 추가
- `daily-suggestion`: 단일 추천 → 다중 추천으로 변경

## Impact

- `src/pages/HomePage.tsx`: 다중 추천 카드, 로딩 스켈레톤
- `src/pages/StatisticsPage.tsx`: 신규 통계 페이지
- `src/lib/recommendation.ts`: 다중 추천 API 추가
- `src/App.tsx`: 통계 라우팅, 로그아웃 접근성
