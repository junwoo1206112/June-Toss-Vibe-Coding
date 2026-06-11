export interface Meal {
  id?: string;
  user_id: string;
  food_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  eaten_at: string;
  is_favorite?: boolean;
}

export const MEAL_TYPE_LABELS: Record<Meal["meal_type"], string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};
