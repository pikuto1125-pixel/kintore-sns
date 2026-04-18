"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PostWithProfile } from "@/types/database";
import Badge from "@/components/ui/Badge";
import { Heart, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
  post: PostWithProfile;
  currentUserId: string | null;
};

export default function PostCard({ post, currentUserId }: Props) {
  const [liked, setLiked] = useState(post.liked_by_user ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLike = async () => {
    if (!currentUserId || loading) return;
    setLoading(true);

    if (liked) {
      await supabase.from("likes").delete().match({ user_id: currentUserId, post_id: post.id });
      setLiked(false);
      setLikesCount((c) => Math.max(c - 1, 0));
    } else {
      await supabase.from("likes").insert({ user_id: currentUserId, post_id: post.id });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
    setLoading(false);
  };

  return (
    <div
      className="rounded-2xl border p-5 space-y-4 animate-slide-up transition-all hover:border-opacity-50"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
          style={{ background: "var(--accent-2)", color: "white" }}
        >
          {post.profiles.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            {post.profiles.username}
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })}
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {post.content}
      </p>

      {/* Badges */}
      {post.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.badges.map((b) => (
            <Badge key={b} badge={b as never} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={handleLike}
          disabled={!currentUserId || loading}
          className="flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          style={{ color: liked ? "var(--accent)" : "var(--text-secondary)" }}
        >
          <Heart
            className="w-4 h-4"
            fill={liked ? "currentColor" : "none"}
          />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>

        {post.workout_session_id && (
          <div className="flex items-center gap-1 text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
            <span>💪</span>
            <span>認証済みトレーニング</span>
          </div>
        )}
      </div>
    </div>
  );
}
