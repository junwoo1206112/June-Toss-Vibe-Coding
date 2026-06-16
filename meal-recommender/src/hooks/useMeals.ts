import { mealApiRequest, isMealApiConfigured, type PaginatedMeals } from "../lib/mealApi";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Meal } from "../lib/types";
import { getSeoulDateRange } from "../lib/date";
import {
  GUEST_USER_KEY,
  addLocalMeal,
  deleteAllLocalMeals,
  deleteLocalMeal,
  getLocalMeals,
  updateLocalMeal,
} from "../lib/localMeals";

const PAGE_SIZE = 20;
const MAIN_MEAL_TYPES = new Set<Meal["meal_type"]>(["breakfast", "lunch", "dinner"]);
const MEAL_TYPE_LABELS: Record<Meal["meal_type"], string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

function assertDataMode(): void {
  if (!isMealApiConfigured && !import.meta.env.DEV) {
    throw new Error("안전한 데이터 API가 설정되지 않았어요.");
  }
  if (!isMealApiConfigured && !isSupabaseConfigured) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }
}

async function directQuery<T>(operation: (client: NonNullable<typeof supabase>) => PromiseLike<T>): Promise<T> {
  assertDataMode();
  const client = supabase;
  if (!client) throw new Error("Supabase 클라이언트를 사용할 수 없어요.");
  return operation(client);
}

async function getMeals(userId: string): Promise<Meal[]> {
  if (userId === GUEST_USER_KEY) return getLocalMeals();
  if (isMealApiConfigured) return mealApiRequest<Meal[]>("/meals");

  return directQuery(async (client) => {
    const { data, error } = await client
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

  return directQuery(async (client) => {
    const { data, error } = await client
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

  return directQuery(async (client) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data, error } = await client
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

  return directQuery(async (client) => {
    const { data, error } = await client
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

  return directQuery(async (client) => {
    if (MAIN_MEAL_TYPES.has(mealType)) {
      const { start, end } = getSeoulDateRange();
      const { data: existing, error: duplicateError } = await client
        .from("meals")
        .select("id")
        .eq("user_id", userId)
        .eq("meal_type", mealType)
        .gte("eaten_at", start)
        .lt("eaten_at", end)
        .limit(1);
      if (duplicateError) throw duplicateError;
      if ((existing?.length ?? 0) > 0) {
        throw new Error(`오늘 ${MEAL_TYPE_LABELS[mealType]}은 이미 기록했어요. 기록 화면에서 수정해주세요.`);
      }
    }

    const { data, error } = await client
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

  return directQuery(async (client) => {
    if (!userId) throw new Error("사용자 정보가 없어서 수정할 수 없어요.");
    if (MAIN_MEAL_TYPES.has(mealType)) {
      const { data: current, error: currentError } = await client
        .from("meals")
        .select("eaten_at")
        .eq("id", id)
        .eq("user_id", userId)
        .single();
      if (currentError) throw currentError;
      const { start, end } = getSeoulDateRange(current.eaten_at);
      const { data: existing, error: duplicateError } = await client
        .from("meals")
        .select("id")
        .eq("user_id", userId)
        .eq("meal_type", mealType)
        .gte("eaten_at", start)
        .lt("eaten_at", end)
        .neq("id", id)
        .limit(1);
      if (duplicateError) throw duplicateError;
      if ((existing?.length ?? 0) > 0) {
        throw new Error(`해당 날짜의 ${MEAL_TYPE_LABELS[mealType]}은 이미 기록되어 있어요.`);
      }
    }

    const { data, error } = await client
      .from("meals")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
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

  await directQuery(async (client) => {
    if (!userId) throw new Error("사용자 정보가 없어서 삭제할 수 없어요.");
    const { error } = await client.from("meals").delete().eq("id", id).eq("user_id", userId);
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

  await directQuery(async (client) => {
    const { error } = await client.from("meals").delete().eq("user_id", userId);
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

  return directQuery(async (client) => {
    if (!userId) throw new Error("사용자 정보가 없어서 변경할 수 없어요.");
    const { data, error } = await client
      .from("meals")
      .update({ is_favorite: !current })
      .eq("id", id)
      .eq("user_id", userId)
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
