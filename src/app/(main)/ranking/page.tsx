import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Flame, Trophy, Dumbbell } from "lucide-react";
import Link from "next/link";
import { getTitle } from "@/types/database";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("current_streak", { ascending: false })
    .limit(50);

  const myProfile = profiles?.find((p) => p.id === user.id);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>ストリークランキング</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>連続記録トップ選手</p>
      </div>

      {myProfile && myProfile.current_streak > 0 && (
        <div
          className="rounded-2xl border p-5 flex items-center gap-4"
          style={{ background: "rgba(255,61,95,0.08)", borderColor: "rgba(255,61,95,0.3)" }}
        >
          <div className="text-4xl">🔥</div>
          <div>
            <div className="font-bold" style={{ color: "var(--text-primary)" }}>あなたの現在のストリーク</div>
            <div className="text-2xl font-black" style={{ color: "var(--accent)" }}>
              {myProfile.current_streak} 日連続
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(profiles ?? []).map((profile: Profile, i) => {
          const isMe = profile.id === user.id;
          const avatar = profile.avatar_url && profile.avatar_url.length <= 4 ? profile.avatar_url : null;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

          return (
            <Link
              key={profile.id}
              href={`/profile/${profile.username}`}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:opacity-80"
              style={{
                background: isMe ? "rgba(255,61,95,0.08)" : "var(--surface)",
                borderColor: isMe ? "rgba(255,61,95,0.4)" : "var(--border)",
              }}
            >
              <div className="w-8 text-center font-black text-lg" style={{ color: "var(--text-secondary)" }}>
                {medal ?? `#${i + 1}`}
              </div>

              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                style={{ background: avatar ? "var(--surface-2)" : "var(--accent-2)", color: "white" }}
              >
                {avatar ?? profile.username[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{profile.username}</span>
                  {isMe && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent)", color: "white" }}>You</span>}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{getTitle(profile)}</div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 font-black" style={{ color: profile.current_streak > 0 ? "var(--accent)" : "var(--text-secondary)" }}>
                  <Flame className="w-4 h-4" />
                  <span>{profile.current_streak}日</span>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <Dumbbell className="w-3 h-3" />
                  <span>{profile.total_workouts}回</span>
                </div>
              </div>
            </Link>
          );
        })}

        {(!profiles || profiles.length === 0) && (
          <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <div className="font-semibold">まだランキングデータがありません</div>
          </div>
        )}
      </div>
    </div>
  );
}
