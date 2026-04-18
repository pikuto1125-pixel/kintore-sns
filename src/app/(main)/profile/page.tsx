import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>プロフィール編集</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          アカウント情報を更新できます
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
