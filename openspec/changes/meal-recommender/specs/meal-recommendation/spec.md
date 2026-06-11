## ADDED Requirements

### Requirement: App recommends meals based on day-of-week pattern
The app SHALL analyze the user's meal history and suggest meals they commonly eat on specific days of the week.

#### Scenario: Monday recommendation
- **WHEN** user opens the app on a Monday and has meal history
- **THEN** the app shows "지난주 월요일에는 XX를 드셨어요. 오늘도 드실래요?" with the most common Monday meal

#### Scenario: No history for today
- **WHEN** user opens the app on a day with no matching history
- **THEN** the app shows popular meals from the user's overall history

### Requirement: App recommends meals based on meal type
The app SHALL consider the time of day when making recommendations.

#### Scenario: Lunchtime recommendation
- **WHEN** user opens the app between 11:00-13:00
- **THEN** recommendations prioritize lunch-type meals from history

#### Scenario: Dinnertime recommendation
- **WHEN** user opens the app between 17:00-20:00
- **THEN** recommendations prioritize dinner-type meals from history

### Requirement: App suggests variety
The app SHALL avoid recommending the same meal the user just had.

#### Scenario: Variety suggestion
- **WHEN** the most common meal for today was also eaten yesterday
- **THEN** the app shows the second most common option instead with "어제는 XX를 드셨네요! 오늘은 YY 어떠세요?"
