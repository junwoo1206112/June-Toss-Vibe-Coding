import { supabase } from "../lib/supabase";
import type { Meal } from "../lib/types";

const PAGE_SIZE = 20;

export function useMeals() {
  async function getMeals(userId: string): Promise<Meal[]> {
    try {
      const { data } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .order("eaten_at", { ascending: false });
      return data ?? [];
    } catch {
      return [];
    }
  }

  async function getMealsPaginated(
    userId: string,
    page: number = 0
  ): Promise<{ meals: Meal[]; hasMore: boolean }> {
    try {
      const { data } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .order("eaten_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      const meals = data ?? [];
      return { meals, hasMore: meals.length === PAGE_SIZE };
    } catch {
      return { meals: [], hasMore: false };
    }
  }

  async function getRecentMeals(
    userId: string,
    days: number = 7
  ): Promise<Meal[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .gte("eaten_at", since.toISOString())
        .order("eaten_at", { ascending: false });
      return data ?? [];
    } catch {
      return [];
    }
  }

  async function getFavorites(userId: string): Promise<Meal[]> {
    try {
      const { data } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .eq("is_favorite", true)
        .order("eaten_at", { ascending: false });
      return data ?? [];
    } catch {
      return [];
    }
  }

  async function addMeal(
    userId: string,
    foodName: string,
    mealType: Meal["meal_type"],
    isFavorite: boolean = false
  ): Promise<Meal | null> {
    try {
      const meal = {
        user_id: userId,
        food_name: foodName,
        meal_type: mealType,
        eaten_at: new Date().toISOString(),
        is_favorite: isFavorite,
      };
      const { data } = await supabase
        .from("meals")
        .insert(meal)
        .select()
        .single();
      return data;
    } catch {
      return null;
    }
  }

  async function editMeal(
    id: string,
    foodName: string,
    mealType: Meal["meal_type"]
  ): Promise<void> {
    try {
      await supabase
        .from("meals")
        .update({ food_name: foodName, meal_type: mealType })
        .eq("id", id);
    } catch {
      //
    }
  }

  async function deleteMeal(id: string): Promise<void> {
    try {
      await supabase.from("meals").delete().eq("id", id);
    } catch {
      //
    }
  }

  async function toggleFavorite(
    id: string,
    current: boolean
  ): Promise<void> {
    try {
      await supabase
        .from("meals")
        .update({ is_favorite: !current })
        .eq("id", id);
    } catch {
      //
    }
  }

  return {
    getMeals,
    getMealsPaginated,
    getRecentMeals,
    getFavorites,
    addMeal,
    editMeal,
    deleteMeal,
    toggleFavorite,
  };
}
