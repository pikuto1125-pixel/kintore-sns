"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/database";
import { Save, AlertCircle, CheckCircle } from "lucide-react";

const AVATAR_EMOJIS = [
  "💪","🏋️","🔥","⚡","🦁","🐺","🦅","🐯","🏆","🥊",
  "🤸","🏃","🚴","🧗","🤼","🥋","⛹️","🏊","🎯","💥",
];

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? "💪");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (username.trim().length < 3) {
      setError("ユーザー名は3文字以上で入力してください");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("ログインが必要です"); setSaving(false); return; }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: username.trim(), bio: bio.trim() || null, avatar_url: avatar })
      .eq("id", user.id);

    if (updateError) {
      if (updateError.message.includes("unique")) {
        setError("このユーザー名はすでに使われています");
      } else {
        setError("保存に失敗しました。もう一度お試しください");
      }
    } else {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar picker */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <label className="block text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          アバター絵文字
        </label>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
            style={{ background: "var(--surface-2)", border: "2px solid var(--accent)" }}
          >
            {avatar}
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            絵文字を選んでアバターにしよう
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatar(emoji)}
              className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: avatar === emoji ? "rgba(255,61,95,0.2)" : "var(--surface-2)",
                border: `2px solid ${avatar === emoji ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="rounded-2xl border p-6 space-y-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            ユーザー名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            placeholder="ironman_taro"
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
            英数字・アンダースコア・ハイフン使用可 ({username.length}/30)
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            自己紹介
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            placeholder="毎日鍛えてます💪 目標はベンチ100kg！"
          />
          <p className="text-xs mt-1.5 text-right" style={{ color: "var(--text-secondary)" }}>
            {bio.length}/200
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm" style={{ background: "rgba(255,61,95,0.1)", color: "var(--accent)", border: "1px solid rgba(255,61,95,0.3)" }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl text-sm" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          プロフィールを保存しました
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: "var(--accent)", color: "white", boxShadow: saving ? "none" : "0 0 16px var(--accent-glow)" }}
      >
        <Save className="w-4 h-4" />
        {saving ? "保存中..." : "プロフィールを保存"}
      </button>
    </form>
  );
}
