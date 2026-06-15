import { useState, useCallback } from "react";
import { appLogin } from "@apps-in-toss/web-framework";
import {
  clearMealAccessToken,
  exchangeTossLogin,
  getMealAccessToken,
  setMealAccessToken,
} from "../lib/mealApi";
import { GUEST_USER_KEY } from "../lib/localMeals";

interface AuthState {
  userKey: string | null;
  isLoggedIn: boolean;
}

const STORAGE_KEY = "meal_user_key";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const hasSession = stored === GUEST_USER_KEY || import.meta.env.DEV || !!getMealAccessToken();
    return { userKey: hasSession ? stored : null, isLoggedIn: !!stored && hasSession };
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const login = useCallback(async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { authorizationCode, referrer } = await appLogin();
      const { userKey, accessToken } = await exchangeTossLogin(authorizationCode, referrer);
      setMealAccessToken(accessToken);
      sessionStorage.setItem(STORAGE_KEY, userKey);
      setAuth({ userKey, isLoggedIn: true });
      setLoginError(null);
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError("로그인에 실패했어요. 다시 시도해주세요.");
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const devLogin = useCallback(() => {
    const userKey = "dev-user-key";
    sessionStorage.setItem(STORAGE_KEY, userKey);
    setAuth({ userKey, isLoggedIn: true });
    setLoginError(null);
  }, []);

  const guestLogin = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, GUEST_USER_KEY);
    clearMealAccessToken();
    setAuth({ userKey: GUEST_USER_KEY, isLoggedIn: true });
    setLoginError(null);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    clearMealAccessToken();
    setAuth({ userKey: null, isLoggedIn: false });
    setLoginError(null);
    setLoginLoading(false);
  }, []);

  return { ...auth, login, guestLogin, devLogin, logout, loginError, loginLoading };
}
