import { createClient } from "@/lib/supabase/server";
import FeedClient from "./FeedClient";
import type { PostWithProfile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: posts }, { data: profile }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
      .limit(50),
    user
      ? supabase.from("profiles").select("*").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  // Fetch liked post IDs for current user
  let likedIds = new Set<string>();
  if (user && posts) {
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", posts.map((p) => p.id));
    if (likes) likedIds = new Set(likes.map((l) => l.post_id));
  }

  const initialPosts = (posts ?? []).map((p) => ({
    ...p,
    liked_by_user: likedIds.has(p.id),
  })) as PostWithProfile[];

  return (
    <FeedClient
      initialPosts={initialPosts}
      profile={profile}
      currentUserId={user?.id ?? null}
    />
  );
}
