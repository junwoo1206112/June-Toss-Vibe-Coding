import type { Meal } from "../lib/types";
import { MEAL_TYPE_LABELS } from "../lib/types";
import type { WeatherData } from "../lib/weather";
import { getSeoulDay, isSameSeoulDate } from "./date";

function getDayName(date: Date): string {
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return days[getSeoulDay(date)];
}

function getMealTypeByHour(hour: number): string {
  if (hour < 10) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export interface Recommendation {
  food: string;
  reason: string;
  mealType: string;
  isPersonalized: boolean;
}

export type MealMood = "any" | "light" | "hearty";

const lightFoods = new Set([
  "과일", "요거트", "시리얼", "샐러드", "토스트", "샌드위치", "죽",
  "초밥", "회", "사시미", "메밀소바", "냉모밀", "냉파스타", "콩국수",
]);

const heartyFoods = new Set([
  "국밥", "설렁탕", "김치찌개", "된장찌개", "순두부찌개", "부대찌개",
  "감자탕", "육개장", "삼겹살", "보쌈", "곱창", "불고기", "찜닭",
  "샤브샤브", "훠궈", "닭한마리", "매운탕", "제육덮밥", "돈까스",
]);

const moodFallbacks: Record<Exclude<MealMood, "any">, string[]> = {
  light: ["샐러드", "초밥", "메밀소바", "샌드위치", "죽", "과일", "요거트"],
  hearty: ["김치찌개", "국밥", "제육덮밥", "돈까스", "삼겹살", "감자탕", "샤브샤브"],
};

function matchesMood(food: string, mood: MealMood): boolean {
  if (mood === "light") return lightFoods.has(food);
  if (mood === "hearty") return heartyFoods.has(food);
  return true;
}

function preferMood(foods: string[], mood: MealMood): string[] {
  if (mood === "any") return foods;
  const matched = foods.filter((food) => matchesMood(food, mood));
  return matched.length > 0 ? matched : moodFallbacks[mood];
}

const defaultSuggestions: Record<string, string[]> = {
  breakfast: ["김밥", "토스트", "시리얼", "과일", "샌드위치", "죽", "컵라면"],
  lunch: ["김치찌개", "된장찌개", "비빔밥", "짜장면", "돈까스", "제육덮밥", "마라탕"],
  dinner: ["삼겹살", "치킨", "파스타", "초밥", "불고기", "보쌈", "곱창"],
  snack: ["떡볶이", "라면", "커피", "아이스크림", "케이크", "과자", "핫도그"],
};

const weatherFoods: Record<string, Record<string, string[]>> = {
  rain: {
    breakfast: ["국밥", "설렁탕", "미역국", "죽", "라면", "떡국", "김밥"],
    lunch: ["김치찌개", "된장찌개", "순두부찌개", "부대찌개", "칼국수", "수제비", "짬뽕", "마라탕", "육개장", "우동"],
    dinner: ["삼겹살", "샤브샤브", "훠궈", "전", "파전", "김치전", "곰탕", "찜닭", "매운탕"],
    snack: ["떡볶이", "라면", "어묵탕", "오뎅탕", "핫도그"],
  },
  hot: {
    breakfast: ["과일", "요거트", "시리얼", "샐러드", "토스트"],
    lunch: ["냉면", "물냉면", "비빔냉면", "콩국수", "메밀소바", "초밥", "회", "샐러드", "냉파스타"],
    dinner: ["초밥", "회", "사시미", "냉모밀", "샐러드", "치킨샐러드"],
    snack: ["빙수", "아이스크림", "냉커피", "팥빙수"],
  },
  cold: {
    breakfast: ["죽", "국밥", "설렁탕", "미역국", "떡국"],
    lunch: ["삼겹살", "김치찌개", "된장찌개", "부대찌개", "감자탕", "짬뽕", "샤브샤브", "훠궈", "육개장", "칼국수"],
    dinner: ["삼겹살", "샤브샤브", "훠궈", "불고기", "찜닭", "곰탕", "매운탕", "닭한마리", "오뎅탕"],
    snack: ["핫초코", "호떡", "어묵탕", "떡볶이", "붕어빵"],
  },
  snow: {
    breakfast: ["죽", "국밥", "설렁탕", "떡국", "미역국", "김밥"],
    lunch: ["삼겹살", "김치찌개", "된장찌개", "샤브샤브", "훠궈", "칼국수", "짬뽕", "부대찌개"],
    dinner: ["삼겹살", "샤브샤브", "훠궈", "찜닭", "곰탕", "불고기", "닭한마리", "매운탕"],
    snack: ["핫초코", "호떡", "어묵탕", "떡볶이", "붕어빵"],
  },
};

function getWeatherReason(weather: WeatherData, food: string): string | null {
  if (weather.condition === "rain") return `비 오는 날엔 따뜻한 ${food} 어떠세요?`;
  if (weather.condition === "snow") return `눈 오는 날엔 따뜻한 ${food} 어때요?`;
  if (weather.temperature >= 28) return `더운 날엔 시원한 ${food} 어때요?`;
  if (weather.temperature <= 5) return `추운 날엔 ${food}로 몸을 녹여요!`;
  return null;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRecommendation(
  meals: Meal[],
  weather?: WeatherData | null
): Recommendation {
  const now = new Date();
  const currentMealType = getMealTypeByHour(now.getHours());
  const todayMeals = meals.filter((m) => isSameSeoulDate(m.eaten_at, now));
  const todayFoods = new Set(todayMeals.map((m) => m.food_name));

  const weatherBiasActive =
    weather &&
    (weather.condition === "rain" ||
      weather.condition === "snow" ||
      weather.temperature >= 28 ||
      weather.temperature <= 5);

  if (weatherBiasActive && weather) {
    const category =
      weather.condition === "rain" || weather.condition === "snow" ? (weather.condition === "snow" ? "snow" : "rain") :
      weather.temperature >= 28 ? "hot" : "cold";
    const weatherFoodsList = weatherFoods[category]?.[currentMealType] ?? weatherFoods[category]?.lunch ?? [];
    const historyMatch = meals
      .map((m) => m.food_name)
      .filter((f) => weatherFoodsList.includes(f) && !todayFoods.has(f));
    const unique = [...new Set(historyMatch)];

    if (unique.length > 0) {
      const pick = pickRandom(unique);
      return {
        food: pick,
        reason: getWeatherReason(weather, pick) ?? `오늘 날씨에 딱인 ${pick}!`,
        mealType: currentMealType,
        isPersonalized: true,
      };
    }

    const defaults = weatherFoodsList.filter((f) => !todayFoods.has(f));
    if (defaults.length > 0) {
      const pick = pickRandom(defaults);
      return {
        food: pick,
        reason: getWeatherReason(weather, pick) ?? "오늘 날씨에 딱인 메뉴를 추천해요!",
        mealType: currentMealType,
        isPersonalized: false,
      };
    }
  }

  if (meals.length > 0) {
    const sameDayHistory = meals.filter((m) => {
      const d = new Date(m.eaten_at);
      return getSeoulDay(d) === getSeoulDay(now) && !isSameSeoulDate(m.eaten_at, now);
    });

    const dayStats = new Map<string, number>();
    for (const m of sameDayHistory) {
      dayStats.set(m.food_name, (dayStats.get(m.food_name) ?? 0) + 1);
    }

    const sorted = [...dayStats.entries()]
      .filter(([food]) => !todayFoods.has(food))
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length > 0) {
      return {
        food: sorted[0][0],
        reason: `지난 ${getDayName(now)}에 자주 드셨던 메뉴예요!`,
        mealType: currentMealType,
        isPersonalized: true,
      };
    }

    const recent = meals.filter((m) => !isSameSeoulDate(m.eaten_at, now));
    if (recent.length > 0) {
      const recentFoods = [
        ...new Set(recent.slice(0, 10).map((m) => m.food_name)),
      ];
      const unpicked = recentFoods.filter((f) => !todayFoods.has(f)).slice(0, 3);
      if (unpicked.length > 0) {
        return {
          food: unpicked[Math.floor(Math.random() * unpicked.length)],
          reason: "최근에 드셨던 메뉴 중에서 골라봤어요!",
          mealType: currentMealType,
          isPersonalized: true,
        };
      }
    }
  }

  const defaults =
    defaultSuggestions[currentMealType] ?? defaultSuggestions.lunch;
  const pick = pickRandom(defaults);

  const typeLabels: Record<string, string> = {
    breakfast: "아침", lunch: "점심", dinner: "저녁", snack: "간식",
  };

  return {
    food: pick,
    reason:
      meals.length === 0
        ? `식사를 기록하면 맞춤 추천을 해드려요! 오늘 ${typeLabels[currentMealType]}은 어떠세요?`
        : `오늘은 새로운 메뉴 어때요? ${typeLabels[currentMealType]} 추천이에요!`,
    mealType: currentMealType,
    isPersonalized: false,
  };
}

export function getRecommendations(
  meals: Meal[],
  weather?: WeatherData | null,
  count: number = 3,
  mood: MealMood = "any",
): Recommendation[] {
  const results: Recommendation[] = [];
  const usedFoods = new Set<string>();
  const currentMealType = getMealTypeByHour(new Date().getHours());
  const now = new Date();
  const todayMeals = meals.filter((m) => isSameSeoulDate(m.eaten_at, now));
  const todayFoods = new Set(todayMeals.map((m) => m.food_name));

  // 1. Weather-based recommendations
  if (weather) {
    const category =
      weather.condition === "rain" || weather.condition === "snow"
        ? weather.condition === "snow" ? "snow" : "rain"
        : weather.temperature >= 28 ? "hot"
        : weather.temperature <= 5 ? "cold"
        : null;

    if (category) {
      const weatherFoodsList = preferMood(
        weatherFoods[category]?.[currentMealType] ?? weatherFoods[category]?.lunch ?? [],
        mood,
      );
      const historyMatch = meals
        .map((m) => m.food_name)
        .filter((f) => weatherFoodsList.includes(f) && !todayFoods.has(f) && !usedFoods.has(f));
      const unique = shuffle([...new Set(historyMatch)]);

      for (const food of unique.slice(0, count - results.length)) {
        results.push({
          food,
          reason: getWeatherReason(weather, food) ?? `오늘 날씨에 딱인 ${food}!`,
          mealType: currentMealType,
          isPersonalized: true,
        });
        usedFoods.add(food);
      }

      const defaults = shuffle(weatherFoodsList.filter((f) => !todayFoods.has(f) && !usedFoods.has(f)));
      for (const food of defaults.slice(0, count - results.length)) {
        results.push({
          food,
          reason: getWeatherReason(weather, food) ?? "오늘 날씨에 딱인 메뉴를 추천해요!",
          mealType: currentMealType,
          isPersonalized: false,
        });
        usedFoods.add(food);
      }
    }
  }

  // 2. Pattern-based recommendations
  if (results.length < count && meals.length > 0) {
    const sameDayHistory = meals.filter((m) => {
      const d = new Date(m.eaten_at);
      return getSeoulDay(d) === getSeoulDay(now) && !isSameSeoulDate(m.eaten_at, now);
    });

    const dayStats = new Map<string, number>();
    for (const m of sameDayHistory) {
      dayStats.set(m.food_name, (dayStats.get(m.food_name) ?? 0) + 1);
    }

    const sorted = [...dayStats.entries()]
      .filter(([food]) => !todayFoods.has(food) && !usedFoods.has(food) && matchesMood(food, mood))
      .sort((a, b) => b[1] - a[1]);

    for (const [food] of sorted.slice(0, count - results.length)) {
      results.push({
        food,
        reason: `지난 ${getDayName(now)}에 자주 드셨던 메뉴예요!`,
        mealType: currentMealType,
        isPersonalized: true,
      });
      usedFoods.add(food);
    }

    if (results.length < count) {
      const recent = meals.filter((m) => !isSameSeoulDate(m.eaten_at, now));
      const recentFoods = [...new Set(recent.slice(0, 10).map((m) => m.food_name))]
        .filter((f) => !todayFoods.has(f) && !usedFoods.has(f) && matchesMood(f, mood));

      for (const food of recentFoods.slice(0, count - results.length)) {
        results.push({
          food,
          reason: "최근에 드셨던 메뉴 중에서 골라봤어요!",
          mealType: currentMealType,
          isPersonalized: true,
        });
        usedFoods.add(food);
      }
    }
  }

  // 3. Fill with default suggestions
  if (results.length < count) {
    const defaults = preferMood(defaultSuggestions[currentMealType] ?? defaultSuggestions.lunch, mood);
    const available = shuffle(defaults.filter((f) => !usedFoods.has(f)));

    for (const food of available.slice(0, count - results.length)) {
      results.push({
        food,
        reason: meals.length === 0
          ? `식사를 기록하면 맞춤 추천을 해드려요! 오늘 ${MEAL_TYPE_LABELS[currentMealType]}은 어떠세요?`
          : `오늘은 새로운 메뉴 어때요? ${MEAL_TYPE_LABELS[currentMealType]} 추천이에요!`,
        mealType: currentMealType,
        isPersonalized: false,
      });
      usedFoods.add(food);
    }
  }

  return results;
}

export function getTodayStatus(
  meals: Meal[]
): { logged: string[]; missing: string[] } {
  const todayMeals = meals.filter((m) => isSameSeoulDate(m.eaten_at));
  const loggedTypes = new Set(todayMeals.map((m) => m.meal_type));

  const allTypes = ["breakfast", "lunch", "dinner"];
  const typeLabels: Record<string, string> = {
    breakfast: "아침", lunch: "점심", dinner: "저녁",
  };

  return {
    logged: allTypes.filter((t) => loggedTypes.has(t)).map((t) => typeLabels[t]),
    missing: allTypes.filter((t) => !loggedTypes.has(t)).map((t) => typeLabels[t]),
  };
}
