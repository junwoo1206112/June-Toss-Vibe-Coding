import { useState, useEffect, useCallback } from "react";
import type { Meal } from "../lib/types";
import { useMeals } from "../hooks/useMeals";
import { Skeleton } from "../components/Skeleton";
import { toSeoulDateKey } from "../lib/date";

interface HistoryPageProps {
  userKey: string;
  onBack: () => void;
}

const btnSmall = {
  padding: "6px 12px", borderRadius: "8px", border: "none", fontSize: "13px", cursor: "pointer",
};
const btnWeak = {
  padding: "10px 18px", borderRadius: "8px", background: "#f0f0f0", color: "#333", border: "none", fontSize: "14px", cursor: "pointer",
};

export function HistoryPage({ userKey, onBack }: HistoryPageProps) {
  const { getMealsPaginated, editMeal, deleteMeal, toggleFavorite } = useMeals();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [view, setView] = useState<"timeline" | "calendar">("timeline");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFood, setEditFood] = useState("");
  const [editType, setEditType] = useState("lunch");
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (requestedPage: number, reset: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMealsPaginated(userKey, requestedPage);
      setMeals((current) => reset ? result.meals : [...current, ...result.meals]);
      setHasMore(result.hasMore);
      setPage(requestedPage);
    } catch (loadError) {
      console.error(loadError);
      setError("기록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [getMealsPaginated, userKey]);

  useEffect(() => { void loadPage(0, true); }, [loadPage]);

  function loadMore() {
    void loadPage(page + 1, false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteMeal(id, userKey);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setDeletingId(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError("기록을 삭제하지 못했어요.");
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editFood.trim()) return;
    try {
      const updated = await editMeal(id, editFood.trim(), editType as Meal["meal_type"], userKey);
      setMeals((prev) => prev.map((m) => m.id === id ? updated : m));
      setEditingId(null);
    } catch (editError) {
      console.error(editError);
      setError("기록을 수정하지 못했어요.");
    }
  }

  function startEdit(meal: Meal) {
    setEditingId(meal.id ?? null);
    setEditFood(meal.food_name);
    setEditType(meal.meal_type);
    setDeletingId(null);
  }

  async function handleFavorite(meal: Meal) {
    if (!meal.id) return;
    try {
      const updated = await toggleFavorite(meal.id, meal.is_favorite ?? false, userKey);
      setMeals((prev) => prev.map((m) => m.id === meal.id ? updated : m));
    } catch (favoriteError) {
      console.error(favoriteError);
      setError("즐겨찾기를 변경하지 못했어요.");
    }
  }

  const grouped = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    const date = toSeoulDateKey(meal.eaten_at);
    (acc[date] ??= []).push(meal);
    return acc;
  }, {});

  const mealTypeLabels: Record<string, string> = {
    breakfast: "아침", lunch: "점심", dinner: "저녁", snack: "간식",
  };

  const today = new Date();
  const [m, setM] = useState(today.getMonth());
  const [y, setY] = useState(today.getFullYear());
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(y, m, 1).getDay();
  const datesWithMeals = new Set(meals.map((meal) => toSeoulDateKey(meal.eaten_at)));

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "22px", margin: 0 }}>식사 기록</h2>
        <button style={btnWeak} onClick={onBack}>뒤로</button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button style={{
          ...btnSmall, background: view === "timeline" ? "#FF6B35" : "#f0f0f0",
          color: view === "timeline" ? "white" : "#333",
        }} onClick={() => setView("timeline")}>타임라인</button>
        <button style={{
          ...btnSmall, background: view === "calendar" ? "#FF6B35" : "#f0f0f0",
          color: view === "calendar" ? "white" : "#333",
        }} onClick={() => setView("calendar")}>캘린더</button>
      </div>

      {error && <p role="alert" style={{ color: "#C62828", fontSize: "14px" }}>{error}</p>}

      {view === "calendar" && (
        <div style={{ background: "#F5F5F5", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <button style={btnSmall} onClick={() => m === 0 ? (setM(11), setY(y - 1)) : setM(m - 1)}>◀</button>
            <span style={{ fontSize: "18px", fontWeight: 600 }}>{y}년 {m + 1}월</span>
            <button style={btnSmall} onClick={() => m === 11 ? (setM(0), setY(y + 1)) : setM(m + 1)}>▶</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", gap: "4px" }}>
            {["일","월","화","수","목","금","토"].map((d) => (
              <div key={d} style={{ padding: "8px 0", fontSize: "12px", color: "#888" }}>{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return (
                <div key={day} style={{ padding: "8px 0", fontSize: "14px" }}>
                  {day}{datesWithMeals.has(ds) && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B35", margin: "2px auto 0" }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "timeline" && (
        <div>
          {initialLoading ? (
            <>
              <Skeleton height={20} width="40%" style={{ marginBottom: "12px" }} />
              <Skeleton height={48} style={{ marginBottom: "8px" }} />
              <Skeleton height={48} style={{ marginBottom: "8px" }} />
              <Skeleton height={48} />
            </>
          ) : (
          <>
          {Object.entries(grouped).map(([date, dateMeals]) => (
            <div key={date} style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 8px" }}>{date}</p>
              {dateMeals.map((meal) => (
                <div key={meal.id} style={{ background: "#F5F5F5", borderRadius: "8px", padding: "12px 16px", marginBottom: "6px" }}>
                  {editingId === meal.id ? (
                    <div>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                        {Object.entries(mealTypeLabels).map(([id, label]) => (
                          <button
                            key={id}
                            style={{
                              ...btnSmall,
                              background: editType === id ? "#FF6B35" : "#f0f0f0",
                              color: editType === id ? "white" : "#333",
                            }}
                            onClick={() => setEditType(id)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={editFood}
                        onChange={(e) => setEditFood(e.target.value)}
                        style={{
                          width: "100%", padding: "8px", borderRadius: "6px",
                          border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box",
                          marginBottom: "8px",
                        }}
                      />
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          style={{ ...btnSmall, background: "#FF6B35", color: "white" }}
                          onClick={() => meal.id && handleSaveEdit(meal.id)}
                        >
                          저장
                        </button>
                        <button style={btnSmall} onClick={() => setEditingId(null)}>취소</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#888" }}>{mealTypeLabels[meal.meal_type] ?? meal.meal_type}</span>
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }} onClick={() => handleFavorite(meal)}>
                            {meal.is_favorite ? "⭐" : "☆"}
                          </button>
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 600 }}>{meal.food_name}</div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button style={btnSmall} onClick={() => startEdit(meal)}>수정</button>
                        {deletingId === meal.id ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button style={{ ...btnSmall, background: "#E53935", color: "white" }} onClick={() => meal.id && handleDelete(meal.id)}>확인</button>
                            <button style={btnSmall} onClick={() => setDeletingId(null)}>취소</button>
                          </div>
                        ) : (
                          <button style={btnSmall} onClick={() => meal.id && setDeletingId(meal.id)}>삭제</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {meals.length === 0 && <p style={{ color: "#888", fontSize: "14px" }}>아직 기록된 식사가 없어요.</p>}
          {hasMore && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <button style={btnWeak} onClick={loadMore} disabled={loading}>
                {loading ? "불러오는 중..." : "더 보기"}
              </button>
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}
