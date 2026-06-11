import { useState, useCallback } from "react";
import { appLogin } from "@apps-in-toss/web-framework";

interface AuthState {
  userKey: string | null;
  isLoggedIn: boolean;
}

const STORAGE_KEY = "meal_user_key";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return { userKey: stored, isLoggedIn: !!stored };
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const login = useCallback(async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { authorizationCode, referrer } = await appLogin();
      const response = await fetch(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorizationCode, referrer }),
        }
      );
      const tokenData = await response.json();
      if (tokenData.resultType !== "SUCCESS") throw new Error("Login failed");

      const userResp = await fetch(
        "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me",
        {
          headers: {
            Authorization: `Bearer ${tokenData.success.accessToken}`,
          },
        }
      );
      const userData = await userResp.json();
      if (userData.resultType !== "SUCCESS")
        throw new Error("User info failed");

      const userKey = String(userData.success.userKey);
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

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuth({ userKey: null, isLoggedIn: false });
    setLoginError(null);
    setLoginLoading(false);
  }, []);

  return { ...auth, login, devLogin, logout, loginError, loginLoading };
}
