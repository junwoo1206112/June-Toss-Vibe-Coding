## 1. Weather Data Module

- [x] 1.1 Create `src/lib/weather.ts` with Open-Meteo API fetch function
- [x] 1.2 Implement geolocation fallback (Seoul coordinates)
- [x] 1.3 Map WMO weather codes to Korean weather conditions + emoji
- [x] 1.4 Implement session-level weather cache (30-min TTL)

## 2. Enhanced Recommendation Engine

- [x] 2.1 Define weather-based food categories (rain/warm, hot/cool, cold/hearty)
- [x] 2.2 Add weather score to recommendation ranking logic
- [x] 2.3 Integrate weather context into recommendation reason text
- [x] 2.4 Handle edge cases: no weather data → fallback to existing logic

## 3. Home Screen Update

- [x] 3.1 Fetch weather data on app load
- [x] 3.2 Display weather info bar (temperature + weather emoji + time-based label) above recommendation card
- [x] 3.3 Ensure "다른 추천" button re-rolls within weather constraints
- [x] 3.4 Handle loading state while weather is being fetched
