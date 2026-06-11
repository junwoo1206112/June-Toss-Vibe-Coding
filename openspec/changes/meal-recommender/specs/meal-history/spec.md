## ADDED Requirements

### Requirement: User can view meal history as a timeline
The app SHALL display the user's meal history in reverse chronological order, grouped by date.

#### Scenario: View today's meals
- **WHEN** user opens the home screen
- **THEN** today's logged meals are shown in a timeline with meal type icons and timestamps

#### Scenario: Scroll past days
- **WHEN** user scrolls down on the timeline
- **THEN** previous days' meals are loaded and displayed, grouped by date

### Requirement: User can view meal history as a calendar
The app SHALL provide a calendar view showing which days have meal logs.

#### Scenario: Calendar overview
- **WHEN** user switches to calendar view
- **THEN** a monthly calendar is shown with dots indicating days that have meal logs
- **WHEN** user taps a specific date
- **THEN** the full meal log for that date is displayed

### Requirement: User can delete a meal entry
The app SHALL allow users to delete individual meal entries from their history.

#### Scenario: Delete a meal
- **WHEN** user swipes left on a meal entry
- **THEN** a delete option appears
- **WHEN** user confirms deletion
- **THEN** the entry is removed from Supabase and the UI updates
