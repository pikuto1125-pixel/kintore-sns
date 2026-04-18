"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Rss, LogOut, User } from "lucide-react";
import type { Profile } from "@/types/database";

export default function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderColor: "var(--border)" }}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: "var(--accent)" }}>
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl" style={{ color: "var(--text-primary)" }}>
            IRONLOG
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/feed"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            <Rss className="w-4 h-4" />
            <span className="hidden sm:inline">フィード</span>
          </Link>

          <Link
            href="/workout"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">トレーニング</span>
          </Link>

          {profile && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--accent-2)", color: "white" }}
                >
                  {profile.username[0].toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {profile.username}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: profile.can_post ? "#22c55e" : "var(--accent)" }}
                  >
                    {profile.can_post ? "投稿可" : "要トレーニング"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-colors hover:text-white"
                style={{ color: "var(--text-secondary)" }}
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
