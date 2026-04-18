"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PostWithProfile } from "@/types/database";
import Badge from "@/components/ui/Badge";
import { Heart, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
  post: PostWithProfile;
  currentUserId: string | null;
  onDelete?: (postId: string) => void;
};

export default function PostCard({ post, currentUserId, onDelete }: Props) {
  const [liked, setLiked] = useState(post.liked_by_user ?? false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = currentUserId === post.user_id;
  const avatarDisplay = post.profiles.avatar_url && post.profiles.avatar_url.length <= 4
    ? post.profiles.avatar_url
    : null;

  const handleLike = async () => {
    if (!currentUserId || likeLoading) return;
    setLikeLoading(true);
    const supabase = createClient();

    if (liked) {
      await supabase.from("likes").delete().match({ user_id: currentUserId, post_id: post.id });
      setLiked(false);
      setLikesCount((c) => Math.max(c - 1, 0));
    } else {
      await supabase.from("likes").insert({ user_id: currentUserId, post_id: post.id });
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
    setLikeLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleteLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) onDelete?.(post.id);
    else setDeleteLoading(false);
  };

  return (
    <div
      className="rounded-2xl border p-5 space-y-4 animate-slide-up"
      style={{ background: "var(--surface)", borderColor: "var(--border)", opacity: deleteLoading ? 0.5 : 1, transition: "opacity 0.2s" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
          style={{ background: avatarDisplay ? "var(--surface-2)" : "var(--accent-2)", color: "white", fontSize: avatarDisplay ? "1.25rem" : undefined }}
        >
          {avatarDisplay ?? post.profiles.username[0].toUpperCase()}
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

        {/* Delete button (owner only) */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0"
            style={{
              background: confirmDelete ? "rgba(255,61,95,0.2)" : "transparent",
              color: confirmDelete ? "var(--accent)" : "var(--text-secondary)",
              border: confirmDelete ? "1px solid rgba(255,61,95,0.4)" : "1px solid transparent",
            }}
            onBlur={() => setTimeout(() => setConfirmDelete(false), 200)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmDelete ? "本当に削除?" : "削除"}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {post.content}
      </p>

      {/* Badges */}
      {post.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.badges.map((b) => <Badge key={b} badge={b as never} />)}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={handleLike}
          disabled={!currentUserId || likeLoading}
          className="flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          style={{ color: liked ? "var(--accent)" : "var(--text-secondary)" }}
        >
          <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
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
