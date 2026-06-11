export interface WeatherData {
  temperature: number;
  condition: "clear" | "cloudy" | "rain" | "snow";
  icon: string;
  label: string;
}

let cached: { data: WeatherData; ts: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000;

function getCondition(weatherCode: number): {
  condition: WeatherData["condition"];
  icon: string;
  label: string;
} {
  if (weatherCode >= 51 && weatherCode <= 67)
    return { condition: "rain", icon: "🌧️", label: "비" };
  if (weatherCode >= 71 && weatherCode <= 77)
    return { condition: "snow", icon: "❄️", label: "눈" };
  if (weatherCode >= 80 && weatherCode <= 82)
    return { condition: "rain", icon: "🌧️", label: "소나기" };
  if (weatherCode >= 85 && weatherCode <= 86)
    return { condition: "snow", icon: "❄️", label: "눈" };
  if (weatherCode >= 2 && weatherCode <= 3)
    return { condition: "cloudy", icon: "☁️", label: "흐림" };
  if (weatherCode >= 45 && weatherCode <= 48)
    return { condition: "cloudy", icon: "🌫️", label: "안개" };
  return { condition: "clear", icon: "☀️", label: "맑음" };
}

async function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coords: { latitude: 37.5665, longitude: 126.978 },
      } as GeolocationPosition);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () =>
        resolve({
          coords: { latitude: 37.5665, longitude: 126.978 },
        } as GeolocationPosition),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  });
}

export async function getWeather(): Promise<WeatherData | null> {
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const pos = await getPosition();
    const { latitude, longitude } = pos.coords;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=Asia/Seoul`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Weather API failed");

    const json = await res.json();
    const temp = json.current?.temperature_2m;
    const code = json.current?.weather_code;

    if (temp == null || code == null) throw new Error("Incomplete data");

    const { condition, icon, label } = getCondition(code);
    const data: WeatherData = { temperature: Math.round(temp), condition, icon, label };
    cached = { data, ts: Date.now() };
    return data;
  } catch {
    return null;
  }
}
