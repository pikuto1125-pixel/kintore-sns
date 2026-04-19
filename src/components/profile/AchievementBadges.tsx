"use client";
import type { Profile } from "@/types/database";
import { ACHIEVEMENTS, getTitle } from "@/types/database";

export default function AchievementBadges({ profile }: { profile: Profile }) {
  const earned = ACHIEVEMENTS.filter((a) => a.condition(profile));
  const title = getTitle(profile);

  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          称号・バッジ
        </div>
        <div
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(255,61,95,0.15)", color: "var(--accent)", border: "1px solid rgba(255,61,95,0.3)" }}
        >
          {title}
        </div>
      </div>

      {earned.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          まだバッジがありません。トレーニングを続けよう！
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {earned.map((a) => (
            <div
              key={a.id}
              title={a.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold animate-badge-pop"
              style={{ background: `${a.color}22`, border: `1px solid ${a.color}66`, color: a.color }}
            >
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress to next badge */}
      {!ACHIEVEMENTS.every((a) => a.condition(profile)) && (
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>次のバッジまで</div>
          {ACHIEVEMENTS.filter((a) => !a.condition(profile)).slice(0, 2).map((a) => {
            let progress = 0;
            let target = 1;
            if (a.id.startsWith("streak_")) { target = parseInt(a.id.split("_")[1]); progress = Math.min(profile.longest_streak, target); }
            else if (a.id.startsWith("reps_")) { target = parseInt(a.id.split("_")[1]); progress = Math.min(profile.total_reps, target); }
            else if (a.id.startsWith("workouts_")) { target = parseInt(a.id.split("_")[1]); progress = Math.min(profile.total_workouts, target); }
            const pct = Math.round((progress / target) * 100);
            return (
              <div key={a.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: a.color }}>{a.emoji} {a.label}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{progress}/{target}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--surface-2)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: a.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
