"use client";
import { useState } from "react";
import PostForm from "@/components/feed/PostForm";
import FeedList from "@/components/feed/FeedList";
import type { PostWithProfile, Profile } from "@/types/database";
import { Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
  initialPosts: PostWithProfile[];
  profile: Profile | null;
  currentUserId: string | null;
};

export default function FeedClient({ initialPosts, profile, currentUserId }: Props) {
  const [refreshSignal, setRefreshSignal] = useState(0);

  // Check if training rights are about to expire (< 6 hours left)
  const lastTrained = profile?.last_trained_at ? new Date(profile.last_trained_at) : null;
  const hoursLeft = lastTrained
    ? 24 - (Date.now() - lastTrained.getTime()) / (1000 * 60 * 60)
    : 0;
  const soonExpiring = profile?.can_post && hoursLeft < 6 && hoursLeft > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
          フィード
        </h1>
        {lastTrained && (
          <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            <Clock className="w-3 h-3" />
            最終トレーニング: {formatDistanceToNow(lastTrained, { addSuffix: true, locale: ja })}
          </div>
        )}
      </div>

      {soonExpiring && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.4)" }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: "#fbbf24" }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
              投稿権の期限まで残り {Math.ceil(hoursLeft)} 時間
            </div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              トレーニングを記録して投稿権を更新しよう
            </div>
          </div>
        </div>
      )}

      <PostForm profile={profile} onPost={() => setRefreshSignal((s) => s + 1)} />
      <FeedList initialPosts={initialPosts} currentUserId={currentUserId} refreshSignal={refreshSignal} />
    </div>
  );
}
