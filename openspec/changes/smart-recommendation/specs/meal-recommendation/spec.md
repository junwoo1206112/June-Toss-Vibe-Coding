## MODIFIED Requirements

### Requirement: App recommends meals based on weather conditions
The app SHALL incorporate weather conditions into meal recommendations. When weather data is available, the recommendation logic SHALL prioritize foods matching the current weather, then fall back to pattern-based and default suggestions.

#### Scenario: Rainy day recommendation
- **WHEN** current weather code indicates rain (WMO 51-67, 80-82)
- **THEN** recommendation prioritizes warm soupy foods (찌개, 국밥, 칼국수, 탕, 수제비, 라면) from user's history or defaults
- **THEN** recommendation reason includes weather context: "오늘 비가 와서 따뜻한 국물 요리 어때요?"

#### Scenario: Hot day recommendation
- **WHEN** current temperature is 28℃ or higher
- **THEN** recommendation prioritizes cool foods (냉면, 초밥, 샐러드, 콩국수, 빙수) from user's history or defaults
- **THEN** recommendation reason includes: "더운 날엔 시원한 메뉴가 딱이에요!"

#### Scenario: Cold day recommendation
- **WHEN** current temperature is 5℃ or lower
- **THEN** recommendation prioritizes warm hearty foods (삼겹살, 찌개, 탕, 국밥, 샤브샤브, 훠궈)
- **THEN** recommendation reason includes: "추운 날엔 따뜻한 메뉴로 몸을 녹여요!"

#### Scenario: Mild weather with pattern data
- **WHEN** weather is mild (5-28℃) and user has meal history
- **THEN** the app uses existing day-of-week and recent pattern-based recommendation
- **THEN** recommendation reason references the pattern (e.g., "지난 화요일에 드셨던 메뉴예요!")

#### Scenario: Mild weather with no history
- **WHEN** weather is mild but user has no meal history
- **THEN** the app shows time-based generic recommendations
