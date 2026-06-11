## ADDED Requirements

### Requirement: User can log a meal with minimal taps
The app SHALL provide a meal logging interface where the user can select a meal type (breakfast/lunch/dinner/snack) and enter a food name with autocomplete suggestions from past entries and a built-in Korean food database.

#### Scenario: Log breakfast
- **WHEN** user opens the logging screen and selects "아침"
- **THEN** autocomplete shows recent breakfast items plus popular Korean breakfast foods
- **WHEN** user taps a suggestion or types a new entry and confirms
- **THEN** the meal is saved to Supabase with user_id, food_name, meal_type, and timestamp

#### Scenario: Quick-add recent meal
- **WHEN** user taps the quick-add button on the home screen
- **THEN** a list of the 5 most recent meals appears
- **WHEN** user taps one
- **THEN** it's logged immediately with the current timestamp

### Requirement: User can add favorite meals
The app SHALL allow users to mark meals as favorites for even faster logging.

#### Scenario: Favorite a meal
- **WHEN** user long-presses a meal entry
- **THEN** a "즐겨찾기 추가" option appears
- **WHEN** user confirms
- **THEN** the meal is added to favorites and appears in a dedicated quick-add section

#### Scenario: Log from favorites
- **WHEN** user opens the favorites section on the logging screen
- **THEN** favorite meals are displayed for one-tap logging
