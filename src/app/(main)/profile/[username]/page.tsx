import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import FollowButton from "@/components/profile/FollowButton";
import AchievementBadges from "@/components/profile/AchievementBadges";
import CalendarHeatmap from "@/components/stats/CalendarHeatmap";
import WorkoutChart from "@/components/stats/WorkoutChart";
import Badge from "@/components/ui/Badge";
import type { WorkoutBadge, WorkoutExercise } from "@/types/database";
import { getTitle } from "@/types/database";
import { Flame, Dumbbell, Users, FileText } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("username", username).single();
  if (!profile) notFound();

  const isOwnProfile = user.id === profile.id;

  const [
    { data: posts },
    { data: sessions },
    { data: followRow },
  ] = await Promise.all([
    supabase.from("posts").select("*, profiles(*)").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("workout_sessions").select("exercises,created_at").eq("user_id", profile.id).eq("verified", true).order("created_at", { ascending: false }).limit(200),
    isOwnProfile ? Promise.resolve({ data: null }) :
      supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", profile.id).maybeSingle(),
  ]);

  const workoutDates = (sessions ?? []).map((s) => s.created_at);
  const isFollowing = !!followRow;
  const avatar = profile.avatar_url && profile.avatar_url.length <= 4 ? profile.avatar_url : null;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Profile header */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
              style={{ background: avatar ? "var(--surface-2)" : "var(--accent-2)", color: "white", border: "3px solid var(--accent)" }}
            >
              {avatar ?? profile.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{profile.username}</div>
              <div className="text-sm" style={{ color: "var(--accent)" }}>{getTitle(profile)}</div>
              {profile.bio && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{profile.bio}</p>}
            </div>
          </div>
          {!isOwnProfile && (
            <FollowButton targetUserId={profile.id} currentUserId={user.id} initialFollowing={isFollowing} />
          )}
          {isOwnProfile && (
            <Link
              href="/profile"
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              編集
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          {[
            { label: "投稿", value: posts?.length ?? 0, icon: <FileText className="w-4 h-4" /> },
            { label: "フォロワー", value: profile.follower_count, icon: <Users className="w-4 h-4" /> },
            { label: "連続記録", value: `${profile.current_streak}日`, icon: <Flame className="w-4 h-4" /> },
            { label: "総トレ", value: `${profile.total_workouts}回`, icon: <Dumbbell className="w-4 h-4" /> },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex justify-center mb-1" style={{ color: "var(--accent)" }}>{s.icon}</div>
              <div className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <AchievementBadges profile={profile} />
      <CalendarHeatmap dates={workoutDates} />
      {sessions && sessions.length > 0 && <WorkoutChart sessions={sessions as never} />}

      {/* Posts */}
      <div>
        <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>投稿</h2>
        <div className="space-y-3">
          {(posts ?? []).map((post) => (
            <div key={post.id} className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} alt="" className="mt-3 rounded-xl w-full object-cover max-h-60" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
              <div className="flex items-center gap-2 mt-3">
                {(post.badges as string[]).map((b) => <Badge key={b} badge={b as WorkoutBadge} />)}
              </div>
              <div className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })}
              </div>
            </div>
          ))}
          {(!posts || posts.length === 0) && (
            <div className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>まだ投稿がありません</div>
          )}
        </div>
      </div>
    </div>
  );
}
