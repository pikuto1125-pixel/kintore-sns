import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import type { WorkoutBadge, WorkoutExercise } from "@/types/database";
import { Clock, Dumbbell, Flame, CheckCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const totalSessions = sessions?.length ?? 0;
  const totalReps = sessions?.reduce((sum, s) => sum + s.total_reps, 0) ?? 0;
  const totalMinutes = Math.floor((sessions?.reduce((sum, s) => sum + s.duration_seconds, 0) ?? 0) / 60);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>トレーニング履歴</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          過去のセッション記録
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "総セッション", value: totalSessions, unit: "回", icon: <Dumbbell className="w-4 h-4" /> },
          { label: "総レップ数", value: totalReps.toLocaleString(), unit: "rep", icon: <Flame className="w-4 h-4" /> },
          { label: "総トレ時間", value: totalMinutes, unit: "分", icon: <Clock className="w-4 h-4" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-4 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex justify-center mb-2" style={{ color: "var(--accent)" }}>{stat.icon}</div>
            <div className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
              {stat.value}
              <span className="text-xs font-normal ml-1" style={{ color: "var(--text-secondary)" }}>{stat.unit}</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Session list */}
      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <div className="font-semibold">まだトレーニング記録がありません</div>
          <div className="text-sm mt-2">
            <Link href="/workout" style={{ color: "var(--accent)" }} className="hover:underline font-medium">
              今すぐトレーニングを始める →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const exercises = session.exercises as WorkoutExercise[];
            const badges = [...new Set(exercises.map((e) => e.badge))] as WorkoutBadge[];
            const durationMin = Math.floor(session.duration_seconds / 60);
            const durationSec = session.duration_seconds % 60;

            return (
              <div
                key={session.id}
                className="rounded-2xl border p-5 space-y-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {format(new Date(session.created_at), "M月d日（E）HH:mm", { locale: ja })}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {formatDistanceToNow(new Date(session.created_at), { addSuffix: true, locale: ja })}
                    </div>
                  </div>
                  {session.verified && (
                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                      <CheckCircle className="w-3 h-3" />
                      認証済
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" style={{ color: "var(--accent)" }} />
                    {session.total_reps} rep
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" style={{ color: "var(--accent)" }} />
                    {durationMin}分{durationSec}秒
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" style={{ color: "var(--accent)" }} />
                    {exercises.length}種目
                  </span>
                </div>

                {/* Exercise list */}
                {exercises.length > 0 && (
                  <div className="space-y-1.5">
                    {exercises.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                        style={{ background: "var(--surface-2)" }}
                      >
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{ex.name}</span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          {ex.sets}セット × {ex.reps}rep
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b) => <Badge key={b} badge={b} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
