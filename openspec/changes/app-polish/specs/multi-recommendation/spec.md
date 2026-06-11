## ADDED Requirements

### Requirement: App shows 3 recommendation options
The app SHALL display 3 diverse meal recommendations instead of just one.

#### Scenario: Multiple recommendations
- **WHEN** user opens the home screen
- **THEN** the recommendation card shows 3 unique food suggestions
- **THEN** each suggestion has a "이거 먹었어요" button to log it

#### Scenario: No duplicate recommendations
- **WHEN** the recommendation engine generates options
- **THEN** all 3 options are distinct (no duplicates)

#### Scenario: Re-rolling recommendations
- **WHEN** user taps "다른 추천" button
- **THEN** all 3 slots are replaced with new unique suggestions
