"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useWorkoutStore } from "@/store/workout-store";
import WorkoutTimer from "@/components/workout/WorkoutTimer";
import RepCounter from "@/components/workout/RepCounter";
import CameraVerifier from "@/components/workout/CameraVerifier";
import Badge from "@/components/ui/Badge";
import { CheckCircle, Dumbbell, AlertCircle } from "lucide-react";

export default function WorkoutPage() {
  const [cameraPhoto, setCameraPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { exercises, timerSeconds, getBadges, setVerified, reset } = useWorkoutStore();

  const totalReps = exercises.reduce((sum, ex) => sum + ex.reps * ex.sets, 0);
  const timerOk = timerSeconds >= 60;
  const repsOk = totalReps >= 30;
  const canVerify = timerOk && repsOk && exercises.length > 0;
  const badges = getBadges();

  const handleVerify = async () => {
    if (!canVerify) return;
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("ログインが必要です"); setSubmitting(false); return; }

    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        exercises: exercises as unknown as never,
        total_reps: totalReps,
        duration_seconds: timerSeconds,
        verified: false,
      })
      .select()
      .single();

    if (sessionError || !session) {
      setError("セッションの保存に失敗しました");
      setSubmitting(false);
      return;
    }

    const { error: verifyError } = await supabase.rpc("verify_workout", { session_id: session.id });
    if (verifyError) {
      setError("認証に失敗しました");
      setSubmitting(false);
      return;
    }

    setVerified(true, session.id);
    router.push("/feed");
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          トレーニング認証
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          条件をクリアして投稿権を取得しよう
        </p>
      </div>

      {/* Conditions checklist */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
          認証条件
        </div>
        <div className="space-y-3">
          {[
            { ok: timerOk, label: "タイマーを1分以上計測する", detail: `現在: ${timerSeconds}秒` },
            { ok: repsOk, label: "合計30rep以上のトレーニング", detail: `現在: ${totalReps}rep` },
            { ok: exercises.length > 0, label: "種目を1つ以上追加する", detail: `${exercises.length}種目` },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              {c.ok
                ? <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "#22c55e" }} />
                : <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: "var(--border)" }} />
              }
              <div>
                <div className="text-sm font-medium" style={{ color: c.ok ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  {c.label}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {badges.length > 0 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>獲得バッジ</div>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => <Badge key={b} badge={b} animated />)}
            </div>
          </div>
        )}
      </div>

      <WorkoutTimer />
      <RepCounter />
      <CameraVerifier onCapture={(url) => setCameraPhoto(url)} captured={!!cameraPhoto} />

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(255,61,95,0.1)", color: "var(--accent)", border: "1px solid rgba(255,61,95,0.3)" }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={!canVerify || submitting}
        className="w-full py-4 rounded-2xl font-black text-lg tracking-wider uppercase transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        style={{
          background: canVerify ? "var(--accent)" : "var(--surface-2)",
          color: canVerify ? "white" : "var(--text-secondary)",
          border: canVerify ? "none" : "1px solid var(--border)",
          boxShadow: canVerify ? "0 0 24px var(--accent-glow)" : "none",
        }}
      >
        <Dumbbell className="w-6 h-6" />
        {submitting ? "認証中..." : "トレーニングを認証して投稿権を取得"}
      </button>
    </div>
  );
}
