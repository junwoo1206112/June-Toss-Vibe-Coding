## Context

New 앱인토스 mini-app for meal tracking and recommendation. Built as a WebView app using `@apps-in-toss/web-framework` with React, Vite, and TDS. Supabase backend for user data persistence. No existing codebase to integrate with.

## Goals / Non-Goals

**Goals:**
- Toss Login integration for user identity (no separate signup)
- Minimal-tap meal logging with autocomplete from past entries + common Korean dishes
- Personal meal history with timeline view
- Pattern-based recommendation engine ("You ate X last Monday, how about Y today?")
- "뭐 먹지?" suggestion on app open when user hasn't decided
- Supabase persistence across sessions

**Non-Goals:**
- Automatic meal detection via payment history (not available via SDK)
- Social features / sharing
- Nutrition tracking or calorie counting
- Restaurant discovery or delivery integration
- Multi-language support (Korean only for MVP)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App type | WebView (React + Vite) | Fastest to develop, TDS support, aligns with AI vibe coding |
| Identity | Toss Login (`appLogin`) | No separate auth flow, user already has Toss |
| Backend | Supabase | Free tier, Korean docs support, 직접 연동 가이드 provided by 앱인토스 |
| Recommendations | Client-side rule engine + Supabase queries | Simple pattern matching (day-of-week, frequency, recency) → no ML infra needed |
| Food database | Built-in list of common Korean dishes + user history | No external API dependency |

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Supabase free tier limits (500MB DB, 2GB bandwidth) | Compact data model: meal = user_id + food_name + timestamp + meal_type |
| Manual input friction | Smart autocomplete + quick-add "favorites" + optional daily reminder |
| Recommendation quality with sparse data | Default suggestions based on time of day + popular combos until user history accumulates |
