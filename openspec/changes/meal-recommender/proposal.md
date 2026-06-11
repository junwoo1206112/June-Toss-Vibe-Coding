## Why

"뭐 먹지?" is a daily decision fatigue problem. People spend unnecessary time deciding what to eat, often defaulting to the same options or ordering impulsively. By tracking meals with minimal friction and surfacing personal eating patterns, this mini-app eliminates the mental overhead of meal decisions and makes daily life more comfortable.

## What Changes

- New 앱인토스 mini-app with Toss Login for user identification
- Smart meal logging with autocomplete from past entries and popular Korean dishes
- Personal meal history with timeline/calendar view
- Pattern-based meal recommendations ("지난주 월요일엔 OO를 먹었으니 오늘은 □□ 어때요?")
- "뭐 먹지?" daily suggestion feature on app open
- Supabase backend for user data persistence and pattern analysis
- TDS (Toss Design System) UI

## Capabilities

### New Capabilities
- `toss-login`: Toss Login for user authentication and identity
- `meal-logging`: Smart meal logging with autocomplete, recent meals, and quick-add
- `meal-history`: Timeline and calendar view of meal history
- `meal-recommendation`: Pattern-based analysis and food recommendations
- `daily-suggestion`: "뭐 먹지?" feature showing personalized daily suggestion

### Modified Capabilities
None (new project)

## Impact

- New project in the workspace
- Requires Supabase project for backend
- Requires 앱인토스 콘솔 app registration
- No existing code affected
