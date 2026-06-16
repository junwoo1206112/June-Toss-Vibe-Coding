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
- [x] 6.6 Recommend the next unlogged main meal instead of repeatedly recommending an already logged meal slot
- [x] 6.7 Prevent duplicate breakfast/lunch/dinner records for the same Seoul date

## 7. Polish & Deploy

- [x] 7.1 Apply TDS design system consistently across all screens
- [ ] 7.2 Test in 샌드박스 app
  - [x] Console test modal opened for `20260616-4`
  - [x] Console test modal opened for `20260616-5`
  - [ ] Physical Toss app sandbox run on a logged-in age-verified device
- [x] 7.3 Build and generate .ait bundle
- [x] 7.4 Upload to 앱인토스 콘솔
  - [x] Uploaded `20260616-4` / `019eceef-4f80-7571-9222-d0fd45c43f41`
  - [x] `20260616-4` review was rejected for brand icon mismatch
  - [x] Updated `brand.icon` to the console logo CDN URL
  - [x] Uploaded `20260616-5` / `019ecf02-9861-77b2-b8e4-52b57e4754d1`
  - [x] Uploaded logic improvement build / `019ecf1b-0d02-703a-9f34-f911c143c097`
  - [ ] Confirm latest console row and submit review request; current status needs browser/manual recheck
- [ ] 7.5 Submit challenge entry form
  - [ ] Challenge form URL is needed
