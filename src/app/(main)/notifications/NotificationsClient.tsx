"use client";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import { Heart, UserPlus, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import type { Profile, Post } from "@/types/database";
import Link from "next/link";

type NotifWithRelations = {
  id: string; type: string; read: boolean; created_at: string;
  actor: Profile; post?: Post | null;
};

export default function NotificationsClient({ initialNotifications }: { initialNotifications: NotifWithRelations[] }) {
  const { t } = useTranslation("notifications");

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{t("title")}</h1>
      </div>

      {initialNotifications.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <div className="font-semibold">{t("empty")}</div>
        </div>
      ) : (
        <div className="space-y-2">
          {initialNotifications.map((n) => {
            const avatar = n.actor?.avatar_url && n.actor.avatar_url.length <= 4 ? n.actor.avatar_url : null;
            return (
              <div
                key={n.id}
                className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
                style={{
                  background: "var(--surface)",
                  borderColor: n.read ? "var(--border)" : "rgba(255,61,95,0.3)",
                  opacity: n.read ? 0.8 : 1,
                }}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ background: avatar ? "var(--surface-2)" : "var(--accent-2)", color: "white" }}
                  >
                    {avatar ?? (n.actor?.username?.[0]?.toUpperCase() ?? "?")}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: n.type === "like" ? "var(--accent)" : "var(--accent-2)" }}
                  >
                    {n.type === "like"
                      ? <Heart className="w-2.5 h-2.5 text-white" fill="white" />
                      : <UserPlus className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                    <Link href={`/profile/${n.actor?.username}`} className="font-bold hover:underline">
                      {n.actor?.username}
                    </Link>
                    {" "}{n.type === "like" ? t("like") : t("follow")}
                  </div>
                  {n.post && (
                    <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                      「{n.post.content.slice(0, 40)}...」
                    </div>
                  )}
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ja })}
                  </div>
                </div>

                {!n.read && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
