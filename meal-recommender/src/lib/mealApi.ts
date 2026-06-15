import type { Meal } from "./types";

const API_URL = import.meta.env.VITE_MEAL_API_URL?.replace(/\/$/, "") ?? "";
const TOKEN_KEY = "meal_access_token";

export const isMealApiConfigured = API_URL.length > 0;

export function getMealAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setMealAccessToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearMealAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body.error === "string" ? body.error : "요청을 처리하지 못했어요.";
    throw new Error(message);
  }
  return body as T;
}

export async function exchangeTossLogin(
  authorizationCode: string,
  referrer: string,
): Promise<{ userKey: string; accessToken: string }> {
  if (!isMealApiConfigured) {
    throw new Error("운영 API가 설정되지 않았어요.");
  }

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorizationCode, referrer }),
  });
  return parseResponse(response);
}

export async function mealApiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!isMealApiConfigured) {
    throw new Error("운영 API가 설정되지 않았어요.");
  }

  const token = getMealAccessToken();
  if (!token) throw new Error("로그인이 필요해요.");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  return parseResponse<T>(response);
}

export interface PaginatedMeals {
  meals: Meal[];
  hasMore: boolean;
}

