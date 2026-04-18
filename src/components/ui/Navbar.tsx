"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Rss, LogOut, UserCircle, History } from "lucide-react";
import type { Profile } from "@/types/database";

const NAV_LINKS = [
  { href: "/feed", label: "フィード", icon: Rss },
  { href: "/workout", label: "トレーニング", icon: Dumbbell },
  { href: "/history", label: "履歴", icon: History },
];

export default function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const avatarDisplay = profile?.avatar_url && profile.avatar_url.length <= 4
    ? profile.avatar_url
    : null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-lg" style={{ background: "var(--accent)" }}>
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl" style={{ color: "var(--text-primary)" }}>
            IRONLOG
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--surface-2)" : "transparent",
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {profile && (
            <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l" style={{ borderColor: "var(--border)" }}>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover:bg-opacity-50"
                style={{
                  background: pathname === "/profile" ? "var(--surface-2)" : "transparent",
                }}
                title="プロフィール編集"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: avatarDisplay ? "var(--surface-2)" : "var(--accent-2)",
                    color: "white",
                    fontSize: avatarDisplay ? "1rem" : "0.75rem",
                    fontWeight: "bold",
                    border: pathname === "/profile" ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  {avatarDisplay ?? profile.username[0].toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col leading-none">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {profile.username}
                  </span>
                  <span className="text-xs" style={{ color: profile.can_post ? "#22c55e" : "var(--accent)" }}>
                    {profile.can_post ? "投稿可" : "要トレーニング"}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-colors hover:text-white"
                style={{ color: "var(--text-secondary)" }}
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
