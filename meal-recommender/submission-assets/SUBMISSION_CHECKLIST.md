# 앱인토스 콘솔 제출 자산

## 준비 완료

- [x] 앱 로고: `../public/app-logo-600.png` (600×600 PNG, 불투명)
- [x] 썸네일: `app-thumbnail-1932x828.png` (1932×828 PNG)
- [x] 실제 앱 가로 스크린샷: `screenshot-landscape-1504x741.png` (1504×741 PNG)
- [x] 참고용 실제 앱 세로 스크린샷: `01-recommendation.png` (636×1048 PNG)
- [x] 개인정보 처리방침 초안: `../PRIVACY_POLICY_DRAFT.md`
- [x] 공개 페이지 원본: `../docs/privacy/index.html`

## 콘솔 입력 권장값

- 한국어 앱 이름: `뭐먹지?`
- 영어 앱 이름: `Meal Picker`
- 부제: `오늘 메뉴를 3초 만에`
- 상세 설명: `현재 시간과 날씨를 바탕으로 지금 먹기 좋은 메뉴 3개를 바로 추천해요. 아무거나, 가볍게, 든든하게 중 원하는 조건을 고르고 추천 메뉴를 기기에 식사 기록으로 저장할 수 있어요. 기록 화면에서는 날짜별 식사를 확인하고 통계 화면에서는 자주 먹은 메뉴와 식사 패턴을 살펴볼 수 있어요.`
- 추천 카테고리: `생활`, `푸드` 또는 콘솔에서 가장 가까운 비게임 카테고리
- 검색 키워드: `메뉴추천`, `뭐먹지`, `식사기록`, `점심`, `저녁`

## 챌린지 신청폼 권장값

- appName: `meal-recommender`
- 한국어 앱 이름: `뭐먹지?`
- 한줄 소개: `오늘 뭐 먹을지 고민하는 시간을 줄여주는 3초 메뉴 추천 미니앱`
- 챌린지 주제와의 연관성: `매일 반복되는 "오늘 뭐 먹지?" 고민을 현재 시간, 날씨, 사용자가 고른 식사 조건으로 빠르게 정리해주는 생활 편의 미니앱입니다. 단순 리워드가 아니라 메뉴 결정, 식사 기록, 자주 먹는 메뉴 확인까지 이어져 반복되는 작은 불편을 줄이고 일상을 편하게 만드는 데 초점을 맞췄습니다.`
- 제출 포지셔닝: `귀찮은 결정과 기록을 대신해주는 생활 편의 앱`

## 사용자 입력 필요

- [x] 고객문의 이메일: `kdong135@naver.com`
- [x] 개인정보 처리방침의 문의 이메일 교체
- [x] 앱인토스 콘솔 텍스트 메타데이터 임시저장
- [ ] GitHub Pages 공개 후 개인정보 처리방침 URL 연결
  - 공개 예정 URL: `https://junwoo1206112.github.io/June-Toss-Vibe-Coding/privacy/`
  - 현재 상태: `Publish Privacy Policy` 워크플로우는 푸시로 실행됐지만 `Configure Pages` 단계에서 실패
  - 우회 배포 상태: `gh-pages` 브랜치에도 `privacy/index.html` 푸시 완료, 그러나 Pages API와 공개 URL은 아직 404
  - 필요 작업: GitHub 저장소 `Settings > Pages > Build and deployment > Source`를 `GitHub Actions`로 설정한 뒤 `Publish Privacy Policy` 워크플로우 수동 실행
- [ ] 콘솔 파일 업로드와 필수 확인 항목 체크
  - 로고: `../public/app-logo-600.png`
  - 썸네일: `app-thumbnail-1932x828.png`
- [ ] 만 19세 이상 토스 앱 로그인 기기에서 샌드박스 스킴 실행

샌드박스 스킴:

`intoss-private://meal-recommender?_deploymentId=019ec940-3d28-7425-8be9-7945c8772026`

게스트 모드가 포함된 최신 배포 후보:

`019ec97f-33c1-7766-a681-408bcda806c4`

GitHub Actions 실행 기록:

`https://github.com/junwoo1206112/June-Toss-Vibe-Coding/actions/runs/27584876336`

GitHub Pages 브랜치:

`https://github.com/junwoo1206112/June-Toss-Vibe-Coding/tree/gh-pages`
