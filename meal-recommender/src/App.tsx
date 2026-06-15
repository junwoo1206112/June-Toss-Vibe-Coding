import { useState } from "react";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { HistoryPage } from "./pages/HistoryPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { SettingsPage } from "./pages/SettingsPage";

type Page = "login" | "home" | "history" | "statistics" | "settings";

const isDev = import.meta.env.DEV;
const isTossLoginEnabled = import.meta.env.VITE_ENABLE_TOSS_LOGIN === "true";

function App() {
  const { userKey, isLoggedIn, login, guestLogin, devLogin, logout, loginError, loginLoading } =
    useAuth();
  const [page, setPage] = useState<Page>("login");

  if (!isLoggedIn || !userKey) {
    return (
      <LoginPage
        onGuestLogin={guestLogin}
        onLogin={isTossLoginEnabled ? login : undefined}
        onDevLogin={isDev ? devLogin : undefined}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  switch (page) {
    case "history":
      return <HistoryPage userKey={userKey} onBack={() => setPage("home")} />;
    case "statistics":
      return <StatisticsPage userKey={userKey} onBack={() => setPage("home")} />;
    case "settings":
      return (
        <SettingsPage
          userKey={userKey}
          onBack={() => setPage("home")}
          onLogout={() => {
            logout();
            setPage("login");
          }}
        />
      );
    default:
      return (
        <HomePage
          userKey={userKey}
          onNavigate={setPage}
          onLogout={() => {
            logout();
            setPage("login");
          }}
        />
      );
  }
}

export default App;
