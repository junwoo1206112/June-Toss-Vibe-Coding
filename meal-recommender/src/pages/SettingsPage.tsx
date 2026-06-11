interface SettingsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsPage({ onBack, onLogout }: SettingsPageProps) {
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", margin: 0 }}>설정</h2>
        <button
          style={{
            padding: "10px 18px", borderRadius: "8px", background: "#f0f0f0",
            color: "#333", border: "none", fontSize: "14px", cursor: "pointer",
          }}
          onClick={onBack}
        >
          뒤로
        </button>
      </div>

      <div style={{ background: "#F5F5F5", borderRadius: "12px", padding: "16px" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 12px" }}>계정</p>
        <button
          onClick={onLogout}
          style={{
            padding: "14px 24px", borderRadius: "10px", background: "#FF6B35",
            color: "white", border: "none", fontSize: "15px", fontWeight: 600, cursor: "pointer", width: "100%",
          }}
        >
          로그아웃
        </button>
      </div>

      <div style={{ marginTop: "24px", background: "#F5F5F5", borderRadius: "12px", padding: "16px" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 12px" }}>앱 정보</p>
        <p style={{ fontSize: "14px", color: "#888", margin: "0 0 4px" }}>뭐먹지? v1.0.0</p>
        <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>6월 바이브코딩 챌린지 출품작</p>
      </div>
    </div>
  );
}
