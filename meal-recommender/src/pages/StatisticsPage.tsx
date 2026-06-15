import { useState, useEffect } from "react";
import type { Meal } from "../lib/types";
import { useMeals } from "../hooks/useMeals";
import { Skeleton } from "../components/Skeleton";
import { getSeoulDay } from "../lib/date";

interface StatisticsPageProps {
  userKey: string;
  onBack: () => void;
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
const typeLabels: Record<string, string> = {
  breakfast: "아침", lunch: "점심", dinner: "저녁", snack: "간식",
};

export function StatisticsPage({ userKey, onBack }: StatisticsPageProps) {
  const { getMeals } = useMeals();
  const [meals, setMeals] = useState<Meal[] | null>(null);

  useEffect(() => {
    getMeals(userKey).then(setMeals);
  }, [getMeals, userKey]);

  if (!meals) {
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "22px", margin: 0 }}>식사 통계</h2>
          <button style={btn} onClick={onBack}>뒤로</button>
        </div>
        <Skeleton height={200} style={{ marginBottom: "16px" }} />
        <Skeleton height={120} style={{ marginBottom: "12px" }} />
        <Skeleton height={120} />
      </div>
    );
  }

  if (meals.length < 3) {
    return (
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "22px", margin: 0 }}>식사 통계</h2>
          <button style={btn} onClick={onBack}>뒤로</button>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "16px", color: "#888" }}>3끼 이상 기록하면 통계를 볼 수 있어요!</p>
          <p style={{ fontSize: "14px", color: "#bbb" }}>꾸준히 기록하고 패턴을 확인해보세요</p>
        </div>
      </div>
    );
  }

  const freq = new Map<string, number>();
  for (const m of meals) {
    freq.set(m.food_name, (freq.get(m.food_name) ?? 0) + 1);
  }
  const top5 = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const dayCount = new Map<number, number>();
  for (const m of meals) {
    const d = getSeoulDay(m.eaten_at);
    dayCount.set(d, (dayCount.get(d) ?? 0) + 1);
  }
  const maxDay = Math.max(...dayCount.values(), 1);

  const typeCount: Record<string, number> = {};
  for (const m of meals) {
    typeCount[m.meal_type] = (typeCount[m.meal_type] ?? 0) + 1;
  }
  const maxType = Math.max(...Object.values(typeCount), 1);

  const total = meals.length;
  const unique = freq.size;

  return (
    <div style={{ padding: "16px", paddingBottom: "80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "22px", margin: 0 }}>식사 통계</h2>
        <button style={btn} onClick={onBack}>뒤로</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        <StatCard label="총 기록" value={`${total}끼`} />
        <StatCard label="다양한 메뉴" value={`${unique}종`} />
      </div>

      <Section title="가장 많이 먹은 음식 TOP 5">
        {top5.map(([food, count], i) => (
          <div key={food} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#888", width: "20px" }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: "14px" }}>{food}</span>
            <span style={{ fontSize: "12px", color: "#FF6B35", fontWeight: 600 }}>{count}회</span>
          </div>
        ))}
      </Section>

      <Section title="요일별 식사">
        {dayNames.map((name, i) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", width: "20px", color: "#888" }}>{name}</span>
            <div style={{ flex: 1, height: "20px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((dayCount.get(i) ?? 0) / maxDay) * 100}%`, background: "#FF6B35", borderRadius: "4px", transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: "12px", color: "#888", width: "30px", textAlign: "right" }}>{dayCount.get(i) ?? 0}</span>
          </div>
        ))}
      </Section>

      <Section title="식사 유형">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", width: "32px", color: "#888" }}>{label}</span>
            <div style={{ flex: 1, height: "20px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((typeCount[type] ?? 0) / maxType) * 100}%`, background: "#4CAF50", borderRadius: "4px", transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: "12px", color: "#888", width: "30px", textAlign: "right" }}>{typeCount[type] ?? 0}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#F5F5F5", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
      <div style={{ fontSize: "24px", fontWeight: 700, color: "#FF6B35" }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#F5F5F5", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
      <p style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 12px" }}>{title}</p>
      {children}
    </div>
  );
}

const btn = {
  padding: "10px 18px", borderRadius: "8px", background: "#f0f0f0", color: "#333", border: "none", fontSize: "14px", cursor: "pointer",
};
