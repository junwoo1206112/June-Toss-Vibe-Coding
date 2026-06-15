import type { Meal } from "./types";

export const GUEST_USER_KEY = "guest-local";

const STORAGE_KEY = "meal_guest_records";

function readMeals(): Meal[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
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
  const meal: Meal = {
    id: crypto.randomUUID(),
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
  const meals = readMeals().map((meal) => {
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
