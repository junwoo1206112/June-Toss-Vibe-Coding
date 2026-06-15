import { useEffect, useState } from "react";
import { getRecommendations, type MealMood, type Recommendation } from "../lib/recommendation";
import { getWeather, type WeatherData } from "../lib/weather";

interface LoginPageProps {
  onGuestLogin: () => void;
  onLogin?: () => void;
  onDevLogin?: () => void;
  error?: string | null;
  loading?: boolean;
}

export function LoginPage({ onGuestLogin, onLogin, onDevLogin, error, loading }: LoginPageProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() =>
    getRecommendations([], null, 3),
  );
  const [mealMood, setMealMood] = useState<MealMood>("any");

  useEffect(() => {
    void getWeather(false).then((result) => {
      setWeather(result);
      setRecommendations(getRecommendations([], result, 3, mealMood));
    });
  }, [mealMood]);

  return (
    <main style={{ minHeight: "100vh", padding: "28px 20px 40px", background: "#fff" }}>
      <div style={{ maxWidth: "440px", margin: "0 auto" }}>
        <img
          src={`${import.meta.env.BASE_URL}meal-recommender-icon.png`}
          alt="뭐먹지?"
          width={72}
          height={72}
          style={{ display: "block", borderRadius: "18px", marginBottom: "18px" }}
        />
        <p style={{ fontSize: "14px", color: "#FF6B35", fontWeight: 700, margin: "0 0 8px" }}>
          고민은 짧게, 식사는 맛있게
        </p>
        <h1 style={{ fontSize: "30px", lineHeight: 1.3, margin: "0 0 10px", color: "#111" }}>
          지금 먹을 메뉴를<br />3초 만에 골라보세요
        </h1>
        <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.6, margin: "0 0 24px" }}>
          현재 시간과 날씨에 어울리는 메뉴예요. 시작하면 이 기기에 식사 기록을 저장하고 더 정확하게 추천해드려요.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "#666", fontSize: "13px" }}>
          {weather ? <span>{weather.icon} {weather.temperature}°C · {weather.label} · 서울 기준</span> : <span>현재 시간 기준 추천</span>}
        </div>

        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          {(["any", "light", "hearty"] as MealMood[]).map((mood) => (
            <button
              key={mood}
              onClick={() => setMealMood(mood)}
              style={{ flex: 1, padding: "9px 4px", borderRadius: "10px", border: 0, background: mealMood === mood ? "#FF6B35" : "#F0F0F0", color: mealMood === mood ? "white" : "#555", fontSize: "13px" }}
            >
              {{ any: "아무거나", light: "가볍게", hearty: "든든하게" }[mood]}
            </button>
          ))}
        </div>

        <section aria-label="지금의 메뉴 추천" style={{ marginBottom: "14px" }}>
          {recommendations.map((recommendation) => (
            <div key={recommendation.food} style={{ padding: "14px 16px", background: "#F7F7F8", borderRadius: "14px", marginBottom: "8px" }}>
              <strong style={{ display: "block", fontSize: "17px", marginBottom: "3px" }}>{recommendation.food}</strong>
              <span style={{ fontSize: "13px", color: "#777" }}>{recommendation.reason}</span>
            </div>
          ))}
        </section>

        <button
          type="button"
          onClick={() => setRecommendations(getRecommendations([], weather, 3, mealMood))}
          style={{ width: "100%", padding: "12px", border: 0, borderRadius: "12px", background: "#F0F0F0", color: "#333", fontSize: "14px", marginBottom: "20px" }}
        >
          다른 메뉴 추천받기
        </button>

        <button
          onClick={onGuestLogin}
          style={{ padding: "15px 24px", borderRadius: "12px", background: "#FF6B35", color: "white", border: "none", fontSize: "16px", fontWeight: 700, opacity: loading ? 0.6 : 1, width: "100%" }}
        >
          기기에 기록하고 맞춤 추천받기
        </button>

        {onLogin && (
          <button
            onClick={onLogin}
            disabled={loading}
            style={{ padding: "12px 24px", borderRadius: "12px", background: "#F0F0F0", color: "#555", border: "none", fontSize: "14px", marginTop: "8px", width: "100%" }}
          >
            {loading ? "로그인 중..." : "토스 계정으로 기록 동기화"}
          </button>
        )}

        {error && <p role="alert" style={{ color: "#E53935", fontSize: "14px", textAlign: "center" }}>{error}</p>}
        <p style={{ fontSize: "12px", color: "#999", textAlign: "center", lineHeight: 1.5 }}>
          게스트 기록은 이 기기에만 저장돼요. 위치를 허용하지 않으면 서울 날씨를 기준으로 추천해요.
        </p>

        {onDevLogin && (
          <button onClick={onDevLogin} style={{ width: "100%", padding: "10px", border: 0, background: "transparent", color: "#999", fontSize: "12px" }}>
            개발자 모드로 데이터 기능 확인
          </button>
        )}
      </div>
    </main>
  );
}
