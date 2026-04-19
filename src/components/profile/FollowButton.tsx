"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import { UserPlus, UserMinus } from "lucide-react";

type Props = {
  targetUserId: string;
  currentUserId: string;
  initialFollowing: boolean;
};

export default function FollowButton({ targetUserId, currentUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("common");

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();

    if (following) {
      await supabase.from("follows").delete().match({ follower_id: currentUserId, following_id: targetUserId });
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: targetUserId });
      setFollowing(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
      style={{
        background: following ? "var(--surface-2)" : "var(--accent)",
        color: following ? "var(--text-primary)" : "white",
        border: following ? "1px solid var(--border)" : "none",
        boxShadow: following ? "none" : "0 0 12px var(--accent-glow)",
      }}
    >
      {following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      {following ? t("unfollow") : t("follow")}
    </button>
  );
}
