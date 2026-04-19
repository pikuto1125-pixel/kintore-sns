"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkoutStore } from "@/store/workout-store";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import Badge from "@/components/ui/Badge";
import { Send, Dumbbell, Lock, Image } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types/database";

type Props = { profile: Profile | null; onPost: () => void };

export default function PostForm({ profile, onPost }: Props) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(["feed", "common"]);
  const { sessionId, getBadges, reset } = useWorkoutStore();
  const badges = getBadges();
  const canPost = profile?.can_post ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !profile || !canPost) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError(t("common:error")); setSubmitting(false); return; }

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      badges: badges as string[],
      workout_session_id: sessionId,
      image_url: imageUrl.trim() || null,
    });

    if (insertError) { setError(t("common:error")); }
    else { setContent(""); setImageUrl(""); setShowImageInput(false); reset(); onPost(); }
    setSubmitting(false);
  };

  if (!canPost) {
    return (
      <div className="rounded-2xl border p-6 flex flex-col items-center gap-4 text-center" style={{ background: "var(--surface)", borderColor: "rgba(255,61,95,0.3)" }}>
        <div className="p-3 rounded-full" style={{ background: "rgba(255,61,95,0.1)" }}>
          <Lock className="w-6 h-6" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <div className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>投稿するにはトレーニングが必要です</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>24時間以内にトレーニングを認証すると投稿できます</div>
        </div>
        <Link href="/workout" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90"
          style={{ background: "var(--accent)", color: "white", boxShadow: "0 0 16px var(--accent-glow)" }}>
          <Dumbbell className="w-4 h-4" />今すぐトレーニング
        </Link>
      </div>
    );
  }

  const avatar = profile?.avatar_url && profile.avatar_url.length <= 4 ? profile.avatar_url : null;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: avatar ? "var(--surface-2)" : "var(--accent-2)", color: "white" }}>
          {avatar ?? profile?.username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("feed:placeholder")}
            rows={3}
            maxLength={500}
            className="w-full text-sm resize-none outline-none bg-transparent leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {showImageInput && (
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder={t("feed:imageUrlPlaceholder")}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
      )}

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => <Badge key={b} badge={b} animated />)}
        </div>
      )}

      {error && <div className="text-xs p-2 rounded-lg" style={{ background: "rgba(255,61,95,0.1)", color: "var(--accent)" }}>{error}</div>}

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowImageInput(!showImageInput)}
            className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{ color: showImageInput ? "var(--accent)" : "var(--text-secondary)" }}>
            <Image className="w-4 h-4" />
          </button>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{content.length}/500</span>
        </div>
        <button type="submit" disabled={!content.trim() || submitting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          style={{ background: "var(--accent)", color: "white", boxShadow: content.trim() ? "0 0 12px var(--accent-glow)" : "none" }}>
          <Send className="w-4 h-4" />
          {submitting ? t("feed:posting") : t("feed:post")}
        </button>
      </div>
    </form>
  );
}
