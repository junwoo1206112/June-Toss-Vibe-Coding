interface LoginPageProps {
  onLogin: () => void;
  onDevLogin?: () => void;
  error?: string | null;
  loading?: boolean;
}

export function LoginPage({ onLogin, onDevLogin, error, loading }: LoginPageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
        gap: "32px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "#111" }}>
        뭐먹지?
      </h1>
      <p style={{ fontSize: "16px", color: "#666", margin: 0, lineHeight: 1.6 }}>
        오늘 뭐 먹을지 고민된다면?
        <br />
        식사를 기록하고 맞춤 추천을 받아보세요
      </p>

      <img
        alt="meal"
        src={`${import.meta.env.BASE_URL}appsintoss-logo.png`}
        style={{ width: "160px", height: "160px", borderRadius: "50%", background: "#FFF3E0" }}
      />

      <button
        onClick={onLogin}
        disabled={loading}
        style={{
          padding: "14px 48px",
          borderRadius: "12px",
          background: "#FF6B35",
          color: "white",
          border: "none",
          fontSize: "16px",
          fontWeight: 600,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "default" : "pointer",
          width: "100%",
          maxWidth: "280px",
        }}
      >
        {loading ? "로그인 중..." : "토스로 시작하기"}
      </button>

      {error && (
        <p style={{ color: "#E53935", fontSize: "14px", margin: 0 }}>{error}</p>
      )}

      <span style={{ fontSize: "14px", color: "#999" }}>
        토스 계정 하나로 간편하게 시작해요
      </span>

      {onDevLogin && (
        <>
          <div style={{ width: "100%", height: "1px", background: "#eee" }} />
          <button
            onClick={onDevLogin}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              background: "#f0f0f0",
              color: "#666",
              border: "none",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            개발자 모드 (로컬 미리보기)
          </button>
          <span style={{ fontSize: "12px", color: "#bbb" }}>
            실제 토스앱 환경에서는 표시되지 않습니다
          </span>
        </>
      )}
    </div>
  );
}
