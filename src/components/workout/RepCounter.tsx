"use client";
import { useState } from "react";
import { useWorkoutStore, EXERCISE_BADGE_MAP } from "@/store/workout-store";
import type { WorkoutBadge } from "@/types/database";
import { Plus, Minus, Check, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";

const EXERCISE_PRESETS = Object.keys(EXERCISE_BADGE_MAP);

export default function RepCounter() {
  const { exercises, addExercise, removeExercise } = useWorkoutStore();
  const [selectedExercise, setSelectedExercise] = useState(EXERCISE_PRESETS[0]);
  const [reps, setReps] = useState(10);
  const [sets, setSets] = useState(3);

  const handleAdd = () => {
    addExercise({
      name: selectedExercise,
      reps,
      sets,
      badge: (EXERCISE_BADGE_MAP[selectedExercise] ?? "full_body") as WorkoutBadge,
    });
  };

  const totalReps = exercises.reduce((sum, ex) => sum + ex.reps * ex.sets, 0);

  return (
    <div className="rounded-2xl border p-6 space-y-5" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          種目を追加
        </div>
        {totalReps > 0 && (
          <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,61,95,0.15)", color: "var(--accent)" }}>
            合計 {totalReps} rep
          </div>
        )}
      </div>

      {/* Exercise selector */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>種目</label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            {EXERCISE_PRESETS.map((ex) => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>セット</label>
            <div className="flex items-center gap-1">
              <button onClick={() => setSets(Math.max(1, sets - 1))} className="p-1.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Minus className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
              </button>
              <span className="flex-1 text-center text-sm font-bold" style={{ color: "var(--text-primary)" }}>{sets}</span>
              <button onClick={() => setSets(sets + 1)} className="p-1.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Plus className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>レップ</label>
            <div className="flex items-center gap-1">
              <button onClick={() => setReps(Math.max(1, reps - 1))} className="p-1.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Minus className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
              </button>
              <span className="flex-1 text-center text-sm font-bold" style={{ color: "var(--text-primary)" }}>{reps}</span>
              <button onClick={() => setReps(reps + 1)} className="p-1.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Plus className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      >
        <Plus className="w-4 h-4" style={{ color: "var(--accent)" }} />
        種目を追加
      </button>

      {/* Exercise list */}
      {exercises.length > 0 && (
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl animate-slide-up"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <Badge badge={ex.badge} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ex.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {ex.sets}セット × {ex.reps}rep = {ex.sets * ex.reps}rep
                  </div>
                </div>
              </div>
              <button onClick={() => removeExercise(i)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {totalReps >= 30 && (
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
          <Check className="w-3.5 h-3.5" />
          レップ条件クリア（30rep以上）
        </div>
      )}
    </div>
  );
}
