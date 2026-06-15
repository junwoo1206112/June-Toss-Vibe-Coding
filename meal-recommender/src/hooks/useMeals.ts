import { mealApiRequest, isMealApiConfigured, type PaginatedMeals } from "../lib/mealApi";
import { supabase } from "../lib/supabase";
import type { Meal } from "../lib/types";
import {
  GUEST_USER_KEY,
  addLocalMeal,
  deleteAllLocalMeals,
  deleteLocalMeal,
  getLocalMeals,
  updateLocalMeal,
} from "../lib/localMeals";

const PAGE_SIZE = 20;

function assertDataMode(): void {
  if (!isMealApiConfigured && !import.meta.env.DEV) {
    throw new Error("안전한 데이터 API가 설정되지 않았어요.");
  }
}

async function directQuery<T>(operation: () => PromiseLike<T>): Promise<T> {
  assertDataMode();
  return operation();
}

async function getMeals(userId: string): Promise<Meal[]> {
  if (userId === GUEST_USER_KEY) return getLocalMeals();
  if (isMealApiConfigured) return mealApiRequest<Meal[]>("/meals");

  return directQuery(async () => {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .order("eaten_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

async function getMealsPaginated(userId: string, page = 0): Promise<PaginatedMeals> {
  if (userId === GUEST_USER_KEY) {
    const meals = getLocalMeals().slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    return { meals, hasMore: meals.length === PAGE_SIZE };
  }
  if (isMealApiConfigured) {
    return mealApiRequest<PaginatedMeals>(`/meals?page=${page}&pageSize=${PAGE_SIZE}`);
  }

  return directQuery(async () => {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .order("eaten_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) throw error;
    const meals = data ?? [];
    return { meals, hasMore: meals.length === PAGE_SIZE };
  });
}

async function getRecentMeals(userId: string, days = 7): Promise<Meal[]> {
  if (userId === GUEST_USER_KEY) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return getLocalMeals().filter((meal) => new Date(meal.eaten_at) >= since);
  }
  if (isMealApiConfigured) return mealApiRequest<Meal[]>(`/meals?days=${days}`);

  return directQuery(async () => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("eaten_at", since.toISOString())
      .order("eaten_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

async function getFavorites(userId: string): Promise<Meal[]> {
  if (userId === GUEST_USER_KEY) return getLocalMeals().filter((meal) => meal.is_favorite);
  if (isMealApiConfigured) return mealApiRequest<Meal[]>("/meals?favorites=true");

  return directQuery(async () => {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("eaten_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

async function addMeal(
  userId: string,
  foodName: string,
  mealType: Meal["meal_type"],
  isFavorite = false,
): Promise<Meal> {
  if (userId === GUEST_USER_KEY) return addLocalMeal(foodName, mealType, isFavorite);
  const payload = { food_name: foodName, meal_type: mealType, is_favorite: isFavorite };
  if (isMealApiConfigured) {
    return mealApiRequest<Meal>("/meals", { method: "POST", body: JSON.stringify(payload) });
  }

  return directQuery(async () => {
    const { data, error } = await supabase
      .from("meals")
      .insert({ ...payload, user_id: userId, eaten_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  });
}

async function editMeal(id: string, foodName: string, mealType: Meal["meal_type"], userId?: string): Promise<Meal> {
  if (userId === GUEST_USER_KEY) return updateLocalMeal(id, { food_name: foodName, meal_type: mealType });
  const payload = { food_name: foodName, meal_type: mealType };
  if (isMealApiConfigured) {
    return mealApiRequest<Meal>(`/meals/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  }

  return directQuery(async () => {
    const { data, error } = await supabase.from("meals").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  });
}

async function deleteMeal(id: string, userId?: string): Promise<void> {
  if (userId === GUEST_USER_KEY) {
    deleteLocalMeal(id);
    return;
  }
  if (isMealApiConfigured) {
    await mealApiRequest<{ success: true }>(`/meals/${id}`, { method: "DELETE" });
    return;
  }

  await directQuery(async () => {
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) throw error;
  });
}

async function deleteAllMeals(userId: string): Promise<void> {
  if (userId === GUEST_USER_KEY) {
    deleteAllLocalMeals();
    return;
  }
  if (isMealApiConfigured) {
    await mealApiRequest<{ success: true }>("/meals", { method: "DELETE" });
    return;
  }

  await directQuery(async () => {
    const { error } = await supabase.from("meals").delete().eq("user_id", userId);
    if (error) throw error;
  });
}

async function toggleFavorite(id: string, current: boolean, userId?: string): Promise<Meal> {
  if (userId === GUEST_USER_KEY) return updateLocalMeal(id, { is_favorite: !current });
  if (isMealApiConfigured) {
    return mealApiRequest<Meal>(`/meals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_favorite: !current }),
    });
  }

  return directQuery(async () => {
    const { data, error } = await supabase
      .from("meals")
      .update({ is_favorite: !current })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  });
}

const mealService = {
  getMeals,
  getMealsPaginated,
  getRecentMeals,
  getFavorites,
  addMeal,
  editMeal,
  deleteMeal,
  deleteAllMeals,
  toggleFavorite,
};

export function useMeals() {
  return mealService;
}
