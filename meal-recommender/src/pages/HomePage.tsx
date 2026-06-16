import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Meal } from "../lib/types";
import type { WeatherData } from "../lib/weather";
import { getWeather } from "../lib/weather";
import { useMeals } from "../hooks/useMeals";
import { getNextRecommendedMealType, getRecommendations, getTodayStatus, type MealMood } from "../lib/recommendation";
import { koreanFoods } from "../lib/koreanFoods";
import { Skeleton } from "../components/Skeleton";
import type { Recommendation } from "../lib/recommendation";
import { isSameSeoulDate } from "../lib/date";
import { trackClick, trackImpression, trackScreen } from "../lib/analytics";

interface HomePageProps {
  userKey: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const btnPrimary = { padding: "12px 24px", borderRadius: "10px", background: "#FF6B35", color: "white", border: "none", fontSize: "15px", fontWeight: 600, cursor: "pointer" } as const;
const btnWeak = { padding: "10px 18px", borderRadius: "8px", background: "#f0f0f0", color: "#333", border: "none", fontSize: "14px", cursor: "pointer" } as const;
const btnSmall = { padding: "6px 12px", borderRadius: "8px", background: "#f0f0f0", color: "#333", border: "none", fontSize: "13px", cursor: "pointer" } as const;
const btnSmallActive = { ...btnSmall, background: "#FF6B35", color: "white" };
const btnSmallDisabled = { ...btnSmall, color: "#aaa", cursor: "not-allowed" };
const mainMealTypes: Meal["meal_type"][] = ["breakfast", "lunch", "dinner"];
const mealTypeLabels: Record<Meal["meal_type"], string> = { breakfast: "아침", lunch: "점심", dinner: "저녁", snack: "간식" };

export function HomePage({ userKey, onNavigate, onLogout }: HomePageProps) {
  const { getRecentMeals, getFavorites, addMeal } = useMeals();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [favorites, setFavorites] = useState<Meal[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [logFood, setLogFood] = useState("");
  const [logType, setLogType] = useState<Meal["meal_type"]>("lunch");
  const [logFav, setLogFav] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState(-1);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !sessionStorage.getItem("onboarding_done");
  });
  const [justLogged, setJustLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mealMood, setMealMood] = useState<MealMood>("any");
  const lastRecommendationImpression = useRef("");

  const load = useCallback(async () => {
    setMealsLoading(true);
    setError(null);
    try {
      const [recent, favs, w] = await Promise.all([
        getRecentMeals(userKey, 30),
        getFavorites(userKey),
        getWeather(),
      ]);
      setMeals(recent);
      setFavorites(favs);
      setWeather(w);
      if (recent.length > 0) setShowOnboarding(false);
    } catch (loadError) {
      console.error(loadError);
      setError("기록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      const w = await getWeather();
      setWeather(w);
    } finally {
      setWeatherLoading(false);
      setMealsLoading(false);
    }
  }, [getFavorites, getRecentMeals, userKey]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    trackScreen("meal_home_screen");
  }, []);

  useEffect(() => {
    if (!mealsLoading) setRecs(getRecommendations(meals, weather, 3, mealMood));
  }, [mealMood, meals, mealsLoading, weather]);

