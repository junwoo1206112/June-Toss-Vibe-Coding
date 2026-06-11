## ADDED Requirements

### Requirement: User can view eating statistics
The app SHALL provide a statistics tab showing eating patterns from the last 90 days.

#### Scenario: Food frequency top 5
- **WHEN** user opens the statistics tab
- **THEN** the app shows the 5 most frequently eaten foods with counts

#### Scenario: Day-of-week pattern
- **WHEN** user views the weekly pattern section
- **THEN** the app shows which days of the week the user logs the most meals

#### Scenario: Meal type distribution
- **WHEN** user views the meal type section
- **THEN** the app shows a breakdown of meals by type (breakfast/lunch/dinner/snack)

#### Scenario: No data yet
- **WHEN** user has fewer than 3 recorded meals
- **THEN** the app shows a message "3끼 이상 기록하면 통계를 볼 수 있어요!"
