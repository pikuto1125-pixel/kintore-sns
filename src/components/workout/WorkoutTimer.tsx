"use client";
import { useEffect, useRef } from "react";
import { useWorkoutStore } from "@/store/workout-store";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function WorkoutTimer() {
  const { timerSeconds, isTimerRunning, setTimerSeconds, setTimerRunning } = useWorkoutStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(useWorkoutStore.getState().timerSeconds + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, setTimerSeconds]);

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
        トレーニングタイマー
      </div>

      <div
        className="text-6xl font-black tabular-nums"
        style={{
          color: isTimerRunning ? "var(--accent)" : "var(--text-primary)",
          textShadow: isTimerRunning ? "0 0 20px var(--accent-glow)" : "none",
          transition: "all 0.3s",
        }}
      >
        {format(timerSeconds)}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTimerRunning(!isTimerRunning)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{
            background: isTimerRunning ? "var(--surface)" : "var(--accent)",
            border: isTimerRunning ? "1px solid var(--border)" : "none",
            color: isTimerRunning ? "var(--text-primary)" : "white",
            boxShadow: isTimerRunning ? "none" : "0 0 12px var(--accent-glow)",
          }}
        >
          {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isTimerRunning ? "一時停止" : "スタート"}
        </button>

        <button
          onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
          className="p-2.5 rounded-xl transition-all hover:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {timerSeconds >= 60 && (
        <div className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
          ✓ タイマー条件クリア（1分以上）
        </div>
      )}
    </div>
  );
}