  useEffect(() => {
    if (mealsLoading || recs.length === 0) return;

    const signature = `${mealMood}:${recs.map((rec) => rec.food).join("|")}`;
    if (lastRecommendationImpression.current === signature) return;
    lastRecommendationImpression.current = signature;

    trackImpression("meal_recommendation_impression", {
      mood: mealMood,
      recommendation_count: recs.length,
      meal_type: recs[0].mealType,
      has_history: meals.length > 0,
      weather_source: weather?.locationSource ?? "unavailable",
    });
  }, [mealMood, meals.length, mealsLoading, recs, weather?.locationSource]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function refreshRecs() {
    trackClick("meal_recommendation_refresh_click", { mood: mealMood });
    setRecs(getRecommendations(meals, weather, 3, mealMood));
    setSelectedRec(-1);
  }

  const todayStatus = useMemo(() => getTodayStatus(meals), [meals]);
  const recentFoods = useMemo(() => [...new Set(meals.slice(0, 10).map((m) => m.food_name))], [meals]);
  const favoriteFoods = useMemo(() => [...new Set(favorites.map((m) => m.food_name))], [favorites]);
  const todayMeals = useMemo(() => {
    return meals.filter((m) => isSameSeoulDate(m.eaten_at));
  }, [meals]);
  const loggedMainTypes = useMemo(() => {
    return new Set(todayMeals.filter((m) => mainMealTypes.includes(m.meal_type)).map((m) => m.meal_type));
  }, [todayMeals]);
  const nextRecommendedMealType = useMemo(() => getNextRecommendedMealType(meals), [meals]);
  const allMealsLogged = todayStatus.missing.length === 0 && todayMeals.length > 0;
  const isMainLogTypeComplete = mainMealTypes.includes(logType) && loggedMainTypes.has(logType);

  useEffect(() => {
    if (nextRecommendedMealType && !showLog) setLogType(nextRecommendedMealType);
  }, [nextRecommendedMealType, showLog]);

  function handleFoodInput(value: string) {
    setLogFood(value);
    if (value.length > 0) {
      setSuggestions(koreanFoods.filter((f) => f.includes(value)).slice(0, 5));
    } else setSuggestions([]);
  }

  async function handleLogMeal() {
    if (!logFood.trim() || saving) return;
    if (mainMealTypes.includes(logType) && loggedMainTypes.has(logType)) {
      setError(`오늘 ${mealTypeLabels[logType]}은 이미 기록했어요. 기록 화면에서 수정해주세요.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addMeal(userKey, logFood.trim(), logType, logFav);
      trackClick("meal_log_success", {
        source: selectedRec >= 0 ? "recommendation" : "manual",
        meal_type: logType,
        favorite: logFav,
      });
      setLogFood(""); setLogFav(false); setShowLog(false);
      setJustLogged(true);
      await load();
      setTimeout(() => setJustLogged(false), 2000);
    } catch (saveError) {
      console.error(saveError);
      setError("기록을 저장하지 못했어요. 입력 내용은 그대로 두었으니 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "16px", paddingBottom: "80px", animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", margin: "0 0 4px" }}>뭐먹지?</h2>
          <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
            {mealsLoading ? "불러오는 중..." :
             allMealsLogged ? "오늘도 맛있게 드셨네요!" :
             todayStatus.missing.length > 0 ? `아직 ${todayStatus.missing.join(", ")}을(를) 안 드셨네요!`
             : "오늘도 맛있게 드셨네요!"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button style={btnSmall} onClick={handleRefresh} aria-label="새로고침">{refreshing ? "⏳" : "🔄"}</button>
          <button style={btnSmall} onClick={onLogout} aria-label="로그아웃">🚪</button>
        </div>
      </div>

      {!mealsLoading && justLogged && (
        <div style={{ padding: "8px 14px", marginBottom: "12px", background: "#E8F5E9", borderRadius: "8px", color: "#2E7D32", fontSize: "14px", textAlign: "center" }}>
          ✅ 기록 완료!
        </div>
      )}

      {error && (
        <div role="alert" style={{ padding: "10px 14px", marginBottom: "12px", background: "#FFF0F0", borderRadius: "8px", color: "#C62828", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {showOnboarding && !mealsLoading && meals.length === 0 && (
        <div style={{ background: "#FFF3E0", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#FF6B35", margin: "0 0 4px" }}>👋 환영합니다!</p>
          <p style={{ fontSize: "13px", color: "#666", margin: "0 0 8px" }}>
            오늘 먹은 음식을 간단히 기록하고 맞춤 추천을 받아보세요.
            <br />기록이 쌓이면 통계도 볼 수 있어요!
          </p>
          <button style={{ ...btnSmall, background: "#FF6B35", color: "white" }} onClick={() => { setShowOnboarding(false); sessionStorage.setItem("onboarding_done", "1"); }}>
            닫기
          </button>
        </div>
      )}

      {weatherLoading && !weather ? (
        <Skeleton height={44} style={{ marginBottom: "12px" }} />
      ) : weather ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "10px 14px", background: "#f0f4f8", borderRadius: "10px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{new Date().getHours()}시 {String(new Date().getMinutes()).padStart(2, "0")}분</span>
          <span style={{ color: "#ccc" }}>|</span>
          <span style={{ fontSize: "22px" }}>{weather.icon}</span>
          <span style={{ fontSize: "15px", fontWeight: 600 }}>{weather.temperature}°C</span>
          <span style={{ fontSize: "13px", color: "#666" }}>{weather.label}</span>
          {weather.locationSource === "seoul-default" && <span style={{ fontSize: "11px", color: "#888" }}>서울 기준</span>}
        </div>
      ) : (
        !weatherLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "10px 14px", background: "#f0f4f8", borderRadius: "10px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700 }}>{new Date().getHours()}시 {String(new Date().getMinutes()).padStart(2, "0")}분</span>
          </div>
        )
      )}

      {allMealsLogged && (
        <div style={{ background: "#F5F5F5", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 8px" }}>📋 오늘 먹은 메뉴</p>
          {["breakfast", "lunch", "dinner"].map((type) => {
            const meal = todayMeals.find((m) => m.meal_type === type);
            return (
              <div key={type} style={{ display: "flex", gap: "8px", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#888", fontSize: "14px", width: "36px" }}>{mealTypeLabels[type]}</span>
                <span style={{ fontSize: "14px", color: meal ? "#333" : "#ccc" }}>{meal?.food_name ?? "기록 없음"}</span>
              </div>
            );
          })}
        </div>
      )}

      {mealsLoading ? (
        <div style={{ marginBottom: "16px" }}>
          <Skeleton height={120} style={{ marginBottom: "12px" }} />
          <Skeleton height={44} />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "16px" }}>
            {recs.length === 0 ? (
              <div style={{ background: "#F5F5F5", borderRadius: "12px", padding: "16px" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px" }}>오늘의 세 끼 기록이 끝났어요</p>
                <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
                  간식은 추가로 기록할 수 있고, 아침/점심/저녁을 바꾸려면 기록 화면에서 수정해주세요.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  {(["any", "light", "hearty"] as MealMood[]).map((mood) => (
                    <button
                      key={mood}
                      style={mealMood === mood ? btnSmallActive : btnSmall}
                      onClick={() => {
                        trackClick("meal_recommendation_mood_click", { mood });
                        setMealMood(mood);
                      }}
                    >
                      {{ any: "아무거나", light: "가볍게", hearty: "든든하게" }[mood]}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "13px", color: "#888", margin: "0 0 8px" }}>
                  🍽️ 다음 추천 · {mealTypeLabels[recs[0].mealType]}</p>
                {recs.map((rec, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      trackClick("meal_recommendation_select_click", {
                        mood: mealMood,
                        position: i + 1,
                        meal_type: rec.mealType,
                      });
                      setSelectedRec(i);
                    }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: i === selectedRec ? "linear-gradient(135deg, #FF6B35, #FF8F50)" : "#F5F5F5",
                      borderRadius: "12px", padding: "12px 16px", marginBottom: "6px",
                      color: i === selectedRec ? "white" : "#333",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "16px", fontWeight: 700 }}>{rec.food}</div>
                      <div style={{ fontSize: "12px", opacity: 0.8 }}>{rec.reason}</div>
                    </div>
                    <button
                      style={{
                        padding: "6px 14px", borderRadius: "8px",
                        background: i === selectedRec ? "rgba(255,255,255,0.25)" : "#FF6B35",
                        color: "white", border: "none", fontSize: "13px", cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        trackClick("meal_recommendation_log_click", {
                          mood: mealMood,
                          position: i + 1,
                          meal_type: rec.mealType,
                        });
                        setSelectedRec(i);
                        setLogFood(rec.food);
                        setLogType(rec.mealType);
                        setShowLog(true);
                      }}
                    >
                      먹었어요
                    </button>
                  </div>
                ))}
                <button style={{ ...btnSmall, width: "100%", marginTop: "4px" }} onClick={refreshRecs}>
                  🔄 다른 추천 보기
                </button>
              </>
            )}
          </div>

          {!showLog ? (
            <button
              style={{ ...btnPrimary, width: "100%", marginBottom: "16px" }}
              onClick={() => {
                setLogType(nextRecommendedMealType ?? "snack");
                setShowLog(true);
              }}
            >
              오늘 뭐 먹었어요?
            </button>
          ) : (
            <div style={{ background: "#F5F5F5", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                {(Object.entries(mealTypeLabels) as [Meal["meal_type"], string][]).map(([id, label]) => {
                  const disabled = mainMealTypes.includes(id) && loggedMainTypes.has(id);
                  return (
                    <button
                      key={id}
                      style={disabled ? btnSmallDisabled : logType === id ? btnSmallActive : btnSmall}
                      disabled={disabled}
                      onClick={() => setLogType(id)}
                    >
                      {label}{disabled ? " 완료" : ""}
                    </button>
                  );
                })}
              </div>
              {isMainLogTypeComplete && (
                <p style={{ fontSize: "13px", color: "#C62828", margin: "0 0 8px" }}>
                  오늘 {mealTypeLabels[logType]}은 이미 기록했어요. 바꾸려면 기록 화면에서 수정해주세요.
                </p>
              )}
              <input type="text" placeholder="뭐 드셨어요? (예: 김치찌개)" value={logFood}
                onChange={(e) => handleFoodInput(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", boxSizing: "border-box", marginBottom: suggestions.length > 0 ? "4px" : "12px" }} />
              {suggestions.length > 0 && (
                <div style={{ background: "white", borderRadius: "8px", border: "1px solid #eee", marginBottom: "12px" }}>
                  {suggestions.map((s) => (
                    <div key={s} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
                      onClick={() => { setLogFood(s); setSuggestions([]); }}>{s}</div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                <input type="checkbox" id="fav" checked={logFav} onChange={(e) => setLogFav(e.target.checked)} />
                <label htmlFor="fav" style={{ fontSize: "14px", color: "#666" }}>즐겨찾기에 추가</label>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={btnPrimary} onClick={handleLogMeal} disabled={!logFood.trim() || saving || isMainLogTypeComplete}>{saving ? "저장 중..." : "기록하기"}</button>
                <button style={btnWeak} onClick={() => setShowLog(false)}>취소</button>
              </div>
              {favoriteFoods.length > 0 && <TagSection title="⭐ 즐겨찾기" color="#FF6B35" items={favoriteFoods} onSelect={(f) => { setLogFood(f); setSuggestions([]); }} />}
              {recentFoods.length > 0 && <TagSection title="최근 기록" items={recentFoods} onSelect={(f) => { setLogFood(f); setSuggestions([]); }} />}
            </div>
          )}
        </>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button style={{ ...btnWeak, flex: 1, textAlign: "center" }} onClick={() => onNavigate("history")}>기록 보기</button>
        <button style={{ ...btnWeak, flex: 1, textAlign: "center" }} onClick={() => onNavigate("statistics")}>통계</button>
        <button style={{ ...btnWeak, flex: 1, textAlign: "center" }} onClick={() => onNavigate("settings")}>설정</button>
      </div>
    </div>
  );
}

function TagSection({ title, color, items, onSelect }: { title: string; color?: string; items: string[]; onSelect: (f: string) => void }) {
  return (
    <div style={{ marginTop: "12px" }}>
      <p style={{ fontSize: "13px", color: color ?? "#888", margin: "0 0 6px" }}>{title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {items.map((f) => (
          <button key={f} style={{ padding: "6px 12px", borderRadius: "8px", background: "#f0f0f0", color: "#333", border: "none", fontSize: "13px", cursor: "pointer" }} onClick={() => onSelect(f)}>{f}</button>
        ))}
      </div>
    </div>
  );
}
