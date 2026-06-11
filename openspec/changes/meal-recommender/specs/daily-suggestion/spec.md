## ADDED Requirements

### Requirement: App shows "뭐 먹지?" suggestion on home screen
When the user opens the app, the home screen SHALL display a personalized "오늘의 추천" card.

#### Scenario: Suggestion on app open
- **WHEN** user opens the app
- **THEN** a "뭐 먹지?" card is displayed with a personalized recommendation
- **THEN** the recommendation includes the meal name, reason (pattern-based), and a "기록하기" button

#### Scenario: Tap to log recommendation
- **WHEN** user taps "기록하기" on the recommendation card
- **THEN** the meal is pre-filled in the logging interface with the recommended item

### Requirement: App shows encouraging message when all meals logged
If the user has already logged all meals for today, the app SHALL show a summary instead of a suggestion.

#### Scenario: All meals logged
- **WHEN** user has logged breakfast, lunch, and dinner for today
- **THEN** the home screen shows "오늘도 맛있게 드셨네요!" with a summary of today's meals

### Requirement: App adapts suggestion when no history exists
New users with no meal history SHALL see generic suggestions based on meal type and time of day.

#### Scenario: New user suggestion
- **WHEN** a new user with no history opens the app
- **THEN** a friendly message appears: "식사를 기록하면 맞춤 추천을 해드려요!" with popular Korean dish suggestions to start logging
