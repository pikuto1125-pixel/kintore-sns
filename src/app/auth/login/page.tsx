"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Mail, Lock, AlertCircle } from "lucide-react";
import { toJapaneseError } from "@/lib/error-messages";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(toJapaneseError(error.message));
      setLoading(false);
    } else {
      router.push("/feed");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl" style={{ background: "var(--accent)", boxShadow: "0 0 24px var(--accent-glow)" }}>
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>
              IRONLOG
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            トレーニングを証明して、仲間と繋がろう
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>ログイン</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: "rgba(255,61,95,0.1)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--accent)", color: "white", boxShadow: loading ? "none" : "0 0 16px var(--accent-glow)" }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            アカウントがない?{" "}
            <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
              登録する
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
