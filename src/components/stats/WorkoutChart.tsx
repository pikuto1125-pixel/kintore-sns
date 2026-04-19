"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { WorkoutExercise } from "@/types/database";

type Props = { sessions: { exercises: unknown; created_at: string }[] };

export default function WorkoutChart({ sessions }: Props) {
  const freq: Record<string, number> = {};
  sessions.forEach((s) => {
    const exs = s.exercises as WorkoutExercise[];
    if (!Array.isArray(exs)) return;
    exs.forEach((e) => { freq[e.name] = (freq[e.name] ?? 0) + e.sets * e.reps; });
  });

  const data = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, reps]) => ({ name, reps }));

  if (data.length === 0) return null;

  const COLORS = ["#ff3d5f", "#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];

  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
        種目別総rep数
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            formatter={(v) => [`${v} rep`, "総rep数"]}
          />
          <Bar dataKey="reps" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
