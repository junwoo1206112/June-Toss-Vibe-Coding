import { useState } from "react";
import { useMeals } from "../hooks/useMeals";
import { GUEST_USER_KEY } from "../lib/localMeals";

interface SettingsPageProps {
  userKey: string;
  onBack: () => void;
  onLogout: () => void;
}

const cardStyle = { background: "#F5F5F5", borderRadius: "12px", padding: "16px", marginBottom: "14px" } as const;
const buttonStyle = { padding: "12px 18px", borderRadius: "10px", border: "none", fontSize: "14px", width: "100%", cursor: "pointer" } as const;

export function SettingsPage({ userKey, onBack, onLogout }: SettingsPageProps) {
  const { deleteAllMeals } = useMeals();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isGuest = userKey === GUEST_USER_KEY;

  async function handleDeleteAll() {
    setDeleting(true);
    setMessage(null);
    try {
      await deleteAllMeals(userKey);
      setConfirmDelete(false);
      setMessage("저장된 식사 기록을 모두 삭제했어요.");
    } catch (error) {
      console.error(error);
      setMessage("기록을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", margin: 0 }}>설정</h2>
        <button style={{ ...buttonStyle, width: "auto", padding: "10px 18px", background: "#f0f0f0" }} onClick={onBack}>뒤로</button>
      </div>

      {message && <p role="status" style={{ fontSize: "14px", color: "#666" }}>{message}</p>}

      <section style={cardStyle}>
        <h3 style={{ fontSize: "15px", margin: "0 0 8px" }}>데이터와 위치</h3>
        <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0 }}>
          식사 기록은 맞춤 추천과 통계를 위해 {isGuest ? "현재 기기에만" : "암호화된 서버에"} 저장돼요. 위치는 현재 날씨 조회에만 사용하며 별도로 저장하지 않아요. 위치를 허용하지 않으면 서울 날씨를 사용해요.
        </p>
      </section>

      <section style={cardStyle}>
        <h3 style={{ fontSize: "15px", margin: "0 0 10px" }}>내 기록 관리</h3>
        {!confirmDelete ? (
          <button style={{ ...buttonStyle, background: "#FFECEC", color: "#C62828" }} onClick={() => setConfirmDelete(true)}>
            모든 식사 기록 삭제
          </button>
        ) : (
          <div>
            <p style={{ fontSize: "13px", color: "#C62828" }}>삭제한 기록은 복구할 수 없어요.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ ...buttonStyle, background: "#C62828", color: "white" }} disabled={deleting} onClick={handleDeleteAll}>{deleting ? "삭제 중..." : "삭제 확인"}</button>
              <button style={{ ...buttonStyle, background: "#EAEAEA" }} disabled={deleting} onClick={() => setConfirmDelete(false)}>취소</button>
            </div>
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <button onClick={onLogout} style={{ ...buttonStyle, background: "#FF6B35", color: "white", fontWeight: 600 }}>로그아웃</button>
      </section>

      <section style={cardStyle}>
        <h3 style={{ fontSize: "15px", margin: "0 0 8px" }}>앱 정보</h3>
        <p style={{ fontSize: "14px", color: "#888", margin: "0 0 4px" }}>뭐먹지? v1.0.0</p>
        <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>2026년 6월 바이브코딩 챌린지 출품작</p>
      </section>
    </div>
  );
}
