## ADDED Requirements

### Requirement: User can log in with Toss
The app SHALL support Toss Login via `appLogin()` for user authentication. The authorization code SHALL be exchanged on the server side for access/refresh tokens. The user SHALL be identified by `userKey` from the login-me API.

#### Scenario: Successful login
- **WHEN** user taps "Toss 로그인" button
- **THEN** the Toss login sheet opens and user completes authentication
- **THEN** the app receives an authorization code and sends it to the backend

#### Scenario: Returning user auto-login
- **WHEN** user opens the app and has previously logged in
- **THEN** the stored session is validated and user enters the main screen without re-authentication

### Requirement: User can log out
The app SHALL allow users to disconnect their Toss login via the logout API.

#### Scenario: Logout
- **WHEN** user taps logout in settings
- **THEN** access token is revoked and user returns to login screen
