import type { Meal } from "./types";
import { isSameSeoulDate } from "./date";

export const GUEST_USER_KEY = "guest-local";

const STORAGE_KEY = "meal_guest_records";
const MEAL_TYPES = new Set<Meal["meal_type"]>(["breakfast", "lunch", "dinner", "snack"]);
const MAIN_MEAL_TYPES = new Set<Meal["meal_type"]>(["breakfast", "lunch", "dinner"]);
const MEAL_TYPE_LABELS: Record<Meal["meal_type"], string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

function isValidMeal(value: unknown): value is Meal {
  if (value == null || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    typeof m.user_id === "string" &&
    typeof m.food_name === "string" &&
    typeof m.eaten_at === "string" &&
    MEAL_TYPES.has(m.meal_type as Meal["meal_type"]) &&
    (m.is_favorite == null || typeof m.is_favorite === "boolean")
  );
}

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function readMeals(): Meal[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidMeal);
  } catch {
    return [];
  }
}

function writeMeals(meals: Meal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

export function getLocalMeals(): Meal[] {
  return [...readMeals()].sort(
    (a, b) => new Date(b.eaten_at).getTime() - new Date(a.eaten_at).getTime(),
  );
}

export function addLocalMeal(
  foodName: string,
  mealType: Meal["meal_type"],
  isFavorite: boolean,
): Meal {
  if (MAIN_MEAL_TYPES.has(mealType)) {
    const duplicate = readMeals().find((meal) => meal.meal_type === mealType && isSameSeoulDate(meal.eaten_at));
    if (duplicate) {
      throw new Error(`오늘 ${MEAL_TYPE_LABELS[mealType]}은 이미 기록했어요. 기록 화면에서 수정해주세요.`);
    }
  }
  const meal: Meal = {
    id: generateId(),
    user_id: GUEST_USER_KEY,
    food_name: foodName,
    meal_type: mealType,
    is_favorite: isFavorite,
    eaten_at: new Date().toISOString(),
  };
  writeMeals([meal, ...readMeals()]);
  return meal;
}

export function updateLocalMeal(id: string, changes: Partial<Meal>): Meal {
  let updated: Meal | null = null;
  const currentMeals = readMeals();
  const original = currentMeals.find((meal) => meal.id === id);
  const nextMealType = changes.meal_type ?? original?.meal_type;
  if (original && nextMealType && MAIN_MEAL_TYPES.has(nextMealType)) {
    const duplicate = currentMeals.find(
      (meal) =>
        meal.id !== id &&
        meal.meal_type === nextMealType &&
        isSameSeoulDate(meal.eaten_at, original.eaten_at),
    );
    if (duplicate) {
      throw new Error(`해당 날짜의 ${MEAL_TYPE_LABELS[nextMealType]}은 이미 기록되어 있어요.`);
    }
  }

  const meals = currentMeals.map((meal) => {
    if (meal.id !== id) return meal;
    updated = { ...meal, ...changes, id: meal.id, user_id: GUEST_USER_KEY };
    return updated;
  });
  if (!updated) throw new Error("수정할 식사 기록을 찾지 못했어요.");
  writeMeals(meals);
  return updated;
}

export function deleteLocalMeal(id: string): void {
  writeMeals(readMeals().filter((meal) => meal.id !== id));
}

export function deleteAllLocalMeals(): void {
  localStorage.removeItem(STORAGE_KEY);
}
