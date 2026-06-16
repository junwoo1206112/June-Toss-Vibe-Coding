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
- [x] GitHub Pages 공개 후 개인정보 처리방침 URL 연결
  - 공개 URL: `https://junwoo1206112.github.io/June-Toss-Vibe-Coding/privacy/`
  - 공개 확인: `200 OK`, 고객문의 이메일 포함 확인
- [x] 콘솔 파일 업로드와 필수 확인 항목 체크
  - 반려 후 필요 수정: 카테고리를 `음식·음료`로 변경
  - 로고: `../public/app-logo-600.png`
  - 다크모드 로고: `../public/app-logo-600.png`
  - 썸네일: `app-thumbnail-1932x828.png`
  - 스크린샷: 가로형 등록 완료
  - 검색 키워드: `메뉴추천`, `뭐먹지`, `식사기록`, `점심`, `저녁`
  - 앱 정보 상태: 검토 중
- [x] 반려 대응 후 앱 정보 재검토 요청
  - 반려 사유 1: 앱 로고 배경의 모서리를 둥근 형태 없이 네 모서리가 직각인 형태로 제작 필요
  - 조치: `../public/app-logo-600.png`를 직각 정사각형 배경 로고로 교체 완료
  - 원본 백업: `../public/app-logo-600-rounded-backup.png`
  - 반려 사유 2: 식사 메뉴 추천 및 기록 서비스이므로 카테고리를 `음식·음료`로 변경 권장
  - 콘솔 조치: 새 로고 재업로드, 카테고리 `음식·음료` 변경, 재검토 요청 완료
- [x] 최신 게스트 모드 포함 `.ait` 재업로드
  - 파일: `../meal-recommender.ait`
  - deploymentId: `019ecddc-61d9-79f6-96bd-78ef9a5324d7`
- [x] 앱 출시 페이지에서 번들 `20260616-2` 테스트 실행
  - 테스트 모달 확인: `intoss-private://meal-recommender?_deploymentId=019ecddc-61d9-79f6-96bd-78ef9a5324d7`
- [x] 번들 `20260616-2` 검토 요청
  - 결과: 반려
  - 반려 사유: 콘솔에 등록한 브랜드 아이콘과 `granite.config.ts`의 `brand.icon`이 동일해야 함
  - 조치: `granite.config.ts`의 `brand.icon`을 `/app-logo-600.png`로 변경하고 새 `.ait` 빌드 완료
  - 새 deploymentId: `019ece0b-8bb3-7da9-be94-190c74b2f961`
- [x] 브랜드 아이콘 일치 수정본 재업로드
  - 최신 번들 버전: `20260616-3`
  - deploymentId: `019ece0b-8bb3-7da9-be94-190c74b2f961`
- [x] 앱 출시 페이지에서 최신 버전 테스트 실행
  - 최신 번들 버전: `20260616-3`
  - 테스트 모달 확인: `intoss-private://meal-recommender?_deploymentId=019ece0b-8bb3-7da9-be94-190c74b2f961`
- [x] 최신 버전 검토 요청
  - 현재 상태: `검토 중`
  - 콘솔 알림: `요청이 완료되었어요. 검토 후 이메일로 알려드릴게요. (20260616-3)`
- [ ] 만 19세 이상 토스 앱 로그인 기기에서 샌드박스 스킴 실행
  - 물리 기기 확인은 별도 수행 필요

샌드박스 스킴:

`intoss-private://meal-recommender?_deploymentId=019ece0b-8bb3-7da9-be94-190c74b2f961`

게스트 모드가 포함된 최신 배포:

`019ece0b-8bb3-7da9-be94-190c74b2f961`

GitHub Actions 실행 기록:

`https://github.com/junwoo1206112/June-Toss-Vibe-Coding/actions/runs/27584876336`

GitHub Pages 브랜치:

`https://github.com/junwoo1206112/June-Toss-Vibe-Coding/tree/gh-pages`

보안 후속 조치:

- [x] 채팅에 노출된 콘솔 API 키 폐기
- [x] 재배포에 사용한 새 콘솔 API 키 폐기
- [x] 로컬 `AIT_DEPLOY_API_KEY` 사용자 환경변수 제거
