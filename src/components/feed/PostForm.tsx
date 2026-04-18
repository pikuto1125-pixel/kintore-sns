"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkoutStore } from "@/store/workout-store";
import Badge from "@/components/ui/Badge";
import { Send, Dumbbell, Lock } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types/database";

type Props = {
  profile: Profile | null;
  onPost: () => void;
};

export default function PostForm({ profile, onPost }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { sessionId, getBadges, reset } = useWorkoutStore();
  const badges = getBadges();

  const canPost = profile?.can_post ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !profile || !canPost) return;
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("ログインが必要です"); setSubmitting(false); return; }

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      badges: badges as string[],
      workout_session_id: sessionId,
    });

    if (insertError) {
      setError("投稿に失敗しました");
    } else {
      setContent("");
      reset();
      onPost();
    }
    setSubmitting(false);
  };

  if (!canPost) {
    return (
      <div
        className="rounded-2xl border p-6 flex flex-col items-center gap-4 text-center"
        style={{ background: "var(--surface)", borderColor: "rgba(255,61,95,0.3)" }}
      >
        <div className="p-3 rounded-full" style={{ background: "rgba(255,61,95,0.1)" }}>
          <Lock className="w-6 h-6" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <div className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            投稿するにはトレーニングが必要です
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            24時間以内にトレーニングを認証すると投稿できます
          </div>
        </div>
        <Link
          href="/workout"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90"
          style={{ background: "var(--accent)", color: "white", boxShadow: "0 0 16px var(--accent-glow)" }}
        >
          <Dumbbell className="w-4 h-4" />
          今すぐトレーニング
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
          style={{ background: "var(--accent-2)", color: "white" }}
        >
          {profile?.username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今日のトレーニングをシェアしよう！"
            rows={3}
            maxLength={500}
            className="w-full text-sm resize-none outline-none bg-transparent leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-13">
          {badges.map((b) => <Badge key={b} badge={b} animated />)}
        </div>
      )}

      {error && (
        <div className="text-xs p-2 rounded-lg" style={{ background: "rgba(255,61,95,0.1)", color: "var(--accent)" }}>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {content.length}/500
        </span>
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          style={{
            background: "var(--accent)",
            color: "white",
            boxShadow: content.trim() ? "0 0 12px var(--accent-glow)" : "none",
          }}
        >
          <Send className="w-4 h-4" />
          {submitting ? "投稿中..." : "投稿"}
        </button>
      </div>
    </form>
  );
}
