"use client";
import { useMemo } from "react";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";

type Props = { dates: string[] }; // ISO date strings of workout days

export default function CalendarHeatmap({ dates }: Props) {
  const workoutSet = useMemo(() => new Set(dates.map((d) => d.slice(0, 10))), [dates]);

  const weeks = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 6 * 7 - 1);
    const weekStart = startOfWeek(start, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: today });

    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, []);

  const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

  const getColor = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    if (date > new Date()) return "var(--surface)";
    return workoutSet.has(key) ? "var(--accent)" : "var(--surface-2)";
  };

  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
        トレーニングカレンダー（直近42日）
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1 pt-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="h-4 flex items-center text-xs" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              const key = format(day, "yyyy-MM-dd");
              const hasWorkout = workoutSet.has(key);
              return (
                <div
                  key={di}
                  title={`${format(day, "M/d（E）", { locale: ja })}${hasWorkout ? " 💪" : ""}`}
                  className="w-4 h-4 rounded-sm transition-all"
                  style={{
                    background: getColor(day),
                    boxShadow: hasWorkout ? "0 0 4px var(--accent-glow)" : "none",
                    opacity: day > new Date() ? 0.3 : 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>
        <span>少</span>
        {[0.2, 0.5, 0.8, 1].map((o) => (
          <div key={o} className="w-3 h-3 rounded-sm" style={{ background: "var(--accent)", opacity: o }} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}
