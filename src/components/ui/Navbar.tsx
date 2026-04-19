"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Rss, LogOut, History, Bell, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import LanguageSelector from "./LanguageSelector";
import type { Profile } from "@/types/database";

const NAV_LINKS = [
  { href: "/feed", key: "feed" as const, icon: Rss },
  { href: "/workout", key: "workout" as const, icon: Dumbbell },
  { href: "/history", key: "history" as const, icon: History },
  { href: "/ranking", key: "ranking" as const, icon: Trophy },
];

export default function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation("nav");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const supabase = createClient();
    supabase.from("notifications").select("id", { count: "exact" })
      .eq("user_id", profile.id).eq("read", false)
      .then(({ count }) => setUnreadCount(count ?? 0));

    const channel = supabase.channel("notif-count")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${profile.id}` },
        () => setUnreadCount((c) => c + 1))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const avatar = profile?.avatar_url && profile.avatar_url.length <= 4 ? profile.avatar_url : null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-lg" style={{ background: "var(--accent)" }}>
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl hidden sm:block" style={{ color: "var(--text-primary)" }}>
            IRONLOG
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)", background: active ? "var(--surface-2)" : "transparent" }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{t(key)}</span>
              </Link>
            );
          })}

          {/* Notifications */}
          <Link href="/notifications" className="relative p-2 rounded-lg transition-all" style={{ color: pathname === "/notifications" ? "var(--text-primary)" : "var(--text-secondary)" }}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{ background: "var(--accent)", fontSize: 10 }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <LanguageSelector />

          {profile && (
            <div className="flex items-center gap-1 ml-1 pl-1 border-l" style={{ borderColor: "var(--border)" }}>
              <Link href={`/profile/${profile.username}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
                style={{ background: pathname.startsWith("/profile") ? "var(--surface-2)" : "transparent" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: avatar ? "var(--surface-2)" : "var(--accent-2)", color: "white", fontSize: avatar ? "1rem" : "0.7rem", fontWeight: "bold",
                    border: pathname.startsWith("/profile") ? "2px solid var(--accent)" : "2px solid transparent" }}
                >
                  {avatar ?? profile.username[0].toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col leading-none">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{profile.username}</span>
                  <span className="text-xs" style={{ color: profile.can_post ? "#22c55e" : "var(--accent)" }}>
                    {profile.can_post ? "投稿可" : "要ﾄﾚ"}
                  </span>
                </div>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:text-white" style={{ color: "var(--text-secondary)" }}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
