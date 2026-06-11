## ADDED Requirements

### Requirement: App fetches current weather
The app SHALL fetch current weather conditions using the Open-Meteo API based on the user's geolocation.

#### Scenario: Successful weather fetch
- **WHEN** user opens the app and geolocation is available
- **THEN** the app queries Open-Meteo with latitude, longitude, and requests temperature + weather code
- **THEN** the response is cached for the current session (30-minute TTL)

#### Scenario: Geolocation denied
- **WHEN** user denies location permission
- **THEN** the app uses Seoul coordinates (37.5665, 126.9780) as fallback

#### Scenario: Weather API failure
- **WHEN** Open-Meteo API returns error or times out (5 seconds)
- **THEN** weather data is null and the app falls back to non-weather recommendation logic

### Requirement: App displays current weather condition
The app SHALL display the current weather condition and temperature on the home screen.

#### Scenario: Normal weather display
- **WHEN** weather data is available
- **THEN** the home screen shows temperature (e.g., "24°C") and weather emoji (☀️/☁️/🌧️/❄️)

#### Scenario: No weather data
- **WHEN** weather data is unavailable (API failed, location denied with fallback timeout)
- **THEN** weather section is hidden and only time-based recommendation is shown
