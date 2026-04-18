"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Dumbbell, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { toJapaneseError } from "@/lib/error-messages";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      setError(toJapaneseError(error.message));
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-sm">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#22c55e" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>確認メールを送信しました</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {email} に確認メールを送りました。<br />メールのリンクをクリックしてアカウントを有効化してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
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

        <div className="rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>新規登録</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: "rgba(255,61,95,0.1)", border: "1px solid var(--accent)", color: "var(--accent)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                ユーザー名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  placeholder="ironman_taro"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
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
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  placeholder="8文字以上"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--accent)", color: "white", boxShadow: loading ? "none" : "0 0 16px var(--accent-glow)" }}
            >
              {loading ? "登録中..." : "アカウントを作成"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            すでにアカウントがある?{" "}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
