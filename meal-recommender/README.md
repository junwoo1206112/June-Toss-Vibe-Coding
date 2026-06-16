# 뭐먹지?

현재 시간, 날씨, 최근 식사 기록을 바탕으로 지금 먹을 메뉴를 빠르게 추천하는 앱인토스 미니앱입니다.

앱인토스 브랜드 아이콘은 `public/app-logo-600.png`이며 `granite.config.ts`의 `brand.icon`은 콘솔 등록 로고의 CDN URL을 가리키도록 맞췄습니다. 첫 화면에서는 `public/meal-recommender-icon.png`를 앱 내 아이콘으로 사용합니다.

## 제품 원칙

- 로그인 전에도 추천 3개를 바로 보여준다.
- 비사업자 출시에서는 로그인 없이 기기 내 기록 기능을 모두 제공한다.
- 아침/점심/저녁은 하루에 한 번씩만 기록하고, 이미 기록된 끼니는 수정 흐름으로 안내한다.
- 추천은 오늘 아직 기록하지 않은 다음 끼니를 기준으로 보여준다.
- 저장 실패를 성공으로 표시하지 않는다.
- 날짜 계산은 `Asia/Seoul` 기준으로 처리한다.
- 운영 환경에서는 브라우저가 Supabase 테이블에 직접 접근하지 않는다.
- 위치를 사용할 수 없으면 서울 기준임을 사용자에게 알린다.

## 로컬 실행

```bash
npm install
npm run dev
```

기본 게스트 모드는 별도 서버 설정 없이 브라우저 `localStorage`를 사용합니다. 로컬 개발자 모드에서 서버 데이터 기능까지 확인하려면 `.env`의 Supabase anon 설정을 사용합니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 운영 보안 구조

### 비사업자 기본 모드

- 토스 로그인 버튼을 노출하지 않습니다.
- 식사 기록과 즐겨찾기는 사용자의 현재 기기에만 저장합니다.
- 설정에서 모든 기록을 즉시 삭제할 수 있습니다.
- 활성화 조건은 `VITE_ENABLE_TOSS_LOGIN=false`입니다.

### 사업자 인증 후 계정 동기화 모드

운영 앱은 다음 순서로 요청합니다.

1. 브라우저가 `appLogin()`으로 authorization code를 받습니다.
2. `meal-api` Edge Function이 Toss API에서 토큰을 교환합니다.
3. 식사 API 요청마다 Edge Function이 `login-me`로 사용자를 검증합니다.
4. 검증된 `userKey`만 DB 쿼리에 사용합니다.
5. Supabase `service_role` 키는 Edge Function secret에만 존재합니다.

### 배포

1. Supabase CLI로 프로젝트를 연결하고 migration을 적용합니다.

```bash
supabase link --project-ref <project-ref>
supabase db push
```

수동 적용이 필요할 때만 `supabase-schema.sql`을 SQL Editor에서 실행합니다.

2. Supabase CLI로 함수를 배포합니다.

```bash
supabase functions deploy meal-api --no-verify-jwt
```

`meal-api`는 Toss access token을 자체 검증하므로 Supabase JWT 검증을 사용하지 않습니다. `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 Supabase 함수 기본 secret을 사용합니다.

3. production 환경 변수에 함수 URL을 추가합니다.

```env
VITE_MEAL_API_URL=https://your-project.supabase.co/functions/v1/meal-api
VITE_ENABLE_TOSS_LOGIN=true
```

토스 로그인은 앱인토스 콘솔에서 사업자 인증과 로그인 설정을 마친 경우에만 활성화합니다.

4. 빌드 후 `.ait` 파일을 앱인토스 콘솔에 등록합니다.

```bash
npm run lint
npm run build
```

## 출시 전 필수 검증

- 게스트 기록의 등록, 수정, 즐겨찾기, 삭제와 앱 재실행 후 유지 확인
- 토스 로그인을 활성화한다면 서로 다른 계정이 상대방 기록을 볼 수 없는지 확인
- 저장 실패 시 오류 안내가 표시되는지 확인
- 한국 시간 자정 전후 기록 날짜 확인
- 위치 허용, 거부, 타임아웃 흐름 확인
- 로그인 전 추천과 로그인 후 개인화 추천 확인
- 모든 기록 삭제 후 재조회 확인

전체 진행 상태는 [`../CHALLENGE_ROADMAP.md`](../CHALLENGE_ROADMAP.md)를 기준으로 관리합니다.
