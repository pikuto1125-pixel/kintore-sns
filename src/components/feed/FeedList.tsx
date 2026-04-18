"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PostWithProfile } from "@/types/database";
import PostCard from "./PostCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Props = {
  initialPosts: PostWithProfile[];
  currentUserId: string | null;
  refreshSignal: number;
};

export default function FeedList({ initialPosts, currentUserId, refreshSignal }: Props) {
  const [posts, setPosts] = useState<PostWithProfile[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) { setLoading(false); return; }

    if (data) {
      let likedIds = new Set<string>();
      if (currentUserId && data.length > 0) {
        const { data: likes } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", currentUserId)
          .in("post_id", data.map((p) => p.id));
        if (likes) likedIds = new Set(likes.map((l) => l.post_id));
      }
      setPosts(data.map((p) => ({ ...p, liked_by_user: likedIds.has(p.id) })) as PostWithProfile[]);
    }
    setLoading(false);
  }, [supabase, currentUserId]);

  useEffect(() => {
    if (refreshSignal > 0) fetchPosts();
  }, [refreshSignal, fetchPosts]);

  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (payload) => {
        setPosts((prev) =>
          prev.map((p) => (p.id === payload.new.id ? { ...p, ...(payload.new as PostWithProfile) } : p))
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" }, (payload) => {
        setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchPosts]);

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
        <div className="text-4xl mb-3">💪</div>
        <div className="font-semibold">まだ投稿がありません</div>
        <div className="text-sm mt-1">最初のトレーニングログを投稿しよう！</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex justify-center py-2">
          <LoadingSpinner />
        </div>
      )}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
