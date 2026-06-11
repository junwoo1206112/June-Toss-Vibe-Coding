## 1. Project Setup

- [x] 1.1 Initialize 앱인토스 WebView project with `npx create-ait-app`
- [x] 1.2 Configure `granite.config.ts` with app name, colors, and permissions
- [x] 1.3 Set up Supabase project and create `meals` table schema
- [x] 1.4 Install dependencies: Supabase client, TDS components
- [x] 1.5 Set up project routing structure (login, home, history, settings)

## 2. Toss Login

- [x] 2.1 Implement Toss Login button and `appLogin()` flow
- [x] 2.2 Create backend token exchange (authorization code → access token)
- [x] 2.3 Implement user session persistence with Supabase
- [x] 2.4 Handle auto-login for returning users
- [x] 2.5 Implement logout with token revocation

## 3. Meal Logging

- [x] 3.1 Build meal type selector (아침/점심/저녁/간식)
- [x] 3.2 Implement food autocomplete with built-in Korean food database
- [x] 3.3 Add recent meals quick-add section
- [x] 3.4 Implement favorites system (mark, unmark, quick-add from favorites)
- [x] 3.5 Save meal entries to Supabase

## 4. Meal History

- [x] 4.1 Build timeline view (reverse chronological, grouped by date)
- [x] 4.2 Build calendar view with monthly overview and meal dots
- [x] 4.3 Implement meal detail view on date tap
- [x] 4.4 Add swipe-to-delete with confirmation
- [x] 4.5 Implement pagination/infinite scroll for history

## 5. Meal Recommendation Engine

- [x] 5.1 Implement day-of-week pattern analysis query
- [x] 5.2 Implement meal-type (time-of-day) based filtering
- [x] 5.3 Implement variety logic (avoid same-as-yesterday)
- [x] 5.4 Implement fallback suggestions for users with sparse history
- [x] 5.5 Build recommendation card UI component

## 6. Daily Suggestion ("뭐 먹지?")

- [x] 6.1 Build home screen with "오늘의 추천" card
- [x] 6.2 Implement "기록하기" button to pre-fill logging
- [x] 6.3 Show summary when all meals are logged for the day
- [x] 6.4 Show onboarding message for new users with no history
- [x] 6.5 Add pull-to-refresh for new suggestion

## 7. Polish & Deploy

- [x] 7.1 Apply TDS design system consistently across all screens
- [ ] 7.2 Test in 샌드박스 app
- [x] 7.3 Build and generate .ait bundle
- [ ] 7.4 Upload to 앱인토스 콘솔
- [ ] 7.5 Submit challenge entry form
